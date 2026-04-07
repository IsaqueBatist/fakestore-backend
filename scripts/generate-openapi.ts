import fs from "fs";
import path from "path";
import { swaggerSpec } from "../docs/backend/SwaggerConfig";

const outputPath = path.resolve(__dirname, "..", "openapi.json");
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");
console.log(`OpenAPI spec written to ${outputPath}`);
