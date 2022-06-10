const Inspect = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 2];
		case "1 0":
		case "1 1":
		case "2 1": return [1, 2];
		case "2 2": return [2, 2];
		default: return [-1, -1];
	}
};

const PressAndRelease = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 2];
		case "1 0": return [1, 2];
		case "1 1": return [2, 2];
		default: return [-1, -1];
	}
};

const Axiom3 = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 3];
		case "1 0": return solutions.length > 1 ? [1, 3] : [1, 2];
		case "1 1": return solutions.length > 1 ? [2, 3] : [2, 2];
		case "2 1": return [2, 3];
		case "2 2": return [3, 3];
		default: return [-1, -1];
	}
};

const Axiom5 = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 4];
		case "1 0": return [1, 4];
		case "1 1": return [2, 4];
		case "2 1":
		case "2 2": return solutions.length > 1 ? [3, 4] : [3, 3];
		case "3 2": return [3, 4];
		case "3 3": return [4, 4];
		default: return [-1, -1];
	}
};

const Axiom6 = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 5];
		case "1 0": return [1, 5];
		case "1 1": return [2, 5];
		case "2 1": return [3, 5];
		case "2 2": return solutions.length > 1 ? [4, 5] : [4, 4];
		case "3 2": return [4, 5];
		case "3 3": return [5, 5];
		default: return [-1, -1];
	}
};

const Axiom7 = ({ pointer, presses, releases, solutions }) => {
	switch (`${presses.length} ${releases.length}`) {
		case "0 0": return [0, 3];
		case "1 0": return [1, 3];
		case "1 1":
		case "2 1": return [2, 3];
		case "2 2": return [3, 3];
		default: return [-1, -1];
	}
};

const MakeToolStep = ({ tool, pointer, presses, releases, solutions }) => {
	const params = { pointer, presses, releases, solutions };
	switch (tool) {
		case "inspect": return Inspect(params);
		case "remove": return [];
		case "line": return PressAndRelease(params);
		case "ray": return PressAndRelease(params);
		case "segment": return PressAndRelease(params);
		case "point-to-point": return PressAndRelease(params);
		case "line-to-line": return Axiom3(params);
		case "perpendicular": return PressAndRelease(params);
		case "axiom-5": return Axiom5(params);
		case "axiom-6": return Axiom6(params);
		case "axiom-7": return Axiom7(params);
		case "scribble": return [];
		case "pleat": return PressAndRelease(params);
		case "assignment": return [];
		// case "transform": break;
		case "zoom": return [];
		default: return [];
	}
};

export default MakeToolStep;
