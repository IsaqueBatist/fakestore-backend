import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { trackShipment } from "../../services/shipping/ShippingService";

interface IParamsProps {
  code: string;
}

export const trackValidation = validation((getSchema) => ({
  params: getSchema<IParamsProps>(
    yup.object().shape({
      code: yup.string().required().min(1),
    }),
  ),
}));

export const track = async (req: Request, res: Response) => {
  const result = await trackShipment(req.params.code);
  return res.status(StatusCodes.OK).json(result);
};
