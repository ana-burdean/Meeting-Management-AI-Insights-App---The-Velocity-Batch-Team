import { NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#EFF1ED] text-[#373D20]">
      <header className="sticky top-0 z-20 border-b border-[#BCBD8B] bg-[#EFF1ED]/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-black text-[#373D20]">AutoMinutes</h1>
          </div>

          <nav className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-[#BCBD8B]/50">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isActive ? 'bg-[#373D20] text-[#EFF1ED]' : 'text-[#373D20] hover:bg-[#BCBD8B]/35'
                }`
              }
            >
              Meetings
            </NavLink>
            <NavLink
              to="/action-items"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isActive ? 'bg-[#373D20] text-[#EFF1ED]' : 'text-[#373D20] hover:bg-[#BCBD8B]/35'
                }`
              }
            >
              To-Dos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}