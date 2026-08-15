/* ==========================================================================
   Takeshi's Castle Game Engine (All 20 Levels Unlocked)
   ========================================================================== */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = 'MENU';
        this.currentStageNum = 1;
        this.maxStages = 20;
        this.currentStage = null;

        this.selectedCharIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.lastTime = 0;

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        this.initUI();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initUI() {
        const charCards = document.querySelectorAll('.char-card');
        charCards.forEach((card) => {
            card.addEventListener('click', () => {
                charCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCharIndex = parseInt(card.getAttribute('data-char'), 10) || 0;
            });
        });

        document.getElementById('btn-start-game').addEventListener('click', () => {
            gameAudio.resumeContext();
            this.startGame(1);
        });

        document.getElementById('btn-stage-select').addEventListener('click', () => {
            document.getElementById('screen-menu').classList.add('hidden');
            document.getElementById('screen-stage-select').classList.remove('hidden');
        });

        document.getElementById('btn-back-from-stages').addEventListener('click', () => {
            document.getElementById('screen-stage-select').classList.add('hidden');
            document.getElementById('screen-menu').classList.remove('hidden');
        });

        const stageCards = document.querySelectorAll('.stage-card');
        stageCards.forEach((card) => {
            card.addEventListener('click', () => {
                const stageNum = parseInt(card.getAttribute('data-stage'), 10) || 1;
                document.getElementById('screen-stage-select').classList.add('hidden');
                gameAudio.resumeContext();
                this.startGame(stageNum);
            });
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            document.getElementById('screen-instructions').classList.remove('hidden');
        });

        document.getElementById('btn-close-instructions').addEventListener('click', () => {
            document.getElementById('screen-instructions').classList.add('hidden');
        });

        document.getElementById('btn-next-stage').addEventListener('click', () => {
            document.getElementById('screen-stage-clear').classList.add('hidden');
            if (this.currentStageNum < this.maxStages) {
                this.startStage(this.currentStageNum + 1);
            } else {
                this.showVictoryScreen();
            }
        });

        document.getElementById('btn-retry-game').addEventListener('click', () => {
            document.getElementById('screen-game-over').classList.add('hidden');
            this.startGame(this.currentStageNum);
        });

        document.getElementById('btn-menu-fail').addEventListener('click', () => {
            document.getElementById('screen-game-over').classList.add('hidden');
            this.showMenu();
        });

        document.getElementById('btn-play-again-win').addEventListener('click', () => {
            document.getElementById('screen-game-victory').classList.add('hidden');
            this.showMenu();
        });

        const audioBtn = document.getElementById('btn-audio-toggle');
        audioBtn.addEventListener('click', () => {
            gameAudio.soundEnabled = !gameAudio.soundEnabled;
            audioBtn.innerText = gameAudio.soundEnabled ? '🔊 VOICE ON' : '🔇 VOICE OFF';
            if (gameAudio.soundEnabled) gameAudio.startBGM();
            else gameAudio.stopBGM();
        });

        const commBtn = document.getElementById('btn-commentary-toggle');
        commBtn.addEventListener('click', () => {
            if (commentary.lang === 'hi') {
                commentary.setLanguage('en');
                gameAudio.speechLang = 'en-US';
                commBtn.innerText = '🇬🇧 EN';
            } else {
                commentary.setLanguage('hi');
                gameAudio.speechLang = 'hi-IN';
                commBtn.innerText = '🇮🇳 HI';
            }
        });

        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    showMenu() {
        this.state = 'MENU';
        gameAudio.stopBGM();
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('screen-menu').classList.remove('hidden');
    }

    startGame(startStageNum = 1) {
        this.lives = 3;
        this.score = 0;
        this.updateHUDLives();

        document.getElementById('screen-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');

        gameAudio.startBGM();
        this.startStage(startStageNum);
    }

    startStage(stageNum) {
        this.currentStageNum = stageNum;
        this.state = 'PLAYING';

        // 20 Level Progression Mapping
        switch (stageNum) {
            case 1:
            case 8:
            case 15:
                this.currentStage = new SteppingStonesStage(this.canvas, this.ctx);
                break;
            case 2:
            case 9:
            case 16:
                this.currentStage = new HoneycombMazeStage(this.canvas, this.ctx);
                break;
            case 3:
            case 10:
            case 17:
                this.currentStage = new WipeoutBridgeStage(this.canvas, this.ctx);
                break;
            case 4:
            case 11:
            case 18:
                this.currentStage = new MushroomTripStage(this.canvas, this.ctx);
                break;
            case 5:
            case 12:
                this.currentStage = new DoorKnockStage(this.canvas, this.ctx);
                break;
            case 6:
            case 13:
                this.currentStage = new BoulderDashStage(this.canvas, this.ctx);
                break;
            case 7:
            case 14:
                this.currentStage = new RiceBowlSlideStage(this.canvas, this.ctx);
                break;
            case 19:
            case 20:
            default:
                this.currentStage = new FinalAssaultStage(this.canvas, this.ctx);
                break;
        }

        document.getElementById('hud-stage-num').innerText = `${this.currentStageNum}/${this.maxStages}`;
        document.getElementById('hud-stage-title').innerText = `Level ${this.currentStageNum}: ${this.currentStage.title}`;
        this.updateHUDScore();
    }

    handleStageFailed() {
        this.lives--;
        this.updateHUDLives();

        if (this.lives > 0) {
            this.startStage(this.currentStageNum);
        } else {
            this.state = 'GAME_OVER';
            gameAudio.stopBGM();
            gameAudio.playFailHorn();
            commentary.trigger('gameOver');

            document.getElementById('final-score-fail').innerText = this.score;
            document.getElementById('screen-game-over').classList.remove('hidden');
        }
    }

    handleStageComplete() {
        this.state = 'STAGE_CLEAR';
        const stageBonus = 1000 * this.currentStageNum;
        this.score += stageBonus;
        this.updateHUDScore();

        document.getElementById('clear-stage-title').innerText = `Level ${this.currentStageNum} Conquered!`;
        document.getElementById('bonus-stage').innerText = `+${stageBonus}`;
        document.getElementById('total-stage-score').innerText = this.score;

        document.getElementById('screen-stage-clear').classList.remove('hidden');
    }

    showVictoryScreen() {
        this.state = 'VICTORY';
        gameAudio.stopBGM();
        gameAudio.playVictory();
        commentary.trigger('gameVictory');

        document.getElementById('hud').classList.add('hidden');
        document.getElementById('grand-score-val').innerText = this.score + 10000;
        document.getElementById('screen-game-victory').classList.remove('hidden');
    }

    updateHUDLives() {
        const iconsDiv = document.getElementById('lives-icons');
        if (!iconsDiv) return;
        let html = '';
        for (let i = 0; i < this.lives; i++) {
            html += `<span class="life-icon">🏃</span>`;
        }
        iconsDiv.innerHTML = html;
    }

    updateHUDScore() {
        const scoreElem = document.getElementById('hud-score');
        if (scoreElem) {
            scoreElem.innerText = String(this.score).padStart(5, '0');
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === 'PLAYING' && this.currentStage) {
            this.currentStage.update(dt);
            this.currentStage.render();

            if (this.currentStage.isComplete) {
                this.handleStageComplete();
            } else if (this.currentStage.isFailed) {
                this.handleStageFailed();
            }
        }

        requestAnimationFrame((ts) => this.loop(ts));
    }
}

let gameInstance = null;
window.addEventListener('load', () => {
    gameInstance = new GameEngine();
});
