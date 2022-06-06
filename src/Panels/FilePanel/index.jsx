import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import { stringifyPoint } from "../../Helpers";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";
import Dict from "../../Localization/dictionary.json";

// "file_classes": ["diagrams"],
// file_title
// file_author
// file_description
// file_spec
// file_creator


// <div class="flex-row left">
// 	<p>version: <b>{getFileMetaValue("file_spec")}</b></p>
// </div>


const preferenceCollapseKeys = ["panels", "filePanelCollapsed"];

const FilePanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));

	// translation
	const [T, setT] = createSignal(s => s);
	createEffect(() => {
		const newT = (s) => Dict[s] && Dict[s][props.language()] ? Dict[s][props.language()] : s;
		setT(() => newT);
	});

	createEffect(() => setPreference(preferenceCollapseKeys, isCollapsed()));

	const getFileMetaValue = (key) => props.fileMeta()[key]
		? props.fileMeta()[key]
		: "";

	const modifyFileMeta = (key, value) => {
		const meta = props.fileMeta();
		meta[key] = value;
		props.setFileMeta(meta);
	};

	return (
		<Panel
			title={T()("file")}
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<div class="flex-row left">
				<p>{T()("title")}:</p>
				<input
					type="text"
					value={getFileMetaValue("file_title")}
					oninput={e => modifyFileMeta("file_title", e.target.value)}
				/>
			</div>
			<div class="flex-row left">
				<p>{T()("author")}:</p>
				<input
					type="text"
					value={getFileMetaValue("file_author")}
					oninput={e => modifyFileMeta("file_author", e.target.value)}
				/>
			</div>
			<div class="flex-row left">
				<p>{T()("class")}: <b>{props.fileFrames().length === 1
					? "single model"
					: "diagrams"}</b></p>
			</div>
			<p>{T()("description")}:</p>
				<textarea
					rows="2"
					value={getFileMetaValue("file_description")}
					oninput={e => modifyFileMeta("file_description", e.target.value)}
				/>
		</Panel>
	);
};

export default FilePanel;
