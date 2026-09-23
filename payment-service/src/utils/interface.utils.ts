export interface IPaymentOrder {
  _id?: string;
  tempOrderId?:string         
  razorpayOrderId: string;
  razorpayPaymentId?:string;     
  userId: string;             
  doctorId: string;           
  amount: number; 
  appoinmentId:string,         
  status: "PENDING" | "SUCCESS" | "FAILED"|"CANCELLED"|"REFUNDED";  
  attemptCount?: number;       
  createdAt?: Date;           
  updatedAt?: Date;    
}

export interface IRevenueOverviewItem {
  label: string;
  amount: number;
}

export interface IPaymentAdminDashboardStats {
  totalRevenue: number;
  revenueOverview: IRevenueOverviewItem[];
}
