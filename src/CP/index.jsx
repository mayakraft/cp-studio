import "./CP.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./CP.module.css";
// import CPLayer from "./Layers/CPLayer";
// import ToolLayer from "../SVG/Layers/ToolLayer";
import ParamLayer from "../SVG/Layers/ParamLayer";
import SolutionLayer from "../SVG/Layers/SolutionLayer";
import RulerLayer from "../SVG/Layers/RulerLayer";
import DebugLayer from "../SVG/Layers/DebugLayer";
// import SimulatorLayer from "./Layers/SimulatorLayer";

const options = {
	vertices: false,
	viewBox: true,
	strokeWidth: 1/200,
};

const CP = (props) => {
	let parentDiv;

	const svg = ear.svg().setClass("creasePattern").scale(1, -1);
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;
	const onmouseleave = props.onLeave;
	// "mouseenter", "mouseout", "mouseover"

	// const origamiLayer = CPLayer(svg);
	const origamiLayer = svg.g().setClass("origami-layer");

	// const simulatorLayer = SimulatorLayer(svg);
	// const toolLayer = ToolLayer(svg);
	const paramLayer = ParamLayer(svg);
	const solutionLayer = SolutionLayer(svg);
	const rulerLayer = RulerLayer(svg);
	const debugLayer = DebugLayer(svg);

	// crease pattern layer
	createEffect(() => {
		const origami = props.origami();

		// this will also set the SVG viewBox
		origamiLayer.removeChildren();
		ear.graph.svg.drawInto(origamiLayer, origami, options);

		// move the calculated stroke width to the top SVG element
		// and use this value to update style on other layers too.
		const strokeWidth = origamiLayer.getAttribute("stroke-width");
		origamiLayer.removeAttribute("stroke-width");
		svg.padding(strokeWidth * 5)
			.strokeWidth(strokeWidth);

		solutionLayer
			.strokeWidth(strokeWidth * 2)
			.strokeDasharray(`${strokeWidth * 2 * 1.25} ${strokeWidth * 2 * 2.5}`);

		paramLayer.strokeWidth(strokeWidth * 2);
		// if (origamiLayer.edges) {
		// 	Array.from(origamiLayer.edges.childNodes)
		// 		.forEach(el => el.removeAttribute("stroke"));
		// }
	});

	// // tool layer and crease pattern modification
	// createEffect(() => {
	// 	const origami = props.origami();
	// 	const tool = props.tool();
	// 	const pointer = props.cpPointer();
	// 	const presses = props.cpPresses();
	// 	const drags = props.cpDrags();
	// 	const releases = props.cpReleases();
	// 	const vertexSnapping = props.vertexSnapping();
	// 	// const cpSolutions = props.cpSolutions();
	// 	// const transformOrigin = props.transformOrigin();
	// 	// const transformTranslate = props.transformTranslate();
	// 	// const transformRotate = props.transformRotate();
	// 	// const transformScale = props.transformScale();
	// 	toolLayer.onChange({
	// 		origami,
	// 		tool,
	// 		pointer,
	// 		presses,
	// 		drags,
	// 		releases,
	// 		vertexSnapping,
	// 	});
	// });

	// param layer
	createEffect(() => {
		const params = props.cpParams();
		const rect = props.rect();
		paramLayer.onChange({ params, rect });
	});

	// solution layer
	createEffect(() => {
		const solutions = props.cpSolutions();
		const rect = props.rect();
		solutionLayer.onChange({ solutions, rect });
	});

	// debug layer
	createEffect(() => {
		const presses = props.cpPresses();
		const drags = props.cpDrags();
		const releases = props.cpReleases();
		debugLayer.onChange({ presses, drags, releases });
	});
	createEffect(() => {
		const showDebug = props.showDebugLayer();
		if (showDebug) { debugLayer.removeAttribute("display"); }
		else { debugLayer.setAttribute("display", "none"); }
	});

	// ruler layer
	createEffect(() => {
		const { Shift } = props.keyboardState();
		const cpPointer = props.cpPointer();
		rulerLayer.onChange({ Shift, cpPointer });
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
