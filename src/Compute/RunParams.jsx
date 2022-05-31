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

const RunParams = ({ tool, params }) => {
	switch (tool) {
		case "inspect": return undefined;
		// case "remove": break;
		case "line": return LineBetweenPoints(params);
		case "ray": return RayBetweenPoints(params);
		case "segment": return SegmentBetweenPoints(params);
		case "point-to-point": return Axiom2(params);
		case "line-to-line": return Axiom3(params);
		case "perpendicular": return Axiom4(params);
		// case "scribble": return [];
		// case "pleat": return LineToLine(params);
		// case "assignment": return SingleLine(params);
		// case "transform": break;
		// case "zoom": break;
		default: return [];
	}
};

export default RunParams;
