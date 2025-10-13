export interface IUser {
  full_name: string;
  email: string;
  password: string;
  phone: number;
  role: "user" | "doctor" | "admin";
  created_at: Date;
  updated_at: Date;
}

export interface IAuthRepository {
  create(user: IUser): Promise<IUser>;
  findById?(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update?(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete?(id:string):Promise<void>
}
