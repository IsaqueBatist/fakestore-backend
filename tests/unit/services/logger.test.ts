import { logger } from "../../../src/server/shared/services/Logger";

describe("Logger Service", () => {
  it("should export a logger instance", () => {
    expect(logger).toBeDefined();
  });

  it("should have standard log methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("should be silent in test environment", () => {
    expect(logger.level).toBe("silent");
  });
});