import { useCallback, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
  onClear: () => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, preview, onClear, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (preview) {
    return (
      <div className="relative group">
        <Card className="overflow-visible p-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <img
              src={preview}
              alt="Uploaded room"
              className="w-full h-full object-cover"
              data-testid="img-upload-preview"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </div>
        </Card>
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 rounded-full shadow-lg z-10"
          onClick={onClear}
          disabled={disabled}
          data-testid="button-clear-image"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={`p-0 transition-all duration-200 ${
        isDragging
          ? "border-primary border-2 bg-primary/5"
          : "border-dashed border-2 border-muted-foreground/25"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <label
        className="flex flex-col items-center justify-center aspect-[4/3] cursor-pointer gap-4 p-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-testid="label-upload-area"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          {isDragging ? (
            <ImageIcon className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop your image here" : "Upload a room photo"}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG up to 10MB
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
          data-testid="input-file-upload"
        />
      </label>
    </Card>
  );
}
