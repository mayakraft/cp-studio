/**
 * Created by ghassaei on 2/22/17.
 */

import window from "./environment/window";
import Model from "./model/";
import DynamicSolver from "./dynamic/dynamicSolver";
import prepare from "./fold/prepare";
// import VideoAnimator from "./videoAnimator"; // haven't touched yet

/**
 * @description Origami Simulator by Amanda Ghassaei. refactored so that:
 * - global variables removed to allow for multiple simultaneous instances
 * - ability to dealloc() and reinitialize, and memory is freed.
 * - can work as a node package inside a Node JS project, including React.
 * 
 * requires these npm packages:
 * - three
 * - fold
 * - earcut
 * - numeric
 * 
 * and then one detail that is bundler dependent (webpack/vite/...)
 * is that we need to load raw text (shaders).
 * this code is currently setup to support vite.
 *
 * The workflow goes something like this.
 * You are in charge of setting up and managing threejs.
 * - Initialize a three js renderer, scene, and camera, and animation loop.
 *  (there are hundreds of tutorials for this)
 * - initialize this Simulator by passing in the renderer, scene, and camera.
 * - you are in charge of setting up any lighting or UI controls, like trackball.
 * now the app should run.
 * - load a CP in FOLD format with: .load(file)
 * - use .start() and .stop() to start and stop the solver
 *  (origami sim manages its own solver loop, separate from the animation loop)
 * - set optional strain visualization property (boolean): .strain = true
 * - change fold amount (float, 0.0-1.0): .foldAmount = 0.5
 * - when done, dealloc() will free memory.
 * 
 * A problem with this system where the UI is entirely managed by the user is
 * that Origami Simulator includes a UI which can push and pull the vertices of
 * the origami. The solution is, maintaining the rule that UI is user-managed,
 * a DragControls UI class was created, which is applied just like Trackball,
 * except for one small difference, the user needs to implement this method:
 * dragControls.nodePositionsDidChange = () => {
 *   simulator.modelDidChange();
 * };
 *
 * For now, customize three js materials inside model/materials.js.
 * Would be nice to either expose this as a setter/getter to the user, or
 * input using an options object, in similar fashion to how three js works.
 */
const OrigamiSimulator = function ({ renderer, scene, camera }) {
  // app variables
  const visible = {
    B: true,
    M: true,
    V: true,
    F: true,
    C: false,
    U: true,
  };
  let creasePercent = 0.0;
  let axialStrain = false;

  // carryovers from global
  let nodePositionHasChanged = false;
  let shouldCenterGeo = false;
  const modelDidChange = () => {
    nodePositionHasChanged = true;
    shouldCenterGeo = true;
  }

  /** initialize the app */
  const model = new Model({
    scene,
    visible,
    axialStrain,
  });

  const solver = DynamicSolver({
    fixedHasChanged: false,
    nodePositionHasChanged: false,
    creaseMaterialHasChanged: false,
    materialHasChanged: false,
    shouldZeroDynamicVelocity: false,
    shouldCenterGeo: false,
    numSteps: 100,
    integrationType: "euler",
    strainClip: 0.5,
    calcFaceStrain: false,
    axialStiffness: 20,
    faceStiffness: 0.2,
  });

  // // app.controls = Controls(app);
  // app.UI3D = UI3D(app);
  // // app.importer = Importer(app);

  // object methods
  const loadFOLD = function (foldObject) {
    // app.threeView.resetModel();
    const fold = prepare(foldObject);
    model.load(fold, {
      axialStiffness: 20,
      percentDamping: 0.45, // damping ratio
      panelStiffness: 0.7,
      creaseStiffness: 0.7,
      visible,
      axialStrain,
    });
    solver.syncNodesAndEdges(model, { creasePercent });

    // stopLoop();
    // startLoop(); // call this after buildModel()
  };

  const loadSVG = function (svgAsDomNode) {
    // return app.pattern.loadSVG(svgAsDomNode);
  };

  const loadSVGString = function (svgAsString) {
    // const svg = new DOMParser().parseFromString(svgAsString, "text/xml").childNodes[0];
    // return app.pattern.loadSVG(svg);
  };

  // const changeTouchMode = (newGrabMode) => {
  //   isGrabMode = newGrabMode;
  //   // app.threeView.enableCameraRotate(true);
  //   // app.threeView.enableCameraRotate(false);
  //   // app.threeView.resetModel();
  //   // app.UI3D.hideHighlighters();
  // };

  // const getEdgesFoldAngle = () => {
  // };

  // one single iteration of the compute loop. useful to call as a draw-refresh
  const compute = () => {
    solver.solve(100, { axialStrain, creasePercent, nodePositionHasChanged, shouldCenterGeo }); // globals.numSteps
    model.needsUpdate({ axialStrain });
    // reset single loop variables
    nodePositionHasChanged = false;
    shouldCenterGeo = false;
  };

  let computeLoopID = undefined;
  function startLoop() {
    // console.log("Starting...");
    computeLoopID = window.requestAnimationFrame(startLoop);
    compute();
  }

  const stopLoop = () => {
    window.cancelAnimationFrame(computeLoopID);
    computeLoopID = undefined;
  };

  const dealloc = () => {
    stopLoop();
    model.dealloc();
    solver.dealloc();
  };

  const app = {};
  Object.defineProperty(app, "dealloc", { value: dealloc });
  Object.defineProperty(app, "stop", { value: stopLoop });
  Object.defineProperty(app, "start", { value: startLoop });
  Object.defineProperty(app, "isOn", { get: () => computeLoopID !== undefined });
  Object.defineProperty(app, "load", { value: loadFOLD });
  Object.defineProperty(app, "loadSVG", { value: loadSVG });
  Object.defineProperty(app, "loadSVGString", { value: loadSVGString });
  Object.defineProperty(app, "modelDidChange", { value: modelDidChange });
  Object.defineProperty(app, "model", { get: () => model });
  Object.defineProperty(app, "foldAmount", {
    set: (value) => {
      creasePercent = value;
      solver.setCreasePercent(creasePercent);
    },
    get: () => creasePercent
  });
  Object.defineProperty(app, "strain", {
    set: (value) => {
      const boolean = !!value;
      axialStrain = boolean;
      // solverOptions.materialHasChanged = true;
      // solverOptions.fixedHasChanged = true;
      // solverOptions.nodePositionHasChanged = true;
      // solverOptions.creaseMaterialHasChanged = true;
      model.setAxialStrain(axialStrain);
    },
    get: () => axialStrain
  });
  // Object.defineProperty(app, "getEdgesFoldAngle", {
  //   get: () => getEdgesFoldAngle
  // });

  return app;
};

export default OrigamiSimulator;
