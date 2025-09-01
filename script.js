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

// Tutorial Variables
let tutorialMode = false;
let tutorialControlMode = 'touch'; // 'touch' or 'voice'
let tutorialStep = 0;
let tutorialLessonsShown = {
    gameObjective: false,
    basicMove: false,
    capture: false,
    forcedCapture: false,  // This will be ignored for forced captures - always show
    doubleJump: false,
    kingPromotion: false,
    kingMovement: false,
    voiceCommands: false,
    coordinates: false
};
let tutorialCurrentLesson = null;
let tutorialForcedPiece = null;
let tutorialForcedMove = null;
let lastForcedCaptureState = null; // Track last forced capture state to detect changes

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

// FIXED LOADING SYSTEM - Will always complete
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
            callback();
        }
    }
    
    // If no images to load or immediate fail, proceed immediately
    if (totalImages === 0) {
        done();
        return;
    }
    
    // Timeout after 3 seconds - proceed even if images don't load
    const timeoutId = setTimeout(() => {
        console.warn('Image loading timeout - proceeding anyway');
        done();
    }, 3000);
    
    // Load each image
    images.forEach((src, index) => {
        const img = new Image();
        
        img.onload = () => {
            loadedCount++;
            console.log(`Image ${index + 1}/${totalImages} loaded: ${src}`);
            if (loadedCount === totalImages) {
                clearTimeout(timeoutId);
                done();
            }
        };
        
        img.onerror = () => {
            loadedCount++;
            console.warn(`Image ${index + 1}/${totalImages} failed: ${src}`);
            if (loadedCount === totalImages) {
                clearTimeout(timeoutId);
                done();
            }
        };
        
        // Start loading
        img.src = src;
    });
}

// MAIN LOADING SEQUENCE - Fixed to always complete
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting game initialization');
    
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
            }
            
            // Try to play intro, or go straight to start screen if it fails
            try {
                playIntroSequence();
            } catch (err) {
                console.error('Intro sequence failed:', err);
                showStartScreen();
            }
        }, 500);
    });
    
    // ULTIMATE FAILSAFE - Force start after 5 seconds no matter what
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.error('FAILSAFE: Force hiding loading screen');
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
    }
}

