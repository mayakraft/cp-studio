import Style from "./Menubar.module.css";
import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import { ParseFileString } from "../FileManager";
import {
	ISOCodeList,
	Endonyms,
	EndonymToCode,
} from "../Localization/Languages";
import Dict from "../Localization/dictionary.json";

const allViews = ["crease pattern", "simulator", "diagram"];
let inputFileRef;

const Hamburger = (props) => <ul>
	<li>
		<svg
			class="hamburger-svg"
			width="1.3rem"
			height="1.3rem"
			viewBox="0 0 20 20"
			stroke-width="4"
			stroke-linecap="round"
			stroke={props.darkMode() ? "#ccc" : "black"}>
			<line x1="3" y1="4" x2="17" y2="4"/>
			<line x1="3" y1="10" x2="17" y2="10"/>
			<line x1="3" y1="16" x2="17" y2="16"/>
		</svg>
		{props.children}
	</li>
</ul>;

const Navbar = (props) => {

	// translation
	const [T, setT] = createSignal(s => s);
	createEffect(() => {
		const newT = (s) => Dict[s] && Dict[s][props.language()] ? Dict[s][props.language()] : s;
		setT(() => newT);
	});

	return <ul>
		<li>{T()("file")}
			<ul>
				<li onClick={() => props.setShowNewPopup(true)}>{T()("new")}</li>
				<li onClick={() => inputFileRef.click()}>{T()("open")}</li>
				<li onClick={props.saveFile}>{T()("save")}</li>
			</ul>
		</li>
		<li>{T()("view")}
			<ul>
				<For each={allViews}>{(view) =>
					<li
						class={`menu-view-${view}`}
						highlighted={props.views().includes(view)}
						onClick={() => props.onClickView(view)}>{T()(view)}</li>
				}</For>
				<hr />
				<li
					onClick={() => props.setShowTerminal(!props.showTerminal())}
					highlighted={props.showTerminal().toString()}
				>{T()("show terminal")}</li>
				<li
					onClick={() => props.setShowPanels(!props.showPanels())}
					highlighted={props.showPanels().toString()}
				>{T()("show panels")}</li>
			</ul>
		</li>
		<li>{T()("preferences")}
			<ul>
				<li
					onClick={() => props.setDarkMode(!props.darkMode())}
					highlighted={props.darkMode().toString()}
				>{T()("dark mode")}</li>
				<li
					onClick={() => props.setShowDebugPanel(!props.showDebugPanel())}
					highlighted={props.showDebugPanel().toString()}
				>{T()("debug panel")}</li>
			</ul>
		</li>
		<li>{T()(Endonyms[props.language()])}
			<ul>
				<For each={ISOCodeList.map(code => Endonyms[code])}>{(language) =>
					<li
						onClick={() => props.setLanguage(EndonymToCode[language])}
						highlighted={Endonyms[props.language()] === language}
					>{language}</li>}
				</For>
			</ul>
		</li>

		<li>{T()("help")}
			<ul>
				<li onClick={() => props.setShowExamplesPopup(true)}>{T()("examples")}</li>
				<li onClick={() => {}}>{T()("about")}</li>
			</ul>
		</li>

	</ul>;
};


const Menubar = (props) => {

	const onClickView = (newView) => {
		const currentViews = props.views();
		if (currentViews.includes(newView)) {
			return props.setViews(currentViews.filter(a => a !== newView));
		} else {
			currentViews.push(newView);
			return props.setViews([...currentViews]);
		}
	};

	const fileDialogDidLoad = (string, filename, mimeType) => {
		const result = ParseFileString(string, filename, mimeType);
		if (result.error) { return props.setErrorMessage(result.error); }
		props.loadFile(result);
	};

	const fileDidLoad = (event) => {
		event.stopPropagation();
		event.preventDefault();
		// file reader and its callbacks
		let filename, mimeType;
		const reader = new FileReader();
		// reader.onerror = error => console.warn("FileReader error", error);
		// reader.onabort = abort => console.warn("FileReader abort", abort);
		reader.onload = loadEvent => fileDialogDidLoad(loadEvent.target.result, filename, mimeType);
		if (event.target.files.length) {
			mimeType = event.target.files[0].type;
			filename = event.target.files[0].name;
			return reader.readAsText(event.target.files[0]);
		}
		console.warn("FileReader no file selected");
	};

	const Nav = () => <Navbar
		setShowNewPopup={props.setShowNewPopup}
		setShowExamplesPopup={props.setShowExamplesPopup}
		saveFile={props.saveFile}
		views={props.views}
		darkMode={props.darkMode}
		setDarkMode={props.setDarkMode}
		language={props.language}
		setLanguage={props.setLanguage}
		showPanels={props.showPanels}
		setShowPanels={props.setShowPanels}
		showTerminal={props.showTerminal}
		setShowTerminal={props.setShowTerminal}
		onClickView={onClickView}
		// debug
		showDebugPanel={props.showDebugPanel}
		setShowDebugPanel={props.setShowDebugPanel}
	/>;

	return (<>
		<nav class={Style.Menubar}>
			<Show when={props.mobileLayout()}>
				<Hamburger darkMode={props.darkMode}>
					<Nav />
				</Hamburger>
			</Show>
			<Show when={!props.mobileLayout()}>
				<Nav />
			</Show>
			<input
				type="file"
				id="file"
				ref={inputFileRef}
				onChange={fileDidLoad.bind(this)} />
		</nav>
	</>);
};

export default Menubar;
