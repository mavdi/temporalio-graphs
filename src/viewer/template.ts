// src/viewer/template.ts

/**
 * Generates an interactive HTML viewer for the workflow graph.
 * Based on the original Temporalio.Graphs viewer with Mermaid.js.
 */
export function generateViewerHtml(mermaidDiagram: string, title = 'Workflow Graph'): string {
  const escapedDiagram = escapeHtml(mermaidDiagram);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/panzoom@9/dist/panzoom.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 20px; color: #333; }
    .controls { margin-bottom: 20px; display: flex; gap: 10px; }
    button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    button:hover { opacity: 0.9; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
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
    .mermaid { width: 100%; }
    .details { margin-top: 20px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .details h2 { margin-bottom: 10px; font-size: 16px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { color: #666; font-weight: 500; }

    /* Animation styles */
    .activeStep rect, .activeStep polygon, .activeStep circle { fill: #fbbf24 !important; }
    .activeStep .label { fill: #000 !important; }
    .selectedStep rect, .selectedStep polygon, .selectedStep circle { stroke: #ef4444 !important; stroke-width: 2px !important; }
    .completedStep rect, .completedStep polygon, .completedStep circle { fill: #86efac !important; }

    .diagram-source { margin-top: 20px; }
    .diagram-source textarea { width: 100%; height: 150px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>

    <div class="controls">
      <button class="btn-primary" onclick="nextStep()">Next Step</button>
      <button class="btn-secondary" onclick="resetSteps()">Reset</button>
      <button class="btn-secondary" onclick="autoPlay()">Auto Play</button>
    </div>

    <div class="graph-container">
      <div class="zoom-controls">
        <button class="btn-secondary" onclick="zoomIn()" title="Zoom In">+</button>
        <button class="btn-secondary" onclick="zoomOut()" title="Zoom Out">-</button>
        <button class="btn-secondary" onclick="resetView()" title="Reset View">Reset</button>
      </div>
      <div class="mermaid" id="diagram">
${escapedDiagram}
      </div>
    </div>

    <div class="details" id="details" style="display: none;">
      <h2>Step Details</h2>
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Step Name</td><td id="stepName">-</td></tr>
        <tr><td>Status</td><td id="stepStatus">-</td></tr>
        <tr><td>Execution ID</td><td id="stepExecId">-</td></tr>
        <tr><td>Start Time</td><td id="stepStart">-</td></tr>
        <tr><td>Duration</td><td id="stepDuration">-</td></tr>
      </table>
    </div>

    <div class="diagram-source">
      <h2 style="margin-bottom: 10px; font-size: 14px; color: #666;">Mermaid Source</h2>
      <textarea readonly id="source">${escapedDiagram}</textarea>
    </div>
  </div>

  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'default' });

    let nodes = [];
    let currentStep = -1;
    let autoPlayInterval = null;

    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        nodes = Array.from(document.querySelectorAll('.node'));
        addClickHandlers();
      }, 500);
    });

    function addClickHandlers() {
      nodes.forEach((node, index) => {
        node.style.cursor = 'pointer';
        node.addEventListener('click', () => selectStep(index));
      });
    }

    function nextStep() {
      if (nodes.length === 0) return;

      // Clear previous active
      nodes.forEach(n => n.classList.remove('activeStep'));

      // Mark previous as completed
      if (currentStep >= 0 && currentStep < nodes.length) {
        nodes[currentStep].classList.add('completedStep');
      }

      currentStep = (currentStep + 1) % nodes.length;

      // Reset if we've looped
      if (currentStep === 0) {
        nodes.forEach(n => n.classList.remove('completedStep'));
      }

      nodes[currentStep].classList.add('activeStep');
      showDetails(currentStep);
    }

    function resetSteps() {
      stopAutoPlay();
      currentStep = -1;
      nodes.forEach(n => {
        n.classList.remove('activeStep', 'completedStep', 'selectedStep');
      });
      document.getElementById('details').style.display = 'none';
    }

    function selectStep(index) {
      nodes.forEach(n => n.classList.remove('selectedStep'));
      nodes[index].classList.add('selectedStep');
      showDetails(index);
    }

    function showDetails(index) {
      const node = nodes[index];
      const label = node.querySelector('.nodeLabel')?.textContent || 'Unknown';

      document.getElementById('details').style.display = 'block';
      document.getElementById('stepName').textContent = label;
      document.getElementById('stepStatus').textContent = getStatus(index);
      document.getElementById('stepExecId').textContent = generateUUID();
      document.getElementById('stepStart').textContent = new Date().toISOString();
      document.getElementById('stepDuration').textContent = Math.floor(Math.random() * 1000) + 'ms';
    }

    function getStatus(index) {
      if (index < currentStep) return 'Completed';
      if (index === currentStep) return 'Running';
      return 'Pending';
    }

    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }

    function autoPlay() {
      if (autoPlayInterval) {
        stopAutoPlay();
        return;
      }
      autoPlayInterval = setInterval(nextStep, 1000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
