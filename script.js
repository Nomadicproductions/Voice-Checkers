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
let tutorialControlMode = 'touch';
let tutorialStep = 0;
let tutorialLessonsShown = {
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

Object.values(gameAudio).forEach(audio => {
    audio.volume = 0.5;
});

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

// LOADING SYSTEM
function preloadImages(callback) {
    const images = [
        'assets/file_000000001e3462308102f8b9c449e32f.png',
        'assets/file_0000000041206230a7fd6540e0938673.png'
    ];
    
    let loadedCount = 0;
    let finished = false;
    
    function done() {
        if (!finished) {
            finished = true;
            callback();
        }
    }
    
    setTimeout(() => {
        console.warn('Image loading timeout');
        done();
    }, 5000);
    
    if (images.length === 0) {
        done();
        return;
    }
    
    images.forEach((src, index) => {
        const img = new Image();
        img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === images.length) done();
        };
        img.src = src;
    });
}

window.addEventListener('DOMContentLoaded', function() {
    Object.values(gameAudio).forEach(audio => audio.load());
    
    preloadImages(() => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            try {
                playIntroSequence();
            } catch (err) {
                showStartScreen();
            }
        }, 1000);
    });
    
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            loadingScreen.style.display = 'none';
            showStartScreen();
        }
    }, 8000);
});

function showStartScreen() {
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
        startOverlay.style.display = 'flex';
    }
}

