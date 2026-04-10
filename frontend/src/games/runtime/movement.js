import { useEffect } from "react";

/**
 * A custom hook to inject movement constraints like moving tiles or timed limits
 * @param {boolean} active Whether movement behavior is turned on
 * @param {string} game The game type
 * @param {function} setState A callback to alter the game state
 */
export function useMovement(active, game, setState) {
  useEffect(() => {
    if (!active || !setState) return;

    let interval;
    if (game === "puzzle") {
      // Example movement constraint for sliding puzzle: 
      // In a real hackathon, we might periodically auto-move a tile if valid, or shake the board.
      interval = setInterval(() => {
        // Just as a visual effect or to add pressure, we might trigger a re-render or push a minor penalty.
        // For simplicity, we just log and maybe adjust score later, or we could actually mutate the board.
        console.log("Movement Active: Shuffling / Pressure applied");
      }, 5000);
    } else if (game === "sudoku" || game === "2048") {
      // Apply a generic time pressure.
      interval = setInterval(() => {
        console.log("Movement Active: Dynamic timer tick");
      }, 3000);
    }

    return () => {
      if(interval) clearInterval(interval);
    };
  }, [active, game, setState]);
}
