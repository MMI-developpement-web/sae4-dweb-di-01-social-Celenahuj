import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Loader2, CircleCheck, TriangleAlert } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Composants de l'Interface Utilisateur (UI)
import Header from "./Header";
import Message from "./Message";
import Switch from "./ui/Switch";

export default function PrivacySettings() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation, etc.)
    // ===============================================
    const navigate = useNavigate();
    const { token } = useAuth(); // Les données globales arrivent d'ici, pas par les props !
    const API_URL = import.meta.env.VITE_API_URL;


    // ===============================================
    // 1. MODÈLE (Les données locales de la page)
    // ===============================================
    // Des useState simples avec des types basiques (booléens, strings)
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    // États séparés pour le message, plus simples qu'un objet complexe
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState(""); // Sera "success" ou "error"


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher une notification temporaire
    const afficherMessage = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);

        // Disparaît plus lentement si c'est une erreur
        let delai = 2000;
        if (type === "error") {
            delai = 3000;
        }

        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, delai);
    };

    // Action : Charger les données de la Personne
    const chargerDonnees = async () => {
        // Sécurité : on stoppe tout s'il n'y a pas de jeton
        if (!token) {
            return;
        }

        try {
            const reponse = await fetch(`${API_URL}/me/privacy`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            if (reponse.ok === false) {
                throw new Error("Erreur de communication avec le serveur");
            }

            const donnees = await reponse.json();
            setIsReadOnly(donnees.isReadOnly);

        } catch {
            afficherMessage("Erreur au chargement des réglages", "error");
        } finally {
            setLoading(false); // Quoi qu'il arrive, on arrête la roue de chargement
        }
    };

    // Au chargement de la page, on appelle la fonction 'chargerDonnees'
    useEffect(() => {
        chargerDonnees();
    }, [token]);

    // Action : Mettre à jour l'option "Lecture seule"
    const modifierReglageLectureSeule = async () => {
        const ancienneValeur = isReadOnly;
        const nouvelleValeur = !isReadOnly; // On inverse l'état

        // Modification instantanée (Optimistic UI) pour une application fluide
        setIsReadOnly(nouvelleValeur);

        try {
            const reponse = await fetch(`${API_URL}/me/privacy`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ isReadOnly: nouvelleValeur })
            });

            if (reponse.ok === false) {
                throw new Error("Impossible de modifier le réglage");
            }

            afficherMessage("Mode lecture seule mis à jour", "success");

        } catch {
            // En cas d'erreur de serveur, on annule l'animation du bouton
            setIsReadOnly(ancienneValeur); 
            afficherMessage("Erreur lors de la mise à jour", "error");
        }
    };

    // Action : Revenir en arrière
    const retourArriere = () => {
        navigate(-1);
    };


    // ===============================================
    // 3. VUE (Ce que l'utilisateur voit)
    // ===============================================

    // Écran blanc de chargement avec un spinner
    if (loading === true) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen text-text pt-mobile-top px-mobile-x pb-mobile-bottom relative">
            
            {/* Pop-up conditionnelle selon nos variables de modèle */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {messageType === "success" && <CircleCheck className="text-green-500" />}
                        {messageType === "error" && <TriangleAlert className="text-red-500" />}
                        <span>{messageTexte}</span>
                    </Message>
                </div>
            )}

            <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
                
                {/* On attache l'action retourArriere de notre Contrôleur */}
                <Header contentAlign="center" onBack={retourArriere}>
                    <h1 className="text-[24px] font-medium tracking-tight">Privacy</h1>
                </Header>

                <div className="flex flex-col gap-6 mt-4">
                    {/* Section Switch : On relie Modèle (isReadOnly) et Action (modifierReglageLectureSeule) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xl">Read-only mode</span>
                            <Switch checked={isReadOnly} onChange={modifierReglageLectureSeule} />
                        </div>
                        <p className="text-sm text-gray-400 leading-tight pr-10">
                            Enable this option to suspend all interaction on your profile. Once enabled, no one will be able to comment on your posts or reply to your content.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}