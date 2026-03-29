import * as jwt from "jsonwebtoken";
import { UnauthorizedError, DatabaseError } from "../../errors";

interface IJwtData {
  uid: number;
  role: string;
}

const sign = (data: IJwtData): string => {
  if (!process.env.JWT_SECRET) {
    throw new DatabaseError("JWT_SECRET_NOT_FOUND");
  }

  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const verify = (token: string): IJwtData => {
  if (!process.env.JWT_SECRET) {
    throw new DatabaseError("JWT_SECRET_NOT_FOUND");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("Invalid token format");
    }

    return decoded as IJwtData;
  } catch (error) {
    console.error(error);
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export const JWTService = {
  sign,
  verify,
};
