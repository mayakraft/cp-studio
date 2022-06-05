import "./Diagram.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./Diagram.module.css";
import OrigamiLayer from "../SVG/Layers/OrigamiLayer";
import ParamLayer from "../SVG/Layers/ParamLayer";
import SolutionLayer from "../SVG/Layers/SolutionLayer";
import RulerLayer from "../SVG/Layers/RulerLayer";
import DebugLayer from "../SVG/Layers/DebugLayer";
// import DiagramLayer from "./DiagramLayer";

const Diagram = (props) => {
	let parentDiv;

	const svg = ear.svg().setClass("foldedForm").scale(1, -1);
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;
	const onmouseleave = props.onLeave;

	const origamiLayer = OrigamiLayer(svg);
	const paramLayer = ParamLayer(svg);
	const solutionLayer = SolutionLayer(svg);
	const debugLayer = DebugLayer(svg);
	const rulerLayer = RulerLayer(svg);
	// const diagramLayer = DiagramLayer(svg);

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
		const params = props.diagramParams();
		const rect = props.rect();
		paramLayer.onChange({ params, rect });
	});

	// solution layer
	createEffect(() => {
		const solutions = props.diagramSolutions();
		const rect = props.rect();
		solutionLayer.onChange({ solutions, rect });
	});

	// debug layer
	createEffect(() => {
		const presses = props.diagramPresses();
		const drags = props.diagramDrags();
		const releases = props.diagramReleases();
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
		const pointer = props.diagramPointer();
		rulerLayer.onChange({ Shift, pointer });
	});

	// // tool layer and crease pattern modification
	// createEffect(() => {
	// 	const origami = props.origami();
	// 	const tool = props.tool();
	// 	const vertexSnapping = props.vertexSnapping();
	// 	const cpTouchState = props.cpTouchState();
	// 	const diagramTouchState = props.diagramTouchState();
	// 	const diagramSolutions = props.diagramSolutions();
	// 	toolLayer.onChange({
	// 		origami,
	// 		tool,
	// 		cpTouchState,
	// 		diagramTouchState,
	// 		diagramSolutions,
	// 		vertexSnapping,
	// 	});
	// });

	// // diagram layer and diagram instructions
	// createEffect(() => {
	// 	// const origami = props.origami();
	// 	const origami = props.origami();
	// 	const tool = props.tool();
	// 	const cpTouchState = props.cpTouchState();
	// 	const diagramTouchState = props.diagramTouchState();
	// 	const showDiagramInstructions = props.showDiagramInstructions();
	// 	const diagramSolutions = props.diagramSolutions();
	// 	const vertexSnapping = props.vertexSnapping();
	// 	diagramLayer.onChange({
	// 		origami,
	// 		tool,
	// 		cpTouchState,
	// 		diagramTouchState,
	// 		showDiagramInstructions,
	// 		diagramSolutions,
	// 		vertexSnapping,
	// 	});
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
		// class={props.showTerminal() ? `${Style.Diagram} ${Style.Top}` : `${Style.Diagram} ${Style.Center}`}
		class={`${Style.Diagram} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default Diagram;
