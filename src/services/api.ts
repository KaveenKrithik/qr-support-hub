import { supabase } from "@/integrations/supabase/client";
import { Department, Request, Profile, Message, Rating, RequestStatus } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert JSON to typed array
const parseJsonArray = (json: Json | null): unknown[] => {
  if (!json) return [];
  if (typeof json === 'string') {
    try {
      return JSON.parse(json);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(json) ? json : [];
};

// Department services
export const fetchAllDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchDepartmentById = async (id: string): Promise<Department | null> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching department ${id}:`, error);
    throw error;
  }
  
  return data;
};

export const createDepartment = async (department: { name: string, created_by?: string }): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating department:', error);
    throw error;
  }
  
  return data;
};

// Profile services
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      departments:department_id (
        name
      )
    `)
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid the 406 error
  
  if (error) {
    console.error(`Error fetching profile ${userId}:`, error);
    throw error;
  }
  
  const profileData = data ? {
    ...data,
    department: data.departments?.name
  } : null;
  
  return profileData;
};

export const fetchAllAdmins = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      departments:department_id (
        name
      )
    `)
    .in('role', ['admin', 'superadmin']);
  
  if (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
  
  return data?.map(profile => ({
    ...profile,
    department: profile.departments?.name
  })) || [];
};

export const updateUserProfile = async (userId: string, profile: Partial<Omit<Profile, 'created_at' | 'updated_at'>>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating profile ${userId}:`, error);
    throw error;
  }
  
  return data;
};

// Request services
export const fetchRequests = async (userId: string, options?: { status?: RequestStatus | 'all', departmentId?: string }): Promise<Request[]> => {
  let query = supabase
    .from('requests')
    .select(`
      *,
      departments:department_id (name)
    `);
  
  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }
  
  if (options?.departmentId && options.departmentId !== 'all') {
    query = query.eq('department_id', options.departmentId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
  
  return data?.map(request => ({
    ...request,
    department: request.departments?.name,
    status: request.status as RequestStatus,
    media: parseJsonArray(request.media),
  })) || [];
};

export const fetchStudentRequests = async (studentId: string): Promise<Request[]> => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      departments:department_id (name)
    `)
    .eq('sender_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching requests for student ${studentId}:`, error);
    throw error;
  }
  
  return data?.map(request => ({
    ...request,
    department: request.departments?.name,
    status: request.status as RequestStatus,
    media: parseJsonArray(request.media),
  })) || [];
};

export const createRequest = async (request: Pick<Request, 'title' | 'content' | 'sender_id' | 'department_id' | 'media'>): Promise<Request> => {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating request:', error);
    throw error;
  }
  
  return {
    ...data,
    status: data.status as RequestStatus,
    media: parseJsonArray(data.media),
  };
};

export const updateRequest = async (requestId: string, updates: Partial<Omit<Request, 'created_at' | 'updated_at'>>): Promise<Request> => {
  // Convert RequestStatus to string if it exists in updates
  const supabaseUpdates = { ...updates };
  
  const { data, error } = await supabase
    .from('requests')
    .update(supabaseUpdates)
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating request ${requestId}:`, error);
    throw error;
  }
  
  return {
    ...data,
    status: data.status as RequestStatus,
    media: parseJsonArray(data.media),
  };
};

// Message services
export const fetchMessagesForRequest = async (requestId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id (name)
    `)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error(`Error fetching messages for request ${requestId}:`, error);
    throw error;
  }
  
  return data?.map(message => ({
    ...message,
    sender_name: message.sender?.name,
    attachments: parseJsonArray(message.attachments)
  })) || [];
};

export const createMessage = async (message: Pick<Message, 'content' | 'request_id' | 'sender_id' | 'attachments'>): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }
  
  return {
    ...data,
    attachments: parseJsonArray(data.attachments),
  };
};

// Rating services
export const createRating = async (rating: Pick<Rating, 'request_id' | 'student_id' | 'rated_user_id' | 'stars' | 'comment'>): Promise<Rating> => {
  const { data, error } = await supabase
    .from('ratings')
    .insert(rating)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
  
  return data;
};

export const fetchRatingsForAdmin = async (adminId: string): Promise<Rating[]> => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('rated_user_id', adminId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching ratings for admin ${adminId}:`, error);
    throw error;
  }
  
  return data || [];
};

// File storage services
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const filename = `${Date.now()}-${file.name}`;
  const fullPath = `${path}/${filename}`;
  
  const { data, error } = await supabase.storage
    .from('request-attachments')
    .upload(fullPath, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('request-attachments')
    .getPublicUrl(fullPath);
  
  return publicUrl;
};

// Stats and dashboard data
export const getDashboardStats = async () => {
  const { data: requests, error: requestError } = await supabase
    .from('requests')
    .select('status')
    .limit(1000);
    
  if (requestError) {
    console.error('Error fetching request stats:', requestError);
    throw requestError;
  }
  
  const { data: departments, error: departmentError } = await supabase
    .from('departments')
    .select('id, name')
    .limit(1000);
    
  if (departmentError) {
    console.error('Error fetching department count:', departmentError);
    throw departmentError;
  }
  
  const { data: admins, error: adminError } = await supabase
    .from('profiles')
    .select('id, role')
    .in('role', ['admin', 'superadmin'])
    .limit(1000);
    
  if (adminError) {
    console.error('Error fetching admin count:', adminError);
    throw adminError;
  }
  
  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    active: requests?.filter(r => r.status === 'in_progress').length || 0,
    resolved: requests?.filter(r => r.status === 'resolved').length || 0,
    escalated: requests?.filter(r => r.status === 'escalated').length || 0,
    departmentCount: departments?.length || 0,
    adminCount: admins?.length || 0
  };
  
  return stats;
};
