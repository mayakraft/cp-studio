/**
 * Created by amandaghassaei on 2/25/17.
 */
import triangulateFold from "./triangulateFold.js";
import splitCuts from "./splitCuts.js";
import removeRedundantVertices from "./removeRedundantVertices.js";
import boundingBox from "./boundingBox.js";
import {
	makeVerticesEdges,
	makeVerticesVertices,
} from "./adjacentVertices.js";

const assignmentFlatAngles = {
	M: -180, m: -180, V: 180, v: 180,
};
const makeEdgesFoldAngle = ({ edges_assignment }) => edges_assignment
	.map(a => assignmentFlatAngles[a] || 0);
/**
 * @description prepare a FOLD object for the GPU, returning a copy.
 * (does not modify the input object)
 * - ensure vertices are 3D (give a 2D crease pattern 0.0 z values)
 * - triangulate faces (changes # of faces, edges)
 * - turn each cut edge "C" into two boundary "B" edges.
 *
 * "epsilon" is used only for cutting "C" edges.
 *
 * This was refactored from globals.pattern.setFoldData, where the
 * second optional parameter was also used to run "returnCreaseParams".
 * This is changed, now model/index calls "returnCreaseParams" directly.
 */
const prepare = (inputFOLD, epsilon) => {
	// copy input object
	let fold = JSON.parse(JSON.stringify(inputFOLD));
	// these fields are absolutely necessary
	if (!fold.vertices_coords || !fold.edges_vertices) {
		throw new Error("model must contain vertices_coords and edges_vertices");
	}
	// one of these two fields is absolutely necessary.
	// we need edges_foldAngle, but we can infer it from edges_assignment
	if (!fold.edges_assignment && !fold.edges_foldAngle) {
		throw new Error("model must contain either edges_assignment or edges_foldAngle");
	}
	// if edges_foldAngle does not exist, set it from edges_assignment
	if (fold.edges_assignment && !fold.edges_foldAngle) {
		fold.edges_foldAngle = makeEdgesFoldAngle(fold);
	}

	// find a nice epsilon for vertex merging, unless the user specified one.
	if (epsilon === undefined) {
		const box = boundingBox(fold);
		epsilon = box ? Math.min(...box.span) * 1e-4 : 0.01;
	}

	// make 3d in the X-Y plane
	for (let i = 0; i < fold.vertices_coords.length; i += 1) {
		const vertex = fold.vertices_coords[i];
		if (vertex.length === 2) { // make vertices_coords 3d
			fold.vertices_coords[i] = [vertex[0], vertex[1], 0];
		}
	}
	// get the indices of every cut "C" edge.
	const cut_edge_indices = fold.edges_assignment
		.map((assign, i) => (assign === "C" || assign === "c" ? i : undefined))
		.filter(a => a !== undefined);
	// if cut creases exist, convert them into boundaries
	if (cut_edge_indices.length > 0) {
		if (!fold.vertices_vertices) {
			fold.vertices_vertices = makeVerticesVertices(fold);
		}
		fold.vertices_edges = makeVerticesEdges(fold);
		fold = splitCuts(fold);
		// removeRedundantVertices requires vertices_vertices. rebuild.
		fold.vertices_vertices = makeVerticesVertices(fold);
		// remove vertices that split edge
		fold = removeRedundantVertices(fold, 0.01);
	}
	delete fold.vertices_vertices;
	delete fold.vertices_edges;
	const foldData = triangulateFold(fold, true);
	return foldData;
};

export default prepare;
