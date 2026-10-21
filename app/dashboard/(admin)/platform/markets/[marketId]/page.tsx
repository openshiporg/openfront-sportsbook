import { TradingDetailScreen } from '@/features/platform/trading/TradingDetailScreen'
export default async function Page({params}:{params:Promise<{marketId:string}>}){return <TradingDetailScreen marketId={(await params).marketId}/>}
