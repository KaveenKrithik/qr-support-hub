import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, AlertCircle, Search, PlusCircle, Loader2, AlertTriangle, ActivitySquare } from "lucide-react";
import { fetchStudentRequests, fetchAllDepartments, createRequest } from "@/services/api";
import { Request, RequestStatus, Department } from "@/types";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract department ID from URL query if it exists (from QR scan)
  const urlParams = new URLSearchParams(location.search);
  const deptFromQr = urlParams.get('dept');
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // New request form state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestContent, setNewRequestContent] = useState("");
  const [newRequestDepartment, setNewRequestDepartment] = useState(deptFromQr || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch departments and requests
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch departments
        const deptData = await fetchAllDepartments();
        setDepartments(deptData);
        
        // If there's a department from QR code, find the matching department ID
        if (deptFromQr) {
          const matchingDept = deptData.find(dept => 
            dept.name.toLowerCase().replace(/\s+/g, '-') === deptFromQr.toLowerCase()
          );
          
          if (matchingDept) {
            setNewRequestDepartment(matchingDept.id);
            setIsNewRequestOpen(true);
          }
        }
        
        // Fetch student requests if user is logged in
        if (user?.id) {
          const requestData = await fetchStudentRequests(user.id);
          
          // Convert string dates to Date objects
          const formattedRequests = requestData.map(req => ({
            ...req,
            createdAt: new Date(req.created_at || Date.now()),
            updatedAt: new Date(req.updated_at || Date.now()),
            // Map 'in_progress' status to 'active' for display purposes
            status: req.status === 'in_progress' ? 'active' as RequestStatus : req.status
          }));
          
          setRequests(formattedRequests);
          setFilteredRequests(formattedRequests);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, deptFromQr, toast]);

  // Filter requests based on search and status
  useEffect(() => {
    let filtered = [...requests];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        req => req.title.toLowerCase().includes(query) || 
               req.content.toLowerCase().includes(query) || 
               (req.department?.toLowerCase() || "").includes(query)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(req => {
        // Handle 'in_progress' status from API as 'active' for filtering
        const displayStatus = req.status === 'in_progress' ? 'active' : req.status;
        return displayStatus === filterStatus;
      });
    }
    
    setFilteredRequests(filtered);
  }, [filterStatus, searchQuery, requests]);

  const handleSubmitNewRequest = async () => {
    if (!newRequestTitle.trim() || !newRequestContent.trim() || !newRequestDepartment) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields for your request",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a request",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the request in the database
      const newRequest = await createRequest({
        title: newRequestTitle,
        content: newRequestContent,
        department_id: newRequestDepartment,
        sender_id: user.id,
        media: [] // Empty media array by default
      });
      
      // Add the new request to the UI
      const formattedRequest = {
        ...newRequest,
        createdAt: new Date(newRequest.created_at || Date.now()),
        updatedAt: new Date(newRequest.updated_at || Date.now()),
        status: newRequest.status as RequestStatus
      };
      
      setRequests(prev => [formattedRequest, ...prev]);
      setFilteredRequests(prev => [formattedRequest, ...prev]);
      
      toast({
        title: "Request submitted",
        description: "Your support request has been submitted successfully.",
      });
      
      // Reset form
      setIsNewRequestOpen(false);
      setNewRequestTitle("");
      setNewRequestContent("");
      setNewRequestDepartment("");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequestStatus | string) => {
    // Convert 'in_progress' status to 'active' for display
    const displayStatus = status === 'in_progress' ? 'active' as const : status;
    
    switch (displayStatus) {
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

  const handleViewDetails = (requestId: string) => {
    navigate(`/requests/${requestId}`);
  };
  
  // Stats calculation
  const pendingCount = requests.filter(req => req.status === "pending").length;
  const activeCount = requests.filter(req => req.status === "in_progress").length;
  const resolvedCount = requests.filter(req => req.status === "resolved").length;
  const escalatedCount = requests.filter(req => req.status === "escalated").length;

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Escalated Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{escalatedCount}</div>
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
              <TabsTrigger value="escalated" onClick={() => setFilterStatus("escalated")}>Escalated</TabsTrigger>
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
              <Card 
                key={request.id} 
                className={`border-l-4 ${
                  request.status === "pending" ? "border-l-yellow-400" : 
                  request.status === "in_progress" ? "border-l-blue-400" : 
                  request.status === "resolved" ? "border-l-green-400" : "border-l-red-400"
                }`}
                onClick={() => handleViewDetails(request.id)}
                role="button"
                style={{ cursor: 'pointer' }}
              >
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
                      {new Date(request.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Request:</p>
                    <p className="line-clamp-2">{request.content}</p>
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
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
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