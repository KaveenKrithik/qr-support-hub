
import { useState } from "react";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, User, Star, MessageCircle, Shield } from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user?.name || "",
    department: user?.department || "",
    duties: user?.duties || "",
    qualifications: user?.qualifications || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for ratings
  const [ratings] = useState([
    { id: "1", stars: 5, comment: "Very helpful and quick response!", date: "2025-04-01" },
    { id: "2", stars: 4, comment: "Good service but took a bit longer than expected.", date: "2025-03-28" },
    { id: "3", stars: 5, comment: "Excellent support! Solved my issue immediately.", date: "2025-03-25" },
  ]);
  
  // Mock data for request history
  const [requestHistory] = useState([
    {
      id: "req1",
      title: "Attendance correction",
      department: "Computer Science",
      status: "resolved",
      date: "2025-04-05",
    },
    {
      id: "req2",
      title: "Lab equipment issue",
      department: "Electrical Engineering",
      status: "resolved",
      date: "2025-03-30",
    },
    {
      id: "req3",
      title: "OD request processing",
      department: "OD Processing",
      status: "active",
      date: "2025-04-08",
    },
  ]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getRoleIcon = () => {
    switch (user?.role) {
      case "student":
        return <User className="h-5 w-5" />;
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "superadmin":
        return <Shield className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "superadmin":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className={`rounded-full p-1 ${getRoleBadgeClass()}`}>
                    {getRoleIcon()}
                  </div>
                  <span className="text-sm font-medium capitalize">
                    {user?.role || "User"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm">{user?.department || "Not specified"}</p>
              </div>
              {(user?.role === "admin" || user?.role === "superadmin") && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Duties</p>
                    <p className="text-sm">{user?.duties || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Qualifications</p>
                    <p className="text-sm">{user?.qualifications || "Not specified"}</p>
                  </div>
                </>
              )}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              View and manage your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium">Name</p>
                    <p>{user?.name || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Department</p>
                    <p>{user?.department || "Not specified"}</p>
                  </div>
                  {(user?.role === "admin" || user?.role === "superadmin") && (
                    <>
                      <div className="space-y-1">
                        <p className="font-medium">Duties</p>
                        <p className="whitespace-pre-wrap">{user?.duties || "Not specified"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">Qualifications</p>
                        <p className="whitespace-pre-wrap">{user?.qualifications || "Not specified"}</p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                {user?.role === "student" ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Requests</h3>
                    {requestHistory.length > 0 ? (
                      <div className="space-y-2">
                        {requestHistory.map((request) => (
                          <div key={request.id} className="flex justify-between items-center p-3 rounded-md border">
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-muted-foreground">{request.department} • {request.date}</p>
                            </div>
                            <div>
                              <span className={`rounded-full px-2 py-1 text-xs font-medium 
                                ${request.status === "resolved" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-blue-100 text-blue-800"}
                              `}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No request history found.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Ratings & Feedback</h3>
                      <div className="flex items-center gap-1 bg-srmaccent/10 text-srmaccent-dark px-2 py-1 rounded-full">
                        <Star className="h-4 w-4" fill="#FF9F1C" />
                        <span className="text-sm font-medium">4.7</span>
                      </div>
                    </div>
                    {ratings.length > 0 ? (
                      <div className="space-y-3">
                        {ratings.map((rating) => (
                          <div key={rating.id} className="p-3 rounded-md border">
                            <div className="flex justify-between items-start">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 text-srmaccent"
                                    fill={star <= rating.stars ? "#FF9F1C" : "none"}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">{rating.date}</p>
                            </div>
                            <p className="mt-2 text-sm">"{rating.comment}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No ratings yet.</p>
                    )}
                    
                    <div className="pt-4">
                      <h3 className="text-lg font-medium">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-100">
                              <MessageCircle className="h-4 w-4 text-blue-700" />
                            </div>
                            <p className="text-sm font-medium">Requests Handled</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">42</p>
                        </div>
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-green-100">
                              <Star className="h-4 w-4 text-green-700" />
                            </div>
                            <p className="text-sm font-medium">Resolution Rate</p>
                          </div>
                          <p className="text-2xl font-bold mt-2">95%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Your department"
                />
              </div>
              
              {(user?.role === "admin" || user?.role === "superadmin") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="duties">Duties</Label>
                    <Textarea
                      id="duties"
                      name="duties"
                      value={formData.duties}
                      onChange={handleInputChange}
                      placeholder="Describe your duties"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      placeholder="Your qualifications"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
