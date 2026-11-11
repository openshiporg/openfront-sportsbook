import { User } from './User';
import { Role } from './Role';
import * as Sportsbook from './Sportsbook';
import * as SportsbookP0 from './SportsbookP0';
import * as Customer from './Customer';
import * as SportsbookFull from './SportsbookFull';

const rawModels = {
  User,
  Role,
  ...Sportsbook,
  ...SportsbookP0,
  ...Customer,
  ...SportsbookFull,
};

// Sidebar visibility follows the role: a list whose query access denies the session is hidden from navigation
// (Keystone evaluates ui.isHidden per session in admin meta). Explicit isHidden settings are kept. Access checks
// read the signed-in user, so the lookup is shared per request instead of repeated for every list.
const userLookups = new WeakMap<object, Map<string, Promise<unknown>>>();
const sharedUserContext = (context: any) => {
  const cache = userLookups.get(context) ?? new Map<string, Promise<unknown>>();
  userLookups.set(context, cache);
  const findUnique = (args: any) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, context.prisma.user.findUnique(args));
    return cache.get(key);
  };
  return { ...context, prisma: { user: { findUnique } } };
};

export const models = Object.fromEntries(Object.entries(rawModels).map(([key, config]: [string, any]) => {
  const operationQuery = config?.access?.operation?.query;
  const filterQuery = config?.access?.filter?.query;
  if (typeof operationQuery !== 'function' && typeof filterQuery !== 'function') return [key, config];
  const existing = config?.ui?.isHidden;
  const isHidden = async (args: any) => {
    if (existing === true || (typeof existing === 'function' && await existing(args))) return true;
    try {
      const checked = { ...args, context: args.context ? sharedUserContext(args.context) : args.context };
      if (typeof operationQuery === 'function' && !(await operationQuery(checked))) return true;
      return typeof filterQuery === 'function' && (await filterQuery(checked)) === false;
    } catch {
      return false;
    }
  };
  return [key, { ...config, ui: { ...(config.ui ?? {}), isHidden } }];
})) as typeof rawModels;

export default models;