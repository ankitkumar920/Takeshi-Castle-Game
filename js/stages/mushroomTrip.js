/* ==========================================================================
   Stage 4: 3D Hilly Mushroom Trip (मशरूम राइड)
   ========================================================================== */

class MushroomTripStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Mushroom Trip";
        this.isComplete = false;
        this.isFailed = false;

        this.mushroom = {
            x: 120,
            y: 180,
            speed: 340,
            direction: 1
        };

        this.player = {
            x: 120,
            y: 240,
            vx: 0,
            vy: 0,
            isReleased: false,
            inWater: false,
            animState: 'IDLE'
        };

        this.targetRaft = {
            x: 880,
            y: 540,
            radius: 65
        };

        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;

        this.mushroom.x = 120;
        this.mushroom.direction = 1;

        this.player.isReleased = false;
        this.player.inWater = false;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.x = this.mushroom.x;
        this.player.y = this.mushroom.y + 60;
        this.player.animState = 'IDLE';

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        if (!this.player.isReleased) {
            this.mushroom.x += this.mushroom.speed * this.mushroom.direction * dt;

            if (this.mushroom.x > this.canvas.width - 160) {
                this.mushroom.direction = -1;
            } else if (this.mushroom.x < 160) {
                this.mushroom.direction = 1;
            }

            this.player.x = this.mushroom.x;
            this.player.y = this.mushroom.y + 60;

            if (controls.states.actionPressed || controls.states.up) {
                this.player.isReleased = true;
                this.player.vx = this.mushroom.speed * this.mushroom.direction * 0.85;
                this.player.vy = 50;
                this.player.animState = 'JUMPING';
                gameAudio.playJump();
                controls.resetSingleTriggers();
            }
        } else {
            this.player.x += this.player.vx * dt;
            this.player.y += this.player.vy * dt;
            this.player.vy += 760 * dt;

            if (this.player.y >= this.targetRaft.y) {
                this.checkLanding();
            }
        }
    }

    checkLanding() {
        const dist = Math.hypot(this.player.x - this.targetRaft.x, this.player.y - this.targetRaft.y);

        if (dist <= this.targetRaft.radius) {
            this.isComplete = true;
            this.player.animState = 'BALANCE_WOBBLE';
            gameAudio.playTargetHit();
            gameAudio.playVictory();
            commentary.trigger('mushroomHit');
        } else {
            this.player.inWater = true;
            this.isFailed = true;
            this.player.animState = 'FALLING_SPLASH';
            gameAudio.playSplash();
            commentary.trigger('mushroomMiss');
            vfx.triggerCameraShake(15, 0.4);
            vfx.addSplash(this.player.x, this.player.y, '#0a3a60', 50);
        }
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // 3D Hilly Background
        vfx.renderHillyBackground(this.ctx, w, h, 0);

        // Lake
        this.ctx.fillStyle = 'rgba(10, 58, 96, 0.85)';
        this.ctx.fillRect(0, 460, w, 260);

        // Cable Line
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.mushroom.y);
        this.ctx.lineTo(w, this.mushroom.y);
        this.ctx.stroke();

        // Target Raft
        this.ctx.save();
        this.ctx.translate(this.targetRaft.x, this.targetRaft.y);

        this.ctx.fillStyle = '#ffd000';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.targetRaft.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ff2a5f';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.targetRaft.radius * 0.65, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.targetRaft.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();

        // Giant Mushroom Top
        this.ctx.save();
        this.ctx.translate(this.mushroom.x, this.mushroom.y);

        this.ctx.fillStyle = '#f5e6ca';
        this.ctx.fillRect(-12, 0, 24, 60);

        this.ctx.fillStyle = '#ff2a5f';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 50, Math.PI, 0);
        this.ctx.fill();

        this.ctx.restore();

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        // Render Realistic Human Runner
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, this.player.x, this.player.y, this.player.animState, charIdx, 1.3, true);

        this.ctx.restore();
    }
}
