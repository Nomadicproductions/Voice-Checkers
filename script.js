// Debug System for Mobile Testing - SIMPLIFIED AND FIXED
class DebugSystem {
    constructor() {
        this.errors = [];
        this.logs = [];
        this.loadingSteps = [];
        this.isVisible = false;
        this.startTime = Date.now();
    }
    
    init() {
        console.log('Debug system initializing...');
        
        // Setup the panel with a delay to ensure DOM is ready
        setTimeout(() => {
            this.setupDebugPanel();
        }, 500);
        
        // Capture all errors
        this.captureErrors();
        
        // Override console methods
        this.overrideConsole();
        
        // Track loading progress
        this.trackLoading();
        
        // Update system info
        this.updateSystemInfo();
        
        this.addLog('info', 'Debug system initialized successfully');
    }
    
    setupDebugPanel() {
        console.log('Setting up debug panel...');
        
        // Get elements
        const toggleBtn = document.getElementById('debug-toggle');
        const content = document.getElementById('debug-content');
        const closeBtn = document.getElementById('debug-close');
        
        console.log('Debug toggle button found:', !!toggleBtn);
        console.log('Debug content found:', !!content);
        
        if (toggleBtn && content) {
            // Simple click handler
            toggleBtn.onclick = () => {
                console.log('Debug button clicked');
                this.isVisible = !this.isVisible;
                content.style.display = this.isVisible ? 'block' : 'none';
                if (this.isVisible) {
                    this.updateGameState();
                }
            };
        } else {
            console.error('Debug panel elements not found!');
            // Try again after a delay
            setTimeout(() => this.setupDebugPanel(), 1000);
        }
        
        if (closeBtn && content) {
            closeBtn.onclick = () => {
                this.isVisible = false;
                content.style.display = 'none';
            };
        }
        
        // Setup quick action buttons
        this.setupQuickActions();
        
        // Clear buttons
        const clearErrorsBtn = document.getElementById('clear-errors');
        const clearConsoleBtn = document.getElementById('clear-console');
        
        if (clearErrorsBtn) {
            clearErrorsBtn.onclick = () => {
                this.errors = [];
                this.updateErrorDisplay();
            };
        }
        
        if (clearConsoleBtn) {
            clearConsoleBtn.onclick = () => {
                this.logs = [];
                this.updateConsoleDisplay();
            };
        }
    }
    