// Play Intro Sequence with error handling
function playIntroSequence() {
    const introScene = document.getElementById('intro-scene');
    const introImage = document.getElementById('intro-image');
    
    // Check if elements exist
    if (!introScene || !introImage) {
        console.error('Intro elements not found - skipping to start screen');
        showStartScreen();
        return;
    }
    
    console.log('Starting intro sequence');
    introScene.style.display = 'flex';
    
    // First image
    introImage.src = 'assets/file_000000001e3462308102f8b9c449e32f.png';
    
    // Handle image load errors
    introImage.onerror = () => {
        console.warn('First intro image failed - proceeding to start');
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
    initializeGame();
};

// Play Again Button
document.getElementById('play-again-btn').onclick = function() {
    document.getElementById('game-end-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    restartGame();
};

// Tutorial Prompt Handlers
document.getElementById('tutorial-yes-btn').onclick = function() {
    // Show control mode selection
    const promptContent = document.querySelector('.tutorial-prompt-content');
    promptContent.innerHTML = `
        <h2>Choose Control Method</h2>
        <p>How would you like to play?</p>
        <div class="tutorial-prompt-buttons">
            <button id="tutorial-touch-btn" class="tutorial-btn tutorial-yes">
                <span style="font-size: 1.5rem;">👆</span><br>Touch/Click
            </button>
            <button id="tutorial-voice-btn" class="tutorial-btn tutorial-yes">
                <span style="font-size: 1.5rem;">🎤</span><br>Voice Commands
            </button>
        </div>
    `;
    
    document.getElementById('tutorial-touch-btn').onclick = function() {
        tutorialMode = true;
        tutorialControlMode = 'touch';
        gameMode = 'ai';  // Ensure AI mode
        aiDifficulty = 'easy';
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
    };
    
    document.getElementById('tutorial-voice-btn').onclick = function() {
        tutorialMode = true;
        tutorialControlMode = 'voice';
        gameMode = 'ai';  // Ensure AI mode
        aiDifficulty = 'easy';
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
        setTimeout(() => {
            if (recognition) {
                startVoiceRecognition();
            }
        }, 1000);
    };
};

document.getElementById('tutorial-no-btn').onclick = function() {
    tutorialMode = false;
    document.getElementById('tutorial-prompt').style.display = 'none';
};

// Skip Tutorial Button
document.getElementById('tutorial-skip-btn').onclick = function() {
    endTutorial();
};

// Tutorial Action Button
document.getElementById('tutorial-action-btn').onclick = function() {
    advanceTutorial();
};

// Reset Tutorial Lessons
function resetTutorialLessons() {
    tutorialLessonsShown = {
        gameObjective: false,
        basicMove: false,
        capture: false,
        forcedCapture: false,  
        doubleJump: false,
        kingPromotion: false,
        kingMovement: false,
        voiceCommands: false,
        coordinates: false
    };
    lastForcedCaptureState = null;
}

// Start Tutorial
function startTutorial() {
    tutorialStep = 0;
    tutorialCurrentLesson = null;
    
    showTutorialMessage(
        'Welcome to Checkers!',
        'Your goal is to capture all enemy pieces OR block them from moving. You can also win by getting your pieces to the opposite end to become Kings! Kings are powerful - they can move both forward and backward. Let\'s learn how to play!',
        null,
        true,
        true
    );
    tutorialLessonsShown.gameObjective = true;
}

// End Tutorial
function endTutorial() {
    tutorialMode = false;
    tutorialCurrentLesson = null;
    tutorialForcedPiece = null;
    tutorialForcedMove = null;
    lastForcedCaptureState = null;
    document.getElementById('tutorial-overlay').style.display = 'none';
    createBoard();
}

// Advance Tutorial
function advanceTutorial() {
    document.getElementById('tutorial-action-btn').style.display = 'none';
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialCurrentLesson = null;
    checkTutorialState();
}

// Check if forced capture state has changed
function hasForcedCaptureChanged() {
    if (!mustCapture) {
        lastForcedCaptureState = null;
        return false;
    }
    
    // Create a unique key for current forced capture state
    const currentState = capturablePieces.map(p => `${p.row},${p.col}`).sort().join('|');
    
    if (lastForcedCaptureState !== currentState) {
        lastForcedCaptureState = currentState;
        return true;
    }
    
    return false;
}

// Check Tutorial State - FIXED to show forced capture every time
function checkTutorialState() {
    if (!tutorialMode || currentPlayer !== 1 || isAIMoving) return;
    
    // Check if there's a new forced capture situation
    if (mustCapture && hasForcedCaptureChanged()) {
        // Always show forced capture tutorial when it's a new forced capture situation
        showForcedCaptureTutorial();
        return;
    }
    
    const possibleLessons = analyzeBoardForTutorial();
    
    for (const lesson of possibleLessons) {
        if (!tutorialLessonsShown[lesson.type]) {
            showTutorialLesson(lesson);
            break;
        }
    }
}

// Dedicated function for showing forced capture tutorial
function showForcedCaptureTutorial() {
    if (!mustCapture || capturablePieces.length === 0) return;
    
    // Get all pieces that can capture
    const captureInfo = capturablePieces.map(p => {
        const piece = gameBoard[p.row][p.col];
        return piece ? piece.label : '';
    }).filter(label => label).join(', ');
    
    // Use the first capturable piece for the tutorial
    const firstCapture = capturablePieces[0];
    const piece = gameBoard[firstCapture.row][firstCapture.col];
    
    let message = capturablePieces.length > 1 ? 
        `MANDATORY CAPTURE! Multiple pieces (${captureInfo}) can capture. You must use one of them to capture an opponent's piece. This is a mandatory rule in checkers!` :
        `MANDATORY CAPTURE! ${piece.label} must capture an opponent's piece. When a capture is available, you cannot make any other move!`;
    
    tutorialCurrentLesson = {
        type: 'forcedCapture',
        piece: firstCapture,
        move: firstCapture.captures[0]
    };
    
    tutorialForcedPiece = { row: firstCapture.row, col: firstCapture.col };
    tutorialForcedMove = firstCapture.captures[0];
    
    showTutorialMessage(
        'Mandatory Capture!',
        message,
        tutorialCurrentLesson,
        false,
        false
    );
    
    highlightTutorialMove(tutorialForcedPiece, tutorialForcedMove);
}

// Analyze Board for Tutorial Opportunities
function analyzeBoardForTutorial() {
    const lessons = [];
    
    if (!tutorialLessonsShown.basicMove && moveHistory.length === 0) {
        lessons.push({
            type: 'basicMove',
            piece: { row: 5, col: 0 },
            move: { row: 4, col: 1 }
        });
    }
    
    if (!tutorialLessonsShown.capture) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameBoard[row][col];
                if (piece && piece.player === 1) {
                    const moves = getPossibleMoves(row, col);
                    const captures = moves.filter(m => m.isJump);
                    if (captures.length > 0) {
                        lessons.push({
                            type: 'capture',
                            piece: { row, col },
                            move: captures[0]
                        });
                        break;
                    }
                }
            }
        }
    }
    
    if (!tutorialLessonsShown.kingPromotion) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoard[1][col];
            if (piece && piece.player === 1 && !piece.isKing) {
                const moves = getPossibleMoves(1, col);
                const promotionMove = moves.find(m => m.row === 0);
                if (promotionMove) {
                    lessons.push({
                        type: 'kingPromotion',
                        piece: { row: 1, col },
                        move: promotionMove
                    });
                    break;
                }
            }
        }
    }
    
    if (!tutorialLessonsShown.voiceCommands && tutorialControlMode === 'voice' && moveHistory.length === 1) {
        lessons.push({
            type: 'voiceCommands',
            piece: null,
            move: null
        });
    }
    
    return lessons;
}

