import { createSignal } from "solid-js";
// import ToolPanel from "./ToolPanel";
// import CPPanel from "./CPPanel";
// import FoldabilityPanel from "./FoldabilityPanel";
import SimulatorPanel from "./SimulatorPanel";
import DiagramPanel from "./DiagramPanel";
import FilePanel from "./FilePanel";
import DebugPanel from "./DebugPanel";
import Style from "./PanelGroup.module.css";

const PanelGroup = (props) => {

	return (
		<div class={Style.PanelGroup}>
			<DebugPanel
				tool={props.tool}
				cpTouchState={props.cpTouchState}
				diagramTouchState={props.diagramTouchState}
				simulatorMove={props.simulatorMove}
				keyboardState={props.keyboardState}
				cpPointer={props.cpPointer}
				cpPresses={props.cpPresses}
				cpDrags={props.cpDrags}
				cpReleases={props.cpReleases}
				diagramPointer={props.diagramPointer}
				diagramPresses={props.diagramPresses}
				diagramDrags={props.diagramDrags}
				diagramReleases={props.diagramReleases}
				simulatorPointers={props.simulatorPointers}
				// remove
				showDebugLayer={props.showDebugLayer}
				setShowDebugLayer={props.setShowDebugLayer}
			/>
			<FilePanel
				fileMeta={props.fileMeta}
				setFileMeta={props.setFileMeta}
				fileFrames={props.fileFrames}
			/>
			{/*<Show when={props.views().includes("crease pattern")}>
				<ToolPanel
					language={props.language}
					tool={props.tool}
					cpTouchState={props.cpTouchState}
					diagramTouchState={props.diagramTouchState}
					cpSolutions={props.cpSolutions}
					diagramSolutions={props.diagramSolutions}
					simulatorMove={props.simulatorMove}
					newCreaseAssignment={props.newCreaseAssignment}
					setNewCreaseAssignment={props.setNewCreaseAssignment}
					// tool parameters
					pleatCount={props.pleatCount}
					setPleatCount={props.setPleatCount}
					vertexSnapping={props.vertexSnapping}
					setVertexSnapping={props.setVertexSnapping}
					transformOrigin={props.transformOrigin}
					transformTranslate={props.transformTranslate}
					transformRotate={props.transformRotate}
					transformScale={props.transformScale}
					setTransformOrigin={props.setTransformOrigin}
					setTransformTranslate={props.setTransformTranslate}
					setTransformRotate={props.setTransformRotate}
					setTransformScale={props.setTransformScale}
				/>
			</Show>
			<Show when={props.views().includes("crease pattern")}>
				<CPPanel
					foldabilityIndicators={props.foldabilityIndicators}
					setFoldabilityIndicators={props.setFoldabilityIndicators}
				/>
			</Show>
		*/}
			<Show when={props.views().includes("simulator")}>
				<SimulatorPanel
					tool={props.tool}
					simulatorOn={props.simulatorOn}
					setSimulatorOn={props.setSimulatorOn}
					simulatorStrain={props.simulatorStrain}
					setSimulatorStrain={props.setSimulatorStrain}
					simulatorFoldAmount={props.simulatorFoldAmount}
					setSimulatorFoldAmount={props.setSimulatorFoldAmount}
					simulatorShowTouches={props.simulatorShowTouches}
					setSimulatorShowTouches={props.setSimulatorShowTouches}
					simulatorShowShadows={props.simulatorShowShadows}
					setSimulatorShowShadows={props.setSimulatorShowShadows}
				/>
			</Show>
			<Show when={props.views().includes("diagram")}>
				<DiagramPanel
					// isCollapsed={props.diagramPanelCollapsed}
					// setIsCollapsed={props.setDiagramPanelCollapsed}
					tool={props.tool}
					showDiagramInstructions={props.showDiagramInstructions}
					setShowDiagramInstructions={props.setShowDiagramInstructions}
					// data
					cp={props.cp}
					fileFrames={props.fileFrames}
					setFileFrames={props.setFileFrames}
					fileFrameIndex={props.fileFrameIndex}
					setFileFrameIndex={props.setFileFrameIndex}
				/>
			</Show>
		{/*
			<Show when={props.views().includes("diagram")}>
				<FoldabilityPanel
					tool={props.tool}
					foldabilityIndicators={props.foldabilityIndicators}
					setFoldabilityIndicators={props.setFoldabilityIndicators}
				/>
			</Show>
			*/}
		</div>
	);
};

export default PanelGroup;
