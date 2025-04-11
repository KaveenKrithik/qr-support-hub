import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertCircle, Search, PlusCircle, Loader2, AlertTriangle, ActivitySquare } from "lucide-react";

// Mock data types
type RequestStatus = "pending" | "active" | "resolved" | "rejected";

type Request = {
  id: string;
  title: string;
  content: string;
  department: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  response?: string;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  // Extract department ID from URL query if it exists (from QR scan)
  const urlParams = new URLSearchParams(location.search);
  const deptFromQr = urlParams.get('dept');
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // New request form state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestContent, setNewRequestContent] = useState("");
  const [newRequestDepartment, setNewRequestDepartment] = useState(deptFromQr || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Departments (mock data)
  const departments = [
    "Computer Science", 
    "Civil Engineering",
    "Mechanical Engineering", 
    "Electronics",
    "Biomedical",
    "Chemical Engineering",
    "Library",
    "Placement Office"
  ];

  // Mock loading requests
  useEffect(() => {
    // This would be replaced with a real API call
    setTimeout(() => {
      const mockRequests: Request[] = [
        {
          id: "req1",
          title: "Attendance correction request",
          content: "I need to correct my attendance for CS101 on May 5th. I was present but marked absent.",
          department: "Computer Science",
          status: "pending",
          createdAt: new Date(2025, 3, 8),
          updatedAt: new Date(2025, 3, 8),
        },
        {
          id: "req2",
          title: "Issue with lab manual",
          content: "There's a contradiction between lab manual page 25 and 32. Can someone clarify which procedure to follow?",
          department: "Computer Science",
          status: "active",
          response: "I'll check the lab manual and get back to you with the correct information.",
          createdAt: new Date(2025, 3, 6),
          updatedAt: new Date(2025, 3, 7),
        },
        {
          id: "req3",
          title: "Request for software installation",
          content: "I need MATLAB installed on my lab computer for my project work.",
          department: "Computer Science",
          status: "resolved",
          response: "The software has been installed. Please check and let me know if you need any assistance.",
          createdAt: new Date(2025, 3, 2),
          updatedAt: new Date(2025, 3, 4),
        },
        {
          id: "req4",
          title: "Need assignment extension",
          content: "Due to health issues, I need an extension for the database assignment due this Friday.",
          department: "Computer Science",
          status: "rejected",
          response: "Extension cannot be granted as it would conflict with the final submission deadline. Please try to submit as much as you can.",
          createdAt: new Date(2025, 3, 5),
          updatedAt: new Date(2025, 3, 6),
        },
      ];
      
      setRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setIsLoading(false);
      
      // If there's a department from QR code, open the new request dialog
      if (deptFromQr) {
        // Find the department name from the ID
        const departmentName = departments.find(dept => dept.toLowerCase().replace(/\s+/g, '-') === deptFromQr);
        if (departmentName) {
          setNewRequestDepartment(departmentName);
          setIsNewRequestOpen(true);
        }
      }
    }, 1500);
  }, [deptFromQr, departments]);

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = [...requests];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        req => req.title.toLowerCase().includes(query) || 
               req.content.toLowerCase().includes(query) || 
               req.department.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    
    setFilteredRequests(filtered);
  }, [filterStatus, searchQuery, requests]);

  const handleSubmitNewRequest = () => {
    if (!newRequestTitle.trim() || !newRequestContent.trim() || !newRequestDepartment) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields for your request",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call - would be replaced with a real API call
    setTimeout(() => {
      const newRequest: Request = {
        id: `req${requests.length + 1}`,
        title: newRequestTitle,
        content: newRequestContent,
        department: newRequestDepartment,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setRequests([newRequest, ...requests]);
      setFilteredRequests([newRequest, ...filteredRequests]);
      
      setIsSubmitting(false);
      setIsNewRequestOpen(false);
      setNewRequestTitle("");
      setNewRequestContent("");
      setNewRequestDepartment(deptFromQr || "");
      
      toast({
        title: "Request submitted",
        description: "Your support request has been submitted successfully.",
      });
    }, 1000);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Stats calculation
  const pendingCount = requests.filter(req => req.status === "pending").length;
  const activeCount = requests.filter(req => req.status === "active").length;
  const resolvedCount = requests.filter(req => req.status === "resolved").length;
  const rejectedCount = requests.filter(req => req.status === "rejected").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and submit support requests
          </p>
        </div>
        <Button onClick={() => setIsNewRequestOpen(true)} className="self-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{pendingCount}</div>
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
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <ActivitySquare className="h-4 w-4" />
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
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <div className="rounded-full bg-red-100 p-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>All</TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>Pending</TabsTrigger>
              <TabsTrigger value="active" onClick={() => setFilterStatus("active")}>Active</TabsTrigger>
              <TabsTrigger value="resolved" onClick={() => setFilterStatus("resolved")}>Resolved</TabsTrigger>
              <TabsTrigger value="rejected" onClick={() => setFilterStatus("rejected")}>Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : filterStatus !== "all" 
                    ? `You don't have any ${filterStatus} requests` 
                    : "You haven't submitted any requests yet"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button onClick={() => setIsNewRequestOpen(true)} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit a request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className={`border-l-4 ${
                request.status === "pending" ? "border-l-yellow-400" : 
                request.status === "active" ? "border-l-blue-400" : 
                request.status === "resolved" ? "border-l-green-400" : "border-l-red-400"
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{request.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Your Request:</p>
                      <p>{request.content}</p>
                    </div>
                    
                    {request.response && (
                      <div className="bg-muted rounded-md p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Response from Staff:</p>
                        <p>{request.response}</p>
                      </div>
                    )}
                    
                    {request.status === "resolved" && (
                      <Button variant="outline" className="w-full">
                        Submit Feedback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* New Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submit a new support request</DialogTitle>
            <DialogDescription>
              Fill in the details below to submit your request. You'll be notified when you receive a response.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Request Title</label>
              <Input 
                id="title" 
                placeholder="Brief description of your issue" 
                value={newRequestTitle}
                onChange={(e) => setNewRequestTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">Department</label>
              <select 
                id="department"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newRequestDepartment}
                onChange={(e) => setNewRequestDepartment(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Request Details</label>
              <Textarea 
                id="content" 
                placeholder="Please provide a detailed description of your issue or request" 
                className="min-h-[150px]"
                value={newRequestContent}
                onChange={(e) => setNewRequestContent(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewRequest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;