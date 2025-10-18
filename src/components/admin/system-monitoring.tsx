"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick,
  Thermometer
} from "lucide-react";

interface SystemStatus {
  status: "healthy" | "warning" | "critical";
  uptime: string;
  lastCheck: string;
}

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
  load: number;
}

interface DatabaseMetrics {
  connections: number;
  queries: number;
  slowQueries: number;
  size: number;
  status: "healthy" | "warning" | "critical";
}

interface ServiceStatus {
  name: string;
  status: "running" | "stopped" | "error";
  responseTime: number;
  uptime: string;
  lastCheck: string;
}

interface AlertLog {
  id: string;
  type: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  service: string;
  resolved: boolean;
}

export default function SystemMonitoring() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: "healthy",
    uptime: "99.9%",
    lastCheck: new Date().toISOString()
  });
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: {
      incoming: 1250000,
      outgoing: 850000
    },
    load: 1.2
  });
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
    connections: 23,
    queries: 15420,
    slowQueries: 2,
    size: 2.4,
    status: "healthy"
  });
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Web Server",
      status: "running",
      responseTime: 45,
      uptime: "15d 4h",
      lastCheck: new Date().toISOString()
    },
    {
      name: "Database",
      status: "running",
      responseTime: 12,
      uptime: "30d 2h",
      lastCheck: new Date().toISOString()
    },
    {
      name: "API Gateway",
      status: "running",
      responseTime: 28,
      uptime: "15d 4h",
      lastCheck: new Date().toISOString()
    },
    {
      name: "Cache Server",
      status: "running",
      responseTime: 8,
      uptime: "15d 4h",
      lastCheck: new Date().toISOString()
    },
    {
      name: "Email Service",
      status: "running",
      responseTime: 156,
      uptime: "15d 4h",
      lastCheck: new Date().toISOString()
    }
  ]);
  const [alerts, setAlerts] = useState<AlertLog[]>([
    {
      id: "1",
      type: "warning",
      message: "High CPU usage detected on web server",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      service: "Web Server",
      resolved: false
    },
    {
      id: "2",
      type: "info",
      message: "Database backup completed successfully",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      service: "Database",
      resolved: true
    },
    {
      id: "3",
      type: "error",
      message: "Failed to connect to payment gateway",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      service: "Payment Service",
      resolved: true
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update metrics with random variations
      setServerMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 2)),
        network: {
          incoming: prev.network.incoming + (Math.random() - 0.5) * 100000,
          outgoing: prev.network.outgoing + (Math.random() - 0.5) * 100000
        },
        load: Math.max(0, prev.load + (Math.random() - 0.5) * 0.2)
      }));

      setDatabaseMetrics(prev => ({
        ...prev,
        connections: Math.max(0, prev.connections + Math.floor((Math.random() - 0.5) * 5)),
        queries: prev.queries + Math.floor(Math.random() * 100),
        slowQueries: Math.max(0, prev.slowQueries + Math.floor((Math.random() - 0.5) * 2))
      }));

      setSystemStatus(prev => ({
        ...prev,
        lastCheck: new Date().toISOString()
      }));

      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(1, service.responseTime + (Math.random() - 0.5) * 20),
        lastCheck: new Date().toISOString()
      })));

    } catch (error) {
      console.error("Failed to fetch system data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
      case "error":
      case "stopped":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
      case "error":
      case "stopped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Monitor system health, performance, and services</p>
        </div>
        <Button onClick={fetchSystemData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemStatus.status}</div>
            <p className="text-xs text-muted-foreground">Uptime: {systemStatus.uptime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverMetrics.cpu.toFixed(1)}%</div>
            <Progress value={serverMetrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverMetrics.memory.toFixed(1)}%</div>
            <Progress value={serverMetrics.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverMetrics.disk.toFixed(1)}%</div>
            <Progress value={serverMetrics.disk} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Server Metrics</CardTitle>
                <CardDescription>Real-time server performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">{serverMetrics.cpu.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics.cpu} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">{serverMetrics.memory.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics.memory} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm font-medium">{serverMetrics.disk.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics.disk} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Load Average</span>
                    <span className="text-sm font-medium">{serverMetrics.load.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(100, serverMetrics.load * 25)} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Network In</p>
                    <p className="font-medium">{formatBytes(serverMetrics.network.incoming)}/s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Network Out</p>
                    <p className="font-medium">{formatBytes(serverMetrics.network.outgoing)}/s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Metrics</CardTitle>
                <CardDescription>Database performance and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(databaseMetrics.status)}
                    <Badge variant={databaseMetrics.status === "healthy" ? "default" : "destructive"}>
                      {databaseMetrics.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Connections</p>
                    <p className="text-2xl font-bold">{databaseMetrics.connections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Queries/sec</p>
                    <p className="text-2xl font-bold">{databaseMetrics.queries}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slow Queries</p>
                  <p className={`text-lg font-medium ${databaseMetrics.slowQueries > 5 ? "text-red-500" : "text-green-500"}`}>
                    {databaseMetrics.slowQueries}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Database Size</p>
                  <p className="text-lg font-medium">{databaseMetrics.size} GB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Response: {service.responseTime}ms | Uptime: {formatUptime(service.uptime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        service.status === "running" ? "default" : 
                        service.status === "error" ? "destructive" : "secondary"
                      }>
                        {service.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={alert.resolved ? "opacity-50" : ""}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span className="capitalize">{alert.type}</span>
                      <Badge variant={alert.resolved ? "secondary" : "destructive"}>
                        {alert.resolved ? "Resolved" : "Active"}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <div className="mt-2">
                        <p>{alert.message}</p>
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>Service: {alert.service}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system logs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">System Logs</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  System logs viewer will be implemented here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}