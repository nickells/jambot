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

//play a middle 'C' for the duration of an 8th note
const tempos = ["an upbeat", "a slow", "a midtempo", "a fast"];

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

// Wait until browser voices are loaded, then return them
function waitForVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices && voices.length) {
      resolve(voices);
      return;
    }
    const handler = () => {
      const loaded = synth.getVoices();
      if (loaded && loaded.length) {
        synth.removeEventListener("voiceschanged", handler);
        resolve(loaded);
      }
    };
    synth.addEventListener("voiceschanged", handler);
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

  activeSequence = new Tone.Sequence(
    (time, note) => {
      const velocity = 0.7 + (Math.random() * 0.2 - 0.1);
      synth.triggerAttackRelease(
        note,
        "8n",
        time,
        Math.max(0.5, Math.min(0.9, velocity))
      );
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

async function go() {
  const replaySpeech = document.getElementById("replay-speech");
  if (replaySpeech) replaySpeech.classList.remove("vis-hidden");

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
  try {
    const click = new Audio("clickclack.mp3");
    click.volume = 0.4;
    click.play().catch(() => {});
  } catch (_) {}

  // Begin loading voices now so they are ready in time
  voicesReadyPromise = waitForVoices();

  // Schedule speech start exactly 4.5s from click
  pendingStartTimer = setTimeout(async () => {
    if (thisClickId !== currentUtteranceId) return; // another click occurred
    const voices = await voicesReadyPromise;
    console.log(voices.filter((v) => v.lang.includes("en-US")));
    voice = voices.find((v) => v.name.includes("Aaron"));
    if (Math.random() < 0.5) {
      technicalJam();
    } else {
      abstractJam();
    }
  }, 4500);
}

window;

document.getElementById("spin").addEventListener("click", go);
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
