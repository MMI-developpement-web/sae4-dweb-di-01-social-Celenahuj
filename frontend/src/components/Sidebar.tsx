import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Ban, UserRound, CircleCheck, TriangleAlert } from 'lucide-react';
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import Aside from "./ui/Aside";
import Message from "./Message";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);

    // Fonction pour afficher la confirmation de déconnexion
    const handleLogoutClick = () => {
        setShowConfirmLogout(true);
    };

    // Fonction pour se déconnecter
    const performLogout = () => {
        setShowConfirmLogout(false);
        // 1. On vide le jeton de connexion
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_username");

        // 2. On prévient l'utilisateur
        setFeedback({ type: 'success', text: "Tu es déconnecté ! Redirection..." });

        // 3. On repart à la page Login
        setTimeout(() => {
            navigate("/login");
            setFeedback(null);
        }, 1500);
    };

    const handleProfile = () => {
        navigate("/profil");
    };

    // Si le menu n'est pas ouvert et qu'il n'y a pas de message/modal, on n'affiche rien
    if (!isOpen && !feedback && !showConfirmLogout) return null;

    return (
        <>
            {/* Messages de retour */}
            {feedback && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {feedback.type === 'success' ? (
                            <CircleCheck className="text-green-500" />
                        ) : (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{feedback.text}</span>
                    </Message>
                </div>
            )}

            {/* Modal personnalisée de confirmation pour remplacer window.confirm */}
            {showConfirmLogout && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-sm flex flex-col gap-4 shadow-xl">
                        <h3 className="text-text font-bold text-xl text-center">Déconnexion</h3>
                        <p className="text-text-muted text-center text-body-base">
                            Es-tu sûr de vouloir te déconnecter ?
                        </p>
                        <div className="flex gap-4 w-full mt-4">
                            <Button variant="secondary" className="flex-1 w-full" onClick={() => setShowConfirmLogout(false)}>
                                Annuler
                            </Button>
                            <Button variant="danger" className="flex-1 w-full" onClick={performLogout}>
                                Oui
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <Aside isOpen={isOpen} onClose={onClose}>
                {/* Ici on met juste le contenu spécifique au menu */}
                <Avatar src={localStorage.getItem("user_avatar")} size="xl" />

                <div className="flex flex-col gap-2">
                    <Button variant="navItem" onClick={handleProfile}>
                        <UserRound size={20} />Profil
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase px-2">Your account</p>
                    <Button variant="navItem" onClick={handleLogoutClick}>
                        <LogOut size={20} /> <span>Log out</span>
                    </Button>
                </div>

            </Aside>
        </>
    );
}