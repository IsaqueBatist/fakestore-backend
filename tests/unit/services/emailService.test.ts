/**
 * EmailService Unit Tests
 *
 * Tests the email sending functions. Since EmailService is globally mocked
 * in jest.setup.ts, we test the export contracts and verify the real module
 * structure.
 */

describe("EmailService exports", () => {
  it("should export sendForgotPasswordEmail", () => {
    const mod = jest.requireActual(
      "../../../src/server/shared/services/EmailService",
    );
    expect(typeof mod.sendForgotPasswordEmail).toBe("function");
  });

  it("should export sendWelcomeTenantEmail", () => {
    const mod = jest.requireActual(
      "../../../src/server/shared/services/EmailService",
    );
    expect(typeof mod.sendWelcomeTenantEmail).toBe("function");
  });

  it("should export sendOrderConfirmationEmail", () => {
    const mod = jest.requireActual(
      "../../../src/server/shared/services/EmailService",
    );
    expect(typeof mod.sendOrderConfirmationEmail).toBe("function");
  });
});

describe("EmailService mocked behavior", () => {
  it("sendForgotPasswordEmail should be callable (mocked)", async () => {
    const { sendForgotPasswordEmail } = require(
      "../../../src/server/shared/services/EmailService",
    );
    await expect(
      sendForgotPasswordEmail("test@example.com", "abc123"),
    ).resolves.toBeUndefined();
  });

  it("sendForgotPasswordEmail mock should track calls", async () => {
    const { sendForgotPasswordEmail } = require(
      "../../../src/server/shared/services/EmailService",
    );
    await sendForgotPasswordEmail("user@test.com", "token-xyz");
    expect(sendForgotPasswordEmail).toHaveBeenCalledWith(
      "user@test.com",
      "token-xyz",
    );
  });
});
