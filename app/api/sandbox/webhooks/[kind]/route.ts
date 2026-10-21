import { handleSandboxWebhook } from '@/features/sportsbook/api/sandbox-webhook'
const allowed=['sports','results','kyc','aml','geo','payments','messaging','analytics','tax','reporting','integrity','affiliates','pam'] as const
export async function POST(request:Request,{params}:{params:Promise<{kind:string}>}){ const {kind}=await params; if(!allowed.includes(kind as typeof allowed[number])) return Response.json({error:'unknown_adapter'},{status:404}); return handleSandboxWebhook(request,kind as typeof allowed[number]) }
