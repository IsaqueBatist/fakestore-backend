import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserProvider } from "../../database/providers/user";
import { UnauthorizedError } from "../../errors";

export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await UserProvider.getFavorites(userId);

  return res.status(StatusCodes.OK).json(result);
};
