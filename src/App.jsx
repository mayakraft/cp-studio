import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import Style from "./App.module.css";
// I/O
import DragAndDrop from "./FileManager/DragAndDrop";
import {
	makeDiagramFormatFOLD,
	getFileMeta,
} from "./FileManager";
// windows
import Menubar from "./Menubar";
import Toolbar from "./Toolbar";
import PanelGroup from "./Panels/PanelGroup";
import Terminal from "./Terminal";
import ErrorPopup from "./Popups/ErrorPopup";

import squareFOLD from "./Files/square.fold?raw";
const startFOLD = JSON.parse(squareFOLD);

// get user's device settings
const deviceDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const App = () => {
	// the crease pattern, folded state, and array of diagram steps (sequence).
	const [fileMeta, setFileMeta] = createSignal({});
	const [fileFrames, setFileFrames] = createSignal([startFOLD]);
	const [fileFrameIndex, setFileFrameIndex] = createSignal(0);
	const [cp, setCP] = createSignal(startFOLD);
	// app state, ui, touch handlers
	const [tool, setTool] = createSignal("inspect");
	// windows and layout
	const [views, setViews] = createSignal(["crease pattern", "simulator", "diagram"]);
	const [language, setLanguage] = createSignal("en");
	const [darkMode, setDarkMode] = createSignal(deviceDarkMode);
	const [mobileLayout, setMobileLayout] = createSignal(window.innerWidth < window.innerHeight);
	const [showPanels, setShowPanels] = createSignal(true);
	const [showTerminal, setShowTerminal] = createSignal(false);
	const [showDiagramInstructions, setShowDiagramInstructions] = createSignal(true);
	// popups
	const [errorMessage, setErrorMessage] = createSignal();

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

	const windowDidResize = () => setMobileLayout(window.innerWidth < window.innerHeight);

	onMount(() => { window.addEventListener("resize", windowDidResize); });
	onCleanup(() => { window.removeEventListener("resize", windowDidResize); });

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
				<div class={`${Style.Views} Items-${views().length}`}>
					<Show when={views().includes("crease pattern")}>
						<svg />
					</Show>
					<Show when={views().includes("diagram")}>
						<svg />
					</Show>
					<Show when={views().includes("simulator")}>
						<canvas />
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
