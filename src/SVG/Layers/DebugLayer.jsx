const DebugLayer = (svg) => {
	const manager = {};
	const layer = svg.g();

	manager.onChange = ({ presses, drags, releases }) => {
		layer.removeChildren();

		layer.polyline(drags).setClass("debug-line");
		presses.forEach(press => layer
			.circle(press)
			.radius(0.02)
			.stroke("none")
			.fill("#3c7"));
		releases.forEach(release => layer
			.circle(release)
			.radius(0.02)
			.stroke("none")
			.fill("#e53"));

		// if (cpTouchState.hover) {
		// 	layer.text("+", cpTouchState.hover.x, cpTouchState.hover.y)
		// 		.alignmentBaseline("middle")
		// 		.dominantBaseline("middle")
		// 		.textAnchor("middle")
		// 		.fontSize("0.1px")
		// 		.stroke("none")
		// 		.fill("#888");
		// }
	};
	return manager;
};

export default DebugLayer;
