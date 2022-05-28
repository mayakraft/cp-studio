import { createSignal } from "solid-js";
import { ParseFileString } from "./index";
import "./DragAndDrop.css";

const DragAndDrop = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const fileDialogDidLoad = (string) => {
    const result = ParseFileString(string);
    if (result.error) { return props.setErrorMessage(result.error); }
    props.loadFile(result);
  };

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsHovered(true);
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(false);
    const files = Array.from(e.dataTransfer.files);
    const reader = new FileReader()
    reader.onload = event => fileDialogDidLoad(event.target.result);
    reader.onerror = error => console.error(error);
    if (files.length) {
      if (files.length > 1) { console.warn("FileReader one file at a time, please."); }
      return reader.readAsText(files[0]);
    }
    console.warn("FileReader no files");
  }

  window.removeEventListener("dragenter", handleDragEnter);
  window.addEventListener("dragenter", handleDragEnter);

  return (
    <div class={["drop-zone", isHovered() ? "visible" : "hidden"].join(" ")}
      onDrop={e => handleDrop(e)}
      onDragOver={e => handleDragOver(e)}
      onDragEnter={e => handleDragEnter(e)}
      onDragLeave={e => handleDragLeave(e)}
    >
      <div class="drop-zone-inside"></div>
      <div class="drop-zone-cutout"></div>
    </div>
  );
};

export default DragAndDrop;
