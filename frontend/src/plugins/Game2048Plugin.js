const Game2048Plugin = {
    init(config) {
        const size = config?.size || 4;
        let board = Array(size).fill(null).map(() => Array(size).fill(null));
        
        function addRandomTile(b) {
            const emptyCells = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (b[r][c] === null) emptyCells.push({ r, c });
                }
            }
            if (emptyCells.length > 0) {
                const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                b[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        }
        
        addRandomTile(board);
        addRandomTile(board);
        
        return {
            board,
            size,
            score: 0,
            moves: 0,
            status: "playing"
        };
    },
    
    move(state, action) {
        if (state.status !== "playing") return state;
        
        let newBoard = state.board.map(row => [...row]);
        let size = state.size;
        let scoreIncrease = 0;
        let moved = false;

        function slide(row) {
            let arr = row.filter(val => val !== null);
            let result = [];
            for (let i = 0; i < arr.length; i++) {
                if (i < arr.length - 1 && arr[i] === arr[i+1]) {
                    result.push(arr[i] * 2);
                    scoreIncrease += arr[i] * 2;
                    i++;
                } else {
                    result.push(arr[i]);
                }
            }
            while (result.length < size) {
                result.push(null);
            }
            return result;
        }

        if (action === "ArrowLeft") {
            for (let r = 0; r < size; r++) {
                let newRow = slide(newBoard[r]);
                if (newRow.join(",") !== newBoard[r].join(",")) moved = true;
                newBoard[r] = newRow;
            }
        } else if (action === "ArrowRight") {
            for (let r = 0; r < size; r++) {
                let newRow = slide(newBoard[r].slice().reverse()).reverse();
                if (newRow.join(",") !== newBoard[r].join(",")) moved = true;
                newBoard[r] = newRow;
            }
        } else if (action === "ArrowUp") {
            for (let c = 0; c < size; c++) {
                let col = [];
                for (let r = 0; r < size; r++) col.push(newBoard[r][c]);
                let newCol = slide(col);
                for (let r = 0; r < size; r++) {
                    if (newBoard[r][c] !== newCol[r]) moved = true;
                    newBoard[r][c] = newCol[r];
                }
            }
        } else if (action === "ArrowDown") {
            for (let c = 0; c < size; c++) {
                let col = [];
                for (let r = 0; r < size; r++) col.push(newBoard[r][c]);
                let newCol = slide(col.reverse()).reverse();
                for (let r = 0; r < size; r++) {
                    if (newBoard[r][c] !== newCol[r]) moved = true;
                    newBoard[r][c] = newCol[r];
                }
            }
        } else {
            return state; // invalid action or not an arrow key
        }

        if (moved) {
            const emptyCells = [];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (newBoard[r][c] === null) emptyCells.push({ r, c });
                }
            }
            if (emptyCells.length > 0) {
                const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        }

        // Check for 2048 tile win (or just check if it's there)
        let isWin = false;
        let isFull = true;
        let canMove = false;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newBoard[r][c] === 2048) isWin = true;
                if (newBoard[r][c] === null) isFull = false;
                if (c < size - 1 && newBoard[r][c] === newBoard[r][c+1]) canMove = true;
                if (r < size - 1 && newBoard[r][c] === newBoard[r+1][c]) canMove = true;
            }
        }

        let status = "playing";
        if (isWin) status = "won";
        else if (isFull && !canMove) status = "lost";

        const newState = {
            ...state,
            board: newBoard,
            score: state.score + scoreIncrease,
            moves: moved ? state.moves + 1 : state.moves,
            status: status
        };

        if (this.checkWin(newState)) {
            // Already handled above, but adhering to the strictly requested exported checkWin interface
            newState.status = "won";
        }

        return newState;
    },

    checkWin(state) {
        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (state.board[r][c] === 2048) return true;
            }
        }
        return false;
    },

    getScore(state, timeTaken) {
        let maxTile = 0;
        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (state.board[r][c] && state.board[r][c] > maxTile) {
                    maxTile = state.board[r][c];
                }
            }
        }
        return maxTile;
    },

    getHint(state) {
        if (state.status !== "playing") return "Game is not active!";
        const moves = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        let bestMove = null;
        let maxScore = -1;
        let maxEmpty = -1;

        for (const action of moves) {
            // Test the move. this.move does not modify the state object in place.
            const testState = this.move(state, action);
            if (testState.moves > state.moves) { // valid move
                let empty = 0;
                for(let r=0; r<testState.size; r++) {
                    for(let c=0; c<testState.size; c++) {
                        if(testState.board[r][c] === null) empty++;
                    }
                }
                if (empty > maxEmpty || (empty === maxEmpty && testState.score > maxScore)) {
                    maxEmpty = empty;
                    maxScore = testState.score;
                    bestMove = action;
                }
            }
        }
        
        const moveNames = {"ArrowUp": "Up", "ArrowDown": "Down", "ArrowLeft": "Left", "ArrowRight": "Right"};
        return bestMove ? `Try moving ${moveNames[bestMove]}!` : "No good moves!";
    }
};

export default Game2048Plugin;
