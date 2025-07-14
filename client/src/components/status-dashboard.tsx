import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/lib/notifications";
import { CalendarX, Clock, AlertCircle, RefreshCw, ExternalLink, Bell, Play, Square } from "lucide-react";

interface StatusDashboardProps {
  monitoringStatus: any;
}

export function StatusDashboard({ monitoringStatus }: StatusDashboardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { showNotification, playSound } = useNotifications();

  const manualCheckMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/monitoring/check"),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Check Complete",
        description: data.message,
        variant: data.isAvailable ? "default" : "destructive",
      });
      
      if (data.isAvailable) {
        showNotification("Appointment Available!", "Check the official website to book your appointment.");
        playSound();
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
    },
    onError: (error) => {
      toast({
        title: "Check Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startMonitoringMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/monitoring/start"),
    onSuccess: () => {
      toast({
        title: "Monitoring Started",
        description: "Automatic appointment monitoring is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/status"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Monitoring",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopMonitoringMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/monitoring/stop"),
    onSuccess: () => {
      toast({
        title: "Monitoring Stopped",
        description: "Automatic appointment monitoring has been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/status"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Stop Monitoring",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testNotificationsMutation = useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      showNotification("Test Notification", "This is a test notification from your US Visa Monitor.");
      playSound();
      toast({
        title: "Test Notification Sent",
        description: "Check your notifications to see if they're working.",
      });
    },
  });

  const handleOpenOfficialSite = () => {
    window.open("https://ais.usvisa-info.com/en-ke/niv", "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "appointments_available":
        return "border-green-200 bg-green-50";
      case "no_appointments":
        return "border-red-200 bg-red-50";
      case "error":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "appointments_available":
        return <Bell className="h-5 w-5 text-green-600" />;
      case "no_appointments":
        return <CalendarX className="h-5 w-5 text-red-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "appointments_available":
        return "Appointments Available";
      case "no_appointments":
        return "No Appointments Available";
      case "error":
        return "Error Checking Appointments";
      default:
        return "Checking...";
    }
  };

  const lastCheck = monitoringStatus?.recentChecks?.[0];
  const isActive = monitoringStatus?.isActive || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>
              {lastCheck ? `Last checked: ${new Date(lastCheck.checkTime).toLocaleString()}` : "Never checked"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`rounded-lg p-4 border ${getStatusColor(lastCheck?.status || "")}`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  {getStatusIcon(lastCheck?.status || "")}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getStatusMessage(lastCheck?.status || "")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {lastCheck?.message || "No recent checks"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg p-4 border ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                  <Clock className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isActive ? "Monitoring Active" : "Monitoring Inactive"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isActive ? "Automatic checking enabled" : "Manual checking only"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  This tool provides manual monitoring assistance only. Users must verify availability and book appointments through official channels. Automated booking is prohibited and may result in access restrictions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => manualCheckMutation.mutate()}
              disabled={manualCheckMutation.isPending}
              className="flex items-center justify-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${manualCheckMutation.isPending ? 'animate-spin' : ''}`} />
              {manualCheckMutation.isPending ? "Checking..." : "Manual Check"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleOpenOfficialSite}
              className="flex items-center justify-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Official Site
            </Button>
            
            <Button
              variant="outline"
              onClick={() => testNotificationsMutation.mutate()}
              disabled={testNotificationsMutation.isPending}
              className="flex items-center justify-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>

            {isActive ? (
              <Button
                variant="destructive"
                onClick={() => stopMonitoringMutation.mutate()}
                disabled={stopMonitoringMutation.isPending}
                className="flex items-center justify-center"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Monitoring
              </Button>
            ) : (
              <Button
                onClick={() => startMonitoringMutation.mutate()}
                disabled={startMonitoringMutation.isPending}
                className="flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
