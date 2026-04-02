import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil } from "lucide-react";
import Button from "./ui/Button";

interface PostDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    post: any; // L'objet complet de la publication à modifier ou supprimer
}

export default function PostDrawer({ isOpen, onClose, onDelete, post }: PostDrawerProps) {
    // ===============================================
    // OUTILS (Navigation)
    // ===============================================
    const navigate = useNavigate();


    // ===============================================
    // 1. MODÈLE (Les données locales du tiroir)
    // ===============================================
    
    // État simple pour savoir si on affiche la question de confirmation "Es-tu sûr ?"
    const [afficherConfirmation, setAfficherConfirmation] = useState(false);


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Si on ferme le menu menu principal complet, on s'assure de cacher aussi la confirmation
    useEffect(() => {
        if (isOpen === false) {
            setAfficherConfirmation(false);
        }
    }, [isOpen]);

    // Action : L'utilisateur clique sur la grosse corbeille
    const demanderSuppression = () => {
        setAfficherConfirmation(true);
    };

    // Action : L'utilisateur a cliqué sur "Annuler" pour la suppression
    const annulerSuppression = () => {
        setAfficherConfirmation(false);
    };

    // Action : L'utilisateur confirme définitivement la suppression avec le bouton rouge
    const confirmerSuppression = () => {
        setAfficherConfirmation(false); // 1. On cache la boîte de confirmation visuelle
        onDelete(); // 2. On appelle la vraie fonction de suppression passée par le parent (PostPage)
    };

    // Action : L'utilisateur clique sur le crayon pour modifier son post
    const actionModifierPost = () => {
        // On l'envoie sur la page de création, mais on lui envoie un "colis" secret avec l'objet post actuel
        navigate("/createpost", { state: { editPost: post } });
        onClose(); // On ferme le tiroir proprement
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    // Par sécurité, s'il n'est pas censé être ouvert, on affiche un vide absolu
    if (isOpen === false) {
        return null;
    }

    return (
        <>
            {/* 1. Fenêtre prioritaire de confirmation de suppression (Modale) */}
            {afficherConfirmation === true && (
                <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
                    <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-sm flex flex-col gap-4 shadow-xl">
                        <h3 className="text-text font-bold text-xl text-center">Supprimer le tweet</h3>
                        <p className="text-text-muted text-center text-body-base">
                            Es-tu sûr de vouloir supprimer ce tweet ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-4 w-full mt-4">
                            <Button variant="secondary" className="flex-1 w-full" onClick={annulerSuppression}>
                                Annuler
                            </Button>
                            <Button variant="danger" className="flex-1 w-full" onClick={confirmerSuppression}>
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Le vrai menu / tiroir d'options (Drawer) */}
            <div 
                className={`fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:px-4 ${afficherConfirmation === true ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {/* Le fond gris transparent qui permet de fermer quand on clique dessus */}
                <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={onClose} />
                
                <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-2xl p-6 pb-10 sm:pb-6 flex flex-col items-center gap-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300">
                    {/* Petit trait du haut style iPhone */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2 sm:hidden" />
                    
                    <div className="flex justify-center gap-10 w-full">
                        {/* Bouton Option : Supprimer */}
                        <Button 
                            variant="options" 
                            size="opt"
                            onClick={demanderSuppression}
                        >
                            <Trash2 size={28} />
                        </Button>

                        {/* Bouton Option : Modifier */}
                        <Button 
                            variant="options" 
                            size="opt"
                            onClick={actionModifierPost}
                        >
                            <Pencil size={28} />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}