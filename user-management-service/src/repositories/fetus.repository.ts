import { injectable } from "inversify";
import fetusModel from "../models/fetus.model.js";
import type { IFetus } from "../utils/interface.utils.js";
import type { IFetusRepository } from "./interfaces/IFetusRepository.js";

@injectable()
export class FetusRepository implements IFetusRepository {
  async create(fetusData: IFetus): Promise<IFetus> {
    const fetus = await fetusModel.create(fetusData);
    return fetus;
  }

  async findById(id: string): Promise<IFetus | null> {
    const fetus = await fetusModel.findById(id);
    return fetus;
  }

  async update(id: string, fetusData: IFetus): Promise<IFetus | null> {
    const fetus = await fetusModel.findByIdAndUpdate(id,fetusData,{new:true});
    console.log("updatedd ok from repo",fetus)
    return fetus;
  }

  async findByweek(week: number): Promise<IFetus | null> {
      const fetus = await fetusModel.findOne({week:week})
      return fetus
  }

  async find(): Promise<IFetus[] | null> {
      const fetuses = await fetusModel.find({})
      return fetuses 
  }
}
