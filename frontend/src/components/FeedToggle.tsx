import AuthCard from "../components/AuthCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Link } from "react-router-dom";

export default function SignInRoute() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-bg">
            <AuthCard variant="primary" size="md">
                <h2 className="text-3xl font-bold text-action-text">Sign In</h2>

                <div className="flex flex-col gap-4">
                    <Input variant="primary" size="lg" placeholder="Name" />
                    <Input variant="primary" size="lg" type="email" placeholder="Email" />
                    <Input variant="primary" size="lg" type="password" placeholder="Password" />
                </div>

                <Button variant="gradient">Sign up</Button>

                <p className="text-center text-action-text">
                    Don’t have account ?{" "}
                    <Link to="/login" className="text-text-accent font-bold">
                        Login
                    </Link>
                </p>
            </AuthCard>
        </main>
    );
}
