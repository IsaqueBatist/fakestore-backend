import { passwordCrypto } from "../../../src/server/shared/services/PasswordCrypto";

describe("PasswordCrypto", () => {
  describe("hashPassword", () => {
    it("should return a bcrypt hash", async () => {
      const hash = await passwordCrypto.hashPassword("MyPassword123");
      expect(hash).toBeDefined();
      expect(hash).not.toBe("MyPassword123");
      expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix
    });

    it("should produce different hashes for same password (salt)", async () => {
      const hash1 = await passwordCrypto.hashPassword("same-password");
      const hash2 = await passwordCrypto.hashPassword("same-password");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const password = "CorrectPassword123";
      const hash = await passwordCrypto.hashPassword(password);
      const result = await passwordCrypto.verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it("should return false for wrong password", async () => {
      const hash = await passwordCrypto.hashPassword("CorrectPassword");
      const result = await passwordCrypto.verifyPassword("WrongPassword", hash);
      expect(result).toBe(false);
    });
  });
});
