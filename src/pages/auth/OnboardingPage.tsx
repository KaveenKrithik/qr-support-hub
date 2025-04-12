import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { Profile, Department } from "@/types";
import { fetchAllDepartments, createDepartment as apiCreateDepartment } from "@/services/api";

// Define UserProfile type to match Profile type but with nullable role
type UserProfile = {
  id: string;
  email: string;
  role: "student" | "admin" | "superadmin" | null;
  name: string | null;
  department: string | null;
  department_id?: string | null; // Added to store the department ID
  duties?: string | null;
  qualifications?: string | null;
  created_at?: string;
};

type Step = "role" | "details";

const OnboardingPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<UserProfile["role"]>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [duties, setDuties] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments from the database
  useEffect(() => {
    const getDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const deptData = await fetchAllDepartments();
        console.log("Departments fetched:", deptData);
        
        if (deptData && deptData.length > 0) {
          setDepartments(deptData);
        } else {
          console.log("No departments found in database");
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    
    getDepartments();
  }, [toast]);

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast({
        title: "Role required",
        description: "Please select a role to continue",
        variant: "destructive",
      });
      return;
    }
    
    setStep("details");
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.trim()) {
      toast({
        title: "Department name required",
        description: "Please enter a department name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create department in the database
      const createdDept = await apiCreateDepartment({
        name: newDepartment.trim(),
        created_by: user?.id
      });
      
      setDepartments(prev => [...prev, createdDept]);
      setDepartment(createdDept.id);
      setNewDepartment("");
      setIsCreatingDepartment(false);
      
      toast({
        title: "Department created",
        description: `${newDepartment} has been added to departments`,
      });
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    if (!department && role !== "superadmin") {
      toast({
        title: "Department required",
        description: "Please select or create a department",
        variant: "destructive",
      });
      return;
    }
    
    if ((role === "admin" || role === "superadmin") && !duties.trim()) {
      toast({
        title: "Duties required",
        description: "Please enter your duties",
        variant: "destructive",
      });
      return;
    }
    
    if ((role === "admin" || role === "superadmin") && !qualifications.trim()) {
      toast({
        title: "Qualifications required",
        description: "Please enter your qualifications",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const selectedDepartment = departments.find(d => d.id === department);
      
      await updateProfile({
        role,
        name,
        department_id: department, // Store the department ID directly in the profile
        department: selectedDepartment?.name,
        duties: role === "student" ? null : duties,
        qualifications: role === "student" ? null : qualifications,
      });
      
      toast({
        title: "Profile created",
        description: "Your profile has been set up successfully",
      });
      
      // Navigate to the appropriate dashboard based on role
      navigate(`/dashboard/${role}`);
      
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Profile setup failed",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which form to show based on the current step
  const renderRoleForm = () => {
    return (
      <form onSubmit={handleRoleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select your role</h2>
          <RadioGroup value={role || ""} onValueChange={(value) => setRole(value as UserProfile["role"])}>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="flex flex-col">
                  <span className="text-base font-medium">Student</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Submit and track support requests
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="flex flex-col">
                  <span className="text-base font-medium">Admin</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Respond to student support requests
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50">
                <RadioGroupItem value="superadmin" id="superadmin" />
                <Label htmlFor="superadmin" className="flex flex-col">
                  <span className="text-base font-medium">Super Admin</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Manage departments and handle escalated requests
                  </span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    );
  };

  const renderDetailsForm = () => {
    return (
      <form onSubmit={handleDetailsSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isLoadingDepartments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading departments...</span>
                  </div>
                ) : (
                  <select
                    id="department"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            
            {(role === "admin" || role === "superadmin") && (
              <>
                {!isCreatingDepartment ? (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="flex gap-2">
                      {isLoadingDepartments ? (
                        <div className="flex items-center justify-center py-4 w-full">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading departments...</span>
                        </div>
                      ) : (
                        <>
                          <select
                            id="department"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required={role !== "superadmin"}
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreatingDepartment(true)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            New
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="newDepartment">Create New Department</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newDepartment"
                        placeholder="Department name"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateDepartment}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCreatingDepartment(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="duties">Duties</Label>
                  <Textarea
                    id="duties"
                    placeholder="Brief description of your duties"
                    value={duties}
                    onChange={(e) => setDuties(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    placeholder="Your qualifications"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep("role")}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your profile to start using the SRM Support Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" && renderRoleForm()}
          {step === "details" && renderDetailsForm()}
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
