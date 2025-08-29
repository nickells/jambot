console.log("hey");
const reverb = new Tone.Reverb({
  decay: 2.8,
  preDelay: 0.02,
  wet: 0.25,
}).toDestination();
const chorus = new Tone.Chorus({
  frequency: 1.6,
  delayTime: 0.25,
  depth: 0.15,
  wet: 0.15,
}).start();
const synth = new Tone.MonoSynth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.01, decay: 0.28, sustain: 0.6, release: 0.8 },
  filter: { type: "lowpass", Q: 1 },
  filterEnvelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.2,
    release: 0.6,
    baseFrequency: 150,
    octaves: 3,
  },
  portamento: 0.01,
}).chain(chorus, reverb);

// Optional: piano sampler rooted at Gb4 (enharmonic F#4). Will transpose for other notes.
let samplerLoaded = false;
let sampler;
// Boost piano loudness a bit via a dedicated gain stage
const pianoGain = new Tone.Gain(18).chain(chorus, reverb);
try {
  sampler = new Tone.Sampler({
    urls: {
      //   Gb4: "Gb4.aiff",
      C3: "C3.aiff",
    },
    onload: () => {
      console.log("loaded");
      samplerLoaded = true;
    },
  }).connect(pianoGain);
} catch (e) {
  samplerLoaded = false;
}

// Helper to play a single note with either the sampler (if ready) or the synth
function playNote(note, duration, time, velocity) {
  if (samplerLoaded && sampler) {
    sampler.triggerAttackRelease(note, duration, time, velocity);
  } else {
    synth.triggerAttackRelease(note, duration, time, velocity);
  }
}

//play a middle 'C' for the duration of an 8th note
const tempos = ["an upbeat", "a slow", "a midtempo", "a fast"];

// Segment into graphemes so multi-codepoint emojis (VS16, ZWJ) don't split
const _seg =
  window.Intl && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
const loader = _seg
  ? Array.from(
      _seg.segment("🍚🍤🌭🍗🫑🧅🥬🍅🥒🧄🌿🥣🫒🧈🧂🌶️🥘"),
      (s) => s.segment
    )
  : Array.from("🍚🍤🌭🍗🫑🧅🥬🍅🥒🧄🌿🥣🫒🧈🧂🌶️🥘");
let loaderIndex = 0;
let loaderId = null;
const startLoader = () => {
  const results = document.getElementById("results");
  if (loaderId) {
    clearInterval(loaderId);
  }
  results.innerHTML = `<span class="loader">${loader[loaderIndex]}</span>`;

  loaderIndex = (loaderIndex + 1) % loader.length;
  loaderId = setInterval(() => {
    results.innerHTML = `<span class="loader">${loader[loaderIndex]}</span>`;
    loaderIndex = (loaderIndex + 1) % loader.length;
  }, 250);
};

const stopLoader = () => {
  if (loaderId) {
    clearInterval(loaderId);
    loaderId = null;
  }
};

const genres = [
  "rock",
  "pop",
  "hip-hop",
  "edm",
  "country",
  "jazz",
  "bossa nova",
  "latin",
  "blues",
  "funk",
  "soul",
  "disco",
  "reggae",
  "r&b",
  "soul",
  "lo-fi",
  "psychedelic",
  "ambient",
  "experimental",
];

const abstractions = [
  "bliss",
  "corn",
  "a field",
  "a dream",
  "a sunset",
  "a sunrise",
  "a beach",
  "a forest",
  "a city",
  "a mountain",
  "a lake",
  "a river",
  "a stream",
  "a waterfall",
  "a cave",
  "a desert",
  "a thunderstorm",
  "a snowstorm",
  "rain",
  "a candlelit room",
  "a crowded market",
  "a quiet library",
  "a neon alley",
  "an open highway",
  "a campfire",
  "a whispered secret",
  "nostalgia",
  "melancholy",
  "euphoria",
  "serenity",
  "chaos",
  "a heartbeat",
  "a skyline",
  "a cathedral",
  "a monsoon",
  "a coral reef",
  "a snowfall",
  "a heatwave",
  "a carnival",
  "a lighthouse",
  "a train ride",
  "a space station",
  "a starfield",
  "a comet",
  "a moonrise",
  "a tidal pool",
  "a canyon",
  "a vineyard",
  "a temple",
  "a market at dusk",
  "a rainy window",
  "a flickering neon sign",
  "a midnight drive",
  "a desert highway",
  "a lantern-lit street",
  "a forgotten attic",
  "a vintage arcade",
  "a coastal cliff",
  "a foggy bridge",
  "a hidden garden",
  "a winter cabin",
  "a summer meadow",
  "a stormy sea",
  "an empty theater",
  "a vinyl crackle",
  "a polaroid",
  "a kaleidoscope",
  "a labyrinth",
  "a time machine",
  "a mosaic",
  "a ferris wheel",
  "a daydream",
  "a skyline at dawn",
  "a mirage",
  "a supernova",
  "a sunbeam",
  "a thunderhead",
  "an eclipse",
  "a night market",
  "a tea house",
  "a paper lantern",
  "a koi pond",
  "a bamboo grove",
];

