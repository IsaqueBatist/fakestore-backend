import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from "yup";
import { AIService } from "../../services/ai";

interface IBodyProps {
  question: string;
}

export const askValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      question: yup.string().required().min(3).max(500),
    }),
  ),
}));

export const ask = async (req: Request<{}, {}, IBodyProps>, res: Response) => {
  const tenantId = req.tenant!.id;
  const { question } = req.body;

  const answer = await AIService.ask(question, tenantId);

  return res.status(StatusCodes.OK).json({ answer });
};
