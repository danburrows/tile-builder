figma.showUI(__html__, { width: 260, height: 420 });

const TILE_PROFILES = {
  large: {
    INNER_PCT: 0.0875,
    OUTER_PCT: 0.02875
  },
  small: {
    INNER_PCT: 0.09,
    OUTER_PCT: 0.03
  }
};

figma.ui.onmessage = (msg) => {
  if (msg.type !== "generate") return;
  createSmileTile(msg.width, msg.height, msg.tileType);
};

function createSmileTile(W, H, tileType) {
  const profile = TILE_PROFILES[tileType] || TILE_PROFILES.large;
  const S = Math.min(W, H);

  const INNER = Math.max(profile.INNER_PCT * S, 6);
  const OUTER = Math.max(profile.OUTER_PCT * S, 6);
  const BULGE = INNER - OUTER;

  const x0 = INNER;
  const y0 = INNER;
  const x1 = W - INNER;
  const y1 = H - INNER;

  const cx = W / 2;
  const cy = H / 2;

  const path = buildBulgePath(x0, y0, x1, y1, cx, cy, BULGE);

  const frame = figma.createFrame();
  frame.resize(W, H);
  frame.name = `tile_${W}x${H}`;
  frame.clipsContent = false;
  figma.currentPage.appendChild(frame);

  const mask = figma.createVector();
  mask.vectorPaths = [
    { windingRule: "NONZERO", data: path }
  ];
  mask.isMask = true;
  mask.name = "mask";

  const placeholder = figma.createRectangle();
  placeholder.resize(W, H);
  placeholder.name = "image";
  placeholder.fills = [{
    type: "SOLID",
    color: { r: 0x35 / 255, g: 0x67 / 255, b: 0xF6 / 255 }
  }];

  frame.appendChild(mask);
  frame.appendChild(placeholder);

  figma.currentPage.selection = [frame];
}

function buildBulgePath(x0, y0, x1, y1, cx, cy, b) {
  return (
    "M " + x0 + " " + y0 +
    " C " + (cx - b) + " " + (y0 - b) +
    " " + (cx + b) + " " + (y0 - b) +
    " " + x1 + " " + y0 +
    " C " + (x1 + b) + " " + (cy - b) +
    " " + (x1 + b) + " " + (cy + b) +
    " " + x1 + " " + y1 +
    " C " + (cx + b) + " " + (y1 + b) +
    " " + (cx - b) + " " + (y1 + b) +
    " " + x0 + " " + y1 +
    " C " + (x0 - b) + " " + (cy + b) +
    " " + (x0 - b) + " " + (cy - b) +
    " " + x0 + " " + y0 +
    " Z"
  );
}
