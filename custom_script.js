///////////////////////////////////////////////////////////////////////////////
// CONSTANTS & CONFIGURATION //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const currentTime = new Date();
var daySelection;
var userLatitude;
var userLongitude;

///////////////////////////////////////////////////////////////////////////////
// DOM ELEMENTS SELECTION /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const locationForm = document.getElementById("location-form");
const locationField = document.getElementById("location");
const submitButton = document.getElementById("location_submit");
const autoLocationButton = document.getElementById("auto-location");

const locationName = document.getElementById("found-location");
const locationCoordinates = document.getElementById("coordinates");

const currentConditionsText = document.getElementById("current-conditions");
const forecastText = document.getElementById("forecast");

let preferenceText = document.getElementById("preferred-time-text");
let preferredScore = document.getElementById("best_preferred_score");

const absTimeButtons = document.querySelectorAll(".clock");
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

const solarTimeButtons = document.querySelectorAll(".sun");
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

// function toggleButtonShading(elementId) {
//   elementId.classList.contains("btn-primary")
//     ? elementId.classList.replace("btn-primary", "btn-outline-primary")
//     : elementId.classList.replace("btn-outline-primary", "btn-primary");
// }

// function selectFromThree(selectId, deSelectId1, deSelectId2) {
//   if (selectId.classList.contains("btn-outline-primary")) {
//     selectId.classList.replace("btn-outline-primary", "btn-primary");
//   }
//   if (deSelectId1.classList.contains("btn-primary")) {
//     deSelectId1.classList.replace("btn-primary", "btn-outline-primary");
//   }
//   if (deSelectId2.classList.contains("btn-primary")) {
//     deSelectId2.classList.replace("btn-primary", "btn-outline-primary");
//   }
// }

// Weather Condition Sliders
var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return (
    new bootstrap.Popover(popoverTriggerEl),
    {
      trigger: "focus",
    }
  );
});

const defaultWeekdayTimes = document.getElementById("default_weekday");
const defaultWeekendTimes = (document.getElementById(
  "default_weekend"
).checked = false);

const unitsButtons = document.getElementById("imperial");
const metricButton = document.getElementById("metric");

const degreeSymbols = document.querySelectorAll(".degrees");
const speedSymbols = document.querySelectorAll(".speeds");

const temperatureSlider = document.getElementById("temperature");
const temperatureValue = document.getElementById("temperature_value");
const temperatureLimit = document.getElementById("temp_limit");

const dewPointSlider = document.getElementById("dew_point");
const dewPointValue = document.getElementById("dewpoint_value");
const dewPointLimit = document.getElementById("dewpoint_limit");

const cloudCoverSlider = document.getElementById("cloud_cover");
const cloudCoverValue = document.getElementById("cloudcover_value");

const uvSlider = document.getElementById("uv");
const uvValue = document.getElementById("uv_value");
const uvLimit = document.getElementById("uv_limit");

const precipitationIntensitySlider =
  document.getElementById("precip_intensity");
const precipitationIntensityValue = document.getElementById("precip_value");

const windSpeedSlider = document.getElementById("wind_speed");
const windSpeedValue = document.getElementById("windspeed_value");
const windSpeedLimit = document.getElementById("windpseed_limit");

