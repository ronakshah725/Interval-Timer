export const validateDuration = (minutes: string): number => {
  const parsed = parseInt(minutes, 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return parsed * 60; // Convert to seconds
};

export const validateBlockTitle = (title: string): string => {
  return title.trim() || 'Untitled Block';
};