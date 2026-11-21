import { EmptyState, LinkButton } from "@/components/ui";
export default function NotFound() { return <EmptyState title="Page not found" hint="That page doesn't exist." action={<LinkButton href="/">Go home</LinkButton>} />; }
