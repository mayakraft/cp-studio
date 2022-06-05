import Style from "./ToolPanel.module.css";

const assignmentButtonNames = {
	M: "mountain",
	V: "valley",
	F: "flat",
};

export const CreaseAssignmentSelect = (props) => (<>
	<div class="button-row">
		{Object.keys(assignmentButtonNames).map(assign => <button
				class="radio"
				onclick={e => props.setNewCreaseAssignment(e.target.innerHTML)}
				highlighted={props.newCreaseAssignment() == assign}
			>{assign}</button>)}
	</div>
	<p>new creases are <span>{assignmentButtonNames[props.newCreaseAssignment()]}</span>.</p>
</>);


export const Snapping = (props) => (<>
	<p><input
		type="checkbox"
		id="vertex-snapping-checkbox"
		checked={props.vertexSnapping()}
		oninput={e => props.setVertexSnapping(e.target.checked)}
	/><label for="vertex-snapping-checkbox">{props.body ? props.body : "vertex snapping"}</label></p>
</>);


const StepStatus = (i, toolStep) => {
	if (i < toolStep[0]) { return Style.Completed; }
	if (i === toolStep[0]) { return Style.Current; }
	if (i >= toolStep[1]) { return Style.Completed; }
	return Style.Todo;
};

export const ToolTouchSteps = (props) => (<ol>
	<For each={props.stepsText}>{(text, i) =>
		<li class={`fold-step ${StepStatus(i(), props.toolStep())}`}>{text}</li>
	}</For>
</ol>);
