
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!email.endsWith("@srmist.edu.in")) {
      toast({
        title: "Invalid email",
        description: "Please use your SRM Institute email (@srmist.edu.in)",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signInWithMagicLink(email);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "There was an error sending the magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome to SRM Support Hub</h1>
        <p className="text-muted-foreground">
          Login with your SRM Institute email to access the support platform
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="yourname@srmist.edu.in"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Only @srmist.edu.in email addresses are allowed
              </p>
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
                  Sending link...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        </div>
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            By logging in, you agree to our{" "}
            <a className="underline underline-offset-4 hover:text-primary" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-4 hover:text-primary" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
