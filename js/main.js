(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Util = require('./modules/util');
var debounce = require('./modules/debounce');
var Camera = require('./modules/camera');

var body_width = document.body.clientWidth;
var body_height = document.body.clientHeight;
var vector_mouse_down = new THREE.Vector2();
var vector_mouse_move = new THREE.Vector2();
var vector_mouse_end = new THREE.Vector2();

var canvas = null;
var renderer = null;
var scene = null;
var camera = null;

var running = null;
var sketches = require('./sketches');
var sketch_id = 0;

var metas = document.getElementsByTagName('meta');
var btn_toggle_menu = document.querySelector('.btn-switch-menu');
var menu = document.querySelector('.menu');
var select_sketch = document.querySelector('.select-sketch');
var sketch_title = document.querySelector('.sketch-title');
var sketch_date = document.querySelector('.sketch-date');
var sketch_description = document.querySelector('.sketch-description');

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(body_width, body_height);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x111111, 1.0);

  scene = new THREE.Scene();

  camera = new Camera();
  camera.init(body_width, body_height);
};

var init = function() {
  setSketchId();
  buildMenu();
  initThree();
  startRunSketch(sketches[sketches.length - sketch_id]);
  renderloop();
  setEvent();
  debounce(window, 'resize', function(event){
    resizeRenderer();
  });
};

var getParameterByName = function(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var setSketchId = function() {
  sketch_id = getParameterByName('sketch_id');
  if (sketch_id == null || sketch_id > sketches.length || sketch_id < 1) {
    sketch_id = sketches.length;
  }
};

var buildMenu = function() {
  for (var i = 0; i < sketches.length; i++) {
    var sketch = sketches[i];
    var dom = document.createElement('li');
    dom.setAttribute('data-index', i);
    dom.innerHTML = '<span>' + sketch.name + '</span>';
    dom.addEventListener('click', function() {
      switchSketch(sketches[this.getAttribute('data-index')]);
    });
    select_sketch.appendChild(dom);
  }
};

var startRunSketch = function(sketch) {
  running = new sketch.obj;
  running.init(scene, camera);
  sketch_title.innerHTML = sketch.name;
  sketch_date.innerHTML = (sketch.update.length > 0)
                          ? 'posted: ' + sketch.posted + ' / update: ' + sketch.update
                          : 'posted: ' + sketch.posted;
  sketch_description.innerHTML = sketch.description;
};

var switchSketch = function(sketch) {
  running.remove(scene, camera);
  startRunSketch(sketch);
  switchMenu();
};

var render = function() {
  renderer.clear();
  running.render(scene, camera, vector_mouse_move);
  renderer.render(scene, camera.obj);
};

var renderloop = function() {
  var now = Date.now();
  requestAnimationFrame(renderloop);
  render();
};

var resizeRenderer = function() {
  body_width  = document.body.clientWidth;
  body_height = document.body.clientHeight;
  renderer.setSize(body_width, body_height);
  camera.resize(body_width, body_height);
};

var setEvent = function () {
  canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', function (event) {
    event.preventDefault();
    touchStart(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('mousemove', function (event) {
    event.preventDefault();
    touchMove(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('mouseup', function (event) {
    event.preventDefault();
    touchEnd(event.clientX, event.clientY, false);
  });

  canvas.addEventListener('touchstart', function (event) {
    event.preventDefault();
    touchStart(event.touches[0].clientX, event.touches[0].clientY, true);
  });

  canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
    touchMove(event.touches[0].clientX, event.touches[0].clientY, true);
  });

  canvas.addEventListener('touchend', function (event) {
    event.preventDefault();
    touchEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY, true);
  });

  window.addEventListener('mouseout', function () {
    event.preventDefault();
    touchEnd(0, 0, false);
  });

  btn_toggle_menu.addEventListener('click', function(event) {
    event.preventDefault();
    switchMenu();
  });
};

var transformVector2d = function(vector) {
  vector.x = (vector.x / body_width) * 2 - 1;
  vector.y = - (vector.y / body_height) * 2 + 1;
};

var touchStart = function(x, y, touch_event) {
  vector_mouse_down.set(x, y);
  transformVector2d(vector_mouse_down);
  if (running.touchStart) running.touchStart(scene, camera, vector_mouse_down);
};

var touchMove = function(x, y, touch_event) {
  vector_mouse_move.set(x, y);
  transformVector2d(vector_mouse_move);
  if (running.touchMove) running.touchMove(scene, camera, vector_mouse_down, vector_mouse_move);
};

var touchEnd = function(x, y, touch_event) {
  vector_mouse_end.set(x, y);
  if (running.touchEnd) running.touchEnd(scene, camera, vector_mouse_end);
};

var switchMenu = function() {
  btn_toggle_menu.classList.toggle('is-active');
  menu.classList.toggle('is-active');
  document.body.classList.remove('is-pointed');
};

init();

},{"./modules/camera":2,"./modules/debounce":3,"./modules/util":10,"./sketches":11}],2:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Camera = function() {
    this.rad1_base = Util.getRadian(10);
    this.rad1 = this.rad1_base;
    this.rad2 = Util.getRadian(0);
    this.look = new Force3();
    this.rotate_rad1_base = 0;
    this.rotate_rad1 = 0;
    this.rotate_rad2_base = 0;
    this.rotate_rad2 = 0;
    this.range = 1000;
    this.obj;
    Force3.call(this);
  };
  Camera.prototype = Object.create(Force3.prototype);
  Camera.prototype.constructor = Camera;
  Camera.prototype.init = function(width, height) {
    this.obj = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
    this.obj.up.set(0, 1, 0);
    this.position = this.obj.position;
    this.setPositionSpherical();
    this.velocity.copy(this.anchor);
    this.lookAtCenter();
  };
  Camera.prototype.reset = function() {
    this.setPositionSpherical();
    this.lookAtCenter();
  };
  Camera.prototype.resize = function(width, height) {
    this.obj.aspect = width / height;
    this.obj.updateProjectionMatrix();
  };
  Camera.prototype.setPositionSpherical = function() {
    var vector = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.anchor.copy(vector);
  };
  Camera.prototype.lookAtCenter = function() {
    this.obj.lookAt({
      x: 0,
      y: 0,
      z: 0
    });
  };
  return Camera;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],3:[function(require,module,exports){
module.exports = function(object, eventType, callback){
  var timer;

  object.addEventListener(eventType, function(event) {
    clearTimeout(timer);
    timer = setTimeout(function(){
      callback(event);
    }, 500);
  }, false);
};

},{}],4:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force2 = function() {
    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.acceleration = new THREE.Vector2();
    this.anchor = new THREE.Vector2();
    this.mass = 1;
  };
  
  Force2.prototype.updatePosition = function() {
    this.position.copy(this.velocity);
  };
  Force2.prototype.updateVelocity = function() {
    this.acceleration.divideScalar(this.mass);
    this.velocity.add(this.acceleration);
  };
  Force2.prototype.applyForce = function(vector) {
    this.acceleration.add(vector);
  };
  Force2.prototype.applyFriction = function(mu, normal) {
    var force = this.acceleration.clone();
    if (!normal) normal = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    this.applyForce(force);
  };
  Force2.prototype.applyDrag = function(value) {
    var force = this.acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(this.acceleration.length() * value);
    this.applyForce(force);
  };
  Force2.prototype.applyHook = function(rest_length, k) {
    var force = this.velocity.clone().sub(this.anchor);
    var distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    this.applyForce(force);
  };

  return Force2;
};

module.exports = exports();

},{"../modules/util":10}],5:[function(require,module,exports){
var Util = require('../modules/util');

var exports = function(){
  var Force = function() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.mass = 1;
  };
  
  Force.prototype.updatePosition = function() {
    this.position.copy(this.velocity);
  };
  Force.prototype.updateVelocity = function() {
    this.acceleration.divideScalar(this.mass);
    this.velocity.add(this.acceleration);
  };
  Force.prototype.applyForce = function(vector) {
    this.acceleration.add(vector);
  };
  Force.prototype.applyFriction = function(mu, normal) {
    var force = this.acceleration.clone();
    if (!normal) normal = 1;
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(mu);
    this.applyForce(force);
  };
  Force.prototype.applyDrag = function(value) {
    var force = this.acceleration.clone();
    force.multiplyScalar(-1);
    force.normalize();
    force.multiplyScalar(this.acceleration.length() * value);
    this.applyForce(force);
  };
  Force.prototype.applyHook = function(rest_length, k) {
    var force = this.velocity.clone().sub(this.anchor);
    var distance = force.length() - rest_length;
    force.normalize();
    force.multiplyScalar(-1 * k * distance);
    this.applyForce(force);
  };

  return Force;
};

module.exports = exports();

},{"../modules/util":10}],6:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var HemiLight = function() {
    this.rad1 = Util.getRadian(0);
    this.rad2 = Util.getRadian(0);
    this.range = 1000;
    this.hex1 = 0xffffff;
    this.hex2 = 0x333333;
    this.intensity = 1;
    this.obj;
    Force3.call(this);
  };
  HemiLight.prototype = Object.create(Force3.prototype);
  HemiLight.prototype.constructor = HemiLight;
  HemiLight.prototype.init = function(hex1, hex2, intensity) {
    if (hex1) this.hex1 = hex1;
    if (hex2) this.hex2 = hex2;
    if (intensity) this.intensity = intensity;
    this.obj = new THREE.HemisphereLight(this.hex1, this.hex2, this.intensity);
    this.position = this.obj.position;
    this.setPositionSpherical();
  };
  HemiLight.prototype.setPositionSpherical = function() {
    var points = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.position.copy(points);
  };
  return HemiLight;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],7:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Mover = function() {
    this.size = 0;
    this.time = 0;
    this.is_active = false;
    Force3.call(this);
  };
  Mover.prototype = Object.create(Force3.prototype);
  Mover.prototype.constructor = Mover;
  Mover.prototype.init = function(vector) {
    this.position = vector.clone();
    this.velocity = vector.clone();
    this.anchor = vector.clone();
    this.acceleration.set(0, 0, 0);
    this.time = 0;
  };
  Mover.prototype.activate = function() {
    this.is_active = true;
  };
  Mover.prototype.inactivate = function() {
    this.is_active = false;
  };
  return Mover;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],8:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var PointLight = function() {
    this.rad1 = Util.getRadian(0);
    this.rad2 = Util.getRadian(0);
    this.range = 200;
    this.hex = 0xffffff;
    this.intensity = 1;
    this.distance = 2000;
    this.decay = 1;
    this.obj;
    Force3.call(this);
  };
  PointLight.prototype = Object.create(Force3.prototype);
  PointLight.prototype.constructor = PointLight;
  PointLight.prototype.init = function(hex, distance) {
    if (hex) this.hex = hex;
    if (distance) this.distance = distance;
    this.obj = new THREE.PointLight(this.hex, this.intensity, this.distance, this.decay);
    this.position = this.obj.position;
    this.setPositionSpherical();
  };
  PointLight.prototype.setPositionSpherical = function() {
    var points = Util.getSpherical(this.rad1, this.rad2, this.range);
    this.position.copy(points);
  };
  return PointLight;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],9:[function(require,module,exports){
var Util = require('../modules/util');
var Force3 = require('../modules/force3');

var exports = function(){
  var Points = function() {
    this.geometry = new THREE.BufferGeometry();
    this.material = null;
    this.obj = null;
    Force3.call(this);
  };
  Points.prototype = Object.create(Force3.prototype);
  Points.prototype.constructor = Points;
  Points.prototype.init = function(param) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { type: 'c', value: new THREE.Color(0xffffff) },
        texture: { type: 't', value: param.texture }
      },
      vertexShader: param.vs,
      fragmentShader: param.fs,
      transparent: true,
      depthWrite: false,
      blending: param.blending
    });
    this.geometry.addAttribute('position', new THREE.BufferAttribute(param.positions, 3));
    this.geometry.addAttribute('customColor', new THREE.BufferAttribute(param.colors, 3));
    this.geometry.addAttribute('vertexOpacity', new THREE.BufferAttribute(param.opacities, 1));
    this.geometry.addAttribute('size', new THREE.BufferAttribute(param.sizes, 1));
    this.obj = new THREE.Points(this.geometry, this.material);
    param.scene.add(this.obj);
    this.position = this.obj.position;
  };
  Points.prototype.updatePoints = function() {
    this.obj.geometry.attributes.position.needsUpdate = true;
    this.obj.geometry.attributes.vertexOpacity.needsUpdate = true;
    this.obj.geometry.attributes.size.needsUpdate = true;
    this.obj.geometry.attributes.customColor.needsUpdate = true;
  };
  return Points;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/util":10}],10:[function(require,module,exports){
var exports = {
  getRandomInt: function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getDegree: function(radian) {
    return radian / Math.PI * 180;
  },
  getRadian: function(degrees) {
    return degrees * Math.PI / 180;
  },
  getSpherical: function(rad1, rad2, r) {
    var x = Math.cos(rad1) * Math.cos(rad2) * r;
    var z = Math.cos(rad1) * Math.sin(rad2) * r;
    var y = Math.sin(rad1) * r;
    return new THREE.Vector3(x, y, z);
  }
};

