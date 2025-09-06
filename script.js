// Debug System for Mobile Testing
class DebugSystem {
    constructor() {
        this.errors = [];
        this.logs = [];
        this.loadingSteps = [];
        this.isVisible = false;
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDebugPanel());
        } else {
            this.setupDebugPanel();
        }
        
        // Capture all errors
        this.captureErrors();
        
        // Override console methods
        this.overrideConsole();
        
        // Track loading progress
        this.trackLoading();
        
        // Update system info
        this.updateSystemInfo();
    }
    
    setupDebugPanel() {
        // Toggle button
        const toggleBtn = document.getElementById('debug-toggle');
        const content = document.getElementById('debug-content');
        const closeBtn = document.getElementById('debug-close');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isVisible = !this.isVisible;
                content.style.display = this.isVisible ? 'block' : 'none';
                if (this.isVisible) {
                    this.updateGameState();
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.isVisible = false;
                content.style.display = 'none';
            });
        }
        
        // Quick action buttons
        this.setupQuickActions();
        
        // Clear buttons
        const clearErrorsBtn = document.getElementById('clear-errors');
        const clearConsoleBtn = document.getElementById('clear-console');
        
        if (clearErrorsBtn) {
            clearErrorsBtn.addEventListener('click', () => {
                this.errors = [];
                this.updateErrorDisplay();
            });
        }
        
        if (clearConsoleBtn) {
            clearConsoleBtn.addEventListener('click', () => {
                this.logs = [];
                this.updateConsoleDisplay();
            });
        }
    }
    
    captureErrors() {
        // Capture JavaScript errors
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
            
            // Also log to console
            this.addLog('error', `ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
        });
        
        // Capture promise rejections
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
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs.shift();
        }
        
        this.updateConsoleDisplay();
    }
    
    trackLoading() {
        // Track various loading steps
        this.addLoadingStep('Debug system initialized');
        
        // Track DOM ready
        if (document.readyState === 'complete') {
            this.addLoadingStep('DOM already complete');
        } else {
            window.addEventListener('load', () => {
                this.addLoadingStep('Window loaded');
            });
        }
        
        // Track specific game elements
        setTimeout(() => {
            const checks = {
                'Loading screen': document.getElementById('loading-screen'),
                'Intro scene': document.getElementById('intro-scene'),
                'Start overlay': document.getElementById('start-overlay'),
                'Game container': document.getElementById('game-container'),
                'Board element': document.getElementById('board'),
                'Tutorial overlay': document.getElementById('tutorial-watch-overlay')
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
        this.updateLoadingDisplay();
    }
    
    updateSystemInfo() {
        const info = document.getElementById('debug-system-info');
        if (!info) return;
        
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const screenSize = `${window.innerWidth}x${window.innerHeight}`;
        const pixelRatio = window.devicePixelRatio || 1;
        const online = navigator.onLine ? 'Yes' : 'No';
        const touchDevice = 'ontouchstart' in window ? 'Yes' : 'No';
        
        // Check for specific browsers
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        info.innerHTML = `
            <div>Browser: ${browser}</div>
            <div>Platform: ${platform}</div>
            <div>Screen: ${screenSize} @${pixelRatio}x</div>
            <div>Touch: ${touchDevice}</div>
            <div>Online: ${online}</div>
            <div>User: joeyaugust1</div>
            <div>Time: ${new Date().toLocaleString()}</div>
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
        
        // Auto-scroll to bottom
        display.scrollTop = display.scrollHeight;
    }
    
    updateGameState() {
        const display = document.getElementById('debug-game-state');
        if (!display) return;
        
        // Check game variables (these are from your game)
        const gameState = {
            'Current Player': typeof currentPlayer !== 'undefined' ? currentPlayer : 'undefined',
            'Game Mode': typeof gameMode !== 'undefined' ? gameMode : 'undefined',
            'AI Difficulty': typeof aiDifficulty !== 'undefined' ? aiDifficulty : 'undefined',
            'Game Ended': typeof gameEnded !== 'undefined' ? gameEnded : 'undefined',
            'Must Capture': typeof mustCapture !== 'undefined' ? mustCapture : 'undefined',
            'Selected Piece': typeof selectedPiece !== 'undefined' ? (selectedPiece ? `${selectedPiece.row},${selectedPiece.col}` : 'null') : 'undefined',
            'Voice Enabled': typeof voiceFeedbackEnabled !== 'undefined' ? voiceFeedbackEnabled : 'undefined',
            'Is Listening': typeof isListening !== 'undefined' ? isListening : 'undefined',
            'Tutorial Active': typeof tutorialSystem !== 'undefined' && tutorialSystem && tutorialSystem.isPlaying ? 'Yes' : 'No'
        };
        
        const html = Object.entries(gameState).map(([key, value]) => {
            return `<div>${key}: ${value}</div>`;
        }).join('');
        
        display.innerHTML = html;
    }
    
    setupQuickActions() {
        // Skip intro button
        const skipIntroBtn = document.getElementById('debug-skip-intro');
        if (skipIntroBtn) {
            skipIntroBtn.addEventListener('click', () => {
                const loadingScreen = document.getElementById('loading-screen');
                const introScene = document.getElementById('intro-scene');
                const startOverlay = document.getElementById('start-overlay');
                
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (introScene) introScene.style.display = 'none';
                if (startOverlay) startOverlay.style.display = 'flex';
                
                this.addLog('info', 'Skipped intro sequence');
            });
        }
        
        // Force start game
        const forceStartBtn = document.getElementById('debug-force-start');
        if (forceStartBtn) {
            forceStartBtn.addEventListener('click', () => {
                const loadingScreen = document.getElementById('loading-screen');
                const introScene = document.getElementById('intro-scene');
                const startOverlay = document.getElementById('start-overlay');
                const gameContainer = document.getElementById('game-container');
                
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (introScene) introScene.style.display = 'none';
                if (startOverlay) startOverlay.style.display = 'none';
                if (gameContainer) gameContainer.style.display = 'flex';
                
                // Try to initialize game
                if (typeof initializeGame === 'function') {
                    initializeGame();
                    this.addLog('info', 'Force started game');
                } else {
                    this.addLog('error', 'initializeGame function not found');
                }
            });
        }
        
        // Reload page
        const reloadBtn = document.getElementById('debug-reload');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                location.reload();
            });
        }
        
        // Test audio
        const testAudioBtn = document.getElementById('debug-test-audio');
        if (testAudioBtn) {
            testAudioBtn.addEventListener('click', () => {
                try {
                    const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2Oy9diMFl2z1h2z1h2z1h2z1h2z1hwAAA');
                    testAudio.play();
                    this.addLog('info', 'Audio test played');
                } catch (e) {
                    this.addLog('error', `Audio test failed: ${e.message}`);
                }
            });
        }
        
        // Export log
        const exportBtn = document.getElementById('debug-export-log');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const logData = {
                    timestamp: new Date().toISOString(),
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
                
                const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `debug-log-${Date.now()}.json`;
                a.click();
                
                this.addLog('info', 'Debug log exported');
            });
        }
    }
}

