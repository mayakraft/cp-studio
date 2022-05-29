/**
 * WARNING this file contains bad code.
 * the switch statements in getPreference and setPreference is a hack and only
 * goes up to a limited depth of keys in the object.
 * (the limit is 8, it will never be reached by me, but it's a hack which could fail)
 */

// window.localStorage.setItem("key", value);
// window.localStorage.getItem("key");
// window.localStorage.removeItem("key");
// window.localStorage.clear();
// window.localStorage.key();

export const localStorageVersion = 0.12;

// get user's device settings
const deviceDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
// window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) { console.log('changed!!'); });

/**
 * pass in the device default dark mode settings here
 */
export const emptyPreferences = () => ({
	// the version of the preferences. if this changes, we can no longer rely
	// on the contents being the same, so we must replace (intelligently) the old prefs.
	version: localStorageVersion,
	language: "en",
	views: ["crease pattern", "simulator", "diagram"],
	darkMode: deviceDarkMode,
	pleatCount: 8,
	newCreaseAssignment: "F",
	simulatorOn: true,
	vertexSnapping: true,
	showDiagramInstructions: true,
	simulator: {
		on: true,
		showTouches: true,
		strain: false,
		shadows: false,
	},
	panels: {
		filePanelCollapsed: false,
		toolPanelCollapsed: false,
		cpPanelCollapsed: false,
		simulatorPanelCollapsed: false,
		diagramPanelCollapsed: false,
		foldabilityPanelCollapsed: false,
		debugPanelCollapsed: false,
	}
});

/**
 * in both of these methods, the "keys" parameter is a list of keys as strings in an array
 * example: to access preferences.panels.toolPanelCollapsed, pass:
 * ["panels", "toolPanelCollapsed"]
 */
export const getPreference = (keys = []) => {
	const preferences = JSON.parse(window.localStorage.getItem("preferences"));
	switch (keys.length) {
		case 0: return preferences;
		case 1: return preferences[keys[0]];
		case 2: return preferences[keys[0]][keys[1]];
		case 3: return preferences[keys[0]][keys[1]][keys[2]];
		case 4: return preferences[keys[0]][keys[1]][keys[2]][keys[3]];
		case 5: return preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]];
		case 6: return preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]];
		case 7: return preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]][keys[6]];
		case 8: return preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]][keys[6]][keys[7]];
		default: return undefined;
	}
};

export const setPreference = (keys, value) => {
	let preferences = JSON.parse(window.localStorage.getItem("preferences"));
	switch (keys.length) {
		case 0: preferences = value; break;
		case 1: preferences[keys[0]] = value; break;
		case 2: preferences[keys[0]][keys[1]] = value; break;
		case 3: preferences[keys[0]][keys[1]][keys[2]] = value; break;
		case 4: preferences[keys[0]][keys[1]][keys[2]][keys[3]] = value; break;
		case 5: preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]] = value; break;
		case 6: preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]] = value; break;
		case 7: preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]][keys[6]] = value; break;
		case 8: preferences[keys[0]][keys[1]][keys[2]][keys[3]][keys[4]][keys[5]][keys[6]][keys[7]] = value; break;
		default: return false;
	}
	window.localStorage.setItem("preferences", JSON.stringify(preferences));
	return true;
};
