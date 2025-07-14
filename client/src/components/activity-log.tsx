import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, CheckCircle, AlertCircle, Bell, Trash2 } from "lucide-react";

export function ActivityLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: logs } = useQuery({
    queryKey: ["/api/activity-logs"],
    refetchInterval: 5000,
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/activity-logs"),
    onSuccess: () => {
      toast({
        title: "Activity Log Cleared",
        description: "All activity logs have been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Clear Logs",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "manual_check":
      case "check_result":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "monitoring_started":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "monitoring_stopped":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "appointment_found":
        return <Bell className="h-4 w-4 text-green-600" />;
      case "check_error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearLogsMutation.mutate()}
            disabled={clearLogsMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Log
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{log.message}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activity logs yet</p>
              <p className="text-sm">Start monitoring to see activity logs here</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
