import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JWTService } from '../../shared/services';
import { CartProvider } from '../../database/providers/carts';
import { ICart_Item } from '../../database/models/Cart_Item';
import * as yup from 'yup'
import { validation } from '../../shared/middlewares';

interface IBodyProps extends Omit<ICart_Item, 'id_cart_item' | 'added_at' | 'cart_id'> {}

export const addedItemValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    product_id: yup.number().required().moreThan(0),
    quantity: yup.number().required()
  }))
}));


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const additem = async (req: Request, res: Response) => {
  if (!req.headers.authorization){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const [type, token] = req.headers.authorization.split(' ')

  const userId = JWTService.verify(token)

  if (userId === 'JWT_SECRET_NOT_FOUND') {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: {default: 'JWT secret not found on server'}
    })
  } else if (userId === 'INVALID_TOKEN') {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      errors: {default: 'Internal authentication error'}
    })
  }

  const result = await CartProvider.addItem(req.body, userId.uid)
  
  if(result instanceof Error){
    if(result.message === 'Cart not found for user'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Non-existent Product'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  } 

  return res.status(StatusCodes.CREATED).json(result)
};
