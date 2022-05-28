import Style from "./Popup.module.css";

const PopupWindow = (props) => (
	<div class={Style.Popup}>
		<div class={Style.TitleBar}><h3>{props.title}</h3></div>
		<div class={Style.Body}>{props.children}</div>
	</div>
);

export default PopupWindow;
