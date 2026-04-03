import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";

import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Message from "./Message";

export default function SignIn() {
    // ===============================================
    // OUTILS (Navigation, variable d'environnement)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    // ===============================================
    // 1. MODÈLE (Les données conservées par la page)
    // ===============================================
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    
    // États simples pour remplacer l'objet complexe 'feedback'
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");

    // --- Logique métier dérivée du Modèle ---
    // Variables simples (booléennes) pour les vérifications
    const aBonneLongueur = motDePasse.length >= 8;
    const aMajuscule = /[A-Z]/.test(motDePasse);
    const aMinuscule = /[a-z]/.test(motDePasse);
    const aChiffre = /[0-9]/.test(motDePasse);
    const aSpecial = /[^A-Za-z0-9]/.test(motDePasse);

    const motDePasseValide = aBonneLongueur && aMajuscule && aMinuscule && aChiffre && aSpecial;
    
    // Un simple 'if' pour valider le formulaire
    let formulaireValide = false;
    if (nom !== "" && email !== "" && motDePasseValide === true) {
        formulaireValide = true;
    }

    // Calcul de la jauge de force du mot de passe
    let scoreForce = 0;
    if (aBonneLongueur) scoreForce++;
    if (aMajuscule) scoreForce++;
    if (aMinuscule) scoreForce++;
    if (aChiffre) scoreForce++;
    if (aSpecial) scoreForce++;
    
    let texteForce = "";
    let couleurBarre = "bg-gray-300";
    let couleurTexte = "text-gray-500";
    
    if (motDePasse.length > 0) {
        if (scoreForce <= 2) {
            texteForce = "Faible";
            couleurBarre = "bg-red-500";
            couleurTexte = "text-red-500";
        } else if (scoreForce <= 4) {
            texteForce = "Moyen";
            couleurBarre = "bg-[#F3B053]";
            couleurTexte = "text-[#F3B053]";
        } else {
            texteForce = "Fort";
            couleurBarre = "bg-green-500";
            couleurTexte = "text-green-500";
        }
    }


    // ===============================================
    // 2. CONTRÔLEUR (La logique explicite et les actions)
    // ===============================================
    
    const afficherAlerte = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);
        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, 3000);
    };

    // Action : Créer un nouveau compte utilisateur
    const actionCreerCompte = async () => {
        // 1. On nettoie l'éventuelle alerte précédente
        setMessageTexte("");
        setMessageType("");

        try {
            // 2. On lance la requête
            const reponse = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: nom,
                    email: email,
                    password: motDePasse
                }),
            });

            // 3. Gestion claire des erreurs serveur (le backend renvoie une erreur)
            if (reponse.ok === false) {
                const donnees = await reponse.json();
                afficherAlerte(`Erreur : ${donnees.error || 'Impossible de créer le compte'}`, "error");
                return; // On arrête l'exécution ici
            }

            // 4. Si c'est un succès :
            afficherAlerte("Compte créé avec succès ! Tu vas être redirigé.", "success");
            
            // On attend 1,5 seconde puis on navigue vers l'écran de "Login"
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (erreur) {
            // S'il n'y a pas du tout de réseau, on tombe ici
            console.error("Erreur réseau :", erreur);
            afficherAlerte("Erreur de connexion au serveur !", "error");
        }
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Le rendu HTML)
    // ===============================================

    return (
        <main className="min-h-screen flex items-center justify-center px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 bg-bg relative">
            
            {/* Pop-up de message conditionnelle (Toast de notification) */}
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
                <h2 className="text-3xl font-bold text-action-text">Sign In</h2>

                <div className="flex flex-col gap-4">
                    <Input 
                        variant="primary" 
                        size="lg" 
                        placeholder="Name" 
                        value={nom}
                        onChange={(evenement) => setNom(evenement.target.value)}
                    />
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

                    {/* Indicateur de force du mot de passe en temps réel */}
                    {motDePasse.length > 0 && (
                        <div className="flex flex-col gap-2 p-3 bg-surface rounded-md border border-border">
                            <div className="flex justify-between items-center text-body-sm font-medium">
                                <span className="text-text-muted">Force du mot de passe</span>
                                <span className={couleurTexte}>{texteForce}</span>
                            </div>
                            
                            {/* Les 3 barres pour illustrer la force (design de la capture) */}
                            <div className="flex gap-2 w-full mt-1">
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${scoreForce >= 1 ? couleurBarre : 'bg-gray-300'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${scoreForce >= 3 ? couleurBarre : 'bg-gray-300'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${scoreForce >= 5 ? couleurBarre : 'bg-gray-300'}`}></div>
                            </div>
                        </div>
                    )}
                </div>

                <Button 
                    variant={formulaireValide ? "gradient" : "gradientDisabled"} 
                    size="lg"
                    onClick={actionCreerCompte}
                >
                    Sign in
                </Button>

                <p className="text-center text-body-base text-action-text">
                    Don’t have account ?{" "}
                    <Link to="/login" className="text-text-accent font-bold">
                        Login
                    </Link>
                </p>
            </AuthCard>
        </main>
    );
}
