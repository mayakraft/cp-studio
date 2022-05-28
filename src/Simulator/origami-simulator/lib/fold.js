// FOLD.filter.cutEdges(cp, []);
// FOLD.convert.edges_vertices_to_vertices_vertices_unsorted(cp);
// FOLD.filter.remapField(cp, "vertices", []);

const filter = Object.create(null);
const convert = Object.create(null);

filter.numVertices = function(fold) {
  return filter.numType(fold, 'vertices');
};

filter.boundaryEdges = function(fold) {
  return filter.edgesAssigned(fold, 'B');
};

filter.keysStartingWith = function(fold, prefix) {
  var key, results;
  results = [];
  for (key in fold) {
    if (key.slice(0, prefix.length) === prefix) {
      results.push(key);
    }
  }
  return results;
};

filter.keysEndingWith = function(fold, suffix) {
  var key, results;
  results = [];
  for (key in fold) {
    if (key.slice(-suffix.length) === suffix) {
      results.push(key);
    }
  }
  return results;
};

filter.edgesAssigned = function(fold, target) {
  var assignment, i, k, len, ref, results;
  ref = fold.edges_assignment;
  results = [];
  for (i = k = 0, len = ref.length; k < len; i = ++k) {
    assignment = ref[i];
    if (assignment === target) {
      results.push(i);
    }
  }
  return results;
};

filter.remapField = function(fold, field, old2new) {
  /*
  old2new: null means throw away that object
  */
  var array, i, j, k, key, l, len, len1, len2, m, new2old, old, ref, ref1;
  new2old = [];
//# later overwrites earlier
  for (i = k = 0, len = old2new.length; k < len; i = ++k) {
    j = old2new[i];
    if (j != null) {
      new2old[j] = i;
    }
  }
  ref = filter.keysStartingWith(fold, `${field}_`);
  for (l = 0, len1 = ref.length; l < len1; l++) {
    key = ref[l];
    fold[key] = (function() {
      var len2, m, results;
      results = [];
      for (m = 0, len2 = new2old.length; m < len2; m++) {
        old = new2old[m];
        results.push(fold[key][old]);
      }
      return results;
    })();
  }
  ref1 = filter.keysEndingWith(fold, `_${field}`);
  for (m = 0, len2 = ref1.length; m < len2; m++) {
    key = ref1[m];
    fold[key] = (function() {
      var len3, n, ref2, results;
      ref2 = fold[key];
      results = [];
      for (n = 0, len3 = ref2.length; n < len3; n++) {
        array = ref2[n];
        results.push((function() {
          var len4, o, results1;
          results1 = [];
          for (o = 0, len4 = array.length; o < len4; o++) {
            old = array[o];
            results1.push(old2new[old]);
          }
          return results1;
        })());
      }
      return results;
    })();
  }
  return fold;
};

filter.addVertexLike = function(fold, oldVertexIndex) {
  var k, key, len, ref, vNew;
  //# Add a vertex and copy data from old vertex.
  vNew = filter.numVertices(fold);
  ref = filter.keysStartingWith(fold, 'vertices_');
  for (k = 0, len = ref.length; k < len; k++) {
    key = ref[k];
    switch (key.slice(6)) {
      case 'vertices':
        break;
      default:
        //# Leaving these broken
        fold[key][vNew] = fold[key][oldVertexIndex];
    }
  }
  return vNew;
};

filter.addEdgeLike = function(fold, oldEdgeIndex, v1, v2) {
  var eNew, k, key, len, ref;
  //# Add an edge between v1 and v2, and copy data from old edge.
  //# If v1 or v2 are unspecified, defaults to the vertices of the old edge.
  //# Must have `edges_vertices` property.
  eNew = fold.edges_vertices.length;
  ref = filter.keysStartingWith(fold, 'edges_');
  for (k = 0, len = ref.length; k < len; k++) {
    key = ref[k];
    switch (key.slice(6)) {
      case 'vertices':
        fold.edges_vertices.push([v1 != null ? v1 : fold.edges_vertices[oldEdgeIndex][0], v2 != null ? v2 : fold.edges_vertices[oldEdgeIndex][1]]);
        break;
      case 'edges':
        break;
      default:
        //# Leaving these broken
        fold[key][eNew] = fold[key][oldEdgeIndex];
    }
  }
  return eNew;
};