// Initialize debug system immediately
const debugSystem = new DebugSystem();
debugSystem.addLog('info', 'Debug system started at 2025-09-06 08:44:36 UTC');

// Add this right after the debug system to catch early errors
window.addEventListener('DOMContentLoaded', function() {
    debugSystem.addLoadingStep('DOMContentLoaded event fired');
});

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
        
        // Initialize scenarios
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
    
    // Scenario 1: Basic Movement
    createBasicMoveScenario() {
        return {
            id: 'basicMove',
            title: 'Basic Movement',
            description: 'Learn how pieces move diagonally',
            setupBoard: () => {
                // Clear board
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                
                // Place a few pieces for demonstration
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
                },
                {
                    from: {row: 2, col: 3},
                    to: {row: 3, col: 2},
                    player: 2,
                    pauseBefore: true,
                    duration: 2000,
                    explanation: {
                        title: 'Opponent Movement',
                        text: 'Black pieces also move diagonally forward (from their perspective).',
                        highlightPiece: {row: 2, col: 3},
                        highlightSquares: [{row: 3, col: 2}],
                        arrow: {from: {row: 2, col: 3}, to: {row: 3, col: 2}}
                    }
                },
                {
                    from: {row: 5, col: 2},
                    to: {row: 4, col: 3},
                    player: 1,
                    pauseBefore: false,
                    duration: 1500,
                    explanation: null
                },
                {
                    from: {row: 2, col: 5},
                    to: {row: 3, col: 4},
                    player: 2,
                    pauseAfter: true,
                    duration: 1500,
                    explanation: {
                        title: 'Movement Rules',
                        text: 'Remember: Regular pieces can only move forward diagonally, one square at a time.',
                        highlightSquares: []
                    }
                }
            ]
        };
    }
    
    // Scenario 2: Capturing
    createCaptureScenario() {
        return {
            id: 'capture',
            title: 'Capturing Opponent Pieces',
            description: 'Learn how to capture enemy pieces',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                
                // Set up capture scenario
                this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[4][3] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[3][0] = { player: 2, isKing: false, label: 'N3' };
                this.tutorialBoard[2][1] = { player: 1, isKing: false, label: 'L3' };
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
                },
                {
                    from: {row: 2, col: 1},
                    to: {row: 4, col: 3},
                    player: 1,
                    pauseBefore: true,
                    duration: 2500,
                    isCapture: true,
                    capturedPiece: {row: 3, col: 2},
                    explanation: {
                        title: 'Mandatory Capture',
                        text: 'IMPORTANT: If you can capture, you MUST capture. You cannot make any other move.',
                        highlightPiece: {row: 2, col: 1},
                        highlightSquares: [{row: 4, col: 3}],
                        highlightCaptured: {row: 3, col: 2},
                        arrow: {from: {row: 2, col: 1}, to: {row: 4, col: 3}}
                    }
                }
            ]
        };
    }
    
    // Scenario 3: Multiple Captures
    createMultiCaptureScenario() {
        return {
            id: 'multiCapture',
            title: 'Multiple Captures (Double Jump)',
            description: 'Chain captures in one turn',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                
                // Set up double jump scenario
                this.tutorialBoard[6][1] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[5][2] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[3][4] = { player: 2, isKing: false, label: 'N3' };
                this.tutorialBoard[1][6] = { player: 2, isKing: false, label: 'N4' };
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
                },
                {
                    from: {row: 4, col: 3},
                    to: {row: 2, col: 5},
                    player: 1,
                    pauseBefore: true,
                    duration: 2000,
                    isCapture: true,
                    capturedPiece: {row: 3, col: 4},
                    continuesTurn: true,
                    explanation: {
                        title: 'Continue Capturing!',
                        text: 'After a capture, if you can capture again with the same piece, you MUST continue!',
                        highlightPiece: {row: 4, col: 3},
                        highlightSquares: [{row: 2, col: 5}],
                        highlightCaptured: {row: 3, col: 4},
                        arrow: {from: {row: 4, col: 3}, to: {row: 2, col: 5}}
                    }
                },
                {
                    from: {row: 2, col: 5},
                    to: {row: 0, col: 7},
                    player: 1,
                    pauseAfter: true,
                    duration: 2000,
                    isCapture: true,
                    capturedPiece: {row: 1, col: 6},
                    continuesTurn: true,
                    explanation: {
                        title: 'Triple Jump!',
                        text: 'Excellent! Three captures in one turn. This is called a triple jump.',
                        highlightPiece: {row: 2, col: 5},
                        highlightSquares: [{row: 0, col: 7}],
                        highlightCaptured: {row: 1, col: 6}
                    }
                }
            ]
        };
    }
    
    // Scenario 4: King Promotion
    createKingPromotionScenario() {
        return {
            id: 'kingPromotion',
            title: 'Becoming a King',
            description: 'Reach the opposite end to become a King',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                
                // Set up near-promotion scenario
                this.tutorialBoard[1][2] = { player: 1, isKing: false, label: 'L1' };
                this.tutorialBoard[6][5] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[3][4] = { player: 1, isKing: false, label: 'L3' };
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
                },
                {
                    from: {row: 6, col: 5},
                    to: {row: 7, col: 4},
                    player: 2,
                    pauseAfter: true,
                    duration: 2500,
                    promotion: true,
                    explanation: {
                        title: 'King Crown',
                        text: 'Kings are marked with a golden crown. They have special powers!',
                        highlightPiece: {row: 6, col: 5},
                        highlightSquares: [{row: 7, col: 4}]
                    }
                }
            ]
        };
    }
    
    // Scenario 5: King Movement
    createKingMovementScenario() {
        return {
            id: 'kingMovement',
            title: 'King Powers',
            description: 'Kings can move forward AND backward',
            setupBoard: () => {
                this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
                
                // Place kings on board
                this.tutorialBoard[4][3] = { player: 1, isKing: true, label: 'L1' };
                this.tutorialBoard[3][4] = { player: 2, isKing: false, label: 'N1' };
                this.tutorialBoard[5][6] = { player: 2, isKing: false, label: 'N3' };
            },
            moves: [
                {
                    from: {row: 4, col: 3},
                    to: {row: 3, col: 2},
                    player: 1,
                    pauseBefore: true,
                    duration: 2000,
                    explanation: {
                        title: 'King Movement - Forward',
                        text: 'Kings can move diagonally forward just like regular pieces.',
                        highlightPiece: {row: 4, col: 3},
                        highlightSquares: [{row: 3, col: 2}, {row: 3, col: 4}],
                        arrow: {from: {row: 4, col: 3}, to: {row: 3, col: 2}}
                    }
                },
                {
                    from: {row: 3, col: 2},
                    to: {row: 4, col: 3},
                    player: 1,
                    pauseBefore: true,
                    duration: 2000,
                    explanation: {
                        title: 'King Movement - Backward',
                        text: 'But Kings can ALSO move backward! This makes them very powerful.',
                        highlightPiece: {row: 3, col: 2},
                        highlightSquares: [{row: 4, col: 1}, {row: 4, col: 3}],
                        arrow: {from: {row: 3, col: 2}, to: {row: 4, col: 3}}
                    }
                },
                {
                    from: {row: 4, col: 3},
                    to: {row: 2, col: 5},
                    player: 1,
                    pauseAfter: true,
                    duration: 2500,
                    isCapture: true,
                    capturedPiece: {row: 3, col: 4},
                    explanation: {
                        title: 'King Captures',
                        text: 'Kings can also capture in any diagonal direction - forward or backward!',
                        highlightPiece: {row: 4, col: 3},
                        highlightSquares: [{row: 2, col: 5}],
                        highlightCaptured: {row: 3, col: 4}
                    }
                }
            ]
        };
    }
    
    // Start the tutorial
    start() {
        this.isPlaying = true;
        this.currentScenarioIndex = 0;
        this.currentMoveIndex = 0;
        this.showTutorialOverlay();
        this.playScenario();
    }
    
    // Play current scenario
    playScenario() {
        const scenario = this.scenarios[this.currentScenarioIndex];
        
        // Setup the board for this scenario
        scenario.setupBoard();
        this.renderTutorialBoard();
        
        // Update progress display
        this.updateProgress();
        
        // Reset move index
        this.currentMoveIndex = 0;
        
        // Start playing moves
        this.playNextMove();
    }
    
    // Play the next move in sequence
    playNextMove() {
        if (!this.isPlaying) return;
        
        const scenario = this.scenarios[this.currentScenarioIndex];
        const move = scenario.moves[this.currentMoveIndex];
        
        if (!move) {
            // Scenario complete, move to next
            this.nextScenario();
            return;
        }
        
        // Handle pause before move
        if (move.pauseBefore) {
            this.pauseAndShowExplanation(move.explanation, () => {
                this.executeMove(move);
            });
        } else {
            this.executeMove(move);
        }
    }
    
    // Execute a single move
    executeMove(move) {
        // Clear any existing highlights
        this.clearHighlights();
        
        // Show arrow if specified
        if (move.explanation && move.explanation.arrow) {
            this.showArrow(move.explanation.arrow);
        }
        
        // Highlight the piece that will move
        if (move.explanation && move.explanation.highlightPiece) {
            this.highlightPiece(move.explanation.highlightPiece);
        }
        
        // Calculate actual move duration based on speed
        const duration = move.duration / this.playbackSpeed;
        
        // Animate the move
        setTimeout(() => {
            // Move the piece
            const piece = this.tutorialBoard[move.from.row][move.from.col];
            this.tutorialBoard[move.to.row][move.to.col] = piece;
            this.tutorialBoard[move.from.row][move.from.col] = null;
            
            // Handle capture
            if (move.isCapture && move.capturedPiece) {
                this.tutorialBoard[move.capturedPiece.row][move.capturedPiece.col] = null;
            }
            
            // Handle promotion
            if (move.promotion && piece) {
                piece.isKing = true;
            }
            
            // Re-render board
            this.renderTutorialBoard();
            
            // Handle pause after move
            if (move.pauseAfter) {
                this.pauseAndShowExplanation(move.explanation, () => {
                    this.continueAfterMove();
                });
            } else {
                this.continueAfterMove();
            }
        }, duration);
    }
    
    // Continue after a move completes
    continueAfterMove() {
        this.currentMoveIndex++;
        
        // Small delay between moves
        setTimeout(() => {
            this.playNextMove();
        }, 500 / this.playbackSpeed);
    }
    
    // Pause and show explanation
    pauseAndShowExplanation(explanation, callback) {
        this.isPaused = true;
        
        // Show explanation box
        const explBox = document.getElementById('tutorial-explanation-box');
        const titleEl = document.getElementById('explanation-title');
        const textEl = document.getElementById('explanation-text');
        const continueBtn = document.getElementById('continue-tutorial-btn');
        
        titleEl.textContent = explanation.title;
        textEl.textContent = explanation.text;
        explBox.style.display = 'block';
        
        // Highlight relevant squares
        if (explanation.highlightSquares) {
            explanation.highlightSquares.forEach(sq => {
                this.highlightSquare(sq);
            });
        }
        
        // Highlight captured piece
        if (explanation.highlightCaptured) {
            this.highlightCapturedPiece(explanation.highlightCaptured);
        }
        
        // Continue button handler
        continueBtn.onclick = () => {
            explBox.style.display = 'none';
            this.isPaused = false;
            this.clearHighlights();
            callback();
        };
    }
    
    // Move to next scenario
    nextScenario() {
        this.currentScenarioIndex++;
        
        if (this.currentScenarioIndex >= this.scenarios.length) {
            // Tutorial complete
            this.completeTutorial();
        } else {
            // Play next scenario after a delay
            setTimeout(() => {
                this.playScenario();
            }, 1500);
        }
    }
    
    // Complete tutorial
    completeTutorial() {
        this.isPlaying = false;
        this.showCompletionMessage();
    }
    
    // Show completion message
    showCompletionMessage() {
        const explBox = document.getElementById('tutorial-explanation-box');
        const titleEl = document.getElementById('explanation-title');
        const textEl = document.getElementById('explanation-text');
        const continueBtn = document.getElementById('continue-tutorial-btn');
        
        titleEl.textContent = 'Tutorial Complete!';
        textEl.textContent = 'You now know all the essential rules of checkers. Ready to play?';
        continueBtn.textContent = 'Start Playing';
        explBox.style.display = 'block';
        
        continueBtn.onclick = () => {
            this.exitTutorial();
        };
    }
    
    // Update progress display
    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const scenarioTitle = document.querySelector('.scenario-title');
        
        const progress = ((this.currentScenarioIndex + 1) / this.scenarios.length) * 100;
        progressFill.style.width = `${progress}%`;
        
        const scenario = this.scenarios[this.currentScenarioIndex];
        scenarioTitle.textContent = `Scenario ${this.currentScenarioIndex + 1} of ${this.scenarios.length}: ${scenario.title}`;
    }
    
    // Render the tutorial board
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
    
    // Highlight a specific piece
    highlightPiece(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-piece');
        }
    }
    
    // Highlight a square
    highlightSquare(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-square');
        }
    }
    
    // Highlight captured piece
    highlightCapturedPiece(position) {
        const square = document.querySelector(`#tutorial-board [data-row="${position.row}"][data-col="${position.col}"]`);
        if (square) {
            square.classList.add('tutorial-highlight-captured');
        }
    }
    
    // Show arrow between positions
    showArrow(arrow) {
        const arrowEl = document.getElementById('tutorial-arrow-pointer');
        if (!arrowEl) return;
        
        const fromSquare = document.querySelector(`#tutorial-board [data-row="${arrow.from.row}"][data-col="${arrow.from.col}"]`);
        const toSquare = document.querySelector(`#tutorial-board [data-row="${arrow.to.row}"][data-col="${arrow.to.col}"]`);
        
        if (fromSquare && toSquare) {
            const fromRect = fromSquare.getBoundingClientRect();
            const toRect = toSquare.getBoundingClientRect();
            
            // Position and rotate arrow
            arrowEl.style.display = 'block';
            arrowEl.style.left = `${fromRect.left + fromRect.width/2}px`;
            arrowEl.style.top = `${fromRect.top + fromRect.height/2}px`;
            
            // Calculate angle
            const angle = Math.atan2(
                toRect.top - fromRect.top,
                toRect.left - fromRect.left
            ) * 180 / Math.PI;
            
            arrowEl.style.transform = `rotate(${angle}deg)`;
        }
    }
    
    // Clear all highlights
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
    
    // Show tutorial overlay
    showTutorialOverlay() {
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        // Hide other overlays
        document.getElementById('start-overlay').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
    }
    
    // Exit tutorial
    exitTutorial() {
        this.isPlaying = false;
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Show start screen again
        document.getElementById('start-overlay').style.display = 'flex';
    }
    
    // Update playback speed
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

