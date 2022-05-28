const cpStyle = {
	vertices: { fill: "none", stroke: "none" },
};

const CPLayer = (svg) => {
	const manager = {};
	const layer = svg.g()
		.strokeWidth(0.01);

	manager.clear = () => {
		layer.removeChildren();
	};

	manager.onChange = ({ cp }) => {
		layer.removeChildren();
		const origami = layer.origami(cp, cpStyle);
		origami.removeAttribute("stroke-width");
		if (origami.edges) {
			Array.from(origami.edges.childNodes)
				.forEach(el => el.removeAttribute("stroke"));
		}
	};

	return manager;
};

export default CPLayer;