    captureErrors() {
        window.addEventListener('error', (event) => {
            const error = {
                message: event.message,
                source: event.filename,
                line: event.lineno,
                col: event.colno,
                timestamp: new Date().toLocaleTimeString(),
                stack: event.error ? event.error.stack : 'No stack trace'
            };
            this.errors.push(error);
            this.updateErrorDisplay();
            this.addLog('error', `ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                message: 'Unhandled Promise Rejection',
                reason: event.reason,
                timestamp: new Date().toLocaleTimeString()
            };
            this.errors.push(error);
            this.updateErrorDisplay();
            this.addLog('error', `Promise Rejection: ${event.reason}`);
        });
    }
    
    overrideConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        console.log = (...args) => {
            this.addLog('log', args.join(' '));
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.addLog('error', args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.addLog('warn', args.join(' '));
            originalWarn.apply(console, args);
        };
        
        console.info = (...args) => {
            this.addLog('info', args.join(' '));
            originalInfo.apply(console, args);
        };
    }
    
    addLog(type, message) {
        const log = {
            type: type,
            message: message,
            timestamp: new Date().toLocaleTimeString()
        };
        this.logs.push(log);
        
        if (this.logs.length > 100) {
            this.logs.shift();
        }
        
        if (this.isVisible) {
            this.updateConsoleDisplay();
        }
    }
    
    trackLoading() {
        this.addLoadingStep('Debug system tracking started');
        
        if (document.readyState === 'complete') {
            this.addLoadingStep('DOM already complete');
        } else {
            window.addEventListener('load', () => {
                this.addLoadingStep('Window loaded');
            });
        }
        
        setTimeout(() => {
            const checks = {
                'Loading screen': document.getElementById('loading-screen'),
                'Intro scene': document.getElementById('intro-scene'),
                'Start overlay': document.getElementById('start-overlay'),
                'Game container': document.getElementById('game-container'),
                'Board element': document.getElementById('board'),
                'Debug panel': document.getElementById('debug-panel'),
                'Debug toggle': document.getElementById('debug-toggle')
            };
            
            for (const [name, element] of Object.entries(checks)) {
                if (element) {
                    this.addLoadingStep(`✓ ${name} found`);
                } else {
                    this.addLoadingStep(`✗ ${name} NOT FOUND`, 'error');
                }
            }
            
            this.updateLoadingDisplay();
        }, 1000);
    }
    
    addLoadingStep(step, type = 'success') {
        const timestamp = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.loadingSteps.push({
            step: step,
            type: type,
            time: `${timestamp}s`
        });
        if (this.isVisible) {
            this.updateLoadingDisplay();
        }
    }
    
    updateSystemInfo() {
        const info = document.getElementById('debug-system-info');
        if (!info) return;
        
        const userAgent = navigator.userAgent;
        const platform = navigator.platform || 'Unknown';
        const screenSize = `${window.innerWidth}x${window.innerHeight}`;
        const pixelRatio = window.devicePixelRatio || 1;
        const online = navigator.onLine ? 'Yes' : 'No';
        const touchDevice = 'ontouchstart' in window ? 'Yes' : 'No';
        
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        info.innerHTML = `
            <div>Browser: ${browser}</div>
            <div>Platform: ${platform}</div>
            <div>Mobile: ${isMobile ? 'Yes' : 'No'}</div>
            <div>Screen: ${screenSize} @${pixelRatio}x</div>
            <div>Touch: ${touchDevice}</div>
            <div>Online: ${online}</div>
            <div>User: joeyaugust1</div>
            <div>Time: 2025-09-06 10:25:34 UTC</div>
        `;
    }
    
    updateLoadingDisplay() {
        const display = document.getElementById('debug-loading-status');
        if (!display) return;
        
        const html = this.loadingSteps.map(step => {
            const color = step.type === 'error' ? '#ff6b6b' : '#4ade80';
            return `<div style="color: ${color}">[${step.time}] ${step.step}</div>`;
        }).join('');
        
        display.innerHTML = html || '<div>No loading steps recorded</div>';
    }
    
    updateErrorDisplay() {
        const display = document.getElementById('debug-errors');
        if (!display) return;
        
        if (this.errors.length === 0) {
            display.innerHTML = '<div style="color: #4ade80">No errors detected</div>';
        } else {
            const html = this.errors.map(error => {
                return `
                    <div class="error-entry">
                        <div>[${error.timestamp}] ${error.message}</div>
                        ${error.source ? `<div>Source: ${error.source}:${error.line}:${error.col}</div>` : ''}
                    </div>
                `;
            }).join('');
            display.innerHTML = html;
        }
    }
    
    updateConsoleDisplay() {
        const display = document.getElementById('debug-console');
        if (!display) return;
        
        const html = this.logs.map(log => {
            return `<div class="console-entry ${log.type}">[${log.timestamp}] ${log.message}</div>`;
        }).join('');
        
        display.innerHTML = html || '<div>No console logs</div>';
        display.scrollTop = display.scrollHeight;
    }
    
    updateGameState() {
        const display = document.getElementById('debug-game-state');
        if (!display) return;
        
        const gameState = {
            'Current Player': typeof currentPlayer !== 'undefined' ? currentPlayer : 'undefined',
            'Game Mode': typeof gameMode !== 'undefined' ? gameMode : 'undefined',
            'AI Difficulty': typeof aiDifficulty !== 'undefined' ? aiDifficulty : 'undefined',
            'Game Ended': typeof gameEnded !== 'undefined' ? gameEnded : 'undefined',
            'Must Capture': typeof mustCapture !== 'undefined' ? mustCapture : 'undefined',
            'Selected Piece': typeof selectedPiece !== 'undefined' ? (selectedPiece ? `${selectedPiece.row},${selectedPiece.col}` : 'null') : 'undefined',
            'Voice Enabled': typeof voiceFeedbackEnabled !== 'undefined' ? voiceFeedbackEnabled : 'undefined',
            'Is Listening': typeof isListening !== 'undefined' ? isListening : 'undefined'
        };
        
        const html = Object.entries(gameState).map(([key, value]) => {
            return `<div>${key}: ${value}</div>`;
        }).join('');
        
        display.innerHTML = html;
    }
    
    setupQuickActions() {
        const skipIntroBtn = document.getElementById('debug-skip-intro');
        if (skipIntroBtn) {
            skipIntroBtn.onclick = () => {
                const loadingScreen = document.getElementById('loading-screen');
                const introScene = document.getElementById('intro-scene');
                const startOverlay = document.getElementById('start-overlay');
                
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (introScene) introScene.style.display = 'none';
                if (startOverlay) startOverlay.style.display = 'flex';
                
                this.addLog('info', 'Skipped intro sequence');
            };
        }
        
        const forceStartBtn = document.getElementById('debug-force-start');
        if (forceStartBtn) {
            forceStartBtn.onclick = () => {
                const loadingScreen = document.getElementById('loading-screen');
                const introScene = document.getElementById('intro-scene');
                const startOverlay = document.getElementById('start-overlay');
                const gameContainer = document.getElementById('game-container');
                
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (introScene) introScene.style.display = 'none';
                if (startOverlay) startOverlay.style.display = 'none';
                if (gameContainer) gameContainer.style.display = 'flex';
                
                if (typeof initializeGame === 'function') {
                    initializeGame();
                    this.addLog('info', 'Force started game');
                } else {
                    this.addLog('error', 'initializeGame function not found');
                }
            };
        }
        
        const reloadBtn = document.getElementById('debug-reload');
        if (reloadBtn) {
            reloadBtn.onclick = () => {
                location.reload();
            };
        }
        
        const testAudioBtn = document.getElementById('debug-test-audio');
        if (testAudioBtn) {
            testAudioBtn.onclick = () => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 440;
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.3;
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                    
                    this.addLog('info', 'Audio test played');
                } catch (e) {
                    this.addLog('error', `Audio test failed: ${e.message}`);
                }
            };
        }
        
        const exportBtn = document.getElementById('debug-export-log');
        if (exportBtn) {
            exportBtn.onclick = () => {
                const logData = {
                    timestamp: '2025-09-06 10:25:34 UTC',
                    user: 'joeyaugust1',
                    system: {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        screen: `${window.innerWidth}x${window.innerHeight}`
                    },
                    errors: this.errors,
                    logs: this.logs,
                    loadingSteps: this.loadingSteps
                };
                
                const dataStr = JSON.stringify(logData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `debug-log-${Date.now()}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                
                this.addLog('info', 'Debug log exported');
            };
        }
    }
}

// Initialize debug system
let debugSystem = null;

// Tutorial System for AI vs AI Demonstration
class CheckersTutorial {
    constructor() {
        this.scenarios = [];
        this.currentScenarioIndex = 0;
        this.currentMoveIndex = 0;
        this.playbackSpeed = 1.0;
        this.isPaused = false;
        this.isPlaying = false;
        this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
        
        this.initializeScenarios();
    }
    
    initializeScenarios() {
        this.scenarios = [
            this.createBasicMoveScenario(),
            this.createCaptureScenario(),
            this.createMultiCaptureScenario(),
            this.createKingPromotionScenario(),
            this.createKingMovementScenario()
        ];
    }
    
