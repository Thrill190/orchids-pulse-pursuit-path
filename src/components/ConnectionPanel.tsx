import React from 'react';
import { ConnectionConfig } from '@/types/waypoint';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Settings } from 'lucide-react';

interface ConnectionPanelProps {
  config: ConnectionConfig;
  onConfigChange: (config: ConnectionConfig) => void;
  onConnect: () => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ config, onConfigChange, onConnect }) => {
  return (
    <div className="panel-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-primary" />
        <h3 className="font-mono text-sm font-semibold text-foreground">CONNECTION</h3>
        <div className={`ml-auto flex items-center gap-2 text-xs font-mono ${config.isConnected ? 'text-success' : 'text-muted-foreground'}`}>
          {config.isConnected ? (
            <>
              <Wifi className="w-3 h-3 status-pulse" />
              <span>CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>DISCONNECTED</span>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            RPi Zero 2W IP Address
          </label>
          <Input
            type="text"
            placeholder="192.168.1.100"
            value={config.ip}
            onChange={(e) => onConfigChange({ ...config, ip: e.target.value })}
            className="font-mono text-sm bg-input border-border"
          />
        </div>
        
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            Port
          </label>
          <Input
            type="text"
            placeholder="8080"
            value={config.port}
            onChange={(e) => onConfigChange({ ...config, port: e.target.value })}
            className="font-mono text-sm bg-input border-border"
          />
        </div>
        
        <Button
          variant={config.isConnected ? "outline" : "default"}
          className="w-full font-mono"
          onClick={onConnect}
        >
          {config.isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </div>
  );
};

export default ConnectionPanel;
