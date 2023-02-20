const getCircularReplacer = () => {
	const seen = new WeakSet();
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) { return; }
			seen.add(value);
		}
		return value;
	};
};

const stringify = (object) => {
	try {
		return JSON.stringify(object);
	}
	catch (error) {
		try {
			return JSON.stringify(object, getCircularReplacer());
		} catch (error2) {
			return "invalid object";
		}
	}
};

export default stringify