module.exports = exports;

},{}],11:[function(require,module,exports){
module.exports = [
  {
    name: 'distort',
    obj: require('./sketches/distort'),
    posted: '2016.2.23',
    update: '',
    description: 'using the simplex noise, distort the sphere.',
  },
  {
    name: 'image data',
    obj: require('./sketches/image_data'),
    posted: '2015.12.9',
    update: '2015.12.12',
    description: 'Points based CanvasRenderingContext2D.getImageData()',
  },
  {
    name: 'gallery',
    obj: require('./sketches/gallery'),
    posted: '2015.12.2',
    update: '2015.12.9',
    description: 'image gallery on 3d. tested that picked object and moving camera.',
  },
  {
    name: 'comet',
    obj: require('./sketches/comet'),
    posted: '2015.11.24',
    update: '2016.1.8',
    description: 'camera to track the moving points.',
  },
  {
    name: 'hyper space',
    obj: require('./sketches/hyper_space'),
    posted: '2015.11.12',
    update: '',
    description: 'add little change about camera angle and particle controles.',
  },
  {
    name: 'fire ball',
    obj: require('./sketches/fire_ball'),
    posted: '2015.11.12',
    update: '',
    description: 'test of simple physics and additive blending.',
  }
];

},{"./sketches/comet":12,"./sketches/distort":13,"./sketches/fire_ball":14,"./sketches/gallery":15,"./sketches/hyper_space":16,"./sketches/image_data":17}],12:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var HemiLight = require('../modules/hemiLight');
var PointLight = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var movers_num = 10000;
  var movers = [];
  var mover_activate_count = 2;
  var points = new Points();
  var hemi_light = new HemiLight();
  var comet_light1 = new PointLight();
  var comet_light2 = new PointLight();
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var comet = null;
  var comet_radius = 30;
  var comet_scale = new Force2();
  var comet_color_h = 140;
  var color_diff = 45;
  var planet = null;
  var last_time_activate = Date.now();
  var last_time_plus_activate = Date.now();
  var last_time_bounce = Date.now();
  var last_time_touch = Date.now();
  var plus_acceleration = 0;
  var is_touched = false;
  var is_plus_activate = false;
  var track_points = true;

  var updateMover = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      var position = new THREE.Vector3();
      if (mover.is_active) {
        mover.time++;
        mover.applyDrag(0.1);
        mover.updateVelocity();
        mover.updatePosition();
        if (mover.time > 10) {
          mover.size -= 2;
          //mover.a -= 0.04;
        }
        if (mover.size <= 0) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.y;
      positions[i * 3 + 2] = mover.position.z - points.position.z;
      colors[i * 3 + 0] = mover.color.r;
      colors[i * 3 + 1] = mover.color.g;
      colors[i * 3 + 2] = mover.color.b;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover = function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > 10) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad1 = Util.getRadian(Util.getRandomInt(0, 360));
        var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
        var range = Util.getRandomInt(1, 30);
        var vector = Util.getSpherical(rad1, rad2, range);
        var force = Util.getSpherical(rad1, rad2, range / 20);
        var h = Util.getRandomInt(comet_color_h - color_diff, comet_color_h + color_diff) - plus_acceleration / 1.5;
        var s = Util.getRandomInt(60, 80);
        vector.add(points.position);
        mover.activate();
        mover.init(vector);
        mover.color.setHSL(h / 360, s / 100, 0.7);
        mover.applyForce(force);
        mover.a = 1;
        mover.size = 25;
        count++;
        if (count >= mover_activate_count) break;
      }
      last_time_activate = Date.now();
    }
  };

  var rotateComet = function() {
    comet.rotation.x += 0.03 + plus_acceleration / 1000;
    comet.rotation.y += 0.01 + plus_acceleration / 1000;
    comet.rotation.z += 0.01 + plus_acceleration / 1000;
    points.rad1_base += Util.getRadian(.6);
    points.rad1 = Util.getRadian(Math.sin(points.rad1_base) * 45 + plus_acceleration / 100);
    points.rad2 += Util.getRadian(0.8 + plus_acceleration / 100);
    points.rad3 += 0.01;
    return Util.getSpherical(points.rad1, points.rad2, 350);
  };

  var rotateCometColor = function() {
    var radius = comet_radius * 0.8;
    comet_light1.obj.position.copy(Util.getSpherical(Util.getRadian(0),  Util.getRadian(0), radius).add(points.position));
    comet_light2.obj.position.copy(Util.getSpherical(Util.getRadian(180), Util.getRadian(0), radius).add(points.position));
  };

  var bounceComet = function() {
    if (Date.now() - last_time_bounce > 1000 - plus_acceleration * 3) {
      comet_scale.applyForce(new THREE.Vector2(0.08 + plus_acceleration / 5000, 0));
      last_time_bounce = Date.now();
      is_plus_activate = true;
      last_time_plus_activate = Date.now();
    }
    if (is_plus_activate && Date.now() - last_time_plus_activate < 500) {
      mover_activate_count = 6 + Math.floor(plus_acceleration / 40);
    } else {
      mover_activate_count = 1 + Math.floor(plus_acceleration / 40);
    }
    comet_scale.applyHook(0, 0.1);
    comet_scale.applyDrag(0.12);
    comet_scale.updateVelocity();
    comet_scale.updatePosition();
    comet.scale.set(1 + comet_scale.position.x, 1 + comet_scale.position.x, 1 + comet_scale.position.x);
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.9, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  var createCommet = function() {
    var base_geometry = new THREE.OctahedronGeometry(comet_radius, 2);
    var geometry = new THREE.BufferGeometry();
    var material = new THREE.MeshPhongMaterial({
      color: new THREE.Color('hsl(' + comet_color_h + ', 100%, 100%)'),
      shading: THREE.FlatShading
    });
    var positions = new Float32Array(base_geometry.vertices.length * 3);
    for (var i = 0; i < base_geometry.vertices.length; i++) {
      positions[i * 3] = base_geometry.vertices[i].x;
      positions[i * 3 + 1] = base_geometry.vertices[i].y;
      positions[i * 3 + 2] = base_geometry.vertices[i].z;
    }
    var indices = new Uint32Array(base_geometry.faces.length * 3);
    for (var j = 0; j < base_geometry.faces.length; j++) {
      indices[j * 3] = base_geometry.faces[j].a;
      indices[j * 3 + 1] = base_geometry.faces[j].b;
      indices[j * 3 + 2] = base_geometry.faces[j].c;
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.attributes.position.dynamic = true;
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.index.dynamic = true;
    return new THREE.Mesh(geometry, material);
  };

  var createPlanet = function() {
    var geometry = new THREE.OctahedronGeometry(250, 4);
    var material = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shading: THREE.FlatShading
    });
    return new THREE.Mesh(geometry, material);
  };

  var accelerateComet = function() {
    if (is_touched && plus_acceleration < 200) {
      plus_acceleration += 1;
    } else if(plus_acceleration > 0) {
      plus_acceleration -= 1;
    }
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      comet = createCommet();
      scene.add(comet);
      planet = createPlanet();
      scene.add(planet);
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(comet_color_h - color_diff, comet_color_h + color_diff);
        var s = Util.getRandomInt(60, 80);
        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        mover.color = new THREE.Color('hsl(' + h + ', ' + s + '%, 70%)');
        movers.push(mover);
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
        colors[i * 3 + 0] = mover.color.r;
        colors[i * 3 + 1] = mover.color.g;
        colors[i * 3 + 2] = mover.color.b;
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: vs,
        fs: fs,
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.NormalBlending
      });
      points.rad1 = 0;
      points.rad1_base = 0;
      points.rad2 = 0;
      points.rad3 = 0;
      hemi_light.init(
        new THREE.Color('hsl(' + (comet_color_h - color_diff) + ', 50%, 60%)').getHex(),
        new THREE.Color('hsl(' + (comet_color_h + color_diff) + ', 50%, 60%)').getHex()
      );
      scene.add(hemi_light.obj);
      comet_light1.init(new THREE.Color('hsl(' + (comet_color_h - color_diff) + ', 60%, 50%)'));
      scene.add(comet_light1.obj);
      comet_light2.init(new THREE.Color('hsl(' + (comet_color_h + color_diff) + ', 60%, 50%)'));
      scene.add(comet_light2.obj);
      camera.anchor = new THREE.Vector3(1500, 0, 0);
    },
    remove: function(scene) {
      comet.geometry.dispose();
      comet.material.dispose();
      scene.remove(comet);
      planet.geometry.dispose();
      planet.material.dispose();
      scene.remove(planet);
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(hemi_light.obj);
      scene.remove(comet_light1.obj);
      scene.remove(comet_light2.obj);
      movers = [];
    },
    render: function(scene, camera) {
      accelerateComet();
      points.velocity = rotateComet();
      if (track_points === true) {
        camera.anchor.copy(
          points.velocity.clone().add(
            points.velocity.clone().sub(points.position)
            .normalize().multiplyScalar(-400)
          )
        );
        camera.anchor.y += points.position.y * 2;
        camera.look.anchor.copy(points.position);
      }
      points.updatePosition();
      comet.position.copy(points.position);
      hemi_light.obj.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      hemi_light.obj.groundColor.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light1.obj.position.copy(points.velocity);
      comet_light1.obj.color.setHSL((comet_color_h - color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      comet_light2.obj.position.copy(points.velocity);
      comet_light2.obj.color.setHSL((comet_color_h + color_diff - plus_acceleration / 1.5) / 360, 0.5, 0.6);
      activateMover();
      updateMover();
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
      rotateCometColor();
      bounceComet();
    },
    touchStart: function(scene, camera, vector) {
      is_touched = true;
      last_time_touch = Date.now();
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      is_touched = false;
      if (Date.now() - last_time_touch < 100) {
        if (track_points === true) {
          camera.anchor.set(1200, 1200, 0);
          camera.look.anchor.set(0, 0, 0);
          track_points = false;
        } else {
          track_points = true;
        }
      }
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":4,"../modules/hemiLight":6,"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],13:[function(require,module,exports){
var Util = require('../modules/util');
var Force2 = require('../modules/force2');
var HemiLight = require('../modules/hemiLight');

var vs = "#define GLSLIFY 1\nuniform float time;\r\nuniform float radius;\r\nuniform float distort;\r\n\r\nvarying vec3 vColor;\r\n\r\nuniform vec3 hemisphereLightDirection;\r\nuniform vec3 hemisphereLightSkyColor;\r\nuniform vec3 hemisphereLightGroundColor;\r\n\r\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2_0(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2_1(vec4 x) {\n     return mod289_2_0(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_2_2(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2_3(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_2_4 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_2_5 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_2_5;\n  vec3 i1 = min( g_2_5.xyz, l.zxy );\n  vec3 i2 = max( g_2_5.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_2_4.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2_0(i);\n  vec4 p = permute_2_1( permute_2_1( permute_2_1(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_2_4.wyz - D_2_4.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_2_6 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_2_7 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_2_6.xy,h.z);\n  vec3 p3 = vec3(a1_2_6.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_2_2(vec4(dot(p0_2_7,p0_2_7), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_2_7 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_2_7,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\nvec3 hsv2rgb_1_8(vec3 c){\r\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\r\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r\n}\r\n\n\n\r\nvoid main() {\r\n  float updateTime = time / 1000.0;\r\n  float noise = snoise_2_3(vec3(position / 400.1 + updateTime * 5.0));\r\n  vec4 mvPosition = modelViewMatrix * vec4(position * (noise * pow(distort, 2.0) + radius), 1.0);\r\n  vec3 light = vec3(0.8);\r\n  light += dot(-hemisphereLightDirection, normal) * hemisphereLightSkyColor * 0.25;\r\n\r\n  vColor = hsv2rgb_1_8(vec3(noise * distort * 0.3 + updateTime, 0.2, 1.0)) * light;\r\n\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nvarying vec3 vColor;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(vColor, 1.0);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var sphere = null;
  var bg = null;
  var light = new HemiLight();
  var force = new Force2();
  var time_unit = 1;

  var createSphere = function() {
    var geometry = new THREE.BufferGeometry();
    geometry.fromGeometry(new THREE.OctahedronGeometry(200, 5));
    var material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        {
          time: {
            type: 'f',
            value: 0,
          },
          radius: {
            type: 'f',
            value: 1.0
          },
          distort: {
            type: 'f',
            value: 0.4
          }
        }
      ]),
      vertexShader: vs,
      fragmentShader: fs,
      lights: true,
    });
    return new THREE.Mesh(geometry, material);
  };

  var createBackground = function() {
    var geometry = new THREE.SphereGeometry(1800);
    var material = new THREE.MeshPhongMaterial({
      side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      document.body.className = 'bg-white';
      sphere = createSphere();
      scene.add(sphere);
      bg = createBackground();
      scene.add(bg);
      light.init(0xffffff, 0x666666);
      scene.add(light.obj);
      camera.anchor.set(1800, 1800, 0);
      camera.look.anchor.set(0, 0, 0);
      force.anchor.set(1, 0);
      force.velocity.set(1, 0);
    },
    remove: function(scene) {
      document.body.className = '';
      sphere.geometry.dispose();
      sphere.material.dispose();
      scene.remove(sphere);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      scene.remove(light.obj);
    },
    render: function(scene, camera) {
      force.applyHook(0, 0.06);
      force.applyDrag(0.12);
      force.updateVelocity();
      force.updatePosition();
      sphere.material.uniforms.time.value += time_unit;
      sphere.material.uniforms.radius.value = force.position.x;
      sphere.material.uniforms.distort.value = force.position.x / 2 - 0.1;
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.look.applyHook(0, 0.2);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
    },
    touchStart: function(scene, camera, vector) {
      if (force.anchor.x < 3) {
        force.anchor.x += 0.8;
        time_unit += 0.4;
      } else {
        force.anchor.x = 1.0;
        time_unit = 1;
      }
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      is_touched = false;
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/force2":4,"../modules/hemiLight":6,"../modules/util":10}],14:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var movers_num = 10000;
  var movers = [];
  var points = new Points();
  var light = new Light();
  var bg = null;
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var gravity = new THREE.Vector3(0, 0.1, 0);
  var last_time_activate = Date.now();
  var is_draged = false;

  var updateMover =  function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      if (mover.is_active) {
        mover.time++;
        mover.applyForce(gravity);
        mover.applyDrag(0.01);
        mover.updateVelocity();
        mover.updatePosition();
        mover.position.sub(points.position);
        if (mover.time > 50) {
          mover.size -= 0.7;
          mover.a -= 0.009;
        }
        if (mover.a <= 0) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.x;
      positions[i * 3 + 2] = mover.position.z - points.position.x;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover =  function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > 10) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad1 = Util.getRadian(Math.log(Util.getRandomInt(0, 256)) / Math.log(256) * 260);
        var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
        var range = (1- Math.log(Util.getRandomInt(32, 256)) / Math.log(256)) * 12;
        var vector = new THREE.Vector3();
        var force = Util.getSpherical(rad1, rad2, range);
        vector.add(points.position);
        mover.activate();
        mover.init(vector);
        mover.applyForce(force);
        mover.a = 0.2;
        mover.size = Math.pow(12 - range, 2) * Util.getRandomInt(1, 24) / 10;
        count++;
        if (count >= 6) break;
      }
      last_time_activate = Date.now();
    }
  };

  var updatePoints =  function() {
    points.updateVelocity();
    points.updatePosition();
    light.obj.position.copy(points.velocity);
  };

  var movePoints = function(vector) {
    var y = vector.y * document.body.clientHeight / 3;
    var z = vector.x * document.body.clientWidth / -3;
    points.anchor.y = y;
    points.anchor.z = z;
    light.anchor.y = y;
    light.anchor.z = z;
  }

  var createTexture =  function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();
    
    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };
  
  var createBackground =  function() {
    var geometry = new THREE.OctahedronGeometry(1500, 3);
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geometry, material);
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(0, 45);
        var s = Util.getRandomInt(60, 90);
        var color = new THREE.Color('hsl(' + h + ', ' + s + '%, 50%)');

        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        movers.push(mover);
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
        color.toArray(colors, i * 3);
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: vs,
        fs: fs,
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.AdditiveBlending
      });
      light.init(0xff6600, 1800);
      scene.add(light.obj);
      bg = createBackground();
      scene.add(bg);
      camera.rad1_base = Util.getRadian(25);
      camera.rad1 = camera.rad1_base;
      camera.rad2 = Util.getRadian(0);
      camera.setPositionSpherical();
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(light.obj);
      bg.geometry.dispose();
      bg.material.dispose();
      scene.remove(bg);
      movers = [];
    },
    render: function(scene, camera) {
      points.applyHook(0, 0.08);
      points.applyDrag(0.2);
      points.updateVelocity();
      points.updatePosition();
      light.applyHook(0, 0.08);
      light.applyDrag(0.2);
      light.updateVelocity();
      light.updatePosition();
      activateMover();
      updateMover();
      camera.applyHook(0, 0.004);
      camera.applyDrag(0.1);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector) {
      movePoints(vector);
      is_draged = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      if (is_draged) {
        movePoints(vector_mouse_move);
      }
    },
    touchEnd: function(scene, camera, vector) {
      is_draged = false;
      points.anchor.set(0, 0, 0);
      light.anchor.set(0, 0, 0);
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],15:[function(require,module,exports){
var Util = require('../modules/util');
var HemiLight = require('../modules/hemiLight');
var Force3 = require('../modules/force3');

var exports = function(){
  var Sketch = function() {};
  var images = [];
  var images_num = 300;
  var hemi_light = new HemiLight();
  var raycaster = new THREE.Raycaster();
  var picked_id = -1;
  var picked_index = -1;
  var is_clicked = false;
  var is_draged = false;
  var get_near = false; 

  var Image = function() {
    this.rad = 0;
    this.obj = null;
    this.is_entered = false;
    Force3.call(this);
  };
  var image_geometry = new THREE.PlaneGeometry(100, 100);
  Image.prototype = Object.create(Force3.prototype);
  Image.prototype.constructor = Image;
  Image.prototype.init = function(vector) {
    var image_material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      map: new THREE.TextureLoader().load('img/gallery/image0' + Util.getRandomInt(1, 9) + '.jpg')
    });

    this.obj = new THREE.Mesh(image_geometry, image_material);
    this.position = this.obj.position;
    this.velocity = vector.clone();
    this.anchor = vector.clone();
    this.acceleration.set(0, 0, 0);
  };

  var initImages = function(scene) {
    for (var i = 0; i < images_num; i++) {
      var image = null;
      var rad = Util.getRadian(i % 45 * 8 + 180);
      var radius = 1000;
      var x = Math.cos(rad) * radius;
      var y = i * 5 - images_num * 2.5;
      var z = Math.sin(rad) * radius;
      var vector = new THREE.Vector3(x, y, z);
      image = new Image();
      image.init(new THREE.Vector3());
      image.rad = rad;
      image.anchor.copy(vector);
      scene.add(image.obj);
      images.push(image);
    }
  };

  var pickImage = function(scene, camera, vector) {
    if (get_near) return;
    var intersects = null;
    raycaster.setFromCamera(vector, camera.obj);
    intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && is_draged == false) {
      document.body.classList.add('is-pointed');
      picked_id = intersects[0].object.id;
    } else {
      resetPickImage();
    }
  };

  var getNearImage = function(camera, image) {
    get_near = true;
    camera.anchor.set(Math.cos(image.rad) * 780, image.position.y, Math.sin(image.rad) * 780);
    camera.look.anchor.copy(image.position);
    resetPickImage();
  };

  var resetPickImage = function() {
    document.body.classList.remove('is-pointed');
    picked_id = -1;
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      initImages(scene);
      hemi_light.init(0xffffff, 0xffffff);
      scene.add(hemi_light.obj);
      camera.anchor.set(0, 0, 0);
      camera.rotate_rad1 = Util.getRadian(-35);
      camera.rotate_rad1_base = camera.rotate_rad1;
      camera.rotate_rad2 = Util.getRadian(180);
      camera.rotate_rad2_base = camera.rotate_rad2;
    },
    remove: function(scene) {
      image_geometry.dispose();
      for (var i = 0; i < images.length; i++) {
        scene.remove(images[i].obj);
      };
      scene.remove(hemi_light.obj);
      images = [];
      get_near = false;
      document.body.classList.remove('is-pointed');
    },
    render: function(scene, camera) {
      for (var i = 0; i < images_num; i++) {
        images[i].applyHook(0, 0.14);
        images[i].applyDrag(0.4);
        images[i].updateVelocity();
        images[i].updatePosition();
        images[i].obj.lookAt({
          x: 0,
          y: images[i].position.y,
          z: 0
        });
        if (images[i].obj.id == picked_id && is_draged == false && get_near == false) {
          if (is_clicked == true) {
            picked_index = i;
          } else {
            images[i].obj.material.color.set(0xaaaaaa);
          }
        } else {
          images[i].obj.material.color.set(0xffffff);
        }
      }
      camera.applyHook(0, 0.08);
      camera.applyDrag(0.4);
      camera.updateVelocity();
      camera.updatePosition();
      if (get_near === false) {
        camera.look.anchor.copy(Util.getSpherical(camera.rotate_rad1, camera.rotate_rad2, 1000));
      }
      camera.look.applyHook(0, 0.08);
      camera.look.applyDrag(0.4);
      camera.look.updateVelocity();
      camera.look.updatePosition();
      camera.obj.lookAt(camera.look.position);
    },
    touchStart: function(scene, camera, vector) {
      pickImage(scene, camera, vector);
      is_clicked = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      pickImage(scene, camera, vector_mouse_move);
      if (is_clicked && vector_mouse_down.clone().sub(vector_mouse_move).length() > 0.01) {
        is_clicked = false;
        is_draged = true;
      }
      if (is_draged == true && get_near == false) {
        camera.rotate_rad1 = camera.rotate_rad1_base + Util.getRadian((vector_mouse_down.y - vector_mouse_move.y) * 50);
        camera.rotate_rad2 = camera.rotate_rad2_base + Util.getRadian((vector_mouse_down.x - vector_mouse_move.x) * 50);
        if (camera.rotate_rad1 < Util.getRadian(-50)) {
          camera.rotate_rad1 = Util.getRadian(-50);
        }
        if (camera.rotate_rad1 > Util.getRadian(50)) {
          camera.rotate_rad1 = Util.getRadian(50);
        }
      }
    },
    touchEnd: function(scene, camera, vector) {
      resetPickImage();
      if (get_near) {
        camera.anchor.set(0, 0, 0);
        picked_index = -1;
        get_near = false;
      } else if (is_clicked && picked_index > -1) {
        getNearImage(camera, images[picked_index]);
      } else if (is_draged) {
        camera.rotate_rad1_base = camera.rotate_rad1;
        camera.rotate_rad2_base = camera.rotate_rad2;
      }
      is_clicked = false;
      is_draged = false;
    }
  };
  return Sketch;
};

