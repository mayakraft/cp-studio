import * as THREE from "three";
import * as Materials from "./materials.js";
// todo: idea- duplicate highlighted vertex, one obeys depthTest with full
// opacity, the other is always visible with half opacity.
const Highlights = ({ scene, simulator }) => {
	// visualize the raycaster
	let point;
	let vertex;
	let face;

	const highlightPoint = (nearest) => {
		point.visible = nearest.point != null;
		if (!point.visible) { return; }
		point.geometry.attributes.position.array[0] = nearest.point.x;
		point.geometry.attributes.position.array[1] = nearest.point.y;
		point.geometry.attributes.position.array[2] = nearest.point.z;
		point.geometry.attributes.position.needsUpdate = true;
	};

	const highlightVertex = (nearest) => {
		vertex.visible = nearest.vertex != null;
		if (!vertex.visible) { return; }
		vertex.geometry.attributes.position.array[0] = nearest.vertex_coords.x;
		vertex.geometry.attributes.position.array[1] = nearest.vertex_coords.y;
		vertex.geometry.attributes.position.array[2] = nearest.vertex_coords.z;
		vertex.geometry.attributes.position.needsUpdate = true;
	};

	const highlightFace = (nearest) => {
		face.visible = nearest.face != null;
		if (!face.visible) { return; }
		nearest.face_vertices
			.map(vert => [0, 1, 2].map(i => simulator.model.positions[vert * 3 + i]))
			.forEach((p, j) => [0, 1].forEach((_, i) => {
				for (let d = 0; d < 3; d += 1) {
					face.geometry.attributes.position.array[i * 9 + j * 3 + d] = p[d];
				}
			}));
		face.geometry.attributes.position.needsUpdate = true;
	};

	const clear = () => {
		point.visible = false;
		vertex.visible = false;
		face.visible = false;
	};

	const highlightTouch = (nearest) => {
		clear();
		// if (nearest === undefined || !props.simulatorShowTouches()) {
		if (nearest === undefined) {
			return;
		}
		highlightPoint(nearest);
		highlightVertex(nearest);
		highlightFace(nearest);
	};

	// setup highlighted point. does not adhere to depthTest
	const raycasterPointPositionAttr = new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3);
	raycasterPointPositionAttr.setUsage(THREE.DynamicDrawUsage);
	const raycasterPointBuffer = new THREE.BufferGeometry();
	raycasterPointBuffer.setAttribute("position", raycasterPointPositionAttr);
	point = new THREE.Points(raycasterPointBuffer, Materials.point);
	point.renderOrder = 1000;

	// setup highlighted vertex. does not adhere to depthTest
	const raycasterVertexPositionAttr = new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3);
	raycasterVertexPositionAttr.setUsage(THREE.DynamicDrawUsage);
	const raycasterVertexBuffer = new THREE.BufferGeometry();
	raycasterVertexBuffer.setAttribute("position", raycasterVertexPositionAttr);
	vertex = new THREE.Points(raycasterVertexBuffer, Materials.vertex);
	vertex.renderOrder = 1001;

	// setup highlighted face. two triangle faces, three vertices with x, y, z
	const raycasterFacePositionBuffer = new Float32Array(Array(2 * 3 * 3).fill(0.0));
	const raycasterFacePositionAttr = new THREE.BufferAttribute(raycasterFacePositionBuffer, 3);
	raycasterFacePositionAttr.setUsage(THREE.DynamicDrawUsage);
	const raycasterFaceBuffer = new THREE.BufferGeometry();
	raycasterFaceBuffer.setAttribute("position", raycasterFacePositionAttr);
	raycasterFaceBuffer.addGroup(0, 3, 1);
	raycasterFaceBuffer.addGroup(3, 3, 0);
	face = new THREE.Mesh(
		raycasterFaceBuffer,
		[Materials.frontFace, Materials.backFace],
	);

	const setScene = (scene) => {
		// remove from previous scene
		point.removeFromParent();
		vertex.removeFromParent();
		face.removeFromParent();
		// add to new scene
		if (scene) {
			scene.add(point);
			scene.add(vertex);
			scene.add(face);
		}
	};

	setScene(scene);

	return {
		point,
		vertex,
		face,
		setScene,
		highlightTouch,
		highlightPoint,
		highlightVertex,
		highlightFace,
		clear,
	};
};

export default Highlights;
