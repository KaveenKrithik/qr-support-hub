
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigate } from "react-router-dom";

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="rounded-full bg-srmblue p-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M8 4h8v5H8V4Z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">SRM Support Hub</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {children}
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex flex-col gap-2 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SRM Institute Support Hub
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="#" className="underline underline-offset-4">
              Terms
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

export default AuthLayout;
