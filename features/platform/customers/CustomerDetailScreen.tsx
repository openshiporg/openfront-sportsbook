import { notFound } from "next/navigation";
import { MutationForm } from "../components/MutationForm";
import { Mono, PillLink, StatusDot, Track } from "../components/kit";
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
  const tenantId = operator.tenantId;
  // Account records for this player. Selects never include token, device or email digests, password hashes, risk signals or notification payloads.
  const caseIds = player.from_VerificationCase_player.map((item: any) => item.id);
  const [consents, statements, sessions, devices, credentials, closure, notifications, notificationTotal, checks] = await Promise.all([
    prisma.consent.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50, select: { id: true, type: true, policyVersion: true, givenAt: true, withdrawnAt: true } }),
    // Statements carry money: finance only.
    canFinance ? prisma.playerStatement.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ periodEnd: "desc" }, { id: "desc" }], take: 24, select: { id: true, periodStart: true, periodEnd: true, openingMinor: true, closingMinor: true, currency: true, status: true } }) : Promise.resolve([]),
    prisma.customerSession.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, select: { id: true, assuranceLevel: true, lastSeenAt: true, expiresAt: true, revokedAt: true, createdAt: true } }),
    prisma.customerDevice.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ lastSeenAt: "desc" }, { id: "desc" }], take: 20, select: { id: true, label: true, firstSeenAt: true, lastSeenAt: true, revokedAt: true } }),
    prisma.customerCredential.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 5, select: { id: true, emailMasked: true, status: true, failedAttempts: true, lockedUntil: true, verifiedAt: true, lastAuthenticatedAt: true } }),
    prisma.accountClosure.findFirst({ where: { tenantId, playerId: player.id }, orderBy: [{ requestedAt: "desc" }, { id: "desc" }], select: { id: true, status: true, reasonCode: true, requestedAt: true, coolingEndsAt: true, completedAt: true } }),
    prisma.notification.findMany({ where: { tenantId, playerId: player.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, select: { id: true, channel: true, templateKey: true, templateVersion: true, status: true, sentAt: true } }),
    prisma.notification.count({ where: { tenantId, playerId: player.id } }),
    caseIds.length ? prisma.verificationCheck.findMany({ where: { tenantId, verificationCaseId: { in: caseIds } }, orderBy: [{ attempt: "asc" }, { createdAt: "asc" }], select: { id: true, verificationCaseId: true, attempt: true, decision: true, reasonCode: true } }) : Promise.resolve([]),
  ]);
  const checksByCase = new Map<string, any[]>();
  for (const check of checks as any[]) checksByCase.set(check.verificationCaseId, [...(checksByCase.get(check.verificationCaseId) ?? []), check]);
  const sessionState = (item: any) => item.revokedAt ? "REVOKED" : new Date(item.expiresAt) <= now ? "EXPIRED" : "ACTIVE";
  const consentState = (item: any) => item.withdrawnAt ? "WITHDRAWN" : item.givenAt ? "ACTIVE" : "PENDING";
  const credentialLocked = (item: any) => item.status === "LOCKED" || (item.lockedUntil && new Date(item.lockedUntil) > now);
  const activeSessions = sessions.filter((item: any) => sessionState(item) === "ACTIVE");
  const closureOpen = closure && ["REQUESTED", "REVIEW", "BLOCKED_FUNDS"].includes(closure.status);
  const latestGeo = player.from_GeoSession_player[0]?.from_GeoCheck_geoSession[0];
  const canCompliance = operator.capabilities.canManageCompliance;
  const disabledReason = canCompliance ? undefined : "Your role does not include compliance capability.";
  const activeRestrictions = player.from_AccountRestriction_player.filter((item: any) => item.status === "ACTIVE");
  const pendingCases = player.from_VerificationCase_player.filter((item: any) => item.status === "PENDING");
  const openAml = player.from_AMLCase_player.filter((item: any) => item.status !== "CLOSED");
  const tone = activeRestrictions.length ? "alert" : statusDotTone(player.status);
  const meta = `KYC ${String(player.kycStatus ?? "unknown").toLowerCase()} · ${activeRestrictions.length} restrictions · ${pendingCases.length} pending verification · ${openAml.length} AML open${closureOpen ? ` · closure ${String(closure.status).replaceAll("_", " ").toLowerCase()}` : ""}`;

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

    <section aria-labelledby="customer-closure" className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="customer-closure" className="text-sm font-semibold">{closure ? <StatusDot tone={closure.status === "BLOCKED_FUNDS" ? "alert" : statusDotTone(closure.status)} /> : null}Account closure</h2>
        {closureOpen ? <Track><PillLink size="sm" href="/dashboard/platform/closures">Closures</PillLink></Track> : null}
      </div>
      {closure ? <DetailGrid items={[
        { label: "Status", value: <StatusBadge value={closure.status} /> },
        { label: "Reason", value: closure.reasonCode || "—" },
        { label: "Requested", value: <Mono>{dateTime(closure.requestedAt)}</Mono> },
        { label: "Cooling ends", value: <Mono>{dateTime(closure.coolingEndsAt)}</Mono> },
        { label: "Completed", value: <Mono>{dateTime(closure.completedAt)}</Mono> },
        { label: "Closure ID", value: <Mono className="break-all text-xs">{shortId(closure.id)}</Mono> },
      ]} /> : <WorkflowNote title="No closure request" />}
    </section>

    <section className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">Pending decisions<span className="ml-2 font-mono text-xs font-normal tabular-nums text-muted-foreground">{pendingCases.length}</span></h2>
      {pendingCases.length
        ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pendingCases.map((item: any) => <MutationForm key={item.id} compact title={`${item.type} · ${shortId(item.id)}`} requireReview mutation={decideVerification} fields={[{ name: "caseId", label: "Case", type: "hidden", defaultValue: item.id }, { name: "decision", label: "Decision", type: "select", options: [{ label: "Approve", value: "APPROVED" }, { label: "Reject", value: "REJECTED" }] }, { name: "reason", label: "Decision reason" }]} submitLabel="Record decision" successMessage="Verification decision recorded." disabledReason={disabledReason} />)}</div>
        : <WorkflowNote title="No pending verification" />}
    </section>

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList
        title="Verification cases"
        columns={["Case", "Type", "Evidence", "State", "Checks"]}
        rows={player.from_VerificationCase_player.map((item: any) => ({ id: item.id, status: item.status, cells: [<Mono key="case">{shortId(item.id)}</Mono>, item.type, <span key="evidence" className="break-all">{item.evidenceReference || "No reference"}</span>, <StatusBadge key="status" value={item.status} />, checksByCase.get(item.id)?.length
          ? <ul key="checks" className="space-y-1">{checksByCase.get(item.id)!.map((check: any) => <li key={check.id} className="flex flex-wrap items-center justify-end gap-x-2 md:justify-start"><Mono className="text-xs">#{check.attempt ?? "—"}</Mono><StatusBadge value={check.decision} />{check.reasonCode ? <span className="break-all text-xs">{check.reasonCode}</span> : null}</li>)}</ul>
          : "No checks"] }))}
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

    {!canFinance
      ? <WorkflowNote title="Statements hidden">Finance permission required</WorkflowNote>
      : <RecordList
        title="Statements"
        columns={["Period", "Opening", "Closing", "State"]}
        rows={(statements as any[]).map((item: any) => ({
          id: item.id,
          status: item.status,
          cells: [
            <Mono key="period" className="text-xs">{dateTime(item.periodStart)} → {dateTime(item.periodEnd)}</Mono>,
            <Mono key="opening">{money(item.openingMinor, item.currency)}</Mono>,
            <Mono key="closing">{money(item.closingMinor, item.currency)}</Mono>,
            <StatusBadge key="state" value={item.status} />,
          ],
        }))}
        emptyTitle="No statements"
      />}

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList
        title="Consents"
        columns={["Type", "Policy", "Given / withdrawn", "State"]}
        rows={consents.map((item: any) => ({
          id: item.id,
          status: consentState(item),
          cells: [
            item.type || "—",
            <Mono key="policy" className="text-xs">{item.policyVersion || "—"}</Mono>,
            <Mono key="window" className="text-xs">{dateTime(item.givenAt)} / {dateTime(item.withdrawnAt)}</Mono>,
            <StatusBadge key="state" value={consentState(item)} />,
          ],
        }))}
        emptyTitle="No consents"
      />
      <RecordList
        title="Sign-in"
        tone={credentials.some(credentialLocked) ? "alert" : undefined}
        columns={["Email", "State", "Locked until", "Last sign-in"]}
        rows={credentials.map((item: any) => ({
          id: item.id,
          status: item.status,
          cells: [
            <span key="email" className="break-all">{item.emailMasked || "—"}</span>,
            <span key="state" className="flex flex-wrap items-center justify-end gap-x-2 md:justify-start"><StatusBadge value={item.status} />{item.failedAttempts ? <Mono className="text-xs">{item.failedAttempts} failed</Mono> : null}{item.verifiedAt ? null : <span className="text-xs">unverified</span>}</span>,
            <Mono key="locked" className="text-xs">{dateTime(item.lockedUntil)}</Mono>,
            <Mono key="last" className="text-xs">{dateTime(item.lastAuthenticatedAt)}</Mono>,
          ],
        }))}
        emptyTitle="No sign-in credential"
      />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <RecordList
        title="Sessions"
        description={`${activeSessions.length} active`}
        columns={["Assurance", "Last seen", "Expires", "State"]}
        rows={sessions.map((item: any) => ({
          id: item.id,
          status: sessionState(item),
          cells: [
            String(item.assuranceLevel ?? "UNKNOWN").replaceAll("_", " ").toLowerCase(),
            <Mono key="seen" className="text-xs">{dateTime(item.lastSeenAt)}</Mono>,
            <Mono key="expires" className="text-xs">{dateTime(item.expiresAt)}</Mono>,
            <span key="state" className="flex flex-wrap items-center justify-end gap-x-2 md:justify-start"><StatusBadge value={sessionState(item)} />{item.revokedAt ? <Mono className="text-xs">{dateTime(item.revokedAt)}</Mono> : null}</span>,
          ],
        }))}
        emptyTitle="No sessions"
      />
      <RecordList
        title="Devices"
        columns={["Device", "First seen", "Last seen", "State"]}
        rows={devices.map((item: any) => ({
          id: item.id,
          status: item.revokedAt ? "REVOKED" : "ACTIVE",
          cells: [
            <span key="label" className="break-all">{item.label || "Unnamed device"}</span>,
            <Mono key="first" className="text-xs">{dateTime(item.firstSeenAt)}</Mono>,
            <Mono key="last" className="text-xs">{dateTime(item.lastSeenAt)}</Mono>,
            <span key="state" className="flex flex-wrap items-center justify-end gap-x-2 md:justify-start"><StatusBadge value={item.revokedAt ? "REVOKED" : "ACTIVE"} />{item.revokedAt ? <Mono className="text-xs">{dateTime(item.revokedAt)}</Mono> : null}</span>,
          ],
        }))}
        emptyTitle="No devices"
      />
    </div>

    <RecordList
      title="Notifications"
      description={notificationTotal > notifications.length ? `latest ${notifications.length} of ${notificationTotal}` : undefined}
      tone={notifications.some((item: any) => item.status === "FAILED") ? "alert" : undefined}
      action={operator.capabilities.canManageSportsbook ? <Track><PillLink size="sm" href="/dashboard/platform/notifications">All notifications</PillLink></Track> : undefined}
      columns={["Template", "Channel", "State", "Sent"]}
      rows={notifications.map((item: any) => ({
        id: item.id,
        status: item.status,
        cells: [
          <span key="template" className="break-all"><Mono className="text-xs">{item.templateKey || "—"}</Mono>{item.templateVersion ? <Mono className="text-xs text-muted-foreground"> v{item.templateVersion}</Mono> : null}</span>,
          String(item.channel ?? "—").replaceAll("_", " ").toLowerCase(),
          <StatusBadge key="state" value={item.status} />,
          <Mono key="sent" className="text-xs">{dateTime(item.sentAt)}</Mono>,
        ],
      }))}
      emptyTitle="No notifications"
    />

    <div className="grid gap-4 xl:grid-cols-2">
      <MutationForm title="Open verification case" mutation={openVerification} fields={[{ name: "playerId", label: "Player", type: "hidden", defaultValue: player.id }, { name: "type", label: "Case type", type: "select", options: ["KYC", "AGE", "ADDRESS"].map((value) => ({ label: value, value })) }, { name: "evidenceReference", label: "Restricted evidence reference", placeholder: "vault://case/reference" }]} submitLabel="Open verification" successMessage="Verification case opened." disabledReason={disabledReason} />
      <MutationForm title="Update AML case" requireReview mutation={amlMutation} fields={[{ name: "playerId", label: "Player", type: "hidden", defaultValue: player.id }, { name: "status", label: "Case state", type: "select", options: ["OPEN", "REVIEW", "CLOSED"].map((value) => ({ label: value, value })) }, { name: "riskBand", label: "Risk band", type: "select", defaultValue: player.riskBand, options: ["LOW", "MEDIUM", "HIGH"].map((value) => ({ label: value, value })) }, { name: "reason", label: "Restricted review note", type: "textarea" }]} submitLabel="Save AML review" successMessage="AML case updated." disabledReason={disabledReason} />
    </div>
  </OperatorShell>;
}
