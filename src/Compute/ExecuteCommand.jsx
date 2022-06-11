
const AddSegment = (command, props) => {

};

const Zoom = (command, { setViewBox, resetViewBox }) => command.args.length
	? setViewBox(...command.args)
	: resetViewBox();

const ExecuteCommand = (command, props) => {
	// no-op means exit and return "undefined" to avoid appending history.
	if (command === "noop") { return; }
	// sort by function call, build function call with args, run it.
	switch (command.fn) {
		case "setViewBox": Zoom(command, props); break;
		case "segment": AddSegment(command, props); break;
		default: break;
	}
	// return the string which will be pushed onto the history stack.
	return command.op
		? command.op
		: `${command.fn}(${command.args.join(", ")})`;
};

export default ExecuteCommand;
