/* ==========================================================================
   Keyboard & Mobile Virtual Controller Handler for Takeshi's Castle
   ========================================================================== */

class ControlsManager {
    constructor() {
        this.states = {
            up: false,
            down: false,
            left: false,
            right: false,
            action: false,        // Held down
            actionPressed: false  // Single frame trigger
        };

        this.initKeyboard();
        this.initTouch();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.handleKey(e.code, true);
        });

        window.addEventListener('keyup', (e) => {
            this.handleKey(e.code, false);
        });
    }

    handleKey(code, isDown) {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.states.up = isDown;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.states.down = isDown;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.states.left = isDown;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.states.right = isDown;
                break;
            case 'Space':
            case 'KeyJ':
            case 'Enter':
                if (isDown && !this.states.action) {
                    this.states.actionPressed = true;
                }
                this.states.action = isDown;
                break;
        }
    }

    initTouch() {
        const bindBtn = (id, stateKey) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const startHandler = (e) => {
                e.preventDefault();
                this.states[stateKey] = true;
                if (stateKey === 'action') this.states.actionPressed = true;
            };

            const endHandler = (e) => {
                e.preventDefault();
                this.states[stateKey] = false;
            };

            btn.addEventListener('touchstart', startHandler, { passive: false });
            btn.addEventListener('touchend', endHandler, { passive: false });
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('mouseleave', endHandler);
        };

        bindBtn('btn-touch-up', 'up');
        bindBtn('btn-touch-down', 'down');
        bindBtn('btn-touch-left', 'left');
        bindBtn('btn-touch-right', 'right');
        bindBtn('btn-touch-action', 'action');
    }

    resetSingleTriggers() {
        this.states.actionPressed = false;
    }
}

const controls = new ControlsManager();
