import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert, Loader2 } from "lucide-react";

import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Separator from "../components/ui/Separator";
import Message from "./Message";
import EditableRow from "../components/ui/EditableRow";
import Header from "../components/Header";

// Import de nos Stores globaux
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";

export default function EditProfile() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Notre fameux Store pour manipuler la session utilisateur partout
    const { token, user, login } = useAuth(); 
    const { fetchPosts } = usePosts(); // Pour forcer la mise à jour des photos de profil sur les posts

    const inputFichierCache = useRef<HTMLInputElement>(null);


    // ===============================================
    // 1. MODÈLE (Les données locales du formulaire)
    // ===============================================
    
    const [chargementInitial, setChargementInitial] = useState(true);

    // Alertes simplifiées (plus d'objet complexe {type:..., text:...})
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");

    // Les champs du profil
    const [nom, setNom] = useState("");
    const [pseudoLectureSeule, setPseudoLectureSeule] = useState(""); // Juste pour l'affichage (ex: @jean_dupont)
    const [biographie, setBiographie] = useState("");
    const [lieuHabitation, setLieuHabitation] = useState("");
    const [lienWeb, setLienWeb] = useState("");
    
    // Gestion de l'image de profil
    const [avatarAffiche, setAvatarAffiche] = useState<string | null>(null); // Ce qu'on voit à l'écran
    const [nouveauFichierAvatar, setNouveauFichierAvatar] = useState<File | null>(null); // Le vrai fichier à envoyer


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher une alerte claire
    const afficherAlerte = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);
        
        // Disparition automatique au bout de 3 secondes
        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, 3000);
    };

    // Action Initiale : Quand la page s'ouvre, on télécharge les infos actuelles du profil
    const chargerInfosActuelles = async () => {
        if (!token) return;
        
        try {
            const reponse = await fetch(`${API_URL}/profil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const donnees = await reponse.json();

            if (reponse.ok === true && !donnees.error) {
                // On remplit le modèle avec ce qui vient de la base de données
                setNom(donnees.name || "");
                setBiographie(donnees.content || "");
                setLieuHabitation(donnees.lieu || "");
                setLienWeb(donnees.lien || "");
                setAvatarAffiche(donnees.avatar);
                
                // Petit formatage cosmétique pour le champ grisé "@"
                if (donnees.name) {
                    setPseudoLectureSeule(`@${donnees.name.toLowerCase().replace(/\s/g, '_')}`);
                }
            } else {
                afficherAlerte("Erreur de chargement du profil", "error");
            }
        } catch (erreur) {
            console.error("Erreur réseau au chargement", erreur);
            afficherAlerte("Erreur réseau", "error");
        } finally {
            // Peu importe le résultat, on arrête le loader
            setChargementInitial(false);
        }
    };

    // On lance la fonction de chargement DÈS l'arrivée sur la page
    useEffect(() => {
        chargerInfosActuelles();
    }, [token]);

    // Action : Enregistrer les modifications dans la base de données
    const actionSauvegarderModifications = async () => {
        if (!token) return;
        
        // 1. Nettoyer les messages précédents
        setMessageTexte("");
        setMessageType("");

        try {
            // 2. On prépare un "colis" spécial (FormData) capable d'accueillir du texte ET une image
            const colisAEnvoyer = new FormData();
            colisAEnvoyer.append('name', nom);
            colisAEnvoyer.append('content', biographie);
            colisAEnvoyer.append('lieu', lieuHabitation);
            colisAEnvoyer.append('lien', lienWeb);
            
            // Si l'utilisateur a vraiment choisi une nouvelle photo, on l'ajoute au colis
            if (nouveauFichierAvatar !== null) {
                colisAEnvoyer.append('avatar', nouveauFichierAvatar);
            }

            // 3. On expédie le colis au backend
            const reponse = await fetch(`${API_URL}/profil/update`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // IMPORTANT : Quand on utilise FormData, on ne met PAS de 'Content-Type'. 
                    // Javascript s'en occupe automatiquement.
                },
                body: colisAEnvoyer
            });

            // 4. Si la sauvegarde côté serveur échoue
            if (reponse.ok === false) {
                afficherAlerte("Erreur lors de la mise à jour", "error");
                return; // On stoppe l'action ici
            }

            // 5. Si la sauvegarde est un succès, on met à jour l'application entière !
            const donnees = await reponse.json();
            
            if (user) {
                const nouvelAvatar = donnees.user?.avatar || avatarAffiche;
                
                // Copie propre et sûre pour mettre à jour le Store global !!
                const userMisAJour = Object.assign({}, user);
                userMisAJour.username = nom;
                userMisAJour.avatar = nouvelAvatar;
                
                login(token, userMisAJour); // On dit au Store : "Voici le nouveau profil !"
                fetchPosts(true); // On rafraîchit le gros fil de post pour qu'on voit ma nouvelle photo
            }
            
            afficherAlerte("Profil mis à jour avec succès !", "success");
            
            // On retourne à la page précédente d'où on vient
            setTimeout(() => {
                navigate(-1);
            }, 1500);

        } catch (erreur) {
            console.error("Erreur sauvegarde", erreur);
            afficherAlerte("Erreur réseau", "error");
        }
    };

    // Action : Simuler un clic sur la balise <input type="file"> qui est cachée pour des raisons de style
    const actionOuvrirFichierImage = () => {
        if (inputFichierCache.current !== null) {
            inputFichierCache.current.click();
        }
    };

    // Action : Le navigateur vient de "lire" le fichier choisi sur l'ordinateur
    const actionChangementFichierLocal = (evenement: React.ChangeEvent<HTMLInputElement>) => {
        const fichier = evenement.target.files?.[0]; // Premier fichier de la liste (s'il y en a un)
        
        if (fichier !== undefined) {
            setNouveauFichierAvatar(fichier); // On garde l'image brute pour l'envoi API plus tard
            setAvatarAffiche(URL.createObjectURL(fichier)); // On l'affiche tout de suite à l'écran (Preview magique de React)
        }
    };

    // Action : Bouton retour
    const actionRetourArriere = () => {
        navigate(-1);
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    // Écran de chargement hyper simple
    if (chargementInitial === true) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg relative">
                <Loader2 className="animate-spin text-brand-lavender" size={32} />
            </div>
        );
    }

    return (
        <main className="min-h-screen text-text flex flex-col items-center px-[30px] pt-[50px] pb-[30px] relative overflow-x-hidden w-full">
            
            <Header contentAlign="center" onBack={actionRetourArriere}>
                <h2 className="text-[17px] font-bold">Personal informations</h2>
            </Header>

            {/* Pop-up de message conditionnelle */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
                    <Message>
                        {messageType === "success" && <CircleCheck className="text-green-500" />}
                        {messageType === "error" && <TriangleAlert className="stroke-warning" />}
                        <span className="text-sm">{messageTexte}</span>
                    </Message>
                </div>
            )}

            <div className="w-full h-full max-w-md flex flex-col gap-6 mt-8">
                
                {/* --- Section : Photo de profil --- */}
                <div className="flex flex-col items-center gap-2">
                    <div className="grayscale">
                        <Avatar src={avatarAffiche} size="xl" shape="circle" />
                    </div>
                    
                    {/* Le champ natif File qui est laid est caché ("hidden") */}
                    <input 
                        type="file" 
                        ref={inputFichierCache} 
                        accept="image/*" 
                        onChange={actionChangementFichierLocal} 
                        className="hidden" 
                    />
                    
                    {/* Mais ce joli bouton déclenche virtuellement le clic dessus */}
                    <button 
                        onClick={actionOuvrirFichierImage} 
                        className="text-sm font-semibold active:opacity-50"
                    >
                        Edit photo
                    </button>
                </div>

                {/* --- Section : Les champs textes --- */}
                <div className="flex flex-col w-full gap-2">
                    
                    <EditableRow label="Name">
                        <textarea 
                            className="w-full bg-transparent outline-none text-[15px] resize-none p-0"
                            value={nom} 
                            onChange={(evenement) => setNom(evenement.target.value)} 
                            rows={1} 
                        />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    {/* Champ de pseudo non modifiable (Généré depuis l'API) */}
                    <EditableRow label="Username">
                        <textarea 
                            className="w-full bg-transparent outline-none text-[15px] resize-none text-text-muted font-light p-0"
                            value={pseudoLectureSeule} 
                            readOnly 
                            rows={1} 
                        />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Bio">
                        <textarea 
                            className="w-full bg-transparent outline-none text-[15px] resize-none p-0 leading-relaxed"
                            value={biographie} 
                            onChange={(evenement) => setBiographie(evenement.target.value)} 
                            rows={3} 
                        />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Lieu">
                        <textarea 
                            className="w-full bg-transparent outline-none text-[15px] resize-none p-0"
                            value={lieuHabitation} 
                            onChange={(evenement) => setLieuHabitation(evenement.target.value)} 
                            rows={1} 
                        />
                    </EditableRow>
                    <Separator variant="primary" margin="none" className="opacity-20" />

                    <EditableRow label="Lien">
                        <textarea 
                            className="w-full bg-transparent outline-none text-[15px] resize-none p-0 leading-tight"
                            value={lienWeb} 
                            onChange={(evenement) => setLienWeb(evenement.target.value)} 
                            rows={2} 
                        />
                    </EditableRow>
                </div>

                {/* Bouton de validation de tout le formulaire */}
                <Button variant="gradient" size="lg" onClick={actionSauvegarderModifications}>
                    Validate
                </Button>
            </div>
        </main>
    );
}