    createBasicMoveScenario() {
        return {
            id: 'basicMove',
            title: 'Basic Movement',
            description: 'Learn how pieces move diagonally',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                this.tutorialBoard[5][0] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L3' };
                this.tutorialBoard[2][3] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[2][5] = { player: 2, isKing: false, label: 'N3' };
            },
            moves: [
                {
                    from: {row: 5, col: 0},
                    to: {row: 4, col: 1},
                    player: 1,
                    pauseBefore: true,
                    duration: 2000,
                    explanation: {
                        title: 'Diagonal Movement',
                        text: 'Red pieces move diagonally forward on dark squares. Watch piece L1 move.',
                        highlightPiece: {row: 5, col: 0},
                        highlightSquares: [{row: 4, col: 1}],
                        arrow: {from: {row: 5, col: 0}, to: {row: 4, col: 1}}
                    }
                }
            ]
        };
    }
    
    createCaptureScenario() {
        return {
            id: 'capture',
            title: 'Capturing Opponent Pieces',
            description: 'Learn how to capture enemy pieces',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[4][3] = { player: 2, isKing: false, label: 'N1' };
            },
            moves: [
                {
                    from: {row: 5, col: 2},
                    to: {row: 3, col: 4},
                    player: 1,
                    pauseBefore: true,
                    duration: 2500,
                    isCapture: true,
                    capturedPiece: {row: 4, col: 3},
                    explanation: {
                        title: 'Capturing Pieces',
                        text: 'To capture, jump over an opponent piece diagonally. The jumped piece is removed.',
                        highlightPiece: {row: 5, col: 2},
                        highlightSquares: [{row: 3, col: 4}],
                        highlightCaptured: {row: 4, col: 3},
                        arrow: {from: {row: 5, col: 2}, to: {row: 3, col: 4}}
                    }
                }
            ]
        };
    }
    
    createMultiCaptureScenario() {
        return {
            id: 'multiCapture',
            title: 'Multiple Captures',
            description: 'Chain captures in one turn',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                this.tutorialBoard[6][1] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[5][2] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[3][4] = { player: 2, isKing: false, label: 'N3' };
            },
            moves: [
                {
                    from: {row: 6, col: 1},
                    to: {row: 4, col: 3},
                    player: 1,
                    pauseBefore: true,
                    duration: 2000,
                    isCapture: true,
                    capturedPiece: {row: 5, col: 2},
                    explanation: {
                        title: 'First Capture',
                        text: 'Watch L1 capture the first black piece...',
                        highlightPiece: {row: 6, col: 1},
                        highlightSquares: [{row: 4, col: 3}],
                        highlightCaptured: {row: 5, col: 2},
                        arrow: {from: {row: 6, col: 1}, to: {row: 4, col: 3}}
                    }
                }
            ]
        };
    }
    
    createKingPromotionScenario() {
        return {
            id: 'kingPromotion',
            title: 'Becoming a King',
            description: 'Reach the opposite end to become a King',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                this.tutorialBoard[1][2] = { player: 1, isKing: false, label: 'L1' };
            },
            moves: [
                {
                    from: {row: 1, col: 2},
                    to: {row: 0, col: 3},
                    player: 1,
                    pauseBefore: true,
                    duration: 2500,
                    promotion: true,
                    explanation: {
                        title: 'Reaching the King Row',
                        text: 'When a piece reaches the opposite end of the board, it becomes a King!',
                        highlightPiece: {row: 1, col: 2},
                        highlightSquares: [{row: 0, col: 3}],
                        arrow: {from: {row: 1, col: 2}, to: {row: 0, col: 3}}
                    }
                }
            ]
        };
    }
    
    createKingMovementScenario() {
        return {
            id: 'kingMovement',
            title: 'King Powers',
            description: 'Kings can move forward AND backward',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                this.tutorialBoard[4][3] = { player: 1, isKing: true, label: 'L1' };
                this.tutorialBoard[3][4] = { player: 2, isKing: false, label: 'N1' };
            },
            moves: [
                {
                    from: {row: 4, col: 3},
                    to: {row: 2, col: 5},
                    player: 1,
                    pauseBefore: true,
                    duration: 2500,
                    isCapture: true,
                    capturedPiece: {row: 3, col: 4},
                    explanation: {
                        title: 'King Captures',
                        text: 'Kings can capture in any diagonal direction - forward or backward!',
                        highlightPiece: {row: 4, col: 3},
                        highlightSquares: [{row: 2, col: 5}],
                        highlightCaptured: {row: 3, col: 4}
                    }
                }
            ]
        };
    }
    
    start() {
        this.isPlaying = true;
        this.currentScenarioIndex = 0;
        this.currentMoveIndex = 0;
        this.showTutorialOverlay();
        this.playScenario();
    }
    
    playScenario() {
        const scenario = this.scenarios[this.currentScenarioIndex];
        scenario.setupBoard();
        this.renderTutorialBoard();
        this.updateProgress();
        this.currentMoveIndex = 0;
        this.playNextMove();
    }
    
    playNextMove() {
        if (!this.isPlaying) return;
        
        const scenario = this.scenarios[this.currentScenarioIndex];
        const move = scenario.moves[this.currentMoveIndex];
        
        if (!move) {
            this.nextScenario();
            return;
        }
        
        if (move.pauseBefore) {
            this.pauseAndShowExplanation(move.explanation, () => {
                this.executeMove(move);
            });
        } else {
            this.executeMove(move);
        }
    }
    
    executeMove(move) {
        this.clearHighlights();
        
        if (move.explanation && move.explanation.arrow) {
            this.showArrow(move.explanation.arrow);
        }
        
        if (move.explanation && move.explanation.highlightPiece) {
            this.highlightPiece(move.explanation.highlightPiece);
        }
        
        const duration = move.duration / this.playbackSpeed;
        
        setTimeout(() => {
            const piece = this.tutorialBoard[move.from.row][move.from.col];
            this.tutorialBoard[move.to.row][move.to.col] = piece;
            this.tutorialBoard[move.from.row][move.from.col] = null;
            
            if (move.isCapture && move.capturedPiece) {
                this.tutorialBoard[move.capturedPiece.row][move.capturedPiece.col] = null;
            }
            
            if (move.promotion && piece) {
                piece.isKing = true;
            }
            
            this.renderTutorialBoard();
            
            if (move.pauseAfter) {
                this.pauseAndShowExplanation(move.explanation, () => {
                    this.continueAfterMove();
                });
            } else {
                this.continueAfterMove();
            }
        }, duration);
    }
    
    continueAfterMove() {
        this.currentMoveIndex++;
        setTimeout(() => {
            this.playNextMove();
        }, 500 / this.playbackSpeed);
    }
    
    pauseAndShowExplanation(explanation, callback) {
        this.isPaused = true;
        
        const explBox = document.getElementById('tutorial-explanation-box');
        const titleEl = document.getElementById('explanation-title');
        const textEl = document.getElementById('explanation-text');
        const continueBtn = document.getElementById('continue-tutorial-btn');
        
        if (explBox && titleEl && textEl && continueBtn) {
            titleEl.textContent = explanation.title;
            textEl.textContent = explanation.text;
            explBox.style.display = 'block';
            
            if (explanation.highlightSquares) {
                explanation.highlightSquares.forEach(sq => {
                    this.highlightSquare(sq);
                });
            }
            
            if (explanation.highlightCaptured) {
                this.highlightCapturedPiece(explanation.highlightCaptured);
            }
            
            continueBtn.onclick = () => {
                explBox.style.display = 'none';
                this.isPaused = false;
                this.clearHighlights();
                callback();
            };
        }
    }
    
    nextScenario() {
        this.currentScenarioIndex++;
        
        if (this.currentScenarioIndex >= this.scenarios.length) {
            this.completeTutorial();
        } else {
            setTimeout(() => {
                this.playScenario();
            }, 1500);
        }
    }
    
    completeTutorial() {
        this.isPlaying = false;
        this.showCompletionMessage();
    }
    
    showCompletionMessage() {
        const explBox = document.getElementById('tutorial-explanation-box');
        const titleEl = document.getElementById('explanation-title');
        const textEl = document.getElementById('explanation-text');
        const continueBtn = document.getElementById('continue-tutorial-btn');
        
        if (explBox && titleEl && textEl && continueBtn) {
            titleEl.textContent = 'Tutorial Complete!';
            textEl.textContent = 'You now know all the essential rules of checkers. Ready to play?';
            continueBtn.textContent = 'Start Playing';
            explBox.style.display = 'block';
            
            continueBtn.onclick = () => {
                this.exitTutorial();
            };
        }
    }
    
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const scenarioTitle = document.querySelector('.scenario-title');
        
        if (progressFill && scenarioTitle) {
            const progress = ((this.currentScenarioIndex + 1) / this.scenarios.length) * 100;
            progressFill.style.width = `${progress}%`;
            
            const scenario = this.scenarios[this.currentScenarioIndex];
            scenarioTitle.textContent = `Scenario ${this.currentScenarioIndex + 1} of ${this.scenarios.length}: ${scenario.title}`;
        }
    }
    
    renderTutorialBoard() {
        const boardElement = document.getElementById('tutorial-board');
        if (!boardElement) return;
        
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.tutorialBoard[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.player === 1 ? 'red' : 'black'}${piece.isKing ? ' king' : ''}`;
                    pieceElement.innerHTML = `<span>${piece.label}</span>`;
                    square.appendChild(pieceElement);
                }
                
                boardElement.appendChild(square);
            }
        }
    }
    
    highlightPiece(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-piece');
        }
    }
    
    highlightSquare(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-square');
        }
    }
    
    highlightCapturedPiece(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-captured');
        }
    }
    
    showArrow(arrow) {
        const arrowEl = document.getElementById('tutorial-arrow-pointer');
        if (!arrowEl) return;
        
        const fromSquare = document.querySelector(`#tutorial-board [data-row="${arrow.from.row}"][data-col="${arrow.from.col}"]`);
        const toSquare = document.querySelector(`#tutorial-board [data-row="${arrow.to.row}"][data-col="${arrow.to.col}"]`);
        
        if (fromSquare && toSquare) {
            const fromRect = fromSquare.getBoundingClientRect();
            const toRect = toSquare.getBoundingClientRect();
            
            arrowEl.style.display = 'block';
            arrowEl.style.left = `${fromRect.left + fromRect.width/2}px`;
            arrowEl.style.top = `${fromRect.top + fromRect.height/2}px`;
            
            const angle = Math.atan2(
                toRect.top - fromRect.top,
                toRect.left - fromRect.left
            ) * 180 / Math.PI;
            
            arrowEl.style.transform = `rotate(${angle}deg)`;
        }
    }
    
    clearHighlights() {
        document.querySelectorAll('.tutorial-highlight-piece').forEach(el => {
            el.classList.remove('tutorial-highlight-piece');
        });
        document.querySelectorAll('.tutorial-highlight-square').forEach(el => {
            el.classList.remove('tutorial-highlight-square');
        });
        document.querySelectorAll('.tutorial-highlight-captured').forEach(el => {
            el.classList.remove('tutorial-highlight-captured');
        });
        
        const arrowEl = document.getElementById('tutorial-arrow-pointer');
        if (arrowEl) {
            arrowEl.style.display = 'none';
        }
    }
    
    showTutorialOverlay() {
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay) {
            startOverlay.style.display = 'none';
        }
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
    }
    
    exitTutorial() {
        this.isPlaying = false;
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay) {
            startOverlay.style.display = 'flex';
        }
    }
    
    updateSpeed(newSpeed) {
        this.playbackSpeed = newSpeed;
    }
}

