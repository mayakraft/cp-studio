<script>
	import { onMount, afterUpdate } from "svelte";
	import Entry from "./Entry.svelte";

	export let exec = () => {};
	export let history = [];
	// the value bound to the textarea input.
	export let userInput = "";
	let textareaRef;
	let preRef;

	const onKeyDown = (e) => {
		switch (e.keyCode) {
		// return key
		case 13:
			exec(textareaRef.value);
			userInput = "";
			e.preventDefault();
			break;
		default: break;
		}
	};

	onMount(() => { textareaRef.focus(); });
	afterUpdate(() => { preRef.scrollTop = preRef.scrollHeight; });
</script>

	<svelte:window on:keydown={onKeyDown} />

	<div class="container">
		<div class="terminal">
			<!-- filling will expand to take over only the empty space -->
			<!-- pushing the textarea box to the bottom -->
			<div class="filling" />
			<pre bind:this={preRef}>{#each history as data}<Entry
				{data}
			/>{"\n"}{/each}</pre>

			<textarea
				bind:this={textareaRef}
				bind:value={userInput}
				autocomplete="off"
				autocorrect="off"
				rows="1"
				placeholder="ear."
			/>
		</div>
	</div>

<style>
	:global(.light-mode) {
		--terminal-border-color: white;
	}
	:global(.dark-mode) {
		--terminal-border-color: var(--darkmode-gray-4);
	}

	.container {
		height: 100%;
		background-color: var(--darkmode-gray-2);
		padding: 0.5rem;
		border-top: var(--menubar-border-width) solid var(--terminal-border-color);
	}
	.terminal {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.filling { flex: 1 0 auto; }
	pre { flex: 0 1 auto; }
	pre {
		overflow-y: auto;
		margin-bottom: 0.5rem;
		border-bottom: 2px solid;
		white-space: pre-wrap;
		white-space: -moz-pre-wrap;
		white-space: -pre-wrap;
		white-space: -o-pre-wrap;
		word-wrap: break-word;
	}
	textarea {
		resize: vertical;
		border: 1px solid transparent;
		color: #ddd;
		outline-color: transparent;
		background-color: #333;
	}
	textarea:focus {
		outline: none !important;
		border:1px solid #17c;
		outline-color: transparent;
		background-color: #222;
	}
	/* colors */
	.terminal {
		background-color: #111;
		background-color: #222;
	}
	pre {
		color: #ddd;
		background-color: #222;
		border-color: #333;
	}
</style>