///////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function automaticLocation() {
  let alertSpace = document.getElementById("location-alert-space");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        getCurrentWeather(lat, lon);
      },
      function (error) {
        alertSpace.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
          Error getting geolocation: ${error.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
      },
      { enableHighAccuracy: true }
    );
  } else {
    alertSpace.innerHTML = `<div class="alert danger-warning alert-dismissible fade show" role="alert">
      Geolocation does not appear to be supported by your browser.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
  }
}

/**
 * Converts the numerical day of the week to a string.
 * @param {number} day - The numerical day of the week
 * @returns {string} The day of the week expressed as a string
 */
function dayToString(day) {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "N/A";
  }
}

/**
 * Gets the number of hours past the midnight hour.
 * @returns {number} The hour portion of the 24-hour time
 */
function getTime() {
  return currentTime.getHours();
}

/**
 * Calculates the day of the week. Used for adjusting default times.
 * @returns {number} The day of the week (e.g., 1 for Monday)
 */
function whatDay() {
  return (currentTime.getDay() + daySelection) % 7;
}

// function getToday() {
//   return dayToString(whatDay());
// }

// function getTomorrow() {
//   return dayToString(whatDay());
// }

/**
 * Figures out which day of the week the day after tomorrow is.
 * @returns {string} The day after tomorrow as a string.
 */
function getDayAfterTomorrow() {
  return dayToString((currentTime.getDay() + 2) % 7);
}

/**
 * Updates the page once the user selects the 'Today' button.
 */
function today() {
  //   selectFromThree(
  //     document.getElementById("choice_today"),
  //     document.getElementById("choice_tomorrow"),
  //     document.getElementById("choice_dayafter")
  //   );
  daySelection = 0;
  document.getElementById("target_day").innerText = "later today";
  setTodaysButtons(currentHour);
  toggleDefaultTimes();
}

/**
 * Updates the page once the user selects the 'Tomorrow' button.
 */
function tomorrow() {
  //   selectFromThree(
  //     document.getElementById("choice_tomorrow"),
  //     document.getElementById("choice_today"),
  //     document.getElementById("choice_dayafter")
  //   );
  daySelection = 1;
  document.getElementById("target_day").innerText = "tomorrow";
  hideTimesAlert();
  setFutureDaysButtons();
  toggleDefaultTimes();
}

/**
 * Updates the page once the user selects the day-after-tomorrow button.
 */
function dayAfter() {
  //   selectFromThree(
  //     document.getElementById("choice_dayafter"),
  //     document.getElementById("choice_today"),
  //     document.getElementById("choice_tomorrow")
  //   );
  daySelection = 2;
  document.getElementById("target_day").innerText = getDayAfterTomorrow();
  hideTimesAlert();
  setFutureDaysButtons();
  toggleDefaultTimes();
}

/**
 * Sets the time preference options to be the 24 hours of the day.
 */
function absoluteTimes() {
  //toggleButtonShading(document.getElementById("choice_absolute"));
  //toggleButtonShading(document.getElementById("choice_relative"));
  document.getElementById("sun_hours").classList.add("d-none");
  document.getElementById("absolute_hours").classList.remove("d-none");
}

/**
 * Sets the time preference options to be the relative to the timing of the sun.
 */
function relativeTimes() {
  //toggleButtonShading(document.getElementById("choice_absolute"));
  //toggleButtonShading(document.getElementById("choice_relative"));
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
  // document.getElementById("default_weekend").checked = false;
  // if (document.getElementById("default_weekday").checked == false) {
  //   return;
  // }
  clockTimes = document.querySelectorAll(".clock, .sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekday") &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  showTimesAlert(true);
}

/**
 * Checks the default times for a weekend.
 */
function toggleDefaultWeekendTimes() {
  // document.getElementById("default_weekday").checked = false;
  // if (
  //   document.getElementById("default_weekend").checked == false ||
  //   !daySelection
  // ) {
  //   return;
  // }
  clockTimes = document.querySelectorAll(".clock, .sun");
  clockTimes.forEach((element) => {
    element.checked =
      element.classList.contains("weekend") &&
      (daySelection || absTimeButtonIds.indexOf(element.id) >= getTime())
        ? true
        : false;
  });
  showTimesAlert(false);
}

/**
 * Toggles the default times for the currently selected day.
 */
function toggleDefaultTimes() {
  switch ((currentTime.getDay() + daySelection) % 7) {
    case 0:
    case 6:
      toggleDefaultWeekendTimes();
      break;
    default:
      toggleDefaultWeekdayTimes();
  }
}

/**
 * Displays a warning alert if all default times have already passed today.
 * @param boolean isWeekday - Whether today is a weekday or not.
 */
function showTimesAlert(isWeekday) {
  let alertSpace = document.getElementById("times-alert-space");
  let hour = getTime();
  if (!daySelection && isWeekday && hour > 6 && hour <= 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                Some of the default weekday times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && isWeekday && hour > 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                All of the default weekday times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && !isWeekday && hour > 8 && hour <= 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                Some of the default weekend times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  } else if (!daySelection && !isWeekday && hour > 18) {
    alertSpace.innerHTML = `<div id="times-alert" class="alert alert-warning alert-dismissible fade show" role="alert">
                                All of the default weekend times have already passed today.
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`;
  }
}

/**
 * Hides any previously displayed alert about default times having passed.
 */
function hideTimesAlert() {
  var alertElement = document.getElementById("times-alert");
  if (alertElement) {
    alertElement.classList.remove("show");
    alertElement.classList.add("collapse");
  }
}

/**
 * Checks to see if any preferred times have been selected.
 * @returns {boolean} True if no preferred times are checked; otherwise false.
 */
function checkIfNoTimes() {
  if (document.getElementById("choice_absolute").checked) {
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
 * Updates the best time (and score) within the user's checked times.
 */
function updatePreferredTimeAndScore() {
  if (checkIfNoTimes()) {
    preferenceText.innerHTML =
      "<em>Select times below to see your best preferred time.</em>";
    preferredScore.innerText = "";
  } else {
    preferenceText.innerHTML = `Within your preferred times, the best time is <span id="best_preferred_time"><strong>5 pm</strong></span>.`;
    // (Re)calcute score here
  }
}

/**
 * Converts degrees Fahrenheit to degrees Celsius.
 * @param {number} f - The temperature in degrees Fahrenheit
 * @returns {number} The temperature in degrees Celsius
 */
function fahrenheitToCelsius(f) {
  return ((f + 40) / 1.8 - 40).toFixed(1);
}

/**
 * Converts miles per hour to kilometers per hour.
 * @param {number} s - The speed in miles per hour
 * @returns {number} The speed in kilometers per hour
 */
function mphToKmh(s) {
  return (s * 1.60934).toFixed(1);
}

/**
 * Sets all units displayed to imperial units.
 */
function imperialUnits() {
  //toggleButtonShading(document.getElementById("imperial"));
  //toggleButtonShading(document.getElementById("metric"));

  isMetric = false;

  degreeSymbols.forEach((element) => {
    element.innerHTML = `&#8457;`;
  });
  speedSymbols.forEach((element) => {
    element.innerText = " mph";
  });
}

