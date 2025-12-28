import AppLayout from '@/components/AppLayout'

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
