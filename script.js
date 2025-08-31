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

// ON-SCREEN DEBUG DISPLAY
function showDebugMessage(message) {
    let debugDiv = document.getElementById('debug-display');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-display';
        debugDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: yellow;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            max-width: 300px;
            z-index: 25000;
            font-family: monospace;
        `;
        document.body.appendChild(debugDiv);
    }
    debugDiv.innerHTML = message + '<br>' + (debugDiv.innerHTML || '');
    
    // Keep only last 10 messages
    const lines = debugDiv.innerHTML.split('<br>');
    if (lines.length > 10) {
        debugDiv.innerHTML = lines.slice(0, 10).join('<br>');
    }
}

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
            audio.play().catch(err => showDebugMessage('Audio play failed: ' + err));
        }
    } catch (err) {
        showDebugMessage('Sound effect error: ' + err);
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
        showDebugMessage('Image loading timeout');
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
    showDebugMessage('DOM loaded, starting game...');
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
        showDebugMessage('TUTORIAL MODE ACTIVATED');
        tutorialMode = true;
        tutorialControlMode = 'touch';
        aiDifficulty = 'easy';
        resetTutorialLessons();
        document.getElementById('tutorial-prompt').style.display = 'none';
        startTutorial();
    };
    
    document.getElementById('tutorial-voice-btn').onclick = function() {
        showDebugMessage('TUTORIAL MODE ACTIVATED (Voice)');
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

// TUTORIAL FUNCTIONS
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
    showDebugMessage('Tutorial lessons reset');
}

function startTutorial() {
    showDebugMessage('Starting tutorial...');
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
    showDebugMessage('Advancing tutorial...');
    document.getElementById('tutorial-action-btn').style.display = 'none';
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialCurrentLesson = null;
    
    // IMMEDIATE forced capture check
    setTimeout(() => {
        showDebugMessage('Checking for forced capture after tutorial advance...');
        checkTutorialState();
    }, 100);
}

// CRITICAL TUTORIAL CHECK FUNCTION
function checkTutorialState() {
    showDebugMessage(`Tutorial Check: mode=${tutorialMode}, player=${currentPlayer}, mustCapture=${mustCapture}, isAI=${isAIMoving}`);
    
    if (!tutorialMode || currentPlayer !== 1 || isAIMoving) {
        showDebugMessage('Tutorial check failed - conditions not met');
        return;
    }
    
    // FORCED CAPTURE CHECK - HIGHEST PRIORITY
    if (mustCapture && capturablePieces.length > 0) {
        showDebugMessage('🚨 FORCED CAPTURE DETECTED! Showing tutorial...');
        showForcedCaptureTutorial();
        return;
    } else {
        showDebugMessage('No forced capture needed');
    }
    
    // Other tutorials...
    const possibleLessons = analyzeBoardForTutorial();
    for (const lesson of possibleLessons) {
        if (!tutorialLessonsShown[lesson.type]) {
            showTutorialLesson(lesson);
            break;
        }
    }
}

// FORCED CAPTURE TUTORIAL
function showForcedCaptureTutorial() {
    showDebugMessage('🎯 SHOWING FORCED CAPTURE TUTORIAL NOW');
    
    if (!mustCapture || capturablePieces.length === 0) {
        showDebugMessage('❌ Cannot show forced capture - no captures available');
        return;
    }
    
    // Get piece labels that can capture
    const captureLabels = capturablePieces.map(p => {
        const piece = gameBoard[p.row][p.col];
        return piece ? piece.label : '';
    }).filter(label => label);
    
    showDebugMessage(`Capturable pieces: ${captureLabels.join(', ')}`);
    
    let message;
    if (capturablePieces.length > 1) {
        message = `🚨 MANDATORY CAPTURE! 🚨\n\nYou have ${capturablePieces.length} pieces that MUST capture: ${captureLabels.join(', ')}.\n\nYou cannot make any other move when captures are available!`;
    } else {
        message = `🚨 MANDATORY CAPTURE! 🚨\n\n${captureLabels[0]} MUST capture an opponent's piece.\n\nWhen a capture is available, you cannot make any other move!`;
    }
    
    // Show the tutorial overlay
    const overlay = document.getElementById('tutorial-overlay');
    const box = document.getElementById('tutorial-box');
    const titleEl = document.getElementById('tutorial-title');
    const textEl = document.getElementById('tutorial-text');
    const actionBtn = document.getElementById('tutorial-action-btn');
    
    if (!overlay || !box || !titleEl || !textEl) {
        showDebugMessage('❌ Tutorial elements not found!');
        return;
    }
    
    titleEl.textContent = '⚡ MANDATORY CAPTURE ⚡';
    textEl.textContent = message;
    actionBtn.style.display = 'none';
    
    // Center the box
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    
    overlay.style.display = 'block';
    showDebugMessage('✅ Tutorial overlay displayed');
    
    // Highlight ALL pieces that can capture
    const dimmer = document.getElementById('tutorial-dimmer');
    if (dimmer) {
        dimmer.style.display = 'block';
    }
    
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
    
    showDebugMessage('✅ Pieces highlighted');
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
    
    return lessons;
}

