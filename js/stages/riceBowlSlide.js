/* ==========================================================================
   Stage 7: Rice Bowl Downhill (राइस बाउल राइड!)
   ========================================================================== */

class RiceBowlSlideStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Rice Bowl Downhill";
        this.isComplete = false;
        this.isFailed = false;

        this.slideLength = 2400;
        this.progress = 0;

        this.player = {
            x: 0,
            y: 0,
            laneX: 0,
            rotation: 0,
            animState: 'IDLE'
        };

        this.obstacles = [];
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;
        this.progress = 0;

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.player.laneX = w * 0.5;
        this.player.x = w * 0.5;
        this.player.y = h * 0.72;
        this.player.rotation = 0;
        this.player.animState = 'IDLE';

        // Obstacles on water slide
        this.obstacles = [];
        for (let dist = 450; dist < this.slideLength - 300; dist += 320) {
            this.obstacles.push({
                dist,
                xOffset: (Math.random() - 0.5) * (w * 0.5),
                radius: 36,
                hit: false
            });
        }

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        const w = this.canvas.width;

        let speed = 260;
        if (controls.states.up || controls.states.action) speed = 380;
        this.progress += speed * dt;
        this.player.rotation += dt * 3.5; // Rice Bowl spinning effect!

        if (this.progress >= this.slideLength) {
            this.isComplete = true;
            gameAudio.playVictory();
            commentary.trigger('stageClear');
            return;
        }

        // Steer Rice Bowl Left/Right
        if (controls.states.left && this.player.x > w * 0.25) {
            this.player.x -= dt * 420;
        } else if (controls.states.right && this.player.x < w * 0.75) {
            this.player.x += dt * 420;
        }

        // Obstacle collision check
        for (const obs of this.obstacles) {
            const screenY = (this.slideLength - obs.dist + this.progress) * 0.3 + 140;
            const obsX = w * 0.5 + obs.xOffset;

            if (Math.abs(screenY - this.player.y) < 40 && Math.abs(obsX - this.player.x) < 45) {
                if (!obs.hit) {
                    obs.hit = true;
                    this.triggerHit();
                }
            }
        }
    }

    triggerHit() {
        this.isFailed = true;
        this.player.animState = 'FALLING_SPLASH';
        gameAudio.playFailHorn();
        commentary.trigger('wipeoutHit');
        vfx.triggerCameraShake(18, 0.45);
        vfx.addSplash(this.player.x, this.player.y, '#ffd000', 50);
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        vfx.renderHillyBackground(this.ctx, w, h, this.progress);

        // Giant Slippery Water Slide Track
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.2, h);
        this.ctx.lineTo(w * 0.38, 140);
        this.ctx.lineTo(w * 0.62, 140);
        this.ctx.lineTo(w * 0.8, h);
        this.ctx.closePath();
        this.ctx.fill();

        // Water Splash Surface Waves
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        for (let y = 160; y < h; y += 45) {
            this.ctx.beginPath();
            const waveX1 = w * 0.5 - (y / h) * (w * 0.3);
            const waveX2 = w * 0.5 + (y / h) * (w * 0.3);
            this.ctx.moveTo(waveX1, y);
            this.ctx.lineTo(waveX2, y);
            this.ctx.stroke();
        }

        // Render Rubber Duck Obstacles
        for (const obs of this.obstacles) {
            const screenY = (this.slideLength - obs.dist + this.progress) * 0.3 + 140;
            if (screenY < 50 || screenY > h + 50) continue;

            const obsX = w * 0.5 + obs.xOffset;

            this.ctx.save();
            this.ctx.translate(obsX, screenY);
            this.ctx.font = '40px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🦆', 0, 0);
            this.ctx.restore();
        }

        // Render Player Inside Giant Spinning Rice Bowl Raft
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);

        // Rice Bowl Shadow
        vfx.render3DShadow(this.ctx, 0, 15, 40, 15, 0.45);

        // Rice Bowl Outer Rim
        this.ctx.save();
        this.ctx.rotate(this.player.rotation);
        const bowlGrad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
        bowlGrad.addColorStop(0, '#ffffff');
        bowlGrad.addColorStop(0.7, '#e0e0e0');
        bowlGrad.addColorStop(1, '#ff2a5f');

        this.ctx.fillStyle = bowlGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 45, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.restore();

        // Player Sitting Inside Bowl
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, 0, -10, 'DUCKING', charIdx, 1.2, true);

        this.ctx.restore();

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        this.ctx.restore();
    }
}
