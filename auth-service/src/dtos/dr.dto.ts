
export type TDRregisterRequestDTO = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
  clinicName: string;
  profileImage: string;
  role: "doctor" | "admin";
};

export type TDRresponseDTO = {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  specialization: string;
  clinicName: string;
  role: "doctor" | "admin";
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  accessToken?: string;
};

export type TDRessentialDTO = Pick<TDRresponseDTO,"fullName"|"clinicName">
export type TDRapmntDTO = Pick<TDRresponseDTO,"id"|"fullName"|"specialization">

export type TDRgoogleAuthResponse = {
  name: string;
  email: string;
};

export type TDRloginRequestDTO = {
  email: string;
  password: string;
};

