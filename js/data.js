/* ==========================================================================
   F1 2025 — single source of truth
   Final classification after the Abu Dhabi GP (7 Dec 2025), 24 rounds.
   Driver points/wins/podiums are full-season Grand Prix totals (points include
   Sprints). Team points are Constructors' Championship totals.

   Cross-checks (all pass):
   - Each team's points = sum of its drivers' points scored for that team
   - Total GP podiums = 72 (24 races x 3), total wins = 24

   Images: drop files at the paths below. Missing files fall back to styled
   placeholders automatically, so nothing breaks while you collect them.
   ========================================================================== */

window.F1_DATA = {
  season: 2025,
  rounds: 24,
  sprints: 6,
  countries: 21,
  updated: "Final standings after the Abu Dhabi Grand Prix, 7 December 2025",

  teams: [
    {
      id: "mclaren",
      name: "McLaren",
      fullName: "McLaren Formula 1 Team",
      short: "McLaren",
      base: "Woking, United Kingdom",
      chassis: "MCL39",
      powerUnit: "Mercedes",
      position: 1,
      points: 833,
      result: "Constructors' Champions",
      colors: { primary: "#FF8000", secondary: "#47C7FC", ink: "#111111" },
      car: "images/teams/mclaren-car.png",
      note: "Constructors' title wrapped up in Singapore with six rounds to spare; Norris then took the Drivers' title by two points.",
      drivers: [
        {
          id: "norris", first: "Lando", last: "Norris", code: "NOR", number: 4,
          nationality: "British", country: "GBR", dob: "1999-11-13",
          points: 423, wins: 7, podiums: 18, position: 1,
          image: "images/drivers/norris.png",
          note: "2025 World Champion"
        },
        {
          id: "piastri", first: "Oscar", last: "Piastri", code: "PIA", number: 81,
          nationality: "Australian", country: "AUS", dob: "2001-04-06",
          points: 410, wins: 7, podiums: 16, position: 3,
          image: "images/drivers/piastri.png"
        }
      ]
    },
    {
      id: "mercedes",
      name: "Mercedes",
      fullName: "Mercedes-AMG Petronas F1 Team",
      short: "Mercedes",
      base: "Brackley, United Kingdom",
      chassis: "W16",
      powerUnit: "Mercedes",
      position: 2,
      points: 469,
      result: "2nd in the Constructors'",
      colors: { primary: "#27F4D2", secondary: "#C8CCCE", ink: "#061512" },
      car: "images/teams/mercedes-car.png",
      drivers: [
        {
          id: "russell", first: "George", last: "Russell", code: "RUS", number: 63,
          nationality: "British", country: "GBR", dob: "1998-02-15",
          points: 319, wins: 2, podiums: 9, position: 4,
          image: "images/drivers/russell.png"
        },
        {
          id: "antonelli", first: "Kimi", last: "Antonelli", code: "ANT", number: 12,
          nationality: "Italian", country: "ITA", dob: "2006-08-25",
          points: 150, wins: 0, podiums: 3, position: 7,
          image: "images/drivers/antonelli.png",
          note: "Rookie season"
        }
      ]
    },
    {
      id: "red-bull",
      name: "Red Bull Racing",
      fullName: "Oracle Red Bull Racing",
      short: "Red Bull",
      base: "Milton Keynes, United Kingdom",
      chassis: "RB21",
      powerUnit: "Honda RBPT",
      position: 3,
      points: 451,
      result: "3rd in the Constructors'",
      colors: { primary: "#3671C6", secondary: "#FFC906", ink: "#FFFFFF" },
      car: "images/teams/red-bull-car.png",
      note: "Liam Lawson started the season here (rounds 1–2), then swapped seats with Yuki Tsunoda from the Japanese GP onward.",
      drivers: [
        {
          id: "verstappen", first: "Max", last: "Verstappen", code: "VER", number: 1,
          nationality: "Dutch", country: "NED", dob: "1997-09-30",
          points: 421, wins: 8, podiums: 15, position: 2,
          image: "images/drivers/verstappen.png",
          note: "Most wins of 2025; missed the title by two points"
        },
        {
          id: "tsunoda", first: "Yuki", last: "Tsunoda", code: "TSU", number: 22,
          nationality: "Japanese", country: "JPN", dob: "2000-05-11",
          points: 33, wins: 0, podiums: 0, position: 17,
          image: "images/drivers/tsunoda.png",
          note: "Joined from Racing Bulls at round 3. Season total: 30 pts for Red Bull, 3 for Racing Bulls."
        }
      ]
    },
    {
      id: "ferrari",
      name: "Ferrari",
      fullName: "Scuderia Ferrari HP",
      short: "Ferrari",
      base: "Maranello, Italy",
      chassis: "SF-25",
      powerUnit: "Ferrari",
      position: 4,
      points: 398,
      result: "4th in the Constructors'",
      colors: { primary: "#E8002D", secondary: "#FFF200", ink: "#FFFFFF" },
      car: "images/teams/ferrari-car.png",
      note: "No Grand Prix wins in 2025. Hamilton won the China Sprint in his first season in red.",
      drivers: [
        {
          id: "leclerc", first: "Charles", last: "Leclerc", code: "LEC", number: 16,
          nationality: "Monegasque", country: "MON", dob: "1997-10-16",
          points: 242, wins: 0, podiums: 7, position: 5,
          image: "images/drivers/leclerc.png"
        },
        {
          id: "hamilton", first: "Lewis", last: "Hamilton", code: "HAM", number: 44,
          nationality: "British", country: "GBR", dob: "1985-01-07",
          points: 156, wins: 0, podiums: 0, position: 6,
          image: "images/drivers/hamilton.png",
          note: "First season at Ferrari"
        }
      ]
    },
    {
      id: "williams",
      name: "Williams",
      fullName: "Atlassian Williams Racing",
      short: "Williams",
      base: "Grove, United Kingdom",
      chassis: "FW47",
      powerUnit: "Mercedes",
      position: 5,
      points: 137,
      result: "5th in the Constructors'",
      colors: { primary: "#1868DB", secondary: "#64C4FF", ink: "#FFFFFF" },
      car: "images/teams/williams-car.png",
      drivers: [
        {
          id: "albon", first: "Alexander", last: "Albon", code: "ALB", number: 23,
          nationality: "Thai", country: "THA", dob: "1996-03-23",
          points: 73, wins: 0, podiums: 0, position: 8,
          image: "images/drivers/albon.png"
        },
        {
          id: "sainz", first: "Carlos", last: "Sainz", code: "SAI", number: 55,
          nationality: "Spanish", country: "ESP", dob: "1994-09-01",
          points: 64, wins: 0, podiums: 2, position: 9,
          image: "images/drivers/sainz.png",
          note: "Podiums in Baku and Qatar"
        }
      ]
    },
    {
      id: "racing-bulls",
      name: "Racing Bulls",
      fullName: "Visa Cash App Racing Bulls",
      short: "Racing Bulls",
      base: "Faenza, Italy",
      chassis: "VCARB 02",
      powerUnit: "Honda RBPT",
      position: 6,
      points: 92,
      result: "6th in the Constructors'",
      colors: { primary: "#6692FF", secondary: "#FFFFFF", ink: "#0B1230" },
      car: "images/teams/racing-bulls-car.png",
      note: "Yuki Tsunoda raced here for rounds 1–2 before moving up to Red Bull; Liam Lawson came the other way.",
      drivers: [
        {
          id: "hadjar", first: "Isack", last: "Hadjar", code: "HAD", number: 6,
          nationality: "French", country: "FRA", dob: "2004-09-28",
          points: 51, wins: 0, podiums: 1, position: 12,
          image: "images/drivers/hadjar.png",
          note: "Rookie season, maiden podium at Zandvoort"
        },
        {
          id: "lawson", first: "Liam", last: "Lawson", code: "LAW", number: 30,
          nationality: "New Zealander", country: "NZL", dob: "2002-02-11",
          points: 38, wins: 0, podiums: 0, position: 14,
          image: "images/drivers/lawson.png",
          note: "Started the season at Red Bull (rounds 1–2, no points). All 38 pts scored for Racing Bulls."
        }
      ]
    },
    {
      id: "aston-martin",
      name: "Aston Martin",
      fullName: "Aston Martin Aramco F1 Team",
      short: "Aston Martin",
      base: "Silverstone, United Kingdom",
      chassis: "AMR25",
      powerUnit: "Mercedes",
      position: 7,
      points: 89,
      result: "7th in the Constructors'",
      colors: { primary: "#229971", secondary: "#CEDC00", ink: "#FFFFFF" },
      car: "images/teams/aston-martin-car.png",
      drivers: [
        {
          id: "alonso", first: "Fernando", last: "Alonso", code: "ALO", number: 14,
          nationality: "Spanish", country: "ESP", dob: "1981-07-29",
          points: 56, wins: 0, podiums: 0, position: 10,
          image: "images/drivers/alonso.png"
        },
        {
          id: "stroll", first: "Lance", last: "Stroll", code: "STR", number: 18,
          nationality: "Canadian", country: "CAN", dob: "1998-10-29",
          points: 33, wins: 0, podiums: 0, position: 16,
          image: "images/drivers/stroll.png"
        }
      ]
    },
    {
      id: "haas",
      name: "Haas",
      fullName: "MoneyGram Haas F1 Team",
      short: "Haas",
      base: "Kannapolis, United States",
      chassis: "VF-25",
      powerUnit: "Ferrari",
      position: 8,
      points: 79,
      result: "8th in the Constructors'",
      colors: { primary: "#B6BABD", secondary: "#E10600", ink: "#111111" },
      car: "images/teams/haas-car.png",
      drivers: [
        {
          id: "ocon", first: "Esteban", last: "Ocon", code: "OCO", number: 31,
          nationality: "French", country: "FRA", dob: "1996-09-17",
          points: 38, wins: 0, podiums: 0, position: 15,
          image: "images/drivers/ocon.png"
        },
        {
          id: "bearman", first: "Oliver", last: "Bearman", code: "BEA", number: 87,
          nationality: "British", country: "GBR", dob: "2005-05-08",
          points: 41, wins: 0, podiums: 0, position: 13,
          image: "images/drivers/bearman.png",
          note: "Rookie season"
        }
      ]
    },
    {
      id: "sauber",
      name: "Kick Sauber",
      fullName: "Stake F1 Team Kick Sauber",
      short: "Sauber",
      base: "Hinwil, Switzerland",
      chassis: "C45",
      powerUnit: "Ferrari",
      position: 9,
      points: 70,
      result: "9th in the Constructors'",
      colors: { primary: "#52E252", secondary: "#F2F2F2", ink: "#08150A" },
      car: "images/teams/sauber-car.png",
      drivers: [
        {
          id: "hulkenberg", first: "Nico", last: "Hülkenberg", code: "HUL", number: 27,
          nationality: "German", country: "GER", dob: "1987-08-19",
          points: 51, wins: 0, podiums: 1, position: 11,
          image: "images/drivers/hulkenberg.png",
          note: "First career podium at Silverstone, at his 239th start"
        },
        {
          id: "bortoleto", first: "Gabriel", last: "Bortoleto", code: "BOR", number: 5,
          nationality: "Brazilian", country: "BRA", dob: "2004-10-14",
          points: 19, wins: 0, podiums: 0, position: 19,
          image: "images/drivers/bortoleto.png",
          note: "Rookie season"
        }
      ]
    },
    {
      id: "alpine",
      name: "Alpine",
      fullName: "BWT Alpine F1 Team",
      short: "Alpine",
      base: "Enstone, United Kingdom",
      chassis: "A525",
      powerUnit: "Renault",
      position: 10,
      points: 22,
      result: "10th in the Constructors'",
      colors: { primary: "#FF87BC", secondary: "#0093CC", ink: "#1A0712" },
      car: "images/teams/alpine-car.png",
      note: "Jack Doohan raced the first six rounds; Franco Colapinto took the seat from Imola (round 7) onward.",
      drivers: [
        {
          id: "gasly", first: "Pierre", last: "Gasly", code: "GAS", number: 10,
          nationality: "French", country: "FRA", dob: "1996-02-07",
          points: 22, wins: 0, podiums: 0, position: 18,
          image: "images/drivers/gasly.png"
        },
        {
          id: "colapinto", first: "Franco", last: "Colapinto", code: "COL", number: 43,
          nationality: "Argentine", country: "ARG", dob: "2003-05-27",
          points: 0, wins: 0, podiums: 0, position: 20,
          image: "images/drivers/colapinto.png",
          note: "Replaced Jack Doohan (#7, 0 pts) from round 7"
        }
      ]
    }
  ],

  /* Points for P1–P10 in a Grand Prix, P1–P8 in a Sprint.
     The fastest-lap bonus point was dropped from 2025. */
  points: {
    race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: [8, 7, 6, 5, 4, 3, 2, 1]
  }
};

