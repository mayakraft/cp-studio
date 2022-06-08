import ear from "rabbit-ear";

const SolutionLayer = (svg) => {
	const layer = svg.g().setClass("solution-layer");

	layer.onChange = ({ solutions, rect }) => {
		layer.removeChildren();
		if (!solutions) { return; }
		const lineRays = solutions
			.filter(solution => solution instanceof ear.line || solution instanceof ear.ray);
		const classes = lineRays.map(el => el.classList);
		lineRays.forEach((line, i) => {
			const segment = rect.clip(line);
			if (!segment) { return; }
			const classList = classes[i] == null ? ["solution-line"] : ["solution-line", ...classes[i]]
			layer.line(segment).setClass(classList.join(" "));
		});
		// solutions
		// 	.filter(solution => solution instanceof ear.line
		// 		|| solution instanceof ear.ray)
		// 	.map(line => rect.clip(line))
		// 	.filter(a => a !== undefined)
		// 	.forEach(segment => layer.line(segment).setClass("solution-line"));
		solutions
			.filter(solution => solution instanceof ear.segment)
			.forEach(segment => layer.line(segment).setClass("solution-line"));
		solutions
			.filter(solution => solution instanceof ear.polyline)
			.forEach(polyline => layer.polyline(polyline).setClass("solution-line"));
	};
	return layer;
};

export default SolutionLayer;
