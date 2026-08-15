/* ==========================================================================
   Stage 7: Avalanche / Boulder Dash (पहाड़ की चट्टानें!)
   ========================================================================== */

class BoulderDashStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Boulder Dash Mountain";
        this.isComplete = false;
        this.isFailed = false;

        this.mountainHeight = 2200;
        this.progress = 0;

        this.player = {
            x: 0,
            y: 0,
            lane: 1, // 3 lanes (0, 1, 2)
            vy: 0,
            isJumping: false,
            animState: 'RUNNING'
        };

        this.boulders = [];
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;
        this.progress = 0;

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.player.lane = 1;
        this.player.x = w * 0.5;
        this.player.y = h * 0.72;
        this.player.vy = 0;
        this.player.isJumping = false;
        this.player.animState = 'RUNNING';

        // Spawn Boulders rolling down the mountain
        this.boulders = [];
        for (let dist = 400; dist < this.mountainHeight - 200; dist += 260) {
            this.boulders.push({
                dist,
                lane: Math.floor(Math.random() * 3),
                radius: 35 + Math.random() * 15,
                rotation: 0,
                rotSpeed: 5 + Math.random() * 5,
                hit: false
            });
        }

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        const w = this.canvas.width;
        const h = this.canvas.height;

        let speed = 220;
        if (controls.states.up || controls.states.action) speed = 340;
        this.progress += speed * dt;

        if (this.progress >= this.mountainHeight) {
            this.isComplete = true;
            gameAudio.playVictory();
            commentary.trigger('stageClear');
            return;
        }

        // Lane Controls (Left / Right)
        if (controls.states.left && this.player.lane > 0) {
            this.player.lane--;
            controls.states.left = false;
            gameAudio.playJump();
        } else if (controls.states.right && this.player.lane < 2) {
            this.player.lane++;
            controls.states.right = false;
            gameAudio.playJump();
        }

        // Target Lane X Position
        const laneXs = [w * 0.3, w * 0.5, w * 0.7];
        this.player.x += (laneXs[this.player.lane] - this.player.x) * dt * 8;

        // Jump Input
        if (controls.states.actionPressed) {
            if (!this.player.isJumping) {
                this.player.isJumping = true;
                this.player.vy = -420;
                gameAudio.playJump();
            }
            controls.resetSingleTriggers();
        }

        if (this.player.isJumping) {
            this.player.y += this.player.vy * dt;
            this.player.vy += 1050 * dt;
            this.player.animState = 'JUMPING';

            if (this.player.y >= h * 0.72) {
                this.player.y = h * 0.72;
                this.player.isJumping = false;
                this.player.vy = 0;
                this.player.animState = 'RUNNING';
            }
        }

        // Boulder Rolling & Collision Check
        for (const b of this.boulders) {
            b.rotation += b.rotSpeed * dt;
            const screenY = (this.mountainHeight - b.dist + this.progress) * 0.3 + 120;

            if (b.lane === this.player.lane && Math.abs(screenY - this.player.y) < 35) {
                if (!this.player.isJumping && !b.hit) {
                    b.hit = true;
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
        vfx.addSplash(this.player.x, this.player.y, '#ffd000', 40);
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // Hilly Mountain Slope
        vfx.renderHillyBackground(this.ctx, w, h, this.progress);

        // Steep Mountain Track
        this.ctx.fillStyle = '#4e3b2c';
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.2, h);
        this.ctx.lineTo(w * 0.4, 150);
        this.ctx.lineTo(w * 0.6, 150);
        this.ctx.lineTo(w * 0.8, h);
        this.ctx.closePath();
        this.ctx.fill();

        // Lane Markers
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.4, h);
        this.ctx.lineTo(w * 0.47, 150);
        this.ctx.moveTo(w * 0.6, h);
        this.ctx.lineTo(w * 0.53, 150);
        this.ctx.stroke();

        // Render 3D Rolling Boulders
        for (const b of this.boulders) {
            const screenY = (this.mountainHeight - b.dist + this.progress) * 0.3 + 120;
            if (screenY < 50 || screenY > h + 50) continue;

            const laneXs = [w * 0.35, w * 0.5, w * 0.65];
            const bx = laneXs[b.lane];

            this.ctx.save();
            this.ctx.translate(bx, screenY);
            this.ctx.rotate(b.rotation);

            // 3D Shadow
            vfx.render3DShadow(this.ctx, 0, 10, b.radius, b.radius * 0.5, 0.4);

            // 3D Boulder Surface
            const bGrad = this.ctx.createRadialGradient(-10, -10, 4, 0, 0, b.radius);
            bGrad.addColorStop(0, '#d89c56');
            bGrad.addColorStop(0.7, '#8b5a2b');
            bGrad.addColorStop(1, '#4a2e16');

            this.ctx.fillStyle = bGrad;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Cracks
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.restore();
        }

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        // Render Realistic Human Runner
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, this.player.x, this.player.y, this.player.animState, charIdx, 1.4, true);

        this.ctx.restore();
    }
}
