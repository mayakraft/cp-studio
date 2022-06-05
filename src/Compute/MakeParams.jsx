import ear from "rabbit-ear";

const toVector = (point, vertexSnapping = false) => vertexSnapping
	? ear.vector(point.nearest.vertex_coords)
	: ear.vector(point.x, point.y)

const toSegment = (coords) => ear.segment(...coords);

const Inspect = ({ pointer, presses, drags, releases, vertexSnapping }) => {
	return !pointer || !pointer.nearest ? [] : [
		toVector(pointer, true),
		toSegment(pointer.nearest.edge_coords), // pointer.nearest.edge_assignment
		pointer.nearest.face_coords ? ear.polygon(pointer.nearest.face_coords) : undefined
	].filter(a => a !== undefined);
};

const SingleLine = ({ pointer, presses, drags, releases, vertexSnapping }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return pointer && pointer.nearest ? [toSegment(pointer.nearest.edge_coords)] : [];
		case "1 0": return [toSegment(presses[0].nearest.edge_coords)];
		case "1 1": return [toSegment(releases[0].nearest.edge_coords)];
		default: return [];
	}
};

const PointToPoint = ({ pointer, presses, drags, releases, vertexSnapping }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return pointer && pointer.nearest ? [toVector(pointer, vertexSnapping)] : [];
		case "1 0": return [toVector(presses[0], vertexSnapping), toVector(pointer, vertexSnapping)];
		case "1 1": return [toVector(presses[0], vertexSnapping), toVector(releases[0], vertexSnapping)];
		default: return [];
	}
};

const LineToLine = ({ pointer, presses, drags, releases, vertexSnapping }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return pointer && pointer.nearest ? [toSegment(pointer.nearest.edge_coords)] : [];
		case "1 0": return [toSegment(presses[0].nearest.edge_coords), toSegment(pointer.nearest.edge_coords)];
		case "1 1":
		case "2 1": return [toSegment(presses[0].nearest.edge_coords), toSegment(releases[0].nearest.edge_coords)];
		default: return [];
	}
};

const Perpendicular = ({ pointer, presses, drags, releases, vertexSnapping }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return pointer && pointer.nearest ? [toSegment(pointer.nearest.edge_coords)] : [];
		case "1 0": return [toSegment(presses[0].nearest.edge_coords), toVector(pointer, vertexSnapping)];
		case "1 1": return [toSegment(presses[0].nearest.edge_coords), toVector(releases[0], vertexSnapping)];
		default: return [];
	}
};

const Scribble = ({ pointer, presses, drags, releases }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "1 0": return [ear.polyline([presses[0], ...drags])];
		case "1 1": return [ear.polyline([presses[0], ...drags, releases[0]])];
		default: return [];
	}
};

const Zoom = ({ pointer, presses, drags, releases }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "1 0": return pointer && pointer.nearest
			? [ear.rect.fromPoints(toVector(presses[0]), toVector(pointer))]
			: [];
		case "1 1": return [ear.rect.fromPoints(toVector(presses[0]), toVector(releases[0]))];
		default: return [];
	}
};

const MakeParams = ({ tool, pointer, presses, drags, releases, vertexSnapping }) => {
	const params = { pointer, presses, drags, releases, vertexSnapping };
	switch (tool) {
		case "inspect": return Inspect(params);
		case "remove": return SingleLine(params);
		case "line": return PointToPoint(params);
		case "ray": return PointToPoint(params);
		case "segment": return PointToPoint(params);
		case "point-to-point": return PointToPoint(params);
		case "line-to-line": return LineToLine(params);
		case "perpendicular": return Perpendicular(params);
		case "scribble": return Scribble(params);
		case "pleat": return LineToLine(params);
		case "assignment": return SingleLine(params);
		// case "transform": break;
		case "zoom": return Zoom(params);
		default: return [];
	}
};

export default MakeParams;

// const assignmentClass = {
// 	M: "mountain",
// 	m: "mountain",
// 	V: "valley",
// 	v: "valley",
// 	F: "flat",
// 	f: "flat",
// 	B: "boundary",
// 	b: "boundary",
// 	U: "unassigned",
// 	u: "unassigned",
// };
