import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';
import 'vitest-canvas-mock';

// Runs a cleanup after each test case (clears jsdom)
afterEach(() => {
  cleanup();
});

const URLMock = {
  createObjectURL: vi.fn(),
};

vi.stubGlobal('URL', URLMock);
