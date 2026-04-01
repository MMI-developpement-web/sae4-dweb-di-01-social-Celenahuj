import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Avatar from "./ui/Avatar";
import { useAuth } from "../contexts/AuthContext";

interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    post: any; 
}

export default function CommentDrawer({ isOpen, onClose, post }: CommentDrawerProps) {
    const navigate = useNavigate();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // --- On récupère le token et le user du Store ---
    const { token, user } = useAuth();

    // --- ICI ON CHARGE LES COMMENTAIRES ---
    useEffect(() => {
        if (isOpen && post && token) {
            setLoading(true);
            // On appelle une route spécifique (ex: /api/posts/73/comments)
            fetch(`${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
            if (data && Array.isArray(data)) {
                setComments(data);
            } else {
                setComments([]);
            }
                setLoading(false);
            })
            .catch(() => setLoading(false));
        }
    }, [isOpen, post, token]);

    if (!isOpen || !post) return null;

    return (
        <aside className="fixed inset-0 z-[300] flex items-end justify-center">
            <button type="button" className="absolute inset-0 bg-black/40 w-full h-full border-none cursor-default m-0 p-0" onClick={onClose} aria-label="Fermer le panneau" />
            
            <section className="relative w-full max-w-xl bg-white rounded-t-[2rem] flex flex-col h-[80vh] animate-in slide-in-from-bottom duration-300">
                <header className="flex flex-col items-center pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" aria-hidden="true" />
                    <h3 className="font-bold text-lg">Commentaires</h3>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <p className="text-center italic">Chargement des réponses...</p>
                    ) : comments.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {comments.map((c) => (
                                <article key={c.id} className="flex gap-3 border-b border-gray-50 pb-4">
                                    <Avatar src={c.author?.avatar} size="sm" />
                                    <div className="flex flex-col">
                                        <header className="flex items-center gap-2">
                                            <span className="font-bold text-sm">@{c.author?.username}</span>
                                            <time dateTime={c.date} className="text-xs text-text-muted">{new Date(c.date).toLocaleDateString()}</time>
                                        </header>
                                        <p className="text-body-sm">{c.content}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <MessageCircle size={40} className="mb-2" />
                            <p className="text-body-sm italic">Soyez le premier à répondre !</p>
                        </div>
                    )}
                </div>

                {/* Bouton pour aller vers la page d'écriture */}
                <footer className="p-4 bg-white pb-10">
                    <button 
                        type="button"
                        className="flex w-full items-center gap-4 bg-gray-100 p-3 rounded-full cursor-pointer border-none text-left appearance-none"
                        onClick={() => {
                            navigate("/comment", { state: { replyTo: post } });
                            onClose();
                        }}
                    >
                        <Avatar src={user?.avatar} size="sm" />
                        <span className="text-text-muted text-sm">Écrire une réponse...</span>
                    </button>
                </footer>
            </section>
        </aside>
    );
}