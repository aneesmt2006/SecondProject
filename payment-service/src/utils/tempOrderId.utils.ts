import { nanoid } from "nanoid";

export function generateTempOrderId() {
  return "ORDER_" + nanoid(10);
}
