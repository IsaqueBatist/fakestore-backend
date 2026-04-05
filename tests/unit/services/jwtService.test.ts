import { JWTService } from "../../../src/server/shared/services/JWTService";
import { UnauthorizedError } from "../../../src/server/errors";

describe("JWTService", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret-key-for-jest-tests";
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;
  });

  afterAll(() => {
    Object.assign(process.env, originalEnv);
  });

  describe("sign", () => {
    it("should return a string token", () => {
      const token = JWTService.sign({ uid: 1, role: "user", tid: 1 });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe("verify", () => {
    it("should decode a valid token correctly", () => {
      const payload = { uid: 42, role: "admin", tid: 5 };
      const token = JWTService.sign(payload);
      const decoded = JWTService.verify(token);

      expect(decoded.uid).toBe(42);
      expect(decoded.role).toBe("admin");
      expect(decoded.tid).toBe(5);
    });

    it("should throw UnauthorizedError for invalid token", () => {
      expect(() => JWTService.verify("invalid.token.here")).toThrow(
        UnauthorizedError,
      );
    });

    it("should throw UnauthorizedError for tampered token", () => {
      const token = JWTService.sign({ uid: 1, role: "user", tid: 1 });
      // Tamper with the payload part
      const parts = token.split(".");
      parts[1] = parts[1] + "x";
      const tampered = parts.join(".");

      expect(() => JWTService.verify(tampered)).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError for token signed with different secret", () => {
      const token = JWTService.sign({ uid: 1, role: "user", tid: 1 });
      process.env.JWT_SECRET = "different-secret-key";

      expect(() => JWTService.verify(token)).toThrow(UnauthorizedError);
    });
  });

  describe("configuration", () => {
    it("should throw when no JWT secret is configured", () => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_PRIVATE_KEY;
      delete process.env.JWT_PUBLIC_KEY;

      expect(() => JWTService.sign({ uid: 1, role: "user", tid: 1 })).toThrow();
    });
  });
});
