figma.showUI(__html__, { width: 260, height: 420 });

const TILE_PROFILES = {
  large: {
    OUTER_PCT: 0.02875,
    INNER_PCT: 0.0875,
    RADIUS_PCT: 0.20
  },
  small: {
    OUTER_PCT: 0.03,
    INNER_PCT: 0.09,
    RADIUS_PCT: 0.20
  }
};

figma.ui.onmessage = (msg) => {
  if (msg.type !== "generate") return;

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
};

function createTile(W, H, profile, tileType) {
  const { OUTER_PCT, INNER_PCT, RADIUS_PCT } = profile;

  const outer = W * OUTER_PCT;
  const inner = W * INNER_PCT;
  const radius = W * RADIUS_PCT;

  const TL = { x: outer, y: outer };
  const TR = { x: W - outer, y: outer };
  const BR = { x: W - outer, y: H - outer };
  const BL = { x: outer, y: H - outer };

  const TL_out = { x: TL.x + radius, y: TL.y - inner };
  const TR_in  = { x: TR.x - radius, y: TR.y - inner };

  const TR_out = { x: TR.x + inner, y: TR.y + radius };
  const BR_in  = { x: BR.x + inner, y: BR.y - radius };

  const BR_out = { x: BR.x - radius, y: BR.y + inner };
  const BL_in  = { x: BL.x + radius, y: BL.y + inner };

  const BL_out = { x: BL.x - inner, y: BL.y - radius };
  const TL_in  = { x: TL.x - inner, y: TL.y + radius };

  const pathData =
    `M ${TL.x} ${TL.y}` +
    ` C ${TL_out.x} ${TL_out.y} ${TR_in.x} ${TR_in.y} ${TR.x} ${TR.y}` +
    ` C ${TR_out.x} ${TR_out.y} ${BR_in.x} ${BR_in.y} ${BR.x} ${BR.y}` +
    ` C ${BR_out.x} ${BR_out.y} ${BL_in.x} ${BL_in.y} ${BL.x} ${BL.y}` +
    ` C ${BL_out.x} ${BL_out.y} ${TL_in.x} ${TL_in.y} ${TL.x} ${TL.y}` +
    ` Z`;

  const frame = figma.createFrame();
  frame.resize(W, H);
  frame.name = `tile_${tileType}_${W}x${H}`;
  frame.fills = [];
  frame.clipsContent = false;

  const mask = figma.createVector();
  mask.vectorPaths = [{ windingRule: "EVENODD", data: pathData }];
  mask.resize(W, H);
  mask.isMask = true;
  mask.name = "mask";
  mask.fills = [{ type: "SOLID", color: { r: 0x35/255, g: 0x67/255, b: 0xF6/255 } }];

  const placeholder = figma.createRectangle();
  placeholder.resize(W, H);
  placeholder.name = "image";
  placeholder.fills = [{ type: "SOLID", color: { r: 0x35/255, g: 0x67/255, b: 0xF6/255 } }];

  frame.appendChild(mask);
  frame.appendChild(placeholder);

  return frame;
}
