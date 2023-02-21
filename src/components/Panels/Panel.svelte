<script>
	import Plus from "../../assets/app/plus-solid.svg";
	import Minus from "../../assets/app/minus-solid.svg";

	export let isCollapsed = false;
	export let title = "";
</script>

	<div class="Panel">
		<div class="Titlebar">
			<p>{title}</p>
			<div
				on:click={() => { isCollapsed = !isCollapsed; }}
				class="CollapseButton">
				<img
					src={isCollapsed ? Plus : Minus}
					alt="toggle collapse" />
			</div>
		</div>
		{#if !isCollapsed}
			<div class="Body">
				<slot></slot>
			</div>
		{/if}
	</div>

<style>
	:global(.light-mode) {
		--panel-bg-color: white;
		--panel-text-color: black;
		--panel-title-bg-color: #e53;
		--panel-title-text-color: white;
	}
	:global(.dark-mode) {
		--panel-bg-color: var(--darkmode-gray-2);
		--panel-text-color: var(--darkmode-gray-8);
		--panel-title-bg-color: var(--darkmode-pink-dark);
		--panel-title-text-color: var(--darkmode-white);
	}
	.Panel {
		margin: 1rem;
	}
	.Body {
		color: black;
		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: calc(var(--app-font-size) * 0.25);
		background-color: var(--panel-bg-color);
		color: var(--panel-text-color);
	}
	.Titlebar {
		background-color: var(--panel-title-bg-color);
		color: var(--panel-title-text-color);
		font-weight: bold;
		letter-spacing: 0.15rem;
		line-height: var(--menubar-height);
		text-transform: uppercase;
		display: flex;
		flex-direction: row;
	}
	.Titlebar p {
		padding: 0 1rem;
		flex: 1;
	}
	.CollapseButton {
		width: var(--menubar-height);
		height: var(--menubar-height);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.CollapseButton img {
		width: 1rem;
		height: 1rem;
	}
	.Panel textarea {
		resize: vertical;
	}
	.Panel ul {
		list-style: none;
	}
	.Panel ul li {
		margin-left: calc(var(--app-font-size) * 0.5);
	}

	/* COLORS */
	:global(.light-mode) .CollapseButton { background-color: #fb4; }
	:global(.light-mode) .CollapseButton:hover { background-color:  #fc6; }
	:global(.dark-mode) .CollapseButton { background-color: var(--darkmode-pink); }
	:global(.dark-mode) .CollapseButton:hover { background-color: var(--darkmode-pink-light); }

</style>