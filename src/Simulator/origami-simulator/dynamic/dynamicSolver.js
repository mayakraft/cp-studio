/**
 * Created by ghassaei on 10/7/16.
 */

// a working list of the globals, some of which are used inside here.
// shouldAnimateFoldPercent
// videoAnimator
// forceHasChanged
// fixedHasChanged
// nodePositionHasChanged
// creaseMaterialHasChanged
// materialHasChanged
// shouldChangeCreasePercent
// shouldZeroDynamicVelocity
// shouldCenterGeo
// numSteps
// integrationType
// colorMode
// strainClip
// calcFaceStrain
// axialStiffness
// faceStiffness
// creasePercent

import * as THREE from "three";
import GPUMath from "./GPUMath";

import vertexShader from "../shaders/vertexShader.vert?raw";
import positionCalcShader from "../shaders/positionCalcShader.frag?raw";
import velocityCalcVerletShader from "../shaders/velocityCalcVerletShader.frag?raw";
import velocityCalcShader from "../shaders/velocityCalcShader.frag?raw";
import positionCalcVerletShader from "../shaders/positionCalcVerletShader.frag?raw";
import thetaCalcShader from "../shaders/thetaCalcShader.frag?raw";
import normalCalc from "../shaders/normalCalc.frag?raw";
import packToBytesShader from "../shaders/packToBytesShader.frag?raw";
import zeroTexture from "../shaders/zeroTexture.frag?raw";
import zeroThetaTexture from "../shaders/zeroThetaTexture.frag?raw";
import centerTexture from "../shaders/centerTexture.frag?raw";
import copyTexture from "../shaders/copyTexture.frag?raw";
import updateCreaseGeo from "../shaders/updateCreaseGeo.frag?raw";

// ///////////////////////
// currently looking into making this work on iOS.
// problem appears to be the need to support and switch to using HALF_FLOAT
//
// update: seems to be working. iOS might have added support to the float type.
//
// https://github.com/mrdoob/three.js/issues/9628
// http://yomboprime.github.io/GPGPU-threejs-demos/webgl_gpgpu_water.html

