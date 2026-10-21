import { list } from '@keystone-6/core'
import { allOperations, denyAll } from '@keystone-6/core/access'
import { checkbox, integer, json, password, relationship, select, text, timestamp } from '@keystone-6/core/fields'

import { currentOperatorPermission, isSignedIn, permissions, rules } from '../access'
import { trackingFields } from './trackingFields'

export const userOwnershipAccess = { create: denyAll, update: denyAll }

export const User = list({
  access: {
    operation: {
      ...allOperations(isSignedIn),
      create: (args) => {
        // Allow public sign-ups if environment variable is set to true
        if (process.env.PUBLIC_SIGNUPS_ALLOWED === 'true') {
          return true;
        }
        // Otherwise, require canManagePeople permission
        return currentOperatorPermission('canManagePeople')(args);
      },
      delete: currentOperatorPermission('canManagePeople'),
    },
    filter: {
      query: rules.canReadPeople,
      update: rules.canUpdatePeople,
      delete: rules.canDeletePeople,
    },
  },
  ui: {
    hideCreate: args => !permissions.canManagePeople(args),
    hideDelete: args => !permissions.canManagePeople(args),
    listView: {
      initialColumns: ['name', 'email', 'role', 'tenant'],
    },
    itemView: {
      defaultFieldMode: ({ session, item }) => session?.data.role?.canEditOtherPeople || session?.itemId === item?.id ? 'edit' : 'read',
    },
  },
  fields: {
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    email: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true,
      },
    }),
    passwordResetToken: text({ defaultValue: null, db: { isNullable: true }, access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    passwordResetIssuedAt: timestamp({ access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    passwordResetRedeemedAt: timestamp({ access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    operatorMfaEnabled: checkbox({ defaultValue: false, access: { create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } } }),
    operatorMfaSecret: text({ defaultValue: null, db: { isNullable: true }, access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    operatorMfaRecoveryHashes: json({ access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    operatorMfaFailedAttempts: integer({ defaultValue: 0, access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    operatorMfaLockedUntil: timestamp({ access: { read: denyAll, create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } } }),
    operatorMfaEnrolledAt: timestamp({ access: { create: denyAll, update: denyAll }, ui: { createView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'read' } } }),
    password: password({
      access: {
        read: denyAll,
        update: async ({ session, item, context }) =>
          await currentOperatorPermission('canManagePeople')({ session, context }) || session?.itemId === item.id,
      },
      validation: { isRequired: true },
    }),
    tenant: relationship({
      ref: 'Tenant',
      access: userOwnershipAccess,
    }),
    ...trackingFields,
    onboardingStatus: select({
      options: [
        { label: 'Not Started', value: 'not_started' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
      defaultValue: 'not_started',
      access: { update: denyAll },
    }),
    role: relationship({
      ref: 'Role.assignedTo',
      access: userOwnershipAccess,
      ui: {
        itemView: {
          fieldMode: args => (permissions.canManagePeople(args) ? 'edit' : 'read'),
        },
      },
    }),
  },
});