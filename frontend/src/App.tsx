import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import ActionItems from './pages/ActionItems';
import Home from './pages/Home';
import Login from './pages/Login';
import MeetingList from './pages/MeetingList';

interface AuthUser {
    id: number;
    username: string;
}

function getStoredUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem('autominutes_user');
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

function App() {
    const [user, setUser] = useState<AuthUser | null>(getStoredUser);

    function handleLogin(loggedIn: AuthUser) {
        localStorage.setItem('autominutes_user', JSON.stringify(loggedIn));
        setUser(loggedIn);
    }

    function handleLogout() {
        localStorage.removeItem('autominutes_user');
        setUser(null);
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    user ? <Navigate to="/meetings" replace /> : <Login onLogin={handleLogin} />
                } />

                {/* Protected routes */}
                <Route path="/meetings" element={
                    user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
                }>
                    <Route index element={<MeetingList />} />
                </Route>

                <Route path="/action-items" element={
                    user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
                }>
                    <Route index element={<ActionItems />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;