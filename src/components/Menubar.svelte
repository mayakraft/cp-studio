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
<!--
 					<li on:click={() => setShowNewPopup(true)}>new</li>
					<li on:click={() => {}}>open</li>
					<li on:click={saveFile}>save</li>
 -->
					<li><button on:click={() => setShowNewPopup(true)}>new</button></li>
					<li><button on:click={() => {}}>open</button></li>
					<li><button on:click={saveFile}>save</button></li>
				</ul>
			</li>
			<li>view
				<ul>
					{#each allViews as view}
						<li class={`menu-view-${view}`} highlighted={views.includes(view)}>
							<button on:click={() => onClickView(view)}>{view}</button>
						</li>
					{/each}
					<hr />
					<li highlighted={showTerminal}>
						<button on:click={() => { showTerminal = !showTerminal; }}>show terminal</button>
					</li>
					<li highlighted={showPanels}>
						<button on:click={() => { showPanels = !showPanels; }}>show panels</button>
					</li>
				</ul>
			</li>
			<li>preferences
				<ul>
					<li highlighted={darkMode}>
						<button on:click={() => { darkMode = !darkMode; }}>dark mode</button>
					</li>
					<li highlighted={showDebugPanel}>
						<button on:click={() => { showDebugPanel = !showDebugPanel; }}>debug panel</button>
					</li>
				</ul>
			</li>
			<li>language
				<ul>
					{#each languages as lang}
						<li highlighted={lang === language}>
							<button on:click={() => language = lang}>{lang}</button>
						</li>
					{/each}
				</ul>
			</li>
			<li>help
				<ul>
					<li>
						<button on:click={() => setShowExamplesPopup(true)}>examples</button>
					</li>
					<li>
						<button on:click={() => {}}>about</button>
					</li>
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
	button {
		all: unset;
		margin: 0;
		padding: 0;
		border: 0;
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
	/*nav input {
		display: none;
	}*/
	nav li[highlighted=true] {
		background-color: var(--menu-highlight-color);
		color: white;
	}
	nav li:hover {
		background-color: var(--menu-select-color);
		color: white;
	}
</style>