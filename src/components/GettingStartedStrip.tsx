import { Palette, Sliders, Download } from "lucide-react";

const steps = [
  {
    icon: Palette,
    title: "Pick a preset",
    description: "Start with beautiful ready-made gradients",
  },
  {
    icon: Sliders,
    title: "Tweak colors & motion",
    description: "Fine-tune to match your vision",
  },
  {
    icon: Download,
    title: "Export",
    description: "Ship to code, design, or social",
  },
];

export const GettingStartedStrip = () => {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4 md:p-6">
      <p className="text-sm text-muted-foreground mb-4 text-center">Getting Started</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <step.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary">Step {index + 1}</span>
              </div>
              <p className="font-medium text-foreground text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
