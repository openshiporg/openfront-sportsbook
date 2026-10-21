import { User } from './User';
import { Role } from './Role';
import * as Sportsbook from './Sportsbook';
import * as SportsbookP0 from './SportsbookP0';
import * as Customer from './Customer';
import * as SportsbookFull from './SportsbookFull';

export const models = {
  User,
  Role,
  ...Sportsbook,
  ...SportsbookP0,
  ...Customer,
  ...SportsbookFull,
};

export default models;