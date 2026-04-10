const DICTIONARY = [
  { q: "Brain of the computer", a: "CPU" },
  { q: "Version control system", a: "GIT" },
  { q: "Network of networks", a: "INTERNET" },
  { q: "Random Access Memory", a: "RAM" },
  { q: "Local Area Network", a: "LAN" },
  { q: "Query language for databases", a: "SQL" },
  { q: "Markup language for the web", a: "HTML" },
  { q: "Universal Serial Bus", a: "USB" },
  { q: "Portable document format", a: "PDF" },
  { q: "Wireless networking protocol", a: "WIFI" }
];

function getRandomLetter() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

export default class WordSearchPlugin {
  static init(difficulty = "easy") {
    let gridSize = 8;
    let wordsToFind = 3;

    if (difficulty === "medium") { gridSize = 10; wordsToFind = 5; }
    if (difficulty === "hard") { gridSize = 12; wordsToFind = 8; }

    const shuffledDict = [...DICTIONARY].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledDict.slice(0, wordsToFind).map(item => ({ ...item, found: false }));
    
    // Build empty board
    const board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(""));

    // Place words
    selectedWords.forEach(wordObj => {
      const word = wordObj.a;
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        // 0 = horizontal right, 1 = vertical down
        const dir = Math.floor(Math.random() * 2);
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);
        
        let canPlace = true;
        
        if (dir === 0) { // Horizontal
          if (c + word.length > gridSize) canPlace = false;
          else {
            for (let i = 0; i < word.length; i++) {
              if (board[r][c+i] !== "" && board[r][c+i] !== word[i]) {
                canPlace = false; break;
              }
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              board[r][c+i] = word[i];
            }
            placed = true;
          }
        } else { // Vertical
          if (r + word.length > gridSize) canPlace = false;
          else {
            for (let i = 0; i < word.length; i++) {
              if (board[r+i][c] !== "" && board[r+i][c] !== word[i]) {
                canPlace = false; break;
              }
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              board[r+i][c] = word[i];
            }
            placed = true;
          }
        }
        attempts++;
      }
    });

    // Fill remaining cells
    for(let r=0; r<gridSize; r++) {
      for(let c=0; c<gridSize; c++) {
        if(board[r][c] === "") board[r][c] = getRandomLetter();
      }
    }

    return {
      size: gridSize,
      board,
      words: selectedWords,
      selectedCells: [],
      foundCells: [],
      moves: 0,
      status: "playing"
    };
  }

  static move(state, { r, c }) {
    if (state.status !== "playing") return state;

    const newState = { ...state, moves: state.moves + 1 };
    
    // Check if cell already selected, if so clear (reset UI)
    const alreadySelected = newState.selectedCells.some(cell => cell.r === r && cell.c === c);
    if (alreadySelected) {
       newState.selectedCells = [];
       return newState;
    }

    newState.selectedCells = [...newState.selectedCells, { r, c }];
    
    // Form the string from selected cells
    const currentString = newState.selectedCells.map(cell => newState.board[cell.r][cell.c]).join('');
    
    // Check if current string matches any unfound word completely
    const matchedIndex = newState.words.findIndex(w => !w.found && w.a === currentString);
    
    if (matchedIndex !== -1) {
      // Word found!
      newState.words[matchedIndex].found = true;
      newState.foundCells = [...newState.foundCells, ...newState.selectedCells];
      newState.selectedCells = [];
      
      // Check Win
      if (newState.words.every(w => w.found)) {
        newState.status = "won";
      }
    } else {
      // Check if current string is a prefix for any un-found word
      const isPrefix = newState.words.some(w => !w.found && w.a.startsWith(currentString));
      if (!isPrefix) {
         // Bad path, just start a new selection with this cell
         newState.selectedCells = [{ r, c }];
      }
    }
    
    return newState;
  }

  static getScore(state, time) {
    if(state.status === "lost") return 0;
    // Score based on grid size and time elapsed
    const base = state.size * 50;
    const timePenalty = time * 2;
    return Math.max(0, base - timePenalty);
  }
}
