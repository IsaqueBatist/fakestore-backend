import { compare, genSalt, hash } from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../constants";

const hashPassword = async (password: string) => {
  const saltGenerated = await genSalt(BCRYPT_SALT_ROUNDS);
  return await hash(password, saltGenerated);
};

const verifyPassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};

export const passwordCrypto = {
  hashPassword,
  verifyPassword,
};
