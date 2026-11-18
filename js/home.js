/* ==========================================================================
   Home page: hero timing tower, race-weekend switcher, points chart,
   team picker grid, and all scroll animations.
   ========================================================================== */
(function () {
  const { reduce, hasGsap, whenReady, media, teamStyle } = window.F1UI;
  const D = F1.data;
  const animate = hasGsap && !reduce;

  /* ---- Hero: final classification tower -------------------------------- */
  const tower = document.getElementById("tower");
  const top = F1.standings().slice(0, 10);
  const leader = top[0].points;
  tower.innerHTML = top
    .map((d, i) => `
      <li class="tower-row" style="${teamStyle(d.team)}">
        <span class="tower-pos">${i + 1}</span>
        <span class="tower-bar" aria-hidden="true"></span>
        <span class="tower-code" title="${d.first} ${d.last}">${d.code}</span>
        <span class="tower-gap">${i === 0 ? "LEADER" : "−" + (leader - d.points)}</span>
        <span class="tower-pts">${d.points}</span>
      </li>`)
    .join("");

  /* ---- Race weekend ----------------------------------------------------- */
  const WEEKEND = {
    standard: [
      { day: "Friday", sessions: [
        { name: "Practice 1", len: "60 min", desc: "Teams dial in setup and gather tyre data. Rookies often get a run here." },
        { name: "Practice 2", len: "60 min", desc: "The most telling session of the day: low-fuel qualifying runs and long race-pace stints." }
      ]},
      { day: "Saturday", sessions: [
        { name: "Practice 3", len: "60 min", desc: "Final tune-up before it counts." },
        { name: "Qualifying", len: "Q1 · Q2 · Q3", desc: "Three knockout rounds. The slowest five drop out in Q1 (18 min) and Q2 (15 min); the top ten fight for pole in Q3 (12 min). This sets the grid." }
      ]},
      { day: "Sunday", sessions: [
        { name: "Grand Prix", desc: "Around 90 minutes of racing. In the dry, drivers must use two different tyre compounds, so everyone stops at least once." }
      ]}
    ],
    sprint: [
      { day: "Friday", sessions: [
        { name: "Practice 1", len: "60 min", desc: "The only practice of the weekend. Get the setup wrong here and you live with it." },
        { name: "Sprint Qualifying", len: "SQ1 · SQ2 · SQ3", desc: "A shorter knockout (12, 10 and 8 minutes) that sets the Sprint grid." }
      ]},
      { day: "Saturday", sessions: [
        { name: "Sprint", desc: "About 30 minutes flat out with no mandatory stop. Points go to the top eight." },
        { name: "Qualifying", len: "Q1 · Q2 · Q3", desc: "Normal knockout qualifying sets the grid for Sunday." }
      ]},
      { day: "Sunday", sessions: [
        { name: "Grand Prix", desc: "Full distance, full points, same as any other weekend." }
      ]}
    ]
  };

  const weekendEl = document.getElementById("weekend-days");
  const switchBtns = document.querySelectorAll("[data-format]");

  function renderWeekend(format) {
    weekendEl.innerHTML = WEEKEND[format]
      .map((day, i) => `
        <article class="day">
          <header class="day-head">
            <span class="day-num">0${i + 1}</span>
            <h3 class="day-name">${day.day}</h3>
          </header>
          <ol class="sessions">
            ${day.sessions.map(s => `
              <li class="session ${s.name === "Grand Prix" ? "is-race" : ""} ${s.name === "Sprint" ? "is-sprint" : ""}">
                <div class="session-top">
                  <span class="session-name">${s.name}</span>
                  ${s.len ? `<span class="session-len">${s.len}</span>` : ""}
                </div>
                <p>${s.desc}</p>
              </li>`).join("")}
          </ol>
        </article>`)
      .join("");

    if (animate) {
      gsap.from(weekendEl.querySelectorAll(".session"), {
        y: 24, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power3.out", clearProps: "all"
      });
    }
  }

  switchBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      if (btn.getAttribute("aria-pressed") === "true") return;
      switchBtns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
      document.querySelector(".format-switch").dataset.active = btn.dataset.format;
      renderWeekend(btn.dataset.format);
    })
  );
  renderWeekend("standard");

  /* ---- Points chart ----------------------------------------------------- */
  const raceBars = document.getElementById("points-race");
  raceBars.innerHTML = D.points.race
    .map((p, i) => `
      <li class="pbar" style="--v:${p / 25}">
        <span class="pbar-pos">P${i + 1}</span>
        <span class="pbar-track"><span class="pbar-fill"></span></span>
        <span class="pbar-val">${p}</span>
      </li>`)
    .join("");

  document.getElementById("points-sprint").innerHTML = D.points.sprint
    .map((p, i) => `<li><span>P${i + 1}</span><b>${p}</b></li>`)
    .join("");

  /* ---- Team picker grid ------------------------------------------------- */
  const grid = document.getElementById("team-grid");
  D.teams.forEach(t => {
    const a = document.createElement("a");
    a.className = "team-card";
    a.href = `team.html?team=${t.id}`;
    a.setAttribute("style", teamStyle(t));
    a.innerHTML = `
      <span class="tc-stripe" aria-hidden="true"></span>
      <div class="tc-top">
        <span class="tc-pos">P${t.position}</span>
        <span class="tc-pts"><b>${t.points}</b> pts</span>
      </div>
      <div class="tc-media-slot"></div>
      <h3 class="tc-name">${t.name}</h3>
      <p class="tc-base">${t.base}</p>
      <ul class="tc-drivers">
        ${t.drivers.map(d => `<li><b>${d.number}</b><span>${d.last}</span></li>`).join("")}
      </ul>
      <span class="tc-go">Enter garage <span aria-hidden="true">→</span></span>`;

    a.querySelector(".tc-media-slot").replaceWith(
      media({
        src: t.car,
        alt: `${t.name} ${t.chassis}`,
        className: "tc-media",
        placeholder: `<span class="ph-livery"></span><span class="ph-chassis">${t.chassis}</span>`
      })
    );
    grid.appendChild(a);
  });

  /* ---- Count-ups -------------------------------------------------------- */
  function countUp(el, delay = 0) {
    const to = +el.dataset.to;
    if (!animate) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 1.4, delay, ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(o.v))
    });
  }

  /* ---- Animations ------------------------------------------------------- */
  if (!animate) {
    document.querySelectorAll("[data-to]").forEach(el => countUp(el));
    return;
  }

  // Hide hero pieces right away so nothing flashes before the reveal.
  gsap.set(".hero-title .line > span", { yPercent: 110 });
  gsap.set([".hero .eyebrow", ".hero-lede", ".hero-stats > *", ".tower-head"], { opacity: 0, y: 20 });
  gsap.set(".tower-row", { opacity: 0, x: 30 });
  gsap.set(".hero-year", { opacity: 0, xPercent: 6 });

  whenReady.then(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".hero-year", { opacity: 1, xPercent: 0, duration: 1.6, ease: "power3.out" }, 0)
      .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .to(".hero-title .line > span", { yPercent: 0, duration: 1, stagger: 0.09 }, 0.15)
      .to(".hero-lede", { opacity: 1, y: 0, duration: 0.7 }, 0.55)
      .to(".hero-stats > *", { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.65)
      .add(() => document.querySelectorAll(".hero-stats [data-to]").forEach((el, i) => countUp(el, i * 0.08)), 0.65)
      .to(".tower-head", { opacity: 1, y: 0, duration: 0.5 }, 0.35)
      .to(".tower-row", { opacity: 1, x: 0, duration: 0.6, stagger: 0.045, ease: "power3.out" }, 0.45);
  });

  // Hero parallax: the giant year drifts, the speed lines slide.
  gsap.to(".hero-year", {
    yPercent: 30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-streaks", {
    xPercent: -15, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  // Generic reveals
  gsap.utils.toArray("[data-reveal]").forEach(el => {
    gsap.from(el, {
      y: 48, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  // Section titles: slide up from a mask
  gsap.utils.toArray(".section-title .line > span").forEach(el => {
    gsap.from(el, {
      yPercent: 110, duration: 1, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  // Points bars grow in
  gsap.from(".pbar-fill", {
    scaleX: 0, duration: 1.1, stagger: 0.06, ease: "power3.out",
    scrollTrigger: { trigger: "#points-race", start: "top 80%", once: true }
  });
  gsap.from(".pbar-val", {
    opacity: 0, x: -10, duration: 0.5, stagger: 0.06, delay: 0.4,
    scrollTrigger: { trigger: "#points-race", start: "top 80%", once: true }
  });

  // Team cards
  gsap.set(".team-card", { y: 70, opacity: 0 });
  ScrollTrigger.batch(".team-card", {
    start: "top 92%", once: true,
    onEnter: els => gsap.to(els, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "power3.out", clearProps: "transform"
    })
  });

  // Fonts change line heights; re-measure trigger positions once loaded.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
