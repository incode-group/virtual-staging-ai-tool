import { type StagingProject } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StagingHistoryProps {
  projects: StagingProject[];
  isLoading: boolean;
  onSelect: (project: StagingProject) => void;
}

export function StagingHistory({ projects, isLoading, onSelect }: StagingHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-16 h-12 rounded-md flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No staging history yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your staged rooms will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="p-3 hover-elevate cursor-pointer transition-all duration-150"
          onClick={() => onSelect(project)}
          data-testid={`card-project-${project.id}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
              {project.stagedImage ? (
                <img
                  src={`data:image/png;base64,${project.stagedImage}`}
                  alt="Staged"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium truncate">{project.roomType}</span>
                <Badge variant="secondary" className="text-xs">
                  {project.style}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={project.status === "completed" ? "default" : project.status === "processing" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {project.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
