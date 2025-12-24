import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Code, PaintBucket, Share2 } from "lucide-react";

export type Persona = "developers" | "designers" | "creators";

interface PersonaToggleProps {
  value: Persona;
  onChange: (value: Persona) => void;
}

const personas = [
  { value: "developers" as const, label: "Developers", icon: Code, description: "Best for websites" },
  { value: "designers" as const, label: "Designers", icon: PaintBucket, description: "Best for mockups" },
  { value: "creators" as const, label: "Creators", icon: Share2, description: "Best for social" },
];

export const PersonaToggle = ({ value, onChange }: PersonaToggleProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Export for</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val as Persona)}
        className="grid grid-cols-3 gap-2"
      >
        {personas.map((persona) => (
          <ToggleGroupItem
            key={persona.value}
            value={persona.value}
            className="flex flex-col items-center gap-1 h-auto py-3 px-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border"
          >
            <persona.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{persona.label}</span>
            <span className="text-[10px] opacity-70 hidden sm:block">{persona.description}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
