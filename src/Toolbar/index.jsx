import Style from "./Toolbar.module.css";
import { toolNamesFilteredByViews } from "../Tools";

const Toolbar = (props) => (
	<div class={Style.Toolbar}>
		<For each={toolNamesFilteredByViews(props.views())}>{(name) =>
			<button
				class={`${Style[name]}`}
				highlighted={props.tool() === name}
				onClick={() => props.setTool(name)}
			></button>
		}</For>
	</div>
);

export default Toolbar;
