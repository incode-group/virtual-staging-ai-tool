import { roomTypes, designStyles } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Home, Paintbrush } from "lucide-react";

interface StyleSelectorProps {
  roomType: string;
  style: string;
  onRoomTypeChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  disabled?: boolean;
}

export function StyleSelector({
  roomType,
  style,
  onRoomTypeChange,
  onStyleChange,
  disabled,
}: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Home className="h-4 w-4 text-primary" />
          Room Type
        </Label>
        <Select value={roomType} onValueChange={onRoomTypeChange} disabled={disabled}>
          <SelectTrigger data-testid="select-room-type">
            <SelectValue placeholder="Select room type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypes.map((type) => (
              <SelectItem key={type} value={type} data-testid={`option-room-${type}`}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Paintbrush className="h-4 w-4 text-primary" />
          Design Style
        </Label>
        <Select value={style} onValueChange={onStyleChange} disabled={disabled}>
          <SelectTrigger data-testid="select-design-style">
            <SelectValue placeholder="Select design style" />
          </SelectTrigger>
          <SelectContent>
            {designStyles.map((s) => (
              <SelectItem key={s} value={s} data-testid={`option-style-${s}`}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
