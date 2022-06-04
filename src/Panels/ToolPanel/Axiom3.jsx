import Style from "./ToolPanel.module.css";
import { CreaseAssignmentSelect } from "./Shared";

// press, release, solutions
const stepsConditions = [
	[(n) => n === 0, (n) => n === 0, () => false],
	[(n) => n === 1, (n) => n === 0, () => false],
	[(n) => n === 1, (n) => n === 1, (n) => n === 2],
];

const stepsText = [
	"press on a line",
	"release on a line",
	"choose one",
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

const Strikethrough = (i, solutions) => (i === 2 && solutions && solutions.length < 2)
	? Style.Strikethrough
	: undefined;

const MakeStepClass = (i, presses, releases, solutions) => [
	"fold-step",
	StepStatus(i, presses, releases),
	Strikethrough(i, solutions),
].filter(a => a !== undefined).join(" ")

const Steps = (props) => (<>
	<ol>
		<For each={stepsText}>{(text, i) =>
			<li class={MakeStepClass(i(), props.cpPresses(), props.cpReleases(), props.cpSolutions())}>{text}</li>
		}</For>
	</ol>
</>);

const Axiom3 = (props) => {
	return (<>
		<Steps
			cpPresses={props.cpPresses}
			cpReleases={props.cpReleases}
			cpSolutions={props.cpSolutions}
		/>
		<hr />
		{/*<CreaseAssignmentSelect
			newCreaseAssignment={props.newCreaseAssignment}
			setNewCreaseAssignment={props.setNewCreaseAssignment}
		/>*/}
	</>);
};

export default Axiom3;
