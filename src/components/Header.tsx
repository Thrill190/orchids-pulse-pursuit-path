import React from 'react';
import { Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="panel-border border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-mono text-xl font-bold text-foreground text-glow tracking-tight">
            PULSE PURSUIT
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            ESP32 Waypoint Controller
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
