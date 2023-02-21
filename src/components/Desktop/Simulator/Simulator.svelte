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
	import TrackballView from "./ThreeJS/TrackballView.svelte";
	import OrigamiSimulator from "../../../lib/OrigamiSimulator/index.js";
	import Highlights from "../../../lib/OrigamiSimulator/touches/highlights.js";
	import Raycasters from "../../../lib/OrigamiSimulator/touches/raycasters.js";
	import boundingBox from "../../../lib/OrigamiSimulator/fold/boundingBox.js";
	import {
		active,
		foldAmount,
		strain,
		showTouches,
		showShadows,
		tool,
		integration,
		axialStiffness,
		faceStiffness,
		joinStiffness,
		creaseStiffness,
		dampingRatio,
		error,
		reset,
	} from "../../../stores/Simulator.js";

	export let origami = {};

	export let backgroundColor = "#eee";
	export let frontColor = "#ec008b";
	export let backColor = "white";
	export let lineColor = "black";
	export let lineOpacity = 0.5;
	// export let reset;
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
	// "touches" are the current position of the cursor and where the raycaster
	// has intersected the origami mesh, nearest vertex/face, etc..
	let touches = [];
	// origami simulator
	let simulator = OrigamiSimulator();
	// all raycaster methods for the user interface
	let raycasters;
	// highlighted geometry indicating the selected vertex/face
	let highlights = Highlights({ simulator });
	// three.js
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
		error.set(props.error);
		// The raycaster will update on a mousemove event, but if the origami is
		// in a folding animation, the raycaster will not update and the visuals
		// will mismatch, hence, the raycaster can fire on a frame update if needed
		raycasters.animate({ pullEnabled: $tool === "pull" });
	};
	/**
	 * @description This is the callback from ThreeView after three.js has
	 * finished initializing. This is not the JS framework's builtin function.
	 */
	const didMount = ({ renderer, scene: _scene, camera: _camera }) => {
		scene = _scene;
		camera = _camera;
		// initialize origami simulator
		// simulator = OrigamiSimulator({ scene, onCompute });
		// highlights = Highlights({ scene, simulator });
		simulator.setScene(scene);
		simulator.setOnCompute(onCompute);
		highlights.setScene(scene);
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
	$: {
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
	$: reset.set(simulator.reset);	
	/**
	 * origami simulator settings from the Svelte store
	 */
	$: simulator.setActive($active);
	$: simulator.setFoldAmount($foldAmount);
	$: simulator.setStrain($strain);
	$: simulator.setIntegration($integration);
	$: simulator.setAxialStiffness($axialStiffness);
	$: simulator.setFaceStiffness($faceStiffness);
	$: simulator.setJoinStiffness($joinStiffness);
	$: simulator.setCreaseStiffness($creaseStiffness);
	$: simulator.setDampingRatio($dampingRatio);
	// shadows
	$: simulator.setShadows($showShadows);
	$: [0, 3, 4, 7].forEach(i => {
		lights[i % lights.length].castShadow = $showShadows
	});
	// deliver the touch data from the raycaster to be highlighted
	$: $showTouches
		? highlights.highlightTouch(touches[0])
		: highlights.clear();
	/**
	 * origami simulator settings from the component props
	 */
	$: simulator.setFrontColor(frontColor);
	$: simulator.setBackColor(backColor);
	$: simulator.setLineColor(lineColor);
	// $: simulator.materials.line.opacity = lineOpacity;
	$: simulator.getMaterials().line.opacity = lineOpacity;
	$: if (scene) { scene.background = new THREE.Color(backgroundColor); }
	// nitpicky. upon tool change we need raycasterPullVertex to be undefined
	$: if (raycasters) { raycasters.raycasterReleaseHandler($tool); }
	/**
	 * @description cleanup all memory associated with origami simulator
	 */
	onDestroy(() => {
		if (raycasters) { raycasters.dealloc(); }
		if (simulator) { simulator.dealloc(); }
		// needs highlights dealloc
	});
</script>

<TrackballView
	enabled={$tool !== "pull"}
	maxDistance={modelSize * 30}
	minDistance={modelSize * 0.1}
	panSpeed={1}
	rotateSpeed={4}
	zoomSpeed={16}
	dynamicDampingFactor={1}
	didMount={didMount}
/>
