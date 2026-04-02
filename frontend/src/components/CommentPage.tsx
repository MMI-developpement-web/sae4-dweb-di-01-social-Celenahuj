import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleCheck, TriangleAlert, Image, X } from "lucide-react";

import Button from "../components/ui/Button";
import Header from "./Header";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import Textarea from "./ui/Texte";
import Message from "./Message";

// Import des Contextes Globaux (Stores)
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";

export default function CommentRoute() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Récupération des données depuis nos stores (pas de prop-drilling)
    const { token, user } = useAuth(); 
    const { fetchPosts } = usePosts(); 

    // Raccourcis pour examiner la "boîte" (state) que la page précédente nous a envoyée
    const colisRecu = location.state;
    // Si on a un colis, on sort l'éventuel post à modifier et l'éventuel post auquelle on répond
    const postAModifier = colisRecu !== null ? colisRecu.editPost : null;
    const postAuquelOnRepond = colisRecu !== null ? colisRecu.replyTo : null;

    // Référence cachée vers l'input d'upload
    const inputFichierOutil = useRef<HTMLInputElement>(null);


    // ===============================================
    // 1. MODÈLE (Les données de la page de réponse)
    // ===============================================

    // Le contenu texte (vide, ou pré-rempli si c'est une modification)
    const [texteDeReponse, setTexteDeReponse] = useState(postAModifier?.content || "");
    const [envoiEnCours, setEnvoiEnCours] = useState(false);
    
    // Les alertes (format simplifié)
    const [texteMessage, setTexteMessage] = useState("");
    const [typeMessage, setTypeMessage] = useState("");

    // Les fichiers (images/vidéos joints à la réponse)
    const [fichierAEnvoyer, setFichierAEnvoyer] = useState<File | null>(null);
    
    const urlApercuBase = postAModifier?.media 
        ? `${API_URL.replace('/api', '')}/uploads/${postAModifier.media}` 
        : null;
    const [apercuMedia, setApercuMedia] = useState<string | null>(urlApercuBase);
    
    const [supprimerAncienMedia, setSupprimerAncienMedia] = useState(false);

    // --- Logique métier pour valider l'envoi ---
    const LIMITE_CARACTERES = 280;
    const estTropLong = texteDeReponse.length > LIMITE_CARACTERES;
    const estTotalementVide = texteDeReponse.trim().length === 0 && fichierAEnvoyer === null && apercuMedia === null;
    
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

    // Action : L'utilisateur sélectionne un fichier
    const actionChoisirFichier = (evenement: React.ChangeEvent<HTMLInputElement>) => { 
        const listeFichiers = evenement.target.files;

        if (listeFichiers && listeFichiers.length > 0) {
            const fichier = listeFichiers[0];
            setFichierAEnvoyer(fichier);
            setApercuMedia(URL.createObjectURL(fichier));
        }
    };

    // Action : L'utilisateur retire l'image (clic sur la petite croix)
    const actionRetirerFichier = () => {
        setFichierAEnvoyer(null);
        setApercuMedia(null);
        
        if (postAModifier?.media) {
            setSupprimerAncienMedia(true);
        }
        
        if (inputFichierOutil.current) {
            inputFichierOutil.current.value = "";
        }
    };

    // Action : Clic sur l'icône photo (déclenche l'input invisible)
    const actionOuvrirGalerie = () => {
        if (inputFichierOutil.current) {
            inputFichierOutil.current.click();
        }
    };

    // Action : Envoyer la réponse (Le commentaire)
    const actionPublierCommentaire = async () => {
        // Sécurité anti-spam
        setTexteMessage("");
        setTypeMessage("");
        if (boutonBloque) return;

        setEnvoiEnCours(true);

        try {
            // 1. Préparation du FormData (car on peut envoyer une image en commentaire)
            const colisAEnvoyer = new FormData();
            colisAEnvoyer.append("content", texteDeReponse);
            
            if (fichierAEnvoyer) {
                colisAEnvoyer.append("file", fichierAEnvoyer); 
            }
            if (supprimerAncienMedia === true) {
                colisAEnvoyer.append("removeExistingMedia", "true");
            }
            
            // LA SEULE DIFFÉRENCE AVEC CreatePost : On dit au serveur que c'est une RÉPONSE !
            if (postAuquelOnRepond) {
                colisAEnvoyer.append("parentId", postAuquelOnRepond.id);
            }

            // 2. Déterminer l'URL (Modification vs Nouveau Commentaire)
            let urlAPI = `${API_URL}/posts`;
            if (postAModifier) {
                urlAPI = `${API_URL}/posts/${postAModifier.id}`;
            }

            // 3. Appel réseau
            const reponse = await fetch(urlAPI, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: colisAEnvoyer 
            });

            if (reponse.ok === false) {
                const donneesErreur = await reponse.json();
                afficherAlerte(donneesErreur.error || "Le serveur a refusé le message.", "error");
                
                setTimeout(() => {
                    setTexteMessage("");
                    setTypeMessage("");
                }, 3000);
                
                setEnvoiEnCours(false);
                return; // STOP
            }

            // 4. Succès
            // Rafraîchissement global du contexte 'posts' pour que la page d'accueil soit à jour !
            await fetchPosts(true);

            afficherAlerte(
                postAModifier ? "Bravo, modification enregistrée !" : "Bravo, réponse envoyée !", 
                "success"
            );
            
            setTexteDeReponse("");
            actionRetirerFichier();
            
            // 5. Retour en arrière
            setTimeout(() => {
                navigate(-1);
            }, 1000);

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

            {/* Notification conditionnelle */}
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
                    {/* Bouton de validation */}
                    <Button
                        variant="small"
                        size="sm"
                        onClick={actionPublierCommentaire}
                        disabled={boutonBloque}
                    >
                        {envoiEnCours ? "Envoi..." : (postAModifier ? "Modifier" : "Post")}
                    </Button>
                </Header>

                {/* --- L'AFFICHEUR DU TWEET ORIGINAL (Celui auquel on répond) --- */}
                {postAuquelOnRepond !== null && (
                    <article className="flex gap-4">
                        <aside className="flex flex-col items-center">
                            <Avatar src={postAuquelOnRepond.author?.avatar} size="md" />
                            {/* Petite ligne de liaison verticale hyper stylisée */}
                            <div className="w-0.5 grow bg-gray-200 my-1" aria-hidden="true" />
                        </aside>

                        <div className="flex flex-col flex-1 pb-4">
                            <Profil className="flex flex-row w-full items-center gap-1 flex-wrap cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/profil/${postAuquelOnRepond.author?.id}`)}>
                                <span className="font-bold text-text m-0 p-0">{postAuquelOnRepond.author?.username}</span>
                                <span className="text-xs text-text-muted m-0 p-0">@{postAuquelOnRepond.author?.username?.toLowerCase()}</span>
                            </Profil>
                            
                            <div className="flex justify-between items-start gap-4 mt-1">
                                <p className="text-gray-800">{postAuquelOnRepond.content}</p>
                                
                                {/* Si le tweet d'origine avait une image, on la montre en petit à droite */}
                                {postAuquelOnRepond.media && (
                                    <figure className="m-0 flex-shrink-0">
                                        <img
                                            src={`${API_URL.replace('/api', '')}/uploads/${postAuquelOnRepond.media}`}
                                            className="w-20 h-20 object-cover rounded-lg"
                                            alt="Média du post original"
                                        />
                                    </figure>
                                )}
                            </div>
                        </div>
                    </article>
                )}

                {/* --- ZONE DE RÉPONSE --- */}
                <Profil className="block">
                    <article className="flex flex-col gap-2 w-full">
                        <div className="flex items-start gap-4 w-full">
                            
                            <aside className="flex-shrink-0 pt-1">
                                {/* Mon Avatar (Récupéré globalement grâce au store Context) */}
                                <Avatar src={user?.avatar} size="md" shape="circle" />
                            </aside>
                            
                            <div className="flex flex-col gap-4 w-full">
                                <Textarea
                                    variant="ghost"
                                    size="lg"
                                    placeholder="Pose ta réponse ??"
                                    rows={4}
                                    value={texteDeReponse}
                                    onChange={(evenement) => setTexteDeReponse(evenement.target.value)}
                                />

                                {/* ZONE DE PRÉVISUALISATION (Image/Vidéo que j'ajoute à mon commentaire) */}
                                {apercuMedia !== null && (
                                    <figure className="relative w-full rounded-2xl overflow-hidden border border-border bg-surface m-0">
                                        <button
                                            type="button"
                                            onClick={actionRetirerFichier}
                                            className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white z-10 hover:bg-black"
                                        >
                                            <X size={16} />
                                        </button>
                                        {(fichierAEnvoyer?.type.startsWith("video") || (!fichierAEnvoyer && apercuMedia.match(/\.(mp4|webm|ogg)$/i))) ? (
                                            <video src={apercuMedia} className="w-full max-h-[300px] object-cover" controls />
                                        ) : (
                                            <img src={apercuMedia} alt="Aperçu" className="w-full max-h-[300px] object-cover" />
                                        )}
                                    </figure>
                                )}
                            </div>
                        </div>

                        {/* Barre d'outils upload bas de page */}
                        <footer className="flex items-center gap-4 py-2">
                            <button
                                type="button"
                                onClick={actionOuvrirGalerie}
                            >
                                <Image size={22} />
                            </button>
                            
                            {/* Le vrai input caché */}
                            <input
                                type="file"
                                ref={inputFichierOutil}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={actionChoisirFichier}
                            />
                        </footer>
                        
                        {/* Compteur de caractères */}
                        <div className={`text-right text-body-sm ${estTropLong ? "text-warning font-bold" : "text-text-muted"}`}>
                            {texteDeReponse.length} / {LIMITE_CARACTERES}
                        </div>
                    </article>
                </Profil>
            </section>
        </main>
    );
}