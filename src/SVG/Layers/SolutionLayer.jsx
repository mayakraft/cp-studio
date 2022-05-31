import ear from "rabbit-ear";

const SolutionLayer = (svg) => {
	const layer = svg.g().setClass("solution-layer");

	layer.onChange = ({ solutions, rect }) => {
		layer.removeChildren();
		if (!solutions) { return; }
		solutions
			.filter(solution => solution instanceof ear.line
				|| solution instanceof ear.ray)
			.map(line => rect.clip(line))
			.filter(a => a !== undefined)
			.forEach(segment => layer.line(segment).setClass("solution-line"));
		solutions
			.filter(solution => solution instanceof ear.segment)
			.forEach(segment => layer.line(segment).setClass("solution-line"));
	};
	return layer;
};

export default SolutionLayer;
