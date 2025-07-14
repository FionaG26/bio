import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusDashboard } from "@/components/status-dashboard";
import { MonitoringSettings } from "@/components/monitoring-settings";
import { ActivityLog } from "@/components/activity-log";
import { SystemInfo } from "@/components/system-info";
import { useWebSocket } from "@/hooks/use-websocket";
import { useNotifications } from "@/lib/notifications";
import { IdCard } from "lucide-react";

export default function Dashboard() {
  const { isConnected } = useWebSocket();
  const { requestPermission } = useNotifications();

  const { data: monitoringStatus } = useQuery({
    queryKey: ["/api/monitoring/status"],
    refetchInterval: 5000,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/system/stats"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <IdCard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">US Visa Monitor</h1>
                <p className="text-sm text-gray-600">Nairobi Embassy Appointment Tracker</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? "System Online" : "System Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <StatusDashboard monitoringStatus={monitoringStatus} />
          </div>
          <div className="space-y-6">
            <SystemInfo stats={systemStats} />
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MonitoringSettings />
        </div>

        {/* Activity Log */}
        <div className="mb-8">
          <ActivityLog />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 rounded-lg">
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Disclaimer</h4>
                <p className="text-sm text-gray-600">
                  This tool is for monitoring assistance only. Users must book appointments through official channels. Automated booking is prohibited.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="https://ais.usvisa-info.com/en-ke/niv" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                      Official Embassy Website
                    </a>
                  </li>
                  <li>
                    <a href="https://travel.state.gov/content/travel/en/us-visas.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                      Visa Application Guide
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
                <p className="text-sm text-gray-600">
                  For technical issues or questions about this monitoring tool, please contact support.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
              <p>&copy; 2025 US Visa Appointment Monitor. Built for educational and assistance purposes.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
