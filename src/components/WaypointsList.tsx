import React from 'react';
import { Waypoint } from '@/types/waypoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin } from 'lucide-react';

interface WaypointsListProps {
  waypoints: Waypoint[];
}

const WaypointsList: React.FC<WaypointsListProps> = ({ waypoints }) => {
  return (
    <div className="panel-border rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-mono text-sm font-semibold text-foreground">WAYPOINTS</h3>
        <span className="ml-auto bg-primary/20 text-primary text-xs font-mono px-2 py-0.5 rounded">
          {waypoints.length}
        </span>
      </div>
      
      <ScrollArea className="flex-1">
        {waypoints.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Draw a path on the canvas</p>
            <p className="text-xs mt-1">to generate waypoints</p>
          </div>
        ) : (
          <div className="space-y-2">
            {waypoints.map((waypoint, index) => (
              <div
                key={waypoint.id}
                className="waypoint-marker flex items-center gap-3 p-2 rounded bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center bg-primary/20 text-primary text-xs font-mono rounded">
                  {index + 1}
                </span>
                <div className="font-mono text-xs">
                  <span className="text-muted-foreground">X:</span>
                  <span className="text-foreground ml-1">{waypoint.x}</span>
                  <span className="text-muted-foreground ml-3">Y:</span>
                  <span className="text-foreground ml-1">{waypoint.y}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default WaypointsList;
