import ear from "rabbit-ear";

const face = 0;

const MakeFoldedForm = (cp) => {
	const vertices_coords = cp.vertices_folded_coords
		? cp.vertices_folded_coords
		: ear.graph.make_vertices_coords_flat_folded(cp, face);
	const foldedForm = {
		...cp,
		vertices_coords,
		frame_classes: ["foldedForm"],
	};
	// delete foldedForm.vertices_folded_coords;

	// if (!foldedForm.faces_layer) {
	// 	// solve layer order
	// 	// console.log(foldedForm);
	// 	ear.graph.populate(foldedForm);
	// 	const faces_layers = ear.layer.make_faces_layers(foldedForm);
	// 	foldedForm.faces_layer = faces_layers[0];
	// 	cp.faces_layer = faces_layers[0]; // weird
	// }

	// console.log("foldedForm", foldedForm);
	return foldedForm;
};

export default MakeFoldedForm;
