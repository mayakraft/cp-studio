import { createSignal, createEffect } from "solid-js";
import Style from "./DiagramPanel.module.css";
import Panel from "../Panel";
import { stringifyPoint } from "../../Helpers";
import Minus from "../../images/minus-solid.svg";
import Plus from "../../images/plus-solid.svg";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";

const preferenceCollapseKeys = ["panels", "diagramPanelCollapsed"];

const DiagramPanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));
	createEffect(() => setPreference(preferenceCollapseKeys, isCollapsed()));

	const getDiagramInstructionString = (cp) => {
		if (cp.diagram_instruction) {
			if (cp.diagram_instruction.en) {
				return cp.diagram_instruction.en;
			}
		}
		return "";
	};

	const zipperDiagramArrows = (origami) => {
		if (!origami.diagram_arrows_coords) { return []; }
		const creaseClasses = origami.diagram_arrows_coords
			.map((_, i) => origami.diagram_arrows_classes && origami.diagram_arrows_classes.length
				? origami.diagram_arrows_classes[i] : []);
		return origami.diagram_arrows_coords
			.map((coords, i) => ({ coords, classes: creaseClasses[i] }));
	};

	const zipperDiagramCreases = (origami) => {
		if (!origami.diagram_creases_coords) { return []; }
		const creaseClasses = origami.diagram_creases_coords
			.map((_, i) => origami.diagram_creases_classes && origami.diagram_creases_classes.length
				? origami.diagram_creases_classes[i] : []);
		return origami.diagram_creases_coords
			.map((coords, i) => ({ coords, classes: creaseClasses[i] }));
	};

	const countDiagramCreases = (origami) => origami.diagram_creases_coords
		? origami.diagram_creases_coords.length
		: 0;
	const countDiagramArrows = (origami) => origami.diagram_arrows_coords
		? origami.diagram_arrows_coords.length
		: 0;

	const advanceStep = (change) => {
		const min = 0;
		const max = Math.max(0, props.fileFrames().length - 1);
		const newValue = Math.min(max, Math.max(min, props.fileFrameIndex() + change));
		props.setFileFrameIndex(newValue);
	};

	const insertStep = () => {
		const sequence = props.fileFrames();
		const stepNumber = props.fileFrameIndex();
		const cpCopy = JSON.parse(JSON.stringify(props.cp()));
		const newFoldSequence = [...sequence];
		newFoldSequence.splice(stepNumber, 0, cpCopy);
		props.setFileFrames(newFoldSequence);
		props.setFileFrameIndex(stepNumber + 1);
	};

	const appendStep = () => {
		const sequence = props.fileFrames();
		const cpCopy = JSON.parse(JSON.stringify(props.cp()));
		const newFoldSequence = [...sequence, cpCopy];
		props.setFileFrames(newFoldSequence);
		props.setFileFrameIndex(newFoldSequence.length - 1);
	};

	// const stepToolsDisabled = (sequence) => sequence && sequence.length > 1
	// 	? "enabled"
	// 	: "disabled";
	const stepToolsDisabled = (sequence) => !(sequence && sequence.length > 1);

	return (
		<Panel
			title="Diagrams"
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<div class={Style.DiagramPanel}>
				<p>step {props.fileFrameIndex() + 1}</p>
				<div class="flex-row">
					<button
						class={`${Style.ControlButton} ${Style.backwards}`}
						disabled={stepToolsDisabled(props.fileFrames())}
						onclick={() => advanceStep(-1)}></button>
					<input
						type="range"
						min="0"
						max={props.fileFrames().length - 1}
						value={props.fileFrameIndex()}
						step="1"
						disabled={stepToolsDisabled(props.fileFrames())}
						oninput={(e) => props.setFileFrameIndex(parseInt(e.target.value))} />
					<button
						class={`${Style.ControlButton} ${Style.forwards}`}
						disabled={stepToolsDisabled(props.fileFrames())}
						onclick={() => advanceStep(+1)}></button>
				</div>
				<div class="flex-row">
					<p>create step:</p>
					<button onclick={insertStep}>here</button>
					<button onclick={appendStep}>end</button>
				</div>
				<div class="flex-row">
					<button>remove step</button>
				</div>
				<hr />
				<div>
					<input
						type="checkbox"
						id="checkbox-show-diagram-instructions"
						checked={props.showDiagramInstructions()}
						oninput={e => props.setShowDiagramInstructions(e.target.checked)}
						/><label for="checkbox-show-diagram-instructions">show instructions</label>
				</div>
				<hr />
				<p><b>{getDiagramInstructionString(props.cp())}</b></p>
				<hr />
				<div class="flex-row">
					<p>creases ({countDiagramCreases(props.cp())})</p>
					<button class="square"><img src={Plus} /></button>
					<button class="square"><img src={Minus} /></button>
				</div>
				<table>
					<tbody>
						<For each={zipperDiagramCreases(props.cp())} >{crease =>
							<tr>
								<td>{crease.classes.join("")}</td>
								<td>({stringifyPoint(crease.coords[0], 2, ", ")})</td>
								<td>({stringifyPoint(crease.coords[1], 2, ", ")})</td>
							</tr>
						}</For>
					</tbody>
				</table>
				<hr />
				<div class="flex-row">
					<p>arrows ({countDiagramArrows(props.cp())})</p>
					<button class="square"><img src={Plus} /></button>
					<button class="square"><img src={Minus} /></button>
				</div>
				<table>
					<tbody>
						<For each={zipperDiagramArrows(props.cp())} >{arrow =>
							<tr>
								<td>{arrow.classes.join("")}</td>
								<td>({stringifyPoint(arrow.coords[0], 2, ", ")})</td>
								<td>({stringifyPoint(arrow.coords[1], 2, ", ")})</td>
							</tr>
						}</For>
					</tbody>
				</table>
			</div>
		</Panel>
	);
};

export default DiagramPanel;



