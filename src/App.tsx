import React, { useState } from 'react';
import { createSecureContext } from 'tls';
import { deflateSync } from 'zlib';
import './App.css';

const numRows = 35;
const numCols = 80;

const colors = ['white', 'black', 'red', 'green', 'blue', 'yellow'];

type Square = {
  rows: number,
  col: number,
  previous: Square | null,
  count: number,
}

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
}

const App = () => {

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [type, setType] = useState<number>(1);

  const [mouse, setMouse] = useState<boolean>(false);

  const [start, setStart] = useState<Square>({ rows: 0, col: 0, previous: null, count: 0 });

  const [target, setTarget] = useState<Square>({ rows: 0, col: 0, previous: null, count: 0 });

  const onMouseDown = (rows: number, col: number, num: number) => {
    setMouse(true);
    const newGrid = grid.slice();
    newGrid[rows][col] = grid[rows][col] ? 0 : num;
    if (num === 2) {
      setStart({ rows, col, previous: null, count: 0 });
    } else if (num === 3) {
      setTarget({ rows, col, previous: null, count: 0 });
    }
    setGrid(newGrid);
  }

  const onMouseEnter = (rows: number, col: number, num: number) => {
    if (!mouse) return;
    const newGrid = grid.slice();
    newGrid[rows][col] = grid[rows][col] ? 0 : num;
    if (num === 2) {
      setStart({ rows, col, previous: null, count: 0 });
    } else if (num === 3) {
      setTarget({ rows, col, previous: null, count: 0 });
    }
    setGrid(newGrid);
  }

  const onMouseUp = () => {
    setMouse(false);
  }

  const getNeighbors = (grid: number[][], current: Square) => {
    const neighbors = [];
    if (current.rows > 0 && grid[current.rows - 1][current.col] !== 1) {
      neighbors.push({
        rows: current.rows - 1,
        col: current.col,
        previous: current,
        count: current.count + 1,
      });
    }
    if (current.rows < numRows - 1 && grid[current.rows + 1][current.col] !== 1) {
      neighbors.push({
        rows: current.rows + 1,
        col: current.col,
        previous: current,
        count: current.count + 1,
      });
    }
    if (current.col > 0 && grid[current.rows][current.col - 1] !== 1) {
      neighbors.push({
        rows: current.rows,
        col: current.col - 1,
        previous: current,
        count: current.count + 1,
      });
    }
    if (current.col < numCols - 1 && grid[current.rows][current.col + 1] !== 1) {
      neighbors.push({
        rows: current.rows,
        col: current.col + 1,
        previous: current,
        count: current.count + 1,
      });
    }
    return neighbors;
  }

  const dfs = (grid: number[][], start: Square, target: Square) => {
    start.count = 0;
    const visited = new Map();
    const stack: Square[] = [start];
    while (stack.length) {
      let current = stack.pop()!;
      if(current.previous) current.count = current.previous.count + 1;
      if (current.rows === target.rows && current.col === target.col) {
        while (current.count > 0) {
          let minCount = Infinity;
          let temp: null | Square = null;
          getNeighbors(grid, current).forEach(neighbor => {
            if(visited.get(`${neighbor.rows}-${neighbor.col}`) < current.count && visited.get(`${neighbor.rows}-${neighbor.col}`) < minCount){
              minCount = visited.get(`${neighbor.rows}-${neighbor.col}`);
              temp = neighbor;
            }
          })
          console.log(current);
          if(temp) current = temp;
          updateAnimation(current, false);
        }
        return;
      }
      visited.set(`${current.rows}-${current.col}`, current.count);
      const neighbors = getNeighbors(grid, current);
      for (const neighbor of neighbors) {
        if (!visited.has(`${neighbor.rows}-${neighbor.col}`)) {
          updateAnimation(neighbor, true);
          stack.push(neighbor);
        } 
        // else {
        //   if( !current.previous || current.count - 1 > visited.get(`${neighbor.rows}-${neighbor.col}`)){
        //     current.count = visited.get(`${neighbor.rows}-${neighbor.col}`) + 1;
        //     visited.set(`${current.rows}-${current.col}`, current.count);
        //   }
        // }
      }
    }
  }
  

  const bfs = (grid: number[][], start: Square, target: Square) => {
    const visited = new Set();
    visited.add(start.rows + ',' + start.col);
    const queue = [start];
    const distances = grid.map(row => row.map(cell => Infinity));
    distances[start.rows][start.col] = 0;
    while (queue.length) {
      let current = queue.shift()!;
      if (current.rows === target.rows && current.col === target.col) {
        while (current.previous) {
          updateAnimation(current, false);
          current = current.previous;
        }
        return distances[target.rows][target.col];
      }
      const neighbors = getNeighbors(grid, current);
      for (const neighbor of neighbors) {
        if (visited.has(neighbor.rows + ',' + neighbor.col)) continue;
        visited.add(neighbor.rows + ',' + neighbor.col);
        updateAnimation(neighbor, true);
        queue.push(neighbor);
        const distance = distances[current.rows][current.col] + 1;
        if (distance < distances[neighbor.rows][neighbor.col]) {
          distances[neighbor.rows][neighbor.col] = distance;
        }
      }
    }
    return null;
  }

  const updateAnimation = (current: Square, bool: boolean) => {
    if (bool) {
      setTimeout(() => {
        const newGrid = grid.slice();
        if (newGrid[current.rows][current.col] !== 3) {
          newGrid[current.rows][current.col] = 4;
        }
        setGrid(newGrid);
      }, 0.1);
    } else {
      setTimeout(() => {
        const newGrid = grid.slice();
        if (newGrid[current.rows][current.col] !== 3) {
          newGrid[current.rows][current.col] = 5;
        }
        setGrid(newGrid);
      }, 0.1);
    }
  }

  return (
    <>
      <button onClick={() => setGrid(generateEmptyGrid())}>
        Clear
      </button>
      <button onClick={() => setType(1)}>
        Choose Border
      </button>
      <button onClick={() => setType(2)}>
        Choose Start
      </button>
      <button onClick={() => setType(3)}>
        Choose Target
      </button>
      <button onClick={() => bfs(grid, start, target)}>
        BFS
      </button>
      <button onClick={() => dfs(grid, start, target)}>
        DFS
      </button>
      {/* <button onClick={() => aStar(grid, start, target)}>
        A*
      </button> */}
      <div className="App" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 20px)`,
      }}>
        {grid.map((rows, i) =>
          rows.map((col, j) =>
            <div key={`${i}-${j}`}
              onMouseDown={() => {
                onMouseDown(i, j, type);
              }}
              onMouseEnter={() => {
                onMouseEnter(i, j, type);
              }}
              onMouseUp={() => {
                onMouseUp();
              }} style={{
                width: 20,
                height: 20,
                backgroundColor: colors[grid[i][j]],
                border: 'solid 1px black'
              }}></div>))}
      </div>
    </>
  );
}

export default App;
