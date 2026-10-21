import { CustomersScreen } from "@/features/platform/customers/CustomersScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <CustomersScreen searchParams={searchParams} />; }
