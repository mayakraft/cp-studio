/**
 * Created by amandaghassaei on 5/5/17.
 */
import * as THREE from "three";
// import window from "./environment/window";

function DragControls ({ renderer, camera, simulator }) {
  this.renderer = renderer;
  this.camera = camera;
  this.simulator = simulator;

  this.nodePositionsDidChange = null;

  this.enabled = true;

  this.raycaster = new THREE.Raycaster();
  this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
  this.raycasterPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
  // this.makeGeometry(scene);

  // this.isMouseDown = false;
  // this.isDragging = false;
  // this.draggingNode = null;
  // this.draggingNodeFixed = false;

  // this.arrowHelper = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 5, 0xff0000);
  // scene.add(this.arrowHelper);

  this.mouseDownHandler = (event) => {
    this.nearest = this.nearestGraphComponents();
    this.raycasterPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
  };

  this.mouseMoveHandler = (event) => {
    this.updateRaycaster(event);
    if (event.buttons === 0) {
      this.nearest = this.nearestGraphComponents();
    }
    if (event.buttons > 0 && this.nearest && this.enabled) {
      const position = new THREE.Vector3(
        this.simulator.model.positions[this.nearest.vertex * 3 + 0],
        this.simulator.model.positions[this.nearest.vertex * 3 + 1],
        this.simulator.model.positions[this.nearest.vertex * 3 + 2]
      );
      let cameraOrientation = new THREE.Vector3();
      this.camera.getWorldDirection(cameraOrientation);
      const dist = position.dot(cameraOrientation);
      this.raycasterPlane.set(cameraOrientation, -dist);
      let intersection = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.raycasterPlane, intersection);
      const node = this.simulator.model.nodes[this.nearest.vertex];
      if (node) {
        node.moveManually(intersection);
        if (this.nodePositionsDidChange) { this.nodePositionsDidChange(); }
      }
      // return intersection;
      // const intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition().clone());
      // highlightedObj.moveManually(intersection);
      // globals.nodePositionHasChanged = true;
    }
  };

  this.renderer.domElement.addEventListener("mousemove", this.mouseMoveHandler, false);
  this.renderer.domElement.addEventListener("mousedown", this.mouseDownHandler, false);
};

DragControls.prototype.dealloc = function () {
  this.renderer.domElement.removeEventListener("mousemove", this.mouseMoveHandler);
};

// DragControls.prototype.update = function () {
  // this.highlightVertex(this.nearest);
  // this.highlightFace(this.nearest);
// };

// DragControls.prototype.makeGeometry = function (scene) {
//   const sphereGeometry = new THREE.SphereGeometry(0.03, 32, 16);
//   const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
//   this.highlightedVertex = new THREE.Mesh(sphereGeometry, sphereMaterial);

//   const faceGeometry = new THREE.BufferGeometry();
//   // two triangle faces, three vertices with x, y, z
//   this.highlightedFaceVertices = new Float32Array(Array(2 * 3 * 3).fill(0.0));
//   faceGeometry.setAttribute("position", new THREE.BufferAttribute(this.highlightedFaceVertices, 3));
//   const faceMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x55ee33 });
//   this.highlightedFace = new THREE.Mesh(faceGeometry, faceMaterial);

//   scene.add(this.highlightedVertex);
//   scene.add(this.highlightedFace);
// };



// const setFromCamera = (raycaster, coords, camera) => {
//   if (camera && camera.isPerspectiveCamera) {
//     raycaster.ray.origin
//       .setFromMatrixPosition(camera.matrixWorld);
//     raycaster.ray.direction
//       .set(coords.x, coords.y, 0.05)
//       .unproject(camera)
//       .sub(raycaster.ray.origin)
//       .normalize();
//     // raycaster.camera = camera;
//   } else if (camera && camera.isOrthographicCamera) {
//     raycaster.ray.origin
//       .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
//       .unproject(camera); // set origin in plane of camera

//     raycaster.ray.direction
//       .set(0, 0, -1)
//       .transformDirection(camera.matrixWorld);
//     // raycaster.camera = camera;
//   } else {
//     console.error('THREE.Raycaster: Unsupported camera type: ' + camera.type);
//   }
// }

DragControls.prototype.updateRaycaster = function (event) {
  const bounds = this.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - bounds.x) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.y) / bounds.height) * 2 + 1
  );
  this.raycaster.setFromCamera(mouse, this.camera);
};

