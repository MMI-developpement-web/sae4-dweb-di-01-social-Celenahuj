// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function RootLayout() {
    return (
        <div className="flex min-h-screen bg-bg">
            <Sidebar 
                isOpen={true} 
                onClose={() => {}} 
            />
            <main className="flex-1 pl-80"> 
                <Outlet />
            </main>
        </div>
    );
}