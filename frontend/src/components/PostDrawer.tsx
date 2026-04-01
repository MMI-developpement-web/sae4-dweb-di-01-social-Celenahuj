import { useState, useEffect } from "react";
import { Trash2, Pencil } from "lucide-react"; // Import regroupé
import { useNavigate } from "react-router-dom"; // 1. Ajout de l'import
import Button from "./ui/Button";

interface PostDrawerProps { // 2. Ajout du post dans l'interface
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    post: any; // On reçoit l'objet complet du tweet ici
}

export default function PostDrawer({ isOpen, onClose, onDelete, post }: PostDrawerProps) {
    const navigate = useNavigate(); // Hook pour la redirection
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowConfirmDelete(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Modal de confirmation de suppression (inchangé) */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
                    <div className="bg-surface border border-border p-6 rounded-lg w-full max-w-sm flex flex-col gap-4 shadow-xl">
                        <h3 className="text-text font-bold text-xl text-center">Supprimer le tweet</h3>
                        <p className="text-text-muted text-center text-body-base">
                            Es-tu sûr de vouloir supprimer ce tweet ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-4 w-full mt-4">
                            <Button variant="secondary" className="flex-1 w-full" onClick={() => setShowConfirmDelete(false)}>
                                Annuler
                            </Button>
                            <Button variant="danger" className="flex-1 w-full" onClick={() => {
                                setShowConfirmDelete(false);
                                onDelete();
                            }}>
                                Supprimer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:px-4 ${showConfirmDelete ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={onClose} />
                
                <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-2xl p-6 pb-10 sm:pb-6 flex flex-col items-center gap-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2 sm:hidden" />
                    
                    <div className="flex justify-center gap-10 w-full">
                        {/* Bouton Supprimer */}
                        <Button 
                            variant="options" 
                            size="opt"
                            onClick={() => setShowConfirmDelete(true)}
                        >
                            <Trash2  size={28} />
                        </Button>

                        {/* 3. Bouton Modifier mis à jour */}
                        <Button 
                            variant="options" 
                            size="opt"
                            onClick={() => {
                                navigate("/createpost", { state: { editPost: post } });
                                onClose();
                            }}
                        >
                            <Pencil size={28} />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}