import { OperatorShell, TenantRequired } from '../components/OperatorShell'
import { RecordList, StatusBadge } from '../components/WorkflowUI'
import { getOperatorContext, platformPrisma as prisma } from '../lib/operator'
import { displayTimeZone } from '../lib/format'
import { formatInZone } from '@/features/dashboard/lib/storeTime'
import { PaymentsControls } from './components/PaymentsControls'

export async function PaymentsScreen() {
 const operator=await getOperatorContext('canManageCompliance')
 if(!operator)return <OperatorShell active="Payments" eyebrow="Regulatory & finance" title="Licences & payments"><TenantRequired/></OperatorShell>
 const tenantId=operator.tenantId
 const [licences,connections,intents]=await Promise.all([
  prisma.operatorLicence.findMany({where:{tenantId},orderBy:{createdAt:'desc'},take:100}),
  prisma.providerConnection.findMany({where:{tenantId,adapterId:{in:['authorizenet','paysafe','aeropay','manual']}},orderBy:{createdAt:'desc'},take:100}),
  prisma.paymentIntent.findMany({where:{tenantId,type:'WITHDRAWAL',status:{in:['PROCESSING','UNKNOWN','PENDING']}},orderBy:{createdAt:'asc'},take:100}),
 ])
 const configured=(reference:string)=>Boolean(reference&&process.env[reference])
 return <OperatorShell active="Payments" eyebrow="Regulatory & finance" title="Licences & payments" tenantName={operator.tenantName}>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Operator licences & permitted regions</h2><PaymentsControls kind="licence"/><RecordList title="Licences" columns={['Licence','Regulator','Expiry','Regions / status']} rows={licences.map((x:any)=>({id:x.id,status:x.status,cells:[x.licenceNumber,x.regulator,formatInZone(x.expiresAt, displayTimeZone(), 'date'),<span key="r">{Array.isArray(x.permittedRegions)?x.permittedRegions.join(', '):''} · <StatusBadge value={x.status}/></span>]}))} emptyTitle="No licences configured"/></section>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Payment providers</h2><PaymentsControls kind="provider"/><RecordList title="Configured payment connections" columns={['Adapter','Configuration','Credentials','State']} rows={connections.map((x:any)=>({id:x.id,status:x.status,cells:[x.adapterId,x.configReference,configured(x.secretReference)?'Configured':'Not configured',<StatusBadge key="s" value={x.status}/>]}))} emptyTitle="No payment providers configured"/></section>
  <section className="space-y-3"><h2 className="text-sm font-semibold">Withdrawal queue</h2><RecordList title="Withdrawals requiring operator action" columns={['Intent','Player','Amount','State / action']} rows={intents.map((x:any)=>({id:x.id,status:x.status,cells:[x.id,x.playerId??'—',`${x.amountMinor} ${x.currency}`,<PaymentsControls key="action" kind="withdrawal" intentId={x.id}/>]}))} emptyTitle="No withdrawals awaiting action"/></section>
 </OperatorShell>
}
