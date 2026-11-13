import { handleProviderWebhook } from '@/features/sportsbook/api/provider-webhook'
import { HOUSE_KINDS, type HouseKind } from '@/features/sportsbook/adapters/internal'
export async function POST(request:Request,{params}:{params:Promise<{kind:string}>}){ const {kind}=await params; if(!HOUSE_KINDS.includes(kind as HouseKind)) return Response.json({error:'unknown_adapter'},{status:404}); return handleProviderWebhook(request,kind as HouseKind) }
