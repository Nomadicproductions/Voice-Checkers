// Enhanced Tutorial System with Touch and Voice Control Demonstrations
class EnhancedCheckersTutorial {
    constructor() {
        this.scenarios = [];
        this.currentScenarioIndex = 0;
        this.currentMoveIndex = 0;
        this.playbackSpeed = 1.0;
        this.isPaused = false;
        this.isPlaying = false;
        this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
        this.handPointer = null;
        this.voiceBubble = null;
        this.animationTimeouts = [];
        
        this.initializeElements();
        this.initializeScenarios();
    }
    
    initializeElements() {
        this.handPointer = document.getElementById('tutorial-hand-pointer');
        this.voiceBubble = document.getElementById('tutorial-voice-bubble');
        this.explanationBox = document.getElementById('tutorial-explanation-box');
        this.progressBar = document.querySelector('.progress-fill');
        this.scenarioTitle = document.querySelector('.scenario-title');
        
        // Speed control
        const speedSlider = document.getElementById('tutorial-speed');
        const speedDisplay = document.getElementById('speed-display');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.playbackSpeed = parseFloat(e.target.value);
                speedDisplay.textContent = `${this.playbackSpeed}x`;
            });
        }
        
        // Continue button
        const continueBtn = document.getElementById('continue-tutorial-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.nextMove());
        }
        
        // Exit button
        const exitBtn = document.getElementById('exit-tutorial-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.exitTutorial());
        }
    }
    
    initializeScenarios() {
        this.scenarios = [
            this.createControlsIntroScenario(),
            this.createBasicMoveScenario(),
            this.createCaptureScenario(),
            this.createMultiCaptureScenario(),
            this.createKingPromotionScenario(),
            this.createStrategyScenario()
        ];
    }
    
    createControlsIntroScenario() {
        return {
            id: 'controlsIntro',
            title: 'How to Play - Controls',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L3' };
                        this.tutorialBoard[5][4] = { player: 1, isKing: false, label: 'L5' };
                        this.tutorialBoard[2][3] = { player: 2, isKing: false, label: 'D4' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '🎮 Game Controls',
                            'Learn how to control your pieces using touch or voice commands.',
                            'Tap the piece you want to move',
                            'Say the piece label (e.g., "L3")'
                        );
                        
                        // Show hand selecting piece
                        setTimeout(() => {
                            this.demonstrateTouchSelect(5, 2);
                        }, 2000 / this.playbackSpeed);
                        
                        // Show voice command
                        setTimeout(() => {
                            this.demonstrateVoiceCommand('L3');
                        }, 4000 / this.playbackSpeed);
                    }
                },
                {
                    demonstration: () => {
                        this.showExplanation(
                            '📍 Selecting Destination',
                            'After selecting a piece, choose where to move it.',
                            'Tap the highlighted square',
                            'Say "to C4" or complete command "L3 to C4"'
                        );
                        
                        // Highlight possible moves
                        this.highlightSquare(4, 1, 'possible-move');
                        this.highlightSquare(4, 3, 'possible-move');
                        
                        // Show hand moving to destination
                        setTimeout(() => {
                            this.demonstrateTouchMove(5, 2, 4, 3);
                        }, 2000 / this.playbackSpeed);
                        
                        // Show voice command
                        setTimeout(() => {
                            this.demonstrateVoiceCommand('L3 to C4');
                        }, 5000 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    createBasicMoveScenario() {
        return {
            id: 'basicMove',
            title: 'Basic Movement',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[5][0] = { player: 1, isKing: false, label: 'L1' };
                        this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L3' };
                        this.tutorialBoard[2][3] = { player: 2, isKing: false, label: 'D4' };
                        this.tutorialBoard[2][5] = { player: 2, isKing: false, label: 'D6' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '♟️ Diagonal Movement',
                            'Pieces move diagonally forward on dark squares only. Regular pieces cannot move backward.',
                            'Touch piece L1, then touch square B2',
                            'Say "L1 to B2" or "Move L1 to B2"'
                        );
                        
                        // Highlight the piece
                        this.highlightPiece(5, 0);
                        
                        // Show both control methods
                        setTimeout(() => {
                            this.demonstrateTouchSelect(5, 0);
                            this.demonstrateVoiceCommand('L1');
                        }, 1500 / this.playbackSpeed);
                        
                        // Show destination
                        setTimeout(() => {
                            this.highlightSquare(4, 1, 'possible-move');
                            this.demonstrateTouchMove(5, 0, 4, 1);
                            this.demonstrateVoiceCommand('to B2');
                        }, 3500 / this.playbackSpeed);
                        
                        // Execute move
                        setTimeout(() => {
                            this.executeMove(5, 0, 4, 1);
                        }, 5500 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    createCaptureScenario() {
        return {
            id: 'capture',
            title: 'Capturing Pieces',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L3' };
                        this.tutorialBoard[4][3] = { player: 2, isKing: false, label: 'C4' };
                        this.tutorialBoard[2][3] = { player: 2, isKing: false, label: 'D4' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '⚔️ Capturing Opponent Pieces',
                            'Jump over an opponent\'s piece to capture it. The captured piece is removed from the board.',
                            'Touch L3, then touch the square beyond C4',
                            'Say "L3 to E5" or "Capture C4"'
                        );
                        
                        // Highlight capture sequence
                        this.highlightPiece(5, 2);
                        this.highlightPiece(4, 3, 'enemy');
                        
                        setTimeout(() => {
                            this.highlightSquare(3, 4, 'possible-move');
                            this.demonstrateTouchSelect(5, 2);
                            this.demonstrateVoiceCommand('L3 to E5');
                        }, 2000 / this.playbackSpeed);
                        
                        setTimeout(() => {
                            this.demonstrateTouchMove(5, 2, 3, 4);
                        }, 4000 / this.playbackSpeed);
                        
                        setTimeout(() => {
                            this.executeCapture(5, 2, 3, 4, 4, 3);
                        }, 6000 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    createMultiCaptureScenario() {
        return {
            id: 'multiCapture',
            title: 'Multiple Captures',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[5][0] = { player: 1, isKing: false, label: 'L1' };
                        this.tutorialBoard[4][1] = { player: 2, isKing: false, label: 'B2' };
                        this.tutorialBoard[2][3] = { player: 2, isKing: false, label: 'D4' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '🔥 Chain Captures',
                            'If you can capture multiple pieces in sequence, you must do so. Keep jumping until no more captures are available.',
                            'Touch L1, then each landing square in sequence',
                            'Say "L1 to C3 to E5" or make each move separately'
                        );
                        
                        // First capture
                        setTimeout(() => {
                            this.highlightPiece(5, 0);
                            this.demonstrateTouchSelect(5, 0);
                            this.demonstrateVoiceCommand('L1 to C3');
                        }, 2000 / this.playbackSpeed);
                        
                        setTimeout(() => {
                            this.executeCapture(5, 0, 3, 2, 4, 1);
                        }, 4000 / this.playbackSpeed);
                        
                        // Second capture
                        setTimeout(() => {
                            this.demonstrateVoiceCommand('to E5');
                            this.executeCapture(3, 2, 1, 4, 2, 3);
                        }, 6000 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    createKingPromotionScenario() {
        return {
            id: 'kingPromotion',
            title: 'Becoming a King',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[1][2] = { player: 1, isKing: false, label: 'C2' };
                        this.tutorialBoard[6][5] = { player: 2, isKing: false, label: 'F7' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '👑 King Promotion',
                            'When a piece reaches the opposite end of the board, it becomes a King and can move backward!',
                            'Touch C2, then touch the end row square',
                            'Say "C2 to D1" to reach the king row'
                        );
                        
                        setTimeout(() => {
                            this.highlightPiece(1, 2);
                            this.demonstrateTouchSelect(1, 2);
                            this.demonstrateVoiceCommand('C2 to D1');
                        }, 2000 / this.playbackSpeed);
                        
                        setTimeout(() => {
                            this.executeMove(1, 2, 0, 3);
                            // Add king crown
                            setTimeout(() => {
                                this.makeKing(0, 3);
                            }, 500 / this.playbackSpeed);
                        }, 4000 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    createStrategyScenario() {
        return {
            id: 'strategy',
            title: 'Basic Strategy',
            moves: [
                {
                    setupBoard: () => {
                        this.clearBoard();
                        this.tutorialBoard[5][2] = { player: 1, isKing: false, label: 'L3' };
                        this.tutorialBoard[5][4] = { player: 1, isKing: false, label: 'L5' };
                        this.tutorialBoard[3][2] = { player: 2, isKing: false, label: 'C3' };
                        this.tutorialBoard[3][4] = { player: 2, isKing: false, label: 'C5' };
                        this.renderBoard();
                    },
                    demonstration: () => {
                        this.showExplanation(
                            '🧠 Strategic Tips',
                            '• Control the center of the board\n• Keep pieces together for defense\n• Force trades when ahead\n• Kings are powerful - protect them!',
                            'Practice both control methods',
                            'Try voice commands for faster play!'
                        );
                        
                        // Show strategic positions
                        this.highlightSquare(4, 3, 'possible-move');
                        this.highlightSquare(3, 3, 'possible-move');
                        
                        setTimeout(() => {
                            this.showExplanation(
                                '🎯 Ready to Play!',
                                'You now know all the basics! Remember:\n• Touch or voice commands work\n• Pieces have labels for easy reference\n• Practice makes perfect!',
                                'Exit tutorial to start playing',
                                'Say commands clearly for best recognition'
                            );
                        }, 5000 / this.playbackSpeed);
                    }
                }
            ]
        };
    }
    
    // Helper methods for demonstrations
    demonstrateTouchSelect(row, col) {
        const square = this.getSquareElement(row, col);
        if (!square || !this.handPointer) return;
        
        const rect = square.getBoundingClientRect();
        this.handPointer.style.display = 'block';
        this.handPointer.style.left = `${rect.left + rect.width/2}px`;
        this.handPointer.style.top = `${rect.top + rect.height/2}px`;
        
        // Animate tap
        this.handPointer.classList.add('tapping');
        setTimeout(() => {
            this.handPointer.classList.remove('tapping');
        }, 500);
    }
    
    demonstrateTouchMove(fromRow, fromCol, toRow, toCol) {
        const fromSquare = this.getSquareElement(fromRow, fromCol);
        const toSquare = this.getSquareElement(toRow, toCol);
        if (!fromSquare || !toSquare || !this.handPointer) return;
        
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        
        // Start at from position
        this.handPointer.style.left = `${fromRect.left + fromRect.width/2}px`;
        this.handPointer.style.top = `${fromRect.top + fromRect.height/2}px`;
        
        // Move to destination
        setTimeout(() => {
            this.handPointer.style.left = `${toRect.left + toRect.width/2}px`;
            this.handPointer.style.top = `${toRect.top + toRect.height/2}px`;
        }, 500 / this.playbackSpeed);
        
        // Tap at destination
        setTimeout(() => {
            this.handPointer.classList.add('tapping');
            setTimeout(() => {
                this.handPointer.classList.remove('tapping');
            }, 500);
        }, 1000 / this.playbackSpeed);
    }
    
    demonstrateVoiceCommand(command) {
        if (!this.voiceBubble) return;
        
        const board = document.getElementById('tutorial-board');
        const rect = board.getBoundingClientRect();
        
        this.voiceBubble.style.display = 'flex';
        this.voiceBubble.style.left = `${rect.left + rect.width/2}px`;
        this.voiceBubble.style.top = `${rect.bottom + 20}px`;
        this.voiceBubble.style.transform = 'translateX(-50%)';
        
        const commandText = this.voiceBubble.querySelector('.voice-command-text');
        if (commandText) {
            commandText.textContent = `"${command}"`;
        }
        
        // Hide after delay
        setTimeout(() => {
            this.voiceBubble.style.display = 'none';
        }, 2500 / this.playbackSpeed);
    }
    
    showExplanation(title, text, touchInstruction, voiceInstruction) {
        if (!this.explanationBox) return;
        
        this.explanationBox.style.display = 'block';
        
        const titleEl = document.getElementById('explanation-title');
        const textEl = document.getElementById('explanation-text');
        const touchEl = document.getElementById('touch-instruction');
        const voiceEl = document.getElementById('voice-instruction');
        
        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.textContent = text;
        if (touchEl) touchEl.textContent = touchInstruction;
        if (voiceEl) voiceEl.textContent = voiceInstruction;
    }
    
    highlightPiece(row, col, type = 'friendly') {
        const square = this.getSquareElement(row, col);
        if (!square) return;
        
        const piece = square.querySelector('.piece');
        if (piece) {
            piece.classList.add('tutorial-highlight-piece');
            if (type === 'enemy') {
                piece.classList.add('enemy-highlight');
            }
        }
    }
    
    highlightSquare(row, col, className) {
        const square = this.getSquareElement(row, col);
        if (square) {
            square.classList.add(className);
        }
    }
    
    getSquareElement(row, col) {
        const board = document.getElementById('tutorial-board');
        if (!board) return null;
        
        const index = row * 8 + col;
        return board.children[index];
    }
    
    clearBoard() {
        this.tutorialBoard = Array(8).fill().map(() => Array(8).fill(null));
    }
    
    renderBoard() {
        const board = document.getElementById('tutorial-board');
        if (!board) return;
        
        board.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                
                // Add coordinate labels
                if (row === 7) {
                    const label = document.createElement('span');
                    label.className = 'coordinate-label coord-bottom';
                    label.textContent = String.fromCharCode(65 + col);
                    label.style.bottom = '2px';
                    label.style.left = '2px';
                    label.style.position = 'absolute';
                    square.appendChild(label);
                }
                if (col === 0) {
                    const label = document.createElement('span');
                    label.className = 'coordinate-label coord-left';
                    label.textContent = 8 - row;
                    label.style.top = '2px';
                    label.style.left = '2px';
                    label.style.position = 'absolute';
                    square.appendChild(label);
                }
                
                // Add piece if present
                const piece = this.tutorialBoard[row][col];
                if (piece) {
                    const pieceDiv = document.createElement('div');
                    pieceDiv.className = `piece ${piece.player === 1 ? 'red' : 'black'}`;
                    if (piece.isKing) pieceDiv.classList.add('king');
                    pieceDiv.textContent = piece.label;
                    square.appendChild(pieceDiv);
                }
                
                board.appendChild(square);
            }
        }
    }
    
    executeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.tutorialBoard[fromRow][fromCol];
        if (!piece) return;
        
        this.tutorialBoard[toRow][toCol] = piece;
        this.tutorialBoard[fromRow][fromCol] = null;
        this.renderBoard();
    }
    
    executeCapture(fromRow, fromCol, toRow, toCol, capturedRow, capturedCol) {
        this.executeMove(fromRow, fromCol, toRow, toCol);
        
        // Add capture animation
        const capturedSquare = this.getSquareElement(capturedRow, capturedCol);
        if (capturedSquare) {
            capturedSquare.classList.add('tutorial-highlight-captured');
        }
    }
    
    makeKing(row, col) {
        const piece = this.tutorialBoard[row][col];
        if (piece) {
            piece.isKing = true;
            this.renderBoard();
            
            // Add crown animation
            const square = this.getSquareElement(row, col);
            if (square) {
                const pieceEl = square.querySelector('.piece');
                if (pieceEl) {
                    pieceEl.classList.add('king-promotion-animation');
                }
            }
        }
    }
    
    // Tutorial flow control
    start() {
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        this.currentScenarioIndex = 0;
        this.currentMoveIndex = 0;
        this.playScenario();
    }
    
    playScenario() {
        if (this.currentScenarioIndex >= this.scenarios.length) {
            this.complete();
            return;
        }
        
        const scenario = this.scenarios[this.currentScenarioIndex];
        this.updateProgress();
        
        if (scenario.moves && scenario.moves.length > 0) {
            this.playMove();
        }
    }
    
    playMove() {
        const scenario = this.scenarios[this.currentScenarioIndex];
        const move = scenario.moves[this.currentMoveIndex];
        
        if (!move) {
            this.nextScenario();
            return;
        }
        
        // Clear previous animations
        this.clearAnimations();
        
        // Setup board if needed
        if (move.setupBoard) {
            move.setupBoard();
        }
        
        // Run demonstration
        if (move.demonstration) {
            move.demonstration();
        }
    }
    
    nextMove() {
        this.currentMoveIndex++;
        const scenario = this.scenarios[this.currentScenarioIndex];
        
        if (this.currentMoveIndex >= scenario.moves.length) {
            this.nextScenario();
        } else {
            this.playMove();
        }
    }
    
    nextScenario() {
        this.currentScenarioIndex++;
        this.currentMoveIndex = 0;
        
        // Hide hand and voice bubble
        if (this.handPointer) this.handPointer.style.display = 'none';
        if (this.voiceBubble) this.voiceBubble.style.display = 'none';
        
        this.playScenario();
    }
    
    updateProgress() {
        const progress = ((this.currentScenarioIndex + 1) / this.scenarios.length) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        if (this.scenarioTitle) {
            const scenario = this.scenarios[this.currentScenarioIndex];
            this.scenarioTitle.textContent = 
                `Scenario ${this.currentScenarioIndex + 1} of ${this.scenarios.length}: ${scenario.title}`;
        }
    }
    
    clearAnimations() {
        // Clear all timeouts
        this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
        this.animationTimeouts = [];
        
        // Remove highlight classes
        const board = document.getElementById('tutorial-board');
        if (board) {
            board.querySelectorAll('.tutorial-highlight-piece').forEach(el => {
                el.classList.remove('tutorial-highlight-piece', 'enemy-highlight');
            });
            board.querySelectorAll('.possible-move').forEach(el => {
                el.classList.remove('possible-move');
            });
            board.querySelectorAll('.tutorial-highlight-captured').forEach(el => {
                el.classList.remove('tutorial-highlight-captured');
            });
        }
    }
    
    complete() {
        this.showExplanation(
            '🎉 Tutorial Complete!',
            'You\'re ready to play! Click "Exit Tutorial" to start your game.',
            'Good luck!',
            'Have fun!'
        );
        
        // Hide continue button for last screen
        const continueBtn = document.getElementById('continue-tutorial-btn');
        if (continueBtn) {
            continueBtn.style.display = 'none';
        }
    }
    
    exitTutorial() {
        const overlay = document.getElementById('tutorial-watch-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Clean up
        this.clearAnimations();
        if (this.handPointer) this.handPointer.style.display = 'none';
        if (this.voiceBubble) this.voiceBubble.style.display = 'none';
        if (this.explanationBox) this.explanationBox.style.display = 'none';
        
        // Reset continue button visibility
        const continueBtn = document.getElementById('continue-tutorial-btn');
        if (continueBtn) {
            continueBtn.style.display = 'block';
        }
        
        // Show start overlay or game
        const startOverlay = document.getElementById('start-overlay');
        const gameContainer = document.getElementById('game-container');
        
        if (startOverlay && startOverlay.style.display !== 'none') {
            // If coming from start screen, stay there
        } else if (gameContainer && gameContainer.style.display !== 'none') {
            // If coming from in-game menu, return to game
        } else {
            // Default to start overlay
            if (startOverlay) {
                startOverlay.style.display = 'flex';
            }
        }
    }
}

// Initialize tutorial when needed
let checkersTutorial = null;

// ==================== MAIN GAME CODE ====================

// Game state variables
let board = [];
let currentPlayer = 1;
let selectedPiece = null;
let gameActive = false;
let gameMode = 'two-player';
let aiDifficulty = 'medium';
let voiceFeedback = false;
let recognition = null;
let isListening = false;
let continuousCapture = false;
let captureInProgress = false;
let lastCapturePosition = null;

// Player piece counters and naming
let player1PieceCounter = 1;
let player2PieceCounter = 1;
const pieceNames = new Map();

// Audio objects
const gameAudio = {
    move: new Audio('assets/audio/move piece checkers _1_1_1.mp3'),
    capture: new Audio('assets/audio/capture player 1 checkers .mp3'),
    enemyCapture: new Audio('assets/audio/enemy capture checkers _1.mp3'),
    gameWin: new Audio('assets/audio/game win checkers .mp3'),
    gameLose: new Audio('assets/audio/game lose checkers .mp3')
};

// Function to play audio with error handling
function playAudio(audioName) {
    try {
        const audio = gameAudio[audioName];
        if (audio) {
            audio.currentTime = 0; // Reset to beginning
            audio.play().catch(e => {
                console.log(`Could not play ${audioName} audio:`, e);
            });
        }
    } catch (e) {
        console.log(`Audio ${audioName} not available:`, e);
    }
}

// Image preloading system
const gameImages = {
    intro1: 'assets/file_0000000041206230a7fd6540e0938673.png',
    intro2: 'assets/file_000000007b2862468a3b715616fbfddd.png',
    startBg: 'assets/file_0000000041206230a7fd6540e0938673.png'
};

const loadedImages = {};
let imagesLoaded = 0;
let totalImages = Object.keys(gameImages).length;

function preloadImages() {
    return new Promise((resolve) => {
        if (totalImages === 0) {
            resolve();
            return;
        }
        
        for (const [key, src] of Object.entries(gameImages)) {
            const img = new Image();
            
            img.onload = () => {
                loadedImages[key] = img;
                imagesLoaded++;
                updateLoadingProgress();
                
                if (imagesLoaded === totalImages) {
                    console.log('All images loaded');
                    resolve();
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                imagesLoaded++;
                
                if (imagesLoaded === totalImages) {
                    resolve();
                }
            };
            
            img.src = src;
        }
    });
}

function updateLoadingProgress() {
    const progress = Math.round((imagesLoaded / totalImages) * 100);
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = `Loading game assets... ${progress}%`;
    }
}

// Initialize board
function initializeBoard() {
    board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Reset piece counters
    player1PieceCounter = 1;
    player2PieceCounter = 1;
    pieceNames.clear();
    
    // Place initial pieces with labels
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                const label = getLabelForPosition(row, col, 2);
                board[row][col] = { 
                    player: 2, 
                    isKing: false,
                    label: label
                };
                pieceNames.set(`${row}-${col}`, label);
            }
        }
    }
    
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                const label = getLabelForPosition(row, col, 1);
                board[row][col] = { 
                    player: 1, 
                    isKing: false,
                    label: label
                };
                pieceNames.set(`${row}-${col}`, label);
            }
        }
    }
}

// Get label for initial board position
function getLabelForPosition(row, col, player) {
    const column = String.fromCharCode(65 + col);
    const rowNum = 8 - row;
    return `${column}${rowNum}`;
}

// Render the game board
function renderBoard() {
    const boardElement = document.getElementById('board');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Add coordinate labels based on current player orientation
            const isPlayer2Turn = currentPlayer === 2;
            
            // Row numbers (1-8) on the left edge
            if (col === 0) {
                const label = document.createElement('span');
                label.className = `coordinate-label coord-left ${isPlayer2Turn ? 'coordinate-label-player2' : ''}`;
                label.textContent = isPlayer2Turn ? (row + 1) : (8 - row);
                square.appendChild(label);
            }
            
            // Column letters (A-H) on the bottom edge  
            if (row === 7) {
                const label = document.createElement('span');
                label.className = `coordinate-label coord-bottom ${isPlayer2Turn ? 'coordinate-label-player2' : ''}`;
                label.textContent = isPlayer2Turn ? 
                    String.fromCharCode(72 - col) : // H to A for player 2
                    String.fromCharCode(65 + col);   // A to H for player 1
                square.appendChild(label);
            }
            
            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.player === 1 ? 'red' : 'black'}`;
                if (piece.isKing) {
                    pieceElement.classList.add('king');
                }
                
                // Add piece label - rotate labels 180° for player 2's turn
                const labelSpan = document.createElement('span');
                if (isPlayer2Turn) {
                    labelSpan.className = 'piece-label-player2';
                }
                labelSpan.textContent = piece.label || '';
                pieceElement.appendChild(labelSpan);
                
                square.appendChild(pieceElement);
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
    
    highlightMustCaptures();
}

// Handle square clicks
function handleSquareClick(row, col) {
    if (!gameActive) return;
    
    const piece = board[row][col];
    
    if (selectedPiece) {
        const moves = getValidMoves(selectedPiece.row, selectedPiece.col);
        const move = moves.find(m => m.row === row && m.col === col);
        
        if (move) {
            makeMove(selectedPiece.row, selectedPiece.col, row, col, move.captured);
        } else if (piece && piece.player === currentPlayer) {
            selectPiece(row, col);
        } else {
            clearSelection();
        }
    } else if (piece && piece.player === currentPlayer) {
        selectPiece(row, col);
    }
}

// Select a piece
function selectPiece(row, col) {
    clearSelection();
    
    const mustCaptures = getMustCaptures(currentPlayer);
    if (mustCaptures.length > 0 && !mustCaptures.some(pos => pos.row === row && pos.col === col)) {
        showError('You must capture when possible!');
        return;
    }
    
    selectedPiece = { row, col };
    highlightSquare(row, col, 'highlighted');
    
    const moves = getValidMoves(row, col);
    moves.forEach(move => {
        highlightSquare(move.row, move.col, 'possible-move');
    });
}

// Clear selection
function clearSelection() {
    selectedPiece = null;
    
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlighted', 'possible-move');
    });
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const directions = piece.isKing 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : piece.player === 1 
            ? [[-1, -1], [-1, 1]]
            : [[1, -1], [1, 1]];
    
    // Check for captures first
    const captures = [];
    for (const [dr, dc] of directions) {
        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;
        const middleRow = row + dr;
        const middleCol = col + dc;
        
        if (isValidPosition(jumpRow, jumpCol) && 
            board[middleRow][middleCol] && 
            board[middleRow][middleCol].player !== piece.player &&
            !board[jumpRow][jumpCol]) {
            captures.push({ 
                row: jumpRow, 
                col: jumpCol, 
                captured: { row: middleRow, col: middleCol }
            });
        }
    }
    
    if (captures.length > 0) return captures;
    
    // If no captures, check regular moves
    const mustCaptures = getMustCaptures(currentPlayer);
    if (mustCaptures.length > 0) return [];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
        }
    }
    
    return moves;
}

// Check if position is valid
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Get pieces that must capture
function getMustCaptures(player) {
    const mustCapture = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === player) {
                if (hasCaptureMoves(row, col)) {
                    mustCapture.push({ row, col });
                }
            }
        }
    }
    
    return mustCapture;
}

// Check if a piece has capture moves (without calling getValidMoves)
function hasCaptureMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return false;
    
    const directions = piece.isKing 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : piece.player === 1 
            ? [[-1, -1], [-1, 1]]
            : [[1, -1], [1, 1]];
    
    for (const [dr, dc] of directions) {
        const jumpRow = row + dr * 2;
        const jumpCol = col + dc * 2;
        const middleRow = row + dr;
        const middleCol = col + dc;
        
        if (isValidPosition(jumpRow, jumpCol) && 
            board[middleRow][middleCol] && 
            board[middleRow][middleCol].player !== piece.player &&
            !board[jumpRow][jumpCol]) {
            return true;
        }
    }
    
    return false;
}

// Highlight pieces that must capture
function highlightMustCaptures() {
    const mustCaptures = getMustCaptures(currentPlayer);
    mustCaptures.forEach(pos => {
        const square = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
        if (square) {
            square.classList.add('must-capture');
        }
    });
}

// Highlight a square
function highlightSquare(row, col, className) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (square) {
        square.classList.add(className);
    }
}

// Make a move
function makeMove(fromRow, fromCol, toRow, toCol, captured) {
    const piece = board[fromRow][fromCol];
    const oldLabel = piece.label;
    
    // Move piece
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Update piece position in map
    pieceNames.delete(`${fromRow}-${fromCol}`);
    pieceNames.set(`${toRow}-${toCol}`, oldLabel);
    
    // Handle capture
    if (captured) {
        const capturedPiece = board[captured.row][captured.col];
        board[captured.row][captured.col] = null;
        pieceNames.delete(`${captured.row}-${captured.col}`);
        
        // Play capture audio based on which player captured
        if (currentPlayer === 1) {
            playAudio('capture');
        } else {
            playAudio('enemyCapture');
        }
        
        // Check for additional captures
        const additionalCaptures = getValidMoves(toRow, toCol).filter(m => m.captured);
        if (additionalCaptures.length > 0) {
            renderBoard();
            selectPiece(toRow, toCol);
            return;
        }
    } else {
        // Play move sound for non-capture moves
        playAudio('move');
    }
    
    // Check for king promotion
    if ((piece.player === 1 && toRow === 0) || (piece.player === 2 && toRow === 7)) {
        piece.isKing = true;
    }
    
    // Switch players
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    clearSelection();
    renderBoard();
    updateTurnDisplay();
    
    // Check for game end
    if (checkGameEnd()) {
        endGame();
        return;
    }
    
    // AI move if needed
    if (gameMode === 'ai' && currentPlayer === 2 && gameActive) {
        setTimeout(() => makeAIMove(), 1000);
    }
}

// Check if game has ended
function checkGameEnd() {
    const player1Pieces = [];
    const player2Pieces = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                if (piece.player === 1) player1Pieces.push({ row, col });
                else player2Pieces.push({ row, col });
            }
        }
    }
    
    if (player1Pieces.length === 0) {
        showGameStatus('Player 2 Wins!');
        return true;
    }
    
    if (player2Pieces.length === 0) {
        showGameStatus('Player 1 Wins!');
        return true;
    }
    
    // Check if current player has any valid moves
    const currentPlayerPieces = currentPlayer === 1 ? player1Pieces : player2Pieces;
    const hasValidMove = currentPlayerPieces.some(pos => 
        getValidMoves(pos.row, pos.col).length > 0
    );
    
    if (!hasValidMove) {
        const winner = currentPlayer === 1 ? 'Player 2' : 'Player 1';
        showGameStatus(`${winner} Wins!`);
        return true;
    }
    
    return false;
}

// End the game
function endGame() {
    gameActive = false;
    stopVoiceRecognition();
    
    const gameEndOverlay = document.getElementById('game-end-overlay');
    const gameEndTitle = document.getElementById('game-end-title');
    const gameEndMessage = document.getElementById('game-end-message');
    
    if (gameEndOverlay && gameEndTitle && gameEndMessage) {
        const winner = document.getElementById('game-status').textContent;
        gameEndTitle.textContent = winner;
        gameEndMessage.textContent = 'Great game! Want to play again?';
        gameEndOverlay.style.display = 'flex';
        
        // Play win/lose audio
        if (winner.includes('Player 1')) {
            if (gameMode === 'two-player') {
                playAudio('gameWin'); // General win sound
            } else {
                playAudio('gameWin'); // Player won against AI
            }
        } else {
            if (gameMode === 'two-player') {
                playAudio('gameWin'); // General win sound
            } else {
                playAudio('gameLose'); // Player lost to AI
            }
        }
    }
}

// Update turn display
function updateTurnDisplay() {
    const displayTop = document.getElementById('turn-display-top');
    const displayBottom = document.getElementById('turn-display-bottom');
    const turnText = `Player ${currentPlayer}'s turn`;
    
    if (displayTop) displayTop.textContent = turnText;
    if (displayBottom) displayBottom.textContent = turnText;
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

// Show game status
function showGameStatus(message) {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// AI Move Logic
function makeAIMove() {
    if (!gameActive || currentPlayer !== 2) return;
    
    const validMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === 2) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    validMoves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        captured: move.captured,
                        score: evaluateMove(row, col, move.row, move.col, move.captured)
                    });
                });
            }
        }
    }
    
    if (validMoves.length === 0) return;
    
    // Sort moves by score
    validMoves.sort((a, b) => b.score - a.score);
    
    // Select move based on difficulty
    let selectedMove;
    if (aiDifficulty === 'easy') {
        // Random move
        selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else if (aiDifficulty === 'medium') {
        // Good move with some randomness
        const topMoves = validMoves.slice(0, Math.min(3, validMoves.length));
        selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    } else {
        // Best move
        selectedMove = validMoves[0];
    }
    
    if (selectedMove) {
        selectPiece(selectedMove.from.row, selectedMove.from.col);
        setTimeout(() => {
            makeMove(selectedMove.from.row, selectedMove.from.col, 
                    selectedMove.to.row, selectedMove.to.col, 
                    selectedMove.captured);
        }, 500);
    }
}

