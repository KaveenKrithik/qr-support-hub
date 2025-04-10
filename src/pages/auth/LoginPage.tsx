
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const LoginPage = () => {
  const { signIn, signUp, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  
  // Signup states
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (showOtpInput) {
      // Verify OTP
      if (!loginOtp || loginOtp.length < 6) {
        toast({
          title: "Invalid OTP",
          description: "Please enter the complete OTP sent to your email.",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        await verifyOTP(loginEmail, loginOtp);
        navigate("/dashboard");
      } catch (error) {
        // Error toast is handled in the auth context
      } finally {
        setIsLoading(false);
      }
      
    } else {
      // Send magic link/OTP
      setIsLoading(true);
      
      try {
        await signIn(loginEmail);
        setShowOtpInput(true);
      } catch (error) {
        // Error toast is handled in the auth context
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail.trim() || !signupName.trim()) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (!signupEmail.endsWith('@srmist.edu.in')) {
      toast({
        title: "Invalid email",
        description: "Only SRM Institute emails (@srmist.edu.in) are allowed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(signupEmail, signupName);
      
      toast({
        title: "Registration initiated",
        description: "Please check your email for verification link.",
      });
      
      // Switch to login tab
      setActiveTab("login");
      
    } catch (error) {
      // Error toast is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpProcess = () => {
    setShowOtpInput(false);
    setLoginOtp("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Authentication</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to SRM Support Hub</CardTitle>
            <CardDescription>Sign in to your account or register</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  {!showOtpInput ? (
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email (must be @srmist.edu.in)</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@srmist.edu.in"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          Enter the OTP sent to {loginEmail}
                        </p>
                        <Button 
                          variant="link" 
                          type="button" 
                          className="p-0 h-auto" 
                          onClick={resetOtpProcess}
                        >
                          Change email
                        </Button>
                      </div>
                      
                      <div className="flex justify-center">
                        <InputOTP 
                          maxLength={6} 
                          value={loginOtp} 
                          onChange={setLoginOtp}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
                        {showOtpInput ? "Verifying..." : "Sending OTP..."}
                      </>
                    ) : (
                      showOtpInput ? "Verify OTP" : "Continue with Email"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email (must be @srmist.edu.in)</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@srmist.edu.in"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Only SRM Institute emails (@srmist.edu.in) are allowed to register and log in.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;
