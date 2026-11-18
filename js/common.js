/* ==========================================================================
   Shared UI: header + team picker strip, image-with-fallback helper,
   reduced-motion flag, "intro finished" promise.
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;

  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* Resolves once the lights-out intro is gone (or immediately if it isn't playing). */
  const whenReady = new Promise(resolve => {
    if (!root.classList.contains("intro-pending")) resolve();
    else document.addEventListener("intro:done", resolve, { once: true });
  });

  /* ---- Image with styled placeholder fallback --------------------------
     The placeholder is always rendered underneath; the <img> only fades in
     once it actually loads, and removes itself on error. Layout never shifts. */
  function media({ src, alt = "", placeholder = "", className = "" }) {
    const wrap = document.createElement("div");
    wrap.className = "media " + className;
    wrap.innerHTML = `<div class="media-ph" aria-hidden="true">${placeholder}</div>`;
    if (src) {
      const img = new Image();
      img.alt = alt;
      img.decoding = "async";
      img.loading = "lazy";
      img.addEventListener("load", () => wrap.classList.add("has-img"), { once: true });
      img.addEventListener("error", () => img.remove(), { once: true });
      img.src = src;
      wrap.appendChild(img);
    }
    return wrap;
  }

  /* Apply a team's colours to any element as CSS custom properties. */
  function teamVars(team, el = document.body) {
    el.style.setProperty("--team", team.colors.primary);
    el.style.setProperty("--team-2", team.colors.secondary);
    el.style.setProperty("--team-ink", team.colors.ink);
  }

  function teamStyle(team) {
    return `--c:${team.colors.primary};--c2:${team.colors.secondary};--ink:${team.colors.ink}`;
  }

  /* ---- Header ---------------------------------------------------------- */
  function buildHeader() {
    const host = document.getElementById("site-header");
    if (!host || !window.F1) return;

    const current = new URLSearchParams(location.search).get("team");
    const onTeamPage = /team\.html$/i.test(location.pathname);
    const home = onTeamPage ? "index.html" : "";

    const tabs = F1.data.teams
      .map(t => {
        const active = onTeamPage && t.id === current;
        return `<a class="team-tab" href="team.html?team=${t.id}" style="${teamStyle(t)}"
                   ${active ? 'aria-current="page"' : ""} title="${t.name}">
                  <span class="team-tab-pos">${String(t.position).padStart(2, "0")}</span>
                  <span class="team-tab-name">${t.short}</span>
                </a>`;
      })
      .join("");

    host.className = "site-header";
    host.innerHTML = `
      <div class="bar">
        <a class="brand" href="index.html" aria-label="Lights Out 2025, home">
          <span class="brand-lights" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="brand-word">Lights Out</span>
          <span class="brand-year">2025</span>
        </a>
        <nav class="main-nav" aria-label="Sections">
          <a href="${home}#about">The sport</a>
          <a href="${home}#weekend">Weekend</a>
          <a href="${home}#points">Points</a>
          <a href="${home}#reaction">Reaction test</a>
          <a href="${home}#teams" class="main-nav-cta">Teams</a>
        </nav>
      </div>
      <nav class="team-strip" aria-label="Pick a team">${tabs}</nav>`;

    // Keep the active tab in view on narrow screens
    const active = host.querySelector('[aria-current="page"]');
    if (active) active.scrollIntoView({ block: "nearest", inline: "center" });

    // Arrow-key navigation along the strip (roving tabindex: Tab enters the strip
    // once, ←/→ move between teams, Home/End jump to the ends, Enter opens).
    const strip = host.querySelector(".team-strip");
    const tabEls = [...strip.querySelectorAll(".team-tab")];
    const entry = active || tabEls[0];
    tabEls.forEach(t => (t.tabIndex = t === entry ? 0 : -1));

    strip.addEventListener("keydown", e => {
      const i = tabEls.indexOf(document.activeElement);
      if (i < 0) return;
      let n = null;
      if (e.key === "ArrowRight") n = (i + 1) % tabEls.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabEls.length) % tabEls.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabEls.length - 1;
      if (n === null) return;
      e.preventDefault();
      tabEls[i].tabIndex = -1;
      tabEls[n].tabIndex = 0;
      tabEls[n].focus();
      tabEls[n].scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    const onScroll = () => host.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  buildHeader();

  /* ---- Sound (Web Audio, synthesised: no audio files needed) -----------
     Browsers only let audio start after a click/tap/keypress, so call
     sound.unlock() from inside one of those handlers first. */
  const sound = (() => {
    let ctx = null;

    function unlock() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    // One shaped tone: fast attack, exponential release (no clicks).
    function tone({ freq, dur, type = "sine", vol = 0.18, at = 0 }) {
      const ac = unlock();
      if (!ac) return;
      const t = ac.currentTime + at;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    const light = () => tone({ freq: 880, dur: 0.12, type: "square", vol: 0.06 });

    function buzzer() {
      tone({ freq: 150, dur: 0.55, type: "sawtooth", vol: 0.12 });
      tone({ freq: 157, dur: 0.55, type: "sawtooth", vol: 0.1 }); // detuned pair = harsh buzz
    }

    /* A car launching off the line and blasting past: two detuned sawtooth
       "cylinders" revving up, a gear change, a Doppler drop as it passes,
       swept through a low-pass filter and panned left to right. */
    function vroom() {
      const ac = unlock();
      if (!ac) return;
      const t = ac.currentTime + 0.02;
      const end = t + 2.4;

      const master = ac.createGain();
      master.gain.setValueAtTime(0.0001, t);
      master.gain.exponentialRampToValueAtTime(0.32, t + 0.06);
      master.gain.setValueAtTime(0.32, t + 1.5);
      master.gain.exponentialRampToValueAtTime(0.0001, end);

      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 5;
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.exponentialRampToValueAtTime(2600, t + 0.85);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.95);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 1.6);
      filter.frequency.exponentialRampToValueAtTime(500, end);

      const pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
      if (pan) {
        pan.pan.setValueAtTime(-0.7, t);
        pan.pan.linearRampToValueAtTime(0.8, end);
        filter.connect(pan).connect(master);
      } else {
        filter.connect(master);
      }
      master.connect(ac.destination);

      // rpm curve (Hz): launch, rev, upshift dip, rev again, Doppler drop
      const curve = [[0, 75], [0.85, 270], [0.95, 185], [1.6, 330], [2.4, 190]];
      [[1, "sawtooth", 0.5], [1.012, "sawtooth", 0.45], [0.5, "square", 0.35]].forEach(([mult, type, vol]) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = type;
        g.gain.value = vol;
        curve.forEach(([at, hz], i) =>
          i === 0 ? osc.frequency.setValueAtTime(hz * mult, t)
                  : osc.frequency.exponentialRampToValueAtTime(hz * mult, t + at));
        osc.connect(g).connect(filter);
        osc.start(t);
        osc.stop(end + 0.05);
      });

      // a burst of noise for tyre scrabble / air rush
      const len = Math.floor(ac.sampleRate * 1.2);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const noise = ac.createBufferSource();
      const ng = ac.createGain();
      const bp = ac.createBiquadFilter();
      noise.buffer = buf;
      bp.type = "bandpass";
      bp.frequency.value = 1800;
      ng.gain.value = 0.18;
      noise.connect(bp).connect(ng).connect(master);
      noise.start(t);
    }

    return { unlock, tone, light, buzzer, vroom };
  })();

  window.F1UI = { reduce, hasGsap, whenReady, media, teamVars, teamStyle, sound };
})();
