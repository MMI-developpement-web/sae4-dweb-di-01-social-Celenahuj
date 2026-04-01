import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MessageCircle, Plus, Heart, Repeat2, Ellipsis, Send, RefreshCw, CircleCheck, TriangleAlert } from 'lucide-react';

// --- 1. Import de tes Hooks liés aux Contexts ---
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";

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
import CommentDrawer from "./CommentDrawer";
import Message from "./Message";
import PostDrawer from "./PostDrawer";

export default function PostRoute() {
    const navigate = useNavigate();
    
    // --- 2. ON CONSOMME NOS STORES ! ---
    const { user } = useAuth();
    const { posts, loading, hasMore, fetchPosts, loadMore, handleLike, handleDelete } = usePosts();

    // États d'interface locale uniquement
    const [current, setCurrent] = useState("following");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openCommentsPost, setOpenCommentsPost] = useState<any | null>(null);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Fonction Like reliée au Store
    const onLikeClick = async (postId: number) => {
        setFeedback(null);
        const { error } = await handleLike(postId);
        if (error) {
            setFeedback({ type: 'error', text: error });
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    // Fait appel au Store pour refresh depuis la page 1
    const handleManualRefresh = async () => {
        await fetchPosts(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Gestion de la suppression avec le Context
    const onDeletePost = async () => {
        if (selectedPost) {
            await handleDelete(selectedPost.id);
            setSelectedPost(null);
        }
    };

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading && hasMore) {
                loadMore(); // Appelle la fonction de changement de page du store
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, loadMore]);

    return (
        <main className="min-h-screen bg-bg flex flex-col items-center w-full pb-mobile-bottom font-inter relative">
            
            {/* Messages d'erreur */}
            {feedback && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {feedback.type === 'success' ? <CircleCheck className="text-green-500" /> : <TriangleAlert className="stroke-warning" />}
                        <span>{feedback.text}</span>
                    </Message>
                </div>
            )}

            <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm w-full flex flex-col items-center pt-mobile-top px-mobile-x border-b border-border">
                <div className="w-full max-w-xl flex items-center justify-between mb-12">
                    <div className="flex-1" />
                    <Logo size="lg" variant="primary" />
                    <div className="flex-1 flex justify-end">
                        <Button variant="avatar" size="nul" onClick={() => setIsSidebarOpen(true)}>
                            {/* --- 3. On utilise l'avatar de l'AuthContext --- */}
                            <Avatar src={user?.avatar} size="md" shape="circle" />
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-xl flex items-end justify-between">
                    <TabGroup>
                        <Tab isActive={current === "following"} onClick={() => setCurrent("following")}>Following</Tab>
                        <Tab isActive={current === "all"} onClick={() => setCurrent("all")}>For you</Tab>
                    </TabGroup>
                    <div className="pb-2">
                        <Button variant="navIcon" onClick={handleManualRefresh}>
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <section className="flex flex-col gap-card-gap items-center w-full max-w-xl px-mobile-x mt-8">
                {posts
                    .filter((post) => {
                        if (current === "all") return true;
                        // --- 4. On vérifie le username avec le User de l'AuthContext ---
                        return post.author?.isFollowing === true || post.author?.username === user?.username;
                    })
                    .map((post) => (
                        <article key={post.id} className="w-full m-0 p-0">
                            <TweetCard variant="primary" size="md">
                                <header className="flex justify-between items-start w-full">
                                    <Profil className="items-start">
                                        <Button variant="avatar" size="nul" onClick={() => navigate(`/profil/${post.author.id}`)}>
                                            <Avatar src={post.author.avatar} size="md" shape="circle" />
                                        </Button>
                                        <div className="flex flex-col">
                                            <h2 className="text-body-sm font-bold m-0 p-0">@{post.author?.username}</h2>
                                            <time className="text-xs text-text-muted m-0 p-0" dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                                        </div>
                                    </Profil>
                                    {post.author?.username === user?.username && (
                                        <Button variant="icon" size="stat" onClick={() => setSelectedPost(post)}>
                                            <Ellipsis size={20} className="text-text-muted" />
                                        </Button>
                                    )}
                                </header>

                                <p className="text-body-base py-2">{post.content}</p>

                                {post.media && (
                                    <figure className="mt-2 mb-4 rounded-2xl overflow-hidden border border-border bg-black/5 aspect-[3/1] m-0">
                                        {post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                            <video src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${post.media}`} controls className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${post.media}`} alt="Post content" className="w-full h-full object-cover" />
                                        )}
                                    </figure>
                                )}

                                <footer className="flex justify-between w-full mt-2">
                                    <div className="flex gap-4">
                                        <Button variant={post.isLiked ? "like" : "icon"} size="stat" onClick={() => onLikeClick(post.id)}>
                                            <Heart size={18} className={post.isLiked ? "fill-current" : ""} />
                                            <span className="ml-2 text-sm">{post.likesCount || 0}</span>
                                        </Button>
                                        <Button variant="icon" size="stat" onClick={() => setOpenCommentsPost(post)}>
                                            <MessageCircle size={18} />
                                            <span className="ml-2 text-sm">{post.commentsCount || 0}</span>
                                        </Button>
                                        <StatItem variant="primary" size="stat"><Repeat2 size={18} /> 2</StatItem>
                                    </div>
                                    <Button variant="icon" size="stat"><Send size={18} /></Button>
                                </footer>
                            </TweetCard>
                        </article>
                    ))
                }
            </section>

            <PostDrawer isOpen={selectedPost !== null} onClose={() => setSelectedPost(null)} onDelete={onDeletePost} post={selectedPost} />
            <CommentDrawer post={openCommentsPost} isOpen={openCommentsPost !== null} onClose={() => setOpenCommentsPost(null)} />

            <div className="h-20 flex items-center">
                {loading && <p className="text-text-muted italic">Chargement des tweets...</p>}
            </div>

            <BarNav variant="dark">
                <Button variant="navIcon" onClick={() => navigate("/feed")}><Home size={26} /></Button>
                <Button variant="navIcon" onClick={() => navigate("/createpost")}><Plus size={32} /></Button>
            </BarNav>
        </main>
    );
}