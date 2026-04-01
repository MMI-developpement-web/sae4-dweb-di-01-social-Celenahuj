import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleCheck, TriangleAlert, Image, X } from "lucide-react";

// Tes composants
import Button from "../components/ui/Button";
import Header from "./Header";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import Textarea from "./ui/Texte";
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";
import Message from "./Message";

export default function CommentRoute() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null); // Pour déclencher le choix de fichier

    const location = useLocation();
    const { token, user } = useAuth(); // On récupère depuis le Context
    const { fetchPosts } = usePosts(); // <-- Ajout de usePosts

    const state = location.state;
    let postAModifier = null;
    let replyToPost = null;

    if (state != null) {
        postAModifier = state.editPost;
        replyToPost = state.replyTo;
    }

    const [texteDuTweet, setTexteDuTweet] = useState(postAModifier?.content || "");
    const [enCoursDenvoi, setEnCoursDenvoi] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- NOUVEAUX ÉTATS POUR LES MÉDIAS ---
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(postAModifier?.media ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${postAModifier.media}` : null);
    const [removeExistingMedia, setRemoveExistingMedia] = useState(false);

    const LIMITE_CARACTERES = 280;
    const limiteDepassee = texteDuTweet.length > LIMITE_CARACTERES;
    const estVide = texteDuTweet.trim().length === 0 && !file && !preview;
    const boutonDesactive = estVide || limiteDepassee || enCoursDenvoi;

    const handleFileChange = (e: any) => { //n'importe quoi comme objet
        const liste = e.target.files;

        if (liste && liste.length > 0) {
            const fichier = liste[0];
            setFile(fichier);
            setPreview(URL.createObjectURL(fichier));
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        if (postAModifier?.media) {
            setRemoveExistingMedia(true);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /**
     * Fonction pour envoyer les données à Symfony (Modifiée pour FormData)
     */
    const envoyerLeTweet = async () => {
        setFeedback(null);
        if (boutonDesactive) return;

        setEnCoursDenvoi(true);

        // On utilise FormData car le JSON ne peut pas envoyer de fichiers images/vidéos
        const formData = new FormData();
        formData.append("content", texteDuTweet);
        if (file) {
            formData.append("file", file); // On ajoute le fichier sélectionné
        }
        if (removeExistingMedia) {
            formData.append("removeExistingMedia", "true");
        }
        if (replyToPost) {
            formData.append("parentId", replyToPost.id);
        }

        try {
            // Si on modifie un tweet, on utilise son ID dans l'URL (avec POST pour l'upload d'image Symfony)
            const url = postAModifier
                ? `${import.meta.env.VITE_API_URL}/posts/${postAModifier.id}`
                : `${import.meta.env.VITE_API_URL}/posts`;

            const reponse = await fetch(url, {
                method: 'POST', // POST est utilisé pour l'ajout OU la modification avec des fichiers en PHP
                headers: {
                    // ATTENTION : On enlève 'Content-Type': 'application/json'
                    'Authorization': `Bearer ${token}`
                },
                body: formData // On envoie le formData
            });

            if (reponse.ok) {
                // On force le rechargement asynchrone des posts
                await fetchPosts(true);

                setFeedback({ type: 'success', text: postAModifier ? "Bravo, votre message a été modifié ! Redirection..." : "Bravo, votre message est publié ! Redirection..." });
                setTexteDuTweet("");
                removeFile();
                // Redirection très court vers la page d'avant !
                setTimeout(() => navigate(-1), 1000);
            } else {
                const donneesErreur = await reponse.json();
                setFeedback({ type: 'error', text: donneesErreur.error || "Le serveur a refusé le message." });
                setTimeout(() => setFeedback(null), 3000);
            }
        } catch (erreurReseau) {
            console.error("Erreur réseau :", erreurReseau);
            setFeedback({ type: 'error', text: "Erreur : Impossible de joindre le serveur. Vérifiez votre connexion." });
        } finally {
            setEnCoursDenvoi(false);
        }
    };

    return (
        <main className="px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 min-h-screen w-full text-text relative">

            {/* Affichage des messages de retour (Inchangé) */}
            {feedback && (
                <section className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm" aria-live="polite">
                    <Message>
                        {feedback.type === 'success' ? (
                            <CircleCheck className="text-green-500" />
                        ) : (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{feedback.text}</span>
                    </Message>
                </section>
            )}

            <section className="flex flex-col gap-14 max-w-2xl mx-auto w-full">

                <Header onBack={() => navigate(-1)}>
                    <Button
                        variant="small"
                        size="sm"
                        onClick={envoyerLeTweet}
                        disabled={boutonDesactive}
                    >
                        {enCoursDenvoi ? "Envoi..." : (postAModifier ? "Modifier" : "Post")}
                    </Button>
                </Header>

                {/* --- APERÇU DU TWEET ORIGINAL --- */}
                {replyToPost != null && (
                    <article className="flex gap-4">
                        <aside className="flex flex-col items-center">
                            {/* Photo de la personne qui a posté le chat */}
                            <Avatar src={replyToPost.author?.avatar} size="md" />
                            {/* Petite ligne grise qui descend vers ton avatar à toi */}
                            <div className="w-0.5 grow bg-gray-200 my-1" aria-hidden="true"></div>
                        </aside>

                        <div className="flex flex-col flex-1 pb-4">
                            <header className="flex">
                                <span className="font-bold">{replyToPost.author?.name}</span>
                                <span className="text-gray-500">@{replyToPost.author?.username}</span>
                            </header>
                            <div className="flex justify-between items-start gap-4">
                                <p className="text-gray-800">{replyToPost.content}</p>
                                {/* La petite photo du chat à droite */}
                                {replyToPost.media && (
                                    <figure className="m-0">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${replyToPost.media}`}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    </figure>
                                )}
                            </div>
                        </div>
                    </article>
                )}

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
                                    value={texteDuTweet}
                                    onChange={(e) => setTexteDuTweet(e.target.value)}
                                />

                                {/* ZONE DE PRÉVISUALISATION (Comme sur ta capture) */}
                                {preview && (
                                    <figure className="relative w-full rounded-2xl overflow-hidden border border-border bg-surface m-0">
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white z-10 hover:bg-black"
                                        >
                                            <X size={16} />
                                        </button>
                                        {(file?.type.startsWith("video") || (!file && preview.match(/\.(mp4|webm|ogg)$/i))) ? (
                                            <video src={preview} className="w-full max-h-[300px] object-cover" controls />
                                        ) : (
                                            <img src={preview} alt="Aperçu" className="w-full max-h-[300px] object-cover" />
                                        )}
                                    </figure>
                                )}
                            </div>
                        </div>

                        <footer className="flex items-center gap-4 py-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image size={22} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                            />
                        </footer>
                        <div className={`text-right text-body-sm ${limiteDepassee ? "text-warning font-bold" : "text-text-muted"
                            }`}>
                            {texteDuTweet.length} / {LIMITE_CARACTERES}
                        </div>
                    </article>
                </Profil>
            </section>
        </main>
    );
}