// Evaluate move for AI
function evaluateMove(fromRow, fromCol, toRow, toCol, captured) {
    let score = 0;
    
    // Capture is valuable
    if (captured) {
        score += 10;
        if (board[captured.row][captured.col].isKing) {
            score += 5;
        }
    }
    
    // Moving toward promotion is good
    if (toRow === 7) {
        score += 8;
    } else if (toRow > fromRow) {
        score += 2;
    }
    
    // Kings are valuable
    if (board[fromRow][fromCol].isKing) {
        score += 1;
    }
    
    // Center control is good
    if (toCol >= 2 && toCol <= 5 && toRow >= 2 && toRow <= 5) {
        score += 2;
    }
    
    // Add some randomness for variety
    score += Math.random() * 2;
    
    return score;
}

// Voice Recognition Setup
function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', command);
        processVoiceCommand(command);
    };
    
    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
        stopVoiceRecognition();
        showError('Voice recognition error. Please try again.');
    };
    
    recognition.onend = function() {
        stopVoiceRecognition();
    };
}

// Process voice command
function processVoiceCommand(command) {
    const lastCommandElement = document.getElementById('last-command');
    if (lastCommandElement) {
        lastCommandElement.textContent = `Last command: ${command}`;
    }
    
    // Parse move command (e.g., "L1 to A3" or "move L1 to A3")
    const movePattern = /(?:move\s+)?([a-h][1-8])\s+(?:to\s+)?([a-h][1-8])/i;
    const match = command.match(movePattern);
    
    if (match) {
        const from = match[1].toUpperCase();
        const to = match[2].toUpperCase();
        
        // Find piece with this label
        let fromPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.label === from && piece.player === currentPlayer) {
                    fromPos = { row, col };
                    break;
                }
            }
        }
        
        if (!fromPos) {
            showError(`No piece found at ${from}`);
            if (voiceFeedback) speak(`No piece found at ${from}`);
            return;
        }
        
        // Convert destination to board position
        const toCol = to.charCodeAt(0) - 65;
        const toRow = 8 - parseInt(to[1]);
        
        // Try to make the move
        selectPiece(fromPos.row, fromPos.col);
        const moves = getValidMoves(fromPos.row, fromPos.col);
        const move = moves.find(m => m.row === toRow && m.col === toCol);
        
        if (move) {
            makeMove(fromPos.row, fromPos.col, toRow, toCol, move.captured);
            if (voiceFeedback) speak(`Moving ${from} to ${to}`);
        } else {
            showError(`Invalid move: ${from} to ${to}`);
            if (voiceFeedback) speak(`Invalid move`);
            clearSelection();
        }
    } else {
        showError('Command not recognized. Try "L1 to A3" format.');
        if (voiceFeedback) speak('Please say a move command like L1 to A3');
    }
}