/**
 * Sets all units displayed to metric units.
 */
function metricUnits() {
  //toggleButtonShading(document.getElementById("imperial"));
  //toggleButtonShading(document.getElementById("metric"));

  isMetric = true;

  degreeSymbols.forEach((element) => {
    element.innerHTML = `&#8451;`;
  });

  speedSymbols.forEach((element) => {
    element.innerText = " km/h";
  });
}

/**
 * Updates the temperature slider display.
 */
function displayTemp() {
  temperatureValue.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(temperatureSlider.value))
    : temperatureSlider.value;
}

/**
 * Updates the dew point slider display.
 */
function displayDewPoint() {
  dewPointValue.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(dewPointSlider.value))
    : dewPointSlider.value;
}

/**
 * Updates the cloud cover slider display.
 */
function printCloudCover() {
  switch (cloudCoverSlider.value) {
    case "0":
      return `Sunny &#9728;`;
    case "1":
      return `Partly Cloudy &#127780;`;
    case "2":
      return `Mostly Cloudy &#9925;`;
    case "3":
      return `Overcast &#9729;`;
    default:
      return ``;
  }
}

// NB - There is no function for updating the UV Index slider because
// scale starts at 0 and has no unit conversion necessary.

/**
 * Updates the precipitation intensity slider display.
 */
function printPrecipitationIntensity() {
  switch (precipitationIntensitySlider.value) {
    case "0":
      return "None";
    case "1":
      return "Light";
    case "2":
      return "Moderate";
    case "3":
      return "Heavy";
    default:
      return "";
  }
}

/**
 * Updates the wind speed slider display.
 */
function displayWindSpeed() {
  windSpeedValue.innerText = isMetric
    ? mphToKmh(parseFloat(windSpeedSlider.value))
    : windSpeedSlider.value;
}

///////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
locationForm.addEventListener("submit", function (event) {
  handleFormSubmit(event);
});

locationField.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleFormSubmit(event);
  }
});

autoLocationButton.addEventListener("click", automaticLocation);

absTimeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", function () {
    document.getElementById("default_weekday").checked = false;
    document.getElementById("default_weekend").checked = false;

    updatePreferredTimeAndScore();
  });
});

solarTimeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", function () {
    defaultWeekdayTimes.checked = false;
    defaultWeekendTimes.checked = false;

    updatePreferredTimeAndScore();
  });
});

unitsButtons.addEventListener("click", function () {
  displayTemp();
  displayDewPoint();
  displayWindSpeed();
});

