export const dynamic = 'force-dynamic'
export async function GET(){ return Response.json({status:'ok',service:'openfront-sportsbook',time:new Date().toISOString()}) }
