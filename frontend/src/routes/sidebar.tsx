import Sidebar from "../components/Sidebar";

export default function SidebarRoute() {
    return (
        <section>
            <Sidebar 
                isOpen={true} 
                onClose={() => console.log("Fermeture cliquée")} 
            />
        </section>
    );
}