// Initialize tutorial when needed
let tutorialSystem = null;

// Game Variables
let currentPlayer = 1;
let selectedPiece = null;
let gameBoard = [];
let gameEnded = false;
let gameMode = 'two-player';
let aiDifficulty = 'medium';
let moveHistory = [];
let mustCapture = false;
let capturablePieces = [];
let isAIMoving = false;

// Voice Recognition Variables
let recognition = null;
let isListening = false;
let voiceFeedbackEnabled = false;

// Audio Variables
const gameAudio = {
    playerCapture: new Audio('assets/audio/capture player 1 checkers .mp3'),
    enemyCapture: new Audio('assets/audio/enemy capture checkers _1.mp3'),
    gameLose: new Audio('assets/audio/game lose checkers .mp3'),
    gameWin: new Audio('assets/audio/game win checkers .mp3'),
    movePiece: new Audio('assets/audio/move piece checkers _1_1_1.mp3')
};

// Set audio volumes
Object.values(gameAudio).forEach(audio => {
    audio.volume = 0.5;
});

// Function to play sound effects
function playSoundEffect(soundName) {
    try {
        const audio = gameAudio[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.log('Audio play failed:', err));
        }
    } catch (err) {
        console.log('Sound effect error:', err);
    }
}

// MAIN INITIALIZATION - SIMPLIFIED AND BULLETPROOF
window.addEventListener('load', function() {
    console.log('Window loaded - initializing game');
    
    // Initialize debug system
    debugSystem = new DebugSystem();
    debugSystem.init();
    
    // Hide loading screen and show start screen immediately
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay) {
            startOverlay.style.display = 'flex';
        }
        
        console.log('Start screen shown');
    }, 2000); // Show loading for 2 seconds then go straight to start screen
    
    // Setup all button handlers
    setupButtonHandlers();
    setupSettingsControls();
});

