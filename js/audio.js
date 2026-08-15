/* ==========================================================================
   Guaranteed Javed Jaffrey Voice Synthesis & Audio Engine
   ========================================================================== */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.speechEnabled = true;
        this.bgMusicPlaying = false;
        this.bgMusicTimer = null;
        this.speechLang = 'hi-IN';
        this.isUnlocked = false;

        this.init();
        this.bindUnlock();
    }

    init() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    bindUnlock() {
        const unlock = () => {
            if (this.isUnlocked) return;
            this.isUnlocked = true;

            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            // Warm up Web Speech API synthesis
            if ('speechSynthesis' in window) {
                window.speechSynthesis.getVoices();
                const dummy = new SpeechSynthesisUtterance('');
                dummy.volume = 0.01;
                window.speechSynthesis.speak(dummy);
            }
        };

        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playJump() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
    }

    playSplash() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
        whiteNoise.stop(this.ctx.currentTime + 0.45);
    }

    playGuardCatch() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(350, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playLaser() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.14);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
    }

    playTargetHit() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(980, this.ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }

    playVictory() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + (idx * 0.08);
            gain.gain.setValueAtTime(0.35, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    }

    playFailHorn() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.55);

        gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.55);
    }

    startBGM() {
        if (!this.soundEnabled || this.bgMusicPlaying || !this.ctx) return;
        this.bgMusicPlaying = true;

        const melody = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        let noteIndex = 0;

        const playNextNote = () => {
            if (!this.bgMusicPlaying || !this.soundEnabled) return;
            this.resumeContext();

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = melody[noteIndex % melody.length];
            noteIndex = (noteIndex + Math.floor(Math.random() * 3) + 1) % melody.length;

            gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.18);

            this.bgMusicTimer = setTimeout(playNextNote, 210);
        };

        playNextNote();
    }

    stopBGM() {
        this.bgMusicPlaying = false;
        if (this.bgMusicTimer) {
            clearTimeout(this.bgMusicTimer);
            this.bgMusicTimer = null;
        }
    }

    // Guaranteed Javed Jaffrey Speech Voice Synthesis
    speakCommentary(text) {
        if (!this.speechEnabled || !('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel(); // Clear backlog

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.speechLang;
        utterance.rate = 1.25;  // Fast energetic Javed delivery
        utterance.pitch = 1.28; // Unique Javed Jaffrey comic voice pitch!
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('India'));
            if (hiVoice && this.speechLang.startsWith('hi')) {
                utterance.voice = hiVoice;
            }
        }

        window.speechSynthesis.speak(utterance);
    }
}

const gameAudio = new AudioEngine();
