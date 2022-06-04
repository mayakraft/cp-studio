// scaled by the longest length of the origami
const radiusScale = 0.015;

const DebugLayer = (svg) => {
	const layer = svg.g().setClass("debug-layer");

	layer.onChange = ({ presses, drags, releases, rect }) => {
		const vmax = rect ? Math.max(rect.width, rect.height) : 1;
		layer.removeChildren();
		layer.polyline(drags).setClass("drag-line");
		presses.forEach(press => layer
			.circle(press)
			.radius(vmax * radiusScale)
			.setClass("press-circle"));
		releases.forEach(release => layer
			.circle(release)
			.radius(vmax * radiusScale)
			.setClass("release-circle"));
	};
	return layer;
};

export default DebugLayer;
