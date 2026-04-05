import * as jwt from "jsonwebtoken";
import { UnauthorizedError, ConfigurationError } from "../../errors";

export interface IJwtData {
  uid: number;
  role: string;
  tid: number; // tenant_id
}

const decodeBase64Key = (base64Key: string): string => {
  return Buffer.from(base64Key, "base64").toString("utf-8");
};

const getPrivateKey = (): string => {
  if (process.env.JWT_PRIVATE_KEY) {
    return decodeBase64Key(process.env.JWT_PRIVATE_KEY);
  }
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  throw new ConfigurationError("errors:jwt_secret_not_configured");
};

const getPublicKey = (): string => {
  if (process.env.JWT_PUBLIC_KEY) {
    return decodeBase64Key(process.env.JWT_PUBLIC_KEY);
  }
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  throw new ConfigurationError("errors:jwt_secret_not_configured");
};

const getAlgorithm = (): jwt.Algorithm => {
  // Use RS256 when asymmetric keys are provided, HS256 as fallback
  return process.env.JWT_PRIVATE_KEY ? "RS256" : "HS256";
};

const sign = (data: IJwtData): string => {
  return jwt.sign(data, getPrivateKey(), {
    expiresIn: "24h",
    algorithm: getAlgorithm(),
  });
};

const verify = (token: string): IJwtData => {
  try {
    const decoded = jwt.verify(token, getPublicKey(), {
      algorithms: [getAlgorithm()],
    });

    if (typeof decoded === "string") {
      throw new UnauthorizedError("errors:invalid_token_format");
    }

    return decoded as IJwtData;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError("errors:invalid_or_expired_token");
  }
};

export const JWTService = {
  sign,
  verify,
};
