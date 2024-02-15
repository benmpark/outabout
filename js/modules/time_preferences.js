// Functions dealing with the user's time preferences

"use strict";

import {
  sunTimes,
  userAbsSelections,
  userSolarSelections,
  absTimeButtons,
  solarTimeButtons,
  defaultWeekdayTimes,
  defaultWeekendTimes,
} from "../custom_script.js";

import { daySelection, getTime } from "./utilities.js";

// MODULE VARIABLES
const absTimeButtonIds = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];

const solarTimeButtonIds = [
  "night_am",
  "civil_am",
  "golden_am",
  "morning",
  "afternoon",
  "golden_pm",
  "civil_pm",
  "night_pm",
];

const solarTimeInsertIds = [
  "pre-dawn-time",
  "dawn-time",
  "am-golden-time",
  "morning-time",
  "afternoon-time",
  "pm-golden-time",
  "dusk-time",
  "post-dusk-time",
];

/**
 * Sets the time preference options to be the fixed 24 hours of the day.
 */
function absoluteTimes() {
  document.getElementById("sun_hours").classList.add("d-none");
  document.getElementById("absolute_hours").classList.remove("d-none");
}

/**
 * Sets the time preference options to be the relative to the timing of the sun.
 */
function relativeTimes() {
  document.getElementById("absolute_hours").classList.add("d-none");
  document.getElementById("sun_hours").classList.remove("d-none");
}

/**
 * Sets the default times (weekday or weekend) once 'today' is selected.
 * @param {number} hour - The current hour of the day
 */
function setTodaysButtons(hour) {
  for (let i = 0; i < hour; i++) {
    absTimeButtons[i].setAttribute("disabled", "");
    absTimeButtons[i].checked = false;
  }

  for (let i = hour; i < 24; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
  }

  if (sunTimes == null) {
    return;
  }

  for (let s = 0; s < 8; s++) {
    if (sunTimes.today.eventHourArray[s + 1] < hour) {
      solarTimeButtons[s].setAttribute("disabled", "");
      solarTimeButtons[s].checked = false;
    } else {
      solarTimeButtons[s].removeAttribute("disabled", "");
    }
  }
}

/**
 * Sets the default times (weekday or weekend) once a future day is selected.
 */
function setFutureDaysButtons() {
  for (let i = 0; i < 8; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
    solarTimeButtons[i].removeAttribute("disabled", "");
  }
  for (let i = 8; i < 24; i++) {
    absTimeButtons[i].removeAttribute("disabled", "");
  }
}

/**
 * Checks the default times for a weekday.
 */
function toggleDefaultWeekdayTimes() {
  if (document.getElementById("choice-absolute").checked) {
    userAbsSelections[daySelection] = [6, 7, 8, 17, 18];
  } else {
    userSolarSelections[daySelection] = [1, 2, 5, 6];
  }
  showTimesAlert(true);
}

/**
 * Checks the default times for a weekend.
 */
function toggleDefaultWeekendTimes() {
  if (document.getElementById("choice-absolute").checked) {
    userAbsSelections[daySelection] = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
  } else {
    userSolarSelections[daySelection] = [3, 4, 5];
  }
  showTimesAlert(false);
}

/**
 * Checks to see if the times selected are default weekday or weekend times.
 */
function checkIfDefaultTimes() {
  let isAbsolute = document.getElementById("choice-absolute").checked;
  if (isAbsolute) {
    if (
      userAbsSelections[daySelection].length == 5 &&
      userAbsSelections[daySelection].every(
        (value, index) => value === [6, 7, 8, 17, 18][index]
      )
    ) {
      defaultWeekdayTimes.classList.add("checked");
      defaultWeekendTimes.classList.remove("checked");
    } else if (
      userAbsSelections[daySelection].length == 11 &&
      userAbsSelections[daySelection].every(
        (value, index) =>
          value === [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18][index]
      )
    ) {
      defaultWeekendTimes.classList.add("checked");
      defaultWeekdayTimes.classList.remove("checked");
    } else {
      defaultWeekdayTimes.classList.remove("checked");
      defaultWeekendTimes.classList.remove("checked");
    }
  } else {
    if (
      userSolarSelections[daySelection].length == 4 &&
      userSolarSelections[daySelection].every(
        (value, index) => value === [1, 2, 5, 6][index]
      )
    ) {
      defaultWeekdayTimes.classList.add("checked");
      defaultWeekendTimes.classList.remove("checked");
    } else if (
      userSolarSelections[daySelection].length == 3 &&
      userSolarSelections[daySelection].every(
        (value, index) => value === [3, 4, 5][index]
      )
    ) {
      defaultWeekendTimes.classList.add("checked");
      defaultWeekdayTimes.classList.remove("checked");
    } else {
      defaultWeekdayTimes.classList.remove("checked");
      defaultWeekendTimes.classList.remove("checked");
    }
  }
}

/**
 * Selects the previously selected preferred times for a particular day.
 *
 * If the user has not interacted with the preferred times yet, the function
 * will select the default weekday or weekend times, depending on the day of
 * the week selected.
 */
