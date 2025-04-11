import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, Paperclip, Send, User, Star, CheckCircle, XCircle, AlertCircle, MessageCircle } from "lucide-react";
import { fetchRequests, fetchMessagesForRequest, fetchUserProfile, createMessage, updateRequest, createRating } from "@/services/api";
import { Request as BaseRequest, RequestStatus, Message, Profile } from "@/types";

// Extended Request type with frontend-specific properties
interface Request extends BaseRequest {
  createdAt: Date;
  updatedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  media: any[];
}

const RequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<Request | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [studentProfile, setStudentProfile] = useState<Profile | null>(null);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isRating, setIsRating] = useState(false);
  
  // Fetch request data
  useEffect(() => {
    const fetchRequestData = async () => {
      if (!id) {
        navigate("/not-found");
        return;
      }
      
      try {
        // Fetch the request details
        const requests = await fetchRequests(id);
        const requestData = requests[0];
        if (!requestData) {
          navigate("/not-found");
          return;
        }
        
        // Format and set request data
        setRequest({
          ...requestData,
          createdAt: new Date(requestData.created_at || Date.now()),
          updatedAt: new Date(requestData.updated_at || Date.now()),
          media: Array.isArray(requestData.media) ? requestData.media : []
        });
        
        // Fetch student profile
        if (requestData.sender_id) {
          const senderProfile = await fetchUserProfile(requestData.sender_id);
          setStudentProfile(senderProfile);
        }
        
        // Fetch admin profile if request is assigned
        if (requestData.receiver_id) {
          const receiverProfile = await fetchUserProfile(requestData.receiver_id);
          setAdminProfile(receiverProfile);
        }
        
        // Fetch messages for this request
        const messagesData = await fetchMessagesForRequest(id);
        setMessages(messagesData);
        
      } catch (error) {
        console.error("Error fetching request data:", error);
        toast({
          title: "Error",
          description: "Failed to load request details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestData();
  }, [id, navigate, toast]);
  
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim() || !user?.id || !request?.id) {
      toast({
        title: "Empty response",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a new message
      const newMessage = await createMessage({
        content: responseText,
        request_id: request.id,
        sender_id: user.id,
        attachments: []
      });
      
      // Update messages list
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // If this is the first response from admin, update request status to 'in_progress'
      if (user.role === 'admin' || user.role === 'superadmin') {
        if (request.status === 'pending') {
          // Update request status
          const updatedRequest = await updateRequest(request.id, {
            status: 'in_progress',
            receiver_id: user.id // Assign the admin to this request
          });
          
          setRequest({
            ...updatedRequest,
            createdAt: new Date(updatedRequest.created_at || Date.now()),
            updatedAt: new Date(updatedRequest.updated_at || Date.now()),
            media: Array.isArray(updatedRequest.media) ? updatedRequest.media : []
          });
          
          // Update admin profile
          setAdminProfile(user);
        }
      }
      
      // Clear response input
      setResponseText("");
      
      toast({
        title: "Response sent",
        description: "Your response has been added successfully.",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResolveRequest = async (resolved: boolean) => {
    if (!request || !user?.id) return;
    
    const newStatus: RequestStatus = resolved ? "resolved" : "escalated";
    
    try {
      // Update request status
      const updatedRequest = await updateRequest(request.id, {
        status: newStatus
      });
      
      setRequest({
        ...updatedRequest,
        createdAt: new Date(updatedRequest.created_at || Date.now()),
        updatedAt: new Date(updatedRequest.updated_at || Date.now()),
        media: Array.isArray(updatedRequest.media) ? updatedRequest.media : []
      });
      
      if (resolved) {
        setRatingDialog(true);
      } else {
        toast({
          title: "Request escalated",
          description: "This request has been escalated for further attention.",
        });
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: `Failed to ${resolved ? 'resolve' : 'escalate'} request. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitRating = async () => {
    if (rating === 0 || !user?.id || !request?.id || !request.receiver_id) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    setIsRating(true);
    
    try {
      // Create rating in database
      await createRating({
        request_id: request.id,
        student_id: user.id,
        rated_user_id: request.receiver_id,
        stars: rating,
        comment: ratingComment
      });
      
      setIsRating(false);
      setRatingDialog(false);
      
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      
      // Navigate back to dashboard
      navigate("/dashboard/student");
    } catch (error) {
      console.error("Error submitting rating:", error);
      setIsRating(false);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusIcon = (status: RequestStatus | string) => {
    // Handle in_progress status from API
    const displayStatus = status === 'in_progress' ? 'active' : status;
    
    switch (displayStatus) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "active":
        return <MessageCircle className="h-5 w-5" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5" />;
      case "escalated":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
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
  
  const canSubmitResponse = () => {
    if (!user || !request) return false;
    if (request.status === "resolved") return false;
    
    if (user.role === "student" && request.sender_id === user.id) {
      return true; // Original student can respond
    }
    
    if ((user.role === "admin" || user.role === "superadmin") && 
        (request.receiver_id === user.id || !request.receiver_id)) {
      return true; // Assigned admin or any admin if not assigned
    }
    
    return false;
  };
  
  const getDisplayStatus = (status: RequestStatus | string) => {
    // Convert API status to display status
    if (status === 'in_progress') return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2">Loading request details...</p>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-2">Request Not Found</h2>
          <p className="text-muted-foreground mt-1">The request you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Request Details</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{request.title}</CardTitle>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                <span className="font-medium">{getDisplayStatus(request.status)}</span>
              </div>
              <Badge variant="outline">{request.department}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(request.createdAt).toLocaleDateString()} at{" "}
                  {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Request details */}
            <div className="space-y-2">
              {studentProfile && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {studentProfile.name?.substring(0, 2).toUpperCase() || 'ST'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{studentProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{studentProfile.department}</p>
                  </div>
                </div>
              )}
              <div className="bg-muted p-4 rounded-md mt-2">
                <p>{request.content}</p>
                {request.media && request.media.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.media.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-1 border rounded-md px-2 py-1 text-sm"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment.name || `Attachment ${index + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {adminProfile && (
              <div className="flex items-center gap-2 border-t border-b py-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Assigned to:{" "}
                  <span className="font-medium text-foreground">
                    {adminProfile.name}
                  </span>
                  {adminProfile.department && ` (${adminProfile.department})`}
                </span>
              </div>
            )}
            
            {/* Message thread */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Conversation</h3>
              
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.sender_name?.substring(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`space-y-1 max-w-[80%] ${
                        message.sender_id === user?.id
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? "bg-srmblue text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs text-muted-foreground ${
                          message.sender_id === user?.id ? "justify-end" : ""
                        }`}
                      >
                        <span>
                          {message.sender_id === user?.id ? "You" : message.sender_name || "User"}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {message.sender_id === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {user.name?.substring(0, 2).toUpperCase() || 'ME'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No messages yet. Be the first to respond!</p>
              )}
              
              {/* Response input */}
              {request.status !== "resolved" && (
                <form onSubmit={handleSubmitResponse} className="space-y-2 mt-6">
                  <Textarea
                    placeholder="Type your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className={canSubmitResponse() ? "" : "opacity-50"}
                    disabled={!canSubmitResponse()}
                  />
                  <div className="flex justify-between">
                    {/* Attachments feature - would require storage integration */}
                    <Button variant="outline" type="button">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !canSubmitResponse()}>
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
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Resolution actions for students */}
            {user?.role === "student" && 
             user.id === request.sender_id && 
             request.status === "in_progress" && (
              <div className="border-t pt-4 mt-6">
                <p className="font-medium mb-3">Has your issue been resolved?</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                    onClick={() => handleResolveRequest(true)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Yes, Resolved
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                    onClick={() => handleResolveRequest(false)}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Not Resolved
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Please rate the support you received for this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setRating(value)}
                  >
                    <Star
                      className={`h-8 w-8 ${value <= rating ? "text-srmaccent" : "text-muted-foreground"}`}
                      fill={value <= rating ? "#FF9F1C" : "none"}
                    />
                    <span className="sr-only">{value} star</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialog(false)}>
              Skip
            </Button>
            <Button onClick={handleSubmitRating} disabled={isRating || rating === 0}>
              {isRating ? (
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
                "Submit Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestDetailsPage;
