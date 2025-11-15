import { useState } from "react";
import { Sparkles, Maximize2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientPresets, GradientPreset } from "@/components/GradientPresets";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppSidebarProps {
  onSelectPreset: (preset: GradientPreset) => void;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
  canvasSize: { width: number; height: number };
}

const canvasSizePresets = [
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "Square", width: 1080, height: 1080 },
  { name: "Portrait", width: 1080, height: 1920 },
  { name: "HD Ready", width: 1280, height: 720 },
  { name: "4K UHD", width: 3840, height: 2160 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Facebook Cover", width: 820, height: 312 },
  { name: "Twitter Header", width: 1500, height: 500 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
];

export function AppSidebar({ onSelectPreset, onCanvasSizeChange, canvasSize }: AppSidebarProps) {
  const { open } = useSidebar();
  const [activeTab, setActiveTab] = useState("presets");

  return (
    <Sidebar className="border-r border-border bg-panel">
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="presets" className="text-xs md:text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {open && "Presets"}
                </TabsTrigger>
                <TabsTrigger value="canvas" className="text-xs md:text-sm">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  {open && "Canvas"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <SidebarGroupLabel className="mb-3">Gradient Presets</SidebarGroupLabel>
                  <div className="min-h-[600px]">
                    <GradientPresets onSelectPreset={onSelectPreset} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="canvas" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <SidebarGroupLabel className="mb-3">Canvas Size</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <div className="space-y-2 p-2">
                        <div className="text-xs text-muted-foreground mb-3">
                          Current: {canvasSize.width} × {canvasSize.height}
                        </div>
                        {canvasSizePresets.map((preset) => (
                          <SidebarMenuItem key={preset.name}>
                            <SidebarMenuButton
                              onClick={() => onCanvasSizeChange(preset)}
                              className={`w-full justify-start min-h-[44px] ${
                                canvasSize.width === preset.width && canvasSize.height === preset.height
                                  ? "bg-primary/10 text-primary font-medium"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-col items-start w-full">
                                <span className="font-medium">{preset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {preset.width} × {preset.height}
                                </span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
