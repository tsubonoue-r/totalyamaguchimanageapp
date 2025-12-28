import AppLayout from '@/components/AppLayout'

export default function ConstructionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
