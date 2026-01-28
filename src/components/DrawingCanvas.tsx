import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Waypoint } from '@/types/waypoint';

interface DrawingCanvasProps {
  onWaypointsChange: (waypoints: Waypoint[]) => void;
  waypoints: Waypoint[];
  length: number; // X-axis dimension in cm
  breadth: number; // Y-axis dimension in cm
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onWaypointsChange, waypoints, length, breadth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Convert canvas pixel coordinates to real-world 1st quadrant coordinates
  const pixelToReal = useCallback((pixelX: number, pixelY: number, canvasWidth: number, canvasHeight: number) => {
    const realX = (pixelX / canvasWidth) * length;
    const realY = ((canvasHeight - pixelY) / canvasHeight) * breadth; // Flip Y for 1st quadrant
    return {
      x: Math.round(realX * 10) / 10, // Round to 1 decimal
      y: Math.round(realY * 10) / 10
    };
  }, [length, breadth]);

  // Convert real-world coordinates back to canvas pixels for display
  const realToPixel = useCallback((realX: number, realY: number, canvasWidth: number, canvasHeight: number) => {
    const pixelX = (realX / length) * canvasWidth;
    const pixelY = canvasHeight - ((realY / breadth) * canvasHeight); // Flip Y for 1st quadrant
    return { x: pixelX, y: pixelY };
  }, [length, breadth]);

    const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
      ctx.lineWidth = 1;
      
      const gridSize = 20;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Major grid lines
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
      for (let x = 0; x <= width; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Main Axes
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, height);
      ctx.stroke();

      // Draw Ticks and Labels
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = '#0ea5e9';
      ctx.textAlign = 'center';
      
      // X-axis ticks
      const xStep = length / 5;
      for (let i = 0; i <= 5; i++) {
        const xVal = xStep * i;
        const pixel = realToPixel(xVal, 0, width, height);
        
        ctx.beginPath();
        ctx.moveTo(pixel.x, height);
        ctx.lineTo(pixel.x, height - 5);
        ctx.stroke();
        
        ctx.fillText(`${Math.round(xVal)}`, pixel.x, height - 10);
      }
      
      // Y-axis ticks
      ctx.textAlign = 'left';
      const yStep = breadth / 5;
      for (let i = 0; i <= 5; i++) {
        const yVal = yStep * i;
        const pixel = realToPixel(0, yVal, width, height);
        
        ctx.beginPath();
        ctx.moveTo(0, pixel.y);
        ctx.lineTo(5, pixel.y);
        ctx.stroke();
        
        if (i > 0) { // Skip origin for Y label to avoid overlap
          ctx.fillText(`${Math.round(yVal)}`, 8, pixel.y + 3);
        }
      }

      // X-axis unit label
      ctx.textAlign = 'right';
      ctx.fillText(`${length} cm`, width - 10, height - 10);
      
      // Y-axis unit label
      ctx.save();
      ctx.translate(25, 10);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'right';
      ctx.fillText(`${breadth} cm`, 0, 0);
      ctx.restore();

      // Origin label
      ctx.textAlign = 'left';
      ctx.fillText('Origin (0,0)', 10, height - 25);
    }, [length, breadth, realToPixel]);

    const drawWaypoints = useCallback((ctx: CanvasRenderingContext2D, points: Waypoint[], canvasWidth: number, canvasHeight: number) => {
      // Draw distance line from origin to first waypoint
      if (points.length > 0) {
        const firstPoint = points[0];
        const pixel = realToPixel(firstPoint.x, firstPoint.y, canvasWidth, canvasHeight);
        const origin = realToPixel(0, 0, canvasWidth, canvasHeight);

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(pixel.x, pixel.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Distance text
        const distance = Math.sqrt(firstPoint.x * firstPoint.x + firstPoint.y * firstPoint.y);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${distance.toFixed(1)} cm from origin`, (origin.x + pixel.x) / 2, (origin.y + pixel.y) / 2 - 10);
      }

      points.forEach((point, index) => {
      // Convert real coordinates to pixel coordinates for drawing
      const pixel = realToPixel(point.x, point.y, canvasWidth, canvasHeight);
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.fill();

      // Inner circle
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.fill();

      // Center dot
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Coordinate label (real coordinates)
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}: (${point.x}, ${point.y})`, pixel.x, pixel.y - 18);
    });
  }, [realToPixel]);

    const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: { x: number; y: number }[]) => {
      if (path.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'hsl(222, 47%, 4%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height);
    drawPath(ctx, currentPath);
    drawWaypoints(ctx, waypoints, canvas.width, canvas.height);
  }, [currentPath, waypoints, drawGrid, drawPath, drawWaypoints]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redraw]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setCurrentPath([pos]);
    onWaypointsChange([]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPath(prev => [...prev, pos]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Extract waypoints from path (sample every N points)
    if (currentPath.length > 0) {
      const sampleRate = Math.max(1, Math.floor(currentPath.length / 20));
      const sampledPoints: Waypoint[] = [];
      
      for (let i = 0; i < currentPath.length; i += sampleRate) {
        const realCoords = pixelToReal(
          currentPath[i].x,
          currentPath[i].y,
          canvas.width,
          canvas.height
        );
        sampledPoints.push({
          id: sampledPoints.length + 1,
          x: realCoords.x,
          y: realCoords.y
        });
      }
      
      // Always include the last point
      const lastPoint = currentPath[currentPath.length - 1];
      const lastRealCoords = pixelToReal(lastPoint.x, lastPoint.y, canvas.width, canvas.height);
      
      if (sampledPoints.length === 0 || 
          sampledPoints[sampledPoints.length - 1].x !== lastRealCoords.x ||
          sampledPoints[sampledPoints.length - 1].y !== lastRealCoords.y) {
        sampledPoints.push({
          id: sampledPoints.length + 1,
          x: lastRealCoords.x,
          y: lastRealCoords.y
        });
      }
      
      onWaypointsChange(sampledPoints);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full drawing-cursor rounded-lg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default DrawingCanvas;
