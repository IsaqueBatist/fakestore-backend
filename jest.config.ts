import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setupAfterEnv.ts"],
  globalSetup: "<rootDir>/tests/jest.globalSetup.ts",
  globalTeardown: "<rootDir>/tests/jest.globalTeardown.ts",
  maxWorkers: 1,
  testTimeout: 15000,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          rootDir: ".",
          outDir: "./build",
          module: "commonjs",
          target: "es2016",
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: "node10",
          typeRoots: ["./src/@types", "./node_modules/@types"],
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/server/**/*.ts",
    "!src/server/database/migrations/**",
    "!src/server/database/seeds/**",
    "!src/server/database/knex/Environment.ts",
    "!src/server/routes/index.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/worker.ts",
  ],
  coverageDirectory: "coverage",
};

export default config;
