import Label from "./Label";

// ===============================================
// INTERFACES (Séparation stricte Données / Design)
// ===============================================

// 1. Le Modèle (Les données pures)
interface EditableRowData {
  label: string;             // Le label affiché à gauche
  children: React.ReactNode; // Le contenu affiché à droite
}

export default function EditableRow({ label, children }: EditableRowData) {
  
  // ===============================================
  // VUE PURE : Pas de requêtes serveur, juste de la mise en page
  // ===============================================
  
  return (
    <div className="flex items-start w-full py-5">
      <Label size="lg" variant="primary" className="pt-0.5 w-28 shrink-0 mr-6">
        {label}
      </Label>
      
      {/* Contenu à droite (Données) */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}