import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function MonitoringSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [emailAddress, setEmailAddress] = useState("fionamuthoni18@gmail.com");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["/api/monitoring/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/monitoring/settings", data),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your monitoring settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/monitoring/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => apiRequest("POST", "/api/notifications/test/email", { email }),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: data.success ? "Email Test Successful" : "Email Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Email Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testTelegramMutation = useMutation({
    mutationFn: (data: { botToken: string; chatId: string }) => 
      apiRequest("POST", "/api/notifications/test/telegram", data),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: data.success ? "Telegram Test Successful" : "Telegram Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Telegram Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateSettings = (field: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [field]: value,
    };
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleSaveNotificationSettings = () => {
    const updatedSettings = {
      ...settings,
      emailAddress,
      telegramBotToken,
      telegramChatId,
    };
    updateSettingsMutation.mutate(updatedSettings);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="checkInterval">Check Interval</Label>
            <Select
              value={settings?.checkInterval?.toString() || "60"}
              onValueChange={(value) => handleUpdateSettings("checkInterval", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Every 30 seconds</SelectItem>
                <SelectItem value="60">Every 60 seconds</SelectItem>
                <SelectItem value="120">Every 2 minutes</SelectItem>
                <SelectItem value="300">Every 5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="visaType">Visa Type</Label>
            <Select
              value={settings?.visaType || "B1B2"}
              onValueChange={(value) => handleUpdateSettings("visaType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1B2">B1/B2 Tourist/Business</SelectItem>
                <SelectItem value="F1">F1 Student</SelectItem>
                <SelectItem value="H1B">H1B Work</SelectItem>
                <SelectItem value="J1">J1 Exchange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="soundAlerts">Enable Sound Alerts</Label>
            <Switch
              id="soundAlerts"
              checked={settings?.soundAlerts || false}
              onCheckedChange={(checked) => handleUpdateSettings("soundAlerts", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="browserNotifications">Browser Notifications</Label>
            <Switch
              id="browserNotifications"
              checked={settings?.browserNotifications || false}
              onCheckedChange={(checked) => handleUpdateSettings("browserNotifications", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <Switch
              id="emailNotifications"
              checked={settings?.emailNotifications || false}
              onCheckedChange={(checked) => handleUpdateSettings("emailNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emailAddress">Email Notifications</Label>
            <div className="flex gap-2">
              <Input
                id="emailAddress"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="fionamuthoni18@gmail.com"
              />
              <Button
                variant="outline"
                onClick={() => testEmailMutation.mutate(emailAddress)}
                disabled={testEmailMutation.isPending || !emailAddress}
              >
                Test
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
            <Input
              id="telegramBotToken"
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="Bot token for Telegram notifications"
            />
          </div>
          
          <div>
            <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
            <div className="flex gap-2">
              <Input
                id="telegramChatId"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="Your Telegram chat ID"
              />
              <Button
                variant="outline"
                onClick={() => testTelegramMutation.mutate({ botToken: telegramBotToken, chatId: telegramChatId })}
                disabled={testTelegramMutation.isPending || !telegramBotToken || !telegramChatId}
              >
                Test
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleSaveNotificationSettings}
            disabled={updateSettingsMutation.isPending}
            className="w-full"
          >
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
