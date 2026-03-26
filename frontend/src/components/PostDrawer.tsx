import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import Button from "./ui/Button";

interface DeletePostDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export default function PostDrawer({ isOpen, onClose, onDelete }: DeletePostDrawerProps) {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    // Reset l'état quand le drawer se ferme
    useEffect(() => {
        if (!isOpen) {
            setShowConfirmDelete(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
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
                {/* Overlay sombre */}
                <div 
                    className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" 
                    onClick={onClose} 
                />
                
                {/* Le Drawer / Modal */}
                <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-2xl p-6 pb-10 sm:pb-6 flex flex-col items-center gap-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300">
                    {/* Petite barre grise de drag (visuel) - Cachée sur Desktop */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2 sm:hidden" />
                    
                    <div className="flex flex-col items-center gap-4 w-full">
                        <Button 
                            variant="secondary" 
                            size="nul"
                            className="p-4 rounded-2xl border-gray-100 shadow-sm"
                            onClick={() => setShowConfirmDelete(true)}
                        >
                            <Trash2 className="text-red-500" size={28} />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
