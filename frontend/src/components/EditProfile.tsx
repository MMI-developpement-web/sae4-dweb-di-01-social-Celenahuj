import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Separator from "../components/ui/Separator";
import Message from "./Message";
import EditableRow from "../components/ui/EditableRow";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const { token, user, login } = useAuth(); // Import du Store !
    const { fetchPosts } = usePosts(); // Import pour rafraichir le feed général

    // États liés à l'entité User
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [lieu, setLieu] = useState("");
    const [lien, setLien] = useState("");
    // Affichage local  
    const [avatar, setAvatar] = useState<string | null>(null);
    // Fichier sélectionné
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    
    const [username, setUsername] = useState(""); // Pour l'affichage readOnly

    const API_URL = import.meta.env.VITE_API_URL;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Récupérer les infos actuelles au montage
    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/profil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                setName(data.name || "");
                setBio(data.content || "");
                setLieu(data.lieu || "");
                setLien(data.lien || "");
                setAvatar(data.avatar);
                setUsername(`@${data.name?.toLowerCase().replace(/\s/g, '_')}`);
            }
        })
        .catch(() => setFeedback({type: 'error', text: "Erreur de chargement"}))
        .finally(() => setLoading(false));
    }, [token, API_URL]);

    // 2. Mettre à jour les infos
    const handleUpdate = async () => {
        if (!token) return;
        setFeedback(null);
        try {
            // Création d'un FormData pour pouvoir envoyer une image
            const formData = new FormData();
            formData.append('name', name);
            formData.append('content', bio);
            formData.append('lieu', lieu);
            formData.append('lien', lien);
            
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch(`${API_URL}/profil/update`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Ne pas définir 'Content-Type' ici car fetch le gère automatiquement avec FormData (ajoute le boundary)
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const newAvatar = data.user?.avatar || avatar;
                
                if (user) {
                    login(token, { ...user, username: name, avatar: newAvatar });
                    fetchPosts(true); // Forcer le rechargement global pour propager la photo partout
                }
                setFeedback({ type: 'success', text: "Profil mis à jour !" });
                setTimeout(() => navigate(-1), 1500);
            } else {
                setFeedback({ type: 'error', text: "Erreur lors de la mise à jour" });
            }
        } catch (error) {
            setFeedback({ type: 'error', text: "Erreur réseau" });
        }
    };

    // Gestion du clic sur le bouton "Edit photo"
    const handleEditPhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Gestion du changement de fichier image
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatar(URL.createObjectURL(file)); // Preview en live !
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-bg">
            <Loader2 className="animate-spin text-brand-lavender" size={32} />
        </div>
    );

    return (
        <main className="min-h-screen text-text flex flex-col items-center px-[30px] pt-[50px] pb-[30px] relative overflow-x-hidden w-full">
            <Header contentAlign="center" onBack={() => navigate(-1)}>
                <h2 className="text-[17px] font-bold">Personal informations</h2>
            </Header>

            {feedback && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
                    <Message>
                        {feedback.type === 'success' ? <CircleCheck className="text-green-500" /> : <TriangleAlert className="stroke-warning" />}
                        <span className="text-sm">{feedback.text}</span>
                    </Message>
                </div>
            )}

            <div className="w-full h-full max-w-md flex flex-col gap-6 mt-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="grayscale">
                        {/* Avatar utilise 'null' si l'utilisateur met une nouvelle photo non traitée par Avatar.tsx (si c'est par defaut). 
                            L'avatar en preview est une URL blob "blob:http:..." gérée par Avatar() ! */}
                        <Avatar src={avatar} size="xl" shape="circle" />
                    </div>
                    {/* Input file caché */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                    />
                    <button 
                        onClick={handleEditPhotoClick} 
                        className="text-sm font-semibold active:opacity-50"
                    >
                        Edit photo
                    </button>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <EditableRow label="Name">
                        <textarea className="w-full bg-transparent outline-none text-[15px] resize-none p-0"
                            value={name} onChange={(e) => setName(e.target.value)} rows={1} />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Username">
                        <textarea className="w-full bg-transparent outline-none text-[15px] resize-none text-text-muted font-light p-0"
                            value={username} readOnly rows={1} />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Bio">
                        <textarea className="w-full bg-transparent outline-none text-[15px] resize-none p-0 leading-relaxed"
                            value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Lieu">
                        <textarea className="w-full bg-transparent outline-none text-[15px] resize-none p-0"
                            value={lieu} onChange={(e) => setLieu(e.target.value)} rows={1} />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Lien">
                        <textarea className="w-full bg-transparent outline-none text-[15px] resize-none p-0 leading-tight"
                            value={lien} onChange={(e) => setLien(e.target.value)} rows={2} />
                    </EditableRow>
                </div>

                <Button variant="gradient" size="lg" onClick={handleUpdate}>
                    Validate
                </Button>
            </div>
        </main>
    );
}
