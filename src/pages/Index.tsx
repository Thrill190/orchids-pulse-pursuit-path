import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import DrawingCanvas from '@/components/DrawingCanvas';
import WaypointsList from '@/components/WaypointsList';
import ConnectionPanel from '@/components/ConnectionPanel';
import ControlPanel from '@/components/ControlPanel';
import DimensionConfig from '@/components/DimensionConfig';
import { Waypoint, ConnectionConfig } from '@/types/waypoint';
import { useWaypointTransmission } from '@/hooks/useWaypointTransmission';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [workspaceLength, setWorkspaceLength] = useState(100); // cm
  const [workspaceBreadth, setWorkspaceBreadth] = useState(100); // cm
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    ip: '',
    port: '8080',
    isConnected: false,
  });
  const handleConnect = async () => {
    if (connectionConfig.isConnected) {
      setConnectionConfig(prev => ({ ...prev, isConnected: false }));
      toast.info('Disconnected from device');
      return;
    }

    if (!connectionConfig.ip) {
      toast.error('Please enter an IP address');
      return;
    }

    try {
      // Attempt to ping the device
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `http://${connectionConfig.ip}:${connectionConfig.port}/ping`,
        { signal: controller.signal }
      ).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (response && response.ok) {
        setConnectionConfig(prev => ({ ...prev, isConnected: true }));
        toast.success('Connected to RPi Zero 2W!');
      } else {
        // For demo purposes, allow connection anyway
        setConnectionConfig(prev => ({ ...prev, isConnected: true }));
        toast.success('Connected (demo mode)');
      }
    } catch {
      // For demo, still allow connection
      setConnectionConfig(prev => ({ ...prev, isConnected: true }));
      toast.success('Connected (demo mode)');
    }
  };

  const handleClear = () => {
    setWaypoints([]);
    toast.info('Canvas cleared');
  };

  const handleWaypointCompleted = useCallback((waypointId: number) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== waypointId));
  }, []);

  const {
    isTransmitting,
    currentWaypointIndex,
    startTransmission,
    stopTransmission,
  } = useWaypointTransmission({
    waypoints,
    onWaypointCompleted: handleWaypointCompleted,
    connectionConfig,
    isConnected: connectionConfig.isConnected,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 lg:p-6 flex gap-4 lg:gap-6">
        {/* Main Canvas Area */}
        <div className="flex-1 panel-border rounded-lg overflow-hidden">
          <DrawingCanvas 
            waypoints={waypoints} 
            onWaypointsChange={setWaypoints}
            length={workspaceLength}
            breadth={workspaceBreadth}
          />
        </div>
        
        {/* Side Panel */}
        <div className="w-72 lg:w-80 flex flex-col gap-4">
          <DimensionConfig
            length={workspaceLength}
            breadth={workspaceBreadth}
            onLengthChange={setWorkspaceLength}
            onBreadthChange={setWorkspaceBreadth}
          />
          
          <ConnectionPanel
            config={connectionConfig}
            onConfigChange={setConnectionConfig}
            onConnect={handleConnect}
          />
          
          <ControlPanel
            waypoints={waypoints}
            isConnected={connectionConfig.isConnected}
            onClear={handleClear}
            connectionConfig={connectionConfig}
            isTransmitting={isTransmitting}
            currentWaypointIndex={currentWaypointIndex}
            onStartTransmission={startTransmission}
            onStopTransmission={stopTransmission}
          />
          
          <div className="flex-1 min-h-0">
            <WaypointsList waypoints={waypoints} />
          </div>
        </div>
      </main>
      
      {/* Status Bar */}
      <footer className="panel-border border-t border-border px-6 py-2">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>Canvas: Draw path to generate waypoints</span>
          <span>{waypoints.length} waypoints queued</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