DragControls.prototype.highlightVertex = function (nearest) {
  // const visible = (nearest && nearest.vertex != null);
  // this.highlightedVertex.visible = visible;
  // if (!visible) { return; }
  // this.highlightedVertex.position.set(
  //   this.simulator.model.positions[nearest.vertex * 3 + 0],
  //   this.simulator.model.positions[nearest.vertex * 3 + 1],
  //   this.simulator.model.positions[nearest.vertex * 3 + 2]
  // );
};

DragControls.prototype.highlightFace = function (nearest) {
  // const visible = (nearest && nearest.face != null);
  // this.highlightedFace.visible = visible;
  // if (!visible) { return; }
  // const zDistance = 0.001;
  // // const zDistance = 0.1;
  // const face_normal = nearest.face_normal.clone().multiplyScalar(zDistance);
  // const normals = [face_normal, face_normal.clone().multiplyScalar(-1)];
  // [nearest.points, nearest.points]
  //   .map((tri, i) => tri.map(p => p.clone().add(normals[i])))
  //   .forEach((tri, i) => tri.forEach((p, j) => {
  //     this.highlightedFaceVertices[i * 9 + j * 3 + 0] = p.x;
  //     this.highlightedFaceVertices[i * 9 + j * 3 + 1] = p.y;
  //     this.highlightedFaceVertices[i * 9 + j * 3 + 2] = p.z;
  //   }));
  // this.highlightedFace.geometry.attributes.position.needsUpdate = true;
  // this.highlightedFace.geometry.computeBoundingBox();
  // this.highlightedFace.geometry.computeBoundingSphere();
};

// this is counting on all faces being triangles, and
// only having .a .b .c vertices
DragControls.prototype.nearestGraphComponents = function () {
  // simulator must have a model loaded
  if (!this.simulator.model) { return {}; }
  const intersections = this.raycaster
    .intersectObjects([this.simulator.model.frontside, this.simulator.model.backside]);
  console.log("intersections", intersections.length);
  const nearest = intersections.shift();
  if (!nearest) { return {}; }
  const face_vertices = [nearest.face.a, nearest.face.b, nearest.face.c];
  const points = face_vertices
    .map(f => [0, 1, 2].map(n => this.simulator.model.positions[f * 3 + n]))
    .map(v => new THREE.Vector3(...v));
  const nearestFaceVertex = points
    .map(p => p.distanceTo(nearest.point))
    .map((d, i) => ({ d, i }))
    .sort((a, b) => a.d - b.d)
    .map(el => el.i)
    .shift();
  nearest.vertex = face_vertices[nearestFaceVertex];
  nearest.face_vertices = face_vertices;
  nearest.face_normal = nearest.face.normal;
  nearest.points = points;
  return nearest;
};

// call after setting raycaster to camera
DragControls.prototype.moveNode = function (vertex) {
  const highlightedObj = this.simulator.model.nodes[vertex];

  const getIntersectionWithObjectPlane = (position) => {
    const cameraOrientation = this.camera.getWorldDirection();
    const dist = position.dot(cameraOrientation);
    this.raycasterPlane.set(cameraOrientation, -dist);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.raycasterPlane, intersection);
    return intersection;
  }
  // need to update solver.nodePositionHasChanged
  const intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition().clone());
  highlightedObj.moveManually(intersection);
  // globals.nodePositionHasChanged = true;
};

