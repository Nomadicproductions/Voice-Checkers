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

// Voice Recognition Variables
let recognition = null;
let isListening = false;
let voiceFeedbackEnabled = false; // Changed to false by default

// Loading Screen
window.addEventListener('load', function() {
    // Simulate asset loading
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('start-overlay').style.display = 'flex';
    }, 2000);
});

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

// Settings Dropdown
document.getElementById('settings-btn').onclick = function(event) {
    event.stopPropagation();
    document.getElementById('settings-dropdown').classList.toggle('show');
};

window.addEventListener('click', function() {
    document.getElementById('settings-dropdown').classList.remove('show');
});

// Settings Controls
document.addEventListener('DOMContentLoaded', function () {
    // Voice feedback checkbox - default OFF
    const voiceCheckbox = document.getElementById('voice-feedback-checkbox');
    voiceCheckbox.checked = false; // Changed to false by default
    voiceCheckbox.addEventListener('change', function () {
        voiceFeedbackEnabled = voiceCheckbox.checked;
    });

    // Game mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    const aiDifficultyContainer = document.getElementById('ai-difficulty-container');
    
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            gameMode = this.value;
            if (gameMode === 'ai') {
                aiDifficultyContainer.style.display = 'block';
                restartGame();
            } else {
                aiDifficultyContainer.style.display = 'none';
                restartGame();
            }
        });
    });

    // AI difficulty select
    document.getElementById('ai-difficulty').addEventListener('change', function() {
        aiDifficulty = this.value;
        if (gameMode === 'ai') {
            restartGame();
        }
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
                    selectPiece(row, col);
                };
                square.appendChild(pieceElement);
            }

            square.onclick = () => makeMove(row, col);
            boardElement.appendChild(square);
        }
    }
}

// Select Piece
function selectPiece(row, col) {
    if (gameEnded) return;
    const piece = gameBoard[row][col];
    if (!piece || piece.player !== currentPlayer) return;
    
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
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const colNumber = newCol + 3;
            if (colNumber.toString().includes('2')) return;
            if (!gameBoard[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol, isJump: false });
            } else if (gameBoard[newRow][newCol].player !== piece.player) {
                const jumpRow = newRow + dRow;
                const jumpCol = newCol + dCol;
                const jumpColNumber = jumpCol + 3;
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 && 
                    !gameBoard[jumpRow][jumpCol] && !jumpColNumber.toString().includes('2')) {
                    moves.push({ row: jumpRow, col: jumpCol, isJump: true, captureRow: newRow, captureCol: newCol });
                }
            }
        }
    });

    return moves;
}

// Make Move
function makeMove(row, col) {
    if (gameEnded || !selectedPiece) return;
    
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
            speakMessage(`${piece.label} captured ${capturedPiece.label}`);
        }
        
        // Check for king promotion
        if (!piece.isKing) {
            if ((piece.player === 1 && row === 0) || (piece.player === 2 && row === 7)) {
                piece.isKing = true;
                speakMessage(`${piece.label} is now a king`);
            }
        }
        
        // Check for additional captures (double jump)
        if (madeCapture) {
            const additionalCaptures = getPossibleMoves(row, col).filter(m => m.isJump);
            if (additionalCaptures.length > 0) {
                selectedPiece = { row, col };
                clearHighlights();
                createBoard();
                selectPiece(row, col);
                updateTurnDisplay();
                return; // Don't switch turns yet
            }
        }
        
        clearHighlights();
        selectedPiece = null;
        createBoard();
        checkGameEnd();
        
        if (!gameEnded) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            checkForForcedMoves();
            updateTurnDisplay();
            createBoard(); // Recreate to show forced captures
            
            // AI Move
            if (gameMode === 'ai' && currentPlayer === 2) {
                setTimeout(() => makeAIMove(), 1000);
            }
        }
    }
}

// AI Implementation
function makeAIMove() {
    if (gameEnded) return;
    
    checkForForcedMoves();
    const aiMoves = getAllPossibleMovesForPlayer(2);
    
    // Filter for forced captures if needed
    let availableMoves = aiMoves;
    if (mustCapture) {
        availableMoves = aiMoves.filter(m => m.isJump);
    }
    
    if (availableMoves.length === 0) {
        checkGameEnd();
        return;
    }
    
    let selectedMove;
    
    if (aiDifficulty === 'easy') {
        // Random move
        selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (aiDifficulty === 'medium') {
        // Prefer captures, then random
        const captures = availableMoves.filter(move => move.isJump);
        selectedMove = captures.length > 0 ? 
            captures[Math.floor(Math.random() * captures.length)] :
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
        // Hard: evaluate board positions
        selectedMove = getBestMove(availableMoves);
    }
    
    if (selectedMove) {
        selectPiece(selectedMove.from.row, selectedMove.from.col);
        setTimeout(() => {
            makeMove(selectedMove.to.row, selectedMove.to.col);
        }, 500);
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
    // Simple evaluation: prefer captures, protect pieces, advance position
    let bestScore = -Infinity;
    let bestMove = moves[0];
    
    moves.forEach(move => {
        let score = 0;
        
        // Capture bonus
        if (move.isJump) score += 10;
        
        // King bonus
        if (move.piece.isKing) score += 2;
        
        // Position bonus (closer to becoming king)
        if (!move.piece.isKing && move.piece.player === 2) {
            score += move.to.row * 0.5;
        }
        
        // Random factor to avoid predictability
        score += Math.random() * 2;
        
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
        gameMode === 'ai' ? "AI's turn (Black)" : "Player 2's turn (Black)";
    
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
    
    if (player1Pieces === 0 || (currentPlayer === 1 && currentPlayerMoves.length === 0)) {
        showGameEndOverlay(2);
        gameEnded = true;
    } else if (player2Pieces === 0 || (currentPlayer === 2 && currentPlayerMoves.length === 0)) {
        showGameEndOverlay(1);
        gameEnded = true;
    }
}

// Show Game End Overlay
function showGameEndOverlay(winner) {
    const overlay = document.getElementById('game-end-overlay');
    const title = document.getElementById('game-end-title');
    const message = document.getElementById('game-end-message');
    
    if (winner === 1) {
        title.textContent = "Player 1 Wins!";
        message.textContent = "Red pieces have conquered the board!";
        speakMessage("Player 1 wins!");
    } else {
        const winnerName = gameMode === 'ai' ? 'AI' : 'Player 2';
        title.textContent = `${winnerName} Wins!`;
        message.textContent = "Black pieces have conquered the board!";
        speakMessage(`${winnerName} wins!`);
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
