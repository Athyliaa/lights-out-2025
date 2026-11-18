/* ==========================================================================
   Team template — reads ?team=<id> and builds the whole page from js/data.js.
   Flow: full-screen team hero → driver 1 → driver 2 → next team.
   Each driver: livery-stripe wipe on entry, then a pinned, scroll-scrubbed
   build: car number scales in, driver rises, name, stats count up.
   ========================================================================== */
(function () {
  const { reduce, hasGsap, media, teamVars, teamStyle } = window.F1UI;
  const root = document.getElementById("team-root");
  const id = new URLSearchParams(location.search).get("team");
  const team = F1.getTeam(id);

  if (!team) {
    root.innerHTML = `
      <section class="team-missing wrap">
        <p class="eyebrow">Wrong garage</p>
        <h1 class="display">Team not found.</h1>
        <p>Pick a team from the strip above, or go back to the full grid.</p>
        <a class="btn" href="index.html#teams">All teams</a>
      </section>`;
    return;
  }

  /* ---- Theme ------------------------------------------------------------ */
  teamVars(team);
  teamVars(team, document.documentElement);
  document.body.dataset.team = team.id;
  document.title = `${team.name} · Lights Out 2025`;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", team.colors.primary);

  const teams = F1.data.teams;
  const next = teams[(teams.indexOf(team) + 1) % teams.length];
  const pad2 = n => String(n).padStart(2, "0");

  /* ---- Hero ------------------------------------------------------------- */
  // Short names on one line; longer ones break before the last word
  // ("Red Bull / Racing", "Aston / Martin", "Kick / Sauber").
  const words = team.name.split(" ");
  const lines = team.name.length > 9 && words.length > 1
    ? [words.slice(0, -1).join(" "), words[words.length - 1]]
    : [team.name];
  const nameLines = lines.map(w => `<span class="line"><span>${w}</span></span>`).join("");

  root.innerHTML = `
    <section class="team-hero" id="top">
      <div class="th-bg" aria-hidden="true">
        <span class="th-giant">${team.short}</span>
        <span class="th-stripes"></span>
        <span class="th-ground"></span>
      </div>

      <div class="th-inner-wrap">
        <div class="th-inner wrap">
          <p class="eyebrow th-eyebrow">2025 season · ${team.result}</p>
          <h1 class="th-name display">${nameLines}</h1>
          <p class="th-full">${team.fullName}</p>

          <dl class="th-meta">
            <div><dt>Base</dt><dd>${team.base}</dd></div>
            <div><dt>2025 points</dt><dd><b>${team.points}</b> · P${team.position} of 10</dd></div>
            <div><dt>Car</dt><dd>${team.chassis}</dd></div>
            <div><dt>Power unit</dt><dd>${team.powerUnit}</dd></div>
          </dl>

          ${team.note ? `<p class="th-note">${team.note}</p>` : ""}
        </div>
      </div>

      <div class="th-car-wrap"><div class="th-car-slot"></div></div>

      <a class="th-cue" href="#driver-${team.drivers[0].id}">
        Meet the drivers <span aria-hidden="true">↓</span>
      </a>
    </section>

    ${team.drivers.map(driverHTML).join("")}

    ${headToHeadHTML(team.drivers[0], team.drivers[1])}

    <section class="next-team" style="${teamStyle(next)}">
      <a class="nt-link" href="team.html?team=${next.id}">
        <span class="eyebrow nt-eyebrow">Next team · P${next.position}</span>
        <span class="nt-name display">${next.name}</span>
        <span class="nt-arrow" aria-hidden="true">→</span>
      </a>
      <a class="nt-all" href="index.html#teams">Back to all teams</a>
    </section>`;

  root.querySelector(".th-car-slot").replaceWith(
    media({
      src: team.car,
      alt: `${team.name} ${team.chassis}`,
      className: "th-car",
      placeholder: `<span class="ph-livery"></span><span class="ph-chassis">${team.chassis}</span>`
    })
  );
  // Card-style placeholders read --c/--c2; feed them the team colours.
  root.querySelector(".th-car").setAttribute("style", teamStyle(team));

  team.drivers.forEach(d => {
    const slot = root.querySelector(`#driver-${d.id} .driver-media-slot`);
    slot.replaceWith(
      media({
        src: d.image,
        alt: `${d.first} ${d.last}`,
        className: "driver-media",
        placeholder: `<span class="ph-driver"><span class="ph-head"></span><span class="ph-body"></span><span class="ph-code">${d.code}</span></span>`
      })
    );
  });

  function headToHeadHTML(a, b) {
    const rows = [["Points", "points"], ["Wins", "wins"], ["Podiums", "podiums"]].map(([label, key]) => {
      const va = a[key], vb = b[key], max = Math.max(va, vb) || 1;
      return `
        <div class="h2h-row">
          <span class="h2h-val ${va > vb ? "is-ahead" : ""}" data-count="${va}">${va}</span>
          <span class="h2h-bar is-a"><i style="--v:${va / max}"></i></span>
          <span class="h2h-label">${label}</span>
          <span class="h2h-bar is-b"><i style="--v:${vb / max}"></i></span>
          <span class="h2h-val ${vb > va ? "is-ahead" : ""}" data-count="${vb}">${vb}</span>
        </div>`;
    }).join("");

    const diff = Math.abs(a.points - b.points);
    const [hi, lo] = a.points >= b.points ? [a, b] : [b, a];
    const verdict = diff === 0
      ? `${a.last} and ${b.last} finished level on points.`
      : `${hi.last} outscored ${lo.last} by <b>${diff}</b> point${diff === 1 ? "" : "s"}.`;

    return `
      <section class="h2h" aria-labelledby="h2h-title">
        <div class="wrap">
          <p class="eyebrow">Teammate head-to-head · 2025</p>
          <h2 class="h2h-title display" id="h2h-title">
            <span class="h2h-name is-a"><small>#${a.number}</small>${a.last}</span>
            <span class="h2h-vs">vs</span>
            <span class="h2h-name is-b"><small>#${b.number}</small>${b.last}</span>
          </h2>
          <div class="h2h-rows">${rows}</div>
          <p class="h2h-verdict">${verdict}</p>
          <p class="h2h-foot">Full-season totals. Points include Sprints${team.note ? ", and mid-season swaps are explained at the top of the page" : ""}.</p>
        </div>
      </section>`;
  }

  // Flag chip; if the flag file is missing it falls back to the 3-letter code.
  function flagChip(code) {
    const c = F1.country(code);
    if (!c.flag) return `<span class="chip">${code}</span>`;
    return `<span class="chip chip-flag" title="${c.name}">` +
      `<img src="images/flags/${c.flag}.svg" alt="${c.name}" width="27" height="18" ` +
      `onerror="this.parentNode.textContent='${code}';this.parentNode.classList.remove('chip-flag')"></span>`;
  }

  function driverHTML(d, i) {
    const age = F1.age(d.dob);
    return `
      <section class="driver ${i % 2 ? "is-flip" : ""}" id="driver-${d.id}" aria-label="${d.first} ${d.last}">
        <div class="driver-bg" aria-hidden="true"></div>
        <div class="driver-num" aria-hidden="true"><span>${d.number}</span></div>
        <div class="driver-media-slot"></div>

        <div class="driver-copy">
          <p class="eyebrow driver-eyebrow">Driver ${pad2(i + 1)} · P${d.position} in the championship</p>
          <h2 class="driver-name display" style="--len:${Math.max(d.last.length, 5)}">
            <span class="line"><span class="driver-first">${d.first}</span></span>
            <span class="line"><span>${d.last}</span></span>
          </h2>
          <p class="driver-tag">
            <span class="chip">#${d.number}</span><span class="chip">${d.code}</span>${flagChip(d.country)}
          </p>
          ${d.note ? `<p class="driver-note">${d.note}</p>` : ""}

          <dl class="driver-stats">
            <div class="stat"><dt>Age</dt><dd data-count="${age}">${age}</dd></div>
            <div class="stat stat-text"><dt>Representing</dt><dd>${F1.country(d.country).name}</dd></div>
            <div class="stat stat-hl"><dt>2025 points</dt><dd data-count="${d.points}">${d.points}</dd></div>
            <div class="stat"><dt>Wins</dt><dd data-count="${d.wins}">${d.wins}</dd></div>
            <div class="stat"><dt>Podiums</dt><dd data-count="${d.podiums}">${d.podiums}</dd></div>
          </dl>
        </div>
      </section>`;
  }

  /* ---- Animation -------------------------------------------------------- */
  if (!hasGsap || reduce) return;

  ScrollTrigger.config({ ignoreMobileResize: true });

  // Hero entrance
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".th-bg", { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", duration: 1.1, ease: "power4.inOut" })
    .from(".th-name .line > span", { yPercent: 110, duration: 1, stagger: 0.08 }, 0.45)
    .from([".th-eyebrow", ".th-full", ".th-meta > div", ".th-note"].flatMap(s => [...document.querySelectorAll(s)]),
      { opacity: 0, y: 20, duration: 0.6, stagger: 0.05 }, 0.7)
    .from(".th-car", { xPercent: 45, opacity: 0, duration: 1.3, ease: "power3.out" }, 0.55)
    .from(".th-giant", { xPercent: 10, opacity: 0, duration: 1.6, ease: "power3.out" }, 0.3)
    .from(".th-cue", { opacity: 0, y: 10, duration: 0.6 }, 1.3);

  // Hero parallax (on wrappers so it never fights the entrance tweens)
  const heroScrub = { trigger: ".team-hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".th-car-wrap", { xPercent: -14, yPercent: 10, ease: "none", scrollTrigger: heroScrub });
  gsap.to(".th-giant", { xPercent: -18, ease: "none", scrollTrigger: { ...heroScrub } });
  gsap.to(".th-inner-wrap", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { ...heroScrub } });

  // Drivers
  root.querySelectorAll(".driver").forEach(sec => {
    const q = gsap.utils.selector(sec);

    /* 1. Livery-stripe wipe: a fixed overlay of team-colour bands sweeps the
          screen while the section scrolls into place. */
    const wipe = document.createElement("div");
    wipe.className = "wipe";
    wipe.setAttribute("aria-hidden", "true");
    wipe.innerHTML = `<div class="wipe-track"><span class="w-lead"></span><span class="w-main"></span><span class="w-tail"></span></div>`;
    document.body.appendChild(wipe);
    const track = wipe.firstElementChild;

    const unit = () => Math.max(innerWidth, innerHeight);  // bands are sized in this unit (see CSS --u)
    gsap.fromTo(track,
      { x: () => -2.8 * unit() },
      {
        x: () => innerWidth + 0.4 * unit(),
        ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top 85%", end: "top top", scrub: 0.4, invalidateOnRefresh: true,
          onToggle: self => wipe.classList.toggle("is-active", self.isActive)
        }
      });

    /* 2. Pinned build */
    const counters = q("[data-count]");
    const proxy = counters.map(() => ({ v: 0 }));

    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: "top top", end: "+=150%", pin: true, scrub: 0.8, anticipatePin: 1 }
    });

    tl.fromTo(q(".driver-bg"), { opacity: 0.3 }, { opacity: 1, duration: 0.8 }, 0)
      .fromTo(q(".driver-num span"), { scale: 0.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, ease: "power3.out" }, 0)
      .fromTo(q(".driver-media"), { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out" }, 0.3)
      .fromTo(q(".driver-name .line > span"), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }, 0.55)
      .fromTo(q(".driver-eyebrow, .driver-tag, .driver-note"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.75)
      .fromTo(q(".stat"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 1.05);

    counters.forEach((el, i) => {
      el.textContent = "0";
      tl.to(proxy[i], {
        v: +el.dataset.count, duration: 1.1, ease: "power1.out",
        onUpdate: () => (el.textContent = Math.round(proxy[i].v))
      }, 1.15 + i * 0.06);
    });

    tl.to({}, { duration: 0.6 }); // hold the finished card on screen for a beat
  });

  // Head-to-head: bars grow out from the centre, numbers count up
  const h2h = root.querySelector(".h2h");
  if (h2h) {
    const st = { trigger: h2h, start: "top 75%", once: true };
    gsap.from(h2h.querySelectorAll(".h2h-title > *, .h2h .eyebrow"), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", scrollTrigger: st
    });
    gsap.from(h2h.querySelectorAll(".h2h-bar i"), {
      scaleX: 0, duration: 1.1, stagger: 0.08, delay: 0.25, ease: "power3.out", scrollTrigger: { ...st }
    });
    h2h.querySelectorAll(".h2h-val[data-count]").forEach(el => {
      const o = { v: 0 }, to = +el.dataset.count;
      el.textContent = "0";
      gsap.to(o, {
        v: to, duration: 1.1, delay: 0.25, ease: "power2.out",
        onUpdate: () => (el.textContent = Math.round(o.v)),
        scrollTrigger: { ...st }
      });
    });
  }

  // Next-team banner
  gsap.from(".nt-name", {
    yPercent: 40, opacity: 0, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".next-team", start: "top 85%", once: true }
  });

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
