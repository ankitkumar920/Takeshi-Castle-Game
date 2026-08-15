/* ==========================================================================
   Stage 2: Widescreen 3D Honeycomb Maze (हनीकॉम्ब भूलभुलैया)
   ========================================================================== */

class HoneycombMazeStage {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.title = "The Honeycomb Maze";
        this.isComplete = false;
        this.isFailed = false;

        this.rows = 3;
        this.cols = 5;
        this.rooms = [];
        this.playerRoom = { r: 1, c: 0 };
        this.exitRoom = { r: 1, c: 4 };

        this.player = {
            x: 0, y: 0,
            targetX: 0, targetY: 0,
            isMoving: false,
            moveProgress: 0,
            animState: 'IDLE'
        };

        this.guards = [];
        this.init();
    }

    init() {
        this.isComplete = false;
        this.isFailed = false;

        this.playerRoom = { r: 1, c: 0 };
        this.exitRoom = { r: 1, c: 4 };

        this.rooms = [];
        const roomW = 180;
        const roomH = 150;
        const startX = 220;
        const startY = 240;

        for (let r = 0; r < this.rows; r++) {
            const rowArr = [];
            for (let c = 0; c < this.cols; c++) {
                const rx = startX + c * roomW;
                const ry = startY + r * roomH;

                rowArr.push({
                    r, c,
                    x: rx, y: ry,
                    isExit: (r === this.exitRoom.r && c === this.exitRoom.c),
                    isDeadEnd: (r === 0 && c === 2) || (r === 2 && c === 3)
                });
            }
            this.rooms.push(rowArr);
        }

        const pRoom = this.rooms[this.playerRoom.r][this.playerRoom.c];
        this.player.x = pRoom.x;
        this.player.y = pRoom.y;
        this.player.targetX = pRoom.x;
        this.player.targetY = pRoom.y;
        this.player.isMoving = false;

        // Guards
        this.guards = [
            {
                r: 0, c: 1,
                x: this.rooms[0][1].x, y: this.rooms[0][1].y,
                targetX: this.rooms[0][1].x, targetY: this.rooms[0][1].y,
                patrolPath: [{r:0,c:1}, {r:0,c:2}, {r:1,c:2}, {r:0,c:1}],
                patrolIndex: 0, moveTimer: 0, moveInterval: 1.5
            },
            {
                r: 2, c: 3,
                x: this.rooms[2][3].x, y: this.rooms[2][3].y,
                targetX: this.rooms[2][3].x, targetY: this.rooms[2][3].y,
                patrolPath: [{r:2,c:3}, {r:2,c:2}, {r:1,c:2}, {r:2,c:3}],
                patrolIndex: 0, moveTimer: 0, moveInterval: 1.3
            }
        ];

        commentary.trigger('stageStart');
    }

    update(dt) {
        vfx.update(dt);
        if (this.isComplete || this.isFailed) return;

        if (this.player.isMoving) {
            this.player.moveProgress += dt * 4;
            this.player.animState = 'RUNNING';

            if (this.player.moveProgress >= 1) {
                this.player.moveProgress = 1;
                this.player.isMoving = false;
                this.player.x = this.player.targetX;
                this.player.y = this.player.targetY;
                this.player.animState = 'IDLE';
                this.checkRoomEvents();
            } else {
                this.player.x = this.player.startX + (this.player.targetX - this.player.startX) * this.player.moveProgress;
                this.player.y = this.player.startY + (this.player.targetY - this.player.startY) * this.player.moveProgress;
            }
        } else {
            let dr = 0, dc = 0;
            if (controls.states.up || controls.states.actionPressed) dr = -1;
            else if (controls.states.down) dr = 1;
            else if (controls.states.left) dc = -1;
            else if (controls.states.right) dc = 1;

            if (controls.states.actionPressed) controls.resetSingleTriggers();

            if (dr !== 0 || dc !== 0) {
                const targetR = this.playerRoom.r + dr;
                const targetC = this.playerRoom.c + dc;

                if (targetR >= 0 && targetR < this.rows && targetC >= 0 && targetC < this.cols) {
                    this.moveToRoom(targetR, targetC);
                }
            }
        }

        for (const g of this.guards) {
            g.moveTimer += dt;
            if (g.moveTimer >= g.moveInterval) {
                g.moveTimer = 0;
                g.patrolIndex = (g.patrolIndex + 1) % g.patrolPath.length;
                const nextPos = g.patrolPath[g.patrolIndex];
                g.r = nextPos.r;
                g.c = nextPos.c;

                const room = this.rooms[g.r][g.c];
                g.targetX = room.x;
                g.targetY = room.y;

                if (Math.abs(g.r - this.playerRoom.r) + Math.abs(g.c - this.playerRoom.c) <= 1) {
                    gameAudio.playGuardCatch();
                    commentary.trigger('mazeGuardAlert');
                }
            }

            g.x += (g.targetX - g.x) * dt * 5;
            g.y += (g.targetY - g.y) * dt * 5;

            if (g.r === this.playerRoom.r && g.c === this.playerRoom.c && !this.player.isMoving) {
                this.triggerCaught();
            }
        }
    }

    moveToRoom(r, c) {
        this.playerRoom = { r, c };
        const room = this.rooms[r][c];

        this.player.startX = this.player.x;
        this.player.startY = this.player.y;
        this.player.targetX = room.x;
        this.player.targetY = room.y;
        this.player.isMoving = true;
        this.player.moveProgress = 0;

        gameAudio.playJump();
    }

    checkRoomEvents() {
        const curRoom = this.rooms[this.playerRoom.r][this.playerRoom.c];

        if (curRoom.isExit) {
            this.isComplete = true;
            gameAudio.playVictory();
            commentary.trigger('stageClear');
            return;
        }

        if (curRoom.isDeadEnd) {
            this.triggerCaught();
        }
    }

    triggerCaught() {
        if (this.isFailed) return;
        this.isFailed = true;
        gameAudio.playFailHorn();
        commentary.trigger('mazeCaught');
        vfx.triggerCameraShake(15, 0.4);
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        vfx.applyCameraShake(this.ctx);

        // Hilly Mountain Background
        vfx.renderHillyBackground(this.ctx, w, h, 0);

        // Render Castle Maze Courtyard
        this.ctx.fillStyle = 'rgba(15, 15, 36, 0.9)';
        this.ctx.fillRect(100, 140, w - 200, 480);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const room = this.rooms[r][c];

                this.ctx.save();
                this.ctx.translate(room.x, room.y);

                if (room.isExit) {
                    this.ctx.fillStyle = '#ff2a5f';
                } else if (room.isDeadEnd) {
                    this.ctx.fillStyle = '#111122';
                } else {
                    this.ctx.fillStyle = '#222548';
                }

                this.ctx.fillRect(-75, -60, 150, 120);
                this.ctx.strokeStyle = '#ffd000';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(-75, -60, 150, 120);

                if (room.isExit) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 16px Fredoka';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText("EXIT (बाहर)", 0, 0);
                } else if (room.isDeadEnd) {
                    this.ctx.fillStyle = '#ff2a5f';
                    this.ctx.font = '14px Fredoka';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText("TRAP!", 0, 0);
                }

                this.ctx.restore();
            }
        }

        vfx.renderSakuraPetals(this.ctx);

        // Render Realistic Human Runner
        const charIdx = gameInstance ? gameInstance.selectedCharIndex : 0;
        humanRunner.render(this.ctx, this.player.x, this.player.y + 15, this.player.animState, charIdx, 1.3, true);

        // Render Guards
        for (const g of this.guards) {
            this.ctx.save();
            this.ctx.font = '36px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('👹', g.x, g.y);
            this.ctx.restore();
        }

        vfx.renderParticles(this.ctx);
        this.ctx.restore();
    }
}
