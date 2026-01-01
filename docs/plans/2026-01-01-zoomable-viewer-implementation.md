# Zoomable Viewer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add pan/zoom capabilities to the HTML workflow graph viewer using panzoom library.

**Architecture:** Integrate panzoom library via CDN, add zoom control buttons, make container responsive (600px-90vh), wire up mouse gestures and button handlers.

**Tech Stack:** panzoom v9 (CDN), Mermaid.js, TypeScript, Vitest

---

### Task 1: Add test for panzoom script inclusion

**Files:**
- Modify: `src/viewer/template.test.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('includes panzoom library script', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  expect(html).toContain('panzoom');
  expect(html).toContain('cdn.jsdelivr.net/npm/panzoom');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - "panzoom" not found in output

**Step 3: Add panzoom script to template**

In `src/viewer/template.ts`, after the Mermaid script tag (line 16), add:

```typescript
  <script src="https://cdn.jsdelivr.net/npm/panzoom@9/dist/panzoom.min.js"></script>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): add panzoom library script"
```

---

### Task 2: Add test for zoom control buttons

**Files:**
- Modify: `src/viewer/template.test.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('includes zoom control buttons', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  expect(html).toContain('zoomIn()');
  expect(html).toContain('zoomOut()');
  expect(html).toContain('resetView()');
  expect(html).toContain('zoom-controls');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - "zoomIn()" not found

**Step 3: Add zoom controls HTML**

In `src/viewer/template.ts`, inside the `.graph-container` div (after line 55), add:

```html
      <div class="zoom-controls">
        <button class="btn-secondary" onclick="zoomIn()" title="Zoom In">+</button>
        <button class="btn-secondary" onclick="zoomOut()" title="Zoom Out">-</button>
        <button class="btn-secondary" onclick="resetView()" title="Reset View">Reset</button>
      </div>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): add zoom control buttons"
```

---

### Task 3: Add responsive container CSS

**Files:**
- Modify: `src/viewer/template.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('has responsive graph container styling', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  expect(html).toContain('min-height: 600px');
  expect(html).toContain('max-height: 90vh');
  expect(html).toContain('overflow: hidden');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - "min-height: 600px" not found

**Step 3: Update CSS in template**

In `src/viewer/template.ts`, replace the `.graph-container` CSS (around line 27) with:

```css
    .graph-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
    .zoom-controls button {
      width: 36px;
      height: 36px;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): add responsive container CSS"
```

---

### Task 4: Add panzoom JavaScript initialization

**Files:**
- Modify: `src/viewer/template.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('initializes panzoom on the SVG element', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  expect(html).toContain('panzoomInstance');
  expect(html).toContain("panzoom(svg,");
  expect(html).toContain('maxZoom');
  expect(html).toContain('minZoom');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - "panzoomInstance" not found

**Step 3: Add panzoom initialization JavaScript**

In `src/viewer/template.ts`, in the `<script>` section:

1. Add at the top of the script (after line 80):
```javascript
    let panzoomInstance = null;
```

2. Inside the `setTimeout` callback (around line 87), after `nodes = Array.from(...)`:
```javascript
        // Initialize panzoom on the SVG
        const svg = document.querySelector('#diagram svg');
        if (svg) {
          panzoomInstance = panzoom(svg, {
            maxZoom: 5,
            minZoom: 0.25,
            bounds: true,
            boundsPadding: 0.1
          });
        }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): initialize panzoom on SVG"
```

---

### Task 5: Add zoom button handler functions

**Files:**
- Modify: `src/viewer/template.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('has zoom handler functions defined', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  expect(html).toContain('function zoomIn()');
  expect(html).toContain('function zoomOut()');
  expect(html).toContain('function resetView()');
  expect(html).toContain('panzoomInstance.zoomIn');
  expect(html).toContain('panzoomInstance.zoomOut');
  expect(html).toContain('panzoomInstance.reset');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - "function zoomIn()" not found

**Step 3: Add zoom handler functions**

In `src/viewer/template.ts`, add these functions in the script section (before the closing `</script>`):

```javascript
    function zoomIn() {
      if (panzoomInstance) panzoomInstance.zoomIn();
    }

    function zoomOut() {
      if (panzoomInstance) panzoomInstance.zoomOut();
    }

    function resetView() {
      if (panzoomInstance) panzoomInstance.reset();
    }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): add zoom handler functions"
```

---

### Task 6: Integrate reset view with resetSteps

**Files:**
- Modify: `src/viewer/template.ts`

**Step 1: Write the failing test**

Add to `src/viewer/template.test.ts`:

```typescript
it('resetSteps also resets the view', () => {
  const mermaid = 'flowchart LR\nA --> B';
  const html = generateViewerHtml(mermaid);

  // Check that resetSteps calls resetView or panzoomInstance.reset
  expect(html).toMatch(/function resetSteps\(\)[\s\S]*?(resetView\(\)|panzoomInstance\.reset)/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run`
Expected: FAIL - regex doesn't match

**Step 3: Update resetSteps function**

In `src/viewer/template.ts`, find the `resetSteps` function and add at the end (before the closing brace):

```javascript
      resetView();
```

The function should now look like:
```javascript
    function resetSteps() {
      stopAutoPlay();
      currentStep = -1;
      nodes.forEach(n => {
        n.classList.remove('activeStep', 'completedStep', 'selectedStep');
      });
      document.getElementById('details').style.display = 'none';
      resetView();
    }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --run`
Expected: PASS

**Step 5: Commit**

```bash
git add src/viewer/template.ts src/viewer/template.test.ts
git commit -m "feat(viewer): integrate resetView with resetSteps"
```

---

### Task 7: Build, link, and verify in alpha project

**Files:**
- None (verification only)

**Step 1: Run all tests in temporalio-graphs**

Run: `cd /home/mavdi/Documents/work/temporalio-graphs && npm test -- --run`
Expected: All tests pass

**Step 2: Build the library**

Run: `cd /home/mavdi/Documents/work/temporalio-graphs && npm run build`
Expected: Build succeeds with no errors

**Step 3: Regenerate alpha project graphs**

Run: `cd /home/mavdi/Documents/work/alpha && npm run graph`
Expected: All 7 graphs regenerated

**Step 4: Manual verification**

Open: `scripts/graph/output/index.html` in browser

Verify:
- [ ] Zoom buttons (+, -, Reset) visible in top-right of graph area
- [ ] Scroll wheel zooms toward cursor
- [ ] Click-drag pans the graph
- [ ] Zoom buttons work correctly
- [ ] Reset button returns to original view
- [ ] Animation controls (Next Step, Reset, Auto Play) still work
- [ ] Node clicking still shows details
- [ ] Graph container has more vertical space

**Step 5: Commit verification note**

```bash
cd /home/mavdi/Documents/work/temporalio-graphs
git add -A
git commit -m "chore: verify zoomable viewer complete"
```
