
/* eslint-disable import/prefer-default-export */
import moment from 'moment';
import { addDays, getMonthNames, getNumberOfDaysInMonth } from './date';


const MONDAY_FIRST = [6, 0, 1, 2, 3, 4, 5];

function dayShouldBeActive(date, startDate, endDate, firstDayOfMonth, lastDayOfMonth) {
  if (date > lastDayOfMonth) {
    return endDate > lastDayOfMonth && startDate < lastDayOfMonth;
  }

  return startDate < firstDayOfMonth && endDate >= firstDayOfMonth;
}

export function getDaysOfMonth(monthNumber, year, startDate, endDate, minDate, maxDate, disableRange, firstDayMonday) {
  const startDayOfMonth = moment([year, monthNumber]);
  const daysToAdd = getNumberOfDaysInMonth(monthNumber, year);

  const days = [];

  const startWeekOffset = firstDayMonday ? MONDAY_FIRST[startDayOfMonth.day()] : startDayOfMonth.day();
  const firstMonthDay = startDayOfMonth.toDate();
  const daysToCompleteRows = (startWeekOffset + daysToAdd) % 7;
  const lastRowNextMonthDays = daysToCompleteRows ? 7 - daysToCompleteRows : 0;

  for (let i = -startWeekOffset; i < daysToAdd + lastRowNextMonthDays; i++) {
    const date = addDays(firstMonthDay, i);
    const day = date.getDate();
    const month = date.getMonth();
    const fullDay = day < 10 ? `0${day}` : String(day);
    const fullMonth = month < 10 ? `0${month}` : String(month);
    const id = `${date.getFullYear()}-${fullMonth}-${fullDay}`;

    let isOnSelectedRange = !minDate && !maxDate;

    isOnSelectedRange = (!minDate || minDate && date >= minDate) && (!maxDate || maxDate && date <= maxDate);

    const isOutOfRange = !!(minDate && date < minDate || maxDate && date > maxDate);
    const isMonthDate = i >= 0 && i < daysToAdd;
    let isStartDate = false;
    let isEndDate = false;
    let isActive = false;

    if (endDate && startDate && !disableRange) {
      isStartDate = isMonthDate && date.getTime() === startDate.getTime();
      isEndDate = isMonthDate && date.getTime() === endDate.getTime();

      if (!isMonthDate) {
        const lastDayOfMonth = moment(firstMonthDay).endOf('month').toDate();
        const firstDayOfMonth = moment(firstMonthDay).startOf('month').toDate();

        isActive = dayShouldBeActive(date, startDate, endDate, firstDayOfMonth, lastDayOfMonth);
      } else {
        isActive = date >= startDate && date <= endDate;
      }
    } else if (isMonthDate && startDate && date.getTime() === startDate.getTime()) {
      isStartDate = true;
      isEndDate = true;
      isActive = true;
    }

    const today = moment().format('YYYY-MM-DD');
    const isToday = moment(date).format('YYYY-MM-DD') === today;

    days.push({
      id: `${monthNumber}-${id}`,
      date,
      isToday,
      isMonthDate,
      isActive,
      isStartDate,
      isEndDate,
      isOutOfRange,
      isVisible: isOnSelectedRange && isMonthDate
    });
  }

  return days;
}

export function getMonthsList(startingMonth, monthsLength, visibleMonthsCount, startDate, locale, monthsStrings) {
  const months = [];
  const MONTH_STRINGS = monthsStrings.length ? monthsStrings : getMonthNames(locale);

  let year = startingMonth.getFullYear();
  let monthNumber = startingMonth.getMonth();
  let count = 0;

  for (let monthCount = 0; monthCount < monthsLength; monthCount++) {
    let isVisible = false;

    if (count < visibleMonthsCount) {
      const current = moment([year, monthNumber]).startOf('month');
      isVisible = startDate && current.toDate() >= moment(startDate).startOf('month').toDate() || !startDate;

      count += isVisible ? 1 : 0;
    }

    months.push({
      id: `${year}-${monthNumber}`,
      monthNumber,
      year,
      name: `${MONTH_STRINGS[monthNumber]} ${year}`,
      isVisible
    });

    year += monthNumber < 11 ? 0 : 1;
    monthNumber = monthNumber < 11 ? monthNumber + 1 : 0;
  }

  return months;
}

export function viewableItemsChanged(first, last, info) {
  try {
    const firstItemVisible = info.viewableItems[0];
    const lastVisibleItem = info.viewableItems[info.viewableItems.length - 1];
    const firstViewableIndex = firstItemVisible.index || 0;
    const lastViewableIndex = lastVisibleItem.index || last;

    return firstViewableIndex !== first || lastViewableIndex !== last;
  } catch (e) {
    return false;
  }
}