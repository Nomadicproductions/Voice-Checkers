const boardElem = document.getElementById('board');
const statusElem = document.getElementById('status');

const files = ['A','B','C','D','E','F','G','H'];
const ranks = [8,7,6,5,4,3,2,1];

let board = [];

function initBoard() {
  board = Array(8).fill(null).map(()=>Array(8).fill(null));
  // Place black pieces
  for(let y=0; y<3; y++)
    for(let x=0; x<8; x++)
      if((x+y)%2===1) board[y][x]='black';
  // Place red pieces
  for(let y=5; y<8; y++)
    for(let x=0; x<8; x++)
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

initBoard();
renderBoard();
statusElem.textContent = "Say a move, e.g. 'move from D2 to E3'. Red starts.";
