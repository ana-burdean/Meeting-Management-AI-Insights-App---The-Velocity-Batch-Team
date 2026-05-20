import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#EFF1ED] flex flex-col">
            <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-lg font-black text-[#373D20]">AutoMinutes</h1>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <div className="max-w-2xl">
                    <div className="mb-6 inline-block rounded-full bg-[#373D20] px-4 py-1.5 text-xs font-black text-[#EFF1ED]">
                        AI-Powered Meeting Assistant
                    </div>

                    <h2 className="mb-4 text-5xl font-black leading-tight text-[#373D20]">
                        Turn meetings into<br />
                        <span className="text-[#717744]">actionable insights</span>
                    </h2>

                    <p className="mb-10 text-lg text-[#766153]">
                        AutoMinutes automatically transcribes your meetings, extracts key decisions,
                        and creates action items — so your team can focus on what matters.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 text-base"
                        >
                            Get started
                        </Button>
                    </div>
                </div>

                <div className="mt-20 grid gap-6 sm:grid-cols-3 max-w-3xl w-full">
                    {[
                        { icon: '🎙️', title: 'Paste transcript', desc: 'Add your meeting transcript in seconds.' },
                        { icon: '🤖', title: 'AI processes it', desc: 'The AI extracts summary, decisions and tasks automatically.' },
                        { icon: '✅', title: 'Track tasks', desc: 'Manage action items with assignees, deadlines and statuses.' },
                    ].map((f) => (
                        <div key={f.title} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#BCBD8B]/50 text-left">
                            <div className="mb-3 text-3xl">{f.icon}</div>
                            <h3 className="font-black text-[#373D20] mb-1">{f.title}</h3>
                            <p className="text-sm text-[#766153]">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}