filter.cutEdges = function(fold, es) {
  /*
  Given a FOLD object with `edges_vertices`, `edges_assignment`, and
  counterclockwise-sorted `vertices_edges`
  (see `FOLD.convert.edges_vertices_to_vertices_edges_sorted`),
  cuts apart ("unwelds") all edges in `es` into pairs of boundary edges.
  When an endpoint of a cut edge ends up on n boundaries,
  it splits into n vertices.
  Preserves above-mentioned properties (so you can then compute faces via
  `FOLD.convert.edges_vertices_to_faces_vertices_edges`),
  but ignores face properties and discards `vertices_vertices` if present.
  */
  var b1, b2, boundaries, e, e1, e2, ev, i, i1, i2, ie, ie1, ie2, k, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, neighbor, neighbors, o, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, u1, u2, v, v1, v2, ve, vertices_boundaries;
  vertices_boundaries = [];
  ref = filter.boundaryEdges(fold);
  for (k = 0, len = ref.length; k < len; k++) {
    e = ref[k];
    ref1 = fold.edges_vertices[e];
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      v = ref1[l];
      (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e);
    }
  }
  for (m = 0, len2 = es.length; m < len2; m++) {
    e1 = es[m];
    //# Split e1 into two edges {e1, e2}
    e2 = filter.addEdgeLike(fold, e1);
    ref2 = fold.edges_vertices[e1];
    for (i = n = 0, len3 = ref2.length; n < len3; i = ++n) {
      v = ref2[i];
      ve = fold.vertices_edges[v];
      ve.splice(ve.indexOf(e1) + i, 0, e2);
    }
    ref3 = fold.edges_vertices[e1];
    //# Check for endpoints of {e1, e2} to split, when they're on the boundary
    for (i = o = 0, len4 = ref3.length; o < len4; i = ++o) {
      v1 = ref3[i];
      u1 = fold.edges_vertices[e1][1 - i];
      u2 = fold.edges_vertices[e2][1 - i];
      boundaries = (ref4 = vertices_boundaries[v1]) != null ? ref4.length : void 0;
      if (boundaries >= 2) { //# vertex already on boundary
        if (boundaries > 2) {
          throw new Error(`${vertices_boundaries[v1].length} boundary edges at vertex ${v1}`);
        }
        [b1, b2] = vertices_boundaries[v1];
        neighbors = fold.vertices_edges[v1];
        i1 = neighbors.indexOf(b1);
        i2 = neighbors.indexOf(b2);
        if (i2 === (i1 + 1) % neighbors.length) {
          if (i2 !== 0) {
            neighbors = neighbors.slice(i2).concat(neighbors.slice(0, +i1 + 1 || 9e9));
          }
        } else if (i1 === (i2 + 1) % neighbors.length) {
          if (i1 !== 0) {
            neighbors = neighbors.slice(i1).concat(neighbors.slice(0, +i2 + 1 || 9e9));
          }
        } else {
          throw new Error(`Nonadjacent boundary edges at vertex ${v1}`);
        }
        //# Find first vertex among e1, e2 among neighbors, so other is next
        ie1 = neighbors.indexOf(e1);
        ie2 = neighbors.indexOf(e2);
        ie = Math.min(ie1, ie2);
        fold.vertices_edges[v1] = neighbors.slice(0, +ie + 1 || 9e9);
        v2 = filter.addVertexLike(fold, v1);
        fold.vertices_edges[v2] = neighbors.slice(1 + ie);
        ref5 = fold.vertices_edges[v2];
        //console.log "Split #{neighbors} into #{fold.vertices_edges[v1]} for #{v1} and #{fold.vertices_edges[v2]} for #{v2}"
        for (q = 0, len5 = ref5.length; q < len5; q++) {
          neighbor = ref5[q];
          ev = fold.edges_vertices[neighbor];
          ev[ev.indexOf(v1)] = v2;
        }
      }
    }
    if ((ref6 = fold.edges_assignment) != null) {
      ref6[e1] = 'B';
    }
    if ((ref7 = fold.edges_assignment) != null) {
      ref7[e2] = 'B';
    }
    ref8 = fold.edges_vertices[e1];
    for (i = r = 0, len6 = ref8.length; r < len6; i = ++r) {
      v = ref8[i];
      (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e1);
    }
    ref9 = fold.edges_vertices[e2];
    for (i = t = 0, len7 = ref9.length; t < len7; i = ++t) {
      v = ref9[i];
      (vertices_boundaries[v] != null ? vertices_boundaries[v] : vertices_boundaries[v] = []).push(e2);
    }
  }
  delete fold.vertices_vertices; // would be out-of-date
  return fold;
};

filter.edges_vertices_to_vertices_vertices = function(fold) {
  /*
  Works for abstract structures, so NOT SORTED.
  Use sort_vertices_vertices to sort in counterclockwise order.
  */
  var edge, k, len, numVertices, ref, v, vertices_vertices, w;
  numVertices = filter.numVertices(fold);
  vertices_vertices = (function() {
    var k, ref, results;
    results = [];
    for (v = k = 0, ref = numVertices; (0 <= ref ? k < ref : k > ref); v = 0 <= ref ? ++k : --k) {
      results.push([]);
    }
    return results;
  })();
  ref = fold.edges_vertices;
  for (k = 0, len = ref.length; k < len; k++) {
    edge = ref[k];
    [v, w] = edge;
    while (v >= vertices_vertices.length) {
      vertices_vertices.push([]);
    }
    while (w >= vertices_vertices.length) {
      vertices_vertices.push([]);
    }
    vertices_vertices[v].push(w);
    vertices_vertices[w].push(v);
  }
  return vertices_vertices;
};

convert.edges_vertices_to_vertices_vertices_unsorted = function(fold) {
  /*
  Works for abstract structures, so NOT SORTED.
  Use sort_vertices_vertices to sort in counterclockwise order.
  */
  fold.vertices_vertices = filter.edges_vertices_to_vertices_vertices(fold);
  return fold;
};

const FOLD = Object.create(null);
FOLD.filter = filter;
FOLD.convert = convert;

export default FOLD;
