import "./CP.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./CP.module.css";
// import CPLayer from "./Layers/CPLayer";
// import ToolLayer from "../SVG/Layers/ToolLayer";
import ParamLayer from "../SVG/Layers/ParamLayer";
import RulerLayer from "../SVG/Layers/RulerLayer";
import DebugLayer from "../SVG/Layers/DebugLayer";
// import SimulatorLayer from "./Layers/SimulatorLayer";

const cpStyle = {
	vertices: { fill: "none", stroke: "none" },
};

const CP = (props) => {
	let parentDiv;

	const svg = ear.svg();
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;
	const onmouseleave = props.onLeave;
	// "mouseenter", "mouseout", "mouseover"

	// const origamiLayer = CPLayer(svg);
	const origamiLayer = svg.g().strokeWidth(0.01);

	// const simulatorLayer = SimulatorLayer(svg);
	// const toolLayer = ToolLayer(svg);
	const paramLayer = ParamLayer(svg);
	const rulerLayer = RulerLayer(svg);
	const debugLayer = DebugLayer(svg);

	createEffect(() => svg.size(1, 1));

	// crease pattern layer
	createEffect(() => {
		const origami = props.origami();
		const box = ear.math.bounding_box(origami.vertices_coords);
		const vmin = Math.min(box.span[0], box.span[1]);

		origamiLayer.strokeWidth(vmin / 100);

		svg.size(box.min[0], box.min[1], box.span[0], box.span[1])
			.clearTransform()
			.scale(1, -1)
			.padding(vmin / 50)
			.strokeWidth(vmin / 100);
		// origamiLayer.onChange({ origami });
		origamiLayer.removeChildren();
		const origamiGroup = origamiLayer.origami(origami, cpStyle);
		origamiGroup.removeAttribute("stroke-width");
		if (origamiGroup.edges) {
			Array.from(origamiGroup.edges.childNodes)
				.forEach(el => el.removeAttribute("stroke"));
		}
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
		paramLayer.onChange({ params });
	});

	// debug layer
	createEffect(() => {
		const presses = props.cpPresses();
		const drags = props.cpDrags();
		const releases = props.cpReleases();
		debugLayer.onChange({ presses, drags, releases });
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
		class={props.showTerminal() ? `${Style.CP} ${Style.Top}` : `${Style.CP} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default CP;
