import trilateration from "../../FOLD/trilateration";

// scaled by the longest length of the origami
const radiusScale = 0.015;

const SimulatorLayer = (svg) => {
	const layer = svg.g().setClass("simulator-layer");

	layer.onChange = ({ origami, rect, simulatorPointers, showTouches }) => {
		layer.removeChildren();
		if (!showTouches) { return; }

		const vmax = rect ? Math.max(rect.width, rect.height) : 1;

		// convert indices of the intersected faces into polygons; arrays of point coords
		const triangles = simulatorPointers
			.map(el => el.face_vertices
				.map(vert => origami.vertices_coords[vert]));

		// highlight triangle face
		if (triangles.length) {
			layer.polygon(triangles[0]).setClass("simulator-polygon")
		}

		// highlight points
		simulatorPointers
			.map((el, i) => trilateration(triangles[i], el.touch_face_vertices_distance))
			.filter(a => a !== undefined)
			.forEach(point => layer.circle(point)
				.radius(vmax * radiusScale * 0.5)
				.setClass("simulator-circle"));

		// highlight nearest vertex
		if (simulatorPointers.length) {
			layer.circle(origami.vertices_coords[simulatorPointers[0].vertex])
				.radius(vmax * radiusScale)
				.setClass("simulator-vertex");
		}

	};
	return layer;
};

export default SimulatorLayer;
