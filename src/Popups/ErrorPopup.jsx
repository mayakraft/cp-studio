import Popup from "./Popup";
import PopupWindow from "./PopupWindow";
/**
 * @description accepts props:
 * props.title
 * props.header
 * props.body
 */
const BuildBody = (props) => {
	switch (typeof props.body) {
		case "object": return props.body;
		case "string": return <p>{props.body}</p>;
		default: return <></>;
	}
};
const ErrorPopup = (props) => {
	return (<Popup clickOff={props.clickOff}>
		<PopupWindow title={props.title ? props.title : "error"}>
			<Show when={props.header}>
				<h4>{props.header}</h4>
			</Show>
			<Show when={props.body}>
				<BuildBody body={props.body}/>
			</Show>
		</PopupWindow>
	</Popup>);
};

export default ErrorPopup;
