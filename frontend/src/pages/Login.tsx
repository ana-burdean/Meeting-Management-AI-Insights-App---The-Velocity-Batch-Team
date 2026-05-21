import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Button from '../components/atoms/Button';
import ErrorMessage from '../components/atoms/ErrorMessage';

interface LoginProps {
    onLogin: (user: { id: number; username: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit() {
        if (!username.trim()) {
            setError('Please enter a username.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const user = await api.users.getByUsername(username.trim());
                if (!user) {
                    setError('User not found. Please sign up first.');
                    return;
                }
                onLogin({ id: user.id, username: user.username });
                navigate('/meetings');
            } else {
                const existing = await api.users.getByUsername(username.trim()).catch(() => null);
                if (existing) {
                    setError('Username already taken. Please choose another.');
                    return;
                }
                const newUser = await api.users.create({
                    username: username.trim(),
                    role: 'USER',
                    isActive: true,
                });
                onLogin({ id: newUser.id, username: newUser.username });
                navigate('/meetings');
            }
        } catch {
            setError(mode === 'login' ? 'User not found. Please sign up first.' : 'Could not create account. Try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-[#EFF1ED] flex flex-col items-center justify-center px-4">

            {/* Back to home button — top left */}
            <button
                onClick={() => navigate('/')}
                className="absolute left-6 top-6 flex items-center rounded-2xl bg-[#BCBD8B] px-4 py-2 text-[#373D20] shadow-sm transition hover:bg-[#EFF1ED]"
            >
                <span className="text-2xl font-black leading-none">←</span>
            </button>

            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="mb-6 text-lg font-black text-[#373D20]">
                        AutoMinutes
                    </h1>
                    <h2 className="text-3xl font-black text-[#373D20]">
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p className="mt-2 text-sm text-[#766153]">
                        {mode === 'login' ? 'Sign in to your account' : 'Get started for free'}
                    </p>
                </div>

                <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-[#BCBD8B]/50">
                    {/* Mode toggle */}
                    <div className="mb-6 flex rounded-2xl bg-[#EFF1ED] p-1">
                        <button
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`flex-1 rounded-xl py-2 text-sm font-black transition ${
                                mode === 'login' ? 'bg-[#373D20] text-[#EFF1ED]' : 'text-[#373D20] hover:bg-[#BCBD8B]/35'
                            }`}
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => { setMode('signup'); setError(''); }}
                            className={`flex-1 rounded-xl py-2 text-sm font-black transition ${
                                mode === 'signup' ? 'bg-[#373D20] text-[#EFF1ED]' : 'text-[#373D20] hover:bg-[#BCBD8B]/35'
                            }`}
                        >
                            Sign up
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-[#373D20]">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
                                placeholder="Enter your username"
                                className="w-full rounded-2xl border border-[#BCBD8B] bg-[#EFF1ED] px-4 py-3 outline-none focus:ring-2 focus:ring-[#717744]"
                            />
                        </div>

                        <ErrorMessage message={error} />

                        <Button
                            onClick={() => void handleSubmit()}
                            disabled={loading}
                            className="w-full py-3 text-base"
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