// Show Tutorial Lesson
function showTutorialLesson(lesson) {
    tutorialCurrentLesson = lesson;
    
    // Only mark as shown for non-forced-capture lessons
    if (lesson.type !== 'forcedCapture') {
        tutorialLessonsShown[lesson.type] = true;
    }
    
    let title, text;
    let centerPosition = false;
    
    switch(lesson.type) {
        case 'basicMove':
            title = 'Basic Movement';
            text = tutorialControlMode === 'voice' ? 
                `Say "move L1 to d4" to move your piece diagonally forward. Pieces can only move diagonally on dark squares.` :
                `Click on piece L1, then click on square d4 to move it. Pieces can only move diagonally forward on dark squares.`;
            tutorialForcedPiece = lesson.piece;
            tutorialForcedMove = lesson.move;
            break;
            
        case 'capture':
            title = 'Capturing Pieces';
            text = tutorialControlMode === 'voice' ?
                `You can capture an opponent's piece! Say "move ${gameBoard[lesson.piece.row][lesson.piece.col].label} to ${getSquareName(lesson.move.row, lesson.move.col)}" to jump over and capture the black piece.` :
                `You can capture an opponent's piece! Click on ${gameBoard[lesson.piece.row][lesson.piece.col].label} and jump over the black piece by clicking on the square behind it.`;
            tutorialForcedPiece = lesson.piece;
            tutorialForcedMove = lesson.move;
            break;
            
        case 'kingPromotion':
            title = 'Becoming a King';
            text = `When a piece reaches the opposite end of the board, it becomes a King! Kings can move both forward and backward. Move your piece to the last row.`;
            tutorialForcedPiece = lesson.piece;
            tutorialForcedMove = lesson.move;
            centerPosition = true;
            break;
            
        case 'voiceCommands':
            title = 'Voice Command Tips';
            text = `Remember: Say "move [piece label] to [square]". For example: "move L3 to e4". You can also say "restart" for a new game. Note: The number 2 is never used in coordinates!`;
            centerPosition = true;
            break;
            
        default:
            return;
    }
    
    showTutorialMessage(title, text, lesson, false, centerPosition);
    
    if (tutorialForcedPiece && tutorialForcedMove) {
        highlightTutorialMove(tutorialForcedPiece, tutorialForcedMove);
    }
}

// Show Tutorial Message
function showTutorialMessage(title, text, lesson = null, showButton = false, centerPosition = false) {
    const overlay = document.getElementById('tutorial-overlay');
    const box = document.getElementById('tutorial-box');
    const titleEl = document.getElementById('tutorial-title');
    const textEl = document.getElementById('tutorial-text');
    const actionBtn = document.getElementById('tutorial-action-btn');
    
    titleEl.textContent = title;
    textEl.textContent = text;
    
    if (showButton) {
        actionBtn.style.display = 'block';
        actionBtn.textContent = 'Got it!';
    } else {
        actionBtn.style.display = 'none';
    }
    
    if (centerPosition || !lesson || !lesson.piece) {
        box.style.position = 'fixed';
        box.style.left = '50%';
        box.style.top = '50%';
        box.style.transform = 'translate(-50%, -50%)';
    } else if (lesson && lesson.piece) {
        const square = document.querySelector(`[data-row="${lesson.piece.row}"][data-col="${lesson.piece.col}"]`);
        if (square) {
            const rect = square.getBoundingClientRect();
            const boxWidth = 350;
            const boxHeight = 200;
            
            box.style.position = 'fixed';
            box.style.transform = 'none';
            
            let left = rect.left + rect.width/2 - boxWidth/2;
            let top = rect.top > window.innerHeight/2 ? rect.top - boxHeight - 20 : rect.bottom + 20;
            
            left = Math.max(10, Math.min(left, window.innerWidth - boxWidth - 10));
            top = Math.max(10, Math.min(top, window.innerHeight - boxHeight - 10));
            
            box.style.left = left + 'px';
            box.style.top = top + 'px';
        }
    }
    
    overlay.style.display = 'block';
}

