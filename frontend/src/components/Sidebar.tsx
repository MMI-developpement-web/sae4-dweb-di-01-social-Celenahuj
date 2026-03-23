import { useNavigate } from "react-router-dom";
import { LogOut, Ban, UserRound } from 'lucide-react';
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import Aside from "./ui/Aside";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();

    // Fonction pour se déconnecter
    const handleLogout = () => {
        // 1. On vide le jeton de connexion
        const isConfirmed = window.confirm("Es-tu sûr de vouloir te déconnecter ?");

        // Si l'utilisateur clique sur "Annuler", on arrête tout
        if (!isConfirmed) {
            return; 
        }
        localStorage.removeItem("user_token");

        // 2. On prévient l'utilisateur
        alert("Tu es déconnecté !");

        // 3. On repart à la page Login
        navigate("/login");
    };

    const handleProfile = () => {
        navigate("/profil");
    };

    // Si le menu n'est pas ouvert, on n'affiche rien
    if (!isOpen) return null;

    return (
        <>
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
                    <Button variant="navItem" onClick={handleLogout}>
                        <LogOut size={20} /> <span>Log out</span>
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase px-2">Privacy</p>
                    <Button variant="navItem">
                        <Ban size={20} /> <span>Blocked</span>
                    </Button>
                </div>
            </Aside>
        </>
    );
}