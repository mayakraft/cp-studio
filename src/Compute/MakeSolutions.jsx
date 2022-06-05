import ear from "rabbit-ear";

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
const Axiom3 = (params) => {
	switch (params.length) {
		case 2: return ear.axiom(3, { lines: params.map(pts => ear.line.fromPoints(pts)) });
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
const MakeSolutions = ({ tool, params, toolStep }) => {
	switch (tool) {
		case "inspect": return undefined;
		// case "remove": break;
		case "line": return LineBetweenPoints(params, toolStep);
		case "ray": return RayBetweenPoints(params, toolStep);
		case "segment": return SegmentBetweenPoints(params, toolStep);
		case "point-to-point": return Axiom2(params, toolStep);
		case "line-to-line": return Axiom3(params, toolStep);
		case "perpendicular": return Axiom4(params, toolStep);
		case "scribble": return Scribble(params, toolStep);
		// case "pleat": return LineToLine(params, toolStep);
		// case "assignment": return SingleLine(params, toolStep);
		// case "transform": break;
		// case "zoom": break;
		default: return [];
	}
};

export default MakeSolutions;
