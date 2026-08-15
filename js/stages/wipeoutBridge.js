/* ==========================================================================
   Stage 3: Ultra 3D Hilly Wipeout Bridge (ब्रिज रोलर और वाइपआउट)
   ========================================================================== */

class WipeoutBridgeStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Wipeout Bridge";
        this.isComplete = false;
        this.isFailed = false;

        this.bridgeLength = 2600;
        this.progress = 0;

        this.player = {
            x: 240,
            y: 520,
            baseY: 520,
            vy: 0,
            isJumping: false,
            isDucking: false,
            inWater: false,
            animState: 'RUNNING'
        };

        this.obstacles = [];
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;
        this.progress = 0;

        const h = this.canvas.height;
        this.player.baseY = h * 0.58;
        this.player.y = this.player.baseY;
        this.player.vy = 0;
        this.player.isJumping = false;
        this.player.isDucking = false;
        this.player.inWater = false;
        this.player.animState = 'RUNNING';

        this.obstacles = [];
        for (let dist = 520; dist < this.bridgeLength - 350; dist += 420) {
            const type = Math.random() < 0.5 ? 'lowLog' : 'highLog';
            this.obstacles.push({
                dist,
                type,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: 4 + Math.random() * 4,
                hit: false
            });
        }

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        if (this.player.inWater) {
            this.player.y += dt * 200;
            this.player.animState = 'FALLING_SPLASH';
            if (this.player.y > this.canvas.height + 60) {
                this.isFailed = true;
            }
            return;
        }

        let speed = 240;
        if (controls.states.right) speed = 380;
        this.progress += speed * dt;

        if (this.progress >= this.bridgeLength) {
            this.isComplete = true;
            gameAudio.playVictory();
            commentary.trigger('stageClear');
            return;
        }

        // Jump Input
        if (controls.states.actionPressed || controls.states.up) {
            if (!this.player.isJumping && !this.player.isDucking) {
                this.player.isJumping = true;
                this.player.vy = -450;
                gameAudio.playJump();
            }
            controls.resetSingleTriggers();
        }

        // Duck Input
        this.player.isDucking = controls.states.down && !this.player.isJumping;

        // Apply Gravity
        if (this.player.isJumping) {
            this.player.y += this.player.vy * dt;
            this.player.vy += 1100 * dt;
            this.player.animState = 'JUMPING';

            if (this.player.y >= this.player.baseY) {
                this.player.y = this.player.baseY;
                this.player.isJumping = false;
                this.player.vy = 0;
                this.player.animState = 'RUNNING';
            }
        } else if (this.player.isDucking) {
            this.player.animState = 'DUCKING';
        } else {
            this.player.animState = 'RUNNING';
        }

        // Rotate obstacles & Collision Check
        for (const obs of this.obstacles) {
            obs.rotation += obs.rotSpeed * dt;
            const screenX = obs.dist - this.progress + this.player.x;

            if (Math.abs(screenX - this.player.x) < 40) {
                let safe = false;

                if (obs.type === 'lowLog') {
                    if (this.player.isJumping && (this.player.baseY - this.player.y) > 45) {
                        safe = true;
                    }
                } else if (obs.type === 'highLog') {
                    if (this.player.isDucking) {
                        safe = true;
                        commentary.trigger('wipeoutDuck');
                    }
                }

                if (!safe && !obs.hit) {
                    obs.hit = true;
                    this.triggerWipeout();
                }
            }
        }
    }

    triggerWipeout() {
        this.player.inWater = true;
        gameAudio.playSplash();
        commentary.trigger('wipeoutHit');
        vfx.triggerCameraShake(18, 0.45);
        vfx.addSplash(this.player.x, this.player.y, '#33b5e5', 55);
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // 3D Hilly Mountain Countryside Background
        vfx.renderHillyBackground(this.ctx, w, h, this.progress);

        // Mountain River Lake
        this.ctx.fillStyle = 'rgba(12, 60, 105, 0.9)';
        this.ctx.fillRect(0, this.player.baseY + 30, w, h);

        // 3D Balance Beam Wooden Bridge
        this.ctx.fillStyle = '#8b5a2b';
        this.ctx.fillRect(0, this.player.baseY + 18, w, 28);
        this.ctx.fillStyle = '#5c3a1e';
        this.ctx.fillRect(0, this.player.baseY + 38, w, 10);

        // Bridge Support Pillars
        for (let px = 80; px < w; px += 220) {
            this.ctx.fillStyle = '#3a2211';
            this.ctx.fillRect(px, this.player.baseY + 38, 25, h);
        }

        // Render 3D Rotating Foam Logs with 3D End Caps & Stripe Shading
        for (const obs of this.obstacles) {
            const screenX = obs.dist - this.progress + this.player.x;
            if (screenX < -120 || screenX > w + 120) continue;

            this.ctx.save();

            if (obs.type === 'lowLog') {
                const logY = this.player.baseY - 20;

                // 3D Shadow
                vfx.render3DShadow(this.ctx, screenX, this.player.baseY + 15, 30, 8, 0.4);

                // 3D Foam Log Cylinder
                const grad = this.ctx.createLinearGradient(screenX - 25, logY - 20, screenX + 25, logY + 20);
                grad.addColorStop(0, '#ff4d79');
                grad.addColorStop(0.5, '#ff2a5f');
                grad.addColorStop(1, '#b80036');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.roundRect(screenX - 25, logY - 20, 50, 40, 6);
                this.ctx.fill();

                // Rotating 3D Yellow Stripe Overlay
                this.ctx.fillStyle = '#ffd000';
                const stripeOffset = Math.sin(obs.rotation) * 12;
                this.ctx.fillRect(screenX - 25, logY - 12 + stripeOffset, 50, 8);

                this.ctx.strokeStyle = '#111';
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeRect(screenX - 25, logY - 20, 50, 40);
            } else {
                const logY = this.player.baseY - 70;

                // 3D Shadow
                vfx.render3DShadow(this.ctx, screenX, this.player.baseY + 15, 35, 10, 0.35);

                const grad = this.ctx.createLinearGradient(screenX - 30, logY - 25, screenX + 30, logY + 25);
                grad.addColorStop(0, '#a54eff');
                grad.addColorStop(0.5, '#8a2be2');
                grad.addColorStop(1, '#521199');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.roundRect(screenX - 30, logY - 25, 60, 46, 8);
                this.ctx.fill();

                this.ctx.fillStyle = '#00f2ff';
                const stripeOffset = Math.cos(obs.rotation) * 14;
                this.ctx.fillRect(screenX - 30, logY - 15 + stripeOffset, 60, 9);

                this.ctx.strokeStyle = '#111';
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeRect(screenX - 30, logY - 25, 60, 46);
            }

            this.ctx.restore();
        }

        // Finish Platform
        const finishX = this.bridgeLength - this.progress + this.player.x;
        if (finishX < w + 240) {
            this.ctx.fillStyle = '#ffd000';
            this.ctx.fillRect(finishX, this.player.baseY - 120, 200, 160);
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 22px Fredoka';
            this.ctx.fillText("FINISH!", finishX + 60, this.player.baseY - 40);
        }

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        // Render Ultra 3D Human Runner
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, this.player.x, this.player.y, this.player.animState, charIdx, 1.4, true);

        this.ctx.restore();
    }
}
