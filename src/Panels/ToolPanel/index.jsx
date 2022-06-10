import Style from "./ToolPanel.module.css";
import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";
import Inspect from "./Inspect";
import Pleat from "./Pleat";
import Assignment from "./Assignment";
import Scribble from "./Scribble";
import Transform from "./Transform";
import Zoom from "./Zoom";
import StepsText from "./StepsText.json";
import { ToolTouchSteps } from "./Shared";

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
				{/* An ordered list of instructions for your touch/releases */}
				<Show when={StepsText[props.tool()]}>
					<ToolTouchSteps
						stepsText={StepsText[props.tool()]}
						// todo, need to pick either cp or diagram here
						toolStep={props.cpToolStep}
					/>
				</Show>
				{/* custom content for each tool */}
				<Switch fallback={<></>}>
					<Match when={props.tool() === "inspect"}>
						<Inspect
							cp={props.cp}
							cpPointer={props.cpPointer}
							diagramPointer={props.diagramPointer}
							cpParams={props.cpParams}
							diagramParams={props.diagramParams}
						/>
					</Match>
					<Match when={props.tool() === "pleat"}>
						<Pleat
							cpToolStep={props.cpToolStep}
							diagramToolStep={props.diagramToolStep}
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
					<Match when={props.tool() === "scribble"}>
						<Scribble
							// vertexSnapping={props.vertexSnapping}
							// setVertexSnapping={props.setVertexSnapping}
							// newCreaseAssignment={props.newCreaseAssignment}
							// setNewCreaseAssignment={props.setNewCreaseAssignment}
						/>
					</Match>
					<Match when={props.tool() === "transform"}>
						<Transform
							// transformType={transformType}
							// setTransformType={setTransformType}
							// transformOrigin={props.transformOrigin}
							// transformTranslate={props.transformTranslate}
							// transformRotate={props.transformRotate}
							// transformScale={props.transformScale}
							// setTransformOrigin={props.setTransformOrigin}
							// setTransformTranslate={props.setTransformTranslate}
							// setTransformRotate={props.setTransformRotate}
							// setTransformScale={props.setTransformScale}
						/>
					</Match>
					<Match when={props.tool() === "zoom"}>
						<Zoom
							resetViewBox={props.resetViewBox}
						/>
					</Match>
				</Switch>
			</div>
		</Panel>
	);
};

export default ToolPanel;