module.exports = exports();

},{"../modules/force3":5,"../modules/hemiLight":6,"../modules/util":10}],16:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');
var Points = require('../modules/points.js');
var Light = require('../modules/pointLight');

var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var movers_num = 20000;
  var movers = [];
  var points = new Points();
  var light = new Light();
  var positions = new Float32Array(movers_num * 3);
  var colors = new Float32Array(movers_num * 3);
  var opacities = new Float32Array(movers_num);
  var sizes = new Float32Array(movers_num);
  var gravity = new THREE.Vector3(1.5, 0, 0);
  var last_time_activate = Date.now();
  var is_touched = false;

  var updateMover = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      if (mover.is_active) {
        mover.time++;
        mover.applyForce(gravity);
        mover.applyDrag(0.1);
        mover.updateVelocity();
        mover.updatePosition();
        if (mover.a < 0.8) {
          mover.a += 0.02;
        }
        if (mover.position.x > 1000) {
          mover.init(new THREE.Vector3(0, 0, 0));
          mover.time = 0;
          mover.a = 0.0;
          mover.inactivate();
        }
      }
      positions[i * 3 + 0] = mover.position.x;
      positions[i * 3 + 1] = mover.position.y;
      positions[i * 3 + 2] = mover.position.z;
      opacities[i] = mover.a;
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var activateMover = function() {
    var count = 0;
    var now = Date.now();
    if (now - last_time_activate > gravity.x * 16) {
      for (var i = 0; i < movers.length; i++) {
        var mover = movers[i];
        if (mover.is_active) continue;
        var rad = Util.getRadian(Util.getRandomInt(0, 120) * 3);
        var range = Math.log(Util.getRandomInt(2, 128)) / Math.log(128) * 160 + 60;
        var y = Math.sin(rad) * range;
        var z = Math.cos(rad) * range;
        var vector = new THREE.Vector3(-1000, y, z);
        vector.add(points.position);
        mover.activate();
        mover.init(vector);
        mover.a = 0;
        mover.size = Util.getRandomInt(5, 60);
        count++;
        if (count >= Math.pow(gravity.x * 3, gravity.x * 0.4)) break;
      }
      last_time_activate = Date.now();
    }
  };

  var updatePoints = function() {
    points.updateVelocity();
    points.updatePosition();
    light.obj.position.copy(points.velocity);
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();
    
    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  var changeGravity = function() {
    if (is_touched) {
      if (gravity.x < 6) gravity.x += 0.02;
    } else {
      if (gravity.x > 1.5) gravity.x -= 0.1;
    }
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      for (var i = 0; i < movers_num; i++) {
        var mover = new Mover();
        var h = Util.getRandomInt(60, 210);
        var s = Util.getRandomInt(30, 90);
        var color = new THREE.Color('hsl(' + h + ', ' + s + '%, 50%)');

        mover.init(new THREE.Vector3(Util.getRandomInt(-100, 100), 0, 0));
        movers.push(mover);
        positions[i * 3 + 0] = mover.position.x;
        positions[i * 3 + 1] = mover.position.y;
        positions[i * 3 + 2] = mover.position.z;
        color.toArray(colors, i * 3);
        opacities[i] = mover.a;
        sizes[i] = mover.size;
      }
      points.init({
        scene: scene,
        vs: vs,
        fs: fs,
        positions: positions,
        colors: colors,
        opacities: opacities,
        sizes: sizes,
        texture: createTexture(),
        blending: THREE.AdditiveBlending
      });
      light.init();
      scene.add(light.obj);
      camera.anchor = new THREE.Vector3(800, 0, 0);
    },
    remove: function(scene) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      scene.remove(light.obj);
      movers = [];
    },
    render: function(scene, camera) {
      changeGravity();
      activateMover();
      updateMover();
      camera.applyHook(0, 0.008);
      camera.applyDrag(0.1);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();
    },
    touchStart: function(scene, camera, vector) {
      is_touched = true;
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.anchor.z = vector_mouse_move.x * 120;
      camera.anchor.y = vector_mouse_move.y * -120;
      //camera.lookAtCenter();
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.anchor.z = 0;
      camera.anchor.y = 0;
      is_touched = false;
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/pointLight":8,"../modules/points.js":9,"../modules/util":10}],17:[function(require,module,exports){
var Util = require('../modules/util');
var Mover = require('../modules/mover');

var Points = require('../modules/points.js');
var vs = "#define GLSLIFY 1\nattribute vec3 customColor;\r\nattribute float vertexOpacity;\r\nattribute float size;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  vColor = customColor;\r\n  fOpacity = vertexOpacity;\r\n  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\r\n  gl_PointSize = size * (300.0 / length(mvPosition.xyz));\r\n  gl_Position = projectionMatrix * mvPosition;\r\n}\r\n";
var fs = "#define GLSLIFY 1\nuniform vec3 color;\r\nuniform sampler2D texture;\r\n\r\nvarying vec3 vColor;\r\nvarying float fOpacity;\r\n\r\nvoid main() {\r\n  gl_FragColor = vec4(color * vColor, fOpacity);\r\n  gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);\r\n}\r\n";

var exports = function(){
  var Sketch = function() {};
  var image = new Image();
  var image_vertices = [];
  var movers = [];
  var positions = null;
  var colors = null;
  var opacities = null;
  var sizes = null;
  var length_side = 400;
  var points = new Points();
  var created_points = false;

  var loadImage = function(callback) {
    image.src = './img/image_data/elephant.png';
    image.onload = function() {
      callback();
    };
  };

  var getImageData = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = length_side;
    canvas.height = length_side;
    ctx.drawImage(image, 0, 0);
    var image_data = ctx.getImageData(0, 0, length_side, length_side);
    for (var y = 0; y < length_side; y++) {
      if (y % 3 > 0) continue;
      for (var x = 0; x < length_side; x++) {
        if (x % 3 > 0) continue;
        if(image_data.data[(x + y * length_side) * 4] > 0) {
          image_vertices.push(0, (y - length_side / 2) * -1, (x - length_side/ 2) * -1);
        }
      }
    }
  };

  var buildPoints = function(scene) {
    positions = new Float32Array(image_vertices);
    colors = new Float32Array(image_vertices.length);
    opacities = new Float32Array(image_vertices.length / 3);
    sizes = new Float32Array(image_vertices.length / 3);
    for (var i = 0; i < image_vertices.length / 3; i++) {
      var mover = new Mover();
      var color = new THREE.Color(
                                  'hsl(' + (image_vertices[i * 3 + 2] + image_vertices[i * 3 + 1] + length_side) / 5
                                  + ', 60%, 80%)');
      mover.init(new THREE.Vector3(image_vertices[i * 3], image_vertices[i * 3 + 1], image_vertices[i * 3 + 2]));
      mover.is_activate = true;
      movers.push(mover);
      color.toArray(colors, i * 3);
      opacities[i] = 1;
      sizes[i] = 12;
    }
    points.init({
      scene: scene,
      vs: vs,
      fs: fs,
      positions: positions,
      colors: colors,
      opacities: opacities,
      sizes: sizes,
      texture: createTexture(),
      blending: THREE.NormalBlending
    });
    created_points = true;
  };

  var applyForceToPoints = function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      var rad1 = Util.getRadian(Util.getRandomInt(0, 360));
      var rad2 = Util.getRadian(Util.getRandomInt(0, 360));
      var scalar = Util.getRandomInt(40, 80);
      mover.is_activate = false;
      mover.applyForce(Util.getSpherical(rad1, rad2, scalar));
    }
  };

  var updateMover =  function() {
    for (var i = 0; i < movers.length; i++) {
      var mover = movers[i];
      mover.time++;
      if (mover.acceleration.length() < 1) {
        mover.is_activate = true;
      }
      if (mover.is_activate) {
        mover.applyHook(0, 0.18);
        mover.applyDrag(0.26);
      } else {
        mover.applyDrag(0.035);
      }
      mover.updateVelocity();
      mover.updatePosition();
      mover.position.sub(points.position);
      positions[i * 3 + 0] = mover.position.x - points.position.x;
      positions[i * 3 + 1] = mover.position.y - points.position.x;
      positions[i * 3 + 2] = mover.position.z - points.position.x;
      mover.size = Math.log(Util.getRandomInt(1, 128)) / Math.log(128) * Math.sqrt(document.body.clientWidth);
      sizes[i] = mover.size;
    }
    points.updatePoints();
  };

  var createTexture = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var grad = null;
    var texture = null;

    canvas.width = 200;
    canvas.height = 200;
    grad = ctx.createRadialGradient(100, 100, 20, 100, 100, 100);
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.arc(100, 100, 100, 0, Math.PI / 180, true);
    ctx.fill();

    texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    return texture;
  };

  Sketch.prototype = {
    init: function(scene, camera) {
      loadImage(function() {
        getImageData();
        buildPoints(scene);
      });
      camera.range = 1400;
      camera.rad1_base = Util.getRadian(0);
      camera.rad1 = camera.rad1_base;
      camera.rad2 = Util.getRadian(0);
      camera.setPositionSpherical();
    },
    remove: function(scene, camera) {
      points.geometry.dispose();
      points.material.dispose();
      scene.remove(points.obj);
      image_vertices = [];
      movers = [];
      camera.range = 1000;
    },
    render: function(scene, camera) {
      if (created_points) {
        updateMover();
        points.updatePoints();
      }
      camera.applyHook(0, 0.025);
      camera.applyDrag(0.2);
      camera.updateVelocity();
      camera.updatePosition();
      camera.lookAtCenter();

    },
    touchStart: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      applyForceToPoints();
    },
    touchMove: function(scene, camera, vector_mouse_down, vector_mouse_move) {
      camera.anchor.z = vector_mouse_move.x * 1000;
      camera.anchor.y = vector_mouse_move.y * -1000;
    },
    touchEnd: function(scene, camera, vector_mouse_end) {
      camera.anchor.z = 0;
      camera.anchor.y = 0;
    }
  };

  return Sketch;
};

