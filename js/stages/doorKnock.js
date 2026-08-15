/* ==========================================================================
   Stage 5: Fixed Interactive Knock Knock Doors (नक नक के दरवाजे!)
   ========================================================================== */

class DoorKnockStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "Knock Knock Doors";
        this.isComplete = false;
        this.isFailed = false;

        this.wallsCount = 3;
        this.currentWall = 0;
        this.doorsPerWall = 4;

        this.player = {
            x: 150,
            y: 360,
            targetX: 150,
            targetY: 360,
            isRunning: false,
            animState: 'IDLE'
        };

        this.walls = [];
        this.init();
        this.bindClick();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;
        this.currentWall = 0;

        const h = this.canvas.height;
        this.player.y = h * 0.52;
        this.player.x = 150;
        this.player.targetX = 150;
        this.player.targetY = this.player.y;
        this.player.isRunning = false;
        this.player.animState = 'IDLE';

        this.walls = [];
        for (let wIdx = 0; wIdx < this.wallsCount; wIdx++) {
            const doors = [];
            const paperIndex = Math.floor(Math.random() * this.doorsPerWall);
            const guardIndex = (paperIndex + 1) % this.doorsPerWall;

            for (let d = 0; d < this.doorsPerWall; d++) {
                let type = 'solid';
                if (d === paperIndex) type = 'paper';
                else if (d === guardIndex) type = 'guard';

                doors.push({
                    index: d,
                    type,
                    isBroken: false,
                    y: h * 0.32 + d * 105
                });
            }

            this.walls.push({
                x: 380 + wIdx * 350,
                doors
            });
        }

        commentary.trigger('stageStart');
    }

    bindClick() {
        // Direct click on door to select
        const clickHandler = (e) => {
            if (this.player.isRunning || this.currentWall >= this.wallsCount) return;

            const rect = this.canvas.getBoundingClientRect();
            const clickY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;

            const wall = this.walls[this.currentWall];
            if (!wall) return;

            for (let d = 0; d < this.doorsPerWall; d++) {
                const door = wall.doors[d];
                if (Math.abs(clickY - door.y) < 50) {
                    this.tryDoor(d);
                    break;
                }
            }
        };

        this.canvas.addEventListener('click', clickHandler);
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        // Key controls mapping: UP=Door0, LEFT=Door1, DOWN=Door2, RIGHT=Door3 or Spacebar=auto
        if (!this.player.isRunning && this.currentWall < this.wallsCount) {
            if (controls.states.up) {
                this.tryDoor(0);
                controls.states.up = false;
            } else if (controls.states.left) {
                this.tryDoor(1);
                controls.states.left = false;
            } else if (controls.states.down) {
                this.tryDoor(2);
                controls.states.down = false;
            } else if (controls.states.right) {
                this.tryDoor(3);
                controls.states.right = false;
            } else if (controls.states.actionPressed) {
                const paperDoor = this.walls[this.currentWall].doors.find(d => d.type === 'paper') || this.walls[this.currentWall].doors[0];
                this.tryDoor(paperDoor.index);
                controls.resetSingleTriggers();
            }
        }

        if (this.player.isRunning) {
            this.player.x += dt * 420;
            this.player.animState = 'RUNNING';

            const wall = this.walls[this.currentWall];
            if (wall && this.player.x >= wall.x - 45) {
                this.player.x = wall.x - 45;
                this.player.isRunning = false;
                this.checkDoorHit(wall);
            }
        }
    }

    tryDoor(doorIndex) {
        if (this.player.isRunning || this.currentWall >= this.wallsCount) return;

        const wall = this.walls[this.currentWall];
        const door = wall.doors[doorIndex];

        if (door) {
            this.player.targetDoorIndex = doorIndex;
            this.player.targetY = door.y;
            this.player.y = door.y;
            this.player.isRunning = true;
            gameAudio.playJump();
        }
    }

    checkDoorHit(wall) {
        const door = wall.doors[this.player.targetDoorIndex];
        if (!door) return;

        if (door.type === 'paper') {
            door.isBroken = true;
            gameAudio.playTargetHit();
            commentary.trigger('steppingStonesNearMiss');
            vfx.addSparks(this.player.x, this.player.y, 30);

            this.currentWall++;
            this.player.x += 90;

            if (this.currentWall >= this.wallsCount) {
                this.isComplete = true;
                gameAudio.playVictory();
                commentary.trigger('stageClear');
            } else {
                this.player.animState = 'IDLE';
            }
        } else if (door.type === 'guard') {
            door.isBroken = true;
            this.isFailed = true;
            gameAudio.playGuardCatch();
            gameAudio.playFailHorn();
            commentary.trigger('mazeCaught');
            vfx.triggerCameraShake(16, 0.45);
        } else { // Solid Wood Door
            gameAudio.playFailHorn();
            vfx.triggerCameraShake(12, 0.35);
            this.player.animState = 'BALANCE_WOBBLE';
            this.player.x -= 50; // Bounce back
            commentary.trigger('wipeoutHit');
        }
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        vfx.renderHillyBackground(this.ctx, w, h, 0);

        // Ground Corridor
        this.ctx.fillStyle = '#2b231d';
        this.ctx.fillRect(0, h * 0.28, w, h * 0.58);

        // Render Walls & Interactive Doors
        for (let wIdx = 0; wIdx < this.walls.length; wIdx++) {
            const wall = this.walls[wIdx];

            // Wall Beam
            this.ctx.fillStyle = '#8b5a2b';
            this.ctx.fillRect(wall.x, h * 0.28, 28, h * 0.58);

            for (const door of wall.doors) {
                this.ctx.save();
                this.ctx.translate(wall.x, door.y);

                if (door.isBroken) {
                    this.ctx.fillStyle = '#333';
                    this.ctx.fillRect(-6, -40, 12, 80);
                    if (door.type === 'guard') {
                        this.ctx.font = '36px sans-serif';
                        this.ctx.fillText('👹', 12, 0);
                    }
                } else {
                    const doorGrad = this.ctx.createLinearGradient(0, -40, 0, 40);
                    doorGrad.addColorStop(0, '#e0b080');
                    doorGrad.addColorStop(1, '#8b5a2b');
                    this.ctx.fillStyle = doorGrad;
                    this.ctx.fillRect(-10, -40, 20, 80);
                    this.ctx.strokeStyle = '#222';
                    this.ctx.lineWidth = 2.5;
                    this.ctx.strokeRect(-10, -40, 20, 80);

                    // Door Knob & Door Number
                    this.ctx.fillStyle = '#ffd000';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Key Hint Label on Door
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = 'bold 11px Fredoka';
                    this.ctx.textAlign = 'center';
                    const keyHints = ['▲ UP', '◄ LEFT', '▼ DOWN', '► RIGHT'];
                    this.ctx.fillText(keyHints[door.index], 0, -20);
                }

                this.ctx.restore();
            }
        }

        // On-screen Instruction Banner for Stage 5
        if (!this.player.isRunning && this.currentWall < this.wallsCount) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(w / 2 - 220, h - 80, 440, 40);
            this.ctx.fillStyle = '#ffd000';
            this.ctx.font = 'bold 16px Fredoka';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("CLICK DOOR OR PRESS ARROW/SPACE TO RUN!", w / 2, h - 55);
        }

        vfx.renderSakuraPetals(this.ctx);
        vfx.renderParticles(this.ctx);

        // Render Realistic Human Runner
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, this.player.x, this.player.y, this.player.animState, charIdx, 1.4, true);

        this.ctx.restore();
    }
}
