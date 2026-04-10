import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { TenantService } from "../../services/tenants";
import { JWTService } from "../../shared/services";

// -- Checkout Session --

interface ICheckoutBody {
  plan: string;
  email: string;
}

export const checkoutValidation = validation((getSchema) => ({
  body: getSchema<ICheckoutBody>(
    yup.object().shape({
      plan: yup
        .string()
        .required()
        .oneOf(["basic", "agency"]),
      email: yup.string().required().email(),
    }),
  ),
}));

export const checkout = async (
  req: Request<{}, {}, ICheckoutBody>,
  res: Response,
) => {
  const [, token] = (req.headers.authorization || "").split(" ");
  const jwtData = JWTService.verify(token);

  const result = await TenantService.createCheckoutSession(
    jwtData.tid,
    req.body.plan,
    req.body.email,
  );

  return res.status(StatusCodes.OK).json(result);
};

// -- Portal Session --

interface IPortalBody {
  return_url: string;
}

export const portalValidation = validation((getSchema) => ({
  body: getSchema<IPortalBody>(
    yup.object().shape({
      return_url: yup.string().required().url(),
    }),
  ),
}));

export const portal = async (
  req: Request<{}, {}, IPortalBody>,
  res: Response,
) => {
  const [, token] = (req.headers.authorization || "").split(" ");
  const jwtData = JWTService.verify(token);

  const result = await TenantService.createPortalSession(
    jwtData.tid,
    req.body.return_url,
  );

  return res.status(StatusCodes.OK).json(result);
};

// -- Verify Checkout Session (polling contingency) --

interface IVerifyQuery {
  session_id: string;
}

export const verifyCheckoutValidation = validation((getSchema) => ({
  query: getSchema<IVerifyQuery>(
    yup.object().shape({
      session_id: yup.string().required(),
    }),
  ),
}));

export const verifyCheckout = async (
  req: Request,
  res: Response,
) => {
  const [, token] = (req.headers.authorization || "").split(" ");
  const jwtData = JWTService.verify(token);

  const result = await TenantService.verifyCheckoutSession(
    jwtData.tid,
    req.query.session_id as string,
  );

  return res.status(StatusCodes.OK).json(result);
};
