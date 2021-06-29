import { OpeningTimes, Space } from "./types";
import { format } from "date-fns";
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

  const zero = 0;
  const fifteen = 15;
  const thirty = 30;
  const fourtyFive = 45;

  const utcDate = utcToZonedTime(now, space.timeZone);

  const convertedTime = format(utcDate, "yyyy-mm-dd k-mm")
    .toString()
    .split(" ")[1];

  let convertedHour = parseInt(convertedTime.replace(/^0+/, "").split("-")[0]);
  const convertedMinute = parseInt(
    convertedTime.replace(/^0+/, "").split("-")[1]
  );

  let minuteWithNotice = convertedMinute + space.minimumNotice;

  if (minuteWithNotice > zero && minuteWithNotice < fifteen)
    minuteWithNotice = fifteen;
  if (minuteWithNotice > fifteen && minuteWithNotice < thirty)
    minuteWithNotice = thirty;
  if (minuteWithNotice > thirty && minuteWithNotice < fourtyFive)
    minuteWithNotice = fourtyFive;
  if (minuteWithNotice > fourtyFive) {
    minuteWithNotice = zero;
    convertedHour++;
  }

  const selectedDay = Object.entries(space)[0][1][numberOfDays];

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
          minute: minuteWithNotice,
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
