figma.showUI(__html__, { width: 260, height: 570 });

/* ======================================================
   Constants
   ====================================================== */

const MIN_PX = 6;

/* ======================================================
   Utilities
   ====================================================== */

function roundInt(v) {
  return Math.round(v);
}

function withMin(v, min = MIN_PX) {
  return Math.max(roundInt(v), min);
}

/* ======================================================
   Tile profiles
   ====================================================== */

const TILE_PROFILES = {
  large: {
    SHRINK_PCT: 0.0275, // 2.75% per side
    OUTER_PCT: 0.03,
    INNER_PCT: 0.0875,
    RADIUS_PCT: 0.3
  },
  small: {
    SHRINK_PCT: 0.03, // 3% per side
    OUTER_PCT: 0.03,
    INNER_PCT: 0.09,
    RADIUS_PCT: 0.3
  }
};

/* ======================================================
   Message router
   ====================================================== */

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate") {
    handleGenerateTile(msg);
  }
};

/* ======================================================
   Tile generation
   ====================================================== */

function handleGenerateTile(msg) {
  const { width, height, tileType, noShrink } = msg;
  const profile = TILE_PROFILES[tileType];

  if (!profile) {
    figma.notify("Unknown tile type");
    return;
  }

  // Outer frame at input size
  const frame = figma.createFrame();
  frame.resize(width, height);
  frame.name = `${width}×${height}`;
  frame.fills = [];
  frame.clipsContent = false;

  const tile = createTile(width, height, profile, noShrink === true);

  tile.x = (width - tile.width) / 2;
  tile.y = (height - tile.height) / 2;

  frame.appendChild(tile);
  figma.currentPage.appendChild(frame);

  const c = figma.viewport.center;
  frame.x = c.x - width / 2;
  frame.y = c.y - height / 2;

  figma.currentPage.selection = [frame];
}

function createTile(inputW, inputH, profile, noShrink) {
  const {
    SHRINK_PCT,
    OUTER_PCT,
    INNER_PCT,
    RADIUS_PCT
  } = profile;

  /* ------------------------------
     Base dimension (authoritative)
     ------------------------------ */

  const S = Math.min(inputW, inputH);

  /* ------------------------------
     Shrink (per side, clamped)
     ------------------------------ */

  const shrink = noShrink
    ? 0
    : withMin(S * SHRINK_PCT);

  const W = inputW - shrink * 2;
  const H = inputH - shrink * 2;

  /* ------------------------------
     Geometry (all based on S)
     ------------------------------ */

  const margin = withMin(S * OUTER_PCT);
  const bulge  = withMin(S * INNER_PCT);
  const handle = roundInt(S * RADIUS_PCT); // not clamped

  /* ------------------------------
     Path construction
     ------------------------------ */

  const TL = { x: margin, y: margin };
  const TR = { x: W - margin, y: margin };
  const BR = { x: W - margin, y: H - margin };
  const BL = { x: margin, y: H - margin };

  const TL_out = { x: TL.x + handle, y: TL.y - bulge };
  const TR_in  = { x: TR.x - handle, y: TR.y - bulge };

  const TR_out = { x: TR.x + bulge, y: TR.y + handle };
  const BR_in  = { x: BR.x + bulge, y: BR.y - handle };

  const BR_out = { x: BR.x - handle, y: BR.y + bulge };
  const BL_in  = { x: BL.x + handle, y: BL.y + bulge };

  const BL_out = { x: BL.x - bulge, y: BL.y - handle };
  const TL_in  = { x: TL.x - bulge, y: TL.y + handle };

  const pathData =
    `M ${TL.x} ${TL.y}` +
    ` C ${TL_out.x} ${TL_out.y} ${TR_in.x} ${TR_in.y} ${TR.x} ${TR.y}` +
    ` C ${TR_out.x} ${TR_out.y} ${BR_in.x} ${BR_in.y} ${BR.x} ${BR.y}` +
    ` C ${BR_out.x} ${BR_out.y} ${BL_in.x} ${BL_in.y} ${BL.x} ${BL.y}` +
    ` C ${BL_out.x} ${BL_out.y} ${TL_in.x} ${TL_in.y} ${TL.x} ${TL.y}` +
    ` Z`;

  /* ------------------------------
     Tile vector
     ------------------------------ */

  const tile = figma.createVector();
  tile.vectorPaths = [
    {
      windingRule: "EVENODD",
      data: pathData
    }
  ];

  tile.resize(W, H);
  tile.name = "Tile";

  tile.fills = [
    {
      type: "SOLID",
      color: {
        r: 0x35 / 255,
        g: 0x67 / 255,
        b: 0xF6 / 255
      }
    }
  ];

  tile.strokes = [];
  tile.strokeWeight = 0;

  // Native corner radius (no clamp)
  tile.cornerRadius = roundInt(S * RADIUS_PCT);

  return tile;
}
