import type { IFetus } from "../utils/interface.utils.js";

export type TfetusCreateDTO = IFetus;
export type TfetusResponseDTO = {
  id:string,
  week:number;
  fetusImage: string;
  fruitImage: string;
  weight: string;
  height: string;
  development: string;
  updatedAt:string,
  createdAt:string,
};
