/**
 * Prisma objects that Keystone's field-level schema printer cannot express.
 *
 * Keystone calls this transformer every time it generates schema.prisma, so
 * compound economic indexes and retained upgrade tables remain part of the
 * generated migration contract rather than hand-edited drift.
 */
const modelAttributes: Record<string, readonly string[]> = {
  Brand: [
    '@@unique([domain], map: "Brand_domain_uq")',
  ],
  BalanceProjection: [
    '@@unique([tenantId, accountId, version], map: "BalanceProjection_account_version_uq")',
  ],
  Hold: [
    '@@unique([tenantId, purposeType, purposeId], map: "Hold_tenant_purpose_key")',
  ],
  InboxMessage: [
    '@@unique([tenantId, messageKey], map: "InboxMessage_tenant_message_key")',
  ],
  JournalTransaction: [
    '@@unique([tenantId, idempotencyKey], map: "JournalTransaction_tenant_idempotency_key")',
    '@@unique([tenantId, reversalOfId], map: "JournalTransaction_tenant_reversal_uq")',
  ],
  OutboxMessage: [
    '@@index([status, availableAt, leaseUntil], map: "OutboxMessage_claim_idx")',
  ],
  PaymentIntent: [
    '@@unique([tenantId, idempotencyKey], map: "PaymentIntent_tenant_idempotency_key")',
  ],
  PriceSnapshot: [
    '@@index([selectionId, receivedAt(sort: Desc)], map: "PriceSnapshot_current_idx")',
    '@@unique([tenantId, selectionId, sequence], map: "PriceSnapshot_selection_sequence_uq")',
  ],
  ProviderEntityMapping: [
    '@@unique([tenantId, providerConnectionId, entityType, externalId], map: "ProviderEntityMapping_external_uq")',
  ],
  ResultVersion: [
    '@@unique([tenantId, eventId, version], map: "ResultVersion_event_version_uq")',
  ],
  Settlement: [
    '@@unique([tenantId, inputHash], map: "Settlement_tenant_input_uq")',
    '@@unique([tenantId, wagerId, version], map: "Settlement_wager_version_uq")',
    '@@unique([tenantId, reversalOfId], map: "Settlement_tenant_reversal_uq")',
  ],
  Wager: [
    '@@unique([tenantId, idempotencyKey], map: "Wager_tenant_idempotency_key")',
  ],
  WebhookReplay: [
    '@@unique([providerConnectionId, messageHash], map: "WebhookReplay_connection_hash_uq")',
  ],
  LegalEntity: [
    '@@unique([tenantId, countryCode, registrationReference], map: "LegalEntity_registration_uq")',
  ],
  TenantCurrency: [
    '@@unique([tenantId, currencyId], map: "TenantCurrency_currency_uq")',
  ],
  JurisdictionPolicyVersion: [
    '@@unique([tenantId, jurisdictionId, version], map: "JurisdictionPolicyVersion_scope_version_uq")',
  ],
  HouseRuleVersion: [
    '@@unique([tenantId, name, version], map: "HouseRuleVersion_name_version_uq")',
  ],
  FeatureFlag: [
    '@@unique([tenantId, key, scopeType, scopeId], map: "FeatureFlag_scope_uq")',
  ],
  ConfigDefinition: [
    '@@unique([tenantId, key], map: "ConfigDefinition_key_uq")',
  ],
  BrandLocale: [
    '@@unique([tenantId, brandId, locale, termsVersion], map: "BrandLocale_terms_uq")',
  ],
  OperatorChannel: [
    '@@unique([tenantId, key], map: "OperatorChannel_key_uq")',
  ],
  Region: [
    '@@unique([tenantId, key], map: "Region_key_uq")',
  ],
  Season: [
    '@@unique([tenantId, competitionId, key], map: "Season_competition_key_uq")',
  ],
  CompetitionStage: [
    '@@unique([tenantId, seasonId, key], map: "CompetitionStage_season_key_uq")',
  ],
  Venue: [
    '@@unique([tenantId, key], map: "Venue_key_uq")',
  ],
  MarketDefinition: [
    '@@unique([tenantId, key, version], map: "MarketDefinition_key_version_uq")',
  ],
  CorrelationGroup: [
    '@@unique([tenantId, key, version], map: "CorrelationGroup_key_version_uq")',
  ],
  WagerPart: [
    '@@unique([tenantId, wagerId, partIndex], map: "WagerPart_wager_index_uq")',
  ],
  WagerExposureAllocation: [
    '@@unique([tenantId, wagerId, marketId], map: "WagerExposureAllocation_wager_market_uq")',
  ],
  SettlementRun: [
    '@@unique([tenantId, inputHash], map: "SettlementRun_input_uq")',
  ],
  CashOutAcceptance: [
    '@@unique([tenantId, idempotencyKey], map: "CashOutAcceptance_idempotency_uq")',
  ],
  Promotion: [
    '@@unique([tenantId, key], map: "Promotion_key_uq")',
  ],
  PromotionRuleVersion: [
    '@@unique([tenantId, promotionId, version], map: "PromotionRuleVersion_promotion_version_uq")',
  ],
  BonusAward: [
    '@@unique([tenantId, idempotencyKey], map: "BonusAward_idempotency_uq")',
  ],
  BonusTransaction: [
    '@@unique([tenantId, idempotencyKey], map: "BonusTransaction_idempotency_uq")',
  ],
  PromotionRedemption: [
    '@@unique([tenantId, playerId, promotionId, idempotencyKey], map: "PromotionRedemption_player_key_uq")',
  ],
  CustomerFavorite: [
    '@@unique([tenantId, playerId, targetType, targetId], map: "CustomerFavorite_target_uq")',
  ],
  CustomerQuoteLegTerms: [
    '@@unique([quoteKey, legIndex], map: "CustomerQuoteLegTerms_quote_index_uq")',
  ],
  ScreeningHit: [
    '@@unique([tenantId, providerConnectionId, screeningType, matchToken], map: "ScreeningHit_provider_match_uq")',
  ],
  ScheduledJob: [    '@@unique([tenantId, idempotencyKey], map: "ScheduledJob_idempotency_uq")',
    '@@index([status, dueAt, leaseUntil], map: "ScheduledJob_claim_idx")',
  ],
  AffiliateAttribution: [
    '@@unique([tenantId, playerId, campaignReference], map: "AffiliateAttribution_campaign_uq")',
  ],
  PamSubjectMapping: [
    '@@unique([tenantId, providerConnectionId, externalSubjectDigest], map: "PamSubjectMapping_subject_uq")',
  ],
  WebhookEndpoint: [
    '@@unique([tenantId, url], map: "WebhookEndpoint_url_uq")',
  ],
  WebhookDelivery: [
    '@@unique([tenantId, deliveryId], map: "WebhookDelivery_delivery_uq")',
    '@@index([status, availableAt], map: "WebhookDelivery_claim_idx")',
  ],
  IntegrationDeliveryAttempt: [
    '@@unique([tenantId, deliveryId, attempt], map: "IntegrationDeliveryAttempt_number_uq")',
  ],
}

