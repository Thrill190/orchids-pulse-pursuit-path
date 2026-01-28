import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DimensionConfigProps {
  length: number;
  breadth: number;
  onLengthChange: (value: number) => void;
  onBreadthChange: (value: number) => void;
}

const DimensionConfig: React.FC<DimensionConfigProps> = ({
  length,
  breadth,
  onLengthChange,
  onBreadthChange,
}) => {
  return (
    <div className="panel-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-mono text-sm font-semibold text-foreground">
          WORKSPACE DIMENSIONS
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="length" className="text-xs font-mono text-muted-foreground">
            LENGTH (X-axis) cm
          </Label>
          <Input
            id="length"
            type="number"
            min={10}
            max={1000}
            value={length}
            onChange={(e) => onLengthChange(Number(e.target.value) || 100)}
            className="font-mono text-sm bg-secondary border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breadth" className="text-xs font-mono text-muted-foreground">
            BREADTH (Y-axis) cm
          </Label>
          <Input
            id="breadth"
            type="number"
            min={10}
            max={1000}
            value={breadth}
            onChange={(e) => onBreadthChange(Number(e.target.value) || 100)}
            className="font-mono text-sm bg-secondary border-border"
          />
        </div>
      </div>

      <div className="text-xs font-mono text-muted-foreground bg-secondary/50 rounded p-2">
        <span className="text-primary">1st Quadrant:</span> Origin (0,0) at bottom-left
      </div>
    </div>
  );
};

export default DimensionConfig;
