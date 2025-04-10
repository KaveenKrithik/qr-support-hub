import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/api";
import { Activity, CheckCircle, Clock, Files } from "lucide-react";

interface DashboardStats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
  escalated: number;
  departmentCount: number;
  adminCount: number;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error: any) {
        setStatsError(error);
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, variant = "default" }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    variant?: "default" | "outline" | "secondary";
  }) => (
    <Card className={`shadow-sm border-0 ${variant === 'outline' ? 'bg-transparent' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the SRM Support Hub</p>
      </div>
      
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Overview of all requests</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isStatsLoading ? (
              <div className="flex justify-center py-8">
                <svg
                  className="h-12 w-12 animate-spin text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  title="Total" 
                  value={stats?.total || 0}
                  icon={<Files className="h-5 w-5" />}
                />
                <StatCard 
                  title="Pending" 
                  value={stats?.pending || 0}
                  icon={<Clock className="h-5 w-5" />}
                  variant="outline"
                />
                <StatCard 
                  title="Active" 
                  value={stats?.active || 0}
                  icon={<Activity className="h-5 w-5" />}
                  variant="default"
                />
                <StatCard 
                  title="Resolved" 
                  value={stats?.resolved || 0}
                  icon={<CheckCircle className="h-5 w-5" />}
                  variant="secondary"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Number of departments</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isStatsLoading ? (
              <div className="flex justify-center py-8">
                <svg
                  className="h-12 w-12 animate-spin text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <div className="text-4xl font-bold">{stats?.departmentCount || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Number of administrators</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isStatsLoading ? (
              <div className="flex justify-center py-8">
                <svg
                  className="h-12 w-12 animate-spin text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <div className="text-4xl font-bold">{stats?.adminCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
