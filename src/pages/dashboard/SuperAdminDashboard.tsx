
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowUpDown, 
  CirclePlus, 
  FileEdit, 
  MoreHorizontal, 
  Trash, 
  UserPlus, 
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { fetchAllDepartments, createDepartment, getDashboardStats, fetchAllAdmins } from '@/services/api';
import { Department, Profile, Request } from '@/types';

// Status badge variant mapping
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'active': return 'default';
    case 'resolved': return 'success';
    case 'escalated': return 'destructive';
    default: return 'outline';
  }
};

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    resolved: 0,
    escalated: 0,
    departmentCount: 0,
    adminCount: 0
  });
  
  // State for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  
  // State for admins
  const [admins, setAdmins] = useState<Profile[]>([]);
  
  // State for requests
  const [requests, setRequests] = useState<Request[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsData = await getDashboardStats();
        setStats(statsData);
        
        // Fetch departments
        const departmentsData = await fetchAllDepartments();
        setDepartments(departmentsData);
        
        // Fetch admins
        const adminsData = await fetchAllAdmins();
        setAdmins(adminsData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Could not load dashboard data. Please try again."
        });
      }
    };
    
    fetchDashboardData();
  }, [toast]);
  
  // Create new department
  const handleCreateDepartment = async () => {
    if (!newDepartment.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid department name",
        description: "Please enter a valid department name."
      });
      return;
    }
    
    setIsCreatingDepartment(true);
    
    try {
      const createdDepartment = await createDepartment({ 
        name: newDepartment.trim(), 
        created_by: user?.id 
      });
      
      setDepartments([...departments, createdDepartment]);
      setStats(prev => ({
        ...prev,
        departmentCount: prev.departmentCount + 1
      }));
      
      toast({
        title: "Department created",
        description: `${newDepartment.trim()} has been created successfully.`
      });
      
      setNewDepartment("");
      setIsDepartmentDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error creating department:', error);
      toast({
        variant: "destructive",
        title: "Error creating department",
        description: error.message || "Failed to create department. Please try again."
      });
    } finally {
      setIsCreatingDepartment(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage departments, admins, and requests across the platform.
        </p>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total requests across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Active departments on the platform
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">
              Admin users across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Requests awaiting assignment
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        
        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Departments</h2>
            <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                  <DialogDescription>
                    Add a new department to the system.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateDepartment(); }}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name</Label>
                      <Input 
                        id="name"
                        placeholder="e.g., Computer Science"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isCreatingDepartment || !newDepartment.trim()}
                    >
                      {isCreatingDepartment ? "Creating..." : "Create Department"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.id.substring(0, 8)}...</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>{new Date(department.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                // View department functionality
                                toast({
                                  title: "View Department",
                                  description: `Viewing ${department.name}`
                                });
                              }}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // Edit department functionality
                                toast({
                                  title: "Edit Department",
                                  description: `Editing ${department.name}`
                                });
                              }}
                            >
                              Edit department
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                // Delete department functionality
                                toast({
                                  title: "Delete Department",
                                  description: `${department.name} will be deleted`,
                                  variant: "destructive"
                                });
                              }}
                            >
                              Delete department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {departments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No departments found. Add your first department!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admins</h2>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.id.substring(0, 8)}...</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.department || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge variant={admin.role === 'superadmin' ? 'destructive' : 'default'}>
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                // View admin profile
                                toast({
                                  title: "View Admin",
                                  description: `Viewing ${admin.name}'s profile`
                                });
                              }}
                            >
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // Edit admin functionality
                                toast({
                                  title: "Edit Admin",
                                  description: `Editing ${admin.name}'s details`
                                });
                              }}
                            >
                              Edit admin
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                // Delete admin functionality
                                toast({
                                  title: "Remove Admin",
                                  description: `${admin.name} will be removed`,
                                  variant: "destructive"
                                });
                              }}
                            >
                              Remove admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No admin users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">All Requests</h2>
            <Button variant="outline" onClick={() => {
              // Refresh requests functionality
              toast({
                title: "Refreshing",
                description: "Getting the latest requests"
              });
            }}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate(`/dashboard/requests/${request.id}`);
                            }}
                          >
                            <FileEdit className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
