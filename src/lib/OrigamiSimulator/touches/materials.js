import * as THREE from "three";
/**
 * @description default materials for model highlights for the
 * user interaction raycaster
 */
// point
export const point = new THREE.PointsMaterial({
	sizeAttenuation: false,
	depthTest: false,
	color: 0x000000,
	size: 5,
});
// vertex
export const vertex = new THREE.PointsMaterial({
	sizeAttenuation: false,
	depthTest: false,
	color: 0x000000,
	size: 10,
});
// face
export const frontFace = new THREE.MeshBasicMaterial({
	side: THREE.FrontSide,
	color: 0xFFBB44,
});
export const backFace = new THREE.MeshBasicMaterial({
	side: THREE.BackSide,
	color: 0xFFBB44,
});
