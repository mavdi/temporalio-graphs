# Zoomable Viewer Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add pan/zoom capabilities to the HTML workflow graph viewer for easier exploration of complex graphs.

**Architecture:** Use panzoom library (CDN) to enable mouse-driven zoom/pan on the Mermaid SVG, with button controls for accessibility. Responsive container sizing (min 600px, max 90vh).

**Tech Stack:** panzoom v9 via CDN, existing Mermaid.js setup

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Interaction model | Both mouse gestures + buttons | Power users get gestures, buttons for discoverability |
| Container sizing | Responsive (min 600px, max 90vh) | Works on large monitors and smaller screens |
| Zoom behavior | Zoom to cursor | Most intuitive for exploration |
| Existing features | Keep animation controls | User wants step-through capability alongside zoom |
| Implementation | panzoom library | Battle-tested, 4KB, zoom-to-cursor built-in |

## Layout

```
+----------------------------------------------------------+
|  Title                               [Zoom+] [Zoom-] [Reset]
+----------------------------------------------------------+
|                                                          |
|                    Graph Area                            |
|              (min-height: 600px, max-height: 90vh)       |
|              (overflow: hidden, panzoom enabled)         |
|                                                          |
+----------------------------------------------------------+
|  [Next Step] [Reset] [Auto Play]                         |
+----------------------------------------------------------+
|  Step Details (existing)                                 |
+----------------------------------------------------------+
|  Mermaid Source (existing)                               |
+----------------------------------------------------------+
```

## Implementation Details

### CSS Changes

```css
.graph-container {
  min-height: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}
.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 5px;
}
```

### HTML Changes

- Add panzoom CDN: `https://cdn.jsdelivr.net/npm/panzoom@9/dist/panzoom.min.js`
- Add zoom control buttons inside `.graph-container`
- Animation controls remain below graph

### JavaScript Changes

```javascript
let panzoomInstance = null;

// After Mermaid renders
const svg = document.querySelector('#diagram svg');
panzoomInstance = panzoom(svg, {
  maxZoom: 5,
  minZoom: 0.25,
  bounds: true,
  boundsPadding: 0.1
});

// Button handlers
function zoomIn() { panzoomInstance.zoomIn(); }
function zoomOut() { panzoomInstance.zoomOut(); }
function resetView() { panzoomInstance.reset(); }

// Modify resetSteps to also reset view
function resetSteps() {
  // ... existing logic ...
  if (panzoomInstance) panzoomInstance.reset();
}
```

## Files to Modify

- `src/viewer/template.ts` - HTML template with new controls and panzoom integration
- `src/viewer/template.test.ts` - Verify new elements exist in output

## Verification

1. Run tests: `npm test`
2. Rebuild: `npm run build`
3. Re-link in alpha project
4. Run `npm run graph` in alpha
5. Open graphs in browser, verify:
   - Scroll wheel zooms toward cursor
   - Click-drag pans the view
   - Zoom +/- buttons work
   - Reset button returns to original view
   - Animation controls still work
   - Node clicking still shows details
