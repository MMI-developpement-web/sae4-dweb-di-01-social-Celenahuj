import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleCheck, TriangleAlert, Image, X } from "lucide-react";

import Button from "../components/ui/Button";
import Header from "./Header";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import Textarea from "./ui/Texte";
import Message from "./Message";

// Import de nos Stores globaux (Contextes)
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext"; 

export default function CreatePostRoute() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;
    
    const { token, user } = useAuth();
    const { fetchPosts } = usePosts(); // Pour rafraichir le feed direct après avoir posté !

    // Raccourci magique : si on vient du bouton modifier, 
    // l'ancien tweet est dans location.state.editPost
    const postAModifier = location.state?.editPost;

    // Référence pour cliquer sur l'input de fichier caché
    const inputFichierOutil = useRef<HTMLInputElement>(null);


    // ===============================================
    // 1. MODÈLE (Les données tapées ou sélectionnées)
    // ===============================================

    // Le texte du tweet (vide par défaut, ou le texte existant si c'est une modif)
    const [texteDuPost, setTexteDuPost] = useState(postAModifier?.content || "");
    const [envoiEnCours, setEnvoiEnCours] = useState(false);
    
    // Alertes simplifiées
    const [texteMessage, setTexteMessage] = useState("");
    const [typeMessage, setTypeMessage] = useState("");

    // Les fichiers (images/vidéos)
    const [fichierAEnvoyer, setFichierAEnvoyer] = useState<File | null>(null);
    
    // Soit on a déjà une image du post à modifier, soit c'est vide null
    const urlApercuBase = postAModifier?.media 
        ? `${API_URL.replace('/api', '')}/uploads/${postAModifier.media}` 
        : null;
    const [apercuMedia, setApercuMedia] = useState<string | null>(urlApercuBase);
    
    // Si on supprime une ancienne image lors d'une modification
    const [supprimerAncienMedia, setSupprimerAncienMedia] = useState(false);

    // -- Logique métier pour valider l'envoi --
    const LIMITE_CARACTERES = 280;
    const estTropLong = texteDuPost.length > LIMITE_CARACTERES;
    const estTotalementVide = texteDuPost.trim().length === 0 && fichierAEnvoyer === null && apercuMedia === null;
    
    // Le bouton Publier est grisé SI...
    let boutonBloque = false;
    if (estTotalementVide === true || estTropLong === true || envoiEnCours === true || !token) {
        boutonBloque = true;
    }


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    const afficherAlerte = (texte: string, type: string) => {
        setTexteMessage(texte);
        setTypeMessage(type);
    };

    // Action : L'utilisateur a choisi un fichier sur son téléphone/PC
    const actionChoisirFichier = (evenement: React.ChangeEvent<HTMLInputElement>) => {
        const listeFichiers = evenement.target.files;

        if (listeFichiers && listeFichiers.length > 0) {
            const fichier = listeFichiers[0];
            setFichierAEnvoyer(fichier); // On garde l'original pour l'envoyer plus tard
            setApercuMedia(URL.createObjectURL(fichier)); // On l'affiche tout de suite
        }
    };

    // Action : Enlever l'image/vidéo actuelle (clic sur la petite croix)
    const actionRetirerFichier = () => {
        setFichierAEnvoyer(null);
        setApercuMedia(null);
        
        // S'il y avait une VRAIE image avant, on note au serveur de la détruire
        if (postAModifier?.media) {
            setSupprimerAncienMedia(true);
        }
        
        // On vide la valeur de l'input caché pour pouvoir reprendre la même image si on change d'avis
        if (inputFichierOutil.current) {
            inputFichierOutil.current.value = "";
        }
    };

    // Action : Clic sur le bouton physique/UI pour ouvrir la galerie photo
    const actionOuvrirGalerie = () => {
        if (inputFichierOutil.current) {
            inputFichierOutil.current.click();
        }
    };

    // Action principale : Poster le Tweet 
    const actionPublier = async () => {
        // 1. Nettoyage et blocage anti-spam
        setTexteMessage("");
        setTypeMessage("");
        if (boutonBloque) return;

        setEnvoiEnCours(true);

        try {
            // 2. Préparation du "Colis" FormData (Même système compliqué simplifié que pour le profil)
            const colisAEnvoyer = new FormData();
            colisAEnvoyer.append("content", texteDuPost);
            
            if (fichierAEnvoyer !== null) {
                colisAEnvoyer.append("file", fichierAEnvoyer);
            }
            if (supprimerAncienMedia === true) {
                colisAEnvoyer.append("removeExistingMedia", "true");
            }

            // 3. Déterminer l'URL : Création vs Modification
            let urlAPI = `${API_URL}/posts`;
            if (postAModifier) {
                urlAPI = `${API_URL}/posts/${postAModifier.id}`;
            }

            // 4. L'appel au serveur PHP/Symfony
            const reponse = await fetch(urlAPI, {
                method: 'POST', // POST gère les DEUX cas car FormData en PUT pose problème dans certains serveurs
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: colisAEnvoyer
            });

            // 5. Gestion des erreurs
            if (reponse.ok === false) {
                const donneesErreur = await reponse.json();
                afficherAlerte(donneesErreur.error || "Le serveur a refusé le message.", "error");
                
                setTimeout(() => {
                    setTexteMessage("");
                    setTypeMessage("");
                }, 3000);
                
                setEnvoiEnCours(false);
                return; // On arrête là !
            }

            // 6. Succès !
            afficherAlerte(
                postAModifier ? "Bravo, publication modifiée !" : "Bravo, publication envoyée !", 
                "success"
            );
            
            // Nettoyage rapide (pour ne pas double post si le tel freeze)
            setTexteDuPost("");
            actionRetirerFichier();
            
            // 7. On utilise le Store usePosts() pour tout rafraîchir en fond !
            await fetchPosts(true);

            // 8. Retour automatique au grand Fil d'actualité
            setTimeout(() => {
                navigate("/feed");
            }, 1500);

        } catch (erreurReseau) {
            console.error("Erreur réseau :", erreurReseau);
            afficherAlerte("Impossible de joindre le serveur.", "error");
            setEnvoiEnCours(false);
        }
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    return (
        <main className="px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 min-h-screen w-full text-text relative">

            {/* Pop-up de notification au centre en haut */}
            {texteMessage !== "" && (
                <section className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm" aria-live="polite">
                    <Message>
                        {typeMessage === 'success' ? (
                            <CircleCheck className="text-green-500" />
                        ) : (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{texteMessage}</span>
                    </Message>
                </section>
            )}

            <section className="flex flex-col gap-14 max-w-2xl mx-auto w-full">

                <Header onBack={() => navigate(-1)}>
                    {/* Bouton pour publier ou modifier */}
                    <Button
                        variant="small"
                        size="sm"
                        onClick={actionPublier}
                        disabled={boutonBloque}
                    >
                        {envoiEnCours ? "Envoi..." : (postAModifier ? "Modifier" : "Post")}
                    </Button>
                </Header>

                <Profil className="block">
                    <article className="flex flex-col gap-2 w-full">
                        <div className="flex items-start gap-4 w-full">
                            
                            <aside className="flex-shrink-0 pt-1">
                                <Avatar src={user?.avatar} size="md" shape="circle" />
                            </aside>
                            
                            <div className="flex flex-col gap-4 w-full">
                                <Textarea
                                    variant="ghost"
                                    size="lg"
                                    placeholder="Quoi de neuf ??"
                                    rows={4}
                                    value={texteDuPost}
                                    onChange={(evenement) => setTexteDuPost(evenement.target.value)}
                                />

                                {/* ZONE DE PRÉVISUALISATION DU MÉDIA */}
                                {apercuMedia !== null && (
                                    <figure className="relative w-full rounded-2xl overflow-hidden border border-border bg-surface m-0">
                                        
                                        <button
                                            type="button"
                                            onClick={actionRetirerFichier}
                                            className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white z-10 hover:bg-black"
                                        >
                                            <X size={16} />
                                        </button>

                                        {/* Détection simplifiée si c'est une vidéo ou une image */}
                                        {(fichierAEnvoyer?.type.startsWith("video") || (!fichierAEnvoyer && apercuMedia.match(/\.(mp4|webm|ogg)$/i))) ? (
                                            <video src={apercuMedia} className="w-full max-h-[300px] object-cover" controls />
                                        ) : (
                                            <img src={apercuMedia} alt="Aperçu du média" className="w-full max-h-[300px] object-cover" />
                                        )}
                                    </figure>
                                )}
                            </div>
                        </div>

                        {/* Barre d'outils (Icône pour ajouter une image) */}
                        <footer className="flex items-center gap-4 py-2">
                            <button
                                type="button"
                                onClick={actionOuvrirGalerie}
                            >
                                <Image size={22} />
                            </button>
                            
                            {/* Le vrai input HTML dégueulasse est caché ici */}
                            <input
                                type="file"
                                ref={inputFichierOutil}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={actionChoisirFichier}
                            />
                        </footer>

                        {/* Compteur de caractères final */}
                        <div className={`text-right text-body-sm ${estTropLong ? "text-warning font-bold" : "text-text-muted"}`}>
                            {texteDuPost.length} / {LIMITE_CARACTERES}
                        </div>

                    </article>
                </Profil>
            </section>
        </main>
    );
}