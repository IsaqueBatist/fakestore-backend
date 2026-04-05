export default async function globalTeardown() {
  // Connections are cleaned up in jest.setup.ts afterAll hooks
  // This is a safety net to ensure the process exits cleanly
}
