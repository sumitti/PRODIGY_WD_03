const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const vsHumanBtn = document.getElementById('vs-human');
const vsAIBtn = document.getElementById('vs-ai');
const difficultySelect = document.getElementById('difficulty');
let audioTurn = new Audio("ting.mp3");
let win = new Audio("win.mp3");

let currentPlayer = 'X';
let gameActive = false;
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameMode = 'human';
let aiDifficulty = 'hard';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.classList.remove('x', 'o');
        cell.textContent = '';
    });
    if (mode === 'ai') {
        difficultySelect.style.display = 'inline-block';
        aiDifficulty = difficultySelect.value;
    } else {
        difficultySelect.style.display = 'none';
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) return;

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    checkWin();

    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        makeAIMove();
    }
}

function checkWin() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        win.play();
        status.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }

    if (!gameState.includes('')) {
        status.textContent = 'Draw!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    audioTurn.play();
    status.textContent = `Player ${currentPlayer}'s turn`;
}

function makeAIMove() {
    const bestMove = getBestMove(gameState, 'O');
    gameState[bestMove] = 'O';
    cells[bestMove].classList.add('o');
    audioTurn.play();
    checkWin();
}

function getBestMove(board, player) {
    if (aiDifficulty === 'easy') {
        return getRandomMove(board);
    } else if (aiDifficulty === 'medium') {
        return Math.random() < 0.5 ? getRandomMove(board) : minimax(board, player).index;
    } else {
        return minimax(board, player).index;
    }
}

function getRandomMove(board) {
    const availableMoves = board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function minimax(board, player) {
    const availableSpots = getEmptyCells(board);

    if (checkWinner(board, 'X')) {
        return { score: -10 };
    } else if (checkWinner(board, 'O')) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        board[availableSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(board, 'X');
            move.score = result.score;
        } else {
            const result = minimax(board, 'O');
            move.score = result.score;
        }

        board[availableSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function getEmptyCells(board) {
    return board.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
}

function checkWinner(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', () => startGame(gameMode));
vsHumanBtn.addEventListener('click', () => startGame('human'));
vsAIBtn.addEventListener('click', () => startGame('ai'));
difficultySelect.addEventListener('change', (e) => {
    aiDifficulty = e.target.value;
    if (gameMode === 'ai') {
        startGame('ai');
    }
});

startGame('human');