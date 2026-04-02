import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MessageCircle, Plus, Heart, Ellipsis, Send, RefreshCw, CircleCheck, TriangleAlert } from 'lucide-react';
import { motion } from "framer-motion";

// Configuration de l'animation de Like
const likeVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.8 }
};
// Explication technique pour le prof : 
// - type: "spring" => utilise une animation basée sur la physique (effet ressort/rebond naturel).
// - as const => verrouille le type pour TypeScript (dit exactement que c'est la valeur absolue "spring" et non un vulgaire string, requis par Framer Motion).
const likeTransition = { type: "spring" as const, stiffness: 400, damping: 17 };

// Configuration de l'animation de Commentaire
const commentVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: -10 }, // Léger tilt sur le côté au survol
    tap: { scale: 0.9, rotate: 10 }
};
const commentTransition = { type: "spring" as const, stiffness: 400, damping: 15 };

// 2. Animation du Conteneur Parent (pour le décalage "stagger")
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            // Indique que les éléments enfants apparaîtront avec 0.1s d'intervalle
            staggerChildren: 0.1 
        }
    }
};

// 3. Animation des Éléments Enfants (cartes de post)
const itemVariants = {
    hidden: { opacity: 0, y: 40 }, // Position de départ : invisible et décalé vers le bas
    visible: { 
        opacity: 1, 
        y: 0, // Remonte à sa place initiale
        transition: { 
            // Effet ressort pour un rendu plus vivant
            type: "spring" as const, 
            stiffness: 100, 
            damping: 20 
        }
    }
};

// 4. Animation de la Page (Transition au changement de route)
const pageVariants = {
    initial: { opacity: 0, x: -20 }, // Départ : transparent et décalé à gauche
    animate: { opacity: 1, x: 0 },   // Arrivée  : opaque et centré
    exit: { opacity: 0, x: 20 }      // Sortie   : transparent et décalé à droite (si AnimatePresence utilisé)
};
const pageTransition = { 
    type: "spring" as const, 
    stiffness: 100, 
    damping: 20,
    mass: 1 
};

// Import de nos Hooks liés aux Contexts
import { useAuth } from "../contexts/AuthContext";
import { usePosts } from "../contexts/PostContext";

