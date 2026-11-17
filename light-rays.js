/**
 * LightRays — dependency-free WebGL light-ray background.
 *
 * Vanilla port of the React/OGL "LightRays" component, for this static site.
 * Usage: add an element with the `light-rays` class inside a positioned
 * container and configure it with data attributes:
 *
 *   <div class="light-rays"
 *        data-rays-origin="top-center"   top-center | top-left | top-right | left | right |
 *                                         bottom-center | bottom-left | bottom-right
 *        data-rays-color="#ff8a5b"       hex colour
 *        data-rays-speed="1"             animation speed multiplier
 *        data-light-spread="1"           width of the beam
 *        data-ray-length="2"             length relative to the container
 *        data-pulsating="false"          breathing intensity
 *        data-fade-distance="1"          distance before rays fade out
 *        data-saturation="1"             0..1
 *        data-follow-mouse="true"        tilt towards the pointer
 *        data-mouse-influence="0.1"      0..1
 *        data-noise-amount="0.02"        film-grain amount
 *        data-distortion="0.05"></div>   wave distortion
 *
 * Behaviour: renders only while on screen and the tab is visible, caps the
 * pixel ratio at 2, follows the mouse only on fine pointers, and draws a single
 * still frame for visitors who prefer reduced motion. If WebGL is unavailable
 * the element stays empty, so whatever is behind it shows through.
 */
