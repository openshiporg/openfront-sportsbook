-- At most one active default customer currency may be resolved for a tenant.
CREATE UNIQUE INDEX "TenantCurrency_one_default_uq" ON "TenantCurrency" (tenant) WHERE "defaultForBrand" = true AND status = 'ACTIVE';
