export interface Waypoint {
  id: number;
  x: number;
  y: number;
}

export interface ConnectionConfig {
  ip: string;
  port: string;
  isConnected: boolean;
}
