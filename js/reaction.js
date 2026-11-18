/* ==========================================================================
   Reaction-time game.
   States: idle → arming (lights come on) → go (lights out, clock running)
           → result.   Pressing during "arming" = jump start → penalty.
   Input: pointerdown on the pad, or Space/Enter while the game is on screen.
   Timing uses event.timeStamp vs performance.now() (same clock, sub-ms).
   ========================================================================== */
(function () {
  const game = document.getElementById("rt");
  if (!game) return;

  const F1_TIME = 0.2;             // typical F1 driver reaction, seconds
  const LIGHT_GAP = 900;           // ms between each light coming on
  const HOLD_MIN = 400, HOLD_MAX = 3000;  // random wait before lights out
  const PENALTY_MS = 2000;         // locked out after a jump start
  const SCALE_MIN = 0.1, SCALE_MAX = 0.5;
  const BEST_KEY = "lo-reaction-best";

  const { reduce, hasGsap } = window.F1UI;
  const $ = id => document.getElementById(id);
  const pad = $("rt-pad");
  const pods = [...game.querySelectorAll(".pod")];
  const ui = {
    status: $("rt-status"), label: $("rt-label"), time: $("rt-time"), verdict: $("rt-verdict"),
    you: $("rt-you"), best: $("rt-best"), avg: $("rt-avg"), count: $("rt-count"),
    jumps: $("rt-jumps"), log: $("rt-log"), reset: $("rt-reset")
  };

  let state = "idle";
  let timers = [];
  let lightsOutAt = 0;
  let lockedUntil = 0;
  let times = [];
  let jumps = 0;
  let best = loadBest();

  /* ---- storage --------------------------------------------------------- */
  function loadBest() {
    try {
      const v = parseFloat(localStorage.getItem(BEST_KEY));
      return v > 0 ? v : null;
    } catch (e) { return null; }
  }
  function saveBest(v) {
    try { v == null ? localStorage.removeItem(BEST_KEY) : localStorage.setItem(BEST_KEY, String(v)); } catch (e) {}
  }

  /* ---- sound (shared synth in common.js; off by default here) --------- */
  const SOUND_KEY = "lo-reaction-sound";
  const soundBtn = $("rt-sound");
  const snd = window.F1UI.sound;
  let soundOn = false;
  try { soundOn = localStorage.getItem(SOUND_KEY) === "1"; } catch (e) {}
  const audio = () => snd.unlock();

  const sfx = {
    light: () => soundOn && snd.light(),
    buzzer: () => soundOn && snd.buzzer()
    // Deliberately no sound at lights out: the cue must stay visual.
  };

  function renderSound() {
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.querySelector(".rt-sound-label").textContent = soundOn ? "Sound on" : "Sound off";
  }
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch (e) {}
    if (soundOn) { audio(); snd.tone({ freq: 880, dur: 0.08, type: "square", vol: 0.05 }); } // unlock + confirm
    renderSound();
  });
  renderSound();

  /* ---- helpers --------------------------------------------------------- */
  const fmt = s => s.toFixed(3);
  const setState = s => { state = s; game.dataset.state = s; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const setLights = n => pods.forEach((p, i) => p.classList.toggle("on", i < n));

  function verdictFor(t) {
    if (t < 0.12) return "Is that even human? Lucky guess or superhuman reflexes.";
    if (t < F1_TIME) return "Faster than an F1 driver. Pole-sitter reflexes.";
    if (t < 0.25) return "Right on F1 pace. You'd hold your own off the line.";
    if (t < 0.3) return "Solid midfield start. A couple of places lost into Turn 1.";
    if (t < 0.4) return "Backmarker getaway. The pack is already through Turn 1.";
    return "Still in the garage. Try again!";
  }

  /* ---- flow ------------------------------------------------------------ */
  function start() {
    clearTimers();
    setState("arming");
    setLights(0);
    ui.status.textContent = "Wait for it…";
    game.classList.remove("is-pb");

    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => { setLights(i); sfx.light(); }, 500 + (i - 1) * LIGHT_GAP));
    }
    const hold = HOLD_MIN + Math.random() * (HOLD_MAX - HOLD_MIN);
    timers.push(setTimeout(lightsOut, 500 + 4 * LIGHT_GAP + hold));
  }

  function lightsOut() {
    setLights(0);
    setState("go");
    // Status text deliberately does NOT change here; the only cue is the lights.
    lightsOutAt = performance.now();
    // Restart the clock on the frame the dark lights are actually drawn,
    // so you aren't charged for the browser's paint delay.
    requestAnimationFrame(() => { if (state === "go") lightsOutAt = performance.now(); });
  }

  function react(stamp) {
    const t = Math.max(0, (stamp - lightsOutAt) / 1000);
    setState("result");
    lockedUntil = performance.now() + 350; // avoid an accidental double-tap restart

    times.push(t);
    const beatPrev = best != null && t < best;   // only celebrate if there was a time to beat
    if (best == null || beatPrev) { best = t; saveBest(t); }
    const isPb = beatPrev;

    ui.label.textContent = isPb ? "New personal best" : "Your reaction";
    game.classList.toggle("is-pb", isPb);
    const diff = t - F1_TIME;
    ui.verdict.innerHTML =
      `<span class="rt-delta ${diff <= 0 ? "is-faster" : ""}">${diff <= 0 ? "−" : "+"}${fmt(Math.abs(diff))}s</span> ` +
      `vs an F1 driver. ${verdictFor(t)}`;
    ui.status.textContent = "Tap or press Space to go again";

    showTime(t);
    placeYou(t);
    updateStats();
    log(fmt(t) + "s", isPb ? "pb" : t <= F1_TIME ? "fast" : "");
  }

  function jumpStart() {
    clearTimers();
    setLights(5);
    setState("jump");
    jumps++;
    lockedUntil = performance.now() + PENALTY_MS;

    ui.status.textContent = "Jump start! Drive-through penalty…";
    ui.label.textContent = "Jump start";
    ui.time.textContent = "JUMP";
    ui.verdict.textContent = "You moved before the lights went out. That's a penalty, and it doesn't count as a time.";
    game.classList.remove("is-pb");
    ui.you.classList.remove("is-shown");
    updateStats();
    log("JUMP", "jump");
    sfx.buzzer();

    if (hasGsap && !reduce) {
      gsap.fromTo(pad, { x: -10 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    }
    timers.push(setTimeout(() => {
      setLights(0);
      setState("idle");
      ui.status.textContent = "Penalty served. Tap or press Space to try again";
    }, PENALTY_MS));
  }

  function press(stamp) {
    if (performance.now() < lockedUntil) return;
    if (soundOn) audio(); // browsers only allow audio to start from a user action
    switch (state) {
      case "idle":
      case "result": start(); break;
      case "arming": jumpStart(); break;
      case "go": react(stamp); break;
      // "jump": ignored until the penalty timer resets to idle
    }
  }

  /* ---- display --------------------------------------------------------- */
  function showTime(t) {
    if (!hasGsap || reduce) { ui.time.textContent = fmt(t); return; }
    const o = { v: 0 };
    gsap.to(o, { v: t, duration: 0.45, ease: "power2.out", onUpdate: () => (ui.time.textContent = fmt(o.v)) });
    gsap.fromTo(ui.time, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: "power3.out" });
  }

  function placeYou(t) {
    const x = Math.min(Math.max((t - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), 0), 1);
    ui.you.style.setProperty("--x", x);
    ui.you.classList.add("is-shown");
  }

  function updateStats() {
    ui.best.textContent = best == null ? "–" : fmt(best);
    ui.avg.textContent = times.length ? fmt(times.reduce((a, b) => a + b, 0) / times.length) : "–";
    ui.count.textContent = times.length;
    ui.jumps.textContent = jumps;
  }

  function log(text, kind) {
    const li = document.createElement("li");
    li.textContent = text;
    if (kind) li.className = "is-" + kind;
    ui.log.prepend(li);
    while (ui.log.children.length > 5) ui.log.lastChild.remove();
  }

  /* ---- input ----------------------------------------------------------- */
  pad.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    e.preventDefault();             // no focus-scroll / text selection on tap
    press(e.timeStamp);
  });
  pad.addEventListener("contextmenu", e => e.preventDefault());

  // Space/Enter work while the game is on screen (or the pad has focus).
  let inView = false;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    // Leaving mid-start cancels it, so the lights can't go out while you're elsewhere.
    if (!inView && (state === "arming" || state === "go")) {
      clearTimers();
      setLights(0);
      setState("idle");
      ui.status.textContent = "Tap here or press Space to start";
    }
  }, { threshold: 0.5 }).observe(pad);

  window.addEventListener("keydown", e => {
    if (e.key !== " " && e.key !== "Enter") return;
    if (!inView && document.activeElement !== pad) return;
    if (document.documentElement.classList.contains("intro-pending")) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (e.target !== pad && (tag === "button" || tag === "a")) return; // let other controls work
    e.preventDefault();
    if (e.repeat) return;
    press(e.timeStamp);
  });

  ui.reset.addEventListener("click", () => {
    best = null;
    saveBest(null);
    updateStats();
  });

  updateStats();
})();
