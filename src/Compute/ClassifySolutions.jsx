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
	lines.forEach(el => { el.classList = ["far"]; });
	lines[nearest].classList = ["nearest"];
};

const Axiom3 = (pointer, solutions, toolStep) => {
	if (solutions.length > 1 && toolStep[0] === 2) {
		assignNearestLine(solutions, pointer);
	}
};

const Axiom5 = (pointer, solutions, toolStep) => {
	if (solutions.length > 1 && toolStep[0] === 3) {
		assignNearestLine(solutions, pointer);
	}
};

const Axiom6 = (pointer, solutions, toolStep) => {
	if (solutions.length > 1 && toolStep[0] === 4) {
		assignNearestLine(solutions, pointer);
	}
};

const ClassifySolutions = ({ tool, pointer, solutions, toolStep }) => {
	switch (tool) {
		case "inspect": break;
		case "remove": break;
		case "line": break;
		case "ray": break;
		case "segment": break;
		case "point-to-point": break;
		case "line-to-line": return Axiom3(pointer, solutions, toolStep);
		case "perpendicular": break;
		case "axiom-5": return Axiom5(pointer, solutions, toolStep);
		case "axiom-6": return Axiom6(pointer, solutions, toolStep);
		case "axiom-7": break;
		case "scribble": break;
		case "pleat": break;
		case "assignment": break;
		case "transform": break;
		case "zoom": break;
		default: break;
	}
};

export default ClassifySolutions;
