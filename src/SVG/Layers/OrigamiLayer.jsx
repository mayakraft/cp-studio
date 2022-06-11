import ear from "rabbit-ear";

const options = {
	vertices: false,
	// viewBox: true,
	strokeWidth: 1/200,
};

const OrigamiLayer = (svg) => {
	const layer = svg.g().setClass("origami-layer");

	layer.onChange = ({ origami }) => {
		layer.removeChildren();
		ear.graph.svg.drawInto(layer, origami, options);
		// move the calculated stroke width to the top SVG element
		// and use this value to update style on other layers too.
		const strokeWidth = layer.getAttribute("stroke-width");
		layer.removeAttribute("stroke-width");
		svg.strokeWidth(strokeWidth);
	};
	return layer;
};

export default OrigamiLayer;
