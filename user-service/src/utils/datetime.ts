export const parseTimeToMilliseconds = (timeString: string) => {
  const match = /^(\d+)([smhd])$/.exec(timeString);
  if (!match) throw new Error('Invalid time format');
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};