function playIntroSequence() {
    const introScene = document.getElementById('intro-scene');
    const introImage = document.getElementById('intro-image');
    
    if (!introScene || !introImage) {
        showStartScreen();
        return;
    }
    
    introScene.style.display = 'flex';
    introImage.src = 'assets/file_000000001e3462308102f8b9c449e32f.png';
    
    introImage.onerror = () => {
        introScene.style.display = 'none';
        showStartScreen();
    };
    
    setTimeout(() => {
        introImage.classList.add('fade-in');
    }, 100);
    
    setTimeout(() => {
        introImage.classList.remove('fade-in');
        setTimeout(() => {
            introImage.src = 'assets/file_0000000041206230a7fd6540e0938673.png';
            setTimeout(() => {
                introImage.classList.add('fade-in');
            }, 100);
            
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

// EVENT HANDLERS
document.getElementById('start-game-btn').onclick = function() {
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    initializeGame();
};

document.getElementById('play-again-btn').onclick = function() {
    document.getElementById('game-end-overlay').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    restartGame();
};

document.getElementById('tutorial-yes-btn').onclick = function() {
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
        aiDifficulty = 'easy';
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
    };
    
    document.getElementById('tutorial-voice-btn').onclick = function() {
        tutorialMode = true;
        tutorialControlMode = 'voice';
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

document.getElementById('tutorial-skip-btn').onclick = function() {
    endTutorial();
};

document.getElementById('tutorial-action-btn').onclick = function() {
    advanceTutorial();
};

// TUTORIAL FUNCTIONS - COMPLETELY REWRITTEN FOR FORCED CAPTURE
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

function endTutorial() {
    tutorialMode = false;
    tutorialCurrentLesson = null;
    tutorialForcedPiece = null;
    tutorialForcedMove = null;
    document.getElementById('tutorial-overlay').style.display = 'none';
    createBoard();
}

function advanceTutorial() {
    document.getElementById('tutorial-action-btn').style.display = 'none';
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialCurrentLesson = null;
    
    // IMMEDIATE check for forced capture after closing tutorial
    if (tutorialMode && mustCapture && currentPlayer === 1) {
        console.log('FORCED CAPTURE DETECTED - Showing tutorial immediately');
        setTimeout(() => showForcedCaptureTutorial(), 100);
        return;
    }
    
    checkTutorialState();
}

// SIMPLIFIED FORCED CAPTURE CHECK - This will ALWAYS trigger
function checkTutorialState() {
    if (!tutorialMode || currentPlayer !== 1 || isAIMoving) return;
    
    console.log('=== TUTORIAL CHECK ===');
    console.log('tutorialMode:', tutorialMode);
    console.log('currentPlayer:', currentPlayer);  
    console.log('mustCapture:', mustCapture);
    console.log('capturablePieces length:', capturablePieces.length);
    
    // FORCE CAPTURE CHECK - HIGHEST PRIORITY
    if (mustCapture && capturablePieces.length > 0) {
        console.log('🚨 SHOWING FORCED CAPTURE TUTORIAL 🚨');
        showForcedCaptureTutorial();
        return;
    }
    
    // Other tutorials
    const possibleLessons = analyzeBoardForTutorial();
    for (const lesson of possibleLessons) {
        if (!tutorialLessonsShown[lesson.type]) {
            showTutorialLesson(lesson);
            break;
        }
    }
}

// DEDICATED FORCED CAPTURE TUTORIAL - ALWAYS SHOWS
function showForcedCaptureTutorial() {
    console.log('🎯 DISPLAYING FORCED CAPTURE TUTORIAL');
    
    if (!mustCapture || capturablePieces.length === 0) {
        console.log('❌ No forced capture needed');
        return;
    }
    
    // Get piece labels that can capture
    const captureLabels = capturablePieces.map(p => {
        const piece = gameBoard[p.row][p.col];
        return piece ? piece.label : '';
    }).filter(label => label);
    
    let message;
    if (capturablePieces.length > 1) {
        message = `🚨 MANDATORY CAPTURE! 🚨\n\nYou have ${capturablePieces.length} pieces that MUST capture: ${captureLabels.join(', ')}.\n\nYou cannot make any other move when captures are available. This is a fundamental rule of checkers!`;
    } else {
        message = `🚨 MANDATORY CAPTURE! 🚨\n\n${captureLabels[0]} MUST capture an opponent's piece.\n\nWhen a capture is available, you cannot make any other move. This rule is always enforced in checkers!`;
    }
    
    // Show the tutorial overlay
    const overlay = document.getElementById('tutorial-overlay');
    const box = document.getElementById('tutorial-box');
    const titleEl = document.getElementById('tutorial-title');
    const textEl = document.getElementById('tutorial-text');
    const actionBtn = document.getElementById('tutorial-action-btn');
    
    titleEl.textContent = '⚡ MANDATORY CAPTURE ⚡';
    textEl.textContent = message;
    actionBtn.style.display = 'none';
    
    // Center the box
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    
    overlay.style.display = 'block';
    
    // Highlight ALL pieces that can capture
    document.getElementById('tutorial-dimmer').style.display = 'block';
    
    capturablePieces.forEach(capturable => {
        const square = document.querySelector(`[data-row="${capturable.row}"][data-col="${capturable.col}"]`);
        if (square) {
            square.classList.add('tutorial-allowed');
            const pieceEl = square.querySelector('.piece');
            if (pieceEl) {
                pieceEl.classList.add('tutorial-allowed');
            }
        }
    });
    
    console.log('✅ Forced capture tutorial displayed successfully');
}

function analyzeBoardForTutorial() {
    const lessons = [];
    
    if (!tutorialLessonsShown.basicMove && moveHistory.length === 0) {
        lessons.push({
            type: 'basicMove',
            piece: { row: 5, col: 0 },
            move: { row: 4, col: 1 }
        });
    }
    
    if (!tutorialLessonsShown.capture && !mustCapture) {
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
    
    return lessons;
}

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
            
        default:
            return;
    }
    
    showTutorialMessage(title, text, lesson, false, centerPosition);
    
    if (tutorialForcedPiece && tutorialForcedMove) {
        highlightTutorialMove(tutorialForcedPiece, tutorialForcedMove);
    }
}

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
    }
    
    overlay.style.display = 'block';
}

function highlightTutorialMove(piece, move) {
    document.getElementById('tutorial-dimmer').style.display = 'block';
    
    const pieceSquare = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
    if (pieceSquare) {
        const pieceEl = pieceSquare.querySelector('.piece');
        if (pieceEl) {
            pieceEl.classList.add('tutorial-allowed');
        }
        pieceSquare.classList.add('tutorial-allowed');
    }
    
    const targetSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
    if (targetSquare) {
        targetSquare.classList.add('tutorial-allowed');
    }
}

function clearTutorialHighlights() {
    document.getElementById('tutorial-dimmer').style.display = 'none';
    document.getElementById('tutorial-arrow').style.display = 'none';
    document.getElementById('tutorial-highlight').style.display = 'none';
    
    document.querySelectorAll('.tutorial-allowed').forEach(el => {
        el.classList.remove('tutorial-allowed');
    });
}

function getSquareName(row, col) {
    const letters = 'abcdefgh';
    const colNumber = col + 3;
    return letters[row] + colNumber;
}

// SETTINGS
document.getElementById('settings-btn').onclick = function(event) {
    event.stopPropagation();
    document.getElementById('settings-dropdown').classList.toggle('show');
};

window.addEventListener('click', function(event) {
    if (!event.target.closest('.settings-content')) {
        document.getElementById('settings-dropdown').classList.remove('show');
    }
});

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

document.getElementById('start-voice-btn-top').onclick = startVoiceRecognition;
document.getElementById('start-voice-btn-bottom').onclick = startVoiceRecognition;

// GAME LOGIC
function initializeGame() {
    initializeBoard();
    createBoard();
    checkForForcedMoves();
    updateTurnDisplay();
    initializeVoiceRecognition();
    
    if (tutorialMode) {
        setTimeout(() => checkTutorialState(), 300);
    }
}

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

function getFilteredBoardCoordinate(row, col) {
    const letters = 'abcdefgh';
    const colNumber = col + 3;
    if (colNumber.toString().includes('2')) return null;
    return letters[row] + colNumber;
}

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

// CRITICAL - FORCED MOVE DETECTION WITH IMMEDIATE TUTORIAL TRIGGER
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
    
    console.log('🔍 checkForForcedMoves called');
    console.log('mustCapture:', mustCapture);
    console.log('currentPlayer:', currentPlayer);
    console.log('tutorialMode:', tutorialMode);
    console.log('isAIMoving:', isAIMoving);
    
    // IMMEDIATE FORCED CAPTURE TUTORIAL TRIGGER
    if (tutorialMode && mustCapture && currentPlayer === 1 && !isAIMoving) {
        console.log('🚨 TRIGGERING FORCED CAPTURE TUTORIAL IMMEDIATELY 🚨');
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            showForcedCaptureTutorial();
        }, 50);
    }
}

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
                    
                    // In forced capture, allow any piece that can capture
                    if (tutorialMode && mustCapture && currentPlayer === 1) {
                        const canCapture = capturablePieces.some(p => p.row === row && p.col === col);
                        if (!canCapture && piece.player === currentPlayer) {
                            showError('You must select a piece that can capture!');
                            return;
                        }
                        // Hide tutorial when piece is selected
                        document.getElementById('tutorial-overlay').style.display = 'none';
                        clearTutorialHighlights();
                    }
                    
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

