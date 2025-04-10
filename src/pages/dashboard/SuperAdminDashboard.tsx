
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  MessageCircle, 
  Star, 
  Users, 
  PlusCircle,
  Building,
  UserPlus,
  User,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Mock data types
type RequestStatus = "pending" | "active" | "resolved" | "escalated";

type Request = {
  id: string;
  title: string;
  content: string;
  student: {
    id: string;
    name: string;
    department: string;
  };
  department: string;
  status: RequestStatus;
  assignedTo?: {
    id: string;
    name: string;
    department: string;
  };
  response?: string;
  createdAt: Date;
  updatedAt: Date;
  rating?: {
    stars: number;
    comment?: string;
  };
};

type Department = {
  id: string;
  name: string;
  adminCount: number;
  requestCount: number;
  resolvedRate: number;
};

type Admin = {
  id: string;
  name: string;
  email: string;
  department: string;
  duties: string;
  qualifications: string;
  requestsHandled: number;
  averageRating: number;
};

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isResponding, setIsResponding] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    resolved: 0,
    escalated: 0,
    adminCount: 0,
    departmentCount: 0,
  });
  const [newDepartment, setNewDepartment] = useState("");
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    department: "",
    duties: "",
    qualifications: "",
  });
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  
  // Mock loading data
  useEffect(() => {
    // This would be replaced with real API calls
    const mockRequests: Request[] = [
      {
        id: "req1",
        title: "Attendance correction request",
        content: "I need to correct my attendance for CS101 on May 5th. I was present but marked absent.",
        student: {
          id: "stud1",
          name: "Rahul Sharma",
          department: "Computer Science"
        },
        department: "Computer Science",
        status: "pending",
        createdAt: new Date(2025, 3, 8),
        updatedAt: new Date(2025, 3, 8),
      },
      {
        id: "req2",
        title: "OD request for technical symposium",
        content: "I need OD for attending the technical symposium on April 15-16.",
        student: {
          id: "stud2",
          name: "Priya Patel",
          department: "Mechanical Engineering"
        },
        department: "OD Processing",
        status: "escalated",
        assignedTo: {
          id: "admin3",
          name: "Dr. Anjali Mehta",
          department: "OD Processing"
        },
        response: "This request needs additional approval. I've escalated it to the superadmin.",
        createdAt: new Date(2025, 3, 6),
        updatedAt: new Date(2025, 3, 7),
      },
      {
        id: "req3",
        title: "Lab equipment issue",
        content: "The oscilloscope in Electrical Lab 2 is not working properly.",
        student: {
          id: "stud3",
          name: "Vikram Singh",
          department: "Electrical Engineering"
        },
        department: "Electrical Engineering",
        status: "escalated",
        assignedTo: {
          id: "admin4",
          name: "Prof. Ramesh Kumar",
          department: "Electrical Engineering"
        },
        response: "We need budget approval to repair this equipment. Escalated to management.",
        createdAt: new Date(2025, 3, 4),
        updatedAt: new Date(2025, 3, 5),
      },
      {
        id: "req4",
        title: "Exam schedule conflict",
        content: "There's a schedule clash between two of my exams on May 12th.",
        student: {
          id: "stud4",
          name: "Ahmed Khan",
          department: "Civil Engineering"
        },
        department: "OD Processing",
        status: "active",
        assignedTo: {
          id: "admin3",
          name: "Dr. Anjali Mehta",
          department: "OD Processing"
        },
        response: "I'm looking into this and will coordinate with the exam cell.",
        createdAt: new Date(2025, 3, 2),
        updatedAt: new Date(2025, 3, 3),
      },
    ];
    
    const mockDepartments: Department[] = [
      {
        id: "dept1",
        name: "Computer Science",
        adminCount: 3,
        requestCount: 45,
        resolvedRate: 85,
      },
      {
        id: "dept2",
        name: "Mechanical Engineering",
        adminCount: 2,
        requestCount: 32,
        resolvedRate: 78,
      },
      {
        id: "dept3",
        name: "Civil Engineering",
        adminCount: 2,
        requestCount: 28,
        resolvedRate: 82,
      },
      {
        id: "dept4",
        name: "Electrical Engineering",
        adminCount: 3,
        requestCount: 36,
        resolvedRate: 75,
      },
      {
        id: "dept5",
        name: "OD Processing",
        adminCount: 4,
        requestCount: 94,
        resolvedRate: 90,
      },
    ];
    
    const mockAdmins: Admin[] = [
      {
        id: "admin1",
        name: "Dr. John Smith",
        email: "john.smith@srmist.edu.in",
        department: "Computer Science",
        duties: "Handle student queries related to programming labs and assignments",
        qualifications: "Ph.D. in Computer Science, 8 years teaching experience",
        requestsHandled: 28,
        averageRating: 4.7,
      },
      {
        id: "admin2",
        name: "Prof. Sarah Johnson",
        email: "sarah.johnson@srmist.edu.in",
        department: "Computer Science",
        duties: "Manage course registration issues and curriculum queries",
        qualifications: "M.Tech in Computer Science, 5 years teaching experience",
        requestsHandled: 35,
        averageRating: 4.2,
      },
      {
        id: "admin3",
        name: "Dr. Anjali Mehta",
        email: "anjali.mehta@srmist.edu.in",
        department: "OD Processing",
        duties: "Handle all OD requests and approval process",
        qualifications: "Ph.D. in Education Management, 10 years administrative experience",
        requestsHandled: 62,
        averageRating: 4.8,
      },
      {
        id: "admin4",
        name: "Prof. Ramesh Kumar",
        email: "ramesh.kumar@srmist.edu.in",
        department: "Electrical Engineering",
        duties: "Manage lab equipment issues and student technical queries",
        qualifications: "M.Tech in Electrical Engineering, 7 years teaching experience",
        requestsHandled: 41,
        averageRating: 4.5,
      },
    ];
    
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
    setDepartments(mockDepartments);
    setAdmins(mockAdmins);
    
    // Calculate stats
    setStats({
      total: mockRequests.length,
      pending: mockRequests.filter(req => req.status === "pending").length,
      active: mockRequests.filter(req => req.status === "active").length,
      resolved: mockRequests.filter(req => req.status === "resolved").length,
      escalated: mockRequests.filter(req => req.status === "escalated").length,
      adminCount: mockAdmins.length,
      departmentCount: mockDepartments.length,
    });
  }, []);
  
  // Filter requests when filter criteria change
  useEffect(() => {
    let filtered = [...requests];
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    if (filterDepartment !== "all") {
      filtered = filtered.filter(req => req.department === filterDepartment);
    }
    
    setFilteredRequests(filtered);
  }, [filterStatus, filterDepartment, requests]);
  
  const handleResponseChange = (requestId: string, value: string) => {
    setResponses({ ...responses, [requestId]: value });
  };
  
  const handleSubmitResponse = (requestId: string) => {
    const response = responses[requestId];
    
    if (!response?.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }
    
    setIsResponding({ ...isResponding, [requestId]: true });
    
    // This would be replaced with a real API call
    setTimeout(() => {
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: "active",
              response,
              updatedAt: new Date()
            }
          : req
      );
      
      setRequests(updatedRequests);
      setResponses({ ...responses, [requestId]: "" });
      setIsResponding({ ...isResponding, [requestId]: false });
      
      toast({
        title: "Response sent",
        description: "Your response has been sent to the student.",
      });
      
      // Update stats
      const stats = updatedRequests.reduce((acc, req) => {
        acc[req.status]++;
        return acc;
      }, { pending: 0, active: 0, resolved: 0, escalated: 0, total: updatedRequests.length, adminCount: admins.length, departmentCount: departments.length });
      
      setStats(stats);
      
    }, 1000);
  };
  
  const handleReassignRequest = (requestId: string, adminId: string) => {
    // This would be replaced with a real API call
    const selectedAdmin = admins.find(admin => admin.id === adminId);
    
    if (!selectedAdmin) return;
    
    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            assignedTo: {
              id: selectedAdmin.id,
              name: selectedAdmin.name,
              department: selectedAdmin.department
            },
            updatedAt: new Date()
          }
        : req
    );
    
    setRequests(updatedRequests);
    
    toast({
      title: "Request reassigned",
      description: `The request has been reassigned to ${selectedAdmin.name}.`,
    });
  };
  
  const handleCreateDepartment = () => {
    if (!newDepartment.trim()) {
      toast({
        title: "Department name required",
        description: "Please enter a department name",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingDepartment(true);
    
    // This would be replaced with a real API call
    setTimeout(() => {
      const newDept: Department = {
        id: `dept_${Math.random().toString(36).substring(2, 9)}`,
        name: newDepartment.trim(),
        adminCount: 0,
        requestCount: 0,
        resolvedRate: 0,
      };
      
      setDepartments([...departments, newDept]);
      setNewDepartment("");
      setIsCreatingDepartment(false);
      setStats({
        ...stats,
        departmentCount: stats.departmentCount + 1
      });
      
      toast({
        title: "Department created",
        description: `${newDepartment} department has been created successfully.`,
      });
    }, 1000);
  };
  
  const handleCreateAdmin = () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.department.trim() || !newAdmin.duties.trim() || !newAdmin.qualifications.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!newAdmin.email.endsWith("@srmist.edu.in")) {
      toast({
        title: "Invalid email",
        description: "Please use an SRM Institute email (@srmist.edu.in)",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingAdmin(true);
    
    // This would be replaced with a real API call
    setTimeout(() => {
      const admin: Admin = {
        id: `admin_${Math.random().toString(36).substring(2, 9)}`,
        name: newAdmin.name,
        email: newAdmin.email,
        department: newAdmin.department,
        duties: newAdmin.duties,
        qualifications: newAdmin.qualifications,
        requestsHandled: 0,
        averageRating: 0,
      };
      
      setAdmins([...admins, admin]);
      setNewAdmin({
        name: "",
        email: "",
        department: "",
        duties: "",
        qualifications: "",
      });
      setIsCreatingAdmin(false);
      setStats({
        ...stats,
        adminCount: stats.adminCount + 1
      });
      
      toast({
        title: "Admin created",
        description: `${newAdmin.name} has been added as an admin. They will receive an invitation email.`,
      });
    }, 1500);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage departments, admins, and handle escalated support requests
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="rounded-full bg-srmblue-light p-2 text-white">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Escalated Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.escalated}</div>
              <div className="rounded-full bg-red-100 p-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.departmentCount}</div>
              <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                <Building className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.adminCount}</div>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-6">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterStatus === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button 
                variant={filterStatus === "escalated" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("escalated")}
              >
                Escalated
              </Button>
              <Button 
                variant={filterStatus === "pending" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </Button>
            </div>
            
            <div className="flex gap-2">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No requests found</h3>
                <p className="mt-2 text-muted-foreground">
                  There are no {filterStatus !== "all" ? filterStatus : ""} requests 
                  {filterDepartment !== "all" ? ` in ${filterDepartment}` : ""} at the moment.
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className={`border-l-4 ${request.status === "escalated" ? "border-l-red-500" : "border-l-srmblue"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">{request.department}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {request.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          From: {request.student.name} ({request.student.department})
                        </span>
                      </div>
                      
                      {request.assignedTo && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            Assigned to: {request.assignedTo.name} ({request.assignedTo.department})
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                Reassign
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Reassign to</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {admins.map((admin) => (
                                <DropdownMenuItem
                                  key={admin.id}
                                  onClick={() => handleReassignRequest(request.id, admin.id)}
                                >
                                  {admin.name} ({admin.department})
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Request:</p>
                        <p>{request.content}</p>
                      </div>
                      
                      {request.response && (
                        <div className="bg-muted rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {request.assignedTo?.name?.substring(0, 2).toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {request.assignedTo?.name || "Staff"}
                            </span>
                          </div>
                          <p className="text-sm">{request.response}</p>
                        </div>
                      )}
                      
                      {(request.status === "escalated" || request.status === "pending") && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label htmlFor={`response-${request.id}`} className="text-sm font-medium">
                              Your Response:
                            </label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Assign
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {departments.map(dept => (
                                  <DropdownMenuItem key={dept.id} className="px-4 py-2 font-medium">
                                    {dept.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                {admins.map(admin => (
                                  <DropdownMenuItem 
                                    key={admin.id}
                                    onClick={() => handleReassignRequest(request.id, admin.id)} 
                                    className="px-4 py-2"
                                  >
                                    {admin.name} ({admin.department})
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <Textarea
                            id={`response-${request.id}`}
                            placeholder="Type your response here..."
                            value={responses[request.id] || ""}
                            onChange={(e) => handleResponseChange(request.id, e.target.value)}
                          />
                          <Button
                            onClick={() => handleSubmitResponse(request.id)}
                            disabled={isResponding[request.id]}
                          >
                            {isResponding[request.id] ? (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 animate-spin"
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
                                Sending...
                              </>
                            ) : (
                              "Send Response"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Departments</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                    Add a new department to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="departmentName">Department Name</Label>
                    <Input
                      id="departmentName"
                      placeholder="e.g., Computer Science"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit" 
                    onClick={handleCreateDepartment} 
                    disabled={isCreatingDepartment}
                  >
                    {isCreatingDepartment ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
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
                        Creating...
                      </>
                    ) : (
                      "Create Department"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map(dept => (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle>{dept.name}</CardTitle>
                  <CardDescription>
                    {dept.adminCount} admins • {dept.requestCount} requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolution Rate</span>
                      <span className="font-medium">{dept.resolvedRate}%</span>
                    </div>
                    <Progress value={dept.resolvedRate} />
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="admins" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admins</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                  <DialogDescription>
                    Create a new admin account. They will receive an email invitation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="adminName">Full Name</Label>
                      <Input
                        id="adminName"
                        placeholder="Full Name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="name@srmist.edu.in"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminDepartment">Department</Label>
                    <select
                      id="adminDepartment"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newAdmin.department}
                      onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminDuties">Duties</Label>
                    <Textarea
                      id="adminDuties"
                      placeholder="Describe the admin's duties"
                      value={newAdmin.duties}
                      onChange={(e) => setNewAdmin({ ...newAdmin, duties: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminQualifications">Qualifications</Label>
                    <Textarea
                      id="adminQualifications"
                      placeholder="List the admin's qualifications"
                      value={newAdmin.qualifications}
                      onChange={(e) => setNewAdmin({ ...newAdmin, qualifications: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit" 
                    onClick={handleCreateAdmin} 
                    disabled={isCreatingAdmin}
                  >
                    {isCreatingAdmin ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
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
                        Creating...
                      </>
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search admins..." className="pl-8" />
            </div>
          </div>
          
          <div className="space-y-6">
            {admins.map(admin => (
              <Card key={admin.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{admin.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{admin.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Requests Handled</p>
                        <p className="font-medium">{admin.requestsHandled}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{admin.averageRating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 text-srmaccent"
                                fill={star <= Math.round(admin.averageRating) ? "#FF9F1C" : "none"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Duties</p>
                      <p className="text-sm">{admin.duties}</p>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
