import Style from "./ToolPanel.module.css";
import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";
import Inspect from "./Inspect";
import Axiom2 from "./Axiom2";
import Axiom3 from "./Axiom3";
import Pleat from "./Pleat";
import Assignment from "./Assignment";

const preferenceCollapseKeys = ["panels", "toolPanelCollapsed"];

const ToolPanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));
	createEffect(() => setPreference(preferenceCollapseKeys, isCollapsed()));

	const [pleatCount, setPleatCount] = createSignal(4);

	return (
		<Panel
			title={props.tool()}
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<div class={Style.PanelTool}>
				<Switch fallback={<></>}>
					<Match when={props.tool() === "inspect"}>
						<Inspect
							cpPointer={props.cpPointer}
							diagramPointer={props.diagramPointer}
						/>
					</Match>
					<Match when={props.tool() === "point-to-point"}>
						<Axiom2
							cpPresses={props.cpPresses}
							cpReleases={props.cpReleases}
							cpSolutions={props.cpSolutions}
						/>
					</Match>
					<Match when={props.tool() === "line-to-line"}>
						<Axiom3
							cpPresses={props.cpPresses}
							cpReleases={props.cpReleases}
							cpSolutions={props.cpSolutions}
						/>
					</Match>
					<Match when={props.tool() === "pleat"}>
						<Pleat
							cpPresses={props.cpPresses}
							cpReleases={props.cpReleases}
							cpSolutions={props.cpSolutions}
							pleatCount={pleatCount}
							setPleatCount={setPleatCount}
						/>
					</Match>
					<Match when={props.tool() === "assignment"}>
						<Assignment
							cpPointer={props.cpPointer}
							toolAssignmentDirection={props.toolAssignmentDirection}
							setToolAssignmentDirection={props.setToolAssignmentDirection}
						/>
					</Match>
				</Switch>
			</div>
		</Panel>
	);
};

export default ToolPanel;
