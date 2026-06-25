import { AppLayout } from "@/components/layout/AppLayout";

export default function SavedTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}