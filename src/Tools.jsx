export const toolViews = {
	"inspect": { "crease pattern": true, "diagram": true, "simulator": true },
	"remove": { "crease pattern": true },
	"line": { "crease pattern": true, "diagram": true },
	"ray": { "crease pattern": true },
	"segment": { "crease pattern": true },
	"point-to-point": { "crease pattern": true, "diagram": true },
	"line-to-line": { "crease pattern": true, "diagram": true },
	"perpendicular": { "crease pattern": true, "diagram": true },
	"axiom-5": { "crease pattern": true, "diagram": true },
	"axiom-6": { "crease pattern": true, "diagram": true },
	"axiom-7": { "crease pattern": true, "diagram": true },
	"scribble": { "crease pattern": true },
	"pleat": { "crease pattern": true, "diagram": true },
	"assignment": { "crease pattern": true },  //  "simulator": true
	"transform": { "crease pattern": true, "diagram": true },
	"zoom": { "crease pattern": true, "diagram": true },
	"arrows": { "diagram": true },
};

export const toolNames = [
	"inspect",
	"remove",
	"line",
	"ray",
	"segment",
	"point-to-point",
	"line-to-line",
	"perpendicular",
	"axiom-5",
	"axiom-6",
	"axiom-7",
	"scribble",
	"pleat",
	"assignment",
	"transform",
	"zoom",
	"arrows",
];

export const toolNamesFilteredByViews = (views) => {
	return toolNames.filter(tool => views
		.map(view => toolViews[tool][view])
		.reduce((a, b) => a || b, false));
};