metricButton.addEventListener("click", function () {
  displayTemp();
  displayDewPoint();
  displayWindSpeed();
});

temperatureSlider.addEventListener("input", function () {
  displayTemp();
  if (temperatureSlider.value == 0) {
    temperatureLimit.innerText = " and colder";
  } else if (temperatureSlider.value == 100) {
    temperatureLimit.innerText = " and hotter";
  } else {
    temperatureLimit.innerText = "";
  }
});

dewPointSlider.addEventListener("input", function () {
  displayDewPoint();
  if (dewPointSlider.value == 40) {
    dewPointLimit.innerText = " and drier";
  } else if (dewPointSlider.value == 80) {
    dewPointLimit.innerText = " and muggier";
  } else {
    dewPointLimit.innerText = "";
  }
});

cloudCoverSlider.addEventListener("input", function () {
  cloudCoverValue.innerHTML = printCloudCover();
});

uvSlider.addEventListener("input", function () {
  uvValue.innerText = uvSlider.value;
  if (uvSlider.value == 8) {
    uvLimit.innerText = "+";
  } else {
    uvLimit.innerText = "";
  }
});

precipitationIntensitySlider.addEventListener("input", function () {
  precipitationIntensityValue.innerText = printPrecipitationIntensity();
});

windSpeedSlider.addEventListener("input", function () {
  displayWindSpeed();
  if (windSpeedSlider.value == 30) {
    windSpeedLimit.innerText = " and blustrier";
  } else {
    windSpeedLimit.innerText = "";
  }
});

///////////////////////////////////////////////////////////////////////////////
// INITIALIZATION & SETUP /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var currentHour = getTime();

if (currentHour <= 18) {
  document.getElementById("choice_today").checked = true;
  today();
} else {
  document.getElementById("choice_tomorrow").checked = true;
  tomorrow();
}

document.getElementById("day-after-text").innerText = getDayAfterTomorrow();

let isMetric = false;

temperatureValue.innerText = temperatureSlider.value;
dewPointValue.innerText = dewPointSlider.value;
cloudCoverValue.innerHTML = printCloudCover();
uvValue.innerText = uvSlider.value;
precipitationIntensityValue.innerText = printPrecipitationIntensity();
windSpeedValue.innerText = windSpeedSlider.value;

///////////////////////////////////////////////////////////////////////////////
// API REQUESTS AND DATA HANDLING /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function handleFormSubmit(event) {
  event.preventDefault();
  processUserLocation(locationField.value);
}

function processCoordinates(longitude, latitude) {
  let latitudeOut =
    latitude >= 0
      ? `${latitude.toFixed(4)}&deg;N`
      : `${latitude.toFixed(4) * -1}&deg;S`;

  let longitudeOut =
    longitude >= 0
      ? `${longitude.toFixed(4)}&deg;E`
      : `${longitude.toFixed(4) * -1}&deg;W`;

  return `(${latitudeOut}, ${longitudeOut})`;
}

function isUSAZipCode(str) {
  return /^\d{5}(-\d{4})?$/.test(str);
}

function processUserLocation(entry) {
  var url;
  if (isUSAZipCode(entry)) {
    url = `https://nominatim.openstreetmap.org/search?q=${entry}&countrycodes=US&format=geocodejson`;
  } else {
    url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      entry
    )}&format=geocodejson`;
  }

  console.log(url); // remove later
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // These next two lines are just for developing
      locationName.innerText = `${data.features[0].properties.geocoding.label}`;
      userLatitude = data.features[0].geometry.coordinates[1];
      userLongitude = data.features[0].geometry.coordinates[0];

      locationCoordinates.innerHTML = processCoordinates(
        userLongitude,
        userLatitude
      );

      getCurrentWeather(userLatitude, userLongitude);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function getCurrentWeather(lat, long) {
  var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,apparent_temperature,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let currentTemp = data.current.temperature_2m;
      let currentFeelsLike = data.current.apparent_temperature;
      let tempUnit = data.current_units.temperature_2m;
      currentConditionsText.innerHTML = `<em>Currently</em> ${currentTemp}${tempUnit} (feels like ${currentFeelsLike}${tempUnit})`;
    })
    .catch(function (error) {
      console.log(error);
    });
}

///////////////////////////////////////////////////////////////////////////////
// OTHER MODULES //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
