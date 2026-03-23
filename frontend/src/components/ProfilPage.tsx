import { useState, useEffect } from "react";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import TweetCard from "../components/Tweet";
import Profil from "../components/ui/Profil";
import StatItem from "../components/ui/StatItem";
import { useNavigate } from "react-router-dom";
import Tab from "../components/ui/Tab";
import TabGroup from "../components/TabGroup";
import { MoveLeft, Grid3X3, Heart, MessageCircle, Repeat2, Send, Ellipsis, Link as LinkIcon, Loader2 } from "lucide-react";

export default function ProfileContent() {
    const navigate = useNavigate();
    // 1. On prépare nos "boîtes" (états) pour ranger les informations
    const [user, setUser] = useState<any>(null); // Pour les infos de la personne (nom, bio, lieu)
    const [posts, setPosts] = useState<any[]>([]); // Pour la liste des messages (tweets)
    const [loading, setLoading] = useState(true); // Pour savoir si on est en train de charger
    const [current, setCurrent] = useState("posts"); // Pour savoir quel onglet est actif (posts ou likes)

    const handleBack = () => {
        navigate("/feed");
    }

    // 2. Ce bloc s'exécute une seule fois quand on arrive sur la page
    useEffect(() => {
        const token = localStorage.getItem("user_token");

        // --- 1. RÉCUPÉRER LES INFOS DU PROFIL (Bio, Lieu, Lien) ---
        fetch(`${import.meta.env.VITE_API_URL}/profil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then((data) => {
                if (!data.error) {
                    setUser(data);
                }
            })
            .catch(err => console.error("Erreur profil:", err));

        // --- 2. RÉCUPÉRER LES TWEETS ---
        fetch(`${import.meta.env.VITE_API_URL}/posts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) throw new Error("Accès refusé");
                return response.json();
            })
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erreur posts:", error);
                setLoading(false);
            });
    }, []);

    // 3. Si on n'a pas encore trouvé l'utilisateur, on n'affiche rien pour éviter les erreurs
    if (!user) {
        return null;
    }

    const photoprofil = user.avatar || "/assets/default-avatar.png"; // Image par défaut si pas d'avatar
    return (
        <main className="min-h-screen bg-bg text-text-title pb-[var(--spacing-mobile-bottom)] sm:pb-20">
            <div className="relative">
                <div className="h-48 sm:h-64 w-full overflow-hidden bg-surface/10">
                    <Avatar src={photoprofil} alt="profile banner" size="xxl" shape="square" />
                </div>

                <div className="absolute top-[var(--spacing-mobile-top)] left-[var(--spacing-mobile-x)] sm:top-6 sm:left-6">
                    <Button variant="iconNoir" size="noir" onClick={handleBack}>
                        <MoveLeft size={18} />
                    </Button>
                </div>

                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 border-6 border-bg rounded-full shadow-xl">
                    <Avatar size="xl" src={user.avatar} shape="circle" />
                </div>
            </div>
            <div className="flex flex-col gap-8">
                <div className="mt-16 px-[var(--spacing-mobile-x)] flex flex-col gap-6 w-full mx-auto">
                    <div className="flex flex-row justify-between items-start w-full">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-[150px] sm:max-w-none">
                                {user.name}
                            </h1>
                            <p className="text-brand-lavender text-sm mt-1">
                                @{user.name?.toLowerCase().replace(/\s/g, '_')}
                            </p>
                        </div>

                        {/* Bloc de droite : Bouton et Localisation */}
                        <div className="flex flex-col items-end gap-6 sm:gap-8">
                            <Button variant="smallwhite" size="sm">
                                Edit Profile
                            </Button>

                            {/* La ville alignée à droite sous le bouton */}
                            <p className="font-medium text-text-title text-sm sm:text-base">
                                {user.lieu || "Limoges, France"}
                            </p>
                        </div>
                    </div>

                    {/* La Bio (contenu) */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm leading-relaxed">
                            {user.content || "Pas encore de description."}
                        </p>
                        {/* La ville s'affiche ici sur mobile (sous la bio) */}
                        <p className="sm:hidden font-medium text-brand-lavender text-sm cursor-pointer">{user.lieu}</p>
                    </div>

                    {/* Le lien Portfolio */}
                    {user.lien && (
                        <a href={user.lien} target="_blank" className="flex items-center gap-1 text-text-accent text-sm hover:underline truncate">
                            <LinkIcon size={14} /> {user.lien}
                        </a>
                    )}
                </div>

                <TabGroup>
                    <Tab
                        isActive={current === "posts"}
                        onClick={() => setCurrent("posts")}
                        size="md"
                    >
                        <Grid3X3 size={20} />
                    </Tab>

                    <Tab
                        isActive={current === "likes"}
                        onClick={() => setCurrent("likes")}
                    >
                        Likes
                    </Tab>
                </TabGroup>

                {/* --- SECTION DES TWEETS --- */}
                <div className=" px-[var(--spacing-mobile-x)] flex flex-col gap-[var(--spacing-card-gap)] items-center">

                    {/* Si c'est en train de charger, on montre un message */}
                    {loading === true ? (
                        <div className="flex flex-col items-center gap-2 mt-10">
                            <Loader2 className="animate-spin text-brand-lavender" size={32} />
                            <p className="text-text-muted">Chargement de vos tweets...</p>
                        </div>
                    ) : (
                        /* Sinon, on affiche la liste des tweets */
                        posts.map((post) => (
                            <TweetCard key={post.id} variant="primary" size="md">
                                <Profil className="items-start">
                                    <Avatar src={user.avatar} size="md" shape="circle" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{user.name}</span>
                                            <span className="text-xs text-text-muted">@{user.name}</span>
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            {new Date(post.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Profil>

                                <p className="text-body-base px-1">{post.content}</p>

                                <div className="flex justify-between items-center mt-2 border-t border-surface/5 pt-3">
                                    <div className="flex gap-4">
                                        <StatItem variant="primary" size="stat"><Heart size={16} /> 12</StatItem>
                                        <StatItem variant="primary" size="stat"><MessageCircle size={16} /> 5</StatItem>
                                        <StatItem variant="primary" size="stat"><Repeat2 size={16} /> 2</StatItem>
                                        <Ellipsis size={16} className="text-text-muted" />
                                    </div>
                                    <Send size={16} className="text-text-muted" />
                                </div>
                            </TweetCard>
                        ))
                    )}

                    {/* Si le chargement est fini mais qu'il n'y a aucun tweet */}
                    {loading === false && posts.length === 0 && (
                        <p className="text-text-muted mt-10">Vous n'avez pas encore publié de tweets.</p>
                    )}
                </div>
            </div>
        </main>
    );
}