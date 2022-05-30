import { stringifyPoint } from "../../Helpers";

const RulerLayer = (svg) => {
	const manager = {};
	const layer = svg.g().setClass("ruler-layer")
	const layer225 = layer.g();
	const layerCross = layer.g();

	const setup = (vmin = 1) => {
		layer225.removeChildren();
		layerCross.removeChildren();
		const path225 = layer225.path().setClass("ruler-225");
		const pathCross = layerCross.path().setClass("ruler-axes");

		const _38 = Math.sin(Math.PI / 8);
		const _92 = Math.cos(Math.PI / 8);
		const _707 = Math.SQRT1_2;
		const verticals = [[1,0],[0,1],[-1,-0],[-0,-1]]
			.map(pt => [3 * pt[0], 3 * pt[1]]);
		const vecs = [
			[_92,_38], [_707,_707], [_38,_92],
			[-_38,_92], [-_707,_707], [-_92,_38],
			[-_92,-_38], [-_707,-_707], [-_38,-_92],
			[_38,-_92], [_707,-_707], [_92,-_38],
		].map(pt => [3 * pt[0], 3 * pt[1]]);
		const stride = 6;

		Array.from(Array(stride))
			.forEach((_, i) => path225.Move(vecs[i]).Line(vecs[i+stride]));

		[0,1].forEach((i) => pathCross.Move(verticals[i]).Line(verticals[i+2]));
	};
	setup();

	manager.onChangeCP = () => {
		setup();
	};

	manager.onChange = ({ Shift, cpPointer }) => {
		if (cpPointer === undefined) {
			layer225.setAttribute("display", "none");
			layerCross.setAttribute("display", "none");
			return;
		}

		const coords = stringifyPoint(cpPointer);
		layer225.setAttribute("transform", `translate(${coords})`);
		layerCross.setAttribute("transform", `translate(${coords})`);
		layerCross.removeAttribute("display");
		if (Shift) { layer225.removeAttribute("display"); }
		else { layer225.setAttribute("display", "none"); }
	};

	return manager;
};

export default RulerLayer;
