import ear from "rabbit-ear";

const assignNearestLine = (lines, pointer) => {
	if (!pointer) { return; }
	const point = [pointer.x, pointer.y];
	const points = lines.map(line => line.nearestPoint(point));
	const distances = points.map(pt => ear.math.distance2(pt, point));
	const nearest = distances.map((d, i) => ({ d, i }))
		.sort((a, b) => a.d - b.d)
		.map(el => el.i)
		.shift();
	// console.log("nearest", nearest);
	lines[nearest].classList = ["nearest"];
};

const LineBetweenPoints = (params) => {
	switch (params.length) {
		case 2: return [ear.line.fromPoints(...params)];
		default: return [];
	}
};
const RayBetweenPoints = (params) => {
	switch (params.length) {
		case 2: return [ear.ray.fromPoints(...params)];
		default: return [];
	}
};
const SegmentBetweenPoints = (params) => {
	switch (params.length) {
		case 2: return [ear.segment(...params)];
		default: return [];
	}
};
const Axiom2 = (params) => {
	switch (params.length) {
		case 2: return ear.axiom(2, { points: params });
		default: return [];
	}
};
const Axiom3 = (params, pointer) => {
	switch (params.length) {
		case 2: {
			const solutions = ear.axiom(3, { lines: params.map(pts => ear.line.fromPoints(pts)) });
			if (solutions.length === 2) { assignNearestLine(solutions, pointer); }
			return solutions;
		}
		default: return [];
	}
};
const Axiom4 = (params) => {
	switch (params.length) {
		case 2: return ear.axiom(4, { points: [params[1]], lines: [ear.line.fromPoints(params[0])] });
		default: return [];
	}
};
const Scribble = (params) => {
	switch (params.length) {
		case 1: return [...params];
		default: return [];
	}
};
// const Zoom = (params) => {
// 	switch (params.length) {
// 		case 2: return ear.axiom(4, { points: [params[1]], lines: [ear.line.fromPoints(params[0])] });
// 		default: return [];
// 	}
// };
const MakeSolutions = ({ tool, params, pointer }) => {
	switch (tool) {
		case "inspect": return undefined;
		// case "remove": break;
		case "line": return LineBetweenPoints(params, pointer);
		case "ray": return RayBetweenPoints(params, pointer);
		case "segment": return SegmentBetweenPoints(params, pointer);
		case "point-to-point": return Axiom2(params, pointer);
		case "line-to-line": return Axiom3(params, pointer);
		case "perpendicular": return Axiom4(params, pointer);
		case "scribble": return Scribble(params, pointer);
		// case "pleat": return LineToLine(params, pointer);
		// case "assignment": return SingleLine(params, pointer);
		// case "transform": break;
		// case "zoom": break;
		default: return [];
	}
};

export default MakeSolutions;