function toggleTimes() {
  const clockTimes = document.querySelectorAll(".clock");
  const solarTimes = document.querySelectorAll(".sun");
  clockTimes.forEach((element) => {
    element.checked =
      userAbsSelections[daySelection].includes(
        absTimeButtonIds.indexOf(element.id)
      ) &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  solarTimes.forEach((element) => {
    if (sunTimes == null) {
      element.checked = userSolarSelections[daySelection].includes(
        solarTimeButtonIds.indexOf(element.id)
      );
    } else {
      element.checked =
        userSolarSelections[daySelection].includes(
          solarTimeButtonIds.indexOf(element.id)
        ) &&
        (daySelection ||
          sunTimes.allEventHours[daySelection][
            solarTimeButtonIds.indexOf(element.id) + 1
          ] >= getTime())
          ? true
          : false;
    }
  });
}

/**
 * Displays a warning alert if all default times have already passed today.
 * @param boolean isWeekday - Whether today is a weekday or not.
 */
function showTimesAlert(isWeekday) {
  const isAbsolute = document.getElementById("choice-absolute").checked;
  const alertSpace = document.getElementById("times-alert-space");
  let hour = getTime();
  let allSome;
  let dayType;
  if (isAbsolute) {
    if (daySelection || (isWeekday && hour <= 6) || (!isWeekday && hour <= 8)) {
      alertSpace.innerHTML = ``;
      return;
    }
    if (!daySelection && isWeekday && hour > 6 && hour <= 18) {
      allSome = "Some";
      dayType = "weekday";
    } else if (!daySelection && isWeekday && hour > 18) {
      allSome = "All";
      dayType = "weekday";
    } else if (!daySelection && !isWeekday && hour > 8 && hour <= 18) {
      allSome = "Some";
      dayType = "weekend";
    } else if (!daySelection && !isWeekday && hour > 18) {
      allSome = "All";
      dayType = "weekend";
    } else {
      console.log("Something weird happened...");
    }
  } else {
    if (
      !sunTimes ||
      daySelection ||
      (isWeekday && hour <= sunTimes.allEventHours[0][1]) ||
      (!isWeekday && hour <= sunTimes.allEventHours[0][3])
    ) {
      alertSpace.innerHTML = ``;
      return;
    } else if (
      !daySelection &&
      isWeekday &&
      hour > sunTimes.allEventHours[0][1] &&
      hour <= sunTimes.allEventHours[0][6]
    ) {
      allSome = "Some";
      dayType = "weekday";
    } else if (
      !daySelection &&
      isWeekday &&
      hour > sunTimes.allEventHours[0][6]
    ) {
      allSome = "All";
      dayType = "weekday";
    } else if (
      !daySelection &&
      !isWeekday &&
      hour > sunTimes.allEventHours[0][3] &&
      hour <= sunTimes.allEventHours[0][5]
    ) {
      allSome = "Some";
      dayType = "weekend";
    } else if (
      !daySelection &&
      !isWeekday &&
      hour > sunTimes.allEventHours[0][5]
    ) {
      allSome = "All";
      dayType = "weekend";
    } else {
      console.log("Something weird happened...");
    }
  }
  alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" 
      role="alert">${allSome} of the default ${dayType} times have already passed today.<button type="button" 
      class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
}

/**
 * Hides any previously displayed alert about default times having passed.
 */
function hideTimesAlert() {
  let alertElement = document.getElementById("times-alert");
  if (alertElement) {
    alertElement.classList.remove("show");
    alertElement.classList.add("collapse");
  }
}

/**
 * Checks to see if any preferred times have been selected.
 * @returns {boolean} - true if no preferred times are checked; otherwise false.
 */
function checkIfNoTimes() {
  if (document.getElementById("choice-absolute").checked) {
    for (let i = 0; i < 24; i++) {
      if (absTimeButtons[i].checked) {
        return false;
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      if (solarTimeButtons[i].checked) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Updates the absolute times corresponding to solar events for the day selected.
 *
 * The user has to have provided a location, or else the function does nothing.
 */
function updateSolarTimes() {
  if (sunTimes == null) {
    return;
  }
  for (let i = 0; i < 8; i++) {
    let currentSpan = document.getElementById(solarTimeInsertIds[i]);
    currentSpan.innerText = sunTimes.allEvents[daySelection][i];
  }
}

/**
 * Finds and stores the time buttons checked for a particular day
 * @param {boolean} isAbsolute - True if absolute (vs solar) times are selected
 */
function getCheckedTimeButtons(isAbsolute) {
  let activeClass = isAbsolute ? ".clock" : ".sun";
  let hoursSelected = [];
  const buttons = document.querySelectorAll(activeClass);
  const checkedButtons = Array.from(buttons).filter((button) => button.checked);
  checkedButtons.forEach((button) => {
    if (isAbsolute) {
      hoursSelected.push(absTimeButtonIds.indexOf(button.id));
    } else {
      hoursSelected.push(solarTimeButtonIds.indexOf(button.id));
    }
  });
  if (isAbsolute) {
    userAbsSelections[daySelection] = hoursSelected;
  } else {
    userSolarSelections[daySelection] = hoursSelected;
  }
}

export {
  absTimeButtonIds,
  solarTimeButtonIds,
  absoluteTimes,
  relativeTimes,
  setTodaysButtons,
  setFutureDaysButtons,
  toggleDefaultWeekdayTimes,
  toggleDefaultWeekendTimes,
  checkIfDefaultTimes,
  toggleTimes,
  hideTimesAlert,
  checkIfNoTimes,
  updateSolarTimes,
  getCheckedTimeButtons,
};
