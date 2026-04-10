const PuzzlePlugin = {

  init(config) {
    const size = config?.size || 3;
    const totalTiles = size * size;
    const tiles = Array(totalTiles).fill(0).map((_, i) => i === totalTiles - 1 ? null : i + 1);
    
    // Simple shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    return {
      tiles,
      size,
      moves: 0,
      status: "playing"
    }
  },

  move(state, index){
    if (state.status !== "playing") return state;
    
    const size = state.size;
    const empty = state.tiles.indexOf(null);

    const row = Math.floor(index / size);
    const col = index % size;

    const emptyRow = Math.floor(empty / size);
    const emptyCol = empty % size;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if(!isAdjacent) return state;

    const newTiles = [...state.tiles];
    newTiles[empty] = newTiles[index];
    newTiles[index] = null;

    const newState = {
      ...state,
      tiles: newTiles,
      moves: state.moves + 1
    };

    if (this.checkWin(newState)) {
        newState.status = "won";
    }

    return newState;
  },

  checkWin(state) {
    for (let i = 0; i < state.tiles.length - 1; i++) {
        if (state.tiles[i] !== i + 1) return false;
    }
    return state.tiles[state.tiles.length - 1] === null;
  },

  getScore(state, timeTaken) {
    return Math.max(0, 1000 - state.moves);
  },

  getHint(state) {
    if (state.status !== "playing") return "Game is not active!";
    
    const size = state.size;
    const total = size * size;
    const target = Array(total).fill(0).map((_, i) => i === total - 1 ? null : i + 1).join(",");
    const getManhattan = (tiles) => {
        let dist = 0;
        for(let i=0; i<total; i++) {
            if (tiles[i] === null) continue;
            const targetIdx = tiles[i] - 1;
            const targetR = Math.floor(targetIdx / size);
            const targetC = targetIdx % size;
            const r = Math.floor(i / size);
            const c = i % size;
            dist += Math.abs(r - targetR) + Math.abs(c - targetC);
        }
        return dist;
    };

    let openList = [{ tiles: state.tiles, empty: state.tiles.indexOf(null), path: [], g: 0, h: getManhattan(state.tiles) }];
    const closed = new Set();
    closed.add(state.tiles.join(","));
    let bestNode = openList[0];
    let iterations = 0;
    
    while (openList.length > 0 && iterations < 3000) {
        iterations++;
        let minIndex = 0;
        for(let i=1; i<openList.length; i++) {
            const f1 = openList[i].g * 0.1 + openList[i].h;
            const f2 = openList[minIndex].g * 0.1 + openList[minIndex].h;
            if (f1 < f2) minIndex = i;
        }
        const current = openList[minIndex];
        openList.splice(minIndex, 1);
        
        const stateStr = current.tiles.join(",");
        if (current.h < bestNode.h) bestNode = current;

        if (stateStr === target) {
            bestNode = current;
            break;
        }
        
        const r = Math.floor(current.empty / size);
        const c = current.empty % size;
        const neighbors = [];
        if (r > 0) neighbors.push(current.empty - size);
        if (r < size - 1) neighbors.push(current.empty + size);
        if (c > 0) neighbors.push(current.empty - 1);
        if (c < size - 1) neighbors.push(current.empty + 1);
        
        for (const n of neighbors) {
            const newTiles = [...current.tiles];
            newTiles[current.empty] = newTiles[n];
            newTiles[n] = null;
            const newStr = newTiles.join(",");
            if (!closed.has(newStr)) {
                closed.add(newStr);
                openList.push({
                    tiles: newTiles,
                    empty: n,
                    path: [...current.path, n],
                    g: current.g + 1,
                    h: getManhattan(newTiles)
                });
            }
        }
    }

    if (bestNode && bestNode.path.length > 0) {
        const nextMoveIndex = bestNode.path[0];
        return `Move the tile at row ${Math.floor(nextMoveIndex/size)+1}, col ${nextMoveIndex%size + 1} (value ${state.tiles[nextMoveIndex]}).`;
    }

    const empty = state.tiles.indexOf(null);
    const r = Math.floor(empty / size);
    const c = empty % size;
    const neighbors = [];
    if (r > 0) neighbors.push(empty - size);
    if (r < size - 1) neighbors.push(empty + size);
    if (c > 0) neighbors.push(empty - 1);
    if (c < size - 1) neighbors.push(empty + 1);
    const moveIdx = neighbors[0];
    return `Try moving the tile at row ${Math.floor(moveIdx/size)+1}, col ${moveIdx%size + 1}.`;
  }
}

export default PuzzlePlugin