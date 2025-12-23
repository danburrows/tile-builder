figma.showUI(__html__, { width: 260, height: 360 });

/* =========================================================
   Large tile – core percentage system (width-driven)
   ========================================================= */

const LARGE_TILE = {
  OUTER_PCT: 0.02875, // 2.875% of width
  INNER_PCT: 0.0875,  // 8.75% of width
  RADIUS_PCT: 0.20    // used as curve span, NOT corner radius
};

/* =========================================================
   Small tile – core percentage system (width-driven)
   ========================================================= */

const SMALL_TILE = {
  OUTER_PCT: 0.03, // 3% of width
  INNER_PCT: 0.09, // 9% of width
  RADIUS_PCT: 0.20
};

/* =========================================================
   UI message routing
   ========================================================= */

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate-large") {
    generateTile(
      msg.width,
      msg.height,
      LARGE_TILE
    );
  }

  if (msg.type === "generate-small") {
    generateTile(
      msg.width,
      msg.height,
      SMALL_TILE
    );
  }
};

/* =========================================================
   Tile generator (OPTION A: DO NOT CHANGE CORE LOGIC)
   ========================================================= */

/**
 * This function must contain your EXISTING,
 * WORKING core.js logic.
 *
 * The only requirement is that it accepts:
 *  - width
 *  - height
 *  - config object with OUTER_PCT, INNER_PCT, RADIUS_PCT
 */

function generateTile(width, height, config) {
  const OUTER = width * config.OUTER_PCT;
  const INNER = width * config.INNER_PCT;
  const RADIUS = width * config.RADIUS_PCT;

  // ======================================================
  // 🔴 PASTE YOUR EXISTING, WORKING CORE LOGIC BELOW 🔴
  // ======================================================
  //
  // This is where your current shape creation code goes.
  // Do NOT rewrite it.
  // Do NOT refactor it.
  // Do NOT convert it to SVG.
  //
  // Example (placeholder only):
  //
  // createTileShape({
  //   width,
  //   height,
  //   OUTER,
  //   INNER,
  //   RADIUS
  // });
  //
  // ======================================================
}
