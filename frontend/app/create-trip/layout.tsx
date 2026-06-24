import { AppLayout } from "@/components/layout/AppLayout";

export default function CreateTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}