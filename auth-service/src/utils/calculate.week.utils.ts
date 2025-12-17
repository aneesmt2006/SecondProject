export const calculateDueDate = (lmp: Date): string => {
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280);
  return String(dueDate);
};

export const calculateCurrentWeek = (lmp: Date): string => {
  const today = new Date();
  const diffInMs = today.getTime() - lmp.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return String(Math.floor(diffInDays / 7))
};
