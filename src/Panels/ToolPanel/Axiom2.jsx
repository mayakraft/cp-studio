import Style from "./ToolPanel.module.css";
import {
	Snapping,
	CreaseAssignmentSelect,
} from "./Shared";

const stepsText = [
	"press on a point",
	"release on a point",
];

const StepStatus = (i, presses, releases) => {
	let step;
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": step = 0; break;
		case "1 0": step = 1; break;
		case "1 1": step = 2; break;
	}
	if (i < step) { return Style.Completed; }
	if (i === step) { return Style.Current; }
	if (i > step) { return Style.Todo; }
};

const MakeStepClass = (i, presses, releases) => [
	"fold-step",
	StepStatus(i, presses, releases),
].filter(a => a !== undefined).join(" ")

const Steps = (props) => (<>
	<ol>
		<For each={stepsText}>{(text, i) =>
			<li class={MakeStepClass(i(), props.cpPresses(), props.cpReleases())}>{text}</li>
		}</For>
	</ol>
</>);

const Axiom2 = (props) => {
	return (<>
		<Steps
			cpPresses={props.cpPresses}
			cpReleases={props.cpReleases}
		/>
		{/*<hr />
		<Snapping 
			vertexSnapping={props.vertexSnapping}
			setVertexSnapping={props.setVertexSnapping}
		/>*/}
		{/*<CreaseAssignmentSelect
			newCreaseAssignment={props.newCreaseAssignment}
			setNewCreaseAssignment={props.setNewCreaseAssignment}
		/>*/}
	</>);
};

export default Axiom2;