(function () {
  'use strict';

  var VERT = [
    'attribute vec2 position;',
    'void main() {',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform float iTime;',
    'uniform vec2  iResolution;',
    'uniform vec2  rayPos;',
    'uniform vec2  rayDir;',
    'uniform vec3  raysColor;',
    'uniform float raysSpeed;',
    'uniform float lightSpread;',
    'uniform float rayLength;',
    'uniform float pulsating;',
    'uniform float fadeDistance;',
    'uniform float saturation;',
    'uniform vec2  mousePos;',
    'uniform float mouseInfluence;',
    'uniform float noiseAmount;',
    'uniform float distortion;',
    '',
    'float noise(vec2 st) {',
    '  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);',
    '}',
    '',
    'float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,',
    '                  float seedA, float seedB, float speed) {',
    '  vec2 sourceToCoord = coord - raySource;',
    '  vec2 dirNorm = normalize(sourceToCoord);',
    '  float cosAngle = dot(dirNorm, rayRefDirection);',
    '  float d = distortion * sin(iTime * 1.5 + length(sourceToCoord) * 0.005);',
    '  float distortedAngle = cosAngle + d;',
    '  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));',
    '  float dist = length(sourceToCoord);',
    '  float maxDistance = max(iResolution.x, iResolution.y) * rayLength;',
    '  float lengthFalloff = clamp((maxDistance - dist) / maxDistance, 0.0, 1.0);',
    '  float fadeFactor = fadeDistance * max(iResolution.x, iResolution.y);',
    '  float fadeFalloff = clamp((fadeFactor - dist) / fadeFactor, 0.0, 1.0);',
    '  float pulse = pulsating > 0.5 ? (0.85 + 0.15 * sin(iTime * speed * 4.0)) : 1.0;',
    '  float baseStrength = clamp(',
    '    (0.5 + 0.2 * sin(distortedAngle * seedA + iTime * speed)) +',
    '    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed * 0.8)),',
    '    0.0, 1.0);',
    '  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;',
    '}',
    '',
    'void main() {',
    // gl_FragCoord has y pointing up; flip so rayPos/mousePos use top-left (DOM) coordinates.
    '  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);',
    '  vec2 finalRayDir = normalize(rayDir);',
    '  if (mouseInfluence > 0.0) {',
    '    vec2 mouseScreenPos = mousePos * iResolution.xy;',
    '    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);',
    '    finalRayDir = normalize(mix(finalRayDir, mouseDirection, mouseInfluence));',
    '  }',
    '  float r1 = rayStrength(rayPos, finalRayDir, coord, 45.2, 31.4, 0.8 * raysSpeed);',
    '  float r2 = rayStrength(rayPos, finalRayDir, coord, 28.5, 19.8, 1.2 * raysSpeed);',
    '  float r3 = rayStrength(rayPos, finalRayDir, coord, 12.1, 56.2, 0.5 * raysSpeed);',
    '  float combined = (r1 * 0.4 + r2 * 0.4 + r3 * 0.2);',
    '  combined = pow(combined, 0.7);',
    '  combined *= 1.5;',
    '  vec3 finalColor = raysColor * combined;',
    '  if (noiseAmount > 0.0) {',
    '    float n = noise(coord * 0.01 + iTime * 0.05);',
    '    finalColor *= (1.0 - noiseAmount + noiseAmount * n);',
    '  }',
    '  if (saturation != 1.0) {',
    '    float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));',
    '    finalColor = mix(vec3(gray), finalColor, saturation);',
    '  }',
    '  gl_FragColor = vec4(finalColor, clamp(combined, 0.0, 1.0));',
    '}'
  ].join('\n');

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
  }

  function anchorAndDir(origin, w, h) {
    var outside = 0.2;
    switch (origin) {
      case 'top-left':      return { anchor: [0, -outside * h], dir: [0.7, 0.7] };
      case 'top-right':     return { anchor: [w, -outside * h], dir: [-0.7, 0.7] };
      case 'left':          return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
      case 'right':         return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
      case 'bottom-left':   return { anchor: [0, (1 + outside) * h], dir: [0.7, -0.7] };
      case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
      case 'bottom-right':  return { anchor: [w, (1 + outside) * h], dir: [-0.7, -0.7] };
      default:              return { anchor: [0.5 * w, -outside * h], dir: [0, 1] }; // top-center
    }
  }

  function num(el, name, fallback) {
    var v = parseFloat(el.dataset[name]);
    return isNaN(v) ? fallback : v;
  }
  function bool(el, name, fallback) {
    var v = el.dataset[name];
    return v === undefined ? fallback : v !== 'false';
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('LightRays shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function mount(container) {
    var opts = {
      origin: container.dataset.raysOrigin || 'top-center',
      color: hexToRgb(container.dataset.raysColor || '#ffffff'),
      speed: num(container, 'raysSpeed', 1),
      spread: num(container, 'lightSpread', 1),
      length: num(container, 'rayLength', 2),
      pulsating: bool(container, 'pulsating', false),
      fade: num(container, 'fadeDistance', 1),
      saturation: num(container, 'saturation', 1),
      followMouse: bool(container, 'followMouse', true),
      mouseInfluence: num(container, 'mouseInfluence', 0.1),
      noise: num(container, 'noiseAmount', 0.02),
      distortion: num(container, 'distortion', 0.05)
    };

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var trackMouse = opts.followMouse && opts.mouseInfluence > 0 && finePointer && !reduceMotion;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return; // no WebGL: leave the CSS background on its own
    container.appendChild(canvas);

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { container.removeChild(canvas); return; }
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { container.removeChild(canvas); return; }
    gl.useProgram(program);

    // One oversized triangle covers the whole viewport.
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var u = {};
    ['iTime', 'iResolution', 'rayPos', 'rayDir', 'raysColor', 'raysSpeed', 'lightSpread',
     'rayLength', 'pulsating', 'fadeDistance', 'saturation', 'mousePos', 'mouseInfluence',
     'noiseAmount', 'distortion'].forEach(function (n) { u[n] = gl.getUniformLocation(program, n); });

    gl.uniform3fv(u.raysColor, opts.color);
    gl.uniform1f(u.raysSpeed, opts.speed);
    gl.uniform1f(u.lightSpread, opts.spread);
    gl.uniform1f(u.rayLength, opts.length);
    gl.uniform1f(u.pulsating, opts.pulsating ? 1 : 0);
    gl.uniform1f(u.fadeDistance, opts.fade);
    gl.uniform1f(u.saturation, opts.saturation);
    gl.uniform1f(u.mouseInfluence, trackMouse ? opts.mouseInfluence : 0);
    gl.uniform1f(u.noiseAmount, opts.noise);
    gl.uniform1f(u.distortion, opts.distortion);
    gl.uniform2f(u.mousePos, 0.5, 0.5);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      var w = Math.max(1, Math.round(container.clientWidth * dpr));
      var h = Math.max(1, Math.round(container.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.iResolution, w, h);
      var p = anchorAndDir(opts.origin, w, h);
      gl.uniform2f(u.rayPos, p.anchor[0], p.anchor[1]);
      gl.uniform2f(u.rayDir, p.dir[0], p.dir[1]);
    }

    var mouse = { x: 0.5, y: 0.5 };
    var smooth = { x: 0.5, y: 0.5 };
    if (trackMouse) {
      window.addEventListener('mousemove', function (e) {
        var r = container.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / r.width;
        mouse.y = (e.clientY - r.top) / r.height;
      }, { passive: true });
    }

    function draw(t) {
      gl.uniform1f(u.iTime, t * 0.001);
      if (trackMouse) {
        smooth.x = smooth.x * 0.95 + mouse.x * 0.05;
        smooth.y = smooth.y * 0.95 + mouse.y * 0.05;
        gl.uniform2f(u.mousePos, smooth.x, smooth.y);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    var running = false, onScreen = false, raf = 0;
    function loop(t) {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    }
    function update() {
      var shouldRun = onScreen && !document.hidden && !reduceMotion;
      if (shouldRun && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
    }

    resize();
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { resize(); if (!running) draw(4000); }).observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    if (reduceMotion) {
      draw(4000); // one still frame
      return;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(container);
    } else {
      onScreen = true;
    }
    document.addEventListener('visibilitychange', update);
    update();
  }

  function init() {
    var nodes = document.querySelectorAll('.light-rays');
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].dataset.lightRaysMounted) {
        nodes[i].dataset.lightRaysMounted = 'true';
        try { mount(nodes[i]); } catch (err) { console.warn('LightRays failed to start:', err); }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
