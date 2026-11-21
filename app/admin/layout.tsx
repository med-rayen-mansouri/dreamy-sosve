import { pageUser } from "@/lib/access";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser("ADMIN");
  return (
    <Shell role="ADMIN" name={user.name}>
      {children}
    </Shell>
  );
}
