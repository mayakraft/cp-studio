import { createSignal } from "solid-js";

const assignmentNames = {
	M: "mountain",	m: "mountain",
	V: "valley",		v: "valley",
	F: "flat",			f: "flat",
	B: "boundary",	b: "boundary",
};

const assignmentToolDirections = [
	"mountain-valley",
	"flatten",
	"cut",
];

const EdgeInfo = (props) => (<>
	<p><b>{assignmentNames[props.cpPointer().nearest.edge_assignment]}</b> crease</p>
	<hr />
</>);

const Assignment = (props) => {
	const [toolAssignmentFoldAngle, setToolAssignmentFoldAngle] = createSignal(180);

	return (<>
		<Show when={props.cpPointer()}>
			<EdgeInfo cpPointer={props.cpPointer} />
		</Show>
		{/*<For each={assignmentToolDirections}>{str =>
			<div>
				<input
					type="checkbox"
					class="radio"
					id={`checkbox-label-${str}`}
					checked={props.toolAssignmentDirection() === str}
					onchange={() => props.setToolAssignmentDirection(str)}
				/><label for={`checkbox-label-${str}`}>{str}</label>
			</div>
		}</For>*/}
		<div class="flex-row">
			<button class="radio">M</button>
			<button class="radio">V</button>
			<button class="radio" highlighted="true">M / V</button>
			<button class="radio">flat</button>
			<button class="radio">cut</button>
		</div>
		<hr />
		<div class="flex-row">
			<p>fold angle</p>
			<input
				type="text"
				value={toolAssignmentFoldAngle()}
				onChange={e => setToolAssignmentFoldAngle(e.target.value)}
			/>
		</div>
		<div class="flex-row">
			<button
				onclick={e => setToolAssignmentFoldAngle(0)}
			>0&deg;</button>
			<input
				type="range"
				min="0"
				max="180"
				value={toolAssignmentFoldAngle()}
				step="5"
				// disabled={!props.simulatorOn()}
				oninput={e => setToolAssignmentFoldAngle(e.target.value)}
			/>
			<button
				onclick={e => setToolAssignmentFoldAngle(180)}
			>180&deg;</button>
		</div>
		<hr />
		<button>invert all</button>
	</>);
};

export default Assignment;
