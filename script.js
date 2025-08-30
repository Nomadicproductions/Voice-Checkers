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
    gameObjective: false,  // Added new lesson
    basicMove: false,
    capture: false,
    forcedCapture: false,
    doubleJump: false,
    kingPromotion: false,
    kingMovement: false,
    voiceCommands: false,
    coordinates: false
};
let tutorialCurrentLesson = null;
let tutorialForcedPiece = null;
let tutorialForcedMove = null;

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

// Preload images before starting - FIXED VERSION
function preloadImages(callback) {
    const images = [
        'assets/file_000000001e3462308102f8b9c449e32f.png',
        'assets/file_0000000041206230a7fd6540e0938673.png'
    ];
    
    let loadedCount = 0;
    let totalImages = images.length;
    
    // If no images to load or images array is empty, proceed immediately
    if (totalImages === 0) {
        callback();
        return;
    }
    
    // Function to handle when an image finishes (either success or error)
    const imageFinished = () => {
        loadedCount++;
        console.log(`Image ${loadedCount}/${totalImages} processed`);
        if (loadedCount === totalImages) {
            callback();
        }
    };
    
    images.forEach(src => {
        const img = new Image();
        
        // Set up timeout for each image (5 seconds)
        const timeoutId = setTimeout(() => {
            console.warn(`Image load timeout: ${src}`);
            imageFinished();
        }, 5000);
        
        img.onload = () => {
            clearTimeout(timeoutId);
            console.log(`Image loaded successfully: ${src}`);
            imageFinished();
        };
        
        img.onerror = () => {
            clearTimeout(timeoutId);
            console.warn(`Failed to load image: ${src}`);
            imageFinished();
        };
        
        img.src = src;
    });
}

// Loading Screen and Intro Sequence - FIXED VERSION
window.addEventListener('load', function() {
    console.log('Window loaded, starting initialization...');
    
    // Preload audio files (non-blocking)
    Object.values(gameAudio).forEach(audio => {
        audio.load();
    });
    
    // Add timeout fallback in case images fail to load
    const loadingTimeout = setTimeout(() => {
        console.warn('Loading timeout reached, proceeding anyway...');
        document.getElementById('loading-screen').style.display = 'none';
        // Skip intro if images failed, go straight to start screen
        document.getElementById('start-overlay').style.display = 'flex';
    }, 10000); // 10 second maximum wait
    
    // Preload images
    preloadImages(() => {
        clearTimeout(loadingTimeout);
        console.log('Images preloaded, hiding loading screen...');
        
        // Hide loading screen after short delay
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            // Start intro sequence
            playIntroSequence();
        }, 2000);
    });
});

// Alternative: Add DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // If window.load doesn't fire within 15 seconds, force start
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.warn('Forcing game start due to loading timeout');
            loadingScreen.style.display = 'none';
            document.getElementById('start-overlay').style.display = 'flex';
        }
    }, 15000);
});

// Play Intro Sequence - FIXED VERSION with error handling
function playIntroSequence() {
    const introScene = document.getElementById('intro-scene');
    const introImage = document.getElementById('intro-image');
    
    // Check if elements exist
    if (!introScene || !introImage) {
        console.error('Intro elements not found, skipping to start screen');
        document.getElementById('start-overlay').style.display = 'flex';
        return;
    }
    
    // Show intro scene
    introScene.style.display = 'flex';
    
    // Play first image
    introImage.onerror = function() {
        console.warn('First intro image failed to load, skipping to second');
        playSecondIntroImage();
    };
    
    introImage.src = 'assets/file_000000001e3462308102f8b9c449e32f.png';
    
    setTimeout(() => {
        introImage.classList.add('fade-in');
    }, 100);
    
    // After 3.5 seconds, fade out and switch to second image
    setTimeout(() => {
        playSecondIntroImage();
    }, 3500);
    
    function playSecondIntroImage() {
        introImage.classList.remove('fade-in');
        setTimeout(() => {
            introImage.onerror = function() {
                console.warn('Second intro image failed to load, proceeding to start');
                proceedToStart();
            };
            
            introImage.src = 'assets/file_0000000041206230a7fd6540e0938673.png';
            setTimeout(() => {
                introImage.classList.add('fade-in');
            }, 100);
            
            // After another 3.5 seconds, fade out and show start overlay
            setTimeout(() => {
                proceedToStart();
            }, 3500);
        }, 500);
    }
    
    function proceedToStart() {
        introImage.classList.remove('fade-in');
        setTimeout(() => {
            introScene.style.display = 'none';
            document.getElementById('start-overlay').style.display = 'flex';
        }, 500);
    }
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
        aiDifficulty = 'easy'; // Set AI to easy for tutorial
        // Reset all tutorial lessons when starting new tutorial
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
    };
    
    document.getElementById('tutorial-voice-btn').onclick = function() {
        tutorialMode = true;
        tutorialControlMode = 'voice';
        aiDifficulty = 'easy'; // Set AI to easy for tutorial
        // Reset all tutorial lessons when starting new tutorial
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
        // Automatically start voice recognition for voice mode
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
}

