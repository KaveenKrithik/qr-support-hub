import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth"; // Updated import path
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Clock, Filter, MessageCircle, User, Star } from "lucide-react";

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
  response?: string;
  createdAt: Date;
  updatedAt: Date;
  rating?: {
    stars: number;
    comment?: string;
  };
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isResponding, setIsResponding] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    resolved: 0,
    escalated: 0,
  });
  const [averageRating, setAverageRating] = useState<number | null>(null);
  
  // Mock loading requests
  useEffect(() => {
    // This would be replaced with a real API call
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
        title: "Issue with lab manual",
        content: "There's a contradiction in lab manual page 25 and 32. Can someone clarify which procedure to follow?",
        student: {
          id: "stud2",
          name: "Priya Patel",
          department: "Computer Science"
        },
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
        student: {
          id: "stud3",
          name: "Amit Kumar",
          department: "Computer Science"
        },
        department: "Computer Science",
        status: "resolved",
        response: "The software has been installed. Please check and let me know if you need any assistance.",
        createdAt: new Date(2025, 3, 2),
        updatedAt: new Date(2025, 3, 4),
        rating: {
          stars: 5,
          comment: "Very prompt response and resolution, thank you!"
        }
      },
      {
        id: "req4",
        title: "Need assignment extension",
        content: "Due to health issues, I need an extension for the database assignment due this Friday.",
        student: {
          id: "stud4",
          name: "Neha Singh",
          department: "Computer Science"
        },
        department: "Computer Science",
        status: "escalated",
        response: "This needs approval from the course coordinator. I've forwarded your request.",
        createdAt: new Date(2025, 3, 5),
        updatedAt: new Date(2025, 3, 6),
      },
    ];
    
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
    
    // Calculate stats
    const stats = mockRequests.reduce((acc, req) => {
      acc[req.status]++;
      return acc;
    }, { pending: 0, active: 0, resolved: 0, escalated: 0 });
    
    setStats(stats);
    
    // Calculate average rating
    const ratings = mockRequests
      .filter(req => req.rating)
      .map(req => req.rating!.stars);
      
    if (ratings.length > 0) {
      const avg = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      setAverageRating(parseFloat(avg.toFixed(1)));
    }
  }, []);
  
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === filterStatus));
    }
  }, [filterStatus, requests]);
  
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
              status: req.status === "pending" ? "active" : req.status,
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
      const updatedStats = updatedRequests.reduce((acc, req) => {
        acc[req.status]++;
        return acc;
      }, { pending: 0, active: 0, resolved: 0, escalated: 0 });
      
      setStats(updatedStats);
      
    }, 1000);
  };
  
  const handleReassignRequest = (requestId: string) => {
    // This would be replaced with a real API call - would show a dialog to select another admin
    toast({
      title: "Request reassigned",
      description: "The request has been reassigned to another administrator.",
    });
    
    // For demo, we'll just remove it from this admin's list
    const updatedRequests = requests.filter(req => req.id !== requestId);
    setRequests(updatedRequests);
    
    // Update stats
    const updatedStats = updatedRequests.reduce((acc, req) => {
      acc[req.status]++;
      return acc;
    }, { pending: 0, active: 0, resolved: 0, escalated: 0 });
    
    setStats(updatedStats);
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
          
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
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
                    <Card key={request.id} className="border-l-4 border-l-srmblue">
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
                            {request.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>From: {request.student.name}</span>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Request:</p>
                            <p>{request.content}</p>
                          </div>
                          
                          {request.response && (
                            <div className="bg-muted rounded-md p-4">
                              <p className="text-sm font-medium text-muted-foreground mb-1">Your Response:</p>
                              <p className="text-sm">{request.response}</p>
                            </div>
                          )}
                          
                          {request.rating && (
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 text-srmaccent"
                                    fill={star <= request.rating!.stars ? "#FF9F1C" : "none"}
                                  />
                                ))}
                              </div>
                              {request.rating.comment && (
                                <span className="text-sm text-muted-foreground">
                                  "{request.rating.comment}"
                                </span>
                              )}
                            </div>
                          )}
                          
                          {(request.status === "pending" || request.status === "active") && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label htmlFor={`response-${request.id}`} className="text-sm font-medium">
                                  Your Response:
                                </label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReassignRequest(request.id)}
                                >
                                  Reassign
                                </Button>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          {/* Same structure as "all" tab, filtered for pending requests */}
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          {/* Same structure as "all" tab, filtered for active requests */}
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-0">
          {/* Same structure as "all" tab, filtered for resolved requests */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