function showTutorialLesson(lesson) {
    tutorialCurrentLesson = lesson;
    tutorialLessonsShown[lesson.type] = true;
    
    let title = 'Basic Movement';
    let text = 'Click on piece L1, then click on square d4 to move it.';
    
    showTutorialMessage(title, text, lesson, false, false);
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
    
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    
    overlay.style.display = 'block';
}

function clearTutorialHighlights() {
    const dimmer = document.getElementById('tutorial-dimmer');
    if (dimmer) {
        dimmer.style.display = 'none';
    }
    
    document.querySelectorAll('.tutorial-allowed').forEach(el => {
        el.classList.remove('tutorial-allowed');
    });
}

// SETTINGS (simplified)
document.getElementById('settings-btn').onclick = function(event) {
    event.stopPropagation();
    document.getElementById('settings-dropdown').classList.toggle('show');
};

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

    document.getElementById('reset-game-btn').addEventListener('click', function(event) {
        event.stopPropagation();
        restartGame();
        document.getElementById('settings-dropdown').classList.remove('show');
    });
});

// GAME LOGIC
function initializeGame() {
    showDebugMessage('Initializing game...');
    initializeBoard();
    createBoard();
    checkForForcedMoves();
    updateTurnDisplay();
    initializeVoiceRecognition();
    
    if (tutorialMode) {
        setTimeout(() => {
            showDebugMessage('Running tutorial check after game init...');
            checkTutorialState();
        }, 300);
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

// CRITICAL FORCED MOVE DETECTION
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
    
    showDebugMessage(`Force check: mustCapture=${mustCapture}, player=${currentPlayer}, tutorial=${tutorialMode}, isAI=${isAIMoving}`);
    
    // IMMEDIATE TUTORIAL TRIGGER
    if (tutorialMode && mustCapture && currentPlayer === 1 && !isAIMoving) {
        showDebugMessage('🚨 TRIGGERING FORCED CAPTURE TUTORIAL 🚨');
        setTimeout(() => {
            showForcedCaptureTutorial();
        }, 100);
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
                    
                    // Hide tutorial when piece is selected
                    if (tutorialMode && mustCapture) {
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
        const piece = gameBoard[selectedPiece.row][selectedPiece.col];
        gameBoard[row][col] = piece;
        gameBoard[selectedPiece.row][selectedPiece.col] = null;
        
        let madeCapture = false;
        if (validMove.isJump) {
            madeCapture = true;
            gameBoard[validMove.captureRow][validMove.captureCol] = null;
            playSoundEffect(gameMode === 'ai' && currentPlayer === 2 ? 'enemyCapture' : 'playerCapture');
        } else {
            playSoundEffect('movePiece');
        }
        
        if (!piece.isKing) {
            if ((piece.player === 1 && row === 0) || (piece.player === 2 && row === 7)) {
                piece.isKing = true;
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
            
            if (!gameEnded && gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            } else if (tutorialMode && currentPlayer === 1) {
                setTimeout(() => checkTutorialState(), 500);
            }
        }
    }
}

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
        gameMode === 'ai' ? `AI's turn (Black)` : "Player 2's turn (Black)";
    
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
    
    if (player1Pieces === 0 || player2Pieces === 0) {
        gameEnded = true;
        return true;
    }
    
    return false;
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
    
    initializeBoard();
    checkForForcedMoves();
    createBoard();
    updateTurnDisplay();
}

// Simplified voice and other functions
function initializeVoiceRecognition() {
    // Simplified for debugging version
}

function startVoiceRecognition() {
    // Simplified for debugging version
}

function showError(message) {
    showDebugMessage('ERROR: ' + message);
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

function speakMessage(message) {
    // Simplified for debugging version
}
