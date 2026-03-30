import * as create from "./Create";
import * as getByEmail from "./GetByEmail";
import * as updateToken from "./UpdateToken";

import * as addFavorite from "./AddFavorite";
import * as deleteFavorite from "./DeleteFavorite";
import * as getFavorites from "./GetFavorites";
import * as getByToken from "./GetByToken";
import * as updatePassowrd from "./UpdatePassword";

export const UserProvider = {
  ...create,
  ...getByEmail,
  ...addFavorite,
  ...deleteFavorite,
  ...getFavorites,
  ...updateToken,
  ...getByToken,
  ...updatePassowrd,
};
