import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import Style from "./App.module.css";
import "./SVG/svg.css";
// windows
import Menubar from "./Menubar";
import Toolbar from "./Toolbar";
import PanelGroup from "./Panels/PanelGroup";
import Terminal from "./Terminal";
import ErrorPopup from "./Popups/ErrorPopup";
import CP from "./CP";
import Diagram from "./Diagram";
import Simulator from "./Simulator";
// I/O
import DragAndDrop from "./FileManager/DragAndDrop";
import {
	makeDiagramFormatFOLD,
	getFileMeta,
} from "./FileManager";
import MakeFoldedForm from "./FOLD/MakeFoldedForm";
// general
import {
	addKeySetTrue,
	removeKey,
} from "./Helpers";
// modify
import MakeParams from "./Compute/MakeParams";
import RunParams from "./Compute/RunParams";
import {
	localStorageVersion,
	emptyPreferences,
	getPreference,
	setPreference,
} from "./LocalStorage";

// import squareFOLD from "./Files/square.fold?raw";
// const startFOLD = JSON.parse(squareFOLD);
import animalBase from "./Files/example-animal-base.fold?raw";
const startFOLD = JSON.parse(animalBase);

import ear from "rabbit-ear";

const appendNearest = (event, origami) => {
	const arrayForm = event && event.x != null ? [event.x, event.y] : [0,0];
	const vertex = ear.graph.nearest_vertex(origami, arrayForm);
	const edge = ear.graph.nearest_edge(origami, arrayForm);
	const face = ear.graph.nearest_face(origami, arrayForm);
	event.nearest = {
		vertex,
		edge,
		face,
		vertex_coords: origami.vertices_coords[vertex],
		edge_coords: edge != null
			? origami.edges_vertices[edge].map(v => origami.vertices_coords[v])
			: undefined,
		face_coords: face != null
			? origami.faces_vertices[face].map(v => origami.vertices_coords[v])
			: undefined,
		edge_assignment: edge != null
			? origami.edges_assignment[edge]
			: undefined,
	};
	return event;
};

