import { list } from '@keystone-6/core'
import { denyAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'

import { isSignedIn } from '../access'
import { trackingFields } from './trackingFields'

export const Role = list({
  access: {
    operation: { query: isSignedIn, create: denyAll, update: denyAll, delete: denyAll },
    filter: { query: ({session}:any)=>session?.data.tenant?.id?{OR:[{tenant:{id:{equals:session.data.tenant.id}}},{assignedTo:{some:{id:{equals:session.itemId}}}}]}:{assignedTo:{some:{id:{equals:session?.itemId??''}}}} },
  },
  ui: {
    hideCreate: true,
    hideDelete: true,
    listView: {
      initialColumns: ['name', 'assignedTo'],
    },
    itemView: { defaultFieldMode: 'read' },
  },
  fields: {
    tenant: relationship({ref:'Tenant',access:{create:denyAll,update:denyAll}}),
    name: text({ validation: { isRequired: true } }),
    canSeeOtherPeople: checkbox({ defaultValue: false }),
    canEditOtherPeople: checkbox({ defaultValue: false }),
    canManagePeople: checkbox({ defaultValue: false }),
    canManageRoles: checkbox({ defaultValue: false }),
    canAccessDashboard: checkbox({ defaultValue: false }),
    canManageOnboarding: checkbox({ defaultValue: false }),
    canManageSportsbook: checkbox({ defaultValue: false }),
    canTrade: checkbox({ defaultValue: false }),
    canManageRisk: checkbox({ defaultValue: false }),
    canManageCompliance: checkbox({ defaultValue: false }),
    canManageFinance: checkbox({ defaultValue: false }),
    canManageIntegrations: checkbox({ defaultValue: false }),
    canApproveSensitiveActions: checkbox({ defaultValue: false }),
    canReadAudit: checkbox({ defaultValue: false }),
    ...trackingFields,
    assignedTo: relationship({
      ref: 'User.role',
      many: true,
      ui: {
        itemView: { fieldMode: 'read' },
      },
    }),
  },
});