// Import de nos composants UI
import Button from "./ui/Button";
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
    // ===============================================
    // STORE & OUTILS (Context API, Navigation)
    // ===============================================
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Données globales gérées par le store (Pas de prop drilling)
    const { user } = useAuth();
    const { posts, loading, hasMore, fetchPosts, loadMore, handleLike, handleDelete } = usePosts();


    // ===============================================
    // 1. MODÈLE (Les données locales de la page)
    // ===============================================
    
    // États pour l'interface de cette page
    const [ongletActif, setOngletActif] = useState("following"); // "following" ou "all"
    const [menuOuvert, setMenuOuvert] = useState(false);
    const [postPourCommentaires, setPostPourCommentaires] = useState<any | null>(null);
    const [postSelectionne, setPostSelectionne] = useState<any | null>(null);
    
    // États simples pour les alertes (remplace l'objet complexe {type:..., text:...})
    const [messageTexte, setMessageTexte] = useState("");
    const [messageType, setMessageType] = useState("");

    // Logique métier du Modèle : on prépare la liste des posts à afficher
    const postsFiltres = posts.filter((post) => {
        if (ongletActif === "all") {
            return true; // Affiche absolument tous les posts
        }
        
        // Si on est sur l'onglet "following"
        const estAbonne = post.author?.isFollowing === true;
        const cestMoi = post.author?.username === user?.username;
        
        // On affiche les posts des gens qu'on suit ET nos propres posts
        if (estAbonne === true || cestMoi === true) {
            return true;
        }
        
        return false;
    });


    // ===============================================
    // 2. CONTRÔLEUR (La logique et les actions)
    // ===============================================

    // Action : Afficher une alerte de retour
    const afficherAlerte = (texte: string, type: string) => {
        setMessageTexte(texte);
        setMessageType(type);
        setTimeout(() => {
            setMessageTexte("");
            setMessageType("");
        }, 3000);
    };

    // Action : Liker ou Unliker un post (délégué au Context 'usePosts')
    const actionAimerPost = async (postId: number) => {
        setMessageTexte(""); // On efface les anciens messages
        const resultat = await handleLike(postId);
        
        if (resultat.error) {
            afficherAlerte(resultat.error, "error");
        }
    };

    // Action : Recharger manuellement le flux de posts depuis le début
    const actionRafraichirPosts = async () => {
        await fetchPosts(true);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte tout en haut
    };

    // Action : Supprimer son propre post
    const actionSupprimerPost = async () => {
        if (postSelectionne) {
            await handleDelete(postSelectionne.id);
            setPostSelectionne(null); // Ferme le tiroir d'options
        }
    };

    // Effet : Scroll Infini (charge la suite des posts quand on arrive en bas)
    useEffect(() => {
        const verifierScrollEnBas = () => {
            const hauteurFenetre = window.innerHeight;
            const positionScroll = window.scrollY;
            const hauteurDocument = document.body.offsetHeight;
            
            // Si on est à moins de 100 pixels du bas de la page
            if (hauteurFenetre + positionScroll >= hauteurDocument - 100) {
                if (loading === false && hasMore === true) {
                    loadMore(); // Demande la page suivante au Store
                }
            }
        };

        window.addEventListener('scroll', verifierScrollEnBas);
        return () => window.removeEventListener('scroll', verifierScrollEnBas);
    }, [loading, hasMore, loadMore]);


    // ===============================================
    // 3. VUE (L'Interface Utilisateur - Composants)
    // ===============================================

    return (
        <motion.main 
            className="min-h-screen bg-bg flex flex-col items-center w-full pb-mobile-bottom font-inter relative"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            
            {/* Pop-up de message (Alertes d'erreur ou succès) */}
            {messageTexte !== "" && (
                <div className="fixed top-[50px] left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-sm">
                    <Message>
                        {messageType === "success" && <CircleCheck className="text-green-500" />}
                        {messageType === "error" && <TriangleAlert className="stroke-warning" />}
                        <span>{messageTexte}</span>
                    </Message>
                </div>
            )}

            {/* Header fixe (Logo, Avatar, Onglets) */}
            <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm w-full flex flex-col items-center pt-mobile-top px-mobile-x border-b border-border">
                <div className="w-full max-w-xl flex items-center justify-between mb-12">
                    <div className="flex-1" />
                    <Logo size="lg" variant="primary" />
                    <div className="flex-1 flex justify-end">
                        <Button variant="avatar" size="nul" onClick={() => setMenuOuvert(true)}>
                            {/* On utilise l'avatar directement depuis notre Store Auth */}
                            <Avatar src={user?.avatar} size="md" shape="circle" />
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-xl flex items-end justify-between">
                    <TabGroup>
                        <Tab isActive={ongletActif === "following"} onClick={() => setOngletActif("following")}>
                            Following
                        </Tab>
                        <Tab isActive={ongletActif === "all"} onClick={() => setOngletActif("all")}>
                            For you
                        </Tab>
                    </TabGroup>
                    <div className="pb-2">
                        <Button variant="navIcon" onClick={actionRafraichirPosts}>
                            <RefreshCw size={20} />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Le Menu Latéral */}
            <Sidebar isOpen={menuOuvert} onClose={() => setMenuOuvert(false)} />

            {/* Liste des publications animées (Fil d'actualité) */}
            <motion.section 
                className="flex flex-col gap-card-gap items-center w-full max-w-xl px-mobile-x mt-8"
                // Props simplifiées : noms des variants
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {postsFiltres.map((post) => (
                    // Chaque élément s'anime en cascade grâce au staggerChildren du parent
                    <motion.article key={post.id} className="w-full m-0 p-0" variants={itemVariants}>
                        <TweetCard variant="primary" size="md">
                            
                            <header className="flex justify-between items-start w-full">
                                <Profil 
                                    className="flex w-full cursor-pointer hover:opacity-80 transition-opacity gap-3"
                                    onClick={() => navigate(`/profil/${post.author.id}`)}
                                >
                                    <Avatar src={post.author.avatar} size="md" shape="circle" />
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

                                {/* Afficher le bouton Ellipsis (3 petits points) seulement si c'est MON post */}
                                {post.author?.username === user?.username && (
                                    <Button variant="icon" size="stat" onClick={() => setPostSelectionne(post)}>
                                        <Ellipsis size={20} className="text-text-muted" />
                                    </Button>
                                )}
                            </header>

                            <p className="text-body-base py-2">{post.content}</p>

                            {/* Section Média (Image ou Vidéo) */}
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
                                            alt="Post content" 
                                            className="w-full h-full object-cover" 
                                        />
                                    )}
                                </figure>
                            )}

                            {/* Barre d'actions sous le post (Like, Comment, etc.) */}
                            <footer className="flex justify-between w-full mt-2">
                                <div className="flex gap-4">
                                    <Button variant={post.isLiked ? "like" : "icon"} size="stat" onClick={() => actionAimerPost(post.id)}>
                                        <motion.div
                                            variants={likeVariants}
                                            initial="rest"
                                            whileHover="hover"
                                            whileTap="tap"
                                            transition={likeTransition}
                                        >
                                            <Heart size={18} className={post.isLiked ? "fill-current" : ""} />
                                        </motion.div>
                                        <span className="ml-2 text-sm">{post.likesCount || 0}</span>
                                    </Button>
                                    <Button variant="icon" size="stat" onClick={() => setPostPourCommentaires(post)}>
                                        <motion.div
                                            variants={commentVariants}
                                            initial="rest"
                                            whileHover="hover"
                                            whileTap="tap"
                                            transition={commentTransition}
                                        >
                                            <MessageCircle size={18} />
                                        </motion.div>
                                        <span className="ml-2 text-sm">{post.commentsCount || 0}</span>
                                    </Button>
                                </div>
                                <Button variant="icon" size="stat"><Send size={18} /></Button>
                            </footer>
                        </TweetCard>
                    </motion.article>
                ))}
            </motion.section>

            {/* Tiroirs cachés (Menu du bas) */}
            <PostDrawer 
                isOpen={postSelectionne !== null} 
                onClose={() => setPostSelectionne(null)} 
                onDelete={actionSupprimerPost} 
                post={postSelectionne} 
            />
            
            <CommentDrawer 
                post={postPourCommentaires} 
                isOpen={postPourCommentaires !== null} 
                onClose={() => setPostPourCommentaires(null)} 
            />

            {/* Indicateur de chargement stylisé en bas si on a besoin de scroller encore */}
            <div className="h-20 flex items-center">
                {loading && <p className="text-text-muted italic text-body-sm">Chargement des tweets...</p>}
            </div>

            {/* Barre de navigation fixe tout en bas de l'écran mobile */}
            <BarNav variant="dark">
                <Button variant="navIcon" onClick={() => navigate("/feed")}><Home size={26} /></Button>
                <Button variant="navIcon" onClick={() => navigate("/createpost")}><Plus size={32} /></Button>
            </BarNav>
        </motion.main>
    );
}