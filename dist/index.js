// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
var SignalWireEmbed = {
  scriptElm: null,
  params: null,
  client: null,
  currentCall: null,
  ready: function ready(callback) {
    if (document.readyState != "loading") {
      callback();
    } else if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      document.attachEvent("onreadystatechange", function () {
        if (document.readyState != "loading") {
          callback();
        }
      });
    }
  },
  setup: function setup() {
    this.scriptElm = document.getElementById("signalwire-embed");
    var url = new URL(this.scriptElm.src);
    this.params = new URLSearchParams(url.search);
    var cssUrl = url.href.split("?")[0].replace("js", "css");
    this.createMainDiv();
    this.injectStylesheet(cssUrl);
    this.injectScripts();
  },
  createMainDiv: function createMainDiv() {
    var mainDiv = document.createElement("div");
    mainDiv.innerText = "Embed Div";
    mainDiv.style = "width: 800px; height: 600px; position: relative;";
    var remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.id = "signalWireRemoteVideo";
    remoteVideo.style = "background-color: black; width: 800px; height: 600px;"; // var localVideo = document.createElement('video');
    // localVideo.autoplay = true;
    // localVideo.playsInline = true;
    // localVideo.id = "signalWireLocalVideo";
    // localVideo.style = "background-color: black; width: 400px; height: 300px;"

    var startCallBtn = document.createElement("button");
    startCallBtn.type = "button";
    startCallBtn.id = "startCallBtn";
    startCallBtn.innerText = "Join the room";
    startCallBtn.style = "position:absolute; left:50%; top:50%; transform: translate(-50%, -50%)";
    startCallBtn.addEventListener("click", function () {
      SignalWireEmbed.connect();
    });
    var hangupBtn = document.createElement("button");
    hangupBtn.type = "button";
    hangupBtn.id = "hangupBtn";
    hangupBtn.innerText = "Hang up";
    hangupBtn.style = "position:absolute; left:50%; bottom: 5%; transform: translate(-50%, -5%); display: none";
    hangupBtn.addEventListener("click", function () {
      SignalWireEmbed.hangup();
    });
    mainDiv.appendChild(remoteVideo); // mainDiv.appendChild(localVideo);

    mainDiv.appendChild(startCallBtn);
    mainDiv.appendChild(hangupBtn);
    this.scriptElm.parentNode.insertBefore(mainDiv, this.scriptElm);
  },
  injectStylesheet: function injectStylesheet(src) {
    var link = document.createElement("link");
    link.href = src;
    link.rel = "stylesheet";
    document.head.append(link);
  },
  injectScripts: function injectScripts() {
    var _this = this;

    this.injectScript("https://webrtc.github.io/adapter/adapter-latest.js").then(function () {
      _this.injectScript("https://unpkg.com/@signalwire/js").then(function () {
        console.log("Scripts loaded!");

        _this.setupClient();
      });
    });
  },
  injectScript: function injectScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.addEventListener("load", resolve);
      script.addEventListener("error", function (e) {
        return reject(e.error);
      });
      document.head.appendChild(script);
    });
  },
  setupClient: function setupClient() {
    var clientParams = {
      host: this.params.get("node") + ".sw.work/freeswitch",
      login: "guest",
      password: "signalwire",
      callerName: this.params.get("user"),
      callerNumber: "guest"
    };
    var client = new Verto(clientParams);
    client.remoteElement = "signalWireRemoteVideo"; // client.localElement = 'signalWireLocalVideo';

    client.iceServers = [{
      urls: ["stun:stun.l.google.com:19302"]
    }];
    client.enableMicrophone();
    client.enableWebcam();
    client.on("signalwire.ready", function () {
      console.log("Connected"); // here we will dial the call

      SignalWireEmbed.startCall();
    }); // Update UI on socket close

    client.on("signalwire.socket.close", function () {
      console.log("Disconnected");
    }); // Handle error...

    client.on("signalwire.error", function (error) {
      console.error("SignalWire error:", error);
    });
    client.on("signalwire.notification", SignalWireEmbed.handleNotification);
    this.client = client;
    console.log("Client is set up");
  },
  // call this from the button handler
  connect: function connect() {
    document.getElementById("startCallBtn").style.display = "none";
    this.client.connect();
  },
  startCall: function startCall() {
    console.log("calling", this.params.get("room"));
    var params = {
      destinationNumber: this.params.get("room"),
      audio: true,
      video: true
    };
    SignalWireEmbed.currentCall = SignalWireEmbed.client.newCall(params);
  },
  handleNotification: function handleNotification(notification) {
    console.log("notification", notification.type, notification);

    switch (notification.type) {
      case "callUpdate":
        SignalWireEmbed.handleCallUpdate(notification.call);
        break;

      case "userMediaError":
        // Permission denied or invalid audio/video params on `getUserMedia`
        console.log("There was an userMediaError");
        break;
    }
  },
  handleCallUpdate: function handleCallUpdate(call) {
    switch (call.state) {
      case "active":
        // Call has become active
        SignalWireEmbed.handleCallActive();
        break;

      case "destroy":
        // Call has been destroyed
        console.log("call was destroyed");
        document.getElementById("hangupBtn").style.display = "none";
        document.getElementById("startCallBtn").style.display = "block";
        SignalWireEmbed.currentCall = null;
        break;
    }
  },
  handleCallActive: function handleCallActive() {
    console.log("call has become active");
    document.getElementById("hangupBtn").style.display = "block";
    document.getElementById("startCallBtn").style.display = "none";
  },
  hangup: function hangup() {
    console.log("hanging up");

    if (SignalWireEmbed.currentCall) {
      SignalWireEmbed.currentCall.hangup();
    }
  }
};
SignalWireEmbed.ready(function () {
  SignalWireEmbed.setup();
});
},{}],"../../.nvm/versions/node/v12.16.3/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "33943" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../.nvm/versions/node/v12.16.3/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/index.js.map