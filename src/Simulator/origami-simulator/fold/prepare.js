/**
 * Created by amandaghassaei on 2/25/17.
 */

import FOLD from "../lib/fold";
import triangulateFold from "./triangulateFold";
import splitCuts from "./splitCuts";
import removeRedundantVertices from "./removeRedundantVertices";
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
function prepare(inputFOLD, epsilon = 0.01) {
	// copy input object
	let fold = JSON.parse(JSON.stringify(inputFOLD));
	if (!fold.vertices_coords || !fold.edges_vertices || !fold.edges_assignment) { return fold; }
	// make 3d in the X-Y plane
	for (let i = 0; i < fold.vertices_coords.length; i += 1) {
		const vertex = fold.vertices_coords[i];
		if (vertex.length === 2) { // make vertices_coords 3d
			fold.vertices_coords[i] = [vertex[0], vertex[1], 0];
		}
	}
	// get the indices of every cut "C" edge.
	const cut_edge_indices = fold.edges_assignment
		.map((assign, i) => assign === "C" || assign === "c" ? i : undefined)
		.filter(a => a !== undefined);
	// turn cut edges into two boundary edges
	if (cut_edge_indices.length) {
		// todo this is untested
		FOLD.filter.cutEdges(fold, cut_edge_indices);
		fold = splitCuts(fold);
		fold = FOLD.convert.edges_vertices_to_vertices_vertices_unsorted(fold);
		fold = removeRedundantVertices(fold, epsilon); // remove vertices that split edge
	}
	delete fold.vertices_vertices;
	delete fold.vertices_edges;

	const foldData = triangulateFold(fold, true);
	return foldData;
};

export default prepare;
