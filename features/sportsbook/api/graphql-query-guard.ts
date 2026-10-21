import { parse, type DocumentNode, type FragmentDefinitionNode, type OperationDefinitionNode, type SelectionNode, type SelectionSetNode } from 'graphql'

export const MAX_GRAPHQL_QUERY_LENGTH = 100_000
export const MAX_GRAPHQL_QUERY_DEPTH = 12
export const MAX_GRAPHQL_QUERY_ALIASES = 100
const MAX_GRAPHQL_QUERY_TOKENS = 30_000
const MAX_GRAPHQL_SELECTION_VISITS = 20_000
const MAX_GRAPHQL_EXPANDED_SELECTIONS = 20_000
const MAX_OPERATION_NAME_LENGTH = 256

type GraphqlQueryGuardErrorCode = 'INVALID_QUERY' | 'QUERY_EXCEEDS_LIMITS'

export class GraphqlQueryGuardError extends Error {
  constructor(readonly code: GraphqlQueryGuardErrorCode) {
    super(code)
    this.name = 'GraphqlQueryGuardError'
  }
}

type GraphqlRequestLike = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  body?: unknown
}

type QueryShape = {
  operationName: string | null
  depth: number
  aliases: number
  expandedSelections: number
}

function rejectInvalidQuery(): never {
  throw new GraphqlQueryGuardError('INVALID_QUERY')
}

function rejectQueryLimit(): never {
  throw new GraphqlQueryGuardError('QUERY_EXCEEDS_LIMITS')
}

function collectFragmentSpreads(selectionSet: SelectionSetNode, visitBudget: { count: number }): string[] {
  const spreads: string[] = []
  const pending = [...selectionSet.selections]

  while (pending.length) {
    const selection = pending.pop()!
    visitBudget.count++
    if (visitBudget.count > MAX_GRAPHQL_SELECTION_VISITS) rejectQueryLimit()

    if (selection.kind === 'FragmentSpread') {
      spreads.push(selection.name.value)
    } else if (selection.kind === 'InlineFragment') {
      pending.push(...selection.selectionSet.selections)
    } else if (selection.selectionSet) {
      pending.push(...selection.selectionSet.selections)
    }
  }

  return spreads
}

function validateFragmentGraph(
  operations: OperationDefinitionNode[],
  fragments: Map<string, FragmentDefinitionNode>,
  dependencies: Map<string, string[]>,
) {
  const visitBudget = { count: 0 }
  for (const operation of operations) {
    for (const name of collectFragmentSpreads(operation.selectionSet, visitBudget)) {
      if (!fragments.has(name)) rejectInvalidQuery()
    }
  }

  for (const [name, fragment] of fragments) {
    const spreads = collectFragmentSpreads(fragment.selectionSet, visitBudget)
    if (spreads.some(spread => !fragments.has(spread))) rejectInvalidQuery()
    dependencies.set(name, spreads)
  }

  const state = new Map<string, 'ACTIVE' | 'DONE'>()
  for (const name of fragments.keys()) {
    if (state.has(name)) continue
    state.set(name, 'ACTIVE')
    const pending: Array<{ name: string; nextDependency: number }> = [{ name, nextDependency: 0 }]

    while (pending.length) {
      const current = pending[pending.length - 1]
      const children = dependencies.get(current.name) ?? []
      if (current.nextDependency >= children.length) {
        state.set(current.name, 'DONE')
        pending.pop()
        continue
      }

      const child = children[current.nextDependency++]
      const childState = state.get(child)
      if (childState === 'ACTIVE') rejectInvalidQuery()
      if (childState === 'DONE') continue
      state.set(child, 'ACTIVE')
      pending.push({ name: child, nextDependency: 0 })
    }
  }
}

