import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";

import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Message from "./Message";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // On récupère la fonction 'login' de notre contexte global (Store)
    const { login } = useAuth(); 


    // ===============================================
    // 1. MODÈLE (Les données tapées par l'utilisateur)
    // ===============================================
    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");

    // États simples pour alerter l'utilisateur (succès ou erreur)
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");

    // Un booléen simple pour vérifier que les champs ne sont pas vides
    let formulaireRempli = false;
    if (email !== "" && motDePasse !== "") {
        formulaireRempli = true;
    }


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher un message de retour clair
    const afficherAlerte = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);
    };

    // Action : Tenter de connecter l'utilisateur
    const actionSeConnecter = async () => {
        // 1. On vide les erreurs précédentes
        setMessageTexte("");
        setMessageType("");

        try {
            // 2. On envoie l'email et le mot de passe au serveur
            const reponse = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: motDePasse
                }),
            });

            // 3. Cas A : Identifiants faux ou erreur serveur
            if (reponse.ok === false) {
                const donneesErreur = await reponse.json().catch(() => null);
                const message = donneesErreur?.error || "Email ou mot de passe incorrect !";
                afficherAlerte(message, "error");
                setTimeout(() => {
                    setMessageTexte("");
                    setMessageType("");
                }, 3000);
                return; // On arrête là
            }

            // 4. Cas B : Succès ! Le backend donne le feu vert
            const donnees = await reponse.json();

            // On utilise la fonction 'login' de notre Store React pour sauvegarder le jeton de sécurité (token) 
            // et les infos de l'utilisateur dans tout le site, sans faire de "prop drilling".
            login(donnees.token, {
                id: donnees.id,
                username: donnees.username,
                avatar: donnees.avatar || undefined,
            });
            
            // On sauvegarde manuellement les rôles (pour savoir si on est Admin par exemple)
            if (donnees.roles) {
                localStorage.setItem("user_roles", JSON.stringify(donnees.roles)); 
            }

            afficherAlerte("Connexion réussie ! Redirection...", "success");
            
            // 5. On patiente une petite seconde et demi et hop, on va vers le Feed
            setTimeout(() => {
                navigate("/feed");
            }, 1500);

        } catch (erreur) {
            // Exception : si le serveur est carrément éteint ou injoignable
            console.error("Erreur réseau :", erreur);
            afficherAlerte("Erreur de connexion au serveur !", "error");
        }
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    return (
        <main className="min-h-screen flex items-center justify-center px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 bg-bg relative">
            
            {/* Pop-up de notification conditionnelle */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {messageType === "success" && (
                            <CircleCheck className="text-green-500" />
                        )}
                        {messageType === "error" && (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{messageTexte}</span>
                    </Message>
                </div>
            )}
            
            <AuthCard variant="primary" size="md">
                <h2 className="text-3xl font-bold text-action-text">Login</h2>

                <div className="flex flex-col gap-4">
                    <Input
                        variant="primary" 
                        size="lg" 
                        type="email" 
                        placeholder="Email"
                        value={email} 
                        onChange={(evenement) => setEmail(evenement.target.value)}
                    />
                    <Input
                        variant="primary" 
                        size="lg" 
                        type="password" 
                        placeholder="Password"
                        value={motDePasse} 
                        onChange={(evenement) => setMotDePasse(evenement.target.value)}
                    />
                </div>

                <Button 
                    variant={formulaireRempli ? "gradient" : "gradientDisabled"} 
                    size="lg" 
                    onClick={actionSeConnecter}
                >
                    Log in
                </Button>

                <p className="text-center text-body-base text-action-text">
                    Don't have an account ?{" "}
                    <Link to="/signin" className="text-text-accent font-bold">
                        Sign in
                    </Link>
                </p>
            </AuthCard>
        </main>
    );
}