function makeMove(row, col, isAIMove = false) {
    if (gameEnded || !selectedPiece) return;
    
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
        } else {
            playSoundEffect('movePiece');
        }
        
        if (!piece.isKing) {
            if ((piece.player === 1 && row === 0) || (piece.player === 2 && row === 7)) {
                piece.isKing = true;
                speakMessage(`${piece.label} is now a king`);
            }
        }
        
        if (tutorialMode) {
            clearTutorialHighlights();
            tutorialForcedPiece = null;
            tutorialForcedMove = null;
        }
        
        if (madeCapture) {
            const additionalCaptures = getPossibleMoves(row, col).filter(m => m.isJump);
            if (additionalCaptures.length > 0) {
                selectedPiece = { row, col };
                clearHighlights();
                checkForForcedMoves();
                createBoard();
                
                if (isAIMove && gameMode === 'ai' && currentPlayer === 2) {
                    setTimeout(() => {
                        selectPiece(row, col);
                        setTimeout(() => {
                            let bestCapture = additionalCaptures[Math.floor(Math.random() * additionalCaptures.length)];
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
        createBoard();
        
        if (!checkGameEnd()) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            checkForForcedMoves();
            updateTurnDisplay();
            createBoard();
            
            checkGameEnd();
            
            if (!gameEnded && gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            } else if (tutorialMode && currentPlayer === 1) {
                setTimeout(() => checkTutorialState(), 500);
            }
        }
    }
}

// AI and other functions (simplified)
function makeAIMove() {
    if (gameEnded) return;
    
    isAIMoving = true;
    checkForForcedMoves();
    const aiMoves = getAllPossibleMovesForPlayer(2);
    
    let availableMoves = aiMoves;
    if (mustCapture) {
        availableMoves = aiMoves.filter(m => m.isJump);
    }
    
    if (availableMoves.length === 0) {
        isAIMoving = false;
        checkGameEnd();
        return;
    }
    
    const selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
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

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlighted', 'possible-move', 'must-capture');
    });
}

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

function showGameEndOverlay(winner) {
    const overlay = document.getElementById('game-end-overlay');
    const title = document.getElementById('game-end-title');
    const message = document.getElementById('game-end-message');
    
    if (tutorialMode) {
        endTutorial();
    }
    
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
    
    document.getElementById('game-container').style.display = 'none';
    overlay.style.display = 'flex';
}

function restartGame() {
    gameEnded = false;
    currentPlayer = 1;
    selectedPiece = null;
    moveHistory = [];
    mustCapture = false;
    capturablePieces = [];
    isAIMoving = false;
    
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

// Voice Recognition (simplified)
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

    const targetCoords = squareToCoordinates(targetSquare);
    if (!targetCoords) {
        speakMessage(`Invalid square ${targetSquare}`);
        showError(`Invalid square ${targetSquare}`);
        return;
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
