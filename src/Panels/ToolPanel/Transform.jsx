import { stringifyPoint } from "../../Helpers";

const TransformPanelTranslate = (props) => (<></>);

const TransformPanelRotate = (props) => (<>
	<p><b>rotate</b>: <input
		type="text"
		value={props.transformRotate()}
		onChange={() => {}}
	/></p>
	<p><b>rotate</b>: <input
		type="range"
		min="0.0"
		max="360.0"
		value={props.transformRotate()}
		step="0.1"
		oninput={(e) => props.setTransformRotate(e.target.value)}
	/></p>
</>);

const TransformPanelScale = (props) => (<></>);

// const Transform = (props) => (<>
// 	<div class="button-row">
// 		{["translate", "rotate", "scale"].map(type => <button
// 				class="radio"
// 				onclick={(e) => props.setTransformType(e.target.innerHTML)}
// 				highlighted={props.transformType() === type}
// 			>{type}</button>)}
// 	</div>
// 	<p><b>origin</b>: {stringifyPoint(props.transformOrigin())}</p>
// 	<p><input
// 		type="checkbox"
// 		id="transform-vertex-snapping-checkbox"
// 		checked={false}
// 		oninput={() => {}}
// 	/><label for="transform-vertex-snapping-checkbox">snap origin</label></p>
// 	<Switch fallback={<></>}>
// 		<Match when={props.transformType() === "translate"}>
// 			<TransformPanelTranslate />
// 		</Match>
// 		<Match when={props.transformType() === "rotate"}>
// 			<TransformPanelRotate
// 				transformRotate={props.transformRotate}
// 				setTransformRotate={props.setTransformRotate}
// 			/>
// 		</Match>
// 		<Match when={props.transformType() === "scale"}>
// 			<TransformPanelScale />
// 		</Match>
// 	</Switch>
// 	<button>apply</button>
// </>);

const Transform = (props) => (<></>);

export default Transform;
