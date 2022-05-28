import "./SimulatorPanel.css";
import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";

const preferenceCollapseKeys = ["panels", "simulatorPanelCollapsed"];

const SimulatorPanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));
	createEffect(() => setPreference(preferenceCollapseKeys, isCollapsed()));

	return (
		<Panel
			title="Simulator"
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<div class="button-row">
				<input
					type="checkbox"
					class="high-energy"
					id="checkbox-simulator-on"
					checked={props.simulatorOn()}
					oninput={e => props.setSimulatorOn(e.target.checked)}
				/><label for="checkbox-simulator-on">On</label>
				<input
					type="range"
					min="0.0"
					max="1.0"
					value={props.simulatorFoldAmount()}
					step="0.001"
					disabled={!props.simulatorOn()}
					oninput={e => props.setSimulatorFoldAmount(e.target.value)}
				/>
			</div>
			<div>
				<input
					type="checkbox"
					id="checkbox-simulator-strain"
					checked={props.simulatorStrain()}
					oninput={e => props.setSimulatorStrain(e.target.checked)}
				/><label for="checkbox-simulator-strain">Strain</label>
			</div>
			<div>
				<input
					type="checkbox"
					id="checkbox-simulator-highlight"
					checked={props.simulatorShowHighlights()}
					oninput={e => props.setSimulatorShowHighlights(e.target.checked)}
				/><label for="checkbox-simulator-highlight">Highlight</label>
			</div>
		</Panel>
	);
};

export default SimulatorPanel;