// Highlight Tutorial Move
function highlightTutorialMove(piece, move) {
    document.getElementById('tutorial-dimmer').style.display = 'block';
    
    const pieceSquare = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
    if (pieceSquare) {
        const pieceEl = pieceSquare.querySelector('.piece');
        if (pieceEl) {
            pieceEl.classList.add('tutorial-allowed');
        }
        pieceSquare.classList.add('tutorial-allowed');
        
        const arrow = document.getElementById('tutorial-arrow');
        const rect = pieceSquare.getBoundingClientRect();
        arrow.style.display = 'block';
        arrow.style.left = (rect.left + rect.width/2 - 20) + 'px';
        arrow.style.top = (rect.top - 50) + 'px';
    }
    
    const targetSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
    if (targetSquare) {
        targetSquare.classList.add('tutorial-allowed');
        
        const highlight = document.getElementById('tutorial-highlight');
        const rect = targetSquare.getBoundingClientRect();
        highlight.style.display = 'block';
        highlight.style.left = rect.left + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
    }
}

// Clear Tutorial Highlights
function clearTutorialHighlights() {
    document.getElementById('tutorial-dimmer').style.display = 'none';
    document.getElementById('tutorial-arrow').style.display = 'none';
    document.getElementById('tutorial-highlight').style.display = 'none';
    
    document.querySelectorAll('.tutorial-allowed').forEach(el => {
        el.classList.remove('tutorial-allowed');
    });
}

// Get Square Name for Tutorial
function getSquareName(row, col) {
    const letters = 'abcdefgh';
    const colNumber = col + 3;
    return letters[row] + colNumber;
}

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
    });

    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    const aiDifficultyContainer = document.getElementById('ai-difficulty-container');
    const tutorialModeContainer = document.getElementById('tutorial-mode-container');
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            gameMode = this.value;
            if (gameMode === 'ai') {
                aiDifficultyContainer.style.display = 'block';
                tutorialModeContainer.style.display = 'block';
                aiDifficulty = aiDifficultySelect.value;
                
                if (!tutorialLessonsShown.gameObjective) {
                    setTimeout(() => {
                        document.getElementById('tutorial-prompt').style.display = 'flex';
                    }, 500);
                }
                
                restartGame();
            } else {
                aiDifficultyContainer.style.display = 'none';
                tutorialModeContainer.style.display = 'none';
                tutorialMode = false;
                restartGame();
            }
        });
    });

    aiDifficultySelect.addEventListener('change', function(event) {
        event.stopPropagation();
        aiDifficulty = this.value;
        console.log('AI Difficulty changed to:', aiDifficulty);
        if (gameMode === 'ai') {
            restartGame();
        }
    });
    
    const tutorialCheckbox = document.getElementById('tutorial-mode-checkbox');
    tutorialCheckbox.addEventListener('change', function() {
        if (this.checked && gameMode === 'ai') {
            resetTutorialLessons();
            document.getElementById('tutorial-prompt').style.display = 'flex';
        } else {
            tutorialMode = false;
            endTutorial();
        }
    });

    document.getElementById('reset-game-btn').addEventListener('click', function(event) {
        event.stopPropagation();
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
    
    if (tutorialMode) {
        checkTutorialState();
    }
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

// Check for Forced Moves (captures) - FIXED to trigger tutorial
function checkForForcedMoves() {
    const previousMustCapture = mustCapture;
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
    
    // If tutorial mode and there's a forced capture for player 1, check tutorial state
    if (tutorialMode && mustCapture && currentPlayer === 1 && !isAIMoving) {
        // Use a small delay to ensure the board is rendered first
        setTimeout(() => {
            checkTutorialState();
        }, 100);
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
                    
                    // In tutorial mode with forced capture, allow selecting any piece that can capture
                    if (tutorialMode && mustCapture && currentPlayer === 1) {
                        const canCapture = capturablePieces.some(p => p.row === row && p.col === col);
                        if (!canCapture) {
                            showError('You must select a piece that can capture!');
                            return;
                        }
                    } else if (tutorialMode && tutorialForcedPiece) {
                        if (row !== tutorialForcedPiece.row || col !== tutorialForcedPiece.col) {
                            showError('Please select the highlighted piece for this tutorial step.');
                            return;
                        }
                    }
                    
                    selectPiece(row, col);
                };
                square.appendChild(pieceElement);
            }

            square.onclick = () => {
                if (gameMode === 'ai' && currentPlayer === 2 && !isAIMoving) return;
                
                if (tutorialMode && tutorialForcedMove && !mustCapture) {
                    if (row !== tutorialForcedMove.row || col !== tutorialForcedMove.col) {
                        showError('Please move to the highlighted square for this tutorial step.');
                        return;
                    }
                }
                
                makeMove(row, col);
            };
            boardElement.appendChild(square);
        }
    }
}

