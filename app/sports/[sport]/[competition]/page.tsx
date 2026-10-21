import { SportsbookHome } from '@/features/storefront/sportsbook/screens/SportsbookHome'
export default async function Page({params}:{params:Promise<{sport:string;competition:string}>}){const value=await params;return <SportsbookHome initialSport={value.sport} initialCompetition={decodeURIComponent(value.competition)}/>}
