import Style from "./Simulator.module.css";
import { createSignal, createEffect, onCleanup } from "solid-js";
import * as THREE from "three";
import ThreeCanvas from "./ThreeCanvas";
import OrigamiSimulator from "./origami-simulator/";
import * as Materials from "./Materials";
import { calculateTouches } from "./Touches";
import { getVMax } from "../Helpers";

// intensity of point lights for light and dark mode
const lightIntensityLightMode = 0.45;
const lightIntensityDarkMode = 0.707;
// octahedron
// const lightVertices = [[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]];
// cube
const lightVertices = [
	[ 1,  1,  1],
	[-1,  1,  1],
	[ 1, -1,  1],
	[-1, -1,  1],
	[ 1,  1, -1],
	[-1,  1, -1],
	[ 1, -1, -1],
	[-1, -1, -1],
];

const Simulator = (props) => {

	const [foldAmount, setFoldAmount] = createSignal(0.5);
	const [strain, setStrain] = createSignal(false);
	const [isActive, setIsActive] = createSignal(true);
	const [cameraRadius, setCameraRadius] = createSignal(1);

	const [requestResize, setRequestResize] = createSignal();

	// three js
	let renderer, scene, camera;
	// lighting
	let lights, lightsRadius = 1;
	// origami simulator
	let simulator, raycaster, raycasterPlane;
	// visualizations due to raycaster
	let raycasterPoint, raycasterVertex, raycasterFace;
	// todo: idea- duplicate highlighted vertex, one obeys depthTest with full
	// opacity, the other is always visible with half opacity.


	const updateViewDistance = () => {
		const vmax = getVMax(props.cp());
		setCameraRadius(vmax);
		lightsRadius = vmax * Math.SQRT1_2;
		updateLightsPosition();
	};

	createEffect(() => {
		cameraRadius();
		setRequestResize(Math.random());
	});

	/**
	 * note, this is not Solid-JS's onMount function, but it functions as the same
	 */
	const onMount = (_renderer, _scene, _camera) => {
		renderer = _renderer;
		scene = _scene;
		camera = _camera;

		lights = lightVertices.map(() => new THREE.PointLight());
		lights.forEach(light => scene.add(light));

		updateLightsPosition();
		initializeRaycaster();
		simulator = OrigamiSimulator({
			renderer: renderer,
			scene: scene,
			camera: camera,
		});

		createEffect(() => {
			simulator.load(props.cp());
			updateViewDistance();
		});
		createEffect(() => {
			props.views();
			props.tool();
			props.showPanels();
			updateViewDistance();
			setRequestResize(Math.random());
		});
		createEffect(() => updateStyle(props.darkMode()));
		createEffect(() => props.simulatorOn() ? simulator.start() : simulator.stop());
		createEffect(() => simulator.setStrain(props.simulatorStrain()));
		createEffect(() => simulator.setFoldAmount(props.simulatorFoldAmount()));
		createEffect(() => {
			const shadows = props.simulatorShowShadows();
			// renderer.shadowMap.enabled = shadows;
			simulator.shadows = shadows;
			lights[0].castShadow = shadows;
			lights[7].castShadow = shadows;
			lights[3].castShadow = shadows;
			lights[4].castShadow = shadows;
		});
	};

	onCleanup(() => {
		simulator.dealloc();
	});

	const animate = () => {
		// if the simulator is on (more precisely, the fold percentage
		// is changing), we need to update the highlighted vertices/faces.
		if (simulator && simulator.isOn) {
			highlightTouch(calculateTouches(simulator.model, raycaster)[0]);
		}
		// if (camera) { updateLightsPosition(); }
		// dragControls.nodePositionsDidChange = () => {
		// 	simulator.modelDidChange();
		// };
	};

	/**
	 * all initialize methods are intended to only be called once. onMount
	 */
	const initializeRaycaster = () => {
		// setup raycaster and plane (both will be dynamically updated)
		raycaster = new THREE.Raycaster();
		// raycaster.setFromCamera({x: 0.001, y: 0.002}, camera);
		raycaster.setFromCamera({x: Infinity, y: 0}, camera);
		raycasterPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));

		// setup highlighted point. does not adhere to depthTest
		const raycasterPointPositionAttr = new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3);
		raycasterPointPositionAttr.setUsage(THREE.DynamicDrawUsage);
		const raycasterPointBuffer = new THREE.BufferGeometry();
		raycasterPointBuffer.setAttribute("position", raycasterPointPositionAttr);
		raycasterPoint = new THREE.Points(raycasterPointBuffer);
		raycasterPoint.renderOrder = 1000;
		scene.add(raycasterPoint);

		// setup highlighted vertex. does not adhere to depthTest
		const raycasterVertexPositionAttr = new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3);
		raycasterVertexPositionAttr.setUsage(THREE.DynamicDrawUsage);
		const raycasterVertexBuffer = new THREE.BufferGeometry();
		raycasterVertexBuffer.setAttribute("position", raycasterVertexPositionAttr);
		raycasterVertex = new THREE.Points(raycasterVertexBuffer);
		raycasterVertex.renderOrder = 1001;
		scene.add(raycasterVertex);

		// setup highlighted face. two triangle faces, three vertices with x, y, z
		const raycasterFacePositionBuffer = new Float32Array(Array(2 * 3 * 3).fill(0.0));
		const raycasterFacePositionAttr = new THREE.BufferAttribute(raycasterFacePositionBuffer, 3);
		raycasterFacePositionAttr.setUsage(THREE.DynamicDrawUsage);
		const raycasterFaceBuffer = new THREE.BufferGeometry();
		raycasterFaceBuffer.setAttribute("position", raycasterFacePositionAttr);
		raycasterFaceBuffer.addGroup(0, 3, 1);
		raycasterFaceBuffer.addGroup(3, 3, 0);
		raycasterFace = new THREE.Mesh(raycasterFaceBuffer,
			[new THREE.MeshBasicMaterial(), new THREE.MeshBasicMaterial()]);
		scene.add(raycasterFace);

		renderer.domElement.addEventListener("mousemove", raycasterMoveHandler, false);
	};

	const raycasterMoveHandler = (event) => {
		const bounds = renderer.domElement.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - bounds.x) / bounds.width) * 2 - 1,
			-((event.clientY - bounds.y) / bounds.height) * 2 + 1
		);
		raycaster.setFromCamera(mouse, camera);
		const touches = calculateTouches(simulator.model, raycaster);
		highlightTouch(touches[0]);
		props.setSimulatorPointers(touches);
	};

	const updateLightsPosition = () => {
		let matrix = new THREE.Matrix4();
		if (camera) {
			matrix = camera.matrixWorldInverse.clone();
			matrix.setPosition(0,0,0);
		}
		lights.forEach((light, i) => {
			light.position.set(...lightVertices[i % lightVertices.length]);
			light.position.setLength(lightsRadius);
			// light.position.applyMatrix4(matrix);
			light.distance = 0;
			light.decay = 2;
			light.castShadow = false;
			light.shadow.mapSize.width = 512; // default
			light.shadow.mapSize.height = 512; // default
			light.shadow.camera.near = lightsRadius / 10; // 0.5 default
			light.shadow.camera.far = lightsRadius * 10; // 500 default
		});
	};

	// setup (or re-apply) all mesh materials, like when switching to dark mode.
	const updateStyle = (darkMode) => {
		scene.background = darkMode ? new THREE.Color("#0F0F10") : new THREE.Color("#eee");
		simulator.model.materials.front = darkMode ? Materials.materialDarkFront : Materials.materialLightFront;
		simulator.model.materials.back = darkMode ? Materials.materialDarkBack : Materials.materialLightBack;
		raycasterFace.material = darkMode
			? [Materials.materialHighlightFrontDark, Materials.materialHighlightBackDark]
			: [Materials.materialHighlightFrontLight, Materials.materialHighlightBackLight];
		raycasterPoint.material = darkMode
			? Materials.materialRaycastPointDark
			: Materials.materialRaycastPointLight;
		raycasterVertex.material = darkMode
			? Materials.materialHighlightVertexDark
			: Materials.materialHighlightVertexLight;
		const lineMaterial = darkMode ? Materials.materialDarkLine : Materials.materialLightLine;
		Object.keys(simulator.model.lines)
			.forEach(key => { simulator.model.lines[key].material = lineMaterial; });
		const lightIntensity = darkMode ? lightIntensityDarkMode : lightIntensityLightMode;
		lights.forEach(light => { light.intensity = lightIntensity; });
		// todo: why is this here?
		simulator.strain = strain();
	};

	const highlightTouch = (nearest) => {
		raycasterPoint.visible = false;
		raycasterVertex.visible = false;
		raycasterFace.visible = false;
		if (nearest === undefined || !props.simulatorShowTouches()) {
			return;
		}
		highlightPoint(nearest);
		highlightVertex(nearest);
		highlightFace(nearest);
	};

	const highlightPoint = (nearest) => {
		raycasterPoint.visible = nearest.point != null;
		if (!raycasterPoint.visible) { return; }
		raycasterPoint.geometry.attributes.position.array[0] = nearest.point.x;
		raycasterPoint.geometry.attributes.position.array[1] = nearest.point.y;
		raycasterPoint.geometry.attributes.position.array[2] = nearest.point.z;
		raycasterPoint.geometry.attributes.position.needsUpdate = true;
	};

	const highlightVertex = (nearest) => {
		raycasterVertex.visible = nearest.vertex != null;
		if (!raycasterVertex.visible) { return; }
		raycasterVertex.geometry.attributes.position.array[0] = nearest.vertex_coords.x;
		raycasterVertex.geometry.attributes.position.array[1] = nearest.vertex_coords.y;
		raycasterVertex.geometry.attributes.position.array[2] = nearest.vertex_coords.z;
		raycasterVertex.geometry.attributes.position.needsUpdate = true;
	};

	const highlightFace = (nearest) => {
		raycasterFace.visible = nearest.face != null;
		if (!raycasterFace.visible) { return; }
		nearest.face_vertices
			.map(vert => [0, 1, 2].map(i => simulator.model.positions[vert * 3 + i]))
			.forEach((p, j) => [0, 1].forEach((_, i) => {
				raycasterFace.geometry.attributes.position.array[i * 9 + j * 3 + 0] = p[0];
				raycasterFace.geometry.attributes.position.array[i * 9 + j * 3 + 1] = p[1];
				raycasterFace.geometry.attributes.position.array[i * 9 + j * 3 + 2] = p[2];
			}));
		raycasterFace.geometry.attributes.position.needsUpdate = true;
	};

	return (<>
		<div class={Style.Simulator}>
			<ThreeCanvas
				didMount={onMount}
				requestResize={requestResize}
				animate={animate}
				cameraRadius={cameraRadius}
			/>
		</div>
	</>);
};

export default Simulator;
