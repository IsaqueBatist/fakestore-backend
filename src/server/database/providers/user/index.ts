import * as create from './Create';
import * as getByEmail from './GetByEmail'

import * as addFavorite from './AddFavorite'
import * as deleteFavorite from './DeleteFavorite'
import * as getFavorites from './GetFavorites'

export const UserProvider = {
    ...create,
    ...getByEmail,
    ...addFavorite,
    ...deleteFavorite,
    ...getFavorites
};