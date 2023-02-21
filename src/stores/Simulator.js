import { writable } from "svelte/store";

// communication from outside to Origami Simulator
export const active = writable(false);
export const foldAmount = writable(0);
export const strain = writable(false);
export const showTouches = writable(true);
export const showShadows = writable(false);
export const tool = writable("trackball");
export const integration = writable("euler");
export const axialStiffness = writable(20);
export const faceStiffness = writable(0.2);
export const joinStiffness = writable(0.7);
export const creaseStiffness = writable(0.7);
export const dampingRatio = writable(0.45);

// communication from Origami Simulator to outside
export const error = writable(0);
export const reset = writable(() => {});
