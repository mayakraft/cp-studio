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