// Select Piece - FIXED for tutorial forced captures
function selectPiece(row, col) {
    if (gameEnded) return;
    const piece = gameBoard[row][col];
    if (!piece || piece.player !== currentPlayer) return;
    
    // In tutorial mode with forced capture, clear previous forced move
    if (tutorialMode && mustCapture) {
        tutorialForcedPiece = null;
        tutorialForcedMove = null;
        clearTutorialHighlights();
    }
    
    if (tutorialMode && tutorialForcedPiece && !mustCapture) {
        if (row !== tutorialForcedPiece.row || col !== tutorialForcedPiece.col) {
            return;
        }
    }
    
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
        if (colNumber.toString().includes('2')) return;
        
        if (!gameBoard[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol, isJump: false });
        } 
        else if (gameBoard[newRow][newCol].player !== piece.player) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
            
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                const jumpColNumber = jumpCol + 3;
                if (!gameBoard[jumpRow][jumpCol] && !jumpColNumber.toString().includes('2')) {
                    moves.push({ 
                        row: jumpRow, 
                        col: jumpCol, 
                        isJump: true, 
                        captureRow: newRow, 
                        captureCol: newCol 
                    });
                }
            }
        }
    });

    return moves;
}

// Make Move - CRITICAL FIX: Preserve tutorial mode during AI turns
function makeMove(row, col, isAIMove = false) {
    if (gameEnded || !selectedPiece) return;
    
    // Store tutorial state before move
    const wasTutorialMode = tutorialMode;
    
    if (tutorialMode && tutorialForcedMove && !isAIMove && !mustCapture) {
        if (row !== tutorialForcedMove.row || col !== tutorialForcedMove.col) {
            return;
        }
    }
    
    const moves = getPossibleMoves(selectedPiece.row, selectedPiece.col);
    let validMoves = moves;
    
    if (mustCapture) {
        validMoves = moves.filter(m => m.isJump);
    }
    
    const validMove = validMoves.find(move => move.row === row && move.col === col);
    
    if (validMove) {
        const moveData = {
            from: { row: selectedPiece.row, col: selectedPiece.col },
            to: { row, col },
            piece: JSON.parse(JSON.stringify(gameBoard[selectedPiece.row][selectedPiece.col])),
            captured: validMove.isJump ? JSON.parse(JSON.stringify(gameBoard[validMove.captureRow][validMove.captureCol])) : null,
            capturePos: validMove.isJump ? { row: validMove.captureRow, col: validMove.captureCol } : null
        };
        moveHistory.push(moveData);
        
        const piece = gameBoard[selectedPiece.row][selectedPiece.col];
        gameBoard[row][col] = piece;
        gameBoard[selectedPiece.row][selectedPiece.col] = null;
        
        let madeCapture = false;
        if (validMove.isJump) {
            madeCapture = true;
            const capturedPiece = gameBoard[validMove.captureRow][validMove.captureCol];
            gameBoard[validMove.captureRow][validMove.captureCol] = null;
            
            if (gameMode === 'ai' && currentPlayer === 2) {
                playSoundEffect('enemyCapture');
            } else {
                playSoundEffect('playerCapture');
            }
            
            speakMessage(`${piece.label} captured ${capturedPiece.label}`);
            
            if (wasTutorialMode && !tutorialLessonsShown.doubleJump && currentPlayer === 1 && !isAIMove) {
                const additionalCaptures = getPossibleMoves(row, col).filter(m => m.isJump);
                if (additionalCaptures.length > 0) {
                    tutorialLessonsShown.doubleJump = true;
                    showTutorialMessage(
                        'Double Jump!',
                        'When you capture a piece and can immediately capture another, you must continue! This is called a double jump.',
                        null,
                        true,
                        true
                    );
                }
            }
        } else {
            playSoundEffect('movePiece');
        }
        
        if (!piece.isKing) {
            if ((piece.player === 1 && row === 0) || (piece.player === 2 && row === 7)) {
                piece.isKing = true;
                speakMessage(`${piece.label} is now a king`);
                
                if (wasTutorialMode && !tutorialLessonsShown.kingMovement && piece.player === 1 && !isAIMove) {
                    tutorialLessonsShown.kingMovement = true;
                    showTutorialMessage(
                        'King Powers!',
                        'Your piece is now a King! Kings can move both forward AND backward diagonally. Use this power wisely!',
                        null,
                        true,
                        true
                    );
                }
            }
        }
        
        if (wasTutorialMode) {
            clearTutorialHighlights();
            tutorialForcedPiece = null;
            tutorialForcedMove = null;
        }
        
        if (madeCapture) {
            const additionalCaptures = getPossibleMoves(row, col).filter(m => m.isJump);
            if (additionalCaptures.length > 0) {
                selectedPiece = { row, col };
                clearHighlights();
                
                // RESTORE tutorial mode if it was active
                tutorialMode = wasTutorialMode;
                
                checkForForcedMoves();
                createBoard();
                
                if (isAIMove && gameMode === 'ai' && currentPlayer === 2) {
                    setTimeout(() => {
                        selectPiece(row, col);
                        setTimeout(() => {
                            let bestCapture;
                            if (aiDifficulty === 'easy' || wasTutorialMode) {
                                bestCapture = additionalCaptures[Math.floor(Math.random() * additionalCaptures.length)];
                            } else {
                                bestCapture = additionalCaptures[0];
                            }
                            makeMove(bestCapture.row, bestCapture.col, true);
                        }, 800);
                    }, 800);
                } else {
                    selectPiece(row, col);
                    updateTurnDisplay();
                }
                return;
            }
        }
        
        clearHighlights();
        selectedPiece = null;
        
        // RESTORE tutorial mode before creating board
        tutorialMode = wasTutorialMode;
        createBoard();
        
        if (!checkGameEnd()) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            // Reset forced capture state when turn changes
            lastForcedCaptureState = null;
            checkForForcedMoves();
            updateTurnDisplay();
            createBoard();
            
            checkGameEnd();
            
            if (!gameEnded && gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            } else if (wasTutorialMode && currentPlayer === 1) {
                setTimeout(() => checkTutorialState(), 500);
            }
        }
    }
}

