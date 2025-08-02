//import 'whatwg-fetch'; 
import { beforeEach, vi } from 'vitest';

// Reset mocks before each test to avoid leakage between tests
beforeEach(() => {
  vi.restoreAllMocks();
});