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
    RADIUS_PCT: 0.2,
    IMAGE_OFFSET_PCT: -0.0875
  },
  small: {
    OUTER_PCT: 0.03,
    INNER_PCT: 0.09,
    RADIUS_PCT: 0.2,
    IMAGE_OFFSET_PCT: -0.09
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

  const frame = createTile(width, height, profile, tileType);
  figma.currentPage.appendChild(frame);

  const viewportCenter = figma.viewport.center;
  frame.x = viewportCenter.x - width / 2;
  frame.y = viewportCenter.y - height / 2;

  figma.currentPage.selection = [frame];
}

function createTile(W, H, profile, tileType) {
  const { OUTER_PCT, INNER_PCT, RADIUS_PCT, IMAGE_OFFSET_PCT } = profile;

  const shortest = Math.min(W, H);

  /* ------------------------------
     Geometry values (clamped)
     ------------------------------ */

  const outer = withMin(W * OUTER_PCT);
  const inner = withMin(W * INNER_PCT);
  const curveSpan = withMin(W * RADIUS_PCT);

  /* ------------------------------
     Path construction
     ------------------------------ */

  const TL = { x: outer, y: outer };
  const TR = { x: W - outer, y: outer };
  const BR = { x: W - outer, y: H - outer };
  const BL = { x: outer, y: H - outer };

  const TL_out = { x: TL.x + curveSpan, y: TL.y - inner };
  const TR_in  = { x: TR.x - curveSpan, y: TR.y - inner };

  const TR_out = { x: TR.x + inner, y: TR.y + curveSpan };
  const BR_in  = { x: BR.x + inner, y: BR.y - curveSpan };

  const BR_out = { x: BR.x - curveSpan, y: BR.y + inner };
  const BL_in  = { x: BL.x + curveSpan, y: BL.y + inner };

  const BL_out = { x: BL.x - inner, y: BL.y - curveSpan };
  const TL_in  = { x: TL.x - inner, y: TL.y + curveSpan };

  const pathData =
    `M ${TL.x} ${TL.y}` +
    ` C ${TL_out.x} ${TL_out.y} ${TR_in.x} ${TR_in.y} ${TR.x} ${TR.y}` +
    ` C ${TR_out.x} ${TR_out.y} ${BR_in.x} ${BR_in.y} ${BR.x} ${BR.y}` +
    ` C ${BR_out.x} ${BR_out.y} ${BL_in.x} ${BL_in.y} ${BL.x} ${BL.y}` +
    ` C ${BL_out.x} ${BL_out.y} ${TL_in.x} ${TL_in.y} ${TL.x} ${TL.y}` +
    ` Z`;

  /* ------------------------------
     Frame
     ------------------------------ */

  const frame = figma.createFrame();
  frame.resize(W, H);
  frame.name = `${W}x${H}`;
  frame.fills = [];
  frame.clipsContent = false;

  /* ------------------------------
     Mask vector
     ------------------------------ */

  const mask = figma.createVector();
  mask.vectorPaths = [
    {
      windingRule: "EVENODD",
      data: pathData
    }
  ];
  mask.resize(W, H);
  mask.isMask = true;
  mask.name = "mask";
  mask.fills = [
    {
      type: "SOLID",
      color: {
        r: 0x35 / 255,
        g: 0x67 / 255,
        b: 0xF6 / 255
      }
    }
  ];

  // corner radius (clamped)
  mask.cornerRadius = withMin(shortest * RADIUS_PCT);

  /* ------------------------------
     Image placeholder
     ------------------------------ */

  const placeholder = figma.createRectangle();
  placeholder.resize(W, H);
  placeholder.name = "image";
  placeholder.fills = [
    {
      type: "SOLID",
      color: {
        r: 0x35 / 255,
        g: 0x67 / 255,
        b: 0xF6 / 255
      }
    }
  ];

  // image bleed offset (clamped, signed)
  const rawOffset = shortest * IMAGE_OFFSET_PCT;
  const imageOffset =
    rawOffset < 0
      ? -withMin(Math.abs(rawOffset))
      : withMin(rawOffset);

  placeholder.x = imageOffset;
  placeholder.y = imageOffset;

  placeholder.constraints = {
    horizontal: "STRETCH",
    vertical: "STRETCH"
  };

  /* ------------------------------
     Assemble
     ------------------------------ */

  frame.appendChild(mask);
  frame.appendChild(placeholder);

  return frame;
}
