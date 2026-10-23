import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { Mono } from "../components/kit";
import { OperatorShell, TenantRequired } from "../components/OperatorShell";
import { DetailGrid, RecordList, StatusBadge, statusDotTone, WorkflowNote } from "../components/WorkflowUI";
import { dateTime, money, shortId, windowState } from "../lib/format";
import { getOperatorContext, platformPrisma as prisma } from "../lib/operator";

const openVerification = `mutation OpenVerification($playerId:ID!,$type:String!,$evidenceReference:String!){openVerificationCase(playerId:$playerId,type:$type,evidenceReference:$evidenceReference)}`;
const decideVerification = `mutation DecideVerification($caseId:ID!,$decision:String!,$reason:String!){decideVerificationCase(caseId:$caseId,decision:$decision,reason:$reason)}`;
const amlMutation = `mutation AML($playerId:ID!,$status:String!,$riskBand:String!,$reason:String!){reviewAMLCase(playerId:$playerId,status:$status,riskBand:$riskBand,reason:$reason)}`;

export async function CustomerDetailScreen({ playerId }: { playerId: string }) {
  const operator = await getOperatorContext("canManageCompliance");
  if (!operator) return <OperatorShell active="Customers" detail title="Customer"><TenantRequired /></OperatorShell>;
  const player = await prisma.player.findFirst({ where: { id: playerId, tenantId: operator.tenantId }, include: { brand: true, from_VerificationCase_player: { orderBy: { createdAt: "desc" }, take: 100 }, from_AMLCase_player: { orderBy: { createdAt: "desc" }, take: 50 }, from_GeoSession_player: { orderBy: { createdAt: "desc" }, take: 20, include: { from_GeoCheck_geoSession: { orderBy: { checkedAt: "desc" }, take: 1 } } }, from_AccountRestriction_player: { orderBy: { createdAt: "desc" }, take: 50 }, _count: { select: { from_Wager_player: true, from_PaymentIntent_player: true } } } });
  if (!player) notFound();
  // Ledger accounts and balances are finance records (LedgerAccount is canManageFinance); compliance-only operators see counts, not balances.
  const canFinance = operator.capabilities.canManageFinance;
  const accounts = canFinance ? await prisma.ledgerAccount.findMany({ where: { tenantId: operator.tenantId, playerId: player.id, key: "PLAYER_CASH" }, include: { from_BalanceProjection_account: { orderBy: { version: "desc" }, take: 1 } } }) : [];
  // One wallet per currency: never infer "the" balance from the first matching cash account.
  const cashWallets = accounts.filter((account: any) => account.key === "PLAYER_CASH").sort((a: any, b: any) => String(a.currency).localeCompare(String(b.currency)));
  const now = new Date();
  const latestGeo = player.from_GeoSession_player[0]?.from_GeoCheck_geoSession[0];
  const canCompliance = operator.capabilities.canManageCompliance;
  const disabledReason = canCompliance ? undefined : "Your role does not include compliance capability.";
  const activeRestrictions = player.from_AccountRestriction_player.filter((item: any) => item.status === "ACTIVE");
  const pendingCases = player.from_VerificationCase_player.filter((item: any) => item.status === "PENDING");
  const openAml = player.from_AMLCase_player.filter((item: any) => item.status !== "CLOSED");
  const tone = activeRestrictions.length ? "alert" : statusDotTone(player.status);
  const meta = `KYC ${String(player.kycStatus ?? "unknown").toLowerCase()} · ${activeRestrictions.length} restrictions · ${pendingCases.length} pending verification · ${openAml.length} AML open`;

  return <OperatorShell active="Customers" detail title={player.subject} tenantName={operator.tenantName} tone={tone} meta={meta}>
    <DetailGrid items={[
      { label: "Account", value: <span className="flex flex-wrap gap-x-3 gap-y-1"><StatusBadge value={player.status} />{activeRestrictions.length ? <StatusBadge value="RESTRICTED" /> : null}</span> },
      { label: "KYC", value: <StatusBadge value={player.kycStatus} /> },
      { label: "Risk band", value: <StatusBadge value={player.riskBand} /> },
      { label: "Latest geo", value: latestGeo ? <StatusBadge value={latestGeo.decision} /> : "No check" },
      { label: "Wagers / payments", value: <Mono>{player._count.from_Wager_player} / {player._count.from_PaymentIntent_player}</Mono> },
      { label: "Cash wallets", value: !canFinance ? "Finance access required" : cashWallets.length ? <Mono>{cashWallets.length} · {cashWallets.map((account: any) => account.currency).join(", ")}</Mono> : "No cash wallet" },
      { label: "Player ID", value: <Mono className="break-all text-xs">{player.id}</Mono> },
      { label: "Brand", value: player.brand?.name || "—" },
    ]} />

    <RecordList
      title="Restrictions"
      tone={activeRestrictions.length ? "alert" : undefined}
      columns={["Capability", "Reason", "Window", "State"]}
      rows={player.from_AccountRestriction_player.map((item: any) => ({
        id: item.id,
        status: item.status,
        cells: [
          item.capability,
          item.reasonCode || "—",
          <Mono key="window" className="text-xs">{dateTime(item.startsAt)} → {item.endsAt ? dateTime(item.endsAt) : "indefinite"}</Mono>,
          <span key="state" className="flex flex-wrap gap-2"><StatusBadge value={item.status} />{item.status === "ACTIVE" && windowState(item, now) !== "EFFECTIVE" ? <span className="text-xs text-amber-700 dark:text-amber-400">window {windowState(item, now).toLowerCase()} · still enforced</span> : null}</span>,
        ],
      }))}
      emptyTitle="No restrictions"
    />

    <section className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">Pending decisions<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{pendingCases.length}</span></h2>
      {pendingCases.length
        ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pendingCases.map((item: any) => <MutationForm key={item.id} compact title={`${item.type} · ${shortId(item.id)}`} requireReview mutation={decideVerification} fields={[{ name: "caseId", label: "Case", type: "hidden", defaultValue: item.id }, { name: "decision", label: "Decision", type: "select", options: [{ label: "Approve", value: "APPROVED" }, { label: "Reject", value: "REJECTED" }] }, { name: "reason", label: "Decision reason" }]} submitLabel="Record decision" successMessage="Verification decision recorded." disabledReason={disabledReason} />)}</div>
        : <WorkflowNote title="No pending verification" />}
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList
        title="Verification cases"
        columns={["Case", "Type", "Evidence", "State"]}
        rows={player.from_VerificationCase_player.map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="case">{shortId(item.id)}</Mono>, item.type, <span key="evidence" className="break-all">{item.evidenceReference || "No reference"}</span>, <StatusBadge key="status" value={item.status} />] }))}
        emptyTitle="No verification cases"
      />
      <RecordList
        title="AML cases"
        tone={openAml.length ? "wait" : undefined}
        columns={["Case", "Risk", "Owner", "State"]}
        rows={player.from_AMLCase_player.map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="case">{shortId(item.id)}</Mono>, <StatusBadge key="risk" value={item.riskBand} />, item.ownerId ? <Mono key="owner">{shortId(item.ownerId)}</Mono> : "Unassigned", <StatusBadge key="state" value={item.status} />] }))}
        emptyTitle="No AML cases"
      />
    </div>

    {!canFinance
      ? <WorkflowNote title="Balances hidden">Finance permission required</WorkflowNote>
      : <RecordList
        title="Cash wallets"
        columns={["Wallet", "Available", "Posted / pending", "As of"]}
        rows={cashWallets.map((account: any) => {
          const projection = account.from_BalanceProjection_account[0];
          return {
            id: account.id,
            cells: [
              <span key="wallet"><Mono>{account.currency}</Mono><span className="block break-all font-mono text-xs font-normal text-muted-foreground">{account.id}</span></span>,
              projection ? <Mono key="available">{money(projection.availableMinor, account.currency)}</Mono> : "Unknown (no projection)",
              projection ? <Mono key="posted">{money(projection.postedMinor, account.currency)} / {money(projection.pendingMinor, account.currency)}</Mono> : "—",
              projection ? <Mono key="asof" className="text-xs">{dateTime(projection.asOf)} · v{projection.version}</Mono> : "—",
            ],
          };
        })}
        emptyTitle="No cash wallets"
      />}

    <div className="grid gap-4 xl:grid-cols-2">
      <MutationForm title="Open verification case" mutation={openVerification} fields={[{ name: "playerId", label: "Player", type: "hidden", defaultValue: player.id }, { name: "type", label: "Case type", type: "select", options: ["KYC", "AGE", "ADDRESS"].map((value) => ({ label: value, value })) }, { name: "evidenceReference", label: "Restricted evidence reference", placeholder: "vault://case/reference" }]} submitLabel="Open verification" successMessage="Verification case opened." disabledReason={disabledReason} />
      <MutationForm title="Update AML case" requireReview mutation={amlMutation} fields={[{ name: "playerId", label: "Player", type: "hidden", defaultValue: player.id }, { name: "status", label: "Case state", type: "select", options: ["OPEN", "REVIEW", "CLOSED"].map((value) => ({ label: value, value })) }, { name: "riskBand", label: "Risk band", type: "select", defaultValue: player.riskBand, options: ["LOW", "MEDIUM", "HIGH"].map((value) => ({ label: value, value })) }, { name: "reason", label: "Restricted review note", type: "textarea" }]} submitLabel="Save AML review" successMessage="AML case updated." disabledReason={disabledReason} />
    </div>
  </OperatorShell>;
}
