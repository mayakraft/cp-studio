<script lang="ts">
	import Menubar from "./components/Menubar.svelte";
	import Toolbar from "./components/Toolbar.svelte";
	import Desktop from "./components/Desktop/Desktop.svelte";
	import Panels from "./components/Panels/Panels.svelte";
	import Timeline from "./components/Timeline/Timeline.svelte";
	import Terminal from "./components/Terminal/Terminal.svelte";
	import Shell from "./lib/Shell.svelte";

	import craneCP from "./examples/crane-cp.fold?raw";

	// origami model. FOLD is the raw FOLD file with all the frames
	let FOLD = {};
	let creasePattern = JSON.parse(craneCP);
	let foldedForm = {};

	let tool = "inspect";
	let views = ["crease pattern", "simulator"];
	let exec;
	let history;

	let showTerminal = true;
	let showPanels = true;
	let showDebugPanel = true;
	let darkMode = false;
</script>

	<Shell bind:exec={exec} bind:history={history} />

	<main class={darkMode ? "dark-mode" : "light-mode"}>
		<div class="header-row">
			<Menubar
				bind:views={views}
				bind:showTerminal={showTerminal}
				bind:showPanels={showPanels}
				bind:showDebugPanel={showDebugPanel}
				bind:darkMode={darkMode}
			/>
		</div>
		<div class="center-row">
			<Toolbar bind:tool={tool} {views} />
			<Desktop
				{creasePattern}
				{foldedForm}
				{darkMode}
				{views}
			/>
			{#if showPanels}
				<Panels
				/>
			{/if}
		</div>
		<div class="timeline-row">
			<Timeline />
		</div>
		{#if showTerminal}
			<div class="terminal-row">
				<Terminal {exec} {history} />
			</div>
		{/if}
	</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	.center-row {
		display: flex;
		flex-direction: row;
		overflow-y: hidden;
	}
	.center-row:nth-child(1) {
		overflow-y: auto;
	}
	/* rows inside main section */
	.header-row { flex: 0 0 var(--menubar-height); }
	.center-row { flex: 1 1 auto; }
	.timeline-row { flex: 0 0 3rem; }
	.terminal-row { flex: 0 1 12rem; }
	/* columns inside center row */
	.center-row > :global(:nth-child(1)) {
		flex: 0 0 calc(var(--toolbar-button-width) * 2 + 1rem);
	}
	.center-row > :global(:nth-child(2)) {
		flex: 1 0 auto;
	}
	.center-row > :global(:nth-child(3)) {
		flex: 0 1 16rem;
	}
</style>
