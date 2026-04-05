import * as jwt from "jsonwebtoken";
import { UnauthorizedError, ConfigurationError } from "../../errors";

interface IJwtData {
  uid: number;
  role: string;
}

const sign = (data: IJwtData): string => {
  if (!process.env.JWT_SECRET) {
    throw new ConfigurationError("errors:jwt_secret_not_configured");
  }

  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const verify = (token: string): IJwtData => {
  if (!process.env.JWT_SECRET) {
    throw new ConfigurationError("errors:jwt_secret_not_configured");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("errors:invalid_token_format");
    }

    return decoded as IJwtData;
  } catch (error) {
    console.error(error);
    throw new UnauthorizedError("errors:invalid_or_expired_token");
  }
};

export const JWTService = {
  sign,
  verify,
};
