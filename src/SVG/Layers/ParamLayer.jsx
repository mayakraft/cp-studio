import ear from "rabbit-ear";

const ToolLayer = (svg) => {
	const manager = {};
	const layer = svg.g().setClass("param-layer");

	manager.onChange = ({ params }) => {
		layer.removeChildren();
		params
			.filter(param => param instanceof ear.polygon)
			.forEach(polygon => layer.polygon(polygon).setClass("param-face"));
		params
			.filter(param => param instanceof ear.segment)
			.forEach(segment => layer.line(segment).setClass("param-line"));
		params
			.filter(param => param instanceof ear.vector)
			.forEach(point => layer.circle(point).radius(0.02).setClass("param-circle"));
	};
	return manager;
};

export default ToolLayer;
