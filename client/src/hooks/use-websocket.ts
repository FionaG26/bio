import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/lib/notifications";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { showNotification, playSound } = useNotifications();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
      
      // Authenticate with user ID (in a real app, this would come from auth)
      wsRef.current?.send(JSON.stringify({
        type: "auth",
        userId: 1,
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "appointment_check":
            if (data.data.isAvailable) {
              showNotification("Appointment Available!", "Check the official website to book your appointment.");
              playSound();
            }
            queryClient.invalidateQueries({ queryKey: ["/api/monitoring/status"] });
            queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
            break;
            
          case "monitoring_started":
          case "monitoring_stopped":
            queryClient.invalidateQueries({ queryKey: ["/api/monitoring/status"] });
            queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
            break;
            
          case "settings_updated":
            queryClient.invalidateQueries({ queryKey: ["/api/monitoring/settings"] });
            break;
            
          case "logs_cleared":
            queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
            break;
            
          default:
            console.log("Unknown WebSocket message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    sendMessage,
  };
}
