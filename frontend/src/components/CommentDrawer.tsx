import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import Avatar from "./ui/Avatar";
import Profil from "./ui/Profil";

// Import du Store global
import { useAuth } from "../contexts/AuthContext";

interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    post: any; 
}

export default function CommentDrawer({ isOpen, onClose, post }: CommentDrawerProps) {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Notre compte est récupéré depuis le store centralisé
    const { token, user } = useAuth();


    // ===============================================
    // 1. MODÈLE (Les données locales du tiroir)
    // ===============================================
    
    // La liste des commentaires récupérés (vide au début)
    const [commentaires, setCommentaires] = useState<any[]>([]);
    
    // Savoir si l'ordinateur travaille (affiche la phrase "Chargement des réponses...")
    const [chargementEnCours, setChargementEnCours] = useState(false);


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Charger la liste des commentaires depuis l'API pour le post sélectionné
    const chargerCommentaires = async () => {
        // Sécurité : si le tiroir est fermé, s'il n'y a pas de post ciblé, ou qu'on n'est pas connecté, on stoppe
        if (isOpen === false || post === null || !token) {
            return;
        }

        setChargementEnCours(true); // On allume le loader

        try {
            const reponse = await fetch(`${API_URL}/posts/${post.id}/comments`, {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (reponse.ok === false) {
                // S'il y a une erreur réseau ou serveur, on affiche un tableau vide pour ne pas faire planter React
                setCommentaires([]);
                setChargementEnCours(false);
                return; // Fin expéditive
            }

            const donnees = await reponse.json();

            // Si l'API nous renvoie bien un tableau [ ... ]
            if (Array.isArray(donnees) === true) {
                setCommentaires(donnees);
            } else {
                setCommentaires([]); // Sécurité si l'API renvoie autre chose
            }

        } catch (erreur) {
            console.error("Erreur technique de chargement :", erreur);
            setCommentaires([]);
        } finally {
            // Dans tous les cas, on arrête le loader ! (Qu'il y ait erreur ou succès)
            setChargementEnCours(false);
        }
    };

    // React appelle le chargement si l'une de ces 3 choses change (ex: quand on ouvre le menu)
    useEffect(() => {
        chargerCommentaires();
    }, [isOpen, post, token]);

    // Action : Clic sur le faux bouton pour écrire une vraie réponse
    const actionRepondre = () => {
        // On redirige vers la page pour écrire, avec le "colis" (state) qui contient le post visé
        navigate("/comment", { state: { replyTo: post } });
        onClose(); // Et on referme le tiroir bien proprement
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    // Par sécurité : pas de HTML affiché si c'est caché
    if (isOpen === false || post === null || post === undefined) {
        return null;
    }

    return (
        <aside className="fixed inset-0 z-[300] flex items-end justify-center">
            
            {/* Le fond gris sombre interactif. Si on clique dessus, on déclenche la fermeture `onClose`. */}
            <button 
                type="button" 
                className="absolute inset-0 bg-black/40 w-full h-full border-none cursor-default m-0 p-0 hover:bg-black/50 transition-colors" 
                onClick={onClose} 
                aria-label="Fermer le panneau" 
            />
            
            {/* Le bloc blanc principal du tiroir */}
            <section className="relative w-full max-w-xl bg-white rounded-t-[2rem] flex flex-col h-[80vh] animate-in slide-in-from-bottom duration-300">
                
                {/* En-tête : le trait gris design et le titre */}
                <header className="flex flex-col items-center pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" aria-hidden="true" />
                    <h3 className="font-bold text-lg">Commentaires</h3>
                </header>

                {/* Le centre coulissant (Scroll) avec la liste des commentaires */}
                <div className="flex-1 overflow-y-auto p-6">
                    
                    {chargementEnCours === true ? ( // CAS 1 : Ça charge
                        <p className="text-center italic text-text-muted">Chargement des réponses...</p>
                    
                    ) : commentaires.length > 0 ? ( // CAS 2 : Tout est chargé et il y a des commentaires
                        <div className="flex flex-col gap-6">
                            
                            {commentaires.map((commentaire) => (
                                <article key={commentaire.id} className="flex gap-3 border-b border-gray-50 pb-4">
                                    <Profil 
                                        className="flex-col gap-0 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 mt-1"
                                        onClick={() => window.location.href = `/profil/${commentaire.author?.id}`}
                                    >
                                        {/* Avatar du posteur */}
                                        <Avatar src={commentaire.author?.avatar} size="sm" shape="circle" />
                                    </Profil>
                                    
                                    {/* Texte de la réponse */}
                                    <div className="flex flex-col w-full">
                                        <Profil 
                                            className="flex flex-row items-center gap-2 flex-wrap cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => window.location.href = `/profil/${commentaire.author?.id}`}
                                        >
                                            <span className="font-bold text-sm text-text m-0 p-0">{commentaire.author?.username}</span>
                                            <span className="text-xs text-text-muted m-0 p-0">@{commentaire.author?.username?.toLowerCase()}</span>
                                            <time dateTime={commentaire.date} className="text-xs text-text-muted ml-auto">
                                                {new Date(commentaire.date).toLocaleDateString()}
                                            </time>
                                        </Profil>
                                        <p className="text-body-sm mt-1 text-gray-800">{commentaire.content}</p>
                                    </div>
                                </article>
                            ))}
                            
                        </div>
                    
                    ) : ( // CAS 3 : Aucun commentaire !
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <MessageCircle size={40} className="mb-2 text-text-muted" />
                            <p className="text-body-sm italic text-text-muted">Soyez le premier à répondre !</p>
                        </div>
                    )}

                </div>

                {/* Barre du bas fixe avec un faux "champ" de texte qui redirigera la page  */}
                <footer className="p-4 bg-white pb-10 border-t border-border/50">
                    <button 
                        type="button"
                        className="flex w-full items-center gap-4 bg-gray-100 p-3 rounded-full cursor-pointer border-none text-left appearance-none transition-colors hover:bg-gray-200"
                        onClick={actionRepondre}
                    >
                        {/* Mon Avatar personnel via mon Store ! */}
                        <Avatar src={user?.avatar} size="sm" shape="circle" />
                        <span className="text-text-muted text-sm font-medium">Écrire une réponse...</span>
                    </button>
                </footer>

            </section>
        </aside>
    );
}