/* ==========================================================================
   Stage 5: Ultra Final Assault (Image Matched - Showdown Arena)
   ========================================================================== */

class FinalAssaultStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Final Assault";
        this.isComplete = false;
        this.isFailed = false;

        this.playerCart = {
            x: 400,
            y: 560,
            speed: 450,
            hp: 100,
            maxHp: 100
        };

        this.takeshiTank = {
            x: 800,
            y: 220,
            speed: 280,
            hp: 150,
            maxHp: 150,
            shootTimer: 0,
            shootInterval: 0.7
        };

        this.playerLasers = [];
        this.enemyLasers = [];
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;

        const h = this.canvas.height;
        this.playerCart.y = h * 0.72;
        this.takeshiTank.y = h * 0.28;

        this.playerCart.x = this.canvas.width * 0.35;
        this.playerCart.hp = 100;

        this.takeshiTank.x = this.canvas.width * 0.65;
        this.takeshiTank.hp = 150;
        this.takeshiTank.shootTimer = 0;

        this.playerLasers = [];
        this.enemyLasers = [];

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        // Player Cart Movement
        if (controls.states.left && this.playerCart.x > 120) {
            this.playerCart.x -= this.playerCart.speed * dt;
        } else if (controls.states.right && this.playerCart.x < this.canvas.width - 120) {
            this.playerCart.x += this.playerCart.speed * dt;
        }

        // Shoot Laser Water Cannon
        if (controls.states.actionPressed || controls.states.up) {
            this.playerLasers.push({
                x: this.playerCart.x,
                y: this.playerCart.y - 40,
                vy: -720
            });
            gameAudio.playLaser();
            controls.resetSingleTriggers();
        }

        // Update Player Lasers
        for (let i = this.playerLasers.length - 1; i >= 0; i--) {
            const l = this.playerLasers[i];
            l.y += l.vy * dt;

            const tankDist = Math.hypot(l.x - this.takeshiTank.x, l.y - this.takeshiTank.y);
            if (tankDist < 60) {
                this.takeshiTank.hp -= 15;
                gameAudio.playTargetHit();
                commentary.trigger('finalAssaultShoot');
                vfx.triggerCameraShake(10, 0.25);
                vfx.addSparks(l.x, l.y, 30);
                this.playerLasers.splice(i, 1);

                if (this.takeshiTank.hp <= 0) {
                    this.takeshiTank.hp = 0;
                    this.isComplete = true;
                    gameAudio.playVictory();
                    commentary.trigger('gameVictory');
                }
                continue;
            }

            if (l.y < 0) this.playerLasers.splice(i, 1);
        }

        // Takeshi Tank Movement
        this.takeshiTank.x += Math.sin(Date.now() * 0.0035) * this.takeshiTank.speed * dt;

        // Takeshi Tank Firing
        this.takeshiTank.shootTimer += dt;
        if (this.takeshiTank.shootTimer >= this.takeshiTank.shootInterval) {
            this.takeshiTank.shootTimer = 0;
            this.enemyLasers.push({
                x: this.takeshiTank.x + (Math.random() * 40 - 20),
                y: this.takeshiTank.y + 40,
                vy: 500
            });
        }

        // Update Enemy Lasers
        for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
            const el = this.enemyLasers[i];
            el.y += el.vy * dt;

            const pDist = Math.hypot(el.x - this.playerCart.x, el.y - this.playerCart.y);
            if (pDist < 50) {
                this.playerCart.hp -= 20;
                gameAudio.playFailHorn();
                commentary.trigger('finalAssaultHit');
                vfx.triggerCameraShake(14, 0.35);
                vfx.addSparks(el.x, el.y, 30);
                this.enemyLasers.splice(i, 1);

                if (this.playerCart.hp <= 0) {
                    this.playerCart.hp = 0;
                    this.isFailed = true;
                }
                continue;
            }

            if (el.y > this.canvas.height) this.enemyLasers.splice(i, 1);
        }
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // Night Sky Backdrop (From Photo 2)
        this.ctx.fillStyle = '#080816';
        this.ctx.fillRect(0, 0, w, h);

        // Render Takeshi's Fortress & Stone Towers (From Photo 2)
        const fortY = h * 0.15;
        this.ctx.fillStyle = '#3a3430'; // Stone Walls
        this.ctx.fillRect(w * 0.15, fortY + 40, w * 0.7, 120);

        // Stone Battlements
        this.ctx.fillStyle = '#26221f';
        for (let bx = w * 0.15; bx < w * 0.85; bx += 40) {
            this.ctx.fillRect(bx, fortY + 20, 20, 25);
        }

        // Side Stone Watchtowers (Photo 2)
        this.ctx.fillStyle = '#6e5a4a';
        this.ctx.fillRect(w * 0.1, fortY - 20, 60, 180); // Left Tower
        this.ctx.fillRect(w * 0.82, fortY - 20, 60, 180); // Right Tower

        // Ground Arena Dirt
        this.ctx.fillStyle = '#222222';
        this.ctx.fillRect(0, h * 0.45, w, h * 0.55);

        // Health Bars
        // Boss Paper Target HP Bar
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(w / 2 - 160, 40, 320, 20);
        this.ctx.fillStyle = '#ff2a5f';
        const bossW = (this.takeshiTank.hp / this.takeshiTank.maxHp) * 320;
        this.ctx.fillRect(w / 2 - 160, 40, Math.max(0, bossW), 20);
        this.ctx.strokeStyle = '#ffd000';
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect(w / 2 - 160, 40, 320, 20);

        // Player Paper Target HP Bar
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(60, h - 45, 240, 18);
        this.ctx.fillStyle = '#00f2ff';
        const pW = (this.playerCart.hp / this.playerCart.maxHp) * 240;
        this.ctx.fillRect(60, h - 45, Math.max(0, pW), 18);

        // 1. Render Count Takeshi's Tank Vehicle (From Photo 2)
        this.ctx.save();
        this.ctx.translate(this.takeshiTank.x, this.takeshiTank.y);

        // White Armor Tank Body (Photo 2)
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.beginPath();
        this.ctx.roundRect(-60, -30, 120, 60, 10);
        this.ctx.fill();
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Front Paper Ring Target
        this.ctx.fillStyle = '#ffd000';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ff2a5f';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.font = '32px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('👹', 0, -35);

        this.ctx.restore();

        // 2. Render Player White Laser Cart (From Photo 2)
        this.ctx.save();
        this.ctx.translate(this.playerCart.x, this.playerCart.y);

        // 3D Shadow
        vfx.render3DShadow(this.ctx, 0, 20, 45, 12, 0.5);

        // White Laser Cart (Exact Design from Photo 2!)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.roundRect(-45, -25, 90, 50, 8);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff2a5f';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Paper Target Ring on Front Hood
        this.ctx.fillStyle = '#ffd000';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ff2a5f';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Contestant Driver
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, 0, -30, 'IDLE', charIdx, 1.1, true);

        this.ctx.restore();

        // Water Cannon Laser Beams
        this.ctx.fillStyle = '#00f2ff';
        for (const l of this.playerLasers) {
            this.ctx.beginPath();
            this.ctx.arc(l.x, l.y, 7, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.fillStyle = '#ff2a5f';
        for (const el of this.enemyLasers) {
            this.ctx.beginPath();
            this.ctx.arc(el.x, el.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);
        this.ctx.restore();
    }
}
