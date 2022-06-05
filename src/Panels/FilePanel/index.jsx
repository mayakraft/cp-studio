import { createSignal, createEffect } from "solid-js";
import Panel from "../Panel";
import { stringifyPoint } from "../../Helpers";
import {
	getPreference,
	setPreference,
} from "../../LocalStorage";

// "file_spec": 1.1,
// "file_classes": ["diagrams"],
// "file_author": "",
// "file_title": "",
// "file_frames": [],


// file_title
// file_author
// file_description
// file_spec
// file_creator

const preferenceCollapseKeys = ["panels", "filePanelCollapsed"];

const FilePanel = (props) => {
	const [isCollapsed, setIsCollapsed] = createSignal(getPreference(preferenceCollapseKeys));
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
			title="File"
			isCollapsed={isCollapsed}
			setIsCollapsed={setIsCollapsed}>
			<div class="flex-row left">
				<p>title:</p>
				<input
					type="text"
					value={getFileMetaValue("file_title")}
					oninput={e => modifyFileMeta("file_title", e.target.value)}
				/>
			</div>
			<div class="flex-row left">
				<p>author:</p>
				<input
					type="text"
					value={getFileMetaValue("file_author")}
					oninput={e => modifyFileMeta("file_author", e.target.value)}
				/>
			</div>
			<p>description:</p>
				<textarea
					rows="2"
					value={getFileMetaValue("file_description")}
					oninput={e => modifyFileMeta("file_description", e.target.value)}
				/>
			<hr />
			<div class="flex-row left">
				<p>version: <b>{getFileMetaValue("file_spec")}</b></p>
			</div>
			<div class="flex-row left">
				<p>kind: <b>{props.fileFrames().length === 1
					? "crease pattern"
					: "diagrams"}</b></p>
			</div>
		</Panel>
	);
};

export default FilePanel;
