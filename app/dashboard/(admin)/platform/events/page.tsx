import { CatalogScreen } from '@/features/platform/catalog/CatalogScreen'
export default function Page({searchParams}:{searchParams: Promise<Record<string, string | string[] | undefined>>}){return <CatalogScreen searchParams={searchParams}/>}
