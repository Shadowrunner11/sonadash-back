import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getTime = (time: Date, timeZone = 'America/Lima') =>
  dayjs(time).tz(timeZone).format('HH:mm:ss');

export const getDay = (time: Date, timeZone = 'America/Lima') =>
  dayjs(time).tz(timeZone).format('DD/MM/YYYY');