// Setup button handlers
function setupButtonHandlers() {
    // Start Game Button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.onclick = function() {
            const startOverlay = document.getElementById('start-overlay');
            const gameContainer = document.getElementById('game-container');
            
            if (startOverlay) startOverlay.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'flex';
            
            initializeGame();
            console.log('Game started');
        };
    }
    
    // Tutorial Button
    const startTutorialBtn = document.getElementById('start-tutorial-btn');
    if (startTutorialBtn) {
        startTutorialBtn.onclick = function() {
            if (!tutorialSystem) {
                tutorialSystem = new CheckersTutorial();
            }
            tutorialSystem.start();
            console.log('Tutorial started');
        };
    }
    
    // Tutorial Menu Button
    const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
    if (tutorialMenuBtn) {
        tutorialMenuBtn.onclick = function() {
            if (!tutorialSystem) {
                tutorialSystem = new CheckersTutorial();
            }
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) gameContainer.style.display = 'none';
            
            const settingsDropdown = document.getElementById('settings-dropdown');
            if (settingsDropdown) settingsDropdown.classList.remove('show');
            
            tutorialSystem.start();
            console.log('Tutorial started from menu');
        };
    }
    
    // Speed Control
    const speedSlider = document.getElementById('tutorial-speed');
    const speedDisplay = document.getElementById('speed-display');
    if (speedSlider && speedDisplay) {
        speedSlider.addEventListener('input', function() {
            const speed = parseFloat(this.value);
            speedDisplay.textContent = `${speed}x`;
            if (tutorialSystem) {
                tutorialSystem.updateSpeed(speed);
            }
        });
    }
    
    // Exit Tutorial Button
    const exitBtn = document.getElementById('exit-tutorial-btn');
    if (exitBtn) {
        exitBtn.onclick = function() {
            if (tutorialSystem) {
                tutorialSystem.exitTutorial();
            }
        };
    }
    
    // Play Again Button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.onclick = function() {
            const gameEndOverlay = document.getElementById('game-end-overlay');
            const gameContainer = document.getElementById('game-container');
            
            if (gameEndOverlay) gameEndOverlay.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'flex';
            
            restartGame();
        };
    }
    
    // Settings Button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.onclick = function(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('settings-dropdown');
            if (dropdown) dropdown.classList.toggle('show');
        };
    }
    
    // Voice Control Buttons
    const voiceBtnTop = document.getElementById('start-voice-btn-top');
    const voiceBtnBottom = document.getElementById('start-voice-btn-bottom');
    
    if (voiceBtnTop) voiceBtnTop.onclick = startVoiceRecognition;
    if (voiceBtnBottom) voiceBtnBottom.onclick = startVoiceRecognition;
    
    // Close settings dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.closest('.settings-content') && !event.target.closest('.settings-btn')) {
            const dropdown = document.getElementById('settings-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
    });
}

// Setup Settings Controls
function setupSettingsControls() {
    const voiceCheckbox = document.getElementById('voice-feedback-checkbox');
    if (voiceCheckbox) {
        voiceCheckbox.checked = false;
        voiceCheckbox.addEventListener('change', function() {
            voiceFeedbackEnabled = voiceCheckbox.checked;
            console.log('Voice feedback:', voiceFeedbackEnabled);
        });
    }
    
    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    const aiDifficultyContainer = document.getElementById('ai-difficulty-container');
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            gameMode = this.value;
            console.log('Game mode:', gameMode);
            
            if (aiDifficultyContainer) {
                if (gameMode === 'ai') {
                    aiDifficultyContainer.style.display = 'block';
                    if (aiDifficultySelect) {
                        aiDifficulty = aiDifficultySelect.value;
                    }
                } else {
                    aiDifficultyContainer.style.display = 'none';
                }
            }
            restartGame();
        });
    });
    
    if (aiDifficultySelect) {
        aiDifficultySelect.addEventListener('change', function(event) {
            event.stopPropagation();
            aiDifficulty = this.value;
            console.log('AI difficulty:', aiDifficulty);
            if (gameMode === 'ai') {
                restartGame();
            }
        });
    }
    
    const resetBtn = document.getElementById('reset-game-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            restartGame();
            const dropdown = document.getElementById('settings-dropdown');
            if (dropdown) dropdown.classList.remove('show');
        });
    }
}

