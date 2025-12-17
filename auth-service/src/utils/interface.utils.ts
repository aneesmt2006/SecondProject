export interface IUser {
  _id?: string;
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "user" | "admin";
  dateOfBirth?: string;
  profileImage?: string;
  accountMethod: "normal" | "google";
  createdAt?: Date;
  updatedAt?: Date;
  isActive?:string;
  lmp?:string;
  dueDate?:string;
}

export interface IDoctor {
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  specialization?: string;
  clinicName?: string;
  role: "doctor" | "admin";
  accountMethod?: "normal" | "google";
  status?: string;
  createAt?: Date;
  updatedAt?: Date;
}
