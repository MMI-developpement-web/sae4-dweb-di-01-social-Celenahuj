import Label from "./Label";

interface EditableRowProps {
  label: string;
  children: React.ReactNode;
}

export default function EditableRow({ label, children }: EditableRowProps) {
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