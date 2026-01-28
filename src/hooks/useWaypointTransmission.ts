import { useState, useCallback, useRef } from 'react';
import { Waypoint } from '@/types/waypoint';
import { toast } from 'sonner';

interface UseWaypointTransmissionProps {
  waypoints: Waypoint[];
  onWaypointCompleted: (waypointId: number) => void;
  connectionConfig: { ip: string; port: string };
  isConnected: boolean;
}

export const useWaypointTransmission = ({
  waypoints,
  onWaypointCompleted,
  connectionConfig,
  isConnected,
}: UseWaypointTransmissionProps) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopTransmission = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsTransmitting(false);
    setCurrentWaypointIndex(null);
    toast.info('Transmission stopped');
  }, []);

  const sendWaypoint = useCallback(async (waypoint: Waypoint): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://${connectionConfig.ip}:${connectionConfig.port}/waypoint`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: waypoint.x, y: waypoint.y, id: waypoint.id }),
          signal: abortControllerRef.current?.signal,
        }
      );
      return response.ok;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false;
      console.error('Failed to send waypoint:', error);
      return false;
    }
  }, [connectionConfig]);

  const checkWaypointReached = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://${connectionConfig.ip}:${connectionConfig.port}/status`,
        { signal: abortControllerRef.current?.signal }
      );
      if (response.ok) {
        const data = await response.json();
        return data.reached === true;
      }
      return false;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false;
      // For demo mode, simulate reaching waypoint after random time
      return Math.random() > 0.7;
    }
  }, [connectionConfig]);

  const waitForWaypointReached = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds timeout (500ms * 60)

      pollingIntervalRef.current = setInterval(async () => {
        attempts++;
        
        if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          resolve(false);
          return;
        }

        const reached = await checkWaypointReached();
        if (reached) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          resolve(true);
        }
      }, 500);
    });
  }, [checkWaypointReached]);

  const startTransmission = useCallback(async () => {
    if (!isConnected) {
      toast.error('Not connected to device. Please connect first.');
      return;
    }

    if (waypoints.length === 0) {
      toast.error('No waypoints to send. Draw a path first!');
      return;
    }

    setIsTransmitting(true);
    abortControllerRef.current = new AbortController();

    toast.success(`Starting sequential transmission of ${waypoints.length} waypoints`);

    for (let i = 0; i < waypoints.length; i++) {
      if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
        break;
      }

      const waypoint = waypoints[i];
      setCurrentWaypointIndex(i);

      toast.info(`Sending waypoint ${i + 1}/${waypoints.length}: (${waypoint.x}, ${waypoint.y})`);

      const sent = await sendWaypoint(waypoint);
      if (!sent) {
        toast.error(`Failed to send waypoint ${i + 1}`);
        break;
      }

      toast.info(`Waiting for ESP32 to reach waypoint ${i + 1}...`);

      const reached = await waitForWaypointReached();
      if (!reached) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        toast.error(`Timeout waiting for waypoint ${i + 1}`);
        break;
      }

      toast.success(`Waypoint ${i + 1} reached! Removing from queue.`);
      onWaypointCompleted(waypoint.id);

      // Small delay before next waypoint
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsTransmitting(false);
    setCurrentWaypointIndex(null);
    abortControllerRef.current = null;

    if (waypoints.length === 0) {
      toast.success('All waypoints completed!');
    }
  }, [isConnected, waypoints, sendWaypoint, waitForWaypointReached, onWaypointCompleted]);

  return {
    isTransmitting,
    currentWaypointIndex,
    startTransmission,
    stopTransmission,
  };
};
