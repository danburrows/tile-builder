// Tile Builder – Masked Image Tile

figma.showUI(__html__, { width: 260, height: 160 });

figma.ui.onmessage = (msg) => {
  if (msg.type !== "generate") return;

  const W = msg.width;
  const H = msg.height;

  // ===== Percentage system (locked) =====
  const OUTER_PCT = 0.02875; // 2.875%
  const INNER_PCT = 0.0875;  // 8.75%
  const RADIUS_PCT = 0.20;   // 20%

  // ===== Derived values (width-driven) =====
  const outer = W * OUTER_PCT;
  const inner = W * INNER_PCT;
  const radius = W * RADIUS_PCT;

  // ===== Anchors =====
  const TL = { x: outer,     y: outer };
  const TR = { x: W - outer, y: outer };
  const BR = { x: W - outer, y: H - outer };
  const BL = { x: outer,     y: H - outer };

  // ===== Handles =====
  // Top edge
  const TL_out = { x: TL.x + radius, y: TL.y - inner };
  const TR_in  = { x: TR.x - radius, y: TR.y - inner };

  // Right edge
  const TR_out = { x: TR.x + inner, y: TR.y + radius };
  const BR_in  = { x: BR.x + inner, y: BR.y - radius };

  // Bottom edge
  const BR_out = { x: BR.x - radius, y: BR.y + inner };
  const BL_in  = { x: BL.x + radius, y: BL.y + inner };

  // Left edge
  const BL_out = { x: BL.x - inner, y: BL.y - radius };
  const TL_in  = { x: TL.x - inner, y: TL.y + radius };

  // ===== SVG path =====
  const pathData =
    `M ${TL.x} ${TL.y}` +
    ` C ${TL_out.x} ${TL_out.y} ${TR_in.x} ${TR_in.y} ${TR.x} ${TR.y}` +
    ` C ${TR_out.x} ${TR_out.y} ${BR_in.x} ${BR_in.y} ${BR.x} ${BR.y}` +
    ` C ${BR_out.x} ${BR_out.y} ${BL_in.x} ${BL_in.y} ${BL.x} ${BL.y}` +
    ` C ${BL_out.x} ${BL_out.y} ${TL_in.x} ${TL_in.y} ${TL.x} ${TL.y}` +
    ` Z`;

  // ===== Create mask vector =====
  const mask = figma.createVector();
  mask.vectorPaths = [
    {
      windingRule: "EVENODD",
      data: pathData
    }
  ];

  mask.resize(W, H);
  mask.isMask = true;
  mask.name = "Image Tile / Mask";

  // Optional fill so the mask is visible when empty
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

  // ===== Create placeholder layer =====
  const placeholder = figma.createRectangle();
  placeholder.resize(W, H);
  placeholder.fills = [];
  placeholder.name = "Drop image here";

  // ===== Group (mask MUST be first) =====
  const group = figma.group([mask, placeholder], figma.currentPage);
  group.name = `Image Tile ${W}×${H}`;

  // ===== Centre group in viewport =====
  const viewportCenter = figma.viewport.center;
  group.x = viewportCenter.x - W / 2;
  group.y = viewportCenter.y - H / 2;

  // ===== Select group =====
  figma.currentPage.selection = [group];
};
