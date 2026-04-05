import supertest from "supertest";
import { server } from "../src/server/server";

// Known test API key matching the hash created in globalSetup.ts
export const TEST_API_KEY = "test_key_for_integration_tests_0000000000000000";

const agent = supertest(server);

// Wrap supertest to auto-inject x-api-key header on all requests
const wrapMethod = (method: "get" | "post" | "put" | "delete" | "patch") => {
  return (url: string) => agent[method](url).set("x-api-key", TEST_API_KEY);
};

export const testServer = {
  get: wrapMethod("get"),
  post: wrapMethod("post"),
  put: wrapMethod("put"),
  delete: wrapMethod("delete"),
  patch: wrapMethod("patch"),
};