// Start Tutorial
function startTutorial() {
    tutorialStep = 0;
    tutorialCurrentLesson = null;
    
    // Show game objective first
    showTutorialMessage(
        'Welcome to Checkers!',
        'Your goal is to capture all enemy pieces OR block them from moving. You can also win by getting your pieces to the opposite end to become Kings! Kings are powerful - they can move both forward and backward. Let\'s learn how to play!',
        null,
        true,
        true  // center position
    );
    tutorialLessonsShown.gameObjective = true;
}

// End Tutorial
function endTutorial() {
    tutorialMode = false;
    tutorialCurrentLesson = null;
    tutorialForcedPiece = null;
    tutorialForcedMove = null;
    document.getElementById('tutorial-overlay').style.display = 'none';
    
    // Re-enable all pieces
    createBoard();
}

// Advance Tutorial
function advanceTutorial() {
    document.getElementById('tutorial-action-btn').style.display = 'none';
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialCurrentLesson = null;
    checkTutorialState();
}

// Check Tutorial State
function checkTutorialState() {
    if (!tutorialMode || currentPlayer !== 1 || isAIMoving) return;
    
    // Check what lesson to show based on game state
    const possibleLessons = analyzeBoardForTutorial();
    
    for (const lesson of possibleLessons) {
        if (!tutorialLessonsShown[lesson.type]) {
            showTutorialLesson(lesson);
            break;
        }
    }
}

