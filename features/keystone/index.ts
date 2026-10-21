import { createAuth } from "@keystone-6/auth";
import { config } from "@keystone-6/core";
import "dotenv/config";
import { models } from "./models";
import { statelessSessions } from "@keystone-6/core/session";
import { extendGraphqlSchema } from "./mutations";
import { extendSportsbookPrismaSchema } from "./prisma-contract";
import { tenantScopedPrisma } from './tenant-scope';
import { bootstrapOperatorIdentity } from './identity-bootstrap';

const databaseURL=process.env.DATABASE_URL
if(!databaseURL)throw new Error('DATABASE_URL is required')
const sessionSecret=process.env.SESSION_SECRET
if(!sessionSecret||sessionSecret.length<32)throw new Error('SESSION_SECRET must be at least 32 characters')

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret,
};

/**
 * Stateless sessions carry their issuance time so a completed password reset
 * (User.passwordResetRedeemedAt) revokes every session — including elevated MFA
 * sessions — that was sealed before the reset.
 */
const baseSession = statelessSessions(sessionConfig);
const sessionStrategy: typeof baseSession = {
  ...baseSession,
  async start(args) {
    return baseSession.start({ ...args, data: { ...(args.data as any), issuedAt: Date.now() } });
  },
  async get(args) {
    const session: any = await baseSession.get(args);
    if (!session?.itemId) return session;
    // Pre-tenant bootstrap read of the sealed user's row only (works under non-bypass row-level security).
    const user = await bootstrapOperatorIdentity((args.context as any).prisma, String(session.itemId));
    if (!user) return undefined;
    const resetAt = user.passwordResetRedeemedAt ? new Date(user.passwordResetRedeemedAt).getTime() : 0;
    if (resetAt && !(Number(session.issuedAt) > resetAt)) return undefined;
    return session;
  },
};

/**
 * The tenant of the operator whose signed session cookie accompanies this request, resolved through the narrow
 * bootstrap boundary (no global user discovery). Request handlers run the rest of the request in this tenant's scope.
 */
export async function operatorSessionTenant(req: any, prisma: any): Promise<string | null> {
  const session: any = await baseSession.get({ context: { req } as any });
  if (!session?.itemId) return null;
  const user = await bootstrapOperatorIdentity(prisma, String(session.itemId));
  const resetAt = user?.passwordResetRedeemedAt ? new Date(user.passwordResetRedeemedAt).getTime() : 0;
  if (!user || (resetAt && !(Number(session.issuedAt) > resetAt))) return null;
  return user.tenantId;
}

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  sessionData: `
    name
    email
    tenant { id }
    role {
      id
      name
      canSeeOtherPeople
      canEditOtherPeople
      canManagePeople
      canManageRoles
      canAccessDashboard
      canManageSportsbook
      canTrade
      canManageRisk
      canManageCompliance
      canManageFinance
      canManageIntegrations
      canApproveSensitiveActions
      canReadAudit
    }
  `,
});

export default withAuth(
  config({
    db: {
      provider: "postgresql",
      url: databaseURL,
      extendPrismaSchema: extendSportsbookPrismaSchema,
      extendPrismaClient: (client) => tenantScopedPrisma(client),
    },
    lists: models,
    ui: {
      isAccessAllowed: ({ session }) => session?.data.role?.canAccessDashboard ?? false,
    },
    session: sessionStrategy,
    graphql: {
      extendGraphqlSchema,
    },
  })
);