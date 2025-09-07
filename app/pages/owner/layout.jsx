import Sidebar from "../../../component/SideBar";
export default function OwnerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixed */}
      <Sidebar />
      {/* Main content */}
      <main className="flex-1 p-2 mt-16 md:mt-0 overflow-y-scroll">{children}</main>
    </div>
  );
}
