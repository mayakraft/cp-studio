import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import ear from "rabbit-ear";
import Style from "./App.module.css";
import "./SVG/svg.css";
import Menubar from "./Menubar";
import Toolbar from "./Toolbar";
import Panels from "./Panels";
import Terminal from "./Terminal";
import CP from "./CP";
import Diagram from "./Diagram";
import Simulator from "./Simulator";
import NewFilePopup from "./Popups/NewFilePopup";
import ErrorPopup from "./Popups/ErrorPopup";
import DragAndDrop from "./FileManager/DragAndDrop";
import MakeFoldedForm from "./FOLD/MakeFoldedForm";
import MakeParams from "./Compute/MakeParams";
import MakeSolutions from "./Compute/MakeSolutions";
import MakeToolStep from "./Compute/MakeToolStep";
import ExecuteCommand from "./Compute/ExecuteCommand";
import {
	localStorageVersion,
	emptyPreferences,
	getPreference,
	setPreference,
} from "./LocalStorage";
import {
	makeFOLDFile,
	downloadFile,
	loadFOLDMetaAndFrames,
} from "./FileManager";
import {
	addKeySetTrue,
	removeKey,
	appendNearest,
} from "./Helpers";
// import example from "./Files/square.fold?raw";
// import example from "./Files/example-animal-base.fold?raw";
import example from "./Files/example-sequence.fold?raw";

