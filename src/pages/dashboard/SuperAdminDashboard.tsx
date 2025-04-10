import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { User, Filter, Search, Activity, CheckCircle, Clock, Files, AlertCircle, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  total: number;
  pending: number;
  active: number;
  resolved: number;
  escalated: number;
  departmentCount: number;
  adminCount: number;
}

// Request type definition
type RequestStatus = "pending" | "active" | "resolved" | "escalated";

interface Request {
  id: string;
  title: string;
  content: string;
  department: string;
  student: {
    id: string;
    name: string;
    department: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    department: string;
  };
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  responses?: {
    id: string;
    text: string;
    sender: {
      id: string;
      name: string;
      role: string;
    };
    timestamp: Date;
  }[];
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<Error | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [currentFilter, setCurrentFilter] = useState("all");

  useEffect(() => {
    // Fetch stats (mock data)
    setTimeout(() => {
      setStats({
        total: 78,
        pending: 15,
        active: 27,
        resolved: 30,
        escalated: 6,
        departmentCount: 8,
        adminCount: 12
      });
      setIsStatsLoading(false);
    }, 1000);

    // Fetch requests (mock data)
    setTimeout(() => {
      const mockRequests: Request[] = [
        {
          id: "req1",
          title: "Attendance correction request",
          content: "I need to correct my attendance for CS101 on May 5th. I was present but marked absent.",
          department: "Computer Science",
          student: {
            id: "stud1",
            name: "Rahul Sharma",
            department: "Computer Science"
          },
          assignedTo: {
            id: "adm1",
            name: "Dr. John Smith",
            department: "Computer Science"
          },
          status: "active",
          createdAt: new Date(2025, 3, 8),
          updatedAt: new Date(2025, 3, 9),
          responses: [
            {
              id: "resp1",
              text: "I'll check the attendance records and get back to you.",
              sender: {
                id: "adm1",
                name: "Dr. John Smith",
                role: "admin"
              },
              timestamp: new Date(2025, 3, 9)
            }
          ]
        },
        {
          id: "req2",
          title: "Issue with lab equipment",
          content: "The microscope in Biology Lab 2 isn't working properly.",
          department: "Biology",
          student: {
            id: "stud2",
            name: "Priya Patel",
            department: "Biology"
          },
          status: "pending",
          createdAt: new Date(2025, 3, 9),
          updatedAt: new Date(2025, 3, 9)
        },
        {
          id: "req3",
          title: "Need assignment extension",
          content: "Due to health issues, I need an extension for the mechanical design assignment.",
          department: "Mechanical Engineering",
          student: {
            id: "stud3",
            name: "Amit Kumar",
            department: "Mechanical Engineering"
          },
          assignedTo: {
            id: "adm2",
            name: "Dr. Robert Chen",
            department: "Mechanical Engineering"
          },
          status: "resolved",
          createdAt: new Date(2025, 3, 5),
          updatedAt: new Date(2025, 3, 7),
          responses: [
            {
              id: "resp2",
              text: "Please submit a medical certificate and I'll approve your extension.",
              sender: {
                id: "adm2",
                name: "Dr. Robert Chen",
                role: "admin"
              },
              timestamp: new Date(2025, 3, 6)
            },
            {
              id: "resp3",
              text: "Thank you, I have attached the medical certificate.",
              sender: {
                id: "stud3",
                name: "Amit Kumar",
                role: "student"
              },
              timestamp: new Date(2025, 3, 6)
            },
            {
              id: "resp4",
              text: "Extension approved for one week. Please submit by next Friday.",
              sender: {
                id: "adm2",
                name: "Dr. Robert Chen",
                role: "admin"
              },
              timestamp: new Date(2025, 3, 7)
            }
          ]
        },
        {
          id: "req4",
          title: "Library book return extension",
          content: "I need to extend the return date for the borrowed books due to lockdown restrictions.",
          department: "Library",
          student: {
            id: "stud4",
            name: "Neha Singh",
            department: "Computer Science"
          },
          assignedTo: {
            id: "adm3",
            name: "Ms. Sarah Johnson",
            department: "Library"
          },
          status: "escalated",
          createdAt: new Date(2025, 3, 7),
          updatedAt: new Date(2025, 3, 8),
          responses: [
            {
              id: "resp5",
              text: "I need approval from the head librarian for this. Will escalate your request.",
              sender: {
                id: "adm3",
                name: "Ms. Sarah Johnson",
                role: "admin"
              },
              timestamp: new Date(2025, 3, 8)
            }
          ]
        }
      ];
      
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
    }, 1500);
  }, []);

