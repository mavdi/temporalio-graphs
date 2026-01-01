// src/viewer/template.ts

/**
 * Generates an interactive HTML viewer for the workflow graph.
 * Based on the original Temporalio.Graphs viewer with Mermaid.js.
 */
export function generateViewerHtml(mermaidDiagram: string, title = 'Workflow Graph'): string {
  const escapedDiagram = escapeHtml(mermaidDiagram);
  const workflowName = title.toLowerCase().replace(/\s+/g, '-');

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
    body {
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
      background: #0d0d0d;
      color: #a0a0a0;
      height: 100vh;
      overflow: hidden;
    }
    .graph-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    .title {
      position: absolute;
      top: 16px;
      left: 16px;
      font-size: 12px;
      color: #555;
      z-index: 10;
      pointer-events: none;
    }
    .mermaid {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mermaid svg {
      max-width: none !important;
      max-height: none !important;
    }

    /* Floating toolbar */
    .toolbar {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 100;
      display: flex;
      gap: 1px;
      background: #1a1a1a;
      border: 1px solid #333;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .graph-container:hover .toolbar {
      opacity: 1;
    }
    .toolbar-group {
      display: flex;
      gap: 1px;
    }
    .toolbar-divider {
      width: 1px;
      background: #333;
      margin: 4px 0;
    }
    .toolbar button {
      width: 32px;
      height: 32px;
      background: #1a1a1a;
      border: none;
      color: #888;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      font-size: 14px;
      transition: background 0.1s, color 0.1s;
    }
    .toolbar button:hover {
      background: #2a2a2a;
      color: #fff;
    }
    .toolbar button.active {
      background: #333;
      color: #4ade80;
    }
    .toolbar button svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }

    /* Tooltip for step details */
    .tooltip {
      position: absolute;
      background: #1a1a1a;
      border: 1px solid #333;
      padding: 8px 12px;
      font-size: 11px;
      color: #a0a0a0;
      z-index: 200;
      pointer-events: none;
      display: none;
      max-width: 280px;
    }
    .tooltip.visible {
      display: block;
    }
    .tooltip-row {
      display: flex;
      gap: 8px;
      line-height: 1.6;
    }
    .tooltip-label {
      color: #666;
    }
    .tooltip-value {
      color: #4ade80;
    }

    /* Animation styles - dark theme */
    .activeStep rect, .activeStep polygon, .activeStep circle { fill: #ca8a04 !important; }
    .activeStep .label, .activeStep .nodeLabel { fill: #000 !important; }
    .selectedStep rect, .selectedStep polygon, .selectedStep circle { stroke: #4ade80 !important; stroke-width: 2px !important; }
    .completedStep rect, .completedStep polygon, .completedStep circle { fill: #166534 !important; }
    .completedStep .label, .completedStep .nodeLabel { fill: #fff !important; }

    /* Copy notification */
    .copy-notification {
      position: fixed;
      bottom: 70px;
      right: 20px;
      background: #1a1a1a;
      border: 1px solid #4ade80;
      color: #4ade80;
      padding: 8px 16px;
      font-size: 11px;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 300;
    }
    .copy-notification.visible {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="graph-container">
    <div class="title">workflow: ${workflowName}</div>

    <div class="mermaid" id="diagram">
${escapedDiagram}
    </div>

    <div class="toolbar">
      <div class="toolbar-group">
        <button onclick="prevStep()" title="Previous step">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button onclick="nextStep()" title="Next step">
          <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button onclick="autoPlay()" id="playBtn" title="Auto play">
          <svg viewBox="0 0 24 24" id="playIcon"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
        <button onclick="resetSteps()" title="Reset">
          <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button onclick="zoomIn()" title="Zoom in">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
        </button>
        <button onclick="zoomOut()" title="Zoom out">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>
        </button>
        <button onclick="resetView()" title="Fit to view">
          <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button onclick="copySource()" title="Copy source">
          <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>
        </button>
      </div>
    </div>

    <div class="tooltip" id="tooltip"></div>
    <div class="copy-notification" id="copyNotification">copied to clipboard</div>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#2a2a2a',
        primaryTextColor: '#e0e0e0',
        primaryBorderColor: '#444',
        lineColor: '#666',
        secondaryColor: '#1a1a1a',
        tertiaryColor: '#0d0d0d',
        background: '#0d0d0d',
        mainBkg: '#2a2a2a',
        nodeBorder: '#444',
        clusterBkg: '#1a1a1a',
        clusterBorder: '#333',
        titleColor: '#e0e0e0',
        edgeLabelBackground: '#1a1a1a'
      }
    });

    const diagramSource = \`${escapedDiagram.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`;
    let panzoomInstance = null;
    let nodes = [];
    let currentStep = -1;
    let autoPlayInterval = null;

    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        nodes = Array.from(document.querySelectorAll('.node'));
        addClickHandlers();

        const svg = document.querySelector('#diagram svg');
        if (svg) {
          // Ensure SVG can be transformed properly
          svg.style.transformOrigin = '0 0';

          panzoomInstance = panzoom(svg, {
            maxZoom: 5,
            minZoom: 0.1,
            bounds: false,
            zoomSpeed: 0.065,
            pinchSpeed: 1
          });
        }
      }, 500);
    });

    function addClickHandlers() {
      nodes.forEach((node, index) => {
        node.style.cursor = 'pointer';
        node.addEventListener('click', (e) => {
          e.stopPropagation();
          selectStep(index, e);
        });
      });

      document.addEventListener('click', () => hideTooltip());
    }

    function prevStep() {
      if (nodes.length === 0) return;
      if (currentStep <= 0) {
        currentStep = nodes.length;
      }
      currentStep--;
      nodes.forEach(n => n.classList.remove('activeStep', 'completedStep'));
      for (let i = 0; i < currentStep; i++) {
        nodes[i].classList.add('completedStep');
      }
      nodes[currentStep].classList.add('activeStep');
    }

    function nextStep() {
      if (nodes.length === 0) return;
      nodes.forEach(n => n.classList.remove('activeStep'));
      if (currentStep >= 0 && currentStep < nodes.length) {
        nodes[currentStep].classList.add('completedStep');
      }
      currentStep = (currentStep + 1) % nodes.length;
      if (currentStep === 0) {
        nodes.forEach(n => n.classList.remove('completedStep'));
      }
      nodes[currentStep].classList.add('activeStep');
    }

    function resetSteps() {
      stopAutoPlay();
      currentStep = -1;
      nodes.forEach(n => {
        n.classList.remove('activeStep', 'completedStep', 'selectedStep');
      });
      hideTooltip();
      resetView();
    }

    function selectStep(index, event) {
      nodes.forEach(n => n.classList.remove('selectedStep'));
      nodes[index].classList.add('selectedStep');
      showTooltip(index, event);
    }

    function showTooltip(index, event) {
      const node = nodes[index];
      const label = node.querySelector('.nodeLabel')?.textContent || 'Unknown';
      const tooltip = document.getElementById('tooltip');

      tooltip.innerHTML = \`
        <div class="tooltip-row"><span class="tooltip-label">step:</span> <span class="tooltip-value">\${label}</span></div>
        <div class="tooltip-row"><span class="tooltip-label">status:</span> <span class="tooltip-value">\${getStatus(index)}</span></div>
        <div class="tooltip-row"><span class="tooltip-label">index:</span> <span class="tooltip-value">\${index + 1}/\${nodes.length}</span></div>
      \`;

      const rect = node.getBoundingClientRect();
      tooltip.style.left = (rect.right + 10) + 'px';
      tooltip.style.top = rect.top + 'px';
      tooltip.classList.add('visible');
    }

    function hideTooltip() {
      document.getElementById('tooltip').classList.remove('visible');
      nodes.forEach(n => n.classList.remove('selectedStep'));
    }

    function getStatus(index) {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'running';
      return 'pending';
    }

    function autoPlay() {
      const btn = document.getElementById('playBtn');
      if (autoPlayInterval) {
        stopAutoPlay();
        return;
      }
      btn.classList.add('active');
      autoPlayInterval = setInterval(nextStep, 800);
    }

    function stopAutoPlay() {
      const btn = document.getElementById('playBtn');
      btn.classList.remove('active');
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    function zoomIn() {
      if (panzoomInstance) {
        const transform = panzoomInstance.getTransform();
        panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 1.5);
      }
    }

    function zoomOut() {
      if (panzoomInstance) {
        panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 0.67);
      }
    }

    function resetView() {
      if (panzoomInstance) {
        panzoomInstance.moveTo(0, 0);
        panzoomInstance.zoomAbs(0, 0, 1);
      }
    }

    function copySource() {
      navigator.clipboard.writeText(diagramSource).then(() => {
        const notification = document.getElementById('copyNotification');
        notification.classList.add('visible');
        setTimeout(() => notification.classList.remove('visible'), 2000);
      });
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