const App = () => {
	// load preferences. these are used to populate the initial state of signals.
	let preferences = getPreference();
	if (preferences == null || preferences.version !== localStorageVersion) {
		// todo: be smarter about replacing existing preferences if version differs.
		preferences = emptyPreferences();
		setPreference([], preferences);
	}

	// the crease pattern, folded state, and array of diagram steps (sequence).
	const [fileMeta, setFileMeta] = createSignal({});
	const [fileFrames, setFileFrames] = createSignal([startFOLD]);
	const [fileFrameIndex, setFileFrameIndex] = createSignal(0);
	const [cp, setCP] = createSignal(startFOLD);
	const [foldedForm, setFoldedForm] = createSignal(MakeFoldedForm(startFOLD));
	const [cpRect, setCPRect] = createSignal();
	const [foldedFormRect, setFoldedFormRect] = createSignal();
	// const [cpConvexHull, setCPConvexHull] = createSignal();
	// const [foldedFormConvexHull, setFoldedFormConvexHull] = createSignal();
	// app state, ui, touch handlers
	const [tool, setTool] = createSignal("inspect");
	// windows and layout
	const [views, setViews] = createSignal(preferences.views);
	const [language, setLanguage] = createSignal(preferences.language);
	const [darkMode, setDarkMode] = createSignal(preferences.darkMode);
	const [mobileLayout, setMobileLayout] = createSignal(window.innerWidth < window.innerHeight);
	const [showPanels, setShowPanels] = createSignal(true);
	const [showTerminal, setShowTerminal] = createSignal(false);
	const [showDiagramInstructions, setShowDiagramInstructions] = createSignal(preferences.showDiagramInstructions);
	// popups
	const [errorMessage, setErrorMessage] = createSignal();
	const [showNewPopup, setShowNewPopup] = createSignal(false);
	// ui
	const [keyboardState, setKeyboardState] = createSignal({});
	// simulator
	const [simulatorOn, setSimulatorOn] = createSignal(preferences.simulator.on);
	const [simulatorShowTouches, setSimulatorShowTouches] = createSignal(preferences.simulator.showTouches);
	const [simulatorStrain, setSimulatorStrain] = createSignal(preferences.simulator.strain);
	const [simulatorFoldAmount, setSimulatorFoldAmount] = createSignal(0);
	const [simulatorShowShadows, setSimulatorShowShadows] = createSignal(preferences.simulator.shadows);
	// touch events
	const [cpPointer, setCPPointer] = createSignal();
	const [cpPresses, setCPPresses] = createSignal([]);
	const [cpDrags, setCPDrags] = createSignal([]);
	const [cpReleases, setCPReleases] = createSignal([]);
	const [diagramPointer, setDiagramPointer] = createSignal();
	const [diagramPresses, setDiagramPresses] = createSignal([]);
	const [diagramDrags, setDiagramDrags] = createSignal([]);
	const [diagramReleases, setDiagramReleases] = createSignal([]);
	const [simulatorPointers, setSimulatorPointers] = createSignal([]);
	// operations
	const [cpParams, setCPParams] = createSignal([]);
	const [cpSolutions, setCPSolutions] = createSignal([]);
	const [diagramParams, setDiagramParams] = createSignal([]);
	const [diagramSolutions, setDiagramSolutions] = createSignal([]);
	// tool settings
	const [vertexSnapping, setVertexSnapping] = createSignal(true);

	// get rid of eventually:
	const [showDebugLayer, setShowDebugLayer] = createSignal(true);

	// file management
	/**
	 * @description open the new file dialog which will subsequently call loadFile()
	 */
	const newFile = () => setShowNewPopup(true);
	/**
	 * @description this will detect if the user has made a diagram (multiple frames)
	 * or a single crease pattern, and export a file properly formatted as such.
	 */
	const saveFile = (event) => {
		const foldFile = makeFOLDFile(fileMeta(), fileFrames());
		downloadFile(JSON.stringify(foldFile));
	};
	/**
	 * @description the main entrypoint for loading a file. accepts either:
	 * - crease pattern (one FOLD object with only top-level data)
	 * - diagram (one FOLD object with file_frames:[ (FOLD objects) ])
	 */
	const loadFile = (fold) => {
		// cpTouchManager.clearTouches();
		// diagramTouchManager.clearTouches();
		const newFile = makeDiagramFormatFOLD(fold);
		setFileMeta(getFileMeta(newFile));
		setFileFrames(newFile.file_frames);
		setFileFrameIndex(newFile.file_frames.length - 1);
	};
	// load a file_frames, automatically set the cp
	createEffect(() => {
		const frames = fileFrames();
		if (frames.length) {
			const cp = frames[0];
			const foldedForm = MakeFoldedForm(cp);
			setCP(cp);
			// todo: errors if something goes wrong
			setFoldedForm(foldedForm);
			setCPRect(ear.rect.fromPoints(cp.vertices_coords));
			setFoldedFormRect(ear.rect.fromPoints(foldedForm.vertices_coords));
		}
	});

	const cpOnPress = (e) => {
		const event = appendNearest(e, cp());
		setCPPointer(event);
		setCPPresses([...cpPresses(), event]);
	};
	const cpOnMove = (e) => {
		const event = appendNearest(e, cp());
		setCPPointer(event);
		{ if (e.buttons) { setCPDrags([...cpDrags(), event]); }};
	};
	const cpOnRelease = (e) => {
		const event = appendNearest(e, cp());
		setCPPointer(event);
		setCPReleases([...cpReleases(), event]);
	};
	const cpOnLeave = (e) => {
		setCPPointer(undefined);
		{ if (e.buttons) { setCPDrags([...cpDrags(), appendNearest(e, cp())]); }};
	};
	const diagramOnPress = (e) => {
		const event = appendNearest(e, foldedForm());
		setDiagramPointer(event);
		setDiagramPresses([...diagramPresses(), event]);
	};
	const diagramOnMove = (e) => {
		const event = appendNearest(e, foldedForm());
		setDiagramPointer(event);
		{ if (e.buttons) { setDiagramDrags([...diagramDrags(), event]); }};
	};
	const diagramOnRelease = (e) => {
		const event = appendNearest(e, foldedForm());
		setDiagramPointer(event);
		setDiagramReleases([...diagramReleases(), event]);
	};
	const diagramOnLeave = (e) => {
		setDiagramPointer(undefined);
		{ if (e.buttons) { setDiagramDrags([...diagramDrags(), appendNearest(e, foldedForm())]); }};
	};
	const onresize = () => setMobileLayout(window.innerWidth < window.innerHeight);
	const onkeydown = (e) => setKeyboardState(addKeySetTrue(keyboardState(), e.key))
	const onkeyup = (e) => setKeyboardState(removeKey(keyboardState(), e.key));

	onMount(() => {
		window.addEventListener("resize", onresize);
		window.addEventListener("keydown", onkeydown);
		window.addEventListener("keyup", onkeyup);
	});
	onCleanup(() => {
		window.removeEventListener("resize", onresize);
		window.removeEventListener("keydown", onkeydown);
		window.removeEventListener("keyup", onkeyup);
	});

	createEffect(() => setPreference(["views"], views()));
	createEffect(() => setPreference(["language"], language()));
	createEffect(() => setPreference(["darkMode"], darkMode()));
	createEffect(() => setPreference(["simulator", "on"], simulatorOn()));
	createEffect(() => setPreference(["simulator", "showTouches"], simulatorShowTouches()));
	createEffect(() => setPreference(["simulator", "strain"], simulatorStrain()));
	createEffect(() => setPreference(["simulator", "shadows"], simulatorShowShadows()));

	createEffect(() => {
		tool();
		setCPPresses([]);
		setCPDrags([]);
		setCPReleases([]);
		setDiagramPresses([]);
		setDiagramDrags([]);
		setDiagramReleases([]);
		// setSimulatorPointers([]);
	})
	createEffect(() => setCPParams(MakeParams({
		tool: tool(),
		pointer: cpPointer(),
		presses: cpPresses(),
		drags: cpDrags(),
		releases: cpReleases(),
		vertexSnapping: vertexSnapping(),
	})));
	createEffect(() => setDiagramParams(MakeParams({
		tool: tool(),
		pointer: diagramPointer(),
		presses: diagramPresses(),
		drags: diagramDrags(),
		releases: diagramReleases(),
		vertexSnapping: vertexSnapping(),
	})));
	createEffect(() => setCPSolutions(RunParams({
		tool: tool(),
		params: cpParams(),
		// rect: cpRect(),
	})));
	createEffect(() => setDiagramSolutions(RunParams({
		tool: tool(),
		params: diagramParams(),
		// rect: foldedFormRect(),
	})));

	return (
		<div class={`${Style.App} ${darkMode() ? "dark-mode" : "light-mode"}`}>
			<Menubar
				views={views}
				setViews={setViews}
				darkMode={darkMode}
				setDarkMode={setDarkMode}
				language={language}
				setLanguage={setLanguage}
				showPanels={showPanels}
				setShowPanels={setShowPanels}
				showTerminal={showTerminal}
				setShowTerminal={setShowTerminal}
				newFile={newFile}
				loadFile={loadFile}
				saveFile={saveFile}
				mobileLayout={mobileLayout}
				setErrorMessage={setErrorMessage}
			/>
			<Toolbar
				tool={tool}
				setTool={setTool}
				views={views}
			/>
			<div class={Style.Main}>
				<div class={`${Style.Views} View-Items-${views().length} ${mobileLayout() ? Style.Column : Style.Row}`}>
					<Show when={views().includes("crease pattern")}>
						<CP
							onPress={cpOnPress}
							onMove={cpOnMove}
							onRelease={cpOnRelease}
							onLeave={cpOnLeave}
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
							// data
							origami={cp}
							rect={cpRect}
							// events
							cpPointer={cpPointer}
							cpPresses={cpPresses}
							cpDrags={cpDrags}
							cpReleases={cpReleases}
							keyboardState={keyboardState}
							// calculations
							cpParams={cpParams}
							cpSolutions={cpSolutions}
							// tool settings
							vertexSnapping={vertexSnapping}
							// remove
							showDebugLayer={showDebugLayer}
						/>
					</Show>
					<Show when={views().includes("diagram")}>
						<Diagram
							onPress={diagramOnPress}
							onMove={diagramOnMove}
							onRelease={diagramOnRelease}
							onLeave={diagramOnLeave}
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
							// data
							origami={foldedForm}
							rect={foldedFormRect}
							// events
							diagramPointer={diagramPointer}
							diagramPresses={diagramPresses}
							diagramDrags={diagramDrags}
							diagramReleases={diagramReleases}
							keyboardState={keyboardState}
							// calculations
							diagramParams={diagramParams}
							diagramSolutions={diagramSolutions}
							// tool settings
							vertexSnapping={vertexSnapping}
							// remove
							showDebugLayer={showDebugLayer}
						/>
					</Show>
					<Show when={views().includes("simulator")}>
						<Simulator
							cp={cp}
							tool={tool}
							views={views}
							darkMode={darkMode}
							showPanels={showPanels}
							// simulator
							simulatorOn={simulatorOn}
							simulatorShowTouches={simulatorShowTouches}
							simulatorStrain={simulatorStrain}
							simulatorFoldAmount={simulatorFoldAmount}
							simulatorShowShadows={simulatorShowShadows}
							// events
							setSimulatorPointers={setSimulatorPointers}
						/>
					</Show>
				</div>

				{/* panels */}
				<div class={Style.FloatingPanelContainer}>
					<Show when={showPanels()}>
						<PanelGroup
							tool={tool}
							views={views}
							cp={cp}
							darkMode={darkMode}
							fileMeta={fileMeta}
							setFileMeta={setFileMeta}
							fileFrames={fileFrames}
							setFileFrames={setFileFrames}
							fileFrameIndex={fileFrameIndex}
							setFileFrameIndex={setFileFrameIndex}
							showPanels={showPanels}
							setShowPanels={setShowPanels}
							showDiagramInstructions={showDiagramInstructions}
							setShowDiagramInstructions={setShowDiagramInstructions}
							// simulator
							simulatorOn={simulatorOn}
							setSimulatorOn={setSimulatorOn}
							simulatorStrain={simulatorStrain}
							setSimulatorStrain={setSimulatorStrain}
							simulatorFoldAmount={simulatorFoldAmount}
							setSimulatorFoldAmount={setSimulatorFoldAmount}
							simulatorShowTouches={simulatorShowTouches}
							setSimulatorShowTouches={setSimulatorShowTouches}
							simulatorShowShadows={simulatorShowShadows}
							setSimulatorShowShadows={setSimulatorShowShadows}
							// events
							cpPointer={cpPointer}
							cpPresses={cpPresses}
							cpDrags={cpDrags}
							cpReleases={cpReleases}
							diagramPointer={diagramPointer}
							diagramPresses={diagramPresses}
							diagramDrags={diagramDrags}
							diagramReleases={diagramReleases}
							simulatorPointers={simulatorPointers}
							keyboardState={keyboardState}
							// remove
							showDebugLayer={showDebugLayer}
							setShowDebugLayer={setShowDebugLayer}
						/>
					</Show>
					<div
						class={Style.CollapseButton}
						onClick={() => setShowPanels(!showPanels())}>
						<svg width="100%" height="100%" viewBox="0 0 10 10">
							<polygon
								fill={darkMode() ? "#ccc" : "white"}
								points={showPanels() ? "3,3 3,7 7,5" : "7,3 7,7 3,5"} />
						</svg>
					</div>
				</div>
			</div>

			<Show when={showTerminal()}>
				<Terminal />
			</Show>

			{/* pop-ups */}
			<Show when={errorMessage()}>
				<ErrorPopup
					title={errorMessage().title}
					header={errorMessage().header}
					body={errorMessage().body}
					clickOff={() => setErrorMessage(undefined)}
				/>
			</Show>
			<Show when={showNewPopup()}>
				<div></div>
			</Show>
			<DragAndDrop
				loadFile={loadFile}
				setErrorMessage={setErrorMessage}
			/>
		</div>
	);
};

export default App;
