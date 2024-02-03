"use strict";

///////////////////////////////////////////////////////////////////////////////
// OTHER MODULES //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import {
  automaticLocation,
  getTime,
  getDayAfterTomorrow,
  today,
  tomorrow,
  dayAfter,
  absoluteTimes,
  relativeTimes,
  setTodaysButtons,
  toggleDefaultWeekdayTimes,
  toggleDefaultWeekendTimes,
  updateSolarTimes,
  getArrayIndex,
  updatePreferredTimeAndScore,
  imperialUnits,
  metricUnits,
  displayTemp,
  displayDewPoint,
  printCloudCover,
  printPrecipitationIntensity,
  displayWindSpeed,
} from "./modules/utilities.js";
import { CurrentConditions, ForecastData } from "./modules/weather_data.js";
import SolarData from "./modules/solar_data.js";

///////////////////////////////////////////////////////////////////////////////
// CONSTANTS & CONFIGURATION //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var currentTime = new Date();
var daySelection;
var userLatitude;
var userLongitude;
var sunTimes;

///////////////////////////////////////////////////////////////////////////////
// DOM ELEMENTS SELECTION /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const locationForm = document.getElementById("location-form");
const locationField = document.getElementById("location");
// const submitButton = document.getElementById("location_submit");
const autoLocationButton = document.getElementById("auto-location");

const locationName = document.getElementById("found-location");
const locationCoordinates = document.getElementById("coordinates");

const currentConditionsText = document.getElementById("current-conditions");
// const forecastText = document.getElementById("forecast");

const absTimeButtons = document.querySelectorAll(".clock");
// const absTimeButtonIds = [
//   "12am",
//   "1am",
//   "2am",
//   "3am",
//   "4am",
//   "5am",
//   "6am",
//   "7am",
//   "8am",
//   "9am",
//   "10am",
//   "11am",
//   "12pm",
//   "1pm",
//   "2pm",
//   "3pm",
//   "4pm",
//   "5pm",
//   "6pm",
//   "7pm",
//   "8pm",
//   "9pm",
//   "10pm",
//   "11pm",
// ];

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
// const solarTimeInsertIds = [
//   "pre-dawn-time",
//   "dawn-time",
//   "am-golden-time",
//   "morning-time",
//   "afternoon-time",
//   "pm-golden-time",
//   "dusk-time",
//   "post-dusk-time",
// ];

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

const defaultWeekdayTimes = document.getElementById("default-weekday");
const defaultWeekendTimes = document.getElementById("default-weekend");

const imperialButtons = [
  document.getElementById("imperial0"),
  document.getElementById("imperial1"),
];
const metricButtons = [
  document.getElementById("metric0"),
  document.getElementById("metric1"),
];

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

imperialButtons.forEach((imperialButton) => {
  imperialButton.addEventListener("click", function () {
    isMetric = false;
    imperialButtons[0].checked = true;
    imperialButtons[1].checked = true;
    metricButtons[0].checked = false;
    metricButtons[1].checked = false;
    imperialUnits(degreeSymbols, speedSymbols);
    displayTemp(
      temperatureValue,
      temperatureSlider,
      temperatureLimit,
      isMetric
    );
    displayDewPoint(dewPointValue, dewPointSlider, dewPointLimit, isMetric);
    displayWindSpeed(windSpeedValue, windSpeedSlider, windSpeedLimit, isMetric);
  });
});

metricButtons.forEach((metricButton) => {
  metricButton.addEventListener("click", function () {
    isMetric = true;
    imperialButtons[0].checked = false;
    imperialButtons[1].checked = false;
    metricButtons[0].checked = true;
    metricButtons[1].checked = true;
    metricUnits(degreeSymbols, speedSymbols);
    displayTemp(
      temperatureValue,
      temperatureSlider,
      temperatureLimit,
      isMetric
    );
    displayDewPoint(dewPointValue, dewPointSlider, dewPointLimit, isMetric);
    displayWindSpeed(windSpeedValue, windSpeedSlider, windSpeedLimit, isMetric);
  });
});

document.getElementById("choice-today").addEventListener("click", function () {
  daySelection = 0;
  today(currentTime, absTimeButtons, solarTimeButtons, sunTimes);
  updateSolarTimes(sunTimes, 0);
});
document
  .getElementById("choice-tomorrow")
  .addEventListener("click", function () {
    daySelection = 1;
    tomorrow(currentTime, absTimeButtons, solarTimeButtons, sunTimes);
    updateSolarTimes(sunTimes, 1);
  });
document
  .getElementById("choice-dayafter")
  .addEventListener("click", function () {
    daySelection = 2;
    dayAfter(currentTime, absTimeButtons, solarTimeButtons, sunTimes);
    updateSolarTimes(sunTimes, 2);
  });

defaultWeekdayTimes.addEventListener("click", function () {
  toggleDefaultWeekdayTimes(currentTime, daySelection, sunTimes);
});

defaultWeekendTimes.addEventListener("click", function () {
  toggleDefaultWeekendTimes(currentTime, daySelection, sunTimes);
});

