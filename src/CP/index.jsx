import "./CP.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./CP.module.css";
import OrigamiLayer from "../SVG/Layers/OrigamiLayer";
import ParamLayer from "../SVG/Layers/ParamLayer";
import SolutionLayer from "../SVG/Layers/SolutionLayer";
import RulerLayer from "../SVG/Layers/RulerLayer";
import DebugLayer from "../SVG/Layers/DebugLayer";
// import SimulatorLayer from "./Layers/SimulatorLayer";

const CP = (props) => {
	let parentDiv;

	const svg = ear.svg().setClass("creasePattern").scale(1, -1);
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;
	const onmouseleave = props.onLeave;
	// "mouseenter", "mouseout", "mouseover"

	const origamiLayer = OrigamiLayer(svg);
	const paramLayer = ParamLayer(svg);
	const solutionLayer = SolutionLayer(svg);
	const rulerLayer = RulerLayer(svg);
	const debugLayer = DebugLayer(svg);
	// const simulatorLayer = SimulatorLayer(svg);

	const handleResize = () => {
		parentDiv.removeChild(svg);
		parentDiv.appendChild(svg);
	};

	onMount(() => {
		parentDiv.appendChild(svg);
		window.addEventListener("resize", handleResize);
		svg.addEventListener("mouseleave", onmouseleave);
		createEffect(() => {
			props.tool();
			props.views();
			props.showPanels();
			handleResize();
		});

		// origami layer
		createEffect(() => {
			const origami = props.origami();
			// this will also set the SVG viewBox
			origamiLayer.onChange({ origami });
			// get the newly calculated strokeWidth, populate it to other layers
			const strokeWidth = svg.getAttribute("stroke-width");
			paramLayer.strokeWidth(strokeWidth * 2);
			solutionLayer.strokeWidth(strokeWidth * 2)
				.strokeDasharray(`${strokeWidth * 2 * 1.25} ${strokeWidth * 2 * 2.5}`);
		});

		// param layer
		createEffect(() => {
			props.origami(); // to clear after reload
			const params = props.cpParams();
			const rect = props.rect();
			paramLayer.onChange({ params, rect });
		});

		// solution layer
		createEffect(() => {
			props.origami(); // to clear after reload
			const solutions = props.cpSolutions();
			const rect = props.rect();
			solutionLayer.onChange({ solutions, rect });
		});

		// debug layer
		createEffect(() => {
			const presses = props.cpPresses();
			const drags = props.cpDrags();
			const releases = props.cpReleases();
			const rect = props.rect();
			debugLayer.onChange({ presses, drags, releases, rect });
		});
		createEffect(() => {
			const showDebug = props.showDebugLayer();
			if (showDebug) { debugLayer.removeAttribute("display"); }
			else { debugLayer.setAttribute("display", "none"); }
		});

		// ruler layer
		createEffect(() => {
			const { Shift } = props.keyboardState();
			const pointer = props.cpPointer();
			rulerLayer.onChange({ Shift, pointer });
		});

		// // simulator layer
		// createEffect(() => {
		// 	const origami = props.origami();
		// 	const darkMode = props.darkMode();
		// 	const simulatorMove = props.simulatorMove();
		// 	const cpTouchState = props.cpTouchState();
		// 	const highlight = props.simulatorShowHighlights()
		// 	// debugLayer.clear();
		// 	rulerLayer.clear();
		// 	// toolLayer.clear();
		// 	simulatorLayer.onChange({ origami, darkMode, simulatorMove, cpTouchState, highlight });
		// });

	});

	onCleanup(() => {
		window.removeEventListener("resize", handleResize);
		svg.removeEventListener("mouseleave", onmouseleave);
		parentDiv.removeChild(svg);
	});

	return <div
		// class={props.showTerminal() ? `${Style.CP} ${Style.Top}` : `${Style.CP} ${Style.Center}`}
		class={`${Style.CP} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default CP;
