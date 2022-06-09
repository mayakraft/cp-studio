import { createSignal, createEffect } from "solid-js";
import ear from "rabbit-ear";
import Style from "./Examples.module.css";
import Popup from "./Popup";
import PopupWindow from "./PopupWindow";
import Dict from "../Localization/dictionary.json";
// import example from "../Files/square.fold?raw";
// import example from "../Files/example-animal-base.fold?raw";
import exampleSequence from "../Files/example-sequence.fold?raw";
/**
 *
 */
const ExamplesPopup = (props) => {
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
		<PopupWindow title={T()("examples")}>
			<div class="flex-row">
				<button onclick={() => loadCP(JSON.parse(exampleSequence))}>diagram sequence</button>
			</div>
		</PopupWindow>
	</Popup>);
};

export default ExamplesPopup;
