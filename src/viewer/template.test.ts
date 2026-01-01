// src/viewer/template.test.ts

import { describe, it, expect } from 'vitest';
import { generateViewerHtml } from './template.js';

describe('generateViewerHtml', () => {
  it('generates valid HTML with Mermaid diagram', () => {
    const mermaid = `flowchart LR
s((Start)) --> FetchData --> e((End))`;

    const html = generateViewerHtml(mermaid);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('mermaid');
    expect(html).toContain('FetchData');
    expect(html).toContain('<script');
  });

  it('includes interactive controls', () => {
    const mermaid = 'flowchart LR\nA --> B';
    const html = generateViewerHtml(mermaid);

    expect(html).toContain('nextStep');
    expect(html).toContain('activeStep');
  });

  it('escapes mermaid content for embedding', () => {
    const mermaid = 'flowchart LR\nA["Test <script>alert(1)</script>"] --> B';
    const html = generateViewerHtml(mermaid);

    // Should not contain unescaped script
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('includes panzoom library script', () => {
    const mermaid = 'flowchart LR\nA --> B';
    const html = generateViewerHtml(mermaid);

    expect(html).toContain('panzoom');
    expect(html).toContain('cdn.jsdelivr.net/npm/panzoom');
  });
});