// BULLETPROOF LOADING SYSTEM - Will never get stuck
function preloadImages(callback) {
    const images = [
        'assets/file_000000001e3462308102f8b9c449e32f.png',
        'assets/file_0000000041206230a7fd6540e0938673.png'
    ];
    
    let loadedCount = 0;
    let finished = false;
    const totalImages = images.length;
    
    // Ensure callback is only called once
    function done() {
        if (!finished) {
            finished = true;
            console.log('Image preloading complete');
            debugSystem.addLoadingStep('Image preloading complete');
            callback();
        }
    }
    
    // If no images to load, proceed immediately
    if (totalImages === 0) {
        done();
        return;
    }
    
    // Timeout after 3 seconds - proceed even if images don't load
    const timeoutId = setTimeout(() => {
        console.warn('Image loading timeout - proceeding anyway');
        debugSystem.addLoadingStep('Image loading timeout - proceeding anyway', 'error');
        done();
    }, 3000);
    
    // Load each image
    images.forEach((src, index) => {
        const img = new Image();
        
        img.onload = () => {
            loadedCount++;
            console.log(`Image ${index + 1}/${totalImages} loaded: ${src}`);
            debugSystem.addLoadingStep(`Image ${index + 1}/${totalImages} loaded`);
            if (loadedCount === totalImages) {
                clearTimeout(timeoutId);
                done();
            }
        };
        
        img.onerror = () => {
            loadedCount++;
            console.warn(`Image ${index + 1}/${totalImages} failed: ${src}`);
            debugSystem.addLoadingStep(`Image ${index + 1}/${totalImages} failed`, 'error');
            if (loadedCount === totalImages) {
                clearTimeout(timeoutId);
                done();
            }
        };
        
        // Start loading
        img.src = src;
    });
}

