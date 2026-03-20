import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";


export default function Login() {
    // 1. Déclarer des états pour chaque champ
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // 2. Fonction appelée lors du clic sur "Login"
    const handleLogin = async () => {
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

                // On stocke le token et les rôles dans le stockage local du navigateur
                localStorage.setItem("user_token", data.token);
                localStorage.setItem("user_roles", JSON.stringify(data.roles)); 

                alert("Connexion réussie !");
                navigate("/feed");
            } 
        } catch (error) {
            console.error("Erreur réseau :", error);
            alert("Erreur de connexion au serveur !");
        }
    }; // <-- CLOSING handleLogin

    return (
    <main className="min-h-screen flex items-center justify-center px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 bg-bg">
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
                    Sign up
                </Link>
            </p>
        </AuthCard>
    </main>
    );
}
