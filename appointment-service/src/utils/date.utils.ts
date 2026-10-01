export const parseDate = (dStr: string, tStr: string): Date => {
  try {
    const [m, d, y] = dStr.split("/").map(Number);
    const time = tStr.trim();
    const [timePart, modifier] = time.split(" ");
    // eslint-disable-next-line prefer-const
    let [hours, mins] = timePart!.split(":").map(Number);
    if (modifier === "PM" && hours! < 12) hours! += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return new Date(y!, m! - 1, d, hours, mins);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return new Date(0);
  }
};