// MAIN LOADING SEQUENCE - Guaranteed to proceed
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting game initialization');
    debugSystem.addLoadingStep('Starting game initialization');
    
    // Try to preload audio (non-blocking)
    Object.values(gameAudio).forEach(audio => {
        audio.load();
    });
    
    // Start image preloading with guaranteed callback
    preloadImages(() => {
        console.log('Preloading complete - proceeding to game');
        
        // Hide loading screen after a short delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                debugSystem.addLoadingStep('Loading screen hidden');
            }
            
            // Try to play intro, or go straight to start screen if it fails
            try {
                playIntroSequence();
            } catch (err) {
                console.error('Intro sequence failed:', err);
                debugSystem.addLoadingStep('Intro sequence failed', 'error');
                showStartScreen();
            }
        }, 500);
    });
    
    // ULTIMATE FAILSAFE - Force start after 5 seconds no matter what
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.error('FAILSAFE: Force hiding loading screen');
            debugSystem.addLoadingStep('FAILSAFE: Force hiding loading screen', 'error');
            loadingScreen.style.display = 'none';
            showStartScreen();
        }
    }, 5000);
});

// Show start screen directly
function showStartScreen() {
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
        startOverlay.style.display = 'flex';
        debugSystem.addLoadingStep('Start screen shown');
    }
}

