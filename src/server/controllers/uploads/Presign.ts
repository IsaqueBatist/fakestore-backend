import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from "yup";
import { validation } from "../../shared/middlewares/Validation";
import { generateUploadUrl } from "../../shared/services/ImageService";

interface IBodyProps {
  filename: string;
  mime_type: string;
}

export const presignValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      filename: yup.string().required().min(1).max(255),
      mime_type: yup
        .string()
        .required()
        .oneOf(
          ["image/jpeg", "image/png", "image/webp", "image/avif"],
          "Allowed types: image/jpeg, image/png, image/webp, image/avif",
        ),
    }),
  ),
}));

export const presign = async (req: Request<{}, {}, IBodyProps>, res: Response) => {
  const tenantId = req.tenant!.id;
  const { filename, mime_type } = req.body;

  const result = await generateUploadUrl(tenantId, filename, mime_type);

  return res.status(StatusCodes.OK).json(result);
};
