const SudokuPlugin = {
    init(config) {
        const missing = config?.missing || 40;
        
        // MVP hardcoded solution block
        const solution = [
            [5,3,4,6,7,8,9,1,2],
            [6,7,2,1,9,5,3,4,8],
            [1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3],
            [4,2,6,8,5,3,7,9,1],
            [7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4],
            [2,8,7,4,1,9,6,3,5],
            [3,4,5,2,8,6,1,7,9]
        ];

        let board = solution.map(row => [...row]);
        let initial = Array(9).fill(null).map(() => Array(9).fill(false));
        
        let cellsToRemove = missing;
        while(cellsToRemove > 0) {
            let r = Math.floor(Math.random() * 9);
            let c = Math.floor(Math.random() * 9);
            if (board[r][c] !== null) {
                board[r][c] = null;
                cellsToRemove--;
            }
        }

        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                if(board[r][c] !== null) initial[r][c] = true;
            }
        }

        return {
            solution,
            board,
            initial,
            size: 9,
            moves: 0,
            status: "playing"
        };
    },
    
    move(state, action) {
        if (state.status !== "playing") return state;
        
        // action: { r, c, val }
        const { r, c, val } = action;
        if (state.initial[r][c]) return state;

        let newBoard = state.board.map(row => [...row]);
        newBoard[r][c] = val;

        const newState = {
            ...state,
            board: newBoard,
            moves: state.moves + 1
        };

        if (this.checkWin(newState)) {
            newState.status = "won";
        }

        return newState;
    },

    checkWin(state) {
        for(let i=0; i<9; i++) {
            for(let j=0; j<9; j++) {
                if (state.board[i][j] !== state.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    },

    getScore(state, timeTaken) {
        return timeTaken;
    },

    getHint(state) {
        if (state.status !== "playing") return "Game is not active!";
        const emptyCells = [];
        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                if(state.board[r][c] === null || state.board[r][c] !== state.solution[r][c]) {
                    // Include cells that are empty OR incorrect, unless they are initial cells (which are never incorrect)
                    if (!state.initial[r][c]) {
                        emptyCells.push({r, c});
                    }
                }
            }
        }
        if (emptyCells.length === 0) return "Board is full and correct!";
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctVal = state.solution[randomCell.r][randomCell.c];
        return `Row ${randomCell.r + 1}, column ${randomCell.c + 1} should be ${correctVal}.`;
    }
}

export default SudokuPlugin;