// Play Intro Sequence with error handling
function playIntroSequence() {
    const introScene = document.getElementById('intro-scene');
    const introImage = document.getElementById('intro-image');
    
    // Check if elements exist
    if (!introScene || !introImage) {
        console.error('Intro elements not found - skipping to start screen');
        debugSystem.addLoadingStep('Intro elements not found', 'error');
        showStartScreen();
        return;
    }
    
    console.log('Starting intro sequence');
    debugSystem.addLoadingStep('Starting intro sequence');
    introScene.style.display = 'flex';
    
    // First image
    introImage.src = 'assets/file_000000001e3462308102f8b9c449e32f.png';
    
    // Handle image load errors
    introImage.onerror = () => {
        console.warn('First intro image failed - proceeding to start');
        debugSystem.addLoadingStep('First intro image failed', 'error');
        introScene.style.display = 'none';
        showStartScreen();
    };
    
    setTimeout(() => {
        introImage.classList.add('fade-in');
    }, 100);
    
    // After 3.5 seconds, show second image
    setTimeout(() => {
        introImage.classList.remove('fade-in');
        
        setTimeout(() => {
            introImage.src = 'assets/file_0000000041206230a7fd6540e0938673.png';
            
            // Handle second image error
            introImage.onerror = () => {
                console.warn('Second intro image failed - proceeding to start');
                debugSystem.addLoadingStep('Second intro image failed', 'error');
                introScene.style.display = 'none';
                showStartScreen();
            };
            
            setTimeout(() => {
                introImage.classList.add('fade-in');
            }, 100);
            
            // After another 3.5 seconds, show start screen
            setTimeout(() => {
                introImage.classList.remove('fade-in');
                setTimeout(() => {
                    introScene.style.display = 'none';
                    debugSystem.addLoadingStep('Intro sequence complete');
                    showStartScreen();
                }, 500);
            }, 3500);
        }, 500);
    }, 3500);
}

