import ear from "rabbit-ear";

const drawDiagramArrow = (layer, coords, classList) => layer.arrow(coords)
	.head({ width: 0.075, height: 0.1 })
	.bend(0.4)

const drawDiagramCrease = (layer, coords, classList) => layer.line(coords)
	.setClass(classList);

const DiagramLayer = (svg) => {
	const layer = svg.g().setClass("diagram-layer");

	layer.onChange = ({ origami, showDiagramInstructions }) => {
		// this will also set the SVG viewBox
		layer.removeChildren();
		if (!showDiagramInstructions) { return; }

		// even if classes don't exist, create an array the size of the crease coords containing
		// empty strings for non-existing ones, and the class list as a string for those that exist
		if (origami.diagram_creases_coords) {
			const creaseClasses = origami.diagram_creases_coords
				.map((_, i) => origami.diagram_creases_classes && origami.diagram_creases_classes.length
					? origami.diagram_creases_classes[i] : [])
				.map(classes => classes.join(" "));
			origami.diagram_creases_coords
				.map((coords, i) => drawDiagramCrease(layer, coords, creaseClasses[i]));
		}

		if (origami.diagram_arrows_coords) {
			const creaseClasses = origami.diagram_arrows_coords
				.map((_, i) => origami.diagram_arrows_classes && origami.diagram_arrows_classes.length
					? origami.diagram_arrows_classes[i] : [])
				.map(classes => classes.join(" "));
			origami.diagram_arrows_coords
				.map((coords, i) => drawDiagramArrow(layer, coords, creaseClasses[i]));
		}

	};
	return layer;
};

export default DiagramLayer;
