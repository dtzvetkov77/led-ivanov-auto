import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">{children}</main>
    </div>
  )
}
