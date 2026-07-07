import { AppLayout } from "@/components/layout/AppLayout";

export default function SeetingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}