
export const calculatePregnancyProgress = (week: number): number => {
  // Assuming 40 weeks is full term
  const progress = (week / 40) * 100;
  return Math.min(Math.round(progress), 100);
};

export const getBloodPressureStatus = (bp: string | undefined): 'Normal' | 'Abnormal' => {
  if (!bp) return 'Normal';
  // Simple check logic, e.g., 120/80
  const parts = bp.split('/');
  if (parts.length !== 2) return 'Normal';
  const systolic = parseInt(parts[0]);
  const diastolic = parseInt(parts[1]);

  if (systolic > 140 || diastolic > 90) return 'Abnormal';
  if (systolic < 90 || diastolic < 60) return 'Abnormal';
  return 'Normal';
};

export const getBloodSugarStatus = (sugar: string | undefined): 'Normal' | 'Abnormal' => {
    if(!sugar) return 'Normal';
    // Remove non-numeric chars if any
    const value = parseInt(sugar.replace(/\D/g, ''));
    if(isNaN(value)) return 'Normal';

    // Simple range check (e.g. fasting < 95, or random < 140... simplified for now)
    if(value > 140) return 'Abnormal';
    return 'Normal';
}

export const getBabyHeartRateStatus = (rate: number): 'Normal' | 'Abnormal' => {
    if(rate < 110 || rate > 160) return 'Abnormal';
    return 'Normal';
}
