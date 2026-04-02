import Blocked from "../components/BlockedUsersPage";    
import { motion } from "framer-motion";

// Configuration de la transition de page
const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};
const pageTransition = { 
    type: "spring" as const, 
    stiffness: 100, 
    damping: 20,
    mass: 1 
};

export default function BlockedRoute() {
    return (
        <motion.section
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
        >
            <Blocked />
        </motion.section>
    );
}