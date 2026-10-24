import { NotificationsScreen } from "@/features/platform/notifications/NotificationsScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <NotificationsScreen searchParams={searchParams} />; }
