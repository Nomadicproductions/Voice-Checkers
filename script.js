// --- Board setup ---
const boardElem = document.getElementById('board');
const statusElem = document.getElementById('status');
const startVoiceBtn = document.getElementById('start-voice');

const files = ['A','B','C','D','E','F','G','H'];
const ranks = [8,7,6,5,4,3,2,1];

let board = [];
let turn = 'red';

function initBoard() {
  board = Array(8).fill(null).map(()=>Array(8).fill(null));
  for(let y=0;y<3;y++)
    for(let x=0;x<8;x++)
      if((x+y)%2===1) board[y][x]='black';
  for(let y=5;y<8;y++)
    for(let x=0;x<8;x++)
      if((x+y)%2===1) board[y][x]='red';
}

function renderBoard() {
  boardElem.innerHTML = '';
  for(let y=0; y<8; y++) {
    for(let x=0; x<8; x++) {
      const sq = document.createElement('div');
      sq.className = 'square ' + ((x+y)%2 ? 'dark':'light');
      sq.dataset.x = x;
      sq.dataset.y = y;
      if(board[y][x]) {
        const pc = document.createElement('div');
        pc.className = 'piece ' + board[y][x];
        sq.appendChild(pc);
      }
      boardElem.appendChild(sq);
    }
  }
}

function coordsToIndex(coord) {
  // e.g. D2 => [6,3]
  if(!coord || coord.length<2) return null;
  let file = coord[0].toUpperCase();
  let rank = +coord[1];
  let x = files.indexOf(file);
  let y = ranks.indexOf(rank);
  if(x<0||y<0) return null;
  return [y,x];
}

function isValidMove(from, to) {
  // Basic: move forward diagonally 1 square, no jumps for now
  if(!from||!to) return false;
  const [fy,fx]=from, [ty,tx]=to;
  if(!board[fy][fx] || board[ty][tx]) return false;
  let dir = (board[fy][fx]==='red') ? -1 : 1;
  if(Math.abs(fx-tx)!==1) return false;
  if((ty-fy)!==dir) return false;
  return true;
}

function movePiece(from, to) {
  const [fy,fx]=from, [ty,tx]=to;
  board[ty][tx]=board[fy][fx];
  board[fy][fx]=null;
}

function switchTurn() {
  turn = (turn==='red')?'black':'red';
}

function speak(text) {
  if('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}

function handleVoiceCommand(cmd) {
  // Example: "move from D2 to E3"
  cmd = cmd.toLowerCase();
  const match = cmd.match(/move\s+from\s+([a-h][1-8])\s+to\s+([a-h][1-8])/);
  if(!match) {
    statusElem.textContent = "Could not parse command. Try: 'move from D2 to E3'";
    speak(statusElem.textContent);
    return;
  }
  let fromIdx = coordsToIndex(match[1]);
  let toIdx = coordsToIndex(match[2]);
  if(!fromIdx || !toIdx) {
    statusElem.textContent = "Invalid coordinates.";
    speak(statusElem.textContent);
    return;
  }
  let [fy,fx]=fromIdx;
  if(board[fy][fx]!==turn) {
    statusElem.textContent = `It's ${turn}'s turn.`;
    speak(statusElem.textContent);
    return;
  }
  if(isValidMove(fromIdx, toIdx)) {
    movePiece(fromIdx, toIdx);
    renderBoard();
    switchTurn();
    statusElem.textContent = `Moved. ${turn}'s turn.`;
    speak(statusElem.textContent);
  } else {
    statusElem.textContent = "Invalid move.";
    speak(statusElem.textContent);
  }
}

function startListening() {
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    statusElem.textContent = "Voice recognition not supported in this browser.";
    return;
  }
  let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  statusElem.textContent = "Listening...";
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    statusElem.textContent = `Heard: "${transcript}"`;
    handleVoiceCommand(transcript);
  };
  recognition.onerror = function(event) {
    statusElem.textContent = 'Voice recognition error: ' + event.error;
    speak(statusElem.textContent);
  };
}

startVoiceBtn.addEventListener('click', startListening);

// Initialize game
initBoard();
renderBoard();
statusElem.textContent = "Say a move, e.g. 'move from D2 to E3'. Red starts.";
