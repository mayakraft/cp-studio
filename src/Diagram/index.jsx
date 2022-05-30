import "./Diagram.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./Diagram.module.css";
// import ToolLayer from "./ToolLayer";
import ParamLayer from "../SVG/Layers/ParamLayer";
import DebugLayer from "../SVG/Layers/DebugLayer";
// import DiagramLayer from "./DiagramLayer";

const diagramStyle = {
	vertices: { fill:"none", stroke:"none" },
};

const Diagram = (props) => {
	let parentDiv;

	const svg = ear.svg();
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;
	const onmouseleave = props.onLeave;

	const origamiLayer = svg.g();
	const paramLayer = ParamLayer(svg);
	const debugLayer = DebugLayer(svg);
	// const toolLayer = ToolLayer(svg);
	// const diagramLayer = DiagramLayer(svg);

	createEffect(() => svg.size(1,1));

	// crease pattern layer
	createEffect(() => {
		const origami = props.origami();
		const box = ear.math.bounding_box(origami.vertices_coords);
		const vmin = Math.min(box.span[0], box.span[1]);
		origamiLayer.strokeWidth(vmin / 100);
		// svg.size(-box.min[0], -box.min[1], box.span[0], box.span[1])
		svg.size(box.span[0], box.span[1])
			.clearTransform()
			.scale(1, -1)
			.padding(vmin / 20)
			.strokeWidth(vmin / 100);

		origamiLayer.removeChildren();
		origamiLayer.origami(origami, diagramStyle);
	});

	// param layer
	createEffect(() => {
		const params = props.diagramParams();
		paramLayer.onChange({ params });
	});

	// debug layer
	createEffect(() => {
		const presses = props.diagramPresses();
		const drags = props.diagramDrags();
		const releases = props.diagramReleases();
		debugLayer.onChange({ presses, drags, releases });
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
		class={props.showTerminal() ? `${Style.Diagram} ${Style.Top}` : `${Style.Diagram} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default Diagram;
