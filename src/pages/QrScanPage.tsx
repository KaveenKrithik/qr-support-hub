import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const QrScanPage = () => {
  const { departmentId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [department, setDepartment] = useState<{ id: string; name: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDepartment = async () => {
      if (departmentId) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('departments')
            .select('id, name')
            .eq('id', departmentId)
            .single();
          
          if (error) {
            console.error('Error fetching department:', error);
            toast({
              title: "Error",
              description: "Failed to load department information",
              variant: "destructive",
            });
          } else if (data) {
            setDepartment(data);
          }
        } catch (error) {
          console.error('Error fetching department:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchDepartment();
  }, [departmentId, toast]);
  
  const startScanning = () => {
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
        navigate(`/dashboard/student?dept=${departmentId}`);
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
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <svg
                  className="h-12 w-12 animate-spin text-primary"
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
            ) : (
              <>
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
                      <p>Scanning...</p>
                    </div>
                  ) : (
                    <Button onClick={startScanning}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Start Scanning
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QrScanPage;
