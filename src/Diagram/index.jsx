import "./Diagram.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./Diagram.module.css";
// import ToolLayer from "./ToolLayer";
// import DiagramLayer from "./DiagramLayer";
import MakeFoldedForm from "../FOLD/MakeFoldedForm";

const diagramStyle = {
	vertices: { fill:"none", stroke:"none" },
};

const Diagram = (props) => {
	let parentDiv;

	const svg = ear.svg();
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;

	const origamiLayer = svg.g();
	// const toolLayer = ToolLayer(svg);
	// const diagramLayer = DiagramLayer(svg);

	createEffect(() => svg.size(1,1));

	// crease pattern layer
	createEffect(() => {
		const origami = MakeFoldedForm(props.cp());
		const box = ear.math.bounding_box(origami.vertices_coords);
		const vmin = Math.min(box.span[0], box.span[1]);

		// svg.size(-box.min[0], -box.min[1], box.span[0], box.span[1])
		svg.size(box.span[0], box.span[1])
			.clearTransform()
			.scale(1, -1)
			.padding(vmin / 20)
			.strokeWidth(vmin / 200);

		origamiLayer.removeChildren();
		origamiLayer.origami(origami, diagramStyle);
	});

	// // tool layer and crease pattern modification
	// createEffect(() => {
	// 	const origami = MakeFoldedForm(props.cp());
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
	// 	// const origami = MakeFoldedForm(props.cp());
	// 	const origami = props.cp();
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
		createEffect(() => {
			props.tool();
			props.views();
			props.showPanels();
			handleResize();
		});
	});

	onCleanup(() => {
		window.removeEventListener("resize", handleResize);
		parentDiv.removeChild(svg);
	});

	return <div
		class={props.showTerminal() ? `${Style.Diagram} ${Style.Top}` : `${Style.Diagram} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default Diagram;
