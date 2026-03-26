import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MessageCircle, Plus, Heart, Repeat2, Ellipsis, Send, RefreshCw } from 'lucide-react';

// Tes composants UI
import Button from "./ui/Button";
import StatItem from "./ui/StatItem";
import TweetCard from "./Tweet";
import Profil from "./ui/Profil";
import Avatar from "./ui/Avatar";
import TabGroup from "./TabGroup";
import Sidebar from '../components/Sidebar';
import Logo from "./ui/Logo";
import Tab from "./ui/Tab";
import BarNav from "./BarNav";

// Le nouveau composant Drawer
import PostDrawer from "./PostDrawer";

export default function PostRoute() {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [current, setCurrent] = useState("following");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string | null>(localStorage.getItem("user_username"));

    const navigate = useNavigate();

    // --- FONCTION DE SUPPRESSION ---
    const handleDeletePost = async () => {
        if (!postToDelete) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            });
            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postToDelete));
                setPostToDelete(null);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    // --- US 4.2 : FONCTION DE RAFRAÎCHISSEMENT MANUEL ---
    const handleManualRefresh = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts?page=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const freshPosts = await response.json();
                setPosts(freshPosts); // Remplace les posts actuels
                setPage(1); // Reset la pagination
                setHasMore(true);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte en haut
            }
        } catch (error) {
            console.error("Erreur refresh:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- GESTION DU LIKE (SYNC AVEC SYMFONY) ---
    const handleLike = async (postId: number) => {
        // 1. On fait l'appel API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user_token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // 2. On récupère les données réelles (likesCount et isLiked) renvoyées par Symfony
            const data = await response.json();

            // 3. On met à jour l'état React avec les vraies valeurs de la base de données
            setPosts(prevPosts => prevPosts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: data.isLiked,
                        likesCount: data.likesCount
                    };
                }
                return post;
            }));
        }
    };

    useEffect(() => {
        if (!currentUsername) {
            fetch(`${import.meta.env.VITE_API_URL}/profil`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data?.name) {
                        setCurrentUsername(data.name);
                        localStorage.setItem("user_username", data.name);
                        /* AJOUT : On stocke ton ID et ton Avatar pour le reste de l'app */
                        localStorage.setItem("user_id", data.id);
                        localStorage.setItem("user_avatar", data.avatar);
                    }
                })
                .catch(console.error);
        }
    }, [currentUsername]);

    // --- CHARGEMENT INITIAL & PAGINATION ---
    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/posts?page=${page}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
        })
            .then(res => res.json())
            .then(nouvellesDonnees => {
                setPosts(anciens => {
                    const tous = [...anciens, ...nouvellesDonnees];
                    // Évite les doublons basés sur l'ID
                    return Array.from(new Map(tous.map(p => [p.id, p])).values());
                });
                if (nouvellesDonnees.length < 10) setHasMore(false);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page]);

    // --- INFINITE SCROLL ---
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading && hasMore) {
                setPage(p => p + 1);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center w-full pb-mobile-bottom font-inter">

            {/* HEADER STICKY (Logo, Avatar, Tabs) */}
            <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm w-full flex flex-col items-center pt-mobile-top px-mobile-x border-b border-border">

                {/* Ligne 1 : Logo & Profil */}
                <div className="w-full max-w-xl flex items-center justify-between mb-12">
                    <div className="flex-1" />
                    <Logo size="lg" variant="primary" />
                    <div className="flex-1 flex justify-end">
                        <Button variant="avatar" size="nul" onClick={() => setIsSidebarOpen(true)}>
                            <Avatar src={localStorage.getItem("user_avatar")} size="md" shape="circle" />
                        </Button>
                    </div>
                </div>

                {/* Ligne 2 : Navigation & Refresh */}
                <div className="w-full max-w-xl flex items-end justify-between">
                    <TabGroup>
                        <Tab
                            isActive={current === "following"}
                            onClick={() => setCurrent("following")}
                        >
                            Following
                        </Tab>
                        <Tab
                            isActive={current === "all"}
                            onClick={() => setCurrent("all")}
                        >
                            For you
                        </Tab>
                    </TabGroup>

                    <div className="pb-2">
                        <Button
                            variant="navIcon"
                            onClick={handleManualRefresh}
                        >
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* LISTE DES TWEETS FILTRÉE */}
            <div className="flex flex-col gap-card-gap items-center w-full max-w-xl px-mobile-x mt-8">
                {posts
                    .filter((post) => {
                        if (current === "all") return true;

                        return post.author?.isFollowing === true || post.author?.username === currentUsername;
                    })
                    // On affiche ensuite les tweets restants
                    .map((post) => (
                        <TweetCard key={post.id} variant="primary" size="md">
                            <div className="flex justify-between items-start w-full">
                                <Profil className="items-start">
                                    <Button variant="avatar" size="nul" onClick={() => navigate(`/profil/${post.author.id}`)}>
                                        <Avatar src={post.author.avatar} size="md" shape="circle" />
                                    </Button>
                                    <div className="flex flex-col">
                                        <p className="text-body-sm font-bold">@{post.author?.username}</p>
                                        <p className="text-xs text-text-muted">{new Date(post.date).toLocaleDateString()}</p>
                                    </div>
                                </Profil>
                                {post.author?.username === currentUsername && (
                                    <Button variant="icon" size="stat" onClick={() => setPostToDelete(post.id)}>
                                        <Ellipsis size={20} className="text-text-muted" />
                                    </Button>
                                )}
                            </div>

                            <p className="text-body-base py-2">{post.content}</p>

                            <div className="flex justify-between w-full mt-2">
                                <div className="flex gap-4">
                                    <Button
                                        variant={post.isLiked ? "like" : "icon"}
                                        size="stat"
                                        onClick={() => handleLike(post.id)}
                                    >
                                        <Heart size={18} className={post.isLiked ? "fill-current" : ""} />
                                        <span className="ml-2 text-sm">{post.likesCount || 0}</span>
                                    </Button>
                                    <StatItem variant="primary" size="stat"><MessageCircle size={18} /> 5</StatItem>
                                    <StatItem variant="primary" size="stat"><Repeat2 size={18} /> 2</StatItem>
                                </div>
                                <Button variant="icon" size="stat"><Send size={18} /></Button>
                            </div>
                        </TweetCard>
                    ))
                }
            </div>

            <PostDrawer
                isOpen={postToDelete !== null}
                onClose={() => setPostToDelete(null)}
                onDelete={handleDeletePost}
            />

            <div className="h-20 flex items-center">
                {loading && <p className="text-text-muted italic">Chargement des tweets...</p>}
            </div>

            {/* BARRE DE NAVIGATION FIXE BAS */}
            <BarNav variant="dark">
                <Button variant="navIcon" onClick={() => navigate("/feed")}><Home size={26} /></Button>
                <Button variant="navIcon" onClick={() => navigate("/createpost")}><Plus size={32} /></Button>
            </BarNav>
        </main>
    );
}