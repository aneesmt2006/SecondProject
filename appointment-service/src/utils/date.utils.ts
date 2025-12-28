export const parseDate = (dStr: string, tStr: string): Date => {
  try {
    const [m, d, y] = dStr.split('/').map(Number);
    let time = tStr.trim();
    const [timePart, modifier] = time.split(' ');
    let [hours, mins] = timePart!.split(':').map(Number);
    if (modifier === 'PM' && hours! < 12) hours! += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return new Date(y!, m! - 1, d, hours, mins);
  } catch (e) {
    return new Date(0);
  }
};
