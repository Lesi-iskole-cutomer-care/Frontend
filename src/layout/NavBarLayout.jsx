import { Outlet } from "react-router-dom";
import VerticalNavBar from "../compoments/VerticalNavBar";

function NavBarLayout() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar 1/4 */}
      <aside className="w-1/7 min-h-screen">
        <VerticalNavBar />
      </aside>

      {/* Content 3/4 */}
      <main className="w-6/7 min-h-screen bg-[#F7F6F6] p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default NavBarLayout;