const fullTenantModels = [
  'AccessReview','AccountClosure','AdapterCertificationRun','AffiliateAttribution','AffordabilityAssessment',
  'BonusAward','BonusTransaction','BrandLocale','CampaignBudget','CashOutAcceptance','CompetitionStage',
  'ConfigDefinition','CorrelationGroup','CorrelationRule','CustomerCredential','CustomerDevice','CustomerFavorite',
  'CustomerPrivacyRequest','CustomerQuoteLegTerms','CustomerRecoveryToken','DataExport','EventScheduleChange',
  'FeatureFlag','FeedHealthSnapshot','HouseRuleVersion','IntegrityCase','JurisdictionPolicyVersion','LegalEntity',
  'LedgerAdjustmentRequest','MarketDefinition','Notification','OperatorChannel','PamSubjectMapping','PlayerStatement',
  'Promotion','PromotionRedemption','PromotionRuleVersion','ProviderHealthSample','Region','ReportArtifact',
  'RetentionExecution','RetentionPolicyVersion','SafeguardingAccount','SafeguardingReconciliation','ScheduledJob',
  'Season','SettlementLine','SettlementRun','SupportCase','SupportCaseEvent','TaxRuleVersion','TenantCurrency',
  'TraderOverride','TradingReplayRun','Venue','WagerPart','WagerExposureAllocation','ScreeningHit','WebhookEndpoint','WebhookDelivery','IntegrationDeliveryAttempt',
] as const

