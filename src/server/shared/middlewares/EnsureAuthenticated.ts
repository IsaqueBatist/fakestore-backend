import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const ensureAuthenticated: RequestHandler = async (req, res, next) => {
    
    const { authorization } =  req.headers
    
    if (!authorization) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'User not authenticated'
            }
        })
    }

    const [type, token ] = authorization.split(' ')

    if (type != 'Bearer' ) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'User not authenticated'
            }
        })
    }

    if (token != 'test.test.test') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors: {
                default: 'User not authenticated'
            }
        })
    }

    return next()
}