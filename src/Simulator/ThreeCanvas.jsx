import Style from "./ThreeCanvas.module.css";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { createEffect, onMount, onCleanup } from "solid-js";

/**
 * requirement (for now): implement props.requestResize()
 */
const ThreeCanvas = (props) => {
	let renderer, scene, camera, trackballControls;
	let parentDiv;
	let animationID;

	const setupSize = () => {
		const width = parentDiv.clientWidth;
		const height = parentDiv.clientHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		trackballControls.handleResize();
	};
	/**
	 * @param {number} vmax is the widest axis-aligned length of a model (to fit on screen)
	 * @param {boolean} reset the camera to align on the +Z axis, looking at the origin
	 * otherwise, this will still set the distance away from the camera, but along the existing axis.
	 */
	const setupCamera = (vmax = 1, reset = true) => {
		// the distance the camera should be to nicely fit the object (of size vmax)
		const fitLength = camera.aspect > 1
			? vmax * 1.3333
			: vmax * 1.3333 * (1 / camera.aspect);
		if (reset) {
			camera.position.set(0, 0, fitLength);
			camera.up = new THREE.Vector3(0, 1, 0);
		} else {
			const length = fitLength / camera.position.length();
			camera.position.x = camera.position.x * length;
			camera.position.y = camera.position.y * length;
			camera.position.z = camera.position.z * length;
		}
		camera.lookAt(0, 0, 0);
		camera.far = vmax * 100;
		camera.near = vmax / 100, 
		trackballControls.maxDistance = vmax * 30;
		trackballControls.minDistance = vmax * 0.1;
	};

	const setupThree = () => {
		renderer = new THREE.WebGLRenderer({ antialias: true });
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, 1 / 1, 0.1, 1000);
		trackballControls = new TrackballControls(camera, parentDiv);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		// THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap, THREE.VSMShadowMap
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		trackballControls.rotateSpeed = 4;
		trackballControls.zoomSpeed = 12;
		trackballControls.panSpeed = 4;
		trackballControls.dynamicDampingFactor = 1;
		setupSize();
		setupCamera();
		parentDiv.appendChild(renderer.domElement);
	};

	const setupLoop = () => {
		const animate = () => {
			animationID = window.requestAnimationFrame(animate);
			trackballControls.update();
			// animate is called right before the scene is rendered
			if (props.animate) { props.animate(); }
			renderer.render(scene, camera);
		};
		animate();
	};

	const handleResize = () => {
		parentDiv.removeChild(renderer.domElement);
		setupSize();
		setupCamera(1, false);
		parentDiv.appendChild(renderer.domElement);
	};

	onMount(() => {
		setupThree();
		setupLoop();
		window.addEventListener("resize", handleResize);

		createEffect(() => {
			props.requestResize();
			handleResize();
		});

		if (props.didMount) {
			props.didMount(renderer, scene, camera);
		}
	});

	onCleanup(() => {
		window.removeEventListener("resize", handleResize);
		window.cancelAnimationFrame(animationID);
		scene.clear();
		renderer.renderLists.dispose();
		renderer.dispose();
		camera = null;
		trackballControls.dispose();
		parentDiv.removeChild(renderer.domElement);
	});

	return <div class={Style.ThreeContainer} ref={parentDiv} />;
};

export default ThreeCanvas;
