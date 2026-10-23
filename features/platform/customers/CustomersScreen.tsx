import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { ReadFailed } from "../components/ReadFailed";
import { dateTime, shortId } from "../lib/format";
import { searchFrom } from "../lib/graphql";
import { getOperatorContext } from "../lib/operator";
import { allowedParam, pageFrom, PLATFORM_PAGE_SIZE, type PlatformSearchParams } from "../lib/paging";
import { getCustomers } from "./actions";
import { CustomersPageClient } from "./screens/CustomersPageClient";

const kycStatuses = ["REQUIRED", "PENDING", "APPROVED", "REJECTED"] as const;

/** Server screen: authorizes the operator, reads the queue through GraphQL and hands typed rows to the client screen. */
export async function CustomersScreen({ searchParams }: { searchParams?: PlatformSearchParams } = {}) {
  const params = (await searchParams) ?? {};
  const page = pageFrom(params);
  const search = searchFrom(params);
  const kycStatus = allowedParam(params, "kyc", kycStatuses);
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="Customers" title="Customers"><TenantRequired /></OperatorShell>;
  const result = await getCustomers({ page, pageSize: PLATFORM_PAGE_SIZE, search, kycStatus });
  const meta = result.success ? `${result.data.total} ${search || kycStatus ? "matching" : "players"} · ${result.data.pendingKyc} KYC pending · ${result.data.openAml} AML open · ${result.data.restricted} restricted` : undefined;
  const tone = result.success ? (result.data.pendingKyc || result.data.openAml ? "wait" : "ok") : "alert";
  return <OperatorShell active="Customers" title="Customers" tenantName={operator.tenantName} tone={tone} meta={meta}>
    {result.success ? <CustomersPageClient data={{
      rows: result.data.players.map((player) => ({ id: player.id, subject: player.subject || shortId(player.id), reference: shortId(player.id), createdAt: dateTime(player.createdAt), kycStatus: player.kycStatus, riskBand: player.riskBand || "UNKNOWN", verificationCases: player.verificationCases, amlCases: player.amlCases, status: player.status, restricted: player.activeRestrictions > 0 })),
      total: result.data.total, pendingKyc: result.data.pendingKyc, openAml: result.data.openAml, restricted: result.data.restricted,
      page, pageSize: PLATFORM_PAGE_SIZE, search, kycStatus,
    }} /> : <ReadFailed subject="customers" />}
  </OperatorShell>;
}