const App = () => {
	// load preferences. these are used to populate the initial state of signals.
	let preferences = getPreference();
	if (preferences == null || preferences.version !== localStorageVersion) {
		// todo: be smarter about replacing existing preferences if version differs.
		preferences = emptyPreferences();
		setPreference([], preferences);
	}
	// the data models. even if the user is only making one crease pattern, the data is
	// stored in an array of FOLD objects (fileFrames) which represents the diagram sequence.
	// fileFrames is the main data source. Modifications to the crease pattern happen
	// by modifying the current index in fileFrames, and changes to fileFrames will
	// update cp(), where cp() is the current selected diagram step.
	const [fileMeta, setFileMeta] = createSignal({}); // object
	const [fileFrames, setFileFrames] = createSignal([{}]); // FOLD-object[]
	const [fileFrameIndex, setFileFrameIndex] = createSignal(0); // int
	const [cp, setCP] = createSignal({}); // FOLD-object
	const [foldedForm, setFoldedForm] = createSignal(MakeFoldedForm({})); // FOLD-object
	// the 2D bounds of the cp and folded forms as {x,y,width,height} rectangles
	const [cpRect, setCPRect] = createSignal(); // object
	const [foldedFormRect, setFoldedFormRect] = createSignal(); // object
	// app state, windows, layout
	const [tool, setTool] = createSignal("inspect"); // string
	const [views, setViews] = createSignal(preferences.views); // string[]
	const [language, setLanguage] = createSignal(preferences.language); // string
	const [darkMode, setDarkMode] = createSignal(preferences.darkMode); // boolean
	const [mobileLayout, setMobileLayout] = createSignal(window.innerWidth < window.innerHeight); // boolean
	const [showPanels, setShowPanels] = createSignal(true); // boolean
	const [showTerminal, setShowTerminal] = createSignal(false); // boolean
	const [showDiagramInstructions, setShowDiagramInstructions] = createSignal(preferences.showDiagramInstructions); // boolean
	// popups
	const [errorMessage, setErrorMessage] = createSignal(); // object
	const [showNewPopup, setShowNewPopup] = createSignal(false); // boolean
	// origami simulator
	const [simulatorOn, setSimulatorOn] = createSignal(preferences.simulator.on); // boolean
	const [simulatorShowTouches, setSimulatorShowTouches] = createSignal(preferences.simulator.showTouches); // boolean
	const [simulatorStrain, setSimulatorStrain] = createSignal(preferences.simulator.strain); // boolean
	const [simulatorFoldAmount, setSimulatorFoldAmount] = createSignal(0); // float (0.0-1.0)
	const [simulatorShowShadows, setSimulatorShowShadows] = createSignal(preferences.simulator.shadows); // boolean
	// keyboard
	const [keyboardState, setKeyboardState] = createSignal({}); // object
	// touch events
	const [cpPointer, setCPPointer] = createSignal(); // MouseEvent
	const [cpPresses, setCPPresses] = createSignal([]); // MouseEvent[]
	const [cpDrags, setCPDrags] = createSignal([]); // MouseEvent[]
	const [cpReleases, setCPReleases] = createSignal([]); // MouseEvent[]
	const [diagramPointer, setDiagramPointer] = createSignal(); // MouseEvent
	const [diagramPresses, setDiagramPresses] = createSignal([]); // MouseEvent[]
	const [diagramDrags, setDiagramDrags] = createSignal([]); // MouseEvent[]
	const [diagramReleases, setDiagramReleases] = createSignal([]); // MouseEvent[]
	const [simulatorPointers, setSimulatorPointers] = createSignal([]); // object
	// result of touch events
	// as the number of presses/drags/releases grow, the input parameters for the current
	// operation are compiled in cpParams, and, as soon as is possible the solutions
	// are calculated to preview the solutions, stored in cpSolutions. as touches continue
	// and solutions are shown, we need to know when the final touch happens, the cpToolStep
	// stores two numbers: [current, total]. when current==total the operation is completed,
	// the cpCommandQueue is populated with a command, which triggers the editor to make the modification
	const [cpParams, setCPParams] = createSignal([]); // any[]
	const [cpSolutions, setCPSolutions] = createSignal([]); // Line[]
	const [cpToolStep, setCPToolStep] = createSignal([]); // [int, int]
	const [cpCommandQueue, setCPCommandQueue] = createSignal(); // todo
	const [diagramParams, setDiagramParams] = createSignal([]); // any[]
	const [diagramSolutions, setDiagramSolutions] = createSignal([]); // Line[]
	const [diagramToolStep, setDiagramToolStep] = createSignal([]); // [int, int]
	const [diagramCommandQueue, setDiagramCommandQueue] = createSignal(); // todo
	// todo: build this out to be an array of FOLD objects alongside these strings
	const [historyText, setHistoryText] = createSignal(); // string
	// tool settings
	const [vertexSnapping, setVertexSnapping] = createSignal(true); // boolean
	const [toolAssignmentDirection, setToolAssignmentDirection] = createSignal("mountain-valley"); // string
	// todo: remove in production probably
	const [showDebugSVGLayer, setShowDebugSVGLayer] = createSignal(preferences.debug.showSVGLayer); // boolean
	const [showDebugPanel, setShowDebugPanel] = createSignal(preferences.debug.showPanel); // boolean
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
	 * @description the main entrypoint for loading a file.
	 * this must be a FOLD object, but it can be either a singleModel or diagram:
	 * - singleModel (one FOLD object with only top-level data)
	 * - diagram (one FOLD object with file_frames:[])
	 */
	const loadFile = (fold) => {
		const { metadata, file_frames } = loadFOLDMetaAndFrames(fold);
		setFileMeta(metadata);
		setFileFrames(file_frames);
		setFileFrameIndex(file_frames.length - 1);
		// todo: do we need to clear touches?
	};
	// keyboard events
	// maintain one keyboard object which contains a key:value of all keys pressed,
	// and an "event" key which describes the most recent event.
	const onkeydown = (e) => setKeyboardState(addKeySetTrue(keyboardState(), e.key))
	const onkeyup = (e) => setKeyboardState(removeKey(keyboardState(), e.key));
	// window events
	// watch for a resize event, switch to mobile layout if width < height
	const onresize = () => setMobileLayout(window.innerWidth < window.innerHeight);
	//
	// effect hooks
	//
	// when a new file is loaded, or when the current diagram advances the index,
	// set the cp and the folded form (make the folded form), re-calc bounding rects
	createEffect(() => {
		const frames = fileFrames();
		const index = fileFrameIndex();
		if (index < frames.length) {
			const cp = frames[index];
			const foldedForm = MakeFoldedForm(cp);
			setCP(cp);
			// todo: errors if something goes wrong
			setFoldedForm(foldedForm);
			setCPRect(ear.rect.fromPoints(cp.vertices_coords));
			setFoldedFormRect(ear.rect.fromPoints(foldedForm.vertices_coords));
		}
	});
	// watch the keyboard for changes, select by "up" "down" events and the key involved:
	createEffect(() => {
		const keyboard = keyboardState();
		if (keyboard.event && keyboard.event.type === "up") {
			switch (keyboard.event.key) {
				case "\`": setShowTerminal(true); break;
				case "Escape":
					setShowTerminal(false);
					// consider also hiding any visible popups...
					break;
				default: break;
			}
		}
	});
	// todo: oh no, this needs to fire before the ExecuteCommand effect.
	// running axiom 3 (non-parallel), switching to axiom 1/2/4 executes the new tool with old params.
	createEffect(() => {
		tool();
		setCPPresses([]);
		setCPDrags([]);
		setCPReleases([]);
		setDiagramPresses([]);
		setDiagramDrags([]);
		setDiagramReleases([]);
		// setSimulatorPointers([]);
	});
	// SVG pointer/presses/drags/releases will create parameters for the upcoming operation
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
	// as soon as enough parameters are available, compute the current operation's solutions
	createEffect(() => setCPSolutions(MakeSolutions({
		tool: tool(),
		params: cpParams(),
	})));
	createEffect(() => setDiagramSolutions(MakeSolutions({
		tool: tool(),
		params: diagramParams(),
	})));
	// from the set of SVG press/release events, determine which input step the user is
	// currently, the operation will not fully execute until the last step is reached.
	createEffect(() => setCPToolStep(MakeToolStep({
		tool: tool(),
		pointer: cpPointer(),
		presses: cpPresses(),
		releases: cpReleases(),
		solutions: cpSolutions(),
	})));
	createEffect(() => setDiagramToolStep(MakeToolStep({
		tool: tool(),
		pointer: diagramPointer(),
		presses: diagramPresses(),
		releases: diagramReleases(),
		solutions: diagramSolutions(),
	})));
	// when the last step is reached, append the operation to the execution queue.
	createEffect(() => setCPCommandQueue(ExecuteCommand({
		which: "cp",
		tool: tool(),
		params: cpParams(),
		solutions: cpSolutions(),
		toolStep: cpToolStep(),
	})));
	createEffect(() => setDiagramCommandQueue(ExecuteCommand({
		which: "diagram",
		tool: tool(),
		params: diagramParams(),
		solutions: diagramSolutions(),
		toolStep: diagramToolStep(),
	})));
	// when a command is available on the queue, modify the FOLD object.
	createEffect(() => {
		const entry = cpCommandQueue();
		if (!entry) { return; }
		// clear touches
		setCPCommandQueue();
		setCPPresses([]);
		setCPDrags([]);
		setCPReleases([]);
		setCPToolStep([]);
		setCPParams([]);
		setCPSolutions([]);
		// "success" is a code for "tool is done. clear touches but don't cache the history"
		if (entry === "success" || entry === "rejected") { return; }
		// modify FOLD object (modify the current index in fileFrames)
		const newHistory = [historyText(), entry].filter(a => a !== undefined).join("\n");
		setHistoryText(newHistory);
	});
	createEffect(() => {
		const entry = diagramCommandQueue();
		if (!entry) { return; }
		// clear touches
		setDiagramCommandQueue();
		setDiagramPresses([]);
		setDiagramDrags([]);
		setDiagramReleases([]);
		setDiagramToolStep([]);
		setDiagramParams([]);
		setDiagramSolutions([]);
		// "success" is a code for "tool is done. clear touches but don't cache the history"
		if (entry === "success") { return; }
		// modify FOLD object (modify the current index in fileFrames)
		const newHistory = [historyText(), entry].filter(a => a !== undefined).join("\n");
		setHistoryText(newHistory);
	});
	// Local Storage
	// when any of these change, write to the local storage immediately,
	// ensuring the preferences remain always updated.
	createEffect(() => setPreference(["views"], views()));
	createEffect(() => setPreference(["language"], language()));
	createEffect(() => setPreference(["darkMode"], darkMode()));
	createEffect(() => setPreference(["simulator", "on"], simulatorOn()));
	createEffect(() => setPreference(["simulator", "showTouches"], simulatorShowTouches()));
	createEffect(() => setPreference(["simulator", "strain"], simulatorStrain()));
	createEffect(() => setPreference(["simulator", "shadows"], simulatorShowShadows()));

	onMount(() => {
		window.addEventListener("resize", onresize);
		window.addEventListener("keydown", onkeydown);
		window.addEventListener("keyup", onkeyup);
		// todo: temporary. load an example file.
		loadFile(JSON.parse(example));
	});
	onCleanup(() => {
		window.removeEventListener("resize", onresize);
		window.removeEventListener("keydown", onkeydown);
		window.removeEventListener("keyup", onkeyup);
	});

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
				// debug
				showDebugPanel={showDebugPanel}
				setShowDebugPanel={setShowDebugPanel}
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
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
							// data
							origami={cp}
							rect={cpRect}
							// events
							pointer={cpPointer}
							presses={cpPresses}
							drags={cpDrags}
							releases={cpReleases}
							setPointer={setCPPointer}
							setPresses={setCPPresses}
							setDrags={setCPDrags}
							setReleases={setCPReleases}
							keyboardState={keyboardState}
							simulatorPointers={simulatorPointers}
							simulatorShowTouches={simulatorShowTouches}
							// calculations
							cpParams={cpParams}
							cpSolutions={cpSolutions}
							// tool settings
							vertexSnapping={vertexSnapping}
							// remove
							showDebugSVGLayer={showDebugSVGLayer}
						/>
					</Show>
					<Show when={views().includes("diagram")}>
						<Diagram
							tool={tool}
							views={views}
							showPanels={showPanels}
							showTerminal={showTerminal}
							// data
							origami={foldedForm}
							rect={foldedFormRect}
							// events
							pointer={diagramPointer}
							presses={diagramPresses}
							drags={diagramDrags}
							releases={diagramReleases}
							setPointer={setDiagramPointer}
							setPresses={setDiagramPresses}
							setDrags={setDiagramDrags}
							setReleases={setDiagramReleases}
							keyboardState={keyboardState}
							// calculations
							diagramParams={diagramParams}
							diagramSolutions={diagramSolutions}
							// tool settings
							showDiagramInstructions={showDiagramInstructions}
							vertexSnapping={vertexSnapping}
							// remove
							showDebugSVGLayer={showDebugSVGLayer}
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
						<Panels
							tool={tool}
							views={views}
							language={language}
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
							// debug
							showDebugPanel={showDebugPanel}
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
							cpParams={cpParams}
							cpToolStep={cpToolStep}
							diagramPointer={diagramPointer}
							diagramPresses={diagramPresses}
							diagramDrags={diagramDrags}
							diagramReleases={diagramReleases}
							diagramParams={diagramParams}
							diagramToolStep={diagramToolStep}
							simulatorPointers={simulatorPointers}
							keyboardState={keyboardState}
							//
							cpSolutions={cpSolutions}
							diagramSolutions={diagramSolutions}
							// remove
							showDebugSVGLayer={showDebugSVGLayer}
							setShowDebugSVGLayer={setShowDebugSVGLayer}
							// tool settings
							toolAssignmentDirection={toolAssignmentDirection}
							setToolAssignmentDirection={setToolAssignmentDirection}
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
				<Terminal
					historyText={historyText}
					setHistoryText={setHistoryText}
				/>
			</Show>

			{/* pop-ups */}
			<Show when={showNewPopup()}>
				<NewFilePopup
					language={language}
					loadFile={loadFile}
					clickOff={() => setShowNewPopup(false)}
				/>
			</Show>
			<Show when={errorMessage()}>
				<ErrorPopup
					language={language}
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
