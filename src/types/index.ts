
export type Department = {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type RequestStatus = "pending" | "in_progress" | "resolved" | "escalated";

export type Request = {
  id: string;
  title: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  department_id: string;
  department?: string; // For display purposes
  status: RequestStatus;
  media?: any[];
  created_at: string;
  updated_at: string;
  sender_name?: string;
  receiver_name?: string;
};

export type Message = {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  attachments?: any[];
  created_at: string;
  read_at?: string;
  sender_name?: string;
};

export type Rating = {
  id: string;
  request_id: string;
  student_id: string;
  rated_user_id: string;
  stars: number;
  comment?: string;
  created_at?: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin" | "superadmin";
  department_id?: string;
  department?: string; // For display purposes
  duties?: string;
  qualifications?: string;
  portfolio_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
};
