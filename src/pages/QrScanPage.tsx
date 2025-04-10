
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowLeft } from "lucide-react";

const QrScanPage = () => {
  const { departmentId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [department, setDepartment] = useState<{ id: string; name: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Mock departments for demo purposes
  const departments = [
    { id: "1", name: "Computer Science" },
    { id: "2", name: "Mechanical Engineering" },
    { id: "3", name: "Civil Engineering" },
    { id: "4", name: "Electrical Engineering" },
    { id: "5", name: "OD Processing" },
  ];
  
  useEffect(() => {
    // Find department based on URL param
    if (departmentId) {
      const dept = departments.find(d => d.id === departmentId);
      if (dept) {
        setDepartment(dept);
      }
    }
  }, [departmentId]);
  
  const startScanning = () => {
    // In a real app, this would activate a camera for QR scanning
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      
      // Determine where to navigate based on authentication status and user role
      if (!isAuthenticated) {
        toast({
          title: "QR code scanned",
          description: "Please log in to submit a request",
        });
        navigate("/login");
      } else if (user?.role === "student") {
        toast({
          title: "QR code scanned",
          description: `Ready to submit a request to ${department?.name || "department"}`,
        });
        navigate("/dashboard/student");
      } else {
        toast({
          title: "QR code scanned",
          description: "Admins and superadmins cannot submit requests",
        });
        navigate(`/dashboard/${user?.role}`);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Scan QR Code</h1>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-12 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                {department 
                  ? `Scan QR Code for ${department.name}` 
                  : "Scan Department QR Code"}
              </h2>
              <p className="text-muted-foreground">
                {department 
                  ? `You're about to submit a request to ${department.name}` 
                  : "Scan a department QR code to submit a support request"}
              </p>
            </div>
            
            <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
              {isScanning ? (
                <div className="space-y-4 animate-pulse">
                  <div className="rounded-lg bg-muted h-48 w-48 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 animate-spin text-muted-foreground/70"
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
                  </div>
                  <p className="text-muted-foreground">Scanning QR code...</p>
                </div>
              ) : (
                <>
                  <QrCode className="h-24 w-24 text-muted-foreground/70 mb-4" />
                  <p className="text-muted-foreground mb-6">
                    Position the QR code within the frame to scan
                  </p>
                  <Button onClick={startScanning}>
                    Start Scanning
                  </Button>
                  <p className="text-xs text-muted-foreground mt-6">
                    Note: In a real app, this would access your camera to scan a QR code
                  </p>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scanning a QR code will take you directly to the request form for the specific department.
              </p>
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2">
                  <p className="font-medium">Not logged in yet?</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => navigate("/login")}>
                      Log In
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container flex flex-col gap-2 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SRM Institute Support Hub
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="#" className="underline underline-offset-4">
              Help
            </a>{" "}
            &bull;{" "}
            <a href="#" className="underline underline-offset-4">
              Privacy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QrScanPage;
