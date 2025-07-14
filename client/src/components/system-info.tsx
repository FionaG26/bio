import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface SystemInfoProps {
  stats: any;
}

export function SystemInfo({ stats }: SystemInfoProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const calculateUptime = () => {
    if (!stats) return "0%";
    const total = stats.totalChecks || 0;
    const successful = stats.successfulChecks || 0;
    const errors = stats.errorCount || 0;
    
    if (total === 0) return "0%";
    return `${(((total - errors) / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats ? formatNumber(stats.totalChecks) : "0"}
              </div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculateUptime()}
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {stats ? formatTime(stats.averageResponseTime) : "0ms"}
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats ? formatNumber(stats.errorCount) : "0"}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance & Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Rate Limiting</h4>
                <p className="text-sm text-gray-600">Respects embassy website rate limits</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Manual Verification</h4>
                <p className="text-sm text-gray-600">Requires user verification for appointments</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Terms Compliance</h4>
                <p className="text-sm text-gray-600">Follows embassy website terms of service</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
