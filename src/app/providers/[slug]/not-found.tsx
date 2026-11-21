import { EmptyState, LinkButton } from "@/components/ui";
export default function NotFound() { return <EmptyState title="Provider not found" hint="It may have been removed or the link is incorrect." action={<LinkButton href="/providers">Browse all providers</LinkButton>} />; }
