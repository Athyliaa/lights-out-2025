/* ==========================================================================
   Lights-out intro. Plays once per browser session and never with reduced
   motion (the <head> snippet in index.html decides whether it plays).

   It opens on a dark gantry and waits for a tap or keypress, because browsers
   only allow sound after the visitor interacts. That tap starts the
   sequence: five lights, each with a beep, then lights out with a car
   launching past. Esc or "Skip intro" skips at any point; tapping again
   during the sequence also skips.
   ========================================================================== */
(function () {
  const root = document.documentElement;
  const el = document.getElementById("intro");
  if (!el) return;

  if (!root.classList.contains("intro-pending")) {
    el.remove();
    return;
  }

  let released = false;
  function release() {
    if (released) return;
    released = true;
    try { sessionStorage.setItem("lo-intro", "1"); } catch (e) {}
    root.classList.remove("intro-pending");
    document.dispatchEvent(new Event("intro:done"));
  }
  function cleanup() {
    release();
    el.remove();
    window.removeEventListener("keydown", onKey);
  }

  // No GSAP (offline / CDN blocked): don't trap the user behind the overlay.
  if (!window.gsap) { cleanup(); return; }

  const sound = window.F1UI && F1UI.sound;
  const $ = s => el.querySelector(s);
  const pods = [...el.querySelectorAll(".pod")];
  const glows = el.querySelectorAll(".glow");
  const status = $(".intro-status");
  const go = $(".intro-go");

  /* ---- Waiting for the first tap --------------------------------------- */
  let started = false;
  status.textContent = "Tap or press any key to start";
  status.classList.add("is-prompt");
  gsap.from($(".intro-gantry"), { y: -60, opacity: 0, duration: 0.6, ease: "power3.out" });
  gsap.from(status, { opacity: 0, duration: 0.5, delay: 0.3 });

  /* ---- The sequence (paused until the tap) ----------------------------- */
  // Real starts hold the lights for a random time; keep it short but not fixed.
  const hold = 0.7 + Math.random() * 0.8;
  const tl = gsap.timeline({ paused: true, onComplete: cleanup });

  tl.call(() => {
    status.classList.remove("is-prompt");
    status.textContent = "Formation lap complete";
  });

  pods.forEach((pod, i) => {
    tl.to(pod.querySelectorAll(".glow"), { opacity: 1, duration: 0.06, ease: "none" }, 0.6 + i * 0.75)
      .call(() => {
        status.textContent = `${i + 1} / 5`;
        if (sound) sound.light();
      }, null, "<");
  });

  tl.addLabel("out", `+=${hold}`)
    .to(glows, { opacity: 0, duration: 0.05, ease: "none" }, "out")
    .set(status, { opacity: 0 }, "out")
    .call(() => { if (sound) sound.vroom(); }, null, "out")
    .fromTo(go, { opacity: 0, scale: 0.85, skewX: -8 },
      { opacity: 1, scale: 1, skewX: -8, duration: 0.4, ease: "power4.out" }, "out")
    .addLabel("exit", "out+=1.1")
    .to($(".intro-content"), { opacity: 0, scale: 1.06, duration: 0.35, ease: "power2.in" }, "exit")
    .to($(".intro-panel.top"), { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "exit+=0.15")
    .to($(".intro-panel.bottom"), { yPercent: 100, duration: 0.85, ease: "power4.inOut" }, "<")
    .to($(".intro-skip"), { opacity: 0, duration: 0.2 }, "exit")
    .call(release, null, "exit+=0.45"); // let the home page start animating as the panels part

  function start() {
    if (started) return;
    started = true;
    if (sound) sound.unlock(); // we're inside the tap/keypress, so audio is allowed now
    tl.play(0);
  }

  function skip() {
    if (!started) { started = true; tl.play("exit"); return; }
    if (tl.time() < tl.labels.exit) tl.seek("exit");
  }

  function onKey(e) {
    if (["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Escape") skip();
    else if (!started) start();
    else skip();
  }

  $(".intro-skip").addEventListener("click", skip);
  el.addEventListener("pointerdown", e => {
    if (e.target.closest(".intro-skip")) return;
    started ? skip() : start();
  });
  window.addEventListener("keydown", onKey);
})();
