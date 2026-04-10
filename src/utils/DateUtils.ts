export class DateUtils {
  static getDatePlusDays = (days = 0): Date => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now;
  };
}