// AI Implementation - FIXED to preserve tutorial mode
function makeAIMove() {
    if (gameEnded) return;
    
    // Store tutorial state
    const wasTutorialMode = tutorialMode;
    
    isAIMoving = true;
    checkForForcedMoves();
    const aiMoves = getAllPossibleMovesForPlayer(2);
    
    let availableMoves = aiMoves;
    if (mustCapture) {
        availableMoves = aiMoves.filter(m => m.isJump);
    }
    
    if (availableMoves.length === 0) {
        isAIMoving = false;
        // Restore tutorial mode
        tutorialMode = wasTutorialMode;
        checkGameEnd();
        return;
    }
    
    let selectedMove;
    
    const effectiveDifficulty = wasTutorialMode ? 'easy' : aiDifficulty;
    
    if (effectiveDifficulty === 'easy') {
        selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (effectiveDifficulty === 'medium') {
        const captures = availableMoves.filter(move => move.isJump);
        if (captures.length > 0 && Math.random() > 0.2) {
            selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    } else if (effectiveDifficulty === 'hard') {
        selectedMove = getBestMove(availableMoves);
    }
    
    if (selectedMove) {
        // Restore tutorial mode before making move
        tutorialMode = wasTutorialMode;
        selectPiece(selectedMove.from.row, selectedMove.from.col);
        setTimeout(() => {
            makeMove(selectedMove.to.row, selectedMove.to.col, true);
            isAIMoving = false;
            // Ensure tutorial mode is still active after AI move
            tutorialMode = wasTutorialMode;
        }, 500);
    } else {
        isAIMoving = false;
        // Restore tutorial mode
        tutorialMode = wasTutorialMode;
    }
}

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
                        isJump: move.isJump,
                        piece: piece
                    });
                });
            }
        }
    }
    return allMoves;
}

