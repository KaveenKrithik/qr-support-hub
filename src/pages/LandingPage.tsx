
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { QrCode, FileQuestion, ArrowRight, Users, MessageSquare } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-srmblue p-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M8 4h8v5H8V4Z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">SRM Support Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 srm-gradient">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Streamlined Support for SRM Institute
                </h1>
                <p className="text-muted-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-white/80">
                  Scan QR codes, submit support requests, and get timely responses from faculty.
                  Designed to simplify campus support services.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-white text-srmblue hover:bg-white/90"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/qr")}
                    className="border-white text-white hover:bg-white/20"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan a QR Code
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <QrCode className="h-60 w-60 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our platform connects students with faculty through a simple
                  QR-based support request system.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-srmblue p-2">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Scan QR Code</h3>
                <p className="text-center text-muted-foreground">
                  Scan the department-specific QR code to access the support platform.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-srmblue p-2">
                  <FileQuestion className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Submit Request</h3>
                <p className="text-center text-muted-foreground">
                  Fill in the details of your request and attach any relevant files.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-srmblue p-2">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Get Response</h3>
                <p className="text-center text-muted-foreground">
                  Receive timely responses from faculty and rate their assistance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm mb-6">
                  For Students
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  Get Quick Support for Your Academic Needs
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Submit requests for administrative assistance, track status, and rate your experience.
                </p>
                <ul className="mt-6 grid gap-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Submit requests with text and media attachments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Track request status in real-time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Rate and provide feedback on support received</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1577036421869-8b7f0aecc7c1?q=80&w=1000&auto=format&fit=crop"
                    alt="Student using a laptop"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex items-center justify-center order-last lg:order-first">
                <div className="rounded-xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop"
                    alt="Faculty member helping students"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="inline-block rounded-lg bg-muted-foreground/10 px-3 py-1 text-sm mb-6">
                  For Faculty
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  Efficiently Manage Student Requests
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Streamline request handling, collaborate with other faculty members, and track performance metrics.
                </p>
                <ul className="mt-6 grid gap-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Respond to requests based on your department</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Reassign requests when necessary</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-100 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>Monitor performance through ratings feedback</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-srmblue">
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Join SRM Support Hub Today
                </h2>
                <p className="max-w-[600px] mx-auto text-white/80 md:text-xl/relaxed">
                  Start using our platform to simplify support requests and responses
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                className="bg-white text-srmblue hover:bg-white/90"
                size="lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-srmblue p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="M8 4h8v5H8V4Z" />
                  </svg>
                </div>
                <span className="font-semibold">SRM Support Hub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simplifying campus support requests for students and faculty.
              </p>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium">Platform</h3>
                <nav className="mt-4 flex flex-col space-y-2 text-sm">
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Features
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Security
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    For Students
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    For Faculty
                  </a>
                </nav>
              </div>
              <div>
                <h3 className="text-lg font-medium">Support</h3>
                <nav className="mt-4 flex flex-col space-y-2 text-sm">
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Help Center
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Contact Us
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Privacy
                  </a>
                  <a className="text-muted-foreground hover:text-foreground" href="#">
                    Terms
                  </a>
                </nav>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for updates on new features and improvements.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SRM Institute Support Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
