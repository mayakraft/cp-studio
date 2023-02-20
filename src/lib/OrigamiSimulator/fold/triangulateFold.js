/**
 * Created by amandaghassaei on 2/25/17.
 */
import earcut from "earcut";
/**
 * @description distance squared between two points, 2D or 3D
 */
const distance_sq = (a, b) => {
	const vector = [
		b[0] - a[0],
		b[1] - a[1],
		(b[2] || 0) - (a[2] || 0)];
	return (vector[0] ** 2) + (vector[1] ** 2) + (vector[2] ** 2);
};
/**
 * @description deep copy a fold object. only keep 5 of the arrays:
 * - vertices_coords,
 * - edges_vertices/assignment/foldAngle
 * - faces_vertices
 */
const copy_fold = fold => JSON.parse(JSON.stringify({
	vertices_coords: fold.vertices_coords || [],
	edges_vertices: fold.edges_vertices || [],
	edges_foldAngle: fold.edges_foldAngle || [],
	edges_assignment: fold.edges_assignment || [],
	faces_vertices: fold.faces_vertices || [],
}));
// returns a copy of the original, where the copy
// contains triangulated faces, and
// DOES NOT modify the original
function triangulatedFOLD(inputFOLD, is2d) {
	const fold = copy_fold(inputFOLD);
	// as this loop encounters faces which need to be subdivided, the loop
	// will add the necessary edges to the "fold" graph, however,
	// faces_vertices will be built from scratch then set at the end.
	const triangulated_vertices = [];
	for (let i = 0; i < fold.faces_vertices.length; i += 1) {
		const face = fold.faces_vertices[i];
		// face is already a triangle
		if (face.length === 3) {
			triangulated_vertices.push(face);
			continue;
		}
		// face is a quad, manually triangulate.
		// todo: this assumes the face is convex!
		if (face.length === 4) {
			const dist1 = distance_sq(
				fold.vertices_coords[face[0]],
				fold.vertices_coords[face[2]],
			);
			const dist2 = distance_sq(
				fold.vertices_coords[face[1]],
				fold.vertices_coords[face[3]],
			);
			if (dist2 < dist1) {
				fold.edges_vertices.push([face[1], face[3]]);
				fold.edges_foldAngle.push(0);
				fold.edges_assignment.push("F");
				triangulated_vertices.push([face[0], face[1], face[3]]);
				triangulated_vertices.push([face[1], face[2], face[3]]);
			} else {
				fold.edges_vertices.push([face[0], face[2]]);
				fold.edges_foldAngle.push(0);
				fold.edges_assignment.push("F");
				triangulated_vertices.push([face[0], face[1], face[2]]);
				triangulated_vertices.push([face[0], face[2], face[3]]);
			}
			continue;
		}
		// if the face is not a triangle or a quad, use the earcut library
		const faceEdges = [];
		for (let j = 0; j < fold.edges_vertices.length; j += 1) {
			const edge = fold.edges_vertices[j];
			if (face.indexOf(edge[0]) >= 0 && face.indexOf(edge[1]) >= 0) {
				faceEdges.push(j);
			}
		}
		// oh no, somewhere in this library, the 3D modeler is switching
		// all the Z and Y values to move the crease pattern into the XZ plane.
		// update: this was fixed. if this ever happens again, here was the fix.
		// const dim = is2d ? [0,2] : [0,2,1];
		const dim = is2d ? [0, 1] : [0, 1, 2];
		const faceVert = fold.faces_vertices[i]
			.flatMap(v => dim.map(d => fold.vertices_coords[v][d]));

		const triangles = earcut(faceVert, null, is2d ? 2 : 3);

		for (let j = 0; j < triangles.length; j += 3) {
			// this fixes the bug where triangles from earcut() have backwards winding
			// const tri = [face[triangles[j + 2]], face[triangles[j + 1]], face[triangles[j]]];
			const tri = [
				face[triangles[j + 1]],
				face[triangles[j + 2]],
				face[triangles[j]],
			];
			const foundEdges = [false, false, false]; // ab, bc, ca

			for (let k = 0; k < faceEdges.length; k += 1) {
				const edge = fold.edges_vertices[faceEdges[k]];

				const aIndex = edge.indexOf(tri[0]);
				const bIndex = edge.indexOf(tri[1]);
				const cIndex = edge.indexOf(tri[2]);

				if (aIndex >= 0) {
					if (bIndex >= 0) {
						foundEdges[0] = true;
						continue;
					}
					if (cIndex >= 0) {
						foundEdges[2] = true;
						continue;
					}
				}
				if (bIndex >= 0) {
					if (cIndex >= 0) {
						foundEdges[1] = true;
						continue;
					}
				}
			}

			for (let k = 0; k < 3; k += 1) {
				if (foundEdges[k]) continue;
				if (k === 0) {
					faceEdges.push(fold.edges_vertices.length);
					fold.edges_vertices.push([tri[0], tri[1]]);
					fold.edges_foldAngle.push(0);
					fold.edges_assignment.push("F");
				} else if (k === 1) {
					faceEdges.push(fold.edges_vertices.length);
					fold.edges_vertices.push([tri[2], tri[1]]);
					fold.edges_foldAngle.push(0);
					fold.edges_assignment.push("F");
				} else if (k === 2) {
					faceEdges.push(fold.edges_vertices.length);
					fold.edges_vertices.push([tri[2], tri[0]]);
					fold.edges_foldAngle.push(0);
					fold.edges_assignment.push("F");
				}
			}
			triangulated_vertices.push(tri);
		}
	}
	fold.faces_vertices = triangulated_vertices;
	return fold;
}

export default triangulatedFOLD;
