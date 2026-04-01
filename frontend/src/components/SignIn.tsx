import { useState } from "react";
import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Message from "./Message";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // État pour gérer les messages flottants
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Vérifications en temps réel
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);


    const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
    
    const isFormValid = name && email && isPasswordValid;

    // Calcul de la force (score de 0 à 5)
    const strengthScore = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    let strengthText = "";
    let strengthColor = "bg-gray-300";
    let textColor = "text-gray-500";
    
    if (password.length > 0) {
        if (strengthScore <= 2) {
            strengthText = "Faible";
            strengthColor = "bg-red-500";
            textColor = "text-red-500";
        } else if (strengthScore <= 4) {
            strengthText = "Moitié";
            strengthColor = "bg-[#F3B053]"; // La couleur orange/jaune de la capture
            textColor = "text-[#F3B053]";
        } else {
            strengthText = "Fort";
            strengthColor = "bg-green-500";
            textColor = "text-green-500";
        }
    }

    const handleSignUp = async () => {
        setFeedback(null); // On efface l'ancien message
        // Envoi des données vers le backend
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                }),
            });

            if (response.ok) {
                setFeedback({ type: 'success', text: "Compte créé avec succès ! Tu vas être redirigé." });
                setTimeout(() => navigate("/login"), 1500); // Redirection vers le login
            } else {
                const errorData = await response.json();
                setFeedback({ type: 'error', text: `Erreur : ${errorData.error || 'Erreur lors de la création'}` });
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            setFeedback({ type: 'error', text: "Erreur de connexion au serveur !" });
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 bg-bg relative">
            
            {/* Affichage des messages de retour en haut de l'écran */}
            {feedback && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {feedback.type === 'success' ? (
                            <CircleCheck className="text-green-500" />
                        ) : (
                            <TriangleAlert className="stroke-warning" />
                        )}
                        <span>{feedback.text}</span>
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input 
                        variant="primary" 
                        size="lg" 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input 
                        variant="primary" 
                        size="lg" 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Indicateur de force en temps réel */}
                    {password.length > 0 && (
                        <div className="flex flex-col gap-2 p-3 bg-surface rounded-md border border-border">
                            <div className="flex justify-between items-center text-body-sm font-medium">
                                <span className="text-text-muted">Force du mot de passe</span>
                                <span className={textColor}>{strengthText}</span>
                            </div>
                            
                            {/* Les 3 barres séparées (design de la capture) */}
                            <div className="flex gap-2 w-full mt-1">
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${strengthScore >= 1 ? strengthColor : 'bg-gray-300'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${strengthScore >= 3 ? strengthColor : 'bg-gray-300'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${strengthScore >= 5 ? strengthColor : 'bg-gray-300'}`}></div>
                            </div>
                        </div>
                    )}
                </div>

                <Button 
                    variant={isFormValid ? "gradient" : "gradientDisabled"} size="lg"
                    onClick={handleSignUp}
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
