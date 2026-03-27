import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // On ajoute useParams
import { MoveLeft, Grid3X3, Heart, MessageCircle, Repeat2, Send, Ellipsis, Link as LinkIcon, Loader2 } from "lucide-react";

import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import TweetCard from "../components/Tweet";
import Profil from "../components/ui/Profil";
import StatItem from "../components/ui/StatItem";
import Tab from "../components/ui/Tab";
import TabGroup from "./TabGroup";
import HeaderProfile from "./HeaderProfile";
import HeaderProfileContent from "../components/ui/HeaderProfileContent";
import PostDrawer from "./PostDrawer";

export default function ProfileContent() {
    const navigate = useNavigate();
    const { id } = useParams(); // On récupère l'ID de l'URL

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState("posts");
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [currentUsername, setCurrentUsername] = useState<string | null>(localStorage.getItem("user_username"));


    const API_URL = import.meta.env.VITE_API_URL;
    const AUTH_HEADER = { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` };

    const handleBack = () => navigate(-1); // Retourne à la page d'avant

    const handleFollow = async () => {
        if (!id) return;

        try {
            const response = await fetch(`${API_URL}/user/${id}/follow`, {
                method: 'POST',
                headers: AUTH_HEADER
            });

            const data = await response.json();

            if (!data.error) {
                // Mise à jour de l'état local pour refléter le changement immédiatement
                setUser((prev: any) => ({
                    ...prev,
                    isFollowing: data.isFollowing
                }));
            }
        } catch (error) {
            console.error("Erreur lors du follow/unfollow:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        const token = localStorage.getItem('user_token');

        // DEBUG : On regarde quel post on essaie de supprimer
        console.log("Tentative de suppression de l'ID post :", postToDelete);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postToDelete));
                setPostToDelete(null);
            } else {
                // ICI : On récupère le message exact du backend
                const errorText = await response.text();
                console.error(`Erreur 403 Détails :`, errorText);
                setPostToDelete(null);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    };

    const handleLike = async (postId: number) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
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
        } catch (error) {
            console.error("Erreur lors du like:", error);
        }
    };

    // --- GESTION DU SCROLL ---
    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 120);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- CHARGEMENT DU PROFIL (ADAPTATIF) ---
    useEffect(() => {
        // Si y'a un ID dans l'URL, on cherche cet utilisateur, sinon on cherche notre profil
        const validId = (id && id !== "undefined" && id !== "null") ? id : null;
        const url = validId ? `${API_URL}/profil/${validId}` : `${API_URL}/profil`;

        fetch(url, {
            method: 'GET',
            headers: AUTH_HEADER
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setUser(data);
            })
            .catch(console.error);
    }, [id]); // On relance si l'ID change

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
                        localStorage.setItem("user_id", data.id);
                        localStorage.setItem("user_avatar", data.avatar);
                    }
                })
                .catch(console.error);
        }
    }, [currentUsername]);

    // --- CHARGEMENT DES POSTS ---

    useEffect(() => {
        setLoading(true);

        const storedId = localStorage.getItem("user_id");
        const validId = (id && id !== "undefined" && id !== "null") ? id : null;
        const targetId = validId || storedId;

        // On appelle TOUJOURS la route filtrée par utilisateur
        fetch(`${API_URL}/posts/user/${targetId}`, {
            method: 'GET',
            headers: AUTH_HEADER
        })
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (!user) return null;

    // Condition pour savoir si c'est MON profil
    const cEstMoi = user.name === localStorage.getItem("user_username");

    return (
        <>
            <main className="min-h-screen bg-bg text-text-title font-inter px-mobile-x pb-mobile-bottom flex flex-col items-center relative">
                <HeaderProfile
                    isSticky={isSticky}
                    className="z-50 fixed top-0 left-0 right-0 pt-[50px] pb-4 px-[30px] flex flex-row items-center justify-start gap-4"
                >
                    <Button variant="iconNoir" size="noir" onClick={handleBack} >
                        <MoveLeft size={18} />
                    </Button>

                    <HeaderProfileContent isSticky={isSticky} className="flex flex-col">
                        <h2 className="font-bold text-body-base leading-tight">
                            {user.name}
                        </h2>
                    </HeaderProfileContent>
                </HeaderProfile>

                <div className="w-full max-w-xl flex flex-col gap-8">

                    <div className="relative -mx-mobile-x">
                        <div className="h-[250px] sm:h-[320px] w-full overflow-hidden bg-surface/10 relative">
                            <Avatar
                                size="xxl"
                                src={user.avatar || "/assets/default-avatar.png"}
                                shape="square"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent h-32" />
                        </div>

                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 border-4 border-bg rounded-full shadow-2xl bg-bg z-10">
                            <Avatar size="xl" src={user.avatar} shape="circle" />
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col gap-6">
                        <div className="flex flex-row justify-between items-start w-full">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-brand-lavender text-body-sm font-medium">
                                    @{user.name?.toLowerCase().replace(/\s/g, '_')}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                                {cEstMoi ? (
                                    <Button variant="smallwhite" size="sm">Edit Profile</Button>
                                ) : (
                                    <Button
                                        variant="smallwhite"
                                        size="sm"
                                        onClick={handleFollow}
                                    >
                                        {user.isFollowing ? "Unfollow" : "Follow"}
                                    </Button>
                                )}

                                <p className="font-medium text-text-title text-body-sm opacity-80">
                                    {user.lieu || "France"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="text-body-base leading-relaxed text-text-title/90">
                                {user.content || "Aucune biographie pour le moment."}
                            </p>
                            {user.lien && (
                                <a href={user.lien} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-text-accent text-body-sm hover:underline truncate">
                                    <LinkIcon size={14} />
                                    {user.lien.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>

                    <TabGroup>
                        <Tab isActive={current === "posts"} onClick={() => setCurrent("posts")}>
                            <Grid3X3 size={18} className="mr-2" />
                        </Tab>
                        {/*<Tab isActive={current === "likes"} onClick={() => setCurrent("likes")}>
                        <Heart size={18} className="mr-2" /> Likes
                    </Tab>*/}
                    </TabGroup>

                    <div className="flex flex-col gap-card-gap w-full pb-10">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-brand-lavender" size={28} />
                            </div>
                        ) : (
                            posts.map((post) => (
                                <TweetCard key={post.id} variant="primary" size="md">
                                    <div className="flex justify-between items-start w-full">
                                        <Profil className="items-start">
                                            <Button variant="avatar" size="nul" onClick={() => navigate(`/profil/${user.id}`)}>
                                                <Avatar src={post.author?.avatar} size="md" shape="circle" />
                                            </Button>
                                            <div className="flex flex-col">
                                                <p className="text-body-sm font-bold">@{post.author?.username}</p>
                                                <p className="text-xs text-text-muted">{new Date(post.date).toLocaleDateString()}</p>
                                            </div>
                                        </Profil>
                                        {Number(post.author?.id) === Number(localStorage.getItem("user_id")) && (
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
                        )}
                    </div>
                </div>
            </main>

            <PostDrawer
                isOpen={postToDelete !== null}
                onClose={() => setPostToDelete(null)}
                onDelete={handleDeletePost}
            />
        </>
    );
}