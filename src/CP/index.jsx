import "./CP.css";
import ear from "rabbit-ear";
import { onMount, onCleanup, createEffect } from "solid-js";
import Style from "./CP.module.css";
// import CPLayer from "./Layer/CPLayer";
// import ToolLayer from "./Layer/ToolLayer";
// import RulerLayer from "./Layer/RulerLayer";
// import DebugLayer from "./Layer/DebugLayer";
// import SimulatorLayer from "./Layer/SimulatorLayer";

const cpStyle = {
	vertices: { fill: "none", stroke: "none" },
};

const CP = (props) => {
	let parentDiv;

	const svg = ear.svg();
	svg.onPress = props.onPress;
	svg.onMove = props.onMove;
	svg.onRelease = props.onRelease;

	// const origamiLayer = CPLayer(svg);
	const origamiLayer = svg.g().strokeWidth(0.01);

	// const simulatorLayer = SimulatorLayer(svg);
	// const toolLayer = ToolLayer(svg);
	// const rulerLayer = RulerLayer(svg);
	// // const debugLayer = DebugLayer(svg);

	createEffect(() => svg.size(1,1));

	// crease pattern layer
	createEffect(() => {
		const cp = props.cp();
		const box = ear.math.bounding_box(cp.vertices_coords);
		const vmin = Math.min(box.span[0], box.span[1]);
		svg.size(box.min[0], box.min[1], box.span[0], box.span[1])
			.clearTransform()
			.scale(1, -1)
			.padding(vmin / 50)
			.strokeWidth(vmin / 200);
		// origamiLayer.onChange({ cp });
		origamiLayer.removeChildren();
		const origami = origamiLayer.origami(cp, cpStyle);
		origami.removeAttribute("stroke-width");
		if (origami.edges) {
			Array.from(origami.edges.childNodes)
				.forEach(el => el.removeAttribute("stroke"));
		}
	});

	// // tool layer and crease pattern modification
	// createEffect(() => {
	// 	const cp = props.cp();
	// 	const tool = props.tool();
	// 	const cpSolutions = props.cpSolutions();
	// 	const vertexSnapping = props.vertexSnapping();
	// 	const transformOrigin = props.transformOrigin();
	// 	const transformTranslate = props.transformTranslate();
	// 	const transformRotate = props.transformRotate();
	// 	const transformScale = props.transformScale();
	// 	const cpTouchState = props.cpTouchState();
	// 	const diagramTouchState = props.diagramTouchState();
	// 	const simulatorMove = props.simulatorMove();
	// 	toolLayer.onChange({
	// 		cp,
	// 		tool,
	// 		cpTouchState,
	// 		diagramTouchState,
	// 		simulatorMove,
	// 		cpSolutions,
	// 		vertexSnapping,
	// 		transformOrigin,
	// 		transformTranslate,
	// 		transformRotate,
	// 		transformScale,
	// 	});
	// });

	// debug layer
	// createEffect(() => {
	// 	const cpTouchState = props.cpTouchState();
	// 	const darkMode = props.darkMode();
	// 	simulatorLayer.clear();
	// 	debugLayer.onChange({ cpTouchState, darkMode });
	// });

	// // ruler layer
	// createEffect(() => {
	// 	const darkMode = props.darkMode();
	// 	const { Shift } = props.keyboardState();
	// 	const cpTouchState = props.cpTouchState();
	// 	rulerLayer.onChange({ darkMode, Shift, cpTouchState });
	// });

	// // simulator layer
	// createEffect(() => {
	// 	const cp = props.cp();
	// 	const darkMode = props.darkMode();
	// 	const simulatorMove = props.simulatorMove();
	// 	const cpTouchState = props.cpTouchState();
	// 	const highlight = props.simulatorShowHighlights()
	// 	// debugLayer.clear();
	// 	rulerLayer.clear();
	// 	// toolLayer.clear();
	// 	simulatorLayer.onChange({ cp, darkMode, simulatorMove, cpTouchState, highlight });
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
		class={props.showTerminal() ? `${Style.CP} ${Style.Top}` : `${Style.CP} ${Style.Center}`}
		ref={parentDiv}>
	</div>;
};

export default CP;
