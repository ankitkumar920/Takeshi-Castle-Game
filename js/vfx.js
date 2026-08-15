/* ==========================================================================
   Ultra 3D Graphics & Takeshi Castle Environment (Image Matched)
   ========================================================================== */

class VFXEngine {
    constructor() {
        this.cameraShakeTime = 0;
        this.cameraShakeIntensity = 0;
        this.particles = [];
        this.sakuraPetals = [];
        this.waterTime = 0;

        this.initSakura();
    }

    initSakura() {
        this.sakuraPetals = [];
        for (let i = 0; i < 45; i++) {
            this.sakuraPetals.push({
                x: Math.random() * 1920,
                y: Math.random() * 1080,
                vx: -30 - Math.random() * 50,
                vy: 40 + Math.random() * 60,
                size: 4.5 + Math.random() * 6,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 4
            });
        }
    }

    triggerCameraShake(intensity = 15, duration = 0.45) {
        this.cameraShakeIntensity = intensity;
        this.cameraShakeTime = duration;
    }

    addSplash(x, y, color = '#33b5e5', count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 300;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 170,
                size: 4 + Math.random() * 6.5,
                alpha: 1.0,
                color: Math.random() < 0.6 ? color : '#ffffff',
                gravity: 540
            });
        }
    }

    addSparks(x, y, count = 35) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 140 + Math.random() * 340;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4.5,
                alpha: 1.0,
                color: Math.random() < 0.5 ? '#ffd000' : '#ff2a5f',
                gravity: 250
            });
        }
    }

    update(dt) {
        this.waterTime += dt * 3.0;

        if (this.cameraShakeTime > 0) {
            this.cameraShakeTime -= dt;
            if (this.cameraShakeTime <= 0) {
                this.cameraShakeIntensity = 0;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.alpha -= dt * 1.5;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (const petal of this.sakuraPetals) {
            petal.x += petal.vx * dt;
            petal.y += petal.vy * dt;
            petal.angle += petal.spin * dt;

            if (petal.y > 1100 || petal.x < -30) {
                petal.y = -20;
                petal.x = Math.random() * 2000;
            }
        }
    }

    applyCameraShake(ctx) {
        if (this.cameraShakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * this.cameraShakeIntensity * 2;
            const dy = (Math.random() - 0.5) * this.cameraShakeIntensity * 2;
            ctx.translate(dx, dy);
        }
    }

    render3DShadow(ctx, x, y, width = 30, height = 12, alpha = 0.45) {
        ctx.save();
        ctx.translate(x + 8, y + 6);
        ctx.skewX = -0.3;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // RENDER THE EXACT MULTI-TIERED TAKESHI CASTLE FROM USER PHOTO 1!
    renderHillyBackground(ctx, width, height, scrollX = 0) {
        ctx.save();

        // Sky Backdrop
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
        skyGrad.addColorStop(0, '#10142c');
        skyGrad.addColorStop(0.4, '#241b38');
        skyGrad.addColorStop(0.7, '#4d2045');
        skyGrad.addColorStop(1, '#9b4b60');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Surrounding Dense Forest Trees (From Photo)
        ctx.fillStyle = '#1c452b';
        for (let x = -50; x <= width + 50; x += 60) {
            ctx.beginPath();
            ctx.arc(x, 260 + Math.sin(x * 0.01) * 20, 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Multi-Tiered Takeshi's Castle (Centered Background)
        const castleX = width * 0.5 - (scrollX * 0.15) % 200;
        const castleY = height * 0.12;

        ctx.save();
        ctx.translate(castleX, castleY);

        // 1. Castle Base Steampunk Gear Wall
        ctx.fillStyle = '#3a2e39';
        ctx.fillRect(-180, 220, 360, 100);

        // Golden Steampunk Gears & Clocks (From Photo 1 Base)
        ctx.fillStyle = '#ffd000';
        ctx.beginPath();
        ctx.arc(-90, 260, 28, 0, Math.PI * 2);
        ctx.arc(80, 265, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff2a5f';
        ctx.beginPath();
        ctx.arc(-90, 260, 14, 0, Math.PI * 2);
        ctx.arc(80, 265, 18, 0, Math.PI * 2);
        ctx.fill();

        // 2. Yellow Facade Wall Tier 1
        ctx.fillStyle = '#fceb71'; // Vibrant Yellow (Photo 1)
        ctx.fillRect(-160, 120, 320, 100);

        // Red Balcony Railing
        ctx.fillStyle = '#ff2a5f';
        ctx.fillRect(-130, 160, 260, 12);
        ctx.fillRect(-130, 150, 260, 4);

        // Gold Gable Crest Emblem ("北" Badge from Photo 1)
        ctx.fillStyle = '#ffd000';
        ctx.beginPath();
        ctx.moveTo(-70, 120);
        ctx.lineTo(0, 70);
        ctx.lineTo(70, 120);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ff2a5f';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#222';
        ctx.font = 'bold 22px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText("北", 0, 108);

        // 3. Purple & Green Tiered Roofs (Photo 1)
        // Roof Tier 1 (Green)
        ctx.fillStyle = '#1e7555';
        ctx.beginPath();
        ctx.moveTo(-200, 120); ctx.lineTo(0, 60); ctx.lineTo(200, 120); ctx.fill();

        // Yellow Facade Tier 2
        ctx.fillStyle = '#fceb71';
        ctx.fillRect(-120, 30, 240, 50);

        // Roof Tier 2 (Purple)
        ctx.fillStyle = '#8a2be2';
        ctx.beginPath();
        ctx.moveTo(-150, 30); ctx.lineTo(0, -20); ctx.lineTo(150, 30); ctx.fill();

        // Yellow Facade Tier 3
        ctx.fillStyle = '#fceb71';
        ctx.fillRect(-80, -40, 160, 40);

        // Top Roof Pagoda (Purple & Pink)
        ctx.fillStyle = '#8a2be2';
        ctx.beginPath();
        ctx.moveTo(-100, -40); ctx.lineTo(0, -90); ctx.lineTo(100, -40); ctx.fill();
        ctx.fillStyle = '#ffd000';
        ctx.fillRect(-6, -110, 12, 20); // Gold Spire

        // 4. Inflatable Side Yellow & Red Tube Slide (Right side of Photo 1!)
        ctx.fillStyle = '#ffd000';
        ctx.beginPath();
        ctx.arc(170, 120, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff2a5f';
        ctx.beginPath();
        ctx.arc(170, 120, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff2a5f';
        ctx.fillRect(150, 140, 40, 120);

        // 5. Red Japanese Lanterns on Stone Wall (Bottom of Photo 1)
        ctx.fillStyle = '#8a7c6f'; // Stone Blocks
        ctx.fillRect(-220, 320, 440, 30);

        for (let lx = -180; lx <= 180; lx += 60) {
            // Lantern Post & Red Lantern
            ctx.fillStyle = '#222';
            ctx.fillRect(lx - 2, 305, 4, 15);
            ctx.fillStyle = '#ff2a5f';
            ctx.fillRect(lx - 10, 290, 20, 16);
            ctx.fillStyle = '#ffd000';
            ctx.fillRect(lx - 6, 294, 12, 8); // Light Glow
        }

        ctx.restore();

        ctx.restore();
    }

    renderSakuraPetals(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffb7c5';
        for (const p of this.sakuraPetals) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    renderParticles(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

const vfx = new VFXEngine();
