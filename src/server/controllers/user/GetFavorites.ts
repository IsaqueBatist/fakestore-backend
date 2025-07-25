import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserProvider } from '../../database/providers/user';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user?.id

  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  
  const result = await UserProvider.getFavorites(userId)

  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    });
  }

  return res.status(StatusCodes.OK).json(result)
};