document
  .getElementById("choice-absolute")
  .addEventListener("click", function () {
    absoluteTimes();
    updatePreferredTimeAndScore(absTimeButtons, solarTimeButtons);
  });

document
  .getElementById("choice-relative")
  .addEventListener("click", function () {
    relativeTimes();
    updatePreferredTimeAndScore(absTimeButtons, solarTimeButtons);
  });

absTimeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", function () {
    defaultWeekdayTimes.checked = false;
    defaultWeekendTimes.checked = false;
    updatePreferredTimeAndScore(absTimeButtons, solarTimeButtons);
  });
});

solarTimeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", function () {
    defaultWeekdayTimes.checked = false;
    defaultWeekendTimes.checked = false;
    updatePreferredTimeAndScore(absTimeButtons, solarTimeButtons);
  });
});

temperatureSlider.addEventListener("input", function () {
  displayTemp(temperatureValue, temperatureSlider, temperatureLimit, isMetric);
});

dewPointSlider.addEventListener("input", function () {
  displayDewPoint(dewPointValue, dewPointSlider, dewPointLimit, isMetric);
});

cloudCoverSlider.addEventListener("input", function () {
  cloudCoverValue.innerHTML = printCloudCover(cloudCoverSlider.value);
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
  precipitationIntensityValue.innerText = printPrecipitationIntensity(
    precipitationIntensitySlider.value
  );
});

windSpeedSlider.addEventListener("input", function () {
  displayWindSpeed(windSpeedValue, windSpeedSlider, windSpeedLimit, isMetric);
});

///////////////////////////////////////////////////////////////////////////////
// INITIALIZATION & SETUP /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var currentHour = getTime(currentTime);

if (currentHour <= 18) {
  document.getElementById("choice-today").checked = true;
  daySelection = 0;
  today(currentTime, absTimeButtons, solarTimeButtons, sunTimes);
} else {
  document.getElementById("choice-tomorrow").checked = true;
  daySelection = 1;
  tomorrow(currentTime, absTimeButtons, solarTimeButtons, sunTimes);
}

document.getElementById("day-after-text").innerText =
  getDayAfterTomorrow(currentTime);

let isMetric = false;

temperatureValue.innerText = temperatureSlider.value;
dewPointValue.innerText = dewPointSlider.value;
cloudCoverValue.innerHTML = printCloudCover(cloudCoverSlider.value);
uvValue.innerText = uvSlider.value;
precipitationIntensityValue.innerText = printPrecipitationIntensity(
  precipitationIntensitySlider.value
);
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

      getSolarTimes(userLatitude, userLongitude);
      getCurrentWeather(userLatitude, userLongitude);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function getSolarTimes(lat, long) {
  var date = new Date();
  var start = date.toISOString().split("T")[0];
  date.setDate(date.getDate() + 2);
  var end = date.toISOString().split("T")[0];
  var url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${long}&date_start=${start}&date_end=${end}`;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      sunTimes = new SolarData(data.results);
      updateSolarTimes(sunTimes, daySelection);
      if (daySelection == 0) {
        setTodaysButtons(
          currentHour,
          absTimeButtons,
          solarTimeButtons,
          sunTimes
        );
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function getCurrentWeather(lat, long) {
  var units = isMetric
    ? ""
    : "&temperature_unit=fahrenheit&wind_speed_unit=mph";
  var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,apparent_temperature,is_day&hourly=temperature_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min${units}&timezone=auto&forecast_days=3`;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var localConditions = new CurrentConditions(
        data.current_units.temperature_2m,
        data.current.temperature_2m,
        data.current.apparent_temperature,
        data.current.is_day,
        data.hourly.precipitation_probability[
          getArrayIndex(currentTime.getHours(), daySelection)
        ]
      );

      var forecastConditions = new ForecastData(
        data.hourly_units.temperature_2m,
        data.daily.temperature_2m_max,
        data.daily.temperature_2m_min,
        data.hourly.temperature_2m,
        data.hourly.dew_point_2m,
        data.hourly.cloud_cover,
        data.hourly.uv_index,
        data.hourly.precipitation,
        data.hourly.wind_speed_10m
      );

      document.getElementById(
        "today-hi-lo"
      ).innerHTML = `Hi: ${forecastConditions.dailyHighs[0].toFixed(0)}${
        forecastConditions.units
      } Lo: ${forecastConditions.dailyLows[0].toFixed(0)}${
        forecastConditions.units
      }`;
      document.getElementById(
        "tomorrow-hi-lo"
      ).innerHTML = `Hi: ${forecastConditions.dailyHighs[1].toFixed(0)}${
        forecastConditions.units
      } Lo: ${forecastConditions.dailyLows[1].toFixed(0)}${
        forecastConditions.units
      }`;
      document.getElementById(
        "day-after-hi-lo"
      ).innerHTML = `Hi: ${forecastConditions.dailyHighs[2].toFixed(0)}${
        forecastConditions.units
      } Lo: ${forecastConditions.dailyLows[2].toFixed(0)}${
        forecastConditions.units
      }`;

      currentConditionsText.innerHTML = localConditions.displayHTML;
    })
    .catch(function (error) {
      console.log(error);
    });
}

export { processUserLocation };
