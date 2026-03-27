import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Message from "./Message";
import { CircleCheck, TriangleAlert } from "lucide-react";


export default function Login() {
    // 1. Déclarer des états pour chaque champ
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // État pour gérer les messages flottants
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // 2. Fonction appelée lors du clic sur "Login"
    const handleLogin = async () => {
        setFeedback(null); // On efface l'ancien message
        const payload = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Le backend renvoie le token et les rôles en JSON
                const data = await response.json();

                // On stocke le token, rôles et l'avatar dans le stockage local du navigateur
                localStorage.setItem("user_token", data.token);
                localStorage.setItem("user_id", data.id);
                localStorage.setItem("user_roles", JSON.stringify(data.roles)); 
                if (data.avatar) {
                    localStorage.setItem("user_avatar", data.avatar);
                }
                if (data.username) {
                    localStorage.setItem("user_username", data.username); // Sauvegarde de l'avatar connecté
                }

                setFeedback({ type: 'success', text: "Connexion réussie ! Redirection..." });
                setTimeout(() => navigate("/feed"), 1500);
            } else {
                setFeedback({ type: 'error', text: "Email ou mot de passe incorrect !" });
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm">
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
            <h2 className="text-3xl font-bold text-action-text">Login</h2>

            <div className="flex flex-col gap-4">
                {/* 3. Lier les inputs aux états */}
                <Input
                    variant="primary" size="lg" type="email" placeholder="Email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    variant="primary" size="lg" type="password" placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* 4. Appeler la fonction au clic */}
            <Button variant="gradient" size="lg"onClick={handleLogin}>Log in</Button>

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
