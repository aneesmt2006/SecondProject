

export type Trole = "user" | "doctor" | "admin";

export type TregisterRequestDTO = {
  full_name: string;
  email: string;
  phone: string;
  role: Trole;
  password: string;
  dateOfBirth: string;
};

export type TloginRequesDTO = {
    email:string,
    password:string
}

export type TuserResponseDTO = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Trole;
  dateOfBirth: string;
  accessToken:string,
  isActive?:string,
  createdAt: Date;
  updatedAt: Date;
  
};

export type TgoogleAuthResponse = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
};


export type TGetuserResponseDTO = {
  id:string,
  full_name:string,
  email:string,
  phone:string,
  dateOfBirth?: string;
  profileImage?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
