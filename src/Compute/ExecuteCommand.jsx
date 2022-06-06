import ear from "rabbit-ear";
import { stringifyPoint } from "../Helpers";

const ptStr = (p) => stringifyPoint(p, 16, ", ");

const LineBetweenPoints = (params, solutions, toolStep) => {
	return `cp.line.fromPoints(${ptStr(params[0])}, ${ptStr(params[1])})`;
};
const RayBetweenPoints = (params, solutions, toolStep) => {
	return `cp.ray.fromPoints(${ptStr(params[0])}, ${ptStr(params[1])})`;
};
const SegmentBetweenPoints = (params, solutions, toolStep) => {
	return `cp.segment(${ptStr(params[0])}, ${ptStr(params[1])})`;
};
const Axiom2 = (params, solutions, toolStep) => {
	return `ear.axiom(2, {points:[[${ptStr(params[0])}], [${ptStr(params[1])}]]})`;
};
const Axiom3 = (params, solutions, toolStep) => {
	const lines = params
		.map(param => `{ vector: [${ptStr(param.vector)}], origin: [${ptStr(param.origin)}] }`);
	return `ear.axiom(3, {lines:[${lines[0]}, ${lines[1]}]})`;
};
const Axiom4 = (params, solutions, toolStep) => {
	const line = `{ vector: [${ptStr(params[0].vector)}], origin: [${ptStr(params[0].origin)}] }`;
	const point = ptStr(params[1]);
	return `ear.axiom(4, {points:[${point}], lines:[${line}]})`;
};
const Scribble = (params, solutions, toolStep) => {};
const Zoom = (params, solutions, toolStep) => {};

const ExecuteCommand = ({ tool, params, solutions, toolStep }) => {
	if (toolStep[0] === undefined || toolStep[0] === 0 || toolStep[0] !== toolStep[1]) {
		return;
	}
	if (toolStep[0] === -1) { return "rejected"; }
	switch (tool) {
		case "inspect": return "success";
		// case "remove": break;
		case "line": return LineBetweenPoints(params, solutions, toolStep);
		case "ray": return RayBetweenPoints(params, solutions, toolStep);
		case "segment": return SegmentBetweenPoints(params, solutions, toolStep);
		case "point-to-point": return Axiom2(params, solutions, toolStep);
		case "line-to-line": return Axiom3(params, solutions, toolStep);
		case "perpendicular": return Axiom4(params, solutions, toolStep);
		case "scribble": return Scribble(params, solutions, toolStep);
		// case "pleat": return LineToLine(params, solutions, toolStep);
		// case "assignment": return SingleLine(params, solutions, toolStep);
		// case "transform": break;
		// case "zoom": break;
		default: return undefined;
	}
};

export default ExecuteCommand;
