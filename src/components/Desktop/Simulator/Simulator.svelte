<!-- 
	Origami Simulator for Svelte (c) Kraft
	MIT license
 -->

<!-- 
	@component
	Svelte component and interface for Origami Simulator by Amanda Ghassaei.
	@props
	These props are hard coded into the app and are currently required:
	- props.origami (the origami model in FOLD format)
	- props.active (the active state of the folding engine, on or off)
	- props.foldAmount (the amount the model is folded, 0.0 - 1.0)
	- props.strain (override the material to show strain forces)
	- props.tool (the UI tool, currently there are two: "trackball", "pull")
	- props.showTouches (highlight the vertex/face underneath the cursor)
	- props.showShadows (turn on three.js shadows)
	new ones
	- props.reset (reset the vertices of the origami model)
 -->
<script>
	import { onDestroy } from "svelte";
	import * as THREE from "three";
	import TrackballView from "./WebGL/TrackballView.svelte";
	import OrigamiSimulator from "../../../lib/OrigamiSimulator/index.js";
	import Highlights from "../../../lib/OrigamiSimulator/touches/highlights.js";
	import Raycasters from "../../../lib/OrigamiSimulator/touches/raycasters.js";
	import boundingBox from "../../../lib/OrigamiSimulator/fold/boundingBox.js";

	import craneCP from "../../../examples/crane-cp.fold?raw";

	export let origami = JSON.parse(craneCP);
	export let active = false;
	export let foldAmount = 0.0;
	export let strain;
	export let tool = "trackball";
	export let showTouches = true;
	export let showShadows = false;
	export let backgroundColor;
	export let frontColor;
	export let backColor;
	export let lineColor;
	export let lineOpacity = 0.5;
	export let integration;
	export let axialStiffness;
	export let faceStiffness;
	export let joinStiffness;
	export let creaseStiffness;
	export let dampingRatio;
	export let error;
	export let reset;
	export let exportModel;
	// intensity of point lights for light and dark mode
	const lightIntensityLightMode = 0.45;
	const lightIntensityDarkMode = 0.707;
	// octahedron
	// const lightVertices = [[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]];
	// cube
	const lightVertices = [
		[+1, +1, +1],
		[-1, +1, +1],
		[+1, -1, +1],
		[-1, -1, +1],
		[+1, +1, -1],
		[-1, +1, -1],
		[+1, -1, -1],
		[-1, -1, -1],
	];
	// model size will update the position of the lights, camera, and
	// trackball controlls, allowing for models to be of vastly different scales
	let modelSize = 1;
	// the following are mutually exclusive, and activated/deactivated
	// based on which UI tool is currently selected.
	let trackballEnabled = true;
	let pullNodesEnabled = false;
	// "touches" are the current position of the cursor and where the raycaster
	// has intersected the origami mesh, nearest vertex/face, etc..
	let touches = [];
	// origami simulator
	let simulator;
	// all raycaster methods for the user interface
	let raycasters;
	// highlighted geometry indicating the selected vertex/face
	let highlights;
	//
	let scene;
	let camera;
	// three.js lights for this scene
	let lights = lightVertices.map(pos => {
		const light = new THREE.PointLight();
		light.position.set(...pos);
		light.intensity = 0.5;
		light.distance = 0;
		light.decay = 2;
		light.castShadow = false;
		light.shadow.mapSize.width = 512; // default
		light.shadow.mapSize.height = 512; // default
		return light;
	});
	/**
	 * @description Origami Simulator solver just executed. This is attached
	 * to the window.requestAnimationFrame and will fire at the end of every loop
	 */
	const onCompute = (props) => {
		error = props.error;
		// The raycaster will update on a mousemove event, but if the origami is
		// in a folding animation, the raycaster will not update and the visuals
		// will mismatch, hence, the raycaster can fire on a frame update if needed
		raycasters.animate({ pullEnabled: pullNodesEnabled });
	};
	/**
	 * @description This is the callback from ThreeView after three.js has
	 * finished initializing. This is not the JS framework's builtin function.
	 */
	const didMount = ({ renderer, scene: _scene, camera: _camera }) => {
		scene = _scene;
		camera = _camera;
		// initialize origami simulator
		simulator = OrigamiSimulator({ scene, onCompute });
		highlights = Highlights({ scene, simulator });
		raycasters = Raycasters({
			renderer,
			camera,
			simulator,
			setTouches: t => { touches = t; },
		});
		lights.forEach(light => scene.add(light));
		exportModel = simulator.export;
	};

	// load a new origami model. thrown errors are because of a bad file format
	$: if (simulator) {
		try {
			simulator.load(origami);
			const box = boundingBox(origami);
			modelSize = box ? Math.max(...box.span) : 1;
		} catch (error) {
			window.alert(error);
		}
	}

	// on model change, update camera position
	$: if (camera) {
		// scale is due to the camera's FOV
		const scale = 1.25;
		// the distance the camera should be to nicely fit the object
		const fitLength = camera.aspect > 1
			? modelSize * scale
			: modelSize * scale * (1 / camera.aspect);
		const length = fitLength / camera.position.length();
		camera.position.multiplyScalar(length);
		camera.lookAt(0, 0, 0);
		camera.far = modelSize * 100;
		camera.near = modelSize / 100;
	}

	// on model change, update the position of the lights
	$: {
		const radius = modelSize * Math.SQRT1_2;
		// todo, might need these inside the initialize method
		lights.forEach((light, i) => {
			light.position.set(...lightVertices[i % lightVertices.length]);
			light.position.setLength(radius);
			light.shadow.camera.near = radius / 10; // 0.5 default
			light.shadow.camera.far = radius * 10; // 500 default
		});
	}
	// tool -> what happens when cursor is pressed
	$: {
		trackballEnabled = (tool !== "pull");
		pullNodesEnabled = (tool === "pull");
	}
	// forward these props to settings of origami simulator
	$: if (simulator) { simulator.setActive(active); }
	$: if (simulator) { simulator.setStrain(strain); }
	$: if (simulator) { simulator.setFoldAmount(foldAmount); }
	$: if (scene) { scene.background = new THREE.Color(backgroundColor); }
	$: if (simulator) { simulator.setFrontColor(frontColor); }
	$: if (simulator) { simulator.setBackColor(backColor); }
	$: if (simulator) { simulator.setLineColor(lineColor); }
	// $: if (simulator) { simulator.materials.line.opacity = lineOpacity; }
	$: if (simulator) { simulator.getMaterials().line.opacity = lineOpacity; }
	$: if (simulator) { simulator.setIntegration(integration); }
	$: if (simulator) { simulator.setAxialStiffness(axialStiffness); }
	$: if (simulator) { simulator.setFaceStiffness(faceStiffness); }
	$: if (simulator) { simulator.setJoinStiffness(joinStiffness); }
	$: if (simulator) { simulator.setCreaseStiffness(creaseStiffness); }
	$: if (simulator) { simulator.setDampingRatio(dampingRatio); }
	// nitpicky. upon tool change we need raycasterPullVertex to be undefined
	$: if (raycasters) { raycasters.raycasterReleaseHandler(pullNodesEnabled); }
	// deliver the touch data from the raycaster to be highlighted
	$: if (highlights && showTouches) { highlights.highlightTouch(touches[0]); }
	$: if (highlights && !showTouches) { highlights.clear(); }
	// shadows
	$: if (simulator) {
		// todo: why does Svelte have an issue with the simulator getters defined
		// properties? querying simulator.active or simulator.materials causes reload
		// simulator.shadows = showShadows;
		simulator.setShadows(showShadows);
		[0, 3, 4, 7].forEach(i => {
			lights[i % lights.length].castShadow = showShadows;
		});
	}
	// upstream
	$: if (simulator) { reset = simulator.reset; }
	/**
	 * @description cleanup all memory associated with origami simulator
	 */
	onDestroy(() => {
		if (raycasters) { raycasters.dealloc(); }
		if (simulator) { simulator.dealloc(); }
	});
</script>

<div class="simulator">
	<TrackballView
		enabled={trackballEnabled}
		maxDistance={modelSize * 30}
		minDistance={modelSize * 0.1}
		panSpeed={1}
		rotateSpeed={4}
		zoomSpeed={16}
		dynamicDampingFactor={1}
		didMount={didMount}
	/>
</div>

<style>
	.simulator {
		width: 100%;
		height: 100%;
	}
</style>
