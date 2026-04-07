import * as register from "./Register";
import * as rotateKeys from "./RotateKeys";
import * as rotateCredentials from "./RotateCredentials";

export const TenantController = {
  ...register,
  ...rotateKeys,
  ...rotateCredentials,
};
