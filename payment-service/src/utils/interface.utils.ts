export interface IPaymentOrder {
  _id?: string;
  tempOrderId?:string         
  razorpayOrderId: string;     
  userId: string;             
  doctorId: string;           
  amount: number; 
  appoinmentId:string,         
  status?: "PENDING" | "SUCCESS" | "FAILED";  
  attemptCount?: number;       
  createdAt?: Date;           
  updatedAt?: Date;    
}
