/* ==========================================================================
   Ultra 3D Human Contestant Renderer & Procedural Animator
   ========================================================================== */

class HumanRunner {
    constructor() {
        this.animTime = 0;
        this.colorPalettes = [
            { shirt: '#ff2a5f', shirtDark: '#b80036', pants: '#1a1a2e', skin: '#f1c27d', hair: '#222' }, // Red Hero
            { shirt: '#00f2ff', shirtDark: '#0099ab', pants: '#0d1b2a', skin: '#e0ac69', hair: '#111' }, // Blue Ninja
            { shirt: '#2ec4b6', shirtDark: '#1b7a70', pants: '#1b4332', skin: '#f1c27d', hair: '#4a2e16' }, // Green Samurai
            { shirt: '#ffd000', shirtDark: '#b89600', pants: '#3d2645', skin: '#ffdbac', hair: '#222' }  // Yellow Flash
        ];
    }

    render(ctx, x, y, state = 'RUNNING', charIndex = 0, scale = 1.3, facingRight = true) {
        this.animTime += 0.08;
        const p = this.colorPalettes[charIndex % this.colorPalettes.length];

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(facingRight ? scale : -scale, scale);

        // 1. Render Projected 3D Ground Shadow
        vfx.render3DShadow(ctx, 0, 8, 22, 8, 0.45);

        // Animation States
        let headY = -48;
        let torsoAngle = 0;
        let leftArmAngle = 0;
        let rightArmAngle = 0;
        let leftLegAngle = 0;
        let rightLegAngle = 0;
        let kneeL = 0;
        let kneeR = 0;

        if (state === 'RUNNING') {
            const stride = Math.sin(this.animTime * 12);
            torsoAngle = 0.18;
            headY = -48 + Math.sin(this.animTime * 24) * 2.5;

            leftLegAngle = stride * 0.75;
            rightLegAngle = -stride * 0.75;
            kneeL = Math.max(0, -stride * 0.85);
            kneeR = Math.max(0, stride * 0.85);

            leftArmAngle = -stride * 0.85;
            rightArmAngle = stride * 0.85;
        } else if (state === 'BALANCE_WOBBLE') {
            const wobble = Math.sin(this.animTime * 10);
            torsoAngle = wobble * 0.18;
            leftArmAngle = -1.35 + wobble * 0.35;
            rightArmAngle = 1.35 - wobble * 0.35;
            leftLegAngle = 0.25;
            rightLegAngle = -0.25;
        } else if (state === 'JUMPING') {
            torsoAngle = 0.12;
            headY = -52;
            leftArmAngle = -1.3;
            rightArmAngle = -0.9;
            leftLegAngle = 0.65;
            rightLegAngle = -0.45;
            kneeL = 0.85;
            kneeR = 0.35;
        } else if (state === 'DUCKING') {
            torsoAngle = 0.85;
            headY = -30;
            leftArmAngle = 0.65;
            rightArmAngle = 0.45;
            leftLegAngle = 1.25;
            rightLegAngle = -0.25;
            kneeL = 1.45;
            kneeR = 1.05;
        } else if (state === 'FALLING_SPLASH') {
            torsoAngle = Math.sin(this.animTime * 15) * 0.65;
            leftArmAngle = Math.sin(this.animTime * 18) * 1.6;
            rightArmAngle = Math.cos(this.animTime * 18) * 1.6;
            leftLegAngle = Math.cos(this.animTime * 12) * 1.3;
            rightLegAngle = Math.sin(this.animTime * 12) * 1.3;
        } else { // IDLE
            headY = -48 + Math.sin(this.animTime * 3) * 1.5;
            leftArmAngle = 0.12;
            rightArmAngle = -0.12;
            leftLegAngle = 0.12;
            rightLegAngle = -0.12;
        }

        // 2. Draw Left Leg (Back 3D Depth)
        this.drawLimb3D(ctx, 0, -16, leftLegAngle, kneeL, 17, 17, p.pants, p.skin, true);

        // 3. Draw Left Arm (Back 3D Depth)
        this.drawArm3D(ctx, 0, -34, leftArmAngle, 15, 15, p.shirtDark, p.skin);

        // 4. Draw Torso (3D Athletic Vest with Specular Gradient)
        ctx.save();
        ctx.translate(0, -27);
        ctx.rotate(torsoAngle);

        const torsoGrad = ctx.createLinearGradient(-10, 0, 10, 0);
        torsoGrad.addColorStop(0, p.shirt);
        torsoGrad.addColorStop(1, p.shirtDark);
        ctx.fillStyle = torsoGrad;
        ctx.beginPath();
        ctx.roundRect(-9, -13, 18, 26, 5);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 3D Chest Badge Number
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -3, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('7', 0, -3);

        ctx.restore();

        // 5. Draw Right Leg (Front 3D Depth)
        this.drawLimb3D(ctx, 0, -16, rightLegAngle, kneeR, 17, 17, p.pants, p.skin, false);

        // 6. Draw Right Arm (Front 3D Depth)
        this.drawArm3D(ctx, 0, -34, rightArmAngle, 15, 15, p.shirt, p.skin);

        // 7. Draw Head, Face & Headband
        ctx.save();
        ctx.translate(0, headY);

        // Face Skin 3D Radial Shading
        const headGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
        headGrad.addColorStop(0, '#ffe4c4');
        headGrad.addColorStop(1, p.skin);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hair Cap
        ctx.fillStyle = p.hair;
        ctx.beginPath();
        ctx.arc(0, -3, 10, Math.PI, 0);
        ctx.fill();

        // Red Contestant Headband (Takeshi Castle Knot)
        ctx.fillStyle = '#ff2a5f';
        ctx.fillRect(-10, -2, 20, 3.5);
        ctx.fillRect(-12, -1, 4, 6); // Knot tails

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(4, -1, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.restore();
    }

    drawLimb3D(ctx, hipX, hipY, hipAngle, kneeAngle, upperLen, lowerLen, pantColor, skinColor, isBack) {
        ctx.save();
        ctx.translate(hipX, hipY);
        ctx.rotate(hipAngle);

        if (isBack) ctx.globalAlpha = 0.8; // Depth shading for back leg

        ctx.strokeStyle = pantColor;
        ctx.lineWidth = 7.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, upperLen);
        ctx.stroke();

        ctx.translate(0, upperLen);
        ctx.rotate(kneeAngle);
        ctx.strokeStyle = skinColor;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, lowerLen);
        ctx.stroke();

        // 3D Running Shoe
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(3, lowerLen, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff2a5f'; // Shoe Stripe
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    drawArm3D(ctx, shoulderX, shoulderY, armAngle, upperLen, lowerLen, shirtColor, skinColor) {
        ctx.save();
        ctx.translate(shoulderX, shoulderY);
        ctx.rotate(armAngle);

        ctx.strokeStyle = shirtColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, upperLen);
        ctx.stroke();

        ctx.translate(0, upperLen);
        ctx.strokeStyle = skinColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, lowerLen);
        ctx.stroke();

        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, lowerLen + 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

const humanRunner = new HumanRunner();
