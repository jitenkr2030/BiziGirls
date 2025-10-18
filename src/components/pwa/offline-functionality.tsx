"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  CloudDownload,
  CloudUpload
} from "lucide-react";

interface OfflineData {
  cachedPages: string[];
  pendingSyncs: number;
  lastSync: string;
  storageUsed: number;
  storageLimit: number;
}

export default function OfflineFunctionality() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    cachedPages: [],
    pendingSyncs: 0,
    lastSync: new Date().toISOString(),
    storageUsed: 0,
    storageLimit: 50 * 1024 * 1024, // 50MB
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load offline data
    loadOfflineData();

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      // Simulate loading offline data
      const mockData: OfflineData = {
        cachedPages: ["/", "/dashboard", "/courses", "/profile"],
        pendingSyncs: 3,
        lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        storageUsed: 15 * 1024 * 1024, // 15MB
        storageLimit: 50 * 1024 * 1024, // 50MB
      };
      setOfflineData(mockData);
    } catch (error) {
      console.error("Failed to load offline data:", error);
    }
  };

  const syncOfflineData = async () => {
    setSyncInProgress(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Register background sync
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("sync-forms");
      }

      setOfflineData(prev => ({
        ...prev,
        pendingSyncs: 0,
        lastSync: new Date().toISOString()
      }));

      // Show success notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Sync Complete", {
          body: "All offline data has been synchronized successfully",
          icon: "/logo.svg"
        });
      }
    } catch (error) {
      console.error("Failed to sync offline data:", error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const clearOfflineData = async () => {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setOfflineData(prev => ({
        ...prev,
        cachedPages: [],
        storageUsed: 0
      }));

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Offline Data Cleared", {
          body: "All cached data has been cleared",
          icon: "/logo.svg"
        });
      }
    } catch (error) {
      console.error("Failed to clear offline data:", error);
    }
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offline Functionality</h2>
          <p className="text-muted-foreground">Manage offline access and synchronization</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You're Offline</AlertTitle>
          <AlertDescription>
            You're currently offline. Some features may be limited. Your data will be synchronized when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cached Pages</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineData.cachedPages.length}</div>
            <p className="text-xs text-muted-foreground">Pages available offline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Syncs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineData.pendingSyncs}</div>
            <p className="text-xs text-muted-foreground">Actions to sync</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <CloudDownload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatStorage(offlineData.storageUsed)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatStorage(offlineData.storageLimit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(offlineData.lastSync).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(offlineData.lastSync).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Actions</CardTitle>
            <CardDescription>Manage offline data and synchronization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={syncOfflineData} 
                disabled={!isOnline || syncInProgress}
                className="w-full"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                {syncInProgress ? "Syncing..." : "Sync Offline Data"}
              </Button>
              
              <Button 
                onClick={clearOfflineData} 
                variant="outline"
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Clear Offline Data
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.ready.then(registration => {
                      registration.showNotification("Test Notification", {
                        body: "This is a test notification",
                        icon: "/logo.svg"
                      });
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            </div>

            {offlineData.pendingSyncs > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Pending Syncs</AlertTitle>
                <AlertDescription>
                  You have {offlineData.pendingSyncs} actions that need to be synchronized when you're online.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Cached Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Cached Pages</CardTitle>
            <CardDescription>Pages available for offline access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {offlineData.cachedPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{page}</span>
                  </div>
                  <Badge variant="outline">Cached</Badge>
                </div>
              ))}
              
              {offlineData.cachedPages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No pages cached for offline access
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle>PWA Features</CardTitle>
          <CardDescription>Progressive Web App capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded">
              <div className="flex-shrink-0">
                <Wifi className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Offline Access</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Background Sync</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded">
              <div className="flex-shrink-0">
                <CloudDownload className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {Notification.permission === "granted" ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded">
              <div className="flex-shrink-0">
                <RefreshCw className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">Auto Updates</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}