// Start Game
document.getElementById('start-game-btn').onclick = function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    debugSystem.addLoadingStep('Game started');
    initializeGame();
};

// Tutorial Button Handlers
document.getElementById('start-tutorial-btn').onclick = function() {
    if (!tutorialSystem) {
        tutorialSystem = new CheckersTutorial();
    }
    debugSystem.addLog('info', 'Tutorial started');
    tutorialSystem.start();
};

// Tutorial button from menu
document.addEventListener('DOMContentLoaded', function() {
    const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
    if (tutorialMenuBtn) {
        tutorialMenuBtn.onclick = function() {
            if (!tutorialSystem) {
                tutorialSystem = new CheckersTutorial();
            }
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('settings-dropdown').classList.remove('show');
            debugSystem.addLog('info', 'Tutorial started from menu');
            tutorialSystem.start();
        };
    }
    
    // Speed control
    const speedSlider = document.getElementById('tutorial-speed');
    const speedDisplay = document.getElementById('speed-display');
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            const speed = parseFloat(this.value);
            speedDisplay.textContent = `${speed}x`;
            if (tutorialSystem) {
                tutorialSystem.updateSpeed(speed);
            }
        });
    }
    
    // Exit button
    const exitBtn = document.getElementById('exit-tutorial-btn');
    if (exitBtn) {
        exitBtn.onclick = function() {
            if (tutorialSystem) {
                debugSystem.addLog('info', 'Tutorial exited');
                tutorialSystem.exitTutorial();
            }
        };
    }
});

