# Lights Out 2025

An interactive guide to the 2025 Formula 1 season: how the sport works, who was on the grid, and a start-lights reaction test.

**Live site:** [athyliaa.github.io/lights-out-2025](https://athyliaa.github.io/lights-out-2025/)

## Features

- **Lights-out intro.** Five start lights with synthesised beeps, then a car launching past as the page opens. Plays once per visit and can be skipped.
- **Reaction-time game.** Wait for the lights to go out and click. Your time is compared with an F1 driver's (~0.2s), jump starts are penalised, and your best time is saved in the browser.
- **One template, ten team pages.** `team.html?team=ferrari` builds a whole page from a single data file and takes on that team's colours:
  - full-screen team hero
  - a livery-stripe wipe into each driver
  - the car number scaling in behind the driver
  - stats counting up as you scroll
  - a teammate head-to-head at the end
- **Team picker** in the header on every page. It supports arrow-key navigation.
- **Responsive and accessible.** Works on phones, respects `prefers-reduced-motion`, and keeps keyboard focus visible.

## Built with

- Plain HTML, CSS and JavaScript, with no build step
- [GSAP](https://gsap.com/) + ScrollTrigger for animation
- Web Audio API for all sound effects, so there are no audio files

## Project structure

```
index.html        Home page: intro, the sport, race weekend, points, reaction game, team grid
team.html         Team template (filled in from the ?team= parameter)
css/style.css     All styles
js/data.js        Every team and driver: colours, results, 2025 stats
js/common.js      Header, team picker, image fallbacks, sound engine
js/intro.js       Lights-out intro
js/home.js        Home page sections and animations
js/reaction.js    Reaction-time game
js/team.js        Team page builder and scroll animations
images/           Car and driver images (see images/README.md), flags, icon
```

## Run locally

Open the folder in VS Code and start **Live Server** on `index.html`. Any static file server works too.

## Data

Statistics are the final 2025 standings after the Abu Dhabi Grand Prix (7 December 2025).

This is an unofficial fan project and is not affiliated with Formula 1, the FIA or any team. No official logos are used.
