import type { KeystoneContext } from '@keystone-6/core/types'

import { sportsbookFullResolvers } from './sportsbook-full'

const graphql = String.raw

/**
 * The shared core InitPage calls Keystone's `createInitialUser` contract, then signs
 * the new user in. Sportsbook's first operator is created only by
 * `bootstrapOperatorAdmin` (advisory lock, input validation, the Admin role), so this
 * resolver runs that same path and answers in the core's shape.
 */
export const createInitialUserTypeDefs = graphql`
  input CreateInitialUserInput {
    name: String
    email: String
    password: String
  }

  type Mutation {
    createInitialUser(data: CreateInitialUserInput!): UserAuthenticationWithPasswordSuccess!
  }
`

type CreateInitialUserArgs = { data: { name?: string | null; email?: string | null; password?: string | null } }

export async function createInitialUser(root: unknown, { data }: CreateInitialUserArgs, context: KeystoneContext) {
  const itemId: string = await sportsbookFullResolvers.Mutation.bootstrapOperatorAdmin(root, {
    name: data.name ?? '',
    email: data.email ?? '',
    password: data.password ?? '',
  }, context)
  const sessionToken = await context.sessionStrategy?.start({ data: { listKey: 'User', itemId }, context })
  if (typeof sessionToken !== 'string' || !sessionToken) throw new Error('Failed to start session')
  const item = await context.sudo().db.User.findOne({ where: { id: itemId } })
  return { sessionToken, item }
}
