import ear from "rabbit-ear";
import { stringifyPoint } from "../Helpers";

const ptStr = (p) => stringifyPoint(p, 16, ", ");

const LineBetweenPoints = (params, solutions, toolStep) => {
	return { op: `cp.line.fromPoints(${ptStr(params[0])}, ${ptStr(params[1])})` };
};
const RayBetweenPoints = (params, solutions, toolStep) => {
	return { op: `cp.ray.fromPoints(${ptStr(params[0])}, ${ptStr(params[1])})` };
};
const SegmentBetweenPoints = (params, solutions, toolStep) => {
	return { op: `cp.segment(${ptStr(params[0])}, ${ptStr(params[1])})` };
};
const Axiom2 = (params, solutions, toolStep) => {
	return { op: `ear.axiom(2, {points:[[${ptStr(params[0])}], [${ptStr(params[1])}]]})` };
};
const Axiom3 = (params, solutions, toolStep) => {
	const lines = params
		.map(param => `{ vector: [${ptStr(param.vector)}], origin: [${ptStr(param.origin)}] }`);
	return { op: `ear.axiom(3, {lines:[${lines[0]}, ${lines[1]}]})` };
};
const Axiom4 = (params, solutions, toolStep) => {
	const line = `{ vector: [${ptStr(params[0].vector)}], origin: [${ptStr(params[0].origin)}] }`;
	const point = ptStr(params[1]);
	return { op: `ear.axiom(4, {points:[${point}], lines:[${line}]})` };
};
const Axiom5 = (params, solutions, toolStep) => {
	return { op: `ear.axiom(5, {points:[], lines:[]})` };
};
const Axiom6 = (params, solutions, toolStep) => {
	return { op: `ear.axiom(6, {points:[], lines:[]})` };
};
const Axiom7 = (params, solutions, toolStep) => {
	return { op: `ear.axiom(7, {points:[], lines:[]})` };
};
const Scribble = (params, solutions, toolStep) => {
	return { op: "" };
};
const Zoom = (params, solutions, toolStep) => {
	const args = solutions.length
		? [`${solutions[0].x} ${solutions[0].y} ${solutions[0].width} ${solutions[0].height}`]
		: [];
	return { fn: "setViewBox", args };
};
/**
 * @returns given the input params, solutions, and step number, generate the command to execute
 * - {undefined} if the command is not yet ready, return undefined and the touches
 * will continue to be added to their touch arrays.
 * - {object} if the command is ready, return an object with "op", "tool" keys.
 */
const MakeCommand = ({ tool, params, solutions, toolStep }) => {
	if (toolStep[0] === undefined || toolStep[0] === 0 || toolStep[0] !== toolStep[1]) {
		return undefined;
	}
	if (toolStep[0] === -1) { return "noop"; }
	switch (tool) {
		case "inspect": return "noop";
		case "remove": return undefined;
		case "line": return LineBetweenPoints(params, solutions, toolStep);
		case "ray": return RayBetweenPoints(params, solutions, toolStep);
		case "segment": return SegmentBetweenPoints(params, solutions, toolStep);
		case "point-to-point": return Axiom2(params, solutions, toolStep);
		case "line-to-line": return Axiom3(params, solutions, toolStep);
		case "perpendicular": return Axiom4(params, solutions, toolStep);
		case "axiom-5": return Axiom5(params, solutions, toolStep);
		case "axiom-6": return Axiom6(params, solutions, toolStep);
		case "axiom-7": return Axiom7(params, solutions, toolStep);
		case "scribble": return Scribble(params, solutions, toolStep);
		case "pleat": return undefined;
		case "assignment": return undefined;
		case "transform": return undefined;
		case "zoom": return Zoom(params, solutions, toolStep);
		default: return undefined;
	}
};

export default MakeCommand;
