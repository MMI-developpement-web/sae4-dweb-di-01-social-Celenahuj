import { useState } from "react";
import Button from "../components/ui/Button";
import Header from "./Header";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import Textarea from "./ui/Texte";
import { useNavigate } from "react-router-dom";

export default function CreatePostRoute() {
    const navigate = useNavigate();
    const [texteDuTweet, setTexteDuTweet] = useState("");
    const [enCoursDenvoi, setEnCoursDenvoi] = useState(false);

    // Les règles de gestion
    const LIMITE_CARACTERES = 280;
    const limiteDepassee = texteDuTweet.length > LIMITE_CARACTERES;
    const estVide = texteDuTweet.trim().length === 0;
    const boutonDesactive = estVide || limiteDepassee || enCoursDenvoi;

    /**
     * Fonction pour envoyer les données à Symfony
     */
    const envoyerLeTweet = async () => {
        if (boutonDesactive) return;

        setEnCoursDenvoi(true);
        
        try {
            const reponse = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user_token')}`
                },
                body: JSON.stringify({ content: texteDuTweet })
            });

            if (reponse.ok) {
                // ALERTE DE SUCCÈS
                alert("Bravo, votre message est publié !");
                
                setTexteDuTweet(""); 
                navigate("/feed"); // Redirection après le "OK" de l'alerte
            } else {
                const donneesErreur = await reponse.json();
                // ALERTE D'ERREUR SERVEUR
                alert(donneesErreur.error || "Le serveur a refusé le message.");
            }
        } catch (erreurReseau) {
            // ALERTE D'ERREUR RÉSEAU
            console.error("Erreur réseau :", erreurReseau);
            alert("Erreur : Impossible de joindre le serveur. Vérifiez votre connexion.");
        } finally {
            setEnCoursDenvoi(false);
        }
    };

    return (
        <main className="px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 min-h-screen w-full text-text">
            <div className="flex flex-col gap-14 max-w-2xl mx-auto w-full">
                
                <Header onBack={() => navigate(-1)}>
                    <Button 
                        variant="small" 
                        size="sm" 
                        onClick={envoyerLeTweet}
                        disabled={boutonDesactive}
                    >
                        {enCoursDenvoi ? "Envoi..." : "Publier"}
                    </Button>
                </Header>

                <Profil className="block"> 
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-start gap-4 w-full">
                            <div className="flex-shrink-0 pt-1"> 
                                <Avatar src="https://picsum.photos/200/300" size="md" shape="circle" />
                            </div>
                            <Textarea
                                variant="ghost"
                                size="lg"
                                placeholder="Quoi de neuf ??"
                                rows={6}
                                value={texteDuTweet}
                                onChange={(e) => setTexteDuTweet(e.target.value)}
                            />
                        </div>

                        <div className={`text-right text-body-sm ${
                            limiteDepassee ? "text-warning font-bold" : "text-text-muted"
                        }`}>
                            {texteDuTweet.length} / {LIMITE_CARACTERES}
                        </div>
                    </div>
                </Profil>
            </div>
        </main>
    );
}