import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
export default async function Page({params}:{params:Promise<{event:string}>}){const value=await params;return <SportsbookHome initialEventId={value.event}/>}
