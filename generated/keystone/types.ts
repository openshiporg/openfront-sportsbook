/* eslint-disable */

export type UserWhereUniqueInput = {
  readonly id?: string | null
  readonly email?: string | null
}

export type UserWhereInput = {
  readonly AND?: ReadonlyArray<UserWhereInput> | UserWhereInput | null
  readonly OR?: ReadonlyArray<UserWhereInput> | UserWhereInput | null
  readonly NOT?: ReadonlyArray<UserWhereInput> | UserWhereInput | null
  readonly id?: IDFilter | null
  readonly name?: StringFilter | null
  readonly email?: StringFilter | null
  readonly passwordResetToken?: StringNullableFilter | null
  readonly passwordResetIssuedAt?: DateTimeNullableFilter | null
  readonly passwordResetRedeemedAt?: DateTimeNullableFilter | null
  readonly operatorMfaEnabled?: BooleanFilter | null
  readonly operatorMfaSecret?: StringNullableFilter | null
  readonly operatorMfaFailedAttempts?: IntNullableFilter | null
  readonly operatorMfaLockedUntil?: DateTimeNullableFilter | null
  readonly operatorMfaEnrolledAt?: DateTimeNullableFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
  readonly onboardingStatus?: StringNullableFilter | null
  readonly role?: RoleWhereInput | null
}

export type IDFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly not?: IDFilter | null
}

export type StringFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly contains?: string | null
  readonly startsWith?: string | null
  readonly endsWith?: string | null
  readonly mode?: QueryMode | null
  readonly not?: NestedStringFilter | null
}

export type QueryMode =
  | 'default'
  | 'insensitive'

export type NestedStringFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly contains?: string | null
  readonly startsWith?: string | null
  readonly endsWith?: string | null
  readonly not?: NestedStringFilter | null
}

export type StringNullableFilter = {
  readonly equals?: string | null
  readonly in?: ReadonlyArray<string> | string | null
  readonly notIn?: ReadonlyArray<string> | string | null
  readonly lt?: string | null
  readonly lte?: string | null
  readonly gt?: string | null
  readonly gte?: string | null
  readonly contains?: string | null
  readonly startsWith?: string | null
  readonly endsWith?: string | null
  readonly mode?: QueryMode | null
  readonly not?: StringNullableFilter | null
}

export type DateTimeNullableFilter = {
  readonly equals?: any | null
  readonly in?: ReadonlyArray<any> | any | null
  readonly notIn?: ReadonlyArray<any> | any | null
  readonly lt?: any | null
  readonly lte?: any | null
  readonly gt?: any | null
  readonly gte?: any | null
  readonly not?: DateTimeNullableFilter | null
}

export type BooleanFilter = {
  readonly equals?: boolean | null
  readonly not?: BooleanFilter | null
}

export type IntNullableFilter = {
  readonly equals?: number | null
  readonly in?: ReadonlyArray<number> | number | null
  readonly notIn?: ReadonlyArray<number> | number | null
  readonly lt?: number | null
  readonly lte?: number | null
  readonly gt?: number | null
  readonly gte?: number | null
  readonly not?: IntNullableFilter | null
}

export type DateTimeFilter = {
  readonly equals?: any | null
  readonly in?: ReadonlyArray<any> | any | null
  readonly notIn?: ReadonlyArray<any> | any | null
  readonly lt?: any | null
  readonly lte?: any | null
  readonly gt?: any | null
  readonly gte?: any | null
  readonly not?: DateTimeFilter | null
}

export type UserOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly email?: OrderDirection | null
  readonly passwordResetToken?: OrderDirection | null
  readonly passwordResetIssuedAt?: OrderDirection | null
  readonly passwordResetRedeemedAt?: OrderDirection | null
  readonly operatorMfaEnabled?: OrderDirection | null
  readonly operatorMfaSecret?: OrderDirection | null
  readonly operatorMfaFailedAttempts?: OrderDirection | null
  readonly operatorMfaLockedUntil?: OrderDirection | null
  readonly operatorMfaEnrolledAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
  readonly onboardingStatus?: OrderDirection | null
}

export type OrderDirection =
  | 'asc'
  | 'desc'

export type UserUpdateInput = {
  readonly name?: string | null
  readonly email?: string | null
  readonly passwordResetToken?: string | null
  readonly passwordResetIssuedAt?: any | null
  readonly passwordResetRedeemedAt?: any | null
  readonly operatorMfaEnabled?: boolean | null
  readonly operatorMfaSecret?: string | null
  readonly operatorMfaRecoveryHashes?: import('@keystone-6/core/types').JSONValue | null
  readonly operatorMfaFailedAttempts?: number | null
  readonly operatorMfaLockedUntil?: any | null
  readonly operatorMfaEnrolledAt?: any | null
  readonly password?: string | null
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
  readonly onboardingStatus?: string | null
  readonly role?: RoleRelateToOneForUpdateInput | null
}

export type TenantRelateToOneForUpdateInput = {
  readonly create?: TenantCreateInput | null
  readonly connect?: TenantWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type RoleRelateToOneForUpdateInput = {
  readonly create?: RoleCreateInput | null
  readonly connect?: RoleWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type UserUpdateArgs = {
  readonly where: UserWhereUniqueInput
  readonly data: UserUpdateInput
}

export type UserCreateInput = {
  readonly name?: string | null
  readonly email?: string | null
  readonly passwordResetToken?: string | null
  readonly passwordResetIssuedAt?: any | null
  readonly passwordResetRedeemedAt?: any | null
  readonly operatorMfaEnabled?: boolean | null
  readonly operatorMfaSecret?: string | null
  readonly operatorMfaRecoveryHashes?: import('@keystone-6/core/types').JSONValue | null
  readonly operatorMfaFailedAttempts?: number | null
  readonly operatorMfaLockedUntil?: any | null
  readonly operatorMfaEnrolledAt?: any | null
  readonly password?: string | null
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
  readonly onboardingStatus?: string | null
  readonly role?: RoleRelateToOneForCreateInput | null
}

export type TenantRelateToOneForCreateInput = {
  readonly create?: TenantCreateInput | null
  readonly connect?: TenantWhereUniqueInput | null
}

export type RoleRelateToOneForCreateInput = {
  readonly create?: RoleCreateInput | null
  readonly connect?: RoleWhereUniqueInput | null
}

export type RoleWhereUniqueInput = {
  readonly id?: string | null
}

export type RoleWhereInput = {
  readonly AND?: ReadonlyArray<RoleWhereInput> | RoleWhereInput | null
  readonly OR?: ReadonlyArray<RoleWhereInput> | RoleWhereInput | null
  readonly NOT?: ReadonlyArray<RoleWhereInput> | RoleWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly canSeeOtherPeople?: BooleanFilter | null
  readonly canEditOtherPeople?: BooleanFilter | null
  readonly canManagePeople?: BooleanFilter | null
  readonly canManageRoles?: BooleanFilter | null
  readonly canAccessDashboard?: BooleanFilter | null
  readonly canManageSportsbook?: BooleanFilter | null
  readonly canTrade?: BooleanFilter | null
  readonly canManageRisk?: BooleanFilter | null
  readonly canManageCompliance?: BooleanFilter | null
  readonly canManageFinance?: BooleanFilter | null
  readonly canManageIntegrations?: BooleanFilter | null
  readonly canApproveSensitiveActions?: BooleanFilter | null
  readonly canReadAudit?: BooleanFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
  readonly assignedTo?: UserManyRelationFilter | null
}

export type UserManyRelationFilter = {
  readonly every?: UserWhereInput | null
  readonly some?: UserWhereInput | null
  readonly none?: UserWhereInput | null
}

export type RoleOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly canSeeOtherPeople?: OrderDirection | null
  readonly canEditOtherPeople?: OrderDirection | null
  readonly canManagePeople?: OrderDirection | null
  readonly canManageRoles?: OrderDirection | null
  readonly canAccessDashboard?: OrderDirection | null
  readonly canManageSportsbook?: OrderDirection | null
  readonly canTrade?: OrderDirection | null
  readonly canManageRisk?: OrderDirection | null
  readonly canManageCompliance?: OrderDirection | null
  readonly canManageFinance?: OrderDirection | null
  readonly canManageIntegrations?: OrderDirection | null
  readonly canApproveSensitiveActions?: OrderDirection | null
  readonly canReadAudit?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RoleUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly canSeeOtherPeople?: boolean | null
  readonly canEditOtherPeople?: boolean | null
  readonly canManagePeople?: boolean | null
  readonly canManageRoles?: boolean | null
  readonly canAccessDashboard?: boolean | null
  readonly canManageSportsbook?: boolean | null
  readonly canTrade?: boolean | null
  readonly canManageRisk?: boolean | null
  readonly canManageCompliance?: boolean | null
  readonly canManageFinance?: boolean | null
  readonly canManageIntegrations?: boolean | null
  readonly canApproveSensitiveActions?: boolean | null
  readonly canReadAudit?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
  readonly assignedTo?: UserRelateToManyForUpdateInput | null
}

export type UserRelateToManyForUpdateInput = {
  readonly disconnect?: ReadonlyArray<UserWhereUniqueInput> | UserWhereUniqueInput | null
  readonly set?: ReadonlyArray<UserWhereUniqueInput> | UserWhereUniqueInput | null
  readonly create?: ReadonlyArray<UserCreateInput> | UserCreateInput | null
  readonly connect?: ReadonlyArray<UserWhereUniqueInput> | UserWhereUniqueInput | null
}

export type RoleUpdateArgs = {
  readonly where: RoleWhereUniqueInput
  readonly data: RoleUpdateInput
}

export type RoleCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly canSeeOtherPeople?: boolean | null
  readonly canEditOtherPeople?: boolean | null
  readonly canManagePeople?: boolean | null
  readonly canManageRoles?: boolean | null
  readonly canAccessDashboard?: boolean | null
  readonly canManageSportsbook?: boolean | null
  readonly canTrade?: boolean | null
  readonly canManageRisk?: boolean | null
  readonly canManageCompliance?: boolean | null
  readonly canManageFinance?: boolean | null
  readonly canManageIntegrations?: boolean | null
  readonly canApproveSensitiveActions?: boolean | null
  readonly canReadAudit?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
  readonly assignedTo?: UserRelateToManyForCreateInput | null
}

export type UserRelateToManyForCreateInput = {
  readonly create?: ReadonlyArray<UserCreateInput> | UserCreateInput | null
  readonly connect?: ReadonlyArray<UserWhereUniqueInput> | UserWhereUniqueInput | null
  readonly set?: ReadonlyArray<UserWhereUniqueInput> | UserWhereUniqueInput | null
}

export type AcceptanceDecisionWhereUniqueInput = {
  readonly id?: string | null
}

export type AcceptanceDecisionWhereInput = {
  readonly AND?: ReadonlyArray<AcceptanceDecisionWhereInput> | AcceptanceDecisionWhereInput | null
  readonly OR?: ReadonlyArray<AcceptanceDecisionWhereInput> | AcceptanceDecisionWhereInput | null
  readonly NOT?: ReadonlyArray<AcceptanceDecisionWhereInput> | AcceptanceDecisionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly quote?: QuoteWhereInput | null
  readonly accepted?: BooleanFilter | null
  readonly rejectionCode?: StringFilter | null
  readonly inputHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AcceptanceDecisionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly accepted?: OrderDirection | null
  readonly rejectionCode?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AcceptanceDecisionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly quote?: QuoteRelateToOneForUpdateInput | null
  readonly accepted?: boolean | null
  readonly rejectionCode?: string | null
  readonly gateResults?: import('@keystone-6/core/types').JSONValue | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerRelateToOneForUpdateInput = {
  readonly create?: WagerCreateInput | null
  readonly connect?: WagerWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type QuoteRelateToOneForUpdateInput = {
  readonly create?: QuoteCreateInput | null
  readonly connect?: QuoteWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type AcceptanceDecisionUpdateArgs = {
  readonly where: AcceptanceDecisionWhereUniqueInput
  readonly data: AcceptanceDecisionUpdateInput
}

export type AcceptanceDecisionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly quote?: QuoteRelateToOneForCreateInput | null
  readonly accepted?: boolean | null
  readonly rejectionCode?: string | null
  readonly gateResults?: import('@keystone-6/core/types').JSONValue | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerRelateToOneForCreateInput = {
  readonly create?: WagerCreateInput | null
  readonly connect?: WagerWhereUniqueInput | null
}

export type QuoteRelateToOneForCreateInput = {
  readonly create?: QuoteCreateInput | null
  readonly connect?: QuoteWhereUniqueInput | null
}

export type AuditEventWhereUniqueInput = {
  readonly id?: string | null
}

export type AuditEventWhereInput = {
  readonly AND?: ReadonlyArray<AuditEventWhereInput> | AuditEventWhereInput | null
  readonly OR?: ReadonlyArray<AuditEventWhereInput> | AuditEventWhereInput | null
  readonly NOT?: ReadonlyArray<AuditEventWhereInput> | AuditEventWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly actorId?: StringFilter | null
  readonly action?: StringFilter | null
  readonly targetType?: StringFilter | null
  readonly targetId?: StringFilter | null
  readonly reason?: StringFilter | null
  readonly payloadHash?: StringFilter | null
  readonly previousHash?: StringFilter | null
  readonly hash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AuditEventOrderByInput = {
  readonly id?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly action?: OrderDirection | null
  readonly targetType?: OrderDirection | null
  readonly targetId?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly payloadHash?: OrderDirection | null
  readonly previousHash?: OrderDirection | null
  readonly hash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AuditEventUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly actorId?: string | null
  readonly action?: string | null
  readonly targetType?: string | null
  readonly targetId?: string | null
  readonly reason?: string | null
  readonly payloadHash?: string | null
  readonly previousHash?: string | null
  readonly hash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AuditEventUpdateArgs = {
  readonly where: AuditEventWhereUniqueInput
  readonly data: AuditEventUpdateInput
}

export type AuditEventCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly actorId?: string | null
  readonly action?: string | null
  readonly targetType?: string | null
  readonly targetId?: string | null
  readonly reason?: string | null
  readonly payloadHash?: string | null
  readonly previousHash?: string | null
  readonly hash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type BrandWhereUniqueInput = {
  readonly id?: string | null
}

export type BrandWhereInput = {
  readonly AND?: ReadonlyArray<BrandWhereInput> | BrandWhereInput | null
  readonly OR?: ReadonlyArray<BrandWhereInput> | BrandWhereInput | null
  readonly NOT?: ReadonlyArray<BrandWhereInput> | BrandWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly domain?: StringFilter | null
  readonly defaultLocale?: StringFilter | null
  readonly defaultTimezone?: StringFilter | null
  readonly termsReference?: StringFilter | null
  readonly logoIcon?: StringFilter | null
  readonly logoColor?: StringFilter | null
  readonly status?: BrandStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BrandStatusTypeNullableFilter = {
  readonly equals?: BrandStatusType | null
  readonly in?: ReadonlyArray<BrandStatusType> | BrandStatusType | null
  readonly notIn?: ReadonlyArray<BrandStatusType> | BrandStatusType | null
  readonly not?: BrandStatusTypeNullableFilter | null
}

export type BrandOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly domain?: OrderDirection | null
  readonly defaultLocale?: OrderDirection | null
  readonly defaultTimezone?: OrderDirection | null
  readonly termsReference?: OrderDirection | null
  readonly logoIcon?: OrderDirection | null
  readonly logoColor?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BrandUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly domain?: string | null
  readonly defaultLocale?: string | null
  readonly defaultTimezone?: string | null
  readonly supportedLocales?: import('@keystone-6/core/types').JSONValue | null
  readonly designTokens?: import('@keystone-6/core/types').JSONValue | null
  readonly termsReference?: string | null
  readonly logoIcon?: string | null
  readonly logoColor?: string | null
  readonly status?: BrandStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandUpdateArgs = {
  readonly where: BrandWhereUniqueInput
  readonly data: BrandUpdateInput
}

export type BrandCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly domain?: string | null
  readonly defaultLocale?: string | null
  readonly defaultTimezone?: string | null
  readonly supportedLocales?: import('@keystone-6/core/types').JSONValue | null
  readonly designTokens?: import('@keystone-6/core/types').JSONValue | null
  readonly termsReference?: string | null
  readonly logoIcon?: string | null
  readonly logoColor?: string | null
  readonly status?: BrandStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitionStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type CompetitionWhereUniqueInput = {
  readonly id?: string | null
}

export type CompetitionWhereInput = {
  readonly AND?: ReadonlyArray<CompetitionWhereInput> | CompetitionWhereInput | null
  readonly OR?: ReadonlyArray<CompetitionWhereInput> | CompetitionWhereInput | null
  readonly NOT?: ReadonlyArray<CompetitionWhereInput> | CompetitionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly sport?: SportWhereInput | null
  readonly region?: RegionWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly timezone?: StringFilter | null
  readonly status?: CompetitionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CompetitionStatusTypeNullableFilter = {
  readonly equals?: CompetitionStatusType | null
  readonly in?: ReadonlyArray<CompetitionStatusType> | CompetitionStatusType | null
  readonly notIn?: ReadonlyArray<CompetitionStatusType> | CompetitionStatusType | null
  readonly not?: CompetitionStatusTypeNullableFilter | null
}

export type CompetitionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly timezone?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CompetitionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly sport?: SportRelateToOneForUpdateInput | null
  readonly region?: RegionRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly timezone?: string | null
  readonly status?: CompetitionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SportRelateToOneForUpdateInput = {
  readonly create?: SportCreateInput | null
  readonly connect?: SportWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type RegionRelateToOneForUpdateInput = {
  readonly create?: RegionCreateInput | null
  readonly connect?: RegionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CompetitionUpdateArgs = {
  readonly where: CompetitionWhereUniqueInput
  readonly data: CompetitionUpdateInput
}

export type CompetitionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly sport?: SportRelateToOneForCreateInput | null
  readonly region?: RegionRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly timezone?: string | null
  readonly status?: CompetitionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SportRelateToOneForCreateInput = {
  readonly create?: SportCreateInput | null
  readonly connect?: SportWhereUniqueInput | null
}

export type RegionRelateToOneForCreateInput = {
  readonly create?: RegionCreateInput | null
  readonly connect?: RegionWhereUniqueInput | null
}

export type DeadLetterWhereUniqueInput = {
  readonly id?: string | null
}

export type DeadLetterWhereInput = {
  readonly AND?: ReadonlyArray<DeadLetterWhereInput> | DeadLetterWhereInput | null
  readonly OR?: ReadonlyArray<DeadLetterWhereInput> | DeadLetterWhereInput | null
  readonly NOT?: ReadonlyArray<DeadLetterWhereInput> | DeadLetterWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly sourceType?: StringFilter | null
  readonly sourceId?: StringFilter | null
  readonly reason?: StringFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly payloadReference?: StringFilter | null
  readonly resolvedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type DeadLetterOrderByInput = {
  readonly id?: OrderDirection | null
  readonly sourceType?: OrderDirection | null
  readonly sourceId?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly payloadReference?: OrderDirection | null
  readonly resolvedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type DeadLetterUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly sourceType?: string | null
  readonly sourceId?: string | null
  readonly reason?: string | null
  readonly attempts?: number | null
  readonly payloadReference?: string | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DeadLetterUpdateArgs = {
  readonly where: DeadLetterWhereUniqueInput
  readonly data: DeadLetterUpdateInput
}

export type DeadLetterCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly sourceType?: string | null
  readonly sourceId?: string | null
  readonly reason?: string | null
  readonly attempts?: number | null
  readonly payloadReference?: string | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type EventStatusType =
  | 'SCHEDULED'
  | 'LIVE'
  | 'ENDED'
  | 'CANCELLED'
  | 'SUSPENDED'

export type EventOfficialResultStatusType =
  | 'NONE'
  | 'PROVISIONAL'
  | 'APPROVED'
  | 'DISPUTED'

export type EventWhereUniqueInput = {
  readonly id?: string | null
}

export type EventWhereInput = {
  readonly AND?: ReadonlyArray<EventWhereInput> | EventWhereInput | null
  readonly OR?: ReadonlyArray<EventWhereInput> | EventWhereInput | null
  readonly NOT?: ReadonlyArray<EventWhereInput> | EventWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly competition?: CompetitionWhereInput | null
  readonly season?: SeasonWhereInput | null
  readonly stage?: CompetitionStageWhereInput | null
  readonly venue?: VenueWhereInput | null
  readonly externalKey?: StringFilter | null
  readonly name?: StringFilter | null
  readonly startAt?: DateTimeFilter | null
  readonly status?: EventStatusTypeNullableFilter | null
  readonly livePhase?: StringFilter | null
  readonly clockSeconds?: IntNullableFilter | null
  readonly officialResultStatus?: EventOfficialResultStatusTypeNullableFilter | null
  readonly version?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type EventStatusTypeNullableFilter = {
  readonly equals?: EventStatusType | null
  readonly in?: ReadonlyArray<EventStatusType> | EventStatusType | null
  readonly notIn?: ReadonlyArray<EventStatusType> | EventStatusType | null
  readonly not?: EventStatusTypeNullableFilter | null
}

export type EventOfficialResultStatusTypeNullableFilter = {
  readonly equals?: EventOfficialResultStatusType | null
  readonly in?: ReadonlyArray<EventOfficialResultStatusType> | EventOfficialResultStatusType | null
  readonly notIn?: ReadonlyArray<EventOfficialResultStatusType> | EventOfficialResultStatusType | null
  readonly not?: EventOfficialResultStatusTypeNullableFilter | null
}

export type EventOrderByInput = {
  readonly id?: OrderDirection | null
  readonly externalKey?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly startAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly livePhase?: OrderDirection | null
  readonly clockSeconds?: OrderDirection | null
  readonly officialResultStatus?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type EventUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly competition?: CompetitionRelateToOneForUpdateInput | null
  readonly season?: SeasonRelateToOneForUpdateInput | null
  readonly stage?: CompetitionStageRelateToOneForUpdateInput | null
  readonly venue?: VenueRelateToOneForUpdateInput | null
  readonly externalKey?: string | null
  readonly name?: string | null
  readonly startAt?: any | null
  readonly status?: EventStatusType | null
  readonly livePhase?: string | null
  readonly clockSeconds?: number | null
  readonly officialResultStatus?: EventOfficialResultStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitionRelateToOneForUpdateInput = {
  readonly create?: CompetitionCreateInput | null
  readonly connect?: CompetitionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SeasonRelateToOneForUpdateInput = {
  readonly create?: SeasonCreateInput | null
  readonly connect?: SeasonWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CompetitionStageRelateToOneForUpdateInput = {
  readonly create?: CompetitionStageCreateInput | null
  readonly connect?: CompetitionStageWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type VenueRelateToOneForUpdateInput = {
  readonly create?: VenueCreateInput | null
  readonly connect?: VenueWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type EventUpdateArgs = {
  readonly where: EventWhereUniqueInput
  readonly data: EventUpdateInput
}

export type EventCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly competition?: CompetitionRelateToOneForCreateInput | null
  readonly season?: SeasonRelateToOneForCreateInput | null
  readonly stage?: CompetitionStageRelateToOneForCreateInput | null
  readonly venue?: VenueRelateToOneForCreateInput | null
  readonly externalKey?: string | null
  readonly name?: string | null
  readonly startAt?: any | null
  readonly status?: EventStatusType | null
  readonly livePhase?: string | null
  readonly clockSeconds?: number | null
  readonly officialResultStatus?: EventOfficialResultStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitionRelateToOneForCreateInput = {
  readonly create?: CompetitionCreateInput | null
  readonly connect?: CompetitionWhereUniqueInput | null
}

export type SeasonRelateToOneForCreateInput = {
  readonly create?: SeasonCreateInput | null
  readonly connect?: SeasonWhereUniqueInput | null
}

export type CompetitionStageRelateToOneForCreateInput = {
  readonly create?: CompetitionStageCreateInput | null
  readonly connect?: CompetitionStageWhereUniqueInput | null
}

export type VenueRelateToOneForCreateInput = {
  readonly create?: VenueCreateInput | null
  readonly connect?: VenueWhereUniqueInput | null
}

export type HoldStatusType =
  | 'ACTIVE'
  | 'CAPTURED'
  | 'RELEASED'
  | 'EXPIRED'

export type HoldWhereUniqueInput = {
  readonly id?: string | null
}

export type HoldWhereInput = {
  readonly AND?: ReadonlyArray<HoldWhereInput> | HoldWhereInput | null
  readonly OR?: ReadonlyArray<HoldWhereInput> | HoldWhereInput | null
  readonly NOT?: ReadonlyArray<HoldWhereInput> | HoldWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly account?: LedgerAccountWhereInput | null
  readonly purposeType?: StringFilter | null
  readonly purposeId?: StringFilter | null
  readonly amountMinor?: StringFilter | null
  readonly status?: HoldStatusTypeNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly version?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type HoldStatusTypeNullableFilter = {
  readonly equals?: HoldStatusType | null
  readonly in?: ReadonlyArray<HoldStatusType> | HoldStatusType | null
  readonly notIn?: ReadonlyArray<HoldStatusType> | HoldStatusType | null
  readonly not?: HoldStatusTypeNullableFilter | null
}

export type HoldOrderByInput = {
  readonly id?: OrderDirection | null
  readonly purposeType?: OrderDirection | null
  readonly purposeId?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type HoldUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly account?: LedgerAccountRelateToOneForUpdateInput | null
  readonly purposeType?: string | null
  readonly purposeId?: string | null
  readonly amountMinor?: string | null
  readonly status?: HoldStatusType | null
  readonly expiresAt?: any | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LedgerAccountRelateToOneForUpdateInput = {
  readonly create?: LedgerAccountCreateInput | null
  readonly connect?: LedgerAccountWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type HoldUpdateArgs = {
  readonly where: HoldWhereUniqueInput
  readonly data: HoldUpdateInput
}

export type HoldCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly account?: LedgerAccountRelateToOneForCreateInput | null
  readonly purposeType?: string | null
  readonly purposeId?: string | null
  readonly amountMinor?: string | null
  readonly status?: HoldStatusType | null
  readonly expiresAt?: any | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LedgerAccountRelateToOneForCreateInput = {
  readonly create?: LedgerAccountCreateInput | null
  readonly connect?: LedgerAccountWhereUniqueInput | null
}

export type InboxMessageStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'DEAD'

export type InboxMessageWhereUniqueInput = {
  readonly id?: string | null
}

export type InboxMessageWhereInput = {
  readonly AND?: ReadonlyArray<InboxMessageWhereInput> | InboxMessageWhereInput | null
  readonly OR?: ReadonlyArray<InboxMessageWhereInput> | InboxMessageWhereInput | null
  readonly NOT?: ReadonlyArray<InboxMessageWhereInput> | InboxMessageWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly rawEnvelope?: RawEnvelopeWhereInput | null
  readonly messageKey?: StringFilter | null
  readonly type?: StringFilter | null
  readonly status?: InboxMessageStatusTypeNullableFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly availableAt?: DateTimeNullableFilter | null
  readonly leaseUntil?: DateTimeNullableFilter | null
  readonly leaseOwner?: StringFilter | null
  readonly lastError?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type InboxMessageStatusTypeNullableFilter = {
  readonly equals?: InboxMessageStatusType | null
  readonly in?: ReadonlyArray<InboxMessageStatusType> | InboxMessageStatusType | null
  readonly notIn?: ReadonlyArray<InboxMessageStatusType> | InboxMessageStatusType | null
  readonly not?: InboxMessageStatusTypeNullableFilter | null
}

export type InboxMessageOrderByInput = {
  readonly id?: OrderDirection | null
  readonly messageKey?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly availableAt?: OrderDirection | null
  readonly leaseUntil?: OrderDirection | null
  readonly leaseOwner?: OrderDirection | null
  readonly lastError?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type InboxMessageUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForUpdateInput | null
  readonly messageKey?: string | null
  readonly type?: string | null
  readonly status?: InboxMessageStatusType | null
  readonly attempts?: number | null
  readonly availableAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RawEnvelopeRelateToOneForUpdateInput = {
  readonly create?: RawEnvelopeCreateInput | null
  readonly connect?: RawEnvelopeWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type InboxMessageUpdateArgs = {
  readonly where: InboxMessageWhereUniqueInput
  readonly data: InboxMessageUpdateInput
}

export type InboxMessageCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForCreateInput | null
  readonly messageKey?: string | null
  readonly type?: string | null
  readonly status?: InboxMessageStatusType | null
  readonly attempts?: number | null
  readonly availableAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RawEnvelopeRelateToOneForCreateInput = {
  readonly create?: RawEnvelopeCreateInput | null
  readonly connect?: RawEnvelopeWhereUniqueInput | null
}

export type JournalEntrySideType =
  | 'DEBIT'
  | 'CREDIT'

export type JournalEntryWhereUniqueInput = {
  readonly id?: string | null
}

export type JournalEntryWhereInput = {
  readonly AND?: ReadonlyArray<JournalEntryWhereInput> | JournalEntryWhereInput | null
  readonly OR?: ReadonlyArray<JournalEntryWhereInput> | JournalEntryWhereInput | null
  readonly NOT?: ReadonlyArray<JournalEntryWhereInput> | JournalEntryWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly transaction?: JournalTransactionWhereInput | null
  readonly account?: LedgerAccountWhereInput | null
  readonly side?: JournalEntrySideTypeNullableFilter | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type JournalEntrySideTypeNullableFilter = {
  readonly equals?: JournalEntrySideType | null
  readonly in?: ReadonlyArray<JournalEntrySideType> | JournalEntrySideType | null
  readonly notIn?: ReadonlyArray<JournalEntrySideType> | JournalEntrySideType | null
  readonly not?: JournalEntrySideTypeNullableFilter | null
}

export type JournalEntryOrderByInput = {
  readonly id?: OrderDirection | null
  readonly side?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type JournalEntryUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly transaction?: JournalTransactionRelateToOneForUpdateInput | null
  readonly account?: LedgerAccountRelateToOneForUpdateInput | null
  readonly side?: JournalEntrySideType | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JournalTransactionRelateToOneForUpdateInput = {
  readonly create?: JournalTransactionCreateInput | null
  readonly connect?: JournalTransactionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type JournalEntryUpdateArgs = {
  readonly where: JournalEntryWhereUniqueInput
  readonly data: JournalEntryUpdateInput
}

export type JournalEntryCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly transaction?: JournalTransactionRelateToOneForCreateInput | null
  readonly account?: LedgerAccountRelateToOneForCreateInput | null
  readonly side?: JournalEntrySideType | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JournalTransactionRelateToOneForCreateInput = {
  readonly create?: JournalTransactionCreateInput | null
  readonly connect?: JournalTransactionWhereUniqueInput | null
}

export type JournalTransactionStatusType =
  | 'POSTED'
  | 'REVERSED'

export type JournalTransactionWhereUniqueInput = {
  readonly id?: string | null
}

export type JournalTransactionWhereInput = {
  readonly AND?: ReadonlyArray<JournalTransactionWhereInput> | JournalTransactionWhereInput | null
  readonly OR?: ReadonlyArray<JournalTransactionWhereInput> | JournalTransactionWhereInput | null
  readonly NOT?: ReadonlyArray<JournalTransactionWhereInput> | JournalTransactionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly type?: StringFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly correlationId?: StringFilter | null
  readonly status?: JournalTransactionStatusTypeNullableFilter | null
  readonly reversalOf?: JournalTransactionWhereInput | null
  readonly effectiveAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type JournalTransactionStatusTypeNullableFilter = {
  readonly equals?: JournalTransactionStatusType | null
  readonly in?: ReadonlyArray<JournalTransactionStatusType> | JournalTransactionStatusType | null
  readonly notIn?: ReadonlyArray<JournalTransactionStatusType> | JournalTransactionStatusType | null
  readonly not?: JournalTransactionStatusTypeNullableFilter | null
}

export type JournalTransactionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly correlationId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly effectiveAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type JournalTransactionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly idempotencyKey?: string | null
  readonly correlationId?: string | null
  readonly status?: JournalTransactionStatusType | null
  readonly reversalOf?: JournalTransactionRelateToOneForUpdateInput | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JournalTransactionUpdateArgs = {
  readonly where: JournalTransactionWhereUniqueInput
  readonly data: JournalTransactionUpdateInput
}

export type JournalTransactionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly idempotencyKey?: string | null
  readonly correlationId?: string | null
  readonly status?: JournalTransactionStatusType | null
  readonly reversalOf?: JournalTransactionRelateToOneForCreateInput | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'INACTIVE'

export type JurisdictionWhereUniqueInput = {
  readonly id?: string | null
  readonly code?: string | null
}

export type JurisdictionWhereInput = {
  readonly AND?: ReadonlyArray<JurisdictionWhereInput> | JurisdictionWhereInput | null
  readonly OR?: ReadonlyArray<JurisdictionWhereInput> | JurisdictionWhereInput | null
  readonly NOT?: ReadonlyArray<JurisdictionWhereInput> | JurisdictionWhereInput | null
  readonly id?: IDFilter | null
  readonly code?: StringFilter | null
  readonly authority?: StringFilter | null
  readonly status?: JurisdictionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type JurisdictionStatusTypeNullableFilter = {
  readonly equals?: JurisdictionStatusType | null
  readonly in?: ReadonlyArray<JurisdictionStatusType> | JurisdictionStatusType | null
  readonly notIn?: ReadonlyArray<JurisdictionStatusType> | JurisdictionStatusType | null
  readonly not?: JurisdictionStatusTypeNullableFilter | null
}

export type JurisdictionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly code?: OrderDirection | null
  readonly authority?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type JurisdictionUpdateInput = {
  readonly code?: string | null
  readonly authority?: string | null
  readonly status?: JurisdictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionUpdateArgs = {
  readonly where: JurisdictionWhereUniqueInput
  readonly data: JurisdictionUpdateInput
}

export type JurisdictionCreateInput = {
  readonly code?: string | null
  readonly authority?: string | null
  readonly status?: JurisdictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LedgerAccountAccountClassType =
  | 'ASSET'
  | 'LIABILITY'
  | 'REVENUE'
  | 'EXPENSE'
  | 'EQUITY'

export type LedgerAccountStatusType =
  | 'ACTIVE'
  | 'FROZEN'
  | 'CLOSED'

export type LedgerAccountWhereUniqueInput = {
  readonly id?: string | null
}

export type LedgerAccountWhereInput = {
  readonly AND?: ReadonlyArray<LedgerAccountWhereInput> | LedgerAccountWhereInput | null
  readonly OR?: ReadonlyArray<LedgerAccountWhereInput> | LedgerAccountWhereInput | null
  readonly NOT?: ReadonlyArray<LedgerAccountWhereInput> | LedgerAccountWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly key?: StringFilter | null
  readonly accountClass?: LedgerAccountAccountClassTypeNullableFilter | null
  readonly currency?: StringFilter | null
  readonly status?: LedgerAccountStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LedgerAccountAccountClassTypeNullableFilter = {
  readonly equals?: LedgerAccountAccountClassType | null
  readonly in?: ReadonlyArray<LedgerAccountAccountClassType> | LedgerAccountAccountClassType | null
  readonly notIn?: ReadonlyArray<LedgerAccountAccountClassType> | LedgerAccountAccountClassType | null
  readonly not?: LedgerAccountAccountClassTypeNullableFilter | null
}

export type LedgerAccountStatusTypeNullableFilter = {
  readonly equals?: LedgerAccountStatusType | null
  readonly in?: ReadonlyArray<LedgerAccountStatusType> | LedgerAccountStatusType | null
  readonly notIn?: ReadonlyArray<LedgerAccountStatusType> | LedgerAccountStatusType | null
  readonly not?: LedgerAccountStatusTypeNullableFilter | null
}

export type LedgerAccountOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly accountClass?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LedgerAccountUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly accountClass?: LedgerAccountAccountClassType | null
  readonly currency?: string | null
  readonly status?: LedgerAccountStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerRelateToOneForUpdateInput = {
  readonly create?: PlayerCreateInput | null
  readonly connect?: PlayerWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type LedgerAccountUpdateArgs = {
  readonly where: LedgerAccountWhereUniqueInput
  readonly data: LedgerAccountUpdateInput
}

export type LedgerAccountCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly accountClass?: LedgerAccountAccountClassType | null
  readonly currency?: string | null
  readonly status?: LedgerAccountStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerRelateToOneForCreateInput = {
  readonly create?: PlayerCreateInput | null
  readonly connect?: PlayerWhereUniqueInput | null
}

export type MarketTradingModeType =
  | 'PREMATCH'
  | 'LIVE'

export type MarketStatusType =
  | 'OPEN'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'GRADED'

export type MarketWhereUniqueInput = {
  readonly id?: string | null
}

export type MarketWhereInput = {
  readonly AND?: ReadonlyArray<MarketWhereInput> | MarketWhereInput | null
  readonly OR?: ReadonlyArray<MarketWhereInput> | MarketWhereInput | null
  readonly NOT?: ReadonlyArray<MarketWhereInput> | MarketWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly event?: EventWhereInput | null
  readonly definition?: MarketDefinitionWhereInput | null
  readonly definitionKey?: StringFilter | null
  readonly tradingMode?: MarketTradingModeTypeNullableFilter | null
  readonly line?: StringFilter | null
  readonly marginBasisPoints?: IntNullableFilter | null
  readonly cashOutEnabled?: BooleanFilter | null
  readonly status?: MarketStatusTypeNullableFilter | null
  readonly version?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type MarketTradingModeTypeNullableFilter = {
  readonly equals?: MarketTradingModeType | null
  readonly in?: ReadonlyArray<MarketTradingModeType> | MarketTradingModeType | null
  readonly notIn?: ReadonlyArray<MarketTradingModeType> | MarketTradingModeType | null
  readonly not?: MarketTradingModeTypeNullableFilter | null
}

export type MarketStatusTypeNullableFilter = {
  readonly equals?: MarketStatusType | null
  readonly in?: ReadonlyArray<MarketStatusType> | MarketStatusType | null
  readonly notIn?: ReadonlyArray<MarketStatusType> | MarketStatusType | null
  readonly not?: MarketStatusTypeNullableFilter | null
}

export type MarketOrderByInput = {
  readonly id?: OrderDirection | null
  readonly definitionKey?: OrderDirection | null
  readonly tradingMode?: OrderDirection | null
  readonly line?: OrderDirection | null
  readonly marginBasisPoints?: OrderDirection | null
  readonly cashOutEnabled?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type MarketUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly event?: EventRelateToOneForUpdateInput | null
  readonly definition?: MarketDefinitionRelateToOneForUpdateInput | null
  readonly definitionKey?: string | null
  readonly parameters?: import('@keystone-6/core/types').JSONValue | null
  readonly tradingMode?: MarketTradingModeType | null
  readonly line?: string | null
  readonly marginBasisPoints?: number | null
  readonly cashOutEnabled?: boolean | null
  readonly status?: MarketStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type EventRelateToOneForUpdateInput = {
  readonly create?: EventCreateInput | null
  readonly connect?: EventWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type MarketDefinitionRelateToOneForUpdateInput = {
  readonly create?: MarketDefinitionCreateInput | null
  readonly connect?: MarketDefinitionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type MarketUpdateArgs = {
  readonly where: MarketWhereUniqueInput
  readonly data: MarketUpdateInput
}

export type MarketCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly event?: EventRelateToOneForCreateInput | null
  readonly definition?: MarketDefinitionRelateToOneForCreateInput | null
  readonly definitionKey?: string | null
  readonly parameters?: import('@keystone-6/core/types').JSONValue | null
  readonly tradingMode?: MarketTradingModeType | null
  readonly line?: string | null
  readonly marginBasisPoints?: number | null
  readonly cashOutEnabled?: boolean | null
  readonly status?: MarketStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type EventRelateToOneForCreateInput = {
  readonly create?: EventCreateInput | null
  readonly connect?: EventWhereUniqueInput | null
}

export type MarketDefinitionRelateToOneForCreateInput = {
  readonly create?: MarketDefinitionCreateInput | null
  readonly connect?: MarketDefinitionWhereUniqueInput | null
}

export type OperatorJurisdictionStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'

export type OperatorJurisdictionWhereUniqueInput = {
  readonly id?: string | null
}

export type OperatorJurisdictionWhereInput = {
  readonly AND?: ReadonlyArray<OperatorJurisdictionWhereInput> | OperatorJurisdictionWhereInput | null
  readonly OR?: ReadonlyArray<OperatorJurisdictionWhereInput> | OperatorJurisdictionWhereInput | null
  readonly NOT?: ReadonlyArray<OperatorJurisdictionWhereInput> | OperatorJurisdictionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly licenseReference?: StringFilter | null
  readonly policyVersion?: StringFilter | null
  readonly effectiveFrom?: DateTimeNullableFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: OperatorJurisdictionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type OperatorJurisdictionStatusTypeNullableFilter = {
  readonly equals?: OperatorJurisdictionStatusType | null
  readonly in?: ReadonlyArray<OperatorJurisdictionStatusType> | OperatorJurisdictionStatusType | null
  readonly notIn?: ReadonlyArray<OperatorJurisdictionStatusType> | OperatorJurisdictionStatusType | null
  readonly not?: OperatorJurisdictionStatusTypeNullableFilter | null
}

export type OperatorJurisdictionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly licenseReference?: OrderDirection | null
  readonly policyVersion?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type OperatorJurisdictionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly licenseReference?: string | null
  readonly policyVersion?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: OperatorJurisdictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionRelateToOneForUpdateInput = {
  readonly create?: JurisdictionCreateInput | null
  readonly connect?: JurisdictionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type OperatorJurisdictionUpdateArgs = {
  readonly where: OperatorJurisdictionWhereUniqueInput
  readonly data: OperatorJurisdictionUpdateInput
}

export type OperatorJurisdictionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly licenseReference?: string | null
  readonly policyVersion?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: OperatorJurisdictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionRelateToOneForCreateInput = {
  readonly create?: JurisdictionCreateInput | null
  readonly connect?: JurisdictionWhereUniqueInput | null
}

export type OutboxMessageStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'DEAD'

export type OutboxMessageWhereUniqueInput = {
  readonly id?: string | null
}

export type OutboxMessageWhereInput = {
  readonly AND?: ReadonlyArray<OutboxMessageWhereInput> | OutboxMessageWhereInput | null
  readonly OR?: ReadonlyArray<OutboxMessageWhereInput> | OutboxMessageWhereInput | null
  readonly NOT?: ReadonlyArray<OutboxMessageWhereInput> | OutboxMessageWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly aggregateType?: StringFilter | null
  readonly aggregateId?: StringFilter | null
  readonly eventType?: StringFilter | null
  readonly status?: OutboxMessageStatusTypeNullableFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly maxAttempts?: IntNullableFilter | null
  readonly availableAt?: DateTimeNullableFilter | null
  readonly leaseUntil?: DateTimeNullableFilter | null
  readonly leaseOwner?: StringFilter | null
  readonly lastError?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type OutboxMessageStatusTypeNullableFilter = {
  readonly equals?: OutboxMessageStatusType | null
  readonly in?: ReadonlyArray<OutboxMessageStatusType> | OutboxMessageStatusType | null
  readonly notIn?: ReadonlyArray<OutboxMessageStatusType> | OutboxMessageStatusType | null
  readonly not?: OutboxMessageStatusTypeNullableFilter | null
}

export type OutboxMessageOrderByInput = {
  readonly id?: OrderDirection | null
  readonly aggregateType?: OrderDirection | null
  readonly aggregateId?: OrderDirection | null
  readonly eventType?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly maxAttempts?: OrderDirection | null
  readonly availableAt?: OrderDirection | null
  readonly leaseUntil?: OrderDirection | null
  readonly leaseOwner?: OrderDirection | null
  readonly lastError?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type OutboxMessageUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly aggregateType?: string | null
  readonly aggregateId?: string | null
  readonly eventType?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: OutboxMessageStatusType | null
  readonly attempts?: number | null
  readonly maxAttempts?: number | null
  readonly availableAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OutboxMessageUpdateArgs = {
  readonly where: OutboxMessageWhereUniqueInput
  readonly data: OutboxMessageUpdateInput
}

export type OutboxMessageCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly aggregateType?: string | null
  readonly aggregateId?: string | null
  readonly eventType?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: OutboxMessageStatusType | null
  readonly attempts?: number | null
  readonly maxAttempts?: number | null
  readonly availableAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'

export type PlayerKycStatusType =
  | 'REQUIRED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export type PlayerPreferredOddsFormatType =
  | 'DECIMAL'
  | 'AMERICAN'
  | 'FRACTIONAL'

export type PlayerRiskBandType =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type PlayerWhereUniqueInput = {
  readonly id?: string | null
}

export type PlayerWhereInput = {
  readonly AND?: ReadonlyArray<PlayerWhereInput> | PlayerWhereInput | null
  readonly OR?: ReadonlyArray<PlayerWhereInput> | PlayerWhereInput | null
  readonly NOT?: ReadonlyArray<PlayerWhereInput> | PlayerWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly brand?: BrandWhereInput | null
  readonly subject?: StringFilter | null
  readonly status?: PlayerStatusTypeNullableFilter | null
  readonly kycStatus?: PlayerKycStatusTypeNullableFilter | null
  readonly locale?: StringFilter | null
  readonly timezone?: StringFilter | null
  readonly preferredOddsFormat?: PlayerPreferredOddsFormatTypeNullableFilter | null
  readonly marketingAllowed?: BooleanFilter | null
  readonly riskBand?: PlayerRiskBandTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PlayerStatusTypeNullableFilter = {
  readonly equals?: PlayerStatusType | null
  readonly in?: ReadonlyArray<PlayerStatusType> | PlayerStatusType | null
  readonly notIn?: ReadonlyArray<PlayerStatusType> | PlayerStatusType | null
  readonly not?: PlayerStatusTypeNullableFilter | null
}

export type PlayerKycStatusTypeNullableFilter = {
  readonly equals?: PlayerKycStatusType | null
  readonly in?: ReadonlyArray<PlayerKycStatusType> | PlayerKycStatusType | null
  readonly notIn?: ReadonlyArray<PlayerKycStatusType> | PlayerKycStatusType | null
  readonly not?: PlayerKycStatusTypeNullableFilter | null
}

export type PlayerPreferredOddsFormatTypeNullableFilter = {
  readonly equals?: PlayerPreferredOddsFormatType | null
  readonly in?: ReadonlyArray<PlayerPreferredOddsFormatType> | PlayerPreferredOddsFormatType | null
  readonly notIn?: ReadonlyArray<PlayerPreferredOddsFormatType> | PlayerPreferredOddsFormatType | null
  readonly not?: PlayerPreferredOddsFormatTypeNullableFilter | null
}

export type PlayerRiskBandTypeNullableFilter = {
  readonly equals?: PlayerRiskBandType | null
  readonly in?: ReadonlyArray<PlayerRiskBandType> | PlayerRiskBandType | null
  readonly notIn?: ReadonlyArray<PlayerRiskBandType> | PlayerRiskBandType | null
  readonly not?: PlayerRiskBandTypeNullableFilter | null
}

export type PlayerOrderByInput = {
  readonly id?: OrderDirection | null
  readonly subject?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly kycStatus?: OrderDirection | null
  readonly locale?: OrderDirection | null
  readonly timezone?: OrderDirection | null
  readonly preferredOddsFormat?: OrderDirection | null
  readonly marketingAllowed?: OrderDirection | null
  readonly riskBand?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PlayerUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly brand?: BrandRelateToOneForUpdateInput | null
  readonly subject?: string | null
  readonly status?: PlayerStatusType | null
  readonly kycStatus?: PlayerKycStatusType | null
  readonly locale?: string | null
  readonly timezone?: string | null
  readonly preferredOddsFormat?: PlayerPreferredOddsFormatType | null
  readonly marketingAllowed?: boolean | null
  readonly riskBand?: PlayerRiskBandType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandRelateToOneForUpdateInput = {
  readonly create?: BrandCreateInput | null
  readonly connect?: BrandWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PlayerUpdateArgs = {
  readonly where: PlayerWhereUniqueInput
  readonly data: PlayerUpdateInput
}

export type PlayerCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly brand?: BrandRelateToOneForCreateInput | null
  readonly subject?: string | null
  readonly status?: PlayerStatusType | null
  readonly kycStatus?: PlayerKycStatusType | null
  readonly locale?: string | null
  readonly timezone?: string | null
  readonly preferredOddsFormat?: PlayerPreferredOddsFormatType | null
  readonly marketingAllowed?: boolean | null
  readonly riskBand?: PlayerRiskBandType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandRelateToOneForCreateInput = {
  readonly create?: BrandCreateInput | null
  readonly connect?: BrandWhereUniqueInput | null
}

export type PlayerLimitTypeType =
  | 'DEPOSIT'
  | 'STAKE'
  | 'LOSS'
  | 'SESSION'

export type PlayerLimitPeriodType =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'

export type PlayerLimitWhereUniqueInput = {
  readonly id?: string | null
}

export type PlayerLimitWhereInput = {
  readonly AND?: ReadonlyArray<PlayerLimitWhereInput> | PlayerLimitWhereInput | null
  readonly OR?: ReadonlyArray<PlayerLimitWhereInput> | PlayerLimitWhereInput | null
  readonly NOT?: ReadonlyArray<PlayerLimitWhereInput> | PlayerLimitWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly type?: PlayerLimitTypeTypeNullableFilter | null
  readonly period?: PlayerLimitPeriodTypeNullableFilter | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PlayerLimitTypeTypeNullableFilter = {
  readonly equals?: PlayerLimitTypeType | null
  readonly in?: ReadonlyArray<PlayerLimitTypeType> | PlayerLimitTypeType | null
  readonly notIn?: ReadonlyArray<PlayerLimitTypeType> | PlayerLimitTypeType | null
  readonly not?: PlayerLimitTypeTypeNullableFilter | null
}

export type PlayerLimitPeriodTypeNullableFilter = {
  readonly equals?: PlayerLimitPeriodType | null
  readonly in?: ReadonlyArray<PlayerLimitPeriodType> | PlayerLimitPeriodType | null
  readonly notIn?: ReadonlyArray<PlayerLimitPeriodType> | PlayerLimitPeriodType | null
  readonly not?: PlayerLimitPeriodTypeNullableFilter | null
}

export type PlayerLimitOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly period?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PlayerLimitUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly type?: PlayerLimitTypeType | null
  readonly period?: PlayerLimitPeriodType | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerLimitUpdateArgs = {
  readonly where: PlayerLimitWhereUniqueInput
  readonly data: PlayerLimitUpdateInput
}

export type PlayerLimitCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly type?: PlayerLimitTypeType | null
  readonly period?: PlayerLimitPeriodType | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PriceSnapshotStatusType =
  | 'OPEN'
  | 'SUSPENDED'

export type PriceSnapshotWhereUniqueInput = {
  readonly id?: string | null
}

export type PriceSnapshotWhereInput = {
  readonly AND?: ReadonlyArray<PriceSnapshotWhereInput> | PriceSnapshotWhereInput | null
  readonly OR?: ReadonlyArray<PriceSnapshotWhereInput> | PriceSnapshotWhereInput | null
  readonly NOT?: ReadonlyArray<PriceSnapshotWhereInput> | PriceSnapshotWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly selection?: SelectionWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly decimalOdds?: StringFilter | null
  readonly line?: StringFilter | null
  readonly sequence?: StringFilter | null
  readonly effectiveAt?: DateTimeFilter | null
  readonly receivedAt?: DateTimeFilter | null
  readonly rawEnvelope?: RawEnvelopeWhereInput | null
  readonly status?: PriceSnapshotStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PriceSnapshotStatusTypeNullableFilter = {
  readonly equals?: PriceSnapshotStatusType | null
  readonly in?: ReadonlyArray<PriceSnapshotStatusType> | PriceSnapshotStatusType | null
  readonly notIn?: ReadonlyArray<PriceSnapshotStatusType> | PriceSnapshotStatusType | null
  readonly not?: PriceSnapshotStatusTypeNullableFilter | null
}

export type PriceSnapshotOrderByInput = {
  readonly id?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly line?: OrderDirection | null
  readonly sequence?: OrderDirection | null
  readonly effectiveAt?: OrderDirection | null
  readonly receivedAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PriceSnapshotUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly selection?: SelectionRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly sequence?: string | null
  readonly effectiveAt?: any | null
  readonly receivedAt?: any | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForUpdateInput | null
  readonly status?: PriceSnapshotStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SelectionRelateToOneForUpdateInput = {
  readonly create?: SelectionCreateInput | null
  readonly connect?: SelectionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type ProviderConnectionRelateToOneForUpdateInput = {
  readonly create?: ProviderConnectionCreateInput | null
  readonly connect?: ProviderConnectionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PriceSnapshotUpdateArgs = {
  readonly where: PriceSnapshotWhereUniqueInput
  readonly data: PriceSnapshotUpdateInput
}

export type PriceSnapshotCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly selection?: SelectionRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly sequence?: string | null
  readonly effectiveAt?: any | null
  readonly receivedAt?: any | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForCreateInput | null
  readonly status?: PriceSnapshotStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SelectionRelateToOneForCreateInput = {
  readonly create?: SelectionCreateInput | null
  readonly connect?: SelectionWhereUniqueInput | null
}

export type ProviderConnectionRelateToOneForCreateInput = {
  readonly create?: ProviderConnectionCreateInput | null
  readonly connect?: ProviderConnectionWhereUniqueInput | null
}

export type ProviderConnectionCertificationStatusType =
  | 'SANDBOX'
  | 'PENDING'
  | 'CERTIFIED'
  | 'SUSPENDED'

export type ProviderConnectionStatusType =
  | 'ACTIVE'
  | 'DEGRADED'
  | 'DISABLED'

export type ProviderConnectionWhereUniqueInput = {
  readonly id?: string | null
}

export type ProviderConnectionWhereInput = {
  readonly AND?: ReadonlyArray<ProviderConnectionWhereInput> | ProviderConnectionWhereInput | null
  readonly OR?: ReadonlyArray<ProviderConnectionWhereInput> | ProviderConnectionWhereInput | null
  readonly NOT?: ReadonlyArray<ProviderConnectionWhereInput> | ProviderConnectionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly legalEntity?: LegalEntityWhereInput | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly adapterId?: StringFilter | null
  readonly adapterVersion?: StringFilter | null
  readonly configReference?: StringFilter | null
  readonly secretReference?: StringFilter | null
  readonly dataResidencyRegion?: StringFilter | null
  readonly failoverPriority?: IntNullableFilter | null
  readonly certificationStatus?: ProviderConnectionCertificationStatusTypeNullableFilter | null
  readonly status?: ProviderConnectionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ProviderConnectionCertificationStatusTypeNullableFilter = {
  readonly equals?: ProviderConnectionCertificationStatusType | null
  readonly in?: ReadonlyArray<ProviderConnectionCertificationStatusType> | ProviderConnectionCertificationStatusType | null
  readonly notIn?: ReadonlyArray<ProviderConnectionCertificationStatusType> | ProviderConnectionCertificationStatusType | null
  readonly not?: ProviderConnectionCertificationStatusTypeNullableFilter | null
}

export type ProviderConnectionStatusTypeNullableFilter = {
  readonly equals?: ProviderConnectionStatusType | null
  readonly in?: ReadonlyArray<ProviderConnectionStatusType> | ProviderConnectionStatusType | null
  readonly notIn?: ReadonlyArray<ProviderConnectionStatusType> | ProviderConnectionStatusType | null
  readonly not?: ProviderConnectionStatusTypeNullableFilter | null
}

export type ProviderConnectionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly adapterId?: OrderDirection | null
  readonly adapterVersion?: OrderDirection | null
  readonly configReference?: OrderDirection | null
  readonly secretReference?: OrderDirection | null
  readonly dataResidencyRegion?: OrderDirection | null
  readonly failoverPriority?: OrderDirection | null
  readonly certificationStatus?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ProviderConnectionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForUpdateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly adapterId?: string | null
  readonly adapterVersion?: string | null
  readonly configReference?: string | null
  readonly secretReference?: string | null
  readonly dataResidencyRegion?: string | null
  readonly failoverPriority?: number | null
  readonly capabilities?: import('@keystone-6/core/types').JSONValue | null
  readonly certificationStatus?: ProviderConnectionCertificationStatusType | null
  readonly status?: ProviderConnectionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegalEntityRelateToOneForUpdateInput = {
  readonly create?: LegalEntityCreateInput | null
  readonly connect?: LegalEntityWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type ProviderConnectionUpdateArgs = {
  readonly where: ProviderConnectionWhereUniqueInput
  readonly data: ProviderConnectionUpdateInput
}

export type ProviderConnectionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForCreateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly adapterId?: string | null
  readonly adapterVersion?: string | null
  readonly configReference?: string | null
  readonly secretReference?: string | null
  readonly dataResidencyRegion?: string | null
  readonly failoverPriority?: number | null
  readonly capabilities?: import('@keystone-6/core/types').JSONValue | null
  readonly certificationStatus?: ProviderConnectionCertificationStatusType | null
  readonly status?: ProviderConnectionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegalEntityRelateToOneForCreateInput = {
  readonly create?: LegalEntityCreateInput | null
  readonly connect?: LegalEntityWhereUniqueInput | null
}

export type QuoteStructureType =
  | 'STRAIGHT'
  | 'PARLAY'
  | 'SYSTEM'
  | 'ROUND_ROBIN'
  | 'TEASER'
  | 'EACH_WAY'

export type QuotePriceChangeConsentType =
  | 'EXACT'
  | 'ACCEPT_BETTER'
  | 'ACCEPT_WITHIN_TOLERANCE'

export type QuoteWhereUniqueInput = {
  readonly id?: string | null
}

export type QuoteWhereInput = {
  readonly AND?: ReadonlyArray<QuoteWhereInput> | QuoteWhereInput | null
  readonly OR?: ReadonlyArray<QuoteWhereInput> | QuoteWhereInput | null
  readonly NOT?: ReadonlyArray<QuoteWhereInput> | QuoteWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly selection?: SelectionWhereInput | null
  readonly priceSnapshot?: PriceSnapshotWhereInput | null
  readonly structure?: QuoteStructureTypeNullableFilter | null
  readonly promotion?: PromotionWhereInput | null
  readonly legCount?: IntNullableFilter | null
  readonly partCount?: IntNullableFilter | null
  readonly stakeMinor?: StringFilter | null
  readonly potentialReturnMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly decimalOdds?: StringFilter | null
  readonly priceChangeConsent?: QuotePriceChangeConsentTypeNullableFilter | null
  readonly liveDelayMs?: IntNullableFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly termsHash?: StringFilter | null
  readonly policyVersion?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type QuoteStructureTypeNullableFilter = {
  readonly equals?: QuoteStructureType | null
  readonly in?: ReadonlyArray<QuoteStructureType> | QuoteStructureType | null
  readonly notIn?: ReadonlyArray<QuoteStructureType> | QuoteStructureType | null
  readonly not?: QuoteStructureTypeNullableFilter | null
}

export type QuotePriceChangeConsentTypeNullableFilter = {
  readonly equals?: QuotePriceChangeConsentType | null
  readonly in?: ReadonlyArray<QuotePriceChangeConsentType> | QuotePriceChangeConsentType | null
  readonly notIn?: ReadonlyArray<QuotePriceChangeConsentType> | QuotePriceChangeConsentType | null
  readonly not?: QuotePriceChangeConsentTypeNullableFilter | null
}

export type QuoteOrderByInput = {
  readonly id?: OrderDirection | null
  readonly structure?: OrderDirection | null
  readonly legCount?: OrderDirection | null
  readonly partCount?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly potentialReturnMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly priceChangeConsent?: OrderDirection | null
  readonly liveDelayMs?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly termsHash?: OrderDirection | null
  readonly policyVersion?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type QuoteUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly selection?: SelectionRelateToOneForUpdateInput | null
  readonly priceSnapshot?: PriceSnapshotRelateToOneForUpdateInput | null
  readonly structure?: QuoteStructureType | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly legCount?: number | null
  readonly partCount?: number | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly currency?: string | null
  readonly decimalOdds?: string | null
  readonly priceChangeConsent?: QuotePriceChangeConsentType | null
  readonly liveDelayMs?: number | null
  readonly expiresAt?: any | null
  readonly termsHash?: string | null
  readonly policyVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PriceSnapshotRelateToOneForUpdateInput = {
  readonly create?: PriceSnapshotCreateInput | null
  readonly connect?: PriceSnapshotWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PromotionRelateToOneForUpdateInput = {
  readonly create?: PromotionCreateInput | null
  readonly connect?: PromotionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type QuoteUpdateArgs = {
  readonly where: QuoteWhereUniqueInput
  readonly data: QuoteUpdateInput
}

export type QuoteCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly selection?: SelectionRelateToOneForCreateInput | null
  readonly priceSnapshot?: PriceSnapshotRelateToOneForCreateInput | null
  readonly structure?: QuoteStructureType | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly legCount?: number | null
  readonly partCount?: number | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly currency?: string | null
  readonly decimalOdds?: string | null
  readonly priceChangeConsent?: QuotePriceChangeConsentType | null
  readonly liveDelayMs?: number | null
  readonly expiresAt?: any | null
  readonly termsHash?: string | null
  readonly policyVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PriceSnapshotRelateToOneForCreateInput = {
  readonly create?: PriceSnapshotCreateInput | null
  readonly connect?: PriceSnapshotWhereUniqueInput | null
}

export type PromotionRelateToOneForCreateInput = {
  readonly create?: PromotionCreateInput | null
  readonly connect?: PromotionWhereUniqueInput | null
}

export type RawEnvelopeDirectionType =
  | 'INBOUND'
  | 'OUTBOUND'

export type RawEnvelopeWhereUniqueInput = {
  readonly id?: string | null
}

export type RawEnvelopeWhereInput = {
  readonly AND?: ReadonlyArray<RawEnvelopeWhereInput> | RawEnvelopeWhereInput | null
  readonly OR?: ReadonlyArray<RawEnvelopeWhereInput> | RawEnvelopeWhereInput | null
  readonly NOT?: ReadonlyArray<RawEnvelopeWhereInput> | RawEnvelopeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly direction?: RawEnvelopeDirectionTypeNullableFilter | null
  readonly externalId?: StringFilter | null
  readonly schemaVersion?: StringFilter | null
  readonly installationRevision?: StringFilter | null
  readonly payloadHash?: StringFilter | null
  readonly receivedAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type RawEnvelopeDirectionTypeNullableFilter = {
  readonly equals?: RawEnvelopeDirectionType | null
  readonly in?: ReadonlyArray<RawEnvelopeDirectionType> | RawEnvelopeDirectionType | null
  readonly notIn?: ReadonlyArray<RawEnvelopeDirectionType> | RawEnvelopeDirectionType | null
  readonly not?: RawEnvelopeDirectionTypeNullableFilter | null
}

export type RawEnvelopeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly direction?: OrderDirection | null
  readonly externalId?: OrderDirection | null
  readonly schemaVersion?: OrderDirection | null
  readonly installationRevision?: OrderDirection | null
  readonly payloadHash?: OrderDirection | null
  readonly receivedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RawEnvelopeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly direction?: RawEnvelopeDirectionType | null
  readonly externalId?: string | null
  readonly schemaVersion?: string | null
  readonly installationRevision?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly payloadHash?: string | null
  readonly receivedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RawEnvelopeUpdateArgs = {
  readonly where: RawEnvelopeWhereUniqueInput
  readonly data: RawEnvelopeUpdateInput
}

export type RawEnvelopeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly direction?: RawEnvelopeDirectionType | null
  readonly externalId?: string | null
  readonly schemaVersion?: string | null
  readonly installationRevision?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly payloadHash?: string | null
  readonly receivedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResultVersionStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED'

export type ResultVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type ResultVersionWhereInput = {
  readonly AND?: ReadonlyArray<ResultVersionWhereInput> | ResultVersionWhereInput | null
  readonly OR?: ReadonlyArray<ResultVersionWhereInput> | ResultVersionWhereInput | null
  readonly NOT?: ReadonlyArray<ResultVersionWhereInput> | ResultVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly event?: EventWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly version?: IntFilter | null
  readonly status?: ResultVersionStatusTypeNullableFilter | null
  readonly payloadHash?: StringFilter | null
  readonly approvedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type IntFilter = {
  readonly equals?: number | null
  readonly in?: ReadonlyArray<number> | number | null
  readonly notIn?: ReadonlyArray<number> | number | null
  readonly lt?: number | null
  readonly lte?: number | null
  readonly gt?: number | null
  readonly gte?: number | null
  readonly not?: IntFilter | null
}

export type ResultVersionStatusTypeNullableFilter = {
  readonly equals?: ResultVersionStatusType | null
  readonly in?: ReadonlyArray<ResultVersionStatusType> | ResultVersionStatusType | null
  readonly notIn?: ReadonlyArray<ResultVersionStatusType> | ResultVersionStatusType | null
  readonly not?: ResultVersionStatusTypeNullableFilter | null
}

export type ResultVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly payloadHash?: OrderDirection | null
  readonly approvedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ResultVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly event?: EventRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly status?: ResultVersionStatusType | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly payloadHash?: string | null
  readonly approvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResultVersionUpdateArgs = {
  readonly where: ResultVersionWhereUniqueInput
  readonly data: ResultVersionUpdateInput
}

export type ResultVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly event?: EventRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly status?: ResultVersionStatusType | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly payloadHash?: string | null
  readonly approvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SelectionStatusType =
  | 'OPEN'
  | 'SUSPENDED'
  | 'CLOSED'

export type SelectionWhereUniqueInput = {
  readonly id?: string | null
}

export type SelectionWhereInput = {
  readonly AND?: ReadonlyArray<SelectionWhereInput> | SelectionWhereInput | null
  readonly OR?: ReadonlyArray<SelectionWhereInput> | SelectionWhereInput | null
  readonly NOT?: ReadonlyArray<SelectionWhereInput> | SelectionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly market?: MarketWhereInput | null
  readonly key?: StringFilter | null
  readonly label?: StringFilter | null
  readonly status?: SelectionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SelectionStatusTypeNullableFilter = {
  readonly equals?: SelectionStatusType | null
  readonly in?: ReadonlyArray<SelectionStatusType> | SelectionStatusType | null
  readonly notIn?: ReadonlyArray<SelectionStatusType> | SelectionStatusType | null
  readonly not?: SelectionStatusTypeNullableFilter | null
}

export type SelectionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly label?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SelectionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly market?: MarketRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly label?: string | null
  readonly status?: SelectionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type MarketRelateToOneForUpdateInput = {
  readonly create?: MarketCreateInput | null
  readonly connect?: MarketWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SelectionUpdateArgs = {
  readonly where: SelectionWhereUniqueInput
  readonly data: SelectionUpdateInput
}

export type SelectionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly market?: MarketRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly label?: string | null
  readonly status?: SelectionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type MarketRelateToOneForCreateInput = {
  readonly create?: MarketCreateInput | null
  readonly connect?: MarketWhereUniqueInput | null
}

export type SelfExclusionStatusType =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'

export type SelfExclusionWhereUniqueInput = {
  readonly id?: string | null
}

export type SelfExclusionWhereInput = {
  readonly AND?: ReadonlyArray<SelfExclusionWhereInput> | SelfExclusionWhereInput | null
  readonly OR?: ReadonlyArray<SelfExclusionWhereInput> | SelfExclusionWhereInput | null
  readonly NOT?: ReadonlyArray<SelfExclusionWhereInput> | SelfExclusionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly scope?: StringFilter | null
  readonly startsAt?: DateTimeFilter | null
  readonly endsAt?: DateTimeNullableFilter | null
  readonly status?: SelfExclusionStatusTypeNullableFilter | null
  readonly source?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SelfExclusionStatusTypeNullableFilter = {
  readonly equals?: SelfExclusionStatusType | null
  readonly in?: ReadonlyArray<SelfExclusionStatusType> | SelfExclusionStatusType | null
  readonly notIn?: ReadonlyArray<SelfExclusionStatusType> | SelfExclusionStatusType | null
  readonly not?: SelfExclusionStatusTypeNullableFilter | null
}

export type SelfExclusionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scope?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly endsAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly source?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SelfExclusionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly scope?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: SelfExclusionStatusType | null
  readonly source?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SelfExclusionUpdateArgs = {
  readonly where: SelfExclusionWhereUniqueInput
  readonly data: SelfExclusionUpdateInput
}

export type SelfExclusionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly scope?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: SelfExclusionStatusType | null
  readonly source?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SettlementOutcomeType =
  | 'WIN'
  | 'LOSS'
  | 'PUSH'
  | 'VOID'
  | 'DEAD_HEAT'
  | 'PARTIAL'

export type SettlementWhereUniqueInput = {
  readonly id?: string | null
}

export type SettlementWhereInput = {
  readonly AND?: ReadonlyArray<SettlementWhereInput> | SettlementWhereInput | null
  readonly OR?: ReadonlyArray<SettlementWhereInput> | SettlementWhereInput | null
  readonly NOT?: ReadonlyArray<SettlementWhereInput> | SettlementWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly resultVersion?: ResultVersionWhereInput | null
  readonly settlementRun?: SettlementRunWhereInput | null
  readonly version?: IntFilter | null
  readonly outcome?: SettlementOutcomeTypeNullableFilter | null
  readonly grossPayoutMinor?: StringFilter | null
  readonly taxMinor?: StringFilter | null
  readonly payoutMinor?: StringFilter | null
  readonly inputHash?: StringFilter | null
  readonly journalTransaction?: JournalTransactionWhereInput | null
  readonly reversalOf?: SettlementWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SettlementOutcomeTypeNullableFilter = {
  readonly equals?: SettlementOutcomeType | null
  readonly in?: ReadonlyArray<SettlementOutcomeType> | SettlementOutcomeType | null
  readonly notIn?: ReadonlyArray<SettlementOutcomeType> | SettlementOutcomeType | null
  readonly not?: SettlementOutcomeTypeNullableFilter | null
}

export type SettlementOrderByInput = {
  readonly id?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly outcome?: OrderDirection | null
  readonly grossPayoutMinor?: OrderDirection | null
  readonly taxMinor?: OrderDirection | null
  readonly payoutMinor?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SettlementUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly resultVersion?: ResultVersionRelateToOneForUpdateInput | null
  readonly settlementRun?: SettlementRunRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly outcome?: SettlementOutcomeType | null
  readonly grossPayoutMinor?: string | null
  readonly taxMinor?: string | null
  readonly payoutMinor?: string | null
  readonly inputHash?: string | null
  readonly journalTransaction?: JournalTransactionRelateToOneForUpdateInput | null
  readonly reversalOf?: SettlementRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResultVersionRelateToOneForUpdateInput = {
  readonly create?: ResultVersionCreateInput | null
  readonly connect?: ResultVersionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SettlementRunRelateToOneForUpdateInput = {
  readonly create?: SettlementRunCreateInput | null
  readonly connect?: SettlementRunWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SettlementRelateToOneForUpdateInput = {
  readonly create?: SettlementCreateInput | null
  readonly connect?: SettlementWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SettlementUpdateArgs = {
  readonly where: SettlementWhereUniqueInput
  readonly data: SettlementUpdateInput
}

export type SettlementCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly resultVersion?: ResultVersionRelateToOneForCreateInput | null
  readonly settlementRun?: SettlementRunRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly outcome?: SettlementOutcomeType | null
  readonly grossPayoutMinor?: string | null
  readonly taxMinor?: string | null
  readonly payoutMinor?: string | null
  readonly inputHash?: string | null
  readonly journalTransaction?: JournalTransactionRelateToOneForCreateInput | null
  readonly reversalOf?: SettlementRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResultVersionRelateToOneForCreateInput = {
  readonly create?: ResultVersionCreateInput | null
  readonly connect?: ResultVersionWhereUniqueInput | null
}

export type SettlementRunRelateToOneForCreateInput = {
  readonly create?: SettlementRunCreateInput | null
  readonly connect?: SettlementRunWhereUniqueInput | null
}

export type SettlementRelateToOneForCreateInput = {
  readonly create?: SettlementCreateInput | null
  readonly connect?: SettlementWhereUniqueInput | null
}

export type SportWhereUniqueInput = {
  readonly id?: string | null
}

export type SportWhereInput = {
  readonly AND?: ReadonlyArray<SportWhereInput> | SportWhereInput | null
  readonly OR?: ReadonlyArray<SportWhereInput> | SportWhereInput | null
  readonly NOT?: ReadonlyArray<SportWhereInput> | SportWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly active?: BooleanFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SportOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly active?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SportUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly active?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SportUpdateArgs = {
  readonly where: SportWhereUniqueInput
  readonly data: SportUpdateInput
}

export type SportCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly active?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TenantStatusType =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'

export type TenantWhereUniqueInput = {
  readonly id?: string | null
  readonly slug?: string | null
}

export type TenantWhereInput = {
  readonly AND?: ReadonlyArray<TenantWhereInput> | TenantWhereInput | null
  readonly OR?: ReadonlyArray<TenantWhereInput> | TenantWhereInput | null
  readonly NOT?: ReadonlyArray<TenantWhereInput> | TenantWhereInput | null
  readonly id?: IDFilter | null
  readonly name?: StringFilter | null
  readonly slug?: StringFilter | null
  readonly status?: TenantStatusTypeNullableFilter | null
  readonly defaultTimezone?: StringFilter | null
  readonly dataResidencyRegion?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TenantStatusTypeNullableFilter = {
  readonly equals?: TenantStatusType | null
  readonly in?: ReadonlyArray<TenantStatusType> | TenantStatusType | null
  readonly notIn?: ReadonlyArray<TenantStatusType> | TenantStatusType | null
  readonly not?: TenantStatusTypeNullableFilter | null
}

export type TenantOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly slug?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly defaultTimezone?: OrderDirection | null
  readonly dataResidencyRegion?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TenantUpdateInput = {
  readonly name?: string | null
  readonly slug?: string | null
  readonly status?: TenantStatusType | null
  readonly defaultTimezone?: string | null
  readonly supportedLocales?: import('@keystone-6/core/types').JSONValue | null
  readonly dataResidencyRegion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TenantUpdateArgs = {
  readonly where: TenantWhereUniqueInput
  readonly data: TenantUpdateInput
}

export type TenantCreateInput = {
  readonly name?: string | null
  readonly slug?: string | null
  readonly status?: TenantStatusType | null
  readonly defaultTimezone?: string | null
  readonly supportedLocales?: import('@keystone-6/core/types').JSONValue | null
  readonly dataResidencyRegion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerStructureType =
  | 'STRAIGHT'
  | 'PARLAY'
  | 'SYSTEM'
  | 'ROUND_ROBIN'
  | 'TEASER'
  | 'EACH_WAY'

export type WagerPriceChangeConsentType =
  | 'EXACT'
  | 'ACCEPT_BETTER'
  | 'ACCEPT_WITHIN_TOLERANCE'

export type WagerStatusType =
  | 'PENDING'
  | 'DELAYED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'OPEN'
  | 'PARTIALLY_CASHED_OUT'
  | 'CASHED_OUT'
  | 'GRADED'
  | 'SETTLED'
  | 'VOID'

export type WagerWhereUniqueInput = {
  readonly id?: string | null
}

export type WagerWhereInput = {
  readonly AND?: ReadonlyArray<WagerWhereInput> | WagerWhereInput | null
  readonly OR?: ReadonlyArray<WagerWhereInput> | WagerWhereInput | null
  readonly NOT?: ReadonlyArray<WagerWhereInput> | WagerWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly quote?: QuoteWhereInput | null
  readonly legalEntity?: LegalEntityWhereInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionWhereInput | null
  readonly brand?: BrandWhereInput | null
  readonly channel?: OperatorChannelWhereInput | null
  readonly structure?: WagerStructureTypeNullableFilter | null
  readonly promotion?: PromotionWhereInput | null
  readonly bonusAward?: BonusAwardWhereInput | null
  readonly version?: IntNullableFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly stakeMinor?: StringFilter | null
  readonly potentialReturnMinor?: StringFilter | null
  readonly maxPayoutMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly termsHash?: StringFilter | null
  readonly priceChangeConsent?: WagerPriceChangeConsentTypeNullableFilter | null
  readonly liveDelayMs?: IntNullableFilter | null
  readonly requestedAt?: DateTimeNullableFilter | null
  readonly status?: WagerStatusTypeNullableFilter | null
  readonly acceptedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WagerStructureTypeNullableFilter = {
  readonly equals?: WagerStructureType | null
  readonly in?: ReadonlyArray<WagerStructureType> | WagerStructureType | null
  readonly notIn?: ReadonlyArray<WagerStructureType> | WagerStructureType | null
  readonly not?: WagerStructureTypeNullableFilter | null
}

export type WagerPriceChangeConsentTypeNullableFilter = {
  readonly equals?: WagerPriceChangeConsentType | null
  readonly in?: ReadonlyArray<WagerPriceChangeConsentType> | WagerPriceChangeConsentType | null
  readonly notIn?: ReadonlyArray<WagerPriceChangeConsentType> | WagerPriceChangeConsentType | null
  readonly not?: WagerPriceChangeConsentTypeNullableFilter | null
}

export type WagerStatusTypeNullableFilter = {
  readonly equals?: WagerStatusType | null
  readonly in?: ReadonlyArray<WagerStatusType> | WagerStatusType | null
  readonly notIn?: ReadonlyArray<WagerStatusType> | WagerStatusType | null
  readonly not?: WagerStatusTypeNullableFilter | null
}

export type WagerOrderByInput = {
  readonly id?: OrderDirection | null
  readonly structure?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly potentialReturnMinor?: OrderDirection | null
  readonly maxPayoutMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly termsHash?: OrderDirection | null
  readonly priceChangeConsent?: OrderDirection | null
  readonly liveDelayMs?: OrderDirection | null
  readonly requestedAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly acceptedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WagerUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly quote?: QuoteRelateToOneForUpdateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForUpdateInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionRelateToOneForUpdateInput | null
  readonly brand?: BrandRelateToOneForUpdateInput | null
  readonly channel?: OperatorChannelRelateToOneForUpdateInput | null
  readonly structure?: WagerStructureType | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly bonusAward?: BonusAwardRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly idempotencyKey?: string | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly maxPayoutMinor?: string | null
  readonly currency?: string | null
  readonly termsHash?: string | null
  readonly priceChangeConsent?: WagerPriceChangeConsentType | null
  readonly liveDelayMs?: number | null
  readonly requestedAt?: any | null
  readonly status?: WagerStatusType | null
  readonly acceptedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OperatorJurisdictionRelateToOneForUpdateInput = {
  readonly create?: OperatorJurisdictionCreateInput | null
  readonly connect?: OperatorJurisdictionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type OperatorChannelRelateToOneForUpdateInput = {
  readonly create?: OperatorChannelCreateInput | null
  readonly connect?: OperatorChannelWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type BonusAwardRelateToOneForUpdateInput = {
  readonly create?: BonusAwardCreateInput | null
  readonly connect?: BonusAwardWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type WagerUpdateArgs = {
  readonly where: WagerWhereUniqueInput
  readonly data: WagerUpdateInput
}

export type WagerCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly quote?: QuoteRelateToOneForCreateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForCreateInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionRelateToOneForCreateInput | null
  readonly brand?: BrandRelateToOneForCreateInput | null
  readonly channel?: OperatorChannelRelateToOneForCreateInput | null
  readonly structure?: WagerStructureType | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly bonusAward?: BonusAwardRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly idempotencyKey?: string | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly maxPayoutMinor?: string | null
  readonly currency?: string | null
  readonly termsHash?: string | null
  readonly priceChangeConsent?: WagerPriceChangeConsentType | null
  readonly liveDelayMs?: number | null
  readonly requestedAt?: any | null
  readonly status?: WagerStatusType | null
  readonly acceptedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OperatorJurisdictionRelateToOneForCreateInput = {
  readonly create?: OperatorJurisdictionCreateInput | null
  readonly connect?: OperatorJurisdictionWhereUniqueInput | null
}

export type OperatorChannelRelateToOneForCreateInput = {
  readonly create?: OperatorChannelCreateInput | null
  readonly connect?: OperatorChannelWhereUniqueInput | null
}

export type BonusAwardRelateToOneForCreateInput = {
  readonly create?: BonusAwardCreateInput | null
  readonly connect?: BonusAwardWhereUniqueInput | null
}

export type WagerLegWhereUniqueInput = {
  readonly id?: string | null
}

export type WagerLegWhereInput = {
  readonly AND?: ReadonlyArray<WagerLegWhereInput> | WagerLegWhereInput | null
  readonly OR?: ReadonlyArray<WagerLegWhereInput> | WagerLegWhereInput | null
  readonly NOT?: ReadonlyArray<WagerLegWhereInput> | WagerLegWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly wagerPart?: WagerPartWhereInput | null
  readonly legIndex?: IntNullableFilter | null
  readonly eventKey?: StringFilter | null
  readonly marketKey?: StringFilter | null
  readonly selectionKey?: StringFilter | null
  readonly snapshotId?: StringFilter | null
  readonly decimalOdds?: StringFilter | null
  readonly line?: StringFilter | null
  readonly ruleVersion?: StringFilter | null
  readonly correlationGroupKey?: StringFilter | null
  readonly live?: BooleanFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WagerLegOrderByInput = {
  readonly id?: OrderDirection | null
  readonly legIndex?: OrderDirection | null
  readonly eventKey?: OrderDirection | null
  readonly marketKey?: OrderDirection | null
  readonly selectionKey?: OrderDirection | null
  readonly snapshotId?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly line?: OrderDirection | null
  readonly ruleVersion?: OrderDirection | null
  readonly correlationGroupKey?: OrderDirection | null
  readonly live?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WagerLegUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly wagerPart?: WagerPartRelateToOneForUpdateInput | null
  readonly legIndex?: number | null
  readonly eventKey?: string | null
  readonly marketKey?: string | null
  readonly selectionKey?: string | null
  readonly snapshotId?: string | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly ruleVersion?: string | null
  readonly correlationGroupKey?: string | null
  readonly live?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerPartRelateToOneForUpdateInput = {
  readonly create?: WagerPartCreateInput | null
  readonly connect?: WagerPartWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type WagerLegUpdateArgs = {
  readonly where: WagerLegWhereUniqueInput
  readonly data: WagerLegUpdateInput
}

export type WagerLegCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly wagerPart?: WagerPartRelateToOneForCreateInput | null
  readonly legIndex?: number | null
  readonly eventKey?: string | null
  readonly marketKey?: string | null
  readonly selectionKey?: string | null
  readonly snapshotId?: string | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly ruleVersion?: string | null
  readonly correlationGroupKey?: string | null
  readonly live?: boolean | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerPartRelateToOneForCreateInput = {
  readonly create?: WagerPartCreateInput | null
  readonly connect?: WagerPartWhereUniqueInput | null
}

export type AMLCaseStatusType =
  | 'OPEN'
  | 'REVIEW'
  | 'CLOSED'

export type AMLCaseRiskBandType =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type AMLCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type AMLCaseWhereInput = {
  readonly AND?: ReadonlyArray<AMLCaseWhereInput> | AMLCaseWhereInput | null
  readonly OR?: ReadonlyArray<AMLCaseWhereInput> | AMLCaseWhereInput | null
  readonly NOT?: ReadonlyArray<AMLCaseWhereInput> | AMLCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly status?: AMLCaseStatusTypeNullableFilter | null
  readonly riskBand?: AMLCaseRiskBandTypeNullableFilter | null
  readonly ownerId?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AMLCaseStatusTypeNullableFilter = {
  readonly equals?: AMLCaseStatusType | null
  readonly in?: ReadonlyArray<AMLCaseStatusType> | AMLCaseStatusType | null
  readonly notIn?: ReadonlyArray<AMLCaseStatusType> | AMLCaseStatusType | null
  readonly not?: AMLCaseStatusTypeNullableFilter | null
}

export type AMLCaseRiskBandTypeNullableFilter = {
  readonly equals?: AMLCaseRiskBandType | null
  readonly in?: ReadonlyArray<AMLCaseRiskBandType> | AMLCaseRiskBandType | null
  readonly notIn?: ReadonlyArray<AMLCaseRiskBandType> | AMLCaseRiskBandType | null
  readonly not?: AMLCaseRiskBandTypeNullableFilter | null
}

export type AMLCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly riskBand?: OrderDirection | null
  readonly ownerId?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AMLCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly status?: AMLCaseStatusType | null
  readonly riskBand?: AMLCaseRiskBandType | null
  readonly restrictedEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly ownerId?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AMLCaseUpdateArgs = {
  readonly where: AMLCaseWhereUniqueInput
  readonly data: AMLCaseUpdateInput
}

export type AMLCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly status?: AMLCaseStatusType | null
  readonly riskBand?: AMLCaseRiskBandType | null
  readonly restrictedEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly ownerId?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccountRestrictionStatusType =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'

export type AccountRestrictionWhereUniqueInput = {
  readonly id?: string | null
}

export type AccountRestrictionWhereInput = {
  readonly AND?: ReadonlyArray<AccountRestrictionWhereInput> | AccountRestrictionWhereInput | null
  readonly OR?: ReadonlyArray<AccountRestrictionWhereInput> | AccountRestrictionWhereInput | null
  readonly NOT?: ReadonlyArray<AccountRestrictionWhereInput> | AccountRestrictionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly capability?: StringFilter | null
  readonly reasonCode?: StringFilter | null
  readonly startsAt?: DateTimeNullableFilter | null
  readonly endsAt?: DateTimeNullableFilter | null
  readonly status?: AccountRestrictionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AccountRestrictionStatusTypeNullableFilter = {
  readonly equals?: AccountRestrictionStatusType | null
  readonly in?: ReadonlyArray<AccountRestrictionStatusType> | AccountRestrictionStatusType | null
  readonly notIn?: ReadonlyArray<AccountRestrictionStatusType> | AccountRestrictionStatusType | null
  readonly not?: AccountRestrictionStatusTypeNullableFilter | null
}

export type AccountRestrictionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly capability?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly endsAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AccountRestrictionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly capability?: string | null
  readonly reasonCode?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: AccountRestrictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccountRestrictionUpdateArgs = {
  readonly where: AccountRestrictionWhereUniqueInput
  readonly data: AccountRestrictionUpdateInput
}

export type AccountRestrictionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly capability?: string | null
  readonly reasonCode?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: AccountRestrictionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApiRateBucketWhereUniqueInput = {
  readonly id?: string | null
}

export type ApiRateBucketWhereInput = {
  readonly AND?: ReadonlyArray<ApiRateBucketWhereInput> | ApiRateBucketWhereInput | null
  readonly OR?: ReadonlyArray<ApiRateBucketWhereInput> | ApiRateBucketWhereInput | null
  readonly NOT?: ReadonlyArray<ApiRateBucketWhereInput> | ApiRateBucketWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly keyHash?: StringFilter | null
  readonly scope?: StringFilter | null
  readonly windowStartedAt?: DateTimeNullableFilter | null
  readonly count?: IntNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ApiRateBucketOrderByInput = {
  readonly id?: OrderDirection | null
  readonly keyHash?: OrderDirection | null
  readonly scope?: OrderDirection | null
  readonly windowStartedAt?: OrderDirection | null
  readonly count?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ApiRateBucketUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly keyHash?: string | null
  readonly scope?: string | null
  readonly windowStartedAt?: any | null
  readonly count?: number | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApiRateBucketUpdateArgs = {
  readonly where: ApiRateBucketWhereUniqueInput
  readonly data: ApiRateBucketUpdateInput
}

export type ApiRateBucketCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly keyHash?: string | null
  readonly scope?: string | null
  readonly windowStartedAt?: any | null
  readonly count?: number | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApprovalRequestStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'

export type ApprovalRequestWhereUniqueInput = {
  readonly id?: string | null
}

export type ApprovalRequestWhereInput = {
  readonly AND?: ReadonlyArray<ApprovalRequestWhereInput> | ApprovalRequestWhereInput | null
  readonly OR?: ReadonlyArray<ApprovalRequestWhereInput> | ApprovalRequestWhereInput | null
  readonly NOT?: ReadonlyArray<ApprovalRequestWhereInput> | ApprovalRequestWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly action?: StringFilter | null
  readonly payloadHash?: StringFilter | null
  readonly requesterId?: StringFilter | null
  readonly approverId?: StringFilter | null
  readonly status?: ApprovalRequestStatusTypeNullableFilter | null
  readonly reason?: StringFilter | null
  readonly decidedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ApprovalRequestStatusTypeNullableFilter = {
  readonly equals?: ApprovalRequestStatusType | null
  readonly in?: ReadonlyArray<ApprovalRequestStatusType> | ApprovalRequestStatusType | null
  readonly notIn?: ReadonlyArray<ApprovalRequestStatusType> | ApprovalRequestStatusType | null
  readonly not?: ApprovalRequestStatusTypeNullableFilter | null
}

export type ApprovalRequestOrderByInput = {
  readonly id?: OrderDirection | null
  readonly action?: OrderDirection | null
  readonly payloadHash?: OrderDirection | null
  readonly requesterId?: OrderDirection | null
  readonly approverId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly decidedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ApprovalRequestUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly action?: string | null
  readonly payloadHash?: string | null
  readonly requesterId?: string | null
  readonly approverId?: string | null
  readonly status?: ApprovalRequestStatusType | null
  readonly reason?: string | null
  readonly decidedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApprovalRequestUpdateArgs = {
  readonly where: ApprovalRequestWhereUniqueInput
  readonly data: ApprovalRequestUpdateInput
}

export type ApprovalRequestCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly action?: string | null
  readonly payloadHash?: string | null
  readonly requesterId?: string | null
  readonly approverId?: string | null
  readonly status?: ApprovalRequestStatusType | null
  readonly reason?: string | null
  readonly decidedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AuditAnchorStatusType =
  | 'PENDING'
  | 'ANCHORED'
  | 'FAILED'

export type AuditAnchorWhereUniqueInput = {
  readonly id?: string | null
}

export type AuditAnchorWhereInput = {
  readonly AND?: ReadonlyArray<AuditAnchorWhereInput> | AuditAnchorWhereInput | null
  readonly OR?: ReadonlyArray<AuditAnchorWhereInput> | AuditAnchorWhereInput | null
  readonly NOT?: ReadonlyArray<AuditAnchorWhereInput> | AuditAnchorWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly chainHeadHash?: StringFilter | null
  readonly eventCount?: IntNullableFilter | null
  readonly anchoredAt?: DateTimeNullableFilter | null
  readonly externalReference?: StringFilter | null
  readonly status?: AuditAnchorStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AuditAnchorStatusTypeNullableFilter = {
  readonly equals?: AuditAnchorStatusType | null
  readonly in?: ReadonlyArray<AuditAnchorStatusType> | AuditAnchorStatusType | null
  readonly notIn?: ReadonlyArray<AuditAnchorStatusType> | AuditAnchorStatusType | null
  readonly not?: AuditAnchorStatusTypeNullableFilter | null
}

export type AuditAnchorOrderByInput = {
  readonly id?: OrderDirection | null
  readonly chainHeadHash?: OrderDirection | null
  readonly eventCount?: OrderDirection | null
  readonly anchoredAt?: OrderDirection | null
  readonly externalReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AuditAnchorUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly chainHeadHash?: string | null
  readonly eventCount?: number | null
  readonly anchoredAt?: any | null
  readonly externalReference?: string | null
  readonly status?: AuditAnchorStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AuditAnchorUpdateArgs = {
  readonly where: AuditAnchorWhereUniqueInput
  readonly data: AuditAnchorUpdateInput
}

export type AuditAnchorCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly chainHeadHash?: string | null
  readonly eventCount?: number | null
  readonly anchoredAt?: any | null
  readonly externalReference?: string | null
  readonly status?: AuditAnchorStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BalanceProjectionWhereUniqueInput = {
  readonly id?: string | null
}

export type BalanceProjectionWhereInput = {
  readonly AND?: ReadonlyArray<BalanceProjectionWhereInput> | BalanceProjectionWhereInput | null
  readonly OR?: ReadonlyArray<BalanceProjectionWhereInput> | BalanceProjectionWhereInput | null
  readonly NOT?: ReadonlyArray<BalanceProjectionWhereInput> | BalanceProjectionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly account?: LedgerAccountWhereInput | null
  readonly postedMinor?: StringFilter | null
  readonly pendingMinor?: StringFilter | null
  readonly availableMinor?: StringFilter | null
  readonly version?: IntNullableFilter | null
  readonly asOf?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BalanceProjectionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly postedMinor?: OrderDirection | null
  readonly pendingMinor?: OrderDirection | null
  readonly availableMinor?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly asOf?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BalanceProjectionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly account?: LedgerAccountRelateToOneForUpdateInput | null
  readonly postedMinor?: string | null
  readonly pendingMinor?: string | null
  readonly availableMinor?: string | null
  readonly version?: number | null
  readonly asOf?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BalanceProjectionUpdateArgs = {
  readonly where: BalanceProjectionWhereUniqueInput
  readonly data: BalanceProjectionUpdateInput
}

export type BalanceProjectionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly account?: LedgerAccountRelateToOneForCreateInput | null
  readonly postedMinor?: string | null
  readonly pendingMinor?: string | null
  readonly availableMinor?: string | null
  readonly version?: number | null
  readonly asOf?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BetSlipStatusType =
  | 'OPEN'
  | 'QUOTED'
  | 'EXPIRED'
  | 'ACCEPTED'

export type BetSlipWhereUniqueInput = {
  readonly id?: string | null
}

export type BetSlipWhereInput = {
  readonly AND?: ReadonlyArray<BetSlipWhereInput> | BetSlipWhereInput | null
  readonly OR?: ReadonlyArray<BetSlipWhereInput> | BetSlipWhereInput | null
  readonly NOT?: ReadonlyArray<BetSlipWhereInput> | BetSlipWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly currency?: StringFilter | null
  readonly status?: BetSlipStatusTypeNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly version?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BetSlipStatusTypeNullableFilter = {
  readonly equals?: BetSlipStatusType | null
  readonly in?: ReadonlyArray<BetSlipStatusType> | BetSlipStatusType | null
  readonly notIn?: ReadonlyArray<BetSlipStatusType> | BetSlipStatusType | null
  readonly not?: BetSlipStatusTypeNullableFilter | null
}

export type BetSlipOrderByInput = {
  readonly id?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BetSlipUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly currency?: string | null
  readonly status?: BetSlipStatusType | null
  readonly expiresAt?: any | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BetSlipUpdateArgs = {
  readonly where: BetSlipWhereUniqueInput
  readonly data: BetSlipUpdateInput
}

export type BetSlipCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly currency?: string | null
  readonly status?: BetSlipStatusType | null
  readonly expiresAt?: any | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BetSlipItemWhereUniqueInput = {
  readonly id?: string | null
}

export type BetSlipItemWhereInput = {
  readonly AND?: ReadonlyArray<BetSlipItemWhereInput> | BetSlipItemWhereInput | null
  readonly OR?: ReadonlyArray<BetSlipItemWhereInput> | BetSlipItemWhereInput | null
  readonly NOT?: ReadonlyArray<BetSlipItemWhereInput> | BetSlipItemWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly betSlip?: BetSlipWhereInput | null
  readonly selection?: SelectionWhereInput | null
  readonly priceSnapshot?: PriceSnapshotWhereInput | null
  readonly requestedOdds?: StringFilter | null
  readonly line?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BetSlipItemOrderByInput = {
  readonly id?: OrderDirection | null
  readonly requestedOdds?: OrderDirection | null
  readonly line?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BetSlipItemUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly betSlip?: BetSlipRelateToOneForUpdateInput | null
  readonly selection?: SelectionRelateToOneForUpdateInput | null
  readonly priceSnapshot?: PriceSnapshotRelateToOneForUpdateInput | null
  readonly requestedOdds?: string | null
  readonly line?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BetSlipRelateToOneForUpdateInput = {
  readonly create?: BetSlipCreateInput | null
  readonly connect?: BetSlipWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type BetSlipItemUpdateArgs = {
  readonly where: BetSlipItemWhereUniqueInput
  readonly data: BetSlipItemUpdateInput
}

export type BetSlipItemCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly betSlip?: BetSlipRelateToOneForCreateInput | null
  readonly selection?: SelectionRelateToOneForCreateInput | null
  readonly priceSnapshot?: PriceSnapshotRelateToOneForCreateInput | null
  readonly requestedOdds?: string | null
  readonly line?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BetSlipRelateToOneForCreateInput = {
  readonly create?: BetSlipCreateInput | null
  readonly connect?: BetSlipWhereUniqueInput | null
}

export type CashOutOfferStatusType =
  | 'OPEN'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'WITHDRAWN'

export type CashOutOfferWhereUniqueInput = {
  readonly id?: string | null
}

export type CashOutOfferWhereInput = {
  readonly AND?: ReadonlyArray<CashOutOfferWhereInput> | CashOutOfferWhereInput | null
  readonly OR?: ReadonlyArray<CashOutOfferWhereInput> | CashOutOfferWhereInput | null
  readonly NOT?: ReadonlyArray<CashOutOfferWhereInput> | CashOutOfferWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly portionNumerator?: StringFilter | null
  readonly portionDenominator?: StringFilter | null
  readonly feeMinor?: StringFilter | null
  readonly marginBasisPoints?: IntNullableFilter | null
  readonly valuationHash?: StringFilter | null
  readonly wagerVersion?: IntNullableFilter | null
  readonly offeredAt?: DateTimeNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly status?: CashOutOfferStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CashOutOfferStatusTypeNullableFilter = {
  readonly equals?: CashOutOfferStatusType | null
  readonly in?: ReadonlyArray<CashOutOfferStatusType> | CashOutOfferStatusType | null
  readonly notIn?: ReadonlyArray<CashOutOfferStatusType> | CashOutOfferStatusType | null
  readonly not?: CashOutOfferStatusTypeNullableFilter | null
}

export type CashOutOfferOrderByInput = {
  readonly id?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly portionNumerator?: OrderDirection | null
  readonly portionDenominator?: OrderDirection | null
  readonly feeMinor?: OrderDirection | null
  readonly marginBasisPoints?: OrderDirection | null
  readonly valuationHash?: OrderDirection | null
  readonly wagerVersion?: OrderDirection | null
  readonly offeredAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CashOutOfferUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly portionNumerator?: string | null
  readonly portionDenominator?: string | null
  readonly feeMinor?: string | null
  readonly marginBasisPoints?: number | null
  readonly valuationInputs?: import('@keystone-6/core/types').JSONValue | null
  readonly valuationHash?: string | null
  readonly wagerVersion?: number | null
  readonly offeredAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: CashOutOfferStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CashOutOfferUpdateArgs = {
  readonly where: CashOutOfferWhereUniqueInput
  readonly data: CashOutOfferUpdateInput
}

export type CashOutOfferCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly portionNumerator?: string | null
  readonly portionDenominator?: string | null
  readonly feeMinor?: string | null
  readonly marginBasisPoints?: number | null
  readonly valuationInputs?: import('@keystone-6/core/types').JSONValue | null
  readonly valuationHash?: string | null
  readonly wagerVersion?: number | null
  readonly offeredAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: CashOutOfferStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitorStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type CompetitorWhereUniqueInput = {
  readonly id?: string | null
}

export type CompetitorWhereInput = {
  readonly AND?: ReadonlyArray<CompetitorWhereInput> | CompetitorWhereInput | null
  readonly OR?: ReadonlyArray<CompetitorWhereInput> | CompetitorWhereInput | null
  readonly NOT?: ReadonlyArray<CompetitorWhereInput> | CompetitorWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly status?: CompetitorStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CompetitorStatusTypeNullableFilter = {
  readonly equals?: CompetitorStatusType | null
  readonly in?: ReadonlyArray<CompetitorStatusType> | CompetitorStatusType | null
  readonly notIn?: ReadonlyArray<CompetitorStatusType> | CompetitorStatusType | null
  readonly not?: CompetitorStatusTypeNullableFilter | null
}

export type CompetitorOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CompetitorUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly status?: CompetitorStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitorUpdateArgs = {
  readonly where: CompetitorWhereUniqueInput
  readonly data: CompetitorUpdateInput
}

export type CompetitorCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly status?: CompetitorStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ComplianceReportStatusType =
  | 'DRAFT'
  | 'APPROVED'
  | 'SUBMITTED'

export type ComplianceReportWhereUniqueInput = {
  readonly id?: string | null
}

export type ComplianceReportWhereInput = {
  readonly AND?: ReadonlyArray<ComplianceReportWhereInput> | ComplianceReportWhereInput | null
  readonly OR?: ReadonlyArray<ComplianceReportWhereInput> | ComplianceReportWhereInput | null
  readonly NOT?: ReadonlyArray<ComplianceReportWhereInput> | ComplianceReportWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly type?: StringFilter | null
  readonly periodStart?: DateTimeNullableFilter | null
  readonly periodEnd?: DateTimeNullableFilter | null
  readonly version?: IntNullableFilter | null
  readonly artifactHash?: StringFilter | null
  readonly artifactReference?: StringFilter | null
  readonly status?: ComplianceReportStatusTypeNullableFilter | null
  readonly submittedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ComplianceReportStatusTypeNullableFilter = {
  readonly equals?: ComplianceReportStatusType | null
  readonly in?: ReadonlyArray<ComplianceReportStatusType> | ComplianceReportStatusType | null
  readonly notIn?: ReadonlyArray<ComplianceReportStatusType> | ComplianceReportStatusType | null
  readonly not?: ComplianceReportStatusTypeNullableFilter | null
}

export type ComplianceReportOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly periodStart?: OrderDirection | null
  readonly periodEnd?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly artifactHash?: OrderDirection | null
  readonly artifactReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly submittedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ComplianceReportUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly periodStart?: any | null
  readonly periodEnd?: any | null
  readonly version?: number | null
  readonly artifactHash?: string | null
  readonly artifactReference?: string | null
  readonly status?: ComplianceReportStatusType | null
  readonly submittedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ComplianceReportUpdateArgs = {
  readonly where: ComplianceReportWhereUniqueInput
  readonly data: ComplianceReportUpdateInput
}

export type ComplianceReportCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly periodStart?: any | null
  readonly periodEnd?: any | null
  readonly version?: number | null
  readonly artifactHash?: string | null
  readonly artifactReference?: string | null
  readonly status?: ComplianceReportStatusType | null
  readonly submittedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConfigValueWhereUniqueInput = {
  readonly id?: string | null
}

export type ConfigValueWhereInput = {
  readonly AND?: ReadonlyArray<ConfigValueWhereInput> | ConfigValueWhereInput | null
  readonly OR?: ReadonlyArray<ConfigValueWhereInput> | ConfigValueWhereInput | null
  readonly NOT?: ReadonlyArray<ConfigValueWhereInput> | ConfigValueWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly valueType?: StringFilter | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly policyVersion?: StringFilter | null
  readonly effectiveFrom?: DateTimeNullableFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ConfigValueOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly valueType?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly policyVersion?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ConfigValueUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly value?: import('@keystone-6/core/types').JSONValue | null
  readonly valueType?: string | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly policyVersion?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConfigValueUpdateArgs = {
  readonly where: ConfigValueWhereUniqueInput
  readonly data: ConfigValueUpdateInput
}

export type ConfigValueCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly value?: import('@keystone-6/core/types').JSONValue | null
  readonly valueType?: string | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly policyVersion?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConsentWhereUniqueInput = {
  readonly id?: string | null
}

export type ConsentWhereInput = {
  readonly AND?: ReadonlyArray<ConsentWhereInput> | ConsentWhereInput | null
  readonly OR?: ReadonlyArray<ConsentWhereInput> | ConsentWhereInput | null
  readonly NOT?: ReadonlyArray<ConsentWhereInput> | ConsentWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly type?: StringFilter | null
  readonly policyVersion?: StringFilter | null
  readonly givenAt?: DateTimeNullableFilter | null
  readonly withdrawnAt?: DateTimeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ConsentOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly policyVersion?: OrderDirection | null
  readonly givenAt?: OrderDirection | null
  readonly withdrawnAt?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ConsentUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly policyVersion?: string | null
  readonly givenAt?: any | null
  readonly withdrawnAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConsentUpdateArgs = {
  readonly where: ConsentWhereUniqueInput
  readonly data: ConsentUpdateInput
}

export type ConsentCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly policyVersion?: string | null
  readonly givenAt?: any | null
  readonly withdrawnAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DataCorrectionCaseStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'APPLIED'
  | 'REJECTED'

export type DataCorrectionCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type DataCorrectionCaseWhereInput = {
  readonly AND?: ReadonlyArray<DataCorrectionCaseWhereInput> | DataCorrectionCaseWhereInput | null
  readonly OR?: ReadonlyArray<DataCorrectionCaseWhereInput> | DataCorrectionCaseWhereInput | null
  readonly NOT?: ReadonlyArray<DataCorrectionCaseWhereInput> | DataCorrectionCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly reason?: StringFilter | null
  readonly dryRunHash?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly status?: DataCorrectionCaseStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type DataCorrectionCaseStatusTypeNullableFilter = {
  readonly equals?: DataCorrectionCaseStatusType | null
  readonly in?: ReadonlyArray<DataCorrectionCaseStatusType> | DataCorrectionCaseStatusType | null
  readonly notIn?: ReadonlyArray<DataCorrectionCaseStatusType> | DataCorrectionCaseStatusType | null
  readonly not?: DataCorrectionCaseStatusTypeNullableFilter | null
}

export type DataCorrectionCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly dryRunHash?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type DataCorrectionCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly reason?: string | null
  readonly dryRunHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly status?: DataCorrectionCaseStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApprovalRequestRelateToOneForUpdateInput = {
  readonly create?: ApprovalRequestCreateInput | null
  readonly connect?: ApprovalRequestWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type DataCorrectionCaseUpdateArgs = {
  readonly where: DataCorrectionCaseWhereUniqueInput
  readonly data: DataCorrectionCaseUpdateInput
}

export type DataCorrectionCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly reason?: string | null
  readonly dryRunHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly status?: DataCorrectionCaseStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ApprovalRequestRelateToOneForCreateInput = {
  readonly create?: ApprovalRequestCreateInput | null
  readonly connect?: ApprovalRequestWhereUniqueInput | null
}

export type DisputeStatusType =
  | 'OPEN'
  | 'TRIAGED'
  | 'INVESTIGATING'
  | 'PROPOSED_RESOLUTION'
  | 'RESOLVED'
  | 'REJECTED'
  | 'APPEALED'

export type DisputeWhereUniqueInput = {
  readonly id?: string | null
}

export type DisputeWhereInput = {
  readonly AND?: ReadonlyArray<DisputeWhereInput> | DisputeWhereInput | null
  readonly OR?: ReadonlyArray<DisputeWhereInput> | DisputeWhereInput | null
  readonly NOT?: ReadonlyArray<DisputeWhereInput> | DisputeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly category?: StringFilter | null
  readonly status?: DisputeStatusTypeNullableFilter | null
  readonly resolution?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly resolvedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type DisputeStatusTypeNullableFilter = {
  readonly equals?: DisputeStatusType | null
  readonly in?: ReadonlyArray<DisputeStatusType> | DisputeStatusType | null
  readonly notIn?: ReadonlyArray<DisputeStatusType> | DisputeStatusType | null
  readonly not?: DisputeStatusTypeNullableFilter | null
}

export type DisputeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly category?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly resolution?: OrderDirection | null
  readonly resolvedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type DisputeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly category?: string | null
  readonly status?: DisputeStatusType | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly resolution?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DisputeUpdateArgs = {
  readonly where: DisputeWhereUniqueInput
  readonly data: DisputeUpdateInput
}

export type DisputeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly category?: string | null
  readonly status?: DisputeStatusType | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly resolution?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DisputeEventWhereUniqueInput = {
  readonly id?: string | null
}

export type DisputeEventWhereInput = {
  readonly AND?: ReadonlyArray<DisputeEventWhereInput> | DisputeEventWhereInput | null
  readonly OR?: ReadonlyArray<DisputeEventWhereInput> | DisputeEventWhereInput | null
  readonly NOT?: ReadonlyArray<DisputeEventWhereInput> | DisputeEventWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly dispute?: DisputeWhereInput | null
  readonly type?: StringFilter | null
  readonly actorId?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type DisputeEventOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type DisputeEventUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly dispute?: DisputeRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly actorId?: string | null
  readonly evidenceHash?: string | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DisputeRelateToOneForUpdateInput = {
  readonly create?: DisputeCreateInput | null
  readonly connect?: DisputeWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type DisputeEventUpdateArgs = {
  readonly where: DisputeEventWhereUniqueInput
  readonly data: DisputeEventUpdateInput
}

export type DisputeEventCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly dispute?: DisputeRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly actorId?: string | null
  readonly evidenceHash?: string | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DisputeRelateToOneForCreateInput = {
  readonly create?: DisputeCreateInput | null
  readonly connect?: DisputeWhereUniqueInput | null
}

export type EventParticipantWhereUniqueInput = {
  readonly id?: string | null
}

export type EventParticipantWhereInput = {
  readonly AND?: ReadonlyArray<EventParticipantWhereInput> | EventParticipantWhereInput | null
  readonly OR?: ReadonlyArray<EventParticipantWhereInput> | EventParticipantWhereInput | null
  readonly NOT?: ReadonlyArray<EventParticipantWhereInput> | EventParticipantWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly event?: EventWhereInput | null
  readonly competitor?: CompetitorWhereInput | null
  readonly role?: StringFilter | null
  readonly sortOrder?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type EventParticipantOrderByInput = {
  readonly id?: OrderDirection | null
  readonly role?: OrderDirection | null
  readonly sortOrder?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type EventParticipantUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly event?: EventRelateToOneForUpdateInput | null
  readonly competitor?: CompetitorRelateToOneForUpdateInput | null
  readonly role?: string | null
  readonly sortOrder?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitorRelateToOneForUpdateInput = {
  readonly create?: CompetitorCreateInput | null
  readonly connect?: CompetitorWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type EventParticipantUpdateArgs = {
  readonly where: EventParticipantWhereUniqueInput
  readonly data: EventParticipantUpdateInput
}

export type EventParticipantCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly event?: EventRelateToOneForCreateInput | null
  readonly competitor?: CompetitorRelateToOneForCreateInput | null
  readonly role?: string | null
  readonly sortOrder?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitorRelateToOneForCreateInput = {
  readonly create?: CompetitorCreateInput | null
  readonly connect?: CompetitorWhereUniqueInput | null
}

export type ExposurePositionWhereUniqueInput = {
  readonly id?: string | null
}

export type ExposurePositionWhereInput = {
  readonly AND?: ReadonlyArray<ExposurePositionWhereInput> | ExposurePositionWhereInput | null
  readonly OR?: ReadonlyArray<ExposurePositionWhereInput> | ExposurePositionWhereInput | null
  readonly NOT?: ReadonlyArray<ExposurePositionWhereInput> | ExposurePositionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly stakeMinor?: StringFilter | null
  readonly liabilityMinor?: StringFilter | null
  readonly version?: IntNullableFilter | null
  readonly asOf?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ExposurePositionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly liabilityMinor?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly asOf?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ExposurePositionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly currency?: string | null
  readonly stakeMinor?: string | null
  readonly liabilityMinor?: string | null
  readonly version?: number | null
  readonly asOf?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ExposurePositionUpdateArgs = {
  readonly where: ExposurePositionWhereUniqueInput
  readonly data: ExposurePositionUpdateInput
}

export type ExposurePositionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly currency?: string | null
  readonly stakeMinor?: string | null
  readonly liabilityMinor?: string | null
  readonly version?: number | null
  readonly asOf?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type GeoCheckDecisionType =
  | 'ALLOW'
  | 'DENY'
  | 'UNKNOWN'

export type GeoCheckWhereUniqueInput = {
  readonly id?: string | null
}

export type GeoCheckWhereInput = {
  readonly AND?: ReadonlyArray<GeoCheckWhereInput> | GeoCheckWhereInput | null
  readonly OR?: ReadonlyArray<GeoCheckWhereInput> | GeoCheckWhereInput | null
  readonly NOT?: ReadonlyArray<GeoCheckWhereInput> | GeoCheckWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly geoSession?: GeoSessionWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly decision?: GeoCheckDecisionTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly checkedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type GeoCheckDecisionTypeNullableFilter = {
  readonly equals?: GeoCheckDecisionType | null
  readonly in?: ReadonlyArray<GeoCheckDecisionType> | GeoCheckDecisionType | null
  readonly notIn?: ReadonlyArray<GeoCheckDecisionType> | GeoCheckDecisionType | null
  readonly not?: GeoCheckDecisionTypeNullableFilter | null
}

export type GeoCheckOrderByInput = {
  readonly id?: OrderDirection | null
  readonly decision?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly checkedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type GeoCheckUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly geoSession?: GeoSessionRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly decision?: GeoCheckDecisionType | null
  readonly reasonCode?: string | null
  readonly coarseEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly checkedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type GeoSessionRelateToOneForUpdateInput = {
  readonly create?: GeoSessionCreateInput | null
  readonly connect?: GeoSessionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type GeoCheckUpdateArgs = {
  readonly where: GeoCheckWhereUniqueInput
  readonly data: GeoCheckUpdateInput
}

export type GeoCheckCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly geoSession?: GeoSessionRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly decision?: GeoCheckDecisionType | null
  readonly reasonCode?: string | null
  readonly coarseEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly checkedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type GeoSessionRelateToOneForCreateInput = {
  readonly create?: GeoSessionCreateInput | null
  readonly connect?: GeoSessionWhereUniqueInput | null
}

export type GeoSessionStatusType =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'

export type GeoSessionWhereUniqueInput = {
  readonly id?: string | null
}

export type GeoSessionWhereInput = {
  readonly AND?: ReadonlyArray<GeoSessionWhereInput> | GeoSessionWhereInput | null
  readonly OR?: ReadonlyArray<GeoSessionWhereInput> | GeoSessionWhereInput | null
  readonly NOT?: ReadonlyArray<GeoSessionWhereInput> | GeoSessionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly sessionKey?: StringFilter | null
  readonly status?: GeoSessionStatusTypeNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type GeoSessionStatusTypeNullableFilter = {
  readonly equals?: GeoSessionStatusType | null
  readonly in?: ReadonlyArray<GeoSessionStatusType> | GeoSessionStatusType | null
  readonly notIn?: ReadonlyArray<GeoSessionStatusType> | GeoSessionStatusType | null
  readonly not?: GeoSessionStatusTypeNullableFilter | null
}

export type GeoSessionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly sessionKey?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type GeoSessionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly sessionKey?: string | null
  readonly status?: GeoSessionStatusType | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type GeoSessionUpdateArgs = {
  readonly where: GeoSessionWhereUniqueInput
  readonly data: GeoSessionUpdateInput
}

export type GeoSessionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly sessionKey?: string | null
  readonly status?: GeoSessionStatusType | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type IncidentSeverityType =
  | 'SEV1'
  | 'SEV2'
  | 'SEV3'
  | 'SEV4'

export type IncidentStatusType =
  | 'OPEN'
  | 'MITIGATING'
  | 'RESOLVED'

export type IncidentWhereUniqueInput = {
  readonly id?: string | null
}

export type IncidentWhereInput = {
  readonly AND?: ReadonlyArray<IncidentWhereInput> | IncidentWhereInput | null
  readonly OR?: ReadonlyArray<IncidentWhereInput> | IncidentWhereInput | null
  readonly NOT?: ReadonlyArray<IncidentWhereInput> | IncidentWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly severity?: IncidentSeverityTypeNullableFilter | null
  readonly title?: StringFilter | null
  readonly status?: IncidentStatusTypeNullableFilter | null
  readonly commanderId?: StringFilter | null
  readonly resolvedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type IncidentSeverityTypeNullableFilter = {
  readonly equals?: IncidentSeverityType | null
  readonly in?: ReadonlyArray<IncidentSeverityType> | IncidentSeverityType | null
  readonly notIn?: ReadonlyArray<IncidentSeverityType> | IncidentSeverityType | null
  readonly not?: IncidentSeverityTypeNullableFilter | null
}

export type IncidentStatusTypeNullableFilter = {
  readonly equals?: IncidentStatusType | null
  readonly in?: ReadonlyArray<IncidentStatusType> | IncidentStatusType | null
  readonly notIn?: ReadonlyArray<IncidentStatusType> | IncidentStatusType | null
  readonly not?: IncidentStatusTypeNullableFilter | null
}

export type IncidentOrderByInput = {
  readonly id?: OrderDirection | null
  readonly severity?: OrderDirection | null
  readonly title?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly commanderId?: OrderDirection | null
  readonly resolvedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type IncidentUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly severity?: IncidentSeverityType | null
  readonly title?: string | null
  readonly status?: IncidentStatusType | null
  readonly commanderId?: string | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type IncidentUpdateArgs = {
  readonly where: IncidentWhereUniqueInput
  readonly data: IncidentUpdateInput
}

export type IncidentCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly severity?: IncidentSeverityType | null
  readonly title?: string | null
  readonly status?: IncidentStatusType | null
  readonly commanderId?: string | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly resolvedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegGradeWhereUniqueInput = {
  readonly id?: string | null
}

export type LegGradeWhereInput = {
  readonly AND?: ReadonlyArray<LegGradeWhereInput> | LegGradeWhereInput | null
  readonly OR?: ReadonlyArray<LegGradeWhereInput> | LegGradeWhereInput | null
  readonly NOT?: ReadonlyArray<LegGradeWhereInput> | LegGradeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wagerLeg?: WagerLegWhereInput | null
  readonly marketGrade?: MarketGradeWhereInput | null
  readonly outcome?: StringFilter | null
  readonly factorNumerator?: StringFilter | null
  readonly factorDenominator?: StringFilter | null
  readonly inputHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LegGradeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly outcome?: OrderDirection | null
  readonly factorNumerator?: OrderDirection | null
  readonly factorDenominator?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LegGradeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wagerLeg?: WagerLegRelateToOneForUpdateInput | null
  readonly marketGrade?: MarketGradeRelateToOneForUpdateInput | null
  readonly outcome?: string | null
  readonly factorNumerator?: string | null
  readonly factorDenominator?: string | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerLegRelateToOneForUpdateInput = {
  readonly create?: WagerLegCreateInput | null
  readonly connect?: WagerLegWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type MarketGradeRelateToOneForUpdateInput = {
  readonly create?: MarketGradeCreateInput | null
  readonly connect?: MarketGradeWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type LegGradeUpdateArgs = {
  readonly where: LegGradeWhereUniqueInput
  readonly data: LegGradeUpdateInput
}

export type LegGradeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wagerLeg?: WagerLegRelateToOneForCreateInput | null
  readonly marketGrade?: MarketGradeRelateToOneForCreateInput | null
  readonly outcome?: string | null
  readonly factorNumerator?: string | null
  readonly factorDenominator?: string | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerLegRelateToOneForCreateInput = {
  readonly create?: WagerLegCreateInput | null
  readonly connect?: WagerLegWhereUniqueInput | null
}

export type MarketGradeRelateToOneForCreateInput = {
  readonly create?: MarketGradeCreateInput | null
  readonly connect?: MarketGradeWhereUniqueInput | null
}

export type LegalHoldStatusType =
  | 'ACTIVE'
  | 'RELEASED'

export type LegalHoldWhereUniqueInput = {
  readonly id?: string | null
}

export type LegalHoldWhereInput = {
  readonly AND?: ReadonlyArray<LegalHoldWhereInput> | LegalHoldWhereInput | null
  readonly OR?: ReadonlyArray<LegalHoldWhereInput> | LegalHoldWhereInput | null
  readonly NOT?: ReadonlyArray<LegalHoldWhereInput> | LegalHoldWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly reason?: StringFilter | null
  readonly startsAt?: DateTimeNullableFilter | null
  readonly endsAt?: DateTimeNullableFilter | null
  readonly status?: LegalHoldStatusTypeNullableFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LegalHoldStatusTypeNullableFilter = {
  readonly equals?: LegalHoldStatusType | null
  readonly in?: ReadonlyArray<LegalHoldStatusType> | LegalHoldStatusType | null
  readonly notIn?: ReadonlyArray<LegalHoldStatusType> | LegalHoldStatusType | null
  readonly not?: LegalHoldStatusTypeNullableFilter | null
}

export type LegalHoldOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly endsAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LegalHoldUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly reason?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: LegalHoldStatusType | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegalHoldUpdateArgs = {
  readonly where: LegalHoldWhereUniqueInput
  readonly data: LegalHoldUpdateInput
}

export type LegalHoldCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly reason?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: LegalHoldStatusType | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LimitProfileStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type LimitProfileWhereUniqueInput = {
  readonly id?: string | null
}

export type LimitProfileWhereInput = {
  readonly AND?: ReadonlyArray<LimitProfileWhereInput> | LimitProfileWhereInput | null
  readonly OR?: ReadonlyArray<LimitProfileWhereInput> | LimitProfileWhereInput | null
  readonly NOT?: ReadonlyArray<LimitProfileWhereInput> | LimitProfileWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly version?: IntNullableFilter | null
  readonly status?: LimitProfileStatusTypeNullableFilter | null
  readonly effectiveFrom?: DateTimeNullableFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LimitProfileStatusTypeNullableFilter = {
  readonly equals?: LimitProfileStatusType | null
  readonly in?: ReadonlyArray<LimitProfileStatusType> | LimitProfileStatusType | null
  readonly notIn?: ReadonlyArray<LimitProfileStatusType> | LimitProfileStatusType | null
  readonly not?: LimitProfileStatusTypeNullableFilter | null
}

export type LimitProfileOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LimitProfileUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly version?: number | null
  readonly status?: LimitProfileStatusType | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LimitProfileUpdateArgs = {
  readonly where: LimitProfileWhereUniqueInput
  readonly data: LimitProfileUpdateInput
}

export type LimitProfileCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly version?: number | null
  readonly status?: LimitProfileStatusType | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LimitRuleWhereUniqueInput = {
  readonly id?: string | null
}

export type LimitRuleWhereInput = {
  readonly AND?: ReadonlyArray<LimitRuleWhereInput> | LimitRuleWhereInput | null
  readonly OR?: ReadonlyArray<LimitRuleWhereInput> | LimitRuleWhereInput | null
  readonly NOT?: ReadonlyArray<LimitRuleWhereInput> | LimitRuleWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly profile?: LimitProfileWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly maxStakeMinor?: StringFilter | null
  readonly maxPayoutMinor?: StringFilter | null
  readonly maxLiabilityMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly priority?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LimitRuleOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly maxStakeMinor?: OrderDirection | null
  readonly maxPayoutMinor?: OrderDirection | null
  readonly maxLiabilityMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly priority?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LimitRuleUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly profile?: LimitProfileRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly maxStakeMinor?: string | null
  readonly maxPayoutMinor?: string | null
  readonly maxLiabilityMinor?: string | null
  readonly currency?: string | null
  readonly priority?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LimitProfileRelateToOneForUpdateInput = {
  readonly create?: LimitProfileCreateInput | null
  readonly connect?: LimitProfileWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type LimitRuleUpdateArgs = {
  readonly where: LimitRuleWhereUniqueInput
  readonly data: LimitRuleUpdateInput
}

export type LimitRuleCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly profile?: LimitProfileRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly maxStakeMinor?: string | null
  readonly maxPayoutMinor?: string | null
  readonly maxLiabilityMinor?: string | null
  readonly currency?: string | null
  readonly priority?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LimitProfileRelateToOneForCreateInput = {
  readonly create?: LimitProfileCreateInput | null
  readonly connect?: LimitProfileWhereUniqueInput | null
}

export type MarketGradeWhereUniqueInput = {
  readonly id?: string | null
}

export type MarketGradeWhereInput = {
  readonly AND?: ReadonlyArray<MarketGradeWhereInput> | MarketGradeWhereInput | null
  readonly OR?: ReadonlyArray<MarketGradeWhereInput> | MarketGradeWhereInput | null
  readonly NOT?: ReadonlyArray<MarketGradeWhereInput> | MarketGradeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly market?: MarketWhereInput | null
  readonly resultVersion?: ResultVersionWhereInput | null
  readonly ruleVersion?: StringFilter | null
  readonly outcome?: StringFilter | null
  readonly factorNumerator?: StringFilter | null
  readonly factorDenominator?: StringFilter | null
  readonly inputHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type MarketGradeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly ruleVersion?: OrderDirection | null
  readonly outcome?: OrderDirection | null
  readonly factorNumerator?: OrderDirection | null
  readonly factorDenominator?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type MarketGradeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly market?: MarketRelateToOneForUpdateInput | null
  readonly resultVersion?: ResultVersionRelateToOneForUpdateInput | null
  readonly ruleVersion?: string | null
  readonly outcome?: string | null
  readonly factorNumerator?: string | null
  readonly factorDenominator?: string | null
  readonly trace?: import('@keystone-6/core/types').JSONValue | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type MarketGradeUpdateArgs = {
  readonly where: MarketGradeWhereUniqueInput
  readonly data: MarketGradeUpdateInput
}

export type MarketGradeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly market?: MarketRelateToOneForCreateInput | null
  readonly resultVersion?: ResultVersionRelateToOneForCreateInput | null
  readonly ruleVersion?: string | null
  readonly outcome?: string | null
  readonly factorNumerator?: string | null
  readonly factorDenominator?: string | null
  readonly trace?: import('@keystone-6/core/types').JSONValue | null
  readonly inputHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OnboardingProgressStatusType =
  | 'PENDING'
  | 'COMPLETE'
  | 'BLOCKED'

export type OnboardingProgressWhereUniqueInput = {
  readonly id?: string | null
}

export type OnboardingProgressWhereInput = {
  readonly AND?: ReadonlyArray<OnboardingProgressWhereInput> | OnboardingProgressWhereInput | null
  readonly OR?: ReadonlyArray<OnboardingProgressWhereInput> | OnboardingProgressWhereInput | null
  readonly NOT?: ReadonlyArray<OnboardingProgressWhereInput> | OnboardingProgressWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly stage?: StringFilter | null
  readonly status?: OnboardingProgressStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type OnboardingProgressStatusTypeNullableFilter = {
  readonly equals?: OnboardingProgressStatusType | null
  readonly in?: ReadonlyArray<OnboardingProgressStatusType> | OnboardingProgressStatusType | null
  readonly notIn?: ReadonlyArray<OnboardingProgressStatusType> | OnboardingProgressStatusType | null
  readonly not?: OnboardingProgressStatusTypeNullableFilter | null
}

export type OnboardingProgressOrderByInput = {
  readonly id?: OrderDirection | null
  readonly stage?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type OnboardingProgressUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly stage?: string | null
  readonly status?: OnboardingProgressStatusType | null
  readonly evidenceHash?: string | null
  readonly completedAt?: any | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OnboardingProgressUpdateArgs = {
  readonly where: OnboardingProgressWhereUniqueInput
  readonly data: OnboardingProgressUpdateInput
}

export type OnboardingProgressCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly stage?: string | null
  readonly status?: OnboardingProgressStatusType | null
  readonly evidenceHash?: string | null
  readonly completedAt?: any | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PaymentAttemptStatusType =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'UNKNOWN'

export type PaymentAttemptWhereUniqueInput = {
  readonly id?: string | null
}

export type PaymentAttemptWhereInput = {
  readonly AND?: ReadonlyArray<PaymentAttemptWhereInput> | PaymentAttemptWhereInput | null
  readonly OR?: ReadonlyArray<PaymentAttemptWhereInput> | PaymentAttemptWhereInput | null
  readonly NOT?: ReadonlyArray<PaymentAttemptWhereInput> | PaymentAttemptWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly paymentIntent?: PaymentIntentWhereInput | null
  readonly attempt?: IntNullableFilter | null
  readonly externalReference?: StringFilter | null
  readonly status?: PaymentAttemptStatusTypeNullableFilter | null
  readonly rawEnvelope?: RawEnvelopeWhereInput | null
  readonly reasonCode?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PaymentAttemptStatusTypeNullableFilter = {
  readonly equals?: PaymentAttemptStatusType | null
  readonly in?: ReadonlyArray<PaymentAttemptStatusType> | PaymentAttemptStatusType | null
  readonly notIn?: ReadonlyArray<PaymentAttemptStatusType> | PaymentAttemptStatusType | null
  readonly not?: PaymentAttemptStatusTypeNullableFilter | null
}

export type PaymentAttemptOrderByInput = {
  readonly id?: OrderDirection | null
  readonly attempt?: OrderDirection | null
  readonly externalReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PaymentAttemptUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly paymentIntent?: PaymentIntentRelateToOneForUpdateInput | null
  readonly attempt?: number | null
  readonly externalReference?: string | null
  readonly status?: PaymentAttemptStatusType | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForUpdateInput | null
  readonly reasonCode?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PaymentIntentRelateToOneForUpdateInput = {
  readonly create?: PaymentIntentCreateInput | null
  readonly connect?: PaymentIntentWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PaymentAttemptUpdateArgs = {
  readonly where: PaymentAttemptWhereUniqueInput
  readonly data: PaymentAttemptUpdateInput
}

export type PaymentAttemptCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly paymentIntent?: PaymentIntentRelateToOneForCreateInput | null
  readonly attempt?: number | null
  readonly externalReference?: string | null
  readonly status?: PaymentAttemptStatusType | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForCreateInput | null
  readonly reasonCode?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PaymentIntentRelateToOneForCreateInput = {
  readonly create?: PaymentIntentCreateInput | null
  readonly connect?: PaymentIntentWhereUniqueInput | null
}

export type PaymentIntentTypeType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'CHARGEBACK'
  | 'ADJUSTMENT'

export type PaymentIntentStatusType =
  | 'PENDING'
  | 'REVIEW'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'UNKNOWN'
  | 'CANCELLED'

export type PaymentIntentWhereUniqueInput = {
  readonly id?: string | null
}

export type PaymentIntentWhereInput = {
  readonly AND?: ReadonlyArray<PaymentIntentWhereInput> | PaymentIntentWhereInput | null
  readonly OR?: ReadonlyArray<PaymentIntentWhereInput> | PaymentIntentWhereInput | null
  readonly NOT?: ReadonlyArray<PaymentIntentWhereInput> | PaymentIntentWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly type?: PaymentIntentTypeTypeNullableFilter | null
  readonly amountMinor?: StringFilter | null
  readonly feeMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly status?: PaymentIntentStatusTypeNullableFilter | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly paymentMethodReference?: StringFilter | null
  readonly providerSessionReference?: StringFilter | null
  readonly hold?: HoldWhereInput | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PaymentIntentTypeTypeNullableFilter = {
  readonly equals?: PaymentIntentTypeType | null
  readonly in?: ReadonlyArray<PaymentIntentTypeType> | PaymentIntentTypeType | null
  readonly notIn?: ReadonlyArray<PaymentIntentTypeType> | PaymentIntentTypeType | null
  readonly not?: PaymentIntentTypeTypeNullableFilter | null
}

export type PaymentIntentStatusTypeNullableFilter = {
  readonly equals?: PaymentIntentStatusType | null
  readonly in?: ReadonlyArray<PaymentIntentStatusType> | PaymentIntentStatusType | null
  readonly notIn?: ReadonlyArray<PaymentIntentStatusType> | PaymentIntentStatusType | null
  readonly not?: PaymentIntentStatusTypeNullableFilter | null
}

export type PaymentIntentOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly feeMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly paymentMethodReference?: OrderDirection | null
  readonly providerSessionReference?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PaymentIntentUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly type?: PaymentIntentTypeType | null
  readonly amountMinor?: string | null
  readonly feeMinor?: string | null
  readonly currency?: string | null
  readonly idempotencyKey?: string | null
  readonly status?: PaymentIntentStatusType | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly paymentMethodReference?: string | null
  readonly providerSessionReference?: string | null
  readonly hold?: HoldRelateToOneForUpdateInput | null
  readonly riskEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type HoldRelateToOneForUpdateInput = {
  readonly create?: HoldCreateInput | null
  readonly connect?: HoldWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type PaymentIntentUpdateArgs = {
  readonly where: PaymentIntentWhereUniqueInput
  readonly data: PaymentIntentUpdateInput
}

export type PaymentIntentCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly type?: PaymentIntentTypeType | null
  readonly amountMinor?: string | null
  readonly feeMinor?: string | null
  readonly currency?: string | null
  readonly idempotencyKey?: string | null
  readonly status?: PaymentIntentStatusType | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly paymentMethodReference?: string | null
  readonly providerSessionReference?: string | null
  readonly hold?: HoldRelateToOneForCreateInput | null
  readonly riskEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type HoldRelateToOneForCreateInput = {
  readonly create?: HoldCreateInput | null
  readonly connect?: HoldWhereUniqueInput | null
}

export type PlayerIdentityClassificationType =
  | 'RESTRICTED_PII'

export type PlayerIdentityWhereUniqueInput = {
  readonly id?: string | null
}

export type PlayerIdentityWhereInput = {
  readonly AND?: ReadonlyArray<PlayerIdentityWhereInput> | PlayerIdentityWhereInput | null
  readonly OR?: ReadonlyArray<PlayerIdentityWhereInput> | PlayerIdentityWhereInput | null
  readonly NOT?: ReadonlyArray<PlayerIdentityWhereInput> | PlayerIdentityWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly encryptedPayload?: StringFilter | null
  readonly encryptionKeyRef?: StringFilter | null
  readonly classification?: PlayerIdentityClassificationTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PlayerIdentityClassificationTypeNullableFilter = {
  readonly equals?: PlayerIdentityClassificationType | null
  readonly in?: ReadonlyArray<PlayerIdentityClassificationType> | PlayerIdentityClassificationType | null
  readonly notIn?: ReadonlyArray<PlayerIdentityClassificationType> | PlayerIdentityClassificationType | null
  readonly not?: PlayerIdentityClassificationTypeNullableFilter | null
}

export type PlayerIdentityOrderByInput = {
  readonly id?: OrderDirection | null
  readonly encryptedPayload?: OrderDirection | null
  readonly encryptionKeyRef?: OrderDirection | null
  readonly classification?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PlayerIdentityUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly encryptedPayload?: string | null
  readonly tokenizedIdentifiers?: import('@keystone-6/core/types').JSONValue | null
  readonly encryptionKeyRef?: string | null
  readonly classification?: PlayerIdentityClassificationType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerIdentityUpdateArgs = {
  readonly where: PlayerIdentityWhereUniqueInput
  readonly data: PlayerIdentityUpdateInput
}

export type PlayerIdentityCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly encryptedPayload?: string | null
  readonly tokenizedIdentifiers?: import('@keystone-6/core/types').JSONValue | null
  readonly encryptionKeyRef?: string | null
  readonly classification?: PlayerIdentityClassificationType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ProviderEntityMappingStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export type ProviderEntityMappingWhereUniqueInput = {
  readonly id?: string | null
}

export type ProviderEntityMappingWhereInput = {
  readonly AND?: ReadonlyArray<ProviderEntityMappingWhereInput> | ProviderEntityMappingWhereInput | null
  readonly OR?: ReadonlyArray<ProviderEntityMappingWhereInput> | ProviderEntityMappingWhereInput | null
  readonly NOT?: ReadonlyArray<ProviderEntityMappingWhereInput> | ProviderEntityMappingWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly entityType?: StringFilter | null
  readonly externalId?: StringFilter | null
  readonly canonicalType?: StringFilter | null
  readonly canonicalId?: StringFilter | null
  readonly confidence?: StringFilter | null
  readonly status?: ProviderEntityMappingStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ProviderEntityMappingStatusTypeNullableFilter = {
  readonly equals?: ProviderEntityMappingStatusType | null
  readonly in?: ReadonlyArray<ProviderEntityMappingStatusType> | ProviderEntityMappingStatusType | null
  readonly notIn?: ReadonlyArray<ProviderEntityMappingStatusType> | ProviderEntityMappingStatusType | null
  readonly not?: ProviderEntityMappingStatusTypeNullableFilter | null
}

export type ProviderEntityMappingOrderByInput = {
  readonly id?: OrderDirection | null
  readonly entityType?: OrderDirection | null
  readonly externalId?: OrderDirection | null
  readonly canonicalType?: OrderDirection | null
  readonly canonicalId?: OrderDirection | null
  readonly confidence?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ProviderEntityMappingUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly entityType?: string | null
  readonly externalId?: string | null
  readonly canonicalType?: string | null
  readonly canonicalId?: string | null
  readonly confidence?: string | null
  readonly status?: ProviderEntityMappingStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ProviderEntityMappingUpdateArgs = {
  readonly where: ProviderEntityMappingWhereUniqueInput
  readonly data: ProviderEntityMappingUpdateInput
}

export type ProviderEntityMappingCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly entityType?: string | null
  readonly externalId?: string | null
  readonly canonicalType?: string | null
  readonly canonicalId?: string | null
  readonly confidence?: string | null
  readonly status?: ProviderEntityMappingStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ReconciliationItemStatusType =
  | 'MATCHED'
  | 'OPEN'
  | 'RESOLVED'

export type ReconciliationItemWhereUniqueInput = {
  readonly id?: string | null
}

export type ReconciliationItemWhereInput = {
  readonly AND?: ReadonlyArray<ReconciliationItemWhereInput> | ReconciliationItemWhereInput | null
  readonly OR?: ReadonlyArray<ReconciliationItemWhereInput> | ReconciliationItemWhereInput | null
  readonly NOT?: ReadonlyArray<ReconciliationItemWhereInput> | ReconciliationItemWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly run?: ReconciliationRunWhereInput | null
  readonly internalReference?: StringFilter | null
  readonly providerReference?: StringFilter | null
  readonly differenceMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly status?: ReconciliationItemStatusTypeNullableFilter | null
  readonly resolutionJournal?: JournalTransactionWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ReconciliationItemStatusTypeNullableFilter = {
  readonly equals?: ReconciliationItemStatusType | null
  readonly in?: ReadonlyArray<ReconciliationItemStatusType> | ReconciliationItemStatusType | null
  readonly notIn?: ReadonlyArray<ReconciliationItemStatusType> | ReconciliationItemStatusType | null
  readonly not?: ReconciliationItemStatusTypeNullableFilter | null
}

export type ReconciliationItemOrderByInput = {
  readonly id?: OrderDirection | null
  readonly internalReference?: OrderDirection | null
  readonly providerReference?: OrderDirection | null
  readonly differenceMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ReconciliationItemUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly run?: ReconciliationRunRelateToOneForUpdateInput | null
  readonly internalReference?: string | null
  readonly providerReference?: string | null
  readonly differenceMinor?: string | null
  readonly currency?: string | null
  readonly status?: ReconciliationItemStatusType | null
  readonly resolutionJournal?: JournalTransactionRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ReconciliationRunRelateToOneForUpdateInput = {
  readonly create?: ReconciliationRunCreateInput | null
  readonly connect?: ReconciliationRunWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type ReconciliationItemUpdateArgs = {
  readonly where: ReconciliationItemWhereUniqueInput
  readonly data: ReconciliationItemUpdateInput
}

export type ReconciliationItemCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly run?: ReconciliationRunRelateToOneForCreateInput | null
  readonly internalReference?: string | null
  readonly providerReference?: string | null
  readonly differenceMinor?: string | null
  readonly currency?: string | null
  readonly status?: ReconciliationItemStatusType | null
  readonly resolutionJournal?: JournalTransactionRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ReconciliationRunRelateToOneForCreateInput = {
  readonly create?: ReconciliationRunCreateInput | null
  readonly connect?: ReconciliationRunWhereUniqueInput | null
}

export type ReconciliationRunStatusType =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'

export type ReconciliationRunWhereUniqueInput = {
  readonly id?: string | null
}

export type ReconciliationRunWhereInput = {
  readonly AND?: ReadonlyArray<ReconciliationRunWhereInput> | ReconciliationRunWhereInput | null
  readonly OR?: ReadonlyArray<ReconciliationRunWhereInput> | ReconciliationRunWhereInput | null
  readonly NOT?: ReadonlyArray<ReconciliationRunWhereInput> | ReconciliationRunWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly type?: StringFilter | null
  readonly windowFrom?: DateTimeNullableFilter | null
  readonly windowTo?: DateTimeNullableFilter | null
  readonly status?: ReconciliationRunStatusTypeNullableFilter | null
  readonly inputHash?: StringFilter | null
  readonly differenceMinor?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ReconciliationRunStatusTypeNullableFilter = {
  readonly equals?: ReconciliationRunStatusType | null
  readonly in?: ReadonlyArray<ReconciliationRunStatusType> | ReconciliationRunStatusType | null
  readonly notIn?: ReadonlyArray<ReconciliationRunStatusType> | ReconciliationRunStatusType | null
  readonly not?: ReconciliationRunStatusTypeNullableFilter | null
}

export type ReconciliationRunOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly windowFrom?: OrderDirection | null
  readonly windowTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly differenceMinor?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ReconciliationRunUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly windowFrom?: any | null
  readonly windowTo?: any | null
  readonly status?: ReconciliationRunStatusType | null
  readonly inputHash?: string | null
  readonly differenceMinor?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ReconciliationRunUpdateArgs = {
  readonly where: ReconciliationRunWhereUniqueInput
  readonly data: ReconciliationRunUpdateInput
}

export type ReconciliationRunCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly windowFrom?: any | null
  readonly windowTo?: any | null
  readonly status?: ReconciliationRunStatusType | null
  readonly inputHash?: string | null
  readonly differenceMinor?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResettlementCaseStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'

export type ResettlementCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type ResettlementCaseWhereInput = {
  readonly AND?: ReadonlyArray<ResettlementCaseWhereInput> | ResettlementCaseWhereInput | null
  readonly OR?: ReadonlyArray<ResettlementCaseWhereInput> | ResettlementCaseWhereInput | null
  readonly NOT?: ReadonlyArray<ResettlementCaseWhereInput> | ResettlementCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly oldSettlement?: SettlementWhereInput | null
  readonly newResultVersion?: ResultVersionWhereInput | null
  readonly reason?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly status?: ResettlementCaseStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ResettlementCaseStatusTypeNullableFilter = {
  readonly equals?: ResettlementCaseStatusType | null
  readonly in?: ReadonlyArray<ResettlementCaseStatusType> | ResettlementCaseStatusType | null
  readonly notIn?: ReadonlyArray<ResettlementCaseStatusType> | ResettlementCaseStatusType | null
  readonly not?: ResettlementCaseStatusTypeNullableFilter | null
}

export type ResettlementCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ResettlementCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly oldSettlement?: SettlementRelateToOneForUpdateInput | null
  readonly newResultVersion?: ResultVersionRelateToOneForUpdateInput | null
  readonly reason?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly status?: ResettlementCaseStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ResettlementCaseUpdateArgs = {
  readonly where: ResettlementCaseWhereUniqueInput
  readonly data: ResettlementCaseUpdateInput
}

export type ResettlementCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly oldSettlement?: SettlementRelateToOneForCreateInput | null
  readonly newResultVersion?: ResultVersionRelateToOneForCreateInput | null
  readonly reason?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly status?: ResettlementCaseStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RoleGrantStatusType =
  | 'ACTIVE'
  | 'REVOKED'

export type RoleGrantWhereUniqueInput = {
  readonly id?: string | null
}

export type RoleGrantWhereInput = {
  readonly AND?: ReadonlyArray<RoleGrantWhereInput> | RoleGrantWhereInput | null
  readonly OR?: ReadonlyArray<RoleGrantWhereInput> | RoleGrantWhereInput | null
  readonly NOT?: ReadonlyArray<RoleGrantWhereInput> | RoleGrantWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly user?: UserWhereInput | null
  readonly role?: RoleWhereInput | null
  readonly team?: TeamWhereInput | null
  readonly effectiveFrom?: DateTimeNullableFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: RoleGrantStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type RoleGrantStatusTypeNullableFilter = {
  readonly equals?: RoleGrantStatusType | null
  readonly in?: ReadonlyArray<RoleGrantStatusType> | RoleGrantStatusType | null
  readonly notIn?: ReadonlyArray<RoleGrantStatusType> | RoleGrantStatusType | null
  readonly not?: RoleGrantStatusTypeNullableFilter | null
}

export type RoleGrantOrderByInput = {
  readonly id?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RoleGrantUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly user?: UserRelateToOneForUpdateInput | null
  readonly role?: RoleRelateToOneForUpdateInput | null
  readonly team?: TeamRelateToOneForUpdateInput | null
  readonly scope?: import('@keystone-6/core/types').JSONValue | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: RoleGrantStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type UserRelateToOneForUpdateInput = {
  readonly create?: UserCreateInput | null
  readonly connect?: UserWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type TeamRelateToOneForUpdateInput = {
  readonly create?: TeamCreateInput | null
  readonly connect?: TeamWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type RoleGrantUpdateArgs = {
  readonly where: RoleGrantWhereUniqueInput
  readonly data: RoleGrantUpdateInput
}

export type RoleGrantCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly user?: UserRelateToOneForCreateInput | null
  readonly role?: RoleRelateToOneForCreateInput | null
  readonly team?: TeamRelateToOneForCreateInput | null
  readonly scope?: import('@keystone-6/core/types').JSONValue | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: RoleGrantStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type UserRelateToOneForCreateInput = {
  readonly create?: UserCreateInput | null
  readonly connect?: UserWhereUniqueInput | null
}

export type TeamRelateToOneForCreateInput = {
  readonly create?: TeamCreateInput | null
  readonly connect?: TeamWhereUniqueInput | null
}

export type TaxAssessmentStatusType =
  | 'CALCULATED'
  | 'POSTED'
  | 'REVERSED'

export type TaxAssessmentWhereUniqueInput = {
  readonly id?: string | null
}

export type TaxAssessmentWhereInput = {
  readonly AND?: ReadonlyArray<TaxAssessmentWhereInput> | TaxAssessmentWhereInput | null
  readonly OR?: ReadonlyArray<TaxAssessmentWhereInput> | TaxAssessmentWhereInput | null
  readonly NOT?: ReadonlyArray<TaxAssessmentWhereInput> | TaxAssessmentWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly ruleVersion?: StringFilter | null
  readonly basisMinor?: StringFilter | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly status?: TaxAssessmentStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TaxAssessmentStatusTypeNullableFilter = {
  readonly equals?: TaxAssessmentStatusType | null
  readonly in?: ReadonlyArray<TaxAssessmentStatusType> | TaxAssessmentStatusType | null
  readonly notIn?: ReadonlyArray<TaxAssessmentStatusType> | TaxAssessmentStatusType | null
  readonly not?: TaxAssessmentStatusTypeNullableFilter | null
}

export type TaxAssessmentOrderByInput = {
  readonly id?: OrderDirection | null
  readonly ruleVersion?: OrderDirection | null
  readonly basisMinor?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TaxAssessmentUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly ruleVersion?: string | null
  readonly basisMinor?: string | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly status?: TaxAssessmentStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TaxAssessmentUpdateArgs = {
  readonly where: TaxAssessmentWhereUniqueInput
  readonly data: TaxAssessmentUpdateInput
}

export type TaxAssessmentCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly ruleVersion?: string | null
  readonly basisMinor?: string | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly status?: TaxAssessmentStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TeamStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type TeamWhereUniqueInput = {
  readonly id?: string | null
}

export type TeamWhereInput = {
  readonly AND?: ReadonlyArray<TeamWhereInput> | TeamWhereInput | null
  readonly OR?: ReadonlyArray<TeamWhereInput> | TeamWhereInput | null
  readonly NOT?: ReadonlyArray<TeamWhereInput> | TeamWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly status?: TeamStatusTypeNullableFilter | null
  readonly members?: UserManyRelationFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TeamStatusTypeNullableFilter = {
  readonly equals?: TeamStatusType | null
  readonly in?: ReadonlyArray<TeamStatusType> | TeamStatusType | null
  readonly notIn?: ReadonlyArray<TeamStatusType> | TeamStatusType | null
  readonly not?: TeamStatusTypeNullableFilter | null
}

export type TeamOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TeamUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly status?: TeamStatusType | null
  readonly members?: UserRelateToManyForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TeamUpdateArgs = {
  readonly where: TeamWhereUniqueInput
  readonly data: TeamUpdateInput
}

export type TeamCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly status?: TeamStatusType | null
  readonly members?: UserRelateToManyForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TradingStatusChangeWhereUniqueInput = {
  readonly id?: string | null
}

export type TradingStatusChangeWhereInput = {
  readonly AND?: ReadonlyArray<TradingStatusChangeWhereInput> | TradingStatusChangeWhereInput | null
  readonly OR?: ReadonlyArray<TradingStatusChangeWhereInput> | TradingStatusChangeWhereInput | null
  readonly NOT?: ReadonlyArray<TradingStatusChangeWhereInput> | TradingStatusChangeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly fromStatus?: StringFilter | null
  readonly toStatus?: StringFilter | null
  readonly reason?: StringFilter | null
  readonly source?: StringFilter | null
  readonly actorId?: StringFilter | null
  readonly effectiveAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TradingStatusChangeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly fromStatus?: OrderDirection | null
  readonly toStatus?: OrderDirection | null
  readonly reason?: OrderDirection | null
  readonly source?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly effectiveAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TradingStatusChangeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly fromStatus?: string | null
  readonly toStatus?: string | null
  readonly reason?: string | null
  readonly source?: string | null
  readonly actorId?: string | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TradingStatusChangeUpdateArgs = {
  readonly where: TradingStatusChangeWhereUniqueInput
  readonly data: TradingStatusChangeUpdateInput
}

export type TradingStatusChangeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly fromStatus?: string | null
  readonly toStatus?: string | null
  readonly reason?: string | null
  readonly source?: string | null
  readonly actorId?: string | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VerificationCaseTypeType =
  | 'KYC'
  | 'AGE'
  | 'ADDRESS'

export type VerificationCaseStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'

export type VerificationCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type VerificationCaseWhereInput = {
  readonly AND?: ReadonlyArray<VerificationCaseWhereInput> | VerificationCaseWhereInput | null
  readonly OR?: ReadonlyArray<VerificationCaseWhereInput> | VerificationCaseWhereInput | null
  readonly NOT?: ReadonlyArray<VerificationCaseWhereInput> | VerificationCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly type?: VerificationCaseTypeTypeNullableFilter | null
  readonly status?: VerificationCaseStatusTypeNullableFilter | null
  readonly evidenceReference?: StringFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type VerificationCaseTypeTypeNullableFilter = {
  readonly equals?: VerificationCaseTypeType | null
  readonly in?: ReadonlyArray<VerificationCaseTypeType> | VerificationCaseTypeType | null
  readonly notIn?: ReadonlyArray<VerificationCaseTypeType> | VerificationCaseTypeType | null
  readonly not?: VerificationCaseTypeTypeNullableFilter | null
}

export type VerificationCaseStatusTypeNullableFilter = {
  readonly equals?: VerificationCaseStatusType | null
  readonly in?: ReadonlyArray<VerificationCaseStatusType> | VerificationCaseStatusType | null
  readonly notIn?: ReadonlyArray<VerificationCaseStatusType> | VerificationCaseStatusType | null
  readonly not?: VerificationCaseStatusTypeNullableFilter | null
}

export type VerificationCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceReference?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type VerificationCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly type?: VerificationCaseTypeType | null
  readonly status?: VerificationCaseStatusType | null
  readonly evidenceReference?: string | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VerificationCaseUpdateArgs = {
  readonly where: VerificationCaseWhereUniqueInput
  readonly data: VerificationCaseUpdateInput
}

export type VerificationCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly type?: VerificationCaseTypeType | null
  readonly status?: VerificationCaseStatusType | null
  readonly evidenceReference?: string | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VerificationCheckDecisionType =
  | 'PENDING'
  | 'PASS'
  | 'FAIL'
  | 'REVIEW'

export type VerificationCheckWhereUniqueInput = {
  readonly id?: string | null
}

export type VerificationCheckWhereInput = {
  readonly AND?: ReadonlyArray<VerificationCheckWhereInput> | VerificationCheckWhereInput | null
  readonly OR?: ReadonlyArray<VerificationCheckWhereInput> | VerificationCheckWhereInput | null
  readonly NOT?: ReadonlyArray<VerificationCheckWhereInput> | VerificationCheckWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly verificationCase?: VerificationCaseWhereInput | null
  readonly attempt?: IntNullableFilter | null
  readonly decision?: VerificationCheckDecisionTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly rawEnvelope?: RawEnvelopeWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type VerificationCheckDecisionTypeNullableFilter = {
  readonly equals?: VerificationCheckDecisionType | null
  readonly in?: ReadonlyArray<VerificationCheckDecisionType> | VerificationCheckDecisionType | null
  readonly notIn?: ReadonlyArray<VerificationCheckDecisionType> | VerificationCheckDecisionType | null
  readonly not?: VerificationCheckDecisionTypeNullableFilter | null
}

export type VerificationCheckOrderByInput = {
  readonly id?: OrderDirection | null
  readonly attempt?: OrderDirection | null
  readonly decision?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type VerificationCheckUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly verificationCase?: VerificationCaseRelateToOneForUpdateInput | null
  readonly attempt?: number | null
  readonly decision?: VerificationCheckDecisionType | null
  readonly reasonCode?: string | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VerificationCaseRelateToOneForUpdateInput = {
  readonly create?: VerificationCaseCreateInput | null
  readonly connect?: VerificationCaseWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type VerificationCheckUpdateArgs = {
  readonly where: VerificationCheckWhereUniqueInput
  readonly data: VerificationCheckUpdateInput
}

export type VerificationCheckCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly verificationCase?: VerificationCaseRelateToOneForCreateInput | null
  readonly attempt?: number | null
  readonly decision?: VerificationCheckDecisionType | null
  readonly reasonCode?: string | null
  readonly rawEnvelope?: RawEnvelopeRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VerificationCaseRelateToOneForCreateInput = {
  readonly create?: VerificationCaseCreateInput | null
  readonly connect?: VerificationCaseWhereUniqueInput | null
}

export type WagerStatusEventWhereUniqueInput = {
  readonly id?: string | null
}

export type WagerStatusEventWhereInput = {
  readonly AND?: ReadonlyArray<WagerStatusEventWhereInput> | WagerStatusEventWhereInput | null
  readonly OR?: ReadonlyArray<WagerStatusEventWhereInput> | WagerStatusEventWhereInput | null
  readonly NOT?: ReadonlyArray<WagerStatusEventWhereInput> | WagerStatusEventWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly fromStatus?: StringFilter | null
  readonly toStatus?: StringFilter | null
  readonly reasonCode?: StringFilter | null
  readonly actorId?: StringFilter | null
  readonly effectiveAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WagerStatusEventOrderByInput = {
  readonly id?: OrderDirection | null
  readonly fromStatus?: OrderDirection | null
  readonly toStatus?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly effectiveAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WagerStatusEventUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly fromStatus?: string | null
  readonly toStatus?: string | null
  readonly reasonCode?: string | null
  readonly actorId?: string | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerStatusEventUpdateArgs = {
  readonly where: WagerStatusEventWhereUniqueInput
  readonly data: WagerStatusEventUpdateInput
}

export type WagerStatusEventCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly fromStatus?: string | null
  readonly toStatus?: string | null
  readonly reasonCode?: string | null
  readonly actorId?: string | null
  readonly effectiveAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookReplayWhereUniqueInput = {
  readonly id?: string | null
}

export type WebhookReplayWhereInput = {
  readonly AND?: ReadonlyArray<WebhookReplayWhereInput> | WebhookReplayWhereInput | null
  readonly OR?: ReadonlyArray<WebhookReplayWhereInput> | WebhookReplayWhereInput | null
  readonly NOT?: ReadonlyArray<WebhookReplayWhereInput> | WebhookReplayWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly messageHash?: StringFilter | null
  readonly occurredAt?: DateTimeNullableFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WebhookReplayOrderByInput = {
  readonly id?: OrderDirection | null
  readonly messageHash?: OrderDirection | null
  readonly occurredAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WebhookReplayUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly messageHash?: string | null
  readonly occurredAt?: any | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookReplayUpdateArgs = {
  readonly where: WebhookReplayWhereUniqueInput
  readonly data: WebhookReplayUpdateInput
}

export type WebhookReplayCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly messageHash?: string | null
  readonly occurredAt?: any | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerCommandTypeType =
  | 'WAGER'
  | 'FUND'
  | 'LIMIT'
  | 'EXCLUSION'
  | 'AUTH'
  | 'CASH_OUT'
  | 'PROMOTION'
  | 'DISPUTE'
  | 'PROFILE'
  | 'PRIVACY'

export type CustomerCommandStatusType =
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'REJECTED'

export type CustomerCommandWhereUniqueInput = {
  readonly id?: string | null
  readonly commandKey?: string | null
}

export type CustomerCommandWhereInput = {
  readonly AND?: ReadonlyArray<CustomerCommandWhereInput> | CustomerCommandWhereInput | null
  readonly OR?: ReadonlyArray<CustomerCommandWhereInput> | CustomerCommandWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerCommandWhereInput> | CustomerCommandWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly commandKey?: StringFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly type?: CustomerCommandTypeTypeNullableFilter | null
  readonly requestHash?: StringFilter | null
  readonly status?: CustomerCommandStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerCommandTypeTypeNullableFilter = {
  readonly equals?: CustomerCommandTypeType | null
  readonly in?: ReadonlyArray<CustomerCommandTypeType> | CustomerCommandTypeType | null
  readonly notIn?: ReadonlyArray<CustomerCommandTypeType> | CustomerCommandTypeType | null
  readonly not?: CustomerCommandTypeTypeNullableFilter | null
}

export type CustomerCommandStatusTypeNullableFilter = {
  readonly equals?: CustomerCommandStatusType | null
  readonly in?: ReadonlyArray<CustomerCommandStatusType> | CustomerCommandStatusType | null
  readonly notIn?: ReadonlyArray<CustomerCommandStatusType> | CustomerCommandStatusType | null
  readonly not?: CustomerCommandStatusTypeNullableFilter | null
}

export type CustomerCommandOrderByInput = {
  readonly id?: OrderDirection | null
  readonly commandKey?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly requestHash?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerCommandUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly commandKey?: string | null
  readonly idempotencyKey?: string | null
  readonly type?: CustomerCommandTypeType | null
  readonly requestHash?: string | null
  readonly status?: CustomerCommandStatusType | null
  readonly result?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerCommandUpdateArgs = {
  readonly where: CustomerCommandWhereUniqueInput
  readonly data: CustomerCommandUpdateInput
}

export type CustomerCommandCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly commandKey?: string | null
  readonly idempotencyKey?: string | null
  readonly type?: CustomerCommandTypeType | null
  readonly requestHash?: string | null
  readonly status?: CustomerCommandStatusType | null
  readonly result?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerQuoteLegTermsLiveType =
  | 'PREMATCH'
  | 'LIVE'

export type CustomerQuoteLegTermsWhereUniqueInput = {
  readonly id?: string | null
}

export type CustomerQuoteLegTermsWhereInput = {
  readonly AND?: ReadonlyArray<CustomerQuoteLegTermsWhereInput> | CustomerQuoteLegTermsWhereInput | null
  readonly OR?: ReadonlyArray<CustomerQuoteLegTermsWhereInput> | CustomerQuoteLegTermsWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerQuoteLegTermsWhereInput> | CustomerQuoteLegTermsWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly quote?: QuoteWhereInput | null
  readonly quoteKey?: StringFilter | null
  readonly legIndex?: StringFilter | null
  readonly eventId?: StringFilter | null
  readonly marketId?: StringFilter | null
  readonly selectionId?: StringFilter | null
  readonly priceSnapshotId?: StringFilter | null
  readonly eventName?: StringFilter | null
  readonly marketName?: StringFilter | null
  readonly selectionName?: StringFilter | null
  readonly decimalOdds?: StringFilter | null
  readonly line?: StringFilter | null
  readonly live?: CustomerQuoteLegTermsLiveTypeNullableFilter | null
  readonly correlationGroupKey?: StringFilter | null
  readonly ruleVersion?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerQuoteLegTermsLiveTypeNullableFilter = {
  readonly equals?: CustomerQuoteLegTermsLiveType | null
  readonly in?: ReadonlyArray<CustomerQuoteLegTermsLiveType> | CustomerQuoteLegTermsLiveType | null
  readonly notIn?: ReadonlyArray<CustomerQuoteLegTermsLiveType> | CustomerQuoteLegTermsLiveType | null
  readonly not?: CustomerQuoteLegTermsLiveTypeNullableFilter | null
}

export type CustomerQuoteLegTermsOrderByInput = {
  readonly id?: OrderDirection | null
  readonly quoteKey?: OrderDirection | null
  readonly legIndex?: OrderDirection | null
  readonly eventId?: OrderDirection | null
  readonly marketId?: OrderDirection | null
  readonly selectionId?: OrderDirection | null
  readonly priceSnapshotId?: OrderDirection | null
  readonly eventName?: OrderDirection | null
  readonly marketName?: OrderDirection | null
  readonly selectionName?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly line?: OrderDirection | null
  readonly live?: OrderDirection | null
  readonly correlationGroupKey?: OrderDirection | null
  readonly ruleVersion?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerQuoteLegTermsUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly quote?: QuoteRelateToOneForUpdateInput | null
  readonly quoteKey?: string | null
  readonly legIndex?: string | null
  readonly eventId?: string | null
  readonly marketId?: string | null
  readonly selectionId?: string | null
  readonly priceSnapshotId?: string | null
  readonly eventName?: string | null
  readonly marketName?: string | null
  readonly selectionName?: string | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly live?: CustomerQuoteLegTermsLiveType | null
  readonly correlationGroupKey?: string | null
  readonly ruleVersion?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerQuoteLegTermsUpdateArgs = {
  readonly where: CustomerQuoteLegTermsWhereUniqueInput
  readonly data: CustomerQuoteLegTermsUpdateInput
}

export type CustomerQuoteLegTermsCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly quote?: QuoteRelateToOneForCreateInput | null
  readonly quoteKey?: string | null
  readonly legIndex?: string | null
  readonly eventId?: string | null
  readonly marketId?: string | null
  readonly selectionId?: string | null
  readonly priceSnapshotId?: string | null
  readonly eventName?: string | null
  readonly marketName?: string | null
  readonly selectionName?: string | null
  readonly decimalOdds?: string | null
  readonly line?: string | null
  readonly live?: CustomerQuoteLegTermsLiveType | null
  readonly correlationGroupKey?: string | null
  readonly ruleVersion?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerQuoteTermsStructureType =
  | 'STRAIGHT'
  | 'PARLAY'
  | 'SYSTEM'
  | 'ROUND_ROBIN'
  | 'TEASER'
  | 'EACH_WAY'

export type CustomerQuoteTermsWhereUniqueInput = {
  readonly id?: string | null
  readonly quoteKey?: string | null
}

export type CustomerQuoteTermsWhereInput = {
  readonly AND?: ReadonlyArray<CustomerQuoteTermsWhereInput> | CustomerQuoteTermsWhereInput | null
  readonly OR?: ReadonlyArray<CustomerQuoteTermsWhereInput> | CustomerQuoteTermsWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerQuoteTermsWhereInput> | CustomerQuoteTermsWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly quote?: QuoteWhereInput | null
  readonly quoteKey?: StringFilter | null
  readonly structure?: CustomerQuoteTermsStructureTypeNullableFilter | null
  readonly legCount?: StringFilter | null
  readonly partCount?: StringFilter | null
  readonly priceChangeConsent?: StringFilter | null
  readonly liveDelayMs?: StringFilter | null
  readonly eventId?: StringFilter | null
  readonly marketId?: StringFilter | null
  readonly selectionId?: StringFilter | null
  readonly priceSnapshotId?: StringFilter | null
  readonly eventName?: StringFilter | null
  readonly marketName?: StringFilter | null
  readonly selectionName?: StringFilter | null
  readonly decimalOdds?: StringFilter | null
  readonly stakeMinor?: StringFilter | null
  readonly potentialReturnMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly termsHash?: StringFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerQuoteTermsStructureTypeNullableFilter = {
  readonly equals?: CustomerQuoteTermsStructureType | null
  readonly in?: ReadonlyArray<CustomerQuoteTermsStructureType> | CustomerQuoteTermsStructureType | null
  readonly notIn?: ReadonlyArray<CustomerQuoteTermsStructureType> | CustomerQuoteTermsStructureType | null
  readonly not?: CustomerQuoteTermsStructureTypeNullableFilter | null
}

export type CustomerQuoteTermsOrderByInput = {
  readonly id?: OrderDirection | null
  readonly quoteKey?: OrderDirection | null
  readonly structure?: OrderDirection | null
  readonly legCount?: OrderDirection | null
  readonly partCount?: OrderDirection | null
  readonly priceChangeConsent?: OrderDirection | null
  readonly liveDelayMs?: OrderDirection | null
  readonly eventId?: OrderDirection | null
  readonly marketId?: OrderDirection | null
  readonly selectionId?: OrderDirection | null
  readonly priceSnapshotId?: OrderDirection | null
  readonly eventName?: OrderDirection | null
  readonly marketName?: OrderDirection | null
  readonly selectionName?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly potentialReturnMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly termsHash?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerQuoteTermsUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly quote?: QuoteRelateToOneForUpdateInput | null
  readonly quoteKey?: string | null
  readonly structure?: CustomerQuoteTermsStructureType | null
  readonly legCount?: string | null
  readonly partCount?: string | null
  readonly partPlan?: import('@keystone-6/core/types').JSONValue | null
  readonly priceChangeConsent?: string | null
  readonly liveDelayMs?: string | null
  readonly bonusEconomics?: import('@keystone-6/core/types').JSONValue | null
  readonly eventId?: string | null
  readonly marketId?: string | null
  readonly selectionId?: string | null
  readonly priceSnapshotId?: string | null
  readonly eventName?: string | null
  readonly marketName?: string | null
  readonly selectionName?: string | null
  readonly decimalOdds?: string | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly currency?: string | null
  readonly termsHash?: string | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerQuoteTermsUpdateArgs = {
  readonly where: CustomerQuoteTermsWhereUniqueInput
  readonly data: CustomerQuoteTermsUpdateInput
}

export type CustomerQuoteTermsCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly quote?: QuoteRelateToOneForCreateInput | null
  readonly quoteKey?: string | null
  readonly structure?: CustomerQuoteTermsStructureType | null
  readonly legCount?: string | null
  readonly partCount?: string | null
  readonly partPlan?: import('@keystone-6/core/types').JSONValue | null
  readonly priceChangeConsent?: string | null
  readonly liveDelayMs?: string | null
  readonly bonusEconomics?: import('@keystone-6/core/types').JSONValue | null
  readonly eventId?: string | null
  readonly marketId?: string | null
  readonly selectionId?: string | null
  readonly priceSnapshotId?: string | null
  readonly eventName?: string | null
  readonly marketName?: string | null
  readonly selectionName?: string | null
  readonly decimalOdds?: string | null
  readonly stakeMinor?: string | null
  readonly potentialReturnMinor?: string | null
  readonly currency?: string | null
  readonly termsHash?: string | null
  readonly expiresAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerSessionAssuranceLevelType =
  | 'GUEST'
  | 'PASSWORD'
  | 'MFA'

export type CustomerSessionWhereUniqueInput = {
  readonly id?: string | null
  readonly tokenDigest?: string | null
}

export type CustomerSessionWhereInput = {
  readonly AND?: ReadonlyArray<CustomerSessionWhereInput> | CustomerSessionWhereInput | null
  readonly OR?: ReadonlyArray<CustomerSessionWhereInput> | CustomerSessionWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerSessionWhereInput> | CustomerSessionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly tokenDigest?: StringFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly assuranceLevel?: CustomerSessionAssuranceLevelTypeNullableFilter | null
  readonly deviceDigest?: StringFilter | null
  readonly lastSeenAt?: DateTimeNullableFilter | null
  readonly revokedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerSessionAssuranceLevelTypeNullableFilter = {
  readonly equals?: CustomerSessionAssuranceLevelType | null
  readonly in?: ReadonlyArray<CustomerSessionAssuranceLevelType> | CustomerSessionAssuranceLevelType | null
  readonly notIn?: ReadonlyArray<CustomerSessionAssuranceLevelType> | CustomerSessionAssuranceLevelType | null
  readonly not?: CustomerSessionAssuranceLevelTypeNullableFilter | null
}

export type CustomerSessionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly tokenDigest?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly assuranceLevel?: OrderDirection | null
  readonly deviceDigest?: OrderDirection | null
  readonly lastSeenAt?: OrderDirection | null
  readonly revokedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerSessionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly tokenDigest?: string | null
  readonly expiresAt?: any | null
  readonly assuranceLevel?: CustomerSessionAssuranceLevelType | null
  readonly deviceDigest?: string | null
  readonly lastSeenAt?: any | null
  readonly revokedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerSessionUpdateArgs = {
  readonly where: CustomerSessionWhereUniqueInput
  readonly data: CustomerSessionUpdateInput
}

export type CustomerSessionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly tokenDigest?: string | null
  readonly expiresAt?: any | null
  readonly assuranceLevel?: CustomerSessionAssuranceLevelType | null
  readonly deviceDigest?: string | null
  readonly lastSeenAt?: any | null
  readonly revokedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccessReviewStatusType =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REMEDIATION'
  | 'CLOSED'

export type AccessReviewWhereUniqueInput = {
  readonly id?: string | null
}

export type AccessReviewWhereInput = {
  readonly AND?: ReadonlyArray<AccessReviewWhereInput> | AccessReviewWhereInput | null
  readonly OR?: ReadonlyArray<AccessReviewWhereInput> | AccessReviewWhereInput | null
  readonly NOT?: ReadonlyArray<AccessReviewWhereInput> | AccessReviewWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly status?: AccessReviewStatusTypeNullableFilter | null
  readonly openedBy?: StringFilter | null
  readonly reviewerId?: StringFilter | null
  readonly dueAt?: DateTimeFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AccessReviewStatusTypeNullableFilter = {
  readonly equals?: AccessReviewStatusType | null
  readonly in?: ReadonlyArray<AccessReviewStatusType> | AccessReviewStatusType | null
  readonly notIn?: ReadonlyArray<AccessReviewStatusType> | AccessReviewStatusType | null
  readonly not?: AccessReviewStatusTypeNullableFilter | null
}

export type AccessReviewOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly openedBy?: OrderDirection | null
  readonly reviewerId?: OrderDirection | null
  readonly dueAt?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AccessReviewUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly status?: AccessReviewStatusType | null
  readonly openedBy?: string | null
  readonly reviewerId?: string | null
  readonly findings?: import('@keystone-6/core/types').JSONValue | null
  readonly dueAt?: any | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccessReviewUpdateArgs = {
  readonly where: AccessReviewWhereUniqueInput
  readonly data: AccessReviewUpdateInput
}

export type AccessReviewCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly status?: AccessReviewStatusType | null
  readonly openedBy?: string | null
  readonly reviewerId?: string | null
  readonly findings?: import('@keystone-6/core/types').JSONValue | null
  readonly dueAt?: any | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccountClosureStatusType =
  | 'REQUESTED'
  | 'REVIEW'
  | 'BLOCKED_FUNDS'
  | 'CLOSED'
  | 'CANCELLED'

export type AccountClosureWhereUniqueInput = {
  readonly id?: string | null
}

export type AccountClosureWhereInput = {
  readonly AND?: ReadonlyArray<AccountClosureWhereInput> | AccountClosureWhereInput | null
  readonly OR?: ReadonlyArray<AccountClosureWhereInput> | AccountClosureWhereInput | null
  readonly NOT?: ReadonlyArray<AccountClosureWhereInput> | AccountClosureWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly requestedBy?: StringFilter | null
  readonly reasonCode?: StringFilter | null
  readonly requestedAt?: DateTimeFilter | null
  readonly coolingEndsAt?: DateTimeNullableFilter | null
  readonly status?: AccountClosureStatusTypeNullableFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AccountClosureStatusTypeNullableFilter = {
  readonly equals?: AccountClosureStatusType | null
  readonly in?: ReadonlyArray<AccountClosureStatusType> | AccountClosureStatusType | null
  readonly notIn?: ReadonlyArray<AccountClosureStatusType> | AccountClosureStatusType | null
  readonly not?: AccountClosureStatusTypeNullableFilter | null
}

export type AccountClosureOrderByInput = {
  readonly id?: OrderDirection | null
  readonly requestedBy?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly requestedAt?: OrderDirection | null
  readonly coolingEndsAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AccountClosureUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly requestedBy?: string | null
  readonly reasonCode?: string | null
  readonly requestedAt?: any | null
  readonly coolingEndsAt?: any | null
  readonly status?: AccountClosureStatusType | null
  readonly completedAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AccountClosureUpdateArgs = {
  readonly where: AccountClosureWhereUniqueInput
  readonly data: AccountClosureUpdateInput
}

export type AccountClosureCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly requestedBy?: string | null
  readonly reasonCode?: string | null
  readonly requestedAt?: any | null
  readonly coolingEndsAt?: any | null
  readonly status?: AccountClosureStatusType | null
  readonly completedAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AdapterCertificationRunStatusType =
  | 'PENDING'
  | 'RUNNING'
  | 'PASSED'
  | 'FAILED'

export type AdapterCertificationRunWhereUniqueInput = {
  readonly id?: string | null
}

export type AdapterCertificationRunWhereInput = {
  readonly AND?: ReadonlyArray<AdapterCertificationRunWhereInput> | AdapterCertificationRunWhereInput | null
  readonly OR?: ReadonlyArray<AdapterCertificationRunWhereInput> | AdapterCertificationRunWhereInput | null
  readonly NOT?: ReadonlyArray<AdapterCertificationRunWhereInput> | AdapterCertificationRunWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly adapterId?: StringFilter | null
  readonly adapterVersion?: StringFilter | null
  readonly suiteVersion?: StringFilter | null
  readonly passed?: IntNullableFilter | null
  readonly failed?: IntNullableFilter | null
  readonly status?: AdapterCertificationRunStatusTypeNullableFilter | null
  readonly inputHash?: StringFilter | null
  readonly artifactReference?: StringFilter | null
  readonly startedAt?: DateTimeFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AdapterCertificationRunStatusTypeNullableFilter = {
  readonly equals?: AdapterCertificationRunStatusType | null
  readonly in?: ReadonlyArray<AdapterCertificationRunStatusType> | AdapterCertificationRunStatusType | null
  readonly notIn?: ReadonlyArray<AdapterCertificationRunStatusType> | AdapterCertificationRunStatusType | null
  readonly not?: AdapterCertificationRunStatusTypeNullableFilter | null
}

export type AdapterCertificationRunOrderByInput = {
  readonly id?: OrderDirection | null
  readonly adapterId?: OrderDirection | null
  readonly adapterVersion?: OrderDirection | null
  readonly suiteVersion?: OrderDirection | null
  readonly passed?: OrderDirection | null
  readonly failed?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly artifactReference?: OrderDirection | null
  readonly startedAt?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AdapterCertificationRunUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly adapterId?: string | null
  readonly adapterVersion?: string | null
  readonly suiteVersion?: string | null
  readonly scenarios?: import('@keystone-6/core/types').JSONValue | null
  readonly passed?: number | null
  readonly failed?: number | null
  readonly status?: AdapterCertificationRunStatusType | null
  readonly inputHash?: string | null
  readonly artifactReference?: string | null
  readonly startedAt?: any | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AdapterCertificationRunUpdateArgs = {
  readonly where: AdapterCertificationRunWhereUniqueInput
  readonly data: AdapterCertificationRunUpdateInput
}

export type AdapterCertificationRunCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly adapterId?: string | null
  readonly adapterVersion?: string | null
  readonly suiteVersion?: string | null
  readonly scenarios?: import('@keystone-6/core/types').JSONValue | null
  readonly passed?: number | null
  readonly failed?: number | null
  readonly status?: AdapterCertificationRunStatusType | null
  readonly inputHash?: string | null
  readonly artifactReference?: string | null
  readonly startedAt?: any | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AffiliateAttributionStatusType =
  | 'PENDING'
  | 'ATTRIBUTED'
  | 'REJECTED'
  | 'REVERSED'

export type AffiliateAttributionWhereUniqueInput = {
  readonly id?: string | null
}

export type AffiliateAttributionWhereInput = {
  readonly AND?: ReadonlyArray<AffiliateAttributionWhereInput> | AffiliateAttributionWhereInput | null
  readonly OR?: ReadonlyArray<AffiliateAttributionWhereInput> | AffiliateAttributionWhereInput | null
  readonly NOT?: ReadonlyArray<AffiliateAttributionWhereInput> | AffiliateAttributionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly affiliateReference?: StringFilter | null
  readonly campaignReference?: StringFilter | null
  readonly clickReference?: StringFilter | null
  readonly attributedAt?: DateTimeFilter | null
  readonly status?: AffiliateAttributionStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AffiliateAttributionStatusTypeNullableFilter = {
  readonly equals?: AffiliateAttributionStatusType | null
  readonly in?: ReadonlyArray<AffiliateAttributionStatusType> | AffiliateAttributionStatusType | null
  readonly notIn?: ReadonlyArray<AffiliateAttributionStatusType> | AffiliateAttributionStatusType | null
  readonly not?: AffiliateAttributionStatusTypeNullableFilter | null
}

export type AffiliateAttributionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly affiliateReference?: OrderDirection | null
  readonly campaignReference?: OrderDirection | null
  readonly clickReference?: OrderDirection | null
  readonly attributedAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AffiliateAttributionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly affiliateReference?: string | null
  readonly campaignReference?: string | null
  readonly clickReference?: string | null
  readonly attributedAt?: any | null
  readonly status?: AffiliateAttributionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AffiliateAttributionUpdateArgs = {
  readonly where: AffiliateAttributionWhereUniqueInput
  readonly data: AffiliateAttributionUpdateInput
}

export type AffiliateAttributionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly affiliateReference?: string | null
  readonly campaignReference?: string | null
  readonly clickReference?: string | null
  readonly attributedAt?: any | null
  readonly status?: AffiliateAttributionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AffordabilityAssessmentRiskBandType =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'PROHIBITED'

export type AffordabilityAssessmentDecisionType =
  | 'ALLOW'
  | 'RESTRICT'
  | 'REVIEW'

export type AffordabilityAssessmentWhereUniqueInput = {
  readonly id?: string | null
}

export type AffordabilityAssessmentWhereInput = {
  readonly AND?: ReadonlyArray<AffordabilityAssessmentWhereInput> | AffordabilityAssessmentWhereInput | null
  readonly OR?: ReadonlyArray<AffordabilityAssessmentWhereInput> | AffordabilityAssessmentWhereInput | null
  readonly NOT?: ReadonlyArray<AffordabilityAssessmentWhereInput> | AffordabilityAssessmentWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly source?: StringFilter | null
  readonly riskBand?: AffordabilityAssessmentRiskBandTypeNullableFilter | null
  readonly evidenceReference?: StringFilter | null
  readonly assessedAt?: DateTimeFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly decision?: AffordabilityAssessmentDecisionTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type AffordabilityAssessmentRiskBandTypeNullableFilter = {
  readonly equals?: AffordabilityAssessmentRiskBandType | null
  readonly in?: ReadonlyArray<AffordabilityAssessmentRiskBandType> | AffordabilityAssessmentRiskBandType | null
  readonly notIn?: ReadonlyArray<AffordabilityAssessmentRiskBandType> | AffordabilityAssessmentRiskBandType | null
  readonly not?: AffordabilityAssessmentRiskBandTypeNullableFilter | null
}

export type AffordabilityAssessmentDecisionTypeNullableFilter = {
  readonly equals?: AffordabilityAssessmentDecisionType | null
  readonly in?: ReadonlyArray<AffordabilityAssessmentDecisionType> | AffordabilityAssessmentDecisionType | null
  readonly notIn?: ReadonlyArray<AffordabilityAssessmentDecisionType> | AffordabilityAssessmentDecisionType | null
  readonly not?: AffordabilityAssessmentDecisionTypeNullableFilter | null
}

export type AffordabilityAssessmentOrderByInput = {
  readonly id?: OrderDirection | null
  readonly source?: OrderDirection | null
  readonly riskBand?: OrderDirection | null
  readonly evidenceReference?: OrderDirection | null
  readonly assessedAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly decision?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type AffordabilityAssessmentUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly source?: string | null
  readonly riskBand?: AffordabilityAssessmentRiskBandType | null
  readonly evidenceReference?: string | null
  readonly assessedAt?: any | null
  readonly expiresAt?: any | null
  readonly decision?: AffordabilityAssessmentDecisionType | null
  readonly reasonCode?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AffordabilityAssessmentUpdateArgs = {
  readonly where: AffordabilityAssessmentWhereUniqueInput
  readonly data: AffordabilityAssessmentUpdateInput
}

export type AffordabilityAssessmentCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly source?: string | null
  readonly riskBand?: AffordabilityAssessmentRiskBandType | null
  readonly evidenceReference?: string | null
  readonly assessedAt?: any | null
  readonly expiresAt?: any | null
  readonly decision?: AffordabilityAssessmentDecisionType | null
  readonly reasonCode?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BonusAwardAwardTypeType =
  | 'FREE_BET'
  | 'BONUS_CASH'
  | 'ODDS_BOOST'

export type BonusAwardStatusType =
  | 'AWARDED'
  | 'ACTIVE'
  | 'CONSUMED'
  | 'CONVERTED'
  | 'EXPIRED'
  | 'FORFEITED'

export type BonusAwardWhereUniqueInput = {
  readonly id?: string | null
}

export type BonusAwardWhereInput = {
  readonly AND?: ReadonlyArray<BonusAwardWhereInput> | BonusAwardWhereInput | null
  readonly OR?: ReadonlyArray<BonusAwardWhereInput> | BonusAwardWhereInput | null
  readonly NOT?: ReadonlyArray<BonusAwardWhereInput> | BonusAwardWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly promotion?: PromotionWhereInput | null
  readonly ruleVersion?: PromotionRuleVersionWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly amountMinor?: StringFilter | null
  readonly remainingMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly awardType?: BonusAwardAwardTypeTypeNullableFilter | null
  readonly stakeReturned?: BooleanFilter | null
  readonly status?: BonusAwardStatusTypeNullableFilter | null
  readonly awardedAt?: DateTimeFilter | null
  readonly activatedAt?: DateTimeNullableFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BonusAwardAwardTypeTypeNullableFilter = {
  readonly equals?: BonusAwardAwardTypeType | null
  readonly in?: ReadonlyArray<BonusAwardAwardTypeType> | BonusAwardAwardTypeType | null
  readonly notIn?: ReadonlyArray<BonusAwardAwardTypeType> | BonusAwardAwardTypeType | null
  readonly not?: BonusAwardAwardTypeTypeNullableFilter | null
}

export type BonusAwardStatusTypeNullableFilter = {
  readonly equals?: BonusAwardStatusType | null
  readonly in?: ReadonlyArray<BonusAwardStatusType> | BonusAwardStatusType | null
  readonly notIn?: ReadonlyArray<BonusAwardStatusType> | BonusAwardStatusType | null
  readonly not?: BonusAwardStatusTypeNullableFilter | null
}

export type BonusAwardOrderByInput = {
  readonly id?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly remainingMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly awardType?: OrderDirection | null
  readonly stakeReturned?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly awardedAt?: OrderDirection | null
  readonly activatedAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BonusAwardUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly ruleVersion?: PromotionRuleVersionRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly amountMinor?: string | null
  readonly remainingMinor?: string | null
  readonly currency?: string | null
  readonly awardType?: BonusAwardAwardTypeType | null
  readonly stakeReturned?: boolean | null
  readonly status?: BonusAwardStatusType | null
  readonly awardedAt?: any | null
  readonly activatedAt?: any | null
  readonly expiresAt?: any | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRuleVersionRelateToOneForUpdateInput = {
  readonly create?: PromotionRuleVersionCreateInput | null
  readonly connect?: PromotionRuleVersionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type BonusAwardUpdateArgs = {
  readonly where: BonusAwardWhereUniqueInput
  readonly data: BonusAwardUpdateInput
}

export type BonusAwardCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly ruleVersion?: PromotionRuleVersionRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly amountMinor?: string | null
  readonly remainingMinor?: string | null
  readonly currency?: string | null
  readonly awardType?: BonusAwardAwardTypeType | null
  readonly stakeReturned?: boolean | null
  readonly status?: BonusAwardStatusType | null
  readonly awardedAt?: any | null
  readonly activatedAt?: any | null
  readonly expiresAt?: any | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRuleVersionRelateToOneForCreateInput = {
  readonly create?: PromotionRuleVersionCreateInput | null
  readonly connect?: PromotionRuleVersionWhereUniqueInput | null
}

export type BonusTransactionTypeType =
  | 'AWARD'
  | 'ACTIVATE'
  | 'RESERVE'
  | 'CONSUME'
  | 'RELEASE'
  | 'CONVERT'
  | 'EXPIRE'
  | 'FORFEIT'
  | 'REVERSE'

export type BonusTransactionWhereUniqueInput = {
  readonly id?: string | null
}

export type BonusTransactionWhereInput = {
  readonly AND?: ReadonlyArray<BonusTransactionWhereInput> | BonusTransactionWhereInput | null
  readonly OR?: ReadonlyArray<BonusTransactionWhereInput> | BonusTransactionWhereInput | null
  readonly NOT?: ReadonlyArray<BonusTransactionWhereInput> | BonusTransactionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly award?: BonusAwardWhereInput | null
  readonly type?: BonusTransactionTypeTypeNullableFilter | null
  readonly amountMinor?: StringFilter | null
  readonly remainingMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly wager?: WagerWhereInput | null
  readonly journalTransaction?: JournalTransactionWhereInput | null
  readonly idempotencyKey?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BonusTransactionTypeTypeNullableFilter = {
  readonly equals?: BonusTransactionTypeType | null
  readonly in?: ReadonlyArray<BonusTransactionTypeType> | BonusTransactionTypeType | null
  readonly notIn?: ReadonlyArray<BonusTransactionTypeType> | BonusTransactionTypeType | null
  readonly not?: BonusTransactionTypeTypeNullableFilter | null
}

export type BonusTransactionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly remainingMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BonusTransactionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly award?: BonusAwardRelateToOneForUpdateInput | null
  readonly type?: BonusTransactionTypeType | null
  readonly amountMinor?: string | null
  readonly remainingMinor?: string | null
  readonly currency?: string | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly journalTransaction?: JournalTransactionRelateToOneForUpdateInput | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BonusTransactionUpdateArgs = {
  readonly where: BonusTransactionWhereUniqueInput
  readonly data: BonusTransactionUpdateInput
}

export type BonusTransactionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly award?: BonusAwardRelateToOneForCreateInput | null
  readonly type?: BonusTransactionTypeType | null
  readonly amountMinor?: string | null
  readonly remainingMinor?: string | null
  readonly currency?: string | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly journalTransaction?: JournalTransactionRelateToOneForCreateInput | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandLocaleStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type BrandLocaleWhereUniqueInput = {
  readonly id?: string | null
}

export type BrandLocaleWhereInput = {
  readonly AND?: ReadonlyArray<BrandLocaleWhereInput> | BrandLocaleWhereInput | null
  readonly OR?: ReadonlyArray<BrandLocaleWhereInput> | BrandLocaleWhereInput | null
  readonly NOT?: ReadonlyArray<BrandLocaleWhereInput> | BrandLocaleWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly brand?: BrandWhereInput | null
  readonly locale?: StringFilter | null
  readonly language?: StringFilter | null
  readonly timezone?: StringFilter | null
  readonly termsVersion?: StringFilter | null
  readonly termsContentHash?: StringFilter | null
  readonly default?: BooleanFilter | null
  readonly status?: BrandLocaleStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type BrandLocaleStatusTypeNullableFilter = {
  readonly equals?: BrandLocaleStatusType | null
  readonly in?: ReadonlyArray<BrandLocaleStatusType> | BrandLocaleStatusType | null
  readonly notIn?: ReadonlyArray<BrandLocaleStatusType> | BrandLocaleStatusType | null
  readonly not?: BrandLocaleStatusTypeNullableFilter | null
}

export type BrandLocaleOrderByInput = {
  readonly id?: OrderDirection | null
  readonly locale?: OrderDirection | null
  readonly language?: OrderDirection | null
  readonly timezone?: OrderDirection | null
  readonly termsVersion?: OrderDirection | null
  readonly termsContentHash?: OrderDirection | null
  readonly default?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type BrandLocaleUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly brand?: BrandRelateToOneForUpdateInput | null
  readonly locale?: string | null
  readonly language?: string | null
  readonly timezone?: string | null
  readonly termsVersion?: string | null
  readonly termsContentHash?: string | null
  readonly default?: boolean | null
  readonly status?: BrandLocaleStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type BrandLocaleUpdateArgs = {
  readonly where: BrandLocaleWhereUniqueInput
  readonly data: BrandLocaleUpdateInput
}

export type BrandLocaleCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly brand?: BrandRelateToOneForCreateInput | null
  readonly locale?: string | null
  readonly language?: string | null
  readonly timezone?: string | null
  readonly termsVersion?: string | null
  readonly termsContentHash?: string | null
  readonly default?: boolean | null
  readonly status?: BrandLocaleStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CampaignBudgetStatusType =
  | 'ACTIVE'
  | 'EXHAUSTED'
  | 'CLOSED'

export type CampaignBudgetWhereUniqueInput = {
  readonly id?: string | null
}

export type CampaignBudgetWhereInput = {
  readonly AND?: ReadonlyArray<CampaignBudgetWhereInput> | CampaignBudgetWhereInput | null
  readonly OR?: ReadonlyArray<CampaignBudgetWhereInput> | CampaignBudgetWhereInput | null
  readonly NOT?: ReadonlyArray<CampaignBudgetWhereInput> | CampaignBudgetWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly promotion?: PromotionWhereInput | null
  readonly allocatedMinor?: StringFilter | null
  readonly awardedMinor?: StringFilter | null
  readonly redeemedMinor?: StringFilter | null
  readonly forfeitedMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly version?: IntFilter | null
  readonly status?: CampaignBudgetStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CampaignBudgetStatusTypeNullableFilter = {
  readonly equals?: CampaignBudgetStatusType | null
  readonly in?: ReadonlyArray<CampaignBudgetStatusType> | CampaignBudgetStatusType | null
  readonly notIn?: ReadonlyArray<CampaignBudgetStatusType> | CampaignBudgetStatusType | null
  readonly not?: CampaignBudgetStatusTypeNullableFilter | null
}

export type CampaignBudgetOrderByInput = {
  readonly id?: OrderDirection | null
  readonly allocatedMinor?: OrderDirection | null
  readonly awardedMinor?: OrderDirection | null
  readonly redeemedMinor?: OrderDirection | null
  readonly forfeitedMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CampaignBudgetUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly allocatedMinor?: string | null
  readonly awardedMinor?: string | null
  readonly redeemedMinor?: string | null
  readonly forfeitedMinor?: string | null
  readonly currency?: string | null
  readonly version?: number | null
  readonly status?: CampaignBudgetStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CampaignBudgetUpdateArgs = {
  readonly where: CampaignBudgetWhereUniqueInput
  readonly data: CampaignBudgetUpdateInput
}

export type CampaignBudgetCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly allocatedMinor?: string | null
  readonly awardedMinor?: string | null
  readonly redeemedMinor?: string | null
  readonly forfeitedMinor?: string | null
  readonly currency?: string | null
  readonly version?: number | null
  readonly status?: CampaignBudgetStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CashOutAcceptanceStatusType =
  | 'ACCEPTED'
  | 'REVERSED'

export type CashOutAcceptanceWhereUniqueInput = {
  readonly id?: string | null
}

export type CashOutAcceptanceWhereInput = {
  readonly AND?: ReadonlyArray<CashOutAcceptanceWhereInput> | CashOutAcceptanceWhereInput | null
  readonly OR?: ReadonlyArray<CashOutAcceptanceWhereInput> | CashOutAcceptanceWhereInput | null
  readonly NOT?: ReadonlyArray<CashOutAcceptanceWhereInput> | CashOutAcceptanceWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly offer?: CashOutOfferWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly portionNumerator?: StringFilter | null
  readonly portionDenominator?: StringFilter | null
  readonly wagerVersion?: IntFilter | null
  readonly acceptedAt?: DateTimeFilter | null
  readonly journalTransaction?: JournalTransactionWhereInput | null
  readonly status?: CashOutAcceptanceStatusTypeNullableFilter | null
  readonly reversalOf?: CashOutAcceptanceWhereInput | null
  readonly idempotencyKey?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CashOutAcceptanceStatusTypeNullableFilter = {
  readonly equals?: CashOutAcceptanceStatusType | null
  readonly in?: ReadonlyArray<CashOutAcceptanceStatusType> | CashOutAcceptanceStatusType | null
  readonly notIn?: ReadonlyArray<CashOutAcceptanceStatusType> | CashOutAcceptanceStatusType | null
  readonly not?: CashOutAcceptanceStatusTypeNullableFilter | null
}

export type CashOutAcceptanceOrderByInput = {
  readonly id?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly portionNumerator?: OrderDirection | null
  readonly portionDenominator?: OrderDirection | null
  readonly wagerVersion?: OrderDirection | null
  readonly acceptedAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CashOutAcceptanceUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly offer?: CashOutOfferRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly portionNumerator?: string | null
  readonly portionDenominator?: string | null
  readonly wagerVersion?: number | null
  readonly acceptedAt?: any | null
  readonly journalTransaction?: JournalTransactionRelateToOneForUpdateInput | null
  readonly status?: CashOutAcceptanceStatusType | null
  readonly reversalOf?: CashOutAcceptanceRelateToOneForUpdateInput | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CashOutOfferRelateToOneForUpdateInput = {
  readonly create?: CashOutOfferCreateInput | null
  readonly connect?: CashOutOfferWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CashOutAcceptanceRelateToOneForUpdateInput = {
  readonly create?: CashOutAcceptanceCreateInput | null
  readonly connect?: CashOutAcceptanceWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CashOutAcceptanceUpdateArgs = {
  readonly where: CashOutAcceptanceWhereUniqueInput
  readonly data: CashOutAcceptanceUpdateInput
}

export type CashOutAcceptanceCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly offer?: CashOutOfferRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly portionNumerator?: string | null
  readonly portionDenominator?: string | null
  readonly wagerVersion?: number | null
  readonly acceptedAt?: any | null
  readonly journalTransaction?: JournalTransactionRelateToOneForCreateInput | null
  readonly status?: CashOutAcceptanceStatusType | null
  readonly reversalOf?: CashOutAcceptanceRelateToOneForCreateInput | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CashOutOfferRelateToOneForCreateInput = {
  readonly create?: CashOutOfferCreateInput | null
  readonly connect?: CashOutOfferWhereUniqueInput | null
}

export type CashOutAcceptanceRelateToOneForCreateInput = {
  readonly create?: CashOutAcceptanceCreateInput | null
  readonly connect?: CashOutAcceptanceWhereUniqueInput | null
}

export type CompetitionStageStatusType =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'COMPLETE'

export type CompetitionStageWhereUniqueInput = {
  readonly id?: string | null
}

export type CompetitionStageWhereInput = {
  readonly AND?: ReadonlyArray<CompetitionStageWhereInput> | CompetitionStageWhereInput | null
  readonly OR?: ReadonlyArray<CompetitionStageWhereInput> | CompetitionStageWhereInput | null
  readonly NOT?: ReadonlyArray<CompetitionStageWhereInput> | CompetitionStageWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly season?: SeasonWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly sortOrder?: IntFilter | null
  readonly status?: CompetitionStageStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CompetitionStageStatusTypeNullableFilter = {
  readonly equals?: CompetitionStageStatusType | null
  readonly in?: ReadonlyArray<CompetitionStageStatusType> | CompetitionStageStatusType | null
  readonly notIn?: ReadonlyArray<CompetitionStageStatusType> | CompetitionStageStatusType | null
  readonly not?: CompetitionStageStatusTypeNullableFilter | null
}

export type CompetitionStageOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly sortOrder?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CompetitionStageUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly season?: SeasonRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sortOrder?: number | null
  readonly status?: CompetitionStageStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CompetitionStageUpdateArgs = {
  readonly where: CompetitionStageWhereUniqueInput
  readonly data: CompetitionStageUpdateInput
}

export type CompetitionStageCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly season?: SeasonRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sortOrder?: number | null
  readonly status?: CompetitionStageStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConfigDefinitionValueTypeType =
  | 'STRING'
  | 'INTEGER'
  | 'MONEY'
  | 'BOOLEAN'
  | 'JSON'

export type ConfigDefinitionMergeStrategyType =
  | 'REPLACE'
  | 'MIN'
  | 'MAX'
  | 'UNION'
  | 'DENY_WINS'

export type ConfigDefinitionWhereUniqueInput = {
  readonly id?: string | null
}

export type ConfigDefinitionWhereInput = {
  readonly AND?: ReadonlyArray<ConfigDefinitionWhereInput> | ConfigDefinitionWhereInput | null
  readonly OR?: ReadonlyArray<ConfigDefinitionWhereInput> | ConfigDefinitionWhereInput | null
  readonly NOT?: ReadonlyArray<ConfigDefinitionWhereInput> | ConfigDefinitionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly valueType?: ConfigDefinitionValueTypeTypeNullableFilter | null
  readonly mergeStrategy?: ConfigDefinitionMergeStrategyTypeNullableFilter | null
  readonly secret?: BooleanFilter | null
  readonly description?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ConfigDefinitionValueTypeTypeNullableFilter = {
  readonly equals?: ConfigDefinitionValueTypeType | null
  readonly in?: ReadonlyArray<ConfigDefinitionValueTypeType> | ConfigDefinitionValueTypeType | null
  readonly notIn?: ReadonlyArray<ConfigDefinitionValueTypeType> | ConfigDefinitionValueTypeType | null
  readonly not?: ConfigDefinitionValueTypeTypeNullableFilter | null
}

export type ConfigDefinitionMergeStrategyTypeNullableFilter = {
  readonly equals?: ConfigDefinitionMergeStrategyType | null
  readonly in?: ReadonlyArray<ConfigDefinitionMergeStrategyType> | ConfigDefinitionMergeStrategyType | null
  readonly notIn?: ReadonlyArray<ConfigDefinitionMergeStrategyType> | ConfigDefinitionMergeStrategyType | null
  readonly not?: ConfigDefinitionMergeStrategyTypeNullableFilter | null
}

export type ConfigDefinitionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly valueType?: OrderDirection | null
  readonly mergeStrategy?: OrderDirection | null
  readonly secret?: OrderDirection | null
  readonly description?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ConfigDefinitionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly valueType?: ConfigDefinitionValueTypeType | null
  readonly mergeStrategy?: ConfigDefinitionMergeStrategyType | null
  readonly allowedScopes?: import('@keystone-6/core/types').JSONValue | null
  readonly validationSchema?: import('@keystone-6/core/types').JSONValue | null
  readonly secret?: boolean | null
  readonly description?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ConfigDefinitionUpdateArgs = {
  readonly where: ConfigDefinitionWhereUniqueInput
  readonly data: ConfigDefinitionUpdateInput
}

export type ConfigDefinitionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly valueType?: ConfigDefinitionValueTypeType | null
  readonly mergeStrategy?: ConfigDefinitionMergeStrategyType | null
  readonly allowedScopes?: import('@keystone-6/core/types').JSONValue | null
  readonly validationSchema?: import('@keystone-6/core/types').JSONValue | null
  readonly secret?: boolean | null
  readonly description?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CorrelationGroupStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type CorrelationGroupWhereUniqueInput = {
  readonly id?: string | null
}

export type CorrelationGroupWhereInput = {
  readonly AND?: ReadonlyArray<CorrelationGroupWhereInput> | CorrelationGroupWhereInput | null
  readonly OR?: ReadonlyArray<CorrelationGroupWhereInput> | CorrelationGroupWhereInput | null
  readonly NOT?: ReadonlyArray<CorrelationGroupWhereInput> | CorrelationGroupWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly sportKey?: StringFilter | null
  readonly status?: CorrelationGroupStatusTypeNullableFilter | null
  readonly version?: IntFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CorrelationGroupStatusTypeNullableFilter = {
  readonly equals?: CorrelationGroupStatusType | null
  readonly in?: ReadonlyArray<CorrelationGroupStatusType> | CorrelationGroupStatusType | null
  readonly notIn?: ReadonlyArray<CorrelationGroupStatusType> | CorrelationGroupStatusType | null
  readonly not?: CorrelationGroupStatusTypeNullableFilter | null
}

export type CorrelationGroupOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly sportKey?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CorrelationGroupUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sportKey?: string | null
  readonly status?: CorrelationGroupStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CorrelationGroupUpdateArgs = {
  readonly where: CorrelationGroupWhereUniqueInput
  readonly data: CorrelationGroupUpdateInput
}

export type CorrelationGroupCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sportKey?: string | null
  readonly status?: CorrelationGroupStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CorrelationRuleDecisionType =
  | 'ALLOW'
  | 'DENY'
  | 'PROVIDER_PRICE_REQUIRED'

export type CorrelationRuleWhereUniqueInput = {
  readonly id?: string | null
}

export type CorrelationRuleWhereInput = {
  readonly AND?: ReadonlyArray<CorrelationRuleWhereInput> | CorrelationRuleWhereInput | null
  readonly OR?: ReadonlyArray<CorrelationRuleWhereInput> | CorrelationRuleWhereInput | null
  readonly NOT?: ReadonlyArray<CorrelationRuleWhereInput> | CorrelationRuleWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly group?: CorrelationGroupWhereInput | null
  readonly decision?: CorrelationRuleDecisionTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly priority?: IntFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CorrelationRuleDecisionTypeNullableFilter = {
  readonly equals?: CorrelationRuleDecisionType | null
  readonly in?: ReadonlyArray<CorrelationRuleDecisionType> | CorrelationRuleDecisionType | null
  readonly notIn?: ReadonlyArray<CorrelationRuleDecisionType> | CorrelationRuleDecisionType | null
  readonly not?: CorrelationRuleDecisionTypeNullableFilter | null
}

export type CorrelationRuleOrderByInput = {
  readonly id?: OrderDirection | null
  readonly decision?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly priority?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CorrelationRuleUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly group?: CorrelationGroupRelateToOneForUpdateInput | null
  readonly leftPattern?: import('@keystone-6/core/types').JSONValue | null
  readonly rightPattern?: import('@keystone-6/core/types').JSONValue | null
  readonly decision?: CorrelationRuleDecisionType | null
  readonly reasonCode?: string | null
  readonly priority?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CorrelationGroupRelateToOneForUpdateInput = {
  readonly create?: CorrelationGroupCreateInput | null
  readonly connect?: CorrelationGroupWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CorrelationRuleUpdateArgs = {
  readonly where: CorrelationRuleWhereUniqueInput
  readonly data: CorrelationRuleUpdateInput
}

export type CorrelationRuleCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly group?: CorrelationGroupRelateToOneForCreateInput | null
  readonly leftPattern?: import('@keystone-6/core/types').JSONValue | null
  readonly rightPattern?: import('@keystone-6/core/types').JSONValue | null
  readonly decision?: CorrelationRuleDecisionType | null
  readonly reasonCode?: string | null
  readonly priority?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CorrelationGroupRelateToOneForCreateInput = {
  readonly create?: CorrelationGroupCreateInput | null
  readonly connect?: CorrelationGroupWhereUniqueInput | null
}

export type CurrencyDefinitionStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type CurrencyDefinitionWhereUniqueInput = {
  readonly id?: string | null
  readonly code?: string | null
}

export type CurrencyDefinitionWhereInput = {
  readonly AND?: ReadonlyArray<CurrencyDefinitionWhereInput> | CurrencyDefinitionWhereInput | null
  readonly OR?: ReadonlyArray<CurrencyDefinitionWhereInput> | CurrencyDefinitionWhereInput | null
  readonly NOT?: ReadonlyArray<CurrencyDefinitionWhereInput> | CurrencyDefinitionWhereInput | null
  readonly id?: IDFilter | null
  readonly code?: StringFilter | null
  readonly exponent?: IntFilter | null
  readonly name?: StringFilter | null
  readonly status?: CurrencyDefinitionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CurrencyDefinitionStatusTypeNullableFilter = {
  readonly equals?: CurrencyDefinitionStatusType | null
  readonly in?: ReadonlyArray<CurrencyDefinitionStatusType> | CurrencyDefinitionStatusType | null
  readonly notIn?: ReadonlyArray<CurrencyDefinitionStatusType> | CurrencyDefinitionStatusType | null
  readonly not?: CurrencyDefinitionStatusTypeNullableFilter | null
}

export type CurrencyDefinitionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly code?: OrderDirection | null
  readonly exponent?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CurrencyDefinitionUpdateInput = {
  readonly code?: string | null
  readonly exponent?: number | null
  readonly name?: string | null
  readonly status?: CurrencyDefinitionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CurrencyDefinitionUpdateArgs = {
  readonly where: CurrencyDefinitionWhereUniqueInput
  readonly data: CurrencyDefinitionUpdateInput
}

export type CurrencyDefinitionCreateInput = {
  readonly code?: string | null
  readonly exponent?: number | null
  readonly name?: string | null
  readonly status?: CurrencyDefinitionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerCredentialStatusType =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'LOCKED'
  | 'CLOSED'

export type CustomerCredentialWhereUniqueInput = {
  readonly id?: string | null
  readonly emailDigest?: string | null
}

export type CustomerCredentialWhereInput = {
  readonly AND?: ReadonlyArray<CustomerCredentialWhereInput> | CustomerCredentialWhereInput | null
  readonly OR?: ReadonlyArray<CustomerCredentialWhereInput> | CustomerCredentialWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerCredentialWhereInput> | CustomerCredentialWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly emailDigest?: StringFilter | null
  readonly emailMasked?: StringFilter | null
  readonly passwordHash?: StringFilter | null
  readonly passwordVersion?: IntNullableFilter | null
  readonly status?: CustomerCredentialStatusTypeNullableFilter | null
  readonly failedAttempts?: IntNullableFilter | null
  readonly lockedUntil?: DateTimeNullableFilter | null
  readonly verifiedAt?: DateTimeNullableFilter | null
  readonly lastAuthenticatedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerCredentialStatusTypeNullableFilter = {
  readonly equals?: CustomerCredentialStatusType | null
  readonly in?: ReadonlyArray<CustomerCredentialStatusType> | CustomerCredentialStatusType | null
  readonly notIn?: ReadonlyArray<CustomerCredentialStatusType> | CustomerCredentialStatusType | null
  readonly not?: CustomerCredentialStatusTypeNullableFilter | null
}

export type CustomerCredentialOrderByInput = {
  readonly id?: OrderDirection | null
  readonly emailDigest?: OrderDirection | null
  readonly emailMasked?: OrderDirection | null
  readonly passwordHash?: OrderDirection | null
  readonly passwordVersion?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly failedAttempts?: OrderDirection | null
  readonly lockedUntil?: OrderDirection | null
  readonly verifiedAt?: OrderDirection | null
  readonly lastAuthenticatedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerCredentialUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly emailDigest?: string | null
  readonly emailMasked?: string | null
  readonly passwordHash?: string | null
  readonly passwordVersion?: number | null
  readonly status?: CustomerCredentialStatusType | null
  readonly failedAttempts?: number | null
  readonly lockedUntil?: any | null
  readonly verifiedAt?: any | null
  readonly lastAuthenticatedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerCredentialUpdateArgs = {
  readonly where: CustomerCredentialWhereUniqueInput
  readonly data: CustomerCredentialUpdateInput
}

export type CustomerCredentialCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly emailDigest?: string | null
  readonly emailMasked?: string | null
  readonly passwordHash?: string | null
  readonly passwordVersion?: number | null
  readonly status?: CustomerCredentialStatusType | null
  readonly failedAttempts?: number | null
  readonly lockedUntil?: any | null
  readonly verifiedAt?: any | null
  readonly lastAuthenticatedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerDeviceWhereUniqueInput = {
  readonly id?: string | null
}

export type CustomerDeviceWhereInput = {
  readonly AND?: ReadonlyArray<CustomerDeviceWhereInput> | CustomerDeviceWhereInput | null
  readonly OR?: ReadonlyArray<CustomerDeviceWhereInput> | CustomerDeviceWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerDeviceWhereInput> | CustomerDeviceWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly session?: CustomerSessionWhereInput | null
  readonly deviceDigest?: StringFilter | null
  readonly label?: StringFilter | null
  readonly firstSeenAt?: DateTimeFilter | null
  readonly lastSeenAt?: DateTimeFilter | null
  readonly revokedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerDeviceOrderByInput = {
  readonly id?: OrderDirection | null
  readonly deviceDigest?: OrderDirection | null
  readonly label?: OrderDirection | null
  readonly firstSeenAt?: OrderDirection | null
  readonly lastSeenAt?: OrderDirection | null
  readonly revokedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerDeviceUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly session?: CustomerSessionRelateToOneForUpdateInput | null
  readonly deviceDigest?: string | null
  readonly label?: string | null
  readonly firstSeenAt?: any | null
  readonly lastSeenAt?: any | null
  readonly revokedAt?: any | null
  readonly riskSignals?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerSessionRelateToOneForUpdateInput = {
  readonly create?: CustomerSessionCreateInput | null
  readonly connect?: CustomerSessionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type CustomerDeviceUpdateArgs = {
  readonly where: CustomerDeviceWhereUniqueInput
  readonly data: CustomerDeviceUpdateInput
}

export type CustomerDeviceCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly session?: CustomerSessionRelateToOneForCreateInput | null
  readonly deviceDigest?: string | null
  readonly label?: string | null
  readonly firstSeenAt?: any | null
  readonly lastSeenAt?: any | null
  readonly revokedAt?: any | null
  readonly riskSignals?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerSessionRelateToOneForCreateInput = {
  readonly create?: CustomerSessionCreateInput | null
  readonly connect?: CustomerSessionWhereUniqueInput | null
}

export type CustomerFavoriteTargetTypeType =
  | 'SPORT'
  | 'COMPETITION'
  | 'EVENT'
  | 'COMPETITOR'

export type CustomerFavoriteWhereUniqueInput = {
  readonly id?: string | null
}

export type CustomerFavoriteWhereInput = {
  readonly AND?: ReadonlyArray<CustomerFavoriteWhereInput> | CustomerFavoriteWhereInput | null
  readonly OR?: ReadonlyArray<CustomerFavoriteWhereInput> | CustomerFavoriteWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerFavoriteWhereInput> | CustomerFavoriteWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly targetType?: CustomerFavoriteTargetTypeTypeNullableFilter | null
  readonly targetId?: StringFilter | null
  readonly createdByDevice?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerFavoriteTargetTypeTypeNullableFilter = {
  readonly equals?: CustomerFavoriteTargetTypeType | null
  readonly in?: ReadonlyArray<CustomerFavoriteTargetTypeType> | CustomerFavoriteTargetTypeType | null
  readonly notIn?: ReadonlyArray<CustomerFavoriteTargetTypeType> | CustomerFavoriteTargetTypeType | null
  readonly not?: CustomerFavoriteTargetTypeTypeNullableFilter | null
}

export type CustomerFavoriteOrderByInput = {
  readonly id?: OrderDirection | null
  readonly targetType?: OrderDirection | null
  readonly targetId?: OrderDirection | null
  readonly createdByDevice?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerFavoriteUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly targetType?: CustomerFavoriteTargetTypeType | null
  readonly targetId?: string | null
  readonly createdByDevice?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerFavoriteUpdateArgs = {
  readonly where: CustomerFavoriteWhereUniqueInput
  readonly data: CustomerFavoriteUpdateInput
}

export type CustomerFavoriteCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly targetType?: CustomerFavoriteTargetTypeType | null
  readonly targetId?: string | null
  readonly createdByDevice?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerPrivacyRequestTypeType =
  | 'ACCESS'
  | 'EXPORT'
  | 'CORRECT'
  | 'DELETE'
  | 'RESTRICT'
  | 'PORTABILITY'

export type CustomerPrivacyRequestStatusType =
  | 'OPEN'
  | 'VERIFYING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DENIED'

export type CustomerPrivacyRequestWhereUniqueInput = {
  readonly id?: string | null
}

export type CustomerPrivacyRequestWhereInput = {
  readonly AND?: ReadonlyArray<CustomerPrivacyRequestWhereInput> | CustomerPrivacyRequestWhereInput | null
  readonly OR?: ReadonlyArray<CustomerPrivacyRequestWhereInput> | CustomerPrivacyRequestWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerPrivacyRequestWhereInput> | CustomerPrivacyRequestWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly type?: CustomerPrivacyRequestTypeTypeNullableFilter | null
  readonly status?: CustomerPrivacyRequestStatusTypeNullableFilter | null
  readonly requestedAt?: DateTimeFilter | null
  readonly dueAt?: DateTimeFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly identityEvidenceHash?: StringFilter | null
  readonly artifactReference?: StringFilter | null
  readonly decisionReason?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerPrivacyRequestTypeTypeNullableFilter = {
  readonly equals?: CustomerPrivacyRequestTypeType | null
  readonly in?: ReadonlyArray<CustomerPrivacyRequestTypeType> | CustomerPrivacyRequestTypeType | null
  readonly notIn?: ReadonlyArray<CustomerPrivacyRequestTypeType> | CustomerPrivacyRequestTypeType | null
  readonly not?: CustomerPrivacyRequestTypeTypeNullableFilter | null
}

export type CustomerPrivacyRequestStatusTypeNullableFilter = {
  readonly equals?: CustomerPrivacyRequestStatusType | null
  readonly in?: ReadonlyArray<CustomerPrivacyRequestStatusType> | CustomerPrivacyRequestStatusType | null
  readonly notIn?: ReadonlyArray<CustomerPrivacyRequestStatusType> | CustomerPrivacyRequestStatusType | null
  readonly not?: CustomerPrivacyRequestStatusTypeNullableFilter | null
}

export type CustomerPrivacyRequestOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly requestedAt?: OrderDirection | null
  readonly dueAt?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly identityEvidenceHash?: OrderDirection | null
  readonly artifactReference?: OrderDirection | null
  readonly decisionReason?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerPrivacyRequestUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly type?: CustomerPrivacyRequestTypeType | null
  readonly status?: CustomerPrivacyRequestStatusType | null
  readonly requestedAt?: any | null
  readonly dueAt?: any | null
  readonly completedAt?: any | null
  readonly identityEvidenceHash?: string | null
  readonly artifactReference?: string | null
  readonly decisionReason?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerPrivacyRequestUpdateArgs = {
  readonly where: CustomerPrivacyRequestWhereUniqueInput
  readonly data: CustomerPrivacyRequestUpdateInput
}

export type CustomerPrivacyRequestCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly type?: CustomerPrivacyRequestTypeType | null
  readonly status?: CustomerPrivacyRequestStatusType | null
  readonly requestedAt?: any | null
  readonly dueAt?: any | null
  readonly completedAt?: any | null
  readonly identityEvidenceHash?: string | null
  readonly artifactReference?: string | null
  readonly decisionReason?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerRecoveryTokenPurposeType =
  | 'VERIFY_EMAIL'
  | 'RESET_PASSWORD'
  | 'RECOVER_ACCOUNT'

export type CustomerRecoveryTokenWhereUniqueInput = {
  readonly id?: string | null
  readonly tokenDigest?: string | null
}

export type CustomerRecoveryTokenWhereInput = {
  readonly AND?: ReadonlyArray<CustomerRecoveryTokenWhereInput> | CustomerRecoveryTokenWhereInput | null
  readonly OR?: ReadonlyArray<CustomerRecoveryTokenWhereInput> | CustomerRecoveryTokenWhereInput | null
  readonly NOT?: ReadonlyArray<CustomerRecoveryTokenWhereInput> | CustomerRecoveryTokenWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly tokenDigest?: StringFilter | null
  readonly purpose?: CustomerRecoveryTokenPurposeTypeNullableFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly consumedAt?: DateTimeNullableFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type CustomerRecoveryTokenPurposeTypeNullableFilter = {
  readonly equals?: CustomerRecoveryTokenPurposeType | null
  readonly in?: ReadonlyArray<CustomerRecoveryTokenPurposeType> | CustomerRecoveryTokenPurposeType | null
  readonly notIn?: ReadonlyArray<CustomerRecoveryTokenPurposeType> | CustomerRecoveryTokenPurposeType | null
  readonly not?: CustomerRecoveryTokenPurposeTypeNullableFilter | null
}

export type CustomerRecoveryTokenOrderByInput = {
  readonly id?: OrderDirection | null
  readonly tokenDigest?: OrderDirection | null
  readonly purpose?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly consumedAt?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type CustomerRecoveryTokenUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly tokenDigest?: string | null
  readonly purpose?: CustomerRecoveryTokenPurposeType | null
  readonly expiresAt?: any | null
  readonly consumedAt?: any | null
  readonly attempts?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CustomerRecoveryTokenUpdateArgs = {
  readonly where: CustomerRecoveryTokenWhereUniqueInput
  readonly data: CustomerRecoveryTokenUpdateInput
}

export type CustomerRecoveryTokenCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly tokenDigest?: string | null
  readonly purpose?: CustomerRecoveryTokenPurposeType | null
  readonly expiresAt?: any | null
  readonly consumedAt?: any | null
  readonly attempts?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DataExportTypeType =
  | 'AUDIT'
  | 'WAGERS'
  | 'FINANCE'
  | 'CUSTOMERS'
  | 'REGULATORY'
  | 'PRIVACY'

export type DataExportClassificationType =
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED_PII'
  | 'RESTRICTED_FINANCIAL'
  | 'RESTRICTED_REGULATORY'

export type DataExportStatusType =
  | 'PENDING'
  | 'GENERATING'
  | 'READY'
  | 'EXPIRED'
  | 'REVOKED'

export type DataExportWhereUniqueInput = {
  readonly id?: string | null
}

export type DataExportWhereInput = {
  readonly AND?: ReadonlyArray<DataExportWhereInput> | DataExportWhereInput | null
  readonly OR?: ReadonlyArray<DataExportWhereInput> | DataExportWhereInput | null
  readonly NOT?: ReadonlyArray<DataExportWhereInput> | DataExportWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly requestedBy?: StringFilter | null
  readonly type?: DataExportTypeTypeNullableFilter | null
  readonly classification?: DataExportClassificationTypeNullableFilter | null
  readonly status?: DataExportStatusTypeNullableFilter | null
  readonly rowCount?: IntNullableFilter | null
  readonly contentHash?: StringFilter | null
  readonly storageReference?: StringFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type DataExportTypeTypeNullableFilter = {
  readonly equals?: DataExportTypeType | null
  readonly in?: ReadonlyArray<DataExportTypeType> | DataExportTypeType | null
  readonly notIn?: ReadonlyArray<DataExportTypeType> | DataExportTypeType | null
  readonly not?: DataExportTypeTypeNullableFilter | null
}

export type DataExportClassificationTypeNullableFilter = {
  readonly equals?: DataExportClassificationType | null
  readonly in?: ReadonlyArray<DataExportClassificationType> | DataExportClassificationType | null
  readonly notIn?: ReadonlyArray<DataExportClassificationType> | DataExportClassificationType | null
  readonly not?: DataExportClassificationTypeNullableFilter | null
}

export type DataExportStatusTypeNullableFilter = {
  readonly equals?: DataExportStatusType | null
  readonly in?: ReadonlyArray<DataExportStatusType> | DataExportStatusType | null
  readonly notIn?: ReadonlyArray<DataExportStatusType> | DataExportStatusType | null
  readonly not?: DataExportStatusTypeNullableFilter | null
}

export type DataExportOrderByInput = {
  readonly id?: OrderDirection | null
  readonly requestedBy?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly classification?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly rowCount?: OrderDirection | null
  readonly contentHash?: OrderDirection | null
  readonly storageReference?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type DataExportUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly requestedBy?: string | null
  readonly type?: DataExportTypeType | null
  readonly scope?: import('@keystone-6/core/types').JSONValue | null
  readonly classification?: DataExportClassificationType | null
  readonly status?: DataExportStatusType | null
  readonly rowCount?: number | null
  readonly contentHash?: string | null
  readonly storageReference?: string | null
  readonly expiresAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type DataExportUpdateArgs = {
  readonly where: DataExportWhereUniqueInput
  readonly data: DataExportUpdateInput
}

export type DataExportCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly requestedBy?: string | null
  readonly type?: DataExportTypeType | null
  readonly scope?: import('@keystone-6/core/types').JSONValue | null
  readonly classification?: DataExportClassificationType | null
  readonly status?: DataExportStatusType | null
  readonly rowCount?: number | null
  readonly contentHash?: string | null
  readonly storageReference?: string | null
  readonly expiresAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type EventScheduleChangeWhereUniqueInput = {
  readonly id?: string | null
}

export type EventScheduleChangeWhereInput = {
  readonly AND?: ReadonlyArray<EventScheduleChangeWhereInput> | EventScheduleChangeWhereInput | null
  readonly OR?: ReadonlyArray<EventScheduleChangeWhereInput> | EventScheduleChangeWhereInput | null
  readonly NOT?: ReadonlyArray<EventScheduleChangeWhereInput> | EventScheduleChangeWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly event?: EventWhereInput | null
  readonly fromStartAt?: DateTimeFilter | null
  readonly toStartAt?: DateTimeFilter | null
  readonly reasonCode?: StringFilter | null
  readonly source?: StringFilter | null
  readonly actorId?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type EventScheduleChangeOrderByInput = {
  readonly id?: OrderDirection | null
  readonly fromStartAt?: OrderDirection | null
  readonly toStartAt?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly source?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type EventScheduleChangeUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly event?: EventRelateToOneForUpdateInput | null
  readonly fromStartAt?: any | null
  readonly toStartAt?: any | null
  readonly reasonCode?: string | null
  readonly source?: string | null
  readonly actorId?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type EventScheduleChangeUpdateArgs = {
  readonly where: EventScheduleChangeWhereUniqueInput
  readonly data: EventScheduleChangeUpdateInput
}

export type EventScheduleChangeCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly event?: EventRelateToOneForCreateInput | null
  readonly fromStartAt?: any | null
  readonly toStartAt?: any | null
  readonly reasonCode?: string | null
  readonly source?: string | null
  readonly actorId?: string | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type FeatureFlagScopeTypeType =
  | 'TENANT'
  | 'BRAND'
  | 'JURISDICTION'
  | 'CHANNEL'

export type FeatureFlagWhereUniqueInput = {
  readonly id?: string | null
}

export type FeatureFlagWhereInput = {
  readonly AND?: ReadonlyArray<FeatureFlagWhereInput> | FeatureFlagWhereInput | null
  readonly OR?: ReadonlyArray<FeatureFlagWhereInput> | FeatureFlagWhereInput | null
  readonly NOT?: ReadonlyArray<FeatureFlagWhereInput> | FeatureFlagWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly description?: StringFilter | null
  readonly enabled?: BooleanFilter | null
  readonly scopeType?: FeatureFlagScopeTypeTypeNullableFilter | null
  readonly scopeId?: StringFilter | null
  readonly safeDefault?: BooleanFilter | null
  readonly ownerId?: StringFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type FeatureFlagScopeTypeTypeNullableFilter = {
  readonly equals?: FeatureFlagScopeTypeType | null
  readonly in?: ReadonlyArray<FeatureFlagScopeTypeType> | FeatureFlagScopeTypeType | null
  readonly notIn?: ReadonlyArray<FeatureFlagScopeTypeType> | FeatureFlagScopeTypeType | null
  readonly not?: FeatureFlagScopeTypeTypeNullableFilter | null
}

export type FeatureFlagOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly description?: OrderDirection | null
  readonly enabled?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly safeDefault?: OrderDirection | null
  readonly ownerId?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type FeatureFlagUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly description?: string | null
  readonly enabled?: boolean | null
  readonly scopeType?: FeatureFlagScopeTypeType | null
  readonly scopeId?: string | null
  readonly safeDefault?: boolean | null
  readonly ownerId?: string | null
  readonly expiresAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type FeatureFlagUpdateArgs = {
  readonly where: FeatureFlagWhereUniqueInput
  readonly data: FeatureFlagUpdateInput
}

export type FeatureFlagCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly description?: string | null
  readonly enabled?: boolean | null
  readonly scopeType?: FeatureFlagScopeTypeType | null
  readonly scopeId?: string | null
  readonly safeDefault?: boolean | null
  readonly ownerId?: string | null
  readonly expiresAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type FeedHealthSnapshotStatusType =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'STALE'
  | 'GAPPED'
  | 'DOWN'

export type FeedHealthSnapshotWhereUniqueInput = {
  readonly id?: string | null
}

export type FeedHealthSnapshotWhereInput = {
  readonly AND?: ReadonlyArray<FeedHealthSnapshotWhereInput> | FeedHealthSnapshotWhereInput | null
  readonly OR?: ReadonlyArray<FeedHealthSnapshotWhereInput> | FeedHealthSnapshotWhereInput | null
  readonly NOT?: ReadonlyArray<FeedHealthSnapshotWhereInput> | FeedHealthSnapshotWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly status?: FeedHealthSnapshotStatusTypeNullableFilter | null
  readonly heartbeatAt?: DateTimeNullableFilter | null
  readonly lagMs?: IntNullableFilter | null
  readonly lastSequence?: StringFilter | null
  readonly gapFrom?: StringFilter | null
  readonly gapTo?: StringFilter | null
  readonly checkedAt?: DateTimeFilter | null
  readonly actionTaken?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type FeedHealthSnapshotStatusTypeNullableFilter = {
  readonly equals?: FeedHealthSnapshotStatusType | null
  readonly in?: ReadonlyArray<FeedHealthSnapshotStatusType> | FeedHealthSnapshotStatusType | null
  readonly notIn?: ReadonlyArray<FeedHealthSnapshotStatusType> | FeedHealthSnapshotStatusType | null
  readonly not?: FeedHealthSnapshotStatusTypeNullableFilter | null
}

export type FeedHealthSnapshotOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly heartbeatAt?: OrderDirection | null
  readonly lagMs?: OrderDirection | null
  readonly lastSequence?: OrderDirection | null
  readonly gapFrom?: OrderDirection | null
  readonly gapTo?: OrderDirection | null
  readonly checkedAt?: OrderDirection | null
  readonly actionTaken?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type FeedHealthSnapshotUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly status?: FeedHealthSnapshotStatusType | null
  readonly heartbeatAt?: any | null
  readonly lagMs?: number | null
  readonly lastSequence?: string | null
  readonly gapFrom?: string | null
  readonly gapTo?: string | null
  readonly checkedAt?: any | null
  readonly actionTaken?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type FeedHealthSnapshotUpdateArgs = {
  readonly where: FeedHealthSnapshotWhereUniqueInput
  readonly data: FeedHealthSnapshotUpdateInput
}

export type FeedHealthSnapshotCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly status?: FeedHealthSnapshotStatusType | null
  readonly heartbeatAt?: any | null
  readonly lagMs?: number | null
  readonly lastSequence?: string | null
  readonly gapFrom?: string | null
  readonly gapTo?: string | null
  readonly checkedAt?: any | null
  readonly actionTaken?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type HouseRuleVersionStatusType =
  | 'DRAFT'
  | 'APPROVED'
  | 'ACTIVE'
  | 'RETIRED'

export type HouseRuleVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type HouseRuleVersionWhereInput = {
  readonly AND?: ReadonlyArray<HouseRuleVersionWhereInput> | HouseRuleVersionWhereInput | null
  readonly OR?: ReadonlyArray<HouseRuleVersionWhereInput> | HouseRuleVersionWhereInput | null
  readonly NOT?: ReadonlyArray<HouseRuleVersionWhereInput> | HouseRuleVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly version?: IntFilter | null
  readonly sportKey?: StringFilter | null
  readonly marketDefinitionKey?: StringFilter | null
  readonly semanticHash?: StringFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: HouseRuleVersionStatusTypeNullableFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type HouseRuleVersionStatusTypeNullableFilter = {
  readonly equals?: HouseRuleVersionStatusType | null
  readonly in?: ReadonlyArray<HouseRuleVersionStatusType> | HouseRuleVersionStatusType | null
  readonly notIn?: ReadonlyArray<HouseRuleVersionStatusType> | HouseRuleVersionStatusType | null
  readonly not?: HouseRuleVersionStatusTypeNullableFilter | null
}

export type HouseRuleVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly sportKey?: OrderDirection | null
  readonly marketDefinitionKey?: OrderDirection | null
  readonly semanticHash?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type HouseRuleVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly version?: number | null
  readonly sportKey?: string | null
  readonly marketDefinitionKey?: string | null
  readonly rules?: import('@keystone-6/core/types').JSONValue | null
  readonly semanticHash?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: HouseRuleVersionStatusType | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type HouseRuleVersionUpdateArgs = {
  readonly where: HouseRuleVersionWhereUniqueInput
  readonly data: HouseRuleVersionUpdateInput
}

export type HouseRuleVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly version?: number | null
  readonly sportKey?: string | null
  readonly marketDefinitionKey?: string | null
  readonly rules?: import('@keystone-6/core/types').JSONValue | null
  readonly semanticHash?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: HouseRuleVersionStatusType | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type IntegrationDeliveryAttemptWhereUniqueInput = {
  readonly id?: string | null
}

export type IntegrationDeliveryAttemptWhereInput = {
  readonly AND?: ReadonlyArray<IntegrationDeliveryAttemptWhereInput> | IntegrationDeliveryAttemptWhereInput | null
  readonly OR?: ReadonlyArray<IntegrationDeliveryAttemptWhereInput> | IntegrationDeliveryAttemptWhereInput | null
  readonly NOT?: ReadonlyArray<IntegrationDeliveryAttemptWhereInput> | IntegrationDeliveryAttemptWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly delivery?: WebhookDeliveryWhereInput | null
  readonly attempt?: IntFilter | null
  readonly requestedAt?: DateTimeFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly responseCode?: IntNullableFilter | null
  readonly latencyMs?: IntNullableFilter | null
  readonly responseHash?: StringFilter | null
  readonly errorClass?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type IntegrationDeliveryAttemptOrderByInput = {
  readonly id?: OrderDirection | null
  readonly attempt?: OrderDirection | null
  readonly requestedAt?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly responseCode?: OrderDirection | null
  readonly latencyMs?: OrderDirection | null
  readonly responseHash?: OrderDirection | null
  readonly errorClass?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type IntegrationDeliveryAttemptUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly delivery?: WebhookDeliveryRelateToOneForUpdateInput | null
  readonly attempt?: number | null
  readonly requestedAt?: any | null
  readonly completedAt?: any | null
  readonly responseCode?: number | null
  readonly latencyMs?: number | null
  readonly responseHash?: string | null
  readonly errorClass?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookDeliveryRelateToOneForUpdateInput = {
  readonly create?: WebhookDeliveryCreateInput | null
  readonly connect?: WebhookDeliveryWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type IntegrationDeliveryAttemptUpdateArgs = {
  readonly where: IntegrationDeliveryAttemptWhereUniqueInput
  readonly data: IntegrationDeliveryAttemptUpdateInput
}

export type IntegrationDeliveryAttemptCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly delivery?: WebhookDeliveryRelateToOneForCreateInput | null
  readonly attempt?: number | null
  readonly requestedAt?: any | null
  readonly completedAt?: any | null
  readonly responseCode?: number | null
  readonly latencyMs?: number | null
  readonly responseHash?: string | null
  readonly errorClass?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookDeliveryRelateToOneForCreateInput = {
  readonly create?: WebhookDeliveryCreateInput | null
  readonly connect?: WebhookDeliveryWhereUniqueInput | null
}

export type IntegrityCaseTypeType =
  | 'SUSPICIOUS_BETTING'
  | 'COLLUSION'
  | 'INSIDER'
  | 'RESULT_DISAGREEMENT'
  | 'PROHIBITED_PARTICIPANT'

export type IntegrityCaseStatusType =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'REPORTED'
  | 'CLEARED'
  | 'CLOSED'

export type IntegrityCaseSeverityType =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type IntegrityCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type IntegrityCaseWhereInput = {
  readonly AND?: ReadonlyArray<IntegrityCaseWhereInput> | IntegrityCaseWhereInput | null
  readonly OR?: ReadonlyArray<IntegrityCaseWhereInput> | IntegrityCaseWhereInput | null
  readonly NOT?: ReadonlyArray<IntegrityCaseWhereInput> | IntegrityCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly event?: EventWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly type?: IntegrityCaseTypeTypeNullableFilter | null
  readonly status?: IntegrityCaseStatusTypeNullableFilter | null
  readonly severity?: IntegrityCaseSeverityTypeNullableFilter | null
  readonly ownerId?: StringFilter | null
  readonly reportedAt?: DateTimeNullableFilter | null
  readonly closedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type IntegrityCaseTypeTypeNullableFilter = {
  readonly equals?: IntegrityCaseTypeType | null
  readonly in?: ReadonlyArray<IntegrityCaseTypeType> | IntegrityCaseTypeType | null
  readonly notIn?: ReadonlyArray<IntegrityCaseTypeType> | IntegrityCaseTypeType | null
  readonly not?: IntegrityCaseTypeTypeNullableFilter | null
}

export type IntegrityCaseStatusTypeNullableFilter = {
  readonly equals?: IntegrityCaseStatusType | null
  readonly in?: ReadonlyArray<IntegrityCaseStatusType> | IntegrityCaseStatusType | null
  readonly notIn?: ReadonlyArray<IntegrityCaseStatusType> | IntegrityCaseStatusType | null
  readonly not?: IntegrityCaseStatusTypeNullableFilter | null
}

export type IntegrityCaseSeverityTypeNullableFilter = {
  readonly equals?: IntegrityCaseSeverityType | null
  readonly in?: ReadonlyArray<IntegrityCaseSeverityType> | IntegrityCaseSeverityType | null
  readonly notIn?: ReadonlyArray<IntegrityCaseSeverityType> | IntegrityCaseSeverityType | null
  readonly not?: IntegrityCaseSeverityTypeNullableFilter | null
}

export type IntegrityCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly severity?: OrderDirection | null
  readonly ownerId?: OrderDirection | null
  readonly reportedAt?: OrderDirection | null
  readonly closedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type IntegrityCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly event?: EventRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly type?: IntegrityCaseTypeType | null
  readonly status?: IntegrityCaseStatusType | null
  readonly severity?: IntegrityCaseSeverityType | null
  readonly restrictedEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly ownerId?: string | null
  readonly reportedAt?: any | null
  readonly closedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type IntegrityCaseUpdateArgs = {
  readonly where: IntegrityCaseWhereUniqueInput
  readonly data: IntegrityCaseUpdateInput
}

export type IntegrityCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly event?: EventRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly type?: IntegrityCaseTypeType | null
  readonly status?: IntegrityCaseStatusType | null
  readonly severity?: IntegrityCaseSeverityType | null
  readonly restrictedEvidence?: import('@keystone-6/core/types').JSONValue | null
  readonly ownerId?: string | null
  readonly reportedAt?: any | null
  readonly closedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionPolicyVersionStatusType =
  | 'DRAFT'
  | 'APPROVED'
  | 'ACTIVE'
  | 'RETIRED'

export type JurisdictionPolicyVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type JurisdictionPolicyVersionWhereInput = {
  readonly AND?: ReadonlyArray<JurisdictionPolicyVersionWhereInput> | JurisdictionPolicyVersionWhereInput | null
  readonly OR?: ReadonlyArray<JurisdictionPolicyVersionWhereInput> | JurisdictionPolicyVersionWhereInput | null
  readonly NOT?: ReadonlyArray<JurisdictionPolicyVersionWhereInput> | JurisdictionPolicyVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly version?: IntFilter | null
  readonly authorityCitation?: StringFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: JurisdictionPolicyVersionStatusTypeNullableFilter | null
  readonly approvedBy?: StringFilter | null
  readonly approvedAt?: DateTimeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type JurisdictionPolicyVersionStatusTypeNullableFilter = {
  readonly equals?: JurisdictionPolicyVersionStatusType | null
  readonly in?: ReadonlyArray<JurisdictionPolicyVersionStatusType> | JurisdictionPolicyVersionStatusType | null
  readonly notIn?: ReadonlyArray<JurisdictionPolicyVersionStatusType> | JurisdictionPolicyVersionStatusType | null
  readonly not?: JurisdictionPolicyVersionStatusTypeNullableFilter | null
}

export type JurisdictionPolicyVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly authorityCitation?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly approvedBy?: OrderDirection | null
  readonly approvedAt?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type JurisdictionPolicyVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly authorityCitation?: string | null
  readonly policyDocument?: import('@keystone-6/core/types').JSONValue | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: JurisdictionPolicyVersionStatusType | null
  readonly approvedBy?: string | null
  readonly approvedAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type JurisdictionPolicyVersionUpdateArgs = {
  readonly where: JurisdictionPolicyVersionWhereUniqueInput
  readonly data: JurisdictionPolicyVersionUpdateInput
}

export type JurisdictionPolicyVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly authorityCitation?: string | null
  readonly policyDocument?: import('@keystone-6/core/types').JSONValue | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: JurisdictionPolicyVersionStatusType | null
  readonly approvedBy?: string | null
  readonly approvedAt?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LedgerAdjustmentRequestDirectionType =
  | 'DEBIT'
  | 'CREDIT'

export type LedgerAdjustmentRequestStatusType =
  | 'PENDING'
  | 'APPROVED'
  | 'POSTED'
  | 'REJECTED'

export type LedgerAdjustmentRequestWhereUniqueInput = {
  readonly id?: string | null
}

export type LedgerAdjustmentRequestWhereInput = {
  readonly AND?: ReadonlyArray<LedgerAdjustmentRequestWhereInput> | LedgerAdjustmentRequestWhereInput | null
  readonly OR?: ReadonlyArray<LedgerAdjustmentRequestWhereInput> | LedgerAdjustmentRequestWhereInput | null
  readonly NOT?: ReadonlyArray<LedgerAdjustmentRequestWhereInput> | LedgerAdjustmentRequestWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly account?: LedgerAccountWhereInput | null
  readonly amountMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly direction?: LedgerAdjustmentRequestDirectionTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly status?: LedgerAdjustmentRequestStatusTypeNullableFilter | null
  readonly requesterId?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly journalTransaction?: JournalTransactionWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LedgerAdjustmentRequestDirectionTypeNullableFilter = {
  readonly equals?: LedgerAdjustmentRequestDirectionType | null
  readonly in?: ReadonlyArray<LedgerAdjustmentRequestDirectionType> | LedgerAdjustmentRequestDirectionType | null
  readonly notIn?: ReadonlyArray<LedgerAdjustmentRequestDirectionType> | LedgerAdjustmentRequestDirectionType | null
  readonly not?: LedgerAdjustmentRequestDirectionTypeNullableFilter | null
}

export type LedgerAdjustmentRequestStatusTypeNullableFilter = {
  readonly equals?: LedgerAdjustmentRequestStatusType | null
  readonly in?: ReadonlyArray<LedgerAdjustmentRequestStatusType> | LedgerAdjustmentRequestStatusType | null
  readonly notIn?: ReadonlyArray<LedgerAdjustmentRequestStatusType> | LedgerAdjustmentRequestStatusType | null
  readonly not?: LedgerAdjustmentRequestStatusTypeNullableFilter | null
}

export type LedgerAdjustmentRequestOrderByInput = {
  readonly id?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly direction?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly requesterId?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LedgerAdjustmentRequestUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly account?: LedgerAccountRelateToOneForUpdateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly direction?: LedgerAdjustmentRequestDirectionType | null
  readonly reasonCode?: string | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: LedgerAdjustmentRequestStatusType | null
  readonly requesterId?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly journalTransaction?: JournalTransactionRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LedgerAdjustmentRequestUpdateArgs = {
  readonly where: LedgerAdjustmentRequestWhereUniqueInput
  readonly data: LedgerAdjustmentRequestUpdateInput
}

export type LedgerAdjustmentRequestCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly account?: LedgerAccountRelateToOneForCreateInput | null
  readonly amountMinor?: string | null
  readonly currency?: string | null
  readonly direction?: LedgerAdjustmentRequestDirectionType | null
  readonly reasonCode?: string | null
  readonly evidence?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: LedgerAdjustmentRequestStatusType | null
  readonly requesterId?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly journalTransaction?: JournalTransactionRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegalEntityStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'

export type LegalEntityWhereUniqueInput = {
  readonly id?: string | null
}

export type LegalEntityWhereInput = {
  readonly AND?: ReadonlyArray<LegalEntityWhereInput> | LegalEntityWhereInput | null
  readonly OR?: ReadonlyArray<LegalEntityWhereInput> | LegalEntityWhereInput | null
  readonly NOT?: ReadonlyArray<LegalEntityWhereInput> | LegalEntityWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly countryCode?: StringFilter | null
  readonly registrationReference?: StringFilter | null
  readonly status?: LegalEntityStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type LegalEntityStatusTypeNullableFilter = {
  readonly equals?: LegalEntityStatusType | null
  readonly in?: ReadonlyArray<LegalEntityStatusType> | LegalEntityStatusType | null
  readonly notIn?: ReadonlyArray<LegalEntityStatusType> | LegalEntityStatusType | null
  readonly not?: LegalEntityStatusTypeNullableFilter | null
}

export type LegalEntityOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly countryCode?: OrderDirection | null
  readonly registrationReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type LegalEntityUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly countryCode?: string | null
  readonly registrationReference?: string | null
  readonly status?: LegalEntityStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type LegalEntityUpdateArgs = {
  readonly where: LegalEntityWhereUniqueInput
  readonly data: LegalEntityUpdateInput
}

export type LegalEntityCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly countryCode?: string | null
  readonly registrationReference?: string | null
  readonly status?: LegalEntityStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type MarketDefinitionStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type MarketDefinitionWhereUniqueInput = {
  readonly id?: string | null
}

export type MarketDefinitionWhereInput = {
  readonly AND?: ReadonlyArray<MarketDefinitionWhereInput> | MarketDefinitionWhereInput | null
  readonly OR?: ReadonlyArray<MarketDefinitionWhereInput> | MarketDefinitionWhereInput | null
  readonly NOT?: ReadonlyArray<MarketDefinitionWhereInput> | MarketDefinitionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly sportKey?: StringFilter | null
  readonly gradingRuleFamily?: StringFilter | null
  readonly status?: MarketDefinitionStatusTypeNullableFilter | null
  readonly version?: IntFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type MarketDefinitionStatusTypeNullableFilter = {
  readonly equals?: MarketDefinitionStatusType | null
  readonly in?: ReadonlyArray<MarketDefinitionStatusType> | MarketDefinitionStatusType | null
  readonly notIn?: ReadonlyArray<MarketDefinitionStatusType> | MarketDefinitionStatusType | null
  readonly not?: MarketDefinitionStatusTypeNullableFilter | null
}

export type MarketDefinitionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly sportKey?: OrderDirection | null
  readonly gradingRuleFamily?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type MarketDefinitionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sportKey?: string | null
  readonly parametersSchema?: import('@keystone-6/core/types').JSONValue | null
  readonly gradingRuleFamily?: string | null
  readonly allowedPhases?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: MarketDefinitionStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type MarketDefinitionUpdateArgs = {
  readonly where: MarketDefinitionWhereUniqueInput
  readonly data: MarketDefinitionUpdateInput
}

export type MarketDefinitionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly sportKey?: string | null
  readonly parametersSchema?: import('@keystone-6/core/types').JSONValue | null
  readonly gradingRuleFamily?: string | null
  readonly allowedPhases?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: MarketDefinitionStatusType | null
  readonly version?: number | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type NotificationChannelType =
  | 'EMAIL'
  | 'SMS'
  | 'PUSH'
  | 'IN_APP'
  | 'WEBHOOK'

export type NotificationStatusType =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'SUPPRESSED'

export type NotificationWhereUniqueInput = {
  readonly id?: string | null
}

export type NotificationWhereInput = {
  readonly AND?: ReadonlyArray<NotificationWhereInput> | NotificationWhereInput | null
  readonly OR?: ReadonlyArray<NotificationWhereInput> | NotificationWhereInput | null
  readonly NOT?: ReadonlyArray<NotificationWhereInput> | NotificationWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly user?: UserWhereInput | null
  readonly channel?: NotificationChannelTypeNullableFilter | null
  readonly templateKey?: StringFilter | null
  readonly templateVersion?: StringFilter | null
  readonly locale?: StringFilter | null
  readonly status?: NotificationStatusTypeNullableFilter | null
  readonly consentEvidenceHash?: StringFilter | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly externalReference?: StringFilter | null
  readonly sentAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type NotificationChannelTypeNullableFilter = {
  readonly equals?: NotificationChannelType | null
  readonly in?: ReadonlyArray<NotificationChannelType> | NotificationChannelType | null
  readonly notIn?: ReadonlyArray<NotificationChannelType> | NotificationChannelType | null
  readonly not?: NotificationChannelTypeNullableFilter | null
}

export type NotificationStatusTypeNullableFilter = {
  readonly equals?: NotificationStatusType | null
  readonly in?: ReadonlyArray<NotificationStatusType> | NotificationStatusType | null
  readonly notIn?: ReadonlyArray<NotificationStatusType> | NotificationStatusType | null
  readonly not?: NotificationStatusTypeNullableFilter | null
}

export type NotificationOrderByInput = {
  readonly id?: OrderDirection | null
  readonly channel?: OrderDirection | null
  readonly templateKey?: OrderDirection | null
  readonly templateVersion?: OrderDirection | null
  readonly locale?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly consentEvidenceHash?: OrderDirection | null
  readonly externalReference?: OrderDirection | null
  readonly sentAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type NotificationUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly user?: UserRelateToOneForUpdateInput | null
  readonly channel?: NotificationChannelType | null
  readonly templateKey?: string | null
  readonly templateVersion?: string | null
  readonly locale?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: NotificationStatusType | null
  readonly consentEvidenceHash?: string | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly externalReference?: string | null
  readonly sentAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type NotificationUpdateArgs = {
  readonly where: NotificationWhereUniqueInput
  readonly data: NotificationUpdateInput
}

export type NotificationCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly user?: UserRelateToOneForCreateInput | null
  readonly channel?: NotificationChannelType | null
  readonly templateKey?: string | null
  readonly templateVersion?: string | null
  readonly locale?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: NotificationStatusType | null
  readonly consentEvidenceHash?: string | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly externalReference?: string | null
  readonly sentAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OperatorChannelTypeType =
  | 'WEB'
  | 'MOBILE_WEB'
  | 'NATIVE'
  | 'RETAIL'
  | 'PAM'

export type OperatorChannelStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'

export type OperatorChannelWhereUniqueInput = {
  readonly id?: string | null
}

export type OperatorChannelWhereInput = {
  readonly AND?: ReadonlyArray<OperatorChannelWhereInput> | OperatorChannelWhereInput | null
  readonly OR?: ReadonlyArray<OperatorChannelWhereInput> | OperatorChannelWhereInput | null
  readonly NOT?: ReadonlyArray<OperatorChannelWhereInput> | OperatorChannelWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly legalEntity?: LegalEntityWhereInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionWhereInput | null
  readonly brand?: BrandWhereInput | null
  readonly key?: StringFilter | null
  readonly type?: OperatorChannelTypeTypeNullableFilter | null
  readonly status?: OperatorChannelStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type OperatorChannelTypeTypeNullableFilter = {
  readonly equals?: OperatorChannelTypeType | null
  readonly in?: ReadonlyArray<OperatorChannelTypeType> | OperatorChannelTypeType | null
  readonly notIn?: ReadonlyArray<OperatorChannelTypeType> | OperatorChannelTypeType | null
  readonly not?: OperatorChannelTypeTypeNullableFilter | null
}

export type OperatorChannelStatusTypeNullableFilter = {
  readonly equals?: OperatorChannelStatusType | null
  readonly in?: ReadonlyArray<OperatorChannelStatusType> | OperatorChannelStatusType | null
  readonly notIn?: ReadonlyArray<OperatorChannelStatusType> | OperatorChannelStatusType | null
  readonly not?: OperatorChannelStatusTypeNullableFilter | null
}

export type OperatorChannelOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type OperatorChannelUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForUpdateInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionRelateToOneForUpdateInput | null
  readonly brand?: BrandRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly type?: OperatorChannelTypeType | null
  readonly status?: OperatorChannelStatusType | null
  readonly capabilities?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type OperatorChannelUpdateArgs = {
  readonly where: OperatorChannelWhereUniqueInput
  readonly data: OperatorChannelUpdateInput
}

export type OperatorChannelCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForCreateInput | null
  readonly operatorJurisdiction?: OperatorJurisdictionRelateToOneForCreateInput | null
  readonly brand?: BrandRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly type?: OperatorChannelTypeType | null
  readonly status?: OperatorChannelStatusType | null
  readonly capabilities?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PamSubjectMappingWalletModeType =
  | 'OPENFRONT'
  | 'PAM'
  | 'TRANSFER'

export type PamSubjectMappingStatusType =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'

export type PamSubjectMappingWhereUniqueInput = {
  readonly id?: string | null
}

export type PamSubjectMappingWhereInput = {
  readonly AND?: ReadonlyArray<PamSubjectMappingWhereInput> | PamSubjectMappingWhereInput | null
  readonly OR?: ReadonlyArray<PamSubjectMappingWhereInput> | PamSubjectMappingWhereInput | null
  readonly NOT?: ReadonlyArray<PamSubjectMappingWhereInput> | PamSubjectMappingWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly externalSubjectDigest?: StringFilter | null
  readonly player?: PlayerWhereInput | null
  readonly walletMode?: PamSubjectMappingWalletModeTypeNullableFilter | null
  readonly status?: PamSubjectMappingStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PamSubjectMappingWalletModeTypeNullableFilter = {
  readonly equals?: PamSubjectMappingWalletModeType | null
  readonly in?: ReadonlyArray<PamSubjectMappingWalletModeType> | PamSubjectMappingWalletModeType | null
  readonly notIn?: ReadonlyArray<PamSubjectMappingWalletModeType> | PamSubjectMappingWalletModeType | null
  readonly not?: PamSubjectMappingWalletModeTypeNullableFilter | null
}

export type PamSubjectMappingStatusTypeNullableFilter = {
  readonly equals?: PamSubjectMappingStatusType | null
  readonly in?: ReadonlyArray<PamSubjectMappingStatusType> | PamSubjectMappingStatusType | null
  readonly notIn?: ReadonlyArray<PamSubjectMappingStatusType> | PamSubjectMappingStatusType | null
  readonly not?: PamSubjectMappingStatusTypeNullableFilter | null
}

export type PamSubjectMappingOrderByInput = {
  readonly id?: OrderDirection | null
  readonly externalSubjectDigest?: OrderDirection | null
  readonly walletMode?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PamSubjectMappingUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly externalSubjectDigest?: string | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly walletMode?: PamSubjectMappingWalletModeType | null
  readonly status?: PamSubjectMappingStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PamSubjectMappingUpdateArgs = {
  readonly where: PamSubjectMappingWhereUniqueInput
  readonly data: PamSubjectMappingUpdateInput
}

export type PamSubjectMappingCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly externalSubjectDigest?: string | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly walletMode?: PamSubjectMappingWalletModeType | null
  readonly status?: PamSubjectMappingStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerStatementStatusType =
  | 'GENERATING'
  | 'READY'
  | 'FAILED'

export type PlayerStatementWhereUniqueInput = {
  readonly id?: string | null
}

export type PlayerStatementWhereInput = {
  readonly AND?: ReadonlyArray<PlayerStatementWhereInput> | PlayerStatementWhereInput | null
  readonly OR?: ReadonlyArray<PlayerStatementWhereInput> | PlayerStatementWhereInput | null
  readonly NOT?: ReadonlyArray<PlayerStatementWhereInput> | PlayerStatementWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly periodStart?: DateTimeFilter | null
  readonly periodEnd?: DateTimeFilter | null
  readonly openingMinor?: StringFilter | null
  readonly closingMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly journalHash?: StringFilter | null
  readonly artifactReference?: StringFilter | null
  readonly status?: PlayerStatementStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PlayerStatementStatusTypeNullableFilter = {
  readonly equals?: PlayerStatementStatusType | null
  readonly in?: ReadonlyArray<PlayerStatementStatusType> | PlayerStatementStatusType | null
  readonly notIn?: ReadonlyArray<PlayerStatementStatusType> | PlayerStatementStatusType | null
  readonly not?: PlayerStatementStatusTypeNullableFilter | null
}

export type PlayerStatementOrderByInput = {
  readonly id?: OrderDirection | null
  readonly periodStart?: OrderDirection | null
  readonly periodEnd?: OrderDirection | null
  readonly openingMinor?: OrderDirection | null
  readonly closingMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly journalHash?: OrderDirection | null
  readonly artifactReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PlayerStatementUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly periodStart?: any | null
  readonly periodEnd?: any | null
  readonly openingMinor?: string | null
  readonly closingMinor?: string | null
  readonly currency?: string | null
  readonly journalHash?: string | null
  readonly artifactReference?: string | null
  readonly status?: PlayerStatementStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PlayerStatementUpdateArgs = {
  readonly where: PlayerStatementWhereUniqueInput
  readonly data: PlayerStatementUpdateInput
}

export type PlayerStatementCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly periodStart?: any | null
  readonly periodEnd?: any | null
  readonly openingMinor?: string | null
  readonly closingMinor?: string | null
  readonly currency?: string | null
  readonly journalHash?: string | null
  readonly artifactReference?: string | null
  readonly status?: PlayerStatementStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionTypeType =
  | 'FREE_BET'
  | 'ODDS_BOOST'
  | 'DEPOSIT_MATCH'
  | 'CASHBACK'

export type PromotionStatusType =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ENDED'

export type PromotionWhereUniqueInput = {
  readonly id?: string | null
}

export type PromotionWhereInput = {
  readonly AND?: ReadonlyArray<PromotionWhereInput> | PromotionWhereInput | null
  readonly OR?: ReadonlyArray<PromotionWhereInput> | PromotionWhereInput | null
  readonly NOT?: ReadonlyArray<PromotionWhereInput> | PromotionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly description?: StringFilter | null
  readonly type?: PromotionTypeTypeNullableFilter | null
  readonly status?: PromotionStatusTypeNullableFilter | null
  readonly startsAt?: DateTimeFilter | null
  readonly endsAt?: DateTimeFilter | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly brand?: BrandWhereInput | null
  readonly budgetMinor?: StringFilter | null
  readonly currency?: StringFilter | null
  readonly termsVersion?: StringFilter | null
  readonly termsHash?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PromotionTypeTypeNullableFilter = {
  readonly equals?: PromotionTypeType | null
  readonly in?: ReadonlyArray<PromotionTypeType> | PromotionTypeType | null
  readonly notIn?: ReadonlyArray<PromotionTypeType> | PromotionTypeType | null
  readonly not?: PromotionTypeTypeNullableFilter | null
}

export type PromotionStatusTypeNullableFilter = {
  readonly equals?: PromotionStatusType | null
  readonly in?: ReadonlyArray<PromotionStatusType> | PromotionStatusType | null
  readonly notIn?: ReadonlyArray<PromotionStatusType> | PromotionStatusType | null
  readonly not?: PromotionStatusTypeNullableFilter | null
}

export type PromotionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly description?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly endsAt?: OrderDirection | null
  readonly budgetMinor?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly termsVersion?: OrderDirection | null
  readonly termsHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PromotionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly description?: string | null
  readonly type?: PromotionTypeType | null
  readonly status?: PromotionStatusType | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly brand?: BrandRelateToOneForUpdateInput | null
  readonly budgetMinor?: string | null
  readonly currency?: string | null
  readonly termsVersion?: string | null
  readonly termsHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionUpdateArgs = {
  readonly where: PromotionWhereUniqueInput
  readonly data: PromotionUpdateInput
}

export type PromotionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly description?: string | null
  readonly type?: PromotionTypeType | null
  readonly status?: PromotionStatusType | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly brand?: BrandRelateToOneForCreateInput | null
  readonly budgetMinor?: string | null
  readonly currency?: string | null
  readonly termsVersion?: string | null
  readonly termsHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRedemptionStatusType =
  | 'ELIGIBLE'
  | 'CLAIMED'
  | 'REJECTED'
  | 'REVERSED'

export type PromotionRedemptionWhereUniqueInput = {
  readonly id?: string | null
}

export type PromotionRedemptionWhereInput = {
  readonly AND?: ReadonlyArray<PromotionRedemptionWhereInput> | PromotionRedemptionWhereInput | null
  readonly OR?: ReadonlyArray<PromotionRedemptionWhereInput> | PromotionRedemptionWhereInput | null
  readonly NOT?: ReadonlyArray<PromotionRedemptionWhereInput> | PromotionRedemptionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly promotion?: PromotionWhereInput | null
  readonly ruleVersion?: PromotionRuleVersionWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly bonusAward?: BonusAwardWhereInput | null
  readonly status?: PromotionRedemptionStatusTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly redeemedAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PromotionRedemptionStatusTypeNullableFilter = {
  readonly equals?: PromotionRedemptionStatusType | null
  readonly in?: ReadonlyArray<PromotionRedemptionStatusType> | PromotionRedemptionStatusType | null
  readonly notIn?: ReadonlyArray<PromotionRedemptionStatusType> | PromotionRedemptionStatusType | null
  readonly not?: PromotionRedemptionStatusTypeNullableFilter | null
}

export type PromotionRedemptionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly redeemedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PromotionRedemptionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly ruleVersion?: PromotionRuleVersionRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly bonusAward?: BonusAwardRelateToOneForUpdateInput | null
  readonly status?: PromotionRedemptionStatusType | null
  readonly reasonCode?: string | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly redeemedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRedemptionUpdateArgs = {
  readonly where: PromotionRedemptionWhereUniqueInput
  readonly data: PromotionRedemptionUpdateInput
}

export type PromotionRedemptionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly ruleVersion?: PromotionRuleVersionRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly bonusAward?: BonusAwardRelateToOneForCreateInput | null
  readonly status?: PromotionRedemptionStatusType | null
  readonly reasonCode?: string | null
  readonly idempotencyKey?: string | null
  readonly evidenceHash?: string | null
  readonly redeemedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRuleVersionStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type PromotionRuleVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type PromotionRuleVersionWhereInput = {
  readonly AND?: ReadonlyArray<PromotionRuleVersionWhereInput> | PromotionRuleVersionWhereInput | null
  readonly OR?: ReadonlyArray<PromotionRuleVersionWhereInput> | PromotionRuleVersionWhereInput | null
  readonly NOT?: ReadonlyArray<PromotionRuleVersionWhereInput> | PromotionRuleVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly promotion?: PromotionWhereInput | null
  readonly version?: IntFilter | null
  readonly status?: PromotionRuleVersionStatusTypeNullableFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type PromotionRuleVersionStatusTypeNullableFilter = {
  readonly equals?: PromotionRuleVersionStatusType | null
  readonly in?: ReadonlyArray<PromotionRuleVersionStatusType> | PromotionRuleVersionStatusType | null
  readonly notIn?: ReadonlyArray<PromotionRuleVersionStatusType> | PromotionRuleVersionStatusType | null
  readonly not?: PromotionRuleVersionStatusTypeNullableFilter | null
}

export type PromotionRuleVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type PromotionRuleVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly promotion?: PromotionRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly eligibility?: import('@keystone-6/core/types').JSONValue | null
  readonly economics?: import('@keystone-6/core/types').JSONValue | null
  readonly wageringRequirements?: import('@keystone-6/core/types').JSONValue | null
  readonly abuseControls?: import('@keystone-6/core/types').JSONValue | null
  readonly contributionRules?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: PromotionRuleVersionStatusType | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type PromotionRuleVersionUpdateArgs = {
  readonly where: PromotionRuleVersionWhereUniqueInput
  readonly data: PromotionRuleVersionUpdateInput
}

export type PromotionRuleVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly promotion?: PromotionRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly eligibility?: import('@keystone-6/core/types').JSONValue | null
  readonly economics?: import('@keystone-6/core/types').JSONValue | null
  readonly wageringRequirements?: import('@keystone-6/core/types').JSONValue | null
  readonly abuseControls?: import('@keystone-6/core/types').JSONValue | null
  readonly contributionRules?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: PromotionRuleVersionStatusType | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ProviderHealthSampleStatusType =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DOWN'

export type ProviderHealthSampleWhereUniqueInput = {
  readonly id?: string | null
}

export type ProviderHealthSampleWhereInput = {
  readonly AND?: ReadonlyArray<ProviderHealthSampleWhereInput> | ProviderHealthSampleWhereInput | null
  readonly OR?: ReadonlyArray<ProviderHealthSampleWhereInput> | ProviderHealthSampleWhereInput | null
  readonly NOT?: ReadonlyArray<ProviderHealthSampleWhereInput> | ProviderHealthSampleWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly capability?: StringFilter | null
  readonly status?: ProviderHealthSampleStatusTypeNullableFilter | null
  readonly latencyMs?: IntNullableFilter | null
  readonly errorRateBasisPoints?: IntNullableFilter | null
  readonly sequenceLag?: IntNullableFilter | null
  readonly oldestWebhookAgeMs?: IntNullableFilter | null
  readonly reconciliationDifferenceMinor?: StringFilter | null
  readonly checkedAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ProviderHealthSampleStatusTypeNullableFilter = {
  readonly equals?: ProviderHealthSampleStatusType | null
  readonly in?: ReadonlyArray<ProviderHealthSampleStatusType> | ProviderHealthSampleStatusType | null
  readonly notIn?: ReadonlyArray<ProviderHealthSampleStatusType> | ProviderHealthSampleStatusType | null
  readonly not?: ProviderHealthSampleStatusTypeNullableFilter | null
}

export type ProviderHealthSampleOrderByInput = {
  readonly id?: OrderDirection | null
  readonly capability?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly latencyMs?: OrderDirection | null
  readonly errorRateBasisPoints?: OrderDirection | null
  readonly sequenceLag?: OrderDirection | null
  readonly oldestWebhookAgeMs?: OrderDirection | null
  readonly reconciliationDifferenceMinor?: OrderDirection | null
  readonly checkedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ProviderHealthSampleUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly capability?: string | null
  readonly status?: ProviderHealthSampleStatusType | null
  readonly latencyMs?: number | null
  readonly errorRateBasisPoints?: number | null
  readonly sequenceLag?: number | null
  readonly oldestWebhookAgeMs?: number | null
  readonly reconciliationDifferenceMinor?: string | null
  readonly checkedAt?: any | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ProviderHealthSampleUpdateArgs = {
  readonly where: ProviderHealthSampleWhereUniqueInput
  readonly data: ProviderHealthSampleUpdateInput
}

export type ProviderHealthSampleCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly capability?: string | null
  readonly status?: ProviderHealthSampleStatusType | null
  readonly latencyMs?: number | null
  readonly errorRateBasisPoints?: number | null
  readonly sequenceLag?: number | null
  readonly oldestWebhookAgeMs?: number | null
  readonly reconciliationDifferenceMinor?: string | null
  readonly checkedAt?: any | null
  readonly details?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RegionStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type RegionWhereUniqueInput = {
  readonly id?: string | null
}

export type RegionWhereInput = {
  readonly AND?: ReadonlyArray<RegionWhereInput> | RegionWhereInput | null
  readonly OR?: ReadonlyArray<RegionWhereInput> | RegionWhereInput | null
  readonly NOT?: ReadonlyArray<RegionWhereInput> | RegionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly status?: RegionStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type RegionStatusTypeNullableFilter = {
  readonly equals?: RegionStatusType | null
  readonly in?: ReadonlyArray<RegionStatusType> | RegionStatusType | null
  readonly notIn?: ReadonlyArray<RegionStatusType> | RegionStatusType | null
  readonly not?: RegionStatusTypeNullableFilter | null
}

export type RegionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RegionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly countryCodes?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: RegionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RegionUpdateArgs = {
  readonly where: RegionWhereUniqueInput
  readonly data: RegionUpdateInput
}

export type RegionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly countryCodes?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: RegionStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ReportArtifactFormatType =
  | 'JSON'
  | 'CSV'
  | 'PDF'
  | 'XML'

export type ReportArtifactStatusType =
  | 'READY'
  | 'EXPIRED'
  | 'REVOKED'

export type ReportArtifactWhereUniqueInput = {
  readonly id?: string | null
}

export type ReportArtifactWhereInput = {
  readonly AND?: ReadonlyArray<ReportArtifactWhereInput> | ReportArtifactWhereInput | null
  readonly OR?: ReadonlyArray<ReportArtifactWhereInput> | ReportArtifactWhereInput | null
  readonly NOT?: ReadonlyArray<ReportArtifactWhereInput> | ReportArtifactWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly report?: ComplianceReportWhereInput | null
  readonly type?: StringFilter | null
  readonly format?: ReportArtifactFormatTypeNullableFilter | null
  readonly schemaVersion?: StringFilter | null
  readonly rowCount?: IntNullableFilter | null
  readonly contentHash?: StringFilter | null
  readonly storageReference?: StringFilter | null
  readonly encryptionKeyReference?: StringFilter | null
  readonly generatedAt?: DateTimeFilter | null
  readonly expiresAt?: DateTimeNullableFilter | null
  readonly status?: ReportArtifactStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ReportArtifactFormatTypeNullableFilter = {
  readonly equals?: ReportArtifactFormatType | null
  readonly in?: ReadonlyArray<ReportArtifactFormatType> | ReportArtifactFormatType | null
  readonly notIn?: ReadonlyArray<ReportArtifactFormatType> | ReportArtifactFormatType | null
  readonly not?: ReportArtifactFormatTypeNullableFilter | null
}

export type ReportArtifactStatusTypeNullableFilter = {
  readonly equals?: ReportArtifactStatusType | null
  readonly in?: ReadonlyArray<ReportArtifactStatusType> | ReportArtifactStatusType | null
  readonly notIn?: ReadonlyArray<ReportArtifactStatusType> | ReportArtifactStatusType | null
  readonly not?: ReportArtifactStatusTypeNullableFilter | null
}

export type ReportArtifactOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly format?: OrderDirection | null
  readonly schemaVersion?: OrderDirection | null
  readonly rowCount?: OrderDirection | null
  readonly contentHash?: OrderDirection | null
  readonly storageReference?: OrderDirection | null
  readonly encryptionKeyReference?: OrderDirection | null
  readonly generatedAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ReportArtifactUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly report?: ComplianceReportRelateToOneForUpdateInput | null
  readonly type?: string | null
  readonly format?: ReportArtifactFormatType | null
  readonly schemaVersion?: string | null
  readonly rowCount?: number | null
  readonly contentHash?: string | null
  readonly storageReference?: string | null
  readonly encryptionKeyReference?: string | null
  readonly generatedAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: ReportArtifactStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ComplianceReportRelateToOneForUpdateInput = {
  readonly create?: ComplianceReportCreateInput | null
  readonly connect?: ComplianceReportWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type ReportArtifactUpdateArgs = {
  readonly where: ReportArtifactWhereUniqueInput
  readonly data: ReportArtifactUpdateInput
}

export type ReportArtifactCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly report?: ComplianceReportRelateToOneForCreateInput | null
  readonly type?: string | null
  readonly format?: ReportArtifactFormatType | null
  readonly schemaVersion?: string | null
  readonly rowCount?: number | null
  readonly contentHash?: string | null
  readonly storageReference?: string | null
  readonly encryptionKeyReference?: string | null
  readonly generatedAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: ReportArtifactStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ComplianceReportRelateToOneForCreateInput = {
  readonly create?: ComplianceReportCreateInput | null
  readonly connect?: ComplianceReportWhereUniqueInput | null
}

export type RetentionExecutionStatusType =
  | 'DRY_RUN'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'COMPLETED'
  | 'FAILED'

export type RetentionExecutionWhereUniqueInput = {
  readonly id?: string | null
}

export type RetentionExecutionWhereInput = {
  readonly AND?: ReadonlyArray<RetentionExecutionWhereInput> | RetentionExecutionWhereInput | null
  readonly OR?: ReadonlyArray<RetentionExecutionWhereInput> | RetentionExecutionWhereInput | null
  readonly NOT?: ReadonlyArray<RetentionExecutionWhereInput> | RetentionExecutionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly policyVersion?: RetentionPolicyVersionWhereInput | null
  readonly windowFrom?: DateTimeFilter | null
  readonly windowTo?: DateTimeFilter | null
  readonly candidateCount?: IntNullableFilter | null
  readonly heldCount?: IntNullableFilter | null
  readonly archivedCount?: IntNullableFilter | null
  readonly deletedCount?: IntNullableFilter | null
  readonly status?: RetentionExecutionStatusTypeNullableFilter | null
  readonly dryRunHash?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly artifactReference?: StringFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type RetentionExecutionStatusTypeNullableFilter = {
  readonly equals?: RetentionExecutionStatusType | null
  readonly in?: ReadonlyArray<RetentionExecutionStatusType> | RetentionExecutionStatusType | null
  readonly notIn?: ReadonlyArray<RetentionExecutionStatusType> | RetentionExecutionStatusType | null
  readonly not?: RetentionExecutionStatusTypeNullableFilter | null
}

export type RetentionExecutionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly windowFrom?: OrderDirection | null
  readonly windowTo?: OrderDirection | null
  readonly candidateCount?: OrderDirection | null
  readonly heldCount?: OrderDirection | null
  readonly archivedCount?: OrderDirection | null
  readonly deletedCount?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly dryRunHash?: OrderDirection | null
  readonly artifactReference?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RetentionExecutionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly policyVersion?: RetentionPolicyVersionRelateToOneForUpdateInput | null
  readonly windowFrom?: any | null
  readonly windowTo?: any | null
  readonly candidateCount?: number | null
  readonly heldCount?: number | null
  readonly archivedCount?: number | null
  readonly deletedCount?: number | null
  readonly status?: RetentionExecutionStatusType | null
  readonly dryRunHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly artifactReference?: string | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RetentionPolicyVersionRelateToOneForUpdateInput = {
  readonly create?: RetentionPolicyVersionCreateInput | null
  readonly connect?: RetentionPolicyVersionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type RetentionExecutionUpdateArgs = {
  readonly where: RetentionExecutionWhereUniqueInput
  readonly data: RetentionExecutionUpdateInput
}

export type RetentionExecutionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly policyVersion?: RetentionPolicyVersionRelateToOneForCreateInput | null
  readonly windowFrom?: any | null
  readonly windowTo?: any | null
  readonly candidateCount?: number | null
  readonly heldCount?: number | null
  readonly archivedCount?: number | null
  readonly deletedCount?: number | null
  readonly status?: RetentionExecutionStatusType | null
  readonly dryRunHash?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly artifactReference?: string | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RetentionPolicyVersionRelateToOneForCreateInput = {
  readonly create?: RetentionPolicyVersionCreateInput | null
  readonly connect?: RetentionPolicyVersionWhereUniqueInput | null
}

export type RetentionPolicyVersionDeletionModeType =
  | 'DELETE'
  | 'TOKENIZE'
  | 'CRYPTO_SHRED'
  | 'PRESERVE'

export type RetentionPolicyVersionStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type RetentionPolicyVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type RetentionPolicyVersionWhereInput = {
  readonly AND?: ReadonlyArray<RetentionPolicyVersionWhereInput> | RetentionPolicyVersionWhereInput | null
  readonly OR?: ReadonlyArray<RetentionPolicyVersionWhereInput> | RetentionPolicyVersionWhereInput | null
  readonly NOT?: ReadonlyArray<RetentionPolicyVersionWhereInput> | RetentionPolicyVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly recordClass?: StringFilter | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly version?: IntFilter | null
  readonly retentionDays?: IntFilter | null
  readonly archiveDays?: IntNullableFilter | null
  readonly deletionMode?: RetentionPolicyVersionDeletionModeTypeNullableFilter | null
  readonly legalHoldWins?: BooleanFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: RetentionPolicyVersionStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type RetentionPolicyVersionDeletionModeTypeNullableFilter = {
  readonly equals?: RetentionPolicyVersionDeletionModeType | null
  readonly in?: ReadonlyArray<RetentionPolicyVersionDeletionModeType> | RetentionPolicyVersionDeletionModeType | null
  readonly notIn?: ReadonlyArray<RetentionPolicyVersionDeletionModeType> | RetentionPolicyVersionDeletionModeType | null
  readonly not?: RetentionPolicyVersionDeletionModeTypeNullableFilter | null
}

export type RetentionPolicyVersionStatusTypeNullableFilter = {
  readonly equals?: RetentionPolicyVersionStatusType | null
  readonly in?: ReadonlyArray<RetentionPolicyVersionStatusType> | RetentionPolicyVersionStatusType | null
  readonly notIn?: ReadonlyArray<RetentionPolicyVersionStatusType> | RetentionPolicyVersionStatusType | null
  readonly not?: RetentionPolicyVersionStatusTypeNullableFilter | null
}

export type RetentionPolicyVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly recordClass?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly retentionDays?: OrderDirection | null
  readonly archiveDays?: OrderDirection | null
  readonly deletionMode?: OrderDirection | null
  readonly legalHoldWins?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type RetentionPolicyVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly recordClass?: string | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly version?: number | null
  readonly retentionDays?: number | null
  readonly archiveDays?: number | null
  readonly deletionMode?: RetentionPolicyVersionDeletionModeType | null
  readonly legalHoldWins?: boolean | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: RetentionPolicyVersionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type RetentionPolicyVersionUpdateArgs = {
  readonly where: RetentionPolicyVersionWhereUniqueInput
  readonly data: RetentionPolicyVersionUpdateInput
}

export type RetentionPolicyVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly recordClass?: string | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly version?: number | null
  readonly retentionDays?: number | null
  readonly archiveDays?: number | null
  readonly deletionMode?: RetentionPolicyVersionDeletionModeType | null
  readonly legalHoldWins?: boolean | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: RetentionPolicyVersionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SafeguardingAccountClassificationType =
  | 'NOT_PROTECTED'
  | 'MEDIUM_PROTECTION'
  | 'HIGH_PROTECTION'
  | 'TRUST'

export type SafeguardingAccountStatusType =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'

export type SafeguardingAccountWhereUniqueInput = {
  readonly id?: string | null
}

export type SafeguardingAccountWhereInput = {
  readonly AND?: ReadonlyArray<SafeguardingAccountWhereInput> | SafeguardingAccountWhereInput | null
  readonly OR?: ReadonlyArray<SafeguardingAccountWhereInput> | SafeguardingAccountWhereInput | null
  readonly NOT?: ReadonlyArray<SafeguardingAccountWhereInput> | SafeguardingAccountWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly legalEntity?: LegalEntityWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly accountReference?: StringFilter | null
  readonly classification?: SafeguardingAccountClassificationTypeNullableFilter | null
  readonly currency?: StringFilter | null
  readonly status?: SafeguardingAccountStatusTypeNullableFilter | null
  readonly disclosureVersion?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SafeguardingAccountClassificationTypeNullableFilter = {
  readonly equals?: SafeguardingAccountClassificationType | null
  readonly in?: ReadonlyArray<SafeguardingAccountClassificationType> | SafeguardingAccountClassificationType | null
  readonly notIn?: ReadonlyArray<SafeguardingAccountClassificationType> | SafeguardingAccountClassificationType | null
  readonly not?: SafeguardingAccountClassificationTypeNullableFilter | null
}

export type SafeguardingAccountStatusTypeNullableFilter = {
  readonly equals?: SafeguardingAccountStatusType | null
  readonly in?: ReadonlyArray<SafeguardingAccountStatusType> | SafeguardingAccountStatusType | null
  readonly notIn?: ReadonlyArray<SafeguardingAccountStatusType> | SafeguardingAccountStatusType | null
  readonly not?: SafeguardingAccountStatusTypeNullableFilter | null
}

export type SafeguardingAccountOrderByInput = {
  readonly id?: OrderDirection | null
  readonly accountReference?: OrderDirection | null
  readonly classification?: OrderDirection | null
  readonly currency?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly disclosureVersion?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SafeguardingAccountUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly accountReference?: string | null
  readonly classification?: SafeguardingAccountClassificationType | null
  readonly currency?: string | null
  readonly status?: SafeguardingAccountStatusType | null
  readonly disclosureVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SafeguardingAccountUpdateArgs = {
  readonly where: SafeguardingAccountWhereUniqueInput
  readonly data: SafeguardingAccountUpdateInput
}

export type SafeguardingAccountCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly legalEntity?: LegalEntityRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly accountReference?: string | null
  readonly classification?: SafeguardingAccountClassificationType | null
  readonly currency?: string | null
  readonly status?: SafeguardingAccountStatusType | null
  readonly disclosureVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SafeguardingReconciliationStatusType =
  | 'MATCHED'
  | 'SHORTFALL'
  | 'SURPLUS'
  | 'RESOLVED'

export type SafeguardingReconciliationWhereUniqueInput = {
  readonly id?: string | null
}

export type SafeguardingReconciliationWhereInput = {
  readonly AND?: ReadonlyArray<SafeguardingReconciliationWhereInput> | SafeguardingReconciliationWhereInput | null
  readonly OR?: ReadonlyArray<SafeguardingReconciliationWhereInput> | SafeguardingReconciliationWhereInput | null
  readonly NOT?: ReadonlyArray<SafeguardingReconciliationWhereInput> | SafeguardingReconciliationWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly safeguardingAccount?: SafeguardingAccountWhereInput | null
  readonly asOf?: DateTimeFilter | null
  readonly safeguardedAssetMinor?: StringFilter | null
  readonly playerLiabilityMinor?: StringFilter | null
  readonly differenceMinor?: StringFilter | null
  readonly status?: SafeguardingReconciliationStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly reconciliationRun?: ReconciliationRunWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SafeguardingReconciliationStatusTypeNullableFilter = {
  readonly equals?: SafeguardingReconciliationStatusType | null
  readonly in?: ReadonlyArray<SafeguardingReconciliationStatusType> | SafeguardingReconciliationStatusType | null
  readonly notIn?: ReadonlyArray<SafeguardingReconciliationStatusType> | SafeguardingReconciliationStatusType | null
  readonly not?: SafeguardingReconciliationStatusTypeNullableFilter | null
}

export type SafeguardingReconciliationOrderByInput = {
  readonly id?: OrderDirection | null
  readonly asOf?: OrderDirection | null
  readonly safeguardedAssetMinor?: OrderDirection | null
  readonly playerLiabilityMinor?: OrderDirection | null
  readonly differenceMinor?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SafeguardingReconciliationUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly safeguardingAccount?: SafeguardingAccountRelateToOneForUpdateInput | null
  readonly asOf?: any | null
  readonly safeguardedAssetMinor?: string | null
  readonly playerLiabilityMinor?: string | null
  readonly differenceMinor?: string | null
  readonly status?: SafeguardingReconciliationStatusType | null
  readonly evidenceHash?: string | null
  readonly reconciliationRun?: ReconciliationRunRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SafeguardingAccountRelateToOneForUpdateInput = {
  readonly create?: SafeguardingAccountCreateInput | null
  readonly connect?: SafeguardingAccountWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SafeguardingReconciliationUpdateArgs = {
  readonly where: SafeguardingReconciliationWhereUniqueInput
  readonly data: SafeguardingReconciliationUpdateInput
}

export type SafeguardingReconciliationCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly safeguardingAccount?: SafeguardingAccountRelateToOneForCreateInput | null
  readonly asOf?: any | null
  readonly safeguardedAssetMinor?: string | null
  readonly playerLiabilityMinor?: string | null
  readonly differenceMinor?: string | null
  readonly status?: SafeguardingReconciliationStatusType | null
  readonly evidenceHash?: string | null
  readonly reconciliationRun?: ReconciliationRunRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SafeguardingAccountRelateToOneForCreateInput = {
  readonly create?: SafeguardingAccountCreateInput | null
  readonly connect?: SafeguardingAccountWhereUniqueInput | null
}

export type ScheduledJobTypeType =
  | 'RECONCILIATION'
  | 'REPORT'
  | 'NOTIFICATION'
  | 'RETENTION'
  | 'EXPIRY'
  | 'PROVIDER_HEALTH'
  | 'FEED_RECOVERY'

export type ScheduledJobStatusType =
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type ScheduledJobWhereUniqueInput = {
  readonly id?: string | null
}

export type ScheduledJobWhereInput = {
  readonly AND?: ReadonlyArray<ScheduledJobWhereInput> | ScheduledJobWhereInput | null
  readonly OR?: ReadonlyArray<ScheduledJobWhereInput> | ScheduledJobWhereInput | null
  readonly NOT?: ReadonlyArray<ScheduledJobWhereInput> | ScheduledJobWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly type?: ScheduledJobTypeTypeNullableFilter | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly status?: ScheduledJobStatusTypeNullableFilter | null
  readonly dueAt?: DateTimeFilter | null
  readonly leaseUntil?: DateTimeNullableFilter | null
  readonly leaseOwner?: StringFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly maxAttempts?: IntNullableFilter | null
  readonly idempotencyKey?: StringFilter | null
  readonly lastError?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ScheduledJobTypeTypeNullableFilter = {
  readonly equals?: ScheduledJobTypeType | null
  readonly in?: ReadonlyArray<ScheduledJobTypeType> | ScheduledJobTypeType | null
  readonly notIn?: ReadonlyArray<ScheduledJobTypeType> | ScheduledJobTypeType | null
  readonly not?: ScheduledJobTypeTypeNullableFilter | null
}

export type ScheduledJobStatusTypeNullableFilter = {
  readonly equals?: ScheduledJobStatusType | null
  readonly in?: ReadonlyArray<ScheduledJobStatusType> | ScheduledJobStatusType | null
  readonly notIn?: ReadonlyArray<ScheduledJobStatusType> | ScheduledJobStatusType | null
  readonly not?: ScheduledJobStatusTypeNullableFilter | null
}

export type ScheduledJobOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly dueAt?: OrderDirection | null
  readonly leaseUntil?: OrderDirection | null
  readonly leaseOwner?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly maxAttempts?: OrderDirection | null
  readonly idempotencyKey?: OrderDirection | null
  readonly lastError?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ScheduledJobUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly type?: ScheduledJobTypeType | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: ScheduledJobStatusType | null
  readonly dueAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly attempts?: number | null
  readonly maxAttempts?: number | null
  readonly idempotencyKey?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ScheduledJobUpdateArgs = {
  readonly where: ScheduledJobWhereUniqueInput
  readonly data: ScheduledJobUpdateInput
}

export type ScheduledJobCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly type?: ScheduledJobTypeType | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly payload?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: ScheduledJobStatusType | null
  readonly dueAt?: any | null
  readonly leaseUntil?: any | null
  readonly leaseOwner?: string | null
  readonly attempts?: number | null
  readonly maxAttempts?: number | null
  readonly idempotencyKey?: string | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type ScreeningHitScreeningTypeType =
  | 'SANCTIONS'
  | 'PEP'
  | 'ADVERSE_MEDIA'
  | 'SOURCE_OF_FUNDS'

export type ScreeningHitStatusType =
  | 'POTENTIAL'
  | 'REVIEW'
  | 'CONFIRMED'
  | 'CLEARED'
  | 'FALSE_POSITIVE'

export type ScreeningHitWhereUniqueInput = {
  readonly id?: string | null
}

export type ScreeningHitWhereInput = {
  readonly AND?: ReadonlyArray<ScreeningHitWhereInput> | ScreeningHitWhereInput | null
  readonly OR?: ReadonlyArray<ScreeningHitWhereInput> | ScreeningHitWhereInput | null
  readonly NOT?: ReadonlyArray<ScreeningHitWhereInput> | ScreeningHitWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly amlCase?: AMLCaseWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly screeningType?: ScreeningHitScreeningTypeTypeNullableFilter | null
  readonly matchToken?: StringFilter | null
  readonly status?: ScreeningHitStatusTypeNullableFilter | null
  readonly dispositionReason?: StringFilter | null
  readonly evidenceReference?: StringFilter | null
  readonly screenedAt?: DateTimeFilter | null
  readonly resolvedAt?: DateTimeNullableFilter | null
  readonly ownerId?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type ScreeningHitScreeningTypeTypeNullableFilter = {
  readonly equals?: ScreeningHitScreeningTypeType | null
  readonly in?: ReadonlyArray<ScreeningHitScreeningTypeType> | ScreeningHitScreeningTypeType | null
  readonly notIn?: ReadonlyArray<ScreeningHitScreeningTypeType> | ScreeningHitScreeningTypeType | null
  readonly not?: ScreeningHitScreeningTypeTypeNullableFilter | null
}

export type ScreeningHitStatusTypeNullableFilter = {
  readonly equals?: ScreeningHitStatusType | null
  readonly in?: ReadonlyArray<ScreeningHitStatusType> | ScreeningHitStatusType | null
  readonly notIn?: ReadonlyArray<ScreeningHitStatusType> | ScreeningHitStatusType | null
  readonly not?: ScreeningHitStatusTypeNullableFilter | null
}

export type ScreeningHitOrderByInput = {
  readonly id?: OrderDirection | null
  readonly screeningType?: OrderDirection | null
  readonly matchToken?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly dispositionReason?: OrderDirection | null
  readonly evidenceReference?: OrderDirection | null
  readonly screenedAt?: OrderDirection | null
  readonly resolvedAt?: OrderDirection | null
  readonly ownerId?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type ScreeningHitUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly amlCase?: AMLCaseRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly screeningType?: ScreeningHitScreeningTypeType | null
  readonly matchToken?: string | null
  readonly status?: ScreeningHitStatusType | null
  readonly dispositionReason?: string | null
  readonly evidenceReference?: string | null
  readonly screenedAt?: any | null
  readonly resolvedAt?: any | null
  readonly ownerId?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AMLCaseRelateToOneForUpdateInput = {
  readonly create?: AMLCaseCreateInput | null
  readonly connect?: AMLCaseWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type ScreeningHitUpdateArgs = {
  readonly where: ScreeningHitWhereUniqueInput
  readonly data: ScreeningHitUpdateInput
}

export type ScreeningHitCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly amlCase?: AMLCaseRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly screeningType?: ScreeningHitScreeningTypeType | null
  readonly matchToken?: string | null
  readonly status?: ScreeningHitStatusType | null
  readonly dispositionReason?: string | null
  readonly evidenceReference?: string | null
  readonly screenedAt?: any | null
  readonly resolvedAt?: any | null
  readonly ownerId?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type AMLCaseRelateToOneForCreateInput = {
  readonly create?: AMLCaseCreateInput | null
  readonly connect?: AMLCaseWhereUniqueInput | null
}

export type SeasonStatusType =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'COMPLETE'
  | 'CANCELLED'

export type SeasonWhereUniqueInput = {
  readonly id?: string | null
}

export type SeasonWhereInput = {
  readonly AND?: ReadonlyArray<SeasonWhereInput> | SeasonWhereInput | null
  readonly OR?: ReadonlyArray<SeasonWhereInput> | SeasonWhereInput | null
  readonly NOT?: ReadonlyArray<SeasonWhereInput> | SeasonWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly competition?: CompetitionWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly startsAt?: DateTimeFilter | null
  readonly endsAt?: DateTimeFilter | null
  readonly status?: SeasonStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SeasonStatusTypeNullableFilter = {
  readonly equals?: SeasonStatusType | null
  readonly in?: ReadonlyArray<SeasonStatusType> | SeasonStatusType | null
  readonly notIn?: ReadonlyArray<SeasonStatusType> | SeasonStatusType | null
  readonly not?: SeasonStatusTypeNullableFilter | null
}

export type SeasonOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly endsAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SeasonUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly competition?: CompetitionRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: SeasonStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SeasonUpdateArgs = {
  readonly where: SeasonWhereUniqueInput
  readonly data: SeasonUpdateInput
}

export type SeasonCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly competition?: CompetitionRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly startsAt?: any | null
  readonly endsAt?: any | null
  readonly status?: SeasonStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SettlementLineLineTypeType =
  | 'STAKE_RETURN'
  | 'PROFIT'
  | 'LOSS'
  | 'VOID'
  | 'PUSH'
  | 'DEAD_HEAT'
  | 'TAX'
  | 'ROUNDING'

export type SettlementLineWhereUniqueInput = {
  readonly id?: string | null
}

export type SettlementLineWhereInput = {
  readonly AND?: ReadonlyArray<SettlementLineWhereInput> | SettlementLineWhereInput | null
  readonly OR?: ReadonlyArray<SettlementLineWhereInput> | SettlementLineWhereInput | null
  readonly NOT?: ReadonlyArray<SettlementLineWhereInput> | SettlementLineWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly settlement?: SettlementWhereInput | null
  readonly wagerPart?: WagerPartWhereInput | null
  readonly wagerLeg?: WagerLegWhereInput | null
  readonly lineType?: SettlementLineLineTypeTypeNullableFilter | null
  readonly amountMinor?: StringFilter | null
  readonly unroundedValue?: StringFilter | null
  readonly scale?: IntFilter | null
  readonly roundingRule?: StringFilter | null
  readonly residualMinor?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SettlementLineLineTypeTypeNullableFilter = {
  readonly equals?: SettlementLineLineTypeType | null
  readonly in?: ReadonlyArray<SettlementLineLineTypeType> | SettlementLineLineTypeType | null
  readonly notIn?: ReadonlyArray<SettlementLineLineTypeType> | SettlementLineLineTypeType | null
  readonly not?: SettlementLineLineTypeTypeNullableFilter | null
}

export type SettlementLineOrderByInput = {
  readonly id?: OrderDirection | null
  readonly lineType?: OrderDirection | null
  readonly amountMinor?: OrderDirection | null
  readonly unroundedValue?: OrderDirection | null
  readonly scale?: OrderDirection | null
  readonly roundingRule?: OrderDirection | null
  readonly residualMinor?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SettlementLineUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly settlement?: SettlementRelateToOneForUpdateInput | null
  readonly wagerPart?: WagerPartRelateToOneForUpdateInput | null
  readonly wagerLeg?: WagerLegRelateToOneForUpdateInput | null
  readonly lineType?: SettlementLineLineTypeType | null
  readonly amountMinor?: string | null
  readonly unroundedValue?: string | null
  readonly scale?: number | null
  readonly roundingRule?: string | null
  readonly residualMinor?: string | null
  readonly trace?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SettlementLineUpdateArgs = {
  readonly where: SettlementLineWhereUniqueInput
  readonly data: SettlementLineUpdateInput
}

export type SettlementLineCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly settlement?: SettlementRelateToOneForCreateInput | null
  readonly wagerPart?: WagerPartRelateToOneForCreateInput | null
  readonly wagerLeg?: WagerLegRelateToOneForCreateInput | null
  readonly lineType?: SettlementLineLineTypeType | null
  readonly amountMinor?: string | null
  readonly unroundedValue?: string | null
  readonly scale?: number | null
  readonly roundingRule?: string | null
  readonly residualMinor?: string | null
  readonly trace?: import('@keystone-6/core/types').JSONValue | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SettlementRunTriggerTypeType =
  | 'RESULT_APPROVED'
  | 'CORRECTION'
  | 'MANUAL_REPLAY'

export type SettlementRunStatusType =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'

export type SettlementRunWhereUniqueInput = {
  readonly id?: string | null
}

export type SettlementRunWhereInput = {
  readonly AND?: ReadonlyArray<SettlementRunWhereInput> | SettlementRunWhereInput | null
  readonly OR?: ReadonlyArray<SettlementRunWhereInput> | SettlementRunWhereInput | null
  readonly NOT?: ReadonlyArray<SettlementRunWhereInput> | SettlementRunWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly triggerType?: SettlementRunTriggerTypeTypeNullableFilter | null
  readonly resultVersion?: ResultVersionWhereInput | null
  readonly inputHash?: StringFilter | null
  readonly status?: SettlementRunStatusTypeNullableFilter | null
  readonly wagersConsidered?: IntNullableFilter | null
  readonly wagersSettled?: IntNullableFilter | null
  readonly startedAt?: DateTimeFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly errorSummary?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SettlementRunTriggerTypeTypeNullableFilter = {
  readonly equals?: SettlementRunTriggerTypeType | null
  readonly in?: ReadonlyArray<SettlementRunTriggerTypeType> | SettlementRunTriggerTypeType | null
  readonly notIn?: ReadonlyArray<SettlementRunTriggerTypeType> | SettlementRunTriggerTypeType | null
  readonly not?: SettlementRunTriggerTypeTypeNullableFilter | null
}

export type SettlementRunStatusTypeNullableFilter = {
  readonly equals?: SettlementRunStatusType | null
  readonly in?: ReadonlyArray<SettlementRunStatusType> | SettlementRunStatusType | null
  readonly notIn?: ReadonlyArray<SettlementRunStatusType> | SettlementRunStatusType | null
  readonly not?: SettlementRunStatusTypeNullableFilter | null
}

export type SettlementRunOrderByInput = {
  readonly id?: OrderDirection | null
  readonly triggerType?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly wagersConsidered?: OrderDirection | null
  readonly wagersSettled?: OrderDirection | null
  readonly startedAt?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly errorSummary?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SettlementRunUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly triggerType?: SettlementRunTriggerTypeType | null
  readonly resultVersion?: ResultVersionRelateToOneForUpdateInput | null
  readonly inputHash?: string | null
  readonly status?: SettlementRunStatusType | null
  readonly wagersConsidered?: number | null
  readonly wagersSettled?: number | null
  readonly startedAt?: any | null
  readonly completedAt?: any | null
  readonly errorSummary?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SettlementRunUpdateArgs = {
  readonly where: SettlementRunWhereUniqueInput
  readonly data: SettlementRunUpdateInput
}

export type SettlementRunCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly triggerType?: SettlementRunTriggerTypeType | null
  readonly resultVersion?: ResultVersionRelateToOneForCreateInput | null
  readonly inputHash?: string | null
  readonly status?: SettlementRunStatusType | null
  readonly wagersConsidered?: number | null
  readonly wagersSettled?: number | null
  readonly startedAt?: any | null
  readonly completedAt?: any | null
  readonly errorSummary?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SupportCaseCategoryType =
  | 'ACCOUNT'
  | 'WAGER'
  | 'PAYMENT'
  | 'RESPONSIBLE_GAMING'
  | 'PRIVACY'
  | 'TECHNICAL'

export type SupportCasePriorityType =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT'

export type SupportCaseStatusType =
  | 'OPEN'
  | 'TRIAGED'
  | 'WAITING_CUSTOMER'
  | 'WAITING_OPERATOR'
  | 'RESOLVED'
  | 'CLOSED'

export type SupportCaseWhereUniqueInput = {
  readonly id?: string | null
}

export type SupportCaseWhereInput = {
  readonly AND?: ReadonlyArray<SupportCaseWhereInput> | SupportCaseWhereInput | null
  readonly OR?: ReadonlyArray<SupportCaseWhereInput> | SupportCaseWhereInput | null
  readonly NOT?: ReadonlyArray<SupportCaseWhereInput> | SupportCaseWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly player?: PlayerWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly paymentIntent?: PaymentIntentWhereInput | null
  readonly dispute?: DisputeWhereInput | null
  readonly category?: SupportCaseCategoryTypeNullableFilter | null
  readonly priority?: SupportCasePriorityTypeNullableFilter | null
  readonly status?: SupportCaseStatusTypeNullableFilter | null
  readonly subject?: StringFilter | null
  readonly ownerId?: StringFilter | null
  readonly openedAt?: DateTimeFilter | null
  readonly resolvedAt?: DateTimeNullableFilter | null
  readonly slaDueAt?: DateTimeFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SupportCaseCategoryTypeNullableFilter = {
  readonly equals?: SupportCaseCategoryType | null
  readonly in?: ReadonlyArray<SupportCaseCategoryType> | SupportCaseCategoryType | null
  readonly notIn?: ReadonlyArray<SupportCaseCategoryType> | SupportCaseCategoryType | null
  readonly not?: SupportCaseCategoryTypeNullableFilter | null
}

export type SupportCasePriorityTypeNullableFilter = {
  readonly equals?: SupportCasePriorityType | null
  readonly in?: ReadonlyArray<SupportCasePriorityType> | SupportCasePriorityType | null
  readonly notIn?: ReadonlyArray<SupportCasePriorityType> | SupportCasePriorityType | null
  readonly not?: SupportCasePriorityTypeNullableFilter | null
}

export type SupportCaseStatusTypeNullableFilter = {
  readonly equals?: SupportCaseStatusType | null
  readonly in?: ReadonlyArray<SupportCaseStatusType> | SupportCaseStatusType | null
  readonly notIn?: ReadonlyArray<SupportCaseStatusType> | SupportCaseStatusType | null
  readonly not?: SupportCaseStatusTypeNullableFilter | null
}

export type SupportCaseOrderByInput = {
  readonly id?: OrderDirection | null
  readonly category?: OrderDirection | null
  readonly priority?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly subject?: OrderDirection | null
  readonly ownerId?: OrderDirection | null
  readonly openedAt?: OrderDirection | null
  readonly resolvedAt?: OrderDirection | null
  readonly slaDueAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SupportCaseUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly player?: PlayerRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly paymentIntent?: PaymentIntentRelateToOneForUpdateInput | null
  readonly dispute?: DisputeRelateToOneForUpdateInput | null
  readonly category?: SupportCaseCategoryType | null
  readonly priority?: SupportCasePriorityType | null
  readonly status?: SupportCaseStatusType | null
  readonly subject?: string | null
  readonly ownerId?: string | null
  readonly openedAt?: any | null
  readonly resolvedAt?: any | null
  readonly slaDueAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SupportCaseUpdateArgs = {
  readonly where: SupportCaseWhereUniqueInput
  readonly data: SupportCaseUpdateInput
}

export type SupportCaseCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly player?: PlayerRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly paymentIntent?: PaymentIntentRelateToOneForCreateInput | null
  readonly dispute?: DisputeRelateToOneForCreateInput | null
  readonly category?: SupportCaseCategoryType | null
  readonly priority?: SupportCasePriorityType | null
  readonly status?: SupportCaseStatusType | null
  readonly subject?: string | null
  readonly ownerId?: string | null
  readonly openedAt?: any | null
  readonly resolvedAt?: any | null
  readonly slaDueAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SupportCaseEventTypeType =
  | 'OPENED'
  | 'NOTE'
  | 'CUSTOMER_MESSAGE'
  | 'OPERATOR_MESSAGE'
  | 'ESCALATED'
  | 'LINKED'
  | 'RESOLVED'
  | 'REOPENED'

export type SupportCaseEventActorTypeType =
  | 'PLAYER'
  | 'STAFF'
  | 'SYSTEM'
  | 'PROVIDER'

export type SupportCaseEventVisibilityType =
  | 'CUSTOMER'
  | 'INTERNAL'
  | 'RESTRICTED'

export type SupportCaseEventWhereUniqueInput = {
  readonly id?: string | null
}

export type SupportCaseEventWhereInput = {
  readonly AND?: ReadonlyArray<SupportCaseEventWhereInput> | SupportCaseEventWhereInput | null
  readonly OR?: ReadonlyArray<SupportCaseEventWhereInput> | SupportCaseEventWhereInput | null
  readonly NOT?: ReadonlyArray<SupportCaseEventWhereInput> | SupportCaseEventWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly supportCase?: SupportCaseWhereInput | null
  readonly type?: SupportCaseEventTypeTypeNullableFilter | null
  readonly actorType?: SupportCaseEventActorTypeTypeNullableFilter | null
  readonly actorId?: StringFilter | null
  readonly body?: StringFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly visibility?: SupportCaseEventVisibilityTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type SupportCaseEventTypeTypeNullableFilter = {
  readonly equals?: SupportCaseEventTypeType | null
  readonly in?: ReadonlyArray<SupportCaseEventTypeType> | SupportCaseEventTypeType | null
  readonly notIn?: ReadonlyArray<SupportCaseEventTypeType> | SupportCaseEventTypeType | null
  readonly not?: SupportCaseEventTypeTypeNullableFilter | null
}

export type SupportCaseEventActorTypeTypeNullableFilter = {
  readonly equals?: SupportCaseEventActorTypeType | null
  readonly in?: ReadonlyArray<SupportCaseEventActorTypeType> | SupportCaseEventActorTypeType | null
  readonly notIn?: ReadonlyArray<SupportCaseEventActorTypeType> | SupportCaseEventActorTypeType | null
  readonly not?: SupportCaseEventActorTypeTypeNullableFilter | null
}

export type SupportCaseEventVisibilityTypeNullableFilter = {
  readonly equals?: SupportCaseEventVisibilityType | null
  readonly in?: ReadonlyArray<SupportCaseEventVisibilityType> | SupportCaseEventVisibilityType | null
  readonly notIn?: ReadonlyArray<SupportCaseEventVisibilityType> | SupportCaseEventVisibilityType | null
  readonly not?: SupportCaseEventVisibilityTypeNullableFilter | null
}

export type SupportCaseEventOrderByInput = {
  readonly id?: OrderDirection | null
  readonly type?: OrderDirection | null
  readonly actorType?: OrderDirection | null
  readonly actorId?: OrderDirection | null
  readonly body?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly visibility?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type SupportCaseEventUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly supportCase?: SupportCaseRelateToOneForUpdateInput | null
  readonly type?: SupportCaseEventTypeType | null
  readonly actorType?: SupportCaseEventActorTypeType | null
  readonly actorId?: string | null
  readonly body?: string | null
  readonly evidenceHash?: string | null
  readonly visibility?: SupportCaseEventVisibilityType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SupportCaseRelateToOneForUpdateInput = {
  readonly create?: SupportCaseCreateInput | null
  readonly connect?: SupportCaseWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type SupportCaseEventUpdateArgs = {
  readonly where: SupportCaseEventWhereUniqueInput
  readonly data: SupportCaseEventUpdateInput
}

export type SupportCaseEventCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly supportCase?: SupportCaseRelateToOneForCreateInput | null
  readonly type?: SupportCaseEventTypeType | null
  readonly actorType?: SupportCaseEventActorTypeType | null
  readonly actorId?: string | null
  readonly body?: string | null
  readonly evidenceHash?: string | null
  readonly visibility?: SupportCaseEventVisibilityType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type SupportCaseRelateToOneForCreateInput = {
  readonly create?: SupportCaseCreateInput | null
  readonly connect?: SupportCaseWhereUniqueInput | null
}

export type TaxRuleVersionBasisType =
  | 'STAKE'
  | 'WINNINGS'
  | 'GGR'
  | 'PLAYER_WITHHOLDING'
  | 'PROMOTION'

export type TaxRuleVersionStatusType =
  | 'DRAFT'
  | 'ACTIVE'
  | 'RETIRED'

export type TaxRuleVersionWhereUniqueInput = {
  readonly id?: string | null
}

export type TaxRuleVersionWhereInput = {
  readonly AND?: ReadonlyArray<TaxRuleVersionWhereInput> | TaxRuleVersionWhereInput | null
  readonly OR?: ReadonlyArray<TaxRuleVersionWhereInput> | TaxRuleVersionWhereInput | null
  readonly NOT?: ReadonlyArray<TaxRuleVersionWhereInput> | TaxRuleVersionWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly jurisdiction?: JurisdictionWhereInput | null
  readonly key?: StringFilter | null
  readonly version?: IntFilter | null
  readonly basis?: TaxRuleVersionBasisTypeNullableFilter | null
  readonly rateNumerator?: StringFilter | null
  readonly rateDenominator?: StringFilter | null
  readonly roundingRule?: StringFilter | null
  readonly effectiveFrom?: DateTimeFilter | null
  readonly effectiveTo?: DateTimeNullableFilter | null
  readonly status?: TaxRuleVersionStatusTypeNullableFilter | null
  readonly evidenceHash?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TaxRuleVersionBasisTypeNullableFilter = {
  readonly equals?: TaxRuleVersionBasisType | null
  readonly in?: ReadonlyArray<TaxRuleVersionBasisType> | TaxRuleVersionBasisType | null
  readonly notIn?: ReadonlyArray<TaxRuleVersionBasisType> | TaxRuleVersionBasisType | null
  readonly not?: TaxRuleVersionBasisTypeNullableFilter | null
}

export type TaxRuleVersionStatusTypeNullableFilter = {
  readonly equals?: TaxRuleVersionStatusType | null
  readonly in?: ReadonlyArray<TaxRuleVersionStatusType> | TaxRuleVersionStatusType | null
  readonly notIn?: ReadonlyArray<TaxRuleVersionStatusType> | TaxRuleVersionStatusType | null
  readonly not?: TaxRuleVersionStatusTypeNullableFilter | null
}

export type TaxRuleVersionOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly basis?: OrderDirection | null
  readonly rateNumerator?: OrderDirection | null
  readonly rateDenominator?: OrderDirection | null
  readonly roundingRule?: OrderDirection | null
  readonly effectiveFrom?: OrderDirection | null
  readonly effectiveTo?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly evidenceHash?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TaxRuleVersionUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly version?: number | null
  readonly basis?: TaxRuleVersionBasisType | null
  readonly rateNumerator?: string | null
  readonly rateDenominator?: string | null
  readonly roundingRule?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: TaxRuleVersionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TaxRuleVersionUpdateArgs = {
  readonly where: TaxRuleVersionWhereUniqueInput
  readonly data: TaxRuleVersionUpdateInput
}

export type TaxRuleVersionCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly jurisdiction?: JurisdictionRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly version?: number | null
  readonly basis?: TaxRuleVersionBasisType | null
  readonly rateNumerator?: string | null
  readonly rateDenominator?: string | null
  readonly roundingRule?: string | null
  readonly effectiveFrom?: any | null
  readonly effectiveTo?: any | null
  readonly status?: TaxRuleVersionStatusType | null
  readonly evidenceHash?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TenantCurrencyStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'

export type TenantCurrencyWhereUniqueInput = {
  readonly id?: string | null
}

export type TenantCurrencyWhereInput = {
  readonly AND?: ReadonlyArray<TenantCurrencyWhereInput> | TenantCurrencyWhereInput | null
  readonly OR?: ReadonlyArray<TenantCurrencyWhereInput> | TenantCurrencyWhereInput | null
  readonly NOT?: ReadonlyArray<TenantCurrencyWhereInput> | TenantCurrencyWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly currency?: CurrencyDefinitionWhereInput | null
  readonly depositsEnabled?: BooleanFilter | null
  readonly withdrawalsEnabled?: BooleanFilter | null
  readonly wageringEnabled?: BooleanFilter | null
  readonly defaultForBrand?: BooleanFilter | null
  readonly status?: TenantCurrencyStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TenantCurrencyStatusTypeNullableFilter = {
  readonly equals?: TenantCurrencyStatusType | null
  readonly in?: ReadonlyArray<TenantCurrencyStatusType> | TenantCurrencyStatusType | null
  readonly notIn?: ReadonlyArray<TenantCurrencyStatusType> | TenantCurrencyStatusType | null
  readonly not?: TenantCurrencyStatusTypeNullableFilter | null
}

export type TenantCurrencyOrderByInput = {
  readonly id?: OrderDirection | null
  readonly depositsEnabled?: OrderDirection | null
  readonly withdrawalsEnabled?: OrderDirection | null
  readonly wageringEnabled?: OrderDirection | null
  readonly defaultForBrand?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TenantCurrencyUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly currency?: CurrencyDefinitionRelateToOneForUpdateInput | null
  readonly depositsEnabled?: boolean | null
  readonly withdrawalsEnabled?: boolean | null
  readonly wageringEnabled?: boolean | null
  readonly defaultForBrand?: boolean | null
  readonly status?: TenantCurrencyStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CurrencyDefinitionRelateToOneForUpdateInput = {
  readonly create?: CurrencyDefinitionCreateInput | null
  readonly connect?: CurrencyDefinitionWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type TenantCurrencyUpdateArgs = {
  readonly where: TenantCurrencyWhereUniqueInput
  readonly data: TenantCurrencyUpdateInput
}

export type TenantCurrencyCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly currency?: CurrencyDefinitionRelateToOneForCreateInput | null
  readonly depositsEnabled?: boolean | null
  readonly withdrawalsEnabled?: boolean | null
  readonly wageringEnabled?: boolean | null
  readonly defaultForBrand?: boolean | null
  readonly status?: TenantCurrencyStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type CurrencyDefinitionRelateToOneForCreateInput = {
  readonly create?: CurrencyDefinitionCreateInput | null
  readonly connect?: CurrencyDefinitionWhereUniqueInput | null
}

export type TraderOverrideOverrideTypeType =
  | 'PRICE'
  | 'LINE'
  | 'STATUS'
  | 'MAX_STAKE'
  | 'MAX_PAYOUT'
  | 'MAX_LIABILITY'
  | 'CASH_OUT'

export type TraderOverrideStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED'

export type TraderOverrideWhereUniqueInput = {
  readonly id?: string | null
}

export type TraderOverrideWhereInput = {
  readonly AND?: ReadonlyArray<TraderOverrideWhereInput> | TraderOverrideWhereInput | null
  readonly OR?: ReadonlyArray<TraderOverrideWhereInput> | TraderOverrideWhereInput | null
  readonly NOT?: ReadonlyArray<TraderOverrideWhereInput> | TraderOverrideWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly targetType?: StringFilter | null
  readonly targetId?: StringFilter | null
  readonly overrideType?: TraderOverrideOverrideTypeTypeNullableFilter | null
  readonly reasonCode?: StringFilter | null
  readonly startsAt?: DateTimeFilter | null
  readonly expiresAt?: DateTimeFilter | null
  readonly status?: TraderOverrideStatusTypeNullableFilter | null
  readonly requesterId?: StringFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TraderOverrideOverrideTypeTypeNullableFilter = {
  readonly equals?: TraderOverrideOverrideTypeType | null
  readonly in?: ReadonlyArray<TraderOverrideOverrideTypeType> | TraderOverrideOverrideTypeType | null
  readonly notIn?: ReadonlyArray<TraderOverrideOverrideTypeType> | TraderOverrideOverrideTypeType | null
  readonly not?: TraderOverrideOverrideTypeTypeNullableFilter | null
}

export type TraderOverrideStatusTypeNullableFilter = {
  readonly equals?: TraderOverrideStatusType | null
  readonly in?: ReadonlyArray<TraderOverrideStatusType> | TraderOverrideStatusType | null
  readonly notIn?: ReadonlyArray<TraderOverrideStatusType> | TraderOverrideStatusType | null
  readonly not?: TraderOverrideStatusTypeNullableFilter | null
}

export type TraderOverrideOrderByInput = {
  readonly id?: OrderDirection | null
  readonly targetType?: OrderDirection | null
  readonly targetId?: OrderDirection | null
  readonly overrideType?: OrderDirection | null
  readonly reasonCode?: OrderDirection | null
  readonly startsAt?: OrderDirection | null
  readonly expiresAt?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly requesterId?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TraderOverrideUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly targetType?: string | null
  readonly targetId?: string | null
  readonly overrideType?: TraderOverrideOverrideTypeType | null
  readonly value?: import('@keystone-6/core/types').JSONValue | null
  readonly reasonCode?: string | null
  readonly startsAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: TraderOverrideStatusType | null
  readonly requesterId?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TraderOverrideUpdateArgs = {
  readonly where: TraderOverrideWhereUniqueInput
  readonly data: TraderOverrideUpdateInput
}

export type TraderOverrideCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly targetType?: string | null
  readonly targetId?: string | null
  readonly overrideType?: TraderOverrideOverrideTypeType | null
  readonly value?: import('@keystone-6/core/types').JSONValue | null
  readonly reasonCode?: string | null
  readonly startsAt?: any | null
  readonly expiresAt?: any | null
  readonly status?: TraderOverrideStatusType | null
  readonly requesterId?: string | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TradingReplayRunStatusType =
  | 'PENDING'
  | 'RUNNING'
  | 'MATCHED'
  | 'DIFFERENT'
  | 'FAILED'

export type TradingReplayRunWhereUniqueInput = {
  readonly id?: string | null
}

export type TradingReplayRunWhereInput = {
  readonly AND?: ReadonlyArray<TradingReplayRunWhereInput> | TradingReplayRunWhereInput | null
  readonly OR?: ReadonlyArray<TradingReplayRunWhereInput> | TradingReplayRunWhereInput | null
  readonly NOT?: ReadonlyArray<TradingReplayRunWhereInput> | TradingReplayRunWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly providerConnection?: ProviderConnectionWhereInput | null
  readonly scopeType?: StringFilter | null
  readonly scopeId?: StringFilter | null
  readonly frontier?: StringFilter | null
  readonly adapterVersion?: StringFilter | null
  readonly normalizerVersion?: StringFilter | null
  readonly ruleVersion?: StringFilter | null
  readonly inputHash?: StringFilter | null
  readonly outputHash?: StringFilter | null
  readonly dryRun?: BooleanFilter | null
  readonly status?: TradingReplayRunStatusTypeNullableFilter | null
  readonly completedAt?: DateTimeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type TradingReplayRunStatusTypeNullableFilter = {
  readonly equals?: TradingReplayRunStatusType | null
  readonly in?: ReadonlyArray<TradingReplayRunStatusType> | TradingReplayRunStatusType | null
  readonly notIn?: ReadonlyArray<TradingReplayRunStatusType> | TradingReplayRunStatusType | null
  readonly not?: TradingReplayRunStatusTypeNullableFilter | null
}

export type TradingReplayRunOrderByInput = {
  readonly id?: OrderDirection | null
  readonly scopeType?: OrderDirection | null
  readonly scopeId?: OrderDirection | null
  readonly frontier?: OrderDirection | null
  readonly adapterVersion?: OrderDirection | null
  readonly normalizerVersion?: OrderDirection | null
  readonly ruleVersion?: OrderDirection | null
  readonly inputHash?: OrderDirection | null
  readonly outputHash?: OrderDirection | null
  readonly dryRun?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly completedAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type TradingReplayRunUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForUpdateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly frontier?: string | null
  readonly adapterVersion?: string | null
  readonly normalizerVersion?: string | null
  readonly ruleVersion?: string | null
  readonly inputHash?: string | null
  readonly outputHash?: string | null
  readonly comparison?: import('@keystone-6/core/types').JSONValue | null
  readonly dryRun?: boolean | null
  readonly status?: TradingReplayRunStatusType | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type TradingReplayRunUpdateArgs = {
  readonly where: TradingReplayRunWhereUniqueInput
  readonly data: TradingReplayRunUpdateInput
}

export type TradingReplayRunCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly providerConnection?: ProviderConnectionRelateToOneForCreateInput | null
  readonly scopeType?: string | null
  readonly scopeId?: string | null
  readonly frontier?: string | null
  readonly adapterVersion?: string | null
  readonly normalizerVersion?: string | null
  readonly ruleVersion?: string | null
  readonly inputHash?: string | null
  readonly outputHash?: string | null
  readonly comparison?: import('@keystone-6/core/types').JSONValue | null
  readonly dryRun?: boolean | null
  readonly status?: TradingReplayRunStatusType | null
  readonly completedAt?: any | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VenueStatusType =
  | 'ACTIVE'
  | 'INACTIVE'

export type VenueWhereUniqueInput = {
  readonly id?: string | null
}

export type VenueWhereInput = {
  readonly AND?: ReadonlyArray<VenueWhereInput> | VenueWhereInput | null
  readonly OR?: ReadonlyArray<VenueWhereInput> | VenueWhereInput | null
  readonly NOT?: ReadonlyArray<VenueWhereInput> | VenueWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly key?: StringFilter | null
  readonly name?: StringFilter | null
  readonly countryCode?: StringFilter | null
  readonly timezone?: StringFilter | null
  readonly status?: VenueStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type VenueStatusTypeNullableFilter = {
  readonly equals?: VenueStatusType | null
  readonly in?: ReadonlyArray<VenueStatusType> | VenueStatusType | null
  readonly notIn?: ReadonlyArray<VenueStatusType> | VenueStatusType | null
  readonly not?: VenueStatusTypeNullableFilter | null
}

export type VenueOrderByInput = {
  readonly id?: OrderDirection | null
  readonly key?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly countryCode?: OrderDirection | null
  readonly timezone?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type VenueUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly countryCode?: string | null
  readonly timezone?: string | null
  readonly address?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: VenueStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type VenueUpdateArgs = {
  readonly where: VenueWhereUniqueInput
  readonly data: VenueUpdateInput
}

export type VenueCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly key?: string | null
  readonly name?: string | null
  readonly countryCode?: string | null
  readonly timezone?: string | null
  readonly address?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: VenueStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerExposureAllocationStatusType =
  | 'OPEN'
  | 'PARTIALLY_CLOSED'
  | 'CLOSED'

export type WagerExposureAllocationWhereUniqueInput = {
  readonly id?: string | null
}

export type WagerExposureAllocationWhereInput = {
  readonly AND?: ReadonlyArray<WagerExposureAllocationWhereInput> | WagerExposureAllocationWhereInput | null
  readonly OR?: ReadonlyArray<WagerExposureAllocationWhereInput> | WagerExposureAllocationWhereInput | null
  readonly NOT?: ReadonlyArray<WagerExposureAllocationWhereInput> | WagerExposureAllocationWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly market?: MarketWhereInput | null
  readonly stakeMinor?: StringFilter | null
  readonly liabilityMinor?: StringFilter | null
  readonly remainingStakeMinor?: StringFilter | null
  readonly remainingLiabilityMinor?: StringFilter | null
  readonly version?: IntFilter | null
  readonly status?: WagerExposureAllocationStatusTypeNullableFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WagerExposureAllocationStatusTypeNullableFilter = {
  readonly equals?: WagerExposureAllocationStatusType | null
  readonly in?: ReadonlyArray<WagerExposureAllocationStatusType> | WagerExposureAllocationStatusType | null
  readonly notIn?: ReadonlyArray<WagerExposureAllocationStatusType> | WagerExposureAllocationStatusType | null
  readonly not?: WagerExposureAllocationStatusTypeNullableFilter | null
}

export type WagerExposureAllocationOrderByInput = {
  readonly id?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly liabilityMinor?: OrderDirection | null
  readonly remainingStakeMinor?: OrderDirection | null
  readonly remainingLiabilityMinor?: OrderDirection | null
  readonly version?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WagerExposureAllocationUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly market?: MarketRelateToOneForUpdateInput | null
  readonly stakeMinor?: string | null
  readonly liabilityMinor?: string | null
  readonly remainingStakeMinor?: string | null
  readonly remainingLiabilityMinor?: string | null
  readonly version?: number | null
  readonly status?: WagerExposureAllocationStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerExposureAllocationUpdateArgs = {
  readonly where: WagerExposureAllocationWhereUniqueInput
  readonly data: WagerExposureAllocationUpdateInput
}

export type WagerExposureAllocationCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly market?: MarketRelateToOneForCreateInput | null
  readonly stakeMinor?: string | null
  readonly liabilityMinor?: string | null
  readonly remainingStakeMinor?: string | null
  readonly remainingLiabilityMinor?: string | null
  readonly version?: number | null
  readonly status?: WagerExposureAllocationStatusType | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerPartStatusType =
  | 'OPEN'
  | 'GRADED'
  | 'SETTLED'
  | 'CASHED_OUT'
  | 'VOID'

export type WagerPartWhereUniqueInput = {
  readonly id?: string | null
}

export type WagerPartWhereInput = {
  readonly AND?: ReadonlyArray<WagerPartWhereInput> | WagerPartWhereInput | null
  readonly OR?: ReadonlyArray<WagerPartWhereInput> | WagerPartWhereInput | null
  readonly NOT?: ReadonlyArray<WagerPartWhereInput> | WagerPartWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly wager?: WagerWhereInput | null
  readonly partIndex?: IntFilter | null
  readonly combinationKey?: StringFilter | null
  readonly stakeMinor?: StringFilter | null
  readonly decimalOdds?: StringFilter | null
  readonly potentialReturnMinor?: StringFilter | null
  readonly status?: WagerPartStatusTypeNullableFilter | null
  readonly settlement?: SettlementWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WagerPartStatusTypeNullableFilter = {
  readonly equals?: WagerPartStatusType | null
  readonly in?: ReadonlyArray<WagerPartStatusType> | WagerPartStatusType | null
  readonly notIn?: ReadonlyArray<WagerPartStatusType> | WagerPartStatusType | null
  readonly not?: WagerPartStatusTypeNullableFilter | null
}

export type WagerPartOrderByInput = {
  readonly id?: OrderDirection | null
  readonly partIndex?: OrderDirection | null
  readonly combinationKey?: OrderDirection | null
  readonly stakeMinor?: OrderDirection | null
  readonly decimalOdds?: OrderDirection | null
  readonly potentialReturnMinor?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WagerPartUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly wager?: WagerRelateToOneForUpdateInput | null
  readonly partIndex?: number | null
  readonly combinationKey?: string | null
  readonly stakeMinor?: string | null
  readonly decimalOdds?: string | null
  readonly potentialReturnMinor?: string | null
  readonly status?: WagerPartStatusType | null
  readonly gradeSummary?: import('@keystone-6/core/types').JSONValue | null
  readonly settlement?: SettlementRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WagerPartUpdateArgs = {
  readonly where: WagerPartWhereUniqueInput
  readonly data: WagerPartUpdateInput
}

export type WagerPartCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly wager?: WagerRelateToOneForCreateInput | null
  readonly partIndex?: number | null
  readonly combinationKey?: string | null
  readonly stakeMinor?: string | null
  readonly decimalOdds?: string | null
  readonly potentialReturnMinor?: string | null
  readonly status?: WagerPartStatusType | null
  readonly gradeSummary?: import('@keystone-6/core/types').JSONValue | null
  readonly settlement?: SettlementRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookDeliveryStatusType =
  | 'PENDING'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'FAILED'
  | 'DEAD'

export type WebhookDeliveryWhereUniqueInput = {
  readonly id?: string | null
}

export type WebhookDeliveryWhereInput = {
  readonly AND?: ReadonlyArray<WebhookDeliveryWhereInput> | WebhookDeliveryWhereInput | null
  readonly OR?: ReadonlyArray<WebhookDeliveryWhereInput> | WebhookDeliveryWhereInput | null
  readonly NOT?: ReadonlyArray<WebhookDeliveryWhereInput> | WebhookDeliveryWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly endpoint?: WebhookEndpointWhereInput | null
  readonly outboxMessage?: OutboxMessageWhereInput | null
  readonly deliveryId?: StringFilter | null
  readonly eventType?: StringFilter | null
  readonly eventVersion?: StringFilter | null
  readonly payloadHash?: StringFilter | null
  readonly signatureKeyId?: StringFilter | null
  readonly status?: WebhookDeliveryStatusTypeNullableFilter | null
  readonly attempts?: IntNullableFilter | null
  readonly availableAt?: DateTimeFilter | null
  readonly deliveredAt?: DateTimeNullableFilter | null
  readonly lastResponseCode?: IntNullableFilter | null
  readonly lastError?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WebhookDeliveryStatusTypeNullableFilter = {
  readonly equals?: WebhookDeliveryStatusType | null
  readonly in?: ReadonlyArray<WebhookDeliveryStatusType> | WebhookDeliveryStatusType | null
  readonly notIn?: ReadonlyArray<WebhookDeliveryStatusType> | WebhookDeliveryStatusType | null
  readonly not?: WebhookDeliveryStatusTypeNullableFilter | null
}

export type WebhookDeliveryOrderByInput = {
  readonly id?: OrderDirection | null
  readonly deliveryId?: OrderDirection | null
  readonly eventType?: OrderDirection | null
  readonly eventVersion?: OrderDirection | null
  readonly payloadHash?: OrderDirection | null
  readonly signatureKeyId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly attempts?: OrderDirection | null
  readonly availableAt?: OrderDirection | null
  readonly deliveredAt?: OrderDirection | null
  readonly lastResponseCode?: OrderDirection | null
  readonly lastError?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WebhookDeliveryUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly endpoint?: WebhookEndpointRelateToOneForUpdateInput | null
  readonly outboxMessage?: OutboxMessageRelateToOneForUpdateInput | null
  readonly deliveryId?: string | null
  readonly eventType?: string | null
  readonly eventVersion?: string | null
  readonly payloadHash?: string | null
  readonly signatureKeyId?: string | null
  readonly status?: WebhookDeliveryStatusType | null
  readonly attempts?: number | null
  readonly availableAt?: any | null
  readonly deliveredAt?: any | null
  readonly lastResponseCode?: number | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookEndpointRelateToOneForUpdateInput = {
  readonly create?: WebhookEndpointCreateInput | null
  readonly connect?: WebhookEndpointWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type OutboxMessageRelateToOneForUpdateInput = {
  readonly create?: OutboxMessageCreateInput | null
  readonly connect?: OutboxMessageWhereUniqueInput | null
  readonly disconnect?: boolean | null
}

export type WebhookDeliveryUpdateArgs = {
  readonly where: WebhookDeliveryWhereUniqueInput
  readonly data: WebhookDeliveryUpdateInput
}

export type WebhookDeliveryCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly endpoint?: WebhookEndpointRelateToOneForCreateInput | null
  readonly outboxMessage?: OutboxMessageRelateToOneForCreateInput | null
  readonly deliveryId?: string | null
  readonly eventType?: string | null
  readonly eventVersion?: string | null
  readonly payloadHash?: string | null
  readonly signatureKeyId?: string | null
  readonly status?: WebhookDeliveryStatusType | null
  readonly attempts?: number | null
  readonly availableAt?: any | null
  readonly deliveredAt?: any | null
  readonly lastResponseCode?: number | null
  readonly lastError?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookEndpointRelateToOneForCreateInput = {
  readonly create?: WebhookEndpointCreateInput | null
  readonly connect?: WebhookEndpointWhereUniqueInput | null
}

export type OutboxMessageRelateToOneForCreateInput = {
  readonly create?: OutboxMessageCreateInput | null
  readonly connect?: OutboxMessageWhereUniqueInput | null
}

export type WebhookEndpointStatusType =
  | 'PENDING'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'DISABLED'

export type WebhookEndpointWhereUniqueInput = {
  readonly id?: string | null
}

export type WebhookEndpointWhereInput = {
  readonly AND?: ReadonlyArray<WebhookEndpointWhereInput> | WebhookEndpointWhereInput | null
  readonly OR?: ReadonlyArray<WebhookEndpointWhereInput> | WebhookEndpointWhereInput | null
  readonly NOT?: ReadonlyArray<WebhookEndpointWhereInput> | WebhookEndpointWhereInput | null
  readonly id?: IDFilter | null
  readonly tenant?: TenantWhereInput | null
  readonly name?: StringFilter | null
  readonly url?: StringFilter | null
  readonly secretReference?: StringFilter | null
  readonly status?: WebhookEndpointStatusTypeNullableFilter | null
  readonly failureCount?: IntNullableFilter | null
  readonly disabledAt?: DateTimeNullableFilter | null
  readonly approvalRequest?: ApprovalRequestWhereInput | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WebhookEndpointStatusTypeNullableFilter = {
  readonly equals?: WebhookEndpointStatusType | null
  readonly in?: ReadonlyArray<WebhookEndpointStatusType> | WebhookEndpointStatusType | null
  readonly notIn?: ReadonlyArray<WebhookEndpointStatusType> | WebhookEndpointStatusType | null
  readonly not?: WebhookEndpointStatusTypeNullableFilter | null
}

export type WebhookEndpointOrderByInput = {
  readonly id?: OrderDirection | null
  readonly name?: OrderDirection | null
  readonly url?: OrderDirection | null
  readonly secretReference?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly failureCount?: OrderDirection | null
  readonly disabledAt?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WebhookEndpointUpdateInput = {
  readonly tenant?: TenantRelateToOneForUpdateInput | null
  readonly name?: string | null
  readonly url?: string | null
  readonly secretReference?: string | null
  readonly eventTypes?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: WebhookEndpointStatusType | null
  readonly failureCount?: number | null
  readonly disabledAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForUpdateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WebhookEndpointUpdateArgs = {
  readonly where: WebhookEndpointWhereUniqueInput
  readonly data: WebhookEndpointUpdateInput
}

export type WebhookEndpointCreateInput = {
  readonly tenant?: TenantRelateToOneForCreateInput | null
  readonly name?: string | null
  readonly url?: string | null
  readonly secretReference?: string | null
  readonly eventTypes?: import('@keystone-6/core/types').JSONValue | null
  readonly status?: WebhookEndpointStatusType | null
  readonly failureCount?: number | null
  readonly disabledAt?: any | null
  readonly approvalRequest?: ApprovalRequestRelateToOneForCreateInput | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WorkerHeartbeatStatusType =
  | 'STARTING'
  | 'READY'
  | 'STOPPING'
  | 'STOPPED'

export type WorkerHeartbeatWhereUniqueInput = {
  readonly id?: string | null
  readonly workerId?: string | null
}

export type WorkerHeartbeatWhereInput = {
  readonly AND?: ReadonlyArray<WorkerHeartbeatWhereInput> | WorkerHeartbeatWhereInput | null
  readonly OR?: ReadonlyArray<WorkerHeartbeatWhereInput> | WorkerHeartbeatWhereInput | null
  readonly NOT?: ReadonlyArray<WorkerHeartbeatWhereInput> | WorkerHeartbeatWhereInput | null
  readonly id?: IDFilter | null
  readonly workerId?: StringFilter | null
  readonly status?: WorkerHeartbeatStatusTypeNullableFilter | null
  readonly startedAt?: DateTimeFilter | null
  readonly heartbeatAt?: DateTimeFilter | null
  readonly stoppedAt?: DateTimeNullableFilter | null
  readonly buildVersion?: StringFilter | null
  readonly createdAt?: DateTimeFilter | null
  readonly updatedAt?: DateTimeFilter | null
}

export type WorkerHeartbeatStatusTypeNullableFilter = {
  readonly equals?: WorkerHeartbeatStatusType | null
  readonly in?: ReadonlyArray<WorkerHeartbeatStatusType> | WorkerHeartbeatStatusType | null
  readonly notIn?: ReadonlyArray<WorkerHeartbeatStatusType> | WorkerHeartbeatStatusType | null
  readonly not?: WorkerHeartbeatStatusTypeNullableFilter | null
}

export type WorkerHeartbeatOrderByInput = {
  readonly id?: OrderDirection | null
  readonly workerId?: OrderDirection | null
  readonly status?: OrderDirection | null
  readonly startedAt?: OrderDirection | null
  readonly heartbeatAt?: OrderDirection | null
  readonly stoppedAt?: OrderDirection | null
  readonly buildVersion?: OrderDirection | null
  readonly createdAt?: OrderDirection | null
  readonly updatedAt?: OrderDirection | null
}

export type WorkerHeartbeatUpdateInput = {
  readonly workerId?: string | null
  readonly status?: WorkerHeartbeatStatusType | null
  readonly startedAt?: any | null
  readonly heartbeatAt?: any | null
  readonly stoppedAt?: any | null
  readonly buildVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type WorkerHeartbeatUpdateArgs = {
  readonly where: WorkerHeartbeatWhereUniqueInput
  readonly data: WorkerHeartbeatUpdateInput
}

export type WorkerHeartbeatCreateInput = {
  readonly workerId?: string | null
  readonly status?: WorkerHeartbeatStatusType | null
  readonly startedAt?: any | null
  readonly heartbeatAt?: any | null
  readonly stoppedAt?: any | null
  readonly buildVersion?: string | null
  readonly createdAt?: any | null
  readonly updatedAt?: any | null
}

export type KeystoneAdminUIFieldMetaIsNonNull =
  | 'read'
  | 'create'
  | 'update'

export type KeystoneAdminUIFieldMetaItemViewFieldPosition =
  | 'form'
  | 'sidebar'

export type KeystoneAdminUIFieldMetaListViewFieldMode =
  | 'read'
  | 'hidden'

export type KeystoneAdminUIActionMetaItemViewNavigation =
  | 'follow'
  | 'refetch'
  | 'return'

export type KeystoneAdminUISortDirection =
  | 'ASC'
  | 'DESC'

type ResolvedUserCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.UserCreateInput['id']
  name?: import('../prisma/client/client.js').Prisma.UserCreateInput['name']
  email?: import('../prisma/client/client.js').Prisma.UserCreateInput['email']
  passwordResetToken?: import('../prisma/client/client.js').Prisma.UserCreateInput['passwordResetToken']
  passwordResetIssuedAt?: import('../prisma/client/client.js').Prisma.UserCreateInput['passwordResetIssuedAt']
  passwordResetRedeemedAt?: import('../prisma/client/client.js').Prisma.UserCreateInput['passwordResetRedeemedAt']
  operatorMfaEnabled?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaEnabled']
  operatorMfaSecret?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaSecret']
  operatorMfaRecoveryHashes?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaRecoveryHashes']
  operatorMfaFailedAttempts?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaFailedAttempts']
  operatorMfaLockedUntil?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaLockedUntil']
  operatorMfaEnrolledAt?: import('../prisma/client/client.js').Prisma.UserCreateInput['operatorMfaEnrolledAt']
  password: import('../prisma/client/client.js').Prisma.UserCreateInput['password']
  tenant?: import('../prisma/client/client.js').Prisma.UserCreateInput['tenant']
  createdAt?: import('../prisma/client/client.js').Prisma.UserCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.UserCreateInput['updatedAt']
  onboardingStatus?: import('../prisma/client/client.js').Prisma.UserCreateInput['onboardingStatus']
  role?: import('../prisma/client/client.js').Prisma.UserCreateInput['role']
}
type ResolvedUserUpdateInput = {
  id?: undefined
  name?: import('../prisma/client/client.js').Prisma.UserUpdateInput['name']
  email?: import('../prisma/client/client.js').Prisma.UserUpdateInput['email']
  passwordResetToken?: import('../prisma/client/client.js').Prisma.UserUpdateInput['passwordResetToken']
  passwordResetIssuedAt?: import('../prisma/client/client.js').Prisma.UserUpdateInput['passwordResetIssuedAt']
  passwordResetRedeemedAt?: import('../prisma/client/client.js').Prisma.UserUpdateInput['passwordResetRedeemedAt']
  operatorMfaEnabled?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaEnabled']
  operatorMfaSecret?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaSecret']
  operatorMfaRecoveryHashes?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaRecoveryHashes']
  operatorMfaFailedAttempts?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaFailedAttempts']
  operatorMfaLockedUntil?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaLockedUntil']
  operatorMfaEnrolledAt?: import('../prisma/client/client.js').Prisma.UserUpdateInput['operatorMfaEnrolledAt']
  password?: import('../prisma/client/client.js').Prisma.UserUpdateInput['password']
  tenant?: import('../prisma/client/client.js').Prisma.UserUpdateInput['tenant']
  createdAt?: import('../prisma/client/client.js').Prisma.UserUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.UserUpdateInput['updatedAt']
  onboardingStatus?: import('../prisma/client/client.js').Prisma.UserUpdateInput['onboardingStatus']
  role?: import('../prisma/client/client.js').Prisma.UserUpdateInput['role']
}
type ResolvedRoleCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RoleCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RoleCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.RoleCreateInput['name']
  canSeeOtherPeople?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canSeeOtherPeople']
  canEditOtherPeople?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canEditOtherPeople']
  canManagePeople?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManagePeople']
  canManageRoles?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageRoles']
  canAccessDashboard?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canAccessDashboard']
  canManageSportsbook?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageSportsbook']
  canTrade?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canTrade']
  canManageRisk?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageRisk']
  canManageCompliance?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageCompliance']
  canManageFinance?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageFinance']
  canManageIntegrations?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canManageIntegrations']
  canApproveSensitiveActions?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canApproveSensitiveActions']
  canReadAudit?: import('../prisma/client/client.js').Prisma.RoleCreateInput['canReadAudit']
  createdAt?: import('../prisma/client/client.js').Prisma.RoleCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RoleCreateInput['updatedAt']
  assignedTo?: import('../prisma/client/client.js').Prisma.RoleCreateInput['assignedTo']
}
type ResolvedRoleUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['name']
  canSeeOtherPeople?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canSeeOtherPeople']
  canEditOtherPeople?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canEditOtherPeople']
  canManagePeople?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManagePeople']
  canManageRoles?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageRoles']
  canAccessDashboard?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canAccessDashboard']
  canManageSportsbook?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageSportsbook']
  canTrade?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canTrade']
  canManageRisk?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageRisk']
  canManageCompliance?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageCompliance']
  canManageFinance?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageFinance']
  canManageIntegrations?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canManageIntegrations']
  canApproveSensitiveActions?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canApproveSensitiveActions']
  canReadAudit?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['canReadAudit']
  createdAt?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['updatedAt']
  assignedTo?: import('../prisma/client/client.js').Prisma.RoleUpdateInput['assignedTo']
}
type ResolvedAcceptanceDecisionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['wager']
  quote?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['quote']
  accepted?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['accepted']
  rejectionCode?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['rejectionCode']
  gateResults?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['gateResults']
  inputHash?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionCreateInput['updatedAt']
}
type ResolvedAcceptanceDecisionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['wager']
  quote?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['quote']
  accepted?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['accepted']
  rejectionCode?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['rejectionCode']
  gateResults?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['gateResults']
  inputHash?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AcceptanceDecisionUpdateInput['updatedAt']
}
type ResolvedAuditEventCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['tenant']
  actorId?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['actorId']
  action?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['action']
  targetType?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['targetId']
  reason?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['reason']
  payloadHash?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['payloadHash']
  previousHash?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['previousHash']
  hash?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['hash']
  createdAt?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AuditEventCreateInput['updatedAt']
}
type ResolvedAuditEventUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['tenant']
  actorId?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['actorId']
  action?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['action']
  targetType?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['targetId']
  reason?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['reason']
  payloadHash?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['payloadHash']
  previousHash?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['previousHash']
  hash?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['hash']
  createdAt?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AuditEventUpdateInput['updatedAt']
}
type ResolvedBrandCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BrandCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BrandCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.BrandCreateInput['name']
  domain?: import('../prisma/client/client.js').Prisma.BrandCreateInput['domain']
  defaultLocale?: import('../prisma/client/client.js').Prisma.BrandCreateInput['defaultLocale']
  defaultTimezone?: import('../prisma/client/client.js').Prisma.BrandCreateInput['defaultTimezone']
  supportedLocales?: import('../prisma/client/client.js').Prisma.BrandCreateInput['supportedLocales']
  designTokens?: import('../prisma/client/client.js').Prisma.BrandCreateInput['designTokens']
  termsReference?: import('../prisma/client/client.js').Prisma.BrandCreateInput['termsReference']
  logoIcon?: import('../prisma/client/client.js').Prisma.BrandCreateInput['logoIcon']
  logoColor?: import('../prisma/client/client.js').Prisma.BrandCreateInput['logoColor']
  status?: import('../prisma/client/client.js').Prisma.BrandCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.BrandCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BrandCreateInput['updatedAt']
}
type ResolvedBrandUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['name']
  domain?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['domain']
  defaultLocale?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['defaultLocale']
  defaultTimezone?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['defaultTimezone']
  supportedLocales?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['supportedLocales']
  designTokens?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['designTokens']
  termsReference?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['termsReference']
  logoIcon?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['logoIcon']
  logoColor?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['logoColor']
  status?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BrandUpdateInput['updatedAt']
}
type ResolvedCompetitionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['tenant']
  sport?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['sport']
  region?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['region']
  key?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['name']
  timezone?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['timezone']
  status?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitionCreateInput['updatedAt']
}
type ResolvedCompetitionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['tenant']
  sport?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['sport']
  region?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['region']
  key?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['name']
  timezone?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['timezone']
  status?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitionUpdateInput['updatedAt']
}
type ResolvedDeadLetterCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['tenant']
  sourceType?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['sourceType']
  sourceId?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['sourceId']
  reason?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['reason']
  attempts?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['attempts']
  payloadReference?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['payloadReference']
  resolvedAt?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DeadLetterCreateInput['updatedAt']
}
type ResolvedDeadLetterUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['tenant']
  sourceType?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['sourceType']
  sourceId?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['sourceId']
  reason?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['reason']
  attempts?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['attempts']
  payloadReference?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['payloadReference']
  resolvedAt?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DeadLetterUpdateInput['updatedAt']
}
type ResolvedEventCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.EventCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.EventCreateInput['tenant']
  competition?: import('../prisma/client/client.js').Prisma.EventCreateInput['competition']
  season?: import('../prisma/client/client.js').Prisma.EventCreateInput['season']
  stage?: import('../prisma/client/client.js').Prisma.EventCreateInput['stage']
  venue?: import('../prisma/client/client.js').Prisma.EventCreateInput['venue']
  externalKey?: import('../prisma/client/client.js').Prisma.EventCreateInput['externalKey']
  name?: import('../prisma/client/client.js').Prisma.EventCreateInput['name']
  startAt: import('../prisma/client/client.js').Prisma.EventCreateInput['startAt']
  status?: import('../prisma/client/client.js').Prisma.EventCreateInput['status']
  livePhase?: import('../prisma/client/client.js').Prisma.EventCreateInput['livePhase']
  clockSeconds?: import('../prisma/client/client.js').Prisma.EventCreateInput['clockSeconds']
  officialResultStatus?: import('../prisma/client/client.js').Prisma.EventCreateInput['officialResultStatus']
  version?: import('../prisma/client/client.js').Prisma.EventCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.EventCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventCreateInput['updatedAt']
}
type ResolvedEventUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.EventUpdateInput['tenant']
  competition?: import('../prisma/client/client.js').Prisma.EventUpdateInput['competition']
  season?: import('../prisma/client/client.js').Prisma.EventUpdateInput['season']
  stage?: import('../prisma/client/client.js').Prisma.EventUpdateInput['stage']
  venue?: import('../prisma/client/client.js').Prisma.EventUpdateInput['venue']
  externalKey?: import('../prisma/client/client.js').Prisma.EventUpdateInput['externalKey']
  name?: import('../prisma/client/client.js').Prisma.EventUpdateInput['name']
  startAt?: import('../prisma/client/client.js').Prisma.EventUpdateInput['startAt']
  status?: import('../prisma/client/client.js').Prisma.EventUpdateInput['status']
  livePhase?: import('../prisma/client/client.js').Prisma.EventUpdateInput['livePhase']
  clockSeconds?: import('../prisma/client/client.js').Prisma.EventUpdateInput['clockSeconds']
  officialResultStatus?: import('../prisma/client/client.js').Prisma.EventUpdateInput['officialResultStatus']
  version?: import('../prisma/client/client.js').Prisma.EventUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.EventUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventUpdateInput['updatedAt']
}
type ResolvedHoldCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.HoldCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.HoldCreateInput['tenant']
  account?: import('../prisma/client/client.js').Prisma.HoldCreateInput['account']
  purposeType?: import('../prisma/client/client.js').Prisma.HoldCreateInput['purposeType']
  purposeId?: import('../prisma/client/client.js').Prisma.HoldCreateInput['purposeId']
  amountMinor?: import('../prisma/client/client.js').Prisma.HoldCreateInput['amountMinor']
  status?: import('../prisma/client/client.js').Prisma.HoldCreateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.HoldCreateInput['expiresAt']
  version?: import('../prisma/client/client.js').Prisma.HoldCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.HoldCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.HoldCreateInput['updatedAt']
}
type ResolvedHoldUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['tenant']
  account?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['account']
  purposeType?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['purposeType']
  purposeId?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['purposeId']
  amountMinor?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['amountMinor']
  status?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['expiresAt']
  version?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.HoldUpdateInput['updatedAt']
}
type ResolvedInboxMessageCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['tenant']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['rawEnvelope']
  messageKey?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['messageKey']
  type?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['attempts']
  availableAt?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['availableAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['leaseOwner']
  lastError?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.InboxMessageCreateInput['updatedAt']
}
type ResolvedInboxMessageUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['tenant']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['rawEnvelope']
  messageKey?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['messageKey']
  type?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['attempts']
  availableAt?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['availableAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['leaseOwner']
  lastError?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.InboxMessageUpdateInput['updatedAt']
}
type ResolvedJournalEntryCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['tenant']
  transaction?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['transaction']
  account?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['account']
  side?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['side']
  amountMinor?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['currency']
  createdAt?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JournalEntryCreateInput['updatedAt']
}
type ResolvedJournalEntryUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['tenant']
  transaction?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['transaction']
  account?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['account']
  side?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['side']
  amountMinor?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['currency']
  createdAt?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JournalEntryUpdateInput['updatedAt']
}
type ResolvedJournalTransactionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['type']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['idempotencyKey']
  correlationId?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['correlationId']
  status?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['status']
  reversalOf?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['reversalOf']
  effectiveAt: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JournalTransactionCreateInput['updatedAt']
}
type ResolvedJournalTransactionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['type']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['idempotencyKey']
  correlationId?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['correlationId']
  status?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['status']
  reversalOf?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['reversalOf']
  effectiveAt?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JournalTransactionUpdateInput['updatedAt']
}
type ResolvedJurisdictionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['id']
  code?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['code']
  authority?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['authority']
  status?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JurisdictionCreateInput['updatedAt']
}
type ResolvedJurisdictionUpdateInput = {
  id?: undefined
  code?: import('../prisma/client/client.js').Prisma.JurisdictionUpdateInput['code']
  authority?: import('../prisma/client/client.js').Prisma.JurisdictionUpdateInput['authority']
  status?: import('../prisma/client/client.js').Prisma.JurisdictionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.JurisdictionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JurisdictionUpdateInput['updatedAt']
}
type ResolvedLedgerAccountCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['player']
  key?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['key']
  accountClass?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['accountClass']
  currency?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LedgerAccountCreateInput['updatedAt']
}
type ResolvedLedgerAccountUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['player']
  key?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['key']
  accountClass?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['accountClass']
  currency?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LedgerAccountUpdateInput['updatedAt']
}
type ResolvedMarketCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.MarketCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.MarketCreateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.MarketCreateInput['event']
  definition?: import('../prisma/client/client.js').Prisma.MarketCreateInput['definition']
  definitionKey?: import('../prisma/client/client.js').Prisma.MarketCreateInput['definitionKey']
  parameters?: import('../prisma/client/client.js').Prisma.MarketCreateInput['parameters']
  tradingMode?: import('../prisma/client/client.js').Prisma.MarketCreateInput['tradingMode']
  line?: import('../prisma/client/client.js').Prisma.MarketCreateInput['line']
  marginBasisPoints?: import('../prisma/client/client.js').Prisma.MarketCreateInput['marginBasisPoints']
  cashOutEnabled?: import('../prisma/client/client.js').Prisma.MarketCreateInput['cashOutEnabled']
  status?: import('../prisma/client/client.js').Prisma.MarketCreateInput['status']
  version?: import('../prisma/client/client.js').Prisma.MarketCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketCreateInput['updatedAt']
}
type ResolvedMarketUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['event']
  definition?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['definition']
  definitionKey?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['definitionKey']
  parameters?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['parameters']
  tradingMode?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['tradingMode']
  line?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['line']
  marginBasisPoints?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['marginBasisPoints']
  cashOutEnabled?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['cashOutEnabled']
  status?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['status']
  version?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketUpdateInput['updatedAt']
}
type ResolvedOperatorJurisdictionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['jurisdiction']
  licenseReference?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['licenseReference']
  policyVersion?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['policyVersion']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionCreateInput['updatedAt']
}
type ResolvedOperatorJurisdictionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['jurisdiction']
  licenseReference?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['licenseReference']
  policyVersion?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['policyVersion']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OperatorJurisdictionUpdateInput['updatedAt']
}
type ResolvedOutboxMessageCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['tenant']
  aggregateType?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['aggregateType']
  aggregateId?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['aggregateId']
  eventType?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['eventType']
  payload?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['attempts']
  maxAttempts?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['maxAttempts']
  availableAt?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['availableAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['leaseOwner']
  lastError?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OutboxMessageCreateInput['updatedAt']
}
type ResolvedOutboxMessageUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['tenant']
  aggregateType?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['aggregateType']
  aggregateId?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['aggregateId']
  eventType?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['eventType']
  payload?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['attempts']
  maxAttempts?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['maxAttempts']
  availableAt?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['availableAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['leaseOwner']
  lastError?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OutboxMessageUpdateInput['updatedAt']
}
type ResolvedPlayerCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['tenant']
  brand?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['brand']
  subject?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['subject']
  status?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['status']
  kycStatus?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['kycStatus']
  locale?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['locale']
  timezone?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['timezone']
  preferredOddsFormat?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['preferredOddsFormat']
  marketingAllowed?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['marketingAllowed']
  riskBand?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['riskBand']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerCreateInput['updatedAt']
}
type ResolvedPlayerUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['tenant']
  brand?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['brand']
  subject?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['subject']
  status?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['status']
  kycStatus?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['kycStatus']
  locale?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['locale']
  timezone?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['timezone']
  preferredOddsFormat?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['preferredOddsFormat']
  marketingAllowed?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['marketingAllowed']
  riskBand?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['riskBand']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerUpdateInput['updatedAt']
}
type ResolvedPlayerLimitCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['player']
  type?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['type']
  period?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['period']
  amountMinor?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['currency']
  effectiveFrom: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerLimitCreateInput['updatedAt']
}
type ResolvedPlayerLimitUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['player']
  type?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['type']
  period?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['period']
  amountMinor?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['currency']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerLimitUpdateInput['updatedAt']
}
type ResolvedPriceSnapshotCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['tenant']
  selection?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['selection']
  providerConnection?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['providerConnection']
  decimalOdds?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['line']
  sequence?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['sequence']
  effectiveAt: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['effectiveAt']
  receivedAt: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['receivedAt']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['rawEnvelope']
  status?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotCreateInput['updatedAt']
}
type ResolvedPriceSnapshotUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['tenant']
  selection?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['selection']
  providerConnection?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['providerConnection']
  decimalOdds?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['line']
  sequence?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['sequence']
  effectiveAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['effectiveAt']
  receivedAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['receivedAt']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['rawEnvelope']
  status?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PriceSnapshotUpdateInput['updatedAt']
}
type ResolvedProviderConnectionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['legalEntity']
  jurisdiction?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['jurisdiction']
  adapterId?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['adapterId']
  adapterVersion?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['adapterVersion']
  configReference?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['configReference']
  secretReference?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['secretReference']
  dataResidencyRegion?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['dataResidencyRegion']
  failoverPriority?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['failoverPriority']
  capabilities?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['capabilities']
  certificationStatus?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['certificationStatus']
  status?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderConnectionCreateInput['updatedAt']
}
type ResolvedProviderConnectionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['legalEntity']
  jurisdiction?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['jurisdiction']
  adapterId?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['adapterId']
  adapterVersion?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['adapterVersion']
  configReference?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['configReference']
  secretReference?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['secretReference']
  dataResidencyRegion?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['dataResidencyRegion']
  failoverPriority?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['failoverPriority']
  capabilities?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['capabilities']
  certificationStatus?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['certificationStatus']
  status?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderConnectionUpdateInput['updatedAt']
}
type ResolvedQuoteCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['player']
  selection?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['selection']
  priceSnapshot?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['priceSnapshot']
  structure?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['structure']
  promotion?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['promotion']
  legCount?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['legCount']
  partCount?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['partCount']
  stakeMinor?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['potentialReturnMinor']
  currency?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['currency']
  decimalOdds?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['decimalOdds']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['liveDelayMs']
  expiresAt: import('../prisma/client/client.js').Prisma.QuoteCreateInput['expiresAt']
  termsHash?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['termsHash']
  policyVersion?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['policyVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.QuoteCreateInput['updatedAt']
}
type ResolvedQuoteUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['player']
  selection?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['selection']
  priceSnapshot?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['priceSnapshot']
  structure?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['structure']
  promotion?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['promotion']
  legCount?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['legCount']
  partCount?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['partCount']
  stakeMinor?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['potentialReturnMinor']
  currency?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['currency']
  decimalOdds?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['decimalOdds']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['liveDelayMs']
  expiresAt?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['expiresAt']
  termsHash?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['termsHash']
  policyVersion?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['policyVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.QuoteUpdateInput['updatedAt']
}
type ResolvedRawEnvelopeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['providerConnection']
  direction?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['direction']
  externalId?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['externalId']
  schemaVersion?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['schemaVersion']
  installationRevision?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['installationRevision']
  payload?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['payload']
  payloadHash?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['payloadHash']
  receivedAt: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['receivedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RawEnvelopeCreateInput['updatedAt']
}
type ResolvedRawEnvelopeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['providerConnection']
  direction?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['direction']
  externalId?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['externalId']
  schemaVersion?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['schemaVersion']
  installationRevision?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['installationRevision']
  payload?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['payload']
  payloadHash?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['payloadHash']
  receivedAt?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['receivedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RawEnvelopeUpdateInput['updatedAt']
}
type ResolvedResultVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['event']
  providerConnection?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['providerConnection']
  version: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['version']
  status?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['status']
  payload?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['payload']
  payloadHash?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['payloadHash']
  approvedAt?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['approvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ResultVersionCreateInput['updatedAt']
}
type ResolvedResultVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['event']
  providerConnection?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['providerConnection']
  version?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['version']
  status?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['status']
  payload?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['payload']
  payloadHash?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['payloadHash']
  approvedAt?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['approvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ResultVersionUpdateInput['updatedAt']
}
type ResolvedSelectionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['tenant']
  market?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['market']
  key?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['key']
  label?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['label']
  status?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SelectionCreateInput['updatedAt']
}
type ResolvedSelectionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['tenant']
  market?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['market']
  key?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['key']
  label?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['label']
  status?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SelectionUpdateInput['updatedAt']
}
type ResolvedSelfExclusionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['player']
  scope?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['scope']
  startsAt: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['status']
  source?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['source']
  createdAt?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SelfExclusionCreateInput['updatedAt']
}
type ResolvedSelfExclusionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['player']
  scope?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['scope']
  startsAt?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['status']
  source?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['source']
  createdAt?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SelfExclusionUpdateInput['updatedAt']
}
type ResolvedSettlementCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['wager']
  resultVersion?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['resultVersion']
  settlementRun?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['settlementRun']
  version: import('../prisma/client/client.js').Prisma.SettlementCreateInput['version']
  outcome?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['outcome']
  grossPayoutMinor?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['grossPayoutMinor']
  taxMinor?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['taxMinor']
  payoutMinor?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['payoutMinor']
  inputHash?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['inputHash']
  journalTransaction?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['journalTransaction']
  reversalOf?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['reversalOf']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementCreateInput['updatedAt']
}
type ResolvedSettlementUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['wager']
  resultVersion?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['resultVersion']
  settlementRun?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['settlementRun']
  version?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['version']
  outcome?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['outcome']
  grossPayoutMinor?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['grossPayoutMinor']
  taxMinor?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['taxMinor']
  payoutMinor?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['payoutMinor']
  inputHash?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['inputHash']
  journalTransaction?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['journalTransaction']
  reversalOf?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['reversalOf']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementUpdateInput['updatedAt']
}
type ResolvedSportCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SportCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SportCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.SportCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.SportCreateInput['name']
  active?: import('../prisma/client/client.js').Prisma.SportCreateInput['active']
  createdAt?: import('../prisma/client/client.js').Prisma.SportCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SportCreateInput['updatedAt']
}
type ResolvedSportUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SportUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.SportUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.SportUpdateInput['name']
  active?: import('../prisma/client/client.js').Prisma.SportUpdateInput['active']
  createdAt?: import('../prisma/client/client.js').Prisma.SportUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SportUpdateInput['updatedAt']
}
type ResolvedTenantCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TenantCreateInput['id']
  name?: import('../prisma/client/client.js').Prisma.TenantCreateInput['name']
  slug?: import('../prisma/client/client.js').Prisma.TenantCreateInput['slug']
  status?: import('../prisma/client/client.js').Prisma.TenantCreateInput['status']
  defaultTimezone?: import('../prisma/client/client.js').Prisma.TenantCreateInput['defaultTimezone']
  supportedLocales?: import('../prisma/client/client.js').Prisma.TenantCreateInput['supportedLocales']
  dataResidencyRegion?: import('../prisma/client/client.js').Prisma.TenantCreateInput['dataResidencyRegion']
  createdAt?: import('../prisma/client/client.js').Prisma.TenantCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TenantCreateInput['updatedAt']
}
type ResolvedTenantUpdateInput = {
  id?: undefined
  name?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['name']
  slug?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['slug']
  status?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['status']
  defaultTimezone?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['defaultTimezone']
  supportedLocales?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['supportedLocales']
  dataResidencyRegion?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['dataResidencyRegion']
  createdAt?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TenantUpdateInput['updatedAt']
}
type ResolvedWagerCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WagerCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WagerCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.WagerCreateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.WagerCreateInput['quote']
  legalEntity?: import('../prisma/client/client.js').Prisma.WagerCreateInput['legalEntity']
  operatorJurisdiction?: import('../prisma/client/client.js').Prisma.WagerCreateInput['operatorJurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.WagerCreateInput['brand']
  channel?: import('../prisma/client/client.js').Prisma.WagerCreateInput['channel']
  structure?: import('../prisma/client/client.js').Prisma.WagerCreateInput['structure']
  promotion?: import('../prisma/client/client.js').Prisma.WagerCreateInput['promotion']
  bonusAward?: import('../prisma/client/client.js').Prisma.WagerCreateInput['bonusAward']
  version?: import('../prisma/client/client.js').Prisma.WagerCreateInput['version']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.WagerCreateInput['idempotencyKey']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerCreateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.WagerCreateInput['potentialReturnMinor']
  maxPayoutMinor?: import('../prisma/client/client.js').Prisma.WagerCreateInput['maxPayoutMinor']
  currency?: import('../prisma/client/client.js').Prisma.WagerCreateInput['currency']
  termsHash?: import('../prisma/client/client.js').Prisma.WagerCreateInput['termsHash']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.WagerCreateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.WagerCreateInput['liveDelayMs']
  requestedAt?: import('../prisma/client/client.js').Prisma.WagerCreateInput['requestedAt']
  status?: import('../prisma/client/client.js').Prisma.WagerCreateInput['status']
  acceptedAt?: import('../prisma/client/client.js').Prisma.WagerCreateInput['acceptedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerCreateInput['updatedAt']
}
type ResolvedWagerUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['quote']
  legalEntity?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['legalEntity']
  operatorJurisdiction?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['operatorJurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['brand']
  channel?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['channel']
  structure?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['structure']
  promotion?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['promotion']
  bonusAward?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['bonusAward']
  version?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['version']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['idempotencyKey']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['potentialReturnMinor']
  maxPayoutMinor?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['maxPayoutMinor']
  currency?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['currency']
  termsHash?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['termsHash']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['liveDelayMs']
  requestedAt?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['requestedAt']
  status?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['status']
  acceptedAt?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['acceptedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerUpdateInput['updatedAt']
}
type ResolvedWagerLegCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['wager']
  wagerPart?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['wagerPart']
  legIndex?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['legIndex']
  eventKey?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['eventKey']
  marketKey?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['marketKey']
  selectionKey?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['selectionKey']
  snapshotId?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['snapshotId']
  decimalOdds?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['line']
  ruleVersion?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['ruleVersion']
  correlationGroupKey?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['correlationGroupKey']
  live?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['live']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerLegCreateInput['updatedAt']
}
type ResolvedWagerLegUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['wager']
  wagerPart?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['wagerPart']
  legIndex?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['legIndex']
  eventKey?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['eventKey']
  marketKey?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['marketKey']
  selectionKey?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['selectionKey']
  snapshotId?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['snapshotId']
  decimalOdds?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['line']
  ruleVersion?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['ruleVersion']
  correlationGroupKey?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['correlationGroupKey']
  live?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['live']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerLegUpdateInput['updatedAt']
}
type ResolvedAMLCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['player']
  status?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['status']
  riskBand?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['riskBand']
  restrictedEvidence?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['restrictedEvidence']
  ownerId?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['ownerId']
  createdAt?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AMLCaseCreateInput['updatedAt']
}
type ResolvedAMLCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['player']
  status?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['status']
  riskBand?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['riskBand']
  restrictedEvidence?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['restrictedEvidence']
  ownerId?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['ownerId']
  createdAt?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AMLCaseUpdateInput['updatedAt']
}
type ResolvedAccountRestrictionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['player']
  capability?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['capability']
  reasonCode?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['reasonCode']
  startsAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionCreateInput['updatedAt']
}
type ResolvedAccountRestrictionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['player']
  capability?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['capability']
  reasonCode?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['reasonCode']
  startsAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccountRestrictionUpdateInput['updatedAt']
}
type ResolvedApiRateBucketCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['tenant']
  keyHash?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['keyHash']
  scope?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['scope']
  windowStartedAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['windowStartedAt']
  count?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['count']
  expiresAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketCreateInput['updatedAt']
}
type ResolvedApiRateBucketUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['tenant']
  keyHash?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['keyHash']
  scope?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['scope']
  windowStartedAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['windowStartedAt']
  count?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['count']
  expiresAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ApiRateBucketUpdateInput['updatedAt']
}
type ResolvedApprovalRequestCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['tenant']
  action?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['action']
  payloadHash?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['payloadHash']
  requesterId?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['requesterId']
  approverId?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['approverId']
  status?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['status']
  reason?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['reason']
  decidedAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['decidedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestCreateInput['updatedAt']
}
type ResolvedApprovalRequestUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['tenant']
  action?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['action']
  payloadHash?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['payloadHash']
  requesterId?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['requesterId']
  approverId?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['approverId']
  status?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['status']
  reason?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['reason']
  decidedAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['decidedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ApprovalRequestUpdateInput['updatedAt']
}
type ResolvedAuditAnchorCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['tenant']
  chainHeadHash?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['chainHeadHash']
  eventCount?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['eventCount']
  anchoredAt?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['anchoredAt']
  externalReference?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['externalReference']
  status?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AuditAnchorCreateInput['updatedAt']
}
type ResolvedAuditAnchorUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['tenant']
  chainHeadHash?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['chainHeadHash']
  eventCount?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['eventCount']
  anchoredAt?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['anchoredAt']
  externalReference?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['externalReference']
  status?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AuditAnchorUpdateInput['updatedAt']
}
type ResolvedBalanceProjectionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['tenant']
  account?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['account']
  postedMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['postedMinor']
  pendingMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['pendingMinor']
  availableMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['availableMinor']
  version?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['version']
  asOf?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['asOf']
  createdAt?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BalanceProjectionCreateInput['updatedAt']
}
type ResolvedBalanceProjectionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['tenant']
  account?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['account']
  postedMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['postedMinor']
  pendingMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['pendingMinor']
  availableMinor?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['availableMinor']
  version?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['version']
  asOf?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['asOf']
  createdAt?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BalanceProjectionUpdateInput['updatedAt']
}
type ResolvedBetSlipCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['player']
  currency?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['expiresAt']
  version?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BetSlipCreateInput['updatedAt']
}
type ResolvedBetSlipUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['player']
  currency?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['expiresAt']
  version?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BetSlipUpdateInput['updatedAt']
}
type ResolvedBetSlipItemCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['tenant']
  betSlip?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['betSlip']
  selection?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['selection']
  priceSnapshot?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['priceSnapshot']
  requestedOdds?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['requestedOdds']
  line?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['line']
  createdAt?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BetSlipItemCreateInput['updatedAt']
}
type ResolvedBetSlipItemUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['tenant']
  betSlip?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['betSlip']
  selection?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['selection']
  priceSnapshot?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['priceSnapshot']
  requestedOdds?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['requestedOdds']
  line?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['line']
  createdAt?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BetSlipItemUpdateInput['updatedAt']
}
type ResolvedCashOutOfferCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['wager']
  amountMinor?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['currency']
  portionNumerator?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['portionNumerator']
  portionDenominator?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['portionDenominator']
  feeMinor?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['feeMinor']
  marginBasisPoints?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['marginBasisPoints']
  valuationInputs?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['valuationInputs']
  valuationHash?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['valuationHash']
  wagerVersion?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['wagerVersion']
  offeredAt?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['offeredAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CashOutOfferCreateInput['updatedAt']
}
type ResolvedCashOutOfferUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['wager']
  amountMinor?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['currency']
  portionNumerator?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['portionNumerator']
  portionDenominator?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['portionDenominator']
  feeMinor?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['feeMinor']
  marginBasisPoints?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['marginBasisPoints']
  valuationInputs?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['valuationInputs']
  valuationHash?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['valuationHash']
  wagerVersion?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['wagerVersion']
  offeredAt?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['offeredAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CashOutOfferUpdateInput['updatedAt']
}
type ResolvedCompetitorCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['name']
  status?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitorCreateInput['updatedAt']
}
type ResolvedCompetitorUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['name']
  status?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitorUpdateInput['updatedAt']
}
type ResolvedComplianceReportCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['type']
  periodStart?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['periodStart']
  periodEnd?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['periodEnd']
  version?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['version']
  artifactHash?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['artifactHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['artifactReference']
  status?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['status']
  submittedAt?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['submittedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ComplianceReportCreateInput['updatedAt']
}
type ResolvedComplianceReportUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['type']
  periodStart?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['periodStart']
  periodEnd?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['periodEnd']
  version?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['version']
  artifactHash?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['artifactHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['artifactReference']
  status?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['status']
  submittedAt?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['submittedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ComplianceReportUpdateInput['updatedAt']
}
type ResolvedConfigValueCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['key']
  value?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['value']
  valueType?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['valueType']
  scopeType?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['scopeId']
  policyVersion?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['policyVersion']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConfigValueCreateInput['updatedAt']
}
type ResolvedConfigValueUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['key']
  value?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['value']
  valueType?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['valueType']
  scopeType?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['scopeId']
  policyVersion?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['policyVersion']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConfigValueUpdateInput['updatedAt']
}
type ResolvedConsentCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['player']
  type?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['type']
  policyVersion?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['policyVersion']
  givenAt?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['givenAt']
  withdrawnAt?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['withdrawnAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConsentCreateInput['updatedAt']
}
type ResolvedConsentUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['player']
  type?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['type']
  policyVersion?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['policyVersion']
  givenAt?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['givenAt']
  withdrawnAt?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['withdrawnAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConsentUpdateInput['updatedAt']
}
type ResolvedDataCorrectionCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['scopeId']
  reason?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['reason']
  dryRunHash?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['dryRunHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['approvalRequest']
  status?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseCreateInput['updatedAt']
}
type ResolvedDataCorrectionCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['scopeId']
  reason?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['reason']
  dryRunHash?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['dryRunHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['approvalRequest']
  status?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DataCorrectionCaseUpdateInput['updatedAt']
}
type ResolvedDisputeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['player']
  wager?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['wager']
  category?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['category']
  status?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['status']
  evidence?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['evidence']
  resolution?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['resolution']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['approvalRequest']
  resolvedAt?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DisputeCreateInput['updatedAt']
}
type ResolvedDisputeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['player']
  wager?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['wager']
  category?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['category']
  status?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['status']
  evidence?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['evidence']
  resolution?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['resolution']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['approvalRequest']
  resolvedAt?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DisputeUpdateInput['updatedAt']
}
type ResolvedDisputeEventCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['tenant']
  dispute?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['dispute']
  type?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['type']
  actorId?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['actorId']
  evidenceHash?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['evidenceHash']
  details?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DisputeEventCreateInput['updatedAt']
}
type ResolvedDisputeEventUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['tenant']
  dispute?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['dispute']
  type?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['type']
  actorId?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['actorId']
  evidenceHash?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['evidenceHash']
  details?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DisputeEventUpdateInput['updatedAt']
}
type ResolvedEventParticipantCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['event']
  competitor?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['competitor']
  role?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['role']
  sortOrder?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['sortOrder']
  createdAt?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventParticipantCreateInput['updatedAt']
}
type ResolvedEventParticipantUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['event']
  competitor?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['competitor']
  role?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['role']
  sortOrder?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['sortOrder']
  createdAt?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventParticipantUpdateInput['updatedAt']
}
type ResolvedExposurePositionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['scopeId']
  currency?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['currency']
  stakeMinor?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['stakeMinor']
  liabilityMinor?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['liabilityMinor']
  version?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['version']
  asOf?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['asOf']
  createdAt?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ExposurePositionCreateInput['updatedAt']
}
type ResolvedExposurePositionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['scopeId']
  currency?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['currency']
  stakeMinor?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['stakeMinor']
  liabilityMinor?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['liabilityMinor']
  version?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['version']
  asOf?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['asOf']
  createdAt?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ExposurePositionUpdateInput['updatedAt']
}
type ResolvedGeoCheckCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['tenant']
  geoSession?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['geoSession']
  providerConnection?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['providerConnection']
  decision?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['reasonCode']
  coarseEvidence?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['coarseEvidence']
  checkedAt?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['checkedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.GeoCheckCreateInput['updatedAt']
}
type ResolvedGeoCheckUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['tenant']
  geoSession?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['geoSession']
  providerConnection?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['providerConnection']
  decision?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['reasonCode']
  coarseEvidence?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['coarseEvidence']
  checkedAt?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['checkedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.GeoCheckUpdateInput['updatedAt']
}
type ResolvedGeoSessionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['player']
  sessionKey?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['sessionKey']
  status?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.GeoSessionCreateInput['updatedAt']
}
type ResolvedGeoSessionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['player']
  sessionKey?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['sessionKey']
  status?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['status']
  expiresAt?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.GeoSessionUpdateInput['updatedAt']
}
type ResolvedIncidentCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['tenant']
  severity?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['severity']
  title?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['title']
  status?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['status']
  commanderId?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['commanderId']
  evidence?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['evidence']
  resolvedAt?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IncidentCreateInput['updatedAt']
}
type ResolvedIncidentUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['tenant']
  severity?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['severity']
  title?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['title']
  status?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['status']
  commanderId?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['commanderId']
  evidence?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['evidence']
  resolvedAt?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['resolvedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IncidentUpdateInput['updatedAt']
}
type ResolvedLegGradeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['tenant']
  wagerLeg?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['wagerLeg']
  marketGrade?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['marketGrade']
  outcome?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['outcome']
  factorNumerator?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['factorNumerator']
  factorDenominator?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['factorDenominator']
  inputHash?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegGradeCreateInput['updatedAt']
}
type ResolvedLegGradeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['tenant']
  wagerLeg?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['wagerLeg']
  marketGrade?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['marketGrade']
  outcome?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['outcome']
  factorNumerator?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['factorNumerator']
  factorDenominator?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['factorDenominator']
  inputHash?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegGradeUpdateInput['updatedAt']
}
type ResolvedLegalHoldCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['scopeId']
  reason?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['reason']
  startsAt?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['status']
  approvalRequest?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegalHoldCreateInput['updatedAt']
}
type ResolvedLegalHoldUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['scopeId']
  reason?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['reason']
  startsAt?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['status']
  approvalRequest?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegalHoldUpdateInput['updatedAt']
}
type ResolvedLimitProfileCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['name']
  version?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['version']
  status?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['status']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LimitProfileCreateInput['updatedAt']
}
type ResolvedLimitProfileUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['name']
  version?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['version']
  status?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['status']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['effectiveTo']
  createdAt?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LimitProfileUpdateInput['updatedAt']
}
type ResolvedLimitRuleCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['tenant']
  profile?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['profile']
  scopeType?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['scopeId']
  maxStakeMinor?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['maxStakeMinor']
  maxPayoutMinor?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['maxPayoutMinor']
  maxLiabilityMinor?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['maxLiabilityMinor']
  currency?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['currency']
  priority?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['priority']
  createdAt?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LimitRuleCreateInput['updatedAt']
}
type ResolvedLimitRuleUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['tenant']
  profile?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['profile']
  scopeType?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['scopeId']
  maxStakeMinor?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['maxStakeMinor']
  maxPayoutMinor?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['maxPayoutMinor']
  maxLiabilityMinor?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['maxLiabilityMinor']
  currency?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['currency']
  priority?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['priority']
  createdAt?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LimitRuleUpdateInput['updatedAt']
}
type ResolvedMarketGradeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['tenant']
  market?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['market']
  resultVersion?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['resultVersion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['ruleVersion']
  outcome?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['outcome']
  factorNumerator?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['factorNumerator']
  factorDenominator?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['factorDenominator']
  trace?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['trace']
  inputHash?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketGradeCreateInput['updatedAt']
}
type ResolvedMarketGradeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['tenant']
  market?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['market']
  resultVersion?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['resultVersion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['ruleVersion']
  outcome?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['outcome']
  factorNumerator?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['factorNumerator']
  factorDenominator?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['factorDenominator']
  trace?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['trace']
  inputHash?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['inputHash']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketGradeUpdateInput['updatedAt']
}
type ResolvedOnboardingProgressCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['tenant']
  stage?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['stage']
  status?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['evidenceHash']
  completedAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['completedAt']
  details?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressCreateInput['updatedAt']
}
type ResolvedOnboardingProgressUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['tenant']
  stage?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['stage']
  status?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['evidenceHash']
  completedAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['completedAt']
  details?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OnboardingProgressUpdateInput['updatedAt']
}
type ResolvedPaymentAttemptCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['tenant']
  paymentIntent?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['paymentIntent']
  attempt?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['attempt']
  externalReference?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['externalReference']
  status?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['status']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['rawEnvelope']
  reasonCode?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['reasonCode']
  createdAt?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PaymentAttemptCreateInput['updatedAt']
}
type ResolvedPaymentAttemptUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['tenant']
  paymentIntent?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['paymentIntent']
  attempt?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['attempt']
  externalReference?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['externalReference']
  status?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['status']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['rawEnvelope']
  reasonCode?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['reasonCode']
  createdAt?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PaymentAttemptUpdateInput['updatedAt']
}
type ResolvedPaymentIntentCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['player']
  type?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['type']
  amountMinor?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['amountMinor']
  feeMinor?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['feeMinor']
  currency?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['currency']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['idempotencyKey']
  status?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['status']
  providerConnection?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['providerConnection']
  paymentMethodReference?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['paymentMethodReference']
  providerSessionReference?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['providerSessionReference']
  hold?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['hold']
  riskEvidence?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['riskEvidence']
  completedAt?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PaymentIntentCreateInput['updatedAt']
}
type ResolvedPaymentIntentUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['player']
  type?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['type']
  amountMinor?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['amountMinor']
  feeMinor?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['feeMinor']
  currency?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['currency']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['idempotencyKey']
  status?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['status']
  providerConnection?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['providerConnection']
  paymentMethodReference?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['paymentMethodReference']
  providerSessionReference?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['providerSessionReference']
  hold?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['hold']
  riskEvidence?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['riskEvidence']
  completedAt?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PaymentIntentUpdateInput['updatedAt']
}
type ResolvedPlayerIdentityCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['player']
  encryptedPayload?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['encryptedPayload']
  tokenizedIdentifiers?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['tokenizedIdentifiers']
  encryptionKeyRef?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['encryptionKeyRef']
  classification?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['classification']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerIdentityCreateInput['updatedAt']
}
type ResolvedPlayerIdentityUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['player']
  encryptedPayload?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['encryptedPayload']
  tokenizedIdentifiers?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['tokenizedIdentifiers']
  encryptionKeyRef?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['encryptionKeyRef']
  classification?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['classification']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerIdentityUpdateInput['updatedAt']
}
type ResolvedProviderEntityMappingCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['providerConnection']
  entityType?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['entityType']
  externalId?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['externalId']
  canonicalType?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['canonicalType']
  canonicalId?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['canonicalId']
  confidence?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['confidence']
  status?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingCreateInput['updatedAt']
}
type ResolvedProviderEntityMappingUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['providerConnection']
  entityType?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['entityType']
  externalId?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['externalId']
  canonicalType?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['canonicalType']
  canonicalId?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['canonicalId']
  confidence?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['confidence']
  status?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderEntityMappingUpdateInput['updatedAt']
}
type ResolvedReconciliationItemCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['tenant']
  run?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['run']
  internalReference?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['internalReference']
  providerReference?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['providerReference']
  differenceMinor?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['differenceMinor']
  currency?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['status']
  resolutionJournal?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['resolutionJournal']
  createdAt?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReconciliationItemCreateInput['updatedAt']
}
type ResolvedReconciliationItemUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['tenant']
  run?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['run']
  internalReference?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['internalReference']
  providerReference?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['providerReference']
  differenceMinor?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['differenceMinor']
  currency?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['status']
  resolutionJournal?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['resolutionJournal']
  createdAt?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReconciliationItemUpdateInput['updatedAt']
}
type ResolvedReconciliationRunCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['type']
  windowFrom?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['windowFrom']
  windowTo?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['windowTo']
  status?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['status']
  inputHash?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['inputHash']
  differenceMinor?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['differenceMinor']
  createdAt?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReconciliationRunCreateInput['updatedAt']
}
type ResolvedReconciliationRunUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['type']
  windowFrom?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['windowFrom']
  windowTo?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['windowTo']
  status?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['status']
  inputHash?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['inputHash']
  differenceMinor?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['differenceMinor']
  createdAt?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReconciliationRunUpdateInput['updatedAt']
}
type ResolvedResettlementCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['wager']
  oldSettlement?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['oldSettlement']
  newResultVersion?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['newResultVersion']
  reason?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['reason']
  approvalRequest?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['approvalRequest']
  status?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ResettlementCaseCreateInput['updatedAt']
}
type ResolvedResettlementCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['wager']
  oldSettlement?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['oldSettlement']
  newResultVersion?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['newResultVersion']
  reason?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['reason']
  approvalRequest?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['approvalRequest']
  status?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ResettlementCaseUpdateInput['updatedAt']
}
type ResolvedRoleGrantCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['tenant']
  user?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['user']
  role?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['role']
  team?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['team']
  scope?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['scope']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RoleGrantCreateInput['updatedAt']
}
type ResolvedRoleGrantUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['tenant']
  user?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['user']
  role?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['role']
  team?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['team']
  scope?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['scope']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RoleGrantUpdateInput['updatedAt']
}
type ResolvedTaxAssessmentCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['wager']
  ruleVersion?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['ruleVersion']
  basisMinor?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['basisMinor']
  amountMinor?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TaxAssessmentCreateInput['updatedAt']
}
type ResolvedTaxAssessmentUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['wager']
  ruleVersion?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['ruleVersion']
  basisMinor?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['basisMinor']
  amountMinor?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TaxAssessmentUpdateInput['updatedAt']
}
type ResolvedTeamCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TeamCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TeamCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.TeamCreateInput['name']
  status?: import('../prisma/client/client.js').Prisma.TeamCreateInput['status']
  members?: import('../prisma/client/client.js').Prisma.TeamCreateInput['members']
  createdAt?: import('../prisma/client/client.js').Prisma.TeamCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TeamCreateInput['updatedAt']
}
type ResolvedTeamUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['name']
  status?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['status']
  members?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['members']
  createdAt?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TeamUpdateInput['updatedAt']
}
type ResolvedTradingStatusChangeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['scopeId']
  fromStatus?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['fromStatus']
  toStatus?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['toStatus']
  reason?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['reason']
  source?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['source']
  actorId?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['actorId']
  effectiveAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeCreateInput['updatedAt']
}
type ResolvedTradingStatusChangeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['scopeId']
  fromStatus?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['fromStatus']
  toStatus?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['toStatus']
  reason?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['reason']
  source?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['source']
  actorId?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['actorId']
  effectiveAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TradingStatusChangeUpdateInput['updatedAt']
}
type ResolvedVerificationCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['player']
  providerConnection?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['providerConnection']
  type?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['status']
  evidenceReference?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['evidenceReference']
  expiresAt?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VerificationCaseCreateInput['updatedAt']
}
type ResolvedVerificationCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['player']
  providerConnection?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['providerConnection']
  type?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['status']
  evidenceReference?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['evidenceReference']
  expiresAt?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VerificationCaseUpdateInput['updatedAt']
}
type ResolvedVerificationCheckCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['tenant']
  verificationCase?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['verificationCase']
  attempt?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['attempt']
  decision?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['reasonCode']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['rawEnvelope']
  createdAt?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VerificationCheckCreateInput['updatedAt']
}
type ResolvedVerificationCheckUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['tenant']
  verificationCase?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['verificationCase']
  attempt?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['attempt']
  decision?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['reasonCode']
  rawEnvelope?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['rawEnvelope']
  createdAt?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VerificationCheckUpdateInput['updatedAt']
}
type ResolvedWagerStatusEventCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['wager']
  fromStatus?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['fromStatus']
  toStatus?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['toStatus']
  reasonCode?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['reasonCode']
  actorId?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['actorId']
  effectiveAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventCreateInput['updatedAt']
}
type ResolvedWagerStatusEventUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['wager']
  fromStatus?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['fromStatus']
  toStatus?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['toStatus']
  reasonCode?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['reasonCode']
  actorId?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['actorId']
  effectiveAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['effectiveAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerStatusEventUpdateInput['updatedAt']
}
type ResolvedWebhookReplayCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['providerConnection']
  messageHash?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['messageHash']
  occurredAt?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['occurredAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookReplayCreateInput['updatedAt']
}
type ResolvedWebhookReplayUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['providerConnection']
  messageHash?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['messageHash']
  occurredAt?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['occurredAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookReplayUpdateInput['updatedAt']
}
type ResolvedCustomerCommandCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['player']
  commandKey?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['commandKey']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['idempotencyKey']
  type?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['type']
  requestHash?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['requestHash']
  status?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['status']
  result?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['result']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerCommandCreateInput['updatedAt']
}
type ResolvedCustomerCommandUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['player']
  commandKey?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['commandKey']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['idempotencyKey']
  type?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['type']
  requestHash?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['requestHash']
  status?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['status']
  result?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['result']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerCommandUpdateInput['updatedAt']
}
type ResolvedCustomerQuoteLegTermsCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['quote']
  quoteKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['quoteKey']
  legIndex?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['legIndex']
  eventId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['eventId']
  marketId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['marketId']
  selectionId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['selectionId']
  priceSnapshotId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['priceSnapshotId']
  eventName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['eventName']
  marketName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['marketName']
  selectionName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['selectionName']
  decimalOdds?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['line']
  live?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['live']
  correlationGroupKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['correlationGroupKey']
  ruleVersion?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['ruleVersion']
  evidenceHash?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsCreateInput['updatedAt']
}
type ResolvedCustomerQuoteLegTermsUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['quote']
  quoteKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['quoteKey']
  legIndex?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['legIndex']
  eventId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['eventId']
  marketId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['marketId']
  selectionId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['selectionId']
  priceSnapshotId?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['priceSnapshotId']
  eventName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['eventName']
  marketName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['marketName']
  selectionName?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['selectionName']
  decimalOdds?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['decimalOdds']
  line?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['line']
  live?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['live']
  correlationGroupKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['correlationGroupKey']
  ruleVersion?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['ruleVersion']
  evidenceHash?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteLegTermsUpdateInput['updatedAt']
}
type ResolvedCustomerQuoteTermsCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['quote']
  quoteKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['quoteKey']
  structure?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['structure']
  legCount?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['legCount']
  partCount?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['partCount']
  partPlan?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['partPlan']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['liveDelayMs']
  bonusEconomics?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['bonusEconomics']
  eventId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['eventId']
  marketId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['marketId']
  selectionId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['selectionId']
  priceSnapshotId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['priceSnapshotId']
  eventName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['eventName']
  marketName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['marketName']
  selectionName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['selectionName']
  decimalOdds?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['decimalOdds']
  stakeMinor?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['potentialReturnMinor']
  currency?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['currency']
  termsHash?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['termsHash']
  expiresAt: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsCreateInput['updatedAt']
}
type ResolvedCustomerQuoteTermsUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['player']
  quote?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['quote']
  quoteKey?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['quoteKey']
  structure?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['structure']
  legCount?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['legCount']
  partCount?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['partCount']
  partPlan?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['partPlan']
  priceChangeConsent?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['priceChangeConsent']
  liveDelayMs?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['liveDelayMs']
  bonusEconomics?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['bonusEconomics']
  eventId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['eventId']
  marketId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['marketId']
  selectionId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['selectionId']
  priceSnapshotId?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['priceSnapshotId']
  eventName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['eventName']
  marketName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['marketName']
  selectionName?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['selectionName']
  decimalOdds?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['decimalOdds']
  stakeMinor?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['stakeMinor']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['potentialReturnMinor']
  currency?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['currency']
  termsHash?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['termsHash']
  expiresAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['expiresAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerQuoteTermsUpdateInput['updatedAt']
}
type ResolvedCustomerSessionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['player']
  tokenDigest?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['tokenDigest']
  expiresAt: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['expiresAt']
  assuranceLevel?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['assuranceLevel']
  deviceDigest?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['deviceDigest']
  lastSeenAt?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['lastSeenAt']
  revokedAt?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['revokedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerSessionCreateInput['updatedAt']
}
type ResolvedCustomerSessionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['player']
  tokenDigest?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['tokenDigest']
  expiresAt?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['expiresAt']
  assuranceLevel?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['assuranceLevel']
  deviceDigest?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['deviceDigest']
  lastSeenAt?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['lastSeenAt']
  revokedAt?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['revokedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerSessionUpdateInput['updatedAt']
}
type ResolvedAccessReviewCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['scopeId']
  status?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['status']
  openedBy?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['openedBy']
  reviewerId?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['reviewerId']
  findings?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['findings']
  dueAt: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['dueAt']
  completedAt?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccessReviewCreateInput['updatedAt']
}
type ResolvedAccessReviewUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['tenant']
  scopeType?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['scopeId']
  status?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['status']
  openedBy?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['openedBy']
  reviewerId?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['reviewerId']
  findings?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['findings']
  dueAt?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['dueAt']
  completedAt?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccessReviewUpdateInput['updatedAt']
}
type ResolvedAccountClosureCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['player']
  requestedBy?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['requestedBy']
  reasonCode?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['reasonCode']
  requestedAt: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['requestedAt']
  coolingEndsAt?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['coolingEndsAt']
  status?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['status']
  completedAt?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['completedAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccountClosureCreateInput['updatedAt']
}
type ResolvedAccountClosureUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['player']
  requestedBy?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['requestedBy']
  reasonCode?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['reasonCode']
  requestedAt?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['requestedAt']
  coolingEndsAt?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['coolingEndsAt']
  status?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['status']
  completedAt?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['completedAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AccountClosureUpdateInput['updatedAt']
}
type ResolvedAdapterCertificationRunCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['providerConnection']
  adapterId?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['adapterId']
  adapterVersion?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['adapterVersion']
  suiteVersion?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['suiteVersion']
  scenarios?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['scenarios']
  passed?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['passed']
  failed?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['failed']
  status?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['status']
  inputHash?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['inputHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['artifactReference']
  startedAt: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['startedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunCreateInput['updatedAt']
}
type ResolvedAdapterCertificationRunUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['providerConnection']
  adapterId?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['adapterId']
  adapterVersion?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['adapterVersion']
  suiteVersion?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['suiteVersion']
  scenarios?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['scenarios']
  passed?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['passed']
  failed?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['failed']
  status?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['status']
  inputHash?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['inputHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['artifactReference']
  startedAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['startedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AdapterCertificationRunUpdateInput['updatedAt']
}
type ResolvedAffiliateAttributionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['player']
  affiliateReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['affiliateReference']
  campaignReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['campaignReference']
  clickReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['clickReference']
  attributedAt: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['attributedAt']
  status?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AffiliateAttributionCreateInput['updatedAt']
}
type ResolvedAffiliateAttributionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['player']
  affiliateReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['affiliateReference']
  campaignReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['campaignReference']
  clickReference?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['clickReference']
  attributedAt?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['attributedAt']
  status?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AffiliateAttributionUpdateInput['updatedAt']
}
type ResolvedAffordabilityAssessmentCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['player']
  source?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['source']
  riskBand?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['riskBand']
  evidenceReference?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['evidenceReference']
  assessedAt: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['assessedAt']
  expiresAt: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['expiresAt']
  decision?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['reasonCode']
  createdAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentCreateInput['updatedAt']
}
type ResolvedAffordabilityAssessmentUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['player']
  source?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['source']
  riskBand?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['riskBand']
  evidenceReference?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['evidenceReference']
  assessedAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['assessedAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['expiresAt']
  decision?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['reasonCode']
  createdAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.AffordabilityAssessmentUpdateInput['updatedAt']
}
type ResolvedBonusAwardCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['promotion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['ruleVersion']
  player?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['player']
  amountMinor?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['amountMinor']
  remainingMinor?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['remainingMinor']
  currency?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['currency']
  awardType?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['awardType']
  stakeReturned?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['stakeReturned']
  status?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['status']
  awardedAt: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['awardedAt']
  activatedAt?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['activatedAt']
  expiresAt: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['expiresAt']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BonusAwardCreateInput['updatedAt']
}
type ResolvedBonusAwardUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['promotion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['ruleVersion']
  player?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['player']
  amountMinor?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['amountMinor']
  remainingMinor?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['remainingMinor']
  currency?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['currency']
  awardType?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['awardType']
  stakeReturned?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['stakeReturned']
  status?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['status']
  awardedAt?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['awardedAt']
  activatedAt?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['activatedAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['expiresAt']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BonusAwardUpdateInput['updatedAt']
}
type ResolvedBonusTransactionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['tenant']
  award?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['award']
  type?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['type']
  amountMinor?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['amountMinor']
  remainingMinor?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['remainingMinor']
  currency?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['currency']
  wager?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['wager']
  journalTransaction?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['journalTransaction']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BonusTransactionCreateInput['updatedAt']
}
type ResolvedBonusTransactionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['tenant']
  award?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['award']
  type?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['type']
  amountMinor?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['amountMinor']
  remainingMinor?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['remainingMinor']
  currency?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['currency']
  wager?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['wager']
  journalTransaction?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['journalTransaction']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BonusTransactionUpdateInput['updatedAt']
}
type ResolvedBrandLocaleCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['tenant']
  brand?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['brand']
  locale?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['locale']
  language?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['language']
  timezone?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['timezone']
  termsVersion?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['termsVersion']
  termsContentHash?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['termsContentHash']
  default?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['default']
  status?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BrandLocaleCreateInput['updatedAt']
}
type ResolvedBrandLocaleUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['tenant']
  brand?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['brand']
  locale?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['locale']
  language?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['language']
  timezone?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['timezone']
  termsVersion?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['termsVersion']
  termsContentHash?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['termsContentHash']
  default?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['default']
  status?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.BrandLocaleUpdateInput['updatedAt']
}
type ResolvedCampaignBudgetCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['promotion']
  allocatedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['allocatedMinor']
  awardedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['awardedMinor']
  redeemedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['redeemedMinor']
  forfeitedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['forfeitedMinor']
  currency?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['currency']
  version: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['version']
  status?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CampaignBudgetCreateInput['updatedAt']
}
type ResolvedCampaignBudgetUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['promotion']
  allocatedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['allocatedMinor']
  awardedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['awardedMinor']
  redeemedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['redeemedMinor']
  forfeitedMinor?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['forfeitedMinor']
  currency?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['currency']
  version?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['version']
  status?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CampaignBudgetUpdateInput['updatedAt']
}
type ResolvedCashOutAcceptanceCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['tenant']
  offer?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['offer']
  wager?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['wager']
  player?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['player']
  amountMinor?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['currency']
  portionNumerator?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['portionNumerator']
  portionDenominator?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['portionDenominator']
  wagerVersion: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['wagerVersion']
  acceptedAt: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['acceptedAt']
  journalTransaction?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['journalTransaction']
  status?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['status']
  reversalOf?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['reversalOf']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceCreateInput['updatedAt']
}
type ResolvedCashOutAcceptanceUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['tenant']
  offer?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['offer']
  wager?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['wager']
  player?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['player']
  amountMinor?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['currency']
  portionNumerator?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['portionNumerator']
  portionDenominator?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['portionDenominator']
  wagerVersion?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['wagerVersion']
  acceptedAt?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['acceptedAt']
  journalTransaction?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['journalTransaction']
  status?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['status']
  reversalOf?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['reversalOf']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CashOutAcceptanceUpdateInput['updatedAt']
}
type ResolvedCompetitionStageCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['tenant']
  season?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['season']
  key?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['name']
  sortOrder: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['sortOrder']
  status?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitionStageCreateInput['updatedAt']
}
type ResolvedCompetitionStageUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['tenant']
  season?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['season']
  key?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['name']
  sortOrder?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['sortOrder']
  status?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CompetitionStageUpdateInput['updatedAt']
}
type ResolvedConfigDefinitionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['key']
  valueType?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['valueType']
  mergeStrategy?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['mergeStrategy']
  allowedScopes?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['allowedScopes']
  validationSchema?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['validationSchema']
  secret?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['secret']
  description?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['description']
  createdAt?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConfigDefinitionCreateInput['updatedAt']
}
type ResolvedConfigDefinitionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['key']
  valueType?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['valueType']
  mergeStrategy?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['mergeStrategy']
  allowedScopes?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['allowedScopes']
  validationSchema?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['validationSchema']
  secret?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['secret']
  description?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['description']
  createdAt?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ConfigDefinitionUpdateInput['updatedAt']
}
type ResolvedCorrelationGroupCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['name']
  sportKey?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['sportKey']
  status?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['status']
  version: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CorrelationGroupCreateInput['updatedAt']
}
type ResolvedCorrelationGroupUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['name']
  sportKey?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['sportKey']
  status?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['status']
  version?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CorrelationGroupUpdateInput['updatedAt']
}
type ResolvedCorrelationRuleCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['tenant']
  group?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['group']
  leftPattern?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['leftPattern']
  rightPattern?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['rightPattern']
  decision?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['reasonCode']
  priority: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['priority']
  createdAt?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CorrelationRuleCreateInput['updatedAt']
}
type ResolvedCorrelationRuleUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['tenant']
  group?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['group']
  leftPattern?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['leftPattern']
  rightPattern?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['rightPattern']
  decision?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['decision']
  reasonCode?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['reasonCode']
  priority?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['priority']
  createdAt?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CorrelationRuleUpdateInput['updatedAt']
}
type ResolvedCurrencyDefinitionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['id']
  code?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['code']
  exponent: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['exponent']
  name?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['name']
  status?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionCreateInput['updatedAt']
}
type ResolvedCurrencyDefinitionUpdateInput = {
  id?: undefined
  code?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['code']
  exponent?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['exponent']
  name?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['name']
  status?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CurrencyDefinitionUpdateInput['updatedAt']
}
type ResolvedCustomerCredentialCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['player']
  emailDigest?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['emailDigest']
  emailMasked?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['emailMasked']
  passwordHash?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['passwordHash']
  passwordVersion?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['passwordVersion']
  status?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['status']
  failedAttempts?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['failedAttempts']
  lockedUntil?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['lockedUntil']
  verifiedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['verifiedAt']
  lastAuthenticatedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['lastAuthenticatedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialCreateInput['updatedAt']
}
type ResolvedCustomerCredentialUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['player']
  emailDigest?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['emailDigest']
  emailMasked?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['emailMasked']
  passwordHash?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['passwordHash']
  passwordVersion?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['passwordVersion']
  status?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['status']
  failedAttempts?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['failedAttempts']
  lockedUntil?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['lockedUntil']
  verifiedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['verifiedAt']
  lastAuthenticatedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['lastAuthenticatedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerCredentialUpdateInput['updatedAt']
}
type ResolvedCustomerDeviceCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['player']
  session?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['session']
  deviceDigest?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['deviceDigest']
  label?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['label']
  firstSeenAt: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['firstSeenAt']
  lastSeenAt: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['lastSeenAt']
  revokedAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['revokedAt']
  riskSignals?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['riskSignals']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceCreateInput['updatedAt']
}
type ResolvedCustomerDeviceUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['player']
  session?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['session']
  deviceDigest?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['deviceDigest']
  label?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['label']
  firstSeenAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['firstSeenAt']
  lastSeenAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['lastSeenAt']
  revokedAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['revokedAt']
  riskSignals?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['riskSignals']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerDeviceUpdateInput['updatedAt']
}
type ResolvedCustomerFavoriteCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['player']
  targetType?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['targetId']
  createdByDevice?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['createdByDevice']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerFavoriteCreateInput['updatedAt']
}
type ResolvedCustomerFavoriteUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['player']
  targetType?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['targetId']
  createdByDevice?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['createdByDevice']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerFavoriteUpdateInput['updatedAt']
}
type ResolvedCustomerPrivacyRequestCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['player']
  type?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['status']
  requestedAt: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['requestedAt']
  dueAt: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['dueAt']
  completedAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['completedAt']
  identityEvidenceHash?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['identityEvidenceHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['artifactReference']
  decisionReason?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['decisionReason']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestCreateInput['updatedAt']
}
type ResolvedCustomerPrivacyRequestUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['player']
  type?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['status']
  requestedAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['requestedAt']
  dueAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['dueAt']
  completedAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['completedAt']
  identityEvidenceHash?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['identityEvidenceHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['artifactReference']
  decisionReason?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['decisionReason']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerPrivacyRequestUpdateInput['updatedAt']
}
type ResolvedCustomerRecoveryTokenCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['player']
  tokenDigest?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['tokenDigest']
  purpose?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['purpose']
  expiresAt: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['expiresAt']
  consumedAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['consumedAt']
  attempts?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['attempts']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenCreateInput['updatedAt']
}
type ResolvedCustomerRecoveryTokenUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['player']
  tokenDigest?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['tokenDigest']
  purpose?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['purpose']
  expiresAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['expiresAt']
  consumedAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['consumedAt']
  attempts?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['attempts']
  createdAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.CustomerRecoveryTokenUpdateInput['updatedAt']
}
type ResolvedDataExportCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['tenant']
  requestedBy?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['requestedBy']
  type?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['type']
  scope?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['scope']
  classification?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['classification']
  status?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['status']
  rowCount?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['rowCount']
  contentHash?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['contentHash']
  storageReference?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['storageReference']
  expiresAt: import('../prisma/client/client.js').Prisma.DataExportCreateInput['expiresAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DataExportCreateInput['updatedAt']
}
type ResolvedDataExportUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['tenant']
  requestedBy?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['requestedBy']
  type?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['type']
  scope?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['scope']
  classification?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['classification']
  status?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['status']
  rowCount?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['rowCount']
  contentHash?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['contentHash']
  storageReference?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['storageReference']
  expiresAt?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['expiresAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.DataExportUpdateInput['updatedAt']
}
type ResolvedEventScheduleChangeCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['event']
  fromStartAt: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['fromStartAt']
  toStartAt: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['toStartAt']
  reasonCode?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['reasonCode']
  source?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['source']
  actorId?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['actorId']
  evidenceHash?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeCreateInput['updatedAt']
}
type ResolvedEventScheduleChangeUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['tenant']
  event?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['event']
  fromStartAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['fromStartAt']
  toStartAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['toStartAt']
  reasonCode?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['reasonCode']
  source?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['source']
  actorId?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['actorId']
  evidenceHash?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.EventScheduleChangeUpdateInput['updatedAt']
}
type ResolvedFeatureFlagCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['key']
  description?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['description']
  enabled?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['enabled']
  scopeType?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['scopeId']
  safeDefault?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['safeDefault']
  ownerId?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['ownerId']
  expiresAt?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['expiresAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.FeatureFlagCreateInput['updatedAt']
}
type ResolvedFeatureFlagUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['key']
  description?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['description']
  enabled?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['enabled']
  scopeType?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['scopeId']
  safeDefault?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['safeDefault']
  ownerId?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['ownerId']
  expiresAt?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['expiresAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.FeatureFlagUpdateInput['updatedAt']
}
type ResolvedFeedHealthSnapshotCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['providerConnection']
  scopeType?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['scopeId']
  status?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['status']
  heartbeatAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['heartbeatAt']
  lagMs?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['lagMs']
  lastSequence?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['lastSequence']
  gapFrom?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['gapFrom']
  gapTo?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['gapTo']
  checkedAt: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['checkedAt']
  actionTaken?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['actionTaken']
  createdAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotCreateInput['updatedAt']
}
type ResolvedFeedHealthSnapshotUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['providerConnection']
  scopeType?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['scopeId']
  status?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['status']
  heartbeatAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['heartbeatAt']
  lagMs?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['lagMs']
  lastSequence?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['lastSequence']
  gapFrom?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['gapFrom']
  gapTo?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['gapTo']
  checkedAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['checkedAt']
  actionTaken?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['actionTaken']
  createdAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.FeedHealthSnapshotUpdateInput['updatedAt']
}
type ResolvedHouseRuleVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['name']
  version: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['version']
  sportKey?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['sportKey']
  marketDefinitionKey?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['marketDefinitionKey']
  rules?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['rules']
  semanticHash?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['semanticHash']
  effectiveFrom: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['status']
  approvalRequest?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.HouseRuleVersionCreateInput['updatedAt']
}
type ResolvedHouseRuleVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['name']
  version?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['version']
  sportKey?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['sportKey']
  marketDefinitionKey?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['marketDefinitionKey']
  rules?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['rules']
  semanticHash?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['semanticHash']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['status']
  approvalRequest?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.HouseRuleVersionUpdateInput['updatedAt']
}
type ResolvedIntegrationDeliveryAttemptCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['tenant']
  delivery?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['delivery']
  attempt: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['attempt']
  requestedAt: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['requestedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['completedAt']
  responseCode?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['responseCode']
  latencyMs?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['latencyMs']
  responseHash?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['responseHash']
  errorClass?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['errorClass']
  createdAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptCreateInput['updatedAt']
}
type ResolvedIntegrationDeliveryAttemptUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['tenant']
  delivery?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['delivery']
  attempt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['attempt']
  requestedAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['requestedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['completedAt']
  responseCode?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['responseCode']
  latencyMs?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['latencyMs']
  responseHash?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['responseHash']
  errorClass?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['errorClass']
  createdAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IntegrationDeliveryAttemptUpdateInput['updatedAt']
}
type ResolvedIntegrityCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['player']
  event?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['event']
  wager?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['wager']
  providerConnection?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['providerConnection']
  type?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['status']
  severity?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['severity']
  restrictedEvidence?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['restrictedEvidence']
  ownerId?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['ownerId']
  reportedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['reportedAt']
  closedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['closedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseCreateInput['updatedAt']
}
type ResolvedIntegrityCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['player']
  event?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['event']
  wager?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['wager']
  providerConnection?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['providerConnection']
  type?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['status']
  severity?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['severity']
  restrictedEvidence?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['restrictedEvidence']
  ownerId?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['ownerId']
  reportedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['reportedAt']
  closedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['closedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.IntegrityCaseUpdateInput['updatedAt']
}
type ResolvedJurisdictionPolicyVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['jurisdiction']
  version: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['version']
  authorityCitation?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['authorityCitation']
  policyDocument?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['policyDocument']
  effectiveFrom: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['status']
  approvedBy?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['approvedBy']
  approvedAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['approvedAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionCreateInput['updatedAt']
}
type ResolvedJurisdictionPolicyVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['jurisdiction']
  version?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['version']
  authorityCitation?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['authorityCitation']
  policyDocument?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['policyDocument']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['status']
  approvedBy?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['approvedBy']
  approvedAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['approvedAt']
  evidenceHash?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.JurisdictionPolicyVersionUpdateInput['updatedAt']
}
type ResolvedLedgerAdjustmentRequestCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['player']
  account?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['account']
  amountMinor?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['currency']
  direction?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['direction']
  reasonCode?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['reasonCode']
  evidence?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['evidence']
  status?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['status']
  requesterId?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['requesterId']
  approvalRequest?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['approvalRequest']
  journalTransaction?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['journalTransaction']
  createdAt?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestCreateInput['updatedAt']
}
type ResolvedLedgerAdjustmentRequestUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['player']
  account?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['account']
  amountMinor?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['amountMinor']
  currency?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['currency']
  direction?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['direction']
  reasonCode?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['reasonCode']
  evidence?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['evidence']
  status?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['status']
  requesterId?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['requesterId']
  approvalRequest?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['approvalRequest']
  journalTransaction?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['journalTransaction']
  createdAt?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LedgerAdjustmentRequestUpdateInput['updatedAt']
}
type ResolvedLegalEntityCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['name']
  countryCode?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['countryCode']
  registrationReference?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['registrationReference']
  status?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegalEntityCreateInput['updatedAt']
}
type ResolvedLegalEntityUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['name']
  countryCode?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['countryCode']
  registrationReference?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['registrationReference']
  status?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.LegalEntityUpdateInput['updatedAt']
}
type ResolvedMarketDefinitionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['name']
  sportKey?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['sportKey']
  parametersSchema?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['parametersSchema']
  gradingRuleFamily?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['gradingRuleFamily']
  allowedPhases?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['allowedPhases']
  status?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['status']
  version: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketDefinitionCreateInput['updatedAt']
}
type ResolvedMarketDefinitionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['name']
  sportKey?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['sportKey']
  parametersSchema?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['parametersSchema']
  gradingRuleFamily?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['gradingRuleFamily']
  allowedPhases?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['allowedPhases']
  status?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['status']
  version?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['version']
  createdAt?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.MarketDefinitionUpdateInput['updatedAt']
}
type ResolvedNotificationCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['player']
  user?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['user']
  channel?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['channel']
  templateKey?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['templateKey']
  templateVersion?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['templateVersion']
  locale?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['locale']
  payload?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['status']
  consentEvidenceHash?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['consentEvidenceHash']
  providerConnection?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['providerConnection']
  externalReference?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['externalReference']
  sentAt?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['sentAt']
  createdAt?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.NotificationCreateInput['updatedAt']
}
type ResolvedNotificationUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['player']
  user?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['user']
  channel?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['channel']
  templateKey?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['templateKey']
  templateVersion?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['templateVersion']
  locale?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['locale']
  payload?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['status']
  consentEvidenceHash?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['consentEvidenceHash']
  providerConnection?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['providerConnection']
  externalReference?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['externalReference']
  sentAt?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['sentAt']
  createdAt?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.NotificationUpdateInput['updatedAt']
}
type ResolvedOperatorChannelCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['legalEntity']
  operatorJurisdiction?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['operatorJurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['brand']
  key?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['key']
  type?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['status']
  capabilities?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['capabilities']
  createdAt?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OperatorChannelCreateInput['updatedAt']
}
type ResolvedOperatorChannelUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['legalEntity']
  operatorJurisdiction?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['operatorJurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['brand']
  key?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['key']
  type?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['status']
  capabilities?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['capabilities']
  createdAt?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.OperatorChannelUpdateInput['updatedAt']
}
type ResolvedPamSubjectMappingCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['providerConnection']
  externalSubjectDigest?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['externalSubjectDigest']
  player?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['player']
  walletMode?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['walletMode']
  status?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PamSubjectMappingCreateInput['updatedAt']
}
type ResolvedPamSubjectMappingUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['providerConnection']
  externalSubjectDigest?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['externalSubjectDigest']
  player?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['player']
  walletMode?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['walletMode']
  status?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PamSubjectMappingUpdateInput['updatedAt']
}
type ResolvedPlayerStatementCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['player']
  periodStart: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['periodStart']
  periodEnd: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['periodEnd']
  openingMinor?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['openingMinor']
  closingMinor?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['closingMinor']
  currency?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['currency']
  journalHash?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['journalHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['artifactReference']
  status?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerStatementCreateInput['updatedAt']
}
type ResolvedPlayerStatementUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['player']
  periodStart?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['periodStart']
  periodEnd?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['periodEnd']
  openingMinor?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['openingMinor']
  closingMinor?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['closingMinor']
  currency?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['currency']
  journalHash?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['journalHash']
  artifactReference?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['artifactReference']
  status?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PlayerStatementUpdateInput['updatedAt']
}
type ResolvedPromotionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['name']
  description?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['description']
  type?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['type']
  status?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['status']
  startsAt: import('../prisma/client/client.js').Prisma.PromotionCreateInput['startsAt']
  endsAt: import('../prisma/client/client.js').Prisma.PromotionCreateInput['endsAt']
  jurisdiction?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['jurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['brand']
  budgetMinor?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['budgetMinor']
  currency?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['currency']
  termsVersion?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['termsVersion']
  termsHash?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['termsHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionCreateInput['updatedAt']
}
type ResolvedPromotionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['name']
  description?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['description']
  type?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['type']
  status?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['status']
  startsAt?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['endsAt']
  jurisdiction?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['jurisdiction']
  brand?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['brand']
  budgetMinor?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['budgetMinor']
  currency?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['currency']
  termsVersion?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['termsVersion']
  termsHash?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['termsHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionUpdateInput['updatedAt']
}
type ResolvedPromotionRedemptionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['promotion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['ruleVersion']
  player?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['player']
  bonusAward?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['bonusAward']
  status?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['status']
  reasonCode?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['reasonCode']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['evidenceHash']
  redeemedAt: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['redeemedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionRedemptionCreateInput['updatedAt']
}
type ResolvedPromotionRedemptionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['promotion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['ruleVersion']
  player?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['player']
  bonusAward?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['bonusAward']
  status?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['status']
  reasonCode?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['reasonCode']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['idempotencyKey']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['evidenceHash']
  redeemedAt?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['redeemedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionRedemptionUpdateInput['updatedAt']
}
type ResolvedPromotionRuleVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['promotion']
  version: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['version']
  eligibility?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['eligibility']
  economics?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['economics']
  wageringRequirements?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['wageringRequirements']
  abuseControls?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['abuseControls']
  contributionRules?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['contributionRules']
  status?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['status']
  effectiveFrom: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['effectiveTo']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionCreateInput['updatedAt']
}
type ResolvedPromotionRuleVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['tenant']
  promotion?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['promotion']
  version?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['version']
  eligibility?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['eligibility']
  economics?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['economics']
  wageringRequirements?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['wageringRequirements']
  abuseControls?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['abuseControls']
  contributionRules?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['contributionRules']
  status?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['status']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['effectiveTo']
  evidenceHash?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.PromotionRuleVersionUpdateInput['updatedAt']
}
type ResolvedProviderHealthSampleCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['providerConnection']
  capability?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['capability']
  status?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['status']
  latencyMs?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['latencyMs']
  errorRateBasisPoints?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['errorRateBasisPoints']
  sequenceLag?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['sequenceLag']
  oldestWebhookAgeMs?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['oldestWebhookAgeMs']
  reconciliationDifferenceMinor?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['reconciliationDifferenceMinor']
  checkedAt: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['checkedAt']
  details?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleCreateInput['updatedAt']
}
type ResolvedProviderHealthSampleUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['providerConnection']
  capability?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['capability']
  status?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['status']
  latencyMs?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['latencyMs']
  errorRateBasisPoints?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['errorRateBasisPoints']
  sequenceLag?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['sequenceLag']
  oldestWebhookAgeMs?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['oldestWebhookAgeMs']
  reconciliationDifferenceMinor?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['reconciliationDifferenceMinor']
  checkedAt?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['checkedAt']
  details?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['details']
  createdAt?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ProviderHealthSampleUpdateInput['updatedAt']
}
type ResolvedRegionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RegionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RegionCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.RegionCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.RegionCreateInput['name']
  countryCodes?: import('../prisma/client/client.js').Prisma.RegionCreateInput['countryCodes']
  status?: import('../prisma/client/client.js').Prisma.RegionCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.RegionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RegionCreateInput['updatedAt']
}
type ResolvedRegionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['name']
  countryCodes?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['countryCodes']
  status?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RegionUpdateInput['updatedAt']
}
type ResolvedReportArtifactCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['tenant']
  report?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['report']
  type?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['type']
  format?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['format']
  schemaVersion?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['schemaVersion']
  rowCount?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['rowCount']
  contentHash?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['contentHash']
  storageReference?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['storageReference']
  encryptionKeyReference?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['encryptionKeyReference']
  generatedAt: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['generatedAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReportArtifactCreateInput['updatedAt']
}
type ResolvedReportArtifactUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['tenant']
  report?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['report']
  type?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['type']
  format?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['format']
  schemaVersion?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['schemaVersion']
  rowCount?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['rowCount']
  contentHash?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['contentHash']
  storageReference?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['storageReference']
  encryptionKeyReference?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['encryptionKeyReference']
  generatedAt?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['generatedAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ReportArtifactUpdateInput['updatedAt']
}
type ResolvedRetentionExecutionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['tenant']
  policyVersion?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['policyVersion']
  windowFrom: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['windowFrom']
  windowTo: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['windowTo']
  candidateCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['candidateCount']
  heldCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['heldCount']
  archivedCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['archivedCount']
  deletedCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['deletedCount']
  status?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['status']
  dryRunHash?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['dryRunHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['approvalRequest']
  artifactReference?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['artifactReference']
  completedAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionCreateInput['updatedAt']
}
type ResolvedRetentionExecutionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['tenant']
  policyVersion?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['policyVersion']
  windowFrom?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['windowFrom']
  windowTo?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['windowTo']
  candidateCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['candidateCount']
  heldCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['heldCount']
  archivedCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['archivedCount']
  deletedCount?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['deletedCount']
  status?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['status']
  dryRunHash?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['dryRunHash']
  approvalRequest?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['approvalRequest']
  artifactReference?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['artifactReference']
  completedAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RetentionExecutionUpdateInput['updatedAt']
}
type ResolvedRetentionPolicyVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['tenant']
  recordClass?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['recordClass']
  jurisdiction?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['jurisdiction']
  version: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['version']
  retentionDays: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['retentionDays']
  archiveDays?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['archiveDays']
  deletionMode?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['deletionMode']
  legalHoldWins?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['legalHoldWins']
  effectiveFrom: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionCreateInput['updatedAt']
}
type ResolvedRetentionPolicyVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['tenant']
  recordClass?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['recordClass']
  jurisdiction?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['jurisdiction']
  version?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['version']
  retentionDays?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['retentionDays']
  archiveDays?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['archiveDays']
  deletionMode?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['deletionMode']
  legalHoldWins?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['legalHoldWins']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.RetentionPolicyVersionUpdateInput['updatedAt']
}
type ResolvedSafeguardingAccountCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['legalEntity']
  providerConnection?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['providerConnection']
  accountReference?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['accountReference']
  classification?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['classification']
  currency?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['status']
  disclosureVersion?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['disclosureVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SafeguardingAccountCreateInput['updatedAt']
}
type ResolvedSafeguardingAccountUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['tenant']
  legalEntity?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['legalEntity']
  providerConnection?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['providerConnection']
  accountReference?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['accountReference']
  classification?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['classification']
  currency?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['currency']
  status?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['status']
  disclosureVersion?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['disclosureVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SafeguardingAccountUpdateInput['updatedAt']
}
type ResolvedSafeguardingReconciliationCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['tenant']
  safeguardingAccount?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['safeguardingAccount']
  asOf: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['asOf']
  safeguardedAssetMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['safeguardedAssetMinor']
  playerLiabilityMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['playerLiabilityMinor']
  differenceMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['differenceMinor']
  status?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['evidenceHash']
  reconciliationRun?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['reconciliationRun']
  createdAt?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationCreateInput['updatedAt']
}
type ResolvedSafeguardingReconciliationUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['tenant']
  safeguardingAccount?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['safeguardingAccount']
  asOf?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['asOf']
  safeguardedAssetMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['safeguardedAssetMinor']
  playerLiabilityMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['playerLiabilityMinor']
  differenceMinor?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['differenceMinor']
  status?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['evidenceHash']
  reconciliationRun?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['reconciliationRun']
  createdAt?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SafeguardingReconciliationUpdateInput['updatedAt']
}
type ResolvedScheduledJobCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['type']
  scopeType?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['scopeId']
  payload?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['status']
  dueAt: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['dueAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['leaseOwner']
  attempts?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['attempts']
  maxAttempts?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['maxAttempts']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['idempotencyKey']
  lastError?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ScheduledJobCreateInput['updatedAt']
}
type ResolvedScheduledJobUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['tenant']
  type?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['type']
  scopeType?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['scopeId']
  payload?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['payload']
  status?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['status']
  dueAt?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['dueAt']
  leaseUntil?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['leaseUntil']
  leaseOwner?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['leaseOwner']
  attempts?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['attempts']
  maxAttempts?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['maxAttempts']
  idempotencyKey?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['idempotencyKey']
  lastError?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ScheduledJobUpdateInput['updatedAt']
}
type ResolvedScreeningHitCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['tenant']
  amlCase?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['amlCase']
  providerConnection?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['providerConnection']
  screeningType?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['screeningType']
  matchToken?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['matchToken']
  status?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['status']
  dispositionReason?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['dispositionReason']
  evidenceReference?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['evidenceReference']
  screenedAt: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['screenedAt']
  resolvedAt?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['resolvedAt']
  ownerId?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['ownerId']
  createdAt?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ScreeningHitCreateInput['updatedAt']
}
type ResolvedScreeningHitUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['tenant']
  amlCase?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['amlCase']
  providerConnection?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['providerConnection']
  screeningType?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['screeningType']
  matchToken?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['matchToken']
  status?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['status']
  dispositionReason?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['dispositionReason']
  evidenceReference?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['evidenceReference']
  screenedAt?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['screenedAt']
  resolvedAt?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['resolvedAt']
  ownerId?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['ownerId']
  createdAt?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.ScreeningHitUpdateInput['updatedAt']
}
type ResolvedSeasonCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['tenant']
  competition?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['competition']
  key?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['name']
  startsAt: import('../prisma/client/client.js').Prisma.SeasonCreateInput['startsAt']
  endsAt: import('../prisma/client/client.js').Prisma.SeasonCreateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SeasonCreateInput['updatedAt']
}
type ResolvedSeasonUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['tenant']
  competition?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['competition']
  key?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['name']
  startsAt?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['startsAt']
  endsAt?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['endsAt']
  status?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SeasonUpdateInput['updatedAt']
}
type ResolvedSettlementLineCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['tenant']
  settlement?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['settlement']
  wagerPart?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['wagerPart']
  wagerLeg?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['wagerLeg']
  lineType?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['lineType']
  amountMinor?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['amountMinor']
  unroundedValue?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['unroundedValue']
  scale: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['scale']
  roundingRule?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['roundingRule']
  residualMinor?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['residualMinor']
  trace?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['trace']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementLineCreateInput['updatedAt']
}
type ResolvedSettlementLineUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['tenant']
  settlement?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['settlement']
  wagerPart?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['wagerPart']
  wagerLeg?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['wagerLeg']
  lineType?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['lineType']
  amountMinor?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['amountMinor']
  unroundedValue?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['unroundedValue']
  scale?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['scale']
  roundingRule?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['roundingRule']
  residualMinor?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['residualMinor']
  trace?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['trace']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementLineUpdateInput['updatedAt']
}
type ResolvedSettlementRunCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['tenant']
  triggerType?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['triggerType']
  resultVersion?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['resultVersion']
  inputHash?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['inputHash']
  status?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['status']
  wagersConsidered?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['wagersConsidered']
  wagersSettled?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['wagersSettled']
  startedAt: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['startedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['completedAt']
  errorSummary?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['errorSummary']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementRunCreateInput['updatedAt']
}
type ResolvedSettlementRunUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['tenant']
  triggerType?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['triggerType']
  resultVersion?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['resultVersion']
  inputHash?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['inputHash']
  status?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['status']
  wagersConsidered?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['wagersConsidered']
  wagersSettled?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['wagersSettled']
  startedAt?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['startedAt']
  completedAt?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['completedAt']
  errorSummary?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['errorSummary']
  createdAt?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SettlementRunUpdateInput['updatedAt']
}
type ResolvedSupportCaseCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['player']
  wager?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['wager']
  paymentIntent?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['paymentIntent']
  dispute?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['dispute']
  category?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['category']
  priority?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['priority']
  status?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['status']
  subject?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['subject']
  ownerId?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['ownerId']
  openedAt: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['openedAt']
  resolvedAt?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['resolvedAt']
  slaDueAt: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['slaDueAt']
  createdAt?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SupportCaseCreateInput['updatedAt']
}
type ResolvedSupportCaseUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['tenant']
  player?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['player']
  wager?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['wager']
  paymentIntent?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['paymentIntent']
  dispute?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['dispute']
  category?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['category']
  priority?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['priority']
  status?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['status']
  subject?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['subject']
  ownerId?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['ownerId']
  openedAt?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['openedAt']
  resolvedAt?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['resolvedAt']
  slaDueAt?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['slaDueAt']
  createdAt?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SupportCaseUpdateInput['updatedAt']
}
type ResolvedSupportCaseEventCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['tenant']
  supportCase?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['supportCase']
  type?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['type']
  actorType?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['actorType']
  actorId?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['actorId']
  body?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['body']
  evidenceHash?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['evidenceHash']
  visibility?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['visibility']
  createdAt?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SupportCaseEventCreateInput['updatedAt']
}
type ResolvedSupportCaseEventUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['tenant']
  supportCase?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['supportCase']
  type?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['type']
  actorType?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['actorType']
  actorId?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['actorId']
  body?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['body']
  evidenceHash?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['evidenceHash']
  visibility?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['visibility']
  createdAt?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.SupportCaseEventUpdateInput['updatedAt']
}
type ResolvedTaxRuleVersionCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['jurisdiction']
  key?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['key']
  version: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['version']
  basis?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['basis']
  rateNumerator?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['rateNumerator']
  rateDenominator?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['rateDenominator']
  roundingRule?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['roundingRule']
  effectiveFrom: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TaxRuleVersionCreateInput['updatedAt']
}
type ResolvedTaxRuleVersionUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['tenant']
  jurisdiction?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['jurisdiction']
  key?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['key']
  version?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['version']
  basis?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['basis']
  rateNumerator?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['rateNumerator']
  rateDenominator?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['rateDenominator']
  roundingRule?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['roundingRule']
  effectiveFrom?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['effectiveFrom']
  effectiveTo?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['effectiveTo']
  status?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['status']
  evidenceHash?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['evidenceHash']
  createdAt?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TaxRuleVersionUpdateInput['updatedAt']
}
type ResolvedTenantCurrencyCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['tenant']
  currency?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['currency']
  depositsEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['depositsEnabled']
  withdrawalsEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['withdrawalsEnabled']
  wageringEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['wageringEnabled']
  defaultForBrand?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['defaultForBrand']
  status?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TenantCurrencyCreateInput['updatedAt']
}
type ResolvedTenantCurrencyUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['tenant']
  currency?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['currency']
  depositsEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['depositsEnabled']
  withdrawalsEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['withdrawalsEnabled']
  wageringEnabled?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['wageringEnabled']
  defaultForBrand?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['defaultForBrand']
  status?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TenantCurrencyUpdateInput['updatedAt']
}
type ResolvedTraderOverrideCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['tenant']
  targetType?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['targetId']
  overrideType?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['overrideType']
  value?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['value']
  reasonCode?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['reasonCode']
  startsAt: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['startsAt']
  expiresAt: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['status']
  requesterId?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['requesterId']
  approvalRequest?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TraderOverrideCreateInput['updatedAt']
}
type ResolvedTraderOverrideUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['tenant']
  targetType?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['targetType']
  targetId?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['targetId']
  overrideType?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['overrideType']
  value?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['value']
  reasonCode?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['reasonCode']
  startsAt?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['startsAt']
  expiresAt?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['expiresAt']
  status?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['status']
  requesterId?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['requesterId']
  approvalRequest?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TraderOverrideUpdateInput['updatedAt']
}
type ResolvedTradingReplayRunCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['providerConnection']
  scopeType?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['scopeId']
  frontier?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['frontier']
  adapterVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['adapterVersion']
  normalizerVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['normalizerVersion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['ruleVersion']
  inputHash?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['inputHash']
  outputHash?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['outputHash']
  comparison?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['comparison']
  dryRun?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['dryRun']
  status?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['status']
  completedAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunCreateInput['updatedAt']
}
type ResolvedTradingReplayRunUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['tenant']
  providerConnection?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['providerConnection']
  scopeType?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['scopeType']
  scopeId?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['scopeId']
  frontier?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['frontier']
  adapterVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['adapterVersion']
  normalizerVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['normalizerVersion']
  ruleVersion?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['ruleVersion']
  inputHash?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['inputHash']
  outputHash?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['outputHash']
  comparison?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['comparison']
  dryRun?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['dryRun']
  status?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['status']
  completedAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['completedAt']
  createdAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.TradingReplayRunUpdateInput['updatedAt']
}
type ResolvedVenueCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.VenueCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.VenueCreateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.VenueCreateInput['key']
  name?: import('../prisma/client/client.js').Prisma.VenueCreateInput['name']
  countryCode?: import('../prisma/client/client.js').Prisma.VenueCreateInput['countryCode']
  timezone?: import('../prisma/client/client.js').Prisma.VenueCreateInput['timezone']
  address?: import('../prisma/client/client.js').Prisma.VenueCreateInput['address']
  status?: import('../prisma/client/client.js').Prisma.VenueCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.VenueCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VenueCreateInput['updatedAt']
}
type ResolvedVenueUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['tenant']
  key?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['key']
  name?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['name']
  countryCode?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['countryCode']
  timezone?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['timezone']
  address?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['address']
  status?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.VenueUpdateInput['updatedAt']
}
type ResolvedWagerExposureAllocationCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['wager']
  market?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['market']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['stakeMinor']
  liabilityMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['liabilityMinor']
  remainingStakeMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['remainingStakeMinor']
  remainingLiabilityMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['remainingLiabilityMinor']
  version: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['version']
  status?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationCreateInput['updatedAt']
}
type ResolvedWagerExposureAllocationUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['wager']
  market?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['market']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['stakeMinor']
  liabilityMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['liabilityMinor']
  remainingStakeMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['remainingStakeMinor']
  remainingLiabilityMinor?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['remainingLiabilityMinor']
  version?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['version']
  status?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['status']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerExposureAllocationUpdateInput['updatedAt']
}
type ResolvedWagerPartCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['wager']
  partIndex: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['partIndex']
  combinationKey?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['combinationKey']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['stakeMinor']
  decimalOdds?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['decimalOdds']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['potentialReturnMinor']
  status?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['status']
  gradeSummary?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['gradeSummary']
  settlement?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['settlement']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerPartCreateInput['updatedAt']
}
type ResolvedWagerPartUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['tenant']
  wager?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['wager']
  partIndex?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['partIndex']
  combinationKey?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['combinationKey']
  stakeMinor?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['stakeMinor']
  decimalOdds?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['decimalOdds']
  potentialReturnMinor?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['potentialReturnMinor']
  status?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['status']
  gradeSummary?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['gradeSummary']
  settlement?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['settlement']
  createdAt?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WagerPartUpdateInput['updatedAt']
}
type ResolvedWebhookDeliveryCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['tenant']
  endpoint?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['endpoint']
  outboxMessage?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['outboxMessage']
  deliveryId?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['deliveryId']
  eventType?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['eventType']
  eventVersion?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['eventVersion']
  payloadHash?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['payloadHash']
  signatureKeyId?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['signatureKeyId']
  status?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['attempts']
  availableAt: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['availableAt']
  deliveredAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['deliveredAt']
  lastResponseCode?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['lastResponseCode']
  lastError?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryCreateInput['updatedAt']
}
type ResolvedWebhookDeliveryUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['tenant']
  endpoint?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['endpoint']
  outboxMessage?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['outboxMessage']
  deliveryId?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['deliveryId']
  eventType?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['eventType']
  eventVersion?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['eventVersion']
  payloadHash?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['payloadHash']
  signatureKeyId?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['signatureKeyId']
  status?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['status']
  attempts?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['attempts']
  availableAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['availableAt']
  deliveredAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['deliveredAt']
  lastResponseCode?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['lastResponseCode']
  lastError?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['lastError']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookDeliveryUpdateInput['updatedAt']
}
type ResolvedWebhookEndpointCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['id']
  tenant?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['name']
  url?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['url']
  secretReference?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['secretReference']
  eventTypes?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['eventTypes']
  status?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['status']
  failureCount?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['failureCount']
  disabledAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['disabledAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointCreateInput['updatedAt']
}
type ResolvedWebhookEndpointUpdateInput = {
  id?: undefined
  tenant?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['tenant']
  name?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['name']
  url?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['url']
  secretReference?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['secretReference']
  eventTypes?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['eventTypes']
  status?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['status']
  failureCount?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['failureCount']
  disabledAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['disabledAt']
  approvalRequest?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['approvalRequest']
  createdAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WebhookEndpointUpdateInput['updatedAt']
}
type ResolvedWorkerHeartbeatCreateInput = {
  id?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['id']
  workerId?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['workerId']
  status?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['status']
  startedAt: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['startedAt']
  heartbeatAt: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['heartbeatAt']
  stoppedAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['stoppedAt']
  buildVersion?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['buildVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatCreateInput['updatedAt']
}
type ResolvedWorkerHeartbeatUpdateInput = {
  id?: undefined
  workerId?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['workerId']
  status?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['status']
  startedAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['startedAt']
  heartbeatAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['heartbeatAt']
  stoppedAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['stoppedAt']
  buildVersion?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['buildVersion']
  createdAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['createdAt']
  updatedAt?: import('../prisma/client/client.js').Prisma.WorkerHeartbeatUpdateInput['updatedAt']
}

export declare namespace Lists {
  export type User<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.User.TypeInfo<Session>>
  namespace User {
    export type Item = import('../prisma/client/client.js').User
    export type TypeInfo<Session = any> = {
      key: 'User'
      isSingleton: false
      fields: 'id' | 'name' | 'email' | 'passwordResetToken' | 'passwordResetIssuedAt' | 'passwordResetRedeemedAt' | 'operatorMfaEnabled' | 'operatorMfaSecret' | 'operatorMfaRecoveryHashes' | 'operatorMfaFailedAttempts' | 'operatorMfaLockedUntil' | 'operatorMfaEnrolledAt' | 'password' | 'tenant' | 'createdAt' | 'updatedAt' | 'onboardingStatus' | 'role'
      actions: never
      item: Item
      inputs: {
        where: UserWhereInput
        uniqueWhere: UserWhereUniqueInput
        create: UserCreateInput
        update: UserUpdateInput
        orderBy: UserOrderByInput
      }
      prisma: {
        create: ResolvedUserCreateInput
        update: ResolvedUserUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Role<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Role.TypeInfo<Session>>
  namespace Role {
    export type Item = import('../prisma/client/client.js').Role
    export type TypeInfo<Session = any> = {
      key: 'Role'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'canSeeOtherPeople' | 'canEditOtherPeople' | 'canManagePeople' | 'canManageRoles' | 'canAccessDashboard' | 'canManageSportsbook' | 'canTrade' | 'canManageRisk' | 'canManageCompliance' | 'canManageFinance' | 'canManageIntegrations' | 'canApproveSensitiveActions' | 'canReadAudit' | 'createdAt' | 'updatedAt' | 'assignedTo'
      actions: never
      item: Item
      inputs: {
        where: RoleWhereInput
        uniqueWhere: RoleWhereUniqueInput
        create: RoleCreateInput
        update: RoleUpdateInput
        orderBy: RoleOrderByInput
      }
      prisma: {
        create: ResolvedRoleCreateInput
        update: ResolvedRoleUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AcceptanceDecision<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AcceptanceDecision.TypeInfo<Session>>
  namespace AcceptanceDecision {
    export type Item = import('../prisma/client/client.js').AcceptanceDecision
    export type TypeInfo<Session = any> = {
      key: 'AcceptanceDecision'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'quote' | 'accepted' | 'rejectionCode' | 'gateResults' | 'inputHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AcceptanceDecisionWhereInput
        uniqueWhere: AcceptanceDecisionWhereUniqueInput
        create: AcceptanceDecisionCreateInput
        update: AcceptanceDecisionUpdateInput
        orderBy: AcceptanceDecisionOrderByInput
      }
      prisma: {
        create: ResolvedAcceptanceDecisionCreateInput
        update: ResolvedAcceptanceDecisionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AuditEvent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AuditEvent.TypeInfo<Session>>
  namespace AuditEvent {
    export type Item = import('../prisma/client/client.js').AuditEvent
    export type TypeInfo<Session = any> = {
      key: 'AuditEvent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'actorId' | 'action' | 'targetType' | 'targetId' | 'reason' | 'payloadHash' | 'previousHash' | 'hash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AuditEventWhereInput
        uniqueWhere: AuditEventWhereUniqueInput
        create: AuditEventCreateInput
        update: AuditEventUpdateInput
        orderBy: AuditEventOrderByInput
      }
      prisma: {
        create: ResolvedAuditEventCreateInput
        update: ResolvedAuditEventUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Brand<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Brand.TypeInfo<Session>>
  namespace Brand {
    export type Item = import('../prisma/client/client.js').Brand
    export type TypeInfo<Session = any> = {
      key: 'Brand'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'domain' | 'defaultLocale' | 'defaultTimezone' | 'supportedLocales' | 'designTokens' | 'termsReference' | 'logoIcon' | 'logoColor' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BrandWhereInput
        uniqueWhere: BrandWhereUniqueInput
        create: BrandCreateInput
        update: BrandUpdateInput
        orderBy: BrandOrderByInput
      }
      prisma: {
        create: ResolvedBrandCreateInput
        update: ResolvedBrandUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Competition<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Competition.TypeInfo<Session>>
  namespace Competition {
    export type Item = import('../prisma/client/client.js').Competition
    export type TypeInfo<Session = any> = {
      key: 'Competition'
      isSingleton: false
      fields: 'id' | 'tenant' | 'sport' | 'region' | 'key' | 'name' | 'timezone' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CompetitionWhereInput
        uniqueWhere: CompetitionWhereUniqueInput
        create: CompetitionCreateInput
        update: CompetitionUpdateInput
        orderBy: CompetitionOrderByInput
      }
      prisma: {
        create: ResolvedCompetitionCreateInput
        update: ResolvedCompetitionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type DeadLetter<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.DeadLetter.TypeInfo<Session>>
  namespace DeadLetter {
    export type Item = import('../prisma/client/client.js').DeadLetter
    export type TypeInfo<Session = any> = {
      key: 'DeadLetter'
      isSingleton: false
      fields: 'id' | 'tenant' | 'sourceType' | 'sourceId' | 'reason' | 'attempts' | 'payloadReference' | 'resolvedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: DeadLetterWhereInput
        uniqueWhere: DeadLetterWhereUniqueInput
        create: DeadLetterCreateInput
        update: DeadLetterUpdateInput
        orderBy: DeadLetterOrderByInput
      }
      prisma: {
        create: ResolvedDeadLetterCreateInput
        update: ResolvedDeadLetterUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Event<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Event.TypeInfo<Session>>
  namespace Event {
    export type Item = import('../prisma/client/client.js').Event
    export type TypeInfo<Session = any> = {
      key: 'Event'
      isSingleton: false
      fields: 'id' | 'tenant' | 'competition' | 'season' | 'stage' | 'venue' | 'externalKey' | 'name' | 'startAt' | 'status' | 'livePhase' | 'clockSeconds' | 'officialResultStatus' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: EventWhereInput
        uniqueWhere: EventWhereUniqueInput
        create: EventCreateInput
        update: EventUpdateInput
        orderBy: EventOrderByInput
      }
      prisma: {
        create: ResolvedEventCreateInput
        update: ResolvedEventUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Hold<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Hold.TypeInfo<Session>>
  namespace Hold {
    export type Item = import('../prisma/client/client.js').Hold
    export type TypeInfo<Session = any> = {
      key: 'Hold'
      isSingleton: false
      fields: 'id' | 'tenant' | 'account' | 'purposeType' | 'purposeId' | 'amountMinor' | 'status' | 'expiresAt' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: HoldWhereInput
        uniqueWhere: HoldWhereUniqueInput
        create: HoldCreateInput
        update: HoldUpdateInput
        orderBy: HoldOrderByInput
      }
      prisma: {
        create: ResolvedHoldCreateInput
        update: ResolvedHoldUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type InboxMessage<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.InboxMessage.TypeInfo<Session>>
  namespace InboxMessage {
    export type Item = import('../prisma/client/client.js').InboxMessage
    export type TypeInfo<Session = any> = {
      key: 'InboxMessage'
      isSingleton: false
      fields: 'id' | 'tenant' | 'rawEnvelope' | 'messageKey' | 'type' | 'status' | 'attempts' | 'availableAt' | 'leaseUntil' | 'leaseOwner' | 'lastError' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: InboxMessageWhereInput
        uniqueWhere: InboxMessageWhereUniqueInput
        create: InboxMessageCreateInput
        update: InboxMessageUpdateInput
        orderBy: InboxMessageOrderByInput
      }
      prisma: {
        create: ResolvedInboxMessageCreateInput
        update: ResolvedInboxMessageUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type JournalEntry<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.JournalEntry.TypeInfo<Session>>
  namespace JournalEntry {
    export type Item = import('../prisma/client/client.js').JournalEntry
    export type TypeInfo<Session = any> = {
      key: 'JournalEntry'
      isSingleton: false
      fields: 'id' | 'tenant' | 'transaction' | 'account' | 'side' | 'amountMinor' | 'currency' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: JournalEntryWhereInput
        uniqueWhere: JournalEntryWhereUniqueInput
        create: JournalEntryCreateInput
        update: JournalEntryUpdateInput
        orderBy: JournalEntryOrderByInput
      }
      prisma: {
        create: ResolvedJournalEntryCreateInput
        update: ResolvedJournalEntryUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type JournalTransaction<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.JournalTransaction.TypeInfo<Session>>
  namespace JournalTransaction {
    export type Item = import('../prisma/client/client.js').JournalTransaction
    export type TypeInfo<Session = any> = {
      key: 'JournalTransaction'
      isSingleton: false
      fields: 'id' | 'tenant' | 'type' | 'idempotencyKey' | 'correlationId' | 'status' | 'reversalOf' | 'effectiveAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: JournalTransactionWhereInput
        uniqueWhere: JournalTransactionWhereUniqueInput
        create: JournalTransactionCreateInput
        update: JournalTransactionUpdateInput
        orderBy: JournalTransactionOrderByInput
      }
      prisma: {
        create: ResolvedJournalTransactionCreateInput
        update: ResolvedJournalTransactionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Jurisdiction<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Jurisdiction.TypeInfo<Session>>
  namespace Jurisdiction {
    export type Item = import('../prisma/client/client.js').Jurisdiction
    export type TypeInfo<Session = any> = {
      key: 'Jurisdiction'
      isSingleton: false
      fields: 'id' | 'code' | 'authority' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: JurisdictionWhereInput
        uniqueWhere: JurisdictionWhereUniqueInput
        create: JurisdictionCreateInput
        update: JurisdictionUpdateInput
        orderBy: JurisdictionOrderByInput
      }
      prisma: {
        create: ResolvedJurisdictionCreateInput
        update: ResolvedJurisdictionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LedgerAccount<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LedgerAccount.TypeInfo<Session>>
  namespace LedgerAccount {
    export type Item = import('../prisma/client/client.js').LedgerAccount
    export type TypeInfo<Session = any> = {
      key: 'LedgerAccount'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'key' | 'accountClass' | 'currency' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LedgerAccountWhereInput
        uniqueWhere: LedgerAccountWhereUniqueInput
        create: LedgerAccountCreateInput
        update: LedgerAccountUpdateInput
        orderBy: LedgerAccountOrderByInput
      }
      prisma: {
        create: ResolvedLedgerAccountCreateInput
        update: ResolvedLedgerAccountUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Market<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Market.TypeInfo<Session>>
  namespace Market {
    export type Item = import('../prisma/client/client.js').Market
    export type TypeInfo<Session = any> = {
      key: 'Market'
      isSingleton: false
      fields: 'id' | 'tenant' | 'event' | 'definition' | 'definitionKey' | 'parameters' | 'tradingMode' | 'line' | 'marginBasisPoints' | 'cashOutEnabled' | 'status' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: MarketWhereInput
        uniqueWhere: MarketWhereUniqueInput
        create: MarketCreateInput
        update: MarketUpdateInput
        orderBy: MarketOrderByInput
      }
      prisma: {
        create: ResolvedMarketCreateInput
        update: ResolvedMarketUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type OperatorJurisdiction<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.OperatorJurisdiction.TypeInfo<Session>>
  namespace OperatorJurisdiction {
    export type Item = import('../prisma/client/client.js').OperatorJurisdiction
    export type TypeInfo<Session = any> = {
      key: 'OperatorJurisdiction'
      isSingleton: false
      fields: 'id' | 'tenant' | 'jurisdiction' | 'licenseReference' | 'policyVersion' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: OperatorJurisdictionWhereInput
        uniqueWhere: OperatorJurisdictionWhereUniqueInput
        create: OperatorJurisdictionCreateInput
        update: OperatorJurisdictionUpdateInput
        orderBy: OperatorJurisdictionOrderByInput
      }
      prisma: {
        create: ResolvedOperatorJurisdictionCreateInput
        update: ResolvedOperatorJurisdictionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type OutboxMessage<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.OutboxMessage.TypeInfo<Session>>
  namespace OutboxMessage {
    export type Item = import('../prisma/client/client.js').OutboxMessage
    export type TypeInfo<Session = any> = {
      key: 'OutboxMessage'
      isSingleton: false
      fields: 'id' | 'tenant' | 'aggregateType' | 'aggregateId' | 'eventType' | 'payload' | 'status' | 'attempts' | 'maxAttempts' | 'availableAt' | 'leaseUntil' | 'leaseOwner' | 'lastError' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: OutboxMessageWhereInput
        uniqueWhere: OutboxMessageWhereUniqueInput
        create: OutboxMessageCreateInput
        update: OutboxMessageUpdateInput
        orderBy: OutboxMessageOrderByInput
      }
      prisma: {
        create: ResolvedOutboxMessageCreateInput
        update: ResolvedOutboxMessageUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Player<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Player.TypeInfo<Session>>
  namespace Player {
    export type Item = import('../prisma/client/client.js').Player
    export type TypeInfo<Session = any> = {
      key: 'Player'
      isSingleton: false
      fields: 'id' | 'tenant' | 'brand' | 'subject' | 'status' | 'kycStatus' | 'locale' | 'timezone' | 'preferredOddsFormat' | 'marketingAllowed' | 'riskBand' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PlayerWhereInput
        uniqueWhere: PlayerWhereUniqueInput
        create: PlayerCreateInput
        update: PlayerUpdateInput
        orderBy: PlayerOrderByInput
      }
      prisma: {
        create: ResolvedPlayerCreateInput
        update: ResolvedPlayerUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PlayerLimit<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PlayerLimit.TypeInfo<Session>>
  namespace PlayerLimit {
    export type Item = import('../prisma/client/client.js').PlayerLimit
    export type TypeInfo<Session = any> = {
      key: 'PlayerLimit'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'type' | 'period' | 'amountMinor' | 'currency' | 'effectiveFrom' | 'effectiveTo' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PlayerLimitWhereInput
        uniqueWhere: PlayerLimitWhereUniqueInput
        create: PlayerLimitCreateInput
        update: PlayerLimitUpdateInput
        orderBy: PlayerLimitOrderByInput
      }
      prisma: {
        create: ResolvedPlayerLimitCreateInput
        update: ResolvedPlayerLimitUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PriceSnapshot<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PriceSnapshot.TypeInfo<Session>>
  namespace PriceSnapshot {
    export type Item = import('../prisma/client/client.js').PriceSnapshot
    export type TypeInfo<Session = any> = {
      key: 'PriceSnapshot'
      isSingleton: false
      fields: 'id' | 'tenant' | 'selection' | 'providerConnection' | 'decimalOdds' | 'line' | 'sequence' | 'effectiveAt' | 'receivedAt' | 'rawEnvelope' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PriceSnapshotWhereInput
        uniqueWhere: PriceSnapshotWhereUniqueInput
        create: PriceSnapshotCreateInput
        update: PriceSnapshotUpdateInput
        orderBy: PriceSnapshotOrderByInput
      }
      prisma: {
        create: ResolvedPriceSnapshotCreateInput
        update: ResolvedPriceSnapshotUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ProviderConnection<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ProviderConnection.TypeInfo<Session>>
  namespace ProviderConnection {
    export type Item = import('../prisma/client/client.js').ProviderConnection
    export type TypeInfo<Session = any> = {
      key: 'ProviderConnection'
      isSingleton: false
      fields: 'id' | 'tenant' | 'legalEntity' | 'jurisdiction' | 'adapterId' | 'adapterVersion' | 'configReference' | 'secretReference' | 'dataResidencyRegion' | 'failoverPriority' | 'capabilities' | 'certificationStatus' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ProviderConnectionWhereInput
        uniqueWhere: ProviderConnectionWhereUniqueInput
        create: ProviderConnectionCreateInput
        update: ProviderConnectionUpdateInput
        orderBy: ProviderConnectionOrderByInput
      }
      prisma: {
        create: ResolvedProviderConnectionCreateInput
        update: ResolvedProviderConnectionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Quote<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Quote.TypeInfo<Session>>
  namespace Quote {
    export type Item = import('../prisma/client/client.js').Quote
    export type TypeInfo<Session = any> = {
      key: 'Quote'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'selection' | 'priceSnapshot' | 'structure' | 'promotion' | 'legCount' | 'partCount' | 'stakeMinor' | 'potentialReturnMinor' | 'currency' | 'decimalOdds' | 'priceChangeConsent' | 'liveDelayMs' | 'expiresAt' | 'termsHash' | 'policyVersion' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: QuoteWhereInput
        uniqueWhere: QuoteWhereUniqueInput
        create: QuoteCreateInput
        update: QuoteUpdateInput
        orderBy: QuoteOrderByInput
      }
      prisma: {
        create: ResolvedQuoteCreateInput
        update: ResolvedQuoteUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type RawEnvelope<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.RawEnvelope.TypeInfo<Session>>
  namespace RawEnvelope {
    export type Item = import('../prisma/client/client.js').RawEnvelope
    export type TypeInfo<Session = any> = {
      key: 'RawEnvelope'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'direction' | 'externalId' | 'schemaVersion' | 'payload' | 'payloadHash' | 'receivedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: RawEnvelopeWhereInput
        uniqueWhere: RawEnvelopeWhereUniqueInput
        create: RawEnvelopeCreateInput
        update: RawEnvelopeUpdateInput
        orderBy: RawEnvelopeOrderByInput
      }
      prisma: {
        create: ResolvedRawEnvelopeCreateInput
        update: ResolvedRawEnvelopeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ResultVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ResultVersion.TypeInfo<Session>>
  namespace ResultVersion {
    export type Item = import('../prisma/client/client.js').ResultVersion
    export type TypeInfo<Session = any> = {
      key: 'ResultVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'event' | 'providerConnection' | 'version' | 'status' | 'payload' | 'payloadHash' | 'approvedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ResultVersionWhereInput
        uniqueWhere: ResultVersionWhereUniqueInput
        create: ResultVersionCreateInput
        update: ResultVersionUpdateInput
        orderBy: ResultVersionOrderByInput
      }
      prisma: {
        create: ResolvedResultVersionCreateInput
        update: ResolvedResultVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Selection<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Selection.TypeInfo<Session>>
  namespace Selection {
    export type Item = import('../prisma/client/client.js').Selection
    export type TypeInfo<Session = any> = {
      key: 'Selection'
      isSingleton: false
      fields: 'id' | 'tenant' | 'market' | 'key' | 'label' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SelectionWhereInput
        uniqueWhere: SelectionWhereUniqueInput
        create: SelectionCreateInput
        update: SelectionUpdateInput
        orderBy: SelectionOrderByInput
      }
      prisma: {
        create: ResolvedSelectionCreateInput
        update: ResolvedSelectionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SelfExclusion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SelfExclusion.TypeInfo<Session>>
  namespace SelfExclusion {
    export type Item = import('../prisma/client/client.js').SelfExclusion
    export type TypeInfo<Session = any> = {
      key: 'SelfExclusion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'scope' | 'startsAt' | 'endsAt' | 'status' | 'source' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SelfExclusionWhereInput
        uniqueWhere: SelfExclusionWhereUniqueInput
        create: SelfExclusionCreateInput
        update: SelfExclusionUpdateInput
        orderBy: SelfExclusionOrderByInput
      }
      prisma: {
        create: ResolvedSelfExclusionCreateInput
        update: ResolvedSelfExclusionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Settlement<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Settlement.TypeInfo<Session>>
  namespace Settlement {
    export type Item = import('../prisma/client/client.js').Settlement
    export type TypeInfo<Session = any> = {
      key: 'Settlement'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'resultVersion' | 'settlementRun' | 'version' | 'outcome' | 'grossPayoutMinor' | 'taxMinor' | 'payoutMinor' | 'inputHash' | 'journalTransaction' | 'reversalOf' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SettlementWhereInput
        uniqueWhere: SettlementWhereUniqueInput
        create: SettlementCreateInput
        update: SettlementUpdateInput
        orderBy: SettlementOrderByInput
      }
      prisma: {
        create: ResolvedSettlementCreateInput
        update: ResolvedSettlementUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Sport<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Sport.TypeInfo<Session>>
  namespace Sport {
    export type Item = import('../prisma/client/client.js').Sport
    export type TypeInfo<Session = any> = {
      key: 'Sport'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'active' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SportWhereInput
        uniqueWhere: SportWhereUniqueInput
        create: SportCreateInput
        update: SportUpdateInput
        orderBy: SportOrderByInput
      }
      prisma: {
        create: ResolvedSportCreateInput
        update: ResolvedSportUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Tenant<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Tenant.TypeInfo<Session>>
  namespace Tenant {
    export type Item = import('../prisma/client/client.js').Tenant
    export type TypeInfo<Session = any> = {
      key: 'Tenant'
      isSingleton: false
      fields: 'id' | 'name' | 'slug' | 'status' | 'defaultTimezone' | 'supportedLocales' | 'dataResidencyRegion' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TenantWhereInput
        uniqueWhere: TenantWhereUniqueInput
        create: TenantCreateInput
        update: TenantUpdateInput
        orderBy: TenantOrderByInput
      }
      prisma: {
        create: ResolvedTenantCreateInput
        update: ResolvedTenantUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Wager<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Wager.TypeInfo<Session>>
  namespace Wager {
    export type Item = import('../prisma/client/client.js').Wager
    export type TypeInfo<Session = any> = {
      key: 'Wager'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'quote' | 'legalEntity' | 'operatorJurisdiction' | 'brand' | 'channel' | 'structure' | 'promotion' | 'bonusAward' | 'version' | 'idempotencyKey' | 'stakeMinor' | 'potentialReturnMinor' | 'maxPayoutMinor' | 'currency' | 'termsHash' | 'priceChangeConsent' | 'liveDelayMs' | 'requestedAt' | 'status' | 'acceptedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WagerWhereInput
        uniqueWhere: WagerWhereUniqueInput
        create: WagerCreateInput
        update: WagerUpdateInput
        orderBy: WagerOrderByInput
      }
      prisma: {
        create: ResolvedWagerCreateInput
        update: ResolvedWagerUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WagerLeg<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WagerLeg.TypeInfo<Session>>
  namespace WagerLeg {
    export type Item = import('../prisma/client/client.js').WagerLeg
    export type TypeInfo<Session = any> = {
      key: 'WagerLeg'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'wagerPart' | 'legIndex' | 'eventKey' | 'marketKey' | 'selectionKey' | 'snapshotId' | 'decimalOdds' | 'line' | 'ruleVersion' | 'correlationGroupKey' | 'live' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WagerLegWhereInput
        uniqueWhere: WagerLegWhereUniqueInput
        create: WagerLegCreateInput
        update: WagerLegUpdateInput
        orderBy: WagerLegOrderByInput
      }
      prisma: {
        create: ResolvedWagerLegCreateInput
        update: ResolvedWagerLegUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AMLCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AMLCase.TypeInfo<Session>>
  namespace AMLCase {
    export type Item = import('../prisma/client/client.js').AMLCase
    export type TypeInfo<Session = any> = {
      key: 'AMLCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'status' | 'riskBand' | 'restrictedEvidence' | 'ownerId' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AMLCaseWhereInput
        uniqueWhere: AMLCaseWhereUniqueInput
        create: AMLCaseCreateInput
        update: AMLCaseUpdateInput
        orderBy: AMLCaseOrderByInput
      }
      prisma: {
        create: ResolvedAMLCaseCreateInput
        update: ResolvedAMLCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AccountRestriction<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AccountRestriction.TypeInfo<Session>>
  namespace AccountRestriction {
    export type Item = import('../prisma/client/client.js').AccountRestriction
    export type TypeInfo<Session = any> = {
      key: 'AccountRestriction'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'capability' | 'reasonCode' | 'startsAt' | 'endsAt' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AccountRestrictionWhereInput
        uniqueWhere: AccountRestrictionWhereUniqueInput
        create: AccountRestrictionCreateInput
        update: AccountRestrictionUpdateInput
        orderBy: AccountRestrictionOrderByInput
      }
      prisma: {
        create: ResolvedAccountRestrictionCreateInput
        update: ResolvedAccountRestrictionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ApiRateBucket<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ApiRateBucket.TypeInfo<Session>>
  namespace ApiRateBucket {
    export type Item = import('../prisma/client/client.js').ApiRateBucket
    export type TypeInfo<Session = any> = {
      key: 'ApiRateBucket'
      isSingleton: false
      fields: 'id' | 'tenant' | 'keyHash' | 'scope' | 'windowStartedAt' | 'count' | 'expiresAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ApiRateBucketWhereInput
        uniqueWhere: ApiRateBucketWhereUniqueInput
        create: ApiRateBucketCreateInput
        update: ApiRateBucketUpdateInput
        orderBy: ApiRateBucketOrderByInput
      }
      prisma: {
        create: ResolvedApiRateBucketCreateInput
        update: ResolvedApiRateBucketUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ApprovalRequest<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ApprovalRequest.TypeInfo<Session>>
  namespace ApprovalRequest {
    export type Item = import('../prisma/client/client.js').ApprovalRequest
    export type TypeInfo<Session = any> = {
      key: 'ApprovalRequest'
      isSingleton: false
      fields: 'id' | 'tenant' | 'action' | 'payloadHash' | 'requesterId' | 'approverId' | 'status' | 'reason' | 'decidedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ApprovalRequestWhereInput
        uniqueWhere: ApprovalRequestWhereUniqueInput
        create: ApprovalRequestCreateInput
        update: ApprovalRequestUpdateInput
        orderBy: ApprovalRequestOrderByInput
      }
      prisma: {
        create: ResolvedApprovalRequestCreateInput
        update: ResolvedApprovalRequestUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AuditAnchor<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AuditAnchor.TypeInfo<Session>>
  namespace AuditAnchor {
    export type Item = import('../prisma/client/client.js').AuditAnchor
    export type TypeInfo<Session = any> = {
      key: 'AuditAnchor'
      isSingleton: false
      fields: 'id' | 'tenant' | 'chainHeadHash' | 'eventCount' | 'anchoredAt' | 'externalReference' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AuditAnchorWhereInput
        uniqueWhere: AuditAnchorWhereUniqueInput
        create: AuditAnchorCreateInput
        update: AuditAnchorUpdateInput
        orderBy: AuditAnchorOrderByInput
      }
      prisma: {
        create: ResolvedAuditAnchorCreateInput
        update: ResolvedAuditAnchorUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BalanceProjection<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BalanceProjection.TypeInfo<Session>>
  namespace BalanceProjection {
    export type Item = import('../prisma/client/client.js').BalanceProjection
    export type TypeInfo<Session = any> = {
      key: 'BalanceProjection'
      isSingleton: false
      fields: 'id' | 'tenant' | 'account' | 'postedMinor' | 'pendingMinor' | 'availableMinor' | 'version' | 'asOf' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BalanceProjectionWhereInput
        uniqueWhere: BalanceProjectionWhereUniqueInput
        create: BalanceProjectionCreateInput
        update: BalanceProjectionUpdateInput
        orderBy: BalanceProjectionOrderByInput
      }
      prisma: {
        create: ResolvedBalanceProjectionCreateInput
        update: ResolvedBalanceProjectionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BetSlip<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BetSlip.TypeInfo<Session>>
  namespace BetSlip {
    export type Item = import('../prisma/client/client.js').BetSlip
    export type TypeInfo<Session = any> = {
      key: 'BetSlip'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'currency' | 'status' | 'expiresAt' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BetSlipWhereInput
        uniqueWhere: BetSlipWhereUniqueInput
        create: BetSlipCreateInput
        update: BetSlipUpdateInput
        orderBy: BetSlipOrderByInput
      }
      prisma: {
        create: ResolvedBetSlipCreateInput
        update: ResolvedBetSlipUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BetSlipItem<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BetSlipItem.TypeInfo<Session>>
  namespace BetSlipItem {
    export type Item = import('../prisma/client/client.js').BetSlipItem
    export type TypeInfo<Session = any> = {
      key: 'BetSlipItem'
      isSingleton: false
      fields: 'id' | 'tenant' | 'betSlip' | 'selection' | 'priceSnapshot' | 'requestedOdds' | 'line' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BetSlipItemWhereInput
        uniqueWhere: BetSlipItemWhereUniqueInput
        create: BetSlipItemCreateInput
        update: BetSlipItemUpdateInput
        orderBy: BetSlipItemOrderByInput
      }
      prisma: {
        create: ResolvedBetSlipItemCreateInput
        update: ResolvedBetSlipItemUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CashOutOffer<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CashOutOffer.TypeInfo<Session>>
  namespace CashOutOffer {
    export type Item = import('../prisma/client/client.js').CashOutOffer
    export type TypeInfo<Session = any> = {
      key: 'CashOutOffer'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'amountMinor' | 'currency' | 'portionNumerator' | 'portionDenominator' | 'feeMinor' | 'marginBasisPoints' | 'valuationInputs' | 'valuationHash' | 'wagerVersion' | 'offeredAt' | 'expiresAt' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CashOutOfferWhereInput
        uniqueWhere: CashOutOfferWhereUniqueInput
        create: CashOutOfferCreateInput
        update: CashOutOfferUpdateInput
        orderBy: CashOutOfferOrderByInput
      }
      prisma: {
        create: ResolvedCashOutOfferCreateInput
        update: ResolvedCashOutOfferUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Competitor<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Competitor.TypeInfo<Session>>
  namespace Competitor {
    export type Item = import('../prisma/client/client.js').Competitor
    export type TypeInfo<Session = any> = {
      key: 'Competitor'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CompetitorWhereInput
        uniqueWhere: CompetitorWhereUniqueInput
        create: CompetitorCreateInput
        update: CompetitorUpdateInput
        orderBy: CompetitorOrderByInput
      }
      prisma: {
        create: ResolvedCompetitorCreateInput
        update: ResolvedCompetitorUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ComplianceReport<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ComplianceReport.TypeInfo<Session>>
  namespace ComplianceReport {
    export type Item = import('../prisma/client/client.js').ComplianceReport
    export type TypeInfo<Session = any> = {
      key: 'ComplianceReport'
      isSingleton: false
      fields: 'id' | 'tenant' | 'type' | 'periodStart' | 'periodEnd' | 'version' | 'artifactHash' | 'artifactReference' | 'status' | 'submittedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ComplianceReportWhereInput
        uniqueWhere: ComplianceReportWhereUniqueInput
        create: ComplianceReportCreateInput
        update: ComplianceReportUpdateInput
        orderBy: ComplianceReportOrderByInput
      }
      prisma: {
        create: ResolvedComplianceReportCreateInput
        update: ResolvedComplianceReportUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ConfigValue<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ConfigValue.TypeInfo<Session>>
  namespace ConfigValue {
    export type Item = import('../prisma/client/client.js').ConfigValue
    export type TypeInfo<Session = any> = {
      key: 'ConfigValue'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'value' | 'valueType' | 'scopeType' | 'scopeId' | 'policyVersion' | 'effectiveFrom' | 'effectiveTo' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ConfigValueWhereInput
        uniqueWhere: ConfigValueWhereUniqueInput
        create: ConfigValueCreateInput
        update: ConfigValueUpdateInput
        orderBy: ConfigValueOrderByInput
      }
      prisma: {
        create: ResolvedConfigValueCreateInput
        update: ResolvedConfigValueUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Consent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Consent.TypeInfo<Session>>
  namespace Consent {
    export type Item = import('../prisma/client/client.js').Consent
    export type TypeInfo<Session = any> = {
      key: 'Consent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'type' | 'policyVersion' | 'givenAt' | 'withdrawnAt' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ConsentWhereInput
        uniqueWhere: ConsentWhereUniqueInput
        create: ConsentCreateInput
        update: ConsentUpdateInput
        orderBy: ConsentOrderByInput
      }
      prisma: {
        create: ResolvedConsentCreateInput
        update: ResolvedConsentUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type DataCorrectionCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.DataCorrectionCase.TypeInfo<Session>>
  namespace DataCorrectionCase {
    export type Item = import('../prisma/client/client.js').DataCorrectionCase
    export type TypeInfo<Session = any> = {
      key: 'DataCorrectionCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'scopeType' | 'scopeId' | 'reason' | 'dryRunHash' | 'approvalRequest' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: DataCorrectionCaseWhereInput
        uniqueWhere: DataCorrectionCaseWhereUniqueInput
        create: DataCorrectionCaseCreateInput
        update: DataCorrectionCaseUpdateInput
        orderBy: DataCorrectionCaseOrderByInput
      }
      prisma: {
        create: ResolvedDataCorrectionCaseCreateInput
        update: ResolvedDataCorrectionCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Dispute<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Dispute.TypeInfo<Session>>
  namespace Dispute {
    export type Item = import('../prisma/client/client.js').Dispute
    export type TypeInfo<Session = any> = {
      key: 'Dispute'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'wager' | 'category' | 'status' | 'evidence' | 'resolution' | 'approvalRequest' | 'resolvedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: DisputeWhereInput
        uniqueWhere: DisputeWhereUniqueInput
        create: DisputeCreateInput
        update: DisputeUpdateInput
        orderBy: DisputeOrderByInput
      }
      prisma: {
        create: ResolvedDisputeCreateInput
        update: ResolvedDisputeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type DisputeEvent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.DisputeEvent.TypeInfo<Session>>
  namespace DisputeEvent {
    export type Item = import('../prisma/client/client.js').DisputeEvent
    export type TypeInfo<Session = any> = {
      key: 'DisputeEvent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'dispute' | 'type' | 'actorId' | 'evidenceHash' | 'details' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: DisputeEventWhereInput
        uniqueWhere: DisputeEventWhereUniqueInput
        create: DisputeEventCreateInput
        update: DisputeEventUpdateInput
        orderBy: DisputeEventOrderByInput
      }
      prisma: {
        create: ResolvedDisputeEventCreateInput
        update: ResolvedDisputeEventUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type EventParticipant<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.EventParticipant.TypeInfo<Session>>
  namespace EventParticipant {
    export type Item = import('../prisma/client/client.js').EventParticipant
    export type TypeInfo<Session = any> = {
      key: 'EventParticipant'
      isSingleton: false
      fields: 'id' | 'tenant' | 'event' | 'competitor' | 'role' | 'sortOrder' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: EventParticipantWhereInput
        uniqueWhere: EventParticipantWhereUniqueInput
        create: EventParticipantCreateInput
        update: EventParticipantUpdateInput
        orderBy: EventParticipantOrderByInput
      }
      prisma: {
        create: ResolvedEventParticipantCreateInput
        update: ResolvedEventParticipantUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ExposurePosition<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ExposurePosition.TypeInfo<Session>>
  namespace ExposurePosition {
    export type Item = import('../prisma/client/client.js').ExposurePosition
    export type TypeInfo<Session = any> = {
      key: 'ExposurePosition'
      isSingleton: false
      fields: 'id' | 'tenant' | 'scopeType' | 'scopeId' | 'currency' | 'stakeMinor' | 'liabilityMinor' | 'version' | 'asOf' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ExposurePositionWhereInput
        uniqueWhere: ExposurePositionWhereUniqueInput
        create: ExposurePositionCreateInput
        update: ExposurePositionUpdateInput
        orderBy: ExposurePositionOrderByInput
      }
      prisma: {
        create: ResolvedExposurePositionCreateInput
        update: ResolvedExposurePositionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type GeoCheck<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.GeoCheck.TypeInfo<Session>>
  namespace GeoCheck {
    export type Item = import('../prisma/client/client.js').GeoCheck
    export type TypeInfo<Session = any> = {
      key: 'GeoCheck'
      isSingleton: false
      fields: 'id' | 'tenant' | 'geoSession' | 'providerConnection' | 'decision' | 'reasonCode' | 'coarseEvidence' | 'checkedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: GeoCheckWhereInput
        uniqueWhere: GeoCheckWhereUniqueInput
        create: GeoCheckCreateInput
        update: GeoCheckUpdateInput
        orderBy: GeoCheckOrderByInput
      }
      prisma: {
        create: ResolvedGeoCheckCreateInput
        update: ResolvedGeoCheckUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type GeoSession<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.GeoSession.TypeInfo<Session>>
  namespace GeoSession {
    export type Item = import('../prisma/client/client.js').GeoSession
    export type TypeInfo<Session = any> = {
      key: 'GeoSession'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'sessionKey' | 'status' | 'expiresAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: GeoSessionWhereInput
        uniqueWhere: GeoSessionWhereUniqueInput
        create: GeoSessionCreateInput
        update: GeoSessionUpdateInput
        orderBy: GeoSessionOrderByInput
      }
      prisma: {
        create: ResolvedGeoSessionCreateInput
        update: ResolvedGeoSessionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Incident<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Incident.TypeInfo<Session>>
  namespace Incident {
    export type Item = import('../prisma/client/client.js').Incident
    export type TypeInfo<Session = any> = {
      key: 'Incident'
      isSingleton: false
      fields: 'id' | 'tenant' | 'severity' | 'title' | 'status' | 'commanderId' | 'evidence' | 'resolvedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: IncidentWhereInput
        uniqueWhere: IncidentWhereUniqueInput
        create: IncidentCreateInput
        update: IncidentUpdateInput
        orderBy: IncidentOrderByInput
      }
      prisma: {
        create: ResolvedIncidentCreateInput
        update: ResolvedIncidentUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LegGrade<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LegGrade.TypeInfo<Session>>
  namespace LegGrade {
    export type Item = import('../prisma/client/client.js').LegGrade
    export type TypeInfo<Session = any> = {
      key: 'LegGrade'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wagerLeg' | 'marketGrade' | 'outcome' | 'factorNumerator' | 'factorDenominator' | 'inputHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LegGradeWhereInput
        uniqueWhere: LegGradeWhereUniqueInput
        create: LegGradeCreateInput
        update: LegGradeUpdateInput
        orderBy: LegGradeOrderByInput
      }
      prisma: {
        create: ResolvedLegGradeCreateInput
        update: ResolvedLegGradeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LegalHold<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LegalHold.TypeInfo<Session>>
  namespace LegalHold {
    export type Item = import('../prisma/client/client.js').LegalHold
    export type TypeInfo<Session = any> = {
      key: 'LegalHold'
      isSingleton: false
      fields: 'id' | 'tenant' | 'scopeType' | 'scopeId' | 'reason' | 'startsAt' | 'endsAt' | 'status' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LegalHoldWhereInput
        uniqueWhere: LegalHoldWhereUniqueInput
        create: LegalHoldCreateInput
        update: LegalHoldUpdateInput
        orderBy: LegalHoldOrderByInput
      }
      prisma: {
        create: ResolvedLegalHoldCreateInput
        update: ResolvedLegalHoldUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LimitProfile<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LimitProfile.TypeInfo<Session>>
  namespace LimitProfile {
    export type Item = import('../prisma/client/client.js').LimitProfile
    export type TypeInfo<Session = any> = {
      key: 'LimitProfile'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'version' | 'status' | 'effectiveFrom' | 'effectiveTo' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LimitProfileWhereInput
        uniqueWhere: LimitProfileWhereUniqueInput
        create: LimitProfileCreateInput
        update: LimitProfileUpdateInput
        orderBy: LimitProfileOrderByInput
      }
      prisma: {
        create: ResolvedLimitProfileCreateInput
        update: ResolvedLimitProfileUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LimitRule<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LimitRule.TypeInfo<Session>>
  namespace LimitRule {
    export type Item = import('../prisma/client/client.js').LimitRule
    export type TypeInfo<Session = any> = {
      key: 'LimitRule'
      isSingleton: false
      fields: 'id' | 'tenant' | 'profile' | 'scopeType' | 'scopeId' | 'maxStakeMinor' | 'maxPayoutMinor' | 'maxLiabilityMinor' | 'currency' | 'priority' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LimitRuleWhereInput
        uniqueWhere: LimitRuleWhereUniqueInput
        create: LimitRuleCreateInput
        update: LimitRuleUpdateInput
        orderBy: LimitRuleOrderByInput
      }
      prisma: {
        create: ResolvedLimitRuleCreateInput
        update: ResolvedLimitRuleUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type MarketGrade<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.MarketGrade.TypeInfo<Session>>
  namespace MarketGrade {
    export type Item = import('../prisma/client/client.js').MarketGrade
    export type TypeInfo<Session = any> = {
      key: 'MarketGrade'
      isSingleton: false
      fields: 'id' | 'tenant' | 'market' | 'resultVersion' | 'ruleVersion' | 'outcome' | 'factorNumerator' | 'factorDenominator' | 'trace' | 'inputHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: MarketGradeWhereInput
        uniqueWhere: MarketGradeWhereUniqueInput
        create: MarketGradeCreateInput
        update: MarketGradeUpdateInput
        orderBy: MarketGradeOrderByInput
      }
      prisma: {
        create: ResolvedMarketGradeCreateInput
        update: ResolvedMarketGradeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type OnboardingProgress<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.OnboardingProgress.TypeInfo<Session>>
  namespace OnboardingProgress {
    export type Item = import('../prisma/client/client.js').OnboardingProgress
    export type TypeInfo<Session = any> = {
      key: 'OnboardingProgress'
      isSingleton: false
      fields: 'id' | 'tenant' | 'stage' | 'status' | 'evidenceHash' | 'completedAt' | 'details' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: OnboardingProgressWhereInput
        uniqueWhere: OnboardingProgressWhereUniqueInput
        create: OnboardingProgressCreateInput
        update: OnboardingProgressUpdateInput
        orderBy: OnboardingProgressOrderByInput
      }
      prisma: {
        create: ResolvedOnboardingProgressCreateInput
        update: ResolvedOnboardingProgressUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PaymentAttempt<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PaymentAttempt.TypeInfo<Session>>
  namespace PaymentAttempt {
    export type Item = import('../prisma/client/client.js').PaymentAttempt
    export type TypeInfo<Session = any> = {
      key: 'PaymentAttempt'
      isSingleton: false
      fields: 'id' | 'tenant' | 'paymentIntent' | 'attempt' | 'externalReference' | 'status' | 'rawEnvelope' | 'reasonCode' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PaymentAttemptWhereInput
        uniqueWhere: PaymentAttemptWhereUniqueInput
        create: PaymentAttemptCreateInput
        update: PaymentAttemptUpdateInput
        orderBy: PaymentAttemptOrderByInput
      }
      prisma: {
        create: ResolvedPaymentAttemptCreateInput
        update: ResolvedPaymentAttemptUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PaymentIntent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PaymentIntent.TypeInfo<Session>>
  namespace PaymentIntent {
    export type Item = import('../prisma/client/client.js').PaymentIntent
    export type TypeInfo<Session = any> = {
      key: 'PaymentIntent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'type' | 'amountMinor' | 'feeMinor' | 'currency' | 'idempotencyKey' | 'status' | 'providerConnection' | 'paymentMethodReference' | 'providerSessionReference' | 'hold' | 'riskEvidence' | 'completedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PaymentIntentWhereInput
        uniqueWhere: PaymentIntentWhereUniqueInput
        create: PaymentIntentCreateInput
        update: PaymentIntentUpdateInput
        orderBy: PaymentIntentOrderByInput
      }
      prisma: {
        create: ResolvedPaymentIntentCreateInput
        update: ResolvedPaymentIntentUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PlayerIdentity<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PlayerIdentity.TypeInfo<Session>>
  namespace PlayerIdentity {
    export type Item = import('../prisma/client/client.js').PlayerIdentity
    export type TypeInfo<Session = any> = {
      key: 'PlayerIdentity'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'encryptedPayload' | 'tokenizedIdentifiers' | 'encryptionKeyRef' | 'classification' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PlayerIdentityWhereInput
        uniqueWhere: PlayerIdentityWhereUniqueInput
        create: PlayerIdentityCreateInput
        update: PlayerIdentityUpdateInput
        orderBy: PlayerIdentityOrderByInput
      }
      prisma: {
        create: ResolvedPlayerIdentityCreateInput
        update: ResolvedPlayerIdentityUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ProviderEntityMapping<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ProviderEntityMapping.TypeInfo<Session>>
  namespace ProviderEntityMapping {
    export type Item = import('../prisma/client/client.js').ProviderEntityMapping
    export type TypeInfo<Session = any> = {
      key: 'ProviderEntityMapping'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'entityType' | 'externalId' | 'canonicalType' | 'canonicalId' | 'confidence' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ProviderEntityMappingWhereInput
        uniqueWhere: ProviderEntityMappingWhereUniqueInput
        create: ProviderEntityMappingCreateInput
        update: ProviderEntityMappingUpdateInput
        orderBy: ProviderEntityMappingOrderByInput
      }
      prisma: {
        create: ResolvedProviderEntityMappingCreateInput
        update: ResolvedProviderEntityMappingUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ReconciliationItem<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ReconciliationItem.TypeInfo<Session>>
  namespace ReconciliationItem {
    export type Item = import('../prisma/client/client.js').ReconciliationItem
    export type TypeInfo<Session = any> = {
      key: 'ReconciliationItem'
      isSingleton: false
      fields: 'id' | 'tenant' | 'run' | 'internalReference' | 'providerReference' | 'differenceMinor' | 'currency' | 'status' | 'resolutionJournal' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ReconciliationItemWhereInput
        uniqueWhere: ReconciliationItemWhereUniqueInput
        create: ReconciliationItemCreateInput
        update: ReconciliationItemUpdateInput
        orderBy: ReconciliationItemOrderByInput
      }
      prisma: {
        create: ResolvedReconciliationItemCreateInput
        update: ResolvedReconciliationItemUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ReconciliationRun<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ReconciliationRun.TypeInfo<Session>>
  namespace ReconciliationRun {
    export type Item = import('../prisma/client/client.js').ReconciliationRun
    export type TypeInfo<Session = any> = {
      key: 'ReconciliationRun'
      isSingleton: false
      fields: 'id' | 'tenant' | 'type' | 'windowFrom' | 'windowTo' | 'status' | 'inputHash' | 'differenceMinor' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ReconciliationRunWhereInput
        uniqueWhere: ReconciliationRunWhereUniqueInput
        create: ReconciliationRunCreateInput
        update: ReconciliationRunUpdateInput
        orderBy: ReconciliationRunOrderByInput
      }
      prisma: {
        create: ResolvedReconciliationRunCreateInput
        update: ResolvedReconciliationRunUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ResettlementCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ResettlementCase.TypeInfo<Session>>
  namespace ResettlementCase {
    export type Item = import('../prisma/client/client.js').ResettlementCase
    export type TypeInfo<Session = any> = {
      key: 'ResettlementCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'oldSettlement' | 'newResultVersion' | 'reason' | 'approvalRequest' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ResettlementCaseWhereInput
        uniqueWhere: ResettlementCaseWhereUniqueInput
        create: ResettlementCaseCreateInput
        update: ResettlementCaseUpdateInput
        orderBy: ResettlementCaseOrderByInput
      }
      prisma: {
        create: ResolvedResettlementCaseCreateInput
        update: ResolvedResettlementCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type RoleGrant<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.RoleGrant.TypeInfo<Session>>
  namespace RoleGrant {
    export type Item = import('../prisma/client/client.js').RoleGrant
    export type TypeInfo<Session = any> = {
      key: 'RoleGrant'
      isSingleton: false
      fields: 'id' | 'tenant' | 'user' | 'role' | 'team' | 'scope' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: RoleGrantWhereInput
        uniqueWhere: RoleGrantWhereUniqueInput
        create: RoleGrantCreateInput
        update: RoleGrantUpdateInput
        orderBy: RoleGrantOrderByInput
      }
      prisma: {
        create: ResolvedRoleGrantCreateInput
        update: ResolvedRoleGrantUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TaxAssessment<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TaxAssessment.TypeInfo<Session>>
  namespace TaxAssessment {
    export type Item = import('../prisma/client/client.js').TaxAssessment
    export type TypeInfo<Session = any> = {
      key: 'TaxAssessment'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'ruleVersion' | 'basisMinor' | 'amountMinor' | 'currency' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TaxAssessmentWhereInput
        uniqueWhere: TaxAssessmentWhereUniqueInput
        create: TaxAssessmentCreateInput
        update: TaxAssessmentUpdateInput
        orderBy: TaxAssessmentOrderByInput
      }
      prisma: {
        create: ResolvedTaxAssessmentCreateInput
        update: ResolvedTaxAssessmentUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Team<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Team.TypeInfo<Session>>
  namespace Team {
    export type Item = import('../prisma/client/client.js').Team
    export type TypeInfo<Session = any> = {
      key: 'Team'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'status' | 'members' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TeamWhereInput
        uniqueWhere: TeamWhereUniqueInput
        create: TeamCreateInput
        update: TeamUpdateInput
        orderBy: TeamOrderByInput
      }
      prisma: {
        create: ResolvedTeamCreateInput
        update: ResolvedTeamUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TradingStatusChange<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TradingStatusChange.TypeInfo<Session>>
  namespace TradingStatusChange {
    export type Item = import('../prisma/client/client.js').TradingStatusChange
    export type TypeInfo<Session = any> = {
      key: 'TradingStatusChange'
      isSingleton: false
      fields: 'id' | 'tenant' | 'scopeType' | 'scopeId' | 'fromStatus' | 'toStatus' | 'reason' | 'source' | 'actorId' | 'effectiveAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TradingStatusChangeWhereInput
        uniqueWhere: TradingStatusChangeWhereUniqueInput
        create: TradingStatusChangeCreateInput
        update: TradingStatusChangeUpdateInput
        orderBy: TradingStatusChangeOrderByInput
      }
      prisma: {
        create: ResolvedTradingStatusChangeCreateInput
        update: ResolvedTradingStatusChangeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type VerificationCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.VerificationCase.TypeInfo<Session>>
  namespace VerificationCase {
    export type Item = import('../prisma/client/client.js').VerificationCase
    export type TypeInfo<Session = any> = {
      key: 'VerificationCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'providerConnection' | 'type' | 'status' | 'evidenceReference' | 'expiresAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: VerificationCaseWhereInput
        uniqueWhere: VerificationCaseWhereUniqueInput
        create: VerificationCaseCreateInput
        update: VerificationCaseUpdateInput
        orderBy: VerificationCaseOrderByInput
      }
      prisma: {
        create: ResolvedVerificationCaseCreateInput
        update: ResolvedVerificationCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type VerificationCheck<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.VerificationCheck.TypeInfo<Session>>
  namespace VerificationCheck {
    export type Item = import('../prisma/client/client.js').VerificationCheck
    export type TypeInfo<Session = any> = {
      key: 'VerificationCheck'
      isSingleton: false
      fields: 'id' | 'tenant' | 'verificationCase' | 'attempt' | 'decision' | 'reasonCode' | 'rawEnvelope' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: VerificationCheckWhereInput
        uniqueWhere: VerificationCheckWhereUniqueInput
        create: VerificationCheckCreateInput
        update: VerificationCheckUpdateInput
        orderBy: VerificationCheckOrderByInput
      }
      prisma: {
        create: ResolvedVerificationCheckCreateInput
        update: ResolvedVerificationCheckUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WagerStatusEvent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WagerStatusEvent.TypeInfo<Session>>
  namespace WagerStatusEvent {
    export type Item = import('../prisma/client/client.js').WagerStatusEvent
    export type TypeInfo<Session = any> = {
      key: 'WagerStatusEvent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'fromStatus' | 'toStatus' | 'reasonCode' | 'actorId' | 'effectiveAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WagerStatusEventWhereInput
        uniqueWhere: WagerStatusEventWhereUniqueInput
        create: WagerStatusEventCreateInput
        update: WagerStatusEventUpdateInput
        orderBy: WagerStatusEventOrderByInput
      }
      prisma: {
        create: ResolvedWagerStatusEventCreateInput
        update: ResolvedWagerStatusEventUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WebhookReplay<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WebhookReplay.TypeInfo<Session>>
  namespace WebhookReplay {
    export type Item = import('../prisma/client/client.js').WebhookReplay
    export type TypeInfo<Session = any> = {
      key: 'WebhookReplay'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'messageHash' | 'occurredAt' | 'expiresAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WebhookReplayWhereInput
        uniqueWhere: WebhookReplayWhereUniqueInput
        create: WebhookReplayCreateInput
        update: WebhookReplayUpdateInput
        orderBy: WebhookReplayOrderByInput
      }
      prisma: {
        create: ResolvedWebhookReplayCreateInput
        update: ResolvedWebhookReplayUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerCommand<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerCommand.TypeInfo<Session>>
  namespace CustomerCommand {
    export type Item = import('../prisma/client/client.js').CustomerCommand
    export type TypeInfo<Session = any> = {
      key: 'CustomerCommand'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'commandKey' | 'idempotencyKey' | 'type' | 'requestHash' | 'status' | 'result' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerCommandWhereInput
        uniqueWhere: CustomerCommandWhereUniqueInput
        create: CustomerCommandCreateInput
        update: CustomerCommandUpdateInput
        orderBy: CustomerCommandOrderByInput
      }
      prisma: {
        create: ResolvedCustomerCommandCreateInput
        update: ResolvedCustomerCommandUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerQuoteLegTerms<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerQuoteLegTerms.TypeInfo<Session>>
  namespace CustomerQuoteLegTerms {
    export type Item = import('../prisma/client/client.js').CustomerQuoteLegTerms
    export type TypeInfo<Session = any> = {
      key: 'CustomerQuoteLegTerms'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'quote' | 'quoteKey' | 'legIndex' | 'eventId' | 'marketId' | 'selectionId' | 'priceSnapshotId' | 'eventName' | 'marketName' | 'selectionName' | 'decimalOdds' | 'line' | 'live' | 'correlationGroupKey' | 'ruleVersion' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerQuoteLegTermsWhereInput
        uniqueWhere: CustomerQuoteLegTermsWhereUniqueInput
        create: CustomerQuoteLegTermsCreateInput
        update: CustomerQuoteLegTermsUpdateInput
        orderBy: CustomerQuoteLegTermsOrderByInput
      }
      prisma: {
        create: ResolvedCustomerQuoteLegTermsCreateInput
        update: ResolvedCustomerQuoteLegTermsUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerQuoteTerms<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerQuoteTerms.TypeInfo<Session>>
  namespace CustomerQuoteTerms {
    export type Item = import('../prisma/client/client.js').CustomerQuoteTerms
    export type TypeInfo<Session = any> = {
      key: 'CustomerQuoteTerms'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'quote' | 'quoteKey' | 'structure' | 'legCount' | 'partCount' | 'partPlan' | 'priceChangeConsent' | 'liveDelayMs' | 'bonusEconomics' | 'eventId' | 'marketId' | 'selectionId' | 'priceSnapshotId' | 'eventName' | 'marketName' | 'selectionName' | 'decimalOdds' | 'stakeMinor' | 'potentialReturnMinor' | 'currency' | 'termsHash' | 'expiresAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerQuoteTermsWhereInput
        uniqueWhere: CustomerQuoteTermsWhereUniqueInput
        create: CustomerQuoteTermsCreateInput
        update: CustomerQuoteTermsUpdateInput
        orderBy: CustomerQuoteTermsOrderByInput
      }
      prisma: {
        create: ResolvedCustomerQuoteTermsCreateInput
        update: ResolvedCustomerQuoteTermsUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerSession<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerSession.TypeInfo<Session>>
  namespace CustomerSession {
    export type Item = import('../prisma/client/client.js').CustomerSession
    export type TypeInfo<Session = any> = {
      key: 'CustomerSession'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'tokenDigest' | 'expiresAt' | 'assuranceLevel' | 'deviceDigest' | 'lastSeenAt' | 'revokedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerSessionWhereInput
        uniqueWhere: CustomerSessionWhereUniqueInput
        create: CustomerSessionCreateInput
        update: CustomerSessionUpdateInput
        orderBy: CustomerSessionOrderByInput
      }
      prisma: {
        create: ResolvedCustomerSessionCreateInput
        update: ResolvedCustomerSessionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AccessReview<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AccessReview.TypeInfo<Session>>
  namespace AccessReview {
    export type Item = import('../prisma/client/client.js').AccessReview
    export type TypeInfo<Session = any> = {
      key: 'AccessReview'
      isSingleton: false
      fields: 'id' | 'tenant' | 'scopeType' | 'scopeId' | 'status' | 'openedBy' | 'reviewerId' | 'findings' | 'dueAt' | 'completedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AccessReviewWhereInput
        uniqueWhere: AccessReviewWhereUniqueInput
        create: AccessReviewCreateInput
        update: AccessReviewUpdateInput
        orderBy: AccessReviewOrderByInput
      }
      prisma: {
        create: ResolvedAccessReviewCreateInput
        update: ResolvedAccessReviewUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AccountClosure<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AccountClosure.TypeInfo<Session>>
  namespace AccountClosure {
    export type Item = import('../prisma/client/client.js').AccountClosure
    export type TypeInfo<Session = any> = {
      key: 'AccountClosure'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'requestedBy' | 'reasonCode' | 'requestedAt' | 'coolingEndsAt' | 'status' | 'completedAt' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AccountClosureWhereInput
        uniqueWhere: AccountClosureWhereUniqueInput
        create: AccountClosureCreateInput
        update: AccountClosureUpdateInput
        orderBy: AccountClosureOrderByInput
      }
      prisma: {
        create: ResolvedAccountClosureCreateInput
        update: ResolvedAccountClosureUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AdapterCertificationRun<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AdapterCertificationRun.TypeInfo<Session>>
  namespace AdapterCertificationRun {
    export type Item = import('../prisma/client/client.js').AdapterCertificationRun
    export type TypeInfo<Session = any> = {
      key: 'AdapterCertificationRun'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'adapterId' | 'adapterVersion' | 'suiteVersion' | 'scenarios' | 'passed' | 'failed' | 'status' | 'inputHash' | 'artifactReference' | 'startedAt' | 'completedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AdapterCertificationRunWhereInput
        uniqueWhere: AdapterCertificationRunWhereUniqueInput
        create: AdapterCertificationRunCreateInput
        update: AdapterCertificationRunUpdateInput
        orderBy: AdapterCertificationRunOrderByInput
      }
      prisma: {
        create: ResolvedAdapterCertificationRunCreateInput
        update: ResolvedAdapterCertificationRunUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AffiliateAttribution<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AffiliateAttribution.TypeInfo<Session>>
  namespace AffiliateAttribution {
    export type Item = import('../prisma/client/client.js').AffiliateAttribution
    export type TypeInfo<Session = any> = {
      key: 'AffiliateAttribution'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'affiliateReference' | 'campaignReference' | 'clickReference' | 'attributedAt' | 'status' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AffiliateAttributionWhereInput
        uniqueWhere: AffiliateAttributionWhereUniqueInput
        create: AffiliateAttributionCreateInput
        update: AffiliateAttributionUpdateInput
        orderBy: AffiliateAttributionOrderByInput
      }
      prisma: {
        create: ResolvedAffiliateAttributionCreateInput
        update: ResolvedAffiliateAttributionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type AffordabilityAssessment<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.AffordabilityAssessment.TypeInfo<Session>>
  namespace AffordabilityAssessment {
    export type Item = import('../prisma/client/client.js').AffordabilityAssessment
    export type TypeInfo<Session = any> = {
      key: 'AffordabilityAssessment'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'source' | 'riskBand' | 'evidenceReference' | 'assessedAt' | 'expiresAt' | 'decision' | 'reasonCode' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: AffordabilityAssessmentWhereInput
        uniqueWhere: AffordabilityAssessmentWhereUniqueInput
        create: AffordabilityAssessmentCreateInput
        update: AffordabilityAssessmentUpdateInput
        orderBy: AffordabilityAssessmentOrderByInput
      }
      prisma: {
        create: ResolvedAffordabilityAssessmentCreateInput
        update: ResolvedAffordabilityAssessmentUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BonusAward<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BonusAward.TypeInfo<Session>>
  namespace BonusAward {
    export type Item = import('../prisma/client/client.js').BonusAward
    export type TypeInfo<Session = any> = {
      key: 'BonusAward'
      isSingleton: false
      fields: 'id' | 'tenant' | 'promotion' | 'ruleVersion' | 'player' | 'amountMinor' | 'remainingMinor' | 'currency' | 'awardType' | 'stakeReturned' | 'status' | 'awardedAt' | 'activatedAt' | 'expiresAt' | 'idempotencyKey' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BonusAwardWhereInput
        uniqueWhere: BonusAwardWhereUniqueInput
        create: BonusAwardCreateInput
        update: BonusAwardUpdateInput
        orderBy: BonusAwardOrderByInput
      }
      prisma: {
        create: ResolvedBonusAwardCreateInput
        update: ResolvedBonusAwardUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BonusTransaction<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BonusTransaction.TypeInfo<Session>>
  namespace BonusTransaction {
    export type Item = import('../prisma/client/client.js').BonusTransaction
    export type TypeInfo<Session = any> = {
      key: 'BonusTransaction'
      isSingleton: false
      fields: 'id' | 'tenant' | 'award' | 'type' | 'amountMinor' | 'remainingMinor' | 'currency' | 'wager' | 'journalTransaction' | 'idempotencyKey' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BonusTransactionWhereInput
        uniqueWhere: BonusTransactionWhereUniqueInput
        create: BonusTransactionCreateInput
        update: BonusTransactionUpdateInput
        orderBy: BonusTransactionOrderByInput
      }
      prisma: {
        create: ResolvedBonusTransactionCreateInput
        update: ResolvedBonusTransactionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type BrandLocale<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.BrandLocale.TypeInfo<Session>>
  namespace BrandLocale {
    export type Item = import('../prisma/client/client.js').BrandLocale
    export type TypeInfo<Session = any> = {
      key: 'BrandLocale'
      isSingleton: false
      fields: 'id' | 'tenant' | 'brand' | 'locale' | 'language' | 'timezone' | 'termsVersion' | 'termsContentHash' | 'default' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: BrandLocaleWhereInput
        uniqueWhere: BrandLocaleWhereUniqueInput
        create: BrandLocaleCreateInput
        update: BrandLocaleUpdateInput
        orderBy: BrandLocaleOrderByInput
      }
      prisma: {
        create: ResolvedBrandLocaleCreateInput
        update: ResolvedBrandLocaleUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CampaignBudget<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CampaignBudget.TypeInfo<Session>>
  namespace CampaignBudget {
    export type Item = import('../prisma/client/client.js').CampaignBudget
    export type TypeInfo<Session = any> = {
      key: 'CampaignBudget'
      isSingleton: false
      fields: 'id' | 'tenant' | 'promotion' | 'allocatedMinor' | 'awardedMinor' | 'redeemedMinor' | 'forfeitedMinor' | 'currency' | 'version' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CampaignBudgetWhereInput
        uniqueWhere: CampaignBudgetWhereUniqueInput
        create: CampaignBudgetCreateInput
        update: CampaignBudgetUpdateInput
        orderBy: CampaignBudgetOrderByInput
      }
      prisma: {
        create: ResolvedCampaignBudgetCreateInput
        update: ResolvedCampaignBudgetUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CashOutAcceptance<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CashOutAcceptance.TypeInfo<Session>>
  namespace CashOutAcceptance {
    export type Item = import('../prisma/client/client.js').CashOutAcceptance
    export type TypeInfo<Session = any> = {
      key: 'CashOutAcceptance'
      isSingleton: false
      fields: 'id' | 'tenant' | 'offer' | 'wager' | 'player' | 'amountMinor' | 'currency' | 'portionNumerator' | 'portionDenominator' | 'wagerVersion' | 'acceptedAt' | 'journalTransaction' | 'status' | 'reversalOf' | 'idempotencyKey' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CashOutAcceptanceWhereInput
        uniqueWhere: CashOutAcceptanceWhereUniqueInput
        create: CashOutAcceptanceCreateInput
        update: CashOutAcceptanceUpdateInput
        orderBy: CashOutAcceptanceOrderByInput
      }
      prisma: {
        create: ResolvedCashOutAcceptanceCreateInput
        update: ResolvedCashOutAcceptanceUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CompetitionStage<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CompetitionStage.TypeInfo<Session>>
  namespace CompetitionStage {
    export type Item = import('../prisma/client/client.js').CompetitionStage
    export type TypeInfo<Session = any> = {
      key: 'CompetitionStage'
      isSingleton: false
      fields: 'id' | 'tenant' | 'season' | 'key' | 'name' | 'sortOrder' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CompetitionStageWhereInput
        uniqueWhere: CompetitionStageWhereUniqueInput
        create: CompetitionStageCreateInput
        update: CompetitionStageUpdateInput
        orderBy: CompetitionStageOrderByInput
      }
      prisma: {
        create: ResolvedCompetitionStageCreateInput
        update: ResolvedCompetitionStageUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ConfigDefinition<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ConfigDefinition.TypeInfo<Session>>
  namespace ConfigDefinition {
    export type Item = import('../prisma/client/client.js').ConfigDefinition
    export type TypeInfo<Session = any> = {
      key: 'ConfigDefinition'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'valueType' | 'mergeStrategy' | 'allowedScopes' | 'validationSchema' | 'secret' | 'description' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ConfigDefinitionWhereInput
        uniqueWhere: ConfigDefinitionWhereUniqueInput
        create: ConfigDefinitionCreateInput
        update: ConfigDefinitionUpdateInput
        orderBy: ConfigDefinitionOrderByInput
      }
      prisma: {
        create: ResolvedConfigDefinitionCreateInput
        update: ResolvedConfigDefinitionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CorrelationGroup<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CorrelationGroup.TypeInfo<Session>>
  namespace CorrelationGroup {
    export type Item = import('../prisma/client/client.js').CorrelationGroup
    export type TypeInfo<Session = any> = {
      key: 'CorrelationGroup'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'sportKey' | 'status' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CorrelationGroupWhereInput
        uniqueWhere: CorrelationGroupWhereUniqueInput
        create: CorrelationGroupCreateInput
        update: CorrelationGroupUpdateInput
        orderBy: CorrelationGroupOrderByInput
      }
      prisma: {
        create: ResolvedCorrelationGroupCreateInput
        update: ResolvedCorrelationGroupUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CorrelationRule<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CorrelationRule.TypeInfo<Session>>
  namespace CorrelationRule {
    export type Item = import('../prisma/client/client.js').CorrelationRule
    export type TypeInfo<Session = any> = {
      key: 'CorrelationRule'
      isSingleton: false
      fields: 'id' | 'tenant' | 'group' | 'leftPattern' | 'rightPattern' | 'decision' | 'reasonCode' | 'priority' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CorrelationRuleWhereInput
        uniqueWhere: CorrelationRuleWhereUniqueInput
        create: CorrelationRuleCreateInput
        update: CorrelationRuleUpdateInput
        orderBy: CorrelationRuleOrderByInput
      }
      prisma: {
        create: ResolvedCorrelationRuleCreateInput
        update: ResolvedCorrelationRuleUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CurrencyDefinition<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CurrencyDefinition.TypeInfo<Session>>
  namespace CurrencyDefinition {
    export type Item = import('../prisma/client/client.js').CurrencyDefinition
    export type TypeInfo<Session = any> = {
      key: 'CurrencyDefinition'
      isSingleton: false
      fields: 'id' | 'code' | 'exponent' | 'name' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CurrencyDefinitionWhereInput
        uniqueWhere: CurrencyDefinitionWhereUniqueInput
        create: CurrencyDefinitionCreateInput
        update: CurrencyDefinitionUpdateInput
        orderBy: CurrencyDefinitionOrderByInput
      }
      prisma: {
        create: ResolvedCurrencyDefinitionCreateInput
        update: ResolvedCurrencyDefinitionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerCredential<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerCredential.TypeInfo<Session>>
  namespace CustomerCredential {
    export type Item = import('../prisma/client/client.js').CustomerCredential
    export type TypeInfo<Session = any> = {
      key: 'CustomerCredential'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'emailDigest' | 'emailMasked' | 'passwordHash' | 'passwordVersion' | 'status' | 'failedAttempts' | 'lockedUntil' | 'verifiedAt' | 'lastAuthenticatedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerCredentialWhereInput
        uniqueWhere: CustomerCredentialWhereUniqueInput
        create: CustomerCredentialCreateInput
        update: CustomerCredentialUpdateInput
        orderBy: CustomerCredentialOrderByInput
      }
      prisma: {
        create: ResolvedCustomerCredentialCreateInput
        update: ResolvedCustomerCredentialUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerDevice<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerDevice.TypeInfo<Session>>
  namespace CustomerDevice {
    export type Item = import('../prisma/client/client.js').CustomerDevice
    export type TypeInfo<Session = any> = {
      key: 'CustomerDevice'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'session' | 'deviceDigest' | 'label' | 'firstSeenAt' | 'lastSeenAt' | 'revokedAt' | 'riskSignals' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerDeviceWhereInput
        uniqueWhere: CustomerDeviceWhereUniqueInput
        create: CustomerDeviceCreateInput
        update: CustomerDeviceUpdateInput
        orderBy: CustomerDeviceOrderByInput
      }
      prisma: {
        create: ResolvedCustomerDeviceCreateInput
        update: ResolvedCustomerDeviceUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerFavorite<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerFavorite.TypeInfo<Session>>
  namespace CustomerFavorite {
    export type Item = import('../prisma/client/client.js').CustomerFavorite
    export type TypeInfo<Session = any> = {
      key: 'CustomerFavorite'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'targetType' | 'targetId' | 'createdByDevice' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerFavoriteWhereInput
        uniqueWhere: CustomerFavoriteWhereUniqueInput
        create: CustomerFavoriteCreateInput
        update: CustomerFavoriteUpdateInput
        orderBy: CustomerFavoriteOrderByInput
      }
      prisma: {
        create: ResolvedCustomerFavoriteCreateInput
        update: ResolvedCustomerFavoriteUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerPrivacyRequest<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerPrivacyRequest.TypeInfo<Session>>
  namespace CustomerPrivacyRequest {
    export type Item = import('../prisma/client/client.js').CustomerPrivacyRequest
    export type TypeInfo<Session = any> = {
      key: 'CustomerPrivacyRequest'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'type' | 'status' | 'requestedAt' | 'dueAt' | 'completedAt' | 'identityEvidenceHash' | 'artifactReference' | 'decisionReason' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerPrivacyRequestWhereInput
        uniqueWhere: CustomerPrivacyRequestWhereUniqueInput
        create: CustomerPrivacyRequestCreateInput
        update: CustomerPrivacyRequestUpdateInput
        orderBy: CustomerPrivacyRequestOrderByInput
      }
      prisma: {
        create: ResolvedCustomerPrivacyRequestCreateInput
        update: ResolvedCustomerPrivacyRequestUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type CustomerRecoveryToken<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.CustomerRecoveryToken.TypeInfo<Session>>
  namespace CustomerRecoveryToken {
    export type Item = import('../prisma/client/client.js').CustomerRecoveryToken
    export type TypeInfo<Session = any> = {
      key: 'CustomerRecoveryToken'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'tokenDigest' | 'purpose' | 'expiresAt' | 'consumedAt' | 'attempts' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: CustomerRecoveryTokenWhereInput
        uniqueWhere: CustomerRecoveryTokenWhereUniqueInput
        create: CustomerRecoveryTokenCreateInput
        update: CustomerRecoveryTokenUpdateInput
        orderBy: CustomerRecoveryTokenOrderByInput
      }
      prisma: {
        create: ResolvedCustomerRecoveryTokenCreateInput
        update: ResolvedCustomerRecoveryTokenUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type DataExport<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.DataExport.TypeInfo<Session>>
  namespace DataExport {
    export type Item = import('../prisma/client/client.js').DataExport
    export type TypeInfo<Session = any> = {
      key: 'DataExport'
      isSingleton: false
      fields: 'id' | 'tenant' | 'requestedBy' | 'type' | 'scope' | 'classification' | 'status' | 'rowCount' | 'contentHash' | 'storageReference' | 'expiresAt' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: DataExportWhereInput
        uniqueWhere: DataExportWhereUniqueInput
        create: DataExportCreateInput
        update: DataExportUpdateInput
        orderBy: DataExportOrderByInput
      }
      prisma: {
        create: ResolvedDataExportCreateInput
        update: ResolvedDataExportUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type EventScheduleChange<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.EventScheduleChange.TypeInfo<Session>>
  namespace EventScheduleChange {
    export type Item = import('../prisma/client/client.js').EventScheduleChange
    export type TypeInfo<Session = any> = {
      key: 'EventScheduleChange'
      isSingleton: false
      fields: 'id' | 'tenant' | 'event' | 'fromStartAt' | 'toStartAt' | 'reasonCode' | 'source' | 'actorId' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: EventScheduleChangeWhereInput
        uniqueWhere: EventScheduleChangeWhereUniqueInput
        create: EventScheduleChangeCreateInput
        update: EventScheduleChangeUpdateInput
        orderBy: EventScheduleChangeOrderByInput
      }
      prisma: {
        create: ResolvedEventScheduleChangeCreateInput
        update: ResolvedEventScheduleChangeUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type FeatureFlag<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.FeatureFlag.TypeInfo<Session>>
  namespace FeatureFlag {
    export type Item = import('../prisma/client/client.js').FeatureFlag
    export type TypeInfo<Session = any> = {
      key: 'FeatureFlag'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'description' | 'enabled' | 'scopeType' | 'scopeId' | 'safeDefault' | 'ownerId' | 'expiresAt' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: FeatureFlagWhereInput
        uniqueWhere: FeatureFlagWhereUniqueInput
        create: FeatureFlagCreateInput
        update: FeatureFlagUpdateInput
        orderBy: FeatureFlagOrderByInput
      }
      prisma: {
        create: ResolvedFeatureFlagCreateInput
        update: ResolvedFeatureFlagUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type FeedHealthSnapshot<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.FeedHealthSnapshot.TypeInfo<Session>>
  namespace FeedHealthSnapshot {
    export type Item = import('../prisma/client/client.js').FeedHealthSnapshot
    export type TypeInfo<Session = any> = {
      key: 'FeedHealthSnapshot'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'scopeType' | 'scopeId' | 'status' | 'heartbeatAt' | 'lagMs' | 'lastSequence' | 'gapFrom' | 'gapTo' | 'checkedAt' | 'actionTaken' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: FeedHealthSnapshotWhereInput
        uniqueWhere: FeedHealthSnapshotWhereUniqueInput
        create: FeedHealthSnapshotCreateInput
        update: FeedHealthSnapshotUpdateInput
        orderBy: FeedHealthSnapshotOrderByInput
      }
      prisma: {
        create: ResolvedFeedHealthSnapshotCreateInput
        update: ResolvedFeedHealthSnapshotUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type HouseRuleVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.HouseRuleVersion.TypeInfo<Session>>
  namespace HouseRuleVersion {
    export type Item = import('../prisma/client/client.js').HouseRuleVersion
    export type TypeInfo<Session = any> = {
      key: 'HouseRuleVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'version' | 'sportKey' | 'marketDefinitionKey' | 'rules' | 'semanticHash' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: HouseRuleVersionWhereInput
        uniqueWhere: HouseRuleVersionWhereUniqueInput
        create: HouseRuleVersionCreateInput
        update: HouseRuleVersionUpdateInput
        orderBy: HouseRuleVersionOrderByInput
      }
      prisma: {
        create: ResolvedHouseRuleVersionCreateInput
        update: ResolvedHouseRuleVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type IntegrationDeliveryAttempt<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.IntegrationDeliveryAttempt.TypeInfo<Session>>
  namespace IntegrationDeliveryAttempt {
    export type Item = import('../prisma/client/client.js').IntegrationDeliveryAttempt
    export type TypeInfo<Session = any> = {
      key: 'IntegrationDeliveryAttempt'
      isSingleton: false
      fields: 'id' | 'tenant' | 'delivery' | 'attempt' | 'requestedAt' | 'completedAt' | 'responseCode' | 'latencyMs' | 'responseHash' | 'errorClass' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: IntegrationDeliveryAttemptWhereInput
        uniqueWhere: IntegrationDeliveryAttemptWhereUniqueInput
        create: IntegrationDeliveryAttemptCreateInput
        update: IntegrationDeliveryAttemptUpdateInput
        orderBy: IntegrationDeliveryAttemptOrderByInput
      }
      prisma: {
        create: ResolvedIntegrationDeliveryAttemptCreateInput
        update: ResolvedIntegrationDeliveryAttemptUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type IntegrityCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.IntegrityCase.TypeInfo<Session>>
  namespace IntegrityCase {
    export type Item = import('../prisma/client/client.js').IntegrityCase
    export type TypeInfo<Session = any> = {
      key: 'IntegrityCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'event' | 'wager' | 'providerConnection' | 'type' | 'status' | 'severity' | 'restrictedEvidence' | 'ownerId' | 'reportedAt' | 'closedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: IntegrityCaseWhereInput
        uniqueWhere: IntegrityCaseWhereUniqueInput
        create: IntegrityCaseCreateInput
        update: IntegrityCaseUpdateInput
        orderBy: IntegrityCaseOrderByInput
      }
      prisma: {
        create: ResolvedIntegrityCaseCreateInput
        update: ResolvedIntegrityCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type JurisdictionPolicyVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.JurisdictionPolicyVersion.TypeInfo<Session>>
  namespace JurisdictionPolicyVersion {
    export type Item = import('../prisma/client/client.js').JurisdictionPolicyVersion
    export type TypeInfo<Session = any> = {
      key: 'JurisdictionPolicyVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'jurisdiction' | 'version' | 'authorityCitation' | 'policyDocument' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'approvedBy' | 'approvedAt' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: JurisdictionPolicyVersionWhereInput
        uniqueWhere: JurisdictionPolicyVersionWhereUniqueInput
        create: JurisdictionPolicyVersionCreateInput
        update: JurisdictionPolicyVersionUpdateInput
        orderBy: JurisdictionPolicyVersionOrderByInput
      }
      prisma: {
        create: ResolvedJurisdictionPolicyVersionCreateInput
        update: ResolvedJurisdictionPolicyVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LedgerAdjustmentRequest<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LedgerAdjustmentRequest.TypeInfo<Session>>
  namespace LedgerAdjustmentRequest {
    export type Item = import('../prisma/client/client.js').LedgerAdjustmentRequest
    export type TypeInfo<Session = any> = {
      key: 'LedgerAdjustmentRequest'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'account' | 'amountMinor' | 'currency' | 'direction' | 'reasonCode' | 'evidence' | 'status' | 'requesterId' | 'approvalRequest' | 'journalTransaction' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LedgerAdjustmentRequestWhereInput
        uniqueWhere: LedgerAdjustmentRequestWhereUniqueInput
        create: LedgerAdjustmentRequestCreateInput
        update: LedgerAdjustmentRequestUpdateInput
        orderBy: LedgerAdjustmentRequestOrderByInput
      }
      prisma: {
        create: ResolvedLedgerAdjustmentRequestCreateInput
        update: ResolvedLedgerAdjustmentRequestUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type LegalEntity<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.LegalEntity.TypeInfo<Session>>
  namespace LegalEntity {
    export type Item = import('../prisma/client/client.js').LegalEntity
    export type TypeInfo<Session = any> = {
      key: 'LegalEntity'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'countryCode' | 'registrationReference' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: LegalEntityWhereInput
        uniqueWhere: LegalEntityWhereUniqueInput
        create: LegalEntityCreateInput
        update: LegalEntityUpdateInput
        orderBy: LegalEntityOrderByInput
      }
      prisma: {
        create: ResolvedLegalEntityCreateInput
        update: ResolvedLegalEntityUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type MarketDefinition<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.MarketDefinition.TypeInfo<Session>>
  namespace MarketDefinition {
    export type Item = import('../prisma/client/client.js').MarketDefinition
    export type TypeInfo<Session = any> = {
      key: 'MarketDefinition'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'sportKey' | 'parametersSchema' | 'gradingRuleFamily' | 'allowedPhases' | 'status' | 'version' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: MarketDefinitionWhereInput
        uniqueWhere: MarketDefinitionWhereUniqueInput
        create: MarketDefinitionCreateInput
        update: MarketDefinitionUpdateInput
        orderBy: MarketDefinitionOrderByInput
      }
      prisma: {
        create: ResolvedMarketDefinitionCreateInput
        update: ResolvedMarketDefinitionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Notification<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Notification.TypeInfo<Session>>
  namespace Notification {
    export type Item = import('../prisma/client/client.js').Notification
    export type TypeInfo<Session = any> = {
      key: 'Notification'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'user' | 'channel' | 'templateKey' | 'templateVersion' | 'locale' | 'payload' | 'status' | 'consentEvidenceHash' | 'providerConnection' | 'externalReference' | 'sentAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: NotificationWhereInput
        uniqueWhere: NotificationWhereUniqueInput
        create: NotificationCreateInput
        update: NotificationUpdateInput
        orderBy: NotificationOrderByInput
      }
      prisma: {
        create: ResolvedNotificationCreateInput
        update: ResolvedNotificationUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type OperatorChannel<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.OperatorChannel.TypeInfo<Session>>
  namespace OperatorChannel {
    export type Item = import('../prisma/client/client.js').OperatorChannel
    export type TypeInfo<Session = any> = {
      key: 'OperatorChannel'
      isSingleton: false
      fields: 'id' | 'tenant' | 'legalEntity' | 'operatorJurisdiction' | 'brand' | 'key' | 'type' | 'status' | 'capabilities' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: OperatorChannelWhereInput
        uniqueWhere: OperatorChannelWhereUniqueInput
        create: OperatorChannelCreateInput
        update: OperatorChannelUpdateInput
        orderBy: OperatorChannelOrderByInput
      }
      prisma: {
        create: ResolvedOperatorChannelCreateInput
        update: ResolvedOperatorChannelUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PamSubjectMapping<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PamSubjectMapping.TypeInfo<Session>>
  namespace PamSubjectMapping {
    export type Item = import('../prisma/client/client.js').PamSubjectMapping
    export type TypeInfo<Session = any> = {
      key: 'PamSubjectMapping'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'externalSubjectDigest' | 'player' | 'walletMode' | 'status' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PamSubjectMappingWhereInput
        uniqueWhere: PamSubjectMappingWhereUniqueInput
        create: PamSubjectMappingCreateInput
        update: PamSubjectMappingUpdateInput
        orderBy: PamSubjectMappingOrderByInput
      }
      prisma: {
        create: ResolvedPamSubjectMappingCreateInput
        update: ResolvedPamSubjectMappingUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PlayerStatement<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PlayerStatement.TypeInfo<Session>>
  namespace PlayerStatement {
    export type Item = import('../prisma/client/client.js').PlayerStatement
    export type TypeInfo<Session = any> = {
      key: 'PlayerStatement'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'periodStart' | 'periodEnd' | 'openingMinor' | 'closingMinor' | 'currency' | 'journalHash' | 'artifactReference' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PlayerStatementWhereInput
        uniqueWhere: PlayerStatementWhereUniqueInput
        create: PlayerStatementCreateInput
        update: PlayerStatementUpdateInput
        orderBy: PlayerStatementOrderByInput
      }
      prisma: {
        create: ResolvedPlayerStatementCreateInput
        update: ResolvedPlayerStatementUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Promotion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Promotion.TypeInfo<Session>>
  namespace Promotion {
    export type Item = import('../prisma/client/client.js').Promotion
    export type TypeInfo<Session = any> = {
      key: 'Promotion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'description' | 'type' | 'status' | 'startsAt' | 'endsAt' | 'jurisdiction' | 'brand' | 'budgetMinor' | 'currency' | 'termsVersion' | 'termsHash' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PromotionWhereInput
        uniqueWhere: PromotionWhereUniqueInput
        create: PromotionCreateInput
        update: PromotionUpdateInput
        orderBy: PromotionOrderByInput
      }
      prisma: {
        create: ResolvedPromotionCreateInput
        update: ResolvedPromotionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PromotionRedemption<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PromotionRedemption.TypeInfo<Session>>
  namespace PromotionRedemption {
    export type Item = import('../prisma/client/client.js').PromotionRedemption
    export type TypeInfo<Session = any> = {
      key: 'PromotionRedemption'
      isSingleton: false
      fields: 'id' | 'tenant' | 'promotion' | 'ruleVersion' | 'player' | 'bonusAward' | 'status' | 'reasonCode' | 'idempotencyKey' | 'evidenceHash' | 'redeemedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PromotionRedemptionWhereInput
        uniqueWhere: PromotionRedemptionWhereUniqueInput
        create: PromotionRedemptionCreateInput
        update: PromotionRedemptionUpdateInput
        orderBy: PromotionRedemptionOrderByInput
      }
      prisma: {
        create: ResolvedPromotionRedemptionCreateInput
        update: ResolvedPromotionRedemptionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type PromotionRuleVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.PromotionRuleVersion.TypeInfo<Session>>
  namespace PromotionRuleVersion {
    export type Item = import('../prisma/client/client.js').PromotionRuleVersion
    export type TypeInfo<Session = any> = {
      key: 'PromotionRuleVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'promotion' | 'version' | 'eligibility' | 'economics' | 'wageringRequirements' | 'abuseControls' | 'contributionRules' | 'status' | 'effectiveFrom' | 'effectiveTo' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: PromotionRuleVersionWhereInput
        uniqueWhere: PromotionRuleVersionWhereUniqueInput
        create: PromotionRuleVersionCreateInput
        update: PromotionRuleVersionUpdateInput
        orderBy: PromotionRuleVersionOrderByInput
      }
      prisma: {
        create: ResolvedPromotionRuleVersionCreateInput
        update: ResolvedPromotionRuleVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ProviderHealthSample<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ProviderHealthSample.TypeInfo<Session>>
  namespace ProviderHealthSample {
    export type Item = import('../prisma/client/client.js').ProviderHealthSample
    export type TypeInfo<Session = any> = {
      key: 'ProviderHealthSample'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'capability' | 'status' | 'latencyMs' | 'errorRateBasisPoints' | 'sequenceLag' | 'oldestWebhookAgeMs' | 'reconciliationDifferenceMinor' | 'checkedAt' | 'details' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ProviderHealthSampleWhereInput
        uniqueWhere: ProviderHealthSampleWhereUniqueInput
        create: ProviderHealthSampleCreateInput
        update: ProviderHealthSampleUpdateInput
        orderBy: ProviderHealthSampleOrderByInput
      }
      prisma: {
        create: ResolvedProviderHealthSampleCreateInput
        update: ResolvedProviderHealthSampleUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Region<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Region.TypeInfo<Session>>
  namespace Region {
    export type Item = import('../prisma/client/client.js').Region
    export type TypeInfo<Session = any> = {
      key: 'Region'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'countryCodes' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: RegionWhereInput
        uniqueWhere: RegionWhereUniqueInput
        create: RegionCreateInput
        update: RegionUpdateInput
        orderBy: RegionOrderByInput
      }
      prisma: {
        create: ResolvedRegionCreateInput
        update: ResolvedRegionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ReportArtifact<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ReportArtifact.TypeInfo<Session>>
  namespace ReportArtifact {
    export type Item = import('../prisma/client/client.js').ReportArtifact
    export type TypeInfo<Session = any> = {
      key: 'ReportArtifact'
      isSingleton: false
      fields: 'id' | 'tenant' | 'report' | 'type' | 'format' | 'schemaVersion' | 'rowCount' | 'contentHash' | 'storageReference' | 'encryptionKeyReference' | 'generatedAt' | 'expiresAt' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ReportArtifactWhereInput
        uniqueWhere: ReportArtifactWhereUniqueInput
        create: ReportArtifactCreateInput
        update: ReportArtifactUpdateInput
        orderBy: ReportArtifactOrderByInput
      }
      prisma: {
        create: ResolvedReportArtifactCreateInput
        update: ResolvedReportArtifactUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type RetentionExecution<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.RetentionExecution.TypeInfo<Session>>
  namespace RetentionExecution {
    export type Item = import('../prisma/client/client.js').RetentionExecution
    export type TypeInfo<Session = any> = {
      key: 'RetentionExecution'
      isSingleton: false
      fields: 'id' | 'tenant' | 'policyVersion' | 'windowFrom' | 'windowTo' | 'candidateCount' | 'heldCount' | 'archivedCount' | 'deletedCount' | 'status' | 'dryRunHash' | 'approvalRequest' | 'artifactReference' | 'completedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: RetentionExecutionWhereInput
        uniqueWhere: RetentionExecutionWhereUniqueInput
        create: RetentionExecutionCreateInput
        update: RetentionExecutionUpdateInput
        orderBy: RetentionExecutionOrderByInput
      }
      prisma: {
        create: ResolvedRetentionExecutionCreateInput
        update: ResolvedRetentionExecutionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type RetentionPolicyVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.RetentionPolicyVersion.TypeInfo<Session>>
  namespace RetentionPolicyVersion {
    export type Item = import('../prisma/client/client.js').RetentionPolicyVersion
    export type TypeInfo<Session = any> = {
      key: 'RetentionPolicyVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'recordClass' | 'jurisdiction' | 'version' | 'retentionDays' | 'archiveDays' | 'deletionMode' | 'legalHoldWins' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: RetentionPolicyVersionWhereInput
        uniqueWhere: RetentionPolicyVersionWhereUniqueInput
        create: RetentionPolicyVersionCreateInput
        update: RetentionPolicyVersionUpdateInput
        orderBy: RetentionPolicyVersionOrderByInput
      }
      prisma: {
        create: ResolvedRetentionPolicyVersionCreateInput
        update: ResolvedRetentionPolicyVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SafeguardingAccount<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SafeguardingAccount.TypeInfo<Session>>
  namespace SafeguardingAccount {
    export type Item = import('../prisma/client/client.js').SafeguardingAccount
    export type TypeInfo<Session = any> = {
      key: 'SafeguardingAccount'
      isSingleton: false
      fields: 'id' | 'tenant' | 'legalEntity' | 'providerConnection' | 'accountReference' | 'classification' | 'currency' | 'status' | 'disclosureVersion' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SafeguardingAccountWhereInput
        uniqueWhere: SafeguardingAccountWhereUniqueInput
        create: SafeguardingAccountCreateInput
        update: SafeguardingAccountUpdateInput
        orderBy: SafeguardingAccountOrderByInput
      }
      prisma: {
        create: ResolvedSafeguardingAccountCreateInput
        update: ResolvedSafeguardingAccountUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SafeguardingReconciliation<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SafeguardingReconciliation.TypeInfo<Session>>
  namespace SafeguardingReconciliation {
    export type Item = import('../prisma/client/client.js').SafeguardingReconciliation
    export type TypeInfo<Session = any> = {
      key: 'SafeguardingReconciliation'
      isSingleton: false
      fields: 'id' | 'tenant' | 'safeguardingAccount' | 'asOf' | 'safeguardedAssetMinor' | 'playerLiabilityMinor' | 'differenceMinor' | 'status' | 'evidenceHash' | 'reconciliationRun' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SafeguardingReconciliationWhereInput
        uniqueWhere: SafeguardingReconciliationWhereUniqueInput
        create: SafeguardingReconciliationCreateInput
        update: SafeguardingReconciliationUpdateInput
        orderBy: SafeguardingReconciliationOrderByInput
      }
      prisma: {
        create: ResolvedSafeguardingReconciliationCreateInput
        update: ResolvedSafeguardingReconciliationUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ScheduledJob<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ScheduledJob.TypeInfo<Session>>
  namespace ScheduledJob {
    export type Item = import('../prisma/client/client.js').ScheduledJob
    export type TypeInfo<Session = any> = {
      key: 'ScheduledJob'
      isSingleton: false
      fields: 'id' | 'tenant' | 'type' | 'scopeType' | 'scopeId' | 'payload' | 'status' | 'dueAt' | 'leaseUntil' | 'leaseOwner' | 'attempts' | 'maxAttempts' | 'idempotencyKey' | 'lastError' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ScheduledJobWhereInput
        uniqueWhere: ScheduledJobWhereUniqueInput
        create: ScheduledJobCreateInput
        update: ScheduledJobUpdateInput
        orderBy: ScheduledJobOrderByInput
      }
      prisma: {
        create: ResolvedScheduledJobCreateInput
        update: ResolvedScheduledJobUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type ScreeningHit<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.ScreeningHit.TypeInfo<Session>>
  namespace ScreeningHit {
    export type Item = import('../prisma/client/client.js').ScreeningHit
    export type TypeInfo<Session = any> = {
      key: 'ScreeningHit'
      isSingleton: false
      fields: 'id' | 'tenant' | 'amlCase' | 'providerConnection' | 'screeningType' | 'matchToken' | 'status' | 'dispositionReason' | 'evidenceReference' | 'screenedAt' | 'resolvedAt' | 'ownerId' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: ScreeningHitWhereInput
        uniqueWhere: ScreeningHitWhereUniqueInput
        create: ScreeningHitCreateInput
        update: ScreeningHitUpdateInput
        orderBy: ScreeningHitOrderByInput
      }
      prisma: {
        create: ResolvedScreeningHitCreateInput
        update: ResolvedScreeningHitUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Season<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Season.TypeInfo<Session>>
  namespace Season {
    export type Item = import('../prisma/client/client.js').Season
    export type TypeInfo<Session = any> = {
      key: 'Season'
      isSingleton: false
      fields: 'id' | 'tenant' | 'competition' | 'key' | 'name' | 'startsAt' | 'endsAt' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SeasonWhereInput
        uniqueWhere: SeasonWhereUniqueInput
        create: SeasonCreateInput
        update: SeasonUpdateInput
        orderBy: SeasonOrderByInput
      }
      prisma: {
        create: ResolvedSeasonCreateInput
        update: ResolvedSeasonUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SettlementLine<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SettlementLine.TypeInfo<Session>>
  namespace SettlementLine {
    export type Item = import('../prisma/client/client.js').SettlementLine
    export type TypeInfo<Session = any> = {
      key: 'SettlementLine'
      isSingleton: false
      fields: 'id' | 'tenant' | 'settlement' | 'wagerPart' | 'wagerLeg' | 'lineType' | 'amountMinor' | 'unroundedValue' | 'scale' | 'roundingRule' | 'residualMinor' | 'trace' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SettlementLineWhereInput
        uniqueWhere: SettlementLineWhereUniqueInput
        create: SettlementLineCreateInput
        update: SettlementLineUpdateInput
        orderBy: SettlementLineOrderByInput
      }
      prisma: {
        create: ResolvedSettlementLineCreateInput
        update: ResolvedSettlementLineUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SettlementRun<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SettlementRun.TypeInfo<Session>>
  namespace SettlementRun {
    export type Item = import('../prisma/client/client.js').SettlementRun
    export type TypeInfo<Session = any> = {
      key: 'SettlementRun'
      isSingleton: false
      fields: 'id' | 'tenant' | 'triggerType' | 'resultVersion' | 'inputHash' | 'status' | 'wagersConsidered' | 'wagersSettled' | 'startedAt' | 'completedAt' | 'errorSummary' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SettlementRunWhereInput
        uniqueWhere: SettlementRunWhereUniqueInput
        create: SettlementRunCreateInput
        update: SettlementRunUpdateInput
        orderBy: SettlementRunOrderByInput
      }
      prisma: {
        create: ResolvedSettlementRunCreateInput
        update: ResolvedSettlementRunUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SupportCase<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SupportCase.TypeInfo<Session>>
  namespace SupportCase {
    export type Item = import('../prisma/client/client.js').SupportCase
    export type TypeInfo<Session = any> = {
      key: 'SupportCase'
      isSingleton: false
      fields: 'id' | 'tenant' | 'player' | 'wager' | 'paymentIntent' | 'dispute' | 'category' | 'priority' | 'status' | 'subject' | 'ownerId' | 'openedAt' | 'resolvedAt' | 'slaDueAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SupportCaseWhereInput
        uniqueWhere: SupportCaseWhereUniqueInput
        create: SupportCaseCreateInput
        update: SupportCaseUpdateInput
        orderBy: SupportCaseOrderByInput
      }
      prisma: {
        create: ResolvedSupportCaseCreateInput
        update: ResolvedSupportCaseUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type SupportCaseEvent<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.SupportCaseEvent.TypeInfo<Session>>
  namespace SupportCaseEvent {
    export type Item = import('../prisma/client/client.js').SupportCaseEvent
    export type TypeInfo<Session = any> = {
      key: 'SupportCaseEvent'
      isSingleton: false
      fields: 'id' | 'tenant' | 'supportCase' | 'type' | 'actorType' | 'actorId' | 'body' | 'evidenceHash' | 'visibility' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: SupportCaseEventWhereInput
        uniqueWhere: SupportCaseEventWhereUniqueInput
        create: SupportCaseEventCreateInput
        update: SupportCaseEventUpdateInput
        orderBy: SupportCaseEventOrderByInput
      }
      prisma: {
        create: ResolvedSupportCaseEventCreateInput
        update: ResolvedSupportCaseEventUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TaxRuleVersion<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TaxRuleVersion.TypeInfo<Session>>
  namespace TaxRuleVersion {
    export type Item = import('../prisma/client/client.js').TaxRuleVersion
    export type TypeInfo<Session = any> = {
      key: 'TaxRuleVersion'
      isSingleton: false
      fields: 'id' | 'tenant' | 'jurisdiction' | 'key' | 'version' | 'basis' | 'rateNumerator' | 'rateDenominator' | 'roundingRule' | 'effectiveFrom' | 'effectiveTo' | 'status' | 'evidenceHash' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TaxRuleVersionWhereInput
        uniqueWhere: TaxRuleVersionWhereUniqueInput
        create: TaxRuleVersionCreateInput
        update: TaxRuleVersionUpdateInput
        orderBy: TaxRuleVersionOrderByInput
      }
      prisma: {
        create: ResolvedTaxRuleVersionCreateInput
        update: ResolvedTaxRuleVersionUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TenantCurrency<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TenantCurrency.TypeInfo<Session>>
  namespace TenantCurrency {
    export type Item = import('../prisma/client/client.js').TenantCurrency
    export type TypeInfo<Session = any> = {
      key: 'TenantCurrency'
      isSingleton: false
      fields: 'id' | 'tenant' | 'currency' | 'depositsEnabled' | 'withdrawalsEnabled' | 'wageringEnabled' | 'defaultForBrand' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TenantCurrencyWhereInput
        uniqueWhere: TenantCurrencyWhereUniqueInput
        create: TenantCurrencyCreateInput
        update: TenantCurrencyUpdateInput
        orderBy: TenantCurrencyOrderByInput
      }
      prisma: {
        create: ResolvedTenantCurrencyCreateInput
        update: ResolvedTenantCurrencyUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TraderOverride<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TraderOverride.TypeInfo<Session>>
  namespace TraderOverride {
    export type Item = import('../prisma/client/client.js').TraderOverride
    export type TypeInfo<Session = any> = {
      key: 'TraderOverride'
      isSingleton: false
      fields: 'id' | 'tenant' | 'targetType' | 'targetId' | 'overrideType' | 'value' | 'reasonCode' | 'startsAt' | 'expiresAt' | 'status' | 'requesterId' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TraderOverrideWhereInput
        uniqueWhere: TraderOverrideWhereUniqueInput
        create: TraderOverrideCreateInput
        update: TraderOverrideUpdateInput
        orderBy: TraderOverrideOrderByInput
      }
      prisma: {
        create: ResolvedTraderOverrideCreateInput
        update: ResolvedTraderOverrideUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type TradingReplayRun<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.TradingReplayRun.TypeInfo<Session>>
  namespace TradingReplayRun {
    export type Item = import('../prisma/client/client.js').TradingReplayRun
    export type TypeInfo<Session = any> = {
      key: 'TradingReplayRun'
      isSingleton: false
      fields: 'id' | 'tenant' | 'providerConnection' | 'scopeType' | 'scopeId' | 'frontier' | 'adapterVersion' | 'normalizerVersion' | 'ruleVersion' | 'inputHash' | 'outputHash' | 'comparison' | 'dryRun' | 'status' | 'completedAt' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: TradingReplayRunWhereInput
        uniqueWhere: TradingReplayRunWhereUniqueInput
        create: TradingReplayRunCreateInput
        update: TradingReplayRunUpdateInput
        orderBy: TradingReplayRunOrderByInput
      }
      prisma: {
        create: ResolvedTradingReplayRunCreateInput
        update: ResolvedTradingReplayRunUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type Venue<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.Venue.TypeInfo<Session>>
  namespace Venue {
    export type Item = import('../prisma/client/client.js').Venue
    export type TypeInfo<Session = any> = {
      key: 'Venue'
      isSingleton: false
      fields: 'id' | 'tenant' | 'key' | 'name' | 'countryCode' | 'timezone' | 'address' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: VenueWhereInput
        uniqueWhere: VenueWhereUniqueInput
        create: VenueCreateInput
        update: VenueUpdateInput
        orderBy: VenueOrderByInput
      }
      prisma: {
        create: ResolvedVenueCreateInput
        update: ResolvedVenueUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WagerExposureAllocation<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WagerExposureAllocation.TypeInfo<Session>>
  namespace WagerExposureAllocation {
    export type Item = import('../prisma/client/client.js').WagerExposureAllocation
    export type TypeInfo<Session = any> = {
      key: 'WagerExposureAllocation'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'market' | 'stakeMinor' | 'liabilityMinor' | 'remainingStakeMinor' | 'remainingLiabilityMinor' | 'version' | 'status' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WagerExposureAllocationWhereInput
        uniqueWhere: WagerExposureAllocationWhereUniqueInput
        create: WagerExposureAllocationCreateInput
        update: WagerExposureAllocationUpdateInput
        orderBy: WagerExposureAllocationOrderByInput
      }
      prisma: {
        create: ResolvedWagerExposureAllocationCreateInput
        update: ResolvedWagerExposureAllocationUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WagerPart<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WagerPart.TypeInfo<Session>>
  namespace WagerPart {
    export type Item = import('../prisma/client/client.js').WagerPart
    export type TypeInfo<Session = any> = {
      key: 'WagerPart'
      isSingleton: false
      fields: 'id' | 'tenant' | 'wager' | 'partIndex' | 'combinationKey' | 'stakeMinor' | 'decimalOdds' | 'potentialReturnMinor' | 'status' | 'gradeSummary' | 'settlement' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WagerPartWhereInput
        uniqueWhere: WagerPartWhereUniqueInput
        create: WagerPartCreateInput
        update: WagerPartUpdateInput
        orderBy: WagerPartOrderByInput
      }
      prisma: {
        create: ResolvedWagerPartCreateInput
        update: ResolvedWagerPartUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WebhookDelivery<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WebhookDelivery.TypeInfo<Session>>
  namespace WebhookDelivery {
    export type Item = import('../prisma/client/client.js').WebhookDelivery
    export type TypeInfo<Session = any> = {
      key: 'WebhookDelivery'
      isSingleton: false
      fields: 'id' | 'tenant' | 'endpoint' | 'outboxMessage' | 'deliveryId' | 'eventType' | 'eventVersion' | 'payloadHash' | 'signatureKeyId' | 'status' | 'attempts' | 'availableAt' | 'deliveredAt' | 'lastResponseCode' | 'lastError' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WebhookDeliveryWhereInput
        uniqueWhere: WebhookDeliveryWhereUniqueInput
        create: WebhookDeliveryCreateInput
        update: WebhookDeliveryUpdateInput
        orderBy: WebhookDeliveryOrderByInput
      }
      prisma: {
        create: ResolvedWebhookDeliveryCreateInput
        update: ResolvedWebhookDeliveryUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WebhookEndpoint<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WebhookEndpoint.TypeInfo<Session>>
  namespace WebhookEndpoint {
    export type Item = import('../prisma/client/client.js').WebhookEndpoint
    export type TypeInfo<Session = any> = {
      key: 'WebhookEndpoint'
      isSingleton: false
      fields: 'id' | 'tenant' | 'name' | 'url' | 'secretReference' | 'eventTypes' | 'status' | 'failureCount' | 'disabledAt' | 'approvalRequest' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WebhookEndpointWhereInput
        uniqueWhere: WebhookEndpointWhereUniqueInput
        create: WebhookEndpointCreateInput
        update: WebhookEndpointUpdateInput
        orderBy: WebhookEndpointOrderByInput
      }
      prisma: {
        create: ResolvedWebhookEndpointCreateInput
        update: ResolvedWebhookEndpointUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
  export type WorkerHeartbeat<Session = any> = import('@keystone-6/core/types').ListConfig<Lists.WorkerHeartbeat.TypeInfo<Session>>
  namespace WorkerHeartbeat {
    export type Item = import('../prisma/client/client.js').WorkerHeartbeat
    export type TypeInfo<Session = any> = {
      key: 'WorkerHeartbeat'
      isSingleton: false
      fields: 'id' | 'workerId' | 'status' | 'startedAt' | 'heartbeatAt' | 'stoppedAt' | 'buildVersion' | 'createdAt' | 'updatedAt'
      actions: never
      item: Item
      inputs: {
        where: WorkerHeartbeatWhereInput
        uniqueWhere: WorkerHeartbeatWhereUniqueInput
        create: WorkerHeartbeatCreateInput
        update: WorkerHeartbeatUpdateInput
        orderBy: WorkerHeartbeatOrderByInput
      }
      prisma: {
        create: ResolvedWorkerHeartbeatCreateInput
        update: ResolvedWorkerHeartbeatUpdateInput
      }
      all: __TypeInfo<Session>
    }
  }
}
export type Context<Session = any> = import('@keystone-6/core/types').KeystoneContext<TypeInfo<Session>>
export type Config<Session = any> = import('@keystone-6/core/types').KeystoneConfig<TypeInfo<Session>>

export type TypeInfo<Session = any> = {
  lists: {
    readonly User: Lists.User.TypeInfo<Session>
    readonly Role: Lists.Role.TypeInfo<Session>
    readonly AcceptanceDecision: Lists.AcceptanceDecision.TypeInfo<Session>
    readonly AuditEvent: Lists.AuditEvent.TypeInfo<Session>
    readonly Brand: Lists.Brand.TypeInfo<Session>
    readonly Competition: Lists.Competition.TypeInfo<Session>
    readonly DeadLetter: Lists.DeadLetter.TypeInfo<Session>
    readonly Event: Lists.Event.TypeInfo<Session>
    readonly Hold: Lists.Hold.TypeInfo<Session>
    readonly InboxMessage: Lists.InboxMessage.TypeInfo<Session>
    readonly JournalEntry: Lists.JournalEntry.TypeInfo<Session>
    readonly JournalTransaction: Lists.JournalTransaction.TypeInfo<Session>
    readonly Jurisdiction: Lists.Jurisdiction.TypeInfo<Session>
    readonly LedgerAccount: Lists.LedgerAccount.TypeInfo<Session>
    readonly Market: Lists.Market.TypeInfo<Session>
    readonly OperatorJurisdiction: Lists.OperatorJurisdiction.TypeInfo<Session>
    readonly OutboxMessage: Lists.OutboxMessage.TypeInfo<Session>
    readonly Player: Lists.Player.TypeInfo<Session>
    readonly PlayerLimit: Lists.PlayerLimit.TypeInfo<Session>
    readonly PriceSnapshot: Lists.PriceSnapshot.TypeInfo<Session>
    readonly ProviderConnection: Lists.ProviderConnection.TypeInfo<Session>
    readonly Quote: Lists.Quote.TypeInfo<Session>
    readonly RawEnvelope: Lists.RawEnvelope.TypeInfo<Session>
    readonly ResultVersion: Lists.ResultVersion.TypeInfo<Session>
    readonly Selection: Lists.Selection.TypeInfo<Session>
    readonly SelfExclusion: Lists.SelfExclusion.TypeInfo<Session>
    readonly Settlement: Lists.Settlement.TypeInfo<Session>
    readonly Sport: Lists.Sport.TypeInfo<Session>
    readonly Tenant: Lists.Tenant.TypeInfo<Session>
    readonly Wager: Lists.Wager.TypeInfo<Session>
    readonly WagerLeg: Lists.WagerLeg.TypeInfo<Session>
    readonly AMLCase: Lists.AMLCase.TypeInfo<Session>
    readonly AccountRestriction: Lists.AccountRestriction.TypeInfo<Session>
    readonly ApiRateBucket: Lists.ApiRateBucket.TypeInfo<Session>
    readonly ApprovalRequest: Lists.ApprovalRequest.TypeInfo<Session>
    readonly AuditAnchor: Lists.AuditAnchor.TypeInfo<Session>
    readonly BalanceProjection: Lists.BalanceProjection.TypeInfo<Session>
    readonly BetSlip: Lists.BetSlip.TypeInfo<Session>
    readonly BetSlipItem: Lists.BetSlipItem.TypeInfo<Session>
    readonly CashOutOffer: Lists.CashOutOffer.TypeInfo<Session>
    readonly Competitor: Lists.Competitor.TypeInfo<Session>
    readonly ComplianceReport: Lists.ComplianceReport.TypeInfo<Session>
    readonly ConfigValue: Lists.ConfigValue.TypeInfo<Session>
    readonly Consent: Lists.Consent.TypeInfo<Session>
    readonly DataCorrectionCase: Lists.DataCorrectionCase.TypeInfo<Session>
    readonly Dispute: Lists.Dispute.TypeInfo<Session>
    readonly DisputeEvent: Lists.DisputeEvent.TypeInfo<Session>
    readonly EventParticipant: Lists.EventParticipant.TypeInfo<Session>
    readonly ExposurePosition: Lists.ExposurePosition.TypeInfo<Session>
    readonly GeoCheck: Lists.GeoCheck.TypeInfo<Session>
    readonly GeoSession: Lists.GeoSession.TypeInfo<Session>
    readonly Incident: Lists.Incident.TypeInfo<Session>
    readonly LegGrade: Lists.LegGrade.TypeInfo<Session>
    readonly LegalHold: Lists.LegalHold.TypeInfo<Session>
    readonly LimitProfile: Lists.LimitProfile.TypeInfo<Session>
    readonly LimitRule: Lists.LimitRule.TypeInfo<Session>
    readonly MarketGrade: Lists.MarketGrade.TypeInfo<Session>
    readonly OnboardingProgress: Lists.OnboardingProgress.TypeInfo<Session>
    readonly PaymentAttempt: Lists.PaymentAttempt.TypeInfo<Session>
    readonly PaymentIntent: Lists.PaymentIntent.TypeInfo<Session>
    readonly PlayerIdentity: Lists.PlayerIdentity.TypeInfo<Session>
    readonly ProviderEntityMapping: Lists.ProviderEntityMapping.TypeInfo<Session>
    readonly ReconciliationItem: Lists.ReconciliationItem.TypeInfo<Session>
    readonly ReconciliationRun: Lists.ReconciliationRun.TypeInfo<Session>
    readonly ResettlementCase: Lists.ResettlementCase.TypeInfo<Session>
    readonly RoleGrant: Lists.RoleGrant.TypeInfo<Session>
    readonly TaxAssessment: Lists.TaxAssessment.TypeInfo<Session>
    readonly Team: Lists.Team.TypeInfo<Session>
    readonly TradingStatusChange: Lists.TradingStatusChange.TypeInfo<Session>
    readonly VerificationCase: Lists.VerificationCase.TypeInfo<Session>
    readonly VerificationCheck: Lists.VerificationCheck.TypeInfo<Session>
    readonly WagerStatusEvent: Lists.WagerStatusEvent.TypeInfo<Session>
    readonly WebhookReplay: Lists.WebhookReplay.TypeInfo<Session>
    readonly CustomerCommand: Lists.CustomerCommand.TypeInfo<Session>
    readonly CustomerQuoteLegTerms: Lists.CustomerQuoteLegTerms.TypeInfo<Session>
    readonly CustomerQuoteTerms: Lists.CustomerQuoteTerms.TypeInfo<Session>
    readonly CustomerSession: Lists.CustomerSession.TypeInfo<Session>
    readonly AccessReview: Lists.AccessReview.TypeInfo<Session>
    readonly AccountClosure: Lists.AccountClosure.TypeInfo<Session>
    readonly AdapterCertificationRun: Lists.AdapterCertificationRun.TypeInfo<Session>
    readonly AffiliateAttribution: Lists.AffiliateAttribution.TypeInfo<Session>
    readonly AffordabilityAssessment: Lists.AffordabilityAssessment.TypeInfo<Session>
    readonly BonusAward: Lists.BonusAward.TypeInfo<Session>
    readonly BonusTransaction: Lists.BonusTransaction.TypeInfo<Session>
    readonly BrandLocale: Lists.BrandLocale.TypeInfo<Session>
    readonly CampaignBudget: Lists.CampaignBudget.TypeInfo<Session>
    readonly CashOutAcceptance: Lists.CashOutAcceptance.TypeInfo<Session>
    readonly CompetitionStage: Lists.CompetitionStage.TypeInfo<Session>
    readonly ConfigDefinition: Lists.ConfigDefinition.TypeInfo<Session>
    readonly CorrelationGroup: Lists.CorrelationGroup.TypeInfo<Session>
    readonly CorrelationRule: Lists.CorrelationRule.TypeInfo<Session>
    readonly CurrencyDefinition: Lists.CurrencyDefinition.TypeInfo<Session>
    readonly CustomerCredential: Lists.CustomerCredential.TypeInfo<Session>
    readonly CustomerDevice: Lists.CustomerDevice.TypeInfo<Session>
    readonly CustomerFavorite: Lists.CustomerFavorite.TypeInfo<Session>
    readonly CustomerPrivacyRequest: Lists.CustomerPrivacyRequest.TypeInfo<Session>
    readonly CustomerRecoveryToken: Lists.CustomerRecoveryToken.TypeInfo<Session>
    readonly DataExport: Lists.DataExport.TypeInfo<Session>
    readonly EventScheduleChange: Lists.EventScheduleChange.TypeInfo<Session>
    readonly FeatureFlag: Lists.FeatureFlag.TypeInfo<Session>
    readonly FeedHealthSnapshot: Lists.FeedHealthSnapshot.TypeInfo<Session>
    readonly HouseRuleVersion: Lists.HouseRuleVersion.TypeInfo<Session>
    readonly IntegrationDeliveryAttempt: Lists.IntegrationDeliveryAttempt.TypeInfo<Session>
    readonly IntegrityCase: Lists.IntegrityCase.TypeInfo<Session>
    readonly JurisdictionPolicyVersion: Lists.JurisdictionPolicyVersion.TypeInfo<Session>
    readonly LedgerAdjustmentRequest: Lists.LedgerAdjustmentRequest.TypeInfo<Session>
    readonly LegalEntity: Lists.LegalEntity.TypeInfo<Session>
    readonly MarketDefinition: Lists.MarketDefinition.TypeInfo<Session>
    readonly Notification: Lists.Notification.TypeInfo<Session>
    readonly OperatorChannel: Lists.OperatorChannel.TypeInfo<Session>
    readonly PamSubjectMapping: Lists.PamSubjectMapping.TypeInfo<Session>
    readonly PlayerStatement: Lists.PlayerStatement.TypeInfo<Session>
    readonly Promotion: Lists.Promotion.TypeInfo<Session>
    readonly PromotionRedemption: Lists.PromotionRedemption.TypeInfo<Session>
    readonly PromotionRuleVersion: Lists.PromotionRuleVersion.TypeInfo<Session>
    readonly ProviderHealthSample: Lists.ProviderHealthSample.TypeInfo<Session>
    readonly Region: Lists.Region.TypeInfo<Session>
    readonly ReportArtifact: Lists.ReportArtifact.TypeInfo<Session>
    readonly RetentionExecution: Lists.RetentionExecution.TypeInfo<Session>
    readonly RetentionPolicyVersion: Lists.RetentionPolicyVersion.TypeInfo<Session>
    readonly SafeguardingAccount: Lists.SafeguardingAccount.TypeInfo<Session>
    readonly SafeguardingReconciliation: Lists.SafeguardingReconciliation.TypeInfo<Session>
    readonly ScheduledJob: Lists.ScheduledJob.TypeInfo<Session>
    readonly ScreeningHit: Lists.ScreeningHit.TypeInfo<Session>
    readonly Season: Lists.Season.TypeInfo<Session>
    readonly SettlementLine: Lists.SettlementLine.TypeInfo<Session>
    readonly SettlementRun: Lists.SettlementRun.TypeInfo<Session>
    readonly SupportCase: Lists.SupportCase.TypeInfo<Session>
    readonly SupportCaseEvent: Lists.SupportCaseEvent.TypeInfo<Session>
    readonly TaxRuleVersion: Lists.TaxRuleVersion.TypeInfo<Session>
    readonly TenantCurrency: Lists.TenantCurrency.TypeInfo<Session>
    readonly TraderOverride: Lists.TraderOverride.TypeInfo<Session>
    readonly TradingReplayRun: Lists.TradingReplayRun.TypeInfo<Session>
    readonly Venue: Lists.Venue.TypeInfo<Session>
    readonly WagerExposureAllocation: Lists.WagerExposureAllocation.TypeInfo<Session>
    readonly WagerPart: Lists.WagerPart.TypeInfo<Session>
    readonly WebhookDelivery: Lists.WebhookDelivery.TypeInfo<Session>
    readonly WebhookEndpoint: Lists.WebhookEndpoint.TypeInfo<Session>
    readonly WorkerHeartbeat: Lists.WorkerHeartbeat.TypeInfo<Session>
  }
  prisma: import('../prisma/client/client.js').PrismaClient
  prismaClientOptions: import('../prisma/client/client.js').Prisma.PrismaClientOptions
  session: Session
  dbProvider: 'postgresql'
}

type __TypeInfo<Session = any> = TypeInfo<Session>

export type Lists<Session = any> = {
  [Key in keyof TypeInfo['lists']]?: import('@keystone-6/core/types').ListConfig<TypeInfo<Session>['lists'][Key]>
} & Record<string, import('@keystone-6/core/types').ListConfig<any>>

export {}