// Play Again Button
document.getElementById('play-again-btn').onclick = function() {
    document.getElementById('game-end-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    debugSystem.addLog('info', 'Play again clicked');
    restartGame();
};

// Settings Dropdown
document.getElementById('settings-btn').onclick = function(event) {
    event.stopPropagation();
    document.getElementById('settings-dropdown').classList.toggle('show');
};

window.addEventListener('click', function(event) {
    if (!event.target.closest('.settings-content')) {
        document.getElementById('settings-dropdown').classList.remove('show');
    }
});

// Settings Controls
document.addEventListener('DOMContentLoaded', function () {
    const voiceCheckbox = document.getElementById('voice-feedback-checkbox');
    voiceCheckbox.checked = false;
    voiceCheckbox.addEventListener('change', function () {
        voiceFeedbackEnabled = voiceCheckbox.checked;
        debugSystem.addLog('info', `Voice feedback ${voiceFeedbackEnabled ? 'enabled' : 'disabled'}`);
    });

    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    const aiDifficultyContainer = document.getElementById('ai-difficulty-container');
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            gameMode = this.value;
            debugSystem.addLog('info', `Game mode changed to ${gameMode}`);
            if (gameMode === 'ai') {
                aiDifficultyContainer.style.display = 'block';
                aiDifficulty = aiDifficultySelect.value;
            } else {
                aiDifficultyContainer.style.display = 'none';
            }
            restartGame();
        });
    });

    aiDifficultySelect.addEventListener('change', function(event) {
        event.stopPropagation();
        aiDifficulty = this.value;
        console.log('AI Difficulty changed to:', aiDifficulty);
        debugSystem.addLog('info', `AI difficulty set to ${aiDifficulty}`);
        if (gameMode === 'ai') {
            restartGame();
        }
    });

    document.getElementById('reset-game-btn').addEventListener('click', function(event) {
        event.stopPropagation();
        debugSystem.addLog('info', 'Game reset');
        restartGame();
        document.getElementById('settings-dropdown').classList.remove('show');
    });
});