/*
function 3dUI(globals) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const raycasterPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
  let isDragging = false;
  let draggingNode = null;
  let draggingNodeFixed = false;
  let mouseDown = false;
  let highlightedObj;

  const highlighter = new Node(globals, new THREE.Vector3());
  highlighter.setTransparent();
  globals.threeView.scene.add(highlighter.getObject3D());

  function setHighlightedObj(object) {
    if (highlightedObj && (object != highlightedObj)) {
      // highlightedObj.unhighlight();
      highlighter.getObject3D().visible = false;
    }
    highlightedObj = object;
    if (highlightedObj) {
      // highlightedObj.highlight();
      highlighter.getObject3D().visible = true;
    }
  }

  window.document.addEventListener("mousedown", (e) => {
    mouseDown = true;

    if (globals.touchMode === "grab") {
      // let bounds = e.target.getBoundingClientRect();
      // i know what we're targeting. target it directly
      const parent = globals.parent || window.document.getElementsByTagName("body")[0];
      const bounds = parent.getBoundingClientRect();
      // e.preventDefault();
      // mouse.x = (e.clientX/window.innerWidth)*2-1;
      // mouse.y = - (e.clientY/window.innerHeight)*2+1;
      mouse.x = ((e.clientX - bounds.x) / bounds.width) * 2 - 1;
      mouse.y = -((e.clientY - bounds.y) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);

      const obj = checkForIntersections(e, globals.model.getMesh());
      setHighlightedObj(obj);

      if (highlightedObj) {
        draggingNode = highlightedObj;
        draggingNodeFixed = draggingNode.isFixed();
        draggingNode.setFixed(true);
        globals.fixedHasChanged = true;
        globals.threeView.enableCameraRotate(false);
      } else {
        // clicked somewhere outside the origami, temp switch to rotate mode
        globals.threeView.enableCameraRotate(true);
      }
    }
  }, false);

  window.document.addEventListener("mouseup", () => {
    isDragging = false;
    if (draggingNode) {
      draggingNode.setFixed(draggingNodeFixed);
      draggingNode = null;
      globals.fixedHasChanged = true;
      setHighlightedObj(null);
      globals.shouldCenterGeo = true;
    }
    if (globals.touchMode === "grab") {
      // grab mode temporarily becomes rotate when clicking outside object
      globals.threeView.enableCameraRotate(false);
    }
    mouseDown = false;
  }, false);
  window.document.addEventListener("mousemove", mouseMove, false);
  function mouseMove(e) {
    if (mouseDown) {
      isDragging = true;
    }
    // if (!globals.userInteractionEnabled) return;
    if (globals.touchMode === "rotate") { return; }

    if (isDragging) {
      if (highlightedObj) {
        const parent = globals.parent || window.document.getElementsByTagName("body")[0];
        const bounds = parent.getBoundingClientRect();
        mouse.x = ((e.clientX - bounds.x) / bounds.width) * 2 - 1;
        mouse.y = -((e.clientY - bounds.y) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        const intersection = getIntersectionWithObjectPlane(highlightedObj.getPosition().clone());
        highlightedObj.moveManually(intersection);
        globals.nodePositionHasChanged = true;
      }
    } else {
      const parent = globals.parent || window.document.getElementsByTagName("body")[0];
      const bounds = parent.getBoundingClientRect();
      mouse.x = ((e.clientX - bounds.x) / bounds.width) * 2 - 1;
      mouse.y = -((e.clientY - bounds.y) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const obj = checkForIntersections(e, globals.model.getMesh());
      setHighlightedObj(obj);
    }
    if (highlightedObj) {
      const position = highlightedObj.getPosition();
      highlighter.getObject3D().position.set(position.x, position.y, position.z);
    }
  }

  function getIntersectionWithObjectPlane(position) {
    const cameraOrientation = this.camera.getWorldDirection();
    const dist = position.dot(cameraOrientation);
    raycasterPlane.set(cameraOrientation, -dist);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(raycasterPlane, intersection);
    return intersection;
  }

  function checkForIntersections(e, objects) {
    let _highlightedObj = null;
    const intersections = raycaster.intersectObjects(objects, false);
    if (intersections.length > 0) {
      const face = intersections[0].face;
      const position = intersections[0].point;
      const positionsArray = globals.model.getPositionsArray();
      const vertices = [];
      vertices.push(new THREE.Vector3(
        positionsArray[3 * face.a],
        positionsArray[3 * face.a + 1],
        positionsArray[3 * face.a + 2]
      ));
      vertices.push(new THREE.Vector3(
        positionsArray[3 * face.b],
        positionsArray[3 * face.b + 1],
        positionsArray[3 * face.b + 2]
      ));
      vertices.push(new THREE.Vector3(
        positionsArray[3 * face.c],
        positionsArray[3 * face.c + 1],
        positionsArray[3 * face.c + 2]
      ));
      let dist = vertices[0].clone().sub(position).lengthSq();
      let nodeIndex = face.a;
      for (let i = 1; i < 3; i += 1) {
        const _dist = (vertices[i].clone().sub(position)).lengthSq();
        if (_dist < dist) {
          dist = _dist;
          if (i === 1) nodeIndex = face.b;
          else nodeIndex = face.c;
        }
      }
      const nodesArray = globals.model.getNodes();
      _highlightedObj = nodesArray[nodeIndex];
    }
    return _highlightedObj;
  }

  function hideHighlighters() {
    highlighter.getObject3D().visible = false;
  }

  // globals.threeView.sceneAdd(raycasterPlane);

  return {
    hideHighlighters
  };
}
*/

export default DragControls;
