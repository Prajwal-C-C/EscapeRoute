import { AppLayout } from "@/components/layout/AppLayout";

export default function ItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