function selectedOperation(operations: OperationDefinitionNode[], operationName: unknown): OperationDefinitionNode {
  if (!operations.length) rejectInvalidQuery()

  const nameCounts = new Map<string, number>()
  for (const operation of operations) {
    if (operation.name) nameCounts.set(operation.name.value, (nameCounts.get(operation.name.value) ?? 0) + 1)
  }
  if ([...nameCounts.values()].some(count => count > 1)) rejectInvalidQuery()
  if (operations.length > 1 && operations.some(operation => !operation.name)) rejectInvalidQuery()

  if (operationName !== undefined) {
    if (typeof operationName !== 'string' || !operationName || operationName.length > MAX_OPERATION_NAME_LENGTH) rejectInvalidQuery()
    const matching = operations.filter(operation => operation.name?.value === operationName)
    if (matching.length !== 1) rejectInvalidQuery()
    return matching[0]
  }

  if (operations.length !== 1) rejectInvalidQuery()
  return operations[0]
}

function analyzeQuery(query: unknown, operationName: unknown): QueryShape {
  if (typeof query !== 'string' || !query.trim() || query.length > MAX_GRAPHQL_QUERY_LENGTH) rejectInvalidQuery()
  if (operationName !== undefined && (typeof operationName !== 'string' || !operationName || operationName.length > MAX_OPERATION_NAME_LENGTH)) rejectInvalidQuery()

  let document: DocumentNode
  try {
    document = parse(query, { noLocation: true, maxTokens: MAX_GRAPHQL_QUERY_TOKENS })
  } catch {
    rejectInvalidQuery()
  }

  const operations: OperationDefinitionNode[] = []
  const fragments = new Map<string, FragmentDefinitionNode>()
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition') {
      operations.push(definition)
    } else if (definition.kind === 'FragmentDefinition') {
      const name = definition.name.value
      if (fragments.has(name)) rejectInvalidQuery()
      fragments.set(name, definition)
    } else {
      // The HTTP endpoint accepts executable documents, not schema definitions.
      rejectInvalidQuery()
    }
  }

  const selected = selectedOperation(operations, operationName)
  const dependencies = new Map<string, string[]>()
  validateFragmentGraph(operations, fragments, dependencies)

  let aliases = 0
  let depth = 0
  let expandedSelections = 0
  const pending: Array<{ selection: SelectionNode; depth: number }> = selected.selectionSet.selections
    .slice()
    .reverse()
    .map(selection => ({ selection, depth: 0 }))

  while (pending.length) {
    const { selection, depth: parentDepth } = pending.pop()!
    expandedSelections++
    if (expandedSelections > MAX_GRAPHQL_EXPANDED_SELECTIONS) rejectQueryLimit()

    if (selection.kind === 'Field') {
      const fieldDepth = parentDepth + 1
      if (fieldDepth > MAX_GRAPHQL_QUERY_DEPTH) rejectQueryLimit()
      depth = Math.max(depth, fieldDepth)
      if (selection.alias) {
        aliases++
        if (aliases > MAX_GRAPHQL_QUERY_ALIASES) rejectQueryLimit()
      }
      if (selection.selectionSet) {
        for (let index = selection.selectionSet.selections.length - 1; index >= 0; index--) {
          pending.push({ selection: selection.selectionSet.selections[index], depth: fieldDepth })
        }
      }
    } else if (selection.kind === 'InlineFragment') {
      for (let index = selection.selectionSet.selections.length - 1; index >= 0; index--) {
        pending.push({ selection: selection.selectionSet.selections[index], depth: parentDepth })
      }
    } else {
      const fragment = fragments.get(selection.name.value)
      if (!fragment) rejectInvalidQuery()
      for (let index = fragment.selectionSet.selections.length - 1; index >= 0; index--) {
        pending.push({ selection: fragment.selectionSet.selections[index], depth: parentDepth })
      }
    }
  }

  return { operationName: selected.name?.value ?? null, depth, aliases, expandedSelections }
}

/** Apply the same bounded operation policy to the GET URL parameters and POST body. */
export function validateGraphqlRequestShape(request: GraphqlRequestLike): QueryShape {
  if (request.method !== 'GET' && request.method !== 'POST') rejectInvalidQuery()

  const parameters = request.method === 'GET'
    ? request.query
    : request.body && typeof request.body === 'object' && !Array.isArray(request.body)
      ? request.body as Record<string, unknown>
      : undefined
  if (!parameters) rejectInvalidQuery()

  const input = parameters as Record<string, unknown>
  return analyzeQuery(input.query, input.operationName)
}
