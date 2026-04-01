import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Typage complet d'un Post
export interface Post {
    id: number;
    content: string;
    date: string;
    media?: string;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    author: {
        id: number;
        username: string;
        avatar?: string;
        isFollowing?: boolean;
    };
}

interface PostContextType {
    posts: Post[];
    loading: boolean;
    hasMore: boolean;
    page: number;
    fetchPosts: (resetPage?: boolean) => Promise<void>;
    loadMore: () => void;
    handleLike: (postId: number) => Promise<{ error?: string }>;
    handleDelete: (postId: number) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth(); // On récupère le token automatiquement depuis l'autre Store !
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Fonction pour récupérer les posts
    const fetchPosts = useCallback(async (resetPage = false) => {
        if (!token) return;
        
        try {
            setLoading(true);
            const targetPage = resetPage ? 1 : page;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts?page=${targetPage}`, {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const nouvellesDonnees = await res.json();
                
                if (resetPage) {
                    setPosts(nouvellesDonnees);
                    setPage(1);
                    setHasMore(true);
                } else {
                    setPosts(anciens => {
                        const tous = [...anciens, ...nouvellesDonnees];
                        // Évite les doublons
                        return Array.from(new Map(tous.map(p => [p.id, p])).values());
                    });
                }
                
                if (nouvellesDonnees.length < 10) setHasMore(false);
            }
        } catch (error) {
            console.error("Erreur fetchPosts :", error);
        } finally {
            setLoading(false);
        }
    }, [page, token]);

    // Déclenche le fetch initial ou au changement de page
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const loadMore = () => {
        if (!loading && hasMore) setPage(p => p + 1);
    };

    // Gestion du like
    const handleLike = async (postId: number) => {
        if (!token) return { error: "Non connecté" };
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(prevPosts => prevPosts.map(post => 
                    post.id === postId ? { ...post, isLiked: data.isLiked, likesCount: data.likesCount } : post
                ));
                return {};
            } else if (response.status === 403) {
                const errorData = await response.json();
                return { error: errorData.error || "Action impossible, vous êtes bloqué." };
            }
            return { error: "Erreur serveur lors du like." };
        } catch(e) {
            return { error: "Erreur réseau." };
        }
    };

    // Gestion de la suppression
    const handleDelete = async (postId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error("Erreur suppression:", error);
        }
    };

    return (
        <PostContext.Provider value={{ posts, loading, hasMore, page, fetchPosts, loadMore, handleLike, handleDelete }}>
            {children}
        </PostContext.Provider>
    );
};

// Hook personnalisé exporté
export const usePosts = () => {
    const context = useContext(PostContext);
    if (context === undefined) {
        throw new Error("usePosts doit être utilisé à l'intérieur d'un PostProvider");
    }
    return context;
};