  // Filter requests based on search query and status filter
  useEffect(() => {
    let filtered = [...requests];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        req => req.title.toLowerCase().includes(query) || 
               req.content.toLowerCase().includes(query) || 
               req.department.toLowerCase().includes(query) ||
               req.student.name.toLowerCase().includes(query)
      );
    }
    
    if (currentFilter !== "all") {
      filtered = filtered.filter(req => req.status === currentFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchQuery, currentFilter, requests]);

  const handleViewRequest = (requestId: string) => {
    navigate(`/dashboard/requests/${requestId}`);
  };

  const handleReassignRequest = (requestId: string) => {
    // This would be replaced with actual reassignment logic
    toast({
      title: "Request reassigned",
      description: "An admin will be assigned to handle this request soon."
    });
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case "escalated":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Escalated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Comprehensive view of the SRM Support Hub system</p>
      </div>
      
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                <Files className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
              <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats?.active || 0}</div>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>All Support Requests</CardTitle>
            <CardDescription>
              Manage and monitor all requests across departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all" onClick={() => setCurrentFilter("all")}>All</TabsTrigger>
                  <TabsTrigger value="pending" onClick={() => setCurrentFilter("pending")}>Pending</TabsTrigger>
                  <TabsTrigger value="active" onClick={() => setCurrentFilter("active")}>Active</TabsTrigger>
                  <TabsTrigger value="resolved" onClick={() => setCurrentFilter("resolved")}>Resolved</TabsTrigger>
                  <TabsTrigger value="escalated" onClick={() => setCurrentFilter("escalated")}>Escalated</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No requests found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search query" 
                    : `There are no ${currentFilter !== "all" ? currentFilter : ""} requests at the moment.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className={`h-1 w-full ${
                      request.status === "pending" ? "bg-yellow-400" :
                      request.status === "active" ? "bg-blue-500" :
                      request.status === "resolved" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium">{request.title}</CardTitle>
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            {getStatusBadge(request.status)}
                            <Badge variant="outline">{request.department}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {request.student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>Student: {request.student.name}</span>
                      </div>
                      
                      <p className="text-sm line-clamp-2 text-muted-foreground mb-4">
                        {request.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {request.assignedTo ? (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Assigned to: {request.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-yellow-600">Not assigned</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleViewRequest(request.id)}>
                            View Details
                          </Button>
                          {!request.assignedTo && (
                            <Button size="sm" variant="outline" onClick={() => handleReassignRequest(request.id)}>
                              Assign Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>
              Summary of departments and administration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Departments</h4>
                <span className="font-bold">{stats?.departmentCount || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-srmblue" style={{ width: `${stats?.departmentCount ? (stats.departmentCount / 10) * 100 : 0}%` }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Admin Staff</h4>
                <span className="font-bold">{stats?.adminCount || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-srmblue" style={{ width: `${stats?.adminCount ? (stats.adminCount / 20) * 100 : 0}%` }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Response Rate</h4>
                <span className="font-bold">87%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '87%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Resolution Time</h4>
                <span className="font-bold">1.8 days</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-srmaccent" style={{ width: '65%' }} />
              </div>
            </div>
            
            <Button className="w-full" variant="outline">View Detailed Reports</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
