import "./Simulator.css";
import {
	createSignal,
	createEffect,
	onMount,
	onCleanup,
} from "solid-js";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import OrigamiSimulator from "./origami-simulator/";
import * as Materials from "./Materials";
// only needed for fold-angle set
// import ear from "rabbit-ear";

// calculate the size of the crease pattern
const getVmin = (graph) => {
	const mins = Array.from(Array(graph.vertices_coords[0].length)).map(() => Infinity);
	const maxs = Array.from(Array(graph.vertices_coords[0].length)).map(() => -Infinity);
	graph.vertices_coords.forEach(pt => {
		mins.forEach((min, i) => { if (pt[i] < min) { mins[i] = pt[i]; }});
		maxs.forEach((max, i) => { if (pt[i] > max) { maxs[i] = pt[i]; }});
	});
	return maxs
		.map((_, i) => maxs[i] - mins[i])
		.sort((a, b) => a - b)
		.shift();
};

// intensity of point lights for light and dark mode
const lightIntensityLightMode = 0.45;
const lightIntensityDarkMode = 0.707;

const Simulator = (props) => {

	const [foldAmount, setFoldAmount] = createSignal(0.5);
	const [strain, setStrain] = createSignal(false);
	const [isActive, setIsActive] = createSignal(true);

	// origami simulator
	let simulator;
	// threejs
	let renderer, scene, camera, lights, trackballControls;
	// parent DIV
	let parentDiv;
	// reference to animation frame loop
	let animationID;
	// raycaster
	let raycaster, raycasterPlane;
	// visualizations due to raycaster
	let raycasterPoint, raycasterVertex, raycasterFace;
	// todo: idea- duplicate highlighted vertex, one obeys depthTest with full
	// opacity, the other is always visible with half opacity.

	const setupScene = (vmin = 1) => {
		const width = parentDiv.clientWidth;
		const height = parentDiv.clientHeight;
		renderer = new THREE.WebGLRenderer({ antialias: true });
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, width / height, vmin / 100, vmin * 100);
		trackballControls = new TrackballControls(camera, parentDiv);
		simulator = OrigamiSimulator({
			renderer: renderer,
			scene: scene,
			camera: camera,
		});

		// dragControls.nodePositionsDidChange = () => {
		// 	simulator.modelDidChange();
		// };

		trackballControls.rotateSpeed = 4;
		trackballControls.zoomSpeed = 12;
		trackballControls.panSpeed = 4;
		trackballControls.dynamicDampingFactor = 1;
		trackballControls.maxDistance = vmin * 30;
		trackballControls.minDistance = vmin * 0.1;

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
		// this scalar relates to the FOV
		camera.position.z = width > height
			? vmin * 1.3333
			: vmin * 1.3333 * (height / width);
		camera.lookAt(0, 0, 0);
		camera.up = new THREE.Vector3(0, 1, 0);

		parentDiv.appendChild(renderer.domElement);

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

		// optional scene decoration
		// const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 8, 8));
		// plane.material = new THREE.MeshBasicMaterial({
		// 	side: THREE.DoubleSide,
		// 	color: 0x115588
		// });
		// scene.add(plane);

		renderer.domElement.addEventListener("mousemove", raycasterMoveHandler, false);

		simulator.load(props.cp());
	};

	const setupLighting = (vmin = 1) => {
		const radius = vmin * 10;
		// octahedral arrangement
		// lights = [[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]]
		// cube arrangement
		lights = [
			[1, 1, 1],
			[1, 1, -1],
			[1, -1, 1],
			[1, -1, -1],
			[-1, 1, 1],
			[-1, 1, -1],
			[-1, -1, 1],
			[-1, -1, -1],
		].map(vec => vec.map(n => n * radius))
		.map(vec => {
			const light = new THREE.PointLight();
			light.position.set(...vec);
			return light;
		});
		lights.forEach(light => scene.add(light));
	};

	// setup (or re-apply) all mesh materials, like when switching to dark mode.
	const setupStyle = (darkMode) => {
		if (darkMode) {
			scene.background = new THREE.Color("#0F0F10");
			simulator.model.materials.front = Materials.materialDarkFront;
			simulator.model.materials.back = Materials.materialDarkBack;
			raycasterFace.material = [
				Materials.materialHighlightFrontDark,
				Materials.materialHighlightBackDark,
			];
			raycasterPoint.material = Materials.materialRaycastPointDark;
			raycasterVertex.material = Materials.materialHighlightVertexDark;
			Object.keys(simulator.model.lines).forEach(key => {
				simulator.model.lines[key].material = Materials.materialDarkLine
			});
			lights.forEach(light => { light.intensity = lightIntensityDarkMode; });
			simulator.strain = strain();
		} else {
			scene.background = new THREE.Color("#eee");
			simulator.model.materials.front = Materials.materialLightFront;
			simulator.model.materials.back = Materials.materialLightBack;
			raycasterPoint.material = Materials.materialRaycastPointLight;
			raycasterVertex.material = Materials.materialHighlightVertexLight;
			raycasterFace.material = [
				Materials.materialHighlightFrontLight,
				Materials.materialHighlightBackLight,
			];
			Object.keys(simulator.model.lines).forEach(key => {
				simulator.model.lines[key].material = Materials.materialLightLine
			});
			lights.forEach(light => { light.intensity = lightIntensityLightMode; });
			simulator.strain = strain();
		}
	};

	const setupLoop = () => {
		const animate = () => {
			animationID = window.requestAnimationFrame(animate);
			trackballControls.update();
			// if the simulator is on (more precisely, the fold percentage
			// is changing), we need to update the highlighted vertices/faces.
			if (simulator.isOn) {
				highlightTouch(calculateTouches()[0]);
			}
			renderer.render(scene, camera);
		};
		animate();
	};

	const raycasterMoveHandler = (event) => {
		const bounds = renderer.domElement.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - bounds.x) / bounds.width) * 2 - 1,
			-((event.clientY - bounds.y) / bounds.height) * 2 + 1
		);
		raycaster.setFromCamera(mouse, camera);
		const touches = calculateTouches();
		// console.log("touches", touches);
		highlightTouch(touches[0]);
		props.setSimulatorTouch(touches);
	};

	const calculateTouches = () => {
		// simulator must have a model loaded
		if (!simulator.model) { return []; }
		const intersections = raycaster
			.intersectObjects([simulator.model.frontside, simulator.model.backside]);
		const date = Date.now();
		// for every intersection point, calculate a few more properties
		intersections.forEach(touch => {
			touch.date = date;
			// the face being touched
			touch.face_vertices = [touch.face.a, touch.face.b, touch.face.c];
			touch.material = touch.face.materialIndex;
			touch.normal = touch.face.normal;
			touch.face = touch.faceIndex;
			touch.hover = touch.point;
			delete touch.faceIndex;
			// delete touch.point;
			// for the face being touched, calculate the distances from
			// the touch point to each of the triangle's points
			touch.touch_face_vertices_distance = touch.face_vertices
				.map(f => [0, 1, 2].map(n => simulator.model.positions[f * 3 + n]))
				.map(v => new THREE.Vector3(...v))
				.map(p => p.distanceTo(touch.point));
			// find the nearest vertex in the graph to the touch point
			const nearestFaceVertex = touch.touch_face_vertices_distance
				.map((d, i) => ({ d, i }))
				.sort((a, b) => a.d - b.d)
				.map(el => el.i)
				.shift();
			touch.vertex = touch.face_vertices[nearestFaceVertex];
			// get the nearest vertex's coords (in 3D)
			touch.vertex_coords = new THREE.Vector3(
				simulator.model.positions[touch.vertex * 3 + 0],
				simulator.model.positions[touch.vertex * 3 + 1],
				simulator.model.positions[touch.vertex * 3 + 2]);
		});
		return intersections;
	};
	
	const highlightTouch = (nearest) => {
		raycasterPoint.visible = false;
		raycasterVertex.visible = false;
		raycasterFace.visible = false;
		if (nearest === undefined || !props.simulatorShowHighlights()) {
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

	const handleWindowResize = () => {
		if (!parentDiv) { return; }
		// okay get rid of this. we need to cache the current radius
		// so that it doesn't reset all the time
		const vmin = getVmin(props.cp());

		parentDiv.removeChild(renderer.domElement);
		const width = parentDiv.clientWidth;
		const height = parentDiv.clientHeight;
		parentDiv.appendChild(renderer.domElement);
		renderer.setSize(width, height);
		const prevLength = camera.position.length();
		const newLength = width > height
			? 1.3333 * vmin
			: 1.3333 * vmin * (height / width);
		camera.position.setLength(newLength)
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		trackballControls.handleResize();
	};

	onMount(() => {
		const vmin = getVmin(props.cp());
		setupScene(vmin);
		setupLighting(vmin);
		setupLoop();
		window.addEventListener("resize", handleWindowResize);

		createEffect(() => {
			props.tool();
			props.showPanels();
			handleWindowResize();
		});
		createEffect(() => simulator.load(props.cp()));
		createEffect(() => setupStyle(props.darkMode()));
		createEffect(() => {
			props.simulatorOn() ? simulator.start() : simulator.stop();
		});
		createEffect(() => {
			simulator.strain = props.simulatorStrain();
		});
		createEffect(() => {
			simulator.foldAmount = props.simulatorFoldAmount();
		});
	});

	onCleanup(() => {
		window.removeEventListener("resize", handleWindowResize);
		window.cancelAnimationFrame(animationID);
		simulator.dealloc();
		renderer.renderLists.dispose();
		renderer.dispose();
		camera = null;
		trackballControls.dispose();
		parentDiv.removeChild(renderer.domElement);
	});

	return (<>
		<div class="Simulator" ref={parentDiv} />
	</>);
};

export default Simulator;
