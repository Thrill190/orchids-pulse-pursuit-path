import React from 'react';
import { Button } from '@/components/ui/button';
import { Waypoint } from '@/types/waypoint';
import { Send, Trash2, Download, Square } from 'lucide-react';
import { toast } from 'sonner';

interface ControlPanelProps {
  waypoints: Waypoint[];
  isConnected: boolean;
  onClear: () => void;
  connectionConfig: { ip: string; port: string };
  isTransmitting: boolean;
  currentWaypointIndex: number | null;
  onStartTransmission: () => void;
  onStopTransmission: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  waypoints, 
  isConnected, 
  onClear,
  isTransmitting,
  currentWaypointIndex,
  onStartTransmission,
  onStopTransmission,
}) => {
  const handleExportWaypoints = () => {
    if (waypoints.length === 0) {
      toast.error('No waypoints to export');
      return;
    }

    const data = JSON.stringify(waypoints.map(wp => ({ x: wp.x, y: wp.y })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Waypoints exported!');
  };

  return (
    <div className="panel-border rounded-lg p-4">
      <h3 className="font-mono text-sm font-semibold text-foreground mb-4">CONTROLS</h3>
      
      {/* Transmission Status */}
      {isTransmitting && currentWaypointIndex !== null && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-mono text-primary">TRANSMITTING</span>
          </div>
          <p className="text-sm font-mono text-foreground">
            Waypoint {currentWaypointIndex + 1} in progress
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Waiting for ESP32 acknowledgment...
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {isTransmitting ? (
          <Button
            variant="destructive"
            size="lg"
            className="w-full font-mono"
            onClick={onStopTransmission}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Transmission
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="w-full font-mono"
            onClick={onStartTransmission}
            disabled={waypoints.length === 0 || !isConnected}
          >
            <Send className="w-4 h-4 mr-2" />
            Start Sequential Send
          </Button>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="control"
            onClick={handleExportWaypoints}
            disabled={waypoints.length === 0 || isTransmitting}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={onClear}
            className="text-destructive hover:text-destructive"
            disabled={isTransmitting}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