function getBestMove(moves) {
    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    moves.forEach(move => {
        let score = 0;
        
        if (move.isJump) score += 20;
        if (move.piece.isKing) score += 5;
        
        if (!move.piece.isKing && move.piece.player === 2) {
            score += move.to.row * 1.5;
        }
        
        const centerDistance = Math.abs(3.5 - move.to.col) + Math.abs(3.5 - move.to.row);
        score += (7 - centerDistance) * 0.5;
        
        if (move.piece.player === 2 && move.from.row === 0 && !move.piece.isKing) {
            score -= 3;
        }
        
        if (!move.piece.isKing && (move.to.col === 0 || move.to.col === 7)) {
            score -= 1;
        }
        
        score += Math.random() * 0.2;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    return bestMove;
}

// Clear Highlights
function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlighted', 'possible-move', 'must-capture');
    });
}

// Update Turn Display
function updateTurnDisplay() {
    let message = currentPlayer === 1 ?
        "Player 1's turn (Red)" :
        gameMode === 'ai' ? `AI's turn (Black - ${tutorialMode ? 'Tutorial' : aiDifficulty})` : "Player 2's turn (Black)";
    
    if (mustCapture) {
        message += " - MUST CAPTURE!";
    }
    
    document.getElementById('turn-display-top').textContent = message;
    document.getElementById('turn-display-bottom').textContent = message;
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

// Show Game End Overlay
function showGameEndOverlay(winner) {
    const overlay = document.getElementById('game-end-overlay');
    const title = document.getElementById('game-end-title');
    const message = document.getElementById('game-end-message');
    
    if (tutorialMode) {
        endTutorial();
    }
    
    if (winner === 1) {
        title.textContent = "Player 1 Wins!";
        message.textContent = tutorialMode ? 
            "Great job! You've completed the tutorial and won!" :
            "Red pieces have conquered the board!";
        
        if (gameMode === 'ai') {
            playSoundEffect('gameWin');
        } else {
            playSoundEffect('gameWin');
        }
        
        speakMessage("Player 1 wins!");
    } else {
        if (gameMode === 'ai') {
            title.textContent = "AI Wins!";
            message.textContent = tutorialMode ?
                "Don't worry! Try again to master the game!" :
                "Black pieces have conquered the board!";
            playSoundEffect('gameLose');
            speakMessage("AI wins!");
        } else {
            title.textContent = "Player 2 Wins!";
            message.textContent = "Black pieces have conquered the board!";
            playSoundEffect('gameWin');
            speakMessage("Player 2 wins!");
        }
    }
    
    document.getElementById('game-container').style.display = 'none';
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
    lastForcedCaptureState = null;
    
    // Only end tutorial if explicitly disabled
    if (tutorialMode) {
        clearTutorialHighlights();
        document.getElementById('tutorial-overlay').style.display = 'none';
    }
    
    document.getElementById('game-status').textContent = '';
    initializeBoard();
    checkForForcedMoves();
    createBoard();
    updateTurnDisplay();
    speakMessage('New game started');
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
            document.getElementById('last-command').textContent = `Last command: "${command}"`;
            parseVoiceCommand(command);
        };
        
        recognition.onerror = function(event) {
            showError(`Voice recognition error: ${event.error}`);
        };
    } else {
        showError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
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
    
    if (listening) {
        btnTop.disabled = true;
        btnBottom.disabled = true;
        btnTop.classList.add('listening');
        btnBottom.classList.add('listening');
    } else {
        btnTop.disabled = false;
        btnBottom.disabled = false;
        btnTop.classList.remove('listening');
        btnBottom.classList.remove('listening');
    }
}

