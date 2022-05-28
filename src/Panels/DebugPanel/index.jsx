import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import { stringifyPoint } from "../../Helpers";

const DebugPanel = (props) => {

	const StringifyKeys = (object) => {
		const keys = Object.keys(object);
		keys.forEach((_, i) => { if (keys[i] === " ") { keys[i] = "Space" } });
		return keys.join(" ");
	};

	const Keyboard = (props) => {
		return (<div>
			<p>keyboard: <b>{StringifyKeys(props.keyboardState())}</b></p>
		</div>);
	};

	const SVGTouch = (props) => (<div>
		<p>hover: {stringifyPoint(touch.hover)}</p>
		<p>presses: {touch.presses.length}</p>
		<p>moves: {touch.moves.length}</p>
		<p>releases: {touch.releases.length}</p>
		<p>params: {touch.params ? touch.params.length : "0"}</p>
	</div>);

	const SimulatorTouch = (props) => (<div>
		<p>hover: {touch.length}</p>
		<ol>
			<For each={touch}>
				{(el) => <li>v: {el.vertex} f: {el.face}</li>}
			</For>
		</ol>
	</div>);

	return (
		<Panel
			title="Debug"
			isCollapsed={props.isCollapsed}
			setIsCollapsed={props.setIsCollapsed}>
			<p>tool: <b>{props.tool()}</b></p>
			<Show when={props.keyboardState}>
				<Keyboard keyboardState={props.keyboardState} />
				<hr />
			</Show>
			<Show when={props.cpTouchState}>
				<h4>crease pattern</h4>
				<SVGTouch touch={props.cpTouchState()} />
				<hr />
			</Show>
			<Show when={props.diagramTouchState}>
				<h4>diagram</h4>
				<SVGTouch touch={props.diagramTouchState()} />
				<hr />
			</Show>
			<Show when={props.simulatorTouchState}>
				<h4>simulator</h4>
				<SimulatorTouch touch={props.simulatorTouchState()} />
				<hr />
			</Show>
			<button>repair cp</button>
		</Panel>
	);
};

export default DebugPanel;
