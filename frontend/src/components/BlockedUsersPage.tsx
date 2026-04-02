import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";

import Header from "../components/Header";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Message from "../components/Message";

// Le Store global
import { useAuth } from "../contexts/AuthContext";

export default function BlockedUsersPage() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // On n'utilise que le strict nécessaire du Store (le token sécurisé)
    const { token } = useAuth();


    // ===============================================
    // 1. MODÈLE (Les données de la page)
    // ===============================================
    
    // Le tableau qui contiendra les gens qu'on a bloqués
    const [utilisateursBloques, setUtilisateursBloques] = useState<any[]>([]);
    
    // Les alertes (succès ou erreur), simples et textuelles
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher un toast/message à l'écran
    const afficherAlerte = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);
        
        // On l'efface après 2 secondes
        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, 2000);
    };

    // Action Initiale : Demander à l'API la liste de nos blocages
    const chargerUtilisateursBloques = async () => {
        if (!token) return; // Sécurité si on n'est pas connecté
        
        try {
            const reponse = await fetch(`${API_URL}/me/blocks`, {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (reponse.ok === false) {
                console.error("Impossible de récupérer la liste.");
                return;
            }
            
            const donnees = await reponse.json();
            setUtilisateursBloques(donnees);

        } catch (erreur) {
            console.error("Erreur réseau (chargement bloqués) :", erreur);
        }
    };

    // On lance cette action automatiquement quand on arrive sur la page
    useEffect(() => { 
        chargerUtilisateursBloques(); 
    }, [token]);

    // Action : Débloquer quelqu'un de la liste
    const actionDebloquer = async (idUtilisateur: number) => {
        if (!token) return;
        
        // On nettoie les anciens messages
        setMessageTexte("");
        setMessageType("");

        try {
            // C'est un simple "Toggle" côté serveur (le même post bascule Bloquer/Débloquer)
            const reponse = await fetch(`${API_URL}/user/${idUtilisateur}/block`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (reponse.ok === false) {
                afficherAlerte("Erreur lors du déblocage", "error");
                return; // On arrête là
            }

            afficherAlerte("Utilisateur débloqué avec succès", "success");
            
            // On le retire de notre liste JSX sans avoir besoin de recharger toute la page depuis le serveur
            const nouvelleListe = [];
            for (let i = 0; i < utilisateursBloques.length; i++) {
                const utilisateurActuel = utilisateursBloques[i];
                if (utilisateurActuel.id !== idUtilisateur) {
                    nouvelleListe.push(utilisateurActuel);
                }
            }
            setUtilisateursBloques(nouvelleListe);

        } catch (erreur) {
            console.error("Erreur technique (déblocage) :", erreur);
            afficherAlerte("Erreur réseau lors du déblocage", "error");
        }
    };

    // Action : Un navigateur pour revenir en arrière avec le Header
    const actionRetourArriere = () => {
        navigate(-1);
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    return (
        <main className="min-h-screen text-text pt-mobile-top px-mobile-x pb-mobile-bottom relative">
            
            {/* Pop-up de message (Alertes) */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {messageType === 'success' && <CircleCheck className="text-green-500" />}
                        {messageType === 'error' && <TriangleAlert className="text-red-500" />}
                        <span>{messageTexte}</span>
                    </Message>
                </div>
            )}

            <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
                
                {/* En-tête avec bouton retour */}
                <Header contentAlign="center" onBack={actionRetourArriere}>
                    <h1 className="text-xl font-bold">Blocked</h1>
                </Header>

                {/* Liste des utilisateurs */}
                <div className="flex flex-col gap-6 mt-4">
                    
                    {utilisateursBloques.length === 0 ? (
                        
                        <p className="text-center text-text-muted">Aucun utilisateur bloqué.</p>
                        
                    ) : (
                        
                        utilisateursBloques.map((utilisateur) => (
                            <article key={utilisateur.id} className="flex items-center justify-between">
                                {/* Informations à gauche */}
                                <div className="flex items-center gap-4">
                                    <Avatar src={utilisateur.avatar} size="md" shape="circle" />
                                    <div className="flex flex-col">
                                        <span className="font-bold">{utilisateur.username}</span>
                                        <span className="text-text-muted text-sm">
                                            @{utilisateur.username ? utilisateur.username.toLowerCase() : ""}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Bouton "Unblock" à droite */}
                                <Button 
                                    variant="small" 
                                    size="sm" 
                                    onClick={() => actionDebloquer(utilisateur.id)}
                                >
                                    Unblock
                                </Button>
                            </article>
                        ))
                        
                    )}
                    
                </div>
            </div>
        </main>
    );
}