import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Clock, Filter, MessageCircle, User, Star } from "lucide-react";
import { 
  fetchRequests, 
  fetchUserProfile, 
  createMessage, 
  updateRequest, 
  fetchRatingsForAdmin, 
  fetchAllAdmins 
} from "@/services/api";
import { Request, RequestStatus, Profile } from "@/types";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isResponding, setIsResponding] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, Profile>>({});
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    resolved: 0,
    escalated: 0,
  });
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [adminList, setAdminList] = useState<Profile[]>([]);
  const [reassigningRequestId, setReassigningRequestId] = useState<string | null>(null);
  
  // Fetch requests and ratings
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        return;
      }
      
      try {
        // Fetch requests assigned to this admin or unassigned requests in admin's department
        const options = {
          adminId: user.id,
          departmentId: user.department_id
        };
        
        const requestsData = await fetchRequests(user.id, options);
        
        // Format requests and filter only relevant ones
        const formattedRequests = requestsData
          .filter(req => req.department_id === user.department_id || req.receiver_id === user.id)
          .map(req => ({
            ...req,
            createdAt: new Date(req.created_at || Date.now()),
            updatedAt: new Date(req.updated_at || Date.now()),
            // Map 'in_progress' status to 'active' for display purposes
            status: req.status === 'in_progress' ? 'active' as RequestStatus : req.status,
            content: req.content || "",
            title: req.title || "Untitled Request"
          }));
        
        setRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
        
        // Fetch student profiles for each request
        const uniqueStudentIds = Array.from(new Set(formattedRequests.map(req => req.sender_id)));
        const profilesMap: Record<string, Profile> = {};
        
        for (const studentId of uniqueStudentIds) {
          try {
            const profile = await fetchUserProfile(studentId);
            if (profile) {
              profilesMap[studentId] = profile;
            }
          } catch (error) {
            console.error(`Error fetching profile for student ${studentId}:`, error);
          }
        }
        
        setStudentProfiles(profilesMap);
        
        // Calculate stats
        const statsData = {
          pending: formattedRequests.filter(req => req.status === 'pending').length,
          active: formattedRequests.filter(req => req.status === ('active' as RequestStatus) || req.status === 'in_progress').length,
          resolved: formattedRequests.filter(req => req.status === 'resolved').length,
          escalated: formattedRequests.filter(req => req.status === 'escalated').length,
        };
        
        setStats(statsData);
        
        // Fetch ratings for this admin
        const ratingsData = await fetchRatingsForAdmin(user.id);
        
        if (ratingsData.length > 0) {
          const avgRating = ratingsData.reduce((sum, rating) => sum + rating.stars, 0) / ratingsData.length;
          setAverageRating(parseFloat(avgRating.toFixed(1)));
        }
        
        // Fetch admin list for reassignment
        const adminsData = await fetchAllAdmins();
        setAdminList(adminsData.filter(admin => admin.id !== user.id));
        
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, toast]);
  
  // Filter requests based on status tab
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => {
        const displayStatus = req.status === 'in_progress' ? 'active' : req.status;
        return displayStatus === filterStatus;
      }));
    }
  }, [filterStatus, requests]);
  
  const handleResponseChange = (requestId: string, value: string) => {
    setResponses({ ...responses, [requestId]: value });
  };
  
  const handleSubmitResponse = async (requestId: string) => {
    const response = responses[requestId];
    
    if (!response?.trim() || !user?.id) {
      toast({
        title: "Response required",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }
    
    setIsResponding({ ...isResponding, [requestId]: true });
    
    try {
      // First, create a message with the response
      await createMessage({
        content: response,
        request_id: requestId,
        sender_id: user.id,
        attachments: []
      });
      
      // Get the request we're responding to
      const currentRequest = requests.find(req => req.id === requestId);
      
      // If it's a pending request, update status to in_progress and assign to this admin
      if (currentRequest && currentRequest.status === 'pending') {
        await updateRequest(requestId, {
          status: 'in_progress' as RequestStatus,
          receiver_id: user.id
        });
      }
      
      // Update UI with new request data
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: req.status === "pending" ? "active" as RequestStatus : req.status,
              updatedAt: new Date()
            }
          : req
      );
      
      setRequests(updatedRequests);
      
      // Clear response text
      setResponses({ ...responses, [requestId]: "" });
      setIsResponding({ ...isResponding, [requestId]: false });
      
      toast({
        title: "Response sent",
        description: "Your response has been sent to the student.",
      });
      
      // Update stats
      const updatedStats = {
        pending: updatedRequests.filter(req => req.status === 'pending').length,
        active: updatedRequests.filter(req => req.status === ('active' as RequestStatus) || req.status === 'in_progress').length,
        resolved: updatedRequests.filter(req => req.status === 'resolved').length,
        escalated: updatedRequests.filter(req => req.status === 'escalated').length,
      };
      
      setStats(updatedStats);
      
    } catch (error) {
      console.error("Error submitting response:", error);
      setIsResponding({ ...isResponding, [requestId]: false });
      
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleReassignRequest = async (requestId: string, newAdminId?: string) => {
    if (!newAdminId) {
      setReassigningRequestId(requestId);
      return;
    }
    
    try {
      // Update the request in the database with new assigned admin
      await updateRequest(requestId, {
        receiver_id: newAdminId
      });
      
      // Update UI by removing this request
      const updatedRequests = requests.filter(req => req.id !== requestId);
      setRequests(updatedRequests);
      setFilteredRequests(prevFiltered => prevFiltered.filter(req => req.id !== requestId));
      
      // Reset reassigning state
      setReassigningRequestId(null);
      
      // Update stats
      const updatedStats = {
        pending: updatedRequests.filter(req => req.status === 'pending').length,
        active: updatedRequests.filter(req => req.status === ('active' as RequestStatus) || req.status === 'in_progress').length,
        resolved: updatedRequests.filter(req => req.status === 'resolved').length,
        escalated: updatedRequests.filter(req => req.status === 'escalated').length,
      };
      
      setStats(updatedStats);
      
      toast({
        title: "Request reassigned",
        description: "The request has been reassigned to another administrator.",
      });
    } catch (error) {
      console.error("Error reassigning request:", error);
      toast({
        title: "Error",
        description: "Failed to reassign request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelReassign = () => {
    setReassigningRequestId(null);
  };

  const getStatusBadge = (status: RequestStatus | string) => {
    // Handle in_progress status from API
    const displayStatus = status === 'in_progress' ? 'active' : status;
    
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
  
  const handleViewRequest = (requestId: string) => {
    navigate(`/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to student support requests
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pending}</div>
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
              <div className="text-2xl font-bold">{stats.active}</div>
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
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {averageRating !== null ? averageRating : "N/A"}
              </div>
              <div className="rounded-full bg-srmaccent-light p-2 text-srmaccent-dark">
                <Star className="h-4 w-4" fill="#F27200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>All Requests</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>Pending</TabsTrigger>
            <TabsTrigger value="active" onClick={() => setFilterStatus("active")}>Active</TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setFilterStatus("resolved")}>Resolved</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Support Requests</CardTitle>
              <CardDescription>
                {filterStatus === "all" 
                  ? "All requests assigned to you" 
                  : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} requests`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No requests found</h3>
                    <p className="mt-2 text-muted-foreground">
                      There are no {filterStatus !== "all" ? filterStatus : ""} requests at the moment.
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card 
                      key={request.id} 
                      className="border-l-4 border-l-srmblue mb-4"
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
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-4 w-4" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          {studentProfiles[request.sender_id] && (
                            <div className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {studentProfiles[request.sender_id].name?.substring(0, 2).toUpperCase() || 'ST'}
                                </AvatarFallback>
                              </Avatar>
                              <span>From: {studentProfiles[request.sender_id].name}</span>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Request:</p>
                            <p className="line-clamp-3">{request.content}</p>
                          </div>
                          
                          {reassigningRequestId === request.id ? (
                            <div className="space-y-2 border p-4 rounded-md">
                              <p className="text-sm font-medium">Reassign to another administrator:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {adminList.map(admin => (
                                  <Button
                                    key={admin.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReassignRequest(request.id, admin.id)}
                                  >
                                    {admin.name}
                                  </Button>
                                ))}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCancelReassign}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button onClick={() => handleViewRequest(request.id)}>
                                View Details
                              </Button>
                              
                              {(request.status === "pending" || request.status === "in_progress") && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleReassignRequest(request.id)}
                                >
                                  Reassign
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {(["pending", "active", "in_progress"].includes(request.status === "in_progress" ? "active" : request.status)) && !reassigningRequestId && (
                            <div className="space-y-2 border-t pt-4 mt-4">
                              <label htmlFor={`response-${request.id}`} className="text-sm font-medium">
                                Quick Response:
                              </label>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          {/* Content is filtered by the useEffect */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests waiting for your action</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure as "all" tab */}
              <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
                    <p className="mt-2 text-muted-foreground">
                      There are no pending requests at the moment.
                    </p>
                  </div>
                ) : (
                  /* Same card structure as above */
                  <div className="space-y-4">
                    {/* Cards render here by the filteredRequests state */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Active Requests</CardTitle>
              <CardDescription>Requests you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure as other tabs */}
              <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No active requests</h3>
                    <p className="mt-2 text-muted-foreground">
                      You don't have any active requests at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cards render here by the filteredRequests state */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Requests</CardTitle>
              <CardDescription>Requests you've successfully completed</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same content structure as other tabs */}
              <div className="space-y-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No resolved requests</h3>
                    <p className="mt-2 text-muted-foreground">
                      You don't have any resolved requests at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cards render here by the filteredRequests state */}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