function updateVoiceStatus(status) {
    document.getElementById('voice-status').textContent = status;
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
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

// Parse Voice Commands
function parseVoiceCommand(command) {
    try {
        command = command.replace(/\b(um|uh|like|you know)\b/g, '').trim();

        if (command.includes('new game') || command.includes('restart') || command.includes('reset')) {
            restartGame();
            return;
        }
        
        if (command.includes('skip tutorial') && tutorialMode) {
            endTutorial();
            return;
        }

        const movePatterns = [
            /(?:move\s+)?([ln]\d+)\s+to\s+([a-h][3-9]|[a-h]10)/i,
            /(?:move\s+)?([ln]\d+)\s+([a-h][3-9]|[a-h]10)/i,
            /([ln]\d+)\s+to\s+([a-h][3-9]|[a-h]10)/i,
            /([ln]\d+)\s+([a-h][3-9]|[a-h]10)/i
        ];

        for (const pattern of movePatterns) {
            const match = command.match(pattern);
            if (match) {
                const pieceLabel = match[1].toUpperCase();
                const targetSquare = match[2].toLowerCase();
                executeVoiceMove(pieceLabel, targetSquare);
                return;
            }
        }

        const selectPattern = /(?:select\s+|choose\s+)?([ln]\d+)/i;
        const selectMatch = command.match(selectPattern);
        if (selectMatch) {
            const pieceLabel = selectMatch[1].toUpperCase();
            selectPieceByLabel(pieceLabel);
            return;
        }

        speakMessage('Command not recognized. Try saying "move L3 to e4".');
        showError('Command not recognized. Try: "move L3 to e4" or "new game".');

    } catch (error) {
        showError('Error processing voice command');
    }
}

function executeVoiceMove(pieceLabel, targetSquare) {
    if (pieceLabel.includes('2') || (targetSquare.match(/\d+/) && targetSquare.match(/\d+/)[0].includes('2'))) {
        speakMessage(`Number 2 is never used in this game. Try another label.`);
        showError(`Number 2 is never used in this game. Try another label.`);
        
        if (tutorialMode && !tutorialLessonsShown.coordinates) {
            tutorialLessonsShown.coordinates = true;
            showTutorialMessage(
                'Special Rule: No 2s!',
                'In this version of checkers, the number 2 is never used in piece labels or square coordinates. This is a unique feature of our game!',
                null,
                true,
                true
            );
        }
        return;
    }

    const piecePosition = findPieceByLabel(pieceLabel);
    if (!piecePosition) {
        speakMessage(`Piece ${pieceLabel} not found`);
        showError(`Piece ${pieceLabel} not found`);
        return;
    }

    const piece = gameBoard[piecePosition.row][piecePosition.col];
    if (piece.player !== currentPlayer) {
        speakMessage(`It's not your turn to move ${pieceLabel}`);
        showError(`It's not your turn to move ${pieceLabel}`);
        return;
    }
    
    if (tutorialMode && tutorialForcedPiece) {
        if (piecePosition.row !== tutorialForcedPiece.row || piecePosition.col !== tutorialForcedPiece.col) {
            speakMessage(`Please move the highlighted piece for this tutorial step`);
            return;
        }
    }

    const targetCoords = squareToCoordinates(targetSquare);
    if (!targetCoords) {
        speakMessage(`Invalid square ${targetSquare}`);
        showError(`Invalid square ${targetSquare}`);
        return;
    }
    
    if (tutorialMode && tutorialForcedMove) {
        if (targetCoords.row !== tutorialForcedMove.row || targetCoords.col !== tutorialForcedMove.col) {
            speakMessage(`Please move to the highlighted square for this tutorial step`);
            return;
        }
    }

    selectPiece(piecePosition.row, piecePosition.col);

    const moves = getPossibleMoves(piecePosition.row, piecePosition.col);
    let validMoves = moves;
    
    if (mustCapture) {
        validMoves = moves.filter(m => m.isJump);
    }
    
    const validMove = validMoves.find(move => move.row === targetCoords.row && move.col === targetCoords.col);

    if (validMove) {
        makeMove(targetCoords.row, targetCoords.col);
        speakMessage(`${pieceLabel} moved to ${targetSquare}`);
    } else {
        if (mustCapture) {
            speakMessage(`Invalid move: You must capture`);
            showError(`Invalid move: You must capture`);
        } else {
            speakMessage(`Invalid move: ${pieceLabel} cannot move to ${targetSquare}`);
            showError(`Invalid move: ${pieceLabel} cannot move to ${targetSquare}`);
        }
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

function selectPieceByLabel(label) {
    if (label.includes('2')) {
        speakMessage(`Number 2 is never used in this game. Try another label.`);
        showError(`Number 2 is never used in this game. Try another label.`);
        return;
    }
    const position = findPieceByLabel(label);
    if (position) {
        selectPiece(position.row, position.col);
        speakMessage(`${label} selected`);
    } else {
        speakMessage(`Piece ${label} not found`);
        showError(`Piece ${label} not found`);
    }
}

function squareToCoordinates(square) {
    if (square.length < 2) return null;
    const letters = 'abcdefgh';
    const letter = square[0];
    const number = parseInt(square.slice(1));
    if (letter < 'a' || letter > 'h' || number < 3 || number > 10 || number.toString().includes('2')) {
        return null;
    }
    const row = letters.indexOf(letter);
    const col = number - 3;
    return { row, col };
}
