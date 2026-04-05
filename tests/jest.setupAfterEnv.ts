// This file runs after the test framework is loaded
// so Jest globals (beforeEach, afterAll, etc.) are available

// Clear mock state between tests
beforeEach(() => {
  jest.clearAllMocks();
});
