import * as signUp from "./SignUp";
import * as signIn from "./SignIn";
import * as forgotPassword from "./ForgotPassword";
import * as resetPassword from "./ResetPassword";
import * as addFavorite from "./AddFavorite";
import * as deleteFavorite from "./DeleteFavorite";
import * as getFavorites from "./GetFavorites";

export const UserService = {
  ...signUp,
  ...signIn,
  ...forgotPassword,
  ...resetPassword,
  ...addFavorite,
  ...deleteFavorite,
  ...getFavorites,
};
