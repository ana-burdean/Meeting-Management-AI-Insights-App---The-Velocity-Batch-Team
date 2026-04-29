import { NavLink, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#EFF1ED]">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-[#BCBD8B] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-2 sm:space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#373D20] text-[#EFF1ED] shadow-md' // Active state
                      : 'bg-[#BCBD8B] text-[#373D20] hover:bg-[#717744] hover:text-[#EFF1ED]' // Inactive state
                  }`
                }
              >
                MEETING LIST
              </NavLink>
              
              <NavLink
                to="/action-items"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#373D20] text-[#EFF1ED] shadow-md'
                      : 'bg-[#BCBD8B] text-[#373D20] hover:bg-[#717744] hover:text-[#EFF1ED]'
                  }`
                }
              >
                TO-DO LIST
              </NavLink>
            </nav>

            {/* Global Actions */}
            <button 
              className="bg-[#766153] hover:bg-[#373D20] text-[#EFF1ED] px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors"
            >
              ADD MEETING
            </button>
            
          </div>
        </div>
      </header>

      {/* Main Content Area where pages will render */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#373D20]">
        <Outlet />
      </main>
    </div>
  );
}