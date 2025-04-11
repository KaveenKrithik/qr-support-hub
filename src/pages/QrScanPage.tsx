import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

const QrScanPage = () => {
  const { departmentId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [department, setDepartment] = useState<{ id: string; name: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
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
    
    // Clean up scanner when component unmounts
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, [departmentId, toast]);
  
  const startScanning = () => {
    setIsScanning(true);
    
    // Create and start scanner
    const html5QrCode = new Html5Qrcode(scannerContainerId);
    qrScannerRef.current = html5QrCode;
    
    const qrCodeSuccessCallback = (decodedText: string) => {
      // Stop scanning once we get a result
      html5QrCode.stop().catch(error => console.error("Error stopping scanner:", error));
      
      // Process the scanned QR code (decodedText contains the QR code data)
      console.log(`QR Code detected: ${decodedText}`);
      setIsScanning(false);
      
      // You can process the QR code data here
      // For now, we'll just use the existing navigation logic
      handleScanComplete(decodedText);
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qrCodeErrorCallback = (error: any) => {
      // This callback is triggered continuously while scanning,
      // so we don't need to handle most errors
      if (error?.name === "NotFoundException") {
        // QR code not found, continue scanning
        return;
      }
      console.error("QR scan error:", error);
    };
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
      { facingMode: "environment" }, // Use back camera when available
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).catch(err => {
      console.error("Error starting QR scanner:", err);
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    });
  };
  
  const stopScanning = () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      qrScannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error("Error stopping scanner:", err);
      });
    } else {
      setIsScanning(false);
    }
  };
  
  const handleScanComplete = (qrCodeData: string) => {
    // Extract department ID from QR code if needed
    // For demo purposes, we'll just use the current departmentId or the QR data
    const scannedDeptId = departmentId || qrCodeData;
    
    toast({
      title: "QR code scanned",
      description: "Successfully scanned QR code",
    });
    
    // Determine where to navigate based on authentication status and user role
    if (!isAuthenticated) {
      toast({
        title: "QR code scanned",
        description: "Please log in to submit a request",
      });
      navigate("/login");
    } else if (user?.role === "student") {
      // For students, pass the department ID to the student dashboard as a query parameter
      toast({
        title: "QR code scanned",
        description: `Ready to submit a request to ${department?.name || "department"}`,
      });
      navigate(`/dashboard/student?dept=${scannedDeptId}`);
    } else if (user?.role) {
      // For admins and superadmins, redirect to their dashboard
      toast({
        title: "QR code scanned",
        description: "Admins and superadmins cannot submit requests",
      });
      navigate(`/dashboard/${user.role}`);
    } else {
      // Fallback for unknown roles
      navigate("/dashboard");
    }
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
                    <div className="space-y-4">
                      <div id={scannerContainerId} className="qr-scanner-container"></div>
                      <Button 
                        variant="outline" 
                        onClick={stopScanning}
                        className="mt-4"
                      >
                        Cancel Scanning
                      </Button>
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
                        Make sure to allow camera access when prompted
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
              </>
            )}
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
