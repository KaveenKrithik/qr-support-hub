
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";

type Step = "role" | "details";

type Department = {
  id: string;
  name: string;
};

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
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  
  // Mock departments
  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "Computer Science" },
    { id: "2", name: "Mechanical Engineering" },
    { id: "3", name: "Civil Engineering" },
    { id: "4", name: "Electrical Engineering" },
    { id: "5", name: "OD Processing" },
  ]);

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

  const handleCreateDepartment = () => {
    if (!newDepartment.trim()) {
      toast({
        title: "Department name required",
        description: "Please enter a department name",
        variant: "destructive",
      });
      return;
    }
    
    // Generate a random ID for the new department
    const newDeptId = `dept_${Math.random().toString(36).substring(2, 9)}`;
    const newDept = { id: newDeptId, name: newDepartment.trim() };
    
    setDepartments([...departments, newDept]);
    setDepartment(newDept.id);
    setNewDepartment("");
    setIsCreatingDepartment(false);
    
    toast({
      title: "Department created",
      description: `${newDepartment} has been added to departments`,
    });
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
      const selectedDepartmentName = departments.find(d => d.id === department)?.name;
      
      await updateProfile({
        role,
        name,
        department: selectedDepartmentName || department,
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
              </div>
            )}
            
            {(role === "admin" || role === "superadmin") && (
              <>
                {!isCreatingDepartment ? (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="flex gap-2">
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreatingDepartment(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        New
                      </Button>
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
                      >
                        Create
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCreatingDepartment(false)}
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
