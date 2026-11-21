import { EmptyState, LinkButton } from "@/components/ui";
export default function NotFound() { return <EmptyState title="Lab not found" hint="It may have been removed or the link is incorrect." action={<LinkButton href="/labs">Browse all labs</LinkButton>} />; }
