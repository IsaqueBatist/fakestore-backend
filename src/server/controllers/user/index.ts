import * as signIn from './signIn';
import * as signUp from './signUp';

export const UserController = {
  ...signIn,
  ...signUp
};  