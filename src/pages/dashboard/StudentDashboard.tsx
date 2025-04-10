
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, FileText, Check, X, Upload, Star } from "lucide-react";

// Mock data types
type RequestStatus = "pending" | "active" | "resolved" | "escalated";

type Request = {
  id: string;
  title: string;
  content: string;
  department: string;
  status: RequestStatus;
  respondent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  response?: string;
  createdAt: Date;
  updatedAt: Date;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [newRequest, setNewRequest] = useState({
    title: "",
    content: "",
    department: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("new-request");
  const [departments, setDepartments] = useState([
    { id: "1", name: "Computer Science" },
    { id: "2", name: "Mechanical Engineering" },
    { id: "3", name: "Civil Engineering" },
    { id: "4", name: "Electrical Engineering" },
    { id: "5", name: "OD Processing" },
  ]);
  
  // Mock loading requests
  useEffect(() => {
    // This would be replaced with a real API call
    const mockRequests: Request[] = [
      {
        id: "req1",
        title: "Attendance correction request",
        content: "I need to correct my attendance for CS101 on May 5th.",
        department: "Computer Science",
        status: "active",
        respondent: {
          id: "admin1",
          name: "Dr. John Smith",
        },
        response: "I will check the attendance records and get back to you shortly.",
        createdAt: new Date(2025, 3, 5),
        updatedAt: new Date(2025, 3, 6),
      },
      {
        id: "req2",
        title: "OD request for technical symposium",
        content: "I need OD for attending the technical symposium on April 15-16.",
        department: "OD Processing",
        status: "pending",
        createdAt: new Date(2025, 3, 8),
        updatedAt: new Date(2025, 3, 8),
      },
      {
        id: "req3",
        title: "Lab manual query",
        content: "I need clarification on experiment 5 in the CS lab manual.",
        department: "Computer Science",
        status: "resolved",
        respondent: {
          id: "admin2",
          name: "Prof. Sarah Johnson",
        },
        response: "The instructions for experiment 5 have been updated. Please download the latest version from the department website.",
        createdAt: new Date(2025, 3, 1),
        updatedAt: new Date(2025, 3, 3),
      },
    ];
    
    setRequests(mockRequests);
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.title.trim() || !newRequest.content.trim() || !newRequest.department) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // This would be replaced with a real API call
    setTimeout(() => {
      // Create a new request object
      const newReq: Request = {
        id: `req${Math.random().toString(36).substring(2, 9)}`,
        title: newRequest.title,
        content: newRequest.content,
        department: departments.find(d => d.id === newRequest.department)?.name || "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setRequests([newReq, ...requests]);
      
      // Reset form
      setNewRequest({
        title: "",
        content: "",
        department: "",
      });
      setFile(null);
      
      setIsSubmitting(false);
      setActiveTab("all-requests");
      
      toast({
        title: "Request submitted",
        description: "Your support request has been submitted successfully.",
      });
    }, 1500);
  };
  
  const handleResolveRequest = (requestId: string, resolved: boolean) => {
    // This would be replaced with a real API call
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: resolved ? "resolved" : "escalated",
            updatedAt: new Date()
          }
        : req
    ));
    
    toast({
      title: resolved ? "Request resolved" : "Request escalated",
      description: resolved 
        ? "Thank you for your feedback! The request has been marked as resolved." 
        : "The request has been escalated for further attention.",
    });
  };
  
  const handleRateResponse = (requestId: string, rating: number) => {
    // This would be replaced with a real API call
    toast({
      title: "Thank you for your rating",
      description: `You rated this response ${rating} stars.`,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button onClick={() => navigate("/qr")}>
          Scan QR Code
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.name || "Student"}!</CardTitle>
            <CardDescription>
              Submit and track your support requests here. You can create new requests, view responses, and mark requests as resolved.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="new-request" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="all-requests">
              My Requests
              {requests.length > 0 && (
                <Badge className="ml-2 bg-primary" variant="secondary">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Request</CardTitle>
                <CardDescription>
                  Fill in the details of your request. Be as specific as possible to get a quicker response.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Request Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Brief title for your request"
                      value={newRequest.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      name="department"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newRequest.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Request Details</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Describe your request in detail..."
                      value={newRequest.content}
                      onChange={handleInputChange}
                      className="min-h-32"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="max-w-sm"
                      />
                      {file && (
                        <Badge variant="outline" className="ml-2">
                          {file.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You can attach relevant files (images, PDFs, documents)
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
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
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all-requests">
            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>
                  View and manage all your submitted support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No requests yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      You haven't submitted any support requests yet.
                    </p>
                    <Button className="mt-4" onClick={() => setActiveTab("new-request")}>
                      Create a Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requests.map((request) => (
                      <Card key={request.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">{request.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{request.department}</Badge>
                                {getStatusBadge(request.status)}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              {request.createdAt.toLocaleDateString()}
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
                                <div className="flex items-center gap-2 mb-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {request.respondent?.name?.substring(0, 2).toUpperCase() || "??"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">
                                    {request.respondent?.name || "Staff"}
                                  </span>
                                </div>
                                <p className="text-sm">{request.response}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-4">
                          {request.status === "active" && (
                            <div className="w-full">
                              <p className="text-sm font-medium mb-2">Is your issue resolved?</p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                  onClick={() => handleResolveRequest(request.id, true)}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Yes, Resolved
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                                  onClick={() => handleResolveRequest(request.id, false)}
                                >
                                  <X className="mr-2 h-4 w-4" /> Not Resolved
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {request.status === "resolved" && request.respondent && (
                            <div className="w-full">
                              <p className="text-sm font-medium mb-2">Rate the response:</p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Button
                                    key={rating}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRateResponse(request.id, rating)}
                                  >
                                    <Star
                                      className={`h-5 w-5 ${
                                        rating <= 3 ? "text-srmaccent" : "text-srmaccent"
                                      }`}
                                      fill={rating <= 3 ? "none" : "#FF9F1C"}
                                    />
                                    <span className="sr-only">{rating} stars</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
