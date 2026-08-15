/* ==========================================================================
   Stage 1: Ultra 3D Hilly Slippery Stepping Stones (स्लिपरी पत्थरों की नदी)
   ========================================================================== */

class SteppingStonesStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Slippery Stepping Stones";
        this.isComplete = false;
        this.isFailed = false;

        this.rows = 4;
        this.cols = 7;

        this.player = {
            col: 0, row: 1,
            x: 120, y: 500,
            targetX: 120, targetY: 500,
            isJumping: false, jumpProgress: 0,
            inWater: false, waterAnim: 0,
            animState: 'IDLE'
        };

        this.stones = [];
        this.scrollX = 0;
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;

        this.player.col = 0;
        this.player.row = 1;
        this.player.inWater = false;
        this.player.waterAnim = 0;
        this.player.animState = 'IDLE';

        const w = this.canvas.width;
        const h = this.canvas.height;
        const colWidth = (w - 300) / (this.cols - 1);

        this.player.x = 150;
        this.player.y = h * 0.48 + 1 * 110;
        this.player.targetX = this.player.x;
        this.player.targetY = this.player.y;

        // Generate Stones Matrix with 3D Depth
        this.stones = [];
        for (let c = 1; c <= 5; c++) {
            const stoneCol = [];
            const fakeIndices = new Set();
            while (fakeIndices.size < 2) {
                fakeIndices.add(Math.floor(Math.random() * this.rows));
            }

            for (let r = 0; r < this.rows; r++) {
                stoneCol.push({
                    col: c, row: r,
                    x: 150 + c * colWidth,
                    y: h * 0.44 + r * 115,
                    radius: 42,
                    isFake: fakeIndices.has(r),
                    isSunk: false,
                    wobble: Math.random() * Math.PI * 2
                });
            }
            this.stones.push(stoneCol);
        }

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        this.scrollX += dt * 35;

        if (this.player.inWater) {
            this.player.waterAnim += dt * 3;
            this.player.animState = 'FALLING_SPLASH';
            if (this.player.waterAnim > 1.2 && !this.isFailed) {
                this.isFailed = true;
            }
            return;
        }

        if (this.player.isJumping) {
            this.player.jumpProgress += dt * 4.5;
            this.player.animState = 'JUMPING';

            if (this.player.jumpProgress >= 1) {
                this.player.jumpProgress = 1;
                this.player.isJumping = false;
                this.player.x = this.player.targetX;
                this.player.y = this.player.targetY;
                this.player.animState = 'BALANCE_WOBBLE';
                this.checkLanding();
            } else {
                this.player.x = this.player.startX + (this.player.targetX - this.player.startX) * this.player.jumpProgress;
                this.player.y = this.player.startY + (this.player.targetY - this.player.startY) * this.player.jumpProgress;
            }
            return;
        }

        if (!this.player.isJumping) {
            let nextCol = this.player.col;
            let nextRow = this.player.row;

            if (controls.states.actionPressed || controls.states.right) {
                nextCol++;
                controls.resetSingleTriggers();
            } else if (controls.states.left && this.player.col > 0) {
                nextCol--;
            } else if (controls.states.up && this.player.row > 0) {
                nextRow--;
            } else if (controls.states.down && this.player.row < this.rows - 1) {
                nextRow++;
            }

            if (nextCol !== this.player.col || nextRow !== this.player.row) {
                this.jumpTo(nextCol, nextRow);
            }
        }
    }

    jumpTo(col, row) {
        if (col < 0 || col > 6 || row < 0 || row >= this.rows) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const colWidth = (w - 300) / (this.cols - 1);

        this.player.col = col;
        this.player.row = row;
        this.player.startX = this.player.x;
        this.player.startY = this.player.y;

        this.player.targetX = 150 + col * colWidth;
        this.player.targetY = h * 0.44 + row * 115;

        this.player.isJumping = true;
        this.player.jumpProgress = 0;
        gameAudio.playJump();
    }

    checkLanding() {
        if (this.player.col === 6) {
            this.isComplete = true;
            gameAudio.playVictory();
            commentary.trigger('stageClear');
            return;
        }

        if (this.player.col === 0) return;

        const stoneCol = this.stones[this.player.col - 1];
        const stone = stoneCol ? stoneCol[this.player.row] : null;

        if (stone) {
            if (stone.isFake) {
                stone.isSunk = true;
                this.triggerWaterFall();
            } else {
                if (Math.random() < 0.35) {
                    commentary.trigger('steppingStonesNearMiss');
                }
            }
        }
    }

    triggerWaterFall() {
        this.player.inWater = true;
        gameAudio.playSplash();
        commentary.trigger('steppingStonesFall');
        vfx.triggerCameraShake(14, 0.45);
        vfx.addSplash(this.player.x, this.player.y, '#654321', 50);
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // 1. Render 3D Hilly Mountain Countryside Background
        vfx.renderHillyBackground(this.ctx, w, h, this.scrollX);

        // 2. Render 3D River with Caustics & Refraction Depth
        const riverY = h * 0.36;
        const riverH = h * 0.58;

        const riverGrad = this.ctx.createLinearGradient(0, riverY, 0, riverY + riverH);
        riverGrad.addColorStop(0, 'rgba(12, 60, 95, 0.95)');
        riverGrad.addColorStop(0.5, 'rgba(8, 40, 70, 0.98)');
        riverGrad.addColorStop(1, 'rgba(4, 20, 45, 1)');
        this.ctx.fillStyle = riverGrad;
        this.ctx.fillRect(0, riverY, w, riverH);

        // Water Foam & Refraction Ripples
        this.ctx.lineWidth = 2.5;
        for (let y = riverY + 15; y < riverY + riverH; y += 38) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            for (let x = 0; x <= w; x += 35) {
                const waveY = y + Math.sin(x * 0.015 + this.scrollX * 0.06) * 6;
                if (x === 0) this.ctx.moveTo(x, waveY);
                else this.ctx.lineTo(x, waveY);
            }
            this.ctx.stroke();
        }

        // Start Bank (Left)
        this.ctx.fillStyle = '#3e6b48';
        this.ctx.fillRect(0, riverY - 20, 170, riverH + 40);
        this.ctx.fillStyle = '#7a4e25';
        this.ctx.fillRect(160, riverY - 20, 12, riverH + 40);

        // Finish Bank (Right)
        this.ctx.fillStyle = '#ff2a5f';
        this.ctx.fillRect(w - 170, riverY - 20, 170, riverH + 40);
        this.ctx.fillStyle = '#ffd000';
        this.ctx.font = 'bold 20px Fredoka';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("FINISH (लक्ष्य)", w - 85, h * 0.62);

        // Render 3D Stepping Stones with Depth & Shading
        for (let c = 0; c < this.stones.length; c++) {
            for (let r = 0; r < this.stones[c].length; r++) {
                const s = this.stones[c][r];
                if (s.isSunk) continue;

                this.ctx.save();
                this.ctx.translate(s.x, s.y);

                // 3D Water Ring Foam Around Stone
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 4, s.radius + 6, (s.radius + 6) * 0.65, 0, 0, Math.PI * 2);
                this.ctx.stroke();

                // 3D Stone Projected Shadow
                vfx.render3DShadow(this.ctx, 0, 8, s.radius, s.radius * 0.6, 0.5);

                // 3D Stone Cylinder Side (Extrusion)
                this.ctx.fillStyle = '#222830';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 8, s.radius, s.radius * 0.7, 0, 0, Math.PI * 2);
                this.ctx.fill();

                // 3D Stone Top Surface Gradient
                const grad = this.ctx.createRadialGradient(-12, -12, 4, 0, 0, s.radius);
                grad.addColorStop(0, '#d8e0e8');
                grad.addColorStop(0.7, '#687078');
                grad.addColorStop(1, '#303840');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, s.radius, s.radius * 0.7, 0, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.strokeStyle = '#111';
                this.ctx.lineWidth = 2.8;
                this.ctx.stroke();

                this.ctx.restore();
            }
        }

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        // Render Ultra 3D Human Runner Character
        if (!this.player.inWater || this.player.waterAnim < 1.0) {
            const jumpY = this.player.isJumping ? Math.sin(this.player.jumpProgress * Math.PI) * 55 : 0;
            const drawY = this.player.y - jumpY;
            const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;

            humanRunner.render(this.ctx, this.player.x, drawY, this.player.animState, charIdx, 1.4, true);
        }

        this.ctx.restore();
    }
}
