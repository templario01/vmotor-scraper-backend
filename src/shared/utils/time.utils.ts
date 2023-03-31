export function getDurationTime(startTime: Date, endTime: Date) {
  const timeDiffInMs = endTime.getTime() - startTime.getTime();

  return timeDiffInMs / (1000 * 60);
}
