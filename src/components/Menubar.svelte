<script lang="ts">
	import Languages from "../data/languages.json";
	export let views = [];

	const allViews = ["crease pattern", "simulator", "folded form"]
	const languages = Object.values(Languages)
		.map(el => el.name);
	const setShowNewPopup = () => {};
	const saveFile = () => {};
	const setShowExamplesPopup = () => {};

	const onClickView = (newView) => {
		views = views.includes(newView)
			? views.filter(a => a !== newView)
			: [ ...views, newView ];
	};
	export let showTerminal = false;
	export let showPanels = false;
	export let showDebugPanel = false;
	export let darkMode = false;
	let language = "english";

</script>

	<nav>
		<ul>
			<li>file
				<ul>
					<li on:click={() => setShowNewPopup(true)}>new</li>
					<li on:click={() => {}}>open</li>
					<li on:click={saveFile}>save</li>
				</ul>
			</li>
			<li>view
				<ul>
					{#each allViews as view}
						<li
							class={`menu-view-${view}`}
							highlighted={views.includes(view)}
							on:click={() => onClickView(view)}>{view}</li>
					{/each}
					<hr />
					<li
						on:click={() => { showTerminal = !showTerminal; }}
						highlighted={showTerminal}
					>show terminal</li>
					<li
						on:click={() => { showPanels = !showPanels; }}
						highlighted={showPanels}
					>show panels</li>
				</ul>
			</li>
			<li>preferences
				<ul>
					<li
						on:click={() => { darkMode = !darkMode; }}
						highlighted={darkMode}
					>dark mode</li>
					<li
						on:click={() => { showDebugPanel = !showDebugPanel; }}
						highlighted={showDebugPanel}
					>debug panel</li>
				</ul>
			</li>
			<li>language
				<ul>
					{#each languages as lang}
						<li
							on:click={() => language = lang}
							highlighted={lang === language}
						>{lang}</li>
					{/each}
				</ul>
			</li>
			<li>help
				<ul>
					<li on:click={() => setShowExamplesPopup(true)}>examples</li>
					<li on:click={() => {}}>about</li>
				</ul>
			</li>
		</ul>
	</nav>

<style>
	:global(.light-mode) {
		--menu-bg-color: white;
		--menu-text-color: black;
		--menu-border-color: #fb4;
		--menu-shadow-color: rgba(0, 0, 0, 0.25);
		--menu-highlight-color: #e53;
		--menu-select-color: #fb4;
	}
	:global(.dark-mode) {
		--menu-bg-color: var(--darkmode-gray-2);
		--menu-text-color: var(--darkmode-gray-9);
		--menu-border-color: var(--darkmode-blue-dark);
		--menu-shadow-color: black;
		--menu-highlight-color: var(--darkmode-blue);
		--menu-select-color: var(--darkmode-blue-dark);
	}
	nav {
		font-weight: 700;
		font-size: var(--app-font-size);
		height: var(--menubar-height);
		border-bottom: var(--menubar-border-width) solid var(--menu-border-color);
	}
	nav ul {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	nav li {
		margin-left: 0;
	}
	nav hr {
		margin: 0.25rem auto;
		width: 90%;
	}
	nav > ul {
		height: 100%;
/*		background-color: #eee; this was in light mode. why?*/
	}
	nav > ul > li {
		display: inline-flex; /* inline-block */
		align-items: center;
	}
	nav li {
		padding: 0 1rem;
		cursor: pointer;
		height: 100%;
	}
	nav ul ul li {
		padding: 0.25rem 1rem;
	}
	nav ul ul li.menubar-view-item {
		padding: 0 1rem;
	}
	nav,
	nav ul ul {
		background-color: var(--menu-bg-color);
		color: var(--menu-text-color);
	}
	nav ul ul {
		display: none;
		position: absolute;
		z-index: 3;
		top: calc(var(--menubar-height) - var(--menubar-border-width));
		box-shadow:
			0
			calc(var(--app-font-size) * 0.5)
			var(--app-font-size)
			0
			var(--menu-shadow-color);
	}
	nav ul ul li {
		position: relative;
	}
	nav ul ul ul {
		top: 0px;
		left: calc(var(--app-font-size) * 6);
	}
	nav li:hover > ul {
		display: block;
	}
	/*file open hidden input dialog trigger*/
	nav input {
		display: none;
	}
	nav li[highlighted=true] {
		background-color: var(--menu-highlight-color);
		color: white;
	}
	nav li:hover {
		background-color: var(--menu-select-color);
		color: white;
	}
</style>