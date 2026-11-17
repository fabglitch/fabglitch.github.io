/* glitch.js: progressive enhancement only. The site works fully without it:
   the glitch-level switch is plain radio buttons styled with :has(), and every
   CSS effect runs without script. This file only
   (1) remembers your choice across pages (localStorage),
   (2) mirrors it to <html data-gl-i> for browsers without :has(),
   (3) adds a brief text-scramble on headings and random positions for the
       "signal lost" blip, and only while motion is on (never in calm, or
       under prefers-reduced-motion unless you picked glitchy/unhinged).
   Scrambles draw an aria-hidden overlay; the real heading text never changes. */
(function () {
  var KEY = "gl-intensity", root = document.documentElement;
  var mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  function level() { var c = document.querySelector('input[name="gl-i"]:checked'); return c ? c.value : "a"; }
  function sync() { root.setAttribute("data-gl-i", level()); }
  function moving() { var v = level(); return v === "0" ? false : v === "a" ? !mq.matches : true; }
  try {
    var v = localStorage.getItem(KEY), r = v && document.getElementById("gl-i-" + v);
    if (r) r.checked = true;
  } catch (e) {}
  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "gl-i") {
      try { localStorage.setItem(KEY, e.target.value); } catch (err) {}
      sync();
    }
  });
  sync();

  /* text scramble: ~0.45s, then the overlay is removed */
  var GLYPHS = "!<>-_\\/[]{}=+*^?#%$01ABCDEF";
  function inView(el) { var b = el.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 0; }
  function scramble(el) {
    if (el.classList.contains("gl-scrambling")) return;
    var text = el.getAttribute("data-text") || el.textContent, color = getComputedStyle(el).color;
    var o = document.createElement("span"); o.className = "gl-scr"; o.setAttribute("aria-hidden", "true"); o.style.color = color;
    el.appendChild(o); el.classList.add("gl-scrambling");
    var frame = 0, frames = 8;
    (function step() {
      var keep = Math.floor(text.length * frame / frames), out = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        out += (i < keep || ch === " ") ? ch : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
      o.textContent = out;
      if (++frame <= frames) setTimeout(step, 55);
      else { el.classList.remove("gl-scrambling"); o.remove(); }
    })();
  }
  function tick() {
    var lv = level(), wait = lv === "2" ? 1800 + Math.random() * 2200 : 3500 + Math.random() * 3500;
    if (moving() && !document.hidden) {
      var els = [].filter.call(document.querySelectorAll("h1.gl-glitch, h2.gl-glitch, .gl-nav a.gl-glitch"), inView);
      if (els.length) scramble(els[Math.floor(Math.random() * els.length)]);
    }
    setTimeout(tick, wait);
  }
  setTimeout(tick, 900);

  /* move the "signal lost" band somewhere new each cycle */
  var blip = document.querySelector(".gl-blip");
  if (blip) blip.addEventListener("animationiteration", function () {
    blip.style.setProperty("--gl-blip-y", (8 + Math.random() * 72).toFixed(1) + "%");
  });
})();
