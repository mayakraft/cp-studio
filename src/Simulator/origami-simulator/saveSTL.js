/**
 * Created by amandaghassaei on 5/2/17.
 */

import * as THREE from "three";
import window from "./environment/window";

// Written by Paul Kaplan
// import geometryToSTLBin from "../import/geometryToSTLBin";
const geometryToSTLBin = function (geometryArray) {
  const isLittleEndian = true; // STL files assume little endian, see wikipedia page
  const writeFloat = function (dataview, bufferIndex, float, isLittleEndianF) {
    dataview.setFloat32(bufferIndex, float, isLittleEndianF);
    return bufferIndex + 4;
  };
  const writeVector = function (dataview, bufferIndex, vector,
    offset, orientation, isLittleEndianF) {
    vector = vector.clone();
    if (orientation) vector.applyQuaternion(orientation);
    if (offset) vector.add(offset);
    bufferIndex = writeFloat(dataview, bufferIndex, vector.x, isLittleEndianF);
    bufferIndex = writeFloat(dataview, bufferIndex, vector.y, isLittleEndianF);
    return writeFloat(dataview, bufferIndex, vector.z, isLittleEndianF);
  };

  const floatData = [];

  for (let index = 0; index < geometryArray.length; index += 1) {
    const geometry = geometryArray[index].geo;
    const { orientation } = geometryArray[index];
    const { offset } = geometryArray[index];

    if (geometry instanceof THREE.BufferGeometry) {
      const normals = geometry.attributes.normal.array;
      const vertices = geometry.attributes.position.array;
      for (let n = 0; n < vertices.length; n += 9) {
        const normal = new THREE.Vector3(normals[n], normals[n + 1], normals[n + 2]);
        const verta = new THREE.Vector3(vertices[n], vertices[n + 1], vertices[n + 2]);
        const vertb = new THREE.Vector3(vertices[n + 3], vertices[n + 4], vertices[n + 5]);
        const vertc = new THREE.Vector3(vertices[n + 6], vertices[n + 7], vertices[n + 8]);
        floatData.push([normal, verta, vertb, vertc, offset, orientation]);
      }
    } else {
      const tris = geometry.faces;
      const verts = geometry.vertices;

      for (let n = 0; n < tris.length; n += 1) {
        floatData.push([tris[n].normal, verts[tris[n].a], verts[tris[n].b],
          verts[tris[n].c], offset, orientation]);
      }
    }
  }
  if (floatData.length === 0) {
    console.warn("no data to write to stl");
    return null;
  }
  // write to DataView
  const bufferSize = 84 + (50 * floatData.length);
  const buffer = new ArrayBuffer(bufferSize);
  const dv = new DataView(buffer);
  let bufferIndex = 0;

  bufferIndex += 80; // Header is empty

  dv.setUint32(bufferIndex, floatData.length, isLittleEndian);
  bufferIndex += 4;

  for (let i = 0; i < floatData.length; i += 1) {
    bufferIndex = writeVector(dv, bufferIndex, floatData[i][0],
      null, floatData[i][5], isLittleEndian);
    for (let j = 1; j < 4; j += 1) {
      bufferIndex = writeVector(dv, bufferIndex, floatData[i][j],
        floatData[i][4], floatData[i][5], isLittleEndian);
    }
    bufferIndex += 2; // unused 'attribute byte count' is a Uint16
  }
  return dv;
};


