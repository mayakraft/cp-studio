import Style from "./Popup.module.css";

const Popup = (props) => {
	const clickOffHandler = (e) => {
		if (e.target.getAttribute("class") === Style.ScreenCover) {
			props.clickOff(e);
		}
	};

	return (<div class={Style.ScreenCover} onclick={clickOffHandler}>
		{props.children}
	</div>);
};

export default Popup;
