
export type TPaymentCreateDTO = {
    userId:string,
    doctorId:string,
    amount:number,
    appoinmentId:string
}

export type TPaymentCreateResponseDTO = {
  tempOrderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
};


export type TPaymentVerifyDTO = {
  orderCreationId: string;        
  razorpayPaymentId: string;      
  razorpayOrderId: string;        
  razorpaySignature: string;      
};

export type TPaymentUpdateDTO = {
  appoinmentId:string,
  status:string
}