module.exports = exports();

},{"../modules/mover":7,"../modules/points.js":9,"../modules/util":10}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2NhbWVyYS5qcyIsInNyYy9qcy9tb2R1bGVzL2RlYm91bmNlLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UyLmpzIiwic3JjL2pzL21vZHVsZXMvZm9yY2UzLmpzIiwic3JjL2pzL21vZHVsZXMvaGVtaUxpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvbW92ZXIuanMiLCJzcmMvanMvbW9kdWxlcy9wb2ludExpZ2h0LmpzIiwic3JjL2pzL21vZHVsZXMvcG9pbnRzLmpzIiwic3JjL2pzL21vZHVsZXMvdXRpbC5qcyIsInNyYy9qcy9za2V0Y2hlcy5qcyIsInNyYy9qcy9za2V0Y2hlcy9jb21ldC5qcyIsInNyYy9qcy9za2V0Y2hlcy9kaXN0b3J0LmpzIiwic3JjL2pzL3NrZXRjaGVzL2ZpcmVfYmFsbC5qcyIsInNyYy9qcy9za2V0Y2hlcy9nYWxsZXJ5LmpzIiwic3JjL2pzL3NrZXRjaGVzL2h5cGVyX3NwYWNlLmpzIiwic3JjL2pzL3NrZXRjaGVzL2ltYWdlX2RhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL21vZHVsZXMvZGVib3VuY2UnKTtcclxudmFyIENhbWVyYSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jYW1lcmEnKTtcclxuXHJcbnZhciBib2R5X3dpZHRoID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcclxudmFyIGJvZHlfaGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XHJcbnZhciB2ZWN0b3JfbW91c2VfZG93biA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfbW92ZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbnZhciB2ZWN0b3JfbW91c2VfZW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcclxuXHJcbnZhciBjYW52YXMgPSBudWxsO1xyXG52YXIgcmVuZGVyZXIgPSBudWxsO1xyXG52YXIgc2NlbmUgPSBudWxsO1xyXG52YXIgY2FtZXJhID0gbnVsbDtcclxuXHJcbnZhciBydW5uaW5nID0gbnVsbDtcclxudmFyIHNrZXRjaGVzID0gcmVxdWlyZSgnLi9za2V0Y2hlcycpO1xyXG52YXIgc2tldGNoX2lkID0gMDtcclxuXHJcbnZhciBtZXRhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtZXRhJyk7XHJcbnZhciBidG5fdG9nZ2xlX21lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLXN3aXRjaC1tZW51Jyk7XHJcbnZhciBtZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1lbnUnKTtcclxudmFyIHNlbGVjdF9za2V0Y2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LXNrZXRjaCcpO1xyXG52YXIgc2tldGNoX3RpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNrZXRjaC10aXRsZScpO1xyXG52YXIgc2tldGNoX2RhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2tldGNoLWRhdGUnKTtcclxudmFyIHNrZXRjaF9kZXNjcmlwdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5za2V0Y2gtZGVzY3JpcHRpb24nKTtcclxuXHJcbnZhciBpbml0VGhyZWUgPSBmdW5jdGlvbigpIHtcclxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XHJcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XHJcbiAgICBhbnRpYWxpYXM6IHRydWVcclxuICB9KTtcclxuICBpZiAoIXJlbmRlcmVyKSB7XHJcbiAgICBhbGVydCgnVGhyZWUuanPjga7liJ3mnJ/ljJbjgavlpLHmlZfjgZfjgb7jgZfjgZ/jgIInKTtcclxuICB9XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZShib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbiAgY2FudmFzLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xyXG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgxMTExMTEsIDEuMCk7XHJcblxyXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XHJcblxyXG4gIGNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcclxuICBjYW1lcmEuaW5pdChib2R5X3dpZHRoLCBib2R5X2hlaWdodCk7XHJcbn07XHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHNldFNrZXRjaElkKCk7XHJcbiAgYnVpbGRNZW51KCk7XHJcbiAgaW5pdFRocmVlKCk7XHJcbiAgc3RhcnRSdW5Ta2V0Y2goc2tldGNoZXNbc2tldGNoZXMubGVuZ3RoIC0gc2tldGNoX2lkXSk7XHJcbiAgcmVuZGVybG9vcCgpO1xyXG4gIHNldEV2ZW50KCk7XHJcbiAgZGVib3VuY2Uod2luZG93LCAncmVzaXplJywgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgcmVzaXplUmVuZGVyZXIoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciBnZXRQYXJhbWV0ZXJCeU5hbWUgPSBmdW5jdGlvbihuYW1lKSB7XHJcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCBcIlxcXFxbXCIpLnJlcGxhY2UoL1tcXF1dLywgXCJcXFxcXVwiKTtcclxuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFw/Jl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKTtcclxuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcclxuICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/IFwiXCIgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcclxufTtcclxuXHJcbnZhciBzZXRTa2V0Y2hJZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHNrZXRjaF9pZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnc2tldGNoX2lkJyk7XHJcbiAgaWYgKHNrZXRjaF9pZCA9PSBudWxsIHx8IHNrZXRjaF9pZCA+IHNrZXRjaGVzLmxlbmd0aCB8fCBza2V0Y2hfaWQgPCAxKSB7XHJcbiAgICBza2V0Y2hfaWQgPSBza2V0Y2hlcy5sZW5ndGg7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIGJ1aWxkTWVudSA9IGZ1bmN0aW9uKCkge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2tldGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBza2V0Y2ggPSBza2V0Y2hlc1tpXTtcclxuICAgIHZhciBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgZG9tLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGkpO1xyXG4gICAgZG9tLmlubmVySFRNTCA9ICc8c3Bhbj4nICsgc2tldGNoLm5hbWUgKyAnPC9zcGFuPic7XHJcbiAgICBkb20uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgc3dpdGNoU2tldGNoKHNrZXRjaGVzW3RoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JyldKTtcclxuICAgIH0pO1xyXG4gICAgc2VsZWN0X3NrZXRjaC5hcHBlbmRDaGlsZChkb20pO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBzdGFydFJ1blNrZXRjaCA9IGZ1bmN0aW9uKHNrZXRjaCkge1xyXG4gIHJ1bm5pbmcgPSBuZXcgc2tldGNoLm9iajtcclxuICBydW5uaW5nLmluaXQoc2NlbmUsIGNhbWVyYSk7XHJcbiAgc2tldGNoX3RpdGxlLmlubmVySFRNTCA9IHNrZXRjaC5uYW1lO1xyXG4gIHNrZXRjaF9kYXRlLmlubmVySFRNTCA9IChza2V0Y2gudXBkYXRlLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyAncG9zdGVkOiAnICsgc2tldGNoLnBvc3RlZCArICcgLyB1cGRhdGU6ICcgKyBza2V0Y2gudXBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiAncG9zdGVkOiAnICsgc2tldGNoLnBvc3RlZDtcclxuICBza2V0Y2hfZGVzY3JpcHRpb24uaW5uZXJIVE1MID0gc2tldGNoLmRlc2NyaXB0aW9uO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaFNrZXRjaCA9IGZ1bmN0aW9uKHNrZXRjaCkge1xyXG4gIHJ1bm5pbmcucmVtb3ZlKHNjZW5lLCBjYW1lcmEpO1xyXG4gIHN0YXJ0UnVuU2tldGNoKHNrZXRjaCk7XHJcbiAgc3dpdGNoTWVudSgpO1xyXG59O1xyXG5cclxudmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIHJlbmRlcmVyLmNsZWFyKCk7XHJcbiAgcnVubmluZy5yZW5kZXIoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX21vdmUpO1xyXG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhLm9iaik7XHJcbn07XHJcblxyXG52YXIgcmVuZGVybG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdygpO1xyXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJsb29wKTtcclxuICByZW5kZXIoKTtcclxufTtcclxuXHJcbnZhciByZXNpemVSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xyXG4gIGJvZHlfd2lkdGggID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcclxuICBib2R5X2hlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xyXG4gIHJlbmRlcmVyLnNldFNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG4gIGNhbWVyYS5yZXNpemUoYm9keV93aWR0aCwgYm9keV9oZWlnaHQpO1xyXG59O1xyXG5cclxudmFyIHNldEV2ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3NlbGVjdHN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hTdGFydChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaE1vdmUoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0b3VjaFN0YXJ0KGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WCwgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZLCB0cnVlKTtcclxuICB9KTtcclxuXHJcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoTW92ZShldmVudC50b3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRvdWNoRW5kKGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFksIHRydWUpO1xyXG4gIH0pO1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdG91Y2hFbmQoMCwgMCwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBidG5fdG9nZ2xlX21lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIHN3aXRjaE1lbnUoKTtcclxuICB9KTtcclxufTtcclxuXHJcbnZhciB0cmFuc2Zvcm1WZWN0b3IyZCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gIHZlY3Rvci54ID0gKHZlY3Rvci54IC8gYm9keV93aWR0aCkgKiAyIC0gMTtcclxuICB2ZWN0b3IueSA9IC0gKHZlY3Rvci55IC8gYm9keV9oZWlnaHQpICogMiArIDE7XHJcbn07XHJcblxyXG52YXIgdG91Y2hTdGFydCA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX2Rvd24uc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9kb3duKTtcclxuICBpZiAocnVubmluZy50b3VjaFN0YXJ0KSBydW5uaW5nLnRvdWNoU3RhcnQoc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24pO1xyXG59O1xyXG5cclxudmFyIHRvdWNoTW92ZSA9IGZ1bmN0aW9uKHgsIHksIHRvdWNoX2V2ZW50KSB7XHJcbiAgdmVjdG9yX21vdXNlX21vdmUuc2V0KHgsIHkpO1xyXG4gIHRyYW5zZm9ybVZlY3RvcjJkKHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICBpZiAocnVubmluZy50b3VjaE1vdmUpIHJ1bm5pbmcudG91Y2hNb3ZlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSk7XHJcbn07XHJcblxyXG52YXIgdG91Y2hFbmQgPSBmdW5jdGlvbih4LCB5LCB0b3VjaF9ldmVudCkge1xyXG4gIHZlY3Rvcl9tb3VzZV9lbmQuc2V0KHgsIHkpO1xyXG4gIGlmIChydW5uaW5nLnRvdWNoRW5kKSBydW5uaW5nLnRvdWNoRW5kKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpO1xyXG59O1xyXG5cclxudmFyIHN3aXRjaE1lbnUgPSBmdW5jdGlvbigpIHtcclxuICBidG5fdG9nZ2xlX21lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgbWVudS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZWQnKTtcclxufTtcclxuXHJcbmluaXQoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIENhbWVyYSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQxX2Jhc2UgPSBVdGlsLmdldFJhZGlhbigxMCk7XHJcbiAgICB0aGlzLnJhZDEgPSB0aGlzLnJhZDFfYmFzZTtcclxuICAgIHRoaXMucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5sb29rID0gbmV3IEZvcmNlMygpO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMV9iYXNlID0gMDtcclxuICAgIHRoaXMucm90YXRlX3JhZDEgPSAwO1xyXG4gICAgdGhpcy5yb3RhdGVfcmFkMl9iYXNlID0gMDtcclxuICAgIHRoaXMucm90YXRlX3JhZDIgPSAwO1xyXG4gICAgdGhpcy5yYW5nZSA9IDEwMDA7XHJcbiAgICB0aGlzLm9iajtcclxuICAgIEZvcmNlMy5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IENhbWVyYTtcclxuICBDYW1lcmEucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgzNSwgd2lkdGggLyBoZWlnaHQsIDEsIDEwMDAwKTtcclxuICAgIHRoaXMub2JqLnVwLnNldCgwLCAxLCAwKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIHRoaXMudmVsb2NpdHkuY29weSh0aGlzLmFuY2hvcik7XHJcbiAgICB0aGlzLmxvb2tBdENlbnRlcigpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgdGhpcy5sb29rQXRDZW50ZXIoKTtcclxuICB9O1xyXG4gIENhbWVyYS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xyXG4gICAgdGhpcy5vYmouYXNwZWN0ID0gd2lkdGggLyBoZWlnaHQ7XHJcbiAgICB0aGlzLm9iai51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbiAgfTtcclxuICBDYW1lcmEucHJvdG90eXBlLnNldFBvc2l0aW9uU3BoZXJpY2FsID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmVjdG9yID0gVXRpbC5nZXRTcGhlcmljYWwodGhpcy5yYWQxLCB0aGlzLnJhZDIsIHRoaXMucmFuZ2UpO1xyXG4gICAgdGhpcy5hbmNob3IuY29weSh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgQ2FtZXJhLnByb3RvdHlwZS5sb29rQXRDZW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMub2JqLmxvb2tBdCh7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHo6IDBcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgcmV0dXJuIENhbWVyYTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZXZlbnRUeXBlLCBjYWxsYmFjayl7XHJcbiAgdmFyIHRpbWVyO1xyXG5cclxuICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgIGNhbGxiYWNrKGV2ZW50KTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfSwgZmFsc2UpO1xyXG59O1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBGb3JjZTIgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcbiAgXHJcbiAgRm9yY2UyLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbi5jb3B5KHRoaXMudmVsb2NpdHkpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS51cGRhdGVWZWxvY2l0eSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb24uZGl2aWRlU2NhbGFyKHRoaXMubWFzcyk7XHJcbiAgICB0aGlzLnZlbG9jaXR5LmFkZCh0aGlzLmFjY2VsZXJhdGlvbik7XHJcbiAgfTtcclxuICBGb3JjZTIucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUZyaWN0aW9uID0gZnVuY3Rpb24obXUsIG5vcm1hbCkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGlmICghbm9ybWFsKSBub3JtYWwgPSAxO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIoLTEpO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcihtdSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseURyYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy5hY2NlbGVyYXRpb24uY2xvbmUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKC0xKTtcclxuICAgIGZvcmNlLm5vcm1hbGl6ZSgpO1xyXG4gICAgZm9yY2UubXVsdGlwbHlTY2FsYXIodGhpcy5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgKiB2YWx1ZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcbiAgRm9yY2UyLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTI7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgRm9yY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG4gICAgdGhpcy52ZWxvY2l0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICB0aGlzLm1hc3MgPSAxO1xyXG4gIH07XHJcbiAgXHJcbiAgRm9yY2UucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkodGhpcy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUudXBkYXRlVmVsb2NpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmRpdmlkZVNjYWxhcih0aGlzLm1hc3MpO1xyXG4gICAgdGhpcy52ZWxvY2l0eS5hZGQodGhpcy5hY2NlbGVyYXRpb24pO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uLmFkZCh2ZWN0b3IpO1xyXG4gIH07XHJcbiAgRm9yY2UucHJvdG90eXBlLmFwcGx5RnJpY3Rpb24gPSBmdW5jdGlvbihtdSwgbm9ybWFsKSB7XHJcbiAgICB2YXIgZm9yY2UgPSB0aGlzLmFjY2VsZXJhdGlvbi5jbG9uZSgpO1xyXG4gICAgaWYgKCFub3JtYWwpIG5vcm1hbCA9IDE7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKG11KTtcclxuICAgIHRoaXMuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgfTtcclxuICBGb3JjZS5wcm90b3R5cGUuYXBwbHlEcmFnID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHZhciBmb3JjZSA9IHRoaXMuYWNjZWxlcmF0aW9uLmNsb25lKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSk7XHJcbiAgICBmb3JjZS5ub3JtYWxpemUoKTtcclxuICAgIGZvcmNlLm11bHRpcGx5U2NhbGFyKHRoaXMuYWNjZWxlcmF0aW9uLmxlbmd0aCgpICogdmFsdWUpO1xyXG4gICAgdGhpcy5hcHBseUZvcmNlKGZvcmNlKTtcclxuICB9O1xyXG4gIEZvcmNlLnByb3RvdHlwZS5hcHBseUhvb2sgPSBmdW5jdGlvbihyZXN0X2xlbmd0aCwgaykge1xyXG4gICAgdmFyIGZvcmNlID0gdGhpcy52ZWxvY2l0eS5jbG9uZSgpLnN1Yih0aGlzLmFuY2hvcik7XHJcbiAgICB2YXIgZGlzdGFuY2UgPSBmb3JjZS5sZW5ndGgoKSAtIHJlc3RfbGVuZ3RoO1xyXG4gICAgZm9yY2Uubm9ybWFsaXplKCk7XHJcbiAgICBmb3JjZS5tdWx0aXBseVNjYWxhcigtMSAqIGsgKiBkaXN0YW5jZSk7XHJcbiAgICB0aGlzLmFwcGx5Rm9yY2UoZm9yY2UpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBGb3JjZTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgSGVtaUxpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnJhZDEgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgIHRoaXMucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgdGhpcy5yYW5nZSA9IDEwMDA7XHJcbiAgICB0aGlzLmhleDEgPSAweGZmZmZmZjtcclxuICAgIHRoaXMuaGV4MiA9IDB4MzMzMzMzO1xyXG4gICAgdGhpcy5pbnRlbnNpdHkgPSAxO1xyXG4gICAgdGhpcy5vYmo7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIEhlbWlMaWdodC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEZvcmNlMy5wcm90b3R5cGUpO1xyXG4gIEhlbWlMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIZW1pTGlnaHQ7XHJcbiAgSGVtaUxpZ2h0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oaGV4MSwgaGV4MiwgaW50ZW5zaXR5KSB7XHJcbiAgICBpZiAoaGV4MSkgdGhpcy5oZXgxID0gaGV4MTtcclxuICAgIGlmIChoZXgyKSB0aGlzLmhleDIgPSBoZXgyO1xyXG4gICAgaWYgKGludGVuc2l0eSkgdGhpcy5pbnRlbnNpdHkgPSBpbnRlbnNpdHk7XHJcbiAgICB0aGlzLm9iaiA9IG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQodGhpcy5oZXgxLCB0aGlzLmhleDIsIHRoaXMuaW50ZW5zaXR5KTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICB9O1xyXG4gIEhlbWlMaWdodC5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwb2ludHMgPSBVdGlsLmdldFNwaGVyaWNhbCh0aGlzLnJhZDEsIHRoaXMucmFkMiwgdGhpcy5yYW5nZSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkocG9pbnRzKTtcclxuICB9O1xyXG4gIHJldHVybiBIZW1pTGlnaHQ7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UzJyk7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIE1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNpemUgPSAwO1xyXG4gICAgdGhpcy50aW1lID0gMDtcclxuICAgIHRoaXMuaXNfYWN0aXZlID0gZmFsc2U7XHJcbiAgICBGb3JjZTMuY2FsbCh0aGlzKTtcclxuICB9O1xyXG4gIE1vdmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgTW92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW92ZXI7XHJcbiAgTW92ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbih2ZWN0b3IpIHtcclxuICAgIHRoaXMucG9zaXRpb24gPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gIH07XHJcbiAgTW92ZXIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmlzX2FjdGl2ZSA9IHRydWU7XHJcbiAgfTtcclxuICBNb3Zlci5wcm90b3R5cGUuaW5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5pc19hY3RpdmUgPSBmYWxzZTtcclxuICB9O1xyXG4gIHJldHVybiBNb3ZlcjtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTMnKTtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgUG9pbnRMaWdodCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5yYWQxID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICB0aGlzLnJhZDIgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgIHRoaXMucmFuZ2UgPSAyMDA7XHJcbiAgICB0aGlzLmhleCA9IDB4ZmZmZmZmO1xyXG4gICAgdGhpcy5pbnRlbnNpdHkgPSAxO1xyXG4gICAgdGhpcy5kaXN0YW5jZSA9IDIwMDA7XHJcbiAgICB0aGlzLmRlY2F5ID0gMTtcclxuICAgIHRoaXMub2JqO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBQb2ludExpZ2h0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRm9yY2UzLnByb3RvdHlwZSk7XHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb2ludExpZ2h0O1xyXG4gIFBvaW50TGlnaHQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihoZXgsIGRpc3RhbmNlKSB7XHJcbiAgICBpZiAoaGV4KSB0aGlzLmhleCA9IGhleDtcclxuICAgIGlmIChkaXN0YW5jZSkgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuUG9pbnRMaWdodCh0aGlzLmhleCwgdGhpcy5pbnRlbnNpdHksIHRoaXMuZGlzdGFuY2UsIHRoaXMuZGVjYXkpO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMub2JqLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gIH07XHJcbiAgUG9pbnRMaWdodC5wcm90b3R5cGUuc2V0UG9zaXRpb25TcGhlcmljYWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBwb2ludHMgPSBVdGlsLmdldFNwaGVyaWNhbCh0aGlzLnJhZDEsIHRoaXMucmFkMiwgdGhpcy5yYW5nZSk7XHJcbiAgICB0aGlzLnBvc2l0aW9uLmNvcHkocG9pbnRzKTtcclxuICB9O1xyXG4gIHJldHVybiBQb2ludExpZ2h0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBQb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHRoaXMubWF0ZXJpYWwgPSBudWxsO1xyXG4gICAgdGhpcy5vYmogPSBudWxsO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICBQb2ludHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBQb2ludHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9pbnRzO1xyXG4gIFBvaW50cy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHBhcmFtKSB7XHJcbiAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKHtcclxuICAgICAgdW5pZm9ybXM6IHtcclxuICAgICAgICBjb2xvcjogeyB0eXBlOiAnYycsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoMHhmZmZmZmYpIH0sXHJcbiAgICAgICAgdGV4dHVyZTogeyB0eXBlOiAndCcsIHZhbHVlOiBwYXJhbS50ZXh0dXJlIH1cclxuICAgICAgfSxcclxuICAgICAgdmVydGV4U2hhZGVyOiBwYXJhbS52cyxcclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IHBhcmFtLmZzLFxyXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcclxuICAgICAgZGVwdGhXcml0ZTogZmFsc2UsXHJcbiAgICAgIGJsZW5kaW5nOiBwYXJhbS5ibGVuZGluZ1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBhcmFtLnBvc2l0aW9ucywgMykpO1xyXG4gICAgdGhpcy5nZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2N1c3RvbUNvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5jb2xvcnMsIDMpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCd2ZXJ0ZXhPcGFjaXR5JywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5vcGFjaXRpZXMsIDEpKTtcclxuICAgIHRoaXMuZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdzaXplJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwYXJhbS5zaXplcywgMSkpO1xyXG4gICAgdGhpcy5vYmogPSBuZXcgVEhSRUUuUG9pbnRzKHRoaXMuZ2VvbWV0cnksIHRoaXMubWF0ZXJpYWwpO1xyXG4gICAgcGFyYW0uc2NlbmUuYWRkKHRoaXMub2JqKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICB9O1xyXG4gIFBvaW50cy5wcm90b3R5cGUudXBkYXRlUG9pbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnBvc2l0aW9uLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHRoaXMub2JqLmdlb21ldHJ5LmF0dHJpYnV0ZXMudmVydGV4T3BhY2l0eS5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgICB0aGlzLm9iai5nZW9tZXRyeS5hdHRyaWJ1dGVzLnNpemUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgdGhpcy5vYmouZ2VvbWV0cnkuYXR0cmlidXRlcy5jdXN0b21Db2xvci5uZWVkc1VwZGF0ZSA9IHRydWU7XHJcbiAgfTtcclxuICByZXR1cm4gUG9pbnRzO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBleHBvcnRzID0ge1xyXG4gIGdldFJhbmRvbUludDogZnVuY3Rpb24obWluLCBtYXgpe1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcclxuICB9LFxyXG4gIGdldERlZ3JlZTogZnVuY3Rpb24ocmFkaWFuKSB7XHJcbiAgICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcclxuICB9LFxyXG4gIGdldFJhZGlhbjogZnVuY3Rpb24oZGVncmVlcykge1xyXG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gIH0sXHJcbiAgZ2V0U3BoZXJpY2FsOiBmdW5jdGlvbihyYWQxLCByYWQyLCByKSB7XHJcbiAgICB2YXIgeCA9IE1hdGguY29zKHJhZDEpICogTWF0aC5jb3MocmFkMikgKiByO1xyXG4gICAgdmFyIHogPSBNYXRoLmNvcyhyYWQxKSAqIE1hdGguc2luKHJhZDIpICogcjtcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ocmFkMSkgKiByO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgsIHksIHopO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cztcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBbXHJcbiAge1xyXG4gICAgbmFtZTogJ2Rpc3RvcnQnLFxyXG4gICAgb2JqOiByZXF1aXJlKCcuL3NrZXRjaGVzL2Rpc3RvcnQnKSxcclxuICAgIHBvc3RlZDogJzIwMTYuMi4yMycsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICd1c2luZyB0aGUgc2ltcGxleCBub2lzZSwgZGlzdG9ydCB0aGUgc3BoZXJlLicsXHJcbiAgfSxcclxuICB7XHJcbiAgICBuYW1lOiAnaW1hZ2UgZGF0YScsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvaW1hZ2VfZGF0YScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMi45JyxcclxuICAgIHVwZGF0ZTogJzIwMTUuMTIuMTInLFxyXG4gICAgZGVzY3JpcHRpb246ICdQb2ludHMgYmFzZWQgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmdldEltYWdlRGF0YSgpJyxcclxuICB9LFxyXG4gIHtcclxuICAgIG5hbWU6ICdnYWxsZXJ5JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9nYWxsZXJ5JyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjEyLjInLFxyXG4gICAgdXBkYXRlOiAnMjAxNS4xMi45JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnaW1hZ2UgZ2FsbGVyeSBvbiAzZC4gdGVzdGVkIHRoYXQgcGlja2VkIG9iamVjdCBhbmQgbW92aW5nIGNhbWVyYS4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2NvbWV0JyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9jb21ldCcpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4yNCcsXHJcbiAgICB1cGRhdGU6ICcyMDE2LjEuOCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ2NhbWVyYSB0byB0cmFjayB0aGUgbW92aW5nIHBvaW50cy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2h5cGVyIHNwYWNlJyxcclxuICAgIG9iajogcmVxdWlyZSgnLi9za2V0Y2hlcy9oeXBlcl9zcGFjZScpLFxyXG4gICAgcG9zdGVkOiAnMjAxNS4xMS4xMicsXHJcbiAgICB1cGRhdGU6ICcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdhZGQgbGl0dGxlIGNoYW5nZSBhYm91dCBjYW1lcmEgYW5nbGUgYW5kIHBhcnRpY2xlIGNvbnRyb2xlcy4nLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgbmFtZTogJ2ZpcmUgYmFsbCcsXHJcbiAgICBvYmo6IHJlcXVpcmUoJy4vc2tldGNoZXMvZmlyZV9iYWxsJyksXHJcbiAgICBwb3N0ZWQ6ICcyMDE1LjExLjEyJyxcclxuICAgIHVwZGF0ZTogJycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ3Rlc3Qgb2Ygc2ltcGxlIHBoeXNpY3MgYW5kIGFkZGl0aXZlIGJsZW5kaW5nLicsXHJcbiAgfVxyXG5dO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgRm9yY2UyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9mb3JjZTInKTtcclxudmFyIE1vdmVyID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9tb3ZlcicpO1xyXG52YXIgUG9pbnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludHMuanMnKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcbnZhciBQb2ludExpZ2h0ID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9wb2ludExpZ2h0Jyk7XHJcblxyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKCkge307XHJcbiAgdmFyIG1vdmVyc19udW0gPSAxMDAwMDtcclxuICB2YXIgbW92ZXJzID0gW107XHJcbiAgdmFyIG1vdmVyX2FjdGl2YXRlX2NvdW50ID0gMjtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBoZW1pX2xpZ2h0ID0gbmV3IEhlbWlMaWdodCgpO1xyXG4gIHZhciBjb21ldF9saWdodDEgPSBuZXcgUG9pbnRMaWdodCgpO1xyXG4gIHZhciBjb21ldF9saWdodDIgPSBuZXcgUG9pbnRMaWdodCgpO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgY29tZXQgPSBudWxsO1xyXG4gIHZhciBjb21ldF9yYWRpdXMgPSAzMDtcclxuICB2YXIgY29tZXRfc2NhbGUgPSBuZXcgRm9yY2UyKCk7XHJcbiAgdmFyIGNvbWV0X2NvbG9yX2ggPSAxNDA7XHJcbiAgdmFyIGNvbG9yX2RpZmYgPSA0NTtcclxuICB2YXIgcGxhbmV0ID0gbnVsbDtcclxuICB2YXIgbGFzdF90aW1lX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX3BsdXNfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBsYXN0X3RpbWVfYm91bmNlID0gRGF0ZS5ub3coKTtcclxuICB2YXIgbGFzdF90aW1lX3RvdWNoID0gRGF0ZS5ub3coKTtcclxuICB2YXIgcGx1c19hY2NlbGVyYXRpb24gPSAwO1xyXG4gIHZhciBpc190b3VjaGVkID0gZmFsc2U7XHJcbiAgdmFyIGlzX3BsdXNfYWN0aXZhdGUgPSBmYWxzZTtcclxuICB2YXIgdHJhY2tfcG9pbnRzID0gdHJ1ZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMSk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIGlmIChtb3Zlci50aW1lID4gMTApIHtcclxuICAgICAgICAgIG1vdmVyLnNpemUgLT0gMjtcclxuICAgICAgICAgIC8vbW92ZXIuYSAtPSAwLjA0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZXIuc2l6ZSA8PSAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueSAtIHBvaW50cy5wb3NpdGlvbi55O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLnogLSBwb2ludHMucG9zaXRpb24uejtcclxuICAgICAgY29sb3JzW2kgKiAzICsgMF0gPSBtb3Zlci5jb2xvci5yO1xyXG4gICAgICBjb2xvcnNbaSAqIDMgKyAxXSA9IG1vdmVyLmNvbG9yLmc7XHJcbiAgICAgIGNvbG9yc1tpICogMyArIDJdID0gbW92ZXIuY29sb3IuYjtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgICB2YXIgcmFkMiA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDM2MCkpO1xyXG4gICAgICAgIHZhciByYW5nZSA9IFV0aWwuZ2V0UmFuZG9tSW50KDEsIDMwKTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZhciBmb3JjZSA9IFV0aWwuZ2V0U3BoZXJpY2FsKHJhZDEsIHJhZDIsIHJhbmdlIC8gMjApO1xyXG4gICAgICAgIHZhciBoID0gVXRpbC5nZXRSYW5kb21JbnQoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYsIGNvbWV0X2NvbG9yX2ggKyBjb2xvcl9kaWZmKSAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41O1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoNjAsIDgwKTtcclxuICAgICAgICB2ZWN0b3IuYWRkKHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgICAgbW92ZXIuYWN0aXZhdGUoKTtcclxuICAgICAgICBtb3Zlci5pbml0KHZlY3Rvcik7XHJcbiAgICAgICAgbW92ZXIuY29sb3Iuc2V0SFNMKGggLyAzNjAsIHMgLyAxMDAsIDAuNyk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShmb3JjZSk7XHJcbiAgICAgICAgbW92ZXIuYSA9IDE7XHJcbiAgICAgICAgbW92ZXIuc2l6ZSA9IDI1O1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IG1vdmVyX2FjdGl2YXRlX2NvdW50KSBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciByb3RhdGVDb21ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29tZXQucm90YXRpb24ueCArPSAwLjAzICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgY29tZXQucm90YXRpb24ueSArPSAwLjAxICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgY29tZXQucm90YXRpb24ueiArPSAwLjAxICsgcGx1c19hY2NlbGVyYXRpb24gLyAxMDAwO1xyXG4gICAgcG9pbnRzLnJhZDFfYmFzZSArPSBVdGlsLmdldFJhZGlhbiguNik7XHJcbiAgICBwb2ludHMucmFkMSA9IFV0aWwuZ2V0UmFkaWFuKE1hdGguc2luKHBvaW50cy5yYWQxX2Jhc2UpICogNDUgKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMCk7XHJcbiAgICBwb2ludHMucmFkMiArPSBVdGlsLmdldFJhZGlhbigwLjggKyBwbHVzX2FjY2VsZXJhdGlvbiAvIDEwMCk7XHJcbiAgICBwb2ludHMucmFkMyArPSAwLjAxO1xyXG4gICAgcmV0dXJuIFV0aWwuZ2V0U3BoZXJpY2FsKHBvaW50cy5yYWQxLCBwb2ludHMucmFkMiwgMzUwKTtcclxuICB9O1xyXG5cclxuICB2YXIgcm90YXRlQ29tZXRDb2xvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJhZGl1cyA9IGNvbWV0X3JhZGl1cyAqIDAuODtcclxuICAgIGNvbWV0X2xpZ2h0MS5vYmoucG9zaXRpb24uY29weShVdGlsLmdldFNwaGVyaWNhbChVdGlsLmdldFJhZGlhbigwKSwgIFV0aWwuZ2V0UmFkaWFuKDApLCByYWRpdXMpLmFkZChwb2ludHMucG9zaXRpb24pKTtcclxuICAgIGNvbWV0X2xpZ2h0Mi5vYmoucG9zaXRpb24uY29weShVdGlsLmdldFNwaGVyaWNhbChVdGlsLmdldFJhZGlhbigxODApLCBVdGlsLmdldFJhZGlhbigwKSwgcmFkaXVzKS5hZGQocG9pbnRzLnBvc2l0aW9uKSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGJvdW5jZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RfdGltZV9ib3VuY2UgPiAxMDAwIC0gcGx1c19hY2NlbGVyYXRpb24gKiAzKSB7XHJcbiAgICAgIGNvbWV0X3NjYWxlLmFwcGx5Rm9yY2UobmV3IFRIUkVFLlZlY3RvcjIoMC4wOCArIHBsdXNfYWNjZWxlcmF0aW9uIC8gNTAwMCwgMCkpO1xyXG4gICAgICBsYXN0X3RpbWVfYm91bmNlID0gRGF0ZS5ub3coKTtcclxuICAgICAgaXNfcGx1c19hY3RpdmF0ZSA9IHRydWU7XHJcbiAgICAgIGxhc3RfdGltZV9wbHVzX2FjdGl2YXRlID0gRGF0ZS5ub3coKTtcclxuICAgIH1cclxuICAgIGlmIChpc19wbHVzX2FjdGl2YXRlICYmIERhdGUubm93KCkgLSBsYXN0X3RpbWVfcGx1c19hY3RpdmF0ZSA8IDUwMCkge1xyXG4gICAgICBtb3Zlcl9hY3RpdmF0ZV9jb3VudCA9IDYgKyBNYXRoLmZsb29yKHBsdXNfYWNjZWxlcmF0aW9uIC8gNDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW92ZXJfYWN0aXZhdGVfY291bnQgPSAxICsgTWF0aC5mbG9vcihwbHVzX2FjY2VsZXJhdGlvbiAvIDQwKTtcclxuICAgIH1cclxuICAgIGNvbWV0X3NjYWxlLmFwcGx5SG9vaygwLCAwLjEpO1xyXG4gICAgY29tZXRfc2NhbGUuYXBwbHlEcmFnKDAuMTIpO1xyXG4gICAgY29tZXRfc2NhbGUudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgIGNvbWV0X3NjYWxlLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICBjb21ldC5zY2FsZS5zZXQoMSArIGNvbWV0X3NjYWxlLnBvc2l0aW9uLngsIDEgKyBjb21ldF9zY2FsZS5wb3NpdGlvbi54LCAxICsgY29tZXRfc2NhbGUucG9zaXRpb24ueCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC45LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZUNvbW1ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGJhc2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KGNvbWV0X3JhZGl1cywgMik7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XHJcbiAgICAgIGNvbG9yOiBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgY29tZXRfY29sb3JfaCArICcsIDEwMCUsIDEwMCUpJyksXHJcbiAgICAgIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nXHJcbiAgICB9KTtcclxuICAgIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoICogMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJhc2VfZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzXSA9IGJhc2VfZ2VvbWV0cnkudmVydGljZXNbaV0ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBiYXNlX2dlb21ldHJ5LnZlcnRpY2VzW2ldLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gYmFzZV9nZW9tZXRyeS52ZXJ0aWNlc1tpXS56O1xyXG4gICAgfVxyXG4gICAgdmFyIGluZGljZXMgPSBuZXcgVWludDMyQXJyYXkoYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGggKiAzKTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYmFzZV9nZW9tZXRyeS5mYWNlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICBpbmRpY2VzW2ogKiAzXSA9IGJhc2VfZ2VvbWV0cnkuZmFjZXNbal0uYTtcclxuICAgICAgaW5kaWNlc1tqICogMyArIDFdID0gYmFzZV9nZW9tZXRyeS5mYWNlc1tqXS5iO1xyXG4gICAgICBpbmRpY2VzW2ogKiAzICsgMl0gPSBiYXNlX2dlb21ldHJ5LmZhY2VzW2pdLmM7XHJcbiAgICB9XHJcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcclxuICAgIGdlb21ldHJ5LmF0dHJpYnV0ZXMucG9zaXRpb24uZHluYW1pYyA9IHRydWU7XHJcbiAgICBnZW9tZXRyeS5zZXRJbmRleChuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKGluZGljZXMsIDEpKTtcclxuICAgIGdlb21ldHJ5LmluZGV4LmR5bmFtaWMgPSB0cnVlO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVBsYW5ldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyNTAsIDQpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4MjIyMjIyLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZ1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgYWNjZWxlcmF0ZUNvbWV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoaXNfdG91Y2hlZCAmJiBwbHVzX2FjY2VsZXJhdGlvbiA8IDIwMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiArPSAxO1xyXG4gICAgfSBlbHNlIGlmKHBsdXNfYWNjZWxlcmF0aW9uID4gMCkge1xyXG4gICAgICBwbHVzX2FjY2VsZXJhdGlvbiAtPSAxO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNvbWV0ID0gY3JlYXRlQ29tbWV0KCk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldCk7XHJcbiAgICAgIHBsYW5ldCA9IGNyZWF0ZVBsYW5ldCgpO1xyXG4gICAgICBzY2VuZS5hZGQocGxhbmV0KTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmLCBjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZik7XHJcbiAgICAgICAgdmFyIHMgPSBVdGlsLmdldFJhbmRvbUludCg2MCwgODApO1xyXG4gICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoVXRpbC5nZXRSYW5kb21JbnQoLTEwMCwgMTAwKSwgMCwgMCkpO1xyXG4gICAgICAgIG1vdmVyLmNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA3MCUpJyk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56O1xyXG4gICAgICAgIGNvbG9yc1tpICogMyArIDBdID0gbW92ZXIuY29sb3IucjtcclxuICAgICAgICBjb2xvcnNbaSAqIDMgKyAxXSA9IG1vdmVyLmNvbG9yLmc7XHJcbiAgICAgICAgY29sb3JzW2kgKiAzICsgMl0gPSBtb3Zlci5jb2xvci5iO1xyXG4gICAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgICAgdnM6IHZzLFxyXG4gICAgICAgIGZzOiBmcyxcclxuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5Ob3JtYWxCbGVuZGluZ1xyXG4gICAgICB9KTtcclxuICAgICAgcG9pbnRzLnJhZDEgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMV9iYXNlID0gMDtcclxuICAgICAgcG9pbnRzLnJhZDIgPSAwO1xyXG4gICAgICBwb2ludHMucmFkMyA9IDA7XHJcbiAgICAgIGhlbWlfbGlnaHQuaW5pdChcclxuICAgICAgICBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmKSArICcsIDUwJSwgNjAlKScpLmdldEhleCgpLFxyXG4gICAgICAgIG5ldyBUSFJFRS5Db2xvcignaHNsKCcgKyAoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYpICsgJywgNTAlLCA2MCUpJykuZ2V0SGV4KClcclxuICAgICAgKTtcclxuICAgICAgc2NlbmUuYWRkKGhlbWlfbGlnaHQub2JqKTtcclxuICAgICAgY29tZXRfbGlnaHQxLmluaXQobmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oIC0gY29sb3JfZGlmZikgKyAnLCA2MCUsIDUwJSknKSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDEub2JqKTtcclxuICAgICAgY29tZXRfbGlnaHQyLmluaXQobmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZikgKyAnLCA2MCUsIDUwJSknKSk7XHJcbiAgICAgIHNjZW5lLmFkZChjb21ldF9saWdodDIub2JqKTtcclxuICAgICAgY2FtZXJhLmFuY2hvciA9IG5ldyBUSFJFRS5WZWN0b3IzKDE1MDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgY29tZXQuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBjb21ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldCk7XHJcbiAgICAgIHBsYW5ldC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHBsYW5ldC5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShwbGFuZXQpO1xyXG4gICAgICBwb2ludHMuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBwb2ludHMubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICBzY2VuZS5yZW1vdmUocG9pbnRzLm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShjb21ldF9saWdodDEub2JqKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGNvbWV0X2xpZ2h0Mi5vYmopO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgYWNjZWxlcmF0ZUNvbWV0KCk7XHJcbiAgICAgIHBvaW50cy52ZWxvY2l0eSA9IHJvdGF0ZUNvbWV0KCk7XHJcbiAgICAgIGlmICh0cmFja19wb2ludHMgPT09IHRydWUpIHtcclxuICAgICAgICBjYW1lcmEuYW5jaG9yLmNvcHkoXHJcbiAgICAgICAgICBwb2ludHMudmVsb2NpdHkuY2xvbmUoKS5hZGQoXHJcbiAgICAgICAgICAgIHBvaW50cy52ZWxvY2l0eS5jbG9uZSgpLnN1Yihwb2ludHMucG9zaXRpb24pXHJcbiAgICAgICAgICAgIC5ub3JtYWxpemUoKS5tdWx0aXBseVNjYWxhcigtNDAwKVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY2FtZXJhLmFuY2hvci55ICs9IHBvaW50cy5wb3NpdGlvbi55ICogMjtcclxuICAgICAgICBjYW1lcmEubG9vay5hbmNob3IuY29weShwb2ludHMucG9zaXRpb24pO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjb21ldC5wb3NpdGlvbi5jb3B5KHBvaW50cy5wb3NpdGlvbik7XHJcbiAgICAgIGhlbWlfbGlnaHQub2JqLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCAtIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgaGVtaV9saWdodC5vYmouZ3JvdW5kQ29sb3Iuc2V0SFNMKChjb21ldF9jb2xvcl9oICsgY29sb3JfZGlmZiAtIHBsdXNfYWNjZWxlcmF0aW9uIC8gMS41KSAvIDM2MCwgMC41LCAwLjYpO1xyXG4gICAgICBjb21ldF9saWdodDEub2JqLnBvc2l0aW9uLmNvcHkocG9pbnRzLnZlbG9jaXR5KTtcclxuICAgICAgY29tZXRfbGlnaHQxLm9iai5jb2xvci5zZXRIU0woKGNvbWV0X2NvbG9yX2ggLSBjb2xvcl9kaWZmIC0gcGx1c19hY2NlbGVyYXRpb24gLyAxLjUpIC8gMzYwLCAwLjUsIDAuNik7XHJcbiAgICAgIGNvbWV0X2xpZ2h0Mi5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gICAgICBjb21ldF9saWdodDIub2JqLmNvbG9yLnNldEhTTCgoY29tZXRfY29sb3JfaCArIGNvbG9yX2RpZmYgLSBwbHVzX2FjY2VsZXJhdGlvbiAvIDEuNSkgLyAzNjAsIDAuNSwgMC42KTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLm9iai5sb29rQXQoY2FtZXJhLmxvb2sucG9zaXRpb24pO1xyXG4gICAgICByb3RhdGVDb21ldENvbG9yKCk7XHJcbiAgICAgIGJvdW5jZUNvbWV0KCk7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hTdGFydDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSB0cnVlO1xyXG4gICAgICBsYXN0X3RpbWVfdG91Y2ggPSBEYXRlLm5vdygpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hFbmQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9lbmQpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RfdGltZV90b3VjaCA8IDEwMCkge1xyXG4gICAgICAgIGlmICh0cmFja19wb2ludHMgPT09IHRydWUpIHtcclxuICAgICAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDEyMDAsIDEyMDAsIDApO1xyXG4gICAgICAgICAgY2FtZXJhLmxvb2suYW5jaG9yLnNldCgwLCAwLCAwKTtcclxuICAgICAgICAgIHRyYWNrX3BvaW50cyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0cmFja19wb2ludHMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEZvcmNlMiA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZm9yY2UyJyk7XHJcbnZhciBIZW1pTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2hlbWlMaWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gZmxvYXQgdGltZTtcXHJcXG51bmlmb3JtIGZsb2F0IHJhZGl1cztcXHJcXG51bmlmb3JtIGZsb2F0IGRpc3RvcnQ7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG5cXHJcXG51bmlmb3JtIHZlYzMgaGVtaXNwaGVyZUxpZ2h0RGlyZWN0aW9uO1xcclxcbnVuaWZvcm0gdmVjMyBoZW1pc3BoZXJlTGlnaHRTa3lDb2xvcjtcXHJcXG51bmlmb3JtIHZlYzMgaGVtaXNwaGVyZUxpZ2h0R3JvdW5kQ29sb3I7XFxyXFxuXFxyXFxuLy9cXG4vLyBEZXNjcmlwdGlvbiA6IEFycmF5IGFuZCB0ZXh0dXJlbGVzcyBHTFNMIDJELzNELzREIHNpbXBsZXhcXG4vLyAgICAgICAgICAgICAgIG5vaXNlIGZ1bmN0aW9ucy5cXG4vLyAgICAgIEF1dGhvciA6IElhbiBNY0V3YW4sIEFzaGltYSBBcnRzLlxcbi8vICBNYWludGFpbmVyIDogaWptXFxuLy8gICAgIExhc3Rtb2QgOiAyMDExMDgyMiAoaWptKVxcbi8vICAgICBMaWNlbnNlIDogQ29weXJpZ2h0IChDKSAyMDExIEFzaGltYSBBcnRzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vICAgICAgICAgICAgICAgRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vICAgICAgICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FzaGltYS93ZWJnbC1ub2lzZVxcbi8vXFxuXFxudmVjMyBtb2QyODlfMl8wKHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfMl8wKHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzJfMSh2ZWM0IHgpIHtcXG4gICAgIHJldHVybiBtb2QyODlfMl8wKCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfMl8yKHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMl8zKHZlYzMgdilcXG4gIHtcXG4gIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG4gIGNvbnN0IHZlYzQgIERfMl80ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ18yXzUgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfMl81O1xcbiAgdmVjMyBpMSA9IG1pbiggZ18yXzUueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ18yXzUueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF8yXzQueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXFxuLy8gUGVybXV0YXRpb25zXFxuICBpID0gbW9kMjg5XzJfMChpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfMl8xKCBwZXJtdXRlXzJfMSggcGVybXV0ZV8yXzEoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzJfNC53eXogLSBEXzJfNC54eng7XFxuXFxuICB2ZWM0IGogPSBwIC0gNDkuMCAqIGZsb29yKHAgKiBucy56ICogbnMueik7ICAvLyAgbW9kKHAsNyo3KVxcblxcbiAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG4gIHZlYzQgeV8gPSBmbG9vcihqIC0gNy4wICogeF8gKTsgICAgLy8gbW9kKGosTilcXG5cXG4gIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgeSA9IHlfICpucy54ICsgbnMueXl5eTtcXG4gIHZlYzQgaCA9IDEuMCAtIGFicyh4KSAtIGFicyh5KTtcXG5cXG4gIHZlYzQgYjAgPSB2ZWM0KCB4Lnh5LCB5Lnh5ICk7XFxuICB2ZWM0IGIxID0gdmVjNCggeC56dywgeS56dyApO1xcblxcbiAgLy92ZWM0IHMwID0gdmVjNChsZXNzVGhhbihiMCwwLjApKSoyLjAgLSAxLjA7XFxuICAvL3ZlYzQgczEgPSB2ZWM0KGxlc3NUaGFuKGIxLDAuMCkpKjIuMCAtIDEuMDtcXG4gIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcbiAgdmVjNCBzMSA9IGZsb29yKGIxKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHNoID0gLXN0ZXAoaCwgdmVjNCgwLjApKTtcXG5cXG4gIHZlYzQgYTAgPSBiMC54enl3ICsgczAueHp5dypzaC54eHl5IDtcXG4gIHZlYzQgYTFfMl82ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzJfNyA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV8yXzYueHksaC56KTtcXG4gIHZlYzMgcDMgPSB2ZWMzKGExXzJfNi56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF8yXzIodmVjNChkb3QocDBfMl83LHAwXzJfNyksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF8yXzcgKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfMl83LHgwKSwgZG90KHAxLHgxKSxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdChwMix4MiksIGRvdChwMyx4MykgKSApO1xcbiAgfVxcblxcblxcblxcbnZlYzMgaHN2MnJnYl8xXzgodmVjMyBjKXtcXHJcXG4gIHZlYzQgSyA9IHZlYzQoMS4wLCAyLjAgLyAzLjAsIDEuMCAvIDMuMCwgMy4wKTtcXHJcXG4gIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcXHJcXG4gIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xcclxcbn1cXHJcXG5cXG5cXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBmbG9hdCB1cGRhdGVUaW1lID0gdGltZSAvIDEwMDAuMDtcXHJcXG4gIGZsb2F0IG5vaXNlID0gc25vaXNlXzJfMyh2ZWMzKHBvc2l0aW9uIC8gNDAwLjEgKyB1cGRhdGVUaW1lICogNS4wKSk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uICogKG5vaXNlICogcG93KGRpc3RvcnQsIDIuMCkgKyByYWRpdXMpLCAxLjApO1xcclxcbiAgdmVjMyBsaWdodCA9IHZlYzMoMC44KTtcXHJcXG4gIGxpZ2h0ICs9IGRvdCgtaGVtaXNwaGVyZUxpZ2h0RGlyZWN0aW9uLCBub3JtYWwpICogaGVtaXNwaGVyZUxpZ2h0U2t5Q29sb3IgKiAwLjI1O1xcclxcblxcclxcbiAgdkNvbG9yID0gaHN2MnJnYl8xXzgodmVjMyhub2lzZSAqIGRpc3RvcnQgKiAwLjMgKyB1cGRhdGVUaW1lLCAwLjIsIDEuMCkpICogbGlnaHQ7XFxyXFxuXFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNCh2Q29sb3IsIDEuMCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBzcGhlcmUgPSBudWxsO1xyXG4gIHZhciBiZyA9IG51bGw7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IEhlbWlMaWdodCgpO1xyXG4gIHZhciBmb3JjZSA9IG5ldyBGb3JjZTIoKTtcclxuICB2YXIgdGltZV91bml0ID0gMTtcclxuXHJcbiAgdmFyIGNyZWF0ZVNwaGVyZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XHJcbiAgICBnZW9tZXRyeS5mcm9tR2VvbWV0cnkobmV3IFRIUkVFLk9jdGFoZWRyb25HZW9tZXRyeSgyMDAsIDUpKTtcclxuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XHJcbiAgICAgIHVuaWZvcm1zOiBUSFJFRS5Vbmlmb3Jtc1V0aWxzLm1lcmdlKFtcclxuICAgICAgICBUSFJFRS5Vbmlmb3Jtc0xpYlsnbGlnaHRzJ10sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGltZToge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJhZGl1czoge1xyXG4gICAgICAgICAgICB0eXBlOiAnZicsXHJcbiAgICAgICAgICAgIHZhbHVlOiAxLjBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBkaXN0b3J0OiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdmJyxcclxuICAgICAgICAgICAgdmFsdWU6IDAuNFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgXSksXHJcbiAgICAgIHZlcnRleFNoYWRlcjogdnMsXHJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBmcyxcclxuICAgICAgbGlnaHRzOiB0cnVlLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuICB9O1xyXG5cclxuICB2YXIgY3JlYXRlQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDE4MDApO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xyXG4gIH07XHJcblxyXG4gIFNrZXRjaC5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2JnLXdoaXRlJztcclxuICAgICAgc3BoZXJlID0gY3JlYXRlU3BoZXJlKCk7XHJcbiAgICAgIHNjZW5lLmFkZChzcGhlcmUpO1xyXG4gICAgICBiZyA9IGNyZWF0ZUJhY2tncm91bmQoKTtcclxuICAgICAgc2NlbmUuYWRkKGJnKTtcclxuICAgICAgbGlnaHQuaW5pdCgweGZmZmZmZiwgMHg2NjY2NjYpO1xyXG4gICAgICBzY2VuZS5hZGQobGlnaHQub2JqKTtcclxuICAgICAgY2FtZXJhLmFuY2hvci5zZXQoMTgwMCwgMTgwMCwgMCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5zZXQoMCwgMCwgMCk7XHJcbiAgICAgIGZvcmNlLmFuY2hvci5zZXQoMSwgMCk7XHJcbiAgICAgIGZvcmNlLnZlbG9jaXR5LnNldCgxLCAwKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJyc7XHJcbiAgICAgIHNwaGVyZS5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShzcGhlcmUpO1xyXG4gICAgICBiZy5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGJnLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGJnKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKGxpZ2h0Lm9iaik7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvcmNlLmFwcGx5SG9vaygwLCAwLjA2KTtcclxuICAgICAgZm9yY2UuYXBwbHlEcmFnKDAuMTIpO1xyXG4gICAgICBmb3JjZS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBmb3JjZS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMudGltZS52YWx1ZSArPSB0aW1lX3VuaXQ7XHJcbiAgICAgIHNwaGVyZS5tYXRlcmlhbC51bmlmb3Jtcy5yYWRpdXMudmFsdWUgPSBmb3JjZS5wb3NpdGlvbi54O1xyXG4gICAgICBzcGhlcmUubWF0ZXJpYWwudW5pZm9ybXMuZGlzdG9ydC52YWx1ZSA9IGZvcmNlLnBvc2l0aW9uLnggLyAyIC0gMC4xO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDI1KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjIpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rLmFwcGx5SG9vaygwLCAwLjIpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLm9iai5sb29rQXQoY2FtZXJhLmxvb2sucG9zaXRpb24pO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBpZiAoZm9yY2UuYW5jaG9yLnggPCAzKSB7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggKz0gMC44O1xyXG4gICAgICAgIHRpbWVfdW5pdCArPSAwLjQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yY2UuYW5jaG9yLnggPSAxLjA7XHJcbiAgICAgICAgdGltZV91bml0ID0gMTtcclxuICAgICAgfVxyXG4gICAgICBpc190b3VjaGVkID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxudmFyIFBvaW50cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRzLmpzJyk7XHJcbnZhciBMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvcG9pbnRMaWdodCcpO1xyXG5cclxudmFyIHZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGN1c3RvbUNvbG9yO1xcclxcbmF0dHJpYnV0ZSBmbG9hdCB2ZXJ0ZXhPcGFjaXR5O1xcclxcbmF0dHJpYnV0ZSBmbG9hdCBzaXplO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICB2Q29sb3IgPSBjdXN0b21Db2xvcjtcXHJcXG4gIGZPcGFjaXR5ID0gdmVydGV4T3BhY2l0eTtcXHJcXG4gIHZlYzQgbXZQb3NpdGlvbiA9IG1vZGVsVmlld01hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCk7XFxyXFxuICBnbF9Qb2ludFNpemUgPSBzaXplICogKDMwMC4wIC8gbGVuZ3RoKG12UG9zaXRpb24ueHl6KSk7XFxyXFxuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtdlBvc2l0aW9uO1xcclxcbn1cXHJcXG5cIjtcclxudmFyIGZzID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gdmVjMyBjb2xvcjtcXHJcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcclxcblxcclxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxyXFxudmFyeWluZyBmbG9hdCBmT3BhY2l0eTtcXHJcXG5cXHJcXG52b2lkIG1haW4oKSB7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yICogdkNvbG9yLCBmT3BhY2l0eSk7XFxyXFxuICBnbF9GcmFnQ29sb3IgPSBnbF9GcmFnQ29sb3IgKiB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCk7XFxyXFxufVxcclxcblwiO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBtb3ZlcnNfbnVtID0gMTAwMDA7XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGxpZ2h0ID0gbmV3IExpZ2h0KCk7XHJcbiAgdmFyIGJnID0gbnVsbDtcclxuICB2YXIgcG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSAqIDMpO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0pO1xyXG4gIHZhciBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIGdyYXZpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLjEsIDApO1xyXG4gIHZhciBsYXN0X3RpbWVfYWN0aXZhdGUgPSBEYXRlLm5vdygpO1xyXG4gIHZhciBpc19kcmFnZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBpZiAobW92ZXIuaXNfYWN0aXZlKSB7XHJcbiAgICAgICAgbW92ZXIudGltZSsrO1xyXG4gICAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoZ3Jhdml0eSk7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDEpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgbW92ZXIudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgICBtb3Zlci5wb3NpdGlvbi5zdWIocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBpZiAobW92ZXIudGltZSA+IDUwKSB7XHJcbiAgICAgICAgICBtb3Zlci5zaXplIC09IDAuNztcclxuICAgICAgICAgIG1vdmVyLmEgLT0gMC4wMDk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3Zlci5hIDw9IDApIHtcclxuICAgICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xyXG4gICAgICAgICAgbW92ZXIudGltZSA9IDA7XHJcbiAgICAgICAgICBtb3Zlci5hID0gMC4wO1xyXG4gICAgICAgICAgbW92ZXIuaW5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLnggLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24ueiAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBvcGFjaXRpZXNbaV0gPSBtb3Zlci5hO1xyXG4gICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICB9XHJcbiAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGFjdGl2YXRlTW92ZXIgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gMTApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgwLCAyNTYpKSAvIE1hdGgubG9nKDI1NikgKiAyNjApO1xyXG4gICAgICAgIHZhciByYWQyID0gVXRpbC5nZXRSYWRpYW4oVXRpbC5nZXRSYW5kb21JbnQoMCwgMzYwKSk7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gKDEtIE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDMyLCAyNTYpKSAvIE1hdGgubG9nKDI1NikpICogMTI7XHJcbiAgICAgICAgdmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcbiAgICAgICAgdmFyIGZvcmNlID0gVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgcmFuZ2UpO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hcHBseUZvcmNlKGZvcmNlKTtcclxuICAgICAgICBtb3Zlci5hID0gMC4yO1xyXG4gICAgICAgIG1vdmVyLnNpemUgPSBNYXRoLnBvdygxMiAtIHJhbmdlLCAyKSAqIFV0aWwuZ2V0UmFuZG9tSW50KDEsIDI0KSAvIDEwO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IDYpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9ICBmdW5jdGlvbigpIHtcclxuICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgcG9pbnRzLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICBsaWdodC5vYmoucG9zaXRpb24uY29weShwb2ludHMudmVsb2NpdHkpO1xyXG4gIH07XHJcblxyXG4gIHZhciBtb3ZlUG9pbnRzID0gZnVuY3Rpb24odmVjdG9yKSB7XHJcbiAgICB2YXIgeSA9IHZlY3Rvci55ICogZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLyAzO1xyXG4gICAgdmFyIHogPSB2ZWN0b3IueCAqIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggLyAtMztcclxuICAgIHBvaW50cy5hbmNob3IueSA9IHk7XHJcbiAgICBwb2ludHMuYW5jaG9yLnogPSB6O1xyXG4gICAgbGlnaHQuYW5jaG9yLnkgPSB5O1xyXG4gICAgbGlnaHQuYW5jaG9yLnogPSB6O1xyXG4gIH1cclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICAgIFxyXG4gICAgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNhbnZhcyk7XHJcbiAgICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XHJcbiAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuICAgIHJldHVybiB0ZXh0dXJlO1xyXG4gIH07XHJcbiAgXHJcbiAgdmFyIGNyZWF0ZUJhY2tncm91bmQgPSAgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuT2N0YWhlZHJvbkdlb21ldHJ5KDE1MDAsIDMpO1xyXG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgY29sb3I6IDB4ZmZmZmZmLFxyXG4gICAgICBzaGFkaW5nOiBUSFJFRS5GbGF0U2hhZGluZyxcclxuICAgICAgc2lkZTogVEhSRUUuQmFja1NpZGVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KDAsIDQ1KTtcclxuICAgICAgICB2YXIgcyA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCA5MCk7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCdoc2woJyArIGggKyAnLCAnICsgcyArICclLCA1MCUpJyk7XHJcblxyXG4gICAgICAgIG1vdmVyLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoVXRpbC5nZXRSYW5kb21JbnQoLTEwMCwgMTAwKSwgMCwgMCkpO1xyXG4gICAgICAgIG1vdmVycy5wdXNoKG1vdmVyKTtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAwXSA9IG1vdmVyLnBvc2l0aW9uLng7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMV0gPSBtb3Zlci5wb3NpdGlvbi55O1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgICBjb2xvci50b0FycmF5KGNvbG9ycywgaSAqIDMpO1xyXG4gICAgICAgIG9wYWNpdGllc1tpXSA9IG1vdmVyLmE7XHJcbiAgICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgICB9XHJcbiAgICAgIHBvaW50cy5pbml0KHtcclxuICAgICAgICBzY2VuZTogc2NlbmUsXHJcbiAgICAgICAgdnM6IHZzLFxyXG4gICAgICAgIGZzOiBmcyxcclxuICAgICAgICBwb3NpdGlvbnM6IHBvc2l0aW9ucyxcclxuICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICBvcGFjaXRpZXM6IG9wYWNpdGllcyxcclxuICAgICAgICBzaXplczogc2l6ZXMsXHJcbiAgICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgICBsaWdodC5pbml0KDB4ZmY2NjAwLCAxODAwKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0Lm9iaik7XHJcbiAgICAgIGJnID0gY3JlYXRlQmFja2dyb3VuZCgpO1xyXG4gICAgICBzY2VuZS5hZGQoYmcpO1xyXG4gICAgICBjYW1lcmEucmFkMV9iYXNlID0gVXRpbC5nZXRSYWRpYW4oMjUpO1xyXG4gICAgICBjYW1lcmEucmFkMSA9IGNhbWVyYS5yYWQxX2Jhc2U7XHJcbiAgICAgIGNhbWVyYS5yYWQyID0gVXRpbC5nZXRSYWRpYW4oMCk7XHJcbiAgICAgIGNhbWVyYS5zZXRQb3NpdGlvblNwaGVyaWNhbCgpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQub2JqKTtcclxuICAgICAgYmcuZ2VvbWV0cnkuZGlzcG9zZSgpO1xyXG4gICAgICBiZy5tYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgIHNjZW5lLnJlbW92ZShiZyk7XHJcbiAgICAgIG1vdmVycyA9IFtdO1xyXG4gICAgfSxcclxuICAgIHJlbmRlcjogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBwb2ludHMuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBwb2ludHMuYXBwbHlEcmFnKDAuMik7XHJcbiAgICAgIHBvaW50cy51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgbGlnaHQuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBsaWdodC5hcHBseURyYWcoMC4yKTtcclxuICAgICAgbGlnaHQudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgbGlnaHQudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDA0KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgbW92ZVBvaW50cyh2ZWN0b3IpO1xyXG4gICAgICBpc19kcmFnZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIHRvdWNoTW92ZTogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yX21vdXNlX2Rvd24sIHZlY3Rvcl9tb3VzZV9tb3ZlKSB7XHJcbiAgICAgIGlmIChpc19kcmFnZWQpIHtcclxuICAgICAgICBtb3ZlUG9pbnRzKHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgICAgIHBvaW50cy5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBsaWdodC5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBTa2V0Y2g7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMoKTtcclxuIiwidmFyIFV0aWwgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3V0aWwnKTtcclxudmFyIEhlbWlMaWdodCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvaGVtaUxpZ2h0Jyk7XHJcbnZhciBGb3JjZTMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2ZvcmNlMycpO1xyXG5cclxudmFyIGV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBTa2V0Y2ggPSBmdW5jdGlvbigpIHt9O1xyXG4gIHZhciBpbWFnZXMgPSBbXTtcclxuICB2YXIgaW1hZ2VzX251bSA9IDMwMDtcclxuICB2YXIgaGVtaV9saWdodCA9IG5ldyBIZW1pTGlnaHQoKTtcclxuICB2YXIgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHZhciBwaWNrZWRfaWQgPSAtMTtcclxuICB2YXIgcGlja2VkX2luZGV4ID0gLTE7XHJcbiAgdmFyIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICB2YXIgaXNfZHJhZ2VkID0gZmFsc2U7XHJcbiAgdmFyIGdldF9uZWFyID0gZmFsc2U7IFxyXG5cclxuICB2YXIgSW1hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucmFkID0gMDtcclxuICAgIHRoaXMub2JqID0gbnVsbDtcclxuICAgIHRoaXMuaXNfZW50ZXJlZCA9IGZhbHNlO1xyXG4gICAgRm9yY2UzLmNhbGwodGhpcyk7XHJcbiAgfTtcclxuICB2YXIgaW1hZ2VfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxMDAsIDEwMCk7XHJcbiAgSW1hZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShGb3JjZTMucHJvdG90eXBlKTtcclxuICBJbWFnZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBJbWFnZTtcclxuICBJbWFnZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKHZlY3Rvcikge1xyXG4gICAgdmFyIGltYWdlX21hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcclxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcclxuICAgICAgbWFwOiBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoJ2ltZy9nYWxsZXJ5L2ltYWdlMCcgKyBVdGlsLmdldFJhbmRvbUludCgxLCA5KSArICcuanBnJylcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMub2JqID0gbmV3IFRIUkVFLk1lc2goaW1hZ2VfZ2VvbWV0cnksIGltYWdlX21hdGVyaWFsKTtcclxuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLm9iai5wb3NpdGlvbjtcclxuICAgIHRoaXMudmVsb2NpdHkgPSB2ZWN0b3IuY2xvbmUoKTtcclxuICAgIHRoaXMuYW5jaG9yID0gdmVjdG9yLmNsb25lKCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvbi5zZXQoMCwgMCwgMCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGluaXRJbWFnZXMgPSBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbWFnZXNfbnVtOyBpKyspIHtcclxuICAgICAgdmFyIGltYWdlID0gbnVsbDtcclxuICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKGkgJSA0NSAqIDggKyAxODApO1xyXG4gICAgICB2YXIgcmFkaXVzID0gMTAwMDtcclxuICAgICAgdmFyIHggPSBNYXRoLmNvcyhyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgeSA9IGkgKiA1IC0gaW1hZ2VzX251bSAqIDIuNTtcclxuICAgICAgdmFyIHogPSBNYXRoLnNpbihyYWQpICogcmFkaXVzO1xyXG4gICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoeCwgeSwgeik7XHJcbiAgICAgIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIGltYWdlLmluaXQobmV3IFRIUkVFLlZlY3RvcjMoKSk7XHJcbiAgICAgIGltYWdlLnJhZCA9IHJhZDtcclxuICAgICAgaW1hZ2UuYW5jaG9yLmNvcHkodmVjdG9yKTtcclxuICAgICAgc2NlbmUuYWRkKGltYWdlLm9iaik7XHJcbiAgICAgIGltYWdlcy5wdXNoKGltYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgcGlja0ltYWdlID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICBpZiAoZ2V0X25lYXIpIHJldHVybjtcclxuICAgIHZhciBpbnRlcnNlY3RzID0gbnVsbDtcclxuICAgIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKHZlY3RvciwgY2FtZXJhLm9iaik7XHJcbiAgICBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMoc2NlbmUuY2hpbGRyZW4pO1xyXG4gICAgaWYgKGludGVyc2VjdHMubGVuZ3RoID4gMCAmJiBpc19kcmFnZWQgPT0gZmFsc2UpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVkJyk7XHJcbiAgICAgIHBpY2tlZF9pZCA9IGludGVyc2VjdHNbMF0ub2JqZWN0LmlkO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzZXRQaWNrSW1hZ2UoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgZ2V0TmVhckltYWdlID0gZnVuY3Rpb24oY2FtZXJhLCBpbWFnZSkge1xyXG4gICAgZ2V0X25lYXIgPSB0cnVlO1xyXG4gICAgY2FtZXJhLmFuY2hvci5zZXQoTWF0aC5jb3MoaW1hZ2UucmFkKSAqIDc4MCwgaW1hZ2UucG9zaXRpb24ueSwgTWF0aC5zaW4oaW1hZ2UucmFkKSAqIDc4MCk7XHJcbiAgICBjYW1lcmEubG9vay5hbmNob3IuY29weShpbWFnZS5wb3NpdGlvbik7XHJcbiAgICByZXNldFBpY2tJbWFnZSgpO1xyXG4gIH07XHJcblxyXG4gIHZhciByZXNldFBpY2tJbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICBwaWNrZWRfaWQgPSAtMTtcclxuICB9O1xyXG5cclxuICBTa2V0Y2gucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSkge1xyXG4gICAgICBpbml0SW1hZ2VzKHNjZW5lKTtcclxuICAgICAgaGVtaV9saWdodC5pbml0KDB4ZmZmZmZmLCAweGZmZmZmZik7XHJcbiAgICAgIHNjZW5lLmFkZChoZW1pX2xpZ2h0Lm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDEgPSBVdGlsLmdldFJhZGlhbigtMzUpO1xyXG4gICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyID0gVXRpbC5nZXRSYWRpYW4oMTgwKTtcclxuICAgICAgY2FtZXJhLnJvdGF0ZV9yYWQyX2Jhc2UgPSBjYW1lcmEucm90YXRlX3JhZDI7XHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzY2VuZSkge1xyXG4gICAgICBpbWFnZV9nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgc2NlbmUucmVtb3ZlKGltYWdlc1tpXS5vYmopO1xyXG4gICAgICB9O1xyXG4gICAgICBzY2VuZS5yZW1vdmUoaGVtaV9saWdodC5vYmopO1xyXG4gICAgICBpbWFnZXMgPSBbXTtcclxuICAgICAgZ2V0X25lYXIgPSBmYWxzZTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVkJyk7XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VzX251bTsgaSsrKSB7XHJcbiAgICAgICAgaW1hZ2VzW2ldLmFwcGx5SG9vaygwLCAwLjE0KTtcclxuICAgICAgICBpbWFnZXNbaV0uYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaW1hZ2VzW2ldLm9iai5sb29rQXQoe1xyXG4gICAgICAgICAgeDogMCxcclxuICAgICAgICAgIHk6IGltYWdlc1tpXS5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgejogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpbWFnZXNbaV0ub2JqLmlkID09IHBpY2tlZF9pZCAmJiBpc19kcmFnZWQgPT0gZmFsc2UgJiYgZ2V0X25lYXIgPT0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmIChpc19jbGlja2VkID09IHRydWUpIHtcclxuICAgICAgICAgICAgcGlja2VkX2luZGV4ID0gaTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltYWdlc1tpXS5vYmoubWF0ZXJpYWwuY29sb3Iuc2V0KDB4YWFhYWFhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW1hZ2VzW2ldLm9iai5tYXRlcmlhbC5jb2xvci5zZXQoMHhmZmZmZmYpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlEcmFnKDAuNCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgaWYgKGdldF9uZWFyID09PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5sb29rLmFuY2hvci5jb3B5KFV0aWwuZ2V0U3BoZXJpY2FsKGNhbWVyYS5yb3RhdGVfcmFkMSwgY2FtZXJhLnJvdGF0ZV9yYWQyLCAxMDAwKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmxvb2suYXBwbHlIb29rKDAsIDAuMDgpO1xyXG4gICAgICBjYW1lcmEubG9vay5hcHBseURyYWcoMC40KTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLmxvb2sudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgY2FtZXJhLm9iai5sb29rQXQoY2FtZXJhLmxvb2sucG9zaXRpb24pO1xyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcikge1xyXG4gICAgICBwaWNrSW1hZ2Uoc2NlbmUsIGNhbWVyYSwgdmVjdG9yKTtcclxuICAgICAgaXNfY2xpY2tlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgcGlja0ltYWdlKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9tb3ZlKTtcclxuICAgICAgaWYgKGlzX2NsaWNrZWQgJiYgdmVjdG9yX21vdXNlX2Rvd24uY2xvbmUoKS5zdWIodmVjdG9yX21vdXNlX21vdmUpLmxlbmd0aCgpID4gMC4wMSkge1xyXG4gICAgICAgIGlzX2NsaWNrZWQgPSBmYWxzZTtcclxuICAgICAgICBpc19kcmFnZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc19kcmFnZWQgPT0gdHJ1ZSAmJiBnZXRfbmVhciA9PSBmYWxzZSkge1xyXG4gICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IGNhbWVyYS5yb3RhdGVfcmFkMV9iYXNlICsgVXRpbC5nZXRSYWRpYW4oKHZlY3Rvcl9tb3VzZV9kb3duLnkgLSB2ZWN0b3JfbW91c2VfbW92ZS55KSAqIDUwKTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDIgPSBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSArIFV0aWwuZ2V0UmFkaWFuKCh2ZWN0b3JfbW91c2VfZG93bi54IC0gdmVjdG9yX21vdXNlX21vdmUueCkgKiA1MCk7XHJcbiAgICAgICAgaWYgKGNhbWVyYS5yb3RhdGVfcmFkMSA8IFV0aWwuZ2V0UmFkaWFuKC01MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKC01MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjYW1lcmEucm90YXRlX3JhZDEgPiBVdGlsLmdldFJhZGlhbig1MCkpIHtcclxuICAgICAgICAgIGNhbWVyYS5yb3RhdGVfcmFkMSA9IFV0aWwuZ2V0UmFkaWFuKDUwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICB0b3VjaEVuZDogZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgdmVjdG9yKSB7XHJcbiAgICAgIHJlc2V0UGlja0ltYWdlKCk7XHJcbiAgICAgIGlmIChnZXRfbmVhcikge1xyXG4gICAgICAgIGNhbWVyYS5hbmNob3Iuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgIHBpY2tlZF9pbmRleCA9IC0xO1xyXG4gICAgICAgIGdldF9uZWFyID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSBpZiAoaXNfY2xpY2tlZCAmJiBwaWNrZWRfaW5kZXggPiAtMSkge1xyXG4gICAgICAgIGdldE5lYXJJbWFnZShjYW1lcmEsIGltYWdlc1twaWNrZWRfaW5kZXhdKTtcclxuICAgICAgfSBlbHNlIGlmIChpc19kcmFnZWQpIHtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDFfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMTtcclxuICAgICAgICBjYW1lcmEucm90YXRlX3JhZDJfYmFzZSA9IGNhbWVyYS5yb3RhdGVfcmFkMjtcclxuICAgICAgfVxyXG4gICAgICBpc19jbGlja2VkID0gZmFsc2U7XHJcbiAgICAgIGlzX2RyYWdlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iLCJ2YXIgVXRpbCA9IHJlcXVpcmUoJy4uL21vZHVsZXMvdXRpbCcpO1xyXG52YXIgTW92ZXIgPSByZXF1aXJlKCcuLi9tb2R1bGVzL21vdmVyJyk7XHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgTGlnaHQgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50TGlnaHQnKTtcclxuXHJcbnZhciB2cyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBjdXN0b21Db2xvcjtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgdmVydGV4T3BhY2l0eTtcXHJcXG5hdHRyaWJ1dGUgZmxvYXQgc2l6ZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgdkNvbG9yID0gY3VzdG9tQ29sb3I7XFxyXFxuICBmT3BhY2l0eSA9IHZlcnRleE9wYWNpdHk7XFxyXFxuICB2ZWM0IG12UG9zaXRpb24gPSBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xcclxcbiAgZ2xfUG9pbnRTaXplID0gc2l6ZSAqICgzMDAuMCAvIGxlbmd0aChtdlBvc2l0aW9uLnh5eikpO1xcclxcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbXZQb3NpdGlvbjtcXHJcXG59XFxyXFxuXCI7XHJcbnZhciBmcyA9IFwiI2RlZmluZSBHTFNMSUZZIDFcXG51bmlmb3JtIHZlYzMgY29sb3I7XFxyXFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXHJcXG5cXHJcXG52YXJ5aW5nIHZlYzMgdkNvbG9yO1xcclxcbnZhcnlpbmcgZmxvYXQgZk9wYWNpdHk7XFxyXFxuXFxyXFxudm9pZCBtYWluKCkge1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciAqIHZDb2xvciwgZk9wYWNpdHkpO1xcclxcbiAgZ2xfRnJhZ0NvbG9yID0gZ2xfRnJhZ0NvbG9yICogdGV4dHVyZTJEKHRleHR1cmUsIGdsX1BvaW50Q29vcmQpO1xcclxcbn1cXHJcXG5cIjtcclxuXHJcbnZhciBleHBvcnRzID0gZnVuY3Rpb24oKXtcclxuICB2YXIgU2tldGNoID0gZnVuY3Rpb24oKSB7fTtcclxuICB2YXIgbW92ZXJzX251bSA9IDIwMDAwO1xyXG4gIHZhciBtb3ZlcnMgPSBbXTtcclxuICB2YXIgcG9pbnRzID0gbmV3IFBvaW50cygpO1xyXG4gIHZhciBsaWdodCA9IG5ldyBMaWdodCgpO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KG1vdmVyc19udW0gKiAzKTtcclxuICB2YXIgY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtICogMyk7XHJcbiAgdmFyIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkobW92ZXJzX251bSk7XHJcbiAgdmFyIHNpemVzID0gbmV3IEZsb2F0MzJBcnJheShtb3ZlcnNfbnVtKTtcclxuICB2YXIgZ3Jhdml0eSA9IG5ldyBUSFJFRS5WZWN0b3IzKDEuNSwgMCwgMCk7XHJcbiAgdmFyIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgdmFyIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmUpIHtcclxuICAgICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlGb3JjZShncmF2aXR5KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4xKTtcclxuICAgICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICAgIG1vdmVyLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgaWYgKG1vdmVyLmEgPCAwLjgpIHtcclxuICAgICAgICAgIG1vdmVyLmEgKz0gMC4wMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmVyLnBvc2l0aW9uLnggPiAxMDAwKSB7XHJcbiAgICAgICAgICBtb3Zlci5pbml0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcclxuICAgICAgICAgIG1vdmVyLnRpbWUgPSAwO1xyXG4gICAgICAgICAgbW92ZXIuYSA9IDAuMDtcclxuICAgICAgICAgIG1vdmVyLmluYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDJdID0gbW92ZXIucG9zaXRpb24uejtcclxuICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBhY3RpdmF0ZU1vdmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY291bnQgPSAwO1xyXG4gICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBpZiAobm93IC0gbGFzdF90aW1lX2FjdGl2YXRlID4gZ3Jhdml0eS54ICogMTYpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBtb3ZlcnNbaV07XHJcbiAgICAgICAgaWYgKG1vdmVyLmlzX2FjdGl2ZSkgY29udGludWU7XHJcbiAgICAgICAgdmFyIHJhZCA9IFV0aWwuZ2V0UmFkaWFuKFV0aWwuZ2V0UmFuZG9tSW50KDAsIDEyMCkgKiAzKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBNYXRoLmxvZyhVdGlsLmdldFJhbmRvbUludCgyLCAxMjgpKSAvIE1hdGgubG9nKDEyOCkgKiAxNjAgKyA2MDtcclxuICAgICAgICB2YXIgeSA9IE1hdGguc2luKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgeiA9IE1hdGguY29zKHJhZCkgKiByYW5nZTtcclxuICAgICAgICB2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjMoLTEwMDAsIHksIHopO1xyXG4gICAgICAgIHZlY3Rvci5hZGQocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgICBtb3Zlci5hY3RpdmF0ZSgpO1xyXG4gICAgICAgIG1vdmVyLmluaXQodmVjdG9yKTtcclxuICAgICAgICBtb3Zlci5hID0gMDtcclxuICAgICAgICBtb3Zlci5zaXplID0gVXRpbC5nZXRSYW5kb21JbnQoNSwgNjApO1xyXG4gICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgaWYgKGNvdW50ID49IE1hdGgucG93KGdyYXZpdHkueCAqIDMsIGdyYXZpdHkueCAqIDAuNCkpIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RfdGltZV9hY3RpdmF0ZSA9IERhdGUubm93KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcG9pbnRzLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICBwb2ludHMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIGxpZ2h0Lm9iai5wb3NpdGlvbi5jb3B5KHBvaW50cy52ZWxvY2l0eSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIHZhciBncmFkID0gbnVsbDtcclxuICAgIHZhciB0ZXh0dXJlID0gbnVsbDtcclxuXHJcbiAgICBjYW52YXMud2lkdGggPSAyMDA7XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gMjAwO1xyXG4gICAgZ3JhZCA9IGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudCgxMDAsIDEwMCwgMjAsIDEwMCwgMTAwLCAxMDApO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC4yLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMC41LCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyk7XHJcbiAgICBncmFkLmFkZENvbG9yU3RvcCgxLjAsICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDApJyk7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JhZDtcclxuICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgTWF0aC5QSSAvIDE4MCwgdHJ1ZSk7XHJcbiAgICBjdHguZmlsbCgpO1xyXG4gICAgXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNoYW5nZUdyYXZpdHkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChpc190b3VjaGVkKSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPCA2KSBncmF2aXR5LnggKz0gMC4wMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChncmF2aXR5LnggPiAxLjUpIGdyYXZpdHkueCAtPSAwLjE7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnNfbnVtOyBpKyspIHtcclxuICAgICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgICB2YXIgaCA9IFV0aWwuZ2V0UmFuZG9tSW50KDYwLCAyMTApO1xyXG4gICAgICAgIHZhciBzID0gVXRpbC5nZXRSYW5kb21JbnQoMzAsIDkwKTtcclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoJ2hzbCgnICsgaCArICcsICcgKyBzICsgJyUsIDUwJSknKTtcclxuXHJcbiAgICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhVdGlsLmdldFJhbmRvbUludCgtMTAwLCAxMDApLCAwLCAwKSk7XHJcbiAgICAgICAgbW92ZXJzLnB1c2gobW92ZXIpO1xyXG4gICAgICAgIHBvc2l0aW9uc1tpICogMyArIDBdID0gbW92ZXIucG9zaXRpb24ueDtcclxuICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IG1vdmVyLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSBtb3Zlci5wb3NpdGlvbi56O1xyXG4gICAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgICAgb3BhY2l0aWVzW2ldID0gbW92ZXIuYTtcclxuICAgICAgICBzaXplc1tpXSA9IG1vdmVyLnNpemU7XHJcbiAgICAgIH1cclxuICAgICAgcG9pbnRzLmluaXQoe1xyXG4gICAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgICB2czogdnMsXHJcbiAgICAgICAgZnM6IGZzLFxyXG4gICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgIG9wYWNpdGllczogb3BhY2l0aWVzLFxyXG4gICAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgICB0ZXh0dXJlOiBjcmVhdGVUZXh0dXJlKCksXHJcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcclxuICAgICAgfSk7XHJcbiAgICAgIGxpZ2h0LmluaXQoKTtcclxuICAgICAgc2NlbmUuYWRkKGxpZ2h0Lm9iaik7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IgPSBuZXcgVEhSRUUuVmVjdG9yMyg4MDAsIDAsIDApO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZTogZnVuY3Rpb24oc2NlbmUpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBzY2VuZS5yZW1vdmUobGlnaHQub2JqKTtcclxuICAgICAgbW92ZXJzID0gW107XHJcbiAgICB9LFxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhKSB7XHJcbiAgICAgIGNoYW5nZUdyYXZpdHkoKTtcclxuICAgICAgYWN0aXZhdGVNb3ZlcigpO1xyXG4gICAgICB1cGRhdGVNb3ZlcigpO1xyXG4gICAgICBjYW1lcmEuYXBwbHlIb29rKDAsIDAuMDA4KTtcclxuICAgICAgY2FtZXJhLmFwcGx5RHJhZygwLjEpO1xyXG4gICAgICBjYW1lcmEudXBkYXRlVmVsb2NpdHkoKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgIGNhbWVyYS5sb29rQXRDZW50ZXIoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaFN0YXJ0OiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3IpIHtcclxuICAgICAgaXNfdG91Y2hlZCA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgdG91Y2hNb3ZlOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZG93biwgdmVjdG9yX21vdXNlX21vdmUpIHtcclxuICAgICAgY2FtZXJhLmFuY2hvci56ID0gdmVjdG9yX21vdXNlX21vdmUueCAqIDEyMDtcclxuICAgICAgY2FtZXJhLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMjA7XHJcbiAgICAgIC8vY2FtZXJhLmxvb2tBdENlbnRlcigpO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IDA7XHJcbiAgICAgIGlzX3RvdWNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gU2tldGNoO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzKCk7XHJcbiIsInZhciBVdGlsID0gcmVxdWlyZSgnLi4vbW9kdWxlcy91dGlsJyk7XHJcbnZhciBNb3ZlciA9IHJlcXVpcmUoJy4uL21vZHVsZXMvbW92ZXInKTtcclxuXHJcbnZhciBQb2ludHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL3BvaW50cy5qcycpO1xyXG52YXIgdnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgY3VzdG9tQ29sb3I7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHZlcnRleE9wYWNpdHk7XFxyXFxuYXR0cmlidXRlIGZsb2F0IHNpemU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIHZDb2xvciA9IGN1c3RvbUNvbG9yO1xcclxcbiAgZk9wYWNpdHkgPSB2ZXJ0ZXhPcGFjaXR5O1xcclxcbiAgdmVjNCBtdlBvc2l0aW9uID0gbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcXHJcXG4gIGdsX1BvaW50U2l6ZSA9IHNpemUgKiAoMzAwLjAgLyBsZW5ndGgobXZQb3NpdGlvbi54eXopKTtcXHJcXG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG12UG9zaXRpb247XFxyXFxufVxcclxcblwiO1xyXG52YXIgZnMgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxudW5pZm9ybSB2ZWMzIGNvbG9yO1xcclxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxyXFxuXFxyXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXHJcXG52YXJ5aW5nIGZsb2F0IGZPcGFjaXR5O1xcclxcblxcclxcbnZvaWQgbWFpbigpIHtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IgKiB2Q29sb3IsIGZPcGFjaXR5KTtcXHJcXG4gIGdsX0ZyYWdDb2xvciA9IGdsX0ZyYWdDb2xvciAqIHRleHR1cmUyRCh0ZXh0dXJlLCBnbF9Qb2ludENvb3JkKTtcXHJcXG59XFxyXFxuXCI7XHJcblxyXG52YXIgZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIFNrZXRjaCA9IGZ1bmN0aW9uKCkge307XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgdmFyIGltYWdlX3ZlcnRpY2VzID0gW107XHJcbiAgdmFyIG1vdmVycyA9IFtdO1xyXG4gIHZhciBwb3NpdGlvbnMgPSBudWxsO1xyXG4gIHZhciBjb2xvcnMgPSBudWxsO1xyXG4gIHZhciBvcGFjaXRpZXMgPSBudWxsO1xyXG4gIHZhciBzaXplcyA9IG51bGw7XHJcbiAgdmFyIGxlbmd0aF9zaWRlID0gNDAwO1xyXG4gIHZhciBwb2ludHMgPSBuZXcgUG9pbnRzKCk7XHJcbiAgdmFyIGNyZWF0ZWRfcG9pbnRzID0gZmFsc2U7XHJcblxyXG4gIHZhciBsb2FkSW1hZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgaW1hZ2Uuc3JjID0gJy4vaW1nL2ltYWdlX2RhdGEvZWxlcGhhbnQucG5nJztcclxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB2YXIgZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBjYW52YXMud2lkdGggPSBsZW5ndGhfc2lkZTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBsZW5ndGhfc2lkZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgdmFyIGltYWdlX2RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGxlbmd0aF9zaWRlLCBsZW5ndGhfc2lkZSk7XHJcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGxlbmd0aF9zaWRlOyB5KyspIHtcclxuICAgICAgaWYgKHkgJSAzID4gMCkgY29udGludWU7XHJcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbGVuZ3RoX3NpZGU7IHgrKykge1xyXG4gICAgICAgIGlmICh4ICUgMyA+IDApIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmKGltYWdlX2RhdGEuZGF0YVsoeCArIHkgKiBsZW5ndGhfc2lkZSkgKiA0XSA+IDApIHtcclxuICAgICAgICAgIGltYWdlX3ZlcnRpY2VzLnB1c2goMCwgKHkgLSBsZW5ndGhfc2lkZSAvIDIpICogLTEsICh4IC0gbGVuZ3RoX3NpZGUvIDIpICogLTEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBidWlsZFBvaW50cyA9IGZ1bmN0aW9uKHNjZW5lKSB7XHJcbiAgICBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KGltYWdlX3ZlcnRpY2VzKTtcclxuICAgIGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoKTtcclxuICAgIG9wYWNpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBzaXplcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW1hZ2VfdmVydGljZXMubGVuZ3RoIC8gMyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlX3ZlcnRpY2VzLmxlbmd0aCAvIDM7IGkrKykge1xyXG4gICAgICB2YXIgbW92ZXIgPSBuZXcgTW92ZXIoKTtcclxuICAgICAgdmFyIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hzbCgnICsgKGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0gKyBpbWFnZV92ZXJ0aWNlc1tpICogMyArIDFdICsgbGVuZ3RoX3NpZGUpIC8gNVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLCA2MCUsIDgwJSknKTtcclxuICAgICAgbW92ZXIuaW5pdChuZXcgVEhSRUUuVmVjdG9yMyhpbWFnZV92ZXJ0aWNlc1tpICogM10sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMV0sIGltYWdlX3ZlcnRpY2VzW2kgKiAzICsgMl0pKTtcclxuICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICBtb3ZlcnMucHVzaChtb3Zlcik7XHJcbiAgICAgIGNvbG9yLnRvQXJyYXkoY29sb3JzLCBpICogMyk7XHJcbiAgICAgIG9wYWNpdGllc1tpXSA9IDE7XHJcbiAgICAgIHNpemVzW2ldID0gMTI7XHJcbiAgICB9XHJcbiAgICBwb2ludHMuaW5pdCh7XHJcbiAgICAgIHNjZW5lOiBzY2VuZSxcclxuICAgICAgdnM6IHZzLFxyXG4gICAgICBmczogZnMsXHJcbiAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zLFxyXG4gICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgb3BhY2l0aWVzOiBvcGFjaXRpZXMsXHJcbiAgICAgIHNpemVzOiBzaXplcyxcclxuICAgICAgdGV4dHVyZTogY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICBibGVuZGluZzogVEhSRUUuTm9ybWFsQmxlbmRpbmdcclxuICAgIH0pO1xyXG4gICAgY3JlYXRlZF9wb2ludHMgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHZhciBhcHBseUZvcmNlVG9Qb2ludHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBtb3ZlciA9IG1vdmVyc1tpXTtcclxuICAgICAgdmFyIHJhZDEgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHJhZDIgPSBVdGlsLmdldFJhZGlhbihVdGlsLmdldFJhbmRvbUludCgwLCAzNjApKTtcclxuICAgICAgdmFyIHNjYWxhciA9IFV0aWwuZ2V0UmFuZG9tSW50KDQwLCA4MCk7XHJcbiAgICAgIG1vdmVyLmlzX2FjdGl2YXRlID0gZmFsc2U7XHJcbiAgICAgIG1vdmVyLmFwcGx5Rm9yY2UoVXRpbC5nZXRTcGhlcmljYWwocmFkMSwgcmFkMiwgc2NhbGFyKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHVwZGF0ZU1vdmVyID0gIGZ1bmN0aW9uKCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3ZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIG1vdmVyID0gbW92ZXJzW2ldO1xyXG4gICAgICBtb3Zlci50aW1lKys7XHJcbiAgICAgIGlmIChtb3Zlci5hY2NlbGVyYXRpb24ubGVuZ3RoKCkgPCAxKSB7XHJcbiAgICAgICAgbW92ZXIuaXNfYWN0aXZhdGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb3Zlci5pc19hY3RpdmF0ZSkge1xyXG4gICAgICAgIG1vdmVyLmFwcGx5SG9vaygwLCAwLjE4KTtcclxuICAgICAgICBtb3Zlci5hcHBseURyYWcoMC4yNik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbW92ZXIuYXBwbHlEcmFnKDAuMDM1KTtcclxuICAgICAgfVxyXG4gICAgICBtb3Zlci51cGRhdGVWZWxvY2l0eSgpO1xyXG4gICAgICBtb3Zlci51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBtb3Zlci5wb3NpdGlvbi5zdWIocG9pbnRzLnBvc2l0aW9uKTtcclxuICAgICAgcG9zaXRpb25zW2kgKiAzICsgMF0gPSBtb3Zlci5wb3NpdGlvbi54IC0gcG9pbnRzLnBvc2l0aW9uLng7XHJcbiAgICAgIHBvc2l0aW9uc1tpICogMyArIDFdID0gbW92ZXIucG9zaXRpb24ueSAtIHBvaW50cy5wb3NpdGlvbi54O1xyXG4gICAgICBwb3NpdGlvbnNbaSAqIDMgKyAyXSA9IG1vdmVyLnBvc2l0aW9uLnogLSBwb2ludHMucG9zaXRpb24ueDtcclxuICAgICAgbW92ZXIuc2l6ZSA9IE1hdGgubG9nKFV0aWwuZ2V0UmFuZG9tSW50KDEsIDEyOCkpIC8gTWF0aC5sb2coMTI4KSAqIE1hdGguc3FydChkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoKTtcclxuICAgICAgc2l6ZXNbaV0gPSBtb3Zlci5zaXplO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLnVwZGF0ZVBvaW50cygpO1xyXG4gIH07XHJcblxyXG4gIHZhciBjcmVhdGVUZXh0dXJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB2YXIgZ3JhZCA9IG51bGw7XHJcbiAgICB2YXIgdGV4dHVyZSA9IG51bGw7XHJcblxyXG4gICAgY2FudmFzLndpZHRoID0gMjAwO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IDIwMDtcclxuICAgIGdyYWQgPSBjdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoMTAwLCAxMDAsIDIwLCAxMDAsIDEwMCwgMTAwKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMSknKTtcclxuICAgIGdyYWQuYWRkQ29sb3JTdG9wKDAuNSwgJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKScpO1xyXG4gICAgZ3JhZC5hZGRDb2xvclN0b3AoMS4wLCAncmdiYSgyNTUsIDI1NSwgMjU1LCAwKScpO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyYWQ7XHJcbiAgICBjdHguYXJjKDEwMCwgMTAwLCAxMDAsIDAsIE1hdGguUEkgLyAxODAsIHRydWUpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuXHJcbiAgICB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcclxuICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlcjtcclxuICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG4gICAgcmV0dXJuIHRleHR1cmU7XHJcbiAgfTtcclxuXHJcbiAgU2tldGNoLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgbG9hZEltYWdlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldEltYWdlRGF0YSgpO1xyXG4gICAgICAgIGJ1aWxkUG9pbnRzKHNjZW5lKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGNhbWVyYS5yYW5nZSA9IDE0MDA7XHJcbiAgICAgIGNhbWVyYS5yYWQxX2Jhc2UgPSBVdGlsLmdldFJhZGlhbigwKTtcclxuICAgICAgY2FtZXJhLnJhZDEgPSBjYW1lcmEucmFkMV9iYXNlO1xyXG4gICAgICBjYW1lcmEucmFkMiA9IFV0aWwuZ2V0UmFkaWFuKDApO1xyXG4gICAgICBjYW1lcmEuc2V0UG9zaXRpb25TcGhlcmljYWwoKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgcG9pbnRzLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcG9pbnRzLm1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgc2NlbmUucmVtb3ZlKHBvaW50cy5vYmopO1xyXG4gICAgICBpbWFnZV92ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICBtb3ZlcnMgPSBbXTtcclxuICAgICAgY2FtZXJhLnJhbmdlID0gMTAwMDtcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEpIHtcclxuICAgICAgaWYgKGNyZWF0ZWRfcG9pbnRzKSB7XHJcbiAgICAgICAgdXBkYXRlTW92ZXIoKTtcclxuICAgICAgICBwb2ludHMudXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgIH1cclxuICAgICAgY2FtZXJhLmFwcGx5SG9vaygwLCAwLjAyNSk7XHJcbiAgICAgIGNhbWVyYS5hcHBseURyYWcoMC4yKTtcclxuICAgICAgY2FtZXJhLnVwZGF0ZVZlbG9jaXR5KCk7XHJcbiAgICAgIGNhbWVyYS51cGRhdGVQb3NpdGlvbigpO1xyXG4gICAgICBjYW1lcmEubG9va0F0Q2VudGVyKCk7XHJcblxyXG4gICAgfSxcclxuICAgIHRvdWNoU3RhcnQ6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBhcHBseUZvcmNlVG9Qb2ludHMoKTtcclxuICAgIH0sXHJcbiAgICB0b3VjaE1vdmU6IGZ1bmN0aW9uKHNjZW5lLCBjYW1lcmEsIHZlY3Rvcl9tb3VzZV9kb3duLCB2ZWN0b3JfbW91c2VfbW92ZSkge1xyXG4gICAgICBjYW1lcmEuYW5jaG9yLnogPSB2ZWN0b3JfbW91c2VfbW92ZS54ICogMTAwMDtcclxuICAgICAgY2FtZXJhLmFuY2hvci55ID0gdmVjdG9yX21vdXNlX21vdmUueSAqIC0xMDAwO1xyXG4gICAgfSxcclxuICAgIHRvdWNoRW5kOiBmdW5jdGlvbihzY2VuZSwgY2FtZXJhLCB2ZWN0b3JfbW91c2VfZW5kKSB7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueiA9IDA7XHJcbiAgICAgIGNhbWVyYS5hbmNob3IueSA9IDA7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIFNrZXRjaDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cygpO1xyXG4iXX0=
