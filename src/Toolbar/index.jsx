import Style from "./Toolbar.module.css";

const buttonNames = [
	"inspect",
	"remove",
	"line",
	"ray",
	"segment",
	"point-to-point",
	"line-to-line",
	"perpendicular",
	"scribble",
	"pleat",
	"assignment",
	"transform",
	"zoom",
];

const Toolbar = (props) => (
	<div class={Style.Toolbar}>
		<For each={buttonNames}>{(name) =>
			<button
				class={`${Style[name]}`}
				highlighted={props.tool() === name}
				onClick={() => props.setTool(name)}
			></button>
		}</For>
	</div>
);

export default Toolbar;