const keys = [
  "A",
  "B flat",
  "B",
  "C",
  "C sharp",
  "D flat",
  "D",
  "D sharp",
  "E flat",
  "E",
  "F",
  "F sharp",
  "G flat",
  "G",
  "G sharp",
  "A flat",
];

// a clone of keys but with midi values
const keysMidi = [
  69, 70, 71, 72, 73, 73, 74, 75, 75, 76, 77, 78, 78, 79, 79, 80,
].map((midi) => midi - 24);

const modesTones = [
  [2, 2, 1, 2, 2, 2, 1], // major (Ionian)
  [2, 1, 2, 2, 1, 2, 2], // minor (Aeolian)
  [2, 2, 1, 2, 2, 1, 2], // mixolydian
  [2, 1, 2, 2, 2, 1, 2], // dorian
  [1, 2, 2, 2, 1, 2, 2], // phrygian
  [2, 2, 2, 1, 2, 2, 1], // lydian
  [2, 1, 2, 2, 1, 3, 1], // harmonic minor
  [2, 1, 2, 2, 2, 2, 1], // melodic minor (ascending)
  [1, 3, 1, 2, 1, 2, 2], // phrygian dominant
];

const modes = [
  "major",
  "minor",
  "mixolydian",
  "dorian",
  "phrygian",
  "lydian",
  "harmonic minor",
  "melodic minor",
  "phrygian dominant",
];

const announcements = [
  "Bing bong!",
  "Uh oh!",
  "Here we go!",
  "Let's do this!",
  "Ready?",
  "Beep boop!",
  "Ding dong!",
  "Bing bang!",
  "Dingaling!",
  "Here's your next one.",
  "Try this.",
  "Another for you.",
  "Next up.",
  "Give this a go.",
  "See what you think.",
  "Here's one.",
  "Let's try this.",
  "Check this out.",
  "One more for you.",
];

let voice;
let activeSequence;
let currentUtterance = null;
let currentUtteranceId = 0;
let lastSpeechText = "";
let lastTechnicalKey = null;
let lastTechnicalMode = null;
let pendingStartTimer = null;
let voicesReadyPromise = null;
const SKIP_LOADER = new URLSearchParams(window.location.search).has(
  "skipLoader"
);

// Wait until browser voices are loaded, then return them
function waitForVoices() {
  return new Promise((resolve) => {
    const speechSynthesis = window.speechSynthesis;
    const voices = speechSynthesis.getVoices();
    console.log(voices);
    if (voices && voices.length) {
      resolve(voices);
      return;
    }
    const handler = () => {
      const loaded = speechSynthesis.getVoices();
      if (loaded && loaded.length) {
        speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(loaded);
      }
    };
    speechSynthesis.addEventListener("voiceschanged", handler);
  });
}

const pick = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const playScale = (key, mode) => {
  const baseMidi = keysMidi[keys.indexOf(key)];
  const intervals = modesTones[modes.indexOf(mode)];
  if (baseMidi == null || !intervals) return;

  // Build cumulative semitone offsets, including the octave
  const semitoneOffsets = [0];
  intervals.reduce((sum, step) => {
    const next = sum + step;
    semitoneOffsets.push(next);
    return next;
  }, 0);
  if (semitoneOffsets[semitoneOffsets.length - 1] !== 12) {
    semitoneOffsets.push(12);
  }

  const scaleMidis = semitoneOffsets.map((offset) => baseMidi + offset);
  const scaleNotes = scaleMidis.map((midi) =>
    Tone.Frequency(midi, "midi").toNote()
  );

  // Stop and dispose any prior sequence
  if (activeSequence) {
    activeSequence.stop();
    activeSequence.dispose();
    activeSequence = undefined;
  }
  // necessary for Safari
  synth.context.resume();
  activeSequence = new Tone.Sequence(
    (time, note) => {
      const velocity = 0.9 + (Math.random() * 0.2 - 0.1);
      playNote(note, "8n", time, Math.max(0.75, Math.min(1.0, velocity)));
    },
    scaleNotes,
    "8n"
  );
  activeSequence.loop = 0; // play once
  // Schedule at the next Transport tick so it plays even if Transport is already running
  activeSequence.start("+0");
  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }
};

