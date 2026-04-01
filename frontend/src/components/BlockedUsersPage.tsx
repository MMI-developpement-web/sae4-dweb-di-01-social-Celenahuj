import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";
import Header from "../components/Header";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Message from "../components/Message";
import { useAuth } from "../contexts/AuthContext";

export default function BlockedUsersPage() {
    const navigate = useNavigate();
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { token } = useAuth();

    const fetchBlocks = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/me/blocks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBlockedUsers(data);
            }
        } catch (err) {
            console.error("Erreur chargement bloqués", err);
        }
    };

    useEffect(() => { fetchBlocks(); }, [token]);

    const handleUnblock = async (id: number) => {
        if (!token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/${id}/block`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setFeedback({ type: 'success', text: "Utilisateur débloqué" });
                setBlockedUsers(prev => prev.filter(user => user.id !== id));
                setTimeout(() => setFeedback(null), 2000);
            }
        } catch (err) {
            setFeedback({ type: 'error', text: "Erreur lors du déblocage" });
        }
    };

    return (
        <main className="min-h-screen text-text pt-mobile-top px-mobile-x pb-mobile-bottom relative">
            {feedback && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {feedback.type === 'success' ? (
                            <CircleCheck className="text-green-500" />
                        ) : (
                            <TriangleAlert className="text-red-500" />
                        )}
                        <span>{feedback.text}</span>
                    </Message>
                </div>
            )}

            <div className="max-w-2xl mx-auto w-full  flex flex-col gap-8">
                <Header contentAlign="center" onBack={() => navigate(-1)}>
                    <h1 className="text-xl font-bold">Blocked</h1>
                </Header>

                <div className="flex flex-col gap-6 mt-4">
                    {blockedUsers.length === 0 ? (
                        <p className="text-center text-text-muted">Aucun utilisateur bloqué.</p>
                    ) : (
                        blockedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar src={user.avatar} size="md" />
                                    <div className="flex flex-col">
                                        <span className="font-bold">{user.username}</span>
                                        <span className="text-text-muted text-sm">@{user.username.toLowerCase()}</span>
                                    </div>
                                </div>
                                <Button variant="small" size="sm" onClick={() => handleUnblock(user.id)}>
                                    Unblock
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}