/* Country a driver races under -> display name + flag file (images/flags/<flag>.svg) */
window.F1_DATA.countries = {
  GBR: { name: "Great Britain", flag: "gb" },
  AUS: { name: "Australia", flag: "au" },
  NED: { name: "Netherlands", flag: "nl" },
  JPN: { name: "Japan", flag: "jp" },
  NZL: { name: "New Zealand", flag: "nz" },
  FRA: { name: "France", flag: "fr" },
  MON: { name: "Monaco", flag: "mc" },
  ITA: { name: "Italy", flag: "it" },
  THA: { name: "Thailand", flag: "th" },
  ESP: { name: "Spain", flag: "es" },
  CAN: { name: "Canada", flag: "ca" },
  GER: { name: "Germany", flag: "de" },
  BRA: { name: "Brazil", flag: "br" },
  ARG: { name: "Argentina", flag: "ar" }
};

/* ---- helpers ---------------------------------------------------------- */
window.F1 = {
  data: window.F1_DATA,

  country(code) {
    return this.data.countries[code] || { name: code, flag: null };
  },

  getTeam(id) {
    return this.data.teams.find(t => t.id === id) || null;
  },

  /* All drivers, flattened, each with a reference to its team. */
  drivers() {
    return this.data.teams.flatMap(t => t.drivers.map(d => ({ ...d, team: t })));
  },

  /* Final Drivers' Championship order. */
  standings() {
    return this.drivers().sort((a, b) => a.position - b.position);
  },

  age(dob, at = new Date()) {
    const b = new Date(dob + "T00:00:00");
    let a = at.getFullYear() - b.getFullYear();
    const m = at.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && at.getDate() < b.getDate())) a--;
    return a;
  }
};