const technicalJam = () => {
  const tempo = pick(tempos);
  const genre = pick(genres);
  const key = pick(keys);
  const mode = pick(modes);
  const announcement = pick(announcements);

  const speech = `${announcement} The new jam is ${tempo}, ${genre} song, in ${key} ${mode}!`;
  document.getElementById("results").innerHTML = speech;
  lastSpeechText = speech;
  lastTechnicalKey = key;
  lastTechnicalMode = mode;
  // Show replay-scale button for technical jams
  const replayScaleButton = document.getElementById("replay-scale");
  if (replayScaleButton) replayScaleButton.classList.remove("vis-hidden");

  // web speech synthesis
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(speech);
  utterance.voice = voice;
  utterance.rate = 0.5;

  // Capture the current generation so only the latest click can trigger the scale
  const utteranceId = currentUtteranceId;
  currentUtterance = utterance;
  utterance.onend = () => {
    if (utteranceId === currentUtteranceId) {
      playScale(key, mode);
    }
  };

  speechSynthesis.speak(utterance);
};

const abstractJam = () => {
  const speech = `${pick(announcements)} Write a jam that feels like ${pick(
    abstractions
  )}!`;
  document.getElementById("results").innerHTML = speech;
  // Hide replay-scale button for abstract jams
  const replayScaleButton = document.getElementById("replay-scale");
  if (replayScaleButton) replayScaleButton.classList.add("vis-hidden");

  const speechSynthesis = window.speechSynthesis;
  // Cancel any current speech and sequence as this is a new click path
  speechSynthesis.cancel();
  if (activeSequence) {
    activeSequence.stop();
    activeSequence.dispose();
    activeSequence = undefined;
  }

  const utterance = new SpeechSynthesisUtterance(speech);
  utterance.voice = voice;
  utterance.rate = 0.5;
  speechSynthesis.speak(utterance);
  lastSpeechText = speech;
};

async function startJam(kind) {
  if (!SKIP_LOADER) startLoader();

  // ensure AudioContext is started by user gesture
  await Tone.start();
  // Invalidate any prior utterance id and cancel ongoing speech/sequence
  currentUtteranceId++;
  const thisClickId = currentUtteranceId;
  const speechSynthesis = window.speechSynthesis;
  speechSynthesis.cancel();
  if (activeSequence) {
    activeSequence.stop();
    activeSequence.dispose();
    activeSequence = undefined;
  }
  // Cancel any previously scheduled start
  if (pendingStartTimer) {
    clearTimeout(pendingStartTimer);
    pendingStartTimer = null;
  }

  // Play click track immediately (do not await finish)
  if (!SKIP_LOADER) {
    try {
      const click = new Audio("clickclack.mp3");
      click.volume = 0.4;
      click.play().catch(() => {});
    } catch (_) {}
  }

  // Begin loading voices now so they are ready in time
  voicesReadyPromise = waitForVoices();

  if (!SKIP_LOADER) {
    setTimeout(() => {
      stopLoader();
      const results = document.getElementById("results");
      results.innerHTML = `<span class="loader">🥗</span>`;
    }, 250 * 13);
  }
  const voices = await voicesReadyPromise;
  voice =
    voices.find((v) => v.name.includes("Aaron")) ||
    voices.find((v) => v.name === "Alex");

  const setJam = () => {
    const replaySpeech = document.getElementById("replay-speech");
    if (replaySpeech) replaySpeech.classList.remove("vis-hidden");

    if (kind === "technical") {
      technicalJam();
    } else if (kind === "abstract") {
      abstractJam();
    } else {
      if (Math.random() < 0.5) {
        technicalJam();
      } else {
        abstractJam();
      }
    }
  };

  if (SKIP_LOADER) {
    setJam();
  } else {
    // Schedule speech start exactly 4.5s from click
    pendingStartTimer = setTimeout(async () => {
      if (thisClickId !== currentUtteranceId) return; // another click occurred
      setJam();
    }, 4500);
  }
}

// Thin wrappers
async function go() {
  return startJam();
}
async function goWithMode(kind) {
  return startJam(kind);
}

window;

document.getElementById("spin").addEventListener("click", go);
const techBtn = document.getElementById("spin-technical");
const abstractBtn = document.getElementById("spin-abstract");
if (techBtn) techBtn.addEventListener("click", () => goWithMode("technical"));
if (abstractBtn)
  abstractBtn.addEventListener("click", () => goWithMode("abstract"));
document.getElementById("replay-speech").addEventListener("click", async () => {
  await Tone.start();
  currentUtteranceId++;
  const speechSynthesis = window.speechSynthesis;
  speechSynthesis.cancel();
  if (!lastSpeechText) return;
  const utterance = new SpeechSynthesisUtterance(lastSpeechText);
  utterance.voice = voice;
  utterance.rate = 0.5;
  speechSynthesis.speak(utterance);
});

document.getElementById("replay-scale").addEventListener("click", async () => {
  await Tone.start();
  // Only if we have a last technical jam selection
  if (!lastTechnicalKey || !lastTechnicalMode) return;
  // Cancel current sequence
  if (activeSequence) {
    activeSequence.stop();
    activeSequence.dispose();
    activeSequence = undefined;
  }
  playScale(lastTechnicalKey, lastTechnicalMode);
});
