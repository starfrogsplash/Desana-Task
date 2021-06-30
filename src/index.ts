import { OpeningTimes, Space } from "./types";
import { format, addDays } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

/**
 * Fetches upcoming availability for a space
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 */
export const fetchAvailability = (
  space: Space,
  numberOfDays: number,
  now: Date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, OpeningTimes> => {
  const dateFormatted = format(now, "yyyy-MM-dd").toString();

  const addedDays = addDays(now, numberOfDays);

  const utcDate = utcToZonedTime(addedDays, space.timeZone);

  const convertedTime = format(utcDate, "k-mm").toString();

  const isoDay = format(utcDate, "i").toString();

  let convertedHour = parseInt(convertedTime.replace(/^0+/, "").split("-")[0]);
  const convertedMinute = parseInt(
    convertedTime.replace(/^0+/, "").split("-")[1]
  );

  const minuteWithNotice = convertedMinute + space.minimumNotice;

  const roundedMinute = (Math.ceil(minuteWithNotice / 15) * 15) % 60;

  if (roundedMinute === 0) {
    convertedHour++;
  }

  const selectedDay = Object.entries(space)[0][1][isoDay];

  const openHour = selectedDay.open.hour;
  const openMinutes = selectedDay.open.minute;

  const closeHour = selectedDay.close.hour;
  const closeMinutes = selectedDay.close.minute;

  if (convertedHour < openHour) {
    return {
      [dateFormatted]: {
        open: {
          hour: openHour,
          minute: openMinutes,
        },
        close: {
          hour: closeHour,
          minute: closeMinutes,
        },
      },
    };
  }

  if (convertedHour > openHour && convertedHour < closeHour) {
    return {
      [dateFormatted]: {
        open: {
          hour: convertedHour,
          minute: roundedMinute,
        },
        close: {
          hour: closeHour,
          minute: closeMinutes,
        },
      },
    };
  }

  return { [dateFormatted]: {} };
};
