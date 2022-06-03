import ear from "rabbit-ear";

// scaled by the longest length of the origami
const radiusScale = 0.015;

const ParamLayer = (svg) => {
	const layer = svg.g().setClass("param-layer");

	layer.onChange = ({ params, rect }) => {
		const vmax = rect ? Math.max(rect.width, rect.height) : 1;
		layer.removeChildren();
		params
			.filter(param => param instanceof ear.polygon)
			.forEach(polygon => layer.polygon(polygon).setClass("param-face"));
		params
			.filter(param => param instanceof ear.segment)
			.forEach(segment => layer.line(segment).setClass("param-line"));
		params
			.filter(param => param instanceof ear.vector)
			.forEach(point => layer.circle(point).radius(vmax * radiusScale).setClass("param-circle"));
	};
	return layer;
};

export default ParamLayer;
