export const calculateCurrentWeek = (lmp: string) => {
  if (!lmp) return 0;
  const lmpDate = new Date(lmp);
  if (isNaN(lmpDate.getTime())) return 0;
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const week = Math.floor(diffDays / 7);
  return week < 0 ? 0 : week; // prevent negative
};

export const calculateDueDate = (lmp: string): string => {
  if (!lmp) return "";
  const lmpDate = new Date(lmp);
  if (isNaN(lmpDate.getTime())) return "";
  const dueDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
  return dueDate.toISOString().substring(0, 10);
};
