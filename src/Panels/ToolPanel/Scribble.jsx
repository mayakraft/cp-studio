import {
	Snapping,
	CreaseAssignmentSelect,
} from "./Shared";

const Scribble = (props) => (<>
	{/*<Snapping
		body="snap endpoints"
		vertexSnapping={props.vertexSnapping}
		setVertexSnapping={props.setVertexSnapping}
	/>*/}
	<p>smooth</p>
	<input
		type="range"
		min="0.0"
		max="1.0"
		value={0.0}
		step="0.001"
		oninput={() => {}}
	/>
	{/*<CreaseAssignmentSelect
		newCreaseAssignment={props.newCreaseAssignment}
		setNewCreaseAssignment={props.setNewCreaseAssignment}
	/>*/}
</>);

export default Scribble;
