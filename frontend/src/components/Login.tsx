import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const payload = { email, password };

        // On enlève le bloc try/catch comme tu as demandé
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("user_token", data.token);
            localStorage.setItem("user_roles", JSON.stringify(data.roles)); 
            navigate("/feed");
        } 
        // Si ça rate (401, 500), il ne se passera juste rien ici
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-bg px-4">
            <AuthCard variant="primary" size="md">
                <h2 className="text-3xl font-bold text-action-text mb-6">Login</h2>

                <div className="flex flex-col gap-4">
                    <Input
                        variant="primary" size="lg" type="email" placeholder="Email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        variant="primary" size="lg" type="password" placeholder="Password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button variant="gradient" size="lg" onClick={handleLogin}>
                    Log in
                </Button>

                <p className="text-center text-sm text-action-text mt-4">
                    {"Don't have an account ? "}
                    <Link to="/signin" className="text-text-accent font-bold hover:underline">
                        Sign up
                    </Link>
                </p>
            </AuthCard>
        </main>
    );
}