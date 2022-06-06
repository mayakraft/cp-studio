import { createSignal, createEffect } from "solid-js";
import ear from "rabbit-ear";
import Style from "./NewFilePopup.module.css";
import Popup from "./Popup";
import PopupWindow from "./PopupWindow";
import Dict from "../Localization/dictionary.json";
/**
 *
 */
const NewFilePopup = (props) => {
	const [showPolygon, setShowPolygon] = createSignal(false);
	const [showRectangle, setShowRectangle] = createSignal(false);

	// translation
	const [T, setT] = createSignal(s => s);
	createEffect(() => {
		const newT = (s) => Dict[s] && Dict[s][props.language()] ? Dict[s][props.language()] : s;
		setT(() => newT);
	});

	const loadCP = (cp) => {
		props.loadFile(cp);
		props.clickOff();
	};
	return (<Popup clickOff={props.clickOff}>
		<PopupWindow title={T()("new file")}>
			<div class="flex-row">
				<button onclick={() => loadCP(ear.cp.triangle())}>triangle</button>
				<button onclick={() => loadCP(ear.cp.unit_square())}>square</button>
				<button onclick={() => loadCP(ear.cp.hexagon())}>hexagon</button>
				<button onclick={() => { setShowPolygon(true); setShowRectangle(false); }}>polygon</button>
				<button onclick={() => { setShowRectangle(true); setShowPolygon(false); }}>rectangle</button>
			</div>

			<Show when={showPolygon()}>
				<hr />
				<h3>Regular Polygon</h3>
				<div class="flex-row">
					<input type="text" placeholder="sides"/>
					<input type="text" placeholder="radius"/>
				</div>
				<button onclick={() => loadCP(ear.cp.pentagon())}>okay</button>
			</Show>
			<Show when={showRectangle()}>
				<hr />
				<h3>Rectangle</h3>
				<div class="flex-row">
					<input type="text" placeholder="width"/>
					<input type="text" placeholder="height"/>
				</div>
				<button onclick={() => loadCP(ear.cp.rectangle(2,1))}>okay</button>
			</Show>
		</PopupWindow>
	</Popup>);
};

export default NewFilePopup;
