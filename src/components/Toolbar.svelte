<script lang="ts">
	import Tools from "../data/tools.json";
	export let tool;
	export let views = [];

	let toolNames = [];
	$: toolNames = Object.keys(Tools)
		.filter(toolName => views
			.map(view => Tools[toolName].views[view])
			.reduce((a, b) => a || b, false));
</script>

	<div class="Toolbar">
		{#each toolNames as toolName}
			<button
				class={`${toolName}`}
				highlighted={tool === toolName}
				on:click={() => { tool = toolName; }}
			></button>
		{/each}
	</div>

<style>
	:global(.light-mode) {
		--toolbar-bg-color: #158;
		--toolbar-button-color: #269;
		--toolbar-button-hover: #fb4;
		--toolbar-button-highlighted: #e53;
		--toolbar-button-opacity: 1;
	}
	:global(.dark-mode) {
		--toolbar-bg-color: var(--darkmode-gray-1);
		--toolbar-button-color: var(--darkmode-gray-2);
		--toolbar-button-hover: var(--darkmode-blue);
		--toolbar-button-highlighted: var(--darkmode-blue);
		--toolbar-button-opacity: 0.6;
	}

	.Toolbar {
		height: 100%;
		display: grid;
		grid-template-columns: 50% 50%;
		align-content: flex-start;
		overflow-y: auto;
/*		overflow-x: hidden;*/
		background-color: var(--toolbar-bg-color);
	}
	button {
		width: var(--toolbar-button-width);
		height: var(--toolbar-button-width);
		background-color: var(--toolbar-button-color);
		opacity: var(--toolbar-button-opacity);
	}
	button:hover {
		background-color: var(--toolbar-button-hover);
	}
	button[highlighted="true"] {
		background-color: var(--toolbar-button-highlighted);
		opacity: 1;
	}
	.inspect { background-image: url("../assets/tools/inspect.svg"); }
	.pull { background-image: url("../assets/tools/pull.svg"); }
	.remove { background-image: url("../assets/tools/remove.svg"); }
	.line { background-image: url("../assets/tools/line.svg"); }
	.ray { background-image: url("../assets/tools/ray.svg"); }
	.segment { background-image: url("../assets/tools/segment.svg"); }
	.axiom-2 { background-image: url("../assets/tools/axiom-2.svg"); }
	.axiom-3 { background-image: url("../assets/tools/axiom-3.svg"); }
	.axiom-4 { background-image: url("../assets/tools/axiom-4.svg"); }
	.axiom-5 { background-image: url("../assets/tools/axiom-5.svg"); }
	.axiom-6 { background-image: url("../assets/tools/axiom-6.svg"); }
	.axiom-7 { background-image: url("../assets/tools/axiom-7.svg"); }
	.scribble { background-image: url("../assets/tools/scribble.svg"); }
	.pleat { background-image: url("../assets/tools/pleat.svg"); }
	.assignment { background-image: url("../assets/tools/assignment.svg"); }
	.flatten { background-image: url("../assets/tools/flatten.svg"); }
	.transform { background-image: url("../assets/tools/transform.svg"); }
	.zoom { background-image: url("../assets/tools/zoom.svg"); }
	.arrows { background-image: url("../assets/tools/arrows.svg"); }
</style>