function makeSaveGEO(doublesided){
  var geo = new THREE.Geometry().fromBufferGeometry( globals.model.getGeometry() );

  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  geo.center();
  const scale = 1 / geo.boundingSphere.radius;

  if (geo.vertices.length == 0 || geo.faces.length == 0) {
    globals.warn("No geometry to save.");
    return;
  }

  for (var i=0;i<geo.vertices.length;i++){
    geo.vertices[i].multiplyScalar(globals.exportScale/scale);
  }


  // if (globals.thickenModel){
  //     var numVertices = geo.vertices.length;
  //     geo.computeVertexNormals();
  //     geo.computeFaceNormals();
  //     for (var i=0;i<numVertices;i++){
  //         var face;
  //         var vertexNormal = new THREE.Vector3();
  //         var lastFaceIndex = 0;
  //         for (var j=0;j<geo.faces.length;j++){
  //             face = geo.faces[j];
  //             if (face.a == i) {
  //                 var a = geo.vertices[face.a];
  //                 var b = geo.vertices[face.b];
  //                 var c = geo.vertices[face.c];
  //                 var  weight = Math.abs(Math.acos( (b.clone().sub(a)).normalize().dot( (c.clone().sub(a)).normalize() ) ));
  //                 vertexNormal.add(face.normal.clone().multiplyScalar(weight));
  //                 lastFaceIndex = j;
  //             } else if (face.b == i) {
  //                 var a = geo.vertices[face.a];
  //                 var b = geo.vertices[face.b];
  //                 var c = geo.vertices[face.c];
  //                 var  weight = Math.abs(Math.acos( (c.clone().sub(b)).normalize().dot( (a.clone().sub(b)).normalize() ) ));
  //                 vertexNormal.add(face.normal.clone().multiplyScalar(weight));
  //                 lastFaceIndex = j;
  //             } else if (face.c == i) {
  //                 var a = geo.vertices[face.a];
  //                 var b = geo.vertices[face.b];
  //                 var c = geo.vertices[face.c];
  //                 var  weight = Math.abs(Math.acos( (b.clone().sub(c)).normalize().dot( (a.clone().sub(c)).normalize() ) ));
  //                 vertexNormal.add(face.normal.clone().multiplyScalar(weight));
  //                 lastFaceIndex = j;
  //             }
  //             // if (vertexNormal !== null) break;
  //         }
  //         // if (vertexNormal === undefined) {
  //         //     geo.vertices.push(new THREE.Vector3());
  //         //     continue;
  //         // }
  //         //filter out duplicate normals
  //         vertexNormal.normalize();
  //         console.log(vertexNormal);
  //         var offset = vertexNormal.clone().multiplyScalar(5);//globals.thickenOffset/(2*vertexNormal.clone().dot(geo.faces[lastFaceIndex].normal)));
  //
  //         geo.vertices.push(geo.vertices[i].clone().sub(offset));
  //         geo.vertices[i].add(offset);
  //     }
  //     var numFaces = geo.faces.length;
  //     for (var i=0;i<numFaces;i++){
  //         var face = geo.faces[i].clone();
  //         face.a += numVertices;
  //         face.b += numVertices;
  //         face.c += numVertices;
  //         var b = face.b;
  //         face.b = face.c;
  //         face.c = b;
  //         geo.faces.push(face);
  //     }
  //     geo.computeVertexNormals();
  //     geo.computeFaceNormals();



  if (doublesided){
    var numFaces = geo.faces.length;
    for (var i=0;i<numFaces;i++){
      var face = geo.faces[i];
      geo.faces.push(new THREE.Face3(face.a, face.c, face.b));
    }
  }

  return geo;
}

function saveSTL(){

  var data = [];
  data.push({geo: makeSaveGEO(globals.doublesidedSTL), offset:new THREE.Vector3(0,0,0), orientation:new THREE.Quaternion(0,0,0,1)});
  var stlBin = geometryToSTLBin(data);
  if (!stlBin) return;
  var blob = new Blob([stlBin], {type: 'application/octet-binary'});
  var filename = $("#stlFilename").val();
  if (filename == "") filename = globals.filename;
  saveAs(blob, filename + ".stl");
}

function saveOBJ(){
  //custom export to be compatible with freeform origami
  var geo = new THREE.Geometry().fromBufferGeometry( globals.model.getGeometry() );

  if (geo.vertices.length == 0 || geo.faces.length == 0) {
    globals.warn("No geometry to save.");
    return;
  }

  for (var i=0;i<geo.vertices.length;i++){
    geo.vertices[i].multiplyScalar(globals.exportScale/globals.scale);
  }

  var fold = globals.pattern.getFoldData(false);
  var obj = "#output from http://apps.amandaghassaei.com/OrigamiSimulator/\n";
  obj += "# "+ geo.vertices.length + "vertices\n";
  for (var i=0;i<geo.vertices.length;i++){
    var vertex = geo.vertices[i];
    obj += "v " + vertex.x + " " + vertex.y + " " + vertex.z + "\n"
  }
  obj += "# "+ fold.faces_vertices.length + " faces\n";
  for (var i=0;i<fold.faces_vertices.length;i++){
    var face = fold.faces_vertices[i];//triangular faces
    obj += "f " + (face[0]+1) + " " + (face[1]+1) + " " + (face[2]+1) + "\n"
  }

  obj += "# "+ fold.edges_vertices.length + " edges\n";
  for (var i=0;i<fold.edges_vertices.length;i++){
    var edge = fold.edges_vertices[i];//triangular faces
    obj += "#e " + (edge[0]+1) + " " + (edge[1]+1) + " ";
    if (fold.edges_assignment[i] == "F") obj += 1;
    else if (fold.edges_assignment[i] == "B") obj += 0;
    else if (fold.edges_assignment[i] == "M") obj += 3;
    else if (fold.edges_assignment[i] == "V") obj += 2;
    else {
      console.log("don't know how to convert type " + fold.edges_assignment[i]);
      obj += 0;
    }
    //todo fold angle
    obj += " 0\n";
  }

  // var exporter = new THREE.OBJExporter();
  // var result = exporter.parse (new THREE.Mesh(makeSaveGEO(globals.doublesidedOBJ)));
  // if (!result) return;
  var blob = new Blob([obj], {type: 'application/octet-binary'});
  var filename = $("#objFilename").val();
  if (filename == "") filename = globals.filename;
  saveAs(blob, filename + ".obj");
}

export default makeSaveGEO;
