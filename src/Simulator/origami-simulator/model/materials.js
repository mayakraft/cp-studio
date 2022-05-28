import * as THREE from "three";

const polygonOffset = 0.5;

const node = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side:THREE.DoubleSide
});

const nodeTransparent = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true
});

const line = new THREE.LineBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.3
});

const strain = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  side: THREE.DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
  polygonOffsetUnits: 1
});

// default style front and back for faces
const front = new THREE.MeshPhongMaterial({
  flatShading: true,
  side: THREE.FrontSide,
  polygonOffset: true,
  polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  // dithering:true,
  color: 0xec008b,
  shininess: 1,
  specular: 0xffffff,
  reflectivity: 0
});

const back = new THREE.MeshPhongMaterial({
  flatShading: true,
  side: THREE.BackSide,
  polygonOffset: true,
  polygonOffsetFactor: polygonOffset, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  // dithering:true,
  // color: 0xffffff,
  color: 0x115588,
  shininess: 1,
  specular: 0xffffff,
  reflectivity: 0
});

// const transparentVRMaterial = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   opacity: 0.8,
//   transparent: true
// });


// material = new THREE.MeshPhysicalMaterial( {
//     map: null,
//     color: 0x0000ff,
//     metalness: 0.2,
//     roughness: 0.6,
//     side: THREE.FrontSide,
//     transparent: false,
//     envMapIntensity: 5,
//     premultipliedAlpha: true
//     // TODO: Add custom blend mode that modulates background color by this materials color.
// } );

// material2 = new THREE.MeshPhysicalMaterial( {
//     map: null,
//     color: 0xffffff,
//     metalness: 0.2,
//     roughness: 0.6,
//     side: THREE.BackSide,
//     transparent: false,
//     envMapIntensity: 5,
//     premultipliedAlpha: true
//     // TODO: Add custom blend mode that modulates background color by this materials color.
// } );


export {
  node,
  nodeTransparent,
  line,
  strain,
  front,
  back,
};
