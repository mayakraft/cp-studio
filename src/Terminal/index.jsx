import { onMount, createSignal } from "solid-js";
import Style from "./Terminal.module.css";

const Terminal = (props) => {

	let preRef;
	let textareaRef;

	const [historyText, setHistoryText] = createSignal("cp.segment(0, 0, 1, 1)\ncp.segment(0.5, 0.5, 0.5, 1)\ncp.planar()");

	const oninput = (e) => {
		const char = e.target.value[e.target.value.length - 1];
		if (char === undefined) { return; }
		switch (char) {
			case "\n":
				// todo, check if space is pressed.
				const newline = e.target.value.substring(0, e.target.value.length - 1);
				setHistoryText(historyText() + "\n" + newline);
				if (preRef) { preRef.scrollTop = preRef.scrollHeight; }
				e.target.value = "";
			break;
		}
	};

	onMount(() => {
		if (preRef) { preRef.scrollTop = preRef.scrollHeight; }
		if (textareaRef) { textareaRef.focus(); }
	});

	return <div class={Style.TerminalContainer}>
		<div class={Style.Terminal}>
			<pre ref={preRef}>{historyText()}</pre>
			<textarea
				ref={textareaRef}
				autocomplete="off"
				autocorrect="off"
				rows="1"
				oninput={oninput}
			/>
		</div>
	</div>;
};

export default Terminal;