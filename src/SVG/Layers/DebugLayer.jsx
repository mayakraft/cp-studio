const DebugLayer = (svg) => {
	const layer = svg.g().setClass("debug-layer");

	layer.onChange = ({ presses, drags, releases }) => {
		layer.removeChildren();
		layer.polyline(drags).setClass("drag-line");
		presses.forEach(press => layer
			.circle(press)
			.radius(0.02)
			.setClass("press-circle"));
		releases.forEach(release => layer
			.circle(release)
			.radius(0.02)
			.setClass("release-circle"));
	};
	return layer;
};

export default DebugLayer;
