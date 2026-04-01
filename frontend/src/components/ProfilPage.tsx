import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoveLeft, Grid3X3, Heart, MessageCircle, Repeat2, Send, Ellipsis, Link as LinkIcon, Loader2, CircleCheck, TriangleAlert } from "lucide-react";

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
import CommentDrawer from "./CommentDrawer";
import Message from "./Message";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileContent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { token, user: currentUser, login } = useAuth();

    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState("posts");
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [openCommentsPost, setOpenCommentsPost] = useState<any | null>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [openBlockMenu, setOpenBlockMenu] = useState(false);
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const AUTH_HEADER = { 'Authorization': `Bearer ${token}` };

    const handleBack = () => navigate(-1);

    const handleFollow = async () => {
        if (!id) return;
        setFeedback(null);

        try {
            const response = await fetch(`${API_URL}/user/${id}/follow`, {
                method: 'POST',
                headers: AUTH_HEADER
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                setUser((prev: any) => ({
                    ...prev,
                    isFollowing: data.isFollowing
                }));
            } else if (response.status === 403 || data.error) {
                 setFeedback({ type: 'error', text: data.error || "Action impossible car vous avez été bloqué par cet utilisateur." });
                 setTimeout(() => setFeedback(null), 3000);
            }
        } catch (error) {
            console.error("Erreur lors du follow/unfollow:", error);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${selectedPost.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
                setSelectedPost(null);
            } else {
                const errorText = await response.text();
                console.error(`Erreur 403 Détails :`, errorText);
                setSelectedPost(null);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    };

    const handleLike = async (postId: number) => {
        setFeedback(null);
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            } else if (response.status === 403) {
                 const data = await response.json();
                 setFeedback({ type: 'error', text: data.error || "Action impossible, vous êtes bloqué." });
                 setTimeout(() => setFeedback(null), 3000);
            }
        } catch (error) {
            console.error("Erreur lors du like:", error);
        }
    };

    const handleEditProfile = () => {
        navigate('/editProfile');
    };

    const handleBlock = async () => {
        if (!id) return;

        try {
            const response = await fetch(`${API_URL}/user/${id}/block`, {
                method: 'POST',
                headers: AUTH_HEADER
            });

            const data = await response.json();

            if (!data.error) {
                setUser((prev: any) => ({
                    ...prev,
                    isBlockedByUser: data.isBlocked,
                    isFollowing: data.isBlocked ? false : prev.isFollowing
                }));
                setOpenBlockMenu(false);
            }
        } catch (error) {
            console.error("Erreur lors du blocage:", error);
        }
    };

    // --- GESTION DU SCROLL ---
    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 120);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- CHARGEMENT DU PROFIL ET MISE A JOUR DU CONTEXT ---
    useEffect(() => {
        if (!token || !currentUser) return;
        
        const validId = (id && id !== "undefined" && id !== "null") ? id : null;
        const url = validId ? `${API_URL}/profil/${validId}` : `${API_URL}/profil`;
        const storedId = String(currentUser?.id);

        fetch(url, {
            method: 'GET',
            cache: 'no-store',
            headers: AUTH_HEADER
        })
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setUser(data);

                    // Si c'est notre profil (id non fourni dans l'url, ou id de l'url = notre id)
                    // On met à jour le store si les infos ont changé
                    if (!validId || String(validId) === storedId) {
                        if (currentUser.username !== data.name || currentUser.avatar !== data.avatar) {
                            login(token, { ...currentUser, username: data.name, avatar: data.avatar });
                        }
                    }
                }
            })
            .catch(console.error);
    }, [id, token, currentUser?.id]);

    // --- CHARGEMENT DES POSTS ---
    useEffect(() => {
        if (!token || !currentUser || !user) return; // Attendre que `user` soit chargé

        setLoading(true);
        const storedId = String(currentUser?.id);
        const validId = (id && id !== "undefined" && id !== "null") ? id : null;
        const targetId = validId || storedId;

        if (!targetId) return;

        fetch(`${API_URL}/posts/user/${targetId}`, {
            method: 'GET',
            cache: 'no-store',
            headers: AUTH_HEADER
        })
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, token, currentUser?.id, user]); // On a ajouté `user` comme dépendance pour s'assurer que targetId est bon

    if (!user || !currentUser) return null;

    // Condition pour savoir si c'est MON profil basée sur l'ID centralisé
    const cEstMoi = Number(user.id) === Number(currentUser?.id);

    return (
        <>
            <main className="min-h-screen bg-bg text-text-title font-inter px-mobile-x pb-mobile-bottom flex flex-col items-center relative">
                {/* Affichage des messages d'erreur si bloqué */}
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

                <section className="w-full max-w-xl flex flex-col gap-8">

                    <header className="relative -mx-mobile-x">
                        <figure className="h-[250px] sm:h-[320px] w-full overflow-hidden bg-surface/10 relative m-0">
                            <Avatar
                                size="xxl"
                                src={user.avatar || "/assets/default-avatar.png"}
                                shape="square"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent h-32" aria-hidden="true" />
                        </figure>

                        <figure className="absolute -bottom-12 left-1/2 -translate-x-1/2 border-4 border-bg rounded-full shadow-2xl bg-bg z-10 m-0">
                            <Avatar size="xl" src={user.avatar} shape="circle" />
                        </figure>
                    </header>

                    <section className="mt-16 flex flex-col gap-6">
                        <header className="flex flex-row justify-between items-start w-full">
                            <hgroup className="flex flex-col gap-1">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-brand-lavender text-body-sm font-medium">
                                    @{user.name?.toLowerCase().replace(/\s/g, '_')}
                                </p>
                            </hgroup>

                            <nav className="flex flex-col items-end gap-4 relative" aria-label="Actions utilisateur">
                                {cEstMoi ? (
                                    <Button variant="smallwhite" size="sm" onClick={handleEditProfile}>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    /* On utilise un fragment <> ici pour grouper le bouton Follow et le menu Block */
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="smallwhite"
                                            size="sm"
                                            onClick={handleFollow}
                                        >
                                            {user.isFollowing ? "Unfollow" : "Follow"}
                                        </Button>

                                        <div className="relative"> {/* Container relatif pour le positionnement du menu */}
                                            <Button variant="icon" size="stat" onClick={() => setOpenBlockMenu(!openBlockMenu)}>
                                                <Ellipsis size={20} className="text-text-title" />
                                            </Button>

                                            {/* Petit menu contextuel (dropdown) */}
                                            {openBlockMenu && (
                                                <div className="absolute top-10 right-0 bg-surface border border-border rounded-xl shadow-xl p-2 z-[60] min-w-[150px]">
                                                    <button
                                                        onClick={handleBlock}
                                                        className="w-full text-left px-4 py-2 text-body-sm font-medium hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                    >
                                                        {user.isBlockedByUser ? "Débloquer" : "Bloquer l'utilisateur"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="font-medium text-text-title text-body-sm opacity-80">
                                    {user.lieu || "France"}
                                </p>
                            </nav>
                        </header>

                        <article className="flex flex-col gap-3">
                            <p className="text-body-base leading-relaxed text-text-title/90">
                                {user.content || "Aucune biographie pour le moment."}
                            </p>
                            {user.lien && (
                                <a href={user.lien} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-text-accent text-body-sm hover:underline truncate">
                                    <LinkIcon size={14} aria-hidden="true" />
                                    {user.lien.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </article>
                    </section>

                    <TabGroup>
                        <Tab isActive={current === "posts"} onClick={() => setCurrent("posts")}>
                            <Grid3X3 size={18} className="mr-2" />
                        </Tab>
                        {/*<Tab isActive={current === "likes"} onClick={() => setCurrent("likes")}>
                        <Heart size={18} className="mr-2" /> Likes
                    </Tab>*/}
                    </TabGroup>

                    <section className="flex flex-col gap-card-gap w-full pb-10" aria-label="Publications de l'utilisateur">
                        {loading ? (
                            <div className="flex justify-center py-12" role="status" aria-label="Chargement des publications">
                                <Loader2 className="animate-spin text-brand-lavender" size={28} />
                            </div>
                        ) : (
                            posts.map((post) => (
                                <TweetCard key={post.id} variant="primary" size="md">
                                    <header className="flex justify-between items-start w-full">
                                        <Profil className="items-start">
                                            <Button variant="avatar" size="nul" onClick={() => navigate(`/profil/${user.id}`)}>
                                                <Avatar src={post.author?.avatar} size="md" shape="circle" />
                                            </Button>
                                            <div className="flex flex-col">
                                                <p className="text-body-sm font-bold">@{post.author?.username}</p>
                                                <time dateTime={post.date} className="text-xs text-text-muted">{new Date(post.date).toLocaleDateString()}</time>
                                            </div>
                                        </Profil>
                                        {Number(post.author?.id) === Number(currentUser?.id) && (
                                            <Button variant="icon" size="stat" onClick={() => setSelectedPost(post)}>
                                                <Ellipsis size={20} className="text-text-muted" aria-label="Options du post" />
                                            </Button>
                                        )}
                                    </header>
                                    <p className="text-body-base py-2">{post.content}</p>

                                    {/* --- AFFICHAGE DU MEDIA --- */}
                                    {post.media && (
                                        <figure className="mt-2 mb-4 rounded-2xl overflow-hidden border border-border bg-black/5 aspect-[3/1] m-0">
                                            {post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video
                                                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${post.media}`}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${post.media}`}
                                                    alt="Post media"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </figure>
                                    )}

                                    <footer className="flex justify-between w-full mt-2">
                                        <div className="flex gap-4">
                                            <Button
                                                variant={post.isLiked ? "like" : "icon"}
                                                size="stat"
                                                onClick={() => handleLike(post.id)}
                                                aria-label={post.isLiked ? "Je n'aime plus" : "J'aime"}
                                            >
                                                <Heart size={18} className={post.isLiked ? "fill-current" : ""} aria-hidden="true" />
                                                <span className="ml-2 text-sm">{post.likesCount || 0}</span>
                                            </Button>
                                            <Button
                                                variant="icon"
                                                size="stat"
                                                onClick={() => setOpenCommentsPost(post)}
                                                aria-label="Commentaires"
                                            >
                                                <MessageCircle size={18} aria-hidden="true" />
                                                <span className="ml-2 text-sm">{post.commentsCount || 0}</span>
                                            </Button>
                                            <StatItem variant="primary" size="stat" aria-label="Partages"><Repeat2 size={18} aria-hidden="true" /> 2</StatItem>
                                        </div>
                                        <Button variant="icon" size="stat" aria-label="Envoyer"><Send size={18} aria-hidden="true" /></Button>
                                    </footer>
                                </TweetCard>
                            ))
                        )}
                    </section>
                </section>
            </main>

            <PostDrawer
                isOpen={selectedPost !== null}
                onClose={() => setSelectedPost(null)}
                onDelete={handleDeletePost}
                post={selectedPost}
            />

            <CommentDrawer
                post={openCommentsPost}
                isOpen={openCommentsPost !== null}
                onClose={() => setOpenCommentsPost(null)}
            />
        </>
    );
}
