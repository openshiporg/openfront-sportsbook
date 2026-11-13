import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { RecordList, StatusBadge } from '../components/WorkflowUI'
import { getOperatorContext, notFoundWhenForbidden, platformPrisma as prisma } from '../lib/operator'
import { displayTimeZone, money } from '../lib/format'
import { formatInZone } from '@/features/dashboard/lib/storeTime'
import { PaymentsControls } from './components/PaymentsControls'
import { MutationForm } from '../components/MutationForm'
import { Mono } from '../components/kit'
import { shortId } from '../lib/format'
import { playerDisplay } from '@/features/sportsbook/domain/references'
import { canMarkWithdrawalPaid } from './withdrawal-policy'

const adapterNames:Record<string,string>={authorizenet:'Authorize.net',paysafe:'Paysafe',aeropay:'Aeropay',manual:'Cage cash and bank transfer'}

export async function PaymentsScreen() {
 const operator=await getOperatorContext('canManageCompliance')
 if (!operator) await notFoundWhenForbidden();
 if(!operator)return <OperatorShell active="Payments" eyebrow="Regulatory & finance" title="Licences & payments"><TenantRequired/></OperatorShell>
 const tenantId=operator.tenantId
 const [licences,connections,intents,cage]=await Promise.all([
  prisma.operatorLicence.findMany({where:{tenantId},orderBy:{createdAt:'desc'},take:100}),
  prisma.providerConnection.findMany({where:{tenantId,adapterId:{in:['authorizenet','paysafe','aeropay','manual']}},orderBy:{createdAt:'desc'},take:100}),
  prisma.paymentIntent.findMany({where:{tenantId,type:'WITHDRAWAL',status:{in:['PROCESSING','UNKNOWN','PENDING']}},orderBy:{createdAt:'asc'},take:100,include:{player:{select:{id:true,from_CustomerCredential_player:{select:{emailMasked:true},take:1}}}}}),
 prisma.paymentIntent.findMany({where:{tenantId,type:'DEPOSIT',paymentMethodReference:'cage-cash',status:'PENDING'},orderBy:{createdAt:'asc'},take:100,include:{player:{select:{id:true,from_CustomerCredential_player:{select:{emailMasked:true},take:1}}}}}),
 ])
 const configured=(reference:string)=>Boolean(reference&&process.env[reference])
 return <OperatorShell active="Payments" eyebrow="Regulatory & finance" title="Licences & payments" tenantName={operator.tenantName}>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Operator licences & permitted regions</h2><PaymentsControls kind="licence"/><RecordList title="Licences" columns={['Licence','Regulator','Expiry','Regions / status']} rows={licences.map((x:any)=>({id:x.id,status:x.status,cells:[x.licenceNumber,x.regulator,formatInZone(x.expiresAt, displayTimeZone(), 'date'),<span key="r">{Array.isArray(x.permittedRegions)?x.permittedRegions.join(', '):''} · <StatusBadge value={x.status}/></span>]}))} emptyTitle="No licences configured"/></section>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Payment providers</h2><PaymentsControls kind="provider"/><RecordList title="Configured payment connections" columns={['Provider','Configuration','Credentials','State']} rows={connections.map((x:any)=>({id:x.id,status:x.status,cells:[adapterNames[x.adapterId]??x.adapterId,x.configReference,configured(x.secretReference)?'Configured':'Not configured',<StatusBadge key="s" value={x.status}/>]}))} emptyTitle="No payment providers configured"/></section>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Withdrawal queue</h2><RecordList title="Withdrawals requiring operator action" columns={['Intent','Player','Amount','State / action']} rows={intents.map((x:any)=>{const manual=(x.riskEvidence as any)?.provider?.adapterId==='manual';return {id:x.id,status:x.status,cells:[<span key="i"><Mono>{shortId(x.id)}</Mono><span className="block text-xs text-muted-foreground">{x.status==='UNKNOWN'?'Provider outcome unknown · funds held':manual?'Bank transfer to send · funds held':'In progress · funds held'}</span></span>,playerDisplay(x.player,x.playerId).primary,money(x.amountMinor,x.currency),<PaymentsControls key="action" kind="withdrawal" intentId={x.id} canSettle={manual&&canMarkWithdrawalPaid(operator.capabilities)} canCheck={!manual||x.status==='UNKNOWN'}/>]}})} emptyTitle="No withdrawals awaiting action"/></section>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Cage cash deposits</h2><p className="text-xs text-muted-foreground">{connections.some((x:any)=>x.adapterId==='manual'&&x.status==='ACTIVE')?'Cage deposits are on for players. Disable the manual connection above to turn them off.':'Cage deposits are off. Add an ACTIVE manual connection above to offer them.'}</p><RecordList title="Waiting for cash" columns={['Reference','Player','Amount','Requested']} rows={cage.map((x:any)=>({id:x.id,status:x.status,cells:[x.providerSessionReference,playerDisplay(x.player,x.playerId).primary,money(x.amountMinor,x.currency),formatInZone(x.createdAt,displayTimeZone())]}))} emptyTitle="No deposits waiting"/><MutationForm title="Confirm cash received" mutation={`mutation Confirm($reference:String!){confirmCageDeposit(reference:$reference)}`} fields={[{name:'reference',label:'Player reference code',placeholder:'CG-XXXXXX'}]} submitLabel="Credit wallet" successMessage="Cash confirmed. The wallet is credited." requireReview/></section>
 </OperatorShell>
}
