"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default2
});
module.exports = __toCommonJS(keystone_exports);

// features/keystone/index.ts
var import_auth4 = require("@keystone-6/auth");
var import_core7 = require("@keystone-6/core");
var import_config = require("dotenv/config");

// features/keystone/models/User.ts
var import_core = require("@keystone-6/core");
var import_access = require("@keystone-6/core/access");
var import_fields2 = require("@keystone-6/core/fields");

// features/keystone/session-assurance.ts
var import_node_crypto = require("node:crypto");
var OPERATOR_MFA_ASSURANCE_TTL_MS = 12 * 60 * 60 * 1e3;
function hasOperatorMfaAssurance(session, now = Date.now()) {
  const claim = session?.operatorMfaAssurance;
  if (!claim || !Number.isSafeInteger(claim.issuedAt) || !Number.isSafeInteger(claim.expiresAt)) return false;
  return claim.issuedAt <= now && claim.expiresAt > now && claim.expiresAt - claim.issuedAt <= OPERATOR_MFA_ASSURANCE_TTL_MS && typeof claim.nonce === "string" && claim.nonce.length >= 20;
}
async function startOperatorMfaSession(context, itemId, now = Date.now()) {
  if (!context.sessionStrategy?.start) throw new Error("SESSION_ISSUANCE_UNAVAILABLE");
  const token = await context.sessionStrategy.start({
    context,
    data: {
      // @keystone-6/auth only resolves sessions sealed for its list.
      listKey: "User",
      itemId,
      operatorMfaAssurance: {
        issuedAt: now,
        expiresAt: now + OPERATOR_MFA_ASSURANCE_TTL_MS,
        nonce: (0, import_node_crypto.randomUUID)()
      }
    }
  });
  if (typeof token !== "string" || token.length === 0) throw new Error("SESSION_ISSUANCE_FAILED");
  return token;
}

// features/keystone/access.ts
function isSignedIn({ session }) {
  return Boolean(session);
}
var isOperatorSessionAssured = (session) => hasOperatorMfaAssurance(session);
async function currentUser({ session, context }) {
  if (!session?.itemId || !context?.prisma) return null;
  return context.prisma.user.findUnique({ where: { id: session.itemId }, include: { role: true } });
}
var currentOperatorPermission = (capability) => async (args) => {
  if (!isOperatorSessionAssured(args.session)) return false;
  const user = await currentUser(args);
  return Boolean(user?.role?.[capability]);
};
var currentCapability = (capability) => async (args) => {
  if (!isOperatorSessionAssured(args.session)) return false;
  const user = await currentUser(args);
  return Boolean(user?.tenantId && user.role?.[capability]);
};
var currentTenantId = async (args) => {
  const user = await currentUser(args);
  return user?.tenantId ?? null;
};
var currentTenantScope = async (args) => {
  const tenantId = await currentTenantId(args);
  return tenantId ? { tenant: { id: { equals: tenantId } } } : false;
};
var currentTenantItemScope = async (args) => {
  const tenantId = await currentTenantId(args);
  return tenantId ? { id: { equals: tenantId } } : false;
};
var assuredPermission = (capability) => ({ session }) => isOperatorSessionAssured(session) && Boolean(session?.data.role?.[capability]);
var permissions = {
  canManagePeople: assuredPermission("canManagePeople"),
  canManageRoles: assuredPermission("canManageRoles"),
  canManageSportsbook: assuredPermission("canManageSportsbook"),
  canTrade: assuredPermission("canTrade"),
  canManageRisk: assuredPermission("canManageRisk"),
  canManageCompliance: assuredPermission("canManageCompliance"),
  canManageFinance: assuredPermission("canManageFinance"),
  canManageIntegrations: assuredPermission("canManageIntegrations"),
  canApproveSensitiveActions: assuredPermission("canApproveSensitiveActions"),
  canReadAudit: assuredPermission("canReadAudit")
};
var rules = {
  sameTenant: ({ session }) => session?.data.tenant?.id ? { tenant: { id: { equals: session.data.tenant.id } } } : false,
  canReadPeople: async (args) => {
    const { session } = args;
    if (!session) return false;
    const user = await currentUser(args);
    if (isOperatorSessionAssured(session) && user?.tenantId && user.role?.canSeeOtherPeople) {
      return { OR: [{ id: { equals: session.itemId } }, { tenant: { id: { equals: user.tenantId } } }] };
    }
    return { id: { equals: session.itemId } };
  },
  canUpdatePeople: async (args) => {
    const { session } = args;
    if (!session) return false;
    const user = await currentUser(args);
    if (isOperatorSessionAssured(session) && user?.tenantId && user.role?.canEditOtherPeople) {
      return { OR: [{ id: { equals: session.itemId } }, { tenant: { id: { equals: user.tenantId } } }] };
    }
    return { id: { equals: session.itemId } };
  },
  canDeletePeople: async (args) => {
    const { session } = args;
    if (!session || !isOperatorSessionAssured(session)) return false;
    const user = await currentUser(args);
    if (!user?.tenantId || !user.role?.canManagePeople) return false;
    return { AND: [{ tenant: { id: { equals: user.tenantId } } }, { id: { not: { equals: session.itemId } } }] };
  }
};

// features/keystone/models/trackingFields.ts
var import_fields = require("@keystone-6/core/fields");
var trackingFields = {
  createdAt: (0, import_fields.timestamp)({ access: { read: () => true, create: () => false, update: () => false }, validation: { isRequired: true }, defaultValue: { kind: "now" }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } } }),
  updatedAt: (0, import_fields.timestamp)({ access: { read: () => true, create: () => false, update: () => false }, validation: { isRequired: true }, defaultValue: { kind: "now" }, db: { updatedAt: true }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } } })
};

// features/keystone/models/User.ts
var userOwnershipAccess = { create: import_access.denyAll, update: import_access.denyAll };
var User = (0, import_core.list)({
  access: {
    operation: {
      ...(0, import_access.allOperations)(isSignedIn),
      create: (args) => {
        if (process.env.PUBLIC_SIGNUPS_ALLOWED === "true") {
          return true;
        }
        return currentOperatorPermission("canManagePeople")(args);
      },
      delete: currentOperatorPermission("canManagePeople")
    },
    filter: {
      query: rules.canReadPeople,
      update: rules.canUpdatePeople,
      delete: rules.canDeletePeople
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManagePeople(args),
    hideDelete: (args) => !permissions.canManagePeople(args),
    listView: {
      initialColumns: ["name", "email", "role", "tenant"]
    },
    itemView: {
      defaultFieldMode: ({ session, item }) => session?.data.role?.canEditOtherPeople || session?.itemId === item?.id ? "edit" : "read"
    }
  },
  fields: {
    name: (0, import_fields2.text)({
      validation: {
        isRequired: true
      }
    }),
    email: (0, import_fields2.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    passwordResetToken: (0, import_fields2.text)({ defaultValue: null, db: { isNullable: true }, access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    passwordResetIssuedAt: (0, import_fields2.timestamp)({ access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    passwordResetRedeemedAt: (0, import_fields2.timestamp)({ access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    operatorMfaEnabled: (0, import_fields2.checkbox)({ defaultValue: false, access: { create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } } }),
    operatorMfaSecret: (0, import_fields2.text)({ defaultValue: null, db: { isNullable: true }, access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    operatorMfaRecoveryHashes: (0, import_fields2.json)({ access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    operatorMfaFailedAttempts: (0, import_fields2.integer)({ defaultValue: 0, access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    operatorMfaLockedUntil: (0, import_fields2.timestamp)({ access: { read: import_access.denyAll, create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "hidden" } } }),
    operatorMfaEnrolledAt: (0, import_fields2.timestamp)({ access: { create: import_access.denyAll, update: import_access.denyAll }, ui: { createView: { fieldMode: "hidden" }, itemView: { fieldMode: "read" } } }),
    password: (0, import_fields2.password)({
      access: {
        read: import_access.denyAll,
        update: async ({ session, item, context }) => await currentOperatorPermission("canManagePeople")({ session, context }) || session?.itemId === item.id
      },
      validation: { isRequired: true }
    }),
    tenant: (0, import_fields2.relationship)({
      ref: "Tenant",
      access: userOwnershipAccess
    }),
    ...trackingFields,
    onboardingStatus: (0, import_fields2.select)({
      options: [
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Dismissed", value: "dismissed" }
      ],
      defaultValue: "not_started",
      access: { update: import_access.denyAll }
    }),
    role: (0, import_fields2.relationship)({
      ref: "Role.assignedTo",
      access: userOwnershipAccess,
      ui: {
        itemView: {
          fieldMode: (args) => permissions.canManagePeople(args) ? "edit" : "read"
        }
      }
    })
  }
});

// features/keystone/models/Role.ts
var import_core2 = require("@keystone-6/core");
var import_access3 = require("@keystone-6/core/access");
var import_fields3 = require("@keystone-6/core/fields");
var Role = (0, import_core2.list)({
  access: {
    operation: { query: isSignedIn, create: import_access3.denyAll, update: import_access3.denyAll, delete: import_access3.denyAll },
    filter: { query: ({ session }) => session?.data.tenant?.id ? { OR: [{ tenant: { id: { equals: session.data.tenant.id } } }, { assignedTo: { some: { id: { equals: session.itemId } } } }] } : { assignedTo: { some: { id: { equals: session?.itemId ?? "" } } } } }
  },
  ui: {
    hideCreate: true,
    hideDelete: true,
    listView: {
      initialColumns: ["name", "assignedTo"]
    },
    itemView: { defaultFieldMode: "read" }
  },
  fields: {
    tenant: (0, import_fields3.relationship)({ ref: "Tenant", access: { create: import_access3.denyAll, update: import_access3.denyAll } }),
    name: (0, import_fields3.text)({ validation: { isRequired: true } }),
    canSeeOtherPeople: (0, import_fields3.checkbox)({ defaultValue: false }),
    canEditOtherPeople: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManagePeople: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageRoles: (0, import_fields3.checkbox)({ defaultValue: false }),
    canAccessDashboard: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageOnboarding: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageSportsbook: (0, import_fields3.checkbox)({ defaultValue: false }),
    canTrade: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageRisk: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageCompliance: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageFinance: (0, import_fields3.checkbox)({ defaultValue: false }),
    canManageIntegrations: (0, import_fields3.checkbox)({ defaultValue: false }),
    canApproveSensitiveActions: (0, import_fields3.checkbox)({ defaultValue: false }),
    canReadAudit: (0, import_fields3.checkbox)({ defaultValue: false }),
    ...trackingFields,
    assignedTo: (0, import_fields3.relationship)({
      ref: "User.role",
      many: true,
      ui: {
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// features/keystone/models/Sportsbook.ts
var Sportsbook_exports = {};
__export(Sportsbook_exports, {
  AcceptanceDecision: () => AcceptanceDecision,
  AuditEvent: () => AuditEvent,
  Brand: () => Brand,
  Competition: () => Competition,
  DeadLetter: () => DeadLetter,
  Event: () => Event,
  Hold: () => Hold,
  InboxMessage: () => InboxMessage,
  JournalEntry: () => JournalEntry,
  JournalTransaction: () => JournalTransaction,
  Jurisdiction: () => Jurisdiction,
  LedgerAccount: () => LedgerAccount,
  Market: () => Market,
  OperatorJurisdiction: () => OperatorJurisdiction,
  OutboxMessage: () => OutboxMessage,
  Player: () => Player,
  PlayerLimit: () => PlayerLimit,
  PriceSnapshot: () => PriceSnapshot,
  ProviderConnection: () => ProviderConnection,
  Quote: () => Quote,
  RawEnvelope: () => RawEnvelope,
  ResultVersion: () => ResultVersion,
  Selection: () => Selection,
  SelfExclusion: () => SelfExclusion,
  Settlement: () => Settlement,
  Sport: () => Sport,
  Tenant: () => Tenant,
  Wager: () => Wager,
  WagerLeg: () => WagerLeg
});
var import_core3 = require("@keystone-6/core");
var import_access5 = require("@keystone-6/core/access");
var import_fields4 = require("@keystone-6/core/fields");

// features/platform/store-settings/lib/store-logo.ts
var DEFAULT_STORE_LOGO_ICON = '<svg fill="none" height="100%" viewBox="0 0 36 48" width="100%" xmlns="http://www.w3.org/2000/svg"><g fill="#155eef"><path d="m0 7.5h28.8c2.5202 0 3.7804 0 4.743.49047.8467.43143 1.5351 1.11984 1.9665 1.96657.4905.96256.4905 2.22276.4905 4.74296v1.8h-28.8c-2.52024 0-3.78035 0-4.74296-.4905-.84673-.4314-1.535139-1.1198-1.966569-1.9665-.490471-.9626-.490471-2.2228-.490471-4.743z"/><path d="m0 28.5h28.8c2.5202 0 3.7804 0 4.743-.4905.8467-.4314 1.5351-1.1198 1.9665-1.9665.4905-.9626.4905-2.2228.4905-4.743v-1.8h-28.8c-2.52024 0-3.78035 0-4.74296.4905-.84673.4314-1.535139 1.1198-1.966569 1.9665-.490471.9626-.490471 2.2228-.490471 4.743z"/><path d="m14 31.5h14.8c2.5202 0 3.7804 0 4.743.4905.8467.4314 1.5351 1.1198 1.9665 1.9665.4905.9626.4905 2.2228.4905 4.743v1.8h-14.8c-2.5202 0-3.7804 0-4.743-.4905-.8467-.4314-1.5351-1.1198-1.9665-1.9665-.4905-.9626-.4905-2.2228-.4905-4.743z"/></g></svg>';
var DEFAULT_STORE_LOGO_COLOR = "0";
function normalizeStoreLogoColor(value) {
  const numeric = Number.parseFloat(String(value ?? DEFAULT_STORE_LOGO_COLOR));
  if (!Number.isFinite(numeric)) return DEFAULT_STORE_LOGO_COLOR;
  return String((numeric % 360 + 360) % 360);
}

// features/keystone/utils/storeLogo.ts
var ALLOWED_ELEMENTS = /* @__PURE__ */ new Set([
  "svg",
  "g",
  "path",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "clippath",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "title",
  "desc"
]);
var ALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
  "xmlns",
  "fill",
  "fill-rule",
  "clip-rule",
  "height",
  "width",
  "viewbox",
  "d",
  "clip-path",
  "id",
  "x1",
  "x2",
  "y1",
  "y2",
  "gradientunits",
  "gradienttransform",
  "offset",
  "stop-color",
  "stop-opacity",
  "opacity",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "transform",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "points",
  "role",
  "aria-hidden",
  "aria-label",
  "preserveaspectratio"
]);
var ATTRIBUTE_PATTERN = /\s+([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g;
var TAG_PATTERN = /<\/?\s*([A-Za-z][\w:-]*)([^<>]*)>/g;
function sanitizeStoreLogoSvg(svg) {
  const source = svg.trim();
  if (!source.startsWith("<svg") || !source.endsWith("</svg>") || source.length > 1e5) {
    return "";
  }
  if (/<!|<\?|\b(?:javascript|data|vbscript):|\bon[a-z]+\s*=|\b(?:href|src|style)\s*=/i.test(source)) {
    return "";
  }
  let tagCount = 0;
  let match;
  TAG_PATTERN.lastIndex = 0;
  while (match = TAG_PATTERN.exec(source)) {
    tagCount += 1;
    const element = match[1].toLowerCase();
    if (!ALLOWED_ELEMENTS.has(element)) return "";
    if (match[0].startsWith("</")) continue;
    const attributes = match[2];
    let consumed = "";
    ATTRIBUTE_PATTERN.lastIndex = 0;
    let attributeMatch;
    while (attributeMatch = ATTRIBUTE_PATTERN.exec(attributes)) {
      consumed += attributeMatch[0];
      const attribute = attributeMatch[1].toLowerCase();
      const value = attributeMatch[2].slice(1, -1);
      if (!ALLOWED_ATTRIBUTES.has(attribute)) return "";
      if (attribute === "id" && !/^[A-Za-z_][\w:.-]*$/.test(value)) return "";
      if (/url\(/i.test(value) && !/^url\(#[A-Za-z_][\w:.-]*\)$/.test(value)) return "";
    }
    const remainder = attributes.replace(consumed, "").replace(/\//g, "").trim();
    if (remainder) return "";
  }
  TAG_PATTERN.lastIndex = 0;
  if (tagCount === 0 || source.replace(TAG_PATTERN, "").trim()) return "";
  return source;
}

// features/keystone/models/Sportsbook.ts
var list3 = (config2) => (0, import_core3.list)({ ...config2, ui: { hideNavigation: true, hideCreate: true, hideDelete: true, ...config2.ui }, graphql: { ...config2.graphql, maxTake: 100 } });
var requiredText = () => (0, import_fields4.text)({ validation: { isRequired: true } });
var status = (values, defaultValue = values[0]) => (0, import_fields4.select)({ type: "enum", options: values.map((value) => ({ label: value, value })), defaultValue });
var tenant = () => (0, import_fields4.relationship)({ ref: "Tenant", many: false, access: { create: import_access5.denyAll, update: import_access5.denyAll } });
var scopedAccess = (capability) => ({ operation: { query: currentCapability(capability), create: import_access5.denyAll, update: import_access5.denyAll, delete: import_access5.denyAll }, filter: { query: currentTenantScope } });
var tenantAccess = scopedAccess("canManageSportsbook");
var Tenant = list3({ access: { operation: { query: isSignedIn, create: import_access5.denyAll, update: import_access5.denyAll, delete: import_access5.denyAll }, filter: { query: currentTenantItemScope } }, fields: { name: requiredText(), slug: (0, import_fields4.text)({ isIndexed: "unique" }), status: status(["ACTIVE", "SUSPENDED", "CLOSED"]), defaultTimezone: requiredText(), supportedLocales: (0, import_fields4.json)(), dataResidencyRegion: (0, import_fields4.text)(), ...trackingFields } });
var Brand = list3({ access: tenantAccess, fields: { tenant: tenant(), name: requiredText(), domain: requiredText(), defaultLocale: requiredText(), defaultTimezone: (0, import_fields4.text)(), supportedLocales: (0, import_fields4.json)(), designTokens: (0, import_fields4.json)(), termsReference: (0, import_fields4.text)(), logoIcon: (0, import_fields4.text)({ defaultValue: DEFAULT_STORE_LOGO_ICON, hooks: { resolveInput: ({ resolvedData, fieldKey }) => {
  const value = resolvedData[fieldKey];
  if (value === void 0 || value === null || value === "") return value;
  return typeof value === "string" ? sanitizeStoreLogoSvg(value) : "";
}, validate: ({ inputData, resolvedData, fieldKey, addValidationError }) => {
  const submitted = inputData?.[fieldKey];
  if (typeof submitted === "string" && submitted.trim() && !resolvedData?.[fieldKey]) addValidationError("Logo must be a valid, safe SVG document");
} } }), logoColor: (0, import_fields4.text)({ defaultValue: DEFAULT_STORE_LOGO_COLOR, hooks: { resolveInput: ({ resolvedData, fieldKey }) => {
  const value = resolvedData[fieldKey];
  return value === void 0 ? value : normalizeStoreLogoColor(value);
} } }), status: status(["ACTIVE", "INACTIVE"]), ...trackingFields } });
var Jurisdiction = list3({ access: { operation: { query: currentCapability("canManageSportsbook"), create: import_access5.denyAll, update: import_access5.denyAll, delete: import_access5.denyAll } }, fields: { code: (0, import_fields4.text)({ isIndexed: "unique" }), authority: requiredText(), status: status(["PENDING", "ACTIVE", "INACTIVE"]), ...trackingFields } });
var OperatorJurisdiction = list3({ access: tenantAccess, fields: { tenant: tenant(), jurisdiction: (0, import_fields4.relationship)({ ref: "Jurisdiction" }), licenseReference: requiredText(), policyVersion: requiredText(), effectiveFrom: (0, import_fields4.timestamp)(), effectiveTo: (0, import_fields4.timestamp)(), status: status(["PENDING", "ACTIVE", "SUSPENDED"]), ...trackingFields } });
var Player = list3({ access: scopedAccess("canManageCompliance"), fields: { tenant: tenant(), brand: (0, import_fields4.relationship)({ ref: "Brand" }), subject: requiredText(), status: status(["PENDING", "ACTIVE", "SUSPENDED", "CLOSED"]), kycStatus: status(["REQUIRED", "PENDING", "APPROVED", "REJECTED"]), locale: requiredText(), timezone: (0, import_fields4.text)(), preferredOddsFormat: status(["DECIMAL", "AMERICAN", "FRACTIONAL"]), marketingAllowed: (0, import_fields4.checkbox)({ defaultValue: false }), riskBand: status(["LOW", "MEDIUM", "HIGH"]), ...trackingFields } });
var PlayerLimit = list3({ access: scopedAccess("canManageCompliance"), fields: { tenant: tenant(), player: (0, import_fields4.relationship)({ ref: "Player" }), type: status(["DEPOSIT", "STAKE", "LOSS", "SESSION"]), period: status(["DAILY", "WEEKLY", "MONTHLY"]), amountMinor: requiredText(), currency: requiredText(), effectiveFrom: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), effectiveTo: (0, import_fields4.timestamp)(), ...trackingFields } });
var SelfExclusion = list3({ access: scopedAccess("canManageCompliance"), fields: { tenant: tenant(), player: (0, import_fields4.relationship)({ ref: "Player" }), scope: requiredText(), startsAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), endsAt: (0, import_fields4.timestamp)(), status: status(["ACTIVE", "EXPIRED", "REVOKED"]), source: requiredText(), ...trackingFields } });
var Sport = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), key: requiredText(), name: requiredText(), active: (0, import_fields4.checkbox)({ defaultValue: true }), ...trackingFields } });
var Competition = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), sport: (0, import_fields4.relationship)({ ref: "Sport" }), region: (0, import_fields4.relationship)({ ref: "Region" }), key: requiredText(), name: requiredText(), timezone: (0, import_fields4.text)(), status: status(["ACTIVE", "INACTIVE"]), ...trackingFields } });
var Event = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), competition: (0, import_fields4.relationship)({ ref: "Competition" }), season: (0, import_fields4.relationship)({ ref: "Season" }), stage: (0, import_fields4.relationship)({ ref: "CompetitionStage" }), venue: (0, import_fields4.relationship)({ ref: "Venue" }), externalKey: requiredText(), name: requiredText(), startAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), status: status(["SCHEDULED", "LIVE", "ENDED", "CANCELLED", "SUSPENDED"]), livePhase: (0, import_fields4.text)(), clockSeconds: (0, import_fields4.integer)(), officialResultStatus: status(["NONE", "PROVISIONAL", "APPROVED", "DISPUTED"]), version: (0, import_fields4.integer)({ defaultValue: 1 }), ...trackingFields } });
var Market = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), event: (0, import_fields4.relationship)({ ref: "Event" }), definition: (0, import_fields4.relationship)({ ref: "MarketDefinition" }), definitionKey: requiredText(), parameters: (0, import_fields4.json)(), tradingMode: status(["PREMATCH", "LIVE"]), line: (0, import_fields4.text)(), marginBasisPoints: (0, import_fields4.integer)(), cashOutEnabled: (0, import_fields4.checkbox)({ defaultValue: false }), status: status(["OPEN", "SUSPENDED", "CLOSED", "GRADED"]), version: (0, import_fields4.integer)({ defaultValue: 1 }), ...trackingFields } });
var Selection = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), market: (0, import_fields4.relationship)({ ref: "Market" }), key: requiredText(), label: requiredText(), status: status(["OPEN", "SUSPENDED", "CLOSED"]), ...trackingFields } });
var PriceSnapshot = list3({ access: scopedAccess("canTrade"), fields: { tenant: tenant(), selection: (0, import_fields4.relationship)({ ref: "Selection" }), providerConnection: (0, import_fields4.relationship)({ ref: "ProviderConnection" }), decimalOdds: requiredText(), line: (0, import_fields4.text)(), sequence: requiredText(), effectiveAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), receivedAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), rawEnvelope: (0, import_fields4.relationship)({ ref: "RawEnvelope" }), status: status(["OPEN", "SUSPENDED"]), ...trackingFields } });
var Quote = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), player: (0, import_fields4.relationship)({ ref: "Player" }), selection: (0, import_fields4.relationship)({ ref: "Selection" }), priceSnapshot: (0, import_fields4.relationship)({ ref: "PriceSnapshot" }), structure: status(["STRAIGHT", "PARLAY", "SYSTEM", "ROUND_ROBIN", "TEASER", "EACH_WAY"]), promotion: (0, import_fields4.relationship)({ ref: "Promotion" }), legCount: (0, import_fields4.integer)({ defaultValue: 1 }), partCount: (0, import_fields4.integer)({ defaultValue: 1 }), stakeMinor: requiredText(), potentialReturnMinor: (0, import_fields4.text)(), currency: requiredText(), decimalOdds: requiredText(), priceChangeConsent: status(["EXACT", "ACCEPT_BETTER", "ACCEPT_WITHIN_TOLERANCE"]), liveDelayMs: (0, import_fields4.integer)({ defaultValue: 0 }), expiresAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), termsHash: requiredText(), policyVersion: requiredText(), ...trackingFields } });
var Wager = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), player: (0, import_fields4.relationship)({ ref: "Player" }), quote: (0, import_fields4.relationship)({ ref: "Quote" }), legalEntity: (0, import_fields4.relationship)({ ref: "LegalEntity" }), operatorJurisdiction: (0, import_fields4.relationship)({ ref: "OperatorJurisdiction" }), brand: (0, import_fields4.relationship)({ ref: "Brand" }), channel: (0, import_fields4.relationship)({ ref: "OperatorChannel" }), structure: status(["STRAIGHT", "PARLAY", "SYSTEM", "ROUND_ROBIN", "TEASER", "EACH_WAY"]), promotion: (0, import_fields4.relationship)({ ref: "Promotion" }), bonusAward: (0, import_fields4.relationship)({ ref: "BonusAward" }), version: (0, import_fields4.integer)({ defaultValue: 1 }), idempotencyKey: requiredText(), stakeMinor: requiredText(), potentialReturnMinor: requiredText(), maxPayoutMinor: (0, import_fields4.text)(), currency: requiredText(), termsHash: requiredText(), priceChangeConsent: status(["EXACT", "ACCEPT_BETTER", "ACCEPT_WITHIN_TOLERANCE"]), liveDelayMs: (0, import_fields4.integer)({ defaultValue: 0 }), requestedAt: (0, import_fields4.timestamp)(), status: status(["PENDING", "DELAYED", "ACCEPTED", "REJECTED", "OPEN", "PARTIALLY_CASHED_OUT", "CASHED_OUT", "GRADED", "SETTLED", "VOID"]), acceptedAt: (0, import_fields4.timestamp)(), ...trackingFields } });
var WagerLeg = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), wager: (0, import_fields4.relationship)({ ref: "Wager" }), wagerPart: (0, import_fields4.relationship)({ ref: "WagerPart" }), legIndex: (0, import_fields4.integer)(), eventKey: requiredText(), marketKey: requiredText(), selectionKey: requiredText(), snapshotId: requiredText(), decimalOdds: requiredText(), line: (0, import_fields4.text)(), ruleVersion: requiredText(), correlationGroupKey: (0, import_fields4.text)(), live: (0, import_fields4.checkbox)({ defaultValue: false }), ...trackingFields } });
var AcceptanceDecision = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), wager: (0, import_fields4.relationship)({ ref: "Wager" }), quote: (0, import_fields4.relationship)({ ref: "Quote" }), accepted: (0, import_fields4.checkbox)({ defaultValue: false }), rejectionCode: (0, import_fields4.text)(), gateResults: (0, import_fields4.json)(), inputHash: requiredText(), ...trackingFields } });
var ResultVersion = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), event: (0, import_fields4.relationship)({ ref: "Event" }), providerConnection: (0, import_fields4.relationship)({ ref: "ProviderConnection" }), version: (0, import_fields4.integer)({ validation: { isRequired: true } }), status: status(["PENDING", "APPROVED", "REJECTED", "SUPERSEDED"]), payload: (0, import_fields4.json)(), payloadHash: requiredText(), approvedAt: (0, import_fields4.timestamp)(), ...trackingFields } });
var Settlement = list3({ access: scopedAccess("canManageRisk"), fields: { tenant: tenant(), wager: (0, import_fields4.relationship)({ ref: "Wager" }), resultVersion: (0, import_fields4.relationship)({ ref: "ResultVersion" }), settlementRun: (0, import_fields4.relationship)({ ref: "SettlementRun" }), version: (0, import_fields4.integer)({ validation: { isRequired: true } }), outcome: status(["WIN", "LOSS", "PUSH", "VOID", "DEAD_HEAT", "PARTIAL"]), grossPayoutMinor: (0, import_fields4.text)(), taxMinor: (0, import_fields4.text)(), payoutMinor: requiredText(), inputHash: requiredText(), journalTransaction: (0, import_fields4.relationship)({ ref: "JournalTransaction" }), reversalOf: (0, import_fields4.relationship)({ ref: "Settlement" }), ...trackingFields } });
var LedgerAccount = list3({ access: scopedAccess("canManageFinance"), fields: { tenant: tenant(), player: (0, import_fields4.relationship)({ ref: "Player" }), key: requiredText(), accountClass: status(["ASSET", "LIABILITY", "REVENUE", "EXPENSE", "EQUITY"]), currency: requiredText(), status: status(["ACTIVE", "FROZEN", "CLOSED"]), ...trackingFields } });
var JournalTransaction = list3({ access: scopedAccess("canManageFinance"), fields: { tenant: tenant(), type: requiredText(), idempotencyKey: requiredText(), correlationId: requiredText(), status: status(["POSTED", "REVERSED"]), reversalOf: (0, import_fields4.relationship)({ ref: "JournalTransaction" }), effectiveAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), ...trackingFields } });
var JournalEntry = list3({ access: scopedAccess("canManageFinance"), fields: { tenant: tenant(), transaction: (0, import_fields4.relationship)({ ref: "JournalTransaction" }), account: (0, import_fields4.relationship)({ ref: "LedgerAccount" }), side: status(["DEBIT", "CREDIT"]), amountMinor: requiredText(), currency: requiredText(), ...trackingFields } });
var Hold = list3({ access: scopedAccess("canManageFinance"), fields: { tenant: tenant(), account: (0, import_fields4.relationship)({ ref: "LedgerAccount" }), purposeType: requiredText(), purposeId: requiredText(), amountMinor: requiredText(), status: status(["ACTIVE", "CAPTURED", "RELEASED", "EXPIRED"]), expiresAt: (0, import_fields4.timestamp)(), version: (0, import_fields4.integer)({ defaultValue: 1 }), ...trackingFields } });
var ProviderConnection = list3({ access: scopedAccess("canManageIntegrations"), fields: { tenant: tenant(), legalEntity: (0, import_fields4.relationship)({ ref: "LegalEntity" }), jurisdiction: (0, import_fields4.relationship)({ ref: "Jurisdiction" }), adapterId: requiredText(), adapterVersion: requiredText(), configReference: requiredText(), secretReference: (0, import_fields4.text)(), dataResidencyRegion: (0, import_fields4.text)(), failoverPriority: (0, import_fields4.integer)({ defaultValue: 100 }), capabilities: (0, import_fields4.json)(), certificationStatus: status(["SANDBOX", "PENDING", "CERTIFIED", "SUSPENDED"]), status: status(["ACTIVE", "DEGRADED", "DISABLED"]), ...trackingFields } });
var RawEnvelope = list3({ access: scopedAccess("canManageIntegrations"), fields: { tenant: tenant(), providerConnection: (0, import_fields4.relationship)({ ref: "ProviderConnection" }), direction: status(["INBOUND", "OUTBOUND"]), externalId: requiredText(), schemaVersion: requiredText(), installationRevision: (0, import_fields4.text)(), payload: (0, import_fields4.json)(), payloadHash: requiredText(), receivedAt: (0, import_fields4.timestamp)({ validation: { isRequired: true } }), ...trackingFields } });
var InboxMessage = list3({ access: scopedAccess("canManageIntegrations"), fields: { tenant: tenant(), rawEnvelope: (0, import_fields4.relationship)({ ref: "RawEnvelope" }), messageKey: requiredText(), type: requiredText(), status: status(["PENDING", "PROCESSING", "COMPLETED", "DEAD"]), attempts: (0, import_fields4.integer)({ defaultValue: 0 }), availableAt: (0, import_fields4.timestamp)(), leaseUntil: (0, import_fields4.timestamp)(), leaseOwner: (0, import_fields4.text)(), lastError: (0, import_fields4.text)(), ...trackingFields } });
var OutboxMessage = list3({ access: scopedAccess("canManageIntegrations"), fields: { tenant: tenant(), aggregateType: requiredText(), aggregateId: requiredText(), eventType: requiredText(), payload: (0, import_fields4.json)(), status: status(["PENDING", "PROCESSING", "COMPLETED", "DEAD"]), attempts: (0, import_fields4.integer)({ defaultValue: 0 }), maxAttempts: (0, import_fields4.integer)({ defaultValue: 10 }), availableAt: (0, import_fields4.timestamp)(), leaseUntil: (0, import_fields4.timestamp)(), leaseOwner: (0, import_fields4.text)(), lastError: (0, import_fields4.text)(), ...trackingFields } });
var DeadLetter = list3({ access: scopedAccess("canManageIntegrations"), fields: { tenant: tenant(), sourceType: requiredText(), sourceId: requiredText(), reason: requiredText(), attempts: (0, import_fields4.integer)(), payloadReference: (0, import_fields4.text)(), resolvedAt: (0, import_fields4.timestamp)(), ...trackingFields } });
var AuditEvent = list3({ access: scopedAccess("canReadAudit"), fields: { tenant: tenant(), actorId: requiredText(), action: requiredText(), targetType: requiredText(), targetId: requiredText(), reason: (0, import_fields4.text)(), payloadHash: requiredText(), previousHash: (0, import_fields4.text)(), hash: requiredText(), ...trackingFields } });

// features/keystone/models/SportsbookP0.ts
var SportsbookP0_exports = {};
__export(SportsbookP0_exports, {
  AMLCase: () => AMLCase,
  AccountRestriction: () => AccountRestriction,
  ApiRateBucket: () => ApiRateBucket,
  ApprovalRequest: () => ApprovalRequest,
  AuditAnchor: () => AuditAnchor,
  BalanceProjection: () => BalanceProjection,
  BetSlip: () => BetSlip,
  BetSlipItem: () => BetSlipItem,
  CashOutOffer: () => CashOutOffer,
  Competitor: () => Competitor,
  ComplianceReport: () => ComplianceReport,
  ConfigValue: () => ConfigValue,
  Consent: () => Consent,
  DataCorrectionCase: () => DataCorrectionCase,
  Dispute: () => Dispute,
  DisputeEvent: () => DisputeEvent,
  EventParticipant: () => EventParticipant,
  ExposurePosition: () => ExposurePosition,
  GeoCheck: () => GeoCheck,
  GeoSession: () => GeoSession,
  Incident: () => Incident,
  LegGrade: () => LegGrade,
  LegalHold: () => LegalHold,
  LimitProfile: () => LimitProfile,
  LimitRule: () => LimitRule,
  MarketGrade: () => MarketGrade,
  OnboardingProgress: () => OnboardingProgress,
  PaymentAttempt: () => PaymentAttempt,
  PaymentIntent: () => PaymentIntent,
  PlayerIdentity: () => PlayerIdentity,
  ProviderEntityMapping: () => ProviderEntityMapping,
  ReconciliationItem: () => ReconciliationItem,
  ReconciliationRun: () => ReconciliationRun,
  ResettlementCase: () => ResettlementCase,
  RoleGrant: () => RoleGrant,
  TaxAssessment: () => TaxAssessment,
  Team: () => Team,
  TradingStatusChange: () => TradingStatusChange,
  VerificationCase: () => VerificationCase,
  VerificationCheck: () => VerificationCheck,
  WagerStatusEvent: () => WagerStatusEvent,
  WebhookReplay: () => WebhookReplay
});
var import_core4 = require("@keystone-6/core");
var import_access7 = require("@keystone-6/core/access");
var import_fields5 = require("@keystone-6/core/fields");
var list4 = (config2) => (0, import_core4.list)({ ...config2, ui: { hideNavigation: true, hideCreate: true, hideDelete: true, ...config2.ui }, graphql: { ...config2.graphql, maxTake: 100 } });
var t = () => (0, import_fields5.text)({ validation: { isRequired: true } });
var rel = (ref) => (0, import_fields5.relationship)({ ref });
var tenant2 = () => (0, import_fields5.relationship)({ ref: "Tenant", access: { create: import_access7.denyAll, update: import_access7.denyAll } });
var st = (v) => (0, import_fields5.select)({ type: "enum", options: v.map((value) => ({ label: value, value })), defaultValue: v[0] });
var scopedAccess2 = (capability) => ({ operation: { query: currentCapability(capability), create: import_access7.denyAll, update: import_access7.denyAll, delete: import_access7.denyAll }, filter: { query: currentTenantScope } });
var immutable = scopedAccess2("canManageSportsbook");
var f = (fields, access = immutable) => list4({ access, fields: { tenant: tenant2(), ...fields, ...trackingFields } });
var Team = f({ name: t(), status: st(["ACTIVE", "INACTIVE"]), members: (0, import_fields5.relationship)({ ref: "User", many: true }) }, scopedAccess2("canManageRoles"));
var RoleGrant = f({ user: rel("User"), role: rel("Role"), team: rel("Team"), scope: (0, import_fields5.json)(), effectiveFrom: (0, import_fields5.timestamp)(), effectiveTo: (0, import_fields5.timestamp)(), status: st(["ACTIVE", "REVOKED"]) }, scopedAccess2("canManageRoles"));
var ApprovalRequest = f({ action: t(), payloadHash: t(), requesterId: t(), approverId: (0, import_fields5.text)(), status: st(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]), reason: (0, import_fields5.text)(), decidedAt: (0, import_fields5.timestamp)(), requestPayload: (0, import_fields5.json)(), expiresAt: (0, import_fields5.timestamp)(), consumedAt: (0, import_fields5.timestamp)(), consumedById: (0, import_fields5.text)(), consumedKey: (0, import_fields5.text)() }, scopedAccess2("canManageRoles"));
var ConfigValue = f({ key: t(), value: (0, import_fields5.json)(), valueType: t(), scopeType: t(), scopeId: (0, import_fields5.text)(), policyVersion: t(), effectiveFrom: (0, import_fields5.timestamp)(), effectiveTo: (0, import_fields5.timestamp)() }, scopedAccess2("canManageSportsbook"));
var PlayerIdentity = f({ player: rel("Player"), encryptedPayload: t(), tokenizedIdentifiers: (0, import_fields5.json)(), encryptionKeyRef: t(), classification: st(["RESTRICTED_PII"]) }, scopedAccess2("canManageCompliance"));
var VerificationCase = f({ player: rel("Player"), providerConnection: rel("ProviderConnection"), type: st(["KYC", "AGE", "ADDRESS"]), status: st(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]), evidenceReference: (0, import_fields5.text)(), expiresAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageCompliance"));
var VerificationCheck = f({ verificationCase: rel("VerificationCase"), attempt: (0, import_fields5.integer)(), decision: st(["PENDING", "PASS", "FAIL", "REVIEW"]), reasonCode: (0, import_fields5.text)(), rawEnvelope: rel("RawEnvelope") }, scopedAccess2("canManageCompliance"));
var AMLCase = f({ player: rel("Player"), status: st(["OPEN", "REVIEW", "CLOSED"]), riskBand: st(["LOW", "MEDIUM", "HIGH"]), restrictedEvidence: (0, import_fields5.json)(), ownerId: (0, import_fields5.text)() }, scopedAccess2("canManageCompliance"));
var GeoSession = f({ player: rel("Player"), sessionKey: t(), status: st(["ACTIVE", "EXPIRED", "REVOKED"]), expiresAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageCompliance"));
var GeoCheck = f({ geoSession: rel("GeoSession"), providerConnection: rel("ProviderConnection"), decision: st(["ALLOW", "DENY", "UNKNOWN"]), reasonCode: (0, import_fields5.text)(), coarseEvidence: (0, import_fields5.json)(), checkedAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageCompliance"));
var AccountRestriction = f({ player: rel("Player"), capability: t(), reasonCode: t(), startsAt: (0, import_fields5.timestamp)(), endsAt: (0, import_fields5.timestamp)(), status: st(["ACTIVE", "EXPIRED", "REVOKED"]) }, scopedAccess2("canManageCompliance"));
var Consent = f({ player: rel("Player"), type: t(), policyVersion: t(), givenAt: (0, import_fields5.timestamp)(), withdrawnAt: (0, import_fields5.timestamp)(), evidenceHash: t() }, scopedAccess2("canManageCompliance"));
var Competitor = f({ key: t(), name: t(), status: st(["ACTIVE", "INACTIVE"]) }, scopedAccess2("canTrade"));
var EventParticipant = f({ event: rel("Event"), competitor: rel("Competitor"), role: t(), sortOrder: (0, import_fields5.integer)() }, scopedAccess2("canTrade"));
var ProviderEntityMapping = f({ providerConnection: rel("ProviderConnection"), entityType: t(), externalId: t(), canonicalType: t(), canonicalId: t(), confidence: (0, import_fields5.text)(), status: st(["PENDING", "APPROVED", "REJECTED"]) }, scopedAccess2("canTrade"));
var TradingStatusChange = f({ scopeType: t(), scopeId: t(), fromStatus: t(), toStatus: t(), reason: t(), source: t(), actorId: (0, import_fields5.text)(), effectiveAt: (0, import_fields5.timestamp)() }, scopedAccess2("canTrade"));
var LimitProfile = f({ name: t(), version: (0, import_fields5.integer)(), status: st(["DRAFT", "ACTIVE", "RETIRED"]), effectiveFrom: (0, import_fields5.timestamp)(), effectiveTo: (0, import_fields5.timestamp)() }, scopedAccess2("canManageRisk"));
var LimitRule = f({ profile: rel("LimitProfile"), scopeType: t(), scopeId: (0, import_fields5.text)(), maxStakeMinor: (0, import_fields5.text)(), maxPayoutMinor: (0, import_fields5.text)(), maxLiabilityMinor: (0, import_fields5.text)(), currency: t(), priority: (0, import_fields5.integer)() }, scopedAccess2("canManageRisk"));
var ExposurePosition = f({ scopeType: t(), scopeId: t(), currency: t(), stakeMinor: t(), liabilityMinor: t(), version: (0, import_fields5.integer)(), asOf: (0, import_fields5.timestamp)() }, scopedAccess2("canManageRisk"));
var BetSlip = f({ player: rel("Player"), currency: t(), status: st(["OPEN", "QUOTED", "EXPIRED", "ACCEPTED"]), expiresAt: (0, import_fields5.timestamp)(), version: (0, import_fields5.integer)() }, scopedAccess2("canManageRisk"));
var BetSlipItem = f({ betSlip: rel("BetSlip"), selection: rel("Selection"), priceSnapshot: rel("PriceSnapshot"), requestedOdds: t(), line: (0, import_fields5.text)() }, scopedAccess2("canManageRisk"));
var WagerStatusEvent = f({ wager: rel("Wager"), fromStatus: (0, import_fields5.text)(), toStatus: t(), reasonCode: t(), actorId: (0, import_fields5.text)(), effectiveAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageRisk"));
var MarketGrade = f({ market: rel("Market"), resultVersion: rel("ResultVersion"), ruleVersion: t(), outcome: t(), factorNumerator: (0, import_fields5.text)(), factorDenominator: (0, import_fields5.text)(), trace: (0, import_fields5.json)(), inputHash: t() }, scopedAccess2("canManageRisk"));
var LegGrade = f({ wagerLeg: rel("WagerLeg"), marketGrade: rel("MarketGrade"), outcome: t(), factorNumerator: (0, import_fields5.text)(), factorDenominator: (0, import_fields5.text)(), inputHash: t() }, scopedAccess2("canManageRisk"));
var ResettlementCase = f({ wager: rel("Wager"), oldSettlement: rel("Settlement"), newResultVersion: rel("ResultVersion"), reason: t(), approvalRequest: rel("ApprovalRequest"), status: st(["PENDING", "APPROVED", "COMPLETED", "REJECTED"]) }, scopedAccess2("canManageRisk"));
var CashOutOffer = f({ wager: rel("Wager"), amountMinor: t(), currency: t(), portionNumerator: t(), portionDenominator: t(), feeMinor: (0, import_fields5.text)(), marginBasisPoints: (0, import_fields5.integer)(), valuationInputs: (0, import_fields5.json)(), valuationHash: t(), wagerVersion: (0, import_fields5.integer)(), offeredAt: (0, import_fields5.timestamp)(), expiresAt: (0, import_fields5.timestamp)(), status: st(["OPEN", "ACCEPTED", "EXPIRED", "WITHDRAWN"]) }, scopedAccess2("canManageRisk"));
var Dispute = f({ player: rel("Player"), wager: rel("Wager"), category: t(), status: st(["OPEN", "TRIAGED", "INVESTIGATING", "PROPOSED_RESOLUTION", "RESOLVED", "REJECTED", "APPEALED"]), evidence: (0, import_fields5.json)(), resolution: (0, import_fields5.text)(), approvalRequest: rel("ApprovalRequest"), resolvedAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageRisk"));
var DisputeEvent = f({ dispute: rel("Dispute"), type: t(), actorId: t(), evidenceHash: t(), details: (0, import_fields5.json)() }, scopedAccess2("canManageRisk"));
var BalanceProjection = f({ account: rel("LedgerAccount"), postedMinor: t(), pendingMinor: t(), availableMinor: t(), version: (0, import_fields5.integer)(), asOf: (0, import_fields5.timestamp)() }, scopedAccess2("canManageFinance"));
var PaymentIntent = f({ player: rel("Player"), type: st(["DEPOSIT", "WITHDRAWAL", "REFUND", "CHARGEBACK", "ADJUSTMENT"]), amountMinor: t(), feeMinor: (0, import_fields5.text)(), currency: t(), idempotencyKey: t(), status: st(["PENDING", "REVIEW", "PROCESSING", "SUCCEEDED", "FAILED", "UNKNOWN", "CANCELLED"]), providerConnection: rel("ProviderConnection"), paymentMethodReference: (0, import_fields5.text)(), providerSessionReference: (0, import_fields5.text)(), hold: rel("Hold"), riskEvidence: (0, import_fields5.json)(), completedAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageFinance"));
var PaymentAttempt = f({ paymentIntent: rel("PaymentIntent"), attempt: (0, import_fields5.integer)(), externalReference: (0, import_fields5.text)(), status: st(["PENDING", "SUCCEEDED", "FAILED", "UNKNOWN"]), rawEnvelope: rel("RawEnvelope"), reasonCode: (0, import_fields5.text)() }, scopedAccess2("canManageFinance"));
var ReconciliationRun = f({ type: t(), windowFrom: (0, import_fields5.timestamp)(), windowTo: (0, import_fields5.timestamp)(), status: st(["PENDING", "RUNNING", "COMPLETED", "FAILED"]), inputHash: t(), differenceMinor: (0, import_fields5.text)() }, scopedAccess2("canManageFinance"));
var ReconciliationItem = f({ run: rel("ReconciliationRun"), internalReference: t(), providerReference: (0, import_fields5.text)(), differenceMinor: t(), currency: t(), status: st(["MATCHED", "OPEN", "RESOLVED"]), resolutionJournal: rel("JournalTransaction") }, scopedAccess2("canManageFinance"));
var TaxAssessment = f({ wager: rel("Wager"), ruleVersion: t(), basisMinor: t(), amountMinor: t(), currency: t(), status: st(["CALCULATED", "POSTED", "REVERSED"]) }, scopedAccess2("canManageFinance"));
var Incident = f({ severity: st(["SEV1", "SEV2", "SEV3", "SEV4"]), title: t(), status: st(["OPEN", "MITIGATING", "RESOLVED"]), commanderId: (0, import_fields5.text)(), evidence: (0, import_fields5.json)(), resolvedAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageIntegrations"));
var ComplianceReport = f({ type: t(), periodStart: (0, import_fields5.timestamp)(), periodEnd: (0, import_fields5.timestamp)(), version: (0, import_fields5.integer)(), artifactHash: t(), artifactReference: t(), status: st(["DRAFT", "APPROVED", "SUBMITTED"]), submittedAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageCompliance"));
var LegalHold = f({ scopeType: t(), scopeId: t(), reason: t(), startsAt: (0, import_fields5.timestamp)(), endsAt: (0, import_fields5.timestamp)(), status: st(["ACTIVE", "RELEASED"]), approvalRequest: rel("ApprovalRequest") }, scopedAccess2("canManageCompliance"));
var DataCorrectionCase = f({ scopeType: t(), scopeId: t(), reason: t(), dryRunHash: t(), approvalRequest: rel("ApprovalRequest"), status: st(["PENDING", "APPROVED", "APPLIED", "REJECTED"]) }, scopedAccess2("canManageRisk"));
var ApiRateBucket = f({ keyHash: t(), scope: t(), windowStartedAt: (0, import_fields5.timestamp)(), count: (0, import_fields5.integer)({ defaultValue: 0 }), expiresAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageIntegrations"));
var WebhookReplay = f({ providerConnection: rel("ProviderConnection"), messageHash: t(), occurredAt: (0, import_fields5.timestamp)(), expiresAt: (0, import_fields5.timestamp)() }, scopedAccess2("canManageIntegrations"));
var AuditAnchor = f({ chainHeadHash: t(), eventCount: (0, import_fields5.integer)(), anchoredAt: (0, import_fields5.timestamp)(), externalReference: t(), status: st(["PENDING", "ANCHORED", "FAILED"]) }, scopedAccess2("canReadAudit"));
var OnboardingProgress = f({ stage: t(), status: st(["PENDING", "COMPLETE", "BLOCKED"]), evidenceHash: t(), completedAt: (0, import_fields5.timestamp)(), details: (0, import_fields5.json)() }, scopedAccess2("canManageSportsbook"));

// features/keystone/models/Customer.ts
var Customer_exports = {};
__export(Customer_exports, {
  CustomerCommand: () => CustomerCommand,
  CustomerQuoteLegTerms: () => CustomerQuoteLegTerms,
  CustomerQuoteTerms: () => CustomerQuoteTerms,
  CustomerSession: () => CustomerSession
});
var import_core5 = require("@keystone-6/core");
var import_access9 = require("@keystone-6/core/access");
var import_fields6 = require("@keystone-6/core/fields");
var list5 = (config2) => (0, import_core5.list)({ ...config2, ui: { hideNavigation: true, hideCreate: true, hideDelete: true, ...config2.ui }, graphql: { ...config2.graphql, maxTake: 100 } });
var internalAccess = {
  operation: {
    query: import_access9.denyAll,
    create: import_access9.denyAll,
    update: import_access9.denyAll,
    delete: import_access9.denyAll
  }
};
var requiredText2 = (isIndexed) => (0, import_fields6.text)({
  validation: { isRequired: true },
  ...isIndexed ? { isIndexed } : {}
});
var internalList = (fields, graphql5 = {}) => list5({
  access: internalAccess,
  graphql: { omit: true, ...graphql5 },
  ui: { hideNavigation: true, hideCreate: true, hideDelete: true },
  fields: {
    ...fields,
    ...trackingFields
  }
});
var CustomerSession = internalList({
  tenant: (0, import_fields6.relationship)({ ref: "Tenant" }),
  player: (0, import_fields6.relationship)({ ref: "Player" }),
  tokenDigest: requiredText2("unique"),
  expiresAt: (0, import_fields6.timestamp)({ validation: { isRequired: true } }),
  assuranceLevel: (0, import_fields6.select)({ type: "enum", options: ["GUEST", "PASSWORD", "MFA"].map((value) => ({ label: value, value })), defaultValue: "GUEST" }),
  deviceDigest: (0, import_fields6.text)(),
  lastSeenAt: (0, import_fields6.timestamp)(),
  revokedAt: (0, import_fields6.timestamp)()
});
var CustomerCommand = internalList({
  tenant: (0, import_fields6.relationship)({ ref: "Tenant" }),
  player: (0, import_fields6.relationship)({ ref: "Player" }),
  commandKey: requiredText2("unique"),
  idempotencyKey: requiredText2(),
  type: (0, import_fields6.select)({
    type: "enum",
    options: ["WAGER", "FUND", "LIMIT", "EXCLUSION", "AUTH", "CASH_OUT", "PROMOTION", "DISPUTE", "PROFILE", "PRIVACY"].map((value) => ({ label: value, value })),
    defaultValue: "WAGER"
  }),
  requestHash: requiredText2(),
  status: (0, import_fields6.select)({
    type: "enum",
    options: ["IN_PROGRESS", "SUCCEEDED", "REJECTED"].map((value) => ({ label: value, value })),
    defaultValue: "IN_PROGRESS"
  }),
  result: (0, import_fields6.json)()
});
var CustomerQuoteTerms = internalList({
  tenant: (0, import_fields6.relationship)({ ref: "Tenant" }),
  player: (0, import_fields6.relationship)({ ref: "Player" }),
  quote: (0, import_fields6.relationship)({ ref: "Quote" }),
  quoteKey: requiredText2("unique"),
  structure: (0, import_fields6.select)({ type: "enum", options: ["STRAIGHT", "PARLAY", "SYSTEM", "ROUND_ROBIN", "TEASER", "EACH_WAY"].map((value) => ({ label: value, value })), defaultValue: "STRAIGHT" }),
  legCount: (0, import_fields6.text)({ validation: { isRequired: true }, defaultValue: "1" }),
  partCount: (0, import_fields6.text)({ validation: { isRequired: true }, defaultValue: "1" }),
  partPlan: (0, import_fields6.json)(),
  priceChangeConsent: (0, import_fields6.text)({ defaultValue: "EXACT" }),
  liveDelayMs: (0, import_fields6.text)({ defaultValue: "0" }),
  bonusEconomics: (0, import_fields6.json)(),
  eventId: requiredText2(),
  marketId: requiredText2(),
  selectionId: requiredText2(),
  priceSnapshotId: requiredText2(),
  eventName: requiredText2(),
  marketName: requiredText2(),
  selectionName: requiredText2(),
  decimalOdds: requiredText2(),
  stakeMinor: requiredText2(),
  potentialReturnMinor: requiredText2(),
  currency: requiredText2(),
  termsHash: requiredText2(),
  expiresAt: (0, import_fields6.timestamp)({ validation: { isRequired: true } })
}, { plural: "CustomerQuoteTermRecords" });
var CustomerQuoteLegTerms = internalList({
  tenant: (0, import_fields6.relationship)({ ref: "Tenant" }),
  player: (0, import_fields6.relationship)({ ref: "Player" }),
  quote: (0, import_fields6.relationship)({ ref: "Quote" }),
  quoteKey: requiredText2(),
  legIndex: (0, import_fields6.text)({ validation: { isRequired: true } }),
  eventId: requiredText2(),
  marketId: requiredText2(),
  selectionId: requiredText2(),
  priceSnapshotId: requiredText2(),
  eventName: requiredText2(),
  marketName: requiredText2(),
  selectionName: requiredText2(),
  decimalOdds: requiredText2(),
  line: (0, import_fields6.text)(),
  live: (0, import_fields6.select)({ type: "enum", options: ["PREMATCH", "LIVE"].map((value) => ({ label: value, value })), defaultValue: "PREMATCH" }),
  correlationGroupKey: (0, import_fields6.text)(),
  ruleVersion: requiredText2(),
  evidenceHash: requiredText2()
}, { plural: "CustomerQuoteLegTermRecords" });

// features/keystone/models/SportsbookFull.ts
var SportsbookFull_exports = {};
__export(SportsbookFull_exports, {
  AccessReview: () => AccessReview,
  AccountClosure: () => AccountClosure,
  AdapterCertificationRun: () => AdapterCertificationRun,
  AffiliateAttribution: () => AffiliateAttribution,
  AffordabilityAssessment: () => AffordabilityAssessment,
  BonusAward: () => BonusAward,
  BonusTransaction: () => BonusTransaction,
  BrandLocale: () => BrandLocale,
  CampaignBudget: () => CampaignBudget,
  CashOutAcceptance: () => CashOutAcceptance,
  CompetitionStage: () => CompetitionStage,
  ConfigDefinition: () => ConfigDefinition,
  CorrelationGroup: () => CorrelationGroup,
  CorrelationRule: () => CorrelationRule,
  CurrencyDefinition: () => CurrencyDefinition,
  CustomerCredential: () => CustomerCredential,
  CustomerDevice: () => CustomerDevice,
  CustomerFavorite: () => CustomerFavorite,
  CustomerPrivacyRequest: () => CustomerPrivacyRequest,
  CustomerRecoveryToken: () => CustomerRecoveryToken,
  DataExport: () => DataExport,
  EventScheduleChange: () => EventScheduleChange,
  FeatureFlag: () => FeatureFlag,
  FeedHealthSnapshot: () => FeedHealthSnapshot,
  HouseRuleVersion: () => HouseRuleVersion,
  IntegrationDeliveryAttempt: () => IntegrationDeliveryAttempt,
  IntegrityCase: () => IntegrityCase,
  JurisdictionPolicyVersion: () => JurisdictionPolicyVersion,
  LedgerAdjustmentRequest: () => LedgerAdjustmentRequest,
  LegalEntity: () => LegalEntity,
  MarketDefinition: () => MarketDefinition,
  Notification: () => Notification,
  OperatorChannel: () => OperatorChannel,
  PamSubjectMapping: () => PamSubjectMapping,
  PlayerStatement: () => PlayerStatement,
  Promotion: () => Promotion,
  PromotionRedemption: () => PromotionRedemption,
  PromotionRuleVersion: () => PromotionRuleVersion,
  ProviderHealthSample: () => ProviderHealthSample,
  Region: () => Region,
  ReportArtifact: () => ReportArtifact,
  RetentionExecution: () => RetentionExecution,
  RetentionPolicyVersion: () => RetentionPolicyVersion,
  SafeguardingAccount: () => SafeguardingAccount,
  SafeguardingReconciliation: () => SafeguardingReconciliation,
  ScheduledJob: () => ScheduledJob,
  ScreeningHit: () => ScreeningHit,
  Season: () => Season,
  SettlementLine: () => SettlementLine,
  SettlementRun: () => SettlementRun,
  SupportCase: () => SupportCase,
  SupportCaseEvent: () => SupportCaseEvent,
  TaxRuleVersion: () => TaxRuleVersion,
  TenantCurrency: () => TenantCurrency,
  TraderOverride: () => TraderOverride,
  TradingReplayRun: () => TradingReplayRun,
  Venue: () => Venue,
  WagerExposureAllocation: () => WagerExposureAllocation,
  WagerPart: () => WagerPart,
  WebhookDelivery: () => WebhookDelivery,
  WebhookEndpoint: () => WebhookEndpoint,
  WorkerHeartbeat: () => WorkerHeartbeat
});
var import_core6 = require("@keystone-6/core");
var import_access10 = require("@keystone-6/core/access");
var import_fields7 = require("@keystone-6/core/fields");
var list6 = (config2) => (0, import_core6.list)({ ...config2, ui: { hideNavigation: true, hideCreate: true, hideDelete: true, ...config2.ui }, graphql: { ...config2.graphql, maxTake: 100 } });
var requiredText3 = () => (0, import_fields7.text)({ validation: { isRequired: true } });
var optionalText = () => (0, import_fields7.text)();
var requiredTime = () => (0, import_fields7.timestamp)({ validation: { isRequired: true } });
var relation = (ref) => (0, import_fields7.relationship)({ ref, many: false, validation: { isRequired: true } });
var optionalRelation = (ref) => (0, import_fields7.relationship)({ ref, many: false });
var tenant3 = () => (0, import_fields7.relationship)({ ref: "Tenant", many: false, validation: { isRequired: true }, access: { create: import_access10.denyAll, update: import_access10.denyAll } });
var status2 = (values, defaultValue = values[0]) => (0, import_fields7.select)({ type: "enum", options: values.map((value) => ({ label: value, value })), defaultValue });
var scopedAccess3 = (capability) => ({ operation: { query: currentCapability(capability), create: import_access10.denyAll, update: import_access10.denyAll, delete: import_access10.denyAll }, filter: { query: currentTenantScope } });
var scoped = (capability, fields) => list6({ access: scopedAccess3(capability), fields: { tenant: tenant3(), ...fields, ...trackingFields } });
var internal = (fields) => list6({ access: { operation: { query: import_access10.denyAll, create: import_access10.denyAll, update: import_access10.denyAll, delete: import_access10.denyAll } }, graphql: { omit: true }, ui: { isHidden: true }, fields: { ...fields, ...trackingFields } });
var LegalEntity = scoped("canManageSportsbook", {
  name: requiredText3(),
  countryCode: requiredText3(),
  registrationReference: requiredText3(),
  status: status2(["PENDING", "ACTIVE", "SUSPENDED", "CLOSED"])
});
var CurrencyDefinition = list6({
  access: { operation: { query: currentCapability("canManageSportsbook"), create: import_access10.denyAll, update: import_access10.denyAll, delete: import_access10.denyAll } },
  fields: { code: (0, import_fields7.text)({ validation: { isRequired: true }, isIndexed: "unique" }), exponent: (0, import_fields7.integer)({ validation: { isRequired: true } }), name: requiredText3(), status: status2(["ACTIVE", "INACTIVE"]), ...trackingFields }
});
var TenantCurrency = scoped("canManageSportsbook", {
  currency: relation("CurrencyDefinition"),
  depositsEnabled: (0, import_fields7.checkbox)({ defaultValue: false }),
  withdrawalsEnabled: (0, import_fields7.checkbox)({ defaultValue: false }),
  wageringEnabled: (0, import_fields7.checkbox)({ defaultValue: false }),
  defaultForBrand: (0, import_fields7.checkbox)({ defaultValue: false }),
  status: status2(["PENDING", "ACTIVE", "SUSPENDED"])
});
var JurisdictionPolicyVersion = scoped("canManageSportsbook", {
  jurisdiction: relation("Jurisdiction"),
  version: (0, import_fields7.integer)({ validation: { isRequired: true } }),
  authorityCitation: requiredText3(),
  policyDocument: (0, import_fields7.json)(),
  effectiveFrom: requiredTime(),
  effectiveTo: (0, import_fields7.timestamp)(),
  status: status2(["DRAFT", "APPROVED", "ACTIVE", "RETIRED"]),
  approvedBy: optionalText(),
  approvedAt: (0, import_fields7.timestamp)(),
  evidenceHash: requiredText3()
});
var HouseRuleVersion = scoped("canManageSportsbook", {
  name: requiredText3(),
  version: (0, import_fields7.integer)({ validation: { isRequired: true } }),
  sportKey: optionalText(),
  marketDefinitionKey: optionalText(),
  rules: (0, import_fields7.json)(),
  semanticHash: requiredText3(),
  effectiveFrom: requiredTime(),
  effectiveTo: (0, import_fields7.timestamp)(),
  status: status2(["DRAFT", "APPROVED", "ACTIVE", "RETIRED"]),
  approvalRequest: optionalRelation("ApprovalRequest")
});
var FeatureFlag = scoped("canManageSportsbook", {
  key: requiredText3(),
  description: requiredText3(),
  enabled: (0, import_fields7.checkbox)({ defaultValue: false }),
  scopeType: status2(["TENANT", "BRAND", "JURISDICTION", "CHANNEL"]),
  scopeId: requiredText3(),
  safeDefault: (0, import_fields7.checkbox)({ defaultValue: false }),
  ownerId: requiredText3(),
  expiresAt: (0, import_fields7.timestamp)(),
  approvalRequest: optionalRelation("ApprovalRequest")
});
var ConfigDefinition = scoped("canManageSportsbook", {
  key: requiredText3(),
  valueType: status2(["STRING", "INTEGER", "MONEY", "BOOLEAN", "JSON"]),
  mergeStrategy: status2(["REPLACE", "MIN", "MAX", "UNION", "DENY_WINS"]),
  allowedScopes: (0, import_fields7.json)(),
  validationSchema: (0, import_fields7.json)(),
  secret: (0, import_fields7.checkbox)({ defaultValue: false }),
  description: requiredText3()
});
var BrandLocale = scoped("canManageSportsbook", {
  brand: relation("Brand"),
  locale: requiredText3(),
  language: requiredText3(),
  timezone: requiredText3(),
  termsVersion: requiredText3(),
  termsContentHash: requiredText3(),
  default: (0, import_fields7.checkbox)({ defaultValue: false }),
  status: status2(["DRAFT", "ACTIVE", "RETIRED"])
});
var OperatorChannel = scoped("canManageSportsbook", {
  legalEntity: relation("LegalEntity"),
  operatorJurisdiction: relation("OperatorJurisdiction"),
  brand: relation("Brand"),
  key: requiredText3(),
  type: status2(["WEB", "MOBILE_WEB", "NATIVE", "RETAIL", "PAM"]),
  status: status2(["PENDING", "ACTIVE", "SUSPENDED"]),
  capabilities: (0, import_fields7.json)()
});
var AccessReview = scoped("canManageRoles", {
  scopeType: requiredText3(),
  scopeId: requiredText3(),
  status: status2(["OPEN", "IN_REVIEW", "APPROVED", "REMEDIATION", "CLOSED"]),
  openedBy: requiredText3(),
  reviewerId: optionalText(),
  findings: (0, import_fields7.json)(),
  dueAt: requiredTime(),
  completedAt: (0, import_fields7.timestamp)()
});
var Region = scoped("canTrade", { key: requiredText3(), name: requiredText3(), countryCodes: (0, import_fields7.json)(), status: status2(["ACTIVE", "INACTIVE"]) });
var Season = scoped("canTrade", { competition: relation("Competition"), key: requiredText3(), name: requiredText3(), startsAt: requiredTime(), endsAt: requiredTime(), status: status2(["SCHEDULED", "ACTIVE", "COMPLETE", "CANCELLED"]) });
var CompetitionStage = scoped("canTrade", { season: relation("Season"), key: requiredText3(), name: requiredText3(), sortOrder: (0, import_fields7.integer)({ validation: { isRequired: true } }), status: status2(["SCHEDULED", "ACTIVE", "COMPLETE"]) });
var Venue = scoped("canTrade", { key: requiredText3(), name: requiredText3(), countryCode: requiredText3(), timezone: requiredText3(), address: (0, import_fields7.json)(), status: status2(["ACTIVE", "INACTIVE"]) });
var MarketDefinition = scoped("canTrade", { key: requiredText3(), name: requiredText3(), sportKey: requiredText3(), parametersSchema: (0, import_fields7.json)(), gradingRuleFamily: requiredText3(), allowedPhases: (0, import_fields7.json)(), status: status2(["DRAFT", "ACTIVE", "RETIRED"]), version: (0, import_fields7.integer)({ validation: { isRequired: true } }) });
var EventScheduleChange = scoped("canTrade", { event: relation("Event"), fromStartAt: requiredTime(), toStartAt: requiredTime(), reasonCode: requiredText3(), source: requiredText3(), actorId: requiredText3(), evidenceHash: requiredText3() });
var FeedHealthSnapshot = scoped("canManageIntegrations", { providerConnection: relation("ProviderConnection"), scopeType: requiredText3(), scopeId: requiredText3(), status: status2(["HEALTHY", "DEGRADED", "STALE", "GAPPED", "DOWN"]), heartbeatAt: (0, import_fields7.timestamp)(), lagMs: (0, import_fields7.integer)(), lastSequence: optionalText(), gapFrom: optionalText(), gapTo: optionalText(), checkedAt: requiredTime(), actionTaken: optionalText() });
var CorrelationGroup = scoped("canManageRisk", { key: requiredText3(), name: requiredText3(), sportKey: requiredText3(), status: status2(["DRAFT", "ACTIVE", "RETIRED"]), version: (0, import_fields7.integer)({ validation: { isRequired: true } }) });
var CorrelationRule = scoped("canManageRisk", { group: relation("CorrelationGroup"), leftPattern: (0, import_fields7.json)(), rightPattern: (0, import_fields7.json)(), decision: status2(["ALLOW", "DENY", "PROVIDER_PRICE_REQUIRED"]), reasonCode: requiredText3(), priority: (0, import_fields7.integer)({ validation: { isRequired: true } }) });
var TraderOverride = scoped("canTrade", { targetType: requiredText3(), targetId: requiredText3(), overrideType: status2(["PRICE", "LINE", "STATUS", "MAX_STAKE", "MAX_PAYOUT", "MAX_LIABILITY", "CASH_OUT"]), value: (0, import_fields7.json)(), reasonCode: requiredText3(), startsAt: requiredTime(), expiresAt: requiredTime(), status: status2(["PENDING", "ACTIVE", "EXPIRED", "REVOKED"]), requesterId: requiredText3(), approvalRequest: optionalRelation("ApprovalRequest") });
var TradingReplayRun = scoped("canManageIntegrations", { providerConnection: relation("ProviderConnection"), scopeType: requiredText3(), scopeId: requiredText3(), frontier: requiredText3(), adapterVersion: requiredText3(), normalizerVersion: requiredText3(), ruleVersion: requiredText3(), inputHash: requiredText3(), outputHash: optionalText(), comparison: (0, import_fields7.json)(), dryRun: (0, import_fields7.checkbox)({ defaultValue: true }), status: status2(["PENDING", "RUNNING", "MATCHED", "DIFFERENT", "FAILED"]), completedAt: (0, import_fields7.timestamp)() });
var WagerExposureAllocation = scoped("canManageRisk", { wager: relation("Wager"), market: relation("Market"), stakeMinor: requiredText3(), liabilityMinor: requiredText3(), remainingStakeMinor: requiredText3(), remainingLiabilityMinor: requiredText3(), version: (0, import_fields7.integer)({ validation: { isRequired: true } }), status: status2(["OPEN", "PARTIALLY_CLOSED", "CLOSED"]) });
var WagerPart = scoped("canManageRisk", { wager: relation("Wager"), partIndex: (0, import_fields7.integer)({ validation: { isRequired: true } }), combinationKey: requiredText3(), stakeMinor: requiredText3(), decimalOdds: requiredText3(), potentialReturnMinor: requiredText3(), status: status2(["OPEN", "GRADED", "SETTLED", "CASHED_OUT", "VOID"]), gradeSummary: (0, import_fields7.json)(), settlement: optionalRelation("Settlement") });
var SettlementRun = scoped("canManageRisk", { triggerType: status2(["RESULT_APPROVED", "CORRECTION", "MANUAL_REPLAY"]), resultVersion: relation("ResultVersion"), inputHash: requiredText3(), status: status2(["PENDING", "RUNNING", "COMPLETED", "FAILED"]), wagersConsidered: (0, import_fields7.integer)({ defaultValue: 0 }), wagersSettled: (0, import_fields7.integer)({ defaultValue: 0 }), startedAt: requiredTime(), completedAt: (0, import_fields7.timestamp)(), errorSummary: optionalText() });
var SettlementLine = scoped("canManageRisk", { settlement: relation("Settlement"), wagerPart: optionalRelation("WagerPart"), wagerLeg: optionalRelation("WagerLeg"), lineType: status2(["STAKE_RETURN", "PROFIT", "LOSS", "VOID", "PUSH", "DEAD_HEAT", "TAX", "ROUNDING"]), amountMinor: requiredText3(), unroundedValue: requiredText3(), scale: (0, import_fields7.integer)({ validation: { isRequired: true } }), roundingRule: requiredText3(), residualMinor: requiredText3(), trace: (0, import_fields7.json)() });
var CashOutAcceptance = scoped("canManageRisk", { offer: relation("CashOutOffer"), wager: relation("Wager"), player: relation("Player"), amountMinor: requiredText3(), currency: requiredText3(), portionNumerator: requiredText3(), portionDenominator: requiredText3(), wagerVersion: (0, import_fields7.integer)({ validation: { isRequired: true } }), acceptedAt: requiredTime(), journalTransaction: relation("JournalTransaction"), status: status2(["ACCEPTED", "REVERSED"]), reversalOf: optionalRelation("CashOutAcceptance"), idempotencyKey: requiredText3(), evidenceHash: requiredText3() });
var SafeguardingAccount = scoped("canManageFinance", { legalEntity: relation("LegalEntity"), providerConnection: optionalRelation("ProviderConnection"), accountReference: requiredText3(), classification: status2(["NOT_PROTECTED", "MEDIUM_PROTECTION", "HIGH_PROTECTION", "TRUST"]), currency: requiredText3(), status: status2(["ACTIVE", "SUSPENDED", "CLOSED"]), disclosureVersion: requiredText3() });
var SafeguardingReconciliation = scoped("canManageFinance", { safeguardingAccount: relation("SafeguardingAccount"), asOf: requiredTime(), safeguardedAssetMinor: requiredText3(), playerLiabilityMinor: requiredText3(), differenceMinor: requiredText3(), status: status2(["MATCHED", "SHORTFALL", "SURPLUS", "RESOLVED"]), evidenceHash: requiredText3(), reconciliationRun: optionalRelation("ReconciliationRun") });
var LedgerAdjustmentRequest = scoped("canManageFinance", { player: optionalRelation("Player"), account: relation("LedgerAccount"), amountMinor: requiredText3(), currency: requiredText3(), direction: status2(["DEBIT", "CREDIT"]), reasonCode: requiredText3(), evidence: (0, import_fields7.json)(), status: status2(["PENDING", "APPROVED", "POSTED", "REJECTED"]), requesterId: requiredText3(), approvalRequest: relation("ApprovalRequest"), journalTransaction: optionalRelation("JournalTransaction") });
var TaxRuleVersion = scoped("canManageFinance", { jurisdiction: relation("Jurisdiction"), key: requiredText3(), version: (0, import_fields7.integer)({ validation: { isRequired: true } }), basis: status2(["STAKE", "WINNINGS", "GGR", "PLAYER_WITHHOLDING", "PROMOTION"]), rateNumerator: requiredText3(), rateDenominator: requiredText3(), roundingRule: requiredText3(), effectiveFrom: requiredTime(), effectiveTo: (0, import_fields7.timestamp)(), status: status2(["DRAFT", "ACTIVE", "RETIRED"]), evidenceHash: requiredText3() });
var PlayerStatement = scoped("canManageFinance", { player: relation("Player"), periodStart: requiredTime(), periodEnd: requiredTime(), openingMinor: requiredText3(), closingMinor: requiredText3(), currency: requiredText3(), journalHash: requiredText3(), artifactReference: requiredText3(), status: status2(["GENERATING", "READY", "FAILED"]) });
var Promotion = scoped("canManageSportsbook", { key: requiredText3(), name: requiredText3(), description: requiredText3(), type: status2(["FREE_BET", "ODDS_BOOST", "DEPOSIT_MATCH", "CASHBACK"]), status: status2(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]), startsAt: requiredTime(), endsAt: requiredTime(), jurisdiction: optionalRelation("Jurisdiction"), brand: optionalRelation("Brand"), budgetMinor: requiredText3(), currency: requiredText3(), termsVersion: requiredText3(), termsHash: requiredText3(), approvalRequest: optionalRelation("ApprovalRequest") });
var PromotionRuleVersion = scoped("canManageSportsbook", { promotion: relation("Promotion"), version: (0, import_fields7.integer)({ validation: { isRequired: true } }), eligibility: (0, import_fields7.json)(), economics: (0, import_fields7.json)(), wageringRequirements: (0, import_fields7.json)(), abuseControls: (0, import_fields7.json)(), contributionRules: (0, import_fields7.json)(), status: status2(["DRAFT", "ACTIVE", "RETIRED"]), effectiveFrom: requiredTime(), effectiveTo: (0, import_fields7.timestamp)(), evidenceHash: requiredText3() });
var CampaignBudget = scoped("canManageFinance", { promotion: relation("Promotion"), allocatedMinor: requiredText3(), awardedMinor: requiredText3(), redeemedMinor: requiredText3(), forfeitedMinor: requiredText3(), currency: requiredText3(), version: (0, import_fields7.integer)({ validation: { isRequired: true } }), status: status2(["ACTIVE", "EXHAUSTED", "CLOSED"]) });
var BonusAward = scoped("canManageFinance", { promotion: relation("Promotion"), ruleVersion: relation("PromotionRuleVersion"), player: relation("Player"), amountMinor: requiredText3(), remainingMinor: requiredText3(), currency: requiredText3(), awardType: status2(["FREE_BET", "BONUS_CASH", "ODDS_BOOST"]), stakeReturned: (0, import_fields7.checkbox)({ defaultValue: false }), status: status2(["AWARDED", "ACTIVE", "CONSUMED", "CONVERTED", "EXPIRED", "FORFEITED"]), awardedAt: requiredTime(), activatedAt: (0, import_fields7.timestamp)(), expiresAt: requiredTime(), idempotencyKey: requiredText3(), evidenceHash: requiredText3() });
var BonusTransaction = scoped("canManageFinance", { award: relation("BonusAward"), type: status2(["AWARD", "ACTIVATE", "RESERVE", "CONSUME", "RELEASE", "CONVERT", "EXPIRE", "FORFEIT", "REVERSE"]), amountMinor: requiredText3(), remainingMinor: requiredText3(), currency: requiredText3(), wager: optionalRelation("Wager"), journalTransaction: optionalRelation("JournalTransaction"), idempotencyKey: requiredText3(), evidenceHash: requiredText3() });
var PromotionRedemption = scoped("canManageSportsbook", { promotion: relation("Promotion"), ruleVersion: relation("PromotionRuleVersion"), player: relation("Player"), bonusAward: optionalRelation("BonusAward"), status: status2(["ELIGIBLE", "CLAIMED", "REJECTED", "REVERSED"]), reasonCode: optionalText(), idempotencyKey: requiredText3(), evidenceHash: requiredText3(), redeemedAt: requiredTime() });
var CustomerCredential = internal({ tenant: relation("Tenant"), player: relation("Player"), emailDigest: (0, import_fields7.text)({ validation: { isRequired: true }, isIndexed: "unique" }), emailMasked: requiredText3(), passwordHash: requiredText3(), passwordVersion: (0, import_fields7.integer)({ defaultValue: 1 }), status: status2(["PENDING_VERIFICATION", "ACTIVE", "LOCKED", "CLOSED"]), failedAttempts: (0, import_fields7.integer)({ defaultValue: 0 }), lockedUntil: (0, import_fields7.timestamp)(), verifiedAt: (0, import_fields7.timestamp)(), lastAuthenticatedAt: (0, import_fields7.timestamp)() });
var CustomerDevice = internal({ tenant: relation("Tenant"), player: relation("Player"), session: optionalRelation("CustomerSession"), deviceDigest: requiredText3(), label: requiredText3(), firstSeenAt: requiredTime(), lastSeenAt: requiredTime(), revokedAt: (0, import_fields7.timestamp)(), riskSignals: (0, import_fields7.json)() });
var CustomerRecoveryToken = internal({ tenant: relation("Tenant"), player: relation("Player"), tokenDigest: (0, import_fields7.text)({ validation: { isRequired: true }, isIndexed: "unique" }), purpose: status2(["VERIFY_EMAIL", "RESET_PASSWORD", "RECOVER_ACCOUNT"]), expiresAt: requiredTime(), consumedAt: (0, import_fields7.timestamp)(), attempts: (0, import_fields7.integer)({ defaultValue: 0 }) });
var CustomerFavorite = internal({ tenant: relation("Tenant"), player: relation("Player"), targetType: status2(["SPORT", "COMPETITION", "EVENT", "COMPETITOR"]), targetId: requiredText3(), createdByDevice: optionalText() });
var CustomerPrivacyRequest = scoped("canManageCompliance", { player: relation("Player"), type: status2(["ACCESS", "EXPORT", "CORRECT", "DELETE", "RESTRICT", "PORTABILITY"]), status: status2(["OPEN", "VERIFYING", "IN_PROGRESS", "COMPLETED", "DENIED"]), requestedAt: requiredTime(), dueAt: requiredTime(), completedAt: (0, import_fields7.timestamp)(), identityEvidenceHash: requiredText3(), artifactReference: optionalText(), decisionReason: optionalText() });
var ScreeningHit = scoped("canManageCompliance", { amlCase: relation("AMLCase"), providerConnection: relation("ProviderConnection"), screeningType: status2(["SANCTIONS", "PEP", "ADVERSE_MEDIA", "SOURCE_OF_FUNDS"]), matchToken: requiredText3(), status: status2(["POTENTIAL", "REVIEW", "CONFIRMED", "CLEARED", "FALSE_POSITIVE"]), dispositionReason: optionalText(), evidenceReference: requiredText3(), screenedAt: requiredTime(), resolvedAt: (0, import_fields7.timestamp)(), ownerId: optionalText() });
var AffordabilityAssessment = scoped("canManageCompliance", { player: relation("Player"), source: requiredText3(), riskBand: status2(["LOW", "MEDIUM", "HIGH", "PROHIBITED"]), evidenceReference: requiredText3(), assessedAt: requiredTime(), expiresAt: requiredTime(), decision: status2(["ALLOW", "RESTRICT", "REVIEW"]), reasonCode: requiredText3() });
var AccountClosure = scoped("canManageCompliance", { player: relation("Player"), requestedBy: requiredText3(), reasonCode: requiredText3(), requestedAt: requiredTime(), coolingEndsAt: (0, import_fields7.timestamp)(), status: status2(["REQUESTED", "REVIEW", "BLOCKED_FUNDS", "CLOSED", "CANCELLED"]), completedAt: (0, import_fields7.timestamp)(), evidenceHash: requiredText3() });
var SupportCase = scoped("canManageCompliance", { player: relation("Player"), wager: optionalRelation("Wager"), paymentIntent: optionalRelation("PaymentIntent"), dispute: optionalRelation("Dispute"), category: status2(["ACCOUNT", "WAGER", "PAYMENT", "RESPONSIBLE_GAMING", "PRIVACY", "TECHNICAL"]), priority: status2(["LOW", "NORMAL", "HIGH", "URGENT"]), status: status2(["OPEN", "TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "RESOLVED", "CLOSED"]), subject: requiredText3(), ownerId: optionalText(), openedAt: requiredTime(), resolvedAt: (0, import_fields7.timestamp)(), slaDueAt: requiredTime() });
var SupportCaseEvent = scoped("canManageCompliance", { supportCase: relation("SupportCase"), type: status2(["OPENED", "NOTE", "CUSTOMER_MESSAGE", "OPERATOR_MESSAGE", "ESCALATED", "LINKED", "RESOLVED", "REOPENED"]), actorType: status2(["PLAYER", "STAFF", "SYSTEM", "PROVIDER"]), actorId: requiredText3(), body: requiredText3(), evidenceHash: requiredText3(), visibility: status2(["CUSTOMER", "INTERNAL", "RESTRICTED"]) });
var IntegrityCase = scoped("canManageCompliance", { player: optionalRelation("Player"), event: optionalRelation("Event"), wager: optionalRelation("Wager"), providerConnection: optionalRelation("ProviderConnection"), type: status2(["SUSPICIOUS_BETTING", "COLLUSION", "INSIDER", "RESULT_DISAGREEMENT", "PROHIBITED_PARTICIPANT"]), status: status2(["OPEN", "INVESTIGATING", "REPORTED", "CLEARED", "CLOSED"]), severity: status2(["LOW", "MEDIUM", "HIGH", "CRITICAL"]), restrictedEvidence: (0, import_fields7.json)(), ownerId: optionalText(), reportedAt: (0, import_fields7.timestamp)(), closedAt: (0, import_fields7.timestamp)() });
var WorkerHeartbeat = internal({ workerId: (0, import_fields7.text)({ validation: { isRequired: true }, isIndexed: "unique" }), status: status2(["STARTING", "READY", "STOPPING", "STOPPED"]), startedAt: requiredTime(), heartbeatAt: requiredTime(), stoppedAt: (0, import_fields7.timestamp)(), buildVersion: requiredText3() });
var WebhookEndpoint = scoped("canManageIntegrations", { name: requiredText3(), url: requiredText3(), secretReference: requiredText3(), eventTypes: (0, import_fields7.json)(), status: status2(["PENDING", "ACTIVE", "DEGRADED", "DISABLED"]), failureCount: (0, import_fields7.integer)({ defaultValue: 0 }), disabledAt: (0, import_fields7.timestamp)(), approvalRequest: optionalRelation("ApprovalRequest") });
var WebhookDelivery = scoped("canManageIntegrations", { endpoint: relation("WebhookEndpoint"), outboxMessage: optionalRelation("OutboxMessage"), deliveryId: requiredText3(), eventType: requiredText3(), eventVersion: requiredText3(), payloadHash: requiredText3(), signatureKeyId: requiredText3(), status: status2(["PENDING", "PROCESSING", "DELIVERED", "FAILED", "DEAD"]), attempts: (0, import_fields7.integer)({ defaultValue: 0 }), availableAt: requiredTime(), deliveredAt: (0, import_fields7.timestamp)(), lastResponseCode: (0, import_fields7.integer)(), lastError: optionalText() });
var IntegrationDeliveryAttempt = scoped("canManageIntegrations", { delivery: relation("WebhookDelivery"), attempt: (0, import_fields7.integer)({ validation: { isRequired: true } }), requestedAt: requiredTime(), completedAt: (0, import_fields7.timestamp)(), responseCode: (0, import_fields7.integer)(), latencyMs: (0, import_fields7.integer)(), responseHash: optionalText(), errorClass: optionalText() });
var ProviderHealthSample = scoped("canManageIntegrations", { providerConnection: relation("ProviderConnection"), capability: requiredText3(), status: status2(["HEALTHY", "DEGRADED", "DOWN"]), latencyMs: (0, import_fields7.integer)(), errorRateBasisPoints: (0, import_fields7.integer)(), sequenceLag: (0, import_fields7.integer)(), oldestWebhookAgeMs: (0, import_fields7.integer)(), reconciliationDifferenceMinor: optionalText(), checkedAt: requiredTime(), details: (0, import_fields7.json)() });
var AdapterCertificationRun = scoped("canManageIntegrations", { providerConnection: relation("ProviderConnection"), adapterId: requiredText3(), adapterVersion: requiredText3(), suiteVersion: requiredText3(), scenarios: (0, import_fields7.json)(), passed: (0, import_fields7.integer)({ defaultValue: 0 }), failed: (0, import_fields7.integer)({ defaultValue: 0 }), status: status2(["PENDING", "RUNNING", "PASSED", "FAILED"]), inputHash: requiredText3(), artifactReference: optionalText(), startedAt: requiredTime(), completedAt: (0, import_fields7.timestamp)() });
var ScheduledJob = scoped("canManageIntegrations", { type: status2(["RECONCILIATION", "REPORT", "NOTIFICATION", "RETENTION", "EXPIRY", "PROVIDER_HEALTH", "FEED_RECOVERY"]), scopeType: requiredText3(), scopeId: requiredText3(), payload: (0, import_fields7.json)(), status: status2(["SCHEDULED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]), dueAt: requiredTime(), leaseUntil: (0, import_fields7.timestamp)(), leaseOwner: optionalText(), attempts: (0, import_fields7.integer)({ defaultValue: 0 }), maxAttempts: (0, import_fields7.integer)({ defaultValue: 10 }), idempotencyKey: requiredText3(), lastError: optionalText() });
var Notification = scoped("canManageIntegrations", { player: optionalRelation("Player"), user: optionalRelation("User"), channel: status2(["EMAIL", "SMS", "PUSH", "IN_APP", "WEBHOOK"]), templateKey: requiredText3(), templateVersion: requiredText3(), locale: requiredText3(), payload: (0, import_fields7.json)(), status: status2(["PENDING", "SENT", "DELIVERED", "FAILED", "SUPPRESSED"]), consentEvidenceHash: optionalText(), providerConnection: optionalRelation("ProviderConnection"), externalReference: optionalText(), sentAt: (0, import_fields7.timestamp)() });
var RetentionPolicyVersion = scoped("canManageCompliance", { recordClass: requiredText3(), jurisdiction: optionalRelation("Jurisdiction"), version: (0, import_fields7.integer)({ validation: { isRequired: true } }), retentionDays: (0, import_fields7.integer)({ validation: { isRequired: true } }), archiveDays: (0, import_fields7.integer)(), deletionMode: status2(["DELETE", "TOKENIZE", "CRYPTO_SHRED", "PRESERVE"]), legalHoldWins: (0, import_fields7.checkbox)({ defaultValue: true }), effectiveFrom: requiredTime(), effectiveTo: (0, import_fields7.timestamp)(), status: status2(["DRAFT", "ACTIVE", "RETIRED"]), evidenceHash: requiredText3() });
var RetentionExecution = scoped("canManageCompliance", { policyVersion: relation("RetentionPolicyVersion"), windowFrom: requiredTime(), windowTo: requiredTime(), candidateCount: (0, import_fields7.integer)({ defaultValue: 0 }), heldCount: (0, import_fields7.integer)({ defaultValue: 0 }), archivedCount: (0, import_fields7.integer)({ defaultValue: 0 }), deletedCount: (0, import_fields7.integer)({ defaultValue: 0 }), status: status2(["DRY_RUN", "PENDING_APPROVAL", "APPROVED", "COMPLETED", "FAILED"]), dryRunHash: requiredText3(), approvalRequest: optionalRelation("ApprovalRequest"), artifactReference: optionalText(), completedAt: (0, import_fields7.timestamp)() });
var ReportArtifact = scoped("canManageCompliance", { report: optionalRelation("ComplianceReport"), type: requiredText3(), format: status2(["JSON", "CSV", "PDF", "XML"]), schemaVersion: requiredText3(), rowCount: (0, import_fields7.integer)({ defaultValue: 0 }), contentHash: requiredText3(), storageReference: requiredText3(), encryptionKeyReference: requiredText3(), generatedAt: requiredTime(), expiresAt: (0, import_fields7.timestamp)(), status: status2(["READY", "EXPIRED", "REVOKED"]) });
var AffiliateAttribution = scoped("canManageSportsbook", { player: relation("Player"), affiliateReference: requiredText3(), campaignReference: requiredText3(), clickReference: optionalText(), attributedAt: requiredTime(), status: status2(["PENDING", "ATTRIBUTED", "REJECTED", "REVERSED"]), evidenceHash: requiredText3() });
var PamSubjectMapping = scoped("canManageIntegrations", { providerConnection: relation("ProviderConnection"), externalSubjectDigest: requiredText3(), player: relation("Player"), walletMode: status2(["OPENFRONT", "PAM", "TRANSFER"]), status: status2(["ACTIVE", "SUSPENDED", "REVOKED"]), evidenceHash: requiredText3() });
var DataExport = scoped("canReadAudit", { requestedBy: requiredText3(), type: status2(["AUDIT", "WAGERS", "FINANCE", "CUSTOMERS", "REGULATORY", "PRIVACY"]), scope: (0, import_fields7.json)(), classification: status2(["INTERNAL", "CONFIDENTIAL", "RESTRICTED_PII", "RESTRICTED_FINANCIAL", "RESTRICTED_REGULATORY"]), status: status2(["PENDING", "GENERATING", "READY", "EXPIRED", "REVOKED"]), rowCount: (0, import_fields7.integer)({ defaultValue: 0 }), contentHash: optionalText(), storageReference: optionalText(), expiresAt: requiredTime(), approvalRequest: optionalRelation("ApprovalRequest") });

// features/keystone/models/index.ts
var models = {
  User,
  Role,
  ...Sportsbook_exports,
  ...SportsbookP0_exports,
  ...Customer_exports,
  ...SportsbookFull_exports
};

// features/keystone/index.ts
var import_session = require("@keystone-6/core/session");

// features/keystone/mutations/index.ts
var import_schema = require("@graphql-tools/schema");

// features/keystone/mutations/redirectToInit.ts
async function redirectToInit(root, args, context) {
  const userCount = await context.sudo().query.User.count({});
  if (userCount === 0) {
    return true;
  }
  return false;
}
var redirectToInit_default = redirectToInit;

// features/keystone/mutations/sportsbook-full.ts
var import_node_crypto9 = require("node:crypto");

// features/sportsbook/domain/engine.ts
var import_node_crypto2 = require("node:crypto");
var canonical = (value) => {
  if (typeof value === "bigint") return `"${value}"`;
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(value);
};
var evidenceHash = (value) => (0, import_node_crypto2.createHash)("sha256").update(canonical(value)).digest("hex");
function potentialReturn(stake, decimalOdds) {
  if (!/^\d+(\.\d+)?$/.test(decimalOdds)) throw new Error("INVALID_ODDS");
  const [whole, fraction = ""] = decimalOdds.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const numerator = BigInt(whole) * scale + BigInt(fraction || "0");
  if (numerator < scale) throw new Error("ODDS_BELOW_ONE");
  return stake * numerator / scale;
}
function evaluateAcceptance(quote, facts) {
  const checks = [
    ["tenant", facts.tenantActive, "TENANT_INACTIVE"],
    ["player", facts.playerActive, "PLAYER_INACTIVE"],
    ["kyc", facts.kycApproved, "KYC_REQUIRED"],
    ["geo", facts.geoApproved, "GEO_REQUIRED"],
    ["selfExclusion", !facts.selfExcluded, "SELF_EXCLUDED"],
    ["responsibleGamingLimit", facts.periodLimit === void 0 || facts.wageredInPeriod + quote.stake <= facts.periodLimit, "LIMIT_EXCEEDED"],
    ["quoteExpiry", facts.now.getTime() < quote.expiresAt.getTime(), "QUOTE_EXPIRED"],
    ["market", facts.marketOpen, "MARKET_CLOSED"],
    ["priceFreshness", facts.now.getTime() - facts.priceReceivedAt.getTime() <= facts.maxPriceAgeMs, "STALE_PRICE"],
    ["funds", facts.available >= quote.stake, "INSUFFICIENT_FUNDS"]
  ];
  const returns = potentialReturn(quote.stake, quote.decimalOdds);
  const liability = returns - quote.stake;
  checks.push(["liability", facts.currentLiability + liability <= facts.maxLiability, "LIABILITY_EXCEEDED"]);
  const gates = checks.map(([gate, passed, code]) => ({ gate, passed, ...passed ? {} : { code } }));
  const rejectionCode = gates.find((g) => !g.passed)?.code;
  return { accepted: !rejectionCode, gates, rejectionCode, potentialReturn: returns, liability, termsHash: evidenceHash(quote) };
}
function settlementAmount(stake, decimalOdds, grade) {
  switch (grade.outcome) {
    case "LOSS":
      return 0n;
    case "PUSH":
    case "VOID":
      return stake;
    case "WIN":
      return potentialReturn(stake, decimalOdds);
    case "DEAD_HEAT": {
      const n = grade.factorNumerator ?? 1n;
      const d = grade.factorDenominator ?? 2n;
      if (n < 0n || d <= 0n || n > d) throw new Error("INVALID_DEAD_HEAT_FACTOR");
      return stake + (potentialReturn(stake, decimalOdds) - stake) * n / d;
    }
  }
}

// features/sportsbook/domain/ledger.ts
function validateJournal(journal) {
  if (!journal.idempotencyKey || journal.entries.length < 2) throw new Error("INVALID_JOURNAL");
  const currencies = new Set(journal.entries.map((e) => e.currency));
  if (currencies.size !== 1) throw new Error("CROSS_CURRENCY_JOURNAL");
  if (journal.entries.some((e) => e.amount <= 0n)) throw new Error("NON_POSITIVE_ENTRY");
  const debit = journal.entries.filter((e) => e.side === "DEBIT").reduce((n, e) => n + e.amount, 0n);
  const credit = journal.entries.filter((e) => e.side === "CREDIT").reduce((n, e) => n + e.amount, 0n);
  if (debit !== credit) throw new Error("UNBALANCED_JOURNAL");
}
function settlementJournal(input) {
  const { stake, payout, currency } = input;
  const entries = [{ accountId: input.pendingAccountId, currency, side: "DEBIT", amount: stake }];
  if (payout === 0n) entries.push({ accountId: input.revenueAccountId, currency, side: "CREDIT", amount: stake });
  else {
    if (payout > stake) entries.push({ accountId: input.winningsExpenseAccountId, currency, side: "DEBIT", amount: payout - stake });
    if (payout < stake) entries.push({ accountId: input.revenueAccountId, currency, side: "CREDIT", amount: stake - payout });
    entries.push({ accountId: input.cashAccountId, currency, side: "CREDIT", amount: payout });
  }
  const journal = { idempotencyKey: input.idempotencyKey, type: "WAGER_SETTLEMENT", entries };
  validateJournal(journal);
  return journal;
}
function reverseJournal(original, idempotencyKey) {
  const reversal = { idempotencyKey, type: `REVERSAL_${original.type}`, reversalOf: original.idempotencyKey, entries: original.entries.map((e) => ({ ...e, side: e.side === "DEBIT" ? "CREDIT" : "DEBIT" })) };
  validateJournal(reversal);
  return reversal;
}

// features/sportsbook/domain/combination.ts
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}
function rational(numerator, denominator) {
  if (denominator <= 0n) throw new Error("INVALID_DENOMINATOR");
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}
function multiply(a, b) {
  return rational(a.numerator * b.numerator, a.denominator * b.denominator);
}
function add(a, b) {
  return rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
}
function subtract(a, b) {
  return add(a, rational(-b.numerator, b.denominator));
}
function parseExactDecimal(value) {
  if (!/^\d+(\.\d{1,9})?$/.test(value)) throw new Error("INVALID_ODDS");
  const [whole, fraction = ""] = value.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const result = rational(BigInt(whole) * denominator + BigInt(fraction || "0"), denominator);
  if (result.numerator < result.denominator) throw new Error("ODDS_BELOW_ONE");
  return result;
}
function rationalToDecimal(value, scale = 6) {
  const factor = 10n ** BigInt(scale);
  const scaled = value.numerator * factor / value.denominator;
  const whole = scaled / factor;
  const fraction = String(scaled % factor).padStart(scale, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}
function combinationGradeMultiplier(decimalOdds, outcome, factorNumerator = 1n, factorDenominator = 2n) {
  const odds = parseExactDecimal(decimalOdds);
  if (outcome === "LOSS") return rational(0n, 1n);
  if (outcome === "PUSH" || outcome === "VOID") return rational(1n, 1n);
  if (outcome === "WIN") return odds;
  if (factorNumerator < 0n || factorDenominator <= 0n || factorNumerator > factorDenominator) throw new Error("INVALID_DEAD_HEAT_FACTOR");
  return add(rational(1n, 1n), multiply(subtract(odds, rational(1n, 1n)), rational(factorNumerator, factorDenominator)));
}
function settleCombinationPart(input) {
  const multiplier = input.legs.reduce((current, leg) => multiply(current, combinationGradeMultiplier(leg.decimalOdds, leg.outcome, leg.factorNumerator, leg.factorDenominator)), rational(1n, 1n));
  const allWin = input.legs.length > 0 && input.legs.every((leg) => leg.outcome === "WIN");
  const gross = allWin && input.acceptedPotentialReturnMinor !== void 0 ? input.acceptedPotentialReturnMinor : input.stakeMinor * multiplier.numerator / multiplier.denominator;
  const payoutMinor = input.stakeReturned === false ? gross > input.stakeMinor ? gross - input.stakeMinor : 0n : gross;
  return { payoutMinor, multiplier: rationalToDecimal(multiplier), inputHash: evidenceHash({ stakeMinor: input.stakeMinor, legs: input.legs, stakeReturned: input.stakeReturned ?? true }) };
}

// features/sportsbook/adapters/sandbox.ts
var import_node_crypto3 = require("node:crypto");
var SandboxAdapter = class {
  constructor(kind, webhookSecret = "sandbox-only") {
    this.kind = kind;
    this.webhookSecret = webhookSecret;
    this.results = /* @__PURE__ */ new Map();
    this.fingerprints = /* @__PURE__ */ new Map();
  }
  manifest() {
    return { id: `sandbox-${this.kind}`, version: "1.0.0", schemas: ["sandbox.v1"] };
  }
  async capabilities() {
    return { supported: [this.kind, "query", "webhook", "reconcile"], unsupported: ["production-certified"] };
  }
  async validateConfig(configRef) {
    return { valid: configRef.startsWith("sandbox:"), errors: configRef.startsWith("sandbox:") ? [] : ["Sandbox config must start with sandbox:"] };
  }
  async execute(_ctx, command, idempotencyKey) {
    const fingerprint = JSON.stringify([command.type, command.externalRef ?? null, command.payload ?? null]);
    const prior = this.results.get(idempotencyKey);
    if (prior) {
      if (this.fingerprints.get(idempotencyKey) !== fingerprint) throw new Error("ADAPTER_IDEMPOTENCY_CONFLICT");
      return prior;
    }
    const result = { status: command.type === "simulate_pending" ? "PENDING" : command.type === "simulate_failure" ? "FAILED" : "SUCCEEDED", externalRef: command.externalRef ?? `${this.kind}-${idempotencyKey}`, payload: command.payload };
    this.results.set(idempotencyKey, result);
    this.fingerprints.set(idempotencyKey, fingerprint);
    this.results.set(result.externalRef, result);
    return result;
  }
  /** Process-local memory only: a miss (e.g. after restart) is not evidence of non-effect, so it reports PENDING. */
  async query(_ctx, externalRef) {
    return this.results.get(externalRef) ?? { status: "PENDING", externalRef };
  }
  /** `binding` (e.g. tenant + installation id) is covered by the MAC so signed bytes cannot be replayed against another installation. */
  sign(raw, timestamp7, binding) {
    const mac = (0, import_node_crypto3.createHmac)("sha256", this.webhookSecret).update(timestamp7).update(".");
    if (binding !== void 0) mac.update(binding).update(".");
    return mac.update(raw).digest("hex");
  }
  verifyWebhook(raw, headers, binding) {
    const timestamp7 = headers.get("x-sandbox-timestamp") ?? "";
    const supplied = headers.get("x-sandbox-signature") ?? "";
    const expected = this.sign(raw, timestamp7, binding);
    if (!supplied || supplied.length !== expected.length || !(0, import_node_crypto3.timingSafeEqual)(Buffer.from(supplied), Buffer.from(expected))) return { valid: false, reason: "INVALID_SIGNATURE" };
    try {
      return { valid: true, event: JSON.parse(Buffer.from(raw).toString()) };
    } catch {
      return { valid: false, reason: "INVALID_JSON" };
    }
  }
  normalize(event) {
    return [{ id: event.id, type: event.type, occurredAt: event.occurredAt, payload: event.payload, source: { adapterId: this.manifest().id, version: "1.0.0", externalId: event.id } }];
  }
  async health() {
    return { ok: true, latencyMs: 0, details: "sandbox" };
  }
  async *reconcile() {
    for (const result of new Set(this.results.values())) yield result;
  }
};
var sandboxAdapters = Object.fromEntries(["sports", "results", "kyc", "aml", "geo", "payments", "messaging", "analytics", "tax", "reporting", "integrity", "affiliates", "pam"].map((kind) => [kind, new SandboxAdapter(kind)]));
function installedSandboxAdapter(connection) {
  const kind = String(connection.capabilities?.kind ?? "");
  const adapter = sandboxAdapters[kind];
  if (!adapter || connection.adapterId !== adapter.manifest().id || connection.certificationStatus !== "SANDBOX" || !String(connection.configReference ?? "").startsWith("sandbox:")) return null;
  return adapter;
}

// features/keystone/mutations/sportsbook.ts
var import_node_crypto5 = require("node:crypto");

// features/sportsbook/domain/onboarding.ts
function buildOnboardingFixture(input) {
  if (!/^[a-z0-9-]+$/.test(input.slug) || !/^[A-Z]{3}$/.test(input.currency) || input.currencyExponent < 0 || input.currencyExponent > 6) throw new Error("INVALID_ONBOARDING_INPUT");
  const seed = `sportsbook:${input.slug}:v1`;
  const id = (kind) => `${kind}_${evidenceHash(`${seed}:${kind}`).slice(0, 20)}`;
  return { version: "1", fixtureHash: evidenceHash(input), tenant: { id: id("tenant"), name: input.operatorName, slug: input.slug, status: "ACTIVE", defaultTimezone: input.timezone }, brand: { id: id("brand"), name: input.brandName, domain: input.domain, defaultLocale: "en", status: "ACTIVE" }, jurisdiction: { id: id("jurisdiction"), code: input.jurisdictionCode, status: "PENDING" }, currency: { code: input.currency, exponent: input.currencyExponent }, providers: ["sports", "results", "kyc", "aml", "geo", "payments", "messaging", "analytics", "tax", "reporting", "integrity", "affiliates", "pam"].map((kind) => ({ id: id(`provider-${kind}`), kind, adapterId: `sandbox-${kind}`, certificationStatus: "SANDBOX" })), starterCatalog: { sport: { id: id("sport"), key: "football", name: "Football" }, competition: { id: id("competition"), key: "sandbox-league", name: "Sandbox League" } }, externalGates: ["licence approval", "jurisdiction policy approval", "provider certification", "finance chart approval"] };
}
function prepareSandboxPromotionProgress(progress, fixtureHash) {
  const completeEvidenceHash = evidenceHash({ fixtureHash, stage: "PROMOTIONS" });
  const pendingEvidenceHash = evidenceHash({ fixtureHash, stage: "PROMOTIONS", provisioning: "PENDING" });
  if (!progress) return { kind: "CREATE", evidenceHash: pendingEvidenceHash };
  if (progress.status === "PENDING" && progress.evidenceHash === pendingEvidenceHash) return { kind: "KEEP_PENDING" };
  if (progress.status === "COMPLETE" && progress.evidenceHash === completeEvidenceHash) {
    return { kind: "RESET_PENDING", previousEvidenceHash: completeEvidenceHash, evidenceHash: pendingEvidenceHash };
  }
  throw new Error("ONBOARDING_PROMOTIONS_PROGRESS_CONFLICT");
}
async function ensurePromotionsThenComplete(ensurePromotions, completeProgress) {
  await ensurePromotions();
  await completeProgress();
}

// features/keystone/utils/paymentProviderAdapter.ts
async function executePaymentProvider(provider, command, idempotencyKey) {
  if (provider.status !== "ACTIVE") throw new Error("PAYMENT_PROVIDER_UNAVAILABLE");
  if (provider.adapterId !== "sandbox-payments" || provider.certificationStatus !== "SANDBOX") throw new Error("PAYMENT_ADAPTER_UNSUPPORTED");
  const configuration = await sandboxAdapters.payments.validateConfig(provider.configReference);
  if (!configuration.valid) throw new Error("PAYMENT_ADAPTER_INVALID_CONFIG");
  return sandboxAdapters.payments.execute({}, command, idempotencyKey);
}

// features/sportsbook/customer/auth.ts
var import_node_crypto4 = require("node:crypto");

// features/sportsbook/customer/errors.ts
var CustomerError = class extends Error {
  constructor(code, status3, details) {
    super(code);
    this.code = code;
    this.status = status3;
    this.details = details;
    this.name = "CustomerError";
  }
};

// features/sportsbook/customer/currency.ts
async function resolveTenantCurrency(prisma, tenantId, operation) {
  const rows = await prisma.tenantCurrency.findMany({ where: { tenantId, status: "ACTIVE" }, include: { currency: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 100 });
  const usable = rows.filter((row) => row.currency?.status === "ACTIVE" && typeof row.currency.code === "string" && row.currency.code.length > 0 && Number.isInteger(row.currency.exponent) && row.currency.exponent >= 0 && row.currency.exponent <= 6);
  const defaults = usable.filter((row) => row.defaultForBrand);
  if (defaults.length > 1) throw new CustomerError("CURRENCY_CONFIGURATION_AMBIGUOUS", 409);
  const selected = defaults[0] ?? (usable.length === 1 ? usable[0] : null);
  if (!selected) throw new CustomerError(usable.length > 1 ? "CURRENCY_CONFIGURATION_AMBIGUOUS" : "CURRENCY_UNAVAILABLE", 409);
  if (operation) {
    const enabled = operation === "DEPOSIT" ? selected.depositsEnabled : operation === "WITHDRAWAL" ? selected.withdrawalsEnabled : selected.wageringEnabled;
    if (!enabled) throw new CustomerError(`${operation}_CURRENCY_DISABLED`, 409);
  }
  return { code: selected.currency.code, exponent: selected.currency.exponent, depositsEnabled: Boolean(selected.depositsEnabled), withdrawalsEnabled: Boolean(selected.withdrawalsEnabled), wageringEnabled: Boolean(selected.wageringEnabled) };
}

// features/keystone/tenant-scope.ts
var import_node_async_hooks = require("node:async_hooks");
var tenantStorage = new import_node_async_hooks.AsyncLocalStorage();
var modelOperations = /* @__PURE__ */ new Set(["aggregate", "count", "create", "createMany", "delete", "deleteMany", "findFirst", "findFirstOrThrow", "findMany", "findUnique", "findUniqueOrThrow", "groupBy", "update", "updateMany", "upsert"]);
var rawOperations = /* @__PURE__ */ new Set(["$executeRaw", "$executeRawUnsafe", "$queryRaw", "$queryRawUnsafe"]);
function runWithTenantScope(tenantId, work) {
  return tenantStorage.run(tenantId, work);
}
async function setLocalTenant(tx, tenantId) {
  await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ""}, true)`;
}
function tenantScopedPrisma(client) {
  const base = client;
  const withLocalTenant = async (tenantId, work) => base.$transaction(async (tx) => {
    await setLocalTenant(tx, tenantId);
    return work(tx);
  });
  return new Proxy(base, {
    get(target, property, receiver) {
      if (property === "$transaction") {
        return (work, options) => {
          const tenantId = tenantStorage.getStore();
          if (tenantId === void 0) return target.$transaction.call(target, work, options);
          if (Array.isArray(work)) {
            const setTenant = target.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId ?? ""}, true)`;
            return target.$transaction.call(target, [setTenant, ...work], options).then((results) => results.slice(1));
          }
          return target.$transaction.call(target, async (tx) => {
            await setLocalTenant(tx, tenantId);
            return work(tx);
          }, options);
        };
      }
      if (typeof property === "string" && rawOperations.has(property)) {
        return (...args) => {
          const tenantId = tenantStorage.getStore();
          if (tenantId === void 0) return target[property](...args);
          return withLocalTenant(tenantId, (tx) => tx[property](...args));
        };
      }
      const value = Reflect.get(target, property, receiver);
      if (typeof property === "string" && value && typeof value === "object" && [...modelOperations].some((operation) => typeof value[operation] === "function")) {
        return new Proxy(value, {
          get(delegate, operation, delegateReceiver) {
            const method = Reflect.get(delegate, operation, delegateReceiver);
            if (typeof operation !== "string" || !modelOperations.has(operation) || typeof method !== "function") return method;
            return (...args) => {
              const tenantId = tenantStorage.getStore();
              if (tenantId === void 0) return method.apply(delegate, args);
              return withLocalTenant(tenantId, (tx) => tx[property][operation](...args));
            };
          }
        });
      }
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}

// features/keystone/identity-bootstrap.ts
async function bootstrapOperatorIdentity(prisma, userId) {
  if (!userId) return null;
  return runWithTenantScope(null, () => prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT set_config('app.bootstrap_user_id', ${userId}, true)`;
    const rows = await tx.$queryRaw`SELECT tenant, "passwordResetRedeemedAt" FROM "User" WHERE id = ${userId} LIMIT 1`;
    const row = rows[0];
    return row ? { tenantId: row.tenant ?? null, passwordResetRedeemedAt: row.passwordResetRedeemedAt ?? null } : null;
  }));
}

// features/sportsbook/customer/auth.ts
var CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
var SERVICING_STATUSES = /* @__PURE__ */ new Set(["ACTIVE", "SUSPENDED", "CLOSED"]);
function validatedSession(session, now, servicing = false) {
  if (!session?.tenant || !session.player || !session.tenantId || !session.playerId || session.tenantId !== session.tenant.id || session.playerId !== session.player.id || session.player.tenantId !== session.tenantId || session.revokedAt || !(session.expiresAt instanceof Date) || !Number.isFinite(session.expiresAt.getTime()) || session.expiresAt <= now || (servicing ? !SERVICING_STATUSES.has(session.tenant.status ?? "") : session.tenant.status !== "ACTIVE") || (servicing ? !SERVICING_STATUSES.has(session.player.status ?? "") : session.player.status !== "ACTIVE")) throw new CustomerError("AUTHENTICATION_REQUIRED", 401);
  return { ...session, tenant: session.tenant, player: session.player };
}
async function assertCurrentCustomerActor(prisma, actor, lock = false, now = /* @__PURE__ */ new Date(), servicing = false) {
  if (!actor.sessionId || !actor.tenantId || !actor.playerId) throw new CustomerError("AUTHENTICATION_REQUIRED", 401);
  if (lock) {
    await prisma.$queryRaw`SELECT set_config('app.tenant_id', ${actor.tenantId}, true)`;
    await prisma.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${actor.tenantId} FOR SHARE`;
    await prisma.$queryRaw`SELECT id FROM "Player" WHERE id = ${actor.playerId} AND tenant = ${actor.tenantId} FOR SHARE`;
    await prisma.$queryRaw`SELECT id FROM "CustomerSession" WHERE id = ${actor.sessionId} AND tenant = ${actor.tenantId} AND player = ${actor.playerId} FOR SHARE`;
  }
  const session = validatedSession(await prisma.customerSession.findUnique({ where: { id: actor.sessionId }, include: { tenant: true, player: true } }), now, servicing);
  if (session.id !== actor.sessionId || session.tenantId !== actor.tenantId || session.playerId !== actor.playerId || actor.assuranceLevel && actor.assuranceLevel !== (session.assuranceLevel ?? "GUEST")) {
    throw new CustomerError("AUTHENTICATION_REQUIRED", 401);
  }
  const currency = await resolveTenantCurrency(prisma, session.tenant.id);
  if (actor.currency && currency.code !== actor.currency) throw new CustomerError("CUSTOMER_CURRENCY_CHANGED", 409);
}

// features/sportsbook/domain/transaction.ts
function isRetryableTransactionError(error) {
  const value = error;
  const detail = `${value?.name ?? ""} ${value?.message ?? ""} ${String(value?.cause ?? "")}`;
  return ["P2034", "P2002", "40001", "40P01"].includes(value?.code ?? "") || /TransactionWriteConflict|write conflict|deadlock|serialization/i.test(detail);
}
var transactionBackoff = (attempt) => new Promise((resolve) => setTimeout(resolve, Math.min(15 * 2 ** attempt, 300)));

// features/sportsbook/domain/balance.ts
function nextProjection(current, change, now = /* @__PURE__ */ new Date()) {
  const postedDelta = change.postedDelta ?? 0n;
  const availableDelta = change.availableDelta ?? postedDelta;
  const posted = BigInt(current.postedMinor) + postedDelta;
  const available = BigInt(current.availableMinor) + availableDelta;
  if (available > posted) throw new Error("BALANCE_PROJECTION_INVARIANT");
  return {
    postedMinor: String(posted),
    pendingMinor: current.pendingMinor,
    availableMinor: String(available),
    version: Number(current.version ?? 0) + 1,
    asOf: now
  };
}
var postedChange = (delta) => ({ postedDelta: delta, availableDelta: delta });
var reserveChange = (amount) => ({ postedDelta: 0n, availableDelta: -amount });
var releaseChange = (amount) => ({ postedDelta: 0n, availableDelta: amount });
var captureChange = (amount) => ({ postedDelta: -amount, availableDelta: 0n });

// features/sportsbook/customer/idempotency.ts
async function finishCustomerCommand(prisma, commandId, status3, result) {
  const updated = await prisma.customerCommand.updateMany({ where: { id: commandId, status: "IN_PROGRESS" }, data: { status: status3, result } });
  return updated.count === 1;
}

// features/sportsbook/customer/funding.ts
var PRE_DISPATCH_REFUSALS = /* @__PURE__ */ new Set(["PAYMENT_PROVIDER_UNAVAILABLE", "PAYMENT_ADAPTER_UNSUPPORTED", "PAYMENT_ADAPTER_INVALID_CONFIG"]);
async function dispatchPinnedPayment(intent, provider, fresh) {
  if (!provider) return { status: "UNKNOWN", externalRef: "", reasonCode: "PROVIDER_INSTALLATION_MISSING" };
  const snapshot = intent.riskEvidence?.provider;
  if (snapshot && (snapshot.adapterId !== provider.adapterId || snapshot.adapterVersion !== provider.adapterVersion || snapshot.configReference !== provider.configReference)) {
    return { status: "UNKNOWN", externalRef: "", reasonCode: "PROVIDER_CONFIGURATION_CHANGED" };
  }
  try {
    const result = await executePaymentProvider(provider, { type: intent.type === "DEPOSIT" ? "deposit" : "withdrawal", payload: { amountMinor: intent.amountMinor, currency: intent.currency } }, `${provider.id}:${intent.idempotencyKey}`);
    if (result.status === "SUCCEEDED") return { status: "SUCCEEDED", externalRef: result.externalRef, reasonCode: "" };
    if (result.status === "FAILED") return { status: "FAILED", externalRef: result.externalRef, reasonCode: "PROVIDER_DECLINED" };
    return { status: "UNKNOWN", externalRef: result.externalRef, reasonCode: "PROVIDER_PENDING" };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (fresh && PRE_DISPATCH_REFUSALS.has(code)) return { status: "FAILED", externalRef: "", reasonCode: code };
    return { status: "UNKNOWN", externalRef: "", reasonCode: PRE_DISPATCH_REFUSALS.has(code) ? code : "PROVIDER_OUTCOME_UNKNOWN" };
  }
}

// features/sportsbook/customer/promotions.ts
var serializable = async (prisma, work) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, { isolationLevel: "Serializable" });
    } catch (error) {
      if (attempt >= 7 || !isRetryableTransactionError(error)) throw error;
      await transactionBackoff(attempt);
    }
  }
};
var promotionFixtures = [
  { key: "sandbox-free-bet", name: "First play free bet", description: "A $5 restricted free bet. Stake is not returned on a win.", type: "FREE_BET", budgetMinor: "500000", economics: { amountMinor: "500", stakeReturned: false }, requirements: { minimumOdds: "1.50", validStructures: ["STRAIGHT", "PARLAY"] } },
  { key: "sandbox-odds-boost", name: "Weekend odds boost", description: "A 10% profit boost capped at $10 for eligible pre-match wagers.", type: "ODDS_BOOST", budgetMinor: "100000", economics: { boostBasisPoints: 1e3, maxBoostMinor: "1000" }, requirements: { minimumOdds: "1.80", validStructures: ["STRAIGHT", "PARLAY"] } },
  { key: "sandbox-deposit-match", name: "Deposit match sandbox", description: "A $10 restricted bonus wallet award with 3\xD7 wagering evidence.", type: "DEPOSIT_MATCH", budgetMinor: "500000", economics: { amountMinor: "1000", stakeReturned: true }, requirements: { wageringMultiple: 3, validStructures: ["STRAIGHT", "PARLAY", "SYSTEM"] } }
];
async function ensureSandboxPromotions(prisma, tenantId) {
  const now = /* @__PURE__ */ new Date();
  const currency = (await resolveTenantCurrency(prisma, tenantId)).code;
  await serializable(prisma, async (tx) => {
    for (const fixture of promotionFixtures) {
      let promotion = await tx.promotion.findFirst({ where: { tenantId, key: fixture.key } });
      if (!promotion) {
        const termsHash = evidenceHash({ key: fixture.key, economics: fixture.economics, requirements: fixture.requirements, version: "sandbox-full-v1" });
        promotion = await tx.promotion.create({ data: { tenantId, key: fixture.key, name: fixture.name, description: fixture.description, type: fixture.type, status: "ACTIVE", startsAt: new Date(now.getTime() - 864e5), endsAt: new Date(now.getTime() + 30 * 864e5), budgetMinor: fixture.budgetMinor, currency, termsVersion: "sandbox-full-v1", termsHash } });
        const rule = await tx.promotionRuleVersion.create({ data: { tenantId, promotionId: promotion.id, version: 1, eligibility: { kyc: "APPROVED", onePerPlayer: true }, economics: fixture.economics, wageringRequirements: fixture.requirements, abuseControls: { duplicateAccount: "DENY", linkedPaymentMethod: "REVIEW", maxAwardsPerPlayer: 1 }, contributionRules: { sportsbook: 100 }, status: "ACTIVE", effectiveFrom: now, evidenceHash: termsHash } });
        await tx.campaignBudget.create({ data: { tenantId, promotionId: promotion.id, allocatedMinor: fixture.budgetMinor, awardedMinor: "0", redeemedMinor: "0", forfeitedMinor: "0", currency, version: 1, status: "ACTIVE" } });
        await tx.outboxMessage.create({ data: { tenantId, aggregateType: "PROMOTION", aggregateId: promotion.id, eventType: "promotion.activated.v1", payload: { promotionId: promotion.id, ruleVersionId: rule.id, termsHash }, status: "PENDING", attempts: 0, maxAttempts: 10, availableAt: now } });
      }
    }
  });
}

// features/sportsbook/customer/limit-enforcement.ts
var periodStart = (period, now) => new Date(now.getTime() - (period === "DAILY" ? 1 : period === "WEEKLY" ? 7 : 30) * 864e5);
var integerMinor = (value) => typeof value === "string" && /^-?\d+$/.test(value) ? BigInt(value) : null;
async function wagerLimitViolation(tx, tenantId, playerId, stakeMinor, now = /* @__PURE__ */ new Date(), sessionId, currency) {
  const wagerCurrency = currency ?? (await resolveTenantCurrency(tx, tenantId)).code;
  const limits = await tx.playerLimit.findMany({ where: { tenantId, playerId, type: { in: ["STAKE", "LOSS", "SESSION"] }, effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, orderBy: { effectiveFrom: "desc" } });
  for (const limit of limits) {
    const maximum = integerMinor(limit.amountMinor), from = periodStart(limit.period ?? "DAILY", now);
    if (maximum === null || maximum < 0n) return { code: "LIMIT_UNAVAILABLE", limitId: limit.id, maximum: 0n, used: 0n };
    if (limit.type !== "SESSION" && limit.currency && limit.currency !== wagerCurrency) continue;
    if (limit.type === "STAKE") {
      const wagers = await tx.wager.findMany({ where: { tenantId, playerId, currency: wagerCurrency, status: { not: "REJECTED" }, createdAt: { gte: from } }, select: { stakeMinor: true } }), used = wagers.reduce((sum, item) => sum + (integerMinor(item.stakeMinor) ?? 0n), 0n);
      if (used + stakeMinor > maximum) return { code: "STAKE_LIMIT_EXCEEDED", limitId: limit.id, maximum, used };
    }
    if (limit.type === "LOSS") {
      const wagers = await tx.wager.findMany({ where: { tenantId, playerId, currency: wagerCurrency, status: { in: ["SETTLED", "CASHED_OUT"] }, createdAt: { gte: from } }, select: { id: true, stakeMinor: true, status: true } }), ids = wagers.map((item) => item.id);
      const [settlements, cashouts] = await Promise.all([tx.settlement.findMany({ where: { tenantId, wagerId: { in: ids } }, orderBy: [{ wagerId: "asc" }, { version: "desc" }] }), tx.cashOutAcceptance.findMany({ where: { tenantId, wagerId: { in: ids }, status: "ACCEPTED", reversalOfId: null }, select: { wagerId: true, amountMinor: true, currency: true } })]);
      const latest = /* @__PURE__ */ new Map();
      for (const settlement of settlements) if (settlement.wagerId && !latest.has(settlement.wagerId)) latest.set(settlement.wagerId, settlement);
      const cashedOut = /* @__PURE__ */ new Map();
      for (const row of cashouts) {
        const amount = integerMinor(row.amountMinor);
        if (amount === null || row.currency && row.currency !== wagerCurrency) return { code: "LOSS_LIMIT_EVIDENCE_UNAVAILABLE", limitId: limit.id, maximum, used: 0n };
        cashedOut.set(row.wagerId, (cashedOut.get(row.wagerId) ?? 0n) + amount);
      }
      let net = 0n;
      for (const wager of wagers) {
        const stake = integerMinor(wager.stakeMinor), settlement = latest.get(wager.id), payout = settlement ? integerMinor(settlement.payoutMinor) : 0n;
        if (stake === null || payout === null || wager.status === "SETTLED" && !settlement) return { code: "LOSS_LIMIT_EVIDENCE_UNAVAILABLE", limitId: limit.id, maximum, used: net };
        net += stake - payout - (cashedOut.get(wager.id) ?? 0n);
      }
      if (net >= maximum) return { code: "LOSS_LIMIT_REACHED", limitId: limit.id, maximum, used: net };
    }
    if (limit.type === "SESSION") {
      const session = sessionId ? await tx.customerSession.findFirst({ where: { id: sessionId, tenantId, playerId } }) : await tx.customerSession.findFirst({ where: { tenantId, playerId, revokedAt: null, expiresAt: { gt: now } }, orderBy: { createdAt: "asc" } });
      if (session) {
        const minutes = BigInt(Math.floor((now.getTime() - session.createdAt.getTime()) / 6e4));
        if (minutes >= maximum) return { code: "SESSION_LIMIT_REACHED", limitId: limit.id, maximum, used: minutes };
      }
    }
  }
  return null;
}

// features/sportsbook/customer/acceptance-gates.ts
var GEO_DECISION_MAX_AGE_MS = 864e5;
async function currentGeoApproved(tx, tenantId, playerId, now) {
  const latest = await tx.geoCheck.findFirst({
    where: { tenantId, checkedAt: { not: null, lte: now }, geoSession: { tenantId, playerId } },
    include: { geoSession: true },
    orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }]
  });
  if (!latest || latest.decision !== "ALLOW" || !latest.checkedAt) return false;
  if (now.getTime() - latest.checkedAt.getTime() > GEO_DECISION_MAX_AGE_MS) return false;
  const session = latest.geoSession;
  return Boolean(session && session.status === "ACTIVE" && (!session.expiresAt || session.expiresAt > now));
}
async function currentKycApproved(tx, tenantId, player, now) {
  if (player.kycStatus !== "APPROVED") return false;
  const latest = await tx.verificationCase.findFirst({ where: { tenantId, playerId: player.id, type: "KYC" }, orderBy: { createdAt: "desc" } });
  return Boolean(latest && latest.status === "APPROVED" && (!latest.expiresAt || latest.expiresAt > now));
}
async function currentWagerProvenance(tx, tenantId) {
  const channel = await tx.operatorChannel.findFirst({
    where: { tenantId, type: "WEB", status: { in: ["ACTIVE", "PENDING"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }]
  });
  return {
    channelId: channel?.id ?? null,
    brandId: channel?.brandId ?? null,
    legalEntityId: channel?.legalEntityId ?? null,
    operatorJurisdictionId: channel?.operatorJurisdictionId ?? null
  };
}
var money = (value) => value && /^\d+$/.test(value) ? BigInt(value) : null;
async function riskLimitViolation(tx, input) {
  const { tenantId, playerId, currency, now } = input;
  const rules2 = await tx.limitRule.findMany({
    where: { tenantId, currency, profile: { tenantId, status: "ACTIVE", OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: now } }], AND: [{ OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }] } },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }]
  });
  const marketIds = new Set(input.allocations.map((item) => item.marketId));
  const eventIds = new Set(input.allocations.flatMap((item) => item.eventId ? [item.eventId] : []));
  const newLiability = input.allocations.reduce((sum, item) => sum + item.liabilityMinor, 0n);
  for (const rule of rules2) {
    const scope = String(rule.scopeType || "").toUpperCase();
    const scopeId = String(rule.scopeId || "");
    const applies = scope === "TENANT" ? !scopeId || scopeId === tenantId : scope === "PLAYER" ? scopeId === playerId : scope === "EVENT" ? eventIds.has(scopeId) : scope === "MARKET" ? marketIds.has(scopeId) : false;
    if (!applies) continue;
    const maxStake = money(rule.maxStakeMinor), maxPayout = money(rule.maxPayoutMinor), maxLiability = money(rule.maxLiabilityMinor);
    if (maxStake !== null && input.stakeMinor > maxStake) return { code: "LIMIT_RULE_EXCEEDED", limitRuleId: rule.id };
    if (maxPayout !== null && input.potentialReturnMinor > maxPayout) return { code: "LIMIT_RULE_EXCEEDED", limitRuleId: rule.id };
    if (maxLiability === null) continue;
    let added = 0n;
    let where;
    if (scope === "MARKET") {
      added = input.allocations.filter((item) => item.marketId === scopeId).reduce((sum, item) => sum + item.liabilityMinor, 0n);
      where = { marketId: scopeId };
    } else if (scope === "EVENT") {
      const markets = await tx.market.findMany({ where: { tenantId, eventId: scopeId }, select: { id: true } });
      const ids = markets.map((item) => item.id);
      added = input.allocations.filter((item) => item.eventId === scopeId).reduce((sum, item) => sum + item.liabilityMinor, 0n);
      where = { marketId: { in: ids } };
    } else if (scope === "PLAYER") {
      added = newLiability;
      where = { wager: { playerId } };
    } else {
      added = newLiability;
      where = {};
    }
    const open = await tx.wagerExposureAllocation.findMany({ where: { tenantId, status: { not: "CLOSED" }, wager: { currency }, ...where }, select: { remainingLiabilityMinor: true } });
    const current = open.reduce((sum, item) => sum + (money(item.remainingLiabilityMinor) ?? 0n), 0n);
    if (current + added > maxLiability) return { code: "LIABILITY_LIMIT_EXCEEDED", limitRuleId: rule.id };
  }
  return null;
}

// features/sportsbook/domain/result-facts.ts
var MAX_CANONICAL_SELECTION_FACTS = 1024;
var MAX_KEY_LENGTH = 128;
var MAX_FACTOR_DIGITS = 18;
var outcomes = /* @__PURE__ */ new Set(["WIN", "LOSS", "PUSH", "VOID", "DEAD_HEAT"]);
function parseCanonicalSelectionFacts(payload, expectedEventId) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("INVALID_CANONICAL_RESULT");
  const body = payload;
  if (body.schemaVersion !== "openfront.selection-results.v1" || typeof body.eventId !== "string" || !body.eventId.trim()) throw new Error("INVALID_CANONICAL_RESULT");
  if (body.eventId.length > MAX_KEY_LENGTH || body.eventId.includes("\0")) throw new Error("INVALID_CANONICAL_RESULT");
  if (expectedEventId && body.eventId !== expectedEventId) throw new Error("RESULT_EVENT_MISMATCH");
  if (!Array.isArray(body.selections) || body.selections.length === 0) throw new Error("CANONICAL_SELECTION_FACTS_REQUIRED");
  if (body.selections.length > MAX_CANONICAL_SELECTION_FACTS) throw new Error("CANONICAL_SELECTION_FACTS_LIMIT_EXCEEDED");
  const seen = /* @__PURE__ */ new Set();
  const facts = body.selections.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_CANONICAL_SELECTION_FACT");
    const row = value;
    if (typeof row.marketKey !== "string" || !row.marketKey.trim() || typeof row.selectionKey !== "string" || !row.selectionKey.trim() || typeof row.outcome !== "string" || !outcomes.has(row.outcome)) {
      throw new Error("INVALID_CANONICAL_SELECTION_FACT");
    }
    if (row.marketKey.length > MAX_KEY_LENGTH || row.selectionKey.length > MAX_KEY_LENGTH || row.marketKey.includes("\0") || row.selectionKey.includes("\0")) throw new Error("INVALID_CANONICAL_SELECTION_FACT");
    const identity = `${row.marketKey}\0${row.selectionKey}`;
    if (seen.has(identity)) throw new Error("DUPLICATE_CANONICAL_SELECTION_FACT");
    seen.add(identity);
    const factorNumerator = row.factorNumerator;
    const factorDenominator = row.factorDenominator;
    if (row.outcome === "DEAD_HEAT") {
      if (typeof factorNumerator !== "string" || typeof factorDenominator !== "string" || factorNumerator.length > MAX_FACTOR_DIGITS || factorDenominator.length > MAX_FACTOR_DIGITS || !/^\d+$/.test(factorNumerator) || !/^\d+$/.test(factorDenominator) || BigInt(factorNumerator) <= 0n || BigInt(factorDenominator) <= 0n || BigInt(factorNumerator) > BigInt(factorDenominator)) {
        throw new Error("INVALID_DEAD_HEAT_FACTOR");
      }
    } else if (factorNumerator !== void 0 || factorDenominator !== void 0) {
      throw new Error("UNEXPECTED_SELECTION_FACTOR");
    }
    return {
      marketKey: row.marketKey,
      selectionKey: row.selectionKey,
      outcome: row.outcome,
      ...typeof factorNumerator === "string" ? { factorNumerator } : {},
      ...typeof factorDenominator === "string" ? { factorDenominator } : {}
    };
  });
  return { eventId: body.eventId, facts };
}
function resolveCanonicalSelectionFact(payload, eventId, marketKey, selectionKey) {
  const { facts } = parseCanonicalSelectionFacts(payload, eventId);
  return facts.find((fact) => fact.marketKey === marketKey && fact.selectionKey === selectionKey) ?? null;
}

// features/sportsbook/domain/ledger-reconciliation.ts
function analyzeJournalBalances(entries) {
  const groups = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const key2 = `${entry.transactionId}\0${entry.currency}`;
    const group = groups.get(key2) ?? { transactionId: entry.transactionId, currency: entry.currency, debitMinor: 0n, creditMinor: 0n };
    const amount = BigInt(entry.amountMinor);
    if (amount < 0n || !["DEBIT", "CREDIT"].includes(entry.side)) throw new Error("INVALID_JOURNAL_ENTRY");
    if (entry.side === "DEBIT") group.debitMinor += amount;
    else group.creditMinor += amount;
    groups.set(key2, group);
  }
  const transactions = [...groups.values()].map((group) => ({ ...group, differenceMinor: group.debitMinor - group.creditMinor }));
  const unbalanced = transactions.filter((item) => item.differenceMinor !== 0n);
  const absoluteDifferenceMinor = unbalanced.reduce((sum, item) => sum + (item.differenceMinor < 0n ? -item.differenceMinor : item.differenceMinor), 0n);
  return { transactions, unbalanced, absoluteDifferenceMinor };
}

// features/sportsbook/domain/trading-eligibility.ts
function isEventTradingEligible(status3) {
  return status3 === "SCHEDULED" || status3 === "LIVE";
}
function assertEventTradingTransition(currentStatus, nextStatus) {
  if (isEventTradingEligible(nextStatus) && !isEventTradingEligible(currentStatus)) {
    throw new Error("TRADING_REOPENING_REQUIRES_REVIEWED_POLICY");
  }
}
function assertMarketOpenAllowed(marketStatus, eventStatus) {
  if (!isEventTradingEligible(eventStatus)) throw new Error("PARENT_EVENT_NOT_TRADING_ELIGIBLE");
  if (marketStatus !== "OPEN") throw new Error("MARKET_REOPENING_REQUIRES_REVIEWED_POLICY");
}
function assertEventAllowsNewMarket(eventStatus) {
  if (!isEventTradingEligible(eventStatus)) throw new Error("PARENT_EVENT_NOT_TRADING_ELIGIBLE");
}
var AWAITING_PRICES = "AWAITING_PRICES";
function assertMarketFirstOpenAllowed(input) {
  if (!isEventTradingEligible(input.eventStatus)) throw new Error("PARENT_EVENT_NOT_TRADING_ELIGIBLE");
  if (!input.createdAwaitingPrices || input.everOpened) throw new Error("MARKET_REOPENING_REQUIRES_REVIEWED_POLICY");
  if (input.selections === 0 || input.unpricedSelections > 0) throw new Error("MARKET_NOT_FULLY_PRICED");
}

// features/sportsbook/domain/house-rules.ts
var specific = (key2) => Boolean(key2 && key2 !== "*");
async function activeHouseRule(tx, tenantId, market, now) {
  const event = await tx.event.findFirst({ where: { id: market.eventId ?? "", tenantId }, include: { competition: { include: { sport: true } } } });
  const sportKey = event?.competition?.sport?.key ?? "";
  const candidates = await tx.houseRuleVersion.findMany({ where: { tenantId, status: "ACTIVE", effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] } });
  const eligible = candidates.filter((rule) => (!specific(rule.sportKey) || rule.sportKey === sportKey) && (!specific(rule.marketDefinitionKey) || rule.marketDefinitionKey === market.definitionKey));
  eligible.sort((left, right) => Number(specific(right.marketDefinitionKey)) - Number(specific(left.marketDefinitionKey)) || Number(specific(right.sportKey)) - Number(specific(left.sportKey)) || Number(right.version) - Number(left.version));
  if (eligible.length > 1) {
    const [left, right] = eligible;
    if (specific(left.marketDefinitionKey) === specific(right.marketDefinitionKey) && specific(left.sportKey) === specific(right.sportKey) && left.version === right.version) throw new Error("AMBIGUOUS_HOUSE_RULE");
  }
  return eligible[0] ?? null;
}
async function approvedHouseRuleEvidence(tx, tenantId, rule) {
  if (rule.tenantId !== tenantId || !rule.approvalRequestId || rule.semanticHash !== evidenceHash({ action: "HOUSE_RULE", name: rule.name, sportKey: rule.sportKey, marketDefinitionKey: rule.marketDefinitionKey, rules: rule.rules, effectiveFrom: rule.effectiveFrom })) return null;
  const approval = await tx.approvalRequest.findFirst({ where: { id: rule.approvalRequestId, tenantId, action: `HOUSE_RULE:${rule.name}`, payloadHash: rule.semanticHash, status: "APPROVED" } });
  return approval?.approverId && approval.requesterId !== approval.approverId ? approval : null;
}

// features/sportsbook/domain/result-approval.ts
function resultApprovalHash(result) {
  if (!result.tenantId || !result.eventId || !result.providerConnectionId || evidenceHash(result.payload) !== result.payloadHash) throw new Error("RESULT_CONTENT_EVIDENCE_MISMATCH");
  return evidenceHash({ action: "APPROVE_RESULT", tenantId: result.tenantId, resultVersionId: result.id, eventId: result.eventId, providerConnectionId: result.providerConnectionId, version: result.version, payloadHash: result.payloadHash });
}

// features/sportsbook/workers/artifact-delivery-contract.ts
var unavailableArtifactEvents = /* @__PURE__ */ new Set(["report.generate", "export.requested.v1"]);
function assertArtifactDeliveryHasHandler(eventType) {
  if (typeof eventType !== "string" || unavailableArtifactEvents.has(eventType)) {
    throw new Error(`ARTIFACT_DELIVERY_NOT_IMPLEMENTED:${String(eventType)}`);
  }
}

// features/sportsbook/workers/recovery-event-contract.ts
var unhandledRecoveryEvents = /* @__PURE__ */ new Set(["recovery.requested", "recovery.requested.v1"]);
function assertRecoveryEventHasHandler(eventType) {
  if (typeof eventType === "string" && unhandledRecoveryEvents.has(eventType)) {
    throw new Error(`RECOVERY_HANDLER_NOT_IMPLEMENTED:${eventType}`);
  }
}

// features/sportsbook/workers/scheduled-job-contract.ts
var handledScheduledJobTypes = [
  "PROVIDER_HEALTH",
  "NOTIFICATION",
  "EXPIRY",
  "RECONCILIATION"
];
var handledScheduledJobTypeSet = new Set(handledScheduledJobTypes);
function assertScheduledJobHasHandler(type) {
  if (typeof type !== "string" || !handledScheduledJobTypeSet.has(type)) {
    throw new Error(`UNSUPPORTED_SCHEDULED_JOB:${String(type)}`);
  }
}

// features/sportsbook/workers/settlement-request-contract.ts
function assertSettlementRequestHasHandler(eventType) {
  if (eventType === "settlement.requested") {
    throw new Error("SETTLEMENT_EXECUTION_NOT_IMPLEMENTED");
  }
}

// features/sportsbook/workers/replay-contract.ts
var reasonOf = (error) => error instanceof Error ? error.message : "UNSUPPORTED";
function outboxEventUnavailableReason(eventType) {
  try {
    assertRecoveryEventHasHandler(eventType);
    assertSettlementRequestHasHandler(eventType);
    assertArtifactDeliveryHasHandler(eventType);
    return null;
  } catch (error) {
    return reasonOf(error);
  }
}
function scheduledJobUnavailableReason(type) {
  try {
    assertScheduledJobHasHandler(type);
    return null;
  } catch (error) {
    return reasonOf(error);
  }
}
function replayUnavailableReason(source) {
  if (!source) return "SOURCE_NOT_FOUND";
  if (source.kind === "OUTBOX") return source.status === "DEAD" ? outboxEventUnavailableReason(source.eventType) : `OUTBOX_NOT_DEAD:${String(source.status)}`;
  if (source.kind === "INBOX") return source.status === "DEAD" ? null : `INBOX_NOT_DEAD:${String(source.status)}`;
  if (source.kind === "SCHEDULED_JOB") return source.status === "FAILED" ? scheduledJobUnavailableReason(source.jobType) : `SCHEDULED_JOB_NOT_FAILED:${String(source.status)}`;
  return `REPLAY_UNSUPPORTED_SOURCE:${source.kind}`;
}
var replaySourceModel = (kind) => kind === "OUTBOX" ? "outboxMessage" : kind === "INBOX" ? "inboxMessage" : kind === "SCHEDULED_JOB" ? "scheduledJob" : null;

// features/keystone/mutations/sportsbook.ts
var import_node_crypto6 = require("node:crypto");

// features/keystone/lib/mail.ts
var import_nodemailer = require("nodemailer");
function getBaseUrlForEmails() {
  if (process.env.SMTP_STORE_LINK) {
    return process.env.SMTP_STORE_LINK;
  }
  console.warn("SMTP_STORE_LINK not set. Please add SMTP_STORE_LINK to your environment variables for email links to work properly.");
  return "";
}
var transport = (0, import_nodemailer.createTransport)({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  disableFileAccess: true,
  disableUrlAccess: true
});
function passwordResetEmail({ url }) {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Please click below to reset your password
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Reset Password</a></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            If you did not request this email you can safely ignore it.
          </td>
        </tr>
      </table>
    </body>
  `;
}
async function sendPasswordResetEmail(resetToken, to, baseUrl) {
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const info = await transport.sendMail({
    to,
    from: process.env.SMTP_FROM,
    subject: "Your password reset token!",
    html: passwordResetEmail({
      url: `${frontendUrl}/dashboard/reset?token=${resetToken}`
    })
  });
  if (process.env.SMTP_USER?.includes("ethereal.email")) {
    console.log(`\u{1F4E7} Message Sent!  Preview it at ${(0, import_nodemailer.getTestMessageUrl)(info)}`);
  }
}

// features/keystone/mutations/approval-control.ts
var APPROVAL_TTL_MS = 24 * 60 * 60 * 1e3;
var approvalExpiry = (from = /* @__PURE__ */ new Date()) => new Date(from.getTime() + APPROVAL_TTL_MS);
var reviewPayload = (value) => JSON.parse(JSON.stringify(value ?? null));
var approvalReview = (payload) => ({ requestPayload: reviewPayload(payload), expiresAt: approvalExpiry() });
var isTrustedInternalContext = (context, capability) => Boolean(context?.trustedTenantId && context?.trustedActorId && context?.trustedCapabilities?.includes(capability)) && (process.env.NODE_ENV === "test" || Boolean(process.env.NODE_TEST_CONTEXT) || process.env.SPORTSBOOK_SANDBOX === "true");
var lockUser = (tx, userId) => tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR SHARE`;
var holdsTenantCapability = (user, tenantId, capability) => Boolean(user && user.tenantId === tenantId && user.role && user.role.tenantId === tenantId && user.role[capability] && user.tenant?.status === "ACTIVE");
async function assertCurrentActor(tx, context, tenantId, capability) {
  if (isTrustedInternalContext(context, capability)) {
    if (context.trustedTenantId !== tenantId) throw new Error("Not found");
    return String(context.trustedActorId);
  }
  const actorId = context?.session?.itemId;
  if (!actorId) throw new Error("Not found");
  await lockUser(tx, actorId);
  const user = await tx.user.findUnique({ where: { id: actorId }, include: { role: true, tenant: true } });
  if (!holdsTenantCapability(user, tenantId, capability) || !user.operatorMfaEnabled) throw new Error("Not found");
  return actorId;
}
async function assertApprovalAuthority(tx, approval, executorId) {
  if (!approval.approverId || approval.approverId === approval.requesterId) throw new Error("DUAL_CONTROL_REQUIRED");
  if (approval.approverId === executorId) throw new Error("DUAL_CONTROL_REQUIRED");
  await lockUser(tx, approval.approverId);
  const [approver, requester] = await Promise.all([
    tx.user.findUnique({ where: { id: approval.approverId }, include: { role: true, tenant: true } }),
    tx.user.findUnique({ where: { id: approval.requesterId }, select: { id: true, tenantId: true } })
  ]);
  if (!holdsTenantCapability(approver, approval.tenantId, "canApproveSensitiveActions")) throw new Error("APPROVER_AUTHORITY_NOT_CURRENT");
  if (!requester || requester.tenantId !== approval.tenantId) throw new Error("REQUESTER_AUTHORITY_NOT_CURRENT");
}
async function consumeApproval(tx, context, input) {
  const executorId = await assertCurrentActor(tx, context, input.tenantId, input.capability);
  await tx.$queryRaw`SELECT id FROM "ApprovalRequest" WHERE id = ${input.approvalId} AND tenant = ${input.tenantId} FOR UPDATE`;
  const row = await tx.approvalRequest.findFirst({ where: { id: input.approvalId, tenantId: input.tenantId, action: input.action, payloadHash: input.payloadHash, status: "APPROVED" } });
  if (!row?.approverId || row.approverId === row.requesterId) throw new Error("DUAL_CONTROL_REQUIRED");
  if (row.consumedAt) {
    if (input.consumedKey && row.consumedKey === input.consumedKey) return { ...row, replay: true };
    throw new Error("APPROVAL_ALREADY_CONSUMED");
  }
  if (!row.expiresAt) throw new Error("APPROVAL_REAPPROVAL_REQUIRED");
  if (new Date(row.expiresAt) <= /* @__PURE__ */ new Date()) throw new Error("APPROVAL_EXPIRED");
  await assertApprovalAuthority(tx, { tenantId: input.tenantId, requesterId: row.requesterId, approverId: row.approverId }, executorId);
  const claimed = await tx.approvalRequest.updateMany({
    where: { id: row.id, tenantId: input.tenantId, status: "APPROVED", consumedAt: null, expiresAt: { gt: /* @__PURE__ */ new Date() } },
    data: { consumedAt: /* @__PURE__ */ new Date(), consumedById: executorId, consumedKey: input.consumedKey ?? row.id }
  });
  if (claimed.count !== 1) throw new Error("APPROVAL_ALREADY_CONSUMED");
  return { ...row, replay: false };
}

// features/keystone/mutations/setting-policy.ts
async function normalizeTenantSetting(tx, tenantId, key2, raw) {
  const definition = await tx.configDefinition.findFirst({ where: { tenantId, key: key2 } });
  if (!definition) throw new Error("SETTING_NOT_DEFINED");
  if (definition.secret) throw new Error("SECRET_SETTING_NOT_SUPPORTED");
  const scopes = Array.isArray(definition.allowedScopes) ? definition.allowedScopes.map(String) : [];
  if (!scopes.includes("TENANT")) throw new Error("SETTING_SCOPE_NOT_ALLOWED");
  const text7 = String(raw ?? "").trim();
  let value;
  switch (definition.valueType) {
    case "MONEY":
      if (!/^\d+$/.test(text7)) throw new Error("INVALID_SETTING_VALUE");
      value = text7;
      break;
    case "INTEGER":
      if (!/^-?\d+$/.test(text7) || !Number.isSafeInteger(Number(text7))) throw new Error("INVALID_SETTING_VALUE");
      value = Number(text7);
      break;
    case "BOOLEAN":
      if (text7 !== "true" && text7 !== "false") throw new Error("INVALID_SETTING_VALUE");
      value = text7 === "true";
      break;
    case "JSON":
      try {
        value = JSON.parse(text7);
      } catch {
        throw new Error("INVALID_SETTING_VALUE");
      }
      if (!value || typeof value !== "object") throw new Error("INVALID_SETTING_VALUE");
      break;
    case "STRING":
      if (!text7) throw new Error("INVALID_SETTING_VALUE");
      value = text7;
      break;
    default:
      throw new Error("SETTING_TYPE_UNSUPPORTED");
  }
  return { definition, value, valueType: String(definition.valueType) };
}

// features/sportsbook/domain/zoned-time.ts
var LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
var EXPLICIT_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/i;
function wallClockMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(instant));
  const value = (type) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"), value("second")) + (instant % 1e3 + 1e3) % 1e3;
}
function validTimeZone(timeZone) {
  if (!timeZone) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return null;
  }
}
function resolveOperatorInstant(value, timeZone, label = "TIME") {
  const text7 = typeof value === "string" ? value.trim() : "";
  if (!text7) throw new Error(`INVALID_${label}`);
  if (EXPLICIT_OFFSET.test(text7)) {
    const instant = new Date(text7);
    if (Number.isNaN(instant.getTime())) throw new Error(`INVALID_${label}`);
    return instant;
  }
  const match = LOCAL_INPUT.exec(text7);
  if (!match) throw new Error(`INVALID_${label}`);
  const zone = validTimeZone(timeZone);
  if (!zone) throw new Error(`${label}_TIMEZONE_NOT_CONFIGURED`);
  const [, y, mo, d, h, mi, s, ms] = match;
  const local = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0), Number((ms ?? "0").padEnd(3, "0")));
  const check = new Date(local);
  if (check.getUTCFullYear() !== Number(y) || check.getUTCMonth() !== Number(mo) - 1 || check.getUTCDate() !== Number(d) || check.getUTCHours() !== Number(h) || check.getUTCMinutes() !== Number(mi)) throw new Error(`INVALID_${label}`);
  const offsets = new Set([-2, 0, 2].map((days) => {
    const probe = local + days * 864e5;
    return wallClockMs(probe, zone) - probe;
  }));
  const candidates = [...new Set([...offsets].map((offset) => local - offset))].filter((instant) => wallClockMs(instant, zone) === local);
  if (candidates.length === 0) throw new Error(`NONEXISTENT_LOCAL_${label}`);
  if (candidates.length > 1) throw new Error(`AMBIGUOUS_LOCAL_${label}_PROVIDE_OFFSET`);
  return new Date(candidates[0]);
}
async function tenantTimeZone(tx, tenantId) {
  const [tenant4, locale] = await Promise.all([
    tx.tenant.findUnique({ where: { id: tenantId }, select: { defaultTimezone: true } }),
    tx.brandLocale.findFirst({ where: { tenantId, status: "ACTIVE" }, orderBy: [{ default: "desc" }, { createdAt: "asc" }], select: { timezone: true } })
  ]);
  return validTimeZone(tenant4?.defaultTimezone) ?? validTimeZone(locale?.timezone) ?? "UTC";
}

// features/keystone/mutations/sportsbook.ts
var graphql = String.raw;
var requireUnscopedCapability = async (context, capability) => {
  const itemId = context.session?.itemId;
  if (!itemId || !hasOperatorMfaAssurance(context.session)) throw new Error("Not found");
  const user = await context.prisma.user.findUnique({ where: { id: itemId }, include: { role: true } });
  if (!user?.role?.[capability]) throw new Error("Not found");
  return user;
};
var requireTenant = async (context, capability = "canManageSportsbook") => {
  const isTrustedInternal = Boolean(context.trustedTenantId && context.trustedActorId && context.trustedCapabilities?.includes(capability)) && (process.env.NODE_ENV === "test" || Boolean(process.env.NODE_TEST_CONTEXT) || process.env.SPORTSBOOK_SANDBOX === "true");
  if (isTrustedInternal) return context.trustedTenantId;
  const user = await requireUnscopedCapability(context, capability);
  if (!user.tenantId) throw new Error("Not found");
  return user.tenantId;
};
async function lockWagerForSettlement(tx, tenantId, wagerId) {
  const rows = await tx.$queryRaw`SELECT id FROM "Wager" WHERE id = ${wagerId} AND tenant = ${tenantId} FOR UPDATE`;
  if (!rows.length) throw new Error("Not found");
}
async function assertCurrentSettlement(tx, tenantId, wagerId, settlementId) {
  const current = await tx.settlement.findFirst({ where: { tenantId, wagerId }, orderBy: { version: "desc" } });
  if (!current || current.id !== settlementId) throw new Error("STALE_SETTLEMENT_CORRECTION");
  return current;
}
var serializable2 = async (prisma, fn) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, { isolationLevel: "Serializable" });
    } catch (error) {
      if (attempt >= 7 || !isRetryableTransactionError(error)) throw error;
      await transactionBackoff(attempt);
    }
  }
};
var decimalOddsFromAmounts = (gross, stake) => {
  if (stake <= 0n) throw new Error("INVALID_STAKE");
  const scaled = gross * 1000000n / stake;
  return `${scaled / 1000000n}.${String(scaled % 1000000n).padStart(6, "0")}`;
};
var limitPeriodStart = (period, now) => new Date(now.getTime() - (period === "DAILY" ? 1 : period === "WEEKLY" ? 7 : 30) * 864e5);
var stakeLimitFacts = async (tx, tenantId, playerId, now, currency) => {
  const limits = (await tx.playerLimit.findMany({ where: { tenantId, playerId, type: "STAKE", effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] } })).filter((limit) => !limit.currency || limit.currency === currency);
  let selected = null;
  for (const limit of limits) {
    const wagers = await tx.wager.findMany({ where: { tenantId, playerId, currency, status: { not: "REJECTED" }, createdAt: { gte: limitPeriodStart(limit.period ?? "DAILY", now) } }, select: { stakeMinor: true } });
    const wageredInPeriod = wagers.reduce((sum, wager) => sum + BigInt(wager.stakeMinor), 0n), periodLimit = BigInt(limit.amountMinor), remaining = periodLimit - wageredInPeriod;
    if (!selected || remaining < selected.remaining) selected = { periodLimit, wageredInPeriod, remaining };
  }
  return selected;
};
var journalEntryFingerprint = (rows) => rows.map((e) => `${e.accountId}|${e.side}|${e.amountMinor ?? String(e.amount)}|${e.currency}`).sort().join("\n");
var postJournal = async (tx, tenantId, journal, correlationId) => {
  validateJournal(journal);
  const reversalOfId = journal.reversalOf ? (await tx.journalTransaction.findFirst({ where: { tenantId, idempotencyKey: journal.reversalOf } }))?.id ?? null : null;
  const prior = await tx.journalTransaction.findFirst({ where: { tenantId, idempotencyKey: journal.idempotencyKey } });
  if (prior) {
    const priorEntries = await tx.journalEntry.findMany({ where: { tenantId, transactionId: prior.id } });
    if (prior.type !== journal.type || prior.correlationId !== correlationId || (prior.reversalOfId ?? null) !== reversalOfId || journalEntryFingerprint(priorEntries) !== journalEntryFingerprint(journal.entries)) throw new Error("JOURNAL_IDEMPOTENCY_CONFLICT");
    return { ...prior, replayed: true };
  }
  const posted = await tx.journalTransaction.create({ data: { tenantId, type: journal.type, idempotencyKey: journal.idempotencyKey, correlationId, status: "POSTED", effectiveAt: /* @__PURE__ */ new Date(), reversalOfId } });
  await tx.journalEntry.createMany({ data: journal.entries.map((e) => ({ tenantId, transactionId: posted.id, accountId: e.accountId, side: e.side, amountMinor: String(e.amount), currency: e.currency })) });
  return posted;
};
var emit = async (tx, tenantId, aggregateType, aggregateId, eventType, payload) => tx.outboxMessage.create({ data: { tenantId, aggregateType, aggregateId, eventType, payload, status: "PENDING", attempts: 0, maxAttempts: 10, availableAt: /* @__PURE__ */ new Date() } });
var appendAudit = async (tx, tenantId, actorId, action, targetType, targetId, reason, payload) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tenantId}))`;
  const previous = await tx.auditEvent.findFirst({ where: { tenantId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  const payloadHash = evidenceHash(payload);
  const hash = evidenceHash({ tenantId, previousHash: previous?.hash ?? "", actorId, action, targetType, targetId, reason, payloadHash });
  return tx.auditEvent.create({ data: { tenantId, actorId, action, targetType, targetId, reason, payloadHash, previousHash: previous?.hash ?? "", hash } });
};
var requireScopedPlayer = async (tx, tenantId, playerId) => {
  const player = await tx.player.findFirst({ where: { id: playerId, tenantId } });
  if (!player) throw new Error("Not found");
  return player;
};
var parseObject = (value, label) => {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error(`INVALID_${label}`);
  }
};
var positiveMoney = (value, label) => {
  if (!/^\d+$/.test(value) || BigInt(value) <= 0n) throw new Error(`INVALID_${label}`);
  return value;
};
var roleCapabilityKeys = ["canAccessDashboard", "canManageOnboarding", "canManageSportsbook", "canTrade", "canManageRisk", "canManageCompliance", "canManageFinance", "canManageIntegrations", "canApproveSensitiveActions", "canReadAudit", "canManageRoles", "canManagePeople"];
var parseRoleCapabilities = (raw) => {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("INVALID_CAPABILITIES");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_CAPABILITIES");
  const input = value, result = {};
  for (const key2 of Object.keys(input)) {
    if (!roleCapabilityKeys.includes(key2) || typeof input[key2] !== "boolean") throw new Error("INVALID_CAPABILITIES");
    result[key2] = input[key2];
  }
  return result;
};
var accountMap = async (tx, tenantId, playerId, currency) => {
  const rows = await tx.ledgerAccount.findMany({ where: { tenantId, currency, OR: [{ playerId }, { key: { in: ["WAGERS_PENDING", "GAMING_REVENUE", "WINNINGS_EXPENSE", "PAYMENT_CLEARING"] } }] } });
  const map = Object.fromEntries(rows.map((a) => [a.key, a]));
  for (const key2 of ["PLAYER_CASH", "WAGERS_PENDING", "GAMING_REVENUE", "WINNINGS_EXPENSE", "PAYMENT_CLEARING"]) if (!map[key2]) throw new Error(`MISSING_LEDGER_ACCOUNT:${key2}`);
  return map;
};
var sportsbookTypeDefs = graphql`
  type WagerCommandResult { accepted: Boolean!, wagerId: ID, rejectionCode: String, termsHash: String!, potentialReturnMinor: String! }
  type OnboardingPreview { version: String!, fixtureHash: String!, payload: String! }
  extend type Mutation {
    previewSportsbookOnboarding(slug:String!,operatorName:String!,brandName:String!,domain:String!,currency:String!,currencyExponent:Int!,jurisdictionCode:String!,timezone:String!): OnboardingPreview!
    acceptStraightWager(quoteId:ID!,idempotencyKey:String!): WagerCommandResult!
    applySportsbookOnboarding(slug:String!,operatorName:String!,brandName:String!,domain:String!,currency:String!,currencyExponent:Int!,jurisdictionCode:String!,timezone:String!): OnboardingPreview!
    createCatalogEvent(competitionId:ID!,externalKey:String!,name:String!,startAt:String!,marketDefinition:String!,selections:String!): ID!
    ingestSandboxPrice(selectionId:ID!,decimalOdds:String!,line:String,sequence:String!,externalId:String!): Boolean!
    setMarketPrices(marketId:ID!,prices:String!,line:String): Int!
    setMarketStatus(marketId:ID!,status:String!,reason:String!,expectedVersion:Int!,expectedStatus:String!): Boolean!
    ingestSandboxResult(eventId:ID!,payload:String!): ID!
    requestResultApproval(resultVersionId:ID!,reason:String!): ID!
    approveResultVersion(resultVersionId:ID!,approvalId:ID!,reason:String!): Boolean!
    suspendMarket(marketId:ID!,reason:String!): Boolean!
    gradeMarket(marketId:ID!,resultVersionId:ID!,outcome:String!,factorNumerator:String,factorDenominator:String,ruleVersion:String!,reason:String!): ID!
    gradeMarketSelection(marketId:ID!,selectionId:ID!,resultVersionId:ID!,reason:String!): ID!
    createRiskLimit(profileId:ID!,scopeType:String!,scopeId:String!,maxStakeMinor:String!,maxPayoutMinor:String!,maxLiabilityMinor:String!,currency:String!): ID!
    openWagerInvestigation(wagerId:ID!,category:String!,reason:String!): ID!
    sandboxPayment(playerId:ID!,type:String!,amountMinor:String!,currency:String!,idempotencyKey:String!): ID!
    setResponsibleGamingLimit(playerId:ID!,type:String!,period:String!,amountMinor:String!,currency:String!): ID!
    selfExclude(playerId:ID!,scope:String!,endsAt:String): ID!
    openVerificationCase(playerId:ID!,type:String!,evidenceReference:String!): ID!
    decideVerificationCase(caseId:ID!,decision:String!,reason:String!): Boolean!
    reviewAMLCase(playerId:ID!,status:String!,riskBand:String!,reason:String!): ID!
    settleWager(wagerId:ID!,resultVersionId:ID!,outcome:String!,factorNumerator:String,factorDenominator:String,idempotencyKey:String!): ID!
    requestResettlementApproval(settlementId:ID!,resultVersionId:ID!,outcome:String!,factorNumerator:String,factorDenominator:String,reason:String!): ID!
    resettleWager(settlementId:ID!,resultVersionId:ID!,outcome:String!,factorNumerator:String,factorDenominator:String,idempotencyKey:String!,approvalId:ID!): ID!
    runReconciliation(type:String!,windowFrom:String!,windowTo:String!): ID!
    enqueueRecovery(aggregateType:String!,aggregateId:ID!,eventType:String!): ID!
    replayQueueItem(sourceType:String!,sourceId:ID!,reason:String!): ID!
    openOperationalIncident(severity:String!,title:String!,evidence:String!): ID!
    setIncidentStatus(incidentId:ID!,status:String!,reason:String!): Boolean!
    generateComplianceReport(type:String!,periodStart:String!,periodEnd:String!): ID!
    requestSettingChange(key:String!,value:String!,reason:String!): ID!
    applyApprovedSetting(approvalId:ID!,key:String!,value:String!): ID!
    bootstrapIndependentApprover(name:String!,email:String!,password:String!): ID!
    requestRoleDefinition(name:String!,capabilities:String!,reason:String!): ID!
    applyApprovedRoleDefinition(approvalId:ID!,name:String!,capabilities:String!): ID!
    requestRoleGrant(userId:ID!,roleId:ID!,reason:String!): ID!
    applyApprovedRoleGrant(approvalId:ID!,userId:ID!,roleId:ID!): ID!
    requestRoleRevocation(userId:ID!,reason:String!): ID!
    applyApprovedRoleRevocation(approvalId:ID!,userId:ID!,roleId:ID!): ID!
    requestOperatorAdmission(name:String!,email:String!,roleId:ID!,reason:String!): ID!
    applyApprovedOperatorAdmission(approvalId:ID!,name:String!,email:String!,roleId:ID!): ID!
    requestSensitiveApproval(action:String!,payloadHash:String!,reason:String!): ID!
    decideSensitiveApproval(approvalId:ID!,approve:Boolean!,reason:String!,payloadHash:String): Boolean!
    dismissOperatorOnboarding: String!
  }
`;
var sportsbookResolvers = {
  Mutation: {
    applySportsbookOnboarding: async (_root, args, context) => {
      await requireUnscopedCapability(context, "canManageOnboarding");
      if (typeof args.timezone !== "string" || !validTimeZone(args.timezone)) throw new Error("INVALID_TIMEZONE");
      const fixture = buildOnboardingFixture(args);
      const applied = await serializable2(context.prisma, async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${context.session.itemId} FOR UPDATE`;
        const actor = await tx.user.findUnique({ where: { id: context.session.itemId }, include: { role: true } });
        if (!actor?.role?.canManageOnboarding || !actor.operatorMfaEnabled) throw new Error("Not found");
        if (actor.role.tenantId && actor.role.tenantId !== actor.tenantId) throw new Error("ONBOARDING_ROLE_TENANT_MISMATCH");
        const existingTenant = await tx.tenant.findUnique({ where: { slug: args.slug } });
        if (actor.tenantId) {
          if (!existingTenant || existingTenant.id !== actor.tenantId) throw new Error("ONBOARDING_TENANT_MISMATCH");
        } else if (existingTenant) throw new Error("ONBOARDING_SLUG_UNAVAILABLE");
        if (existingTenant) {
          const operatorStage = await tx.onboardingProgress.findFirst({ where: { tenantId: existingTenant.id, stage: "OPERATOR" } }), manifest = operatorStage?.details?.manifest;
          if (!manifest?.fixtureHash) throw new Error("ONBOARDING_SETUP_UNVERIFIABLE");
          if (manifest.fixtureHash !== fixture.fixtureHash) throw new Error("ONBOARDING_CONFLICT");
        }
        if (existingTenant && (existingTenant.name !== args.operatorName || existingTenant.defaultTimezone !== args.timezone)) throw new Error("ONBOARDING_CONFLICT");
        const tenant4 = existingTenant ?? await tx.tenant.create({ data: { name: args.operatorName, slug: args.slug, status: "ACTIVE", defaultTimezone: args.timezone } });
        const existingBrand = await tx.brand.findFirst({ where: { tenantId: tenant4.id } });
        if (existingBrand && (existingBrand.domain !== args.domain || existingBrand.name !== args.brandName)) throw new Error("ONBOARDING_CONFLICT");
        const brand = existingBrand ?? await tx.brand.create({ data: { tenantId: tenant4.id, name: args.brandName, domain: args.domain, defaultLocale: "en", logoIcon: DEFAULT_STORE_LOGO_ICON, logoColor: DEFAULT_STORE_LOGO_COLOR, status: "ACTIVE" } });
        const jurisdiction = await tx.jurisdiction.upsert({ where: { code: args.jurisdictionCode }, create: { code: args.jurisdictionCode, authority: "UNCONFIGURED", status: "PENDING" }, update: {} });
        if (!await tx.operatorJurisdiction.findFirst({ where: { tenantId: tenant4.id, jurisdictionId: jurisdiction.id } })) await tx.operatorJurisdiction.create({ data: { tenantId: tenant4.id, jurisdictionId: jurisdiction.id, licenseReference: "EXTERNAL-GATE", policyVersion: "sandbox-v1", status: "PENDING" } });
        const operatorJurisdiction = await tx.operatorJurisdiction.findFirst({ where: { tenantId: tenant4.id, jurisdictionId: jurisdiction.id } });
        const onboardingUser = await tx.user.update({ where: { id: context.session.itemId }, data: { tenantId: tenant4.id, onboardingStatus: "in_progress" } });
        if (onboardingUser.roleId) await tx.role.updateMany({ where: { id: onboardingUser.roleId, OR: [{ tenantId: null }, { tenantId: tenant4.id }] }, data: { tenantId: tenant4.id } });
        const legalEntity = await tx.legalEntity.findFirst({ where: { tenantId: tenant4.id, registrationReference: "EXTERNAL-GATE" } }) ?? await tx.legalEntity.create({ data: { tenantId: tenant4.id, name: `${args.operatorName} legal entity`, countryCode: "UNCONFIGURED", registrationReference: "EXTERNAL-GATE", status: "PENDING" } });
        const currency = await tx.currencyDefinition.findUnique({ where: { code: args.currency } }) ?? await tx.currencyDefinition.create({ data: { code: args.currency, exponent: args.currencyExponent, name: `${args.currency} sandbox currency`, status: "ACTIVE" } });
        if (Number(currency.exponent) !== Number(args.currencyExponent)) throw new Error("CURRENCY_EXPONENT_CONFLICT");
        if (currency.status !== "ACTIVE") throw new Error("CURRENCY_NOT_ACTIVE");
        if (!await tx.tenantCurrency.findFirst({ where: { tenantId: tenant4.id, currencyId: currency.id } })) await tx.tenantCurrency.create({ data: { tenantId: tenant4.id, currencyId: currency.id, depositsEnabled: true, withdrawalsEnabled: true, wageringEnabled: true, defaultForBrand: true, status: "ACTIVE" } });
        if (!await tx.brandLocale.findFirst({ where: { tenantId: tenant4.id, brandId: brand.id, locale: "en-US" } })) await tx.brandLocale.create({ data: { tenantId: tenant4.id, brandId: brand.id, locale: "en-US", language: "en", timezone: args.timezone, termsVersion: "sandbox-full-v1", termsContentHash: evidenceHash({ type: "TERMS", version: "sandbox-full-v1" }), default: true, status: "ACTIVE" } });
        if (!await tx.operatorChannel.findFirst({ where: { tenantId: tenant4.id, key: "sandbox-web" } })) await tx.operatorChannel.create({ data: { tenantId: tenant4.id, legalEntityId: legalEntity.id, operatorJurisdictionId: operatorJurisdiction.id, brandId: brand.id, key: "sandbox-web", type: "WEB", status: "PENDING", capabilities: { mode: "sandbox", productionBlocked: true } } });
        for (const [key2, value, type] of [["currency", args.currency, "STRING"], ["currencyExponent", args.currencyExponent, "INTEGER"], ["houseRules", { straightFixedOdds: true, inPlay: true, parlay: true, system: true, roundRobin: true, teaser: true, eachWay: true, cashOut: true, partialAcceptance: true }, "JSON"], ["maxStakeMinor", "100000", "MONEY"], ["maxPayoutMinor", "1000000", "MONEY"], ["liveDelayMs", 3e3, "INTEGER"], ["minimumAge", 18, "INTEGER"], ["priceChangeConsent", ["EXACT", "ACCEPT_BETTER", "ACCEPT_WITHIN_TOLERANCE"], "JSON"]]) if (!await tx.configValue.findFirst({ where: { tenantId: tenant4.id, key: key2 } })) await tx.configValue.create({ data: { tenantId: tenant4.id, key: key2, value, valueType: type, scopeType: "TENANT", scopeId: tenant4.id, policyVersion: "sandbox-full-v1", effectiveFrom: /* @__PURE__ */ new Date() } });
        for (const [key2, valueType, mergeStrategy, description] of [["maxStakeMinor", "MONEY", "MIN", "Maximum accepted stake"], ["maxPayoutMinor", "MONEY", "MIN", "Maximum contractual payout"], ["liveDelayMs", "INTEGER", "MAX", "Minimum live acceptance delay"], ["wagerStructures", "JSON", "DENY_WINS", "Permitted wager structures"], ["minimumAge", "INTEGER", "MAX", "Minimum customer age"]]) if (!await tx.configDefinition.findFirst({ where: { tenantId: tenant4.id, key: key2 } })) await tx.configDefinition.create({ data: { tenantId: tenant4.id, key: key2, valueType, mergeStrategy, allowedScopes: ["TENANT", "JURISDICTION", "BRAND"], validationSchema: { mode: "sandbox" }, secret: false, description } });
        if (!await tx.jurisdictionPolicyVersion.findFirst({ where: { tenantId: tenant4.id, jurisdictionId: jurisdiction.id, version: 1 } })) await tx.jurisdictionPolicyVersion.create({ data: { tenantId: tenant4.id, jurisdictionId: jurisdiction.id, version: 1, authorityCitation: "UNCONFIGURED-EXTERNAL-GATE", policyDocument: { mode: "sandbox", productionActivation: false }, effectiveFrom: /* @__PURE__ */ new Date(), status: "DRAFT", evidenceHash: evidenceHash({ jurisdiction: args.jurisdictionCode, mode: "sandbox" }) } });
        for (const rule of [{ name: "sandbox-comprehensive", sportKey: "", rules: { structures: ["STRAIGHT", "PARLAY", "SYSTEM", "ROUND_ROBIN", "TEASER", "EACH_WAY"], cashOut: true, deadHeat: true, push: true, void: true, partialAcceptance: true } }, { name: "teaser:6", sportKey: "football", rules: { points: "6", decimalOdds: "1.91", approvedFor: ["spread", "total"] } }]) if (!await tx.houseRuleVersion.findFirst({ where: { tenantId: tenant4.id, name: rule.name, version: 1 } })) await tx.houseRuleVersion.create({ data: { tenantId: tenant4.id, name: rule.name, version: 1, sportKey: rule.sportKey, marketDefinitionKey: "", rules: rule.rules, semanticHash: evidenceHash(rule), effectiveFrom: /* @__PURE__ */ new Date(), status: "ACTIVE" } });
        for (const flag of [{ key: "sandbox.full-wagering", description: "Local comprehensive wager structures" }, { key: "sandbox.cashout", description: "Local deterministic cash-out" }, { key: "sandbox.promotions", description: "Local restricted-value promotions" }]) if (!await tx.featureFlag.findFirst({ where: { tenantId: tenant4.id, key: flag.key, scopeType: "TENANT", scopeId: tenant4.id } })) await tx.featureFlag.create({ data: { tenantId: tenant4.id, key: flag.key, description: flag.description, enabled: true, scopeType: "TENANT", scopeId: tenant4.id, safeDefault: false, ownerId: context.session.itemId } });
        for (const p of fixture.providers) if (!await tx.providerConnection.findFirst({ where: { tenantId: tenant4.id, adapterId: p.adapterId } })) await tx.providerConnection.create({ data: { tenantId: tenant4.id, adapterId: p.adapterId, adapterVersion: "1.0.0", configReference: `sandbox:${p.kind}`, capabilities: { kind: p.kind }, certificationStatus: "SANDBOX", status: "ACTIVE" } });
        const region = await tx.region.findFirst({ where: { tenantId: tenant4.id, key: "sandbox-global" } }) ?? await tx.region.create({ data: { tenantId: tenant4.id, key: "sandbox-global", name: "Sandbox global region", countryCodes: ["XX"], status: "ACTIVE" } });
        const sport = await tx.sport.findFirst({ where: { tenantId: tenant4.id, key: "football" } }) ?? await tx.sport.create({ data: { tenantId: tenant4.id, key: "football", name: "Football", active: true } });
        const competition = await tx.competition.findFirst({ where: { tenantId: tenant4.id, key: "sandbox-league" } }) ?? await tx.competition.create({ data: { tenantId: tenant4.id, sportId: sport.id, regionId: region.id, key: "sandbox-league", name: "Sandbox League", timezone: args.timezone, status: "ACTIVE" } });
        if (!await tx.season.findFirst({ where: { tenantId: tenant4.id, competitionId: competition.id, key: "sandbox-2026" } })) await tx.season.create({ data: { tenantId: tenant4.id, competitionId: competition.id, key: "sandbox-2026", name: "Sandbox 2026", startsAt: new Date(Date.now() - 30 * 864e5), endsAt: new Date(Date.now() + 180 * 864e5), status: "ACTIVE" } });
        for (const definition of [{ key: "match-result", name: "Match result", family: "MATCH_RESULT" }, { key: "moneyline", name: "Moneyline", family: "MONEYLINE" }, { key: "spread", name: "Point spread", family: "SPREAD" }, { key: "total", name: "Total", family: "TOTAL" }]) if (!await tx.marketDefinition.findFirst({ where: { tenantId: tenant4.id, key: definition.key, version: 1 } })) await tx.marketDefinition.create({ data: { tenantId: tenant4.id, key: definition.key, name: definition.name, sportKey: "*", parametersSchema: { line: definition.key === "spread" || definition.key === "total" }, gradingRuleFamily: definition.family, allowedPhases: ["PREMATCH", "LIVE"], status: "ACTIVE", version: 1 } });
        if (!await tx.limitProfile.findFirst({ where: { tenantId: tenant4.id, name: "Sandbox defaults" } })) await tx.limitProfile.create({ data: { tenantId: tenant4.id, name: "Sandbox defaults", version: 1, status: "ACTIVE", effectiveFrom: /* @__PURE__ */ new Date() } });
        if (!await tx.safeguardingAccount.findFirst({ where: { tenantId: tenant4.id, accountReference: "sandbox-safeguarding" } })) await tx.safeguardingAccount.create({ data: { tenantId: tenant4.id, legalEntityId: legalEntity.id, accountReference: "sandbox-safeguarding", classification: "NOT_PROTECTED", currency: args.currency, status: "ACTIVE", disclosureVersion: "sandbox-only" } });
        for (const policy of [{ recordClass: "AUDIT", days: 2555, mode: "PRESERVE" }, { recordClass: "CUSTOMER_SESSION", days: 30, mode: "DELETE" }, { recordClass: "GEO", days: 30, mode: "TOKENIZE" }]) if (!await tx.retentionPolicyVersion.findFirst({ where: { tenantId: tenant4.id, recordClass: policy.recordClass, version: 1 } })) await tx.retentionPolicyVersion.create({ data: { tenantId: tenant4.id, recordClass: policy.recordClass, version: 1, retentionDays: policy.days, archiveDays: 0, deletionMode: policy.mode, legalHoldWins: true, effectiveFrom: /* @__PURE__ */ new Date(), status: "ACTIVE", evidenceHash: evidenceHash(policy) } });
        for (const job of [{ type: "PROVIDER_HEALTH", scopeId: tenant4.id, key: "onboarding-provider-health" }, { type: "EXPIRY", scopeId: tenant4.id, key: "onboarding-expiry" }, { type: "NOTIFICATION", scopeId: tenant4.id, key: "onboarding-notification" }]) if (!await tx.scheduledJob.findFirst({ where: { tenantId: tenant4.id, idempotencyKey: job.key } })) await tx.scheduledJob.create({ data: { tenantId: tenant4.id, type: job.type, scopeType: "TENANT", scopeId: job.scopeId, payload: { source: "onboarding" }, status: "SCHEDULED", dueAt: /* @__PURE__ */ new Date(), attempts: 0, maxAttempts: 10, idempotencyKey: job.key } });
        for (const stage of ["OPERATOR", "BRAND", "POLICY", "PROVIDERS", "CATALOG", "GOVERNANCE", "FINANCE", "PROMOTIONS", "OPERATIONS"]) {
          const progress = await tx.onboardingProgress.findFirst({ where: { tenantId: tenant4.id, stage } });
          if (stage === "PROMOTIONS") {
            const transition = prepareSandboxPromotionProgress(progress, fixture.fixtureHash);
            if (transition.kind === "CREATE") await tx.onboardingProgress.create({ data: { tenantId: tenant4.id, stage, status: "PENDING", evidenceHash: transition.evidenceHash, details: { mode: "sandbox", promotionProvisioning: "PENDING" } } });
            if (transition.kind === "RESET_PENDING") {
              const reset = await tx.onboardingProgress.updateMany({ where: { id: progress.id, tenantId: tenant4.id, stage, status: "COMPLETE", evidenceHash: transition.previousEvidenceHash }, data: { status: "PENDING", evidenceHash: transition.evidenceHash, completedAt: null, details: { mode: "sandbox", promotionProvisioning: "PENDING" } } });
              if (reset.count !== 1) throw new Error("ONBOARDING_PROMOTIONS_PROGRESS_STALE");
            }
          } else if (!progress) await tx.onboardingProgress.create({ data: { tenantId: tenant4.id, stage, status: "COMPLETE", evidenceHash: evidenceHash({ fixtureHash: fixture.fixtureHash, stage }), completedAt: /* @__PURE__ */ new Date(), details: stage === "OPERATOR" ? { mode: "sandbox", manifest: { fixtureHash: fixture.fixtureHash, actorId: context.session.itemId, input: { slug: args.slug, operatorName: args.operatorName, brandName: args.brandName, domain: args.domain, currency: args.currency, currencyExponent: args.currencyExponent, jurisdictionCode: args.jurisdictionCode, timezone: args.timezone }, tenantId: tenant4.id, brandId: brand.id, currencyId: currency.id, jurisdictionId: jurisdiction.id } } : { mode: "sandbox" } } });
        }
        for (const stage of ["LICENSING", "CERTIFICATION"]) {
          const progress = await tx.onboardingProgress.findFirst({ where: { tenantId: tenant4.id, stage } });
          if (!progress) await tx.onboardingProgress.create({ data: { tenantId: tenant4.id, stage, status: "BLOCKED", evidenceHash: evidenceHash({ fixtureHash: fixture.fixtureHash, stage, external: true }), details: { externalGate: true } } });
        }
        await appendAudit(tx, tenant4.id, context.session.itemId, "operator.onboarded", "Tenant", tenant4.id, "SANDBOX_ONBOARDING", { fixtureHash: fixture.fixtureHash, brandId: brand.id });
        return { tenantId: tenant4.id, brandId: brand.id };
      });
      await ensurePromotionsThenComplete(
        () => ensureSandboxPromotions(context.prisma, applied.tenantId),
        async () => {
          const completeHash = evidenceHash({ fixtureHash: fixture.fixtureHash, stage: "PROMOTIONS" });
          const pendingHash = evidenceHash({ fixtureHash: fixture.fixtureHash, stage: "PROMOTIONS", provisioning: "PENDING" });
          const completed = await context.prisma.onboardingProgress.updateMany({ where: { tenantId: applied.tenantId, stage: "PROMOTIONS", status: "PENDING", evidenceHash: pendingHash }, data: { status: "COMPLETE", evidenceHash: completeHash, completedAt: /* @__PURE__ */ new Date(), details: { mode: "sandbox" } } });
          if (completed.count === 1) return;
          const existing = await context.prisma.onboardingProgress.findFirst({ where: { tenantId: applied.tenantId, stage: "PROMOTIONS", status: "COMPLETE", evidenceHash: completeHash }, select: { id: true } });
          if (!existing) throw new Error("ONBOARDING_PROMOTIONS_PROGRESS_NOT_PENDING");
        }
      );
      await context.prisma.user.updateMany({ where: { id: context.session.itemId, tenantId: applied.tenantId }, data: { onboardingStatus: "completed" } });
      return { version: fixture.version, fixtureHash: fixture.fixtureHash, payload: JSON.stringify({ ...fixture, fullProduct: { tenantId: applied.tenantId, brandId: applied.brandId, structures: ["STRAIGHT", "PARLAY", "SYSTEM", "ROUND_ROBIN", "TEASER", "EACH_WAY"], cashOut: true, promotions: true, inPlay: true } }) };
    },
    createCatalogEvent: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const competition = await tx.competition.findFirst({ where: { id: a.competitionId, tenantId } });
        if (!competition) throw new Error("Not found");
        const startAt = resolveOperatorInstant(a.startAt, await tenantTimeZone(tx, tenantId), "START_TIME");
        let selections;
        try {
          selections = JSON.parse(a.selections);
        } catch {
          throw new Error("INVALID_SELECTIONS");
        }
        if (!Array.isArray(selections) || selections.length < 2 || selections.some((x) => !String(x?.key ?? "").trim() || !String(x?.label ?? "").trim()) || new Set(selections.map((x) => String(x.key).trim())).size !== selections.length) throw new Error("INVALID_SELECTIONS");
        const definition = await tx.marketDefinition.findFirst({ where: { tenantId, key: a.marketDefinition, status: "ACTIVE" }, orderBy: { version: "desc" } });
        if (!definition) throw new Error("MARKET_DEFINITION_NOT_ACTIVE");
        const duplicate = await tx.event.findFirst({ where: { tenantId, externalKey: a.externalKey } });
        if (duplicate) throw new Error("EXTERNAL_KEY_EXISTS");
        const event = await tx.event.create({ data: { tenantId, competitionId: competition.id, externalKey: a.externalKey, name: a.name, startAt, status: "SCHEDULED", version: 1 } });
        const market = await tx.market.create({ data: { tenantId, eventId: event.id, definitionId: definition.id, definitionKey: definition.key, parameters: {}, tradingMode: "PREMATCH", cashOutEnabled: true, status: "SUSPENDED", version: 1 } });
        await tx.tradingStatusChange.create({ data: { tenantId, scopeType: "MARKET", scopeId: market.id, fromStatus: AWAITING_PRICES, toStatus: "SUSPENDED", reason: "Awaiting prices", source: "CATALOG", actorId: context.session.itemId, effectiveAt: /* @__PURE__ */ new Date() } });
        await tx.selection.createMany({ data: selections.map((selection) => ({ tenantId, marketId: market.id, key: String(selection.key), label: String(selection.label), status: "OPEN" })) });
        await appendAudit(tx, tenantId, context.session.itemId, "catalog.event_created", "Event", event.id, "OPERATOR_ENTRY", { competitionId: competition.id, marketId: market.id, definitionId: definition.id, externalKey: a.externalKey, selections });
        return event.id;
      });
    },
    /** Trader pricing: one decimal price per selection of a market, sequenced and enveloped by the server. */
    setMarketPrices: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      let prices;
      try {
        prices = JSON.parse(a.prices);
      } catch {
        throw new Error("INVALID_PRICES");
      }
      if (!prices || typeof prices !== "object" || Array.isArray(prices)) throw new Error("INVALID_PRICES");
      const entries = Object.entries(prices).map(([selectionId, odds]) => [selectionId, String(odds ?? "").trim()]).filter(([, odds]) => odds !== "");
      if (!entries.length || entries.length > 50) throw new Error("INVALID_PRICES");
      for (const [, odds] of entries) {
        if (!/^\d{1,4}(\.\d{1,4})?$/.test(odds) || Number(odds) <= 1) throw new Error("INVALID_DECIMAL_ODDS");
      }
      const line = typeof a.line === "string" ? a.line.trim().slice(0, 32) : "";
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const market = await tx.market.findFirst({ where: { id: a.marketId, tenantId }, select: { id: true, status: true } });
        const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-sports", certificationStatus: "SANDBOX", status: "ACTIVE" } });
        if (!market || !provider) throw new Error("Not found");
        if (!["OPEN", "SUSPENDED"].includes(market.status)) throw new Error("MARKET_NOT_TRADING");
        const now = /* @__PURE__ */ new Date();
        for (const [selectionId, decimalOdds] of entries) {
          const selection = await tx.selection.findFirst({ where: { id: selectionId, tenantId, marketId: market.id }, select: { id: true } });
          if (!selection) throw new Error("SELECTION_NOT_IN_MARKET");
          const latest = await tx.priceSnapshot.findFirst({ where: { tenantId, selectionId }, orderBy: { receivedAt: "desc" }, select: { sequence: true } });
          const sequence = String((Number.parseInt(latest?.sequence ?? "0", 10) || 0) + 1);
          const payload = { source: "TRADER", marketId: market.id, selectionId, decimalOdds, line, sequence, actorId: context.session.itemId };
          const envelope = await tx.rawEnvelope.create({ data: { tenantId, providerConnectionId: provider.id, direction: "INBOUND", externalId: `trader:${(0, import_node_crypto5.randomUUID)()}`, schemaVersion: "sandbox.v1", payload, payloadHash: evidenceHash(payload), receivedAt: now } });
          await tx.priceSnapshot.create({ data: { tenantId, selectionId, providerConnectionId: provider.id, decimalOdds, line, sequence, effectiveAt: now, receivedAt: now, rawEnvelopeId: envelope.id, status: "OPEN" } });
        }
        await appendAudit(tx, tenantId, context.session.itemId, "market.priced", "Market", market.id, "TRADER_PRICE", { selections: entries.length });
        return entries.length;
      });
    },
    ingestSandboxPrice: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const selection = await tx.selection.findFirst({ where: { id: a.selectionId, tenantId } });
        const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-sports", certificationStatus: "SANDBOX", status: "ACTIVE" } });
        if (!selection || !provider) throw new Error("Not found");
        const envelope = await tx.rawEnvelope.create({ data: { tenantId, providerConnectionId: provider.id, direction: "INBOUND", externalId: a.externalId, schemaVersion: "sandbox.v1", payload: a, payloadHash: evidenceHash(a), receivedAt: /* @__PURE__ */ new Date() } }).catch(async () => null);
        await tx.priceSnapshot.create({ data: { tenantId, selectionId: a.selectionId, providerConnectionId: provider.id, decimalOdds: a.decimalOdds, line: a.line || "", sequence: a.sequence, effectiveAt: /* @__PURE__ */ new Date(), receivedAt: /* @__PURE__ */ new Date(), rawEnvelopeId: envelope?.id, status: "OPEN" } });
        return true;
      });
    },
    setMarketStatus: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      if (!["OPEN", "SUSPENDED", "CLOSED"].includes(a.status)) throw new Error("INVALID_MARKET_STATUS");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const market = await tx.market.findFirst({ where: { id: a.marketId, tenantId }, include: { event: { select: { status: true } } } });
        if (!market) throw new Error("Not found");
        if (Number(market.version ?? 1) !== Number(a.expectedVersion) || market.status !== a.expectedStatus) throw new Error("STALE_MARKET_REVIEW_REFRESH_REQUIRED");
        if (a.status === "OPEN" && market.status === "SUSPENDED") {
          const changes = await tx.tradingStatusChange.findMany({ where: { tenantId, scopeType: "MARKET", scopeId: market.id }, select: { fromStatus: true, toStatus: true } });
          const selections = await tx.selection.findMany({ where: { tenantId, marketId: market.id }, select: { id: true } });
          let unpricedSelections = 0;
          for (const selection of selections) {
            if (!await tx.priceSnapshot.findFirst({ where: { tenantId, selectionId: selection.id, status: "OPEN" }, select: { id: true } })) unpricedSelections++;
          }
          assertMarketFirstOpenAllowed({ eventStatus: market.event?.status, createdAwaitingPrices: changes.some((change) => change.fromStatus === AWAITING_PRICES), everOpened: changes.some((change) => change.toStatus === "OPEN"), unpricedSelections, selections: selections.length });
        } else if (a.status === "OPEN") assertMarketOpenAllowed(market.status, market.event?.status);
        if (market.status === a.status) return true;
        const updated = await tx.market.updateMany({ where: { id: market.id, tenantId, status: market.status, version: market.version }, data: { status: a.status, version: Number(market.version ?? 0) + 1 } });
        if (updated.count !== 1) throw new Error("STALE_MARKET_STATE");
        await tx.tradingStatusChange.create({ data: { tenantId, scopeType: "MARKET", scopeId: market.id, fromStatus: market.status, toStatus: a.status, reason: a.reason, source: "OPERATOR", actorId: context.session.itemId, effectiveAt: /* @__PURE__ */ new Date() } });
        await appendAudit(tx, tenantId, context.session.itemId, `market.${String(a.status).toLowerCase()}`, "Market", market.id, a.reason, { from: market.status, to: a.status });
        return true;
      });
    },
    ingestSandboxResult: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      let payload;
      try {
        payload = JSON.parse(a.payload);
      } catch {
        throw new Error("INVALID_CANONICAL_RESULT");
      }
      const canonical2 = parseCanonicalSelectionFacts(payload, a.eventId);
      const payloadHash = evidenceHash(payload);
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const event = await tx.event.findFirst({ where: { id: a.eventId, tenantId } });
        const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-results", certificationStatus: "SANDBOX", status: "ACTIVE" } });
        if (!event || !provider) throw new Error("Not found");
        if (event.status === "CANCELLED" || new Date(event.startAt).getTime() > Date.now()) throw new Error("EVENT_NOT_STARTED");
        for (const fact of canonical2.facts) {
          const market = await tx.market.findFirst({ where: { id: fact.marketKey, tenantId, eventId: event.id } });
          if (market?.status === "OPEN") throw new Error("MARKET_STILL_OPEN");
          const selections = market ? await tx.selection.findMany({ where: { tenantId, marketId: market.id, key: fact.selectionKey }, take: 2 }) : [];
          if (!market || selections.length !== 1) throw new Error("CANONICAL_RESULT_SUBJECT_SCOPE_MISMATCH");
        }
        const latest = await tx.resultVersion.findFirst({ where: { tenantId, eventId: event.id }, orderBy: { version: "desc" } });
        const result = await tx.resultVersion.create({ data: { tenantId, eventId: event.id, providerConnectionId: provider.id, version: (latest?.version ?? 0) + 1, status: "PENDING", payload, payloadHash } });
        await appendAudit(tx, tenantId, context.session.itemId, "result.entered", "ResultVersion", result.id, "PENDING_INDEPENDENT_APPROVAL", { eventId: event.id, payloadHash, version: result.version });
        return result.id;
      });
    },
    requestResultApproval: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "PENDING" } });
        if (!result) throw new Error("Not found");
        const payloadHash = resultApprovalHash(result);
        const approval = await tx.approvalRequest.create({ data: { tenantId, action: "APPROVE_RESULT", payloadHash, requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "result.approval_requested", "ResultVersion", result.id, a.reason, { approvalId: approval.id, payloadHash });
        return approval.id;
      });
    },
    approveResultVersion: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return serializable2(context.prisma, async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        let result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "PENDING" } });
        if (!result) throw new Error("Not found");
        await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${result.eventId} AND tenant = ${tenantId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "ResultVersion" WHERE id = ${result.id} AND tenant = ${tenantId} FOR UPDATE`;
        await requireTenant({ ...context, prisma: tx }, "canManageRisk");
        result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "PENDING" } });
        if (!result) throw new Error("STALE_RESULT_STATE");
        const resultEvent = await tx.event.findFirst({ where: { id: result.eventId, tenantId }, select: { startAt: true, status: true } });
        if (!resultEvent || resultEvent.status === "CANCELLED" || new Date(resultEvent.startAt).getTime() > Date.now()) throw new Error("EVENT_NOT_STARTED");
        const payloadHash = resultApprovalHash(result);
        const approval = await tx.approvalRequest.findFirst({ where: { id: a.approvalId, tenantId, action: "APPROVE_RESULT", payloadHash, status: "APPROVED" } });
        if (!approval || !approval.approverId || approval.approverId === approval.requesterId) throw new Error("DUAL_CONTROL_REQUIRED");
        await tx.resultVersion.updateMany({ where: { tenantId, eventId: result.eventId, status: "APPROVED" }, data: { status: "SUPERSEDED" } });
        await tx.resultVersion.update({ where: { id: result.id }, data: { status: "APPROVED", approvedAt: /* @__PURE__ */ new Date() } });
        await emit(tx, tenantId, "EVENT", result.eventId, "settlement.requested", { resultVersionId: result.id, reason: a.reason });
        await appendAudit(tx, tenantId, context.session.itemId, "result.approved", "ResultVersion", result.id, a.reason, { approvalId: approval.id, payloadHash });
        return true;
      });
    },
    suspendMarket: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canTrade");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canTrade");
        const m = await tx.market.findFirst({ where: { id: a.marketId, tenantId } });
        if (!m) throw new Error("Not found");
        await tx.market.update({ where: { id: m.id }, data: { status: "SUSPENDED", version: { increment: 1 } } });
        await tx.tradingStatusChange.create({ data: { tenantId, scopeType: "MARKET", scopeId: m.id, fromStatus: m.status, toStatus: "SUSPENDED", reason: a.reason, source: "OPERATOR", actorId: context.session.itemId, effectiveAt: /* @__PURE__ */ new Date() } });
        await appendAudit(tx, tenantId, context.session.itemId, "market.suspended", "Market", m.id, a.reason, { from: m.status, to: "SUSPENDED" });
        return true;
      });
    },
    gradeMarket: async (_r, _a, context) => {
      await requireTenant(context, "canManageRisk");
      throw new Error("SELECTION_RESULT_REQUIRED");
    },
    gradeMarketSelection: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        await tx.$queryRaw`SELECT id FROM "Selection" WHERE id = ${a.selectionId} AND tenant = ${tenantId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "ResultVersion" WHERE id = ${a.resultVersionId} AND tenant = ${tenantId} FOR UPDATE`;
        const selection = await tx.selection.findFirst({ where: { id: a.selectionId, tenantId }, include: { market: true } }), result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "APPROVED" } });
        if (!selection?.market || !result || selection.market.id !== a.marketId || selection.market.eventId !== result.eventId) throw new Error("UNAPPROVED_OR_MISMATCHED_RESULT");
        const fact = resolveCanonicalSelectionFact(result.payload, result.eventId, selection.market.id, selection.key);
        if (!fact) throw new Error("CANONICAL_SELECTION_RESULT_REQUIRED");
        const now = /* @__PURE__ */ new Date(), rule = await activeHouseRule(tx, tenantId, selection.market, now);
        if (!rule) throw new Error("APPROVED_HOUSE_RULE_REQUIRED");
        const ruleBody = rule.rules ?? {};
        if (fact.outcome === "DEAD_HEAT" && ruleBody.deadHeat !== true || fact.outcome === "PUSH" && ruleBody.push !== true || fact.outcome === "VOID" && ruleBody.void !== true) throw new Error("OUTCOME_NOT_ALLOWED_BY_HOUSE_RULE");
        const ruleVersion = `${rule.name}@${rule.version}`, inputHash = evidenceHash({ marketId: selection.market.id, selectionId: selection.id, resultVersionId: result.id, outcome: fact.outcome, factorNumerator: fact.factorNumerator ?? null, factorDenominator: fact.factorDenominator ?? null, ruleVersion, ruleHash: rule.semanticHash, resultHash: result.payloadHash });
        const prior = await tx.marketGrade.findFirst({ where: { tenantId, inputHash } });
        if (prior) return prior.id;
        const grade = await tx.marketGrade.create({ data: { tenantId, marketId: selection.market.id, resultVersionId: result.id, ruleVersion, outcome: fact.outcome, factorNumerator: fact.factorNumerator ?? "", factorDenominator: fact.factorDenominator ?? "", trace: { selectionId: selection.id, selectionKey: selection.key, reason: a.reason, resultHash: result.payloadHash, factHash: evidenceHash(fact), ruleId: rule.id, ruleHash: rule.semanticHash }, inputHash } });
        const legs = await tx.wagerLeg.findMany({ where: { tenantId, marketKey: selection.market.id, selectionKey: selection.id } });
        const legGradeRows = (gradeId, rows) => rows.map((leg) => ({ tenantId, wagerLegId: leg.id, marketGradeId: gradeId, outcome: fact.outcome, factorNumerator: fact.factorNumerator ?? "", factorDenominator: fact.factorDenominator ?? "", inputHash: evidenceHash({ gradeId, legId: leg.id, selectionId: selection.id }) }));
        const sameRuleLegs = legs.filter((leg) => leg.ruleVersion === ruleVersion);
        if (sameRuleLegs.length) await tx.legGrade.createMany({ data: legGradeRows(grade.id, sameRuleLegs) });
        const reviewRequiredLegIds = [];
        for (const accepted of [...new Set(legs.filter((leg) => leg.ruleVersion !== ruleVersion).map((leg) => String(leg.ruleVersion ?? "")))]) {
          const acceptedLegs = legs.filter((leg) => String(leg.ruleVersion ?? "") === accepted), match = /^(.+)@(\d+)$/.exec(accepted), acceptedRule = match ? await tx.houseRuleVersion.findFirst({ where: { tenantId, name: match[1], version: Number(match[2]) } }) : null, acceptedBody = acceptedRule?.rules ?? {};
          if (!acceptedRule || !await approvedHouseRuleEvidence(tx, tenantId, acceptedRule) || fact.outcome === "DEAD_HEAT" && acceptedBody.deadHeat !== true || fact.outcome === "PUSH" && acceptedBody.push !== true || fact.outcome === "VOID" && acceptedBody.void !== true) {
            reviewRequiredLegIds.push(...acceptedLegs.map((leg) => leg.id));
            continue;
          }
          const acceptedInputHash = evidenceHash({ marketId: selection.market.id, selectionId: selection.id, resultVersionId: result.id, outcome: fact.outcome, factorNumerator: fact.factorNumerator ?? null, factorDenominator: fact.factorDenominator ?? null, ruleVersion: accepted, ruleHash: acceptedRule.semanticHash, resultHash: result.payloadHash });
          if (await tx.marketGrade.findFirst({ where: { tenantId, inputHash: acceptedInputHash } })) continue;
          const acceptedGrade = await tx.marketGrade.create({ data: { tenantId, marketId: selection.market.id, resultVersionId: result.id, ruleVersion: accepted, outcome: fact.outcome, factorNumerator: fact.factorNumerator ?? "", factorDenominator: fact.factorDenominator ?? "", trace: { selectionId: selection.id, selectionKey: selection.key, reason: a.reason, resultHash: result.payloadHash, factHash: evidenceHash(fact), ruleId: acceptedRule.id, ruleHash: acceptedRule.semanticHash }, inputHash: acceptedInputHash } });
          await tx.legGrade.createMany({ data: legGradeRows(acceptedGrade.id, acceptedLegs) });
        }
        if (reviewRequiredLegIds.length) await appendAudit(tx, tenantId, context.session.itemId, "selection.grade_review_required", "Selection", selection.id, "ACCEPTED_RULE_UNRESOLVED", { resultVersionId: result.id, legIds: reviewRequiredLegIds });
        const selections = await tx.selection.findMany({ where: { tenantId, marketId: selection.market.id }, select: { id: true } }), grades = await tx.marketGrade.findMany({ where: { tenantId, marketId: selection.market.id, resultVersionId: result.id }, select: { trace: true } }), gradedIds = new Set(grades.map((item) => String(item.trace?.selectionId ?? ""))), complete = selections.length > 0 && selections.every((item) => gradedIds.has(item.id));
        await tx.market.update({ where: { id: selection.market.id }, data: { status: complete ? "GRADED" : "SUSPENDED", version: { increment: 1 } } });
        await appendAudit(tx, tenantId, context.session.itemId, "selection.graded", "Selection", selection.id, a.reason, { gradeId: grade.id, marketId: selection.market.id, resultVersionId: result.id, outcome: fact.outcome, ruleVersion, inputHash, complete });
        return grade.id;
      });
    },
    createRiskLimit: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      positiveMoney(a.maxStakeMinor, "MAX_STAKE");
      positiveMoney(a.maxPayoutMinor, "MAX_PAYOUT");
      positiveMoney(a.maxLiabilityMinor, "MAX_LIABILITY");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        const profile = await tx.limitProfile.findFirst({ where: { id: a.profileId, tenantId, status: "ACTIVE" } });
        if (!profile) throw new Error("Not found");
        const scopeType = String(a.scopeType || ""), scopeId = String(a.scopeId || "").trim();
        if (!["TENANT", "MARKET", "EVENT", "PLAYER"].includes(scopeType)) throw new Error("INVALID_LIMIT_SCOPE_TYPE");
        if (scopeType === "TENANT") {
          if (scopeId && scopeId !== tenantId) throw new Error("TENANT_SCOPE_TAKES_NO_TARGET");
        } else {
          if (!scopeId) throw new Error("LIMIT_SCOPE_TARGET_REQUIRED");
          const target = scopeType === "MARKET" ? await tx.market.findFirst({ where: { id: scopeId, tenantId }, select: { id: true } }) : scopeType === "EVENT" ? await tx.event.findFirst({ where: { id: scopeId, tenantId }, select: { id: true } }) : await tx.player.findFirst({ where: { id: scopeId, tenantId }, select: { id: true } });
          if (!target) throw new Error("LIMIT_SCOPE_TARGET_NOT_FOUND");
        }
        const currency = await tx.tenantCurrency.findFirst({ where: { tenantId, status: "ACTIVE", currency: { code: String(a.currency || "") } }, select: { id: true } });
        if (!currency) throw new Error("LIMIT_CURRENCY_NOT_CONFIGURED");
        const rule = await tx.limitRule.create({ data: { tenantId, profileId: profile.id, scopeType, scopeId: scopeType === "TENANT" ? "" : scopeId, maxStakeMinor: a.maxStakeMinor, maxPayoutMinor: a.maxPayoutMinor, maxLiabilityMinor: a.maxLiabilityMinor, currency: a.currency, priority: 100 } });
        await appendAudit(tx, tenantId, context.session.itemId, "risk.limit_created", "LimitRule", rule.id, "OPERATOR_ACTION", { profileId: profile.id, scopeType: a.scopeType, scopeId: a.scopeId });
        return rule.id;
      });
    },
    openWagerInvestigation: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        const wager = await tx.wager.findFirst({ where: { id: a.wagerId, tenantId } });
        if (!wager) throw new Error("Not found");
        const dispute = await tx.dispute.create({ data: { tenantId, playerId: wager.playerId, wagerId: wager.id, category: a.category, status: "INVESTIGATING", evidence: { reason: a.reason, openedBy: context.session.itemId } } });
        await tx.disputeEvent.create({ data: { tenantId, disputeId: dispute.id, type: "INVESTIGATION_OPENED", actorId: context.session.itemId, evidenceHash: evidenceHash({ wagerId: wager.id, reason: a.reason }), details: { reason: a.reason } } });
        await appendAudit(tx, tenantId, context.session.itemId, "wager.investigation_opened", "Wager", wager.id, a.reason, { disputeId: dispute.id, category: a.category });
        return dispute.id;
      });
    },
    sandboxPayment: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageFinance");
      if (!["DEPOSIT", "WITHDRAWAL"].includes(a.type)) throw new Error("INVALID_PAYMENT");
      positiveMoney(String(a.amountMinor ?? ""), "PAYMENT_AMOUNT");
      if (!/^[A-Za-z0-9:_-]{8,128}$/.test(String(a.idempotencyKey ?? ""))) throw new Error("INVALID_IDEMPOTENCY_KEY");
      const actorId = context.session.itemId, deposit = a.type === "DEPOSIT", amount = BigInt(a.amountMinor);
      const requestHash = evidenceHash({ action: "OPERATOR_SANDBOX_PAYMENT", tenantId, actorId, playerId: a.playerId, type: a.type, amountMinor: String(amount), currency: a.currency });
      const prepared = await serializable2(context.prisma, async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageFinance");
        const prior = await tx.paymentIntent.findFirst({ where: { tenantId, idempotencyKey: a.idempotencyKey }, include: { providerConnection: true } });
        if (prior) {
          if (prior.riskEvidence?.requestHash !== requestHash) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
          return { intent: prior, provider: prior.providerConnection, fresh: false };
        }
        const player = await tx.player.findFirst({ where: { id: a.playerId, tenantId } });
        if (!player) throw new Error("Not found");
        const enabled = (await tx.tenantCurrency.findMany({ where: { tenantId, status: "ACTIVE" }, include: { currency: true } })).find((row) => row.currency?.code === a.currency && row.currency?.status === "ACTIVE" && (deposit ? row.depositsEnabled : row.withdrawalsEnabled));
        if (!enabled) throw new Error("PAYMENT_CURRENCY_UNAVAILABLE");
        const accounts = await accountMap(tx, tenantId, a.playerId, a.currency);
        const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-payments", status: "ACTIVE" }, orderBy: [{ failoverPriority: "asc" }, { createdAt: "asc" }, { id: "asc" }] });
        if (!provider) throw new Error("PAYMENT_PROVIDER_UNAVAILABLE");
        let holdId = null;
        if (!deposit) {
          const current = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
          if (current) await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${current.id} FOR UPDATE`;
          const projection = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
          if (!projection || BigInt(projection.availableMinor) < amount) throw new Error("INSUFFICIENT_FUNDS");
          holdId = (await tx.hold.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, purposeType: "WITHDRAWAL", purposeId: `operator:${a.idempotencyKey}`, amountMinor: String(amount), status: "ACTIVE", expiresAt: null, version: 1 } })).id;
          await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, ...nextProjection(projection, reserveChange(amount)) } });
        }
        const intent = await tx.paymentIntent.create({ data: { tenantId, playerId: a.playerId, providerConnectionId: provider.id, holdId, type: a.type, amountMinor: String(amount), feeMinor: "0", currency: a.currency, idempotencyKey: a.idempotencyKey, status: "PROCESSING", riskEvidence: { mode: "SANDBOX", requestHash, actorId, provider: { connectionId: provider.id, adapterId: provider.adapterId, adapterVersion: provider.adapterVersion, configReference: provider.configReference, certificationStatus: provider.certificationStatus } } } });
        await tx.paymentAttempt.create({ data: { tenantId, paymentIntentId: intent.id, attempt: 1, externalReference: "", status: "PENDING", reasonCode: "PREPARED" } });
        await appendAudit(tx, tenantId, actorId, "payment.prepared", "PaymentIntent", intent.id, "SANDBOX_ADAPTER", { type: a.type, amountMinor: String(amount), currency: a.currency, holdId, providerConnectionId: provider.id });
        return { intent, provider, fresh: true };
      });
      const settledStatus = (status3, id) => {
        if (status3 === "SUCCEEDED") return id;
        if (["PENDING", "PROCESSING", "UNKNOWN"].includes(status3 ?? "")) throw new Error(`PAYMENT_OUTCOME_UNKNOWN:${id}`);
        throw new Error(`PAYMENT_${status3 ?? "FAILED"}:${id}`);
      };
      if (!["PENDING", "PROCESSING", "UNKNOWN"].includes(prepared.intent.status ?? "")) return settledStatus(prepared.intent.status, prepared.intent.id);
      const outcome = await dispatchPinnedPayment(prepared.intent, prepared.provider, prepared.fresh);
      const finalStatus = await serializable2(context.prisma, async (tx) => {
        await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${prepared.intent.id} FOR UPDATE`;
        const current = await tx.paymentIntent.findUnique({ where: { id: prepared.intent.id } });
        if (!current) throw new Error("Not found");
        if (!["PENDING", "PROCESSING", "UNKNOWN"].includes(current.status ?? "")) return current.status;
        const accounts = await accountMap(tx, tenantId, current.playerId, current.currency), value = BigInt(current.amountMinor), isDeposit = current.type === "DEPOSIT", now = /* @__PURE__ */ new Date();
        const lockProjection = async () => {
          const latest = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
          if (latest) await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${latest.id} FOR UPDATE`;
          const locked = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
          if (!locked) throw new Error("PAYMENT_LEDGER_UNAVAILABLE");
          return locked;
        };
        let status3 = outcome.status;
        if (status3 === "SUCCEEDED") {
          const journal = await postJournal(tx, tenantId, { idempotencyKey: `payment:${current.idempotencyKey}`, type: current.type, entries: [{ accountId: accounts.PAYMENT_CLEARING.id, currency: current.currency, side: isDeposit ? "DEBIT" : "CREDIT", amount: value }, { accountId: accounts.PLAYER_CASH.id, currency: current.currency, side: isDeposit ? "CREDIT" : "DEBIT", amount: value }] }, current.id);
          if (journal.replayed) throw new Error("JOURNAL_ALREADY_POSTED");
          if (!isDeposit) {
            const captured = await tx.hold.updateMany({ where: { id: current.holdId ?? "", tenantId, status: "ACTIVE" }, data: { status: "CAPTURED", version: { increment: 1 } } });
            if (captured.count !== 1) throw new Error("WITHDRAWAL_HOLD_NOT_ACTIVE");
          }
          await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, ...nextProjection(await lockProjection(), isDeposit ? postedChange(value) : captureChange(value), now) } });
        } else if (status3 === "FAILED") {
          if (!isDeposit && current.holdId) {
            const released = await tx.hold.updateMany({ where: { id: current.holdId, tenantId, status: "ACTIVE" }, data: { status: "RELEASED", version: { increment: 1 } } });
            if (released.count === 1) await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, ...nextProjection(await lockProjection(), releaseChange(value), now) } });
          }
        } else status3 = "UNKNOWN";
        await tx.paymentIntent.update({ where: { id: current.id }, data: { status: status3, completedAt: status3 === "UNKNOWN" ? null : now, ...outcome.externalRef ? { providerSessionReference: outcome.externalRef } : {} } });
        const attempt = await tx.paymentAttempt.findFirst({ where: { tenantId, paymentIntentId: current.id }, orderBy: { attempt: "desc" } });
        if (attempt) await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: status3, reasonCode: outcome.reasonCode, ...outcome.externalRef ? { externalReference: outcome.externalRef } : {} } });
        await emit(tx, tenantId, "PAYMENT", current.id, status3 === "SUCCEEDED" ? "payment.completed.v1" : status3 === "FAILED" ? "payment.failed.v1" : "payment.unknown.v1", { type: current.type, amountMinor: current.amountMinor, currency: current.currency, providerConnectionId: current.providerConnectionId, reasonCode: outcome.reasonCode });
        await appendAudit(tx, tenantId, actorId, status3 === "SUCCEEDED" ? "payment.completed" : status3 === "FAILED" ? "payment.failed" : "payment.outcome_unknown", "PaymentIntent", current.id, "SANDBOX_ADAPTER", { type: current.type, amountMinor: current.amountMinor, currency: current.currency, externalReference: outcome.externalRef, reasonCode: outcome.reasonCode });
        return status3;
      });
      return settledStatus(finalStatus, prepared.intent.id);
    },
    setResponsibleGamingLimit: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      if (!/^\d+$/.test(a.amountMinor) || BigInt(a.amountMinor) < 0n) throw new Error("INVALID_LIMIT");
      if (!["DEPOSIT", "STAKE", "LOSS", "SESSION"].includes(a.type)) throw new Error("INVALID_LIMIT_TYPE");
      if (!["DAILY", "WEEKLY", "MONTHLY"].includes(a.period)) throw new Error("INVALID_LIMIT_PERIOD");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        await requireScopedPlayer(tx, tenantId, a.playerId);
        const unit = a.type === "SESSION" ? "MIN" : String(a.currency || "");
        if (a.type === "SESSION") {
          if (a.currency && a.currency !== "MIN") throw new Error("SESSION_LIMIT_IS_MINUTES");
        } else if (!await tx.tenantCurrency.findFirst({ where: { tenantId, status: "ACTIVE", currency: { code: unit } }, select: { id: true } })) throw new Error("LIMIT_CURRENCY_NOT_CONFIGURED");
        if (a.type === "SESSION" && (!/^\d{1,5}$/.test(a.amountMinor) || Number(a.amountMinor) < 1 || Number(a.amountMinor) > { DAILY: 1440, WEEKLY: 10080, MONTHLY: 43200 }[a.period])) throw new Error("INVALID_SESSION_LIMIT");
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`player-limit:${tenantId}:${a.playerId}`}))`;
        const now = /* @__PURE__ */ new Date(), active = await tx.playerLimit.findFirst({ where: { tenantId, playerId: a.playerId, type: a.type, period: a.period, effectiveFrom: { lte: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, orderBy: { effectiveFrom: "desc" } }), increase = Boolean(active && BigInt(a.amountMinor) > BigInt(active.amountMinor)), effectiveFrom = increase ? new Date(now.getTime() + 24 * 36e5) : now;
        await tx.playerLimit.updateMany({ where: { tenantId, playerId: a.playerId, type: a.type, period: a.period, effectiveFrom: { gt: now }, OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] }, data: { effectiveTo: now } });
        if (active) await tx.playerLimit.update({ where: { id: active.id }, data: { effectiveTo: effectiveFrom } });
        const limit = await tx.playerLimit.create({ data: { tenantId, playerId: a.playerId, type: a.type, period: a.period, amountMinor: a.amountMinor, currency: unit, effectiveFrom } });
        await appendAudit(tx, tenantId, context.session.itemId, "responsible_gaming.limit_set", "Player", a.playerId, increase ? "OPERATOR_ACTION_COOLING_OFF" : "OPERATOR_ACTION", { limitId: limit.id, type: a.type, period: a.period, amountMinor: a.amountMinor, currency: unit, effectiveFrom: effectiveFrom.toISOString() });
        return limit.id;
      }, { isolationLevel: "Serializable" });
    },
    selfExclude: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      if (!["OPERATOR", "ALL_WAGERING", "ALL_BRANDS"].includes(a.scope)) throw new Error("INVALID_EXCLUSION_SCOPE");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        await requireScopedPlayer(tx, tenantId, a.playerId);
        const endsAt = a.endsAt ? resolveOperatorInstant(a.endsAt, await tenantTimeZone(tx, tenantId), "EXCLUSION_END") : null;
        if (endsAt && endsAt.getTime() <= Date.now()) throw new Error("INVALID_EXCLUSION_END");
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`self-exclusion:${tenantId}:${a.playerId}`}))`;
        const now = /* @__PURE__ */ new Date(), active = await tx.selfExclusion.findFirst({ where: { tenantId, playerId: a.playerId, status: "ACTIVE", startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] }, orderBy: { startsAt: "desc" } });
        if (active) {
          const extendsProtection = endsAt === null ? active.endsAt !== null : active.endsAt !== null && endsAt.getTime() > active.endsAt.getTime();
          if (!extendsProtection) return active.id;
          await tx.selfExclusion.update({ where: { id: active.id }, data: { endsAt } });
          await appendAudit(tx, tenantId, context.session.itemId, "responsible_gaming.self_exclusion_extended", "Player", a.playerId, "OPERATOR_ACTION", { exclusionId: active.id, previousEndsAt: active.endsAt?.toISOString() ?? null, endsAt: endsAt?.toISOString() ?? null });
          return active.id;
        }
        const exclusion = await tx.selfExclusion.create({ data: { tenantId, playerId: a.playerId, scope: a.scope, startsAt: now, endsAt, status: "ACTIVE", source: "OPERATOR" } });
        await appendAudit(tx, tenantId, context.session.itemId, "responsible_gaming.self_excluded", "Player", a.playerId, "OPERATOR_ACTION", { exclusionId: exclusion.id, scope: a.scope, endsAt: endsAt?.toISOString() ?? null });
        return exclusion.id;
      }, { isolationLevel: "Serializable" });
    },
    openVerificationCase: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      if (!["KYC", "AGE", "ADDRESS"].includes(a.type)) throw new Error("INVALID_VERIFICATION_TYPE");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        await requireScopedPlayer(tx, tenantId, a.playerId);
        const provider = await tx.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-kyc", status: "ACTIVE" } });
        if (!provider) throw new Error("KYC_PROVIDER_UNAVAILABLE");
        const verification = await tx.verificationCase.create({ data: { tenantId, playerId: a.playerId, providerConnectionId: provider.id, type: a.type, status: "PENDING", evidenceReference: a.evidenceReference } });
        await tx.player.update({ where: { id: a.playerId }, data: { kycStatus: "PENDING" } });
        await appendAudit(tx, tenantId, context.session.itemId, "verification.opened", "Player", a.playerId, "COMPLIANCE_REVIEW", { caseId: verification.id, type: a.type });
        return verification.id;
      });
    },
    decideVerificationCase: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      if (!["APPROVED", "REJECTED"].includes(a.decision)) throw new Error("INVALID_DECISION");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        const verification = await tx.verificationCase.findFirst({ where: { id: a.caseId, tenantId, status: "PENDING" } });
        if (!verification?.playerId) throw new Error("Not found");
        await tx.verificationCase.update({ where: { id: verification.id }, data: { status: a.decision } });
        await tx.verificationCheck.create({ data: { tenantId, verificationCaseId: verification.id, attempt: 1, decision: a.decision === "APPROVED" ? "PASS" : "FAIL", reasonCode: a.reason } });
        if (verification.type === "KYC" || verification.type === "AGE" && a.decision === "REJECTED") await tx.player.update({ where: { id: verification.playerId }, data: { kycStatus: a.decision } });
        await appendAudit(tx, tenantId, context.session.itemId, "verification.decided", "VerificationCase", verification.id, a.reason, { decision: a.decision, playerId: verification.playerId });
        return true;
      });
    },
    reviewAMLCase: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      if (!["OPEN", "REVIEW", "CLOSED"].includes(a.status) || !["LOW", "MEDIUM", "HIGH"].includes(a.riskBand)) throw new Error("INVALID_AML_STATE");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        await requireScopedPlayer(tx, tenantId, a.playerId);
        const existing = await tx.aMLCase.findFirst({ where: { tenantId, playerId: a.playerId, status: { not: "CLOSED" } }, orderBy: { createdAt: "desc" } });
        const aml = existing ? await tx.aMLCase.update({ where: { id: existing.id }, data: { status: a.status, riskBand: a.riskBand, ownerId: context.session.itemId, restrictedEvidence: { reason: a.reason } } }) : await tx.aMLCase.create({ data: { tenantId, playerId: a.playerId, status: a.status, riskBand: a.riskBand, ownerId: context.session.itemId, restrictedEvidence: { reason: a.reason } } });
        await tx.player.update({ where: { id: a.playerId }, data: { riskBand: a.riskBand } });
        await appendAudit(tx, tenantId, context.session.itemId, "aml.case_updated", "AMLCase", aml.id, a.reason, { status: a.status, riskBand: a.riskBand, playerId: a.playerId });
        return aml.id;
      });
    },
    settleWager: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return serializable2(context.prisma, async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        const fullParts = await tx.wagerPart.findMany({ where: { tenantId, wagerId: a.wagerId }, take: 1 });
        if (fullParts.length) throw new Error("FULL_ENGINE_SETTLEMENT_REQUIRED");
        const old = await tx.settlement.findFirst({ where: { tenantId, wagerId: a.wagerId, inputHash: a.idempotencyKey } });
        if (old) return old.id;
        await lockWagerForSettlement(tx, tenantId, a.wagerId);
        const retry = await tx.settlement.findFirst({ where: { tenantId, wagerId: a.wagerId, inputHash: a.idempotencyKey } });
        if (retry) return retry.id;
        const current = await tx.settlement.findFirst({ where: { tenantId, wagerId: a.wagerId }, orderBy: { version: "desc" } });
        if (current) throw new Error("WAGER_ALREADY_SETTLED");
        const wager = await tx.wager.findFirst({ where: { id: a.wagerId, tenantId }, include: { from_WagerLeg_wager: true } });
        if (!wager) throw new Error("Not found");
        const result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "APPROVED" } });
        if (!result || !wager.from_WagerLeg_wager.some((leg) => leg.eventKey === result.eventId)) throw new Error("UNAPPROVED_OR_MISMATCHED_RESULT");
        const legIds = wager.from_WagerLeg_wager.map((leg) => leg.id);
        const grades = await tx.legGrade.findMany({ where: { tenantId, wagerLegId: { in: legIds }, marketGrade: { resultVersionId: result.id } }, include: { marketGrade: true } });
        if (grades.length !== legIds.length || grades.some((grade2) => grade2.outcome !== a.outcome)) throw new Error("MISSING_OR_MISMATCHED_GRADE");
        const grade = grades[0];
        const factorNumerator = grade.factorNumerator ? BigInt(grade.factorNumerator) : void 0, factorDenominator = grade.factorDenominator ? BigInt(grade.factorDenominator) : void 0;
        const payout = settlementAmount(BigInt(wager.stakeMinor), decimalOddsFromAmounts(BigInt(wager.potentialReturnMinor), BigInt(wager.stakeMinor)), { outcome: grade.outcome, factorNumerator, factorDenominator });
        const accounts = await accountMap(tx, tenantId, wager.playerId, wager.currency);
        const journal = settlementJournal({ idempotencyKey: `settlement:${a.idempotencyKey}`, stake: BigInt(wager.stakeMinor), payout, currency: wager.currency, pendingAccountId: accounts.WAGERS_PENDING.id, cashAccountId: accounts.PLAYER_CASH.id, revenueAccountId: accounts.GAMING_REVENUE.id, winningsExpenseAccountId: accounts.WINNINGS_EXPENSE.id });
        const posted = await postJournal(tx, tenantId, journal, wager.id);
        const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
        const nextBalance = BigInt(balance?.postedMinor ?? "0") + payout;
        await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, postedMinor: String(nextBalance), pendingMinor: balance?.pendingMinor ?? "0", availableMinor: String(BigInt(balance?.availableMinor ?? "0") + (nextBalance - BigInt(balance?.postedMinor ?? "0"))), version: (balance?.version ?? 0) + 1, asOf: /* @__PURE__ */ new Date() } });
        const s = await tx.settlement.create({ data: { tenantId, wagerId: wager.id, resultVersionId: a.resultVersionId, version: 1, outcome: a.outcome, payoutMinor: String(payout), inputHash: a.idempotencyKey, journalTransactionId: posted.id } });
        await tx.hold.updateMany({ where: { tenantId, purposeType: "WAGER", purposeId: wager.id, status: "ACTIVE" }, data: { status: "CAPTURED", version: { increment: 1 } } });
        await tx.wager.update({ where: { id: wager.id }, data: { status: "SETTLED" } });
        await emit(tx, tenantId, "WAGER", wager.id, "wager.settled.v1", { settlementId: s.id, version: 1, payoutMinor: String(payout), currency: wager.currency });
        await appendAudit(tx, tenantId, context.session.itemId, "wager.settled", "Wager", wager.id, "APPROVED_RESULT", { settlementId: s.id, resultVersionId: result.id, payoutMinor: String(payout) });
        return s.id;
      });
    },
    requestResettlementApproval: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        const settlement = await tx.settlement.findFirst({ where: { id: a.settlementId, tenantId }, include: { resultVersion: true } });
        const result = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "APPROVED" } });
        if (!settlement?.wagerId || !settlement.resultVersion || !result) throw new Error("Not found");
        if (await tx.wagerPart.findFirst({ where: { tenantId, wagerId: settlement.wagerId } })) throw new Error("FULL_ENGINE_SETTLEMENT_REQUIRED");
        await lockWagerForSettlement(tx, tenantId, settlement.wagerId);
        await assertCurrentSettlement(tx, tenantId, settlement.wagerId, settlement.id);
        if (result.eventId !== settlement.resultVersion.eventId || Number(result.version) <= Number(settlement.resultVersion.version)) throw new Error("OUT_OF_ORDER_RESULT_CORRECTION");
        const action = `RESETTLE_WAGER:${settlement.id}:${result.id}:${a.outcome}:${a.factorNumerator || "-"}:${a.factorDenominator || "-"}`;
        const payloadHash = evidenceHash({ action: "RESETTLE_WAGER", settlementId: settlement.id, resultVersionId: result.id, outcome: a.outcome, factorNumerator: a.factorNumerator ?? null, factorDenominator: a.factorDenominator ?? null });
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "resettlement.approval_requested", "Settlement", settlement.id, a.reason, { approvalId: approval.id, payloadHash });
        return approval.id;
      });
    },
    resettleWager: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRisk");
      return serializable2(context.prisma, async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRisk");
        const payloadHash = evidenceHash({ action: "RESETTLE_WAGER", settlementId: a.settlementId, resultVersionId: a.resultVersionId, outcome: a.outcome, factorNumerator: a.factorNumerator ?? null, factorDenominator: a.factorDenominator ?? null });
        const action = `RESETTLE_WAGER:${a.settlementId}:${a.resultVersionId}:${a.outcome}:${a.factorNumerator || "-"}:${a.factorDenominator || "-"}`;
        const approval = await tx.approvalRequest.findFirst({ where: { id: a.approvalId, tenantId, action, payloadHash, status: "APPROVED" } });
        if (!approval || !approval.approverId || approval.approverId === approval.requesterId) throw new Error("DUAL_CONTROL_REQUIRED");
        const old = await tx.settlement.findFirst({ where: { id: a.settlementId, tenantId }, include: { wager: true, resultVersion: true, journalTransaction: { include: { from_JournalEntry_transaction: true } } } });
        if (!old?.journalTransaction || !old.wager || !old.resultVersion) throw new Error("Not found");
        if (await tx.wagerPart.findFirst({ where: { tenantId, wagerId: old.wagerId } })) throw new Error("FULL_ENGINE_SETTLEMENT_REQUIRED");
        await lockWagerForSettlement(tx, tenantId, old.wagerId);
        const prior = await tx.settlement.findFirst({ where: { tenantId, wagerId: old.wagerId, inputHash: a.idempotencyKey } });
        if (prior) return prior.id;
        await assertCurrentSettlement(tx, tenantId, old.wagerId, old.id);
        const nextResult = await tx.resultVersion.findFirst({ where: { id: a.resultVersionId, tenantId, status: "APPROVED" } });
        if (!nextResult || nextResult.eventId !== old.resultVersion.eventId || Number(nextResult.version) <= Number(old.resultVersion.version)) throw new Error("OUT_OF_ORDER_RESULT_CORRECTION");
        const original = { idempotencyKey: old.journalTransaction.idempotencyKey, type: old.journalTransaction.type, entries: old.journalTransaction.from_JournalEntry_transaction.map((e) => ({ accountId: e.accountId, currency: e.currency, side: e.side, amount: BigInt(e.amountMinor) })) };
        await postJournal(tx, tenantId, reverseJournal(original, `resettle-reversal:${a.idempotencyKey}`), old.wagerId);
        const accounts = await accountMap(tx, tenantId, old.wager.playerId, old.wager.currency);
        const legs = await tx.wagerLeg.findMany({ where: { tenantId, wagerId: old.wagerId } }), grades = await tx.legGrade.findMany({ where: { tenantId, wagerLegId: { in: legs.map((leg) => leg.id) }, marketGrade: { resultVersionId: a.resultVersionId } } });
        if (!legs.length || grades.length !== legs.length || grades.some((grade2) => grade2.outcome !== a.outcome)) throw new Error("MISSING_OR_MISMATCHED_GRADE");
        const grade = grades[0], factorNumerator = grade.factorNumerator ? BigInt(grade.factorNumerator) : void 0, factorDenominator = grade.factorDenominator ? BigInt(grade.factorDenominator) : void 0;
        const payout = settlementAmount(BigInt(old.wager.stakeMinor), decimalOddsFromAmounts(BigInt(old.wager.potentialReturnMinor), BigInt(old.wager.stakeMinor)), { outcome: grade.outcome, factorNumerator, factorDenominator });
        const replacement = settlementJournal({ idempotencyKey: `resettle-replacement:${a.idempotencyKey}`, stake: BigInt(old.wager.stakeMinor), payout, currency: old.wager.currency, pendingAccountId: accounts.WAGERS_PENDING.id, cashAccountId: accounts.PLAYER_CASH.id, revenueAccountId: accounts.GAMING_REVENUE.id, winningsExpenseAccountId: accounts.WINNINGS_EXPENSE.id });
        const posted = await postJournal(tx, tenantId, replacement, old.wagerId);
        const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
        const corrected = BigInt(balance?.postedMinor ?? "0") - BigInt(old.payoutMinor) + payout;
        if (corrected < 0n) throw new Error("RESETTLEMENT_REQUIRES_RECEIVABLE_REVIEW");
        await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, postedMinor: String(corrected), pendingMinor: balance?.pendingMinor ?? "0", availableMinor: String(BigInt(balance?.availableMinor ?? "0") + (corrected - BigInt(balance?.postedMinor ?? "0"))), version: (balance?.version ?? 0) + 1, asOf: /* @__PURE__ */ new Date() } });
        const correctedSettlement = await tx.settlement.create({ data: { tenantId, wagerId: old.wagerId, resultVersionId: a.resultVersionId, version: old.version + 1, outcome: a.outcome, payoutMinor: String(payout), inputHash: a.idempotencyKey, journalTransactionId: posted.id, reversalOfId: old.id } });
        await emit(tx, tenantId, "WAGER", old.wagerId, "wager.resettled.v1", { settlementId: correctedSettlement.id, version: correctedSettlement.version, payoutMinor: String(payout), currency: old.wager.currency });
        await appendAudit(tx, tenantId, context.session.itemId, "wager.resettled", "Wager", old.wagerId, "DUAL_APPROVED", { approvalId: approval.id, settlementId: correctedSettlement.id, payloadHash });
        return correctedSettlement.id;
      });
    },
    runReconciliation: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageFinance");
      const zone = await tenantTimeZone(context.prisma, tenantId), windowFrom = resolveOperatorInstant(a.windowFrom, zone, "RECONCILIATION_WINDOW"), windowTo = resolveOperatorInstant(a.windowTo, zone, "RECONCILIATION_WINDOW");
      if (windowFrom >= windowTo) throw new Error("INVALID_RECONCILIATION_WINDOW");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageFinance");
        const entries = await tx.journalEntry.findMany({ where: { tenantId, transaction: { effectiveAt: { gte: windowFrom, lte: windowTo } } } }), analysis = analyzeJournalBalances(entries), difference = analysis.absoluteDifferenceMinor;
        const inputHash = evidenceHash({ type: a.type, windowFrom: windowFrom.toISOString(), windowTo: windowTo.toISOString(), entryCount: entries.length, unbalanced: analysis.unbalanced.map((item) => ({ transactionId: item.transactionId, currency: item.currency, debit: String(item.debitMinor), credit: String(item.creditMinor), difference: String(item.differenceMinor) })) });
        const run = await tx.reconciliationRun.create({ data: { tenantId, type: a.type, windowFrom, windowTo, status: "COMPLETED", inputHash, differenceMinor: String(difference) } });
        if (analysis.unbalanced.length) await tx.reconciliationItem.createMany({ data: analysis.unbalanced.map((item) => ({ tenantId, runId: run.id, internalReference: `journal:${item.transactionId}`, providerReference: "internal-ledger-control", differenceMinor: String(item.differenceMinor), currency: item.currency, status: "OPEN" })) });
        await emit(tx, tenantId, "RECONCILIATION", run.id, "reconciliation.run", { inputHash, differenceMinor: String(difference) });
        await appendAudit(tx, tenantId, context.session.itemId, "reconciliation.completed", "ReconciliationRun", run.id, "OPERATOR_ACTION", { inputHash, differenceMinor: String(difference) });
        return run.id;
      });
    },
    enqueueRecovery: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageIntegrations");
      if (!["recovery.requested", "recovery.requested.v1"].includes(a.eventType)) throw new Error("UNSUPPORTED_RECOVERY_EVENT");
      const unavailable = outboxEventUnavailableReason(a.eventType);
      if (unavailable) throw new Error(unavailable);
      return (await context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
        return tx.outboxMessage.create({ data: { tenantId, aggregateType: a.aggregateType, aggregateId: a.aggregateId, eventType: a.eventType, payload: a, status: "PENDING", attempts: 0, maxAttempts: 10, availableAt: /* @__PURE__ */ new Date() } });
      })).id;
    },
    replayQueueItem: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageIntegrations");
      if (!["OUTBOX", "INBOX", "DEAD_LETTER"].includes(a.sourceType)) throw new Error("INVALID_SOURCE_TYPE");
      if (typeof a.reason !== "string" || !a.reason.trim()) throw new Error("REPLAY_REASON_REQUIRED");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
        await requireTenant({ ...context, prisma: tx }, "canManageIntegrations");
        let kind = a.sourceType, sourceId = a.sourceId;
        if (a.sourceType === "DEAD_LETTER") {
          const dead = await tx.deadLetter.findFirst({ where: { id: a.sourceId, tenantId, resolvedAt: null } });
          if (!dead) throw new Error("Not found");
          kind = dead.sourceType;
          sourceId = dead.sourceId;
        }
        const model = replaySourceModel(kind);
        if (!model) throw new Error(`REPLAY_NOT_ALLOWED:REPLAY_UNSUPPORTED_SOURCE:${String(kind)}`);
        const item = await tx[model].findFirst({ where: { id: sourceId, tenantId } }), unavailable = replayUnavailableReason(item ? { kind, status: item.status, eventType: item.eventType, jobType: item.type } : null);
        if (unavailable) throw new Error(`REPLAY_NOT_ALLOWED:${unavailable}`);
        const reset = await tx[model].updateMany({ where: { id: item.id, tenantId, status: item.status, attempts: item.attempts }, data: kind === "SCHEDULED_JOB" ? { status: "SCHEDULED", dueAt: /* @__PURE__ */ new Date(), leaseUntil: null, leaseOwner: "", lastError: "" } : { status: "PENDING", availableAt: /* @__PURE__ */ new Date(), leaseUntil: null, leaseOwner: "", lastError: "" } });
        if (reset.count !== 1) throw new Error("REPLAY_SOURCE_CHANGED");
        const resolved = await tx.deadLetter.updateMany({ where: { tenantId, sourceType: kind, sourceId: item.id, resolvedAt: null }, data: { resolvedAt: /* @__PURE__ */ new Date() } });
        if (kind === "INBOX") await emit(tx, tenantId, "INBOX", item.id, "ingestion.replay", { reason: a.reason });
        await appendAudit(tx, tenantId, context.session.itemId, "queue.replayed", kind, item.id, a.reason, { requestedSourceType: a.sourceType, requestedSourceId: a.sourceId, observedStatus: item.status, attempts: item.attempts, resolvedDeadLetters: resolved.count });
        return item.id;
      });
    },
    openOperationalIncident: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageIntegrations");
      if (!["SEV1", "SEV2", "SEV3", "SEV4"].includes(a.severity)) throw new Error("INVALID_SEVERITY");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
        const incident = await tx.incident.create({ data: { tenantId, severity: a.severity, title: a.title, status: "OPEN", commanderId: context.session.itemId, evidence: parseObject(a.evidence, "EVIDENCE") } });
        await appendAudit(tx, tenantId, context.session.itemId, "incident.created", "Incident", incident.id, "OPERATOR_ACTION", { severity: a.severity, title: a.title });
        return incident.id;
      });
    },
    setIncidentStatus: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageIntegrations");
      if (!["OPEN", "MITIGATING", "RESOLVED"].includes(a.status)) throw new Error("INVALID_INCIDENT_STATUS");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
        const incident = await tx.incident.findFirst({ where: { id: a.incidentId, tenantId } });
        if (!incident) throw new Error("Not found");
        await tx.incident.update({ where: { id: incident.id }, data: { status: a.status, resolvedAt: a.status === "RESOLVED" ? /* @__PURE__ */ new Date() : null } });
        await appendAudit(tx, tenantId, context.session.itemId, "incident.status_changed", "Incident", incident.id, a.reason, { from: incident.status, to: a.status });
        return true;
      });
    },
    generateComplianceReport: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageCompliance");
      const zone = await tenantTimeZone(context.prisma, tenantId), periodStart2 = resolveOperatorInstant(a.periodStart, zone, "REPORT_PERIOD"), periodEnd = resolveOperatorInstant(a.periodEnd, zone, "REPORT_PERIOD");
      if (periodStart2 >= periodEnd) throw new Error("INVALID_REPORT_PERIOD");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
        const [wagers, audits, payments] = await Promise.all([tx.wager.count({ where: { tenantId, createdAt: { gte: periodStart2, lte: periodEnd } } }), tx.auditEvent.count({ where: { tenantId, createdAt: { gte: periodStart2, lte: periodEnd } } }), tx.paymentIntent.count({ where: { tenantId, createdAt: { gte: periodStart2, lte: periodEnd } } })]);
        const version = await tx.complianceReport.count({ where: { tenantId, type: a.type } }) + 1;
        const artifactHash = evidenceHash({ type: a.type, periodStart: periodStart2.toISOString(), periodEnd: periodEnd.toISOString(), wagers, audits, payments, version });
        const report = await tx.complianceReport.create({ data: { tenantId, type: a.type, periodStart: periodStart2, periodEnd, version, artifactHash, artifactReference: "", status: "DRAFT" } });
        await appendAudit(tx, tenantId, context.session.itemId, "report.draft_recorded", "ComplianceReport", report.id, "OPERATOR_ACTION", { artifactHash, type: a.type, counts: { wagers, audits, payments }, artifact: "NOT_GENERATED" });
        return report.id;
      });
    },
    requestSettingChange: async (_r, a, context) => {
      const tenantId = await requireTenant(context);
      if (!/^[A-Za-z][A-Za-z0-9_.-]{1,63}$/.test(a.key)) throw new Error("INVALID_SETTING_KEY");
      const payloadHash = evidenceHash({ action: "SETTING_CHANGE", key: a.key, value: a.value });
      const action = `SETTING_CHANGE:${a.key}:${Buffer.from(a.value).toString("base64url")}`;
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
        const normalized = await normalizeTenantSetting(tx, tenantId, a.key, a.value), current = await tx.configValue.findFirst({ where: { tenantId, key: a.key, scopeType: "TENANT", scopeId: tenantId, effectiveTo: null }, orderBy: [{ effectiveFrom: "desc" }, { id: "desc" }] });
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, ...approvalReview({ action: "SETTING_CHANGE", key: a.key, value: a.value, normalizedValue: normalized.value, valueType: normalized.valueType, scopeType: "TENANT", scopeId: tenantId, before: current ? { id: current.id, value: current.value, policyVersion: current.policyVersion } : null }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "setting.change_requested", "ApprovalRequest", approval.id, a.reason, { key: a.key, payloadHash });
        return approval.id;
      });
    },
    applyApprovedSetting: async (_r, a, context) => {
      const tenantId = await requireTenant(context);
      const payloadHash = evidenceHash({ action: "SETTING_CHANGE", key: a.key, value: a.value });
      return context.prisma.$transaction(async (tx) => {
        const action = `SETTING_CHANGE:${a.key}:${Buffer.from(a.value).toString("base64url")}`;
        const approval = await consumeApproval(tx, context, { tenantId, capability: "canManageSportsbook", approvalId: a.approvalId, action, payloadHash });
        if (approval.replay) throw new Error("APPROVAL_ALREADY_CONSUMED");
        const normalized = await normalizeTenantSetting(tx, tenantId, a.key, a.value);
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`config:${tenantId}:${a.key}`}))`;
        const now = /* @__PURE__ */ new Date();
        await tx.configValue.updateMany({ where: { tenantId, key: a.key, scopeType: "TENANT", scopeId: tenantId, effectiveTo: null }, data: { effectiveTo: now } });
        const value = normalized.value;
        const setting = await tx.configValue.create({ data: { tenantId, key: a.key, value, valueType: normalized.valueType, scopeType: "TENANT", scopeId: tenantId, policyVersion: `approved:${approval.id}`, effectiveFrom: /* @__PURE__ */ new Date() } });
        await appendAudit(tx, tenantId, context.session.itemId, "setting.changed", "ConfigValue", setting.id, "DUAL_APPROVED", { approvalId: approval.id, key: a.key, payloadHash });
        return setting.id;
      });
    },
    bootstrapIndependentApprover: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles");
      if (!/^\S+@\S+\.\S+$/.test(a.email) || String(a.password).length < 12) throw new Error("INVALID_APPROVER");
      return context.transaction(async (txContext) => {
        await txContext.prisma.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`approver-bootstrap:${tenantId}`}))`;
        await assertCurrentActor(txContext.prisma, context, tenantId, "canManageRoles");
        const existing = await txContext.prisma.user.count({ where: { tenantId, role: { canApproveSensitiveActions: true } } });
        if (existing) throw new Error("APPROVER_ALREADY_BOOTSTRAPPED");
        let role = await txContext.prisma.role.findFirst({ where: { tenantId, name: "Independent Approver" } });
        if (!role) role = await txContext.sudo().query.Role.createOne({ data: { tenant: { connect: { id: tenantId } }, name: "Independent Approver", canAccessDashboard: true, canApproveSensitiveActions: true, canReadAudit: true }, query: "id name" });
        const user = await txContext.sudo().query.User.createOne({ data: { tenant: { connect: { id: tenantId } }, role: { connect: { id: role.id } }, name: a.name, email: a.email, password: a.password }, query: "id email" });
        await txContext.prisma.roleGrant.create({ data: { tenantId, userId: user.id, roleId: role.id, scope: { tenantId, bootstrap: true }, effectiveFrom: /* @__PURE__ */ new Date(), status: "ACTIVE" } });
        await appendAudit(txContext.prisma, tenantId, context.session.itemId, "approver.bootstrapped", "User", user.id, "ONE_TIME_DUAL_CONTROL_BOOTSTRAP", { roleId: role.id, emailHash: evidenceHash(a.email.toLowerCase()) });
        return user.id;
      });
    },
    requestRoleDefinition: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles"), capabilities = parseRoleCapabilities(a.capabilities), payloadHash = evidenceHash({ action: "ROLE_DEFINITION", name: a.name, capabilities }), action = `ROLE_DEFINITION:${Buffer.from(JSON.stringify({ name: a.name, capabilities })).toString("base64url")}`;
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRoles");
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, ...approvalReview({ action: "ROLE_DEFINITION", name: a.name, capabilities }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.definition_requested", "Tenant", tenantId, a.reason, { approvalId: approval.id, name: a.name, capabilities, payloadHash });
        return approval.id;
      });
    },
    applyApprovedRoleDefinition: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles"), capabilities = parseRoleCapabilities(a.capabilities), payloadHash = evidenceHash({ action: "ROLE_DEFINITION", name: a.name, capabilities });
      return context.prisma.$transaction(async (tx) => {
        const action = `ROLE_DEFINITION:${Buffer.from(JSON.stringify({ name: a.name, capabilities })).toString("base64url")}`;
        const approval = await consumeApproval(tx, context, { tenantId, capability: "canManageRoles", approvalId: a.approvalId, action, payloadHash });
        if (approval.replay) throw new Error("APPROVAL_ALREADY_CONSUMED");
        const existing = await tx.role.findFirst({ where: { tenantId, name: a.name } });
        if (existing) throw new Error("ROLE_EXISTS");
        const role = await tx.role.create({ data: { tenantId, name: a.name, ...capabilities } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.defined", "Role", role.id, "DUAL_APPROVED", { approvalId: approval.id, name: a.name, capabilities });
        return role.id;
      });
    },
    requestRoleGrant: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRoles");
        const user = await tx.user.findFirst({ where: { id: a.userId, tenantId }, include: { role: true } }), role = await tx.role.findFirst({ where: { id: a.roleId, tenantId } });
        if (!user || !role) throw new Error("Not found");
        const action = `ROLE_GRANT:${user.id}:${role.id}`;
        const payloadHash = evidenceHash({ action: "ROLE_GRANT", userId: user.id, roleId: role.id });
        const { id: _roleId, tenantId: _roleTenant, createdAt: _rc, updatedAt: _ru, ...roleCapabilities } = role;
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, ...approvalReview({ action: "ROLE_GRANT", userId: user.id, userName: user.name, userEmail: user.email, roleId: role.id, roleName: role.name, capabilities: roleCapabilities, replacesRoleId: user.roleId ?? null, replacesRoleName: user.role?.name ?? null }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.grant_requested", "User", user.id, a.reason, { approvalId: approval.id, roleId: role.id, payloadHash });
        return approval.id;
      });
    },
    applyApprovedRoleGrant: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles");
      const payloadHash = evidenceHash({ action: "ROLE_GRANT", userId: a.userId, roleId: a.roleId });
      return context.prisma.$transaction(async (tx) => {
        const action = `ROLE_GRANT:${a.userId}:${a.roleId}`;
        const approval = await consumeApproval(tx, context, { tenantId, capability: "canManageRoles", approvalId: a.approvalId, action, payloadHash });
        if (approval.replay) throw new Error("APPROVAL_ALREADY_CONSUMED");
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${a.userId} AND tenant = ${tenantId} FOR UPDATE`;
        const user = await tx.user.findFirst({ where: { id: a.userId, tenantId } }), role = await tx.role.findFirst({ where: { id: a.roleId, tenantId } });
        if (!user || !role) throw new Error("Not found");
        const now = /* @__PURE__ */ new Date();
        const superseded = await tx.roleGrant.updateMany({ where: { tenantId, userId: user.id, status: "ACTIVE" }, data: { status: "REVOKED", effectiveTo: now } });
        await tx.user.update({ where: { id: user.id }, data: { roleId: role.id } });
        const grant = await tx.roleGrant.create({ data: { tenantId, userId: user.id, roleId: role.id, scope: { tenantId, approvalId: approval.id, replacesRoleId: user.roleId ?? null }, effectiveFrom: now, status: "ACTIVE" } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.granted", "User", user.id, "DUAL_APPROVED", { approvalId: approval.id, roleId: role.id, grantId: grant.id, previousRoleId: user.roleId ?? null, supersededGrants: superseded.count });
        return grant.id;
      });
    },
    requestRoleRevocation: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageRoles");
        const user = await tx.user.findFirst({ where: { id: a.userId, tenantId }, include: { role: true } });
        if (!user?.roleId) throw new Error("Not found");
        const action = `ROLE_REVOKE:${user.id}:${user.roleId}`, payloadHash = evidenceHash({ action: "ROLE_REVOKE", userId: user.id, roleId: user.roleId });
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, ...approvalReview({ action: "ROLE_REVOKE", userId: user.id, userName: user.name, userEmail: user.email, roleId: user.roleId, roleName: user.role?.name ?? null }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.revocation_requested", "User", user.id, a.reason, { approvalId: approval.id, roleId: user.roleId, payloadHash });
        return approval.id;
      });
    },
    applyApprovedRoleRevocation: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManageRoles");
      const action = `ROLE_REVOKE:${a.userId}:${a.roleId}`, payloadHash = evidenceHash({ action: "ROLE_REVOKE", userId: a.userId, roleId: a.roleId });
      return context.prisma.$transaction(async (tx) => {
        const approval = await consumeApproval(tx, context, { tenantId, capability: "canManageRoles", approvalId: a.approvalId, action, payloadHash });
        if (approval.replay) throw new Error("APPROVAL_ALREADY_CONSUMED");
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${a.userId} AND tenant = ${tenantId} FOR UPDATE`;
        const user = await tx.user.findFirst({ where: { id: a.userId, tenantId } });
        if (!user) throw new Error("Not found");
        if (user.roleId !== a.roleId) throw new Error("ROLE_ASSIGNMENT_CHANGED");
        const now = /* @__PURE__ */ new Date(), revoked = await tx.roleGrant.updateMany({ where: { tenantId, userId: user.id, status: "ACTIVE" }, data: { status: "REVOKED", effectiveTo: now } });
        await tx.user.update({ where: { id: user.id }, data: { roleId: null } });
        await appendAudit(tx, tenantId, context.session.itemId, "role.revoked", "User", user.id, "DUAL_APPROVED", { approvalId: approval.id, roleId: a.roleId, revokedGrants: revoked.count });
        return user.id;
      });
    },
    requestOperatorAdmission: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManagePeople"), email = String(a.email ?? "").trim().toLowerCase(), name = String(a.name ?? "").trim();
      if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2) throw new Error("INVALID_OPERATOR_ADMISSION");
      return context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManagePeople");
        const role = await tx.role.findFirst({ where: { id: a.roleId, tenantId } });
        if (!role) throw new Error("Not found");
        if (await tx.user.findUnique({ where: { email } })) throw new Error("OPERATOR_EMAIL_UNAVAILABLE");
        const emailHash = evidenceHash(email), action = `OPERATOR_ADMISSION:${emailHash}:${role.id}`, payloadHash = evidenceHash({ action: "OPERATOR_ADMISSION", name, email, roleId: role.id });
        const approval = await tx.approvalRequest.create({ data: { tenantId, action, payloadHash, ...approvalReview({ action: "OPERATOR_ADMISSION", name, email, roleId: role.id, roleName: role.name }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
        await appendAudit(tx, tenantId, context.session.itemId, "operator.admission_requested", "ApprovalRequest", approval.id, a.reason, { roleId: role.id, emailHash, payloadHash });
        return approval.id;
      });
    },
    applyApprovedOperatorAdmission: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canManagePeople"), email = String(a.email ?? "").trim().toLowerCase(), name = String(a.name ?? "").trim(), emailHash = evidenceHash(email), action = `OPERATOR_ADMISSION:${emailHash}:${a.roleId}`, payloadHash = evidenceHash({ action: "OPERATOR_ADMISSION", name, email, roleId: a.roleId });
      const token = (0, import_node_crypto6.randomBytes)(32).toString("base64url");
      const userId = await context.transaction(async (txContext) => {
        const approval = await consumeApproval(txContext.prisma, context, { tenantId, capability: "canManagePeople", approvalId: a.approvalId, action, payloadHash });
        if (approval.replay) throw new Error("APPROVAL_ALREADY_CONSUMED");
        const role = await txContext.prisma.role.findFirst({ where: { id: a.roleId, tenantId } });
        if (!role) throw new Error("Not found");
        if (await txContext.prisma.user.findUnique({ where: { email } })) throw new Error("OPERATOR_EMAIL_UNAVAILABLE");
        const user = await txContext.sudo().query.User.createOne({ data: { tenant: { connect: { id: tenantId } }, role: { connect: { id: role.id } }, name, email, password: (0, import_node_crypto6.randomBytes)(32).toString("base64url") }, query: "id" });
        await txContext.prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: evidenceHash(token), passwordResetIssuedAt: /* @__PURE__ */ new Date(), passwordResetRedeemedAt: null } });
        await txContext.prisma.roleGrant.create({ data: { tenantId, userId: user.id, roleId: role.id, scope: { tenantId, approvalId: approval.id, admission: true }, effectiveFrom: /* @__PURE__ */ new Date(), status: "ACTIVE" } });
        await appendAudit(txContext.prisma, tenantId, context.session.itemId, "operator.admitted", "User", user.id, "DUAL_APPROVED", { approvalId: approval.id, roleId: role.id, emailHash });
        return user.id;
      });
      await sendPasswordResetEmail(token, email);
      return userId;
    },
    requestSensitiveApproval: async (_r, a, context) => {
      const tenantId = await requireTenant(context);
      if (!/^[a-f0-9]{64}$/i.test(a.payloadHash)) throw new Error("INVALID_PAYLOAD_HASH");
      return (await context.prisma.$transaction(async (tx) => {
        await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
        return tx.approvalRequest.create({ data: { tenantId, action: a.action, payloadHash: a.payloadHash, ...approvalReview({ action: a.action, payloadHash: a.payloadHash, bodyAvailable: false }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      })).id;
    },
    decideSensitiveApproval: async (_r, a, context) => {
      const tenantId = await requireTenant(context, "canApproveSensitiveActions");
      const outcome = await serializable2(context.prisma, async (tx) => {
        const actorId = await assertCurrentActor(tx, context, tenantId, "canApproveSensitiveActions");
        const approval = await tx.approvalRequest.findFirst({ where: { id: a.approvalId, tenantId } });
        if (!approval) throw new Error("Not found");
        const decision = a.approve ? "APPROVED" : "REJECTED";
        if (approval.status !== "PENDING") {
          if (approval.approverId === actorId && approval.status === decision && (!a.payloadHash || a.payloadHash === approval.payloadHash)) return { decided: true };
          throw new Error("APPROVAL_ALREADY_DECIDED");
        }
        if (approval.requesterId === actorId) throw new Error("DUAL_CONTROL_REQUIRED");
        if (a.payloadHash && a.payloadHash !== approval.payloadHash) throw new Error("APPROVAL_PAYLOAD_CHANGED");
        const now = /* @__PURE__ */ new Date();
        if (approval.expiresAt && new Date(approval.expiresAt) <= now) {
          await tx.approvalRequest.updateMany({ where: { id: approval.id, tenantId, status: "PENDING" }, data: { status: "EXPIRED" } });
          return { expired: true };
        }
        const updated = await tx.approvalRequest.updateMany({ where: { id: approval.id, tenantId, status: "PENDING", payloadHash: approval.payloadHash, requesterId: { not: actorId } }, data: { approverId: actorId, status: decision, reason: a.reason, decidedAt: now, ...approval.expiresAt ? {} : { expiresAt: new Date(now.getTime() + APPROVAL_TTL_MS) } } });
        if (updated.count !== 1) throw new Error("APPROVAL_ALREADY_DECIDED");
        await appendAudit(tx, tenantId, actorId, a.approve ? "approval.approved" : "approval.rejected", "ApprovalRequest", approval.id, a.reason, { action: approval.action, payloadHash: approval.payloadHash });
        return { decided: true };
      });
      if (outcome.expired) throw new Error("APPROVAL_EXPIRED");
      return true;
    },
    dismissOperatorOnboarding: async (_r, _a, context) => {
      const userId = context.session?.itemId;
      if (!userId) throw new Error("AUTHENTICATION_REQUIRED");
      await context.prisma.user.updateMany({ where: { id: userId, onboardingStatus: { in: ["not_started", "in_progress"] } }, data: { onboardingStatus: "dismissed" } });
      const user = await context.prisma.user.findUnique({ where: { id: userId }, select: { onboardingStatus: true } });
      return String(user?.onboardingStatus ?? "not_started");
    },
    previewSportsbookOnboarding: async (_root, args, context) => {
      await requireUnscopedCapability(context, "canManageOnboarding");
      const fixture = buildOnboardingFixture(args);
      return { version: fixture.version, fixtureHash: fixture.fixtureHash, payload: JSON.stringify(fixture) };
    },
    acceptStraightWager: async (_root, args, context) => {
      const tenantId = await requireTenant(context);
      if (!context.trustedTenantId) throw new Error("CUSTOMER_SESSION_REQUIRED");
      if (!/^[A-Za-z0-9:_-]{8,128}$/.test(args.idempotencyKey)) throw new Error("INVALID_IDEMPOTENCY_KEY");
      const customerActor = context.customerActor;
      return serializable2(context.prisma, async (tx) => {
        if (customerActor) {
          if (customerActor.tenantId !== tenantId) throw new Error("Not found");
          await assertCurrentCustomerActor(tx, customerActor, true);
        }
        const customerCommand = context.customerCommand;
        if (customerCommand) {
          await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${customerCommand.id} AND tenant = ${tenantId} FOR UPDATE`;
        }
        const prior = await tx.wager.findFirst({ where: { tenantId, idempotencyKey: args.idempotencyKey, ...customerActor ? { playerId: customerActor.playerId } : {} } });
        if (prior) return { accepted: prior.status !== "REJECTED", wagerId: prior.id, rejectionCode: prior.status === "REJECTED" ? "PREVIOUSLY_REJECTED" : null, termsHash: prior.termsHash, potentialReturnMinor: prior.potentialReturnMinor };
        if (customerCommand) {
          const owned = await tx.customerCommand.findFirst({ where: { id: customerCommand.id, tenantId, type: "WAGER", ...customerActor ? { playerId: customerActor.playerId } : {} } });
          if (!owned) throw new Error("Not found");
          if (owned.status !== "IN_PROGRESS") throw new Error("CUSTOMER_COMMAND_ALREADY_COMPLETED");
        }
        const quote = await tx.quote.findFirst({ where: { id: args.quoteId, tenantId, ...customerActor ? { playerId: customerActor.playerId } : {} }, include: { player: true, priceSnapshot: true, selection: { include: { market: { include: { event: true } } } } } });
        if (!quote) throw new Error("Not found");
        const now = /* @__PURE__ */ new Date();
        const [currentTenant, latestPrice] = await Promise.all([
          tx.tenant.findFirst({ where: { id: tenantId, status: "ACTIVE" } }),
          tx.priceSnapshot.findFirst({ where: { tenantId, selectionId: quote.selectionId }, orderBy: { receivedAt: "desc" } })
        ]);
        const eventTradable = ["SCHEDULED", "LIVE"].includes(quote.selection?.market?.event?.status ?? "");
        const priceCurrent = Boolean(latestPrice && latestPrice.status === "OPEN" && (latestPrice.id === quote.priceSnapshotId || latestPrice.decimalOdds === quote.decimalOdds && String(latestPrice.line ?? "") === String(quote.priceSnapshot?.line ?? "")));
        const [geoApproved, kycApproved, provenance] = await Promise.all([
          currentGeoApproved(tx, tenantId, quote.playerId, now),
          currentKycApproved(tx, tenantId, quote.player, now),
          currentWagerProvenance(tx, tenantId)
        ]);
        const [exclusion, restriction, geo, account, responsibleLimit] = await Promise.all([
          tx.selfExclusion.findFirst({ where: { tenantId, playerId: quote.playerId, status: "ACTIVE", startsAt: { lte: /* @__PURE__ */ new Date() }, OR: [{ endsAt: null }, { endsAt: { gt: /* @__PURE__ */ new Date() } }] } }),
          tx.accountRestriction.findFirst({ where: { tenantId, playerId: quote.playerId, status: "ACTIVE", capability: "WAGER" } }),
          Promise.resolve(geoApproved),
          tx.ledgerAccount.findFirst({ where: { tenantId, playerId: quote.playerId, key: "PLAYER_CASH", currency: quote.currency, status: "ACTIVE" }, include: {} }),
          stakeLimitFacts(tx, tenantId, quote.playerId, now, quote.currency)
        ]);
        const fullLimitViolation = await wagerLimitViolation(tx, tenantId, quote.playerId, BigInt(quote.stakeMinor), now, customerActor?.sessionId);
        let projection = account ? await tx.balanceProjection.findFirst({ where: { tenantId, accountId: account.id }, orderBy: { version: "desc" } }) : null;
        if (projection) {
          await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${projection.id} FOR UPDATE`;
          projection = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: account.id }, orderBy: { version: "desc" } });
        }
        let decision = evaluateAcceptance({ id: quote.id, tenantId, playerId: quote.playerId, selectionId: quote.selectionId, snapshotId: quote.priceSnapshotId, decimalOdds: quote.decimalOdds, stake: BigInt(quote.stakeMinor), currency: quote.currency, expiresAt: quote.expiresAt, policyVersion: quote.policyVersion, rulesHash: quote.termsHash }, { now, tenantActive: Boolean(currentTenant), playerActive: quote.player.status === "ACTIVE", kycApproved, geoApproved: Boolean(geo), selfExcluded: Boolean(exclusion || restriction), wageredInPeriod: fullLimitViolation ? 1n : responsibleLimit?.wageredInPeriod ?? 0n, periodLimit: fullLimitViolation ? 0n : responsibleLimit?.periodLimit, marketOpen: eventTradable && quote.selection.market.status === "OPEN" && quote.selection.status === "OPEN", priceReceivedAt: quote.priceSnapshot.receivedAt, maxPriceAgeMs: Number(process.env.MAX_PRICE_AGE_MS ?? 3e4), available: BigInt(projection?.availableMinor ?? "0"), currentLiability: 0n, maxLiability: BigInt(process.env.SANDBOX_MAX_LIABILITY_MINOR ?? "100000000") });
        if (decision.accepted) {
          const extra = !priceCurrent ? "PRICE_CHANGED" : (await riskLimitViolation(tx, { tenantId, playerId: quote.playerId, currency: quote.currency, stakeMinor: BigInt(quote.stakeMinor), potentialReturnMinor: decision.potentialReturn, allocations: [{ marketId: quote.selection.marketId, eventId: quote.selection.market.eventId ?? null, stakeMinor: BigInt(quote.stakeMinor), liabilityMinor: decision.liability }], now }))?.code;
          if (extra) decision = { ...decision, accepted: false, rejectionCode: extra, gates: [...decision.gates, { gate: extra === "PRICE_CHANGED" ? "currentPrice" : "riskLimits", passed: false, code: extra }] };
        }
        const wager = await tx.wager.create({ data: { tenantId, playerId: quote.playerId, quoteId: quote.id, ...decision.accepted ? provenance : {}, idempotencyKey: args.idempotencyKey, stakeMinor: quote.stakeMinor, potentialReturnMinor: String(decision.potentialReturn), currency: quote.currency, termsHash: decision.termsHash, status: decision.accepted ? "ACCEPTED" : "REJECTED", acceptedAt: decision.accepted ? /* @__PURE__ */ new Date() : null } });
        await tx.acceptanceDecision.create({ data: { tenantId, wagerId: wager.id, quoteId: quote.id, accepted: decision.accepted, rejectionCode: decision.rejectionCode, gateResults: [...decision.gates, { gate: "provenance", passed: true, ...provenance }], inputHash: decision.termsHash } });
        if (decision.accepted) await tx.wagerLeg.create({ data: { tenantId, wagerId: wager.id, eventKey: quote.selection.market.eventId, marketKey: quote.selection.marketId, selectionKey: quote.selectionId, snapshotId: quote.priceSnapshotId, decimalOdds: quote.decimalOdds, line: quote.priceSnapshot.line, ruleVersion: quote.policyVersion } });
        if (decision.accepted && account && projection) {
          const accounts = await accountMap(tx, tenantId, quote.playerId, quote.currency), stake = BigInt(quote.stakeMinor);
          await postJournal(tx, tenantId, { idempotencyKey: `stake:${args.idempotencyKey}`, type: "WAGER_STAKE", entries: [{ accountId: accounts.PLAYER_CASH.id, currency: quote.currency, side: "DEBIT", amount: stake }, { accountId: accounts.WAGERS_PENDING.id, currency: quote.currency, side: "CREDIT", amount: stake }] }, wager.id);
          await tx.hold.create({ data: { tenantId, accountId: account.id, purposeType: "WAGER", purposeId: wager.id, amountMinor: quote.stakeMinor, status: "CAPTURED", version: 1 } });
          const next = BigInt(projection.postedMinor) - stake;
          await tx.balanceProjection.create({ data: { tenantId, accountId: account.id, postedMinor: String(next), pendingMinor: projection.pendingMinor, availableMinor: String(BigInt(projection.availableMinor) - stake), version: projection.version + 1, asOf: /* @__PURE__ */ new Date() } });
          const exposure = await tx.exposurePosition.findFirst({ where: { tenantId, scopeType: "MARKET", scopeId: quote.selection.marketId, currency: quote.currency } });
          if (exposure) await tx.exposurePosition.update({ where: { id: exposure.id }, data: { stakeMinor: String(BigInt(exposure.stakeMinor) + stake), liabilityMinor: String(BigInt(exposure.liabilityMinor) + decision.liability), version: { increment: 1 }, asOf: /* @__PURE__ */ new Date() } });
          else await tx.exposurePosition.create({ data: { tenantId, scopeType: "MARKET", scopeId: quote.selection.marketId, currency: quote.currency, stakeMinor: quote.stakeMinor, liabilityMinor: String(decision.liability), version: 1, asOf: /* @__PURE__ */ new Date() } });
          await tx.wagerExposureAllocation.create({ data: { tenantId, wagerId: wager.id, marketId: quote.selection.marketId, stakeMinor: quote.stakeMinor, liabilityMinor: String(decision.liability), remainingStakeMinor: quote.stakeMinor, remainingLiabilityMinor: String(decision.liability), version: 1, status: "OPEN" } });
        }
        await emit(tx, tenantId, "WAGER", wager.id, decision.accepted ? "wager.accepted.v1" : "wager.rejected.v1", { status: wager.status, stakeMinor: quote.stakeMinor, currency: quote.currency, termsHash: decision.termsHash, rejectionCode: decision.rejectionCode ?? null });
        await appendAudit(tx, tenantId, context.session?.itemId ?? context.trustedActorId ?? quote.playerId, decision.accepted ? "wager.accepted" : "wager.rejected", "Wager", wager.id, decision.rejectionCode ?? "ALL_GATES_PASSED", { termsHash: decision.termsHash, quoteId: quote.id, gateResults: decision.gates });
        if (customerCommand) await finishCustomerCommand(tx, customerCommand.id, decision.accepted ? "SUCCEEDED" : "REJECTED", { state: decision.accepted ? "ACCEPTED" : "REJECTED", accepted: decision.accepted, duplicate: customerCommand.duplicate, wagerId: wager.id, receiptId: wager.id, rejectionCode: decision.rejectionCode ?? null, termsHash: decision.termsHash, potentialReturnMinor: String(decision.potentialReturn) });
        return { accepted: decision.accepted, wagerId: wager.id, rejectionCode: decision.rejectionCode, termsHash: decision.termsHash, potentialReturnMinor: String(decision.potentialReturn) };
      });
    }
  }
};

// features/sportsbook/adapters/webhook-egress.ts
var import_node_crypto7 = require("node:crypto");
var import_node_net = require("node:net");
var import_promises = require("node:dns/promises");
var import_node_https = require("node:https");
var PLATFORM_WEBHOOK_SIGNING_KEY_ID = "platform-outbound-v1";
var MAX_WEBHOOK_PAYLOAD_BYTES = 256 * 1024;
var DNS_DEADLINE_MS = 2e3;
var nonPublic = new import_node_net.BlockList();
for (const [network, prefix] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]]) nonPublic.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of [["::", 127], ["::ffff:0:0", 96], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["100::", 64], ["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8]]) nonPublic.addSubnet(network, prefix, "ipv6");
var privateIp = (address) => {
  const family = (0, import_node_net.isIP)(address);
  return family === 4 ? nonPublic.check(address, "ipv4") : family === 6 ? nonPublic.check(address, "ipv6") : true;
};
var bareHost = (hostname) => hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
async function resolvePublicAddress(hostname) {
  const host = bareHost(hostname), literal = (0, import_node_net.isIP)(host);
  if (literal) {
    if (privateIp(host)) throw new Error("PRIVATE_WEBHOOK_DESTINATION");
    return { address: host, family: literal };
  }
  let timer;
  const records = await Promise.race([(0, import_promises.lookup)(host, { all: true, verbatim: true }), new Promise((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("WEBHOOK_DNS_TIMEOUT")), DNS_DEADLINE_MS);
  })]).finally(() => clearTimeout(timer));
  if (!records.length || records.some((record) => privateIp(record.address))) throw new Error("PRIVATE_WEBHOOK_DESTINATION");
  return { address: records[0].address, family: records[0].family };
}
async function validateWebhookDestination(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("INVALID_WEBHOOK_URL");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443" || url.pathname.length > 512 || url.search.length > 1024) throw new Error("UNSAFE_WEBHOOK_URL");
  if (process.env.SPORTSBOOK_DEPLOYMENT_MODE === "sandbox") {
    if (!url.hostname.endsWith(".local")) throw new Error("SANDBOX_WEBHOOK_REQUIRES_LOCAL_DOMAIN");
    return url;
  }
  await resolvePublicAddress(url.hostname);
  const allowlist = (process.env.WEBHOOK_EGRESS_HOSTS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!allowlist.includes(url.hostname.toLowerCase())) throw new Error("WEBHOOK_HOST_NOT_ALLOWLISTED");
  return url;
}

// features/sportsbook/domain/retention.ts
var SUPPORTED = /* @__PURE__ */ new Set(["CUSTOMER_SESSION:DELETE", "GEO:TOKENIZE"]);
var RECORD_CLASS_SCOPES = /* @__PURE__ */ new Set(["AUDIT", "CUSTOMER_SESSION", "GEO"]);
var MAX_RETENTION_CANDIDATES = 5e3;
var GEO_TOKENIZED_MARKER = "TOKENIZED_BY_POLICY";
function retentionUnsupportedReason(policy) {
  const key2 = `${policy.recordClass}:${policy.deletionMode ?? ""}`;
  return SUPPORTED.has(key2) ? null : `RETENTION_DISPOSITION_NOT_SUPPORTED:${key2}`;
}
function holdProtects(hold, recordClass, candidate) {
  const scopeType = String(hold.scopeType ?? "").trim().toUpperCase(), scopeId = String(hold.scopeId ?? "").trim();
  if (scopeType === "TENANT") return true;
  if (scopeType === "PLAYER") return !!candidate.playerId && scopeId === candidate.playerId;
  if (scopeType === "RECORD") return scopeId === candidate.id;
  if (RECORD_CLASS_SCOPES.has(scopeType)) return scopeType === recordClass && (!scopeId || scopeId === "*" || scopeId === candidate.id);
  return true;
}
async function retentionCandidates(tx, tenantId, policy, windowFrom, windowTo, eligibilityAsOf, holdsAsOf) {
  const unsupported = retentionUnsupportedReason(policy);
  if (unsupported) throw new Error(unsupported);
  if (!Number.isInteger(policy.retentionDays) || policy.retentionDays < 0) throw new Error("RETENTION_POLICY_INVALID");
  if (Number.isNaN(windowFrom.getTime()) || Number.isNaN(windowTo.getTime()) || windowFrom >= windowTo) throw new Error("INVALID_RETENTION_RUN");
  const cutoff = new Date(eligibilityAsOf.getTime() - policy.retentionDays * 864e5);
  const upper = windowTo < cutoff ? windowTo : cutoff;
  let candidates = [];
  if (upper > windowFrom) {
    if (policy.recordClass === "CUSTOMER_SESSION") {
      const rows = await tx.customerSession.findMany({ where: { tenantId, expiresAt: { gte: windowFrom, lt: upper }, OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: eligibilityAsOf } }] }, select: { id: true, playerId: true }, orderBy: { id: "asc" }, take: MAX_RETENTION_CANDIDATES + 1 });
      candidates = rows.map((row) => ({ id: row.id, playerId: row.playerId ?? null }));
    } else {
      const rows = await tx.geoCheck.findMany({ where: { tenantId, checkedAt: { gte: windowFrom, lt: upper } }, select: { id: true, coarseEvidence: true, geoSession: { select: { playerId: true } } }, orderBy: { id: "asc" }, take: MAX_RETENTION_CANDIDATES + 1 });
      candidates = rows.filter((row) => row.coarseEvidence?.retained !== GEO_TOKENIZED_MARKER).map((row) => ({ id: row.id, playerId: row.geoSession?.playerId ?? null }));
    }
  }
  if (candidates.length > MAX_RETENTION_CANDIDATES) throw new Error("RETENTION_WINDOW_TOO_LARGE");
  const holds = await tx.legalHold.findMany({ where: { tenantId, status: "ACTIVE", OR: [{ endsAt: null }, { endsAt: { gt: holdsAsOf } }] }, select: { id: true, scopeType: true, scopeId: true }, orderBy: { id: "asc" } });
  const held = [], eligible = [];
  for (const candidate of candidates) (holds.some((hold) => holdProtects(hold, policy.recordClass, candidate)) ? held : eligible).push(candidate.id);
  const manifestHash = evidenceHash({ policyId: policy.id, policyVersion: policy.version, recordClass: policy.recordClass, deletionMode: policy.deletionMode, retentionDays: policy.retentionDays, windowFrom: windowFrom.toISOString(), windowTo: windowTo.toISOString(), cutoff: cutoff.toISOString(), eligible, held });
  return { cutoff, eligible, held, holdIds: holds.map((hold) => hold.id), candidateCount: candidates.length, manifestHash };
}

// features/sportsbook/domain/totp.ts
var import_node_crypto8 = require("node:crypto");
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(input) {
  let bits = 0, value = 0, result = "";
  for (const byte of input) {
    value = value << 8 | byte;
    bits += 8;
    while (bits >= 5) {
      result += alphabet[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += alphabet[value << 5 - bits & 31];
  return result;
}
function base32Decode(input) {
  let bits = 0, value = 0;
  const bytes = [];
  for (const char of input.replace(/=+$/, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("INVALID_BASE32");
    value = value << 5 | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push(value >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
function key() {
  const value = process.env.PII_ENCRYPTION_KEY ?? process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("MFA_ENCRYPTION_KEY_REQUIRED");
  return (0, import_node_crypto8.createHash)("sha256").update(value).digest();
}
function encryptTotpSecret(secret) {
  const iv = (0, import_node_crypto8.randomBytes)(12), cipher = (0, import_node_crypto8.createCipheriv)("aes-256-gcm", key(), iv), data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return `totp:v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${data.toString("base64url")}`;
}
function decryptTotpSecret(value) {
  const [scope, version, ivText, tagText, dataText] = value.split(":");
  if (scope !== "totp" || version !== "v1") throw new Error("INVALID_MFA_SECRET");
  const decipher = (0, import_node_crypto8.createDecipheriv)("aes-256-gcm", key(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataText, "base64url")), decipher.final()]).toString("utf8");
}
function generateTotpSecret() {
  return base32Encode((0, import_node_crypto8.randomBytes)(20));
}
function totpCode(secret, time = Date.now(), step = 30) {
  const counter = BigInt(Math.floor(time / 1e3 / step)), buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(counter);
  const digest = (0, import_node_crypto8.createHmac)("sha1", base32Decode(secret)).update(buffer).digest(), offset = digest[digest.length - 1] & 15, value = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
  return String(value % 1e6).padStart(6, "0");
}
function verifyTotp(secret, supplied, time = Date.now()) {
  if (!/^\d{6}$/.test(supplied)) return false;
  const actual = Buffer.from(supplied);
  return [-1, 0, 1].some((window) => {
    const expected = Buffer.from(totpCode(secret, time + window * 3e4));
    return expected.length === actual.length && (0, import_node_crypto8.timingSafeEqual)(expected, actual);
  });
}

// features/sportsbook/domain/cashout-economics.ts
var PORTION_SCALE = 1000000n;
function nonNegativeMinor(value, errorCode) {
  if (!/^\d+$/.test(value)) throw new Error(errorCode);
  return BigInt(value);
}
function cashOutPortionMillionths(portionNumerator, portionDenominator) {
  if (!/^\d+$/.test(portionNumerator) || !/^\d+$/.test(portionDenominator)) {
    throw new Error("INVALID_CASH_OUT_PORTION");
  }
  const numerator = BigInt(portionNumerator);
  const denominator = BigInt(portionDenominator);
  if (numerator <= 0n || denominator <= 0n || numerator > denominator) throw new Error("INVALID_CASH_OUT_PORTION");
  const scaled = numerator * PORTION_SCALE;
  if (scaled % denominator !== 0n) throw new Error("CASH_OUT_PORTION_PRECISION_UNSUPPORTED");
  return scaled / denominator;
}
function portionMillionths(row) {
  return cashOutPortionMillionths(row.portionNumerator, row.portionDenominator);
}
function projectCashOutAcceptanceState(rows) {
  const byId = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (!row.id || byId.has(row.id)) throw new Error("DUPLICATE_CASH_OUT_ACCEPTANCE_ID");
    if (!row.tenantId || !row.wagerId || !row.playerId || !row.offerId || !row.currency || !row.journalTransactionId) {
      throw new Error("INVALID_CASH_OUT_ACCEPTANCE");
    }
    byId.set(row.id, row);
  }
  const acceptedRows = [];
  const reversals = [];
  const reversedIds = /* @__PURE__ */ new Set();
  for (const row of rows) {
    if (row.status === "ACCEPTED") {
      if (row.reversalOfId) throw new Error("INVALID_CASH_OUT_REVERSAL_CHAIN");
      nonNegativeMinor(row.amountMinor, "INVALID_CASH_OUT_AMOUNT");
      portionMillionths(row);
      acceptedRows.push(row);
      continue;
    }
    if (row.status !== "REVERSED" || !row.reversalOfId) throw new Error("INVALID_CASH_OUT_REVERSAL_CHAIN");
    const original = byId.get(row.reversalOfId);
    if (!original || original.status !== "ACCEPTED" || original.reversalOfId) throw new Error("CASH_OUT_REVERSAL_PARENT_REQUIRED");
    if (reversedIds.has(original.id)) throw new Error("DUPLICATE_CASH_OUT_REVERSAL");
    if (row.tenantId !== original.tenantId || row.wagerId !== original.wagerId || row.playerId !== original.playerId || row.offerId !== original.offerId || row.amountMinor !== original.amountMinor || row.currency !== original.currency || row.portionNumerator !== original.portionNumerator || row.portionDenominator !== original.portionDenominator) throw new Error("CASH_OUT_REVERSAL_ECONOMICS_MISMATCH");
    if (!row.journalTransactionId || !original.journalTransactionId || row.journalTransactionId === original.journalTransactionId) {
      throw new Error("CASH_OUT_REVERSAL_JOURNAL_REQUIRED");
    }
    nonNegativeMinor(row.amountMinor, "INVALID_CASH_OUT_AMOUNT");
    portionMillionths(row);
    reversedIds.add(original.id);
    reversals.push(row);
  }
  const effectiveAcceptances = acceptedRows.filter((row) => !reversedIds.has(row.id));
  const closedMillionths = effectiveAcceptances.reduce((sum, row) => sum + portionMillionths(row), 0n);
  if (closedMillionths > PORTION_SCALE) throw new Error("CASH_OUT_PORTION_OVERCOMMITTED");
  const acceptedAmountMinor = effectiveAcceptances.reduce((sum, row) => sum + nonNegativeMinor(row.amountMinor, "INVALID_CASH_OUT_AMOUNT"), 0n);
  const reversedAmountMinor = reversals.reduce((sum, row) => sum + nonNegativeMinor(row.amountMinor, "INVALID_CASH_OUT_AMOUNT"), 0n);
  return {
    accepted: effectiveAcceptances,
    reversals,
    closedMillionths,
    remainingMillionths: PORTION_SCALE - closedMillionths,
    acceptedAmountMinor,
    reversedAmountMinor
  };
}
function remainingStakeByPart(parts, closedMillionths) {
  if (closedMillionths < 0n || closedMillionths > PORTION_SCALE) throw new Error("INVALID_CASH_OUT_PORTION");
  const stakes = parts.map((part) => typeof part.stakeMinor === "bigint" ? part.stakeMinor : nonNegativeMinor(part.stakeMinor, "INVALID_STAKE"));
  if (stakes.some((stake) => stake < 0n)) throw new Error("INVALID_STAKE");
  const total = stakes.reduce((sum, stake) => sum + stake, 0n);
  const remainingTotal = total - total * closedMillionths / PORTION_SCALE;
  const remaining = stakes.map((stake) => stake * (PORTION_SCALE - closedMillionths) / PORTION_SCALE);
  let residual = remainingTotal - remaining.reduce((sum, stake) => sum + stake, 0n);
  for (let index = 0; residual > 0n && index < remaining.length; index++, residual--) remaining[index] += 1n;
  if (residual !== 0n) throw new Error("CASH_OUT_RESIDUAL_ALLOCATION_FAILED");
  return remaining;
}
function projectCashOutState(totalStakeMinor, rows, parts) {
  const totalStake = typeof totalStakeMinor === "bigint" ? totalStakeMinor : nonNegativeMinor(totalStakeMinor, "INVALID_STAKE");
  if (totalStake < 0n) throw new Error("INVALID_STAKE");
  const acceptanceState = projectCashOutAcceptanceState(rows);
  const closedStakeMinor = totalStake * acceptanceState.closedMillionths / PORTION_SCALE;
  const remainingStakeMinor = totalStake - closedStakeMinor;
  let remainingPartStakeMinor;
  if (parts !== void 0) {
    const partTotal = parts.reduce((sum, part) => sum + (typeof part.stakeMinor === "bigint" ? part.stakeMinor : nonNegativeMinor(part.stakeMinor, "INVALID_STAKE")), 0n);
    if (partTotal !== totalStake) throw new Error("CASH_OUT_PART_STAKE_MISMATCH");
    remainingPartStakeMinor = remainingStakeByPart(parts, acceptanceState.closedMillionths);
    if (remainingPartStakeMinor.reduce((sum, stake) => sum + stake, 0n) !== remainingStakeMinor) {
      throw new Error("CASH_OUT_PART_PROJECTION_MISMATCH");
    }
  }
  return { ...acceptanceState, totalStakeMinor: totalStake, closedStakeMinor, remainingStakeMinor, remainingPartStakeMinor };
}

// features/sportsbook/settlement/full-straight.ts
var assertHumanSession = (session, actorId) => {
  if (session?.itemId !== actorId || !hasOperatorMfaAssurance(session)) fail("SETTLEMENT_SESSION_ASSURANCE_REQUIRED");
};
var CONTRACT = "openfront.full-straight.initial.v1";
var fail = (reason) => {
  throw new Error(reason);
};
var minor = (value) => typeof value === "string" && /^\d{1,24}$/.test(value) ? BigInt(value) : fail("INVALID_SETTLEMENT_MONEY");
var one = (rows, reason) => rows.length === 1 ? rows[0] : fail(reason);
async function assertCurrentRiskOperator(tx, tenantId, actorId) {
  await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  await tx.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${tenantId} FOR SHARE`;
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actorId} AND tenant = ${tenantId} FOR SHARE`;
  const user = await tx.user.findFirst({ where: { id: actorId, tenantId }, include: { role: true } });
  if (!user?.roleId) fail("SETTLEMENT_AUTHORITY_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "Role" WHERE id = ${user.roleId} FOR SHARE`;
  const current = await tx.user.findFirst({ where: { id: actorId, tenantId }, include: { role: true } });
  const tenant4 = await tx.tenant.findFirst({ where: { id: tenantId, status: "ACTIVE" } });
  if (!tenant4 || current?.roleId !== user.roleId || !current?.role?.canManageRisk || !current.operatorMfaEnabled) fail("SETTLEMENT_AUTHORITY_REQUIRED");
}
async function assertApprovalIdentities(tx, tenantId, approval) {
  for (const [id, approver] of [[approval.requesterId, false], [approval.approverId, true]]) {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} AND tenant = ${tenantId} FOR SHARE`;
    const user = await tx.user.findFirst({ where: { id, tenantId }, include: { role: true } });
    if (!user?.roleId) fail("APPROVAL_PRINCIPAL_SCOPE_REQUIRED");
    await tx.$queryRaw`SELECT id FROM "Role" WHERE id = ${user.roleId} FOR SHARE`;
    const current = await tx.user.findFirst({ where: { id, tenantId }, include: { role: true } });
    if (!current?.operatorMfaEnabled || (approver ? !current.role?.canApproveSensitiveActions : !current.role?.canTrade && !current.role?.canManageSportsbook)) fail("APPROVAL_PRINCIPAL_SCOPE_REQUIRED");
  }
}
async function loadFullStraightPlan(tx, tenantId, wagerId) {
  await lockWagerForSettlement(tx, tenantId, wagerId);
  const wager = await tx.wager.findFirst({ where: { id: wagerId, tenantId } });
  if (!wager?.playerId || wager.structure !== "STRAIGHT") fail("UNSUPPORTED_FULL_STRAIGHT_CONTRACT");
  if (!["ACCEPTED", "OPEN", "GRADED"].includes(wager.status) || wager.bonusAwardId || wager.promotionId) fail("UNSUPPORTED_FULL_STRAIGHT_STATE_OR_FUNDING");
  const settled = await tx.settlement.findFirst({ where: { tenantId, wagerId } });
  if (settled) fail("WAGER_ALREADY_SETTLED");
  const part = one(await tx.wagerPart.findMany({ where: { tenantId, wagerId }, take: 2 }), "FULL_STRAIGHT_PART_COVERAGE_REQUIRED");
  const leg = one(await tx.wagerLeg.findMany({ where: { tenantId, wagerId }, take: 2 }), "FULL_STRAIGHT_LEG_COVERAGE_REQUIRED");
  if (part.partIndex !== 0 || part.status !== "OPEN" || leg.wagerPartId !== part.id || leg.legIndex !== 0 || minor(part.stakeMinor) !== minor(wager.stakeMinor) || minor(part.potentialReturnMinor) !== minor(wager.potentialReturnMinor)) fail("ACCEPTED_PART_EVIDENCE_MISMATCH");
  if (await tx.cashOutAcceptance.findFirst({ where: { tenantId, wagerId } })) fail("CASHOUT_SETTLEMENT_PLAN_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${wager.playerId} AND tenant = ${tenantId} FOR SHARE`;
  if (!await tx.player.findFirst({ where: { id: wager.playerId, tenantId } })) fail("SETTLEMENT_PLAYER_SCOPE_MISMATCH");
  const selection = await tx.selection.findFirst({ where: { id: leg.selectionKey, tenantId }, include: { market: true } });
  if (!selection?.market || selection.market.id !== leg.marketKey || selection.market.eventId !== leg.eventKey) fail("SETTLEMENT_SELECTION_SCOPE_MISMATCH");
  const acceptedSnapshot = await tx.priceSnapshot.findFirst({ where: { id: leg.snapshotId, tenantId, selectionId: leg.selectionKey } });
  if (!acceptedSnapshot?.providerConnectionId || acceptedSnapshot.decimalOdds !== leg.decimalOdds || String(acceptedSnapshot.line ?? "") !== leg.line || !await tx.providerConnection.findFirst({ where: { id: acceptedSnapshot.providerConnectionId, tenantId } })) fail("ACCEPTED_PRICE_SOURCE_SCOPE_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${leg.eventKey} AND tenant = ${tenantId} FOR SHARE`;
  await tx.$queryRaw`SELECT id FROM "Selection" WHERE id = ${leg.selectionKey} AND tenant = ${tenantId} FOR SHARE`;
  const result = one(await tx.resultVersion.findMany({ where: { tenantId, eventId: leg.eventKey, status: "APPROVED" }, take: 2 }), "ONE_APPROVED_RESULT_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "ResultVersion" WHERE id = ${result.id} AND tenant = ${tenantId} FOR SHARE`;
  const approval = await tx.approvalRequest.findFirst({ where: { tenantId, action: "APPROVE_RESULT", payloadHash: resultApprovalHash(result), status: "APPROVED" } });
  if (!approval?.approverId || approval.requesterId === approval.approverId || !result.approvedAt) fail("INDEPENDENT_RESULT_EVIDENCE_REQUIRED");
  await assertApprovalIdentities(tx, tenantId, approval);
  if (!await tx.providerConnection.findFirst({ where: { id: result.providerConnectionId, tenantId } })) fail("RESULT_SOURCE_SCOPE_MISMATCH");
  const fact = resolveCanonicalSelectionFact(result.payload, leg.eventKey, leg.marketKey, selection.key);
  if (!fact) fail("CANONICAL_SELECTION_RESULT_REQUIRED");
  if (!["WIN", "LOSS", "VOID"].includes(fact.outcome)) fail("UNSUPPORTED_FULL_STRAIGHT_OUTCOME");
  const grade = one(await tx.legGrade.findMany({ where: { tenantId, wagerLegId: leg.id, marketGrade: { resultVersionId: result.id } }, include: { marketGrade: true }, take: 2 }), "EXACT_SELECTION_GRADE_COVERAGE_REQUIRED");
  const marketGrade = grade.marketGrade, trace = marketGrade?.trace;
  if (!marketGrade || marketGrade.tenantId !== tenantId || marketGrade.marketId !== leg.marketKey || marketGrade.resultVersionId !== result.id || trace?.selectionId !== leg.selectionKey || trace?.selectionKey !== selection.key || trace?.resultHash !== result.payloadHash || trace?.factHash !== evidenceHash(fact) || grade.outcome !== fact.outcome || marketGrade.outcome !== fact.outcome || grade.factorNumerator || grade.factorDenominator || marketGrade.factorNumerator || marketGrade.factorDenominator) fail("SELECTION_GRADE_EVIDENCE_MISMATCH");
  if (marketGrade.inputHash !== evidenceHash({ marketId: leg.marketKey, selectionId: leg.selectionKey, resultVersionId: result.id, outcome: fact.outcome, factorNumerator: null, factorDenominator: null, ruleVersion: marketGrade.ruleVersion, ruleHash: trace.ruleHash, resultHash: result.payloadHash }) || grade.inputHash !== evidenceHash({ gradeId: marketGrade.id, legId: leg.id, selectionId: leg.selectionKey })) fail("GRADE_CONTENT_EVIDENCE_MISMATCH");
  const rule = await tx.houseRuleVersion.findFirst({ where: { id: trace.ruleId, tenantId } });
  if (!rule || `${rule.name}@${rule.version}` !== leg.ruleVersion || marketGrade.ruleVersion !== leg.ruleVersion || rule.semanticHash !== trace.ruleHash) fail("ACCEPTED_RULE_EVIDENCE_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "HouseRuleVersion" WHERE id = ${rule.id} AND tenant = ${tenantId} FOR SHARE`;
  const ruleApproval = await tx.approvalRequest.findFirst({ where: { id: rule.approvalRequestId ?? "", tenantId, action: `HOUSE_RULE:${rule.name}`, payloadHash: rule.semanticHash, status: "APPROVED" } });
  if (!ruleApproval?.approverId || ruleApproval.approverId === ruleApproval.requesterId || !wager.acceptedAt || rule.effectiveFrom > wager.acceptedAt || rule.effectiveTo && rule.effectiveTo <= wager.acceptedAt) fail("ACCEPTED_RULE_APPROVAL_REQUIRED");
  await assertApprovalIdentities(tx, tenantId, ruleApproval);
  if (rule.semanticHash !== evidenceHash({ action: "HOUSE_RULE", name: rule.name, sportKey: rule.sportKey, marketDefinitionKey: rule.marketDefinitionKey, rules: rule.rules, effectiveFrom: rule.effectiveFrom })) fail("RULE_CONTENT_EVIDENCE_MISMATCH");
  if (rule.rules?.taxPolicy !== "NONE") fail("SETTLEMENT_TAX_POLICY_REQUIRED");
  if (rule.rules?.currencyExponent !== 2) fail("ACCEPTED_CURRENCY_EXPONENT_EVIDENCE_REQUIRED");
  if (!Array.isArray(rule.rules?.structures) || !rule.rules.structures.includes("STRAIGHT") || fact.outcome === "VOID" && rule.rules.void !== true) fail("OUTCOME_NOT_ALLOWED_BY_ACCEPTED_RULE");
  const quoteLeg = one(await tx.customerQuoteLegTerms.findMany({ where: { tenantId, playerId: wager.playerId, quoteId: wager.quoteId, quoteKey: wager.quoteId, legIndex: "0" }, take: 2 }), "ORIGINAL_QUOTE_EVIDENCE_REQUIRED");
  if (quoteLeg.eventId !== leg.eventKey || quoteLeg.marketId !== leg.marketKey || quoteLeg.selectionId !== leg.selectionKey || quoteLeg.ruleVersion !== leg.ruleVersion || quoteLeg.evidenceHash !== evidenceHash({ quoteId: wager.quoteId, index: 0, selectionId: quoteLeg.selectionId, snapshotId: quoteLeg.priceSnapshotId, decimalOdds: quoteLeg.decimalOdds, line: quoteLeg.line, ruleVersion: quoteLeg.ruleVersion, ruleHash: rule.semanticHash, currency: wager.currency, currencyExponent: rule.rules.currencyExponent })) fail("ORIGINAL_QUOTE_EVIDENCE_REQUIRED");
  const decision = one(await tx.acceptanceDecision.findMany({ where: { tenantId, wagerId }, take: 2 }), "ACCEPTANCE_EVIDENCE_REQUIRED");
  const price = decision.gateResults?.acceptedPriceEvidence?.[0];
  if (!decision.accepted || decision.inputHash !== wager.termsHash || decision.gateResults?.rejectedParts?.length || decision.gateResults?.acceptedParts?.length !== 1 || decision.gateResults.acceptedParts[0] !== 0 || !price || price.legIndex !== 0 || price.snapshotId !== leg.snapshotId || price.decimalOdds !== leg.decimalOdds || price.line !== leg.line) fail("ACCEPTED_PRICE_EVIDENCE_MISMATCH");
  const commandId = /^combination:([A-Za-z0-9_-]+)$/.exec(wager.idempotencyKey)?.[1];
  if (!commandId) fail("ORIGINAL_CUSTOMER_COMMAND_REQUIRED");
  await tx.$queryRaw`SELECT id FROM "CustomerCommand" WHERE id = ${commandId} AND tenant = ${tenantId} AND player = ${wager.playerId} FOR SHARE`;
  const command = await tx.customerCommand.findFirst({ where: { id: commandId, tenantId, playerId: wager.playerId, type: "WAGER", status: "SUCCEEDED" } });
  if (!command?.result || command.result.wagerId !== wagerId || command.result.receiptId !== wagerId || command.result.state !== "ACCEPTED" || command.result.accepted !== true || command.result.termsHash !== wager.termsHash || command.result.acceptedStakeMinor !== wager.stakeMinor || command.result.potentialReturnMinor !== wager.potentialReturnMinor || command.result.acceptedPartIndexes?.length !== 1 || command.result.acceptedPartIndexes[0] !== 0 || command.result.rejectedPartIndexes?.length || !/^[a-f0-9]{64}$/.test(command.requestHash)) fail("ORIGINAL_CUSTOMER_COMMAND_REQUIRED");
  const receiptPart = command.result.acceptedParts?.[0], receiptPrice = command.result.acceptedPrices?.[0];
  if (command.result.acceptedParts?.length !== 1 || !receiptPart || receiptPart.index !== part.partIndex || receiptPart.key !== part.combinationKey || receiptPart.stakeMinor !== part.stakeMinor || receiptPart.potentialReturnMinor !== part.potentialReturnMinor || receiptPart.decimalOdds !== part.decimalOdds || command.result.acceptedPrices?.length !== 1 || !receiptPrice || receiptPrice.legIndex !== 0 || receiptPrice.selectionId !== leg.selectionKey || receiptPrice.priceSnapshotId !== leg.snapshotId || receiptPrice.decimalOdds !== leg.decimalOdds || receiptPrice.line !== leg.line) fail("ORIGINAL_CUSTOMER_COMMAND_REQUIRED");
  const oldPrice = parseExactDecimal(part.decimalOdds), acceptedPrice = parseExactDecimal(leg.decimalOdds);
  if (oldPrice.numerator * acceptedPrice.denominator !== acceptedPrice.numerator * oldPrice.denominator) fail("ACCEPTED_PRICE_EVIDENCE_MISMATCH");
  const configured = await tx.tenantCurrency.findFirst({ where: { tenantId, status: "ACTIVE", currency: { code: wager.currency } }, include: { currency: true } });
  if (!configured?.currency || configured.currency.code !== wager.currency || !Number.isInteger(configured.currency.exponent) || configured.currency.exponent !== rule.rules.currencyExponent) fail("SETTLEMENT_CURRENCY_EVIDENCE_REQUIRED");
  const accounts = {};
  for (const key2 of ["PLAYER_CASH", "WAGERS_PENDING", "GAMING_REVENUE", "WINNINGS_EXPENSE"]) accounts[key2] = one(await tx.ledgerAccount.findMany({ where: { tenantId, playerId: key2 === "PLAYER_CASH" ? wager.playerId : null, currency: wager.currency, key: key2, status: "ACTIVE" }, take: 2 }), `EXACT_LEDGER_ACCOUNT_REQUIRED:${key2}`);
  await tx.$queryRaw`SELECT id FROM "LedgerAccount" WHERE id = ${accounts.PLAYER_CASH.id} AND tenant = ${tenantId} FOR UPDATE`;
  const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } });
  if (!balance || minor(balance.availableMinor) > minor(balance.postedMinor)) fail("SETTLEMENT_BALANCE_EVIDENCE_REQUIRED");
  minor(balance.pendingMinor);
  await tx.$queryRaw`SELECT id FROM "BalanceProjection" WHERE id = ${balance.id} AND tenant = ${tenantId} FOR UPDATE`;
  const hold = one(await tx.hold.findMany({ where: { tenantId, accountId: accounts.PLAYER_CASH.id, purposeType: "WAGER", purposeId: wagerId }, take: 2 }), "EXACT_CAPTURED_HOLD_REQUIRED");
  if (hold.status !== "CAPTURED" || minor(hold.amountMinor) !== minor(wager.stakeMinor)) fail("EXACT_CAPTURED_HOLD_REQUIRED");
  const stakeJournal = one(await tx.journalTransaction.findMany({ where: { tenantId, correlationId: wagerId, type: "WAGER_STAKE", status: "POSTED" }, take: 2 }), "STAKE_JOURNAL_EVIDENCE_REQUIRED");
  const entries = await tx.journalEntry.findMany({ where: { tenantId, transactionId: stakeJournal.id }, take: 3 });
  if (entries.length !== 2 || !entries.some((entry) => entry.accountId === accounts.PLAYER_CASH.id && entry.side === "DEBIT") || !entries.some((entry) => entry.accountId === accounts.WAGERS_PENDING.id && entry.side === "CREDIT") || entries.some((entry) => entry.currency !== wager.currency || minor(entry.amountMinor) !== minor(wager.stakeMinor))) fail("STAKE_JOURNAL_EVIDENCE_MISMATCH");
  await tx.$queryRaw`SELECT id FROM "ExposurePosition" WHERE tenant = ${tenantId} AND "scopeType" = 'MARKET' AND "scopeId" = ${leg.marketKey} AND currency = ${wager.currency} FOR UPDATE`;
  const allocation = one(await tx.wagerExposureAllocation.findMany({ where: { tenantId, wagerId }, take: 2 }), "EXACT_EXPOSURE_ALLOCATION_REQUIRED");
  const exposure = one(await tx.exposurePosition.findMany({ where: { tenantId, scopeType: "MARKET", scopeId: leg.marketKey, currency: wager.currency }, take: 2 }), "EXACT_EXPOSURE_POSITION_REQUIRED");
  const liability = minor(wager.potentialReturnMinor) - minor(wager.stakeMinor);
  if (allocation.marketId !== leg.marketKey || allocation.status !== "OPEN" || minor(allocation.remainingStakeMinor) !== minor(wager.stakeMinor) || minor(allocation.remainingLiabilityMinor) !== liability || minor(exposure.stakeMinor) < minor(wager.stakeMinor) || minor(exposure.liabilityMinor) < liability) fail("EXPOSURE_CONSERVATION_EVIDENCE_REQUIRED");
  const calculated = settleCombinationPart({ stakeMinor: minor(part.stakeMinor), acceptedPotentialReturnMinor: minor(part.potentialReturnMinor), stakeReturned: true, legs: [{ decimalOdds: leg.decimalOdds, outcome: fact.outcome }] });
  if (calculated.payoutMinor > minor(wager.maxPayoutMinor)) fail("ACCEPTED_PAYOUT_CAP_EXCEEDED");
  const bundle = { contract: CONTRACT, tenantId, wagerId, playerId: wager.playerId, wagerVersion: wager.version, termsHash: wager.termsHash, quoteLegEvidenceHash: quoteLeg.evidenceHash, partId: part.id, legId: leg.id, commandId: command.id, commandRequestHash: command.requestHash, commandReceiptHash: evidenceHash(command.result), stakeMinor: wager.stakeMinor, potentialReturnMinor: wager.potentialReturnMinor, decimalOdds: leg.decimalOdds, line: leg.line, snapshotId: leg.snapshotId, priceProviderConnectionId: acceptedSnapshot.providerConnectionId, currency: wager.currency, currencyExponent: configured.currency.exponent, eventId: leg.eventKey, marketId: leg.marketKey, selectionId: leg.selectionKey, selectionKey: selection.key, resultVersionId: result.id, resultVersion: result.version, resultHash: result.payloadHash, providerConnectionId: result.providerConnectionId, approvalId: approval.id, gradeId: grade.id, gradeHash: grade.inputHash, marketGradeId: marketGrade.id, marketGradeHash: marketGrade.inputHash, ruleId: rule.id, ruleVersion: leg.ruleVersion, ruleHash: rule.semanticHash, ruleApprovalId: ruleApproval.id, outcome: fact.outcome, payoutMinor: String(calculated.payoutMinor), roundingRule: "DOWN_AT_POSTING", stakeJournalId: stakeJournal.id, stakeEntries: entries.map((entry) => ({ id: entry.id, accountId: entry.accountId, side: entry.side, amountMinor: entry.amountMinor, currency: entry.currency })).sort((a, b) => a.id.localeCompare(b.id)), holdId: hold.id, holdVersion: hold.version, allocationId: allocation.id, allocationVersion: allocation.version, accounts: Object.fromEntries(Object.entries(accounts).map(([key2, row]) => [key2, row.id])) };
  const plan = { state: "READY", contract: CONTRACT, planHash: evidenceHash(bundle), tenantId, wagerId, playerId: wager.playerId, outcome: fact.outcome, stakeMinor: wager.stakeMinor, payoutMinor: String(calculated.payoutMinor), currency: wager.currency, currencyExponent: configured.currency.exponent, resultVersionId: result.id, ruleVersion: leg.ruleVersion, bundle };
  return { plan, wager, part, leg, result, grade, balance, hold, accounts, allocation, exposure };
}
function getFullStraightPlan(prisma, tenantId, actorId, wagerId, session) {
  return serializable2(prisma, async (tx) => {
    assertHumanSession(session, actorId);
    await assertCurrentRiskOperator(tx, tenantId, actorId);
    const plan = (await loadFullStraightPlan(tx, tenantId, wagerId)).plan;
    assertHumanSession(session, actorId);
    return plan;
  });
}
async function settleFullStraight(tx, tenantId, actorId, input, session) {
  assertHumanSession(session, actorId);
  if (!/^[A-Za-z0-9:_-]{8,128}$/.test(input.idempotencyKey) || !/^[a-f0-9]{64}$/.test(input.planHash ?? "")) fail("REVIEWED_SETTLEMENT_PLAN_REQUIRED");
  if (input.expectedActorId !== actorId || input.expectedTenantId !== tenantId) fail("SETTLEMENT_INTENT_SCOPE_CHANGED");
  await assertCurrentRiskOperator(tx, tenantId, actorId);
  await lockWagerForSettlement(tx, tenantId, input.wagerId);
  const wager = await tx.wager.findFirst({ where: { id: input.wagerId, tenantId } });
  if (!wager?.playerId) fail("SETTLEMENT_PLAYER_SCOPE_MISMATCH");
  await tx.$queryRaw`SELECT id FROM "Player" WHERE id = ${wager.playerId} AND tenant = ${tenantId} FOR SHARE`;
  if (!await tx.player.findFirst({ where: { id: wager.playerId, tenantId } })) fail("SETTLEMENT_PLAYER_SCOPE_MISMATCH");
  const requestHash = evidenceHash({ contract: CONTRACT, tenantId, actorId, wagerId: input.wagerId, planHash: input.planHash, idempotencyKey: input.idempotencyKey });
  const prior = await tx.settlement.findFirst({ where: { tenantId, inputHash: input.idempotencyKey } });
  if (prior) {
    const line = one(await tx.settlementLine.findMany({ where: { tenantId, settlementId: prior.id }, take: 2 }), "ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED");
    if (prior.wagerId !== input.wagerId || line.trace?.contract !== CONTRACT || line.trace?.requestHash !== requestHash || line.trace?.planHash !== input.planHash) fail("SETTLEMENT_IDEMPOTENCY_CONFLICT");
    const bundle = line.trace.bundle;
    if (!bundle || evidenceHash(bundle) !== input.planHash || bundle.tenantId !== tenantId || bundle.wagerId !== input.wagerId || bundle.playerId !== wager.playerId || bundle.termsHash !== wager.termsHash || bundle.stakeMinor !== wager.stakeMinor || bundle.currency !== wager.currency || bundle.payoutMinor !== prior.payoutMinor || bundle.payoutMinor !== line.amountMinor || bundle.resultVersionId !== prior.resultVersionId || bundle.outcome !== prior.outcome || line.trace.capturedHoldId !== bundle.holdId) fail("ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED");
    if (!await tx.journalTransaction.findFirst({ where: { id: prior.journalTransactionId, tenantId, status: "POSTED", correlationId: input.wagerId, idempotencyKey: `full-straight:${input.idempotencyKey}` } })) fail("ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED");
    const originalCommand = await tx.customerCommand.findFirst({ where: { id: bundle.commandId, tenantId, playerId: wager.playerId, type: "WAGER", status: "SUCCEEDED", requestHash: bundle.commandRequestHash } });
    if (!originalCommand || evidenceHash(originalCommand.result) !== bundle.commandReceiptHash) fail("ORIGINAL_SETTLEMENT_RECEIPT_SCOPE_REQUIRED");
    for (const [key2, accountId] of Object.entries(bundle.accounts)) if (!await tx.ledgerAccount.findFirst({ where: { id: accountId, tenantId, currency: bundle.currency, key: key2, playerId: key2 === "PLAYER_CASH" ? wager.playerId : null } })) fail("ORIGINAL_SETTLEMENT_RECEIPT_SCOPE_REQUIRED");
    const originalJournal = settlementJournal({ idempotencyKey: `full-straight:${input.idempotencyKey}`, stake: minor(bundle.stakeMinor), payout: minor(bundle.payoutMinor), currency: bundle.currency, pendingAccountId: bundle.accounts.WAGERS_PENDING, cashAccountId: bundle.accounts.PLAYER_CASH, revenueAccountId: bundle.accounts.GAMING_REVENUE, winningsExpenseAccountId: bundle.accounts.WINNINGS_EXPENSE });
    const originalEntries = await tx.journalEntry.findMany({ where: { tenantId, transactionId: prior.journalTransactionId }, take: originalJournal.entries.length + 1 });
    const signature = (entry) => `${entry.accountId}:${entry.side}:${entry.currency}:${entry.amountMinor ?? String(entry.amount)}`;
    if (evidenceHash(originalEntries.map(signature).sort()) !== evidenceHash(originalJournal.entries.map(signature).sort())) fail("ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED");
    assertHumanSession(session, actorId);
    return prior.id;
  }
  const data = await loadFullStraightPlan(tx, tenantId, input.wagerId), { plan, accounts, balance } = data;
  if (plan.planHash !== input.planHash) fail("STALE_SETTLEMENT_PLAN");
  const journal = settlementJournal({ idempotencyKey: `full-straight:${input.idempotencyKey}`, stake: minor(plan.stakeMinor), payout: minor(plan.payoutMinor), currency: plan.currency, pendingAccountId: accounts.WAGERS_PENDING.id, cashAccountId: accounts.PLAYER_CASH.id, revenueAccountId: accounts.GAMING_REVENUE.id, winningsExpenseAccountId: accounts.WINNINGS_EXPENSE.id });
  if (await tx.journalTransaction.findFirst({ where: { tenantId, idempotencyKey: journal.idempotencyKey } })) fail("ORIGINAL_SETTLEMENT_RECEIPT_REQUIRED");
  const now = /* @__PURE__ */ new Date();
  const run = await tx.settlementRun.create({ data: { tenantId, triggerType: "RESULT_APPROVED", resultVersionId: plan.resultVersionId, inputHash: requestHash, status: "RUNNING", wagersConsidered: 1, wagersSettled: 0, startedAt: now } });
  assertHumanSession(session, actorId);
  const posted = await postJournal(tx, tenantId, journal, input.wagerId);
  await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, postedMinor: String(minor(balance.postedMinor) + minor(plan.payoutMinor)), availableMinor: String(minor(balance.availableMinor) + minor(plan.payoutMinor)), pendingMinor: balance.pendingMinor, version: balance.version + 1, asOf: now } });
  const settlement = await tx.settlement.create({ data: { tenantId, wagerId: input.wagerId, resultVersionId: plan.resultVersionId, settlementRunId: run.id, version: 1, outcome: plan.outcome, grossPayoutMinor: plan.payoutMinor, payoutMinor: plan.payoutMinor, taxMinor: "0", inputHash: input.idempotencyKey, journalTransactionId: posted.id } });
  await tx.settlementLine.create({ data: { tenantId, settlementId: settlement.id, wagerPartId: data.part.id, wagerLegId: data.leg.id, lineType: plan.outcome === "LOSS" ? "LOSS" : plan.outcome === "VOID" ? "STAKE_RETURN" : "PROFIT", amountMinor: plan.payoutMinor, unroundedValue: `${plan.payoutMinor}.000000`, scale: 6, roundingRule: "DOWN_AT_POSTING", residualMinor: "0", trace: { contract: CONTRACT, requestHash, planHash: plan.planHash, bundle: plan.bundle, capturedHoldId: data.hold.id, grades: [{ legId: data.leg.id, gradeId: data.grade.id, outcome: plan.outcome }] } } });
  const changed = await tx.wager.updateMany({ where: { id: input.wagerId, tenantId, version: data.wager.version, status: data.wager.status }, data: { status: "SETTLED", version: { increment: 1 } } });
  if (changed.count !== 1) fail("STALE_WAGER_STATE");
  await tx.wagerPart.update({ where: { id: data.part.id }, data: { status: "SETTLED", settlementId: settlement.id, gradeSummary: { outcome: plan.outcome, payoutMinor: plan.payoutMinor, resultVersionId: plan.resultVersionId, ruleVersion: plan.ruleVersion } } });
  const closedStake = minor(data.allocation.remainingStakeMinor), closedLiability = minor(data.allocation.remainingLiabilityMinor);
  const closed = await tx.wagerExposureAllocation.updateMany({ where: { id: data.allocation.id, tenantId, wagerId: input.wagerId, version: data.allocation.version, status: "OPEN" }, data: { remainingStakeMinor: "0", remainingLiabilityMinor: "0", status: "CLOSED", version: { increment: 1 } } });
  if (closed.count !== 1) fail("STALE_EXPOSURE_ALLOCATION");
  await tx.exposurePosition.update({ where: { id: data.exposure.id }, data: { stakeMinor: String(minor(data.exposure.stakeMinor) - closedStake), liabilityMinor: String(minor(data.exposure.liabilityMinor) - closedLiability), version: { increment: 1 }, asOf: now } });
  await tx.settlementRun.update({ where: { id: run.id }, data: { status: "COMPLETED", wagersSettled: 1, completedAt: now } });
  await appendAudit(tx, tenantId, actorId, "wager.settled_full", "Wager", input.wagerId, "REVIEWED_FULL_STRAIGHT_PLAN", { settlementId: settlement.id, requestHash, planHash: plan.planHash, resultVersionId: plan.resultVersionId, payoutMinor: plan.payoutMinor });
  await emit(tx, tenantId, "WAGER", input.wagerId, "wager.settled.v2", { settlementId: settlement.id, planHash: plan.planHash, payoutMinor: plan.payoutMinor, currency: plan.currency });
  assertHumanSession(session, actorId);
  return settlement.id;
}

// features/keystone/mutations/sportsbook-full.ts
var graphql2 = String.raw;
var operatorInstant = async (context, tenantId, value, label) => resolveOperatorInstant(value, await tenantTimeZone(context.prisma, tenantId), label);
var allowedEventStates = /* @__PURE__ */ new Set(["SCHEDULED", "LIVE", "ENDED", "CANCELLED", "SUSPENDED"]);
var allowedProviderStates = /* @__PURE__ */ new Set(["ACTIVE", "DEGRADED", "DISABLED"]);
var money2 = (value) => {
  positiveMoney(value, "AMOUNT");
  return BigInt(value);
};
var object = (raw, code) => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error(code);
  }
};
var approved = async (tx, context, capability, tenantId, id, action, payloadHash, consumedKey) => consumeApproval(tx, context, { tenantId, capability, approvalId: id, action, payloadHash, consumedKey });
var disputeCurrency = async (tx, tenantId, dispute, adjustmentMinor) => {
  if (dispute.wagerId) {
    const wager = await tx.wager.findFirst({ where: { id: dispute.wagerId, tenantId } });
    if (!wager?.currency || wager.playerId !== dispute.playerId) throw new Error("DISPUTE_WAGER_MISMATCH");
    return String(wager.currency);
  }
  if (BigInt(adjustmentMinor) !== 0n) throw new Error("DISPUTE_CURRENCY_REQUIRES_REVIEW");
  return null;
};
var nonnegativeMoney = (value, code) => {
  const text7 = String(value ?? "");
  if (!/^\d{1,30}$/.test(text7)) throw new Error(code);
  return BigInt(text7);
};
var strictUtcInstant = (value, code) => {
  const text7 = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(text7)) throw new Error(code);
  const date = new Date(text7);
  if (Number.isNaN(date.getTime())) throw new Error(code);
  return date;
};
var TAX_BASES = /* @__PURE__ */ new Set(["STAKE", "WINNINGS", "GGR"]);
var TAX_ROUNDING = /* @__PURE__ */ new Set(["DOWN_AT_POSTING", "UP_AT_POSTING", "HALF_UP_AT_POSTING"]);
var assertSupportedTaxRule = (basis, roundingRule) => {
  if (!TAX_BASES.has(basis)) throw new Error("TAX_BASIS_UNSUPPORTED");
  if (!TAX_ROUNDING.has(roundingRule)) throw new Error("TAX_ROUNDING_UNSUPPORTED");
};
var roundTax = (numerator, denominator, rule) => {
  const q = numerator / denominator, r = numerator % denominator;
  if (r === 0n || rule === "DOWN_AT_POSTING") return q;
  if (rule === "UP_AT_POSTING") return q + 1n;
  if (rule === "HALF_UP_AT_POSTING") return r * 2n >= denominator ? q + 1n : q;
  throw new Error("TAX_ROUNDING_UNSUPPORTED");
};
var playerLiabilityAsOf = async (tx, tenantId, currency, asOf) => {
  let total = 0n, count = 0, cursor;
  for (; ; ) {
    const rows = await tx.journalEntry.findMany({ where: { tenantId, currency, account: { accountClass: "LIABILITY", playerId: { not: null }, currency }, transaction: { effectiveAt: { lte: asOf } } }, select: { id: true, side: true, amountMinor: true }, orderBy: { id: "asc" }, take: 1e3, ...cursor ? { skip: 1, cursor: { id: cursor } } : {} });
    for (const row of rows) {
      total += row.side === "CREDIT" ? BigInt(row.amountMinor) : -BigInt(row.amountMinor);
    }
    count += rows.length;
    if (rows.length < 1e3) return { total, count };
    cursor = rows[rows.length - 1].id;
  }
};
var sportsbookFullTypeDefs = graphql2`
  type OperatorPasswordResetResult { code: String, message: String! }
  type OperatorMfaEnrollment { secret: String!, uri: String! }
  type OperatorMfaCompletion { enabled: Boolean!, recoveryCodes: [String!]!, sessionToken: String! }
  extend type Query {
    operatorSessionAssured: Boolean!
    fullStraightSettlementPlan(wagerId:ID!): String!
  }
  extend type Mutation {
    bootstrapOperatorAdmin(name:String!,email:String!,password:String!): ID!
    beginOperatorMfaEnrollment: OperatorMfaEnrollment!
    completeOperatorMfaEnrollment(code:String!): OperatorMfaCompletion!
    verifyOperatorMfaSession(code:String!): String!
    sendUserPasswordResetLink(email:String!): Boolean!
    redeemUserPasswordResetToken(email:String!,token:String!,password:String!): OperatorPasswordResetResult!
    setEventTradingState(eventId:ID!,status:String!,livePhase:String,clockSeconds:Int,reason:String!): Boolean!
    createCompetitionSeason(competitionId:ID!,key:String!,name:String!,startsAt:String!,endsAt:String!): ID!
    createCatalogVenue(key:String!,name:String!,countryCode:String!,timezone:String!): ID!
    createCatalogCompetitor(key:String!,name:String!): ID!
    createCatalogSport(key:String!,name:String!): ID!
    createCatalogCompetition(sportId:ID!,key:String!,name:String!,timezone:String!): ID!
    createCatalogStage(seasonId:ID!,key:String!,name:String!,sortOrder:Int!): ID!
    setCatalogReferenceStatus(type:String!,id:ID!,active:Boolean!,reason:String!): Boolean!
    attachEventParticipant(eventId:ID!,competitorId:ID!,role:String!,sortOrder:Int!): ID!
    rescheduleEvent(eventId:ID!,startAt:String!,reason:String!): Boolean!
    createEventMarket(eventId:ID!,definitionKey:String!,parameters:String!,tradingMode:String!,cashOutEnabled:Boolean!,selections:String!): ID!
    mapProviderEntity(connectionId:ID!,entityType:String!,externalId:String!,canonicalType:String!,canonicalId:ID!,confidence:String!): ID!
    requestTraderOverride(targetType:String!,targetId:ID!,overrideType:String!,value:String!,expiresAt:String!,reason:String!): ID!
    requestCorrelationRule(groupKey:String!,sportKey:String!,leftMarketId:ID!,rightMarketId:ID!,decision:String!,reason:String!): ID!
    applyCorrelationRule(groupKey:String!,sportKey:String!,leftMarketId:ID!,rightMarketId:ID!,decision:String!,approvalId:ID!): ID!
    applyTraderOverride(overrideId:ID!,approvalId:ID!): Boolean!
    runTradingReplay(connectionId:ID!,scopeType:String!,scopeId:ID!,frontier:String!): ID!
    requestLegalEntity(name:String!,countryCode:String!,registrationReference:String!,reason:String!): ID!
    applyLegalEntity(name:String!,countryCode:String!,registrationReference:String!,approvalId:ID!): ID!
    createJurisdictionPolicyDraft(jurisdictionId:ID!,authorityCitation:String!,policyDocument:String!,effectiveFrom:String!): ID!
    requestJurisdictionActivation(policyId:ID!,operatorJurisdictionId:ID!,externalEvidenceHash:String!,reason:String!): ID!
    applyJurisdictionActivation(policyId:ID!,operatorJurisdictionId:ID!,externalEvidenceHash:String!,approvalId:ID!): Boolean!
    requestOperatorBrand(name:String!,domain:String!,defaultLocale:String!,defaultTimezone:String!,reason:String!): ID!
    applyOperatorBrand(name:String!,domain:String!,defaultLocale:String!,defaultTimezone:String!,approvalId:ID!): ID!
    requestTenantCurrency(code:String!,exponent:Int!,name:String!,depositsEnabled:Boolean!,withdrawalsEnabled:Boolean!,wageringEnabled:Boolean!,defaultForBrand:Boolean!,reason:String!): ID!
    applyTenantCurrency(code:String!,exponent:Int!,name:String!,depositsEnabled:Boolean!,withdrawalsEnabled:Boolean!,wageringEnabled:Boolean!,defaultForBrand:Boolean!,approvalId:ID!): ID!
    requestBrandLocale(brandId:ID!,locale:String!,language:String!,timezone:String!,termsVersion:String!,termsContentHash:String!,reason:String!): ID!
    applyBrandLocale(brandId:ID!,locale:String!,language:String!,timezone:String!,termsVersion:String!,termsContentHash:String!,approvalId:ID!): ID!
    requestHouseRule(name:String!,sportKey:String!,marketDefinitionKey:String!,rules:String!,effectiveFrom:String!,reason:String!): ID!
    applyHouseRule(name:String!,sportKey:String!,marketDefinitionKey:String!,rules:String!,effectiveFrom:String!,approvalId:ID!): ID!
    requestFeatureFlag(key:String!,description:String!,enabled:Boolean!,scopeType:String!,scopeId:String!,expiresAt:String!,reason:String!): ID!
    applyFeatureFlag(key:String!,description:String!,enabled:Boolean!,scopeType:String!,scopeId:String!,expiresAt:String!,approvalId:ID!): ID!
    createPromotionCampaign(key:String!,name:String!,description:String!,type:String!,startsAt:String!,endsAt:String!,budgetMinor:String!,currency:String!,economics:String!,requirements:String!): ID!
    requestPromotionActivation(promotionId:ID!,reason:String!): ID!
    applyPromotionActivation(promotionId:ID!,approvalId:ID!): Boolean!
    requestWebhookEndpoint(name:String!,url:String!,eventTypes:String!,secretReference:String!,reason:String!): ID!
    applyWebhookEndpoint(name:String!,url:String!,eventTypes:String!,secretReference:String!,approvalId:ID!): ID!
    testWebhookEndpoint(endpointId:ID!): ID!
    runAdapterCertification(connectionId:ID!): ID!
    setProviderOperationalState(connectionId:ID!,status:String!,reason:String!): Boolean!
    settleCombinationWager(wagerId:ID!,idempotencyKey:String!,planHash:String,expectedActorId:ID,expectedTenantId:ID): ID!
    requestCombinationResettlement(settlementId:ID!,reason:String!): ID!
    resettleCombinationWager(settlementId:ID!,approvalId:ID!,idempotencyKey:String!): ID!
    requestCashOutCorrection(acceptanceId:ID!,reason:String!): ID!
    correctCashOut(acceptanceId:ID!,approvalId:ID!,idempotencyKey:String!): ID!
    recordComplianceScreening(playerId:ID!,screeningType:String!,status:String!,reason:String!,evidenceReference:String!): ID!
    requestDisputeResolution(disputeId:ID!,resolution:String!,adjustmentMinor:String!,reason:String!): ID!
    withdrawDisputeProposal(disputeId:ID!,reason:String!): ID!
    transitionPrivacyRequest(requestId:ID!,status:String!,reason:String!,artifactReference:String): Boolean!
    applyDisputeResolution(disputeId:ID!,resolution:String!,adjustmentMinor:String!,approvalId:ID!): Boolean!
    setSupportCaseStatus(caseId:ID!,status:String!,customerMessage:String!,reason:String!): Boolean!
    runSafeguardingReconciliation(accountId:ID!,assetMinor:String!,asOf:String!): ID!
    openChargeback(paymentIntentId:ID!,amountMinor:String!,idempotencyKey:String!,reason:String!): ID!
    requestTaxRule(jurisdictionId:ID!,key:String!,basis:String!,rateNumerator:String!,rateDenominator:String!,roundingRule:String!,effectiveFrom:String!,reason:String!): ID!
    applyTaxRule(jurisdictionId:ID!,key:String!,basis:String!,rateNumerator:String!,rateDenominator:String!,roundingRule:String!,effectiveFrom:String!,approvalId:ID!): ID!
    assessSettlementTax(settlementId:ID!,taxRuleId:ID!,idempotencyKey:String!): ID!
    requestLedgerAdjustment(accountId:ID!,amountMinor:String!,direction:String!,reasonCode:String!,evidence:String!): ID!
    applyLedgerAdjustment(adjustmentId:ID!,approvalId:ID!,idempotencyKey:String!): ID!
    scheduleOperationalJob(type:String!,scopeType:String!,scopeId:String!,dueAt:String!,payload:String!,idempotencyKey:String!): ID!
    runRetentionDryRun(policyId:ID!,windowFrom:String!,windowTo:String!): ID!
    requestRetentionExecution(executionId:ID!,reason:String!): ID!
    applyRetentionExecution(executionId:ID!,approvalId:ID!): Boolean!
    requestDataExport(type:String!,classification:String!,scope:String!,expiresAt:String!): ID!
    applyApprovedDataExport(exportId:ID!,approvalId:ID!): Boolean!
  }
`;
async function combinationSettlement(tx, tenantId, actorId, wagerId, idempotencyKey, correctionOf) {
  const prior = await tx.settlement.findFirst({ where: { tenantId, wagerId, inputHash: idempotencyKey } });
  if (prior) return prior.id;
  await lockWagerForSettlement(tx, tenantId, wagerId);
  const retry = await tx.settlement.findFirst({ where: { tenantId, wagerId, inputHash: idempotencyKey } });
  if (retry) return retry.id;
  const wager = await tx.wager.findFirst({ where: { id: wagerId, tenantId } });
  if (!wager) throw new Error("Not found");
  if (correctionOf) {
    const reviewedLines = await tx.settlementLine.findMany({ where: { tenantId, settlementId: correctionOf.id } });
    if (reviewedLines.some((line) => line.trace?.contract === "openfront.full-straight.initial.v1")) throw new Error("REVIEWED_STRAIGHT_CORRECTION_PLAN_REQUIRED");
    await assertCurrentSettlement(tx, tenantId, wagerId, correctionOf.id);
  }
  if (!correctionOf && !["ACCEPTED", "OPEN", "PARTIALLY_CASHED_OUT", "GRADED"].includes(wager.status)) throw new Error("WAGER_NOT_SETTLEABLE");
  const parts = await tx.wagerPart.findMany({ where: { tenantId, wagerId }, orderBy: { partIndex: "asc" } });
  if (!parts.length) throw new Error("WAGER_PARTS_REQUIRED");
  const legs = await tx.wagerLeg.findMany({ where: { tenantId, wagerId } });
  if (!legs.length) throw new Error("WAGER_LEGS_REQUIRED");
  const legIds = legs.map((leg) => leg.id);
  const allGrades = await tx.legGrade.findMany({ where: { tenantId, wagerLegId: { in: legIds } }, include: { marketGrade: { include: { resultVersion: true } } }, orderBy: { createdAt: "desc" } });
  const latestGrade = /* @__PURE__ */ new Map();
  const acceptedRuleByLeg = new Map(legs.map((leg) => [leg.id, String(leg.ruleVersion ?? "")]));
  for (const grade of allGrades) {
    if (!grade.wagerLegId || grade.marketGrade?.resultVersion?.status !== "APPROVED" || grade.marketGrade?.ruleVersion !== acceptedRuleByLeg.get(grade.wagerLegId)) continue;
    const prior2 = latestGrade.get(grade.wagerLegId), version = Number(grade.marketGrade.resultVersion.version), priorVersion = Number(prior2?.marketGrade?.resultVersion?.version ?? -1);
    if (!prior2 || version > priorVersion) latestGrade.set(grade.wagerLegId, grade);
  }
  if (correctionOf) {
    const oldLines = correctionOf.from_SettlementLine_settlement ?? await tx.settlementLine.findMany({ where: { tenantId, settlementId: correctionOf.id } }), oldGradeIds = [...new Set(oldLines.flatMap((line) => Array.isArray(line.trace?.grades) ? line.trace.grades.map((grade) => String(grade.gradeId)) : []))];
    if (!oldGradeIds.length) throw new Error("SETTLEMENT_GRADE_EVIDENCE_REQUIRED");
    const oldGrades = await tx.legGrade.findMany({ where: { tenantId, id: { in: oldGradeIds } }, include: { marketGrade: { include: { resultVersion: true } } } });
    let advanced = false;
    for (const oldGrade of oldGrades) {
      const nextGrade = latestGrade.get(oldGrade.wagerLegId), oldVersion = Number(oldGrade.marketGrade?.resultVersion?.version), nextVersion = Number(nextGrade?.marketGrade?.resultVersion?.version);
      if (!nextGrade || !Number.isFinite(oldVersion) || !Number.isFinite(nextVersion)) throw new Error("SETTLEMENT_GRADE_EVIDENCE_REQUIRED");
      if (nextVersion < oldVersion) throw new Error("OUT_OF_ORDER_RESULT_CORRECTION");
      if (nextVersion > oldVersion) advanced = true;
    }
    if (!advanced) throw new Error("CORRECTION_REQUIRES_NEWER_RESULT_VERSION");
  }
  if (legs.some((leg) => !latestGrade.has(leg.id))) throw new Error("MISSING_APPROVED_GRADES");
  const resultVersions = [...new Map([...latestGrade.values()].map((grade) => [grade.marketGrade.resultVersion.id, grade.marketGrade.resultVersion])).values()];
  const cashOutRows = await tx.cashOutAcceptance.findMany({ where: { tenantId, wagerId } });
  const cashOutState = projectCashOutState(wager.stakeMinor, cashOutRows, parts);
  const closedMillionths = cashOutState.closedMillionths, remainingStakes = cashOutState.remainingPartStakeMinor;
  if (closedMillionths >= 1000000n) throw new Error("WAGER_FULLY_CASHED_OUT");
  const bonus = wager.bonusAwardId ? await tx.bonusAward.findFirst({ where: { id: wager.bonusAwardId, tenantId }, include: { ruleVersion: true } }) : null;
  let totalStake = 0n, totalPayout = 0n;
  const linePlans = [];
  for (const [partIndex, part] of parts.entries()) {
    if (part.status === "CASHED_OUT") continue;
    const partLegs = legs.filter((leg) => leg.wagerPartId === part.id);
    const stake = remainingStakes[partIndex];
    const calculated = settleCombinationPart({ stakeMinor: stake, stakeReturned: bonus ? Boolean(bonus.stakeReturned) : true, acceptedPotentialReturnMinor: BigInt(part.potentialReturnMinor), legs: partLegs.map((leg) => {
      const grade = latestGrade.get(leg.id);
      return { decimalOdds: leg.decimalOdds, outcome: grade.outcome, factorNumerator: grade.factorNumerator ? BigInt(grade.factorNumerator) : void 0, factorDenominator: grade.factorDenominator ? BigInt(grade.factorDenominator) : void 0 };
    }) });
    totalStake += stake;
    totalPayout += calculated.payoutMinor;
    linePlans.push({ part, stake, payout: calculated.payoutMinor, multiplier: calculated.multiplier, inputHash: calculated.inputHash, grades: partLegs.map((leg) => ({ legId: leg.id, gradeId: latestGrade.get(leg.id).id, outcome: latestGrade.get(leg.id).outcome })) });
  }
  const inputHash = evidenceHash({ wagerId, parts: linePlans.map((line) => ({ partId: line.part.id, stake: String(line.stake), payout: String(line.payout), inputHash: line.inputHash })), resultVersionIds: resultVersions.map((item) => item.id), correctionOf: correctionOf?.id ?? null, idempotencyKey });
  const run = await tx.settlementRun.create({ data: { tenantId, triggerType: correctionOf ? "CORRECTION" : "RESULT_APPROVED", resultVersionId: resultVersions[0].id, inputHash, status: "RUNNING", wagersConsidered: 1, wagersSettled: 0, startedAt: /* @__PURE__ */ new Date() } });
  let reversalJournal = null;
  if (correctionOf?.journalTransaction) {
    const original = { idempotencyKey: correctionOf.journalTransaction.idempotencyKey, type: correctionOf.journalTransaction.type, entries: correctionOf.journalTransaction.from_JournalEntry_transaction.map((entry) => ({ accountId: entry.accountId, currency: entry.currency, side: entry.side, amount: BigInt(entry.amountMinor) })) };
    reversalJournal = await postJournal(tx, tenantId, reverseJournal(original, `full-resettle-reversal:${idempotencyKey}`), wagerId);
  }
  const accounts = await accountMap(tx, tenantId, wager.playerId, wager.currency);
  let payoutAccount = accounts.PLAYER_CASH, restrictedPayout = false, conversionComplete = false;
  if (bonus?.awardType === "BONUS_CASH") {
    const requirements = bonus.ruleVersion?.wageringRequirements ?? {}, multiple = BigInt(String(requirements.wageringMultiple ?? "1")), transactions = await tx.bonusTransaction.findMany({ where: { tenantId, awardId: bonus.id, type: "CONSUME" } }), contributed = transactions.reduce((sum, item) => sum + BigInt(item.amountMinor), 0n), required = BigInt(bonus.amountMinor) * multiple;
    conversionComplete = contributed >= required;
    restrictedPayout = !conversionComplete;
    if (restrictedPayout) {
      const bonusAccount = await tx.ledgerAccount.findFirst({ where: { tenantId, playerId: wager.playerId, key: "PLAYER_BONUS", currency: wager.currency } });
      if (!bonusAccount) throw new Error("BONUS_PAYOUT_ACCOUNT_MISSING");
      payoutAccount = bonusAccount;
    }
  }
  const priorBonusTransaction = correctionOf && bonus ? await tx.bonusTransaction.findFirst({ where: { tenantId, awardId: bonus.id, journalTransactionId: correctionOf.journalTransactionId, type: { in: ["RELEASE", "CONVERT"] } } }) : null;
  let bonusBaseRemaining = bonus ? BigInt(bonus.remainingMinor) : 0n;
  if (priorBonusTransaction?.type === "RELEASE") bonusBaseRemaining -= BigInt(priorBonusTransaction.amountMinor);
  const journalEntries = [{ accountId: accounts.WAGERS_PENDING.id, currency: wager.currency, side: "DEBIT", amount: totalStake }];
  if (totalPayout > totalStake) journalEntries.push({ accountId: accounts.WINNINGS_EXPENSE.id, currency: wager.currency, side: "DEBIT", amount: totalPayout - totalStake });
  if (totalPayout > 0n) journalEntries.push({ accountId: payoutAccount.id, currency: wager.currency, side: "CREDIT", amount: totalPayout });
  if (totalStake > totalPayout) journalEntries.push({ accountId: accounts.GAMING_REVENUE.id, currency: wager.currency, side: "CREDIT", amount: totalStake - totalPayout });
  const posted = await postJournal(tx, tenantId, { idempotencyKey: `full-settlement:${idempotencyKey}`, type: correctionOf ? "WAGER_RESETTLEMENT" : "WAGER_SETTLEMENT", entries: journalEntries }, wagerId);
  const oldPayout = correctionOf ? BigInt(correctionOf.payoutMinor) : 0n;
  let originalPayoutAccountId = payoutAccount.id;
  if (correctionOf && oldPayout > 0n) {
    const credits = (correctionOf.journalTransaction?.from_JournalEntry_transaction ?? []).filter((entry) => entry.side === "CREDIT" && BigInt(entry.amountMinor) === oldPayout), playerAccounts = credits.length ? await tx.ledgerAccount.findMany({ where: { tenantId, playerId: wager.playerId, id: { in: credits.map((entry) => entry.accountId) }, key: { in: ["PLAYER_CASH", "PLAYER_BONUS"] } } }) : [];
    if (playerAccounts.length !== 1) throw new Error("SETTLEMENT_PAYOUT_ACCOUNT_EVIDENCE_REQUIRED");
    originalPayoutAccountId = playerAccounts[0].id;
  }
  const adjustProjection = async (accountId, delta) => {
    const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId }, orderBy: { version: "desc" } });
    if (!balance) throw new Error("MISSING_BALANCE");
    const next = BigInt(balance.postedMinor) + delta, available = BigInt(balance.availableMinor) + delta;
    if (next < 0n || available < 0n) throw new Error("RESETTLEMENT_REQUIRES_RECEIVABLE_REVIEW");
    await tx.balanceProjection.create({ data: { tenantId, accountId, postedMinor: String(next), pendingMinor: balance.pendingMinor, availableMinor: String(available), version: Number(balance.version) + 1, asOf: /* @__PURE__ */ new Date() } });
  };
  if (originalPayoutAccountId === payoutAccount.id) await adjustProjection(payoutAccount.id, totalPayout - oldPayout);
  else {
    await adjustProjection(originalPayoutAccountId, -oldPayout);
    await adjustProjection(payoutAccount.id, totalPayout);
  }
  if (priorBonusTransaction && bonus && reversalJournal) {
    await tx.bonusTransaction.create({ data: { tenantId, awardId: bonus.id, type: "REVERSE", amountMinor: priorBonusTransaction.amountMinor, remainingMinor: String(bonusBaseRemaining), currency: wager.currency, wagerId, journalTransactionId: reversalJournal.id, idempotencyKey: `bonus-resettle-reverse:${idempotencyKey}`, evidenceHash: evidenceHash({ reversalOf: priorBonusTransaction.id, wagerId }) } });
    await tx.bonusAward.update({ where: { id: bonus.id }, data: { remainingMinor: String(bonusBaseRemaining), status: "ACTIVE" } });
  }
  if (bonus && totalPayout > 0n) {
    if (restrictedPayout) {
      const remaining = bonusBaseRemaining + totalPayout;
      await tx.bonusAward.update({ where: { id: bonus.id }, data: { remainingMinor: String(remaining), status: "ACTIVE" } });
      await tx.bonusTransaction.create({ data: { tenantId, awardId: bonus.id, type: "RELEASE", amountMinor: String(totalPayout), remainingMinor: String(remaining), currency: wager.currency, wagerId, journalTransactionId: posted.id, idempotencyKey: `bonus-settlement:${idempotencyKey}`, evidenceHash: evidenceHash({ bonusAwardId: bonus.id, wagerId, payoutMinor: String(totalPayout), restricted: true }) } });
    } else if (conversionComplete && bonus.awardType === "BONUS_CASH") {
      await tx.bonusAward.update({ where: { id: bonus.id }, data: { status: "CONVERTED" } });
      await tx.bonusTransaction.create({ data: { tenantId, awardId: bonus.id, type: "CONVERT", amountMinor: String(totalPayout), remainingMinor: bonus.remainingMinor, currency: wager.currency, wagerId, journalTransactionId: posted.id, idempotencyKey: `bonus-convert:${idempotencyKey}`, evidenceHash: evidenceHash({ bonusAwardId: bonus.id, wagerId, payoutMinor: String(totalPayout), restricted: false }) } });
    }
  }
  const outcomes2 = [...new Set([...latestGrade.values()].map((grade) => grade.outcome))];
  const outcome = outcomes2.length === 1 ? outcomes2[0] : "PARTIAL";
  const settlement = await tx.settlement.create({ data: { tenantId, wagerId, resultVersionId: resultVersions[0].id, settlementRunId: run.id, version: (correctionOf?.version ?? 0) + 1, outcome, grossPayoutMinor: String(totalPayout), taxMinor: "0", payoutMinor: String(totalPayout), inputHash: idempotencyKey, journalTransactionId: posted.id, reversalOfId: correctionOf?.id ?? null } });
  for (const line of linePlans) {
    await tx.settlementLine.create({ data: { tenantId, settlementId: settlement.id, wagerPartId: line.part.id, lineType: line.payout === 0n ? "LOSS" : line.payout === line.stake ? "STAKE_RETURN" : "PROFIT", amountMinor: String(line.payout), unroundedValue: `${line.payout}.000000`, scale: 6, roundingRule: "DOWN_AT_POSTING", residualMinor: "0", trace: { multiplier: line.multiplier, inputHash: line.inputHash, grades: line.grades } } });
    await tx.wagerPart.update({ where: { id: line.part.id }, data: { status: "SETTLED", gradeSummary: { payoutMinor: String(line.payout), multiplier: line.multiplier, grades: line.grades }, settlementId: settlement.id } });
  }
  await tx.wager.update({ where: { id: wagerId }, data: { status: "SETTLED", version: { increment: 1 } } });
  const allocations = await tx.wagerExposureAllocation.findMany({ where: { tenantId, wagerId } });
  await tx.wagerExposureAllocation.updateMany({ where: { tenantId, wagerId }, data: { remainingStakeMinor: "0", remainingLiabilityMinor: "0", status: "CLOSED", version: { increment: 1 } } });
  for (const marketId of new Set(allocations.map((item) => item.marketId))) {
    const active = await tx.wagerExposureAllocation.findMany({ where: { tenantId, marketId, status: { not: "CLOSED" } } }), stake = active.reduce((sum, item) => sum + BigInt(item.remainingStakeMinor), 0n), liability = active.reduce((sum, item) => sum + BigInt(item.remainingLiabilityMinor), 0n), projection = await tx.exposurePosition.findFirst({ where: { tenantId, scopeType: "MARKET", scopeId: marketId, currency: wager.currency } });
    if (projection) await tx.exposurePosition.update({ where: { id: projection.id }, data: { stakeMinor: String(stake), liabilityMinor: String(liability), version: { increment: 1 }, asOf: /* @__PURE__ */ new Date() } });
  }
  await tx.settlementRun.update({ where: { id: run.id }, data: { status: "COMPLETED", wagersSettled: 1, completedAt: /* @__PURE__ */ new Date() } });
  await emit(tx, tenantId, "WAGER", wagerId, correctionOf ? "wager.resettled.v2" : "wager.settled.v2", { settlementId: settlement.id, version: settlement.version, payoutMinor: String(totalPayout), currency: wager.currency, inputHash, resultVersionIds: resultVersions.map((item) => item.id) });
  await appendAudit(tx, tenantId, actorId, correctionOf ? "wager.resettled_full" : "wager.settled_full", "Wager", wagerId, correctionOf ? "DUAL_APPROVED_CORRECTION" : "APPROVED_RESULTS", { settlementId: settlement.id, runId: run.id, payoutMinor: String(totalPayout), inputHash, resultVersionIds: resultVersions.map((item) => item.id) });
  return settlement.id;
}
var sportsbookFullResolvers = { Query: { operatorSessionAssured: (_r, _a, context) => hasOperatorMfaAssurance(context.session), fullStraightSettlementPlan: async (_r, a, context) => {
  const tenantId = await requireTenant(context, "canManageRisk");
  return JSON.stringify(await getFullStraightPlan(context.prisma, tenantId, context.session.itemId, a.wagerId, context.session));
} }, Mutation: {
  bootstrapOperatorAdmin: async (_r, a, context) => {
    if (!/^\S+@\S+\.\S+$/.test(a.email) || String(a.password).length < 12 || String(a.name).trim().length < 2) throw new Error("INVALID_INITIAL_ADMIN");
    return context.transaction(async (txContext) => {
      await txContext.prisma.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('openfront-initial-admin'))`;
      if (await txContext.prisma.user.count()) throw new Error("INITIAL_ADMIN_ALREADY_EXISTS");
      const role = await txContext.sudo().query.Role.createOne({ data: { name: "Admin", canSeeOtherPeople: true, canEditOtherPeople: true, canManagePeople: true, canManageRoles: true, canAccessDashboard: true, canManageOnboarding: true, canManageSportsbook: true, canTrade: true, canManageRisk: true, canManageCompliance: true, canManageFinance: true, canManageIntegrations: true, canApproveSensitiveActions: false, canReadAudit: true }, query: "id" });
      const user = await txContext.sudo().query.User.createOne({ data: { name: String(a.name).trim(), email: String(a.email).trim().toLowerCase(), password: a.password, role: { connect: { id: role.id } } }, query: "id" });
      return user.id;
    });
  },
  beginOperatorMfaEnrollment: async (_r, _a, context) => {
    const userId = context.session?.itemId;
    if (!userId) throw new Error("AUTHENTICATION_REQUIRED");
    const user = await context.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || !user.role || !["canManagePeople", "canManageRoles", "canManageOnboarding", "canManageSportsbook", "canTrade", "canManageRisk", "canManageCompliance", "canManageFinance", "canManageIntegrations", "canApproveSensitiveActions", "canReadAudit"].some((capability) => Boolean(user.role[capability]))) throw new Error("OPERATOR_ACCOUNT_REQUIRED");
    if (user.operatorMfaEnabled) throw new Error("MFA_ALREADY_ENROLLED_STEP_UP_REQUIRED");
    const secret = generateTotpSecret(), uri = `otpauth://totp/${encodeURIComponent("Openfront Sportsbook")}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent("Openfront Sportsbook")}&algorithm=SHA1&digits=6&period=30`;
    await context.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: user.id } });
      if (!current || current.operatorMfaEnabled) throw new Error("MFA_ALREADY_ENROLLED_STEP_UP_REQUIRED");
      await tx.user.update({ where: { id: user.id }, data: { operatorMfaSecret: encryptTotpSecret(secret) } });
      if (user.tenantId) await appendAudit(tx, user.tenantId, user.id, "operator.mfa_enrollment_started", "User", user.id, "OPERATOR_SECURITY", {});
    });
    return { secret, uri };
  },
  completeOperatorMfaEnrollment: async (_r, a, context) => {
    const userId = context.session?.itemId;
    if (!userId) throw new Error("AUTHENTICATION_REQUIRED");
    const recoveryCodes = Array.from({ length: 8 }, () => `${(0, import_node_crypto9.randomBytes)(4).toString("hex").slice(0, 4)}-${(0, import_node_crypto9.randomBytes)(4).toString("hex").slice(0, 4)}`.toUpperCase()), recoveryHashes = recoveryCodes.map((code) => evidenceHash(code));
    const result = await context.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: userId }, include: { role: true } });
      if (!current || current.operatorMfaEnabled || !current.operatorMfaSecret) throw new Error(current?.operatorMfaEnabled ? "MFA_ALREADY_ENROLLED" : "MFA_ENROLLMENT_REQUIRED");
      if (current.operatorMfaLockedUntil && current.operatorMfaLockedUntil > /* @__PURE__ */ new Date()) throw new Error("MFA_TEMPORARILY_LOCKED");
      if (!current.role || !["canManagePeople", "canManageRoles", "canManageOnboarding", "canManageSportsbook", "canTrade", "canManageRisk", "canManageCompliance", "canManageFinance", "canManageIntegrations", "canApproveSensitiveActions", "canReadAudit"].some((capability) => Boolean(current.role[capability]))) throw new Error("OPERATOR_ACCOUNT_REQUIRED");
      if (!verifyTotp(decryptTotpSecret(current.operatorMfaSecret), String(a.code))) {
        const attempts = Number(current.operatorMfaFailedAttempts ?? 0) + 1;
        await tx.user.update({ where: { id: current.id }, data: { operatorMfaFailedAttempts: attempts, operatorMfaLockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 6e4) : null } });
        return { user: null };
      }
      const updated = await tx.user.update({ where: { id: current.id }, data: { operatorMfaEnabled: true, operatorMfaRecoveryHashes: recoveryHashes, operatorMfaEnrolledAt: /* @__PURE__ */ new Date(), operatorMfaFailedAttempts: 0, operatorMfaLockedUntil: null } });
      if (updated.tenantId) await appendAudit(tx, updated.tenantId, updated.id, "operator.mfa_enabled", "User", updated.id, "OPERATOR_SECURITY", { recoveryCodeCount: recoveryCodes.length });
      return { user: updated };
    });
    if (!result.user) throw new Error("INVALID_MFA_CODE");
    const sessionToken = await startOperatorMfaSession(context, result.user.id);
    return { enabled: true, recoveryCodes, sessionToken };
  },
  verifyOperatorMfaSession: async (_r, a, context) => {
    const userId = context.session?.itemId;
    if (!userId) throw new Error("AUTHENTICATION_REQUIRED");
    const verified = await context.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user?.operatorMfaEnabled || !user.operatorMfaSecret) throw new Error("MFA_NOT_ENROLLED");
      const now = /* @__PURE__ */ new Date();
      if (user.operatorMfaLockedUntil && user.operatorMfaLockedUntil > now) throw new Error("MFA_TEMPORARILY_LOCKED");
      const supplied = String(a.code ?? "").trim().toUpperCase(), hashes = Array.isArray(user.operatorMfaRecoveryHashes) ? user.operatorMfaRecoveryHashes.map(String) : [], recoveryIndex = hashes.indexOf(evidenceHash(supplied)), valid = verifyTotp(decryptTotpSecret(user.operatorMfaSecret), supplied) || recoveryIndex >= 0;
      if (!valid) {
        const attempts = Number(user.operatorMfaFailedAttempts ?? 0) + 1;
        await tx.user.update({ where: { id: user.id }, data: { operatorMfaFailedAttempts: attempts, operatorMfaLockedUntil: attempts >= 5 ? new Date(now.getTime() + 15 * 6e4) : null } });
        return null;
      }
      if (recoveryIndex >= 0) hashes.splice(recoveryIndex, 1);
      await tx.user.update({ where: { id: user.id }, data: { operatorMfaFailedAttempts: 0, operatorMfaLockedUntil: null, ...recoveryIndex >= 0 ? { operatorMfaRecoveryHashes: hashes } : {} } });
      if (user.tenantId) await appendAudit(tx, user.tenantId, user.id, "operator.mfa_verified", "User", user.id, recoveryIndex >= 0 ? "RECOVERY_CODE" : "TOTP", {});
      return user.id;
    });
    if (!verified) throw new Error("INVALID_MFA_CODE");
    return startOperatorMfaSession(context, verified);
  },
  sendUserPasswordResetLink: async (_r, a, context) => {
    const email = String(a.email ?? "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return true;
    const user = await context.prisma.user.findUnique({ where: { email } });
    if (!user) return true;
    const token = (0, import_node_crypto9.randomBytes)(32).toString("base64url"), digest = evidenceHash(token);
    await context.prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: digest, passwordResetIssuedAt: /* @__PURE__ */ new Date() } });
    void sendPasswordResetEmail(token, email).catch(() => console.error("Operator password reset email could not be sent."));
    return true;
  },
  redeemUserPasswordResetToken: async (_r, a, context) => {
    const email = String(a.email ?? "").trim().toLowerCase(), token = String(a.token ?? ""), password2 = String(a.password ?? "");
    if (password2.length < 12) return { code: "WEAK_PASSWORD", message: "Use at least 12 characters." };
    const digest = evidenceHash(token), invalid = { code: "INVALID_TOKEN", message: "The reset token is invalid or expired." };
    if (!token) return invalid;
    const redeemed = await context.transaction(async (txContext) => {
      const rows = await txContext.prisma.$queryRaw`SELECT id FROM "User" WHERE email = ${email} FOR UPDATE`, id = rows?.[0]?.id;
      if (!id) return false;
      const redeemedAt = /* @__PURE__ */ new Date(), claimed = await txContext.prisma.user.updateMany({ where: { id, passwordResetToken: digest, passwordResetIssuedAt: { gte: new Date(redeemedAt.getTime() - 30 * 6e4) } }, data: { passwordResetToken: null, passwordResetRedeemedAt: redeemedAt } });
      if (claimed.count !== 1) return false;
      await txContext.sudo().query.User.updateOne({ where: { id }, data: { password: password2 }, query: "id" });
      return true;
    });
    return redeemed ? { code: null, message: "Password reset complete." } : invalid;
  },
  setEventTradingState: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    if (!allowedEventStates.has(a.status)) throw new Error("INVALID_EVENT_STATUS");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const event = await tx.event.findFirst({ where: { id: a.eventId, tenantId } });
      if (!event) throw new Error("Not found");
      assertEventTradingTransition(event.status, a.status);
      if (a.clockSeconds !== void 0 && a.clockSeconds !== null && (!Number.isSafeInteger(a.clockSeconds) || a.clockSeconds < 0 || a.clockSeconds > 2147483647)) throw new Error("INVALID_CLOCK_SECONDS");
      const nextPhase = a.livePhase ?? event.livePhase, nextClock = a.clockSeconds ?? event.clockSeconds;
      if (event.status === a.status && event.livePhase === nextPhase && (event.clockSeconds ?? null) === (nextClock ?? null)) return true;
      const updated = await tx.event.updateMany({ where: { id: event.id, tenantId, status: event.status, version: event.version }, data: { status: a.status, livePhase: nextPhase, clockSeconds: nextClock, version: Number(event.version ?? 0) + 1 } });
      if (updated.count !== 1) throw new Error("STALE_EVENT_STATE");
      if (["SUSPENDED", "ENDED", "CANCELLED"].includes(a.status)) await tx.market.updateMany({ where: { tenantId, eventId: event.id, status: "OPEN" }, data: { status: a.status === "SUSPENDED" ? "SUSPENDED" : "CLOSED", version: { increment: 1 } } });
      await tx.tradingStatusChange.create({ data: { tenantId, scopeType: "EVENT", scopeId: event.id, fromStatus: event.status, toStatus: a.status, reason: a.reason, source: "OPERATOR", actorId: context.session.itemId, effectiveAt: /* @__PURE__ */ new Date() } });
      await appendAudit(tx, tenantId, context.session.itemId, "event.status_changed", "Event", event.id, a.reason, { from: event.status, to: a.status, livePhase: a.livePhase, clockSeconds: a.clockSeconds });
      return true;
    });
  },
  createCompetitionSeason: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade"), startsAt = await operatorInstant(context, tenantId, a.startsAt, "STARTS_AT"), endsAt = await operatorInstant(context, tenantId, a.endsAt, "ENDS_AT");
    if (startsAt >= endsAt) throw new Error("INVALID_SEASON");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const competition = await tx.competition.findFirst({ where: { id: a.competitionId, tenantId } });
      if (!competition) throw new Error("Not found");
      const season = await tx.season.create({ data: { tenantId, competitionId: competition.id, key: a.key, name: a.name, startsAt, endsAt, status: startsAt <= /* @__PURE__ */ new Date() ? "ACTIVE" : "SCHEDULED" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.season_created", "Season", season.id, "OPERATOR_ENTRY", { competitionId: competition.id, key: a.key, startsAt, endsAt });
      return season.id;
    });
  },
  createCatalogVenue: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const row = await tx.venue.create({ data: { tenantId, key: a.key, name: a.name, countryCode: a.countryCode, timezone: a.timezone, address: {}, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.venue_created", "Venue", row.id, "OPERATOR_ENTRY", { key: a.key, countryCode: a.countryCode });
      return row.id;
    });
  },
  /** Operator catalog entry for a sport or competition, with the same key/name rules as other reference data. */
  createCatalogSport: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    const key2 = String(a.key ?? "").trim().toLowerCase(), name = String(a.name ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(key2)) throw new Error("INVALID_CATALOG_KEY");
    if (!name || name.length > 120) throw new Error("INVALID_CATALOG_NAME");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      if (await tx.sport.findFirst({ where: { tenantId, key: key2 }, select: { id: true } })) throw new Error("CATALOG_KEY_EXISTS");
      const row = await tx.sport.create({ data: { tenantId, key: key2, name, active: true } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.sport_created", "Sport", row.id, "OPERATOR_ENTRY", { key: key2 });
      return row.id;
    });
  },
  createCatalogCompetition: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    const key2 = String(a.key ?? "").trim().toLowerCase(), name = String(a.name ?? "").trim(), timezone = String(a.timezone ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(key2)) throw new Error("INVALID_CATALOG_KEY");
    if (!name || name.length > 120) throw new Error("INVALID_CATALOG_NAME");
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch {
      throw new Error("INVALID_TIMEZONE");
    }
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const sport = await tx.sport.findFirst({ where: { id: a.sportId, tenantId, active: true }, select: { id: true } });
      if (!sport) throw new Error("SPORT_NOT_FOUND");
      if (await tx.competition.findFirst({ where: { tenantId, sportId: sport.id, key: key2 }, select: { id: true } })) throw new Error("CATALOG_KEY_EXISTS");
      const row = await tx.competition.create({ data: { tenantId, sportId: sport.id, key: key2, name, timezone, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.competition_created", "Competition", row.id, "OPERATOR_ENTRY", { key: key2, sportId: sport.id });
      return row.id;
    });
  },
  createCatalogCompetitor: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const row = await tx.competitor.create({ data: { tenantId, key: a.key, name: a.name, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.competitor_created", "Competitor", row.id, "OPERATOR_ENTRY", { key: a.key });
      return row.id;
    });
  },
  createCatalogStage: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    const key2 = String(a.key ?? "").trim().toLowerCase(), name = String(a.name ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(key2)) throw new Error("INVALID_CATALOG_KEY");
    if (!name || name.length > 120) throw new Error("INVALID_CATALOG_NAME");
    if (!Number.isSafeInteger(a.sortOrder) || a.sortOrder < 0 || a.sortOrder > 1e4) throw new Error("INVALID_SORT_ORDER");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const season = await tx.season.findFirst({ where: { id: a.seasonId, tenantId, status: { not: "CANCELLED" } }, select: { id: true } });
      if (!season) throw new Error("SEASON_NOT_FOUND");
      if (await tx.competitionStage.findFirst({ where: { tenantId, seasonId: season.id, key: key2 }, select: { id: true } })) throw new Error("CATALOG_KEY_EXISTS");
      const row = await tx.competitionStage.create({ data: { tenantId, seasonId: season.id, key: key2, name, sortOrder: a.sortOrder, status: "SCHEDULED" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.stage_created", "CompetitionStage", row.id, "OPERATOR_ENTRY", { seasonId: season.id, key: key2, sortOrder: a.sortOrder });
      return row.id;
    });
  },
  /** Activate/deactivate catalog reference data. Seasons cancel only when no event references them; stages toggle ACTIVE/COMPLETE. */
  setCatalogReferenceStatus: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    const type = String(a.type ?? "").trim().toUpperCase(), reason = String(a.reason ?? "").trim(), active = a.active === true;
    const models2 = { SPORT: { model: "sport", target: "Sport" }, COMPETITION: { model: "competition", target: "Competition" }, VENUE: { model: "venue", target: "Venue" }, COMPETITOR: { model: "competitor", target: "Competitor" }, SEASON: { model: "season", target: "Season" }, STAGE: { model: "competitionStage", target: "CompetitionStage" } };
    const spec = models2[type];
    if (!spec) throw new Error("INVALID_REFERENCE_TYPE");
    if (reason.length < 3 || reason.length > 500) throw new Error("REASON_REQUIRED");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const row = await tx[spec.model].findFirst({ where: { id: a.id, tenantId } });
      if (!row) throw new Error("Not found");
      let from, to, data;
      if (type === "SPORT") {
        from = row.active ? "ACTIVE" : "INACTIVE";
        to = active ? "ACTIVE" : "INACTIVE";
        data = { active };
      } else if (type === "SEASON") {
        from = String(row.status ?? "SCHEDULED");
        to = active ? "ACTIVE" : "CANCELLED";
        if (!active && from !== "CANCELLED" && await tx.event.count({ where: { tenantId, seasonId: row.id } })) throw new Error("SEASON_IN_USE");
        data = { status: to };
      } else if (type === "STAGE") {
        from = String(row.status ?? "SCHEDULED");
        to = active ? "ACTIVE" : "COMPLETE";
        data = { status: to };
      } else {
        from = String(row.status ?? "ACTIVE");
        to = active ? "ACTIVE" : "INACTIVE";
        data = { status: to };
      }
      if (from === to) return true;
      await tx[spec.model].update({ where: { id: row.id }, data });
      await appendAudit(tx, tenantId, context.session.itemId, active ? "catalog.reference_activated" : "catalog.reference_deactivated", spec.target, row.id, reason, { type, from, to });
      return true;
    });
  },
  attachEventParticipant: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const [event, competitor] = await Promise.all([tx.event.findFirst({ where: { id: a.eventId, tenantId } }), tx.competitor.findFirst({ where: { id: a.competitorId, tenantId } })]);
      if (!event || !competitor) throw new Error("Not found");
      const row = await tx.eventParticipant.create({ data: { tenantId, eventId: event.id, competitorId: competitor.id, role: a.role, sortOrder: a.sortOrder } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.participant_attached", "Event", event.id, "OPERATOR_ENTRY", { participantId: row.id, competitorId: competitor.id, role: a.role });
      return row.id;
    });
  },
  rescheduleEvent: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade"), startAt = await operatorInstant(context, tenantId, a.startAt, "START_AT");
    if (Number.isNaN(startAt.getTime())) throw new Error("INVALID_START");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const event = await tx.event.findFirst({ where: { id: a.eventId, tenantId } });
      if (!event) throw new Error("Not found");
      await tx.eventScheduleChange.create({ data: { tenantId, eventId: event.id, fromStartAt: event.startAt, toStartAt: startAt, reasonCode: a.reason, source: "OPERATOR", actorId: context.session.itemId, evidenceHash: evidenceHash({ eventId: event.id, from: event.startAt, to: startAt, reason: a.reason }) } });
      await tx.event.update({ where: { id: event.id }, data: { startAt, version: { increment: 1 } } });
      await tx.market.updateMany({ where: { tenantId, eventId: event.id, status: "OPEN" }, data: { status: "SUSPENDED", version: { increment: 1 } } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.event_rescheduled", "Event", event.id, a.reason, { from: event.startAt, to: startAt });
      return true;
    });
  },
  createEventMarket: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade"), parameters = object(a.parameters, "INVALID_PARAMETERS"), selections = object(a.selections, "INVALID_SELECTIONS");
    if (!Array.isArray(selections.items) || selections.items.length < 2) throw new Error("INVALID_SELECTIONS");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${a.eventId} AND tenant = ${tenantId} FOR UPDATE`;
      const [event, definition] = await Promise.all([tx.event.findFirst({ where: { id: a.eventId, tenantId } }), tx.marketDefinition.findFirst({ where: { tenantId, key: a.definitionKey, status: "ACTIVE" }, orderBy: { version: "desc" } })]);
      if (!event || !definition) throw new Error("Not found");
      assertEventAllowsNewMarket(event.status);
      const market = await tx.market.create({ data: { tenantId, eventId: event.id, definitionId: definition.id, definitionKey: definition.key, parameters, tradingMode: a.tradingMode, line: String(parameters.line ?? ""), cashOutEnabled: a.cashOutEnabled, status: "OPEN", version: 1 } });
      await tx.selection.createMany({ data: selections.items.map((item) => ({ tenantId, marketId: market.id, key: String(item.key), label: String(item.label), status: "OPEN" })) });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.market_created", "Market", market.id, "OPERATOR_ENTRY", { eventId: event.id, definitionId: definition.id, parameters, tradingMode: a.tradingMode, cashOutEnabled: a.cashOutEnabled, selections: selections.items });
      return market.id;
    });
  },
  mapProviderEntity: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const connection = await tx.providerConnection.findFirst({ where: { id: a.connectionId, tenantId } });
      if (!connection) throw new Error("Not found");
      const row = await tx.providerEntityMapping.create({ data: { tenantId, providerConnectionId: connection.id, entityType: a.entityType, externalId: a.externalId, canonicalType: a.canonicalType, canonicalId: a.canonicalId, confidence: a.confidence, status: "APPROVED" } });
      await appendAudit(tx, tenantId, context.session.itemId, "catalog.provider_mapped", "ProviderEntityMapping", row.id, "OPERATOR_REVIEW", { connectionId: connection.id, externalId: a.externalId, canonicalType: a.canonicalType, canonicalId: a.canonicalId, confidence: a.confidence });
      return row.id;
    });
  },
  requestTraderOverride: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    const expiresAt = await operatorInstant(context, tenantId, a.expiresAt, "EXPIRES_AT");
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= /* @__PURE__ */ new Date()) throw new Error("INVALID_EXPIRY");
    if (a.targetType !== "MARKET" || a.overrideType !== "STATUS") throw new Error("OVERRIDE_TYPE_UNSUPPORTED");
    const value = object(a.value, "INVALID_OVERRIDE_VALUE");
    if (!["SUSPENDED", "CLOSED"].includes(value.status)) throw new Error("INVALID_OVERRIDE");
    const target = await context.prisma.market.findFirst({ where: { id: a.targetId, tenantId }, select: { id: true } });
    if (!target) throw new Error("Not found");
    if (a.targetType === "MARKET" && a.overrideType === "STATUS" && value.status === "OPEN") throw new Error("TRADING_REOPENING_REQUIRES_REVIEWED_POLICY");
    const payloadHash = evidenceHash({ targetType: a.targetType, targetId: a.targetId, overrideType: a.overrideType, value, expiresAt });
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canTrade");
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `TRADER_OVERRIDE:${a.targetType}:${a.targetId}:${a.overrideType}`, payloadHash, ...approvalReview({ targetType: a.targetType, targetId: a.targetId, overrideType: a.overrideType, value, expiresAt }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      const override = await tx.traderOverride.create({ data: { tenantId, targetType: a.targetType, targetId: a.targetId, overrideType: a.overrideType, value, reasonCode: a.reason, startsAt: /* @__PURE__ */ new Date(), expiresAt, status: "PENDING", requesterId: context.session.itemId, approvalRequestId: approval.id } });
      await appendAudit(tx, tenantId, context.session.itemId, "trading.override_requested", "TraderOverride", override.id, a.reason, { approvalId: approval.id, payloadHash });
      return override.id;
    });
  },
  applyTraderOverride: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canTrade");
    return context.prisma.$transaction(async (tx) => {
      const now = /* @__PURE__ */ new Date(), row = await tx.traderOverride.findFirst({ where: { id: a.overrideId, tenantId, status: "PENDING" } });
      if (!row?.approvalRequestId) throw new Error("Not found");
      if (!(row.expiresAt instanceof Date) || row.expiresAt <= now) throw new Error("OVERRIDE_EXPIRED");
      if (row.targetType !== "MARKET" || row.overrideType !== "STATUS") throw new Error("OVERRIDE_TYPE_UNSUPPORTED");
      if (row.targetType === "MARKET" && row.overrideType === "STATUS" && row.value?.status === "OPEN") throw new Error("TRADING_REOPENING_REQUIRES_REVIEWED_POLICY");
      const payloadHash = evidenceHash({ targetType: row.targetType, targetId: row.targetId, overrideType: row.overrideType, value: row.value, expiresAt: row.expiresAt });
      await approved(tx, context, "canTrade", tenantId, a.approvalId, `TRADER_OVERRIDE:${row.targetType}:${row.targetId}:${row.overrideType}`, payloadHash);
      const claimed = await tx.traderOverride.updateMany({ where: { id: row.id, tenantId, status: "PENDING", expiresAt: { gt: now } }, data: { status: "ACTIVE", startsAt: now } });
      if (claimed.count !== 1) throw new Error("OVERRIDE_EXPIRED");
      {
        const value = row.value;
        if (!["SUSPENDED", "CLOSED"].includes(value?.status)) throw new Error("INVALID_OVERRIDE");
        const market = await tx.market.updateMany({ where: { id: row.targetId, tenantId }, data: { status: value.status, version: { increment: 1 } } });
        if (market.count !== 1) throw new Error("Not found");
      }
      await appendAudit(tx, tenantId, context.session.itemId, "trading.override_applied", "TraderOverride", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return true;
    });
  },
  requestCorrelationRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    if (!["ALLOW", "DENY", "PROVIDER_PRICE_REQUIRED"].includes(a.decision) || a.leftMarketId === a.rightMarketId) throw new Error("INVALID_CORRELATION_RULE");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageRisk");
      const markets = await tx.market.count({ where: { tenantId, id: { in: [a.leftMarketId, a.rightMarketId] } } });
      if (markets !== 2) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "CORRELATION_RULE", groupKey: a.groupKey, sportKey: a.sportKey, leftMarketId: a.leftMarketId, rightMarketId: a.rightMarketId, decision: a.decision });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `CORRELATION_RULE:${a.groupKey}:${a.leftMarketId}:${a.rightMarketId}:${a.decision}`, payloadHash, ...approvalReview({ action: "CORRELATION_RULE", groupKey: a.groupKey, sportKey: a.sportKey, leftMarketId: a.leftMarketId, rightMarketId: a.rightMarketId, decision: a.decision }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      await appendAudit(tx, tenantId, context.session.itemId, "correlation.rule_requested", "ApprovalRequest", approval.id, a.reason, { payloadHash });
      return approval.id;
    });
  },
  applyCorrelationRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return context.prisma.$transaction(async (tx) => {
      const payloadHash = evidenceHash({ action: "CORRELATION_RULE", groupKey: a.groupKey, sportKey: a.sportKey, leftMarketId: a.leftMarketId, rightMarketId: a.rightMarketId, decision: a.decision });
      await approved(tx, context, "canManageRisk", tenantId, a.approvalId, `CORRELATION_RULE:${a.groupKey}:${a.leftMarketId}:${a.rightMarketId}:${a.decision}`, payloadHash);
      let group = await tx.correlationGroup.findFirst({ where: { tenantId, key: a.groupKey, status: "ACTIVE" }, orderBy: { version: "desc" } });
      if (!group) group = await tx.correlationGroup.create({ data: { tenantId, key: a.groupKey, name: a.groupKey.replaceAll("-", " "), sportKey: a.sportKey, status: "ACTIVE", version: 1 } });
      const existing = await tx.correlationRule.findFirst({ where: { tenantId, groupId: group.id, leftPattern: { equals: { marketId: a.leftMarketId } }, rightPattern: { equals: { marketId: a.rightMarketId } } } });
      if (existing) throw new Error("CORRELATION_RULE_EXISTS");
      const rule = await tx.correlationRule.create({ data: { tenantId, groupId: group.id, leftPattern: { marketId: a.leftMarketId }, rightPattern: { marketId: a.rightMarketId }, decision: a.decision, reasonCode: "DUAL_APPROVED", priority: 100 } });
      await appendAudit(tx, tenantId, context.session.itemId, "correlation.rule_applied", "CorrelationRule", rule.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return rule.id;
    });
  },
  runTradingReplay: async (_r, _a, context) => {
    await requireTenant(context, "canManageIntegrations");
    throw new Error("DETERMINISTIC_REPLAY_COMPARISON_NOT_IMPLEMENTED");
  },
  requestLegalEntity: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    if (!/^[A-Z]{2}$|^UNCONFIGURED$/.test(a.countryCode) || !a.registrationReference) throw new Error("INVALID_LEGAL_ENTITY");
    const payloadHash = evidenceHash({ action: "LEGAL_ENTITY", name: a.name, countryCode: a.countryCode, registrationReference: a.registrationReference });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `LEGAL_ENTITY:${a.countryCode}:${a.registrationReference}`, payloadHash, ...approvalReview({ action: "LEGAL_ENTITY", name: a.name, countryCode: a.countryCode, registrationReference: a.registrationReference }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyLegalEntity: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), payloadHash = evidenceHash({ action: "LEGAL_ENTITY", name: a.name, countryCode: a.countryCode, registrationReference: a.registrationReference });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `LEGAL_ENTITY:${a.countryCode}:${a.registrationReference}`, payloadHash);
      const row = await tx.legalEntity.create({ data: { tenantId, name: a.name, countryCode: a.countryCode, registrationReference: a.registrationReference, status: "PENDING" } });
      await appendAudit(tx, tenantId, context.session.itemId, "legal_entity.configured", "LegalEntity", row.id, "DUAL_APPROVED_EXTERNAL_VALIDATION_PENDING", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  createJurisdictionPolicyDraft: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), document = object(a.policyDocument, "INVALID_POLICY_DOCUMENT"), effectiveFrom = await operatorInstant(context, tenantId, a.effectiveFrom, "EFFECTIVE_FROM");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      const jurisdiction = await tx.jurisdiction.findUnique({ where: { id: a.jurisdictionId } });
      if (!jurisdiction) throw new Error("Not found");
      const version = await tx.jurisdictionPolicyVersion.count({ where: { tenantId, jurisdictionId: jurisdiction.id } }) + 1, evidence = evidenceHash({ jurisdictionId: jurisdiction.id, authorityCitation: a.authorityCitation, document, effectiveFrom, version }), row = await tx.jurisdictionPolicyVersion.create({ data: { tenantId, jurisdictionId: jurisdiction.id, version, authorityCitation: a.authorityCitation, policyDocument: document, effectiveFrom, status: "DRAFT", evidenceHash: evidence } });
      await appendAudit(tx, tenantId, context.session.itemId, "jurisdiction_policy.drafted", "JurisdictionPolicyVersion", row.id, "OPERATOR_DRAFT", { evidenceHash: evidence });
      return row.id;
    });
  },
  requestJurisdictionActivation: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    if (!/^[a-f0-9]{64}$/i.test(a.externalEvidenceHash)) throw new Error("EXTERNAL_EVIDENCE_HASH_REQUIRED");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      const [policy, scope] = await Promise.all([tx.jurisdictionPolicyVersion.findFirst({ where: { id: a.policyId, tenantId, status: "DRAFT" } }), tx.operatorJurisdiction.findFirst({ where: { id: a.operatorJurisdictionId, tenantId, status: "PENDING" } })]);
      if (!policy || !scope || policy.jurisdictionId !== scope.jurisdictionId) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "JURISDICTION_ACTIVATION", policyId: policy.id, operatorJurisdictionId: scope.id, policyEvidenceHash: policy.evidenceHash, externalEvidenceHash: a.externalEvidenceHash });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `JURISDICTION_ACTIVATION:${policy.id}:${scope.id}`, payloadHash, ...approvalReview({ action: "JURISDICTION_ACTIVATION", policyId: policy.id, operatorJurisdictionId: scope.id, policyVersion: policy.version, authorityCitation: policy.authorityCitation, policyEvidenceHash: policy.evidenceHash, externalEvidenceHash: a.externalEvidenceHash }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      return approval.id;
    });
  },
  applyJurisdictionActivation: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    return context.prisma.$transaction(async (tx) => {
      const [policy, scope] = await Promise.all([tx.jurisdictionPolicyVersion.findFirst({ where: { id: a.policyId, tenantId, status: "DRAFT" } }), tx.operatorJurisdiction.findFirst({ where: { id: a.operatorJurisdictionId, tenantId, status: "PENDING" } })]);
      if (!policy || !scope) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "JURISDICTION_ACTIVATION", policyId: policy.id, operatorJurisdictionId: scope.id, policyEvidenceHash: policy.evidenceHash, externalEvidenceHash: a.externalEvidenceHash });
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `JURISDICTION_ACTIVATION:${policy.id}:${scope.id}`, payloadHash);
      await tx.jurisdictionPolicyVersion.updateMany({ where: { tenantId, jurisdictionId: policy.jurisdictionId, status: "ACTIVE" }, data: { status: "RETIRED", effectiveTo: /* @__PURE__ */ new Date() } });
      await tx.jurisdictionPolicyVersion.update({ where: { id: policy.id }, data: { status: "ACTIVE", approvedBy: context.session.itemId, approvedAt: /* @__PURE__ */ new Date() } });
      await tx.operatorJurisdiction.update({ where: { id: scope.id }, data: { status: "ACTIVE", policyVersion: `${policy.id}:${a.externalEvidenceHash}` } });
      await appendAudit(tx, tenantId, context.session.itemId, "jurisdiction.activated", "OperatorJurisdiction", scope.id, "DUAL_APPROVED_EXTERNAL_EVIDENCE", { approvalId: a.approvalId, payloadHash, externalEvidenceHash: a.externalEvidenceHash });
      return true;
    });
  },
  requestOperatorBrand: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), domain = String(a.domain).trim().toLowerCase();
    if (!/^[a-z0-9.-]+(?::\d+)?$/.test(domain)) throw new Error("INVALID_BRAND_DOMAIN");
    const payloadHash = evidenceHash({ action: "OPERATOR_BRAND", name: a.name, domain, defaultLocale: a.defaultLocale, defaultTimezone: a.defaultTimezone });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `OPERATOR_BRAND:${domain}`, payloadHash, ...approvalReview({ action: "OPERATOR_BRAND", name: a.name, domain, defaultLocale: a.defaultLocale, defaultTimezone: a.defaultTimezone }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyOperatorBrand: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), domain = String(a.domain).trim().toLowerCase(), payloadHash = evidenceHash({ action: "OPERATOR_BRAND", name: a.name, domain, defaultLocale: a.defaultLocale, defaultTimezone: a.defaultTimezone });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `OPERATOR_BRAND:${domain}`, payloadHash);
      const row = await tx.brand.create({ data: { tenantId, name: a.name, domain, defaultLocale: a.defaultLocale, defaultTimezone: a.defaultTimezone, supportedLocales: [a.defaultLocale], designTokens: { mode: "operator-configured" }, termsReference: "PENDING_LOCALIZED_TERMS", status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "brand.created", "Brand", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  requestTenantCurrency: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    if (!/^[A-Z]{3}$/.test(a.code) || a.exponent < 0 || a.exponent > 6) throw new Error("INVALID_CURRENCY");
    const payloadHash = evidenceHash({ action: "TENANT_CURRENCY", code: a.code, exponent: a.exponent, name: a.name, depositsEnabled: a.depositsEnabled, withdrawalsEnabled: a.withdrawalsEnabled, wageringEnabled: a.wageringEnabled, defaultForBrand: a.defaultForBrand });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `TENANT_CURRENCY:${a.code}`, payloadHash, ...approvalReview({ action: "TENANT_CURRENCY", code: a.code, exponent: a.exponent, name: a.name, depositsEnabled: a.depositsEnabled, withdrawalsEnabled: a.withdrawalsEnabled, wageringEnabled: a.wageringEnabled, defaultForBrand: a.defaultForBrand }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyTenantCurrency: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), payloadHash = evidenceHash({ action: "TENANT_CURRENCY", code: a.code, exponent: a.exponent, name: a.name, depositsEnabled: a.depositsEnabled, withdrawalsEnabled: a.withdrawalsEnabled, wageringEnabled: a.wageringEnabled, defaultForBrand: a.defaultForBrand });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `TENANT_CURRENCY:${a.code}`, payloadHash);
      const currency = await tx.currencyDefinition.findUnique({ where: { code: a.code } }) ?? await tx.currencyDefinition.create({ data: { code: a.code, exponent: a.exponent, name: a.name, status: "ACTIVE" } });
      if (Number(currency.exponent) !== Number(a.exponent)) throw new Error("CURRENCY_EXPONENT_CONFLICT");
      if (currency.status !== "ACTIVE") throw new Error("CURRENCY_NOT_ACTIVE");
      if (a.defaultForBrand) await tx.tenantCurrency.updateMany({ where: { tenantId, defaultForBrand: true }, data: { defaultForBrand: false } });
      const existing = await tx.tenantCurrency.findFirst({ where: { tenantId, currencyId: currency.id } }), row = existing ? await tx.tenantCurrency.update({ where: { id: existing.id }, data: { depositsEnabled: a.depositsEnabled, withdrawalsEnabled: a.withdrawalsEnabled, wageringEnabled: a.wageringEnabled, defaultForBrand: a.defaultForBrand, status: "ACTIVE" } }) : await tx.tenantCurrency.create({ data: { tenantId, currencyId: currency.id, depositsEnabled: a.depositsEnabled, withdrawalsEnabled: a.withdrawalsEnabled, wageringEnabled: a.wageringEnabled, defaultForBrand: a.defaultForBrand, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "tenant.currency_enabled", "TenantCurrency", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  requestBrandLocale: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), brand = await context.prisma.brand.findFirst({ where: { id: a.brandId, tenantId } });
    if (!brand || !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(a.locale) || a.termsContentHash.length < 32) throw new Error("INVALID_BRAND_LOCALE");
    const payloadHash = evidenceHash({ action: "BRAND_LOCALE", brandId: a.brandId, locale: a.locale, language: a.language, timezone: a.timezone, termsVersion: a.termsVersion, termsContentHash: a.termsContentHash });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `BRAND_LOCALE:${a.brandId}:${a.locale}:${a.termsVersion}`, payloadHash, ...approvalReview({ action: "BRAND_LOCALE", brandId: a.brandId, locale: a.locale, language: a.language, timezone: a.timezone, termsVersion: a.termsVersion, termsContentHash: a.termsContentHash }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyBrandLocale: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), payloadHash = evidenceHash({ action: "BRAND_LOCALE", brandId: a.brandId, locale: a.locale, language: a.language, timezone: a.timezone, termsVersion: a.termsVersion, termsContentHash: a.termsContentHash });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `BRAND_LOCALE:${a.brandId}:${a.locale}:${a.termsVersion}`, payloadHash);
      const brand = await tx.brand.findFirst({ where: { id: a.brandId, tenantId } });
      if (!brand) throw new Error("Not found");
      const row = await tx.brandLocale.create({ data: { tenantId, brandId: brand.id, locale: a.locale, language: a.language, timezone: a.timezone, termsVersion: a.termsVersion, termsContentHash: a.termsContentHash, default: false, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "brand.locale_activated", "BrandLocale", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  requestHouseRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), rules2 = object(a.rules, "INVALID_RULES"), effectiveFrom = await operatorInstant(context, tenantId, a.effectiveFrom, "EFFECTIVE_FROM"), payloadHash = evidenceHash({ action: "HOUSE_RULE", name: a.name, sportKey: a.sportKey, marketDefinitionKey: a.marketDefinitionKey, rules: rules2, effectiveFrom });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `HOUSE_RULE:${a.name}`, payloadHash, ...approvalReview({ action: "HOUSE_RULE", name: a.name, sportKey: a.sportKey, marketDefinitionKey: a.marketDefinitionKey, rules: rules2, effectiveFrom }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyHouseRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), rules2 = object(a.rules, "INVALID_RULES"), effectiveFrom = await operatorInstant(context, tenantId, a.effectiveFrom, "EFFECTIVE_FROM"), payloadHash = evidenceHash({ action: "HOUSE_RULE", name: a.name, sportKey: a.sportKey, marketDefinitionKey: a.marketDefinitionKey, rules: rules2, effectiveFrom });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `HOUSE_RULE:${a.name}`, payloadHash);
      const version = await tx.houseRuleVersion.count({ where: { tenantId, name: a.name } }) + 1;
      await tx.houseRuleVersion.updateMany({ where: { tenantId, name: a.name, status: "ACTIVE" }, data: { status: "RETIRED", effectiveTo: effectiveFrom } });
      const row = await tx.houseRuleVersion.create({ data: { tenantId, name: a.name, version, sportKey: a.sportKey, marketDefinitionKey: a.marketDefinitionKey, rules: rules2, semanticHash: payloadHash, effectiveFrom, status: "ACTIVE", approvalRequestId: a.approvalId } });
      await appendAudit(tx, tenantId, context.session.itemId, "house_rule.activated", "HouseRuleVersion", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  requestFeatureFlag: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), expiresAt = await operatorInstant(context, tenantId, a.expiresAt, "EXPIRES_AT"), payloadHash = evidenceHash({ action: "FEATURE_FLAG", key: a.key, description: a.description, enabled: a.enabled, scopeType: a.scopeType, scopeId: a.scopeId, expiresAt });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      return tx.approvalRequest.create({ data: { tenantId, action: `FEATURE_FLAG:${a.key}:${a.scopeType}:${a.scopeId}`, payloadHash, ...approvalReview({ action: "FEATURE_FLAG", key: a.key, description: a.description, enabled: a.enabled, scopeType: a.scopeType, scopeId: a.scopeId, expiresAt }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyFeatureFlag: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), expiresAt = await operatorInstant(context, tenantId, a.expiresAt, "EXPIRES_AT"), payloadHash = evidenceHash({ action: "FEATURE_FLAG", key: a.key, description: a.description, enabled: a.enabled, scopeType: a.scopeType, scopeId: a.scopeId, expiresAt });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `FEATURE_FLAG:${a.key}:${a.scopeType}:${a.scopeId}`, payloadHash);
      const existing = await tx.featureFlag.findFirst({ where: { tenantId, key: a.key, scopeType: a.scopeType, scopeId: a.scopeId } }), row = existing ? await tx.featureFlag.update({ where: { id: existing.id }, data: { description: a.description, enabled: a.enabled, expiresAt, approvalRequestId: a.approvalId, ownerId: context.session.itemId } }) : await tx.featureFlag.create({ data: { tenantId, key: a.key, description: a.description, enabled: a.enabled, scopeType: a.scopeType, scopeId: a.scopeId, safeDefault: false, ownerId: context.session.itemId, expiresAt, approvalRequestId: a.approvalId } });
      await appendAudit(tx, tenantId, context.session.itemId, "feature_flag.changed", "FeatureFlag", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  createPromotionCampaign: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook"), startsAt = await operatorInstant(context, tenantId, a.startsAt, "STARTS_AT"), endsAt = await operatorInstant(context, tenantId, a.endsAt, "ENDS_AT");
    money2(a.budgetMinor);
    if (startsAt >= endsAt) throw new Error("INVALID_PROMOTION_WINDOW");
    const economics = object(a.economics, "INVALID_ECONOMICS"), requirements = object(a.requirements, "INVALID_REQUIREMENTS"), termsHash = evidenceHash({ key: a.key, type: a.type, economics, requirements, startsAt, endsAt });
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      const promotion = await tx.promotion.create({ data: { tenantId, key: a.key, name: a.name, description: a.description, type: a.type, status: "DRAFT", startsAt, endsAt, budgetMinor: a.budgetMinor, currency: a.currency, termsVersion: "operator-draft-v1", termsHash } });
      const rule = await tx.promotionRuleVersion.create({ data: { tenantId, promotionId: promotion.id, version: 1, eligibility: { kyc: "APPROVED" }, economics, wageringRequirements: requirements, abuseControls: { duplicateAccount: "DENY" }, contributionRules: { sportsbook: 100 }, status: "DRAFT", effectiveFrom: startsAt, evidenceHash: termsHash } });
      await tx.campaignBudget.create({ data: { tenantId, promotionId: promotion.id, allocatedMinor: a.budgetMinor, awardedMinor: "0", redeemedMinor: "0", forfeitedMinor: "0", currency: a.currency, version: 1, status: "ACTIVE" } });
      await appendAudit(tx, tenantId, context.session.itemId, "promotion.created", "Promotion", promotion.id, "DRAFT", { ruleId: rule.id, termsHash });
      return promotion.id;
    });
  },
  requestPromotionActivation: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageSportsbook");
      const p = await tx.promotion.findFirst({ where: { id: a.promotionId, tenantId, status: "DRAFT" } });
      if (!p) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "ACTIVATE_PROMOTION", promotionId: p.id, termsHash: p.termsHash });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `ACTIVATE_PROMOTION:${p.id}`, payloadHash, ...approvalReview({ action: "ACTIVATE_PROMOTION", promotionId: p.id, termsHash: p.termsHash, key: p.key, name: p.name, type: p.type, budgetMinor: p.budgetMinor, currency: p.currency, startsAt: p.startsAt, endsAt: p.endsAt }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      await tx.promotion.update({ where: { id: p.id }, data: { approvalRequestId: approval.id } });
      return approval.id;
    });
  },
  applyPromotionActivation: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageSportsbook");
    return context.prisma.$transaction(async (tx) => {
      const p = await tx.promotion.findFirst({ where: { id: a.promotionId, tenantId, status: "DRAFT" } });
      if (!p) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "ACTIVATE_PROMOTION", promotionId: p.id, termsHash: p.termsHash });
      await approved(tx, context, "canManageSportsbook", tenantId, a.approvalId, `ACTIVATE_PROMOTION:${p.id}`, payloadHash);
      await tx.promotion.update({ where: { id: p.id }, data: { status: p.startsAt > /* @__PURE__ */ new Date() ? "SCHEDULED" : "ACTIVE" } });
      await tx.promotionRuleVersion.updateMany({ where: { tenantId, promotionId: p.id, status: "DRAFT" }, data: { status: "ACTIVE" } });
      await emit(tx, tenantId, "PROMOTION", p.id, "promotion.activated.v1", { termsHash: p.termsHash });
      await appendAudit(tx, tenantId, context.session.itemId, "promotion.activated", "Promotion", p.id, "DUAL_APPROVED", { approvalId: a.approvalId, termsHash: p.termsHash });
      return true;
    });
  },
  requestWebhookEndpoint: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations"), url = (await validateWebhookDestination(a.url)).toString(), eventTypes = JSON.parse(a.eventTypes);
    if (!Array.isArray(eventTypes) || !eventTypes.length || eventTypes.some((item) => typeof item !== "string")) throw new Error("INVALID_WEBHOOK_EVENTS");
    const payloadHash = evidenceHash({ action: "WEBHOOK_ENDPOINT", name: a.name, url, eventTypes, secretReference: a.secretReference });
    return (await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
      return tx.approvalRequest.create({ data: { tenantId, action: `WEBHOOK_ENDPOINT:${Buffer.from(url).toString("base64url")}`, payloadHash, ...approvalReview({ action: "WEBHOOK_ENDPOINT", name: a.name, url, eventTypes, secretReference: a.secretReference }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
    })).id;
  },
  applyWebhookEndpoint: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations"), url = (await validateWebhookDestination(a.url)).toString(), eventTypes = JSON.parse(a.eventTypes), payloadHash = evidenceHash({ action: "WEBHOOK_ENDPOINT", name: a.name, url, eventTypes, secretReference: a.secretReference });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageIntegrations", tenantId, a.approvalId, `WEBHOOK_ENDPOINT:${Buffer.from(url).toString("base64url")}`, payloadHash);
      const row = await tx.webhookEndpoint.create({ data: { tenantId, name: a.name, url, secretReference: a.secretReference, eventTypes, status: "ACTIVE", failureCount: 0, approvalRequestId: a.approvalId } });
      await appendAudit(tx, tenantId, context.session.itemId, "webhook.endpoint_activated", "WebhookEndpoint", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash, url, eventTypes });
      return row.id;
    });
  },
  testWebhookEndpoint: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
      const endpoint = await tx.webhookEndpoint.findFirst({ where: { id: a.endpointId, tenantId, status: "ACTIVE" } });
      if (!endpoint) throw new Error("Not found");
      const deliveryId = `delivery_${(0, import_node_crypto9.randomBytes)(18).toString("base64url")}`, payload = { id: `evt_${(0, import_node_crypto9.randomBytes)(12).toString("base64url")}`, type: "endpoint.test.v1", occurredAt: (/* @__PURE__ */ new Date()).toISOString(), tenantId, data: { test: true } }, payloadHash = evidenceHash(payload), delivery = await tx.webhookDelivery.create({ data: { tenantId, endpointId: endpoint.id, deliveryId, eventType: "endpoint.test", eventVersion: "v1", payloadHash, signatureKeyId: PLATFORM_WEBHOOK_SIGNING_KEY_ID, status: "PENDING", attempts: 0, availableAt: /* @__PURE__ */ new Date() } }), outbox = await tx.outboxMessage.create({ data: { tenantId, aggregateType: "WEBHOOK_DELIVERY", aggregateId: delivery.id, eventType: "provider.delivery", payload: { endpointId: endpoint.id, deliveryId, eventType: "endpoint.test", eventVersion: "v1", payload }, status: "PENDING", attempts: 0, maxAttempts: 5, availableAt: /* @__PURE__ */ new Date() } });
      await tx.webhookDelivery.update({ where: { id: delivery.id }, data: { outboxMessageId: outbox.id } });
      return delivery.id;
    });
  },
  runAdapterCertification: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations");
    const connection = await context.prisma.providerConnection.findFirst({ where: { id: a.connectionId, tenantId } });
    if (!connection) throw new Error("Not found");
    const adapter = installedSandboxAdapter(connection);
    if (!adapter) throw new Error("CERTIFICATION_ADAPTER_UNAVAILABLE:NO_INSTALLED_SANDBOX_IMPLEMENTATION");
    const configCheck = await adapter.validateConfig(connection.configReference);
    if (!configCheck.valid) throw new Error("CERTIFICATION_CONFIG_INVALID");
    const startedAt = /* @__PURE__ */ new Date(), inputHash = evidenceHash({ connectionId: connection.id, adapterId: connection.adapterId, adapterVersion: connection.adapterVersion, manifest: adapter.manifest(), configReference: connection.configReference, connectionRevision: new Date(connection.updatedAt).toISOString(), suite: "sandbox-conformance-v1" }), scenarios = [];
    const run = await context.prisma.adapterCertificationRun.create({ data: { tenantId, providerConnectionId: connection.id, adapterId: connection.adapterId, adapterVersion: connection.adapterVersion, suiteVersion: "sandbox-conformance-v1", scenarios: [], passed: 0, failed: 0, status: "RUNNING", inputHash, startedAt } });
    for (const name of ["happy", "duplicate", "pending", "failure"]) {
      try {
        const command = { type: name === "pending" ? "simulate_pending" : name === "failure" ? "simulate_failure" : "execute", payload: { scenario: name } }, key2 = `cert:${run.id}:${name}`, first = await adapter.execute({}, command, key2), second = await adapter.execute({}, command, key2);
        const expected = name === "pending" ? "PENDING" : name === "failure" ? "FAILED" : "SUCCEEDED";
        scenarios.push({ name, passed: first.status === expected && first.externalRef === second.externalRef, status: first.status });
      } catch (error) {
        scenarios.push({ name, passed: false, error: error instanceof Error ? error.message : "UNKNOWN" });
      }
    }
    const health = await adapter.health();
    scenarios.push({ name: "health", passed: health.ok, health, simulated: true });
    const passed = scenarios.filter((item) => item.passed).length, failed = scenarios.length - passed;
    await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
      await tx.adapterCertificationRun.update({ where: { id: run.id }, data: { scenarios, passed, failed, status: failed ? "FAILED" : "PASSED", completedAt: /* @__PURE__ */ new Date(), artifactReference: `sandbox:${inputHash}` } });
      await appendAudit(tx, tenantId, context.session.itemId, "adapter.certification_completed", "AdapterCertificationRun", run.id, failed ? "FAILED" : "PASSED", { inputHash, passed, failed, scenarios });
    });
    return run.id;
  },
  setProviderOperationalState: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations");
    if (!allowedProviderStates.has(a.status)) throw new Error("INVALID_PROVIDER_STATUS");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
      const connection = await tx.providerConnection.findFirst({ where: { id: a.connectionId, tenantId } });
      if (!connection) throw new Error("Not found");
      await tx.providerConnection.update({ where: { id: connection.id }, data: { status: a.status } });
      const kind = String(connection.capabilities?.kind ?? "");
      let suspended = 0, failoverId = null;
      if (a.status !== "ACTIVE" && ["sports", "results"].includes(kind)) {
        const failover = await tx.providerConnection.findFirst({ where: { tenantId, id: { not: connection.id }, status: "ACTIVE", certificationStatus: { in: ["SANDBOX", "CERTIFIED"] }, capabilities: { equals: { kind, mode: "sandbox" } } }, orderBy: { failoverPriority: "asc" } });
        failoverId = failover?.id ?? null;
        if (!failover) {
          const update = await tx.market.updateMany({ where: { tenantId, status: "OPEN" }, data: { status: "SUSPENDED", version: { increment: 1 } } });
          suspended = update.count;
        }
      }
      await emit(tx, tenantId, "PROVIDER", connection.id, a.status === "ACTIVE" ? "provider.recovered.v1" : "provider.degraded.v1", { kind, reason: a.reason, failoverId, suspended });
      await appendAudit(tx, tenantId, context.session.itemId, "provider.status_changed", "ProviderConnection", connection.id, a.reason, { from: connection.status, to: a.status, kind, failoverId, suspended, source: "OPERATOR_ATTESTATION" });
      return true;
    });
  },
  settleCombinationWager: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return serializable2(context.prisma, async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageRisk");
      await requireTenant({ ...context, prisma: tx }, "canManageRisk");
      const wager = await tx.wager.findFirst({ where: { id: a.wagerId, tenantId } });
      if (wager?.structure === "STRAIGHT") return settleFullStraight(tx, tenantId, context.session.itemId, a, context.session);
      return combinationSettlement(tx, tenantId, context.session.itemId, a.wagerId, a.idempotencyKey);
    });
  },
  requestCombinationResettlement: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageRisk");
      const settlement = await tx.settlement.findFirst({ where: { id: a.settlementId, tenantId } });
      if (!settlement?.wagerId) throw new Error("Not found");
      const reviewedLines = await tx.settlementLine.findMany({ where: { tenantId, settlementId: settlement.id } });
      if (reviewedLines.some((line) => line.trace?.contract === "openfront.full-straight.initial.v1")) throw new Error("REVIEWED_STRAIGHT_CORRECTION_PLAN_REQUIRED");
      await lockWagerForSettlement(tx, tenantId, settlement.wagerId);
      await assertCurrentSettlement(tx, tenantId, settlement.wagerId, settlement.id);
      const payloadHash = evidenceHash({ action: "FULL_RESETTLEMENT", settlementId: settlement.id, wagerId: settlement.wagerId });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `FULL_RESETTLEMENT:${settlement.id}`, payloadHash, ...approvalReview({ action: "FULL_RESETTLEMENT", settlementId: settlement.id, wagerId: settlement.wagerId, version: settlement.version, outcome: settlement.outcome, payoutMinor: settlement.payoutMinor }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      return approval.id;
    });
  },
  resettleCombinationWager: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return serializable2(context.prisma, async (tx) => {
      const old = await tx.settlement.findFirst({ where: { id: a.settlementId, tenantId }, include: { journalTransaction: { include: { from_JournalEntry_transaction: true } }, from_SettlementLine_settlement: true } });
      if (!old) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "FULL_RESETTLEMENT", settlementId: old.id, wagerId: old.wagerId });
      await approved(tx, context, "canManageRisk", tenantId, a.approvalId, `FULL_RESETTLEMENT:${old.id}`, payloadHash, a.idempotencyKey);
      return combinationSettlement(tx, tenantId, context.session.itemId, old.wagerId, a.idempotencyKey, old);
    });
  },
  requestCashOutCorrection: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageRisk");
      const candidate = await tx.cashOutAcceptance.findFirst({ where: { id: a.acceptanceId, tenantId, status: "ACCEPTED" }, select: { wagerId: true } });
      if (!candidate?.wagerId) throw new Error("Not found");
      await lockWagerForSettlement(tx, tenantId, candidate.wagerId);
      const acceptance = await tx.cashOutAcceptance.findFirst({ where: { id: a.acceptanceId, tenantId, status: "ACCEPTED" } });
      if (!acceptance) throw new Error("Not found");
      if (await tx.settlement.findFirst({ where: { tenantId, wagerId: acceptance.wagerId } })) throw new Error("CASHOUT_CORRECTION_REQUIRES_SETTLEMENT_CORRECTION");
      const [rows, wager] = await Promise.all([tx.cashOutAcceptance.findMany({ where: { tenantId, wagerId: acceptance.wagerId } }), tx.wager.findFirst({ where: { id: acceptance.wagerId, tenantId }, select: { stakeMinor: true } })]);
      if (!wager) throw new Error("Not found");
      const state = projectCashOutState(wager.stakeMinor, rows);
      if (!state.accepted.some((item) => item.id === acceptance.id)) throw new Error("CASHOUT_ALREADY_CORRECTED");
      const payloadHash = evidenceHash({ action: "CASHOUT_CORRECTION", acceptanceId: acceptance.id, evidenceHash: acceptance.evidenceHash });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `CASHOUT_CORRECTION:${acceptance.id}`, payloadHash, ...approvalReview({ action: "CASHOUT_CORRECTION", acceptanceId: acceptance.id, evidenceHash: acceptance.evidenceHash, wagerId: acceptance.wagerId, amountMinor: acceptance.amountMinor, currency: acceptance.currency }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      return approval.id;
    });
  },
  correctCashOut: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageRisk");
    return serializable2(context.prisma, async (tx) => {
      const candidate = await tx.cashOutAcceptance.findFirst({ where: { id: a.acceptanceId, tenantId, status: "ACCEPTED" }, select: { wagerId: true } });
      if (!candidate?.wagerId) throw new Error("Not found");
      await lockWagerForSettlement(tx, tenantId, candidate.wagerId);
      const acceptance = await tx.cashOutAcceptance.findFirst({ where: { id: a.acceptanceId, tenantId, status: "ACCEPTED" }, include: { journalTransaction: { include: { from_JournalEntry_transaction: true } }, wager: true } });
      if (!acceptance?.journalTransaction || !acceptance.wager) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "CASHOUT_CORRECTION", acceptanceId: acceptance.id, evidenceHash: acceptance.evidenceHash });
      await approved(tx, context, "canManageRisk", tenantId, a.approvalId, `CASHOUT_CORRECTION:${acceptance.id}`, payloadHash, a.idempotencyKey);
      const prior = await tx.cashOutAcceptance.findFirst({ where: { tenantId, idempotencyKey: a.idempotencyKey } });
      if (prior) {
        const expectedEvidence = evidenceHash({ reversalOf: acceptance.id, approvalId: a.approvalId, journalId: prior.journalTransactionId });
        if (prior.status === "REVERSED" && prior.reversalOfId === acceptance.id && prior.evidenceHash === expectedEvidence) return prior.id;
        throw new Error("CASHOUT_CORRECTION_IDEMPOTENCY_CONFLICT");
      }
      if (await tx.settlement.findFirst({ where: { tenantId, wagerId: acceptance.wagerId } })) throw new Error("CASHOUT_CORRECTION_REQUIRES_SETTLEMENT_CORRECTION");
      const currentRows = await tx.cashOutAcceptance.findMany({ where: { tenantId, wagerId: acceptance.wagerId } }), currentState = projectCashOutState(acceptance.wager.stakeMinor, currentRows);
      if (!currentState.accepted.some((item) => item.id === acceptance.id)) throw new Error("CASHOUT_ALREADY_CORRECTED");
      const original = { idempotencyKey: acceptance.journalTransaction.idempotencyKey, type: acceptance.journalTransaction.type, entries: acceptance.journalTransaction.from_JournalEntry_transaction.map((entry) => ({ accountId: entry.accountId, currency: entry.currency, side: entry.side, amount: BigInt(entry.amountMinor) })) };
      const reversal = await postJournal(tx, tenantId, reverseJournal(original, `cashout-correction:${a.idempotencyKey}`), acceptance.wagerId);
      const cash = await tx.ledgerAccount.findFirst({ where: { tenantId, playerId: acceptance.playerId, key: "PLAYER_CASH", currency: acceptance.currency } }), balance = cash ? await tx.balanceProjection.findFirst({ where: { tenantId, accountId: cash.id }, orderBy: { version: "desc" } }) : null;
      if (!cash || !balance || BigInt(balance.postedMinor) < BigInt(acceptance.amountMinor)) throw new Error("CASHOUT_CORRECTION_REQUIRES_RECEIVABLE_REVIEW");
      const next = BigInt(balance.postedMinor) - BigInt(acceptance.amountMinor);
      await tx.balanceProjection.create({ data: { tenantId, accountId: cash.id, postedMinor: String(next), pendingMinor: balance.pendingMinor, availableMinor: String(BigInt(balance.availableMinor) + (next - BigInt(balance.postedMinor))), version: Number(balance.version) + 1, asOf: /* @__PURE__ */ new Date() } });
      const corrected = await tx.cashOutAcceptance.create({ data: { tenantId, offerId: acceptance.offerId, wagerId: acceptance.wagerId, playerId: acceptance.playerId, amountMinor: acceptance.amountMinor, currency: acceptance.currency, portionNumerator: acceptance.portionNumerator, portionDenominator: acceptance.portionDenominator, wagerVersion: Number(acceptance.wager.version ?? 1) + 1, acceptedAt: /* @__PURE__ */ new Date(), journalTransactionId: reversal.id, status: "REVERSED", reversalOfId: acceptance.id, idempotencyKey: a.idempotencyKey, evidenceHash: evidenceHash({ reversalOf: acceptance.id, approvalId: a.approvalId, journalId: reversal.id }) } });
      const effectiveRows = await tx.cashOutAcceptance.findMany({ where: { tenantId, wagerId: acceptance.wagerId } }), effectivePortion = projectCashOutState(acceptance.wager.stakeMinor, effectiveRows).closedMillionths, wagerStatus = effectivePortion >= 1000000n ? "CASHED_OUT" : effectivePortion > 0n ? "PARTIALLY_CASHED_OUT" : "OPEN";
      await tx.wager.update({ where: { id: acceptance.wagerId }, data: { status: wagerStatus, version: { increment: 1 } } });
      if (wagerStatus !== "CASHED_OUT") await tx.wagerPart.updateMany({ where: { tenantId, wagerId: acceptance.wagerId, status: "CASHED_OUT" }, data: { status: "OPEN" } });
      const allocations = await tx.wagerExposureAllocation.findMany({ where: { tenantId, wagerId: acceptance.wagerId } }), remainingStakes = remainingStakeByPart(allocations, effectivePortion), remainingLiabilities = remainingStakeByPart(allocations.map((item) => ({ stakeMinor: item.liabilityMinor })), effectivePortion);
      for (const [index, allocation] of allocations.entries()) {
        const remainingStake = remainingStakes[index], remainingLiability = remainingLiabilities[index];
        await tx.wagerExposureAllocation.update({ where: { id: allocation.id }, data: { remainingStakeMinor: String(remainingStake), remainingLiabilityMinor: String(remainingLiability), status: remainingStake === 0n ? "CLOSED" : remainingStake === BigInt(allocation.stakeMinor) ? "OPEN" : "PARTIALLY_CLOSED", version: { increment: 1 } } });
      }
      for (const marketId of new Set(allocations.map((item) => item.marketId))) {
        const active = await tx.wagerExposureAllocation.findMany({ where: { tenantId, marketId, status: { not: "CLOSED" } } }), stake = active.reduce((sum, item) => sum + BigInt(item.remainingStakeMinor), 0n), liability = active.reduce((sum, item) => sum + BigInt(item.remainingLiabilityMinor), 0n), projection = await tx.exposurePosition.findFirst({ where: { tenantId, scopeType: "MARKET", scopeId: marketId, currency: acceptance.currency } });
        if (projection) await tx.exposurePosition.update({ where: { id: projection.id }, data: { stakeMinor: String(stake), liabilityMinor: String(liability), version: { increment: 1 }, asOf: /* @__PURE__ */ new Date() } });
      }
      await emit(tx, tenantId, "WAGER", acceptance.wagerId, "cashout.corrected.v1", { acceptanceId: corrected.id, reversalOf: acceptance.id });
      await appendAudit(tx, tenantId, context.session.itemId, "cashout.corrected", "CashOutAcceptance", corrected.id, "DUAL_APPROVED", { approvalId: a.approvalId, reversalOf: acceptance.id });
      return corrected.id;
    });
  },
  recordComplianceScreening: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    if (!["SANCTIONS", "PEP", "ADVERSE_MEDIA", "SOURCE_OF_FUNDS"].includes(a.screeningType) || !["POTENTIAL", "REVIEW", "CONFIRMED", "CLEARED", "FALSE_POSITIVE"].includes(a.status)) throw new Error("INVALID_SCREENING");
    const provider = await context.prisma.providerConnection.findFirst({ where: { tenantId, adapterId: "sandbox-aml", status: "ACTIVE" } });
    if (!provider) throw new Error("AML_PROVIDER_UNAVAILABLE");
    const result = await sandboxAdapters.aml.execute({}, { type: "screen", payload: { screeningType: a.screeningType, status: a.status } }, `screening:${a.playerId}:${(0, import_node_crypto9.randomBytes)(12).toString("hex")}`);
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const player = await tx.player.findFirst({ where: { id: a.playerId, tenantId } });
      if (!player) throw new Error("Not found");
      let aml = await tx.aMLCase.findFirst({ where: { tenantId, playerId: player.id, status: { not: "CLOSED" } }, orderBy: { createdAt: "desc" } });
      if (!aml) aml = await tx.aMLCase.create({ data: { tenantId, playerId: player.id, status: "OPEN", riskBand: a.status === "CONFIRMED" ? "HIGH" : "MEDIUM", restrictedEvidence: { provider: provider.id }, ownerId: context.session.itemId } });
      const resolved = ["CONFIRMED", "CLEARED", "FALSE_POSITIVE"].includes(a.status), hit = await tx.screeningHit.create({ data: { tenantId, amlCaseId: aml.id, providerConnectionId: provider.id, screeningType: a.screeningType, matchToken: evidenceHash({ playerId: player.id, externalReference: result.externalRef, screeningType: a.screeningType }), status: a.status, dispositionReason: a.reason, evidenceReference: a.evidenceReference, screenedAt: /* @__PURE__ */ new Date(), resolvedAt: resolved ? /* @__PURE__ */ new Date() : null, ownerId: context.session.itemId } });
      if (a.status === "CONFIRMED") {
        for (const capability of ["WAGER", "DEPOSIT", "MARKETING"]) if (!await tx.accountRestriction.findFirst({ where: { tenantId, playerId: player.id, capability, status: "ACTIVE" } })) await tx.accountRestriction.create({ data: { tenantId, playerId: player.id, capability, reasonCode: `${a.screeningType}_CONFIRMED`, startsAt: /* @__PURE__ */ new Date(), status: "ACTIVE" } });
      }
      await appendAudit(tx, tenantId, context.session.itemId, "compliance.screening_recorded", "ScreeningHit", hit.id, a.status, { playerId: player.id, screeningType: a.screeningType, evidenceReference: a.evidenceReference, providerExternalReference: result.externalRef });
      return hit.id;
    });
  },
  requestDisputeResolution: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    if (!/^-?[0-9]+$/.test(a.adjustmentMinor)) throw new Error("INVALID_ADJUSTMENT");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const dispute = await tx.dispute.findFirst({ where: { id: a.disputeId, tenantId, status: { in: ["OPEN", "TRIAGED", "INVESTIGATING", "APPEALED"] } } });
      if (!dispute) throw new Error("Not found");
      const currency = await disputeCurrency(tx, tenantId, dispute, a.adjustmentMinor);
      const payloadHash = evidenceHash({ action: "DISPUTE_RESOLUTION", disputeId: dispute.id, resolution: a.resolution, adjustmentMinor: a.adjustmentMinor, currency, wagerId: dispute.wagerId ?? null });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `DISPUTE_RESOLUTION:${dispute.id}`, payloadHash, ...approvalReview({ action: "DISPUTE_RESOLUTION", disputeId: dispute.id, playerId: dispute.playerId, wagerId: dispute.wagerId, category: dispute.category, resolution: a.resolution, adjustmentMinor: a.adjustmentMinor, currency }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      await tx.dispute.update({ where: { id: dispute.id }, data: { status: "PROPOSED_RESOLUTION", resolution: a.resolution, approvalRequestId: approval.id } });
      return approval.id;
    });
  },
  // Privacy request servicing: OPEN -> VERIFYING (identity review) -> IN_PROGRESS -> COMPLETED, or DENIED from any open state.
  // An active legal hold on the player or tenant blocks completing erasure/correction/restriction. NEEDS OWNER: lawful
  // grounds, retention exceptions and response deadlines are merchant policy; this only enforces the declared lifecycle.
  transitionPrivacyRequest: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance"), next = String(a.status), reason = String(a.reason ?? "").trim(), artifact = String(a.artifactReference ?? "").trim(), allowed = { OPEN: ["VERIFYING", "DENIED"], VERIFYING: ["IN_PROGRESS", "DENIED"], IN_PROGRESS: ["COMPLETED", "DENIED"] };
    if (!reason) throw new Error("PRIVACY_DECISION_REASON_REQUIRED");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const request = await tx.customerPrivacyRequest.findFirst({ where: { id: a.requestId, tenantId } });
      if (!request?.playerId) throw new Error("Not found");
      if (!(allowed[request.status] ?? []).includes(next)) throw new Error("INVALID_PRIVACY_TRANSITION");
      const now = /* @__PURE__ */ new Date();
      if (next === "COMPLETED") {
        if (["DELETE", "CORRECT", "RESTRICT"].includes(request.type) && await tx.legalHold.findFirst({ where: { tenantId, status: "ACTIVE", startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gt: now } }], AND: [{ OR: [{ scopeType: "PLAYER", scopeId: request.playerId }, { scopeType: "TENANT", scopeId: tenantId }] }] } })) throw new Error("LEGAL_HOLD_ACTIVE");
      }
      const terminal = next === "COMPLETED" || next === "DENIED";
      const delivered = next === "COMPLETED" && ["ACCESS", "EXPORT", "PORTABILITY"].includes(request.type) ? artifact || "customer-download:on-demand-v1" : artifact;
      const updated = await tx.customerPrivacyRequest.updateMany({ where: { id: request.id, tenantId, status: request.status }, data: { status: next, ...terminal ? { completedAt: now, decisionReason: reason } : {}, ...delivered ? { artifactReference: delivered } : {} } });
      if (updated.count !== 1) throw new Error("STALE_PRIVACY_REQUEST");
      await appendAudit(tx, tenantId, context.session.itemId, "privacy.request_transitioned", "CustomerPrivacyRequest", request.id, reason, { from: request.status, to: next, type: request.type, playerId: request.playerId, artifactReference: delivered || null });
      return true;
    });
  },
  // A rejected, expired or still-pending proposal returns the dispute to INVESTIGATING so a revised proposal can be
  // requested with fresh independent approval. The old request keeps its decision and can never authorize the revision.
  withdrawDisputeProposal: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    return serializable2(context.prisma, async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      await tx.$queryRaw`SELECT id FROM "Dispute" WHERE id = ${a.disputeId} AND tenant = ${tenantId} FOR UPDATE`;
      const dispute = await tx.dispute.findFirst({ where: { id: a.disputeId, tenantId, status: "PROPOSED_RESOLUTION" } });
      if (!dispute) throw new Error("Not found");
      const proposal = dispute.approvalRequestId ? await tx.approvalRequest.findFirst({ where: { id: dispute.approvalRequestId, tenantId } }) : null, now = /* @__PURE__ */ new Date();
      if (proposal?.status === "PENDING") {
        const expired = await tx.approvalRequest.updateMany({ where: { id: proposal.id, tenantId, status: "PENDING" }, data: { status: "EXPIRED" } });
        if (expired.count !== 1) throw new Error("APPROVAL_ALREADY_DECIDED");
      } else if (proposal?.status === "APPROVED" && !proposal.consumedAt && proposal.expiresAt && new Date(proposal.expiresAt) > now) throw new Error("APPROVED_PROPOSAL_STILL_APPLICABLE");
      const moved = await tx.dispute.updateMany({ where: { id: dispute.id, tenantId, status: "PROPOSED_RESOLUTION", approvalRequestId: dispute.approvalRequestId }, data: { status: "INVESTIGATING" } });
      if (moved.count !== 1) throw new Error("STALE_DISPUTE_STATE");
      const event = await tx.disputeEvent.create({ data: { tenantId, disputeId: dispute.id, type: "PROPOSAL_WITHDRAWN", actorId: context.session.itemId, evidenceHash: proposal?.payloadHash ?? evidenceHash({ disputeId: dispute.id, resolution: dispute.resolution }), details: { approvalId: proposal?.id ?? null, approvalStatus: proposal?.status ?? null, previousResolution: dispute.resolution, reason: a.reason } } });
      await appendAudit(tx, tenantId, context.session.itemId, "dispute.proposal_withdrawn", "Dispute", dispute.id, a.reason, { approvalId: proposal?.id ?? null, approvalStatus: proposal?.status ?? null });
      return event.id;
    });
  },
  applyDisputeResolution: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    return serializable2(context.prisma, async (tx) => {
      const dispute = await tx.dispute.findFirst({ where: { id: a.disputeId, tenantId, status: "PROPOSED_RESOLUTION" } });
      if (!dispute?.playerId) throw new Error("Not found");
      if (!/^-?[0-9]+$/.test(String(a.adjustmentMinor ?? ""))) throw new Error("INVALID_ADJUSTMENT");
      const currency = await disputeCurrency(tx, tenantId, dispute, a.adjustmentMinor);
      const payloadHash = evidenceHash({ action: "DISPUTE_RESOLUTION", disputeId: dispute.id, resolution: a.resolution, adjustmentMinor: a.adjustmentMinor, currency, wagerId: dispute.wagerId ?? null });
      await approved(tx, context, "canManageCompliance", tenantId, a.approvalId, `DISPUTE_RESOLUTION:${dispute.id}`, payloadHash);
      const adjustment = BigInt(a.adjustmentMinor);
      if (adjustment !== 0n) {
        if (!currency) throw new Error("DISPUTE_CURRENCY_REQUIRES_REVIEW");
        const accounts = await accountMap(tx, tenantId, dispute.playerId, currency), amount = adjustment < 0n ? -adjustment : adjustment, journal = await postJournal(tx, tenantId, { idempotencyKey: `dispute:${dispute.id}:${a.approvalId}`, type: "DISPUTE_ADJUSTMENT", entries: adjustment > 0n ? [{ accountId: accounts.WINNINGS_EXPENSE.id, currency, side: "DEBIT", amount }, { accountId: accounts.PLAYER_CASH.id, currency, side: "CREDIT", amount }] : [{ accountId: accounts.PLAYER_CASH.id, currency, side: "DEBIT", amount }, { accountId: accounts.GAMING_REVENUE.id, currency, side: "CREDIT", amount }] }, dispute.id);
        if (journal.replayed) throw new Error("JOURNAL_ALREADY_POSTED");
        const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: accounts.PLAYER_CASH.id }, orderBy: { version: "desc" } }), next = BigInt(balance?.postedMinor ?? "0") + adjustment;
        if (!balance || next < 0n || BigInt(balance.availableMinor) + adjustment < 0n) throw new Error("ADJUSTMENT_REQUIRES_RECEIVABLE_REVIEW");
        await tx.balanceProjection.create({ data: { tenantId, accountId: accounts.PLAYER_CASH.id, postedMinor: String(next), pendingMinor: balance.pendingMinor, availableMinor: String(BigInt(balance.availableMinor) + (next - BigInt(balance.postedMinor))), version: Number(balance.version) + 1, asOf: /* @__PURE__ */ new Date() } });
        await tx.disputeEvent.create({ data: { tenantId, disputeId: dispute.id, type: "MONETARY_ADJUSTMENT", actorId: context.session.itemId, evidenceHash: payloadHash, details: { journalId: journal.id, adjustmentMinor: a.adjustmentMinor, currency } } });
      }
      await tx.dispute.update({ where: { id: dispute.id }, data: { status: "RESOLVED", resolution: a.resolution, resolvedAt: /* @__PURE__ */ new Date() } });
      await tx.disputeEvent.create({ data: { tenantId, disputeId: dispute.id, type: "RESOLVED", actorId: context.session.itemId, evidenceHash: payloadHash, details: { resolution: a.resolution, approvalId: a.approvalId } } });
      await appendAudit(tx, tenantId, context.session.itemId, "dispute.resolved", "Dispute", dispute.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash, adjustmentMinor: a.adjustmentMinor });
      return true;
    });
  },
  setSupportCaseStatus: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    if (!["TRIAGED", "WAITING_CUSTOMER", "WAITING_OPERATOR", "RESOLVED", "CLOSED"].includes(a.status)) throw new Error("INVALID_CASE_STATUS");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const item = await tx.supportCase.findFirst({ where: { id: a.caseId, tenantId } });
      if (!item) throw new Error("Not found");
      await tx.supportCase.update({ where: { id: item.id }, data: { status: a.status, ownerId: context.session.itemId, resolvedAt: ["RESOLVED", "CLOSED"].includes(a.status) ? /* @__PURE__ */ new Date() : null } });
      await tx.supportCaseEvent.create({ data: { tenantId, supportCaseId: item.id, type: a.status === "RESOLVED" ? "RESOLVED" : "OPERATOR_MESSAGE", actorType: "STAFF", actorId: context.session.itemId, body: a.customerMessage, evidenceHash: evidenceHash({ caseId: item.id, status: a.status, message: a.customerMessage, reason: a.reason }), visibility: "CUSTOMER" } });
      await appendAudit(tx, tenantId, context.session.itemId, "support.status_changed", "SupportCase", item.id, a.reason, { from: item.status, to: a.status });
      return true;
    });
  },
  runSafeguardingReconciliation: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance"), asset = nonnegativeMoney(a.assetMinor, "INVALID_ASSET_AMOUNT"), asOf = strictUtcInstant(a.asOf, "INVALID_AS_OF");
    if (asOf.getTime() > Date.now()) throw new Error("AS_OF_IN_FUTURE");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageFinance");
      const account = await tx.safeguardingAccount.findFirst({ where: { id: a.accountId, tenantId, status: "ACTIVE" } });
      if (!account) throw new Error("Not found");
      const ledger = await playerLiabilityAsOf(tx, tenantId, account.currency, asOf);
      const liability = ledger.total, difference = asset - liability, row = await tx.safeguardingReconciliation.create({ data: { tenantId, safeguardingAccountId: account.id, asOf, safeguardedAssetMinor: String(asset), playerLiabilityMinor: String(liability), differenceMinor: String(difference), status: difference === 0n ? "MATCHED" : difference < 0n ? "SHORTFALL" : "SURPLUS", evidenceHash: evidenceHash({ accountId: account.id, accountReference: account.accountReference, currency: account.currency, asOf, asset: String(asset), assetSource: "OPERATOR_ATTESTED", liability: String(liability), liabilityBasis: "PLAYER_LIABILITY_LEDGER_AS_OF", journalEntryCount: ledger.count, difference: String(difference) }) } });
      await appendAudit(tx, tenantId, context.session.itemId, "safeguarding.reconciled", "SafeguardingReconciliation", row.id, "FINANCE_CONTROL", { differenceMinor: String(difference), assetSource: "OPERATOR_ATTESTED", liabilityBasis: "PLAYER_LIABILITY_LEDGER_AS_OF", journalEntryCount: ledger.count, asOf });
      return row.id;
    });
  },
  openChargeback: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance"), amount = money2(a.amountMinor);
    return serializable2(context.prisma, async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageFinance");
      const prior = await tx.paymentIntent.findFirst({ where: { tenantId, idempotencyKey: a.idempotencyKey } });
      if (prior) {
        if (prior.type !== "CHARGEBACK" || prior.riskEvidence?.originalPaymentIntentId !== a.paymentIntentId || prior.amountMinor !== String(amount)) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
        return prior.id;
      }
      await tx.$queryRaw`SELECT id FROM "PaymentIntent" WHERE id = ${String(a.paymentIntentId ?? "")} AND tenant = ${tenantId} FOR UPDATE`;
      const original = await tx.paymentIntent.findFirst({ where: { id: a.paymentIntentId, tenantId, type: "DEPOSIT", status: "SUCCEEDED" } });
      if (!original?.playerId) throw new Error("INVALID_CHARGEBACK");
      const priorChargebacks = await tx.paymentIntent.findMany({ where: { tenantId, type: "CHARGEBACK", providerSessionReference: `chargeback:${original.id}`, status: { notIn: ["FAILED", "CANCELLED"] } }, select: { amountMinor: true } }), alreadyReversed = priorChargebacks.reduce((sum, item) => sum + BigInt(item.amountMinor), 0n);
      if (alreadyReversed + amount > BigInt(original.amountMinor)) throw new Error("CHARGEBACK_EXCEEDS_REMAINING_AMOUNT");
      const [cash, clearing, loss] = await Promise.all([tx.ledgerAccount.findFirst({ where: { tenantId, playerId: original.playerId, key: "PLAYER_CASH", currency: original.currency } }), tx.ledgerAccount.findFirst({ where: { tenantId, playerId: null, key: "PAYMENT_CLEARING", currency: original.currency } }), tx.ledgerAccount.findFirst({ where: { tenantId, playerId: null, key: "CHARGEBACK_LOSS", currency: original.currency } })]);
      const balance = cash ? await tx.balanceProjection.findFirst({ where: { tenantId, accountId: cash.id }, orderBy: { version: "desc" } }) : null;
      if (!cash || !clearing || !loss || !balance) throw new Error("CHARGEBACK_LEDGER_UNAVAILABLE");
      const recoverable = BigInt(balance.availableMinor) < amount ? BigInt(balance.availableMinor) : amount, shortage = amount - recoverable;
      const intent = await tx.paymentIntent.create({ data: { tenantId, playerId: original.playerId, providerConnectionId: original.providerConnectionId, type: "CHARGEBACK", amountMinor: String(amount), feeMinor: "0", currency: original.currency, idempotencyKey: a.idempotencyKey, paymentMethodReference: original.paymentMethodReference, providerSessionReference: `chargeback:${original.id}`, riskEvidence: { originalPaymentIntentId: original.id, reason: a.reason, shortageMinor: String(shortage), priorReversedMinor: String(alreadyReversed), evidenceType: "OPERATOR_ATTESTED", externalConfirmation: null }, status: "REVIEW", completedAt: null } });
      const entries = [];
      if (recoverable > 0n) entries.push({ accountId: cash.id, currency: original.currency, side: "DEBIT", amount: recoverable });
      if (shortage > 0n) entries.push({ accountId: loss.id, currency: original.currency, side: "DEBIT", amount: shortage });
      entries.push({ accountId: clearing.id, currency: original.currency, side: "CREDIT", amount });
      const journal = await postJournal(tx, tenantId, { idempotencyKey: `chargeback:${a.idempotencyKey}`, type: "CHARGEBACK", entries }, intent.id), next = BigInt(balance.postedMinor) - recoverable;
      if (journal.replayed) throw new Error("JOURNAL_ALREADY_POSTED");
      await tx.balanceProjection.create({ data: { tenantId, accountId: cash.id, postedMinor: String(next), pendingMinor: balance.pendingMinor, availableMinor: String(BigInt(balance.availableMinor) + (next - BigInt(balance.postedMinor))), version: Number(balance.version) + 1, asOf: /* @__PURE__ */ new Date() } });
      if (shortage > 0n) await tx.accountRestriction.create({ data: { tenantId, playerId: original.playerId, capability: "WAGER", reasonCode: "CHARGEBACK_SHORTFALL", startsAt: /* @__PURE__ */ new Date(), status: "ACTIVE" } });
      await emit(tx, tenantId, "PAYMENT", intent.id, "payment.chargeback_opened.v1", { originalPaymentIntentId: original.id, evidenceType: "OPERATOR_ATTESTED", amountMinor: String(amount), recoverableMinor: String(recoverable), shortageMinor: String(shortage), journalId: journal.id });
      await appendAudit(tx, tenantId, context.session.itemId, "payment.chargeback_opened", "PaymentIntent", intent.id, a.reason, { originalPaymentIntentId: original.id, amountMinor: String(amount), shortageMinor: String(shortage), journalId: journal.id });
      return intent.id;
    });
  },
  requestTaxRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance");
    if (!/^\d+$/.test(a.rateNumerator) || !/^\d+$/.test(a.rateDenominator) || BigInt(a.rateDenominator) <= 0n) throw new Error("INVALID_TAX_RATE");
    assertSupportedTaxRule(a.basis, a.roundingRule);
    const effectiveFrom = await operatorInstant(context, tenantId, a.effectiveFrom, "EFFECTIVE_FROM"), payloadHash = evidenceHash({ action: "TAX_RULE", jurisdictionId: a.jurisdictionId, key: a.key, basis: a.basis, rateNumerator: a.rateNumerator, rateDenominator: a.rateDenominator, roundingRule: a.roundingRule, effectiveFrom });
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageFinance");
      const jurisdiction = await tx.jurisdiction.findUnique({ where: { id: a.jurisdictionId } });
      if (!jurisdiction) throw new Error("Not found");
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `TAX_RULE:${a.jurisdictionId}:${a.key}`, payloadHash, ...approvalReview({ action: "TAX_RULE", jurisdictionId: a.jurisdictionId, key: a.key, basis: a.basis, rateNumerator: a.rateNumerator, rateDenominator: a.rateDenominator, roundingRule: a.roundingRule, effectiveFrom }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      return approval.id;
    });
  },
  applyTaxRule: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance"), effectiveFrom = await operatorInstant(context, tenantId, a.effectiveFrom, "EFFECTIVE_FROM"), payloadHash = evidenceHash({ action: "TAX_RULE", jurisdictionId: a.jurisdictionId, key: a.key, basis: a.basis, rateNumerator: a.rateNumerator, rateDenominator: a.rateDenominator, roundingRule: a.roundingRule, effectiveFrom });
    return context.prisma.$transaction(async (tx) => {
      await approved(tx, context, "canManageFinance", tenantId, a.approvalId, `TAX_RULE:${a.jurisdictionId}:${a.key}`, payloadHash);
      const version = await tx.taxRuleVersion.count({ where: { tenantId, jurisdictionId: a.jurisdictionId, key: a.key } }) + 1, row = await tx.taxRuleVersion.create({ data: { tenantId, jurisdictionId: a.jurisdictionId, key: a.key, version, basis: a.basis, rateNumerator: a.rateNumerator, rateDenominator: a.rateDenominator, roundingRule: a.roundingRule, effectiveFrom, status: "ACTIVE", evidenceHash: payloadHash } });
      await appendAudit(tx, tenantId, context.session.itemId, "tax.rule_activated", "TaxRuleVersion", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return row.id;
    });
  },
  assessSettlementTax: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance");
    return serializable2(context.prisma, async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageFinance");
      const settlement = await tx.settlement.findFirst({ where: { id: a.settlementId, tenantId }, include: { wager: true } }), rule = await tx.taxRuleVersion.findFirst({ where: { id: a.taxRuleId, tenantId, status: "ACTIVE" } });
      if (!settlement?.wager || !rule) throw new Error("Not found");
      assertSupportedTaxRule(String(rule.basis), rule.roundingRule);
      if (settlement.reversalOfId || await tx.settlement.findFirst({ where: { tenantId, reversalOfId: settlement.id } })) throw new Error("TAX_SETTLEMENT_NOT_CURRENT");
      const ruleIdentity = `${rule.key}:v${rule.version}:${rule.id}`;
      await tx.$queryRaw`SELECT id FROM "Wager" WHERE id = ${settlement.wagerId} FOR UPDATE`;
      const existing = await tx.taxAssessment.findFirst({ where: { tenantId, wagerId: settlement.wagerId, ruleVersion: ruleIdentity, status: { not: "REVERSED" } } });
      if (existing) return existing.id;
      const settledAt = settlement.createdAt;
      if (rule.effectiveFrom > settledAt || rule.effectiveTo && rule.effectiveTo <= settledAt) throw new Error("TAX_RULE_NOT_EFFECTIVE");
      const operatorJurisdiction = settlement.wager.operatorJurisdictionId ? await tx.operatorJurisdiction.findFirst({ where: { id: settlement.wager.operatorJurisdictionId, tenantId } }) : null;
      if (!operatorJurisdiction?.jurisdictionId || operatorJurisdiction.jurisdictionId !== rule.jurisdictionId) throw new Error("TAX_RULE_JURISDICTION_MISMATCH");
      const stake = BigInt(settlement.wager.stakeMinor), payout = BigInt(settlement.payoutMinor), basis = rule.basis === "STAKE" ? stake : rule.basis === "WINNINGS" ? payout : stake - payout, nonnegative = basis < 0n ? 0n : basis, amount = roundTax(nonnegative * BigInt(rule.rateNumerator), BigInt(rule.rateDenominator), rule.roundingRule);
      let journalId = null;
      if (amount > 0n) {
        const [expense, payable] = await Promise.all([tx.ledgerAccount.findFirst({ where: { tenantId, key: "TAX_EXPENSE", currency: settlement.wager.currency } }), tx.ledgerAccount.findFirst({ where: { tenantId, key: "TAX_PAYABLE", currency: settlement.wager.currency } })]);
        if (!expense || !payable) throw new Error("TAX_LEDGER_UNAVAILABLE");
        journalId = (await postJournal(tx, tenantId, { idempotencyKey: `tax:${settlement.id}:${rule.id}`, type: "TAX_ASSESSMENT", entries: [{ accountId: expense.id, currency: settlement.wager.currency, side: "DEBIT", amount }, { accountId: payable.id, currency: settlement.wager.currency, side: "CREDIT", amount }] }, settlement.id)).id;
      }
      const assessment = await tx.taxAssessment.create({ data: { tenantId, wagerId: settlement.wagerId, ruleVersion: ruleIdentity, basisMinor: String(nonnegative), amountMinor: String(amount), currency: settlement.wager.currency, status: amount > 0n ? "POSTED" : "CALCULATED" } });
      await appendAudit(tx, tenantId, context.session.itemId, "tax.assessed", "TaxAssessment", assessment.id, rule.key, { settlementId: settlement.id, taxRuleId: rule.id, ruleIdentity, basis: rule.basis, basisSemantics: rule.basis === "WINNINGS" ? "GROSS_PAYOUT" : rule.basis === "GGR" ? "STAKE_MINUS_PAYOUT" : "STAKE", rateNumerator: rule.rateNumerator, rateDenominator: rule.rateDenominator, roundingRule: rule.roundingRule, jurisdictionId: rule.jurisdictionId, requestKey: a.idempotencyKey, basisMinor: String(nonnegative), amountMinor: String(amount), journalId });
      return assessment.id;
    });
  },
  requestLedgerAdjustment: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance");
    money2(a.amountMinor);
    if (!["DEBIT", "CREDIT"].includes(a.direction)) throw new Error("INVALID_DIRECTION");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageFinance");
      const account = await tx.ledgerAccount.findFirst({ where: { id: a.accountId, tenantId } });
      if (!account) throw new Error("Not found");
      const evidence = object(a.evidence, "INVALID_EVIDENCE");
      if (evidence.reconciliationItemId !== void 0) {
        const item = await tx.reconciliationItem.findFirst({ where: { id: String(evidence.reconciliationItemId), tenantId, status: "OPEN" } }), difference = item ? BigInt(item.differenceMinor || "0") : 0n;
        if (!item) throw new Error("RECONCILIATION_ITEM_NOT_OPEN");
        if (item.currency !== account.currency || (difference < 0n ? -difference : difference) !== BigInt(a.amountMinor)) throw new Error("RECONCILIATION_ITEM_MISMATCH");
      }
      const payloadHash = evidenceHash({ action: "LEDGER_ADJUSTMENT", accountId: account.id, amountMinor: a.amountMinor, direction: a.direction, reasonCode: a.reasonCode, evidence });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `LEDGER_ADJUSTMENT:${account.id}:${a.amountMinor}:${a.direction}`, payloadHash, ...approvalReview({ action: "LEDGER_ADJUSTMENT", accountId: account.id, accountKey: account.key, playerId: account.playerId, currency: account.currency, amountMinor: a.amountMinor, direction: a.direction, reasonCode: a.reasonCode, evidence }), requesterId: context.session.itemId, status: "PENDING", reason: a.reasonCode } });
      const row = await tx.ledgerAdjustmentRequest.create({ data: { tenantId, playerId: account.playerId, accountId: account.id, amountMinor: a.amountMinor, currency: account.currency, direction: a.direction, reasonCode: a.reasonCode, evidence, status: "PENDING", requesterId: context.session.itemId, approvalRequestId: approval.id } });
      return row.id;
    });
  },
  applyLedgerAdjustment: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageFinance");
    return serializable2(context.prisma, async (tx) => {
      const row = await tx.ledgerAdjustmentRequest.findFirst({ where: { id: a.adjustmentId, tenantId }, include: { account: true } });
      if (!row?.account || row.approvalRequestId !== a.approvalId) throw new Error("Not found");
      if (row.status === "POSTED" && row.journalTransactionId) return row.journalTransactionId;
      if (row.status !== "PENDING") throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "LEDGER_ADJUSTMENT", accountId: row.account.id, amountMinor: row.amountMinor, direction: row.direction, reasonCode: row.reasonCode, evidence: row.evidence });
      await approved(tx, context, "canManageFinance", tenantId, a.approvalId, `LEDGER_ADJUSTMENT:${row.account.id}:${row.amountMinor}:${row.direction}`, payloadHash);
      const offset = await tx.ledgerAccount.findFirst({ where: { tenantId, key: row.direction === "CREDIT" ? "WINNINGS_EXPENSE" : "GAMING_REVENUE", currency: row.currency } });
      if (!offset) throw new Error("MISSING_OFFSET_ACCOUNT");
      const amount = BigInt(row.amountMinor), journal = await postJournal(tx, tenantId, { idempotencyKey: `ledger-adjustment:${row.id}`, type: "LEDGER_ADJUSTMENT", entries: row.direction === "CREDIT" ? [{ accountId: offset.id, currency: row.currency, side: "DEBIT", amount }, { accountId: row.account.id, currency: row.currency, side: "CREDIT", amount }] : [{ accountId: row.account.id, currency: row.currency, side: "DEBIT", amount }, { accountId: offset.id, currency: row.currency, side: "CREDIT", amount }] }, row.id);
      if (journal.replayed) throw new Error("JOURNAL_ALREADY_POSTED");
      if (row.account.playerId) {
        const balance = await tx.balanceProjection.findFirst({ where: { tenantId, accountId: row.account.id }, orderBy: { version: "desc" } }), next = BigInt(balance?.postedMinor ?? "0") + (row.direction === "CREDIT" ? amount : -amount);
        if (!balance || next < 0n || BigInt(balance.availableMinor) + (next - BigInt(balance.postedMinor)) < 0n) throw new Error("ADJUSTMENT_REQUIRES_RECEIVABLE_REVIEW");
        await tx.balanceProjection.create({ data: { tenantId, accountId: row.account.id, postedMinor: String(next), pendingMinor: balance.pendingMinor, availableMinor: String(BigInt(balance.availableMinor) + (next - BigInt(balance.postedMinor))), version: Number(balance.version) + 1, asOf: /* @__PURE__ */ new Date() } });
      }
      await tx.ledgerAdjustmentRequest.update({ where: { id: row.id }, data: { status: "POSTED", journalTransactionId: journal.id } });
      await appendAudit(tx, tenantId, context.session.itemId, "ledger.adjusted", "LedgerAdjustmentRequest", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, journalId: journal.id, payloadHash, requestKey: a.idempotencyKey });
      const linkedItemId = row.evidence?.reconciliationItemId;
      if (linkedItemId !== void 0) {
        const linked = await tx.reconciliationItem.updateMany({ where: { id: String(linkedItemId), tenantId, status: "OPEN", currency: row.currency }, data: { status: "RESOLVED", resolutionJournalId: journal.id } });
        if (linked.count !== 1) throw new Error("RECONCILIATION_ITEM_NOT_OPEN");
      }
      return journal.id;
    });
  },
  scheduleOperationalJob: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageIntegrations"), dueAt = await operatorInstant(context, tenantId, a.dueAt, "DUE_AT"), payload = object(a.payload, "INVALID_JOB_PAYLOAD");
    if (Number.isNaN(dueAt.getTime())) throw new Error("INVALID_DUE_AT");
    assertScheduledJobHasHandler(a.type);
    if (a.scopeType !== "TENANT" || a.scopeId !== tenantId) throw new Error("UNSUPPORTED_SCHEDULED_SCOPE");
    if (typeof a.idempotencyKey !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(a.idempotencyKey)) throw new Error("INVALID_IDEMPOTENCY_KEY");
    const row = await context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageIntegrations");
      return tx.scheduledJob.create({ data: { tenantId, type: a.type, scopeType: a.scopeType, scopeId: a.scopeId, payload, status: "SCHEDULED", dueAt, attempts: 0, maxAttempts: 10, idempotencyKey: a.idempotencyKey } });
    });
    return row.id;
  },
  runRetentionDryRun: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance"), from = await operatorInstant(context, tenantId, a.windowFrom, "WINDOW_FROM"), to = await operatorInstant(context, tenantId, a.windowTo, "WINDOW_TO");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const policy = await tx.retentionPolicyVersion.findFirst({ where: { id: a.policyId, tenantId, status: "ACTIVE" } });
      if (!policy || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) throw new Error("INVALID_RETENTION_RUN");
      const asOf = /* @__PURE__ */ new Date(), manifest = await retentionCandidates(tx, tenantId, policy, from, to, asOf, asOf), dryRunHash = manifest.manifestHash;
      const run = await tx.retentionExecution.create({ data: { tenantId, policyVersionId: policy.id, windowFrom: from, windowTo: to, candidateCount: manifest.candidateCount, heldCount: manifest.held.length, archivedCount: 0, deletedCount: 0, status: "DRY_RUN", dryRunHash, createdAt: asOf } });
      await appendAudit(tx, tenantId, context.session.itemId, "retention.dry_run", "RetentionExecution", run.id, "NO_DATA_MUTATION", { dryRunHash, candidateCount: manifest.candidateCount, eligibleCount: manifest.eligible.length, heldCount: manifest.held.length, cutoff: manifest.cutoff.toISOString(), holdIds: manifest.holdIds });
      return run.id;
    });
  },
  requestRetentionExecution: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canManageCompliance");
      const run = await tx.retentionExecution.findFirst({ where: { id: a.executionId, tenantId, status: "DRY_RUN" } });
      if (!run) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "RETENTION_EXECUTION", executionId: run.id, dryRunHash: run.dryRunHash, candidateCount: run.candidateCount, heldCount: run.heldCount });
      const approval = await tx.approvalRequest.create({ data: { tenantId, action: `RETENTION_EXECUTION:${run.id}`, payloadHash, ...approvalReview({ action: "RETENTION_EXECUTION", executionId: run.id, policyVersionId: run.policyVersionId, windowFrom: run.windowFrom, windowTo: run.windowTo, dryRunHash: run.dryRunHash, candidateCount: run.candidateCount, heldCount: run.heldCount }), requesterId: context.session.itemId, status: "PENDING", reason: a.reason } });
      await tx.retentionExecution.update({ where: { id: run.id }, data: { status: "PENDING_APPROVAL", approvalRequestId: approval.id } });
      return approval.id;
    });
  },
  applyRetentionExecution: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canManageCompliance");
    return context.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`LOCK TABLE "LegalHold" IN SHARE MODE`;
      const run = await tx.retentionExecution.findFirst({ where: { id: a.executionId, tenantId, status: "PENDING_APPROVAL" }, include: { policyVersion: true } });
      if (!run?.policyVersion) throw new Error("Not found");
      const payloadHash = evidenceHash({ action: "RETENTION_EXECUTION", executionId: run.id, dryRunHash: run.dryRunHash, candidateCount: run.candidateCount, heldCount: run.heldCount });
      await approved(tx, context, "canManageCompliance", tenantId, a.approvalId, `RETENTION_EXECUTION:${run.id}`, payloadHash);
      await tx.$queryRaw`SELECT id FROM "RetentionPolicyVersion" WHERE id = ${run.policyVersion.id} AND tenant = ${tenantId} FOR SHARE`;
      const policy = await tx.retentionPolicyVersion.findFirst({ where: { id: run.policyVersion.id, tenantId, status: "ACTIVE" } });
      if (!policy) throw new Error("RETENTION_POLICY_NOT_ACTIVE");
      const now = /* @__PURE__ */ new Date(), manifest = await retentionCandidates(tx, tenantId, policy, run.windowFrom, run.windowTo, new Date(run.createdAt), now);
      if (manifest.manifestHash !== run.dryRunHash) throw new Error("RETENTION_MANIFEST_CHANGED_REVIEW_REQUIRED");
      let deletedCount = 0, tokenizedCount = 0;
      if (manifest.eligible.length && policy.recordClass === "CUSTOMER_SESSION") {
        deletedCount = (await tx.customerSession.deleteMany({ where: { tenantId, id: { in: manifest.eligible } } })).count;
      } else if (manifest.eligible.length && policy.recordClass === "GEO") {
        tokenizedCount = (await tx.geoCheck.updateMany({ where: { tenantId, id: { in: manifest.eligible } }, data: { coarseEvidence: { retained: GEO_TOKENIZED_MARKER, policyVersionId: policy.id } } })).count;
      }
      if (deletedCount + tokenizedCount !== manifest.eligible.length) throw new Error("RETENTION_EFFECT_MISMATCH");
      const audit = await appendAudit(tx, tenantId, context.session.itemId, "retention.executed", "RetentionExecution", run.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash, manifestHash: manifest.manifestHash, disposition: `${policy.recordClass}:${policy.deletionMode}`, deletedCount, tokenizedCount, heldCount: manifest.held.length, eligible: manifest.eligible, held: manifest.held });
      const done = await tx.retentionExecution.updateMany({ where: { id: run.id, tenantId, status: "PENDING_APPROVAL" }, data: { status: "COMPLETED", archivedCount: tokenizedCount, deletedCount, heldCount: manifest.held.length, artifactReference: `audit:${audit.id}`, completedAt: now } });
      if (done.count !== 1) throw new Error("RETENTION_EXECUTION_CHANGED");
      return true;
    });
  },
  requestDataExport: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canReadAudit"), scope = object(a.scope, "INVALID_EXPORT_SCOPE"), expiresAt = await operatorInstant(context, tenantId, a.expiresAt, "EXPIRES_AT");
    if (expiresAt <= /* @__PURE__ */ new Date()) throw new Error("INVALID_EXPIRY");
    const requiresApproval = ["RESTRICTED_PII", "RESTRICTED_FINANCIAL", "RESTRICTED_REGULATORY"].includes(a.classification), payloadHash = evidenceHash({ type: a.type, classification: a.classification, scope, expiresAt });
    assertArtifactDeliveryHasHandler("export.requested.v1");
    return context.prisma.$transaction(async (tx) => {
      await assertCurrentActor(tx, context, tenantId, "canReadAudit");
      let approval = null;
      if (requiresApproval) approval = await tx.approvalRequest.create({ data: { tenantId, action: `DATA_EXPORT:${a.type}:${a.classification}`, payloadHash, ...approvalReview({ type: a.type, classification: a.classification, scope, expiresAt }), requesterId: context.session.itemId, status: "PENDING", reason: "RESTRICTED_EXPORT" } });
      const row = await tx.dataExport.create({ data: { tenantId, requestedBy: context.session.itemId, type: a.type, scope, classification: a.classification, status: requiresApproval ? "PENDING" : "GENERATING", rowCount: 0, expiresAt, approvalRequestId: approval?.id } });
      if (!requiresApproval) await emit(tx, tenantId, "DATA_EXPORT", row.id, "export.requested.v1", { type: a.type, classification: a.classification, payloadHash, approvalId: null });
      await appendAudit(tx, tenantId, context.session.itemId, "export.requested", "DataExport", row.id, a.classification, { payloadHash, approvalId: approval?.id ?? null });
      return row.id;
    });
  },
  applyApprovedDataExport: async (_r, a, context) => {
    const tenantId = await requireTenant(context, "canReadAudit");
    assertArtifactDeliveryHasHandler("export.requested.v1");
    return context.prisma.$transaction(async (tx) => {
      const row = await tx.dataExport.findFirst({ where: { id: a.exportId, tenantId, status: "PENDING" } });
      if (!row) throw new Error("Not found");
      const payloadHash = evidenceHash({ type: row.type, classification: row.classification, scope: row.scope, expiresAt: row.expiresAt });
      await approved(tx, context, "canReadAudit", tenantId, a.approvalId, `DATA_EXPORT:${row.type}:${row.classification}`, payloadHash);
      await tx.dataExport.update({ where: { id: row.id }, data: { status: "GENERATING" } });
      await emit(tx, tenantId, "DATA_EXPORT", row.id, "export.requested.v1", { type: row.type, classification: row.classification, payloadHash, approvalId: a.approvalId });
      await appendAudit(tx, tenantId, context.session.itemId, "export.approved", "DataExport", row.id, "DUAL_APPROVED", { approvalId: a.approvalId, payloadHash });
      return true;
    });
  }
} };

// features/keystone/mutations/createInitialUser.ts
var graphql3 = String.raw;
var createInitialUserTypeDefs = graphql3`
  input CreateInitialUserInput {
    name: String
    email: String
    password: String
  }

  type Mutation {
    createInitialUser(data: CreateInitialUserInput!): UserAuthenticationWithPasswordSuccess!
  }
`;
async function createInitialUser(root, { data }, context) {
  const itemId = await sportsbookFullResolvers.Mutation.bootstrapOperatorAdmin(root, {
    name: data.name ?? "",
    email: data.email ?? "",
    password: data.password ?? ""
  }, context);
  const sessionToken = await context.sessionStrategy?.start({ data: { listKey: "User", itemId }, context });
  if (typeof sessionToken !== "string" || !sessionToken) throw new Error("Failed to start session");
  const item = await context.sudo().db.User.findOne({ where: { id: itemId } });
  return { sessionToken, item };
}

// features/keystone/mutations/index.ts
var graphql4 = String.raw;
function extendGraphqlSchema(baseSchema) {
  return (0, import_schema.mergeSchemas)({
    schemas: [baseSchema],
    typeDefs: [graphql4`
      type Query {
        redirectToInit: Boolean
      }
    `, createInitialUserTypeDefs, sportsbookTypeDefs, sportsbookFullTypeDefs],
    resolvers: [{
      Query: {
        redirectToInit: redirectToInit_default
      },
      Mutation: {
        createInitialUser
      }
    }, sportsbookResolvers, sportsbookFullResolvers]
  });
}

// features/keystone/prisma-contract.ts
var modelAttributes = {
  Brand: [
    '@@unique([domain], map: "Brand_domain_uq")'
  ],
  BalanceProjection: [
    '@@unique([tenantId, accountId, version], map: "BalanceProjection_account_version_uq")'
  ],
  Hold: [
    '@@unique([tenantId, purposeType, purposeId], map: "Hold_tenant_purpose_key")'
  ],
  InboxMessage: [
    '@@unique([tenantId, messageKey], map: "InboxMessage_tenant_message_key")'
  ],
  JournalTransaction: [
    '@@unique([tenantId, idempotencyKey], map: "JournalTransaction_tenant_idempotency_key")',
    '@@unique([tenantId, reversalOfId], map: "JournalTransaction_tenant_reversal_uq")'
  ],
  OutboxMessage: [
    '@@index([status, availableAt, leaseUntil], map: "OutboxMessage_claim_idx")'
  ],
  PaymentIntent: [
    '@@unique([tenantId, idempotencyKey], map: "PaymentIntent_tenant_idempotency_key")'
  ],
  PriceSnapshot: [
    '@@index([selectionId, receivedAt(sort: Desc)], map: "PriceSnapshot_current_idx")',
    '@@unique([tenantId, selectionId, sequence], map: "PriceSnapshot_selection_sequence_uq")'
  ],
  ProviderEntityMapping: [
    '@@unique([tenantId, providerConnectionId, entityType, externalId], map: "ProviderEntityMapping_external_uq")'
  ],
  ResultVersion: [
    '@@unique([tenantId, eventId, version], map: "ResultVersion_event_version_uq")'
  ],
  Settlement: [
    '@@unique([tenantId, inputHash], map: "Settlement_tenant_input_uq")',
    '@@unique([tenantId, wagerId, version], map: "Settlement_wager_version_uq")',
    '@@unique([tenantId, reversalOfId], map: "Settlement_tenant_reversal_uq")'
  ],
  Wager: [
    '@@unique([tenantId, idempotencyKey], map: "Wager_tenant_idempotency_key")'
  ],
  WebhookReplay: [
    '@@unique([providerConnectionId, messageHash], map: "WebhookReplay_connection_hash_uq")'
  ],
  LegalEntity: [
    '@@unique([tenantId, countryCode, registrationReference], map: "LegalEntity_registration_uq")'
  ],
  TenantCurrency: [
    '@@unique([tenantId, currencyId], map: "TenantCurrency_currency_uq")'
  ],
  JurisdictionPolicyVersion: [
    '@@unique([tenantId, jurisdictionId, version], map: "JurisdictionPolicyVersion_scope_version_uq")'
  ],
  HouseRuleVersion: [
    '@@unique([tenantId, name, version], map: "HouseRuleVersion_name_version_uq")'
  ],
  FeatureFlag: [
    '@@unique([tenantId, key, scopeType, scopeId], map: "FeatureFlag_scope_uq")'
  ],
  ConfigDefinition: [
    '@@unique([tenantId, key], map: "ConfigDefinition_key_uq")'
  ],
  BrandLocale: [
    '@@unique([tenantId, brandId, locale, termsVersion], map: "BrandLocale_terms_uq")'
  ],
  OperatorChannel: [
    '@@unique([tenantId, key], map: "OperatorChannel_key_uq")'
  ],
  Region: [
    '@@unique([tenantId, key], map: "Region_key_uq")'
  ],
  Season: [
    '@@unique([tenantId, competitionId, key], map: "Season_competition_key_uq")'
  ],
  CompetitionStage: [
    '@@unique([tenantId, seasonId, key], map: "CompetitionStage_season_key_uq")'
  ],
  Venue: [
    '@@unique([tenantId, key], map: "Venue_key_uq")'
  ],
  MarketDefinition: [
    '@@unique([tenantId, key, version], map: "MarketDefinition_key_version_uq")'
  ],
  CorrelationGroup: [
    '@@unique([tenantId, key, version], map: "CorrelationGroup_key_version_uq")'
  ],
  WagerPart: [
    '@@unique([tenantId, wagerId, partIndex], map: "WagerPart_wager_index_uq")'
  ],
  WagerExposureAllocation: [
    '@@unique([tenantId, wagerId, marketId], map: "WagerExposureAllocation_wager_market_uq")'
  ],
  SettlementRun: [
    '@@unique([tenantId, inputHash], map: "SettlementRun_input_uq")'
  ],
  CashOutAcceptance: [
    '@@unique([tenantId, idempotencyKey], map: "CashOutAcceptance_idempotency_uq")'
  ],
  Promotion: [
    '@@unique([tenantId, key], map: "Promotion_key_uq")'
  ],
  PromotionRuleVersion: [
    '@@unique([tenantId, promotionId, version], map: "PromotionRuleVersion_promotion_version_uq")'
  ],
  BonusAward: [
    '@@unique([tenantId, idempotencyKey], map: "BonusAward_idempotency_uq")'
  ],
  BonusTransaction: [
    '@@unique([tenantId, idempotencyKey], map: "BonusTransaction_idempotency_uq")'
  ],
  PromotionRedemption: [
    '@@unique([tenantId, playerId, promotionId, idempotencyKey], map: "PromotionRedemption_player_key_uq")'
  ],
  CustomerFavorite: [
    '@@unique([tenantId, playerId, targetType, targetId], map: "CustomerFavorite_target_uq")'
  ],
  CustomerQuoteLegTerms: [
    '@@unique([quoteKey, legIndex], map: "CustomerQuoteLegTerms_quote_index_uq")'
  ],
  ScreeningHit: [
    '@@unique([tenantId, providerConnectionId, screeningType, matchToken], map: "ScreeningHit_provider_match_uq")'
  ],
  ScheduledJob: [
    '@@unique([tenantId, idempotencyKey], map: "ScheduledJob_idempotency_uq")',
    '@@index([status, dueAt, leaseUntil], map: "ScheduledJob_claim_idx")'
  ],
  AffiliateAttribution: [
    '@@unique([tenantId, playerId, campaignReference], map: "AffiliateAttribution_campaign_uq")'
  ],
  PamSubjectMapping: [
    '@@unique([tenantId, providerConnectionId, externalSubjectDigest], map: "PamSubjectMapping_subject_uq")'
  ],
  WebhookEndpoint: [
    '@@unique([tenantId, url], map: "WebhookEndpoint_url_uq")'
  ],
  WebhookDelivery: [
    '@@unique([tenantId, deliveryId], map: "WebhookDelivery_delivery_uq")',
    '@@index([status, availableAt], map: "WebhookDelivery_claim_idx")'
  ],
  IntegrationDeliveryAttempt: [
    '@@unique([tenantId, deliveryId, attempt], map: "IntegrationDeliveryAttempt_number_uq")'
  ]
};
var fullTenantModels = [
  "AccessReview",
  "AccountClosure",
  "AdapterCertificationRun",
  "AffiliateAttribution",
  "AffordabilityAssessment",
  "BonusAward",
  "BonusTransaction",
  "BrandLocale",
  "CampaignBudget",
  "CashOutAcceptance",
  "CompetitionStage",
  "ConfigDefinition",
  "CorrelationGroup",
  "CorrelationRule",
  "CustomerCredential",
  "CustomerDevice",
  "CustomerFavorite",
  "CustomerPrivacyRequest",
  "CustomerQuoteLegTerms",
  "CustomerRecoveryToken",
  "DataExport",
  "EventScheduleChange",
  "FeatureFlag",
  "FeedHealthSnapshot",
  "HouseRuleVersion",
  "IntegrityCase",
  "JurisdictionPolicyVersion",
  "LegalEntity",
  "LedgerAdjustmentRequest",
  "MarketDefinition",
  "Notification",
  "OperatorChannel",
  "PamSubjectMapping",
  "PlayerStatement",
  "Promotion",
  "PromotionRedemption",
  "PromotionRuleVersion",
  "ProviderHealthSample",
  "Region",
  "ReportArtifact",
  "RetentionExecution",
  "RetentionPolicyVersion",
  "SafeguardingAccount",
  "SafeguardingReconciliation",
  "ScheduledJob",
  "Season",
  "SettlementLine",
  "SettlementRun",
  "SupportCase",
  "SupportCaseEvent",
  "TaxRuleVersion",
  "TenantCurrency",
  "TraderOverride",
  "TradingReplayRun",
  "Venue",
  "WagerPart",
  "WagerExposureAllocation",
  "ScreeningHit",
  "WebhookEndpoint",
  "WebhookDelivery",
  "IntegrationDeliveryAttempt"
];
var requiredRelations = Object.fromEntries(fullTenantModels.map((model) => [model, ["tenant"]]));
Object.assign(requiredRelations, {
  CustomerCredential: ["tenant", "player"],
  CustomerDevice: ["tenant", "player"],
  CustomerFavorite: ["tenant", "player"],
  CustomerQuoteLegTerms: ["tenant", "player", "quote"],
  CustomerRecoveryToken: ["tenant", "player"],
  WagerPart: ["tenant", "wager"],
  WagerExposureAllocation: ["tenant", "wager", "market"],
  SettlementRun: ["tenant", "resultVersion"],
  SettlementLine: ["tenant", "settlement"],
  CashOutAcceptance: ["tenant", "offer", "wager", "player", "journalTransaction"],
  PromotionRuleVersion: ["tenant", "promotion"],
  CampaignBudget: ["tenant", "promotion"],
  BonusAward: ["tenant", "promotion", "ruleVersion", "player"],
  BonusTransaction: ["tenant", "award"],
  PromotionRedemption: ["tenant", "promotion", "ruleVersion", "player"],
  SafeguardingReconciliation: ["tenant", "safeguardingAccount"],
  LedgerAdjustmentRequest: ["tenant", "account", "approvalRequest"],
  SupportCase: ["tenant", "player"],
  SupportCaseEvent: ["tenant", "supportCase"],
  ScreeningHit: ["tenant", "amlCase", "providerConnection"],
  WebhookDelivery: ["tenant", "endpoint"],
  IntegrationDeliveryAttempt: ["tenant", "delivery"]
});
var retainedStarterModels = String.raw`
// RETAINED UPGRADE DATA ONLY. These tables are not Keystone lists and are not
// exposed through GraphQL/Admin UI. They remain modeled so Prisma migration
// generation cannot mistake historical starter data for removable drift.
model RetainedStarterTodo {
  id                   String                         @id @default(cuid())
  label                String                         @default("")
  description          Json                           @default("[{\"type\":\"paragraph\",\"children\":[{\"text\":\"\"}]}]")
  isComplete           Boolean                        @default(false)
  status               String?                        @default("todo")
  priority             Int?                           @default(1)
  tags                 Json                           @default("[]")
  dueDate              DateTime?
  weight               Float?                         @default(1)
  budget               Decimal?                       @default("0.00") @postgresql.Decimal(10, 2)
  isPrivate            Boolean                        @default(false)
  largeNumber          BigInt?
  metadata             Json?
  secretNote           String?
  coverImage_id        String?
  coverImage_filesize  Int?
  coverImage_width     Int?
  coverImage_height    Int?
  coverImage_extension String?
  assignedTo           User?                          @relation("RetainedStarterTodo_assignedTo", fields: [assignedToId], references: [id])
  assignedToId         String?                        @map("assignedTo")
  imageLinks           RetainedStarterTodoImageLink[]

  @@index([assignedToId], map: "Todo_assignedTo_idx")
  @@map("Todo")
}

model RetainedStarterTodoImage {
  id              String                         @id @default(cuid())
  image_id        String?
  image_filesize  Int?
  image_width     Int?
  image_height    Int?
  image_extension String?
  imagePath       String                         @default("")
  altText         String                         @default("")
  metadata        Json?
  todoLinks       RetainedStarterTodoImageLink[]

  @@map("TodoImage")
}

model RetainedStarterTodoImageLink {
  todoId  String                   @map("A")
  imageId String                   @map("B")
  todo    RetainedStarterTodo      @relation(fields: [todoId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  image   RetainedStarterTodoImage @relation(fields: [imageId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@id([todoId, imageId], map: "_Todo_todoImages_AB_pkey")
  @@index([imageId], map: "_Todo_todoImages_B_index")
  @@map("_Todo_todoImages")
}
`;
function requireModelRelations(schema, model, fields) {
  const start = schema.indexOf(`model ${model} {`);
  if (start < 0) throw new Error(`Prisma contract model is missing: ${model}`);
  const end = schema.indexOf("\n}", start);
  if (end < 0) throw new Error(`Prisma contract model is malformed: ${model}`);
  const block = schema.slice(start, end).split("\n").map((line) => {
    const trimmed = line.trimStart();
    for (const field of fields) {
      if (trimmed.startsWith(`${field} `) && line.includes("?") && line.includes("@relation")) return line.replace("?", "");
      if (trimmed.startsWith(`${field}Id `) && line.includes("String?")) return line.replace("String?", "String");
    }
    return line;
  }).join("\n");
  return `${schema.slice(0, start)}${block}${schema.slice(end)}`;
}
function addToModel(schema, model, additions) {
  const start = schema.indexOf(`model ${model} {`);
  if (start < 0) throw new Error(`Prisma contract model is missing: ${model}`);
  const end = schema.indexOf("\n}", start);
  if (end < 0) throw new Error(`Prisma contract model is malformed: ${model}`);
  const missing = additions.filter((addition) => !schema.slice(start, end).includes(addition));
  if (!missing.length) return schema;
  return `${schema.slice(0, end)}

  ${missing.join("\n  ")}${schema.slice(end)}`;
}
function extendSportsbookPrismaSchema(input) {
  let schema = input;
  for (const [model, fields] of Object.entries(requiredRelations)) schema = requireModelRelations(schema, model, fields);
  for (const [model, attributes] of Object.entries(modelAttributes)) {
    schema = addToModel(schema, model, attributes);
  }
  schema = addToModel(schema, "User", [
    'retainedStarterTodos RetainedStarterTodo[] @relation("RetainedStarterTodo_assignedTo")'
  ]);
  if (!schema.includes("model RetainedStarterTodo {")) schema += retainedStarterModels;
  return schema;
}

// features/keystone/index.ts
var databaseURL = process.env.DATABASE_URL;
if (!databaseURL) throw new Error("DATABASE_URL is required");
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
var sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret
};
var baseSession = (0, import_session.statelessSessions)(sessionConfig);
var sessionStrategy = {
  ...baseSession,
  async start(args) {
    return baseSession.start({ ...args, data: { ...args.data, issuedAt: Date.now() } });
  },
  async get(args) {
    const session = await baseSession.get(args);
    if (!session?.itemId) return session;
    const user = await bootstrapOperatorIdentity(args.context.prisma, String(session.itemId));
    if (!user) return void 0;
    const resetAt = user.passwordResetRedeemedAt ? new Date(user.passwordResetRedeemedAt).getTime() : 0;
    if (resetAt && !(Number(session.issuedAt) > resetAt)) return void 0;
    return session;
  }
};
var { withAuth } = (0, import_auth4.createAuth)({
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
  `
});
var keystone_default = withAuth(
  (0, import_core7.config)({
    db: {
      provider: "postgresql",
      url: databaseURL,
      extendPrismaSchema: extendSportsbookPrismaSchema,
      extendPrismaClient: (client) => tenantScopedPrisma(client)
    },
    lists: models,
    ui: {
      isAccessAllowed: ({ session }) => session?.data.role?.canAccessDashboard ?? false
    },
    session: sessionStrategy,
    graphql: {
      extendGraphqlSchema
    }
  })
);

// keystone.ts
var keystone_default2 = keystone_default;
//# sourceMappingURL=config.js.map
