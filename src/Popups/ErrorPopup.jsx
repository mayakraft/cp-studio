import Popup from "./Popup";
import PopupWindow from "./PopupWindow";
/**
 * @description accepts props:
 * props.title
 * props.header
 * props.body
 */
const ErrorPopup = (props) => {
	return (<Popup clickOff={props.clickOff}>
		<PopupWindow title={props.title ? props.title : "error"}>
			<Show when={props.header}>
				<h4>{props.header}</h4>
			</Show>
			<Show when={props.body}>
				<p>{props.body}</p>
			</Show>
		</PopupWindow>
	</Popup>);
};

export default ErrorPopup;
