import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BeforeAfterProps {
  before: string;
  after: string;
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  return (
    <Card className="p-0 overflow-visible">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden rounded-md cursor-col-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        data-testid="div-before-after"
      >
        <img
          src={after}
          alt="Staged room"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={before}
            alt="Original room"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-muted-foreground/50 rounded-full" />
              <div className="w-0.5 h-3 bg-muted-foreground/50 rounded-full" />
            </div>
          </div>
        </div>

        <Badge variant="secondary" className="absolute top-3 left-3 z-20 bg-black/60 text-white border-0">
          Before
        </Badge>
        <Badge variant="secondary" className="absolute top-3 right-3 z-20 bg-black/60 text-white border-0">
          After
        </Badge>
      </div>
    </Card>
  );
}