// Text to speech
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

// Start voice recognition
function startVoiceRecognition() {
    if (!recognition) {
        setupVoiceRecognition();
    }
    
    if (recognition && !isListening) {
        try {
            recognition.start();
            isListening = true;
            
            // Update both buttons
            document.querySelectorAll('.voice-btn').forEach(btn => {
                btn.classList.add('listening');
                btn.textContent = '🔴 Listening...';
            });
            
            const statusElement = document.getElementById('voice-status');
            if (statusElement) {
                statusElement.textContent = 'Voice Recognition: Listening...';
            }
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            showError('Failed to start voice recognition');
        }
    }
}

// Stop voice recognition
function stopVoiceRecognition() {
    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
        
        // Update both buttons
        document.querySelectorAll('.voice-btn').forEach(btn => {
            btn.classList.remove('listening');
            btn.textContent = '🎤 Start Voice Control';
        });
        
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.textContent = 'Voice Recognition: Off';
        }
    }
}

// Start new game
function startGame() {
    initializeBoard();
    currentPlayer = 1;
    gameActive = true;
    selectedPiece = null;
    renderBoard();
    updateTurnDisplay();
    
    const gameContainer = document.getElementById('game-container');
    const startOverlay = document.getElementById('start-overlay');
    
    if (gameContainer) gameContainer.style.display = 'flex';
    if (startOverlay) startOverlay.style.display = 'none';
    
    // Clear any previous game status
    const gameStatus = document.getElementById('game-status');
    if (gameStatus) gameStatus.textContent = '';
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        startGame();
    }
}

