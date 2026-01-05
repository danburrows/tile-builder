// Tile Builder – Frame-based masked tile (final geometry)

figma.showUI(__html__, { width: 260, height: 300 });

figma.ui.onmessage = (msg) => {
  if (msg.type !== "generate") return;

  const W = msg.width;
  const H = msg.height;

  // ===============================
  // Percentage system
  // ===============================

  const OUTER_PCT = 0.02875; // padding relative to input size
  const INNER_PCT = 0.0875;  // edge bulge depth
  const CORNER_RADIUS_PCT = 0.20; // 20% of smallest dimension

  // ===============================
  // Outer inset + inner tile size
  // ===============================

  const outerInset = W * OUTER_PCT;

  const tileW = W - (outerInset * 2);
  const tileH = H - (outerInset * 2);

  // ===============================
  // Geometry values (tile-driven)
  // ===============================

  const inner = tileW * INNER_PCT;

  const smallest = Math.min(tileW, tileH);
  const cornerRadius = smallest * CORNER_RADIUS_PCT;

  // ===============================
  // Anchor points (corner inset)
  // ===============================

  const TL = { x: cornerRadius,             y: cornerRadius };
  const TR = { x: tileW - cornerRadius,     y: cornerRadius };
  const BR = { x: tileW - cornerRadius,     y: tileH - cornerRadius };
  const BL = { x: cornerRadius,             y: tileH - cornerRadius };

  // ===============================
  // Bézier handles (edge curvature)
  // ===============================

  // Top
  const TL_out = { x: TL.x + cornerRadius, y: TL.y - inner };
  const TR_in  = { x: TR.x - cornerRadius, y: TR.y - inner };

  // Right
  const TR_out = { x: TR.x + inner, y: TR.y + cornerRadius };
  const BR_in  = { x: BR.x + inner, y: BR.y - cornerRadius };

  // Bottom
  const BR_out = { x: BR.x - cornerRadius, y: BR.y + inner };
  const BL_in  = { x: BL.x + cornerRadius, y: BL.y + inner };

  // Left
  const BL_out = { x: BL.x - inner, y: BL.y - cornerRadius };
  const TL_in  = { x: TL.x - inner, y: TL.y + cornerRadius };

  // ===============================
  // SVG path (tile-local)
  // ===============================

  const pathData =
    `M ${TL.x} ${TL.y}` +
    ` C ${TL_out.x} ${TL_out.y} ${TR_in.x} ${TR_in.y} ${TR.x} ${TR.y}` +
    ` C ${TR_out.x} ${TR_out.y} ${BR_in.x} ${BR_in.y} ${BR.x} ${BR.y}` +
    ` C ${BR_out.x} ${BR_out.y} ${BL_in.x} ${BL_in.y} ${BL.x} ${BL.y}` +
    ` C ${BL_out.x} ${BL_out.y} ${TL_in.x} ${TL_in.y} ${TL.x} ${TL.y}` +
    ` Z`;

  // ===============================
  // Frame (outer container)
  // ===============================

  const frame = figma.createFrame();
  frame.resize(W, H);
  frame.name = `tile_${W}x${H}`;
  frame.fills = [];
  frame.clipsContent = false;

  // ===============================
  // Mask (inner tile)
  // ===============================

  const mask = figma.createVector();
  mask.vectorPaths = [
    { windingRule: "EVENODD", data: pathData }
  ];

  mask.resize(tileW, tileH);
  mask.x = outerInset;
  mask.y = outerInset;
  mask.isMask = true;
  mask.name = "mask";

  mask.fills = [
    {
      type: "SOLID",
      color: { r: 0x35 / 255, g: 0x67 / 255, b: 0xF6 / 255 }
    }
  ];

  // ===============================
  // Image placeholder (same size, centred)
  // ===============================

  const placeholder = figma.createRectangle();
  placeholder.resize(tileW, tileH);
  placeholder.x = outerInset;
  placeholder.y = outerInset;
  placeholder.name = "image";
  placeholder.fills = [
    {
      type: "SOLID",
      color: { r: 0x35 / 255, g: 0x67 / 255, b: 0xF6 / 255 }
    }
  ];

  // ===============================
  // Assemble
  // ===============================

  frame.appendChild(mask);       // mask must be first
  frame.appendChild(placeholder);
  figma.currentPage.appendChild(frame);

  // ===============================
  // Centre in viewport
  // ===============================

  const viewportCenter = figma.viewport.center;
  frame.x = viewportCenter.x - W / 2;
  frame.y = viewportCenter.y - H / 2;

  figma.currentPage.selection = [frame];
};
