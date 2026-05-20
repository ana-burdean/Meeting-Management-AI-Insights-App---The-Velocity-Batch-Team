import { LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

interface MainLayoutProps {
    user: { id: number; username: string };
    onLogout: () => void;
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-[#EFF1ED] text-[#373D20]">
            <header className="sticky top-0 z-20 border-b border-[#BCBD8B] bg-[#EFF1ED]/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <NavLink to="/meetings" className="block">
                        <h1 className="cursor-pointer text-lg font-black text-[#373D20]">AutoMinutes</h1>
                    </NavLink>

                    <div className="flex items-center gap-3">
                        <nav className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-[#BCBD8B]/50">
                            <NavLink
                                to="/meetings"
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

                        <button
                            onClick={onLogout}
                            title="Sign out"
                            className="rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-[#BCBD8B]/50 text-[#766153] transition hover:bg-[#EFF1ED] hover:text-red-600"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}