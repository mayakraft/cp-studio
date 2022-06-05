const PressAndRelease = ({ tool, pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 2];
		case "1 0": return [1, 2];
		case "1 1": return [2, 2];
		default: return [0, 2];
	}
};

const Axiom3 = ({ tool, pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 3];
		case "1 0": return solutions.length === 2 ? [1, 3] : [1, 2];
		case "1 1": return solutions.length === 2 ? [2, 3] : [2, 2];
		case "2 1": return [2, 3];
		case "2 2": return [3, 3];
		default: return [0, 3];
	}
};

const MakeToolStep = ({ tool, pointer, presses, releases, solutions }) => {
	const params = { pointer, presses, releases, solutions };
	switch (tool) {
		case "inspect": return [];
		case "remove": return [];
		case "line": return PressAndRelease(params);
		case "ray": return PressAndRelease(params);
		case "segment": return PressAndRelease(params);
		case "point-to-point": return PressAndRelease(params);
		case "line-to-line": return Axiom3(params);
		case "perpendicular": return PressAndRelease(params);
		case "scribble": return [];
		case "pleat": return PressAndRelease(params);
		case "assignment": return [];
		// case "transform": break;
		case "zoom": return [];
		default: return [];
	}
};

export default MakeToolStep;
