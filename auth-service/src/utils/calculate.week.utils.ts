export const calculateCurrentWeek = (lmp: string) => {
  const lmpDate = new Date(lmp);
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const week = Math.floor(diffDays / 7);
  return week < 0 ? 0 : week; // prevent negative
};