// Voice Control Button Events
document.getElementById('start-voice-btn-top').onclick = startVoiceRecognition;
document.getElementById('start-voice-btn-bottom').onclick = startVoiceRecognition;

// Initialize Game
function initializeGame() {
    initializeBoard();
    createBoard();
    checkForForcedMoves();
    updateTurnDisplay();
    initializeVoiceRecognition();
    debugSystem.addLog('info', 'Game initialized');
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
                if (!blackLabels[blackPieceIndex].includes('2')) {
                    gameBoard[row][col] = {
                        player: 2,
                        isKing: false,
                        label: blackLabels[blackPieceIndex]
                    };
                }
                blackPieceIndex++;
            }
        }
    }

    let redPieceIndex = 0;
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1 && redPieceIndex < redLabels.length) {
                if (!redLabels[redPieceIndex].includes('2')) {
                    gameBoard[row][col] = {
                        player: 1,
                        isKing: false,
                        label: redLabels[redPieceIndex]
                    };
                }
                redPieceIndex++;
            }
        }
    }
}

// Check for Forced Moves (captures)
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
    square.classList.add('highlighted');
    
    const moves = getPossibleMoves(row, col);
    const validMoves = mustCapture ? moves.filter(m => m.isJump) : moves;
    
    validMoves.forEach(move => {
        const moveSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        moveSquare.classList.add('possible-move');
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
        if (colNumber.toString
