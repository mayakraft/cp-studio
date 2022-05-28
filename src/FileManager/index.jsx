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

const emptyDiagramFOLD = () => ({
	"file_spec": 1.1,
	"file_classes": ["diagrams"],
	"file_author": "",
	"file_title": "",
	"file_frames": [],
});

const requiredDiagramKeys = () => ({
	"file_spec": 1.1,
	"file_classes": ["diagrams"],
});

/**
 * @description get all keys that start with "file_", EXCEPT for "file_frames".
 */
const getAllFileKeys = (fold) => Object.keys(fold)
	.filter(a => a.substring(0, 5) === "file_")
	.filter(a => a !=="file_frames");
export const getFileMeta = (fold) => {
	const meta = {};
	getAllFileKeys(fold).forEach(key => meta[key] = fold[key]);
	return meta;
}
/**
 * @description given a FOLD object that is a single model,
 * create a "file_frames" array and move its data into the first element spot.
 */
const makeDiagramFromSingleModel = (fold) => {
	const diagrams = emptyDiagramFOLD();
	getAllFileKeys(fold).forEach(key => diagrams[key] = fold[key]);
	diagrams.file_frames = [fold];
	Object.assign(diagrams, requiredDiagramKeys());
	return diagrams;
};
/**
 * @description standardize a given FOLD object by moving all data into file_frames
 * and set up the top level to be a "diagram" type.
 * if already a diagram, simply return the data.
 * @warning this will modify the input parameter.
 */
export const makeDiagramFormatFOLD = (fold) => {
	// if the file was built nicely, check "file_classes" for "diagrams" or "singleModel"
	if (fold.file_classes) {
		// done. just return the given parameter
		if(fold.file_classes.includes("diagrams")) {
			// nope, they lied. not a diagram. turn it into a diagram
			if (!fold.file_frames && fold.vertices_coords) {
				return makeDiagramFromSingleModel(fold);
			}
			return fold;
		}
		// convert a single model into a diagram
		if(fold.file_classes.includes("singleModel")) {
			return makeDiagramFromSingleModel(fold);
		}
		// warning, entering non-standardized area. gotta figure out what
		// kind of file the user gave us.
		return makeDiagramFromSingleModel(fold);
	}
	// non-standardized area continued...
	if (fold.file_frames && fold.file_frames.length) {
		// yes it is probably a diagram, just missing the "file_classes"
		fold.file_classes = ["diagrams"];
		return fold;
	}
	return makeDiagramFromSingleModel(fold);
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

export const makeFOLDFile = (metadata, fileFrames) => {
	const foldFile = {};
	if (fileFrames.length === 1) {
		Object.assign(foldFile, fileFrames[0]);
		Object.assign(foldFile, metadata);
	} else {
		Object.assign(foldFile, metadata);
		foldFile.file_frames = fileFrames;
	}
	return foldFile;
	// console.log("makeFOLDFile", fileFrames.length);
	// console.log(metadata);
	// console.log(fileFrames);
};

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

