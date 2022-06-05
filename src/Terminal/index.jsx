import { onMount, createSignal } from "solid-js";
import Style from "./Terminal.module.css";

const Terminal = (props) => {

	let preRef;
	let textareaRef;

	// todo, do not use setHistoryText, instead call whatever method modifies the cp and adds to the history itself

	const oninput = (e) => {
		const char = e.target.value[e.target.value.length - 1];
		if (char === undefined) { return; }
		switch (char) {
			case "\n":
				// todo, check if space is pressed.
				const newline = e.target.value.substring(0, e.target.value.length - 1);
				props.setHistoryText(props.historyText() + "\n" + newline);
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
			<pre ref={preRef}>{props.historyText()}</pre>
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