// Initialize Game
function initializeGame() {
    initializeBoard();
    createBoard();
    checkForForcedMoves();
    updateTurnDisplay();
    initializeVoiceRecognition();
    console.log('Game initialized');
}

// Generate Labels
function generateLabels(prefix, count) {
    const labels = [];
    let n = 1;
    while (labels.length < count) {
        if (!n.toString().includes('2')) {
            labels.push(prefix + n);
        }
        n++;
    }
    return labels;
}

// Get Filtered Board Coordinate
function getFilteredBoardCoordinate(row, col) {
    const letters = 'abcdefgh';
    const colNumber = col + 3;
    if (colNumber.toString().includes('2')) return null;
    return letters[row] + colNumber;
}

// Initialize Board
function initializeBoard() {
    gameBoard = Array(8).fill().map(() => Array(8).fill(null));
    const redLabels = generateLabels('L', 12);
    const blackLabels = generateLabels('N', 12);

    let blackPieceIndex = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1 && blackPieceIndex < blackLabels.length) {
                gameBoard[row][col] = {
                    player: 2,
                    isKing: false,
                    label: blackLabels[blackPieceIndex]
                };
                blackPieceIndex++;
            }
        }
    }

    let redPieceIndex = 0;
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1 && redPieceIndex < redLabels.length) {
                gameBoard[row][col] = {
                    player: 1,
                    isKing: false,
                    label: redLabels[redPieceIndex]
                };
                redPieceIndex++;
            }
        }
    }
}

// Check for Forced Moves
function checkForForcedMoves() {
    mustCapture = false;
    capturablePieces = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.player === currentPlayer) {
                const moves = getPossibleMoves(row, col);
                const captures = moves.filter(move => move.isJump);
                if (captures.length > 0) {
                    mustCapture = true;
                    capturablePieces.push({ row, col, captures });
                }
            }
        }
    }
}

// Create Board
function createBoard() {
    const boardElement = document.getElementById('board');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            if (mustCapture && capturablePieces.some(p => p.row === row && p.col === col)) {
                square.classList.add('must-capture');
            }

            const coord = getFilteredBoardCoordinate(row, col);
            if (coord) {
                const coordLabel = document.createElement('div');
                coordLabel.className = 'coordinate-label coordinate-label-player2 coord-top-left';
                coordLabel.textContent = coord;
                square.appendChild(coordLabel);
            }

            const piece = gameBoard[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                let extraClass = '';
                if (piece.player === 2) extraClass = 'piece-label-player2';
                pieceElement.className = `piece ${piece.player === 1 ? 'red' : 'black'}${piece.isKing ? ' king' : ''}`;
                pieceElement.innerHTML = `<span class="${extraClass}">${piece.label}</span>`;
                pieceElement.onclick = (e) => {
                    e.stopPropagation();
                    if (gameMode === 'ai' && currentPlayer === 2 && !isAIMoving) return;
                    selectPiece(row, col);
                };
                square.appendChild(pieceElement);
            }

            square.onclick = () => {
                if (gameMode === 'ai' && currentPlayer === 2 && !isAIMoving) return;
                makeMove(row, col);
            };
            boardElement.appendChild(square);
        }
    }
}

// Select Piece
function selectPiece(row, col) {
    if (gameEnded) return;
    const piece = gameBoard[row][col];
    if (!piece || piece.player !== currentPlayer) return;
    
    if (mustCapture && !capturablePieces.some(p => p.row === row && p.col === col)) {
        showError('You must capture with a piece that can capture!');
        speakMessage('You must capture');
        return;
    }
    
    clearHighlights();
    selectedPiece = { row, col };
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (square) square.classList.add('highlighted');
    
    const moves = getPossibleMoves(row, col);
    const validMoves = mustCapture ? moves.filter(m => m.isJump) : moves;
    
    validMoves.forEach(move => {
        const moveSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (moveSquare) moveSquare.classList.add('possible-move');
    });
}

// Get Possible Moves
function getPossibleMoves(row, col) {
    const piece = gameBoard[row][col];
    if (!piece) return [];
    const moves = [];
    const directions = piece.isKing ?
        [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
        piece.player === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        
        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) return;
        
        const colNumber = newCol + 3;
        if (colNumber.toString().includes('2')) return;
        
        if (!gameBoard[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol, isJump: false });
        } else if (gameBoard[newRow][newCol].player !== piece.player) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
            
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                const jumpColNumber = jumpCol + 3;
                if (!jumpColNumber.toString().includes('2') && !gameBoard[jumpRow][jumpCol]) {
                    moves.push({
                        row: jumpRow,
                        col: jumpCol,
                        isJump: true,
                        capturedRow: newRow,
                        capturedCol: newCol
                    });
                }
            }
        }
    });

    return moves;
}

// Make Move
function makeMove(toRow, toCol) {
    if (!selectedPiece || gameEnded) return;
    
    const moves = getPossibleMoves(selectedPiece.row, selectedPiece.col);
    let validMoves = moves;
    
    if (mustCapture) {
        validMoves = moves.filter(m => m.isJump);
    }
    
    const move = validMoves.find(m => m.row === toRow && m.col === toCol);
    
    if (!move) {
        clearHighlights();
        selectedPiece = null;
        return;
    }
    
    const piece = gameBoard[selectedPiece.row][selectedPiece.col];
    gameBoard[toRow][toCol] = piece;
    gameBoard[selectedPiece.row][selectedPiece.col] = null;
    
    let continueTurn = false;
    
    if (move.isJump) {
        gameBoard[move.capturedRow][move.capturedCol] = null;
        
        if (currentPlayer === 1) {
            playSoundEffect('playerCapture');
        } else {
            playSoundEffect('enemyCapture');
        }
        
        const moreMoves = getPossibleMoves(toRow, toCol);
        const moreJumps = moreMoves.filter(m => m.isJump);
        if (moreJumps.length > 0) {
            continueTurn = true;
            selectedPiece = { row: toRow, col: toCol };
            mustCapture = true;
        }
    } else {
        playSoundEffect('movePiece');
    }
    
    if ((toRow === 0 && piece.player === 1) || (toRow === 7 && piece.player === 2)) {
        piece.isKing = true;
    }
    
    moveHistory.push({
        from: selectedPiece,
        to: { row: toRow, col: toCol },
        player: currentPlayer,
        wasJump: move.isJump
    });
    
    if (!continueTurn) {
        if (!checkGameEnd()) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            checkForForcedMoves();
            updateTurnDisplay();
            
            if (gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            }
        }
        selectedPiece = null;
    }
    
    createBoard();
    
    if (continueTurn) {
        selectPiece(toRow, toCol);
    }
}

// Clear Highlights
function clearHighlights() {
    document.querySelectorAll('.highlighted').forEach(square => {
        square.classList.remove('highlighted');
    });
    document.querySelectorAll('.possible-move').forEach(square => {
        square.classList.remove('possible-move');
    });
}

// Update Turn Display
function updateTurnDisplay() {
    const displayTop = document.getElementById('turn-display-top');
    const displayBottom = document.getElementById('turn-display-bottom');
    
    if (gameMode === 'ai') {
        const text = currentPlayer === 1 ? "Your turn" : "AI's turn";
        if (displayTop) displayTop.textContent = text;
        if (displayBottom) displayBottom.textContent = text;
    } else {
        const text = `Player ${currentPlayer}'s turn`;
        if (displayTop) displayTop.textContent = text;
        if (displayBottom) displayBottom.textContent = text;
    }
}

// Check Game End
function checkGameEnd() {
    let player1Pieces = 0;
    let player2Pieces = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoard[row][col];
            if (piece) {
                if (piece.player === 1) player1Pieces++;
                else player2Pieces++;
            }
        }
    }
    
    const currentPlayerMoves = getAllPossibleMovesForPlayer(currentPlayer);
    
    if (player1Pieces === 0) {
        showGameEndOverlay(2);
        gameEnded = true;
        return true;
    } else if (player2Pieces === 0) {
        showGameEndOverlay(1);
        gameEnded = true;
        return true;
    } else if (currentPlayerMoves.length === 0) {
        const winner = currentPlayer === 1 ? 2 : 1;
        showGameEndOverlay(winner);
        gameEnded = true;
        return true;
    }
    
    return false;
}

// Get All Possible Moves for Player
function getAllPossibleMovesForPlayer(player) {
    const allMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.player === player) {
                const moves = getPossibleMoves(row, col);
                moves.forEach(move => {
                    allMoves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        isJump: move.isJump
                    });
                });
            }
        }
    }
    
    const jumps = allMoves.filter(m => m.isJump);
    return jumps.length > 0 ? jumps : allMoves;
}

// Show Game End Overlay
function showGameEndOverlay(winner) {
    const overlay = document.getElementById('game-end-overlay');
    const title = document.getElementById('game-end-title');
    const message = document.getElementById('game-end-message');
    
    if (!overlay || !title || !message) return;
    
    if (winner === 1) {
        title.textContent = "Player 1 Wins!";
        message.textContent = "Red pieces have conquered the board!";
        playSoundEffect('gameWin');
        speakMessage("Player 1 wins!");
    } else {
        if (gameMode === 'ai') {
            title.textContent = "AI Wins!";
            message.textContent = "Black pieces have conquered the board!";
            playSoundEffect('gameLose');
            speakMessage("AI wins!");
        } else {
            title.textContent = "Player 2 Wins!";
            message.textContent = "Black pieces have conquered the board!";
            playSoundEffect('gameWin');
            speakMessage("Player 2 wins!");
        }
    }
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    overlay.style.display = 'flex';
}

// Restart Game
function restartGame() {
    gameEnded = false;
    currentPlayer = 1;
    selectedPiece = null;
    moveHistory = [];
    mustCapture = false;
    capturablePieces = [];
    isAIMoving = false;
    
    const gameStatus = document.getElementById('game-status');
    if (gameStatus) gameStatus.textContent = '';
    
    initializeBoard();
    checkForForcedMoves();
    createBoard();
    updateTurnDisplay();
    speakMessage('New game started');
}

// AI Move
function makeAIMove() {
    if (gameEnded) return;
    
    isAIMoving = true;
    const moves = getAllPossibleMovesForPlayer(2);
    
    if (moves.length === 0) {
        isAIMoving = false;
        return;
    }
    
    let selectedMove;
    
    if (aiDifficulty === 'easy') {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (aiDifficulty === 'medium') {
        const jumps = moves.filter(m => m.isJump);
        selectedMove = jumps.length > 0 ? 
            jumps[Math.floor(Math.random() * jumps.length)] :
            moves[Math.floor(Math.random() * moves.length)];
    } else {
        selectedMove = getBestMove(moves);
    }
    
    if (selectedMove) {
        selectedPiece = selectedMove.from;
        makeMove(selectedMove.to.row, selectedMove.to.col);
    }
    
    isAIMoving = false;
}

// Get Best Move (for hard AI)
function getBestMove(moves) {
    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    moves.forEach(move => {
        let score = 0;
        
        if (move.isJump) score += 10;
        
        if (move.to.row === 7) score += 5;
        
        if (move.to.row > move.from.row) score += 1;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    return bestMove;
}

// Voice Recognition Functions
function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isListening = true;
            updateVoiceStatus('Listening...');
            toggleVoiceBtnState(true);
        };
        
        recognition.onend = function() {
            isListening = false;
            updateVoiceStatus('Voice Recognition: Off');
            toggleVoiceBtnState(false);
        };
        
        recognition.onresult = function(event) {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            const lastCommand = document.getElementById('last-command');
            if (lastCommand) lastCommand.textContent = `Last command: "${command}"`;
            parseVoiceCommand(command);
        };
        
        recognition.onerror = function(event) {
            showError(`Voice recognition error: ${event.error}`);
        };
    } else {
        showError('Speech recognition not supported in this browser.');
    }
}

function startVoiceRecognition() {
    if (recognition) {
        recognition.start();
        speakMessage('Voice control activated');
    }
}

function toggleVoiceBtnState(listening) {
    const btnTop = document.getElementById('start-voice-btn-top');
    const btnBottom = document.getElementById('start-voice-btn-bottom');
    
    if (btnTop) {
        btnTop.disabled = listening;
        if (listening) btnTop.classList.add('listening');
        else btnTop.classList.remove('listening');
    }
    
    if (btnBottom) {
        btnBottom.disabled = listening;
        if (listening) btnBottom.classList.add('listening');
        else btnBottom.classList.remove('listening');
    }
}

function updateVoiceStatus(status) {
    const voiceStatus = document.getElementById('voice-status');
    if (voiceStatus) voiceStatus.textContent = status;
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function speakMessage(message) {
    if (voiceFeedbackEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function parseVoiceCommand(command) {
    try {
        command = command.replace(/\b(um|uh|like|you know)\b/g, '').trim();

        if (command.includes('next turn') || command.includes('next player') || command.includes('switch turn')) {
            if (gameMode === 'two-player') {
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                checkForForcedMoves();
                updateTurnDisplay();
                speakMessage(`Player ${currentPlayer}'s turn`);
                selectedPiece = null;
                createBoard();
            }
            return;
        }

        if (command.includes('new game') || command.includes('restart') || command.includes('reset')) {
            restartGame();
            return;
        }

        // Voice move commands
        const movePatterns = [
            /move ([ln]\d+) to ([a-h][13456789])/i,
            /([ln]\d+) to ([a-h][13456789])/i,
            /piece ([ln]\d+) to ([a-h][13456789])/i
        ];

        for (const pattern of movePatterns) {
            const match = command.match(pattern);
            if (match) {
                const pieceLabel = match[1].toUpperCase();
                const targetSquare = match[2].toLowerCase();
                processVoiceMove(pieceLabel, targetSquare);
                return;
            }
        }

        // Selection commands
        const selectPatterns = [
            /select ([ln]\d+)/i,
            /choose ([ln]\d+)/i,
            /pick ([ln]\d+)/i
        ];

        for (const pattern of selectPatterns) {
            const match = command.match(pattern);
            if (match) {
                const pieceLabel = match[1].toUpperCase();
                const piecePosition = findPieceByLabel(pieceLabel);
                if (piecePosition && gameBoard[piecePosition.row][piecePosition.col].player === currentPlayer) {
                    selectPiece(piecePosition.row, piecePosition.col);
                    speakMessage(`Selected ${pieceLabel}`);
                } else {
                    speakMessage(`Cannot find piece ${pieceLabel} or it's not your piece`);
                    showError(`Cannot find piece ${pieceLabel} or it's not your piece`);
                }
                return;
            }
        }

        speakMessage('Command not recognized. Try saying "move L1 to a3" or "select L5"');
        showError('Command not recognized');

    } catch (error) {
        console.error('Voice command parsing error:', error);
        speakMessage('Error processing voice command');
        showError('Error processing voice command');
    }
}

function processVoiceMove(pieceLabel, targetSquare) {
    const piecePosition = findPieceByLabel(pieceLabel);
    
    if (!piecePosition) {
        speakMessage(`Cannot find piece ${pieceLabel}`);
        showError(`Cannot find piece ${pieceLabel}`);
        return;
    }

    const piece = gameBoard[piecePosition.row][piecePosition.col];
    if (piece.player !== currentPlayer) {
        speakMessage(`It's not your turn to move ${pieceLabel}`);
        showError(`It's not your turn to move ${pieceLabel}`);
        return;
    }

    const targetCoords = squareToCoordinates(targetSquare);
    if (!targetCoords) {
        speakMessage(`Invalid square ${targetSquare}`);
        showError(`Invalid square ${targetSquare}`);
        return;
    }

    selectPiece(piecePosition.row, piecePosition.col);

    const moves = getPossibleMoves(piecePosition.row, piecePosition.col);
    const validMove = moves.find(move => move.row === targetCoords.row && move.col === targetCoords.col);

    if (validMove) {
        makeMove(targetCoords.row, targetCoords.col);
        speakMessage(`${pieceLabel} moved to ${targetSquare}`);
    } else {
        speakMessage(`Invalid move: ${pieceLabel} cannot move to ${targetSquare}`);
        showError(`Invalid move: ${pieceLabel} cannot move to ${targetSquare}`);
        clearHighlights();
        selectedPiece = null;
    }
}

function findPieceByLabel(label) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.label === label) {
                return { row, col };
            }
        }
    }
    return null;
}

function squareToCoordinates(square) {
    if (square.length !== 2) return null;
    const letter = square[0];
    const number = square[1];
    
    if (letter < 'a' || letter > 'h' || number < '1' || number > '8' || number === '2') {
        return null;
    }
    const row = letter.charCodeAt(0) - 'a'.charCodeAt(0);
    const col = parseInt(number) - 1;
    return { row, col };
}
    
