figma.showUI(__html__, { width: 260, height: 420 });

/* ======================================================
   Utilities
   ====================================================== */

function withMin(value, min = 6) {
  return Math.max(value, min);
}

/* ======================================================
   Tile profiles
   ====================================================== */

const TILE_PROFILES = {
  large: {
    OUTER_PCT: 0.02875,
    INNER_PCT: 0.0875,
    RADIUS_PCT: 0.2
  },
  small: {
    OUTER_PCT: 0.03,
    INNER_PCT: 0.09,
    RADIUS_PCT: 0.2
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
  const { width, height, tileType } = msg;
  const profile = TILE_PROFILES[tileType];

  if (!profile) {
    figma.notify("Unknown tile type");
    return;
  }

  const tile = createTile(width, height, profile);
  figma.currentPage.appendChild(tile);

  const center = figma.viewport.center;
  tile.x = center.x - width / 2;
  tile.y = center.y - height / 2;

  figma.currentPage.selection = [tile];
}

function createTile(W, H, profile) {
  const { OUTER_PCT, INNER_PCT, RADIUS_PCT } = profile;

  const S = Math.min(W, H);

  /* ------------------------------
     Geometry values
     ------------------------------ */

  const margin = withMin(S * OUTER_PCT);
  const bulge = withMin(S * INNER_PCT);
  const handle = withMin(S * RADIUS_PCT);

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
  tile.strokeWeight = 0;
  tile.strokes = [];
  ;
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

  // native Figma corner radius
  tile.cornerRadius = withMin(S * RADIUS_PCT);

  return tile;
}
