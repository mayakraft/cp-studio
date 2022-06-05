// import ear from "rabbit-ear";

// returns an object with two keys. only one will exist:
// - data: the fold object, if successfull
// - error: an error message, if there was an error

// const prepare = (cp) => {
// 	ear.graph.populate(cp);
// 	// solve folded state vertices positions
// 	if (!cp.vertices_folded_coords) {
// 		cp.vertices_folded_coords = ear.graph.make_vertices_coords_flat_folded(cp);
// 	}
// 	// solve layer order
// 	// if (!cp.faces_layer) {
// 	// 	const folded = {
// 	// 		...cp,
// 	// 		vertices_coords: cp.vertices_folded_coords,
// 	// 		frame_classes: ["foldedForm"],
// 	// 	}
// 	// 	const faces_layers = ear.layer.make_faces_layers(folded);
// 	// 	cp.faces_layer = faces_layers[0];
// 	// }
// 	return cp;
// };

// const emptyDiagramFOLD = () => ({
// 	"file_spec": 1.1,
// 	"file_classes": ["diagrams"],
// 	"file_author": "",
// 	"file_title": "",
// 	"file_frames": [],
// });

// 	// "file_creator": "",

// const requiredDiagramKeys = () => ({
// 	"file_spec": 1.1,
// 	"file_classes": ["diagrams"],
// });

/**
 * @description get all keys that start with "file_", EXCEPT for "file_frames".
 */
const getNonFileKeys = (fold) => Object.keys(fold)
	.filter(a => a.substring(0, 5) !== "file_");
/**
 * @description get all keys that start with "file_", EXCEPT for "file_frames".
 */
const getAllSimpleFileKeys = (fold) => Object.keys(fold)
	.filter(a => a.substring(0, 5) === "file_")
	.filter(a => a !=="file_frames");
/**
 *
 */
const getFileMetadata = (fold) => {
	const meta = {};
	getAllSimpleFileKeys(fold).forEach(key => meta[key] = fold[key]);
	return meta;
};
/**
 * @description given a FOLD object that is a single model,
 * give us back everything minus the file_ entries.
 */
const filterFileEntries = (fold) => {
	const graph = {};
	getNonFileKeys(fold).forEach(key => { graph[key] = fold[key]; });
	// if (!fold.frame_classes) { fold.frame_classes = ["creasePattern"]; }
	return graph;
};

/**
 * @description load both diagrams and singleModels, separate out the metadata,
 * return both the metadata and the file where the file is given as an array
 * of file_frames
 */
export const loadFOLDMetaAndFrames = (fold) => {
	// if (!fold.frame_classes) { fold.frame_classes = ["creasePattern"]; }
	const metadata = getFileMetadata(fold);
	if (fold.file_frames && fold.file_frames.length) {
		// assuming this is probably a diagram
		// fold.file_classes = ["diagrams"];
		const file_frames = fold.file_frames;
		return { metadata, file_frames };
	}
	const singleModel = filterFileEntries(fold);
	const file_frames = [singleModel];
	return { metadata, file_frames };
};
/**
 * @description given a crase pattern or a sequence (FOLD format), this will
 * return a sequence, or an error if there was an issue loading
 */
export const ParseFileString = (string) => {
	// check if the crease pattern is a SET OF CPs (diagram), or a single fold crease pattern.
	try {
		return JSON.parse(string);
	} catch (error) {
		if (error.message.includes("JSON")) {
			return {
				error: {
					title: "file load error",
					header: "issue parsing JSON",
					body: "This application supports FOLD file format (JSON-based). There was an error parsing the file. Either the file is the wrong format entirely, or there is a bad character in the file.",
				}
			};
		}
		return {
			error: {
				header: "unknown",
				body: "JSON parse successfull, unknown error.",
			}
		};
	}
};

const emptyDiagramFOLD = () => ({
	"file_spec": 1.1,
	"file_classes": ["diagrams"],
	"file_creator": "Rabbit Ear",
});

const emptySingleModelFOLD = () => ({
	"file_spec": 1.1,
	"file_classes": ["singleModel"],
	"file_creator": "Rabbit Ear",
});

const makeDiagramFOLD = (metadata, file_frames) => {
	const foldFile = emptyDiagramFOLD();
	Object.assign(foldFile, metadata);
	foldFile.file_frames = file_frames;
	Object.assign(foldFile, emptyDiagramFOLD());
	return foldFile;
};

const makeSingleModelFOLD = (metadata, graph) => {
	const foldFile = emptySingleModelFOLD();
	Object.assign(foldFile, metadata);
	Object.assign(foldFile, graph);
	Object.assign(foldFile, emptySingleModelFOLD());
	return foldFile;
};

export const makeFOLDFile = (metadata, fileFrames) => fileFrames.length === 1
	? makeSingleModelFOLD(metadata, fileFrames[0])
	: makeDiagramFOLD(metadata, fileFrames);

/**
 * @param {string} contents already in a string format
 * @param {string} filename
 */
export const downloadFile = (contents, filename = "origami.fold") => {
	const element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};