const requiredRelations: Record<string, readonly string[]> = Object.fromEntries(fullTenantModels.map(model => [model, ['tenant']]))
Object.assign(requiredRelations, {
  CustomerCredential: ['tenant', 'player'], CustomerDevice: ['tenant', 'player'], CustomerFavorite: ['tenant', 'player'],
  CustomerQuoteLegTerms: ['tenant', 'player', 'quote'], CustomerRecoveryToken: ['tenant', 'player'],
  WagerPart: ['tenant', 'wager'], WagerExposureAllocation: ['tenant', 'wager', 'market'], SettlementRun: ['tenant', 'resultVersion'], SettlementLine: ['tenant', 'settlement'],
  CashOutAcceptance: ['tenant', 'offer', 'wager', 'player', 'journalTransaction'],
  PromotionRuleVersion: ['tenant', 'promotion'], CampaignBudget: ['tenant', 'promotion'],
  BonusAward: ['tenant', 'promotion', 'ruleVersion', 'player'], BonusTransaction: ['tenant', 'award'],
  PromotionRedemption: ['tenant', 'promotion', 'ruleVersion', 'player'],
  SafeguardingReconciliation: ['tenant', 'safeguardingAccount'],
  LedgerAdjustmentRequest: ['tenant', 'account', 'approvalRequest'],
  SupportCase: ['tenant', 'player'], SupportCaseEvent: ['tenant', 'supportCase'], ScreeningHit: ['tenant', 'amlCase', 'providerConnection'],
  WebhookDelivery: ['tenant', 'endpoint'], IntegrationDeliveryAttempt: ['tenant', 'delivery'],
})

const retainedStarterModels = String.raw`
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
`

function requireModelRelations(schema: string, model: string, fields: readonly string[]) {
  const start = schema.indexOf(`model ${model} {`)
  if (start < 0) throw new Error(`Prisma contract model is missing: ${model}`)
  const end = schema.indexOf('\n}', start)
  if (end < 0) throw new Error(`Prisma contract model is malformed: ${model}`)
  const block = schema.slice(start, end).split('\n').map(line => {
    const trimmed = line.trimStart()
    for (const field of fields) {
      if (trimmed.startsWith(`${field} `) && line.includes('?') && line.includes('@relation')) return line.replace('?', '')
      if (trimmed.startsWith(`${field}Id `) && line.includes('String?')) return line.replace('String?', 'String')
    }
    return line
  }).join('\n')
  return `${schema.slice(0, start)}${block}${schema.slice(end)}`
}

function addToModel(schema: string, model: string, additions: readonly string[]) {
  const start = schema.indexOf(`model ${model} {`)
  if (start < 0) throw new Error(`Prisma contract model is missing: ${model}`)
  const end = schema.indexOf('\n}', start)
  if (end < 0) throw new Error(`Prisma contract model is malformed: ${model}`)
  const missing = additions.filter(addition => !schema.slice(start, end).includes(addition))
  if (!missing.length) return schema
  return `${schema.slice(0, end)}\n\n  ${missing.join('\n  ')}${schema.slice(end)}`
}

export function extendSportsbookPrismaSchema(input: string) {
  let schema = input
  for (const [model, fields] of Object.entries(requiredRelations)) schema = requireModelRelations(schema, model, fields)
  for (const [model, attributes] of Object.entries(modelAttributes)) {
    schema = addToModel(schema, model, attributes)
  }
  schema = addToModel(schema, 'User', [
    'retainedStarterTodos RetainedStarterTodo[] @relation("RetainedStarterTodo_assignedTo")',
  ])
  if (!schema.includes('model RetainedStarterTodo {')) schema += retainedStarterModels
  return schema
}

export const prismaContractModelAttributes = modelAttributes
export const retainedStarterTableNames = ['Todo', 'TodoImage', '_Todo_todoImages'] as const
