import Style from "./Panel.module.css";
import Plus from "../images/plus-solid.svg";
import Minus from "../images/minus-solid.svg";

const Panel = (props) => (
	<div class={Style.Panel}>
		<div class={Style.Titlebar}>
			<p>{props.title}</p>
			<div
				onClick={() => props.setIsCollapsed(!props.isCollapsed())}
				class={Style.CollapseButton}>
				<img
					src={props.isCollapsed() ? Plus : Minus}
					alt="toggle collapse"/>
			</div>
		</div>
		<Show when={!props.isCollapsed()}>
			<div class={Style.Body}>
				{props.children}
			</div>
		</Show>
	</div>
);

export default Panel;
