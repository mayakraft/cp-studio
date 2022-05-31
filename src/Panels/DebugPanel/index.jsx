import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import { stringifyPoint } from "../../Helpers";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";

const preferenceCollapseKeys = ["panels", "debugPanelCollapsed"];

const DebugPanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));
	createEffect(() => setPreference(preferenceCollapseKeys, isCollapsed()));

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

	const SimulatorTouch = (props) => {
		return (<>
			<h5>({stringifyPoint(props.touch.point, 2, ", ")})</h5>
			<ul>
				<li>vert {props.touch.vertex}, face {props.touch.face}</li>
				<li>({stringifyPoint(props.touch.vertex_coords, 3, ", ")})</li>
			</ul>
		</>);
	};

	return (
		<Panel
			title="Debug"
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<p>tool: <b>{props.tool()}</b></p>
			<Show when={props.keyboardState}>
				<Keyboard keyboardState={props.keyboardState} />
				<hr />
			</Show>
			
			<h4>crease pattern</h4>
			<p>pointer: <b>({stringifyPoint(props.cpPointer(), 3, ",")})</b></p>
			<p>presses: <b>{props.cpPresses().length}</b></p>
			<p>drags: <b>{props.cpDrags().length}</b></p>
			<p>releases: <b>{props.cpReleases().length}</b></p>
			<hr />
			
			<h4>diagram</h4>
			<p>pointer: <b>({stringifyPoint(props.diagramPointer(), 3, ",")})</b></p>
			<p>presses: <b>{props.diagramPresses().length}</b></p>
			<p>drags: <b>{props.diagramDrags().length}</b></p>
			<p>releases: <b>{props.diagramReleases().length}</b></p>
			<hr />

			<h4>simulator (<b>{props.simulatorPointers().length}</b>)</h4>
			<For each={props.simulatorPointers()}>{(touch) =>
				<SimulatorTouch touch={touch}/>
			}</For>
			<hr />

			<div class="flex-row">
				<input
					type="checkbox"
					id="checkbox-show-debug-layer"
					checked={props.showDebugLayer()}
					oninput={e => props.setShowDebugLayer(e.target.checked)}
				/><label for="checkbox-show-debug-layer">show debug layer</label>
			</div>

			<button>repair cp</button>
		</Panel>
	);
};

export default DebugPanel;
