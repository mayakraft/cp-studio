import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import Style from "./App.module.css";
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
// general
import {
	addKeySetTrue,
	removeKey,
} from "./Helpers";
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

const App = () => {
	// load preferences. these are used to populate the initial state of signals.
	const preferences = getPreference();
	if (preferences == null || preferences.version !== localStorageVersion) {
		// todo: be smarter about replacing existing preferences if version differs.
		setPreference([], emptyPreferences());
	}

	// the crease pattern, folded state, and array of diagram steps (sequence).
	const [fileMeta, setFileMeta] = createSignal({});
	const [fileFrames, setFileFrames] = createSignal([startFOLD]);
	const [fileFrameIndex, setFileFrameIndex] = createSignal(0);
	const [cp, setCP] = createSignal(startFOLD);
	// app state, ui, touch handlers
	const [tool, setTool] = createSignal("inspect");
	// windows and layout
	const [views, setViews] = createSignal(preferences.views);
	const [language, setLanguage] = createSignal(preferences.language);
	const [darkMode, setDarkMode] = createSignal(preferences.darkMode);
	const [mobileLayout, setMobileLayout] = createSignal(window.innerWidth < window.innerHeight);
	const [showPanels, setShowPanels] = createSignal(true);
	const [showTerminal, setShowTerminal] = createSignal(false);
	const [showDiagramInstructions, setShowDiagramInstructions] = createSignal(true);
	// popups
	const [errorMessage, setErrorMessage] = createSignal();
	// ui
	const [keyboardState, setKeyboardState] = createSignal({});

	// simulator
	const [simulatorOn, setSimulatorOn] = createSignal(true);
	const [simulatorShowHighlights, setSimulatorShowHighlights] = createSignal(true);
	const [simulatorStrain, setSimulatorStrain] = createSignal(false);
	const [simulatorFoldAmount, setSimulatorFoldAmount] = createSignal(0);
	const [simulatorTouch, setSimulatorTouch] = createSignal([]);

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
	const cpOnPress = (e) => console.log(e);
	const cpOnMove = (e) => {};
	const cpOnRelease = (e) => console.log(e);
	const diagramOnPress = (e) => console.log(e);
	const diagramOnMove = (e) => {};
	const diagramOnRelease = (e) => console.log(e);
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

	createEffect(() => setPreference(["language"], language()));
	createEffect(() => setPreference(["views"], views()));
	createEffect(() => setPreference(["darkMode"], darkMode()));

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
				setTool={setTool} />
			<div class={Style.Main}>
				<div class={`${Style.Views} View-Items-${views().length} ${mobileLayout() ? Style.Column : Style.Row}`}>
					<Show when={views().includes("crease pattern")}>
						<CP
							onPress={cpOnPress}
							onMove={cpOnMove}
							onRelease={cpOnRelease}
							cp={cp}
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
						/>
					</Show>
					<Show when={views().includes("diagram")}>
						<Diagram
							onPress={diagramOnPress}
							onMove={diagramOnMove}
							onRelease={diagramOnRelease}
							cp={cp}
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
						/>
					</Show>
					<Show when={views().includes("simulator")}>
						<Simulator
							cp={cp}
							tool={tool}
							darkMode={darkMode}
							showPanels={showPanels}
							simulatorOn={simulatorOn}
							setSimulatorTouch={setSimulatorTouch}
							simulatorShowHighlights={simulatorShowHighlights}
							simulatorStrain={simulatorStrain}
							simulatorFoldAmount={simulatorFoldAmount}
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
							simulatorShowHighlights={simulatorShowHighlights}
							setSimulatorShowHighlights={setSimulatorShowHighlights}
							// ui
							keyboardState={keyboardState}
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
			<DragAndDrop
				loadFile={loadFile}
				setErrorMessage={setErrorMessage}
			/>
		</div>
	);
};

export default App;