// Setup button handlers
function setupButtonHandlers() {
    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // Tutorial button from start screen
    const startTutorialBtn = document.getElementById('start-tutorial-btn');
    if (startTutorialBtn) {
        startTutorialBtn.addEventListener('click', () => {
            if (!checkersTutorial) {
                checkersTutorial = new EnhancedCheckersTutorial();
            }
            checkersTutorial.start();
        });
    }
    
    // Tutorial button from settings menu
    const menuTutorialBtn = document.getElementById('tutorial-menu-btn');
    if (menuTutorialBtn) {
        menuTutorialBtn.addEventListener('click', () => {
            if (!checkersTutorial) {
                checkersTutorial = new EnhancedCheckersTutorial();
            }
            checkersTutorial.start();
        });
    }
    
    // Voice control buttons
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isListening) {
                stopVoiceRecognition();
            } else {
                startVoiceRecognition();
            }
        });
    });
    
    // Reset game button
    const resetBtn = document.getElementById('reset-game-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
    
    // Play again button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            const gameEndOverlay = document.getElementById('game-end-overlay');
            if (gameEndOverlay) gameEndOverlay.style.display = 'none';
            startGame();
        });
    }
}

// Setup settings controls
function setupSettingsControls() {
    // Settings dropdown toggle
    const settingsBtn = document.getElementById('settings-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    
    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            settingsDropdown.classList.remove('show');
        });
        
        // Prevent dropdown from closing when clicking inside
        const settingsContent = document.getElementById('settings-content');
        if (settingsContent) {
            settingsContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    // Game mode selection
    const gameModeRadios = document.getElementsByName('game-mode');
    const aiDifficultyContainer = document.getElementById('ai-difficulty-container');
    
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameMode = e.target.value;
            if (aiDifficultyContainer) {
                aiDifficultyContainer.style.display = gameMode === 'ai' ? 'block' : 'none';
            }
            
            // Reset game with new mode
            startGame();
        });
    });
    
    // AI difficulty selection
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    if (aiDifficultySelect) {
        aiDifficultySelect.addEventListener('change', (e) => {
            aiDifficulty = e.target.value;
        });
    }
    
    // Voice feedback checkbox
    const voiceFeedbackCheckbox = document.getElementById('voice-feedback-checkbox');
    if (voiceFeedbackCheckbox) {
        voiceFeedbackCheckbox.addEventListener('change', (e) => {
            voiceFeedback = e.target.checked;
        });
    }
}

// Show intro sequence
async function showIntroSequence() {
    const introScene = document.getElementById('intro-scene');
    const introImage = document.getElementById('intro-image');
    
    if (!introScene || !introImage) return;
    
    // Show intro scene
    introScene.style.display = 'flex';
    
    // Display first intro image
    if (loadedImages.intro1) {
        introImage.src = loadedImages.intro1.src;
        introImage.classList.add('fade-in');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Switch to second image
        introImage.classList.remove('fade-in');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (loadedImages.intro2) {
            introImage.src = loadedImages.intro2.src;
            introImage.classList.add('fade-in');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Hide intro and show start overlay
    introScene.style.display = 'none';
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
        startOverlay.style.display = 'flex';
    }
}

// Initialize everything when page loads
window.addEventListener('load', async function() {
    console.log('Window loaded - initializing game');
    
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
    
    // Preload all images
    await preloadImages();
    
    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Hide loading screen
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // Show intro sequence
    await showIntroSequence();
    
    // Setup all button handlers
    setupButtonHandlers();
    setupSettingsControls();
    
    // Initialize voice recognition
    setupVoiceRecognition();
    
    console.log('Game initialization complete');
});
