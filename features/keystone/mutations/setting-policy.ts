/**
 * Approved configuration changes are normalized against the tenant's declared
 * ConfigDefinition (type, allowed scope, secrecy) before they are requested and
 * again when applied, so an approval never makes an undeclared or malformed
 * policy value effective.
 */
export async function normalizeTenantSetting(tx: any, tenantId: string, key: string, raw: string) {
  const definition = await tx.configDefinition.findFirst({ where: { tenantId, key } })
  if (!definition) throw new Error('SETTING_NOT_DEFINED')
  if (definition.secret) throw new Error('SECRET_SETTING_NOT_SUPPORTED')
  const scopes = Array.isArray(definition.allowedScopes) ? definition.allowedScopes.map(String) : []
  if (!scopes.includes('TENANT')) throw new Error('SETTING_SCOPE_NOT_ALLOWED')
  const text = String(raw ?? '').trim()
  let value: unknown
  switch (definition.valueType) {
    case 'MONEY':
      if (!/^\d+$/.test(text)) throw new Error('INVALID_SETTING_VALUE')
      value = text
      break
    case 'INTEGER':
      if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(Number(text))) throw new Error('INVALID_SETTING_VALUE')
      value = Number(text)
      break
    case 'BOOLEAN':
      if (text !== 'true' && text !== 'false') throw new Error('INVALID_SETTING_VALUE')
      value = text === 'true'
      break
    case 'JSON':
      try { value = JSON.parse(text) } catch { throw new Error('INVALID_SETTING_VALUE') }
      if (!value || typeof value !== 'object') throw new Error('INVALID_SETTING_VALUE')
      break
    case 'STRING':
      if (!text) throw new Error('INVALID_SETTING_VALUE')
      value = text
      break
    default:
      throw new Error('SETTING_TYPE_UNSUPPORTED')
  }
  return { definition, value, valueType: String(definition.valueType) }
}