function initDynamicSolver(options) {
  const float_type = "FLOAT";

  const gpuMath = GPUMath();

  let model;

  let originalPosition;
  let position;
  let lastPosition;
  let lastLastPosition; // for verlet integration
  let velocity;
  let lastVelocity;
  let externalForces;
  let mass;
  let meta; // [beamMetaIndex, numBeams, nodeCreaseMetaIndex, numCreases]
  let meta2; // [nodeFaceMetaIndex, numFaces]
  let beamMeta; // [K, D, length, otherNodeIndex]

  let normals;
  let faceVertexIndices; // [a,b,c] textureDimFaces
  let nominalTriangles; // [angleA, angleB, angleC]
  let nodeFaceMeta; // [faceIndex, a, b, c] textureNodeFaces
  let creaseMeta; // [k, d, targetTheta, -] textureDimCreases
  let creaseMeta2; // [node1Index, node2Index, node3index, node4index]
  // nodes 1 and 2 are opposite crease, 3 and 4 are on crease, textureDimCreases
  let nodeCreaseMeta; // [creaseIndex (thetaIndex), nodeIndex (1/2/3/4), -, -] textureDimNodeCreases
  let creaseGeo; // [h1, h2, coef1, coef2]
  let creaseVectors; // indices of crease nodes
  let theta; // [theta, w, normalIndex1, normalIndex2]
  let lastTheta; // [theta, w, normalIndex1, normalIndex2]

  function dealloc() {
    gpuMath.dealloc();
  }

  function syncNodesAndEdges(_model, { creasePercent }) {
    model = _model;
    initTypedArrays({ creasePercent });
    initTexturesAndPrograms(gpuMath, { creasePercent });
    setSolveParams();
  }

  let programsInited = false; // flag for initial setup

  let textureDim = 0;
  let textureDimEdges = 0;
  let textureDimFaces = 0;
  let textureDimCreases = 0;
  let textureDimNodeCreases = 0;
  let textureDimNodeFaces = 0;

  function reset() {
    gpuMath.step("zeroTexture", [], "u_position");
    gpuMath.step("zeroTexture", [], "u_lastPosition");
    gpuMath.step("zeroTexture", [], "u_lastLastPosition");
    gpuMath.step("zeroTexture", [], "u_velocity");
    gpuMath.step("zeroTexture", [], "u_lastVelocity");
    gpuMath.step("zeroThetaTexture", ["u_lastTheta"], "u_theta");
    gpuMath.step("zeroThetaTexture", ["u_theta"], "u_lastTheta");
    render();
  }

  function solve(_numSteps, { creasePercent, axialStrain, nodePositionHasChanged, shouldCenterGeo }) {
    if (options.fixedHasChanged) {
      updateFixed();
      options.fixedHasChanged = false;
    }
    if (nodePositionHasChanged) {
      updateLastPosition();
      // nodePositionHasChanged = false;
    }
    if (options.creaseMaterialHasChanged) {
      updateCreasesMeta();
      options.creaseMaterialHasChanged = false;
    }
    if (options.materialHasChanged) {
      updateMaterials();
      options.materialHasChanged = false;
    }
    // if (options.shouldChangeCreasePercent) {
    //   setCreasePercent(creasePercent);
    //   options.shouldChangeCreasePercent = false;
    // }
    
    // if (options.shouldZeroDynamicVelocity) {
    //     gpuMath.step("zeroTexture", [], "u_velocity");
    //     gpuMath.step("zeroTexture", [], "u_lastVelocity");
    //     options.shouldZeroDynamicVelocity = false;
    // }
    if (shouldCenterGeo) {
      const avgPosition = getAvgPosition();
      gpuMath.setProgram("centerTexture");
      gpuMath.setUniformForProgram("centerTexture", "u_center", [avgPosition.x, avgPosition.y, avgPosition.z], "3f");
      gpuMath.step("centerTexture", ["u_lastPosition"], "u_position");
      if (options.integrationType === "verlet") gpuMath.step("copyTexture", ["u_position"], "u_lastLastPosition");
      gpuMath.swapTextures("u_position", "u_lastPosition");
      gpuMath.step("zeroTexture", [], "u_lastVelocity");
      gpuMath.step("zeroTexture", [], "u_velocity");
      // shouldCenterGeo = false;
    }

    if (_numSteps === undefined) _numSteps = options.numSteps;
    for (let j = 0; j < _numSteps; j += 1) {
      solveStep();
    }
    render({ axialStrain });
  }

  function solveStep() {

    gpuMath.setProgram("normalCalc");
    gpuMath.setSize(textureDimFaces, textureDimFaces);
    gpuMath.step("normalCalc", ["u_faceVertexIndices", "u_lastPosition", "u_originalPosition"], "u_normals");

    gpuMath.setProgram("thetaCalc");
    gpuMath.setSize(textureDimCreases, textureDimCreases);
    gpuMath.step("thetaCalc", ["u_normals", "u_lastTheta", "u_creaseVectors", "u_lastPosition",
      "u_originalPosition"], "u_theta");

    gpuMath.setProgram("updateCreaseGeo");
    // already at textureDimCreasesxtextureDimCreases
    gpuMath.step("updateCreaseGeo", ["u_lastPosition", "u_originalPosition", "u_creaseMeta2"], "u_creaseGeo");

    if (options.integrationType === "verlet") {
      gpuMath.setProgram("positionCalcVerlet");
      gpuMath.setSize(textureDim, textureDim);
      gpuMath.step("positionCalcVerlet", ["u_lastPosition", "u_lastLastPosition", "u_lastVelocity", "u_originalPosition", "u_externalForces",
        "u_mass", "u_meta", "u_beamMeta", "u_creaseMeta", "u_nodeCreaseMeta", "u_normals", "u_theta", "u_creaseGeo",
        "u_meta2", "u_nodeFaceMeta", "u_nominalTriangles"], "u_position");
      gpuMath.step("velocityCalcVerlet", ["u_position", "u_lastPosition", "u_mass"], "u_velocity");
      gpuMath.swapTextures("u_lastPosition", "u_lastLastPosition");
    } else { // euler
      gpuMath.setProgram("velocityCalc");
      gpuMath.setSize(textureDim, textureDim);
      gpuMath.step("velocityCalc", ["u_lastPosition", "u_lastVelocity", "u_originalPosition", "u_externalForces",
        "u_mass", "u_meta", "u_beamMeta", "u_creaseMeta", "u_nodeCreaseMeta", "u_normals", "u_theta", "u_creaseGeo",
        "u_meta2", "u_nodeFaceMeta", "u_nominalTriangles"], "u_velocity");
      gpuMath.step("positionCalc", ["u_velocity", "u_lastPosition", "u_mass"], "u_position");
    }

    gpuMath.swapTextures("u_theta", "u_lastTheta");
    gpuMath.swapTextures("u_velocity", "u_lastVelocity");
    gpuMath.swapTextures("u_position", "u_lastPosition");
  }

  // let $errorOutput = $("#globalError");


  function getAvgPosition() {
    model.geometry.computeBoundingBox();
    let center = new THREE.Vector3();
    model.geometry.boundingBox.getCenter(center);
    return center;
  }
  // this doesn't calculate the center of the convex hull
  // if the vertices are heavily weighted to one side, the center is off
  // function getAvgPosition() {
  //   let xavg = 0;
  //   let yavg = 0;
  //   let zavg = 0;
  //   for (let i = 0; i < model.positions.length; i += 3) {
  //     xavg += model.positions[i];
  //     yavg += model.positions[i + 1];
  //     zavg += model.positions[i + 2];
  //   }
  //   const avgPosition = new THREE.Vector3(xavg, yavg, zavg);
  //   avgPosition.multiplyScalar(3 / model.positions.length);
  //   return avgPosition;
  // }

  function render({ axialStrain }) {

    const vectorLength = 4;
    gpuMath.setProgram("packToBytes");
    gpuMath.setUniformForProgram("packToBytes", "u_vectorLength", vectorLength, "1f");
    gpuMath.setUniformForProgram("packToBytes", "u_floatTextureDim", [textureDim, textureDim], "2f");
    gpuMath.setSize(textureDim * vectorLength, textureDim);
    gpuMath.step("packToBytes", ["u_lastPosition"], "outputBytes");

    if (gpuMath.readyToRead()) {
      const numPixels = model.nodes.length * vectorLength;
      const height = Math.ceil(numPixels / (textureDim * vectorLength));
      const pixels = new Uint8Array(height * textureDim * 4 * vectorLength);
      gpuMath.readPixels(0, 0, textureDim * vectorLength, height, pixels);
      const parsedPixels = new Float32Array(pixels.buffer);
      // let globalError = 0;
      for (let i = 0; i < model.nodes.length; i += 1) {
        const rgbaIndex = i * vectorLength;
        let nodeError = parsedPixels[rgbaIndex + 3] * 100;
        // globalError += nodeError;
        const nodePosition = new THREE.Vector3(parsedPixels[rgbaIndex], parsedPixels[rgbaIndex + 1], parsedPixels[rgbaIndex + 2]);
        nodePosition.add(model.nodes[i]._originalPosition);
        model.positions[3 * i] = nodePosition.x;
        model.positions[3 * i + 1] = nodePosition.y;
        model.positions[3 * i + 2] = nodePosition.z;
        if (axialStrain) {
          if (nodeError > options.strainClip) nodeError = options.strainClip;
          const scaledVal = (1 - nodeError / options.strainClip) * 0.7;
          const color = new THREE.Color();
          color.setHSL(scaledVal, 1, 0.5);
          model.colors[3 * i] = color.r;
          model.colors[3 * i + 1] = color.g;
          model.colors[3 * i + 2] = color.b;
        }
      }
      // $errorOutput.html((globalError / model.nodes.length).toFixed(7) + " %");
    } else {
      console.log("shouldn't be here");
    }
  }

  function setSolveParams() {
    let dt = calcDt();
    // $("#deltaT").html(dt);
    gpuMath.setProgram("thetaCalc");
    gpuMath.setUniformForProgram("thetaCalc", "u_dt", dt, "1f");
    gpuMath.setProgram("velocityCalc");
    gpuMath.setUniformForProgram("velocityCalc", "u_dt", dt, "1f");
    gpuMath.setProgram("positionCalcVerlet");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_dt", dt, "1f");
    gpuMath.setProgram("positionCalc");
    gpuMath.setUniformForProgram("positionCalc", "u_dt", dt, "1f");
    gpuMath.setProgram("velocityCalcVerlet");
    gpuMath.setUniformForProgram("velocityCalcVerlet", "u_dt", dt, "1f");
    // options.controls.setDeltaT(dt);
  }

  function calcDt() {
    let maxFreqNat = 0;
    model.edges.forEach((beam) => {
      if (beam.getNaturalFrequency() > maxFreqNat) maxFreqNat = beam.getNaturalFrequency();
    });
    return (1 / (2 * Math.PI * maxFreqNat)) * 0.9; // 0.9 of max delta t for good measure
  }

  function initTexturesAndPrograms(gpuMath, { creasePercent }) {
    gpuMath.initTextureFromData("u_position", textureDim, textureDim, float_type, position, true);
    gpuMath.initTextureFromData("u_lastPosition", textureDim, textureDim, float_type, lastPosition, true);
    gpuMath.initTextureFromData("u_lastLastPosition", textureDim, textureDim, float_type, lastLastPosition, true);
    gpuMath.initTextureFromData("u_velocity", textureDim, textureDim, float_type, velocity, true);
    gpuMath.initTextureFromData("u_lastVelocity", textureDim, textureDim, float_type, lastVelocity, true);
    gpuMath.initTextureFromData("u_theta", textureDimCreases, textureDimCreases, float_type, theta, true);
    gpuMath.initTextureFromData("u_lastTheta", textureDimCreases, textureDimCreases, float_type, lastTheta, true);
    gpuMath.initTextureFromData("u_normals", textureDimFaces, textureDimFaces, float_type, normals, true);

    gpuMath.initFrameBufferForTexture("u_position", true);
    gpuMath.initFrameBufferForTexture("u_lastPosition", true);
    gpuMath.initFrameBufferForTexture("u_lastLastPosition", true);
    gpuMath.initFrameBufferForTexture("u_velocity", true);
    gpuMath.initFrameBufferForTexture("u_lastVelocity", true);
    gpuMath.initFrameBufferForTexture("u_theta", true);
    gpuMath.initFrameBufferForTexture("u_lastTheta", true);
    gpuMath.initFrameBufferForTexture("u_normals", true);

    gpuMath.initTextureFromData("u_meta", textureDim, textureDim, float_type, meta, true);
    gpuMath.initTextureFromData("u_meta2", textureDim, textureDim, float_type, meta2, true);
    gpuMath.initTextureFromData("u_nominalTrinagles", textureDimFaces, textureDimFaces, float_type, nominalTriangles, true);
    gpuMath.initTextureFromData("u_nodeCreaseMeta", textureDimNodeCreases, textureDimNodeCreases, float_type, nodeCreaseMeta, true);
    gpuMath.initTextureFromData("u_creaseMeta2", textureDimCreases, textureDimCreases, float_type, creaseMeta2, true);
    gpuMath.initTextureFromData("u_nodeFaceMeta", textureDimNodeFaces, textureDimNodeFaces, float_type, nodeFaceMeta, true);
    gpuMath.initTextureFromData("u_creaseGeo", textureDimCreases, textureDimCreases, float_type, creaseGeo, true);
    gpuMath.initFrameBufferForTexture("u_creaseGeo", true);
    gpuMath.initTextureFromData("u_faceVertexIndices", textureDimFaces, textureDimFaces, float_type, faceVertexIndices, true);
    gpuMath.initTextureFromData("u_nominalTriangles", textureDimFaces, textureDimFaces, float_type, nominalTriangles, true);

    gpuMath.createProgram("positionCalc", vertexShader, positionCalcShader);
    gpuMath.setUniformForProgram("positionCalc", "u_velocity", 0, "1i");
    gpuMath.setUniformForProgram("positionCalc", "u_lastPosition", 1, "1i");
    gpuMath.setUniformForProgram("positionCalc", "u_mass", 2, "1i");
    gpuMath.setUniformForProgram("positionCalc", "u_textureDim", [textureDim, textureDim], "2f");

    gpuMath.createProgram("velocityCalcVerlet", vertexShader, velocityCalcVerletShader);
    gpuMath.setUniformForProgram("velocityCalcVerlet", "u_position", 0, "1i");
    gpuMath.setUniformForProgram("velocityCalcVerlet", "u_lastPosition", 1, "1i");
    gpuMath.setUniformForProgram("velocityCalcVerlet", "u_mass", 2, "1i");
    gpuMath.setUniformForProgram("velocityCalcVerlet", "u_textureDim", [textureDim, textureDim], "2f");

    gpuMath.createProgram("velocityCalc", vertexShader, velocityCalcShader);
    gpuMath.setUniformForProgram("velocityCalc", "u_lastPosition", 0, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_lastVelocity", 1, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_originalPosition", 2, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_externalForces", 3, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_mass", 4, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_meta", 5, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_beamMeta", 6, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_creaseMeta", 7, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_nodeCreaseMeta", 8, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_normals", 9, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_theta", 10, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_creaseGeo", 11, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_meta2", 12, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_nodeFaceMeta", 13, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_nominalTriangles", 14, "1i");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDimEdges", [textureDimEdges, textureDimEdges], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDimFaces", [textureDimFaces, textureDimFaces], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDimCreases", [textureDimCreases, textureDimCreases], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDimNodeCreases", [textureDimNodeCreases, textureDimNodeCreases], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_textureDimNodeFaces", [textureDimNodeFaces, textureDimNodeFaces], "2f");
    gpuMath.setUniformForProgram("velocityCalc", "u_creasePercent", creasePercent, "1f");
    gpuMath.setUniformForProgram("velocityCalc", "u_axialStiffness", options.axialStiffness, "1f");
    gpuMath.setUniformForProgram("velocityCalc", "u_faceStiffness", options.faceStiffness, "1f");
    gpuMath.setUniformForProgram("velocityCalc", "u_calcFaceStrain", options.calcFaceStrain, "1f");

    gpuMath.createProgram("positionCalcVerlet", vertexShader, positionCalcVerletShader);
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_lastPosition", 0, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_lastLastPosition", 1, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_lastVelocity", 2, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_originalPosition", 3, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_externalForces", 4, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_mass", 5, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_meta", 6, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_beamMeta", 7, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_creaseMeta", 8, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_nodeCreaseMeta", 9, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_normals", 10, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_theta", 11, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_creaseGeo", 12, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_meta2", 13, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_nodeFaceMeta", 14, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_nominalTriangles", 15, "1i");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDimEdges", [textureDimEdges, textureDimEdges], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDimFaces", [textureDimFaces, textureDimFaces], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDimCreases", [textureDimCreases, textureDimCreases], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDimNodeCreases", [textureDimNodeCreases, textureDimNodeCreases], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_textureDimNodeFaces", [textureDimNodeFaces, textureDimNodeFaces], "2f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_creasePercent", creasePercent, "1f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_axialStiffness", options.axialStiffness, "1f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_faceStiffness", options.faceStiffness, "1f");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_calcFaceStrain", options.calcFaceStrain, "1f");

    gpuMath.createProgram("thetaCalc", vertexShader, thetaCalcShader);
    gpuMath.setUniformForProgram("thetaCalc", "u_normals", 0, "1i");
    gpuMath.setUniformForProgram("thetaCalc", "u_lastTheta", 1, "1i");
    gpuMath.setUniformForProgram("thetaCalc", "u_creaseVectors", 2, "1i");
    gpuMath.setUniformForProgram("thetaCalc", "u_lastPosition", 3, "1i");
    gpuMath.setUniformForProgram("thetaCalc", "u_originalPosition", 4, "1i");
    gpuMath.setUniformForProgram("thetaCalc", "u_textureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("thetaCalc", "u_textureDimFaces", [textureDimFaces, textureDimFaces], "2f");
    gpuMath.setUniformForProgram("thetaCalc", "u_textureDimCreases", [textureDimCreases, textureDimCreases], "2f");

    gpuMath.createProgram("normalCalc", vertexShader, normalCalc);
    gpuMath.setUniformForProgram("normalCalc", "u_faceVertexIndices", 0, "1i");
    gpuMath.setUniformForProgram("normalCalc", "u_lastPosition", 1, "1i");
    gpuMath.setUniformForProgram("normalCalc", "u_originalPosition", 2, "1i");
    gpuMath.setUniformForProgram("normalCalc", "u_textureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("normalCalc", "u_textureDimFaces", [textureDimFaces, textureDimFaces], "2f");

    gpuMath.createProgram("packToBytes", vertexShader, packToBytesShader);
    gpuMath.initTextureFromData("outputBytes", textureDim * 4, textureDim, "UNSIGNED_BYTE", null, true);
    gpuMath.initFrameBufferForTexture("outputBytes", true);
    gpuMath.setUniformForProgram("packToBytes", "u_floatTextureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("packToBytes", "u_floatTexture", 0, "1i");

    gpuMath.createProgram("zeroTexture", vertexShader, zeroTexture);
    gpuMath.createProgram("zeroThetaTexture", vertexShader, zeroThetaTexture);
    gpuMath.setUniformForProgram("zeroThetaTexture", "u_theta", 0, "1i");
    gpuMath.setUniformForProgram("zeroThetaTexture", "u_textureDimCreases", [textureDimCreases, textureDimCreases], "2f");

    gpuMath.createProgram("centerTexture", vertexShader, centerTexture);
    gpuMath.setUniformForProgram("centerTexture", "u_lastPosition", 0, "1i");
    gpuMath.setUniformForProgram("centerTexture", "u_textureDim", [textureDim, textureDim], "2f");

    gpuMath.createProgram("copyTexture", vertexShader, copyTexture);
    gpuMath.setUniformForProgram("copyTexture", "u_orig", 0, "1i");
    gpuMath.setUniformForProgram("copyTexture", "u_textureDim", [textureDim, textureDim], "2f");

    gpuMath.createProgram("updateCreaseGeo", vertexShader, updateCreaseGeo);
    gpuMath.setUniformForProgram("updateCreaseGeo", "u_lastPosition", 0, "1i");
    gpuMath.setUniformForProgram("updateCreaseGeo", "u_originalPosition", 1, "1i");
    gpuMath.setUniformForProgram("updateCreaseGeo", "u_creaseMeta2", 2, "1i");
    gpuMath.setUniformForProgram("updateCreaseGeo", "u_textureDim", [textureDim, textureDim], "2f");
    gpuMath.setUniformForProgram("updateCreaseGeo", "u_textureDimCreases", [textureDimCreases, textureDimCreases], "2f");

    gpuMath.setSize(textureDim, textureDim);

    programsInited = true;
  }

  function calcTextureSize(numNodes) {
    if (numNodes === 1) return 2;
    for (let i = 0; i < numNodes; i += 1) {
      if (Math.pow(2, 2 * i) >= numNodes) {
        return Math.pow(2, i);
      }
    }
    console.warn("no texture size found for " + numNodes + " items");
    return 2;
  }

  function updateMaterials(initing) {
    let index = 0;
    for (let i = 0; i < model.nodes.length; i += 1) {
      if (initing) {
        meta[4 * i] = index;
        meta[4 * i + 1] = model.nodes[i].numBeams();
      }
      for (let j = 0; j < model.nodes[i].beams.length; j += 1) {
        const beam = model.nodes[i].beams[j];
        beamMeta[4 * index] = beam.getK();
        beamMeta[4 * index + 1] = beam.getD();
        if (initing) {
          beamMeta[4 * index + 2] = beam.getLength();
          beamMeta[4 * index + 3] = beam.getOtherNode(model.nodes[i]).getIndex();
        }
        index += 1;
      }
    }
    gpuMath.initTextureFromData("u_beamMeta", textureDimEdges, textureDimEdges, float_type, beamMeta, true);


    if (programsInited) {
      gpuMath.setProgram("velocityCalc");
      gpuMath.setUniformForProgram("velocityCalc", "u_axialStiffness", options.axialStiffness, "1f");
      gpuMath.setUniformForProgram("velocityCalc", "u_faceStiffness", options.faceStiffness, "1f");
      gpuMath.setProgram("positionCalcVerlet");
      gpuMath.setUniformForProgram("positionCalcVerlet", "u_axialStiffness", options.axialStiffness, "1f");
      gpuMath.setUniformForProgram("positionCalcVerlet", "u_faceStiffness", options.faceStiffness, "1f");
      setSolveParams(); // recalc dt
    }
  }

  function updateExternalForces() {
    for (let i = 0; i < model.nodes.length; i += 1) {
      const externalForce = model.nodes[i].getExternalForce();
      externalForces[4 * i] = externalForce.x;
      externalForces[4 * i + 1] = externalForce.y;
      externalForces[4 * i + 2] = externalForce.z;
    }
    gpuMath.initTextureFromData("u_externalForces", textureDim, textureDim, float_type, externalForces, true);
  }

  function updateFixed() {
    for (let i = 0; i < model.nodes.length; i += 1) {
      mass[4 * i + 1] = (model.nodes[i].isFixed() ? 1 : 0);
    }
    gpuMath.initTextureFromData("u_mass", textureDim, textureDim, float_type, mass, true);
  }

  function updateOriginalPosition() {
    for (let i = 0; i < model.nodes.length; i += 1) {
      const origPosition = model.nodes[i].getOriginalPosition();
      originalPosition[4 * i] = origPosition.x;
      originalPosition[4 * i + 1] = origPosition.y;
      originalPosition[4 * i + 2] = origPosition.z;
    }
    gpuMath.initTextureFromData("u_originalPosition", textureDim, textureDim, float_type, originalPosition, true);
  }

  function updateCreaseVectors() {
    for (let i = 0; i < model.creases.length; i += 1) {
      const rgbaIndex = i * 4;
      const nodes = model.creases[i].edge.nodes;
      // this.vertices[1].clone().sub(this.vertices[0]);
      creaseVectors[rgbaIndex] = nodes[0].getIndex();
      creaseVectors[rgbaIndex + 1] = nodes[1].getIndex();
    }
    gpuMath.initTextureFromData("u_creaseVectors", textureDimCreases, textureDimCreases, float_type, creaseVectors, true);
  }

  function updateCreasesMeta(initing) {
    for (let i = 0; i < model.creases.length; i += 1) {
      const crease = model.creases[i];
      creaseMeta[i * 4] = crease.getK();
      // creaseMeta[i*4+1] = crease.getD();
      if (initing) creaseMeta[i * 4 + 2] = crease.getTargetTheta();
    }
    gpuMath.initTextureFromData("u_creaseMeta", textureDimCreases, textureDimCreases, float_type, creaseMeta, true);
  }

  function updateLastPosition() {
    for (let i = 0; i < model.nodes.length; i += 1) {
      const _position = model.nodes[i].getRelativePosition();
      lastPosition[4 * i] = _position.x;
      lastPosition[4 * i + 1] = _position.y;
      lastPosition[4 * i + 2] = _position.z;
    }
    gpuMath.initTextureFromData("u_lastPosition", textureDim, textureDim, float_type, lastPosition, true);
    gpuMath.initFrameBufferForTexture("u_lastPosition", true);
  }

  function setCreasePercent(percent) {
    if (!programsInited) return;
    gpuMath.setProgram("velocityCalc");
    gpuMath.setUniformForProgram("velocityCalc", "u_creasePercent", percent, "1f");
    gpuMath.setProgram("positionCalcVerlet");
    gpuMath.setUniformForProgram("positionCalcVerlet", "u_creasePercent", percent, "1f");
  }

  function initTypedArrays({ creasePercent }) {
    textureDim = calcTextureSize(model.nodes.length);

    let numNodeFaces = 0;
    const nodeFaces = [];
    for (let i = 0; i < model.nodes.length; i += 1) {
      nodeFaces.push([]);
      for (let j = 0; j < model.faces_vertices.length; j += 1) {
        if (model.faces_vertices[j].indexOf(i) >= 0) {
          nodeFaces[i].push(j);
          numNodeFaces += 1;
        }
      }
    }
    textureDimNodeFaces = calcTextureSize(numNodeFaces);

    let numEdges = 0;
    for (let i = 0; i < model.nodes.length; i += 1) {
      numEdges += model.nodes[i].numBeams();
    }
    textureDimEdges = calcTextureSize(numEdges);

    const numCreases = model.creases.length;
    textureDimCreases = calcTextureSize(numCreases);

    let numNodeCreases = 0;
    for (let i = 0; i < model.nodes.length; i += 1) {
      numNodeCreases += model.nodes[i].numCreases();
    }
    numNodeCreases += numCreases * 2; // reactions
    textureDimNodeCreases = calcTextureSize(numNodeCreases);

    const numFaces = model.faces_vertices.length;
    textureDimFaces = calcTextureSize(numFaces);

    originalPosition = new Float32Array(textureDim * textureDim * 4);
    position = new Float32Array(textureDim * textureDim * 4);
    lastPosition = new Float32Array(textureDim * textureDim * 4);
    lastLastPosition = new Float32Array(textureDim * textureDim * 4);
    velocity = new Float32Array(textureDim * textureDim * 4);
    lastVelocity = new Float32Array(textureDim * textureDim * 4);
    externalForces = new Float32Array(textureDim * textureDim * 4);
    mass = new Float32Array(textureDim * textureDim * 4);
    meta = new Float32Array(textureDim * textureDim * 4);
    meta2 = new Float32Array(textureDim * textureDim * 4);
    beamMeta = new Float32Array(textureDimEdges * textureDimEdges * 4);

    normals = new Float32Array(textureDimFaces * textureDimFaces * 4);
    faceVertexIndices = new Float32Array(textureDimFaces * textureDimFaces * 4);
    creaseMeta = new Float32Array(textureDimCreases * textureDimCreases * 4);
    nodeFaceMeta = new Float32Array(textureDimNodeFaces * textureDimNodeFaces * 4);
    nominalTriangles = new Float32Array(textureDimFaces * textureDimFaces * 4);
    nodeCreaseMeta = new Float32Array(textureDimNodeCreases * textureDimNodeCreases * 4);
    creaseMeta2 = new Float32Array(textureDimCreases * textureDimCreases * 4);
    creaseGeo = new Float32Array(textureDimCreases * textureDimCreases * 4);
    creaseVectors = new Float32Array(textureDimCreases * textureDimCreases * 4);
    theta = new Float32Array(textureDimCreases * textureDimCreases * 4);
    lastTheta = new Float32Array(textureDimCreases * textureDimCreases * 4);

    for (let i = 0; i < model.faces_vertices.length; i += 1) {
      const face = model.faces_vertices[i];
      faceVertexIndices[4 * i] = face[0];
      faceVertexIndices[4 * i + 1] = face[1];
      faceVertexIndices[4 * i + 2] = face[2];

      const a = model.nodes[face[0]].getOriginalPosition();
      const b = model.nodes[face[1]].getOriginalPosition();
      const c = model.nodes[face[2]].getOriginalPosition();
      const ab = (b.clone().sub(a)).normalize();
      const ac = (c.clone().sub(a)).normalize();
      const bc = (c.clone().sub(b)).normalize();
      nominalTriangles[4 * i] = Math.acos(ab.dot(ac));
      nominalTriangles[4 * i + 1] = Math.acos(-1*ab.dot(bc));
      nominalTriangles[4 * i + 2] = Math.acos(ac.dot(bc));

      if (Math.abs(nominalTriangles[4 * i] + nominalTriangles[4 * i + 1] + nominalTriangles[4 * i + 2] - Math.PI) > 0.1) {
        console.warn("bad angles");
      }
    }


    for (let i = 0; i < textureDim * textureDim; i += 1) {
      mass[4 * i + 1] = 1; // set all fixed by default
    }

    for (let i = 0; i < textureDimCreases * textureDimCreases; i += 1) {
      if (i >= numCreases) {
        lastTheta[i * 4 + 2] = -1;
        lastTheta[i * 4 + 3] = -1;
        continue;
      }
      lastTheta[i * 4 + 2] = model.creases[i].getNormal1Index();
      lastTheta[i * 4 + 3] = model.creases[i].getNormal2Index();
    }

    let index = 0;
    for (let i = 0; i < model.nodes.length; i += 1) {
      meta2[4 * i] = index;
      const num = nodeFaces[i].length;
      meta2[4 * i + 1] = num;
      for (let j = 0; j < num; j += 1) {
        const _index = (index + j) * 4;
        const face = model.faces_vertices[nodeFaces[i][j]];
        nodeFaceMeta[_index] = nodeFaces[i][j];
        nodeFaceMeta[_index + 1] = face[0] === i ? -1 : face[0];
        nodeFaceMeta[_index + 2] = face[1] === i ? -1 : face[1];
        nodeFaceMeta[_index + 3] = face[2] === i ? -1 : face[2];
      }
      index += num;
    }

    index = 0;
    for (let i = 0; i < model.nodes.length; i += 1) {
      mass[4 * i] = model.nodes[i].getSimMass();
      meta[i * 4 + 2] = index;
      const nodeCreases = model.nodes[i].creases;
      const nodeInvCreases = model.nodes[i].invCreases; // nodes attached to crease move in opposite direction
      // console.log(nodeInvCreases);
      meta[i * 4 + 3] = nodeCreases.length + nodeInvCreases.length;
      for (let j = 0; j < nodeCreases.length; j += 1) {
        nodeCreaseMeta[index * 4] = nodeCreases[j].getIndex();
        nodeCreaseMeta[index * 4 + 1] = nodeCreases[j].getNodeIndex(model.nodes[i]); // type 1, 2, 3, 4
        index += 1;
      }
      for (let j = 0; j < nodeInvCreases.length; j += 1) {
        nodeCreaseMeta[index * 4] = nodeInvCreases[j].getIndex();
        nodeCreaseMeta[index * 4 + 1] = nodeInvCreases[j].getNodeIndex(model.nodes[i]); // type 1, 2, 3, 4
        index += 1;
      }
    }
    for (let i = 0; i < model.creases.length; i += 1) {
      const crease = model.creases[i];
      creaseMeta2[i * 4] = crease.node1.getIndex();
      creaseMeta2[i * 4 + 1] = crease.node2.getIndex();
      creaseMeta2[i * 4 + 2] = crease.edge.nodes[0].getIndex();
      creaseMeta2[i * 4 + 3] = crease.edge.nodes[1].getIndex();
      index += 1;
    }

    updateOriginalPosition();
    updateMaterials(true);
    updateFixed();
    updateExternalForces();
    updateCreasesMeta(true);
    updateCreaseVectors();
    setCreasePercent(creasePercent);
  }

  return {
    dealloc,
    syncNodesAndEdges,
    setCreasePercent,
    updateFixed,
    solve,
    render,
    reset
  };
}

export default initDynamicSolver;
