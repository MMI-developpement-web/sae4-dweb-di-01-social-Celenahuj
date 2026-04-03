import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Ban, UserRound, CircleCheck, TriangleAlert, Lock } from 'lucide-react';

import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import Aside from "./ui/Aside";
import Message from "./Message";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Les données globales via Context (Pas de prop drilling)

    // ===============================================
    // 1. MODÈLE (Les données locales de la sidebar)
    // ===============================================
    
    // Alertes simplifiées (plus d'objet complexe {type:..., text:...})
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");
    
    // État (boolean simple) pour la fenêtre de confirmation
    const [afficherConfirmation, setAfficherConfirmation] = useState(false);


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions explicitées)
    // ===============================================

    // Action : Afficher un message temporaire à l'écran
    const afficherToast = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);

        // Fait disparaître le message après 3 secondes
        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, 3000);
    };

    // Action : On clique sur le bouton de déconnexion (Ouvre la boîte de dialogue)
    const demanderDeconnexion = () => {
        setAfficherConfirmation(true);
    };

    // Action : On annule la déconnexion
    const annulerDeconnexion = () => {
        setAfficherConfirmation(false);
    };

    // Action : On confirme et exécute la vrai déconnexion
    const confirmerDeconnexion = () => {
        setAfficherConfirmation(false); // Ferme la boîte de confirmation

        // 1. On prévient l'utilisateur pour le confort visuel
        afficherToast("Tu es déconnecté ! Redirection...", "success");

        // 2. On attend une seconde puis on appelle le store (logout)
        setTimeout(() => {
            onClose(); // Ferme le menu latéral global
            logout(); // Le Context (useAuth) s'occupe de détruire la session et rediriger
            
            // Nettoyage de l'alerte
            setMessageTexte("");
            setMessageType("");
        }, 1500);
    };

    // Action : Aller sur son propre profil
    const allerAuProfil = () => {
        const monId = user?.id; // L'ID vient de notre contexte sécurisé
        
        onClose(); // On ferme d'abord le menu latéral
        
        // Si on a bien notre ID, on construit la route précise
        if (monId && String(monId) !== "undefined" && String(monId) !== "null") {
            navigate(`/profil/${monId}`);
        } else {
            // Sinon, par sécurité, on va sur l'URL de base du profil
            navigate("/profil");
        }
    };
    
    // Action : Aller sur la page des utilisateurs bloqués
    const allerAuxBloques = () => {
        onClose();
        navigate("/blocked");
    };
    
    // Action : Aller aux paramètres de confidentialité
    const allerALaConfidentialite = () => {
        onClose();
        navigate("/privacy");
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    // S'il n'y a absolument rien à afficher, on ne retourne rien (optimisation)
    if (isOpen === false && messageTexte === "" && afficherConfirmation === false) {
        return null;
    }

    return (
        <>
            {/* Pop-up de message conditionnelle (Toast de notification) */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {messageType === "success" && (
                            <CircleCheck className="text-green-500" />
                        )}
                        {messageType === "error" && (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{messageTexte}</span>
                    </Message>
                </div>
            )}

            {/* Fenêtre de confirmation (Modal) personnalisée de déconnexion */}
            {afficherConfirmation === true && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-sm flex flex-col gap-4 shadow-xl">
                        <h3 className="text-text font-bold text-xl text-center">Déconnexion</h3>
                        <p className="text-text-muted text-center text-body-base">
                            Es-tu sûr de vouloir te déconnecter ?
                        </p>
                        <div className="flex gap-4 w-full mt-4">
                            <Button variant="secondary" className="flex-1 w-full" onClick={annulerDeconnexion}>
                                Annuler
                            </Button>
                            <Button variant="danger" className="flex-1 w-full" onClick={confirmerDeconnexion}>
                                Oui
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Le menu latéral principal 'Aside' */}
            <Aside isOpen={isOpen} onClose={onClose}>
                
                {/* L'avatar de l'utilisateur connecté */}
                <Avatar src={user?.avatar} size="xl" />

                <div className="flex flex-col gap-2">
                    <Button variant="navItem" onClick={allerAuProfil}>
                        <UserRound size={20} />
                        <span>Profil</span>
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase px-2">Your account</p>
                    <Button variant="navItem" onClick={demanderDeconnexion}>
                        <LogOut size={20} /> 
                        <span>Log out</span>
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase px-2">Who can see your content</p>
                    <Button variant="navItem" onClick={allerAuxBloques}>
                        <Ban size={20} /> 
                        <span>Blocked</span>
                    </Button>
                    <Button variant="navItem" onClick={allerALaConfidentialite}>
                        <Lock size={20} /> 
                        <span>Privacy</span>
                    </Button>
                </div>

            </Aside>
        </>
    );
}