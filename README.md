# Tile Builder (Figma Plugin)

A private Figma plugin for generating expressive “tile” shapes with consistent margins, bulges, and rounded corners.

This tool formalises a manual shape-building process into a repeatable system, while preserving the visual character of the original reference tiles.

---

## What this plugin does

- Generates a custom vector “tile” shape
- Wraps the tile in a frame set to the user’s input size
- Optionally applies margins by shrinking the tile inside the frame
- Maintains consistent geometry rules across all sizes
- Applies native Figma corner radius (not baked into vectors)

The result is a predictable, design-faithful tile that matches a known reference shape.

---

## Core concepts

### 1. Input size is authoritative

The user inputs a width and height.  
A frame is always created at **exactly this size** and named accordingly:

300x250


This frame represents the final, intended footprint.

---

### 2. Margins (default behaviour)

By default, the tile is **reduced inside the frame**, creating visible margins.

- Margins are applied by shrinking the tile size
- The tile is centred within the frame
- This makes margins real and measurable, not perceptual

### Generate without margins

When enabled, the tile is generated at the full input size and touches the frame edges.

---

### 3. Percentage-based geometry

All geometry is calculated from the **smallest input dimension**, not the shrunken size.

This includes:
- outer margin
- bulge depth
- corner radius

This mirrors the original manual construction process and keeps the visual language consistent.

---

## Geometry rules

### Tile variants

The plugin supports two variants:

#### Large tile
- Shrink per side: **2.75%**
- Outer margin: **3%**
- Bulge depth: **8.75%**
- Corner radius: **30%**

#### Small tile
- Shrink per side: **3%**
- Outer margin: **3%**
- Bulge depth: **9%**
- Corner radius: **30%**

All percentages are based on the **smallest input dimension**.

---

### Minimum values (important)

To prevent collapse at small sizes, the following values are clamped:

- Shrink per side: **minimum 6px**
- Outer margin: **minimum 6px**
- Bulge depth: **minimum 6px**

Corner radius is **not clamped** and remains purely percentage-based.

A note in the UI makes this behaviour explicit.

---

## Corner radius

Rounded corners are applied using **Figma’s native corner radius**, not vector math.

Corner radius = smallest input dimension × radius percentage


Example:
- Input: `1000 × 800`
- Radius (30%): `300px`

This keeps the tile editable and consistent with Figma’s design controls.

---

## What this plugin is not

- It is not a layout tool
- It is not a responsive system
- It is not intended for public distribution (yet)

This is a **private internal design utility**, built to codify a specific visual rule set.

---

## File structure

/tile-builder
├── manifest.json
├── code.js
├── ui.html
└── README.md


---

## Usage

1. Import the plugin via  
   **Plugins → Development → Import plugin from manifest**
2. Enter dimensions for a large or small tile
3. Choose whether to generate with or without margins
4. Run the generator

The tile and frame are placed at the centre of the current viewport.

---

## Status

This is considered a **stable v1**.

Geometry rules, minimums, and behaviours are as close as currently possible in Figma, and locked unless a real use case proves otherwise.

