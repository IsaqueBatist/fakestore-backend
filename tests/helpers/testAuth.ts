import {
  JWTService,
  IJwtData,
} from "../../src/server/shared/services/JWTService";
import { TEST_API_KEY_1, TEST_API_KEY_2 } from "./testDb";

export { TEST_API_KEY_1, TEST_API_KEY_2 };

export function generateTestToken(overrides: Partial<IJwtData> = {}): string {
  return JWTService.sign({
    uid: 1,
    role: "user",
    tid: 1,
    ...overrides,
  });
}

export function generateAdminToken(overrides: Partial<IJwtData> = {}): string {
  return JWTService.sign({
    uid: 1,
    role: "admin",
    tid: 1,
    ...overrides,
  });
}

export function authHeaders(
  token: string,
  apiKey: string = TEST_API_KEY_1,
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "x-api-key": apiKey,
  };
}
