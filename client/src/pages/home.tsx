import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type StagingProject } from "@shared/schema";
import { ImageUpload } from "@/components/image-upload";
import { StyleSelector } from "@/components/style-selector";
import { BeforeAfter } from "@/components/before-after";
import { StagingHistory } from "@/components/staging-history";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Download,
  ArrowLeft,
  Wand2,
  Layers,
  Zap,
  ImageIcon,
  Upload as UploadIcon,
} from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("Living Room");
  const [style, setStyle] = useState("Modern");
  const [activeProject, setActiveProject] = useState<StagingProject | null>(null);
  const { toast } = useToast();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<StagingProject[]>({
    queryKey: ["/api/staging"],
  });

  const stagingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No image selected");
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, roomType, style }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Staging failed. Please try again.");
      }

      return (await res.json()) as StagingProject;
    },
    onSuccess: (project) => {
      setActiveProject(project);
      queryClient.invalidateQueries({ queryKey: ["/api/staging"] });
      toast({ title: "Staging Complete", description: "Your room has been beautifully staged!" });
    },
    onError: (error: Error) => {
      toast({ title: "Staging Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleImageSelect = useCallback((file: File, previewUrl: string) => {
    setSelectedFile(file);
    setPreview(previewUrl);
    setActiveProject(null);
  }, []);

  const handleClearImage = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setActiveProject(null);
  }, []);

  const handleProjectSelect = useCallback((project: StagingProject) => {
    setActiveProject(project);
    setPreview(`data:image/png;base64,${project.originalImage}`);
  }, []);

  const handleDownload = useCallback(() => {
    if (!activeProject?.stagedImage) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${activeProject.stagedImage}`;
    link.download = `staged-${activeProject.roomType}-${activeProject.style}.png`;
    link.click();
  }, [activeProject]);

  const handleBackToUpload = useCallback(() => {
    setActiveProject(null);
    setSelectedFile(null);
    setPreview(null);
  }, []);

  const isProcessing = stagingMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-14">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight" data-testid="text-app-title">
                Virtual Staging
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!preview && !activeProject && (
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Zap className="h-3 w-3" />
              AI-Powered Staging
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Stage any room in seconds
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Upload a photo of an empty room and our AI will fill it with beautiful furniture
              matching your chosen style.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {activeProject?.stagedImage && preview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToUpload}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <h2 className="text-lg font-semibold">Staged Result</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary">{activeProject.roomType}</Badge>
                        <Badge variant="secondary">{activeProject.style}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleDownload} data-testid="button-download">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <BeforeAfter
                  before={preview}
                  after={`data:image/png;base64,${activeProject.stagedImage}`}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Drag the slider to compare the original and staged room
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {preview && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold">Your Room</h2>
                  </div>
                )}
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  preview={preview}
                  onClear={handleClearImage}
                  disabled={isProcessing}
                />

                {isProcessing && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium">AI is staging your room...</span>
                      </div>
                      <Progress value={undefined} className="h-1.5" data-testid="progress-staging" />
                      <p className="text-xs text-muted-foreground">
                        This may take up to 30 seconds
                      </p>
                    </div>
                  </Card>
                )}

                {!preview && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    {[
                      {
                        icon: UploadIcon,
                        title: "Upload",
                        desc: "Drop any room photo",
                      },
                      {
                        icon: Wand2,
                        title: "Choose Style",
                        desc: "Pick room type & style",
                      },
                      {
                        icon: Sparkles,
                        title: "Get Staged",
                        desc: "AI adds furniture instantly",
                      },
                    ].map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                        <Card key={i} className="p-4 text-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-2">
                            <StepIcon className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {preview && !activeProject?.stagedImage && (
              <Card className="p-4 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Staging Options
                </h3>
                <StyleSelector
                  roomType={roomType}
                  style={style}
                  onRoomTypeChange={setRoomType}
                  onStyleChange={setStyle}
                  disabled={isProcessing}
                />
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => stagingMutation.mutate()}
                  disabled={!selectedFile || isProcessing}
                  data-testid="button-stage-room"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Staging...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Stage This Room
                    </>
                  )}
                </Button>
              </Card>
            )}

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Recent Stagings
              </h3>
              <StagingHistory
                projects={projects}
                isLoading={projectsLoading}
                onSelect={handleProjectSelect}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
