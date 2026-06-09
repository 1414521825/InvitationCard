const rsvpButton = document.querySelector("[data-rsvp]");
const rsvpNote = document.querySelector("[data-rsvp-note]");
const musicToggle = document.querySelector("[data-music-toggle]");
const backgroundMusic = document.querySelector("[data-background-music]");

let audioContext;
let syntheticTimer;
let isMusicPlaying = false;
let hasTriedScrollPlay = false;

const melody = [
  392,
  440,
  523.25,
  587.33,
  523.25,
  440,
  392,
  329.63,
  392,
  440,
  493.88,
  440,
  392,
  349.23,
  329.63,
  293.66,
];

const playSyntheticNote = (frequency, startTime, duration) => {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
};

const scheduleSyntheticMelody = () => {
  const now = audioContext.currentTime + 0.04;
  melody.forEach((frequency, index) => {
    playSyntheticNote(frequency, now + index * 0.42, 0.36);
  });
};

const startSyntheticMusic = async () => {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) {
    throw new Error("Web Audio is not supported in this browser.");
  }

  audioContext ||= new AudioEngine();
  await audioContext.resume();
  scheduleSyntheticMelody();
  syntheticTimer = window.setInterval(scheduleSyntheticMelody, melody.length * 420);
};

const startMusic = async () => {
  try {
    if (!backgroundMusic) {
      throw new Error("Background audio element is missing.");
    }

    backgroundMusic.volume = 0.5;
    await backgroundMusic.play();
  } catch {
    await startSyntheticMusic();
  }

  isMusicPlaying = true;
  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "暂停背景音乐");
  musicToggle.querySelector(".music-toggle__text").textContent = "暂停";
};

const stopMusic = async () => {
  window.clearInterval(syntheticTimer);
  if (audioContext) {
    await audioContext.close();
    audioContext = undefined;
  }

  if (backgroundMusic) {
    backgroundMusic.pause();
  }

  isMusicPlaying = false;
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "播放背景音乐");
  musicToggle.querySelector(".music-toggle__text").textContent = "音乐";
};

const tryStartMusicFromScroll = (shouldIgnorePosition = false) => {
  if (hasTriedScrollPlay || isMusicPlaying || !backgroundMusic) {
    return;
  }

  if (!shouldIgnorePosition && window.scrollY < 12) {
    return;
  }

  hasTriedScrollPlay = true;
  startMusic().catch(() => {
    musicToggle.querySelector(".music-toggle__text").textContent = "点击播放";
  });
};

if (rsvpButton && rsvpNote) {
  rsvpButton.addEventListener("click", () => {
    rsvpNote.hidden = false;
    rsvpButton.textContent = "到时候见";
    rsvpButton.setAttribute("aria-pressed", "true");
    rsvpNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

if (musicToggle) {
  musicToggle.addEventListener("click", async () => {
    try {
      if (isMusicPlaying) {
        await stopMusic();
      } else {
        await startMusic();
      }
    } catch {
      await stopMusic();
      musicToggle.querySelector(".music-toggle__text").textContent = "点击播放";
    }
  });
}

window.addEventListener("scroll", tryStartMusicFromScroll, { passive: true });
window.addEventListener(
  "pointerdown",
  () => tryStartMusicFromScroll(true),
  { passive: true },
);
window.addEventListener(
  "wheel",
  (event) => {
    if (event.deltaY > 0) {
      tryStartMusicFromScroll(true);
    }
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  () => tryStartMusicFromScroll(true),
  { passive: true },
);