// Analyze Board for Tutorial Opportunities - FIXED to always show tutorials for Player 1
function analyzeBoardForTutorial() {
    const lessons = [];
    
    // Check for basic move (first move)
    if (!tutorialLessonsShown.basicMove && moveHistory.length === 0) {
        lessons.push({
            type: 'basicMove',
            piece: { row: 5, col: 0 },
            move: { row: 4, col: 1 }
        });
    }
    
    // Check for capture opportunity - REMOVED AI capture check, always show for Player 1
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
    
    // Check for forced capture
    if (!tutorialLessonsShown.forcedCapture && mustCapture) {
        lessons.push({
            type: 'forcedCapture',
            piece: capturablePieces[0],
            move: capturablePieces[0].captures[0]
        });
    }
    
    // Check for king promotion possibility
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
    
    // Check for double jump opportunity - only for Player 1
    if (!tutorialLessonsShown.doubleJump) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameBoard[row][col];
                if (piece && piece.player === 1) {
                    // Simulate capturing to check for double jump
                    const moves = getPossibleMoves(row, col);
                    const captures = moves.filter(m => m.isJump);
                    if (captures.length > 0) {
                        // Check if after this capture, another capture would be available
                        // This is a simplified check for tutorial purposes
                        const firstCapture = captures[0];
                        // Temporarily simulate the move
                        const tempPiece = gameBoard[firstCapture.captureRow][firstCapture.captureCol];
                        gameBoard[firstCapture.captureRow][firstCapture.captureCol] = null;
                        gameBoard[firstCapture.row][firstCapture.col] = piece;
                        gameBoard[row][col] = null;
                        
                        const nextMoves = getPossibleMoves(firstCapture.row, firstCapture.col);
                        const nextCaptures = nextMoves.filter(m => m.isJump);
                        
                        // Restore board state
                        gameBoard[row][col] = piece;
                        gameBoard[firstCapture.row][firstCapture.col] = null;
                        gameBoard[firstCapture.captureRow][firstCapture.captureCol] = tempPiece;
                        
                        if (nextCaptures.length > 0) {
                            // Don't add to lessons array, just mark for showing when it happens
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // Check for voice command lesson (if in voice mode and not shown)
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
    tutorialLessonsShown[lesson.type] = true;
    
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
            
        case 'forcedCapture':
            title = 'Forced Capture Rule';
            text = `When you can capture a piece, you MUST do it! The piece that can capture is highlighted. This is a mandatory rule in checkers.`;
            tutorialForcedPiece = { row: lesson.piece.row, col: lesson.piece.col };
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
    
    // Force the specific move if needed
    if (tutorialForcedPiece && tutorialForcedMove) {
        highlightTutorialMove(tutorialForcedPiece, tutorialForcedMove);
    }
}

// Show Tutorial Message - Updated with better positioning
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
    
    // Position the tutorial box
    if (centerPosition || !lesson || !lesson.piece) {
        // Center the box in viewport
        box.style.position = 'fixed';
        box.style.left = '50%';
        box.style.top = '50%';
        box.style.transform = 'translate(-50%, -50%)';
    } else if (lesson && lesson.piece) {
        const square = document.querySelector(`[data-row="${lesson.piece.row}"][data-col="${lesson.piece.col}"]`);
        if (square) {
            const rect = square.getBoundingClientRect();
            const boxWidth = 350;
            const boxHeight = 200; // Approximate height
            
            box.style.position = 'fixed';
            box.style.transform = 'none';
            
            // Calculate position to keep box in viewport
            let left = rect.left + rect.width/2 - boxWidth/2;
            let top = rect.top > window.innerHeight/2 ? rect.top - boxHeight - 20 : rect.bottom + 20;
            
            // Keep within viewport bounds
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
    // Dim the board
    document.getElementById('tutorial-dimmer').style.display = 'block';
    
    // Highlight the piece
    const pieceSquare = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
    if (pieceSquare) {
        const pieceEl = pieceSquare.querySelector('.piece');
        if (pieceEl) {
            pieceEl.classList.add('tutorial-allowed');
        }
        pieceSquare.classList.add('tutorial-allowed');
        
        // Add arrow pointing to piece
        const arrow = document.getElementById('tutorial-arrow');
        const rect = pieceSquare.getBoundingClientRect();
        arrow.style.display = 'block';
        arrow.style.left = (rect.left + rect.width/2 - 20) + 'px';
        arrow.style.top = (rect.top - 50) + 'px';
    }
    
    // Highlight the target square
    const targetSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
    if (targetSquare) {
        targetSquare.classList.add('tutorial-allowed');
        
        // Add highlight box
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
    // Don't close if clicking inside settings content
    if (!event.target.closest('.settings-content')) {
        document.getElementById('settings-dropdown').classList.remove('show');
    }
});

// Settings Controls
document.addEventListener('DOMContentLoaded', function () {
    // Voice feedback checkbox - default OFF
    const voiceCheckbox = document.getElementById('voice-feedback-checkbox');
    voiceCheckbox.checked = false;
    voiceCheckbox.addEventListener('change', function () {
        voiceFeedbackEnabled = voiceCheckbox.checked;
    });

    // Game mode radio buttons
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
                // Apply current difficulty selection
                aiDifficulty = aiDifficultySelect.value;
                
                // Show tutorial prompt if it's the first AI game
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

    // AI difficulty select
    aiDifficultySelect.addEventListener('change', function(event) {
        event.stopPropagation();
        aiDifficulty = this.value;
        console.log('AI Difficulty changed to:', aiDifficulty);
        if (gameMode === 'ai') {
            restartGame();
        }
    });
    
    // Tutorial mode checkbox
    const tutorialCheckbox = document.getElementById('tutorial-mode-checkbox');
    tutorialCheckbox.addEventListener('change', function() {
        if (this.checked && gameMode === 'ai') {
            // Reset tutorial lessons when restarting tutorial
            resetTutorialLessons();
            document.getElementById('tutorial-prompt').style.display = 'flex';
        } else {
            tutorialMode = false;
            endTutorial();
        }
    });

    // Reset Game Button
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
    
    // Check if tutorial should start
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

            // Highlight forced capture pieces
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
                    // Prevent manual selection during AI turn
                    if (gameMode === 'ai' && currentPlayer === 2 && !isAIMoving) return;
                    
                    // Tutorial mode restrictions
                    if (tutorialMode && tutorialForcedPiece) {
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
                // Prevent manual moves during AI turn
                if (gameMode === 'ai' && currentPlayer === 2 && !isAIMoving) return;
                
                // Tutorial mode restrictions
                if (tutorialMode && tutorialForcedMove) {
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

// Select Piece
function selectPiece(row, col) {
    if (gameEnded) return;
    const piece = gameBoard[row][col];
    if (!piece || piece.player !== currentPlayer) return;
    
    // Tutorial restrictions
    if (tutorialMode && tutorialForcedPiece) {
        if (row !== tutorialForcedPiece.row || col !== tutorialForcedPiece.col) {
            return;
        }
    }
    
    // Check if must capture and this piece can capture
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
    // If must capture, only show capture moves
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
        
        // Check bounds
        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) return;
        
        // Check for column number with 2
        const colNumber = newCol + 3;
        if (colNumber.toString().includes('2')) return;
        
        // Check if square is empty (regular move)
        if (!gameBoard[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol, isJump: false });
        } 
        // Check if there's an opponent piece to potentially jump
        else if (gameBoard[newRow][newCol].player !== piece.player) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
            
            // Check jump destination bounds
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                const jumpColNumber = jumpCol + 3;
                // Check if jump destination is empty and doesn't have 2 in column number
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

// Make Move - FIXED to not skip tutorials based on AI actions
function makeMove(row, col, isAIMove = false) {
    if (gameEnded || !selectedPiece) return;
    
    // Tutorial restrictions
    if (tutorialMode && tutorialForcedMove && !isAIMove) {
        if (row !== tutorialForcedMove.row || col !== tutorialForcedMove.col) {
            return;
        }
    }
    
    const moves = getPossibleMoves(selectedPiece.row, selectedPiece.col);
    let validMoves = moves;
    
    // If must capture, only allow capture moves
    if (mustCapture) {
        validMoves = moves.filter(m => m.isJump);
    }
    
    const validMove = validMoves.find(move => move.row === row && move.col === col);
    
    if (validMove) {
        // Save move for undo functionality
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
            
            // Play capture sound effect
            if (gameMode === 'ai' && currentPlayer === 2) {
                playSoundEffect('enemyCapture');
            } else {
                playSoundEffect('playerCapture');
            }
            
            speakMessage(`${piece.label} captured ${capturedPiece.label}`);
            
            // Tutorial: Check for double jump lesson - only show for Player 1
            if (tutorialMode && !tutorialLessonsShown.doubleJump && currentPlayer === 1 && !isAIMove) {
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
            // Play move sound effect for non-capture moves
            playSoundEffect('movePiece');
        }
        
        // Check for king promotion
        if (!piece.isKing) {
            if ((piece.player === 1 && row === 0) || (piece.player === 2 && row === 7)) {
                piece.isKing = true;
                speakMessage(`${piece.label} is now a king`);
                
                // Tutorial: King movement lesson - only for Player 1
                if (tutorialMode && !tutorialLessonsShown.kingMovement && piece.player === 1 && !isAIMove) {
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
        
        // Clear tutorial highlights after successful move
        if (tutorialMode) {
            clearTutorialHighlights();
            tutorialForcedPiece = null;
            tutorialForcedMove = null;
        }
        
        // Check for additional captures (double jump)
        if (madeCapture) {
            const additionalCaptures = getPossibleMoves(row, col).filter(m => m.isJump);
            if (additionalCaptures.length > 0) {
                selectedPiece = { row, col };
                clearHighlights();
                checkForForcedMoves();
                createBoard();
                
                // If AI is making the move, automatically continue the double jump
                if (isAIMove && gameMode === 'ai' && currentPlayer === 2) {
                    setTimeout(() => {
                        selectPiece(row, col);
                        setTimeout(() => {
                            // Select the best additional capture based on difficulty
                            let bestCapture;
                            if (aiDifficulty === 'easy' || tutorialMode) {
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
                return; // Don't switch turns yet
            }
        }
        
        clearHighlights();
        selectedPiece = null;
        createBoard();
        
        // Check game end before switching turns
        if (!checkGameEnd()) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            checkForForcedMoves();
            updateTurnDisplay();
            createBoard();
            
            // Check again after turn switch
            checkGameEnd();
            
            // AI Move
            if (!gameEnded && gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            } else if (tutorialMode && currentPlayer === 1) {
                // Check for next tutorial lesson
                setTimeout(() => checkTutorialState(), 500);
            }
        }
    }
}

// AI Implementation
function makeAIMove() {
    if (gameEnded) return;
    
    isAIMoving = true;
    checkForForcedMoves();
    const aiMoves = getAllPossibleMovesForPlayer(2);
    
    // Filter for forced captures if needed
    let availableMoves = aiMoves;
    if (mustCapture) {
        availableMoves = aiMoves.filter(m => m.isJump);
    }
    
    if (availableMoves.length === 0) {
        isAIMoving = false;
        checkGameEnd();
        return;
    }
    
    let selectedMove;
    
    // In tutorial mode, always use easy AI
    const effectiveDifficulty = tutorialMode ? 'easy' : aiDifficulty;
    
    if (effectiveDifficulty === 'easy') {
        // Easy: Pure random moves, sometimes misses captures
        selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (effectiveDifficulty === 'medium') {
        // Medium: Prefer captures, then random
        const captures = availableMoves.filter(move => move.isJump);
        if (captures.length > 0 && Math.random() > 0.2) { // 80% chance to capture
            selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    } else if (effectiveDifficulty === 'hard') {
        // Hard: Strategic play with evaluation
        selectedMove = getBestMove(availableMoves);
    }
    
    if (selectedMove) {
        selectPiece(selectedMove.from.row, selectedMove.from.col);
        setTimeout(() => {
            makeMove(selectedMove.to.row, selectedMove.to.col, true);
            isAIMoving = false;
        }, 500);
    } else {
        isAIMoving = false;
    }
}

// Continue with rest of the functions...
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
        
        // Heavy capture bonus for hard mode
        if (move.isJump) score += 20;
        
        // King bonus
        if (move.piece.isKing) score += 5;
        
        // Position evaluation
        if (!move.piece.isKing && move.piece.player === 2) {
            // Advance towards king row
            score += move.to.row * 1.5;
        }
        
        // Center control bonus
        const centerDistance = Math.abs(3.5 - move.to.col) + Math.abs(3.5 - move.to.row);
        score += (7 - centerDistance) * 0.5;
        
        // Protect back row (don't move from back unless necessary)
        if (move.piece.player === 2 && move.from.row === 0 && !move.piece.isKing) {
            score -= 3;
        }
        
        // Edge avoidance (except for kings)
        if (!move.piece.isKing && (move.to.col === 0 || move.to.col === 7)) {
            score -= 1;
        }
        
        // Very small random factor for unpredictability
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
    
    // Add forced capture notification
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
    
    // Check if current player has any valid moves
    const currentPlayerMoves = getAllPossibleMovesForPlayer(currentPlayer);
    
    // Win conditions
    if (player1Pieces === 0) {
        showGameEndOverlay(2);
        gameEnded = true;
        return true;
    } else if (player2Pieces === 0) {
        showGameEndOverlay(1);
        gameEnded = true;
        return true;
    } else if (currentPlayerMoves.length === 0) {
        // Current player has no moves, they lose
        const winner = currentPlayer === 1 ? 2 : 1;
        showGameEndOverlay(winner);
        gameEnded = true;
        return true;
    }
    
    return false;
}

// Show Game End Overlay - Updated with sound effects
function showGameEndOverlay(winner) {
    const overlay = document.getElementById('game-end-overlay');
    const title = document.getElementById('game-end-title');
    const message = document.getElementById('game-end-message');
    
    // End tutorial if active
    if (tutorialMode) {
        endTutorial();
    }
    
    if (winner === 1) {
        title.textContent = "Player 1 Wins!";
        message.textContent = tutorialMode ? 
            "Great job! You've completed the tutorial and won!" :
            "Red pieces have conquered the board!";
        
        // Play appropriate sound effect
        if (gameMode === 'ai') {
            playSoundEffect('gameWin'); // Player wins against AI
        } else {
            playSoundEffect('gameWin'); // Player 1 wins in 2-player mode
        }
        
        speakMessage("Player 1 wins!");
    } else {
        if (gameMode === 'ai') {
            title.textContent = "AI Wins!";
            message.textContent = tutorialMode ?
                "Don't worry! Try again to master the game!" :
                "Black pieces have conquered the board!";
            playSoundEffect('gameLose'); // Player loses to AI
            speakMessage("AI wins!");
        } else {
            title.textContent = "Player 2 Wins!";
            message.textContent = "Black pieces have conquered the board!";
            playSoundEffect('gameWin'); // Player 2 wins in 2-player mode
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
    
    // End tutorial if active
    if (tutorialMode) {
        endTutorial();
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
        
        // Tutorial lesson about coordinates
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
    
    // Tutorial restrictions for voice commands
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
    
    // Tutorial restrictions for target square
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
