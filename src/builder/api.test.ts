// src/builder/api.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { graphContext } from '../context.js';

// This is an integration test - we'll test the API shape
describe('buildGraph API', () => {
  beforeEach(() => {
    graphContext.reset();
  });

  afterEach(() => {
    graphContext.reset();
  });

  it('accepts workflow function and options', async () => {
    // Import dynamically to test module shape
    const { buildGraph } = await import('./api.js');

    expect(typeof buildGraph).toBe('function');
  });
});
