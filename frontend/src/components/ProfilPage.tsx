import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    MoveLeft,
    Grid3X3,
    Heart,
    MessageCircle,
    Repeat2,
    Send,
    Ellipsis,
    Link as LinkIcon,
    Loader2,
    CircleCheck,
    TriangleAlert
} from "lucide-react";

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
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileContent() {
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, user: currentUser, login } = useAuth(); // Les données globales
    const API_URL = import.meta.env.VITE_API_URL;
    const AUTH_HEADER = { 'Authorization': `Bearer ${token}` };


    // ===============================================
    // 1. MODÈLE (Les données locales de la page)
    // ===============================================
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentTab, setCurrentTab] = useState("posts");
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [openCommentsPost, setOpenCommentsPost] = useState<any | null>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [openBlockMenu, setOpenBlockMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Alertes simplifiées (plus d'objet complexe {type:..., text:...})
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");

    // Variable simple pour savoir si c'est mon profil
    let cEstMoi = false;
    if (user && currentUser) {
        if (Number(user.id) === Number(currentUser.id)) {
            cEstMoi = true;
        }
    }


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher un message temporaire à l'écran
    const afficherMessage = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);

        let delai = 2000;
        if (type === "error") {
            delai = 3000;
        }

        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, delai);
    };

    const retourArriere = () => navigate(-1);
    const allerModifierProfil = () => navigate('/editProfile');

    // Action : Charger les informations du profil utilisateur
    const chargerProfil = async () => {
        if (!token || !currentUser) {
            return;
        }

        // Déterminer l'ID à charger (soit celui de l'URL, soit le mien)
        let targetId = id;
        if (!targetId || targetId === "undefined" || targetId === "null") {
            targetId = String(currentUser.id);
        }

        const urlReq = (id && id !== "undefined" && id !== "null") ? `${API_URL}/profil/${id}` : `${API_URL}/profil`;

        try {
            const reponse = await fetch(urlReq, {
                method: 'GET',
                cache: 'no-store',
                headers: AUTH_HEADER
            });

            if (reponse.ok === false) {
                throw new Error("Erreur serveur lors du chargement du profil");
            }

            const donnees = await reponse.json();

            if (donnees.error) {
                throw new Error(donnees.error);
            }

            setUser(donnees);

            // Mise à jour de mon Store si c'est moi et que j'ai été modifié
            const myId = String(currentUser.id);
            if (!id || String(id) === myId) {
                if (currentUser.username !== donnees.name || currentUser.avatar !== donnees.avatar) {
                    const userMisAJour = Object.assign({}, currentUser); // Copie simple
                    userMisAJour.username = donnees.name;
                    userMisAJour.avatar = donnees.avatar;
                    login(token, userMisAJour);
                }
            }
        } catch (erreur) {
            console.error(erreur);
        }
    };

    // Action : Charger les publications (Posts) du profil
    const chargerPosts = async () => {
        if (!token || !currentUser || !user) {
            return;
        }

        setLoading(true);
        let targetId = id;
        if (!targetId || targetId === "undefined" || targetId === "null") {
            targetId = String(currentUser.id);
        }

        try {
            const reponse = await fetch(`${API_URL}/posts/user/${targetId}`, {
                method: 'GET',
                cache: 'no-store',
                headers: AUTH_HEADER
            });

            if (reponse.ok === false) {
                throw new Error("Impossible de charger les publications");
            }

            const donnees = await reponse.json();
            setPosts(donnees);
        } catch (erreur) {
            console.error(erreur);
        } finally {
            setLoading(false); // Arrête le loader
        }
    };

    // À chaque changement de compte/page on relance tout ça
    useEffect(() => {
        chargerProfil();
    }, [id, token, currentUser?.id]);

    useEffect(() => {
        chargerPosts();
    }, [user, id, token, currentUser?.id]);

    // Gestion du menu flottant au scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 120) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Action : Suivre cet utilisateur
    const actionSuivre = async () => {
        if (!id) return;

        try {
            const reponse = await fetch(`${API_URL}/user/${id}/follow`, {
                method: 'POST',
                headers: AUTH_HEADER
            });

            const donnees = await reponse.json();

            if (reponse.ok === true && !donnees.error) {
                // Créer une copie simple pour ne pas modifier direct le state (React best practice)
                const userModifie = Object.assign({}, user);
                userModifie.isFollowing = donnees.isFollowing;
                setUser(userModifie);
            } else {
                afficherMessage(donnees.error || "Impossible de s'abonner.", "error");
            }
        } catch (erreur) {
            console.error(erreur);
        }
    };

    // Action : Bloquer l'utilisateur
    const actionBloquer = async () => {
        if (!id) return;

        try {
            const reponse = await fetch(`${API_URL}/user/${id}/block`, {
                method: 'POST',
                headers: AUTH_HEADER
            });
            const donnees = await reponse.json();

            if (!donnees.error) {
                const userModifie = Object.assign({}, user);
                userModifie.isBlockedByUser = donnees.isBlocked;
                if (donnees.isBlocked === true) {
                    userModifie.isFollowing = false; // Se désabonne automatiquement
                }
                setUser(userModifie);
                setOpenBlockMenu(false); // On cache le menu
            }
        } catch (erreur) {
            console.error(erreur);
        }
    };

    // Action : Liker ou Unliker une publication
    const actionAimerPost = async (postId: number) => {
        try {
            const reponse = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const donnees = await reponse.json();

            if (reponse.ok === true) {
                // Reconstruction simple du tableau (au lieu de prev => post.map...)
                const nouveauxPosts = [];
                for (let i = 0; i < posts.length; i++) {
                    const postActuel = posts[i];
                    if (postActuel.id === postId) {
                        const postModifie = Object.assign({}, postActuel);
                        postModifie.isLiked = donnees.isLiked;
                        postModifie.likesCount = donnees.likesCount;
                        nouveauxPosts.push(postModifie);
                    } else {
                        nouveauxPosts.push(postActuel);
                    }
                }
                setPosts(nouveauxPosts);
            } else {
                afficherMessage(donnees.error || "Action impossible.", "error");
            }
        } catch (erreur) {
            console.error(erreur);
        }
    };

    // Action : Supprimer SA publication
    const actionSupprimerPost = async () => {
        if (!selectedPost) return;

        try {
            const reponse = await fetch(`${API_URL}/posts/${selectedPost.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (reponse.ok === true) {
                // On re-fabrique notre tableau sans ce post
                const postsRestants = [];
                for (let i = 0; i < posts.length; i++) {
                    if (posts[i].id !== selectedPost.id) {
                        postsRestants.push(posts[i]);
                    }
                }
                setPosts(postsRestants);
                setSelectedPost(null);
            } else {
                console.error("Erreur serveur lors de la supression");
                setSelectedPost(null);
            }
        } catch (erreur) {
            console.error(erreur);
        }
    };


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    // S'il n'y a personne (bug/chargement), on affiche un écran blanc
    if (!user || !currentUser) {
        return null;
    }

    return (
        <>
            <main className="min-h-screen bg-bg text-text-title font-inter px-mobile-x pb-mobile-bottom flex flex-col items-center relative">

                {/* Popup (Seulement si un message existe) */}
                {messageTexte !== "" && (
                    <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                        <Message>
                            {messageType === "success" && <CircleCheck className="text-green-500" />}
                            {messageType === "error" && <TriangleAlert className="stroke-warning" />}
                            <span>{messageTexte}</span>
                        </Message>
                    </div>
                )}

                <HeaderProfile
                    isSticky={isSticky}
                    className="z-50 fixed top-0 left-0 right-0 pt-[50px] pb-4 px-[30px] flex flex-row items-center justify-start gap-4"
                >
                    <Button variant="iconNoir" size="noir" onClick={retourArriere} >
                        <MoveLeft size={18} />
                    </Button>
                    <HeaderProfileContent isSticky={isSticky} >
                        <h2 className="font-bold text-body-base leading-tight">
                            {user.name}
                        </h2>
                    </HeaderProfileContent>
                </HeaderProfile>

                <section className="w-full max-w-xl flex flex-col gap-8">
                    {/* Section Avatar/Couverture */}
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

                    {/* Section Informations et Boutons */}
                    <section className="mt-16 flex flex-col gap-6">
                        <header className="flex flex-row justify-between items-start w-full">
                            <hgroup className="flex flex-col gap-1">
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-brand-lavender text-body-sm font-medium">
                                    @{user.name ? user.name.toLowerCase().replace(/\s/g, '_') : ""}
                                </p>
                            </hgroup>

                            <nav className="flex flex-col items-end gap-4 relative" aria-label="Actions utilisateur">
                                {cEstMoi ? (
                                    <>
                                        <Button variant="icon" size="stat" onClick={() => setIsSidebarOpen(true)}>
                                            <Ellipsis size={20} className="text-text-title" />
                                        </Button>
                                        <Button variant="smallwhite" size="sm" onClick={allerModifierProfil}>
                                            Edit Profile
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {/* Dropdown de blocage */}
                                        <div className="relative">
                                            <Button variant="icon" size="stat" onClick={() => setOpenBlockMenu(!openBlockMenu)}>
                                                <Ellipsis size={20} className="text-text-title" />
                                            </Button>

                                            {openBlockMenu && (
                                                <div className="absolute top-10 right-0 bg-surface border border-border rounded-xl shadow-xl p-2 z-[60] min-w-[150px]">
                                                    <button
                                                        onClick={actionBloquer}
                                                        className="w-full text-left px-4 py-2 text-body-sm font-medium hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                    >
                                                        {user.isBlockedByUser ? "Débloquer" : "Bloquer l'utilisateur"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="smallwhite"
                                            size="sm"
                                            onClick={actionSuivre}
                                        >
                                            {user.isFollowing ? "Unfollow" : "Follow"}
                                        </Button>
                                    </>
                                )}

                                <p className="font-medium text-text-title text-body-sm opacity-80">
                                    {user.lieu || "France"}
                                </p>
                            </nav>
                        </header>

                        {/* Bio Utilisateur */}
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
                        <Tab isActive={currentTab === "posts"} onClick={() => setCurrentTab("posts")}>
                            <Grid3X3 size={18} className="mr-2" />
                        </Tab>
                    </TabGroup>

                    {/* Zone des Cartes Tweets */}
                    <section className="flex flex-col gap-card-gap w-full pb-10" aria-label="Publications de l'utilisateur">
                        {loading === true ? (
                            <div className="flex justify-center py-12" role="status" aria-label="Chargement des publications">
                                <Loader2 className="animate-spin text-brand-lavender" size={28} />
                            </div>
                        ) : (
                            posts.map((post) => (
                                <TweetCard key={post.id} variant="primary" size="md">
                                    <header className="flex justify-between items-start w-full">
                                        <Profil 
                                            className="flex w-full cursor-pointer hover:opacity-80 transition-opacity gap-3"
                                            onClick={() => navigate(`/profil/${post.author?.id}`)}
                                        >
                                            <Avatar src={post.author?.avatar} size="md" shape="circle" />
                                            <div className="flex flex-col justify-center">
                                                <div className="flex flex-row items-center gap-1 flex-wrap">
                                                    <span className="text-body-sm font-bold m-0 p-0 text-text">{post.author?.username}</span>
                                                    <span className="text-xs text-text-muted m-0 p-0">@{post.author?.username?.toLowerCase()}</span>
                                                </div>
                                                <time className="text-xs text-text-muted m-0 p-0" dateTime={post.date}>
                                                    {new Date(post.date).toLocaleDateString()}
                                                </time>
                                            </div>
                                        </Profil>

                                        {post.author && currentUser && Number(post.author.id) === Number(currentUser.id) && (
                                            <Button variant="icon" size="stat" onClick={() => setSelectedPost(post)}>
                                                <Ellipsis size={20} className="text-text-muted" aria-label="Options du post" />
                                            </Button>
                                        )}
                                    </header>

                                    <p className="text-body-base py-2">{post.content}</p>

                                    {/* --- IMG / MEDIA --- */}
                                    {post.media && (
                                        <figure className="mt-2 mb-4 rounded-2xl overflow-hidden border border-border bg-black/5 aspect-[3/1] m-0">
                                            {post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video
                                                    src={`${API_URL.replace('/api', '')}/uploads/${post.media}`}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={`${API_URL.replace('/api', '')}/uploads/${post.media}`}
                                                    alt="Post media"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </figure>
                                    )}

                                    {/* Layout footer / Action bar */}
                                    <footer className="flex justify-between w-full mt-2">
                                        <div className="flex gap-4">
                                            <Button
                                                variant={post.isLiked ? "like" : "icon"}
                                                size="stat"
                                                onClick={() => actionAimerPost(post.id)}
                                            >
                                                <Heart size={18} className={post.isLiked ? "fill-current" : ""} />
                                                <span className="ml-2 text-sm">{post.likesCount || 0}</span>
                                            </Button>

                                            <Button
                                                variant="icon"
                                                size="stat"
                                                onClick={() => setOpenCommentsPost(post)}
                                            >
                                                <MessageCircle size={18} />
                                                <span className="ml-2 text-sm">{post.commentsCount || 0}</span>
                                            </Button>
                                        </div>
                                        <Button variant="icon" size="stat"><Send size={18} /></Button>
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
                onDelete={actionSupprimerPost}
                post={selectedPost}
            />

            <CommentDrawer
                post={openCommentsPost}
                isOpen={openCommentsPost !== null}
                onClose={() => setOpenCommentsPost(null)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
}
