/**
 * Created by amandaghassaei on 2/24/17.
 */
import * as THREE from "three";
import Node from "./node";
import Beam from "./beam";
import Crease from "./crease";
import * as defaultMaterials from "./materials";
import getFacesAndVerticesForEdges from "../fold/creaseParams";

// buffer geometry has materialIndex property. use this for front/back colors

const assignments = Array.from("BMVFCU");

function Model({ scene, visible, axialStrain }) {
  this.geometry = null;
  this.frontside = new THREE.Mesh(); // front face of mesh
  this.backside = new THREE.Mesh(); // back face of mesh (different color)
  this.lines = {};
  assignments.forEach(key => {
    this.lines[key] = new THREE.LineSegments(new THREE.BufferGeometry(), defaultMaterials.line);
  });
  // vertex / color buffer arrays for GPU
  this.positions = null;
  this.colors = null;
  // these are custom objects that contain a bunch of information for the solver.
  this.nodes = [];
  this.edges = [];
  this.creases = [];
  this.faces_vertices = [];

  this.materials = {};
  this.materials.front = defaultMaterials.front;
  this.materials.back = defaultMaterials.back;
  this.materials.strain = defaultMaterials.strain;
  this.materials.line = defaultMaterials.line;

  this.makeNewGeometries();
  this.setAxialStrain(axialStrain);
  this.frontside.castShadow = true;
  this.frontside.receiveShadow = true;
  // this.backside.castShadow = true;
  this.backside.receiveShadow = true;

  scene.add(this.frontside);
  scene.add(this.backside);
  Object.values(this.lines).forEach(line => scene.add(line));
  // console.log("+++ initialize: Model()");
};

Model.prototype.dealloc = function () {
  // console.log("--- dealloc: Model()");
  // dispose geometries
  [this.geometry, this.frontside.geometry, this.backside.geometry]
    .filter(geo => geo)
    .forEach(geo => geo.dispose());
  this.geometry = null;
  this.frontside.geometry = null;
  this.backside.geometry = null;
  Object.values(this.lines)
    .filter(line => line.geometry)
    .forEach((line) => line.geometry.dispose());
  // dispose materials
  [this.frontside.material, this.backside.material]
    .filter(material => material)
    .forEach(material => material.dispose());
  Object.values(this.lines)
    .filter(line => line.material)
    .forEach(line => line.material.dispose());
  // dispose class objects
  this.nodes.forEach(node => node.destroy());
  this.edges.forEach(edge => edge.destroy());
  this.creases.forEach(crease => crease.destroy());
  this.nodes = [];
  this.edges = [];
  this.creases = [];
};

Model.prototype.makeNewGeometries = function () {
  this.geometry = new THREE.BufferGeometry();
  this.geometry.dynamic = true;
  this.frontside.geometry = this.geometry;
  this.backside.geometry = this.geometry;
  // todo: do we need to set frontside/backside dynamic?
  // this.geometry.verticesNeedUpdate = true;
  Object.values(this.lines).forEach((line) => {
    line.geometry = new THREE.BufferGeometry();
    line.geometry.dynamic = true;
    // line.geometry.verticesNeedUpdate = true;
  });
};

Model.prototype.setAxialStrain = function (axialStrain) {
  this.frontside.material = axialStrain
    ? this.materials.strain
    : this.materials.front;
  this.backside.material = this.materials.back;
  this.backside.visible = !axialStrain;
  // frontside.material.depthWrite = false;
  // backside.material.depthWrite = false;
  this.frontside.material.needsUpdate = true;
  this.backside.material.needsUpdate = true;
  // todo: if the animation is not currently running,
  // this looks like we need to force an update. maybe?
  // if (!globals.threeView.simulationRunning) {
  //   reset()
  // }
};

// in this case, options is an object where each key is B, M, V, F...
// and each value is a boolean true/false
Model.prototype.updateEdgeVisibility = function (options) {
  assignments.forEach(a => { this.lines[a].visible = options[a]; });
};

Model.prototype.getMesh = function () { return [this.frontside, this.backside]; };

Model.prototype.needsUpdate = function ({ axialStrain, vrEnabled }) {
  this.geometry.attributes.position.needsUpdate = true;
  if (axialStrain) this.geometry.attributes.color.needsUpdate = true;
  // if (vrEnabled) this.geometry.computeBoundingBox();
  // this is needed for the raycaster. even if VR is not enabled.
  this.geometry.computeBoundingBox();
};

Model.prototype.makeObjects = function (fold, options) {
  this.nodes = fold.vertices_coords
    .map(vertex => new THREE.Vector3(...vertex))
    // .map((vector, i) => new Node(vector.clone(), i, Model.prototype.getPositionsArray));
    .map((vector, i) => new Node(vector.clone(), i, this));
  this.edges = fold.edges_vertices
    .map(ev => ev.map(v => this.nodes[v]))
    .map(nodes => new Beam(nodes, options));
  this.creases = getFacesAndVerticesForEdges(fold)
    .map((param, i) => new Crease(
      options,
      this.edges[param.edge],
      param.faces[0],
      param.faces[1],
      param.foldAngle * Math.PI / 180, // up until now everything has been in degrees
      param.foldAngle !== 0 ? 1 : 0,  // type
      this.nodes[param.vertices[0]],
      this.nodes[param.vertices[1]],
      i));
  this.faces_vertices = fold.faces_vertices;
};

Model.prototype.makeTypedArrays = function (fold) {
  const positions = new Float32Array(fold.vertices_coords.length * 3);
  const colors = new Float32Array(fold.vertices_coords.length * 3);
  const indices = new Uint16Array(fold.faces_vertices.length * 3);
  // keys are assignments (M, V ...), values are Uint16Array
  const lineIndices = {};
  for (let i = 0; i < fold.vertices_coords.length; i += 1) {
    positions[3 * i] = fold.vertices_coords[i][0];
    positions[3 * i + 1] = fold.vertices_coords[i][1];
    positions[3 * i + 2] = fold.vertices_coords[i][2];
  }
  for (let i = 0; i < fold.faces_vertices.length; i += 1) {
    indices[3 * i] = fold.faces_vertices[i][0];
    indices[3 * i + 1] = fold.faces_vertices[i][1];
    indices[3 * i + 2] = fold.faces_vertices[i][2];
  }
  // each key is an assignment type: M, V ... the values are arrays
  // each array is a stride-2 of vertices where each pair describes
  // an edge, like [2, 5, 9, 5, ...] meaning edge between 2 & 5, 9 & 5...
  const assignmentEdgeVertices = {};
  assignments.forEach(key => { assignmentEdgeVertices[key] = []; });
  fold.edges_assignment
    .map(assignment => assignment.toUpperCase())
    .forEach((assignment, i) => {
      assignmentEdgeVertices[assignment].push(fold.edges_vertices[i][0]);
      assignmentEdgeVertices[assignment].push(fold.edges_vertices[i][1]);
    });
  // todo, do we need to release memory from last time?
  assignments.forEach((key) => {
    lineIndices[key] = new Uint16Array(assignmentEdgeVertices[key].length);
    for (let i = 0; i < assignmentEdgeVertices[key].length; i += 1) {
      lineIndices[key][i] = assignmentEdgeVertices[key][i];
    }
  });
  return {
    positions,
    colors,
    indices,
    lineIndices,
  };
};

Model.prototype.setGeometryBuffers = function ({ positions, colors, indices, lineIndices }) {
  const positionsAttribute = new THREE.BufferAttribute(positions, 3);
  this.geometry.setAttribute("position", positionsAttribute);
  this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  assignments.forEach((key) => {
    this.lines[key].geometry.setAttribute("position", positionsAttribute);
    this.lines[key].geometry.setIndex(new THREE.BufferAttribute(lineIndices[key], 1));
    // this.lines[key].geometry.attributes.position.needsUpdate = true;
    // this.lines[key].geometry.index.needsUpdate = true;
    this.lines[key].geometry.computeBoundingBox();
    this.lines[key].geometry.computeBoundingSphere();
    this.lines[key].geometry.center();
  });
  // geometry.attributes.position.needsUpdate = true;
  // geometry.index.needsUpdate = true;
  // geometry.verticesNeedUpdate = true;
  // re-scale object to unit-space and center it at the origin.
  this.geometry.computeVertexNormals();
  this.geometry.computeBoundingBox();
  this.geometry.computeBoundingSphere();
  this.geometry.center();
};

Model.prototype.makeModelScale = function ({ scale, positions }) {
  // const factor = scale / this.geometry.boundingSphere.radius;
  // for (let i = 0; i < positions.length; i += 1) {
  //   positions[i] *= factor;
  // }
  // positions.forEach(p => p *= factor);
  for (let i = 0; i < this.nodes.length; i += 1) {
    this.nodes[i].setOriginalPosition(
      positions[3 * i],
      positions[3 * i + 1],
      positions[3 * i + 2]);
  }
  this.edges.forEach(edge => edge.recalcOriginalLength());
};

// options: { axialStiffness, percentDamping, panelStiffness, creaseStiffness, visible }
Model.prototype.load = function (fold, options) {
  const scale = 1; // the intended width of the buffer geometry

  this.dealloc();
  this.makeNewGeometries();
  this.updateEdgeVisibility(options.visible);
  this.setAxialStrain(options.axialStrain);
  this.makeObjects(fold, options);
  const { positions, colors, indices, lineIndices } = this.makeTypedArrays(fold);
  this.setGeometryBuffers({ positions, colors, indices, lineIndices });
  this.makeModelScale({ scale, positions });
  // save these for the solver to modify
  this.positions = positions;
  this.colors = colors;
  // getSolver().syncNodesAndEdges();
  // todo: if the animation is not currently running,
  // this looks like we need to force an update. maybe?
  // if (!globals.simulationRunning) reset();    
};

//  not sure where this function needs to be called
// function reset(solver) {
//   solver.reset();
//   needsUpdate({});
// }

export default Model;
