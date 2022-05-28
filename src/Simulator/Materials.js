import * as THREE from "three";

const polygonOffsetFactor = 0.5;

// raycast point
export const materialRaycastPointLight = new THREE.PointsMaterial({
  sizeAttenuation: false,
  depthTest: false,
  color: 0x000000,
  size: 5,
});
export const materialRaycastPointDark = new THREE.PointsMaterial({
  sizeAttenuation: false,
  depthTest: false,
  color: 0xFFFFFF,
  size: 5,
});

// highlighted vertex
export const materialHighlightVertexLight = new THREE.PointsMaterial({
  sizeAttenuation: false,
  depthTest: false,
  color: 0x000000,
  size: 10,
});
export const materialHighlightVertexDark = new THREE.PointsMaterial({
  sizeAttenuation: false,
  depthTest: false,
  color: 0xF2C87A,
  size: 10,
});

// highlighted faces
export const materialHighlightFrontLight = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0xFFBB44,
});
export const materialHighlightBackLight = new THREE.MeshBasicMaterial({
  side: THREE.FrontSide,
  color: 0xFFBB44,
});
export const materialHighlightFrontDark = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0xE150E3,
});
export const materialHighlightBackDark = new THREE.MeshBasicMaterial({
  side: THREE.FrontSide,
  // color: 0xE150E3,
  color: 0x999999,
});

// edges
export const materialLightLine = new THREE.LineBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.5
});
export const materialDarkLine = new THREE.LineBasicMaterial({
  color: 0x000000,
  transparent: false,
  opacity: 1.0
});

// faces
export const materialLightFront = new THREE.MeshStandardMaterial({
  flatShading: true,
  side: THREE.FrontSide,
  polygonOffset: true,
  polygonOffsetFactor, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  color: 0xFFFFFF,
  emissive: 0x000000,
  roughness: 1,
});
export const materialLightBack = new THREE.MeshStandardMaterial({
  flatShading: true,
  side: THREE.BackSide,
  polygonOffset: true,
  polygonOffsetFactor, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  color: 0xEE5533,
  emissive: 0x000000,
  roughness: 1,
});
export const materialDarkFront = new THREE.MeshStandardMaterial({
  flatShading: true,
  side: THREE.FrontSide,
  polygonOffset: true,
  polygonOffsetFactor, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  color: 0x3E3F43,
  emissive: 0x000000,
  roughness: 1,
});
export const materialDarkBack = new THREE.MeshStandardMaterial({
  flatShading: true,
  side: THREE.BackSide,
  polygonOffset: true,
  polygonOffsetFactor, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  color: 0x2D39C0,
  emissive: 0x000000,
  roughness: 1,
});
