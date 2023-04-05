import { getDurationTime } from './time.utils';

describe('time.utils', () => {
  describe('getDurationTime', () => {
    it('should return the difference between two datetimes when we send two dates with different hour', () => {
      const { startHour, endHour } = { startHour: 9, endHour: 10 };
      const { startDate, endDate } = {
        startDate: new Date(new Date().setHours(startHour, 45, 0, 0)),
        endDate: new Date(new Date().setHours(endHour, 45, 0, 0)),
      };
      const diffHour = endHour - startHour;

      const result = getDurationTime(startDate, endDate);

      expect(result).toBe(`${diffHour}h 0m 0s`);
    });

    it('should return the difference between two datetimes when we send two dates with different minutes', () => {
      const { startMinutes, endMinutes } = { startMinutes: 0, endMinutes: 45 };
      const { startDate, endDate } = {
        startDate: new Date(new Date().setHours(10, startMinutes, 0, 0)),
        endDate: new Date(new Date().setHours(10, endMinutes, 0, 0)),
      };
      const diffMinutes = endMinutes - startMinutes;

      const result = getDurationTime(startDate, endDate);

      expect(result).toBe(`0h ${diffMinutes}m 0s`);
    });

    it('should return the difference between two datetimes when we send two dates with different seconds', () => {
      const { startSeconds, endSeconds } = { startSeconds: 10, endSeconds: 60 };
      const { startDate, endDate } = {
        startDate: new Date(new Date().setHours(10, 0, startSeconds, 0)),
        endDate: new Date(new Date().setHours(10, 0, endSeconds, 0)),
      };
      const diffSeconds = endSeconds - startSeconds;

      const result = getDurationTime(startDate, endDate);

      expect(result).toBe(`0h 0m ${diffSeconds}s`);
    });
  });
});
