import { PromotionsScreen } from '@/features/platform/promotions/PromotionsScreen'
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <PromotionsScreen searchParams={searchParams}/>}
