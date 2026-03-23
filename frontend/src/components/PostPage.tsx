import Button from "./ui/Button";
import {  Home, MessageCircle, Plus } from 'lucide-react';
import { useState, useEffect } from "react";
import { Heart } from 'lucide-react';
import { Repeat2 } from 'lucide-react';
import StatItem from "./ui/StatItem";
import TweetCard from "./Tweet";
import { Ellipsis, Send } from "lucide-react";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import TabGroup from "./TabGroup";
import Sidebar from '../components/Sidebar';
import Logo from "./ui/Logo";
import Tab from "./ui/Tab";
import BarNav from "./BarNav";
import { useNavigate } from "react-router-dom";

export default function PostRoute() {
    // 1. Nos variables (états)
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [current, setCurrent] = useState("posts");
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // 2. Fonction toute simple : "S'il te plait, donne moi la suite des tweets"
    const loadMore = () => {
        // On ne charge la suite que si on ne charge pas DÉJÀ et s'il en reste !
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    // --- LE SCROLL INFINI SIMPLE ---
    useEffect(() => {
        // Cette fonction vérifie si on est arrivé tout en bas de l'écran
        const handleScroll = () => {

            const positionActuelle = document.documentElement.scrollTop + document.documentElement.clientHeight;
            const hauteurTotale = document.documentElement.scrollHeight;

            // Si on est à moins de 50 pixels du bas de la page...
            if (positionActuelle >= hauteurTotale - 50) {
                loadMore(); // ... on charge la suite !
            }
        };

        // On écoute le défilement de la souris
        window.addEventListener('scroll', handleScroll);

        // On n'oublie pas de nettoyer quand on quitte la page
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]); 
    useEffect(() => {
        setLoading(true);

        fetch(`${import.meta.env.VITE_API_URL}/posts?page=${page}`, {
            method: 'GET',
            headers: {
                // Preuve qu'on est connecté
                'Authorization': `Bearer ${localStorage.getItem('user_token')}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    alert("Erreur de connexion. Veuillez vous reconnecter.");
                    return []; // Si erreur, on renvoie rien
                }
                return response.json(); // Sinon on trasnforme le résultat en JSON
            })
            .then(nouvellesDonnees => {
                // On met à jour la liste des posts en évitant les doublons
                setPosts(anciensPosts => {
                    const tousLesPosts = [...anciensPosts, ...nouvellesDonnees];
                    // La Map supprime automatiquement les anciens posts si un nouveau a le même ID
                    const postsUniques = Array.from(new Map(tousLesPosts.map(post => [post.id, post])).values());
                    return postsUniques;
                });

                // S'il y a moins de 10 nouveaux posts, ça veut dire qu'on est à la fin
                if (nouvellesDonnees.length < 10) {
                    setHasMore(false);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur serveur :", error);
                setLoading(false);
            });

    }, [page]);
    return (
        <main className="min-h-screen px-mobile-x pt-mobile-top pb-mobile-bottom sm:p-6 bg-bg flex flex-col items-center gap-8 sm:gap-6 sm:pb-20 w-full">
            <div className="w-full max-w-xl flex items-center justify-between">
                <div className="flex-1 flex justify-start">
                    <div className="w-10 h-10" />
                </div>

                <div className="flex-shrink-0">
                    <Logo size="lg" variant="primary" />
                </div>


                <div className="flex-1 flex justify-end">
                    <Button
                        variant="avatar" size="nul"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Avatar src={localStorage.getItem("user_avatar")} size="md" shape="circle" />
                    </Button>
                </div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <TabGroup>
                <Tab
                    isActive={current === "posts"}
                    onClick={() => setCurrent("posts")}
                    size="md"
                >
                    Following
                </Tab>

                <Tab
                    isActive={current === "likes"}
                    onClick={() => setCurrent("likes")}
                >
                    For you
                </Tab>
            </TabGroup>
            
            <div className="flex flex-col gap-card-gap items-center w-full max-w-xl">
                {posts.map((post) => (
                    <TweetCard key={post.id} variant="primary" size="md">
                        <Profil className="items-start">
                            <Avatar src={post.author.avatar} size="md" shape="circle" />
                            <div className="flex flex-col gap-2 ">
                                <p className="text-body-sm text-text-muted">@{post.author?.username?.toLowerCase().replace(' ', '')}</p>
                                <p className="text-body-sm text-text-muted">
                                    {new Date(post.date).toLocaleDateString()}
                                </p>
                            </div>

                        </Profil>
                        <p className="text-body-base">
                            {post.content}
                        </p>
                        <div className="flex justify-between">
                            <div >
                                <StatItem variant="primary" size="stat">
                                    <Button variant="icon" size="stat">
                                        <Heart />
                                    </Button>
                                    12
                                </StatItem>
                                <StatItem variant="primary" size="stat">
                                    <Button variant="icon" size="stat">
                                        <MessageCircle />
                                    </Button>
                                    12
                                </StatItem>
                                <StatItem variant="primary" size="stat">
                                    <Button variant="icon" size="stat">
                                        <Repeat2 />
                                    </Button>
                                    12
                                </StatItem>
                                <Button variant="icon" size="stat">
                                    <Ellipsis />
                                </Button>
                            </div>
                            <Button variant="icon" size="stat">
                                <Send />
                            </Button>
                        </div>

                    </TweetCard>
                ))}
            </div>

            {/* MESSAGE EN BAS DE PAGE LORS DU SCROLL */}
            <div className="w-full text-center p-4">
                {loading && <p className="text-text-muted">Chargement en cours...</p>}
                {!hasMore && posts.length > 0 && <p className="text-text-muted text-sm">Vous avez lu tous les tweets !</p>}
            </div>

            <BarNav variant="dark" >
                <Button variant="navIcon" size="md" onClick={() => navigate("/feed")}>
                    <Home size={26} />
                </Button>
                <Button variant="navIcon" size="md" onClick={() => navigate("/createpost")}>
                    <Plus size={32} />
                </Button>
            </BarNav>
        </main>
    );
}