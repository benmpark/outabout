"use strict";

///////////////////////////////////////////////////////////////////////////////
// OTHER MODULES //////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

import {
  daySelection,
  automaticLocation,
  getTime,
  getDayAfterTomorrow,
  applyDay,
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
export let currentTime = new Date();
let userLatitude;
let userLongitude;
export let sunTimes;
export let weatherForecast;

///////////////////////////////////////////////////////////////////////////////
// DOM ELEMENTS SELECTION /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

const dayButtons = document.querySelectorAll(".day-button");
const locationForm = document.getElementById("location-form");
const locationField = document.getElementById("location");
const autoLocationButton = document.getElementById("auto-location");

const locationName = document.getElementById("found-location");
const locationCoordinates = document.getElementById("coordinates");

const currentConditionsText = document.getElementById("current-conditions");
// const forecastText = document.getElementById("forecast");

export const absTimeButtons = document.querySelectorAll(".clock");
export const solarTimeButtons = document.querySelectorAll(".sun");
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

export const temperatureSlider = document.getElementById("temperature");
const temperatureValue = document.getElementById("temperature_value");
const temperatureLimit = document.getElementById("temp_limit");

export const dewPointSlider = document.getElementById("dew_point");
const dewPointValue = document.getElementById("dewpoint_value");
const dewPointLimit = document.getElementById("dewpoint_limit");

export const cloudCoverSlider = document.getElementById("cloud_cover");
const cloudCoverValue = document.getElementById("cloudcover_value");

export const uvSlider = document.getElementById("uv");
const uvValue = document.getElementById("uv_value");
const uvLimit = document.getElementById("uv_limit");

export const precipitationIntensitySlider =
  document.getElementById("precip_intensity");
const precipitationIntensityValue = document.getElementById("precip_value");

export const windSpeedSlider = document.getElementById("wind_speed");
const windSpeedValue = document.getElementById("windspeed_value");
const windSpeedLimit = document.getElementById("windpseed_limit");

///////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
dayButtons.forEach((dayButton) => {
  dayButton.addEventListener("click", function (event) {
    applyDay(event.target.id);
  });
});

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

defaultWeekdayTimes.addEventListener("click", function () {
  toggleDefaultWeekdayTimes();
});

defaultWeekendTimes.addEventListener("click", function () {
  toggleDefaultWeekendTimes();
});

document
  .getElementById("choice-absolute")
  .addEventListener("click", function () {
    absoluteTimes();
    updatePreferredTimeAndScore();
  });

document
  .getElementById("choice-relative")
  .addEventListener("click", function () {
    relativeTimes();
    updatePreferredTimeAndScore();
  });

absTimeButtons.forEach((timeButton) => {
  timeButton.addEventListener("click", function () {
    defaultWeekdayTimes.checked = false;
    defaultWeekendTimes.checked = false;
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

temperatureSlider.addEventListener("input", function () {
  displayTemp(temperatureValue, temperatureSlider, temperatureLimit, isMetric);
  updatePreferredTimeAndScore();
});

dewPointSlider.addEventListener("input", function () {
  displayDewPoint(dewPointValue, dewPointSlider, dewPointLimit, isMetric);
  updatePreferredTimeAndScore();
});

cloudCoverSlider.addEventListener("input", function () {
  cloudCoverValue.innerHTML = printCloudCover(cloudCoverSlider.value);
  updatePreferredTimeAndScore();
});

uvSlider.addEventListener("input", function () {
  uvValue.innerText = uvSlider.value;
  if (uvSlider.value == 8) {
    uvLimit.innerText = "+";
  } else {
    uvLimit.innerText = "";
  }
  updatePreferredTimeAndScore();
});

precipitationIntensitySlider.addEventListener("input", function () {
  precipitationIntensityValue.innerText = printPrecipitationIntensity(
    precipitationIntensitySlider.value
  );
  updatePreferredTimeAndScore();
});

windSpeedSlider.addEventListener("input", function () {
  displayWindSpeed(windSpeedValue, windSpeedSlider, windSpeedLimit, isMetric);
  updatePreferredTimeAndScore();
});

///////////////////////////////////////////////////////////////////////////////
// INITIALIZATION & SETUP /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var currentHour = getTime(currentTime);

if (currentHour <= 18) {
  document.getElementById("choice-today").checked = true;
  applyDay("choice-today");
} else {
  document.getElementById("choice-tomorrow").checked = true;
  applyDay("choice-tomorrow");
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

  //   console.log(url); // remove later
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // These next two lines are (maybe?) just for developing
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
      updateSolarTimes();
      if (daySelection == 0) {
        setTodaysButtons(currentHour);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function getCurrentWeather(lat, long) {
  //   var units = isMetric
  var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,apparent_temperature,is_day&hourly=temperature_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=3`;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var localConditions = new CurrentConditions(
        data.current.temperature_2m,
        data.current.apparent_temperature,
        data.current.is_day,
        data.hourly.precipitation_probability[
          getArrayIndex(currentTime.getHours(), daySelection)
        ]
      );

      weatherForecast = new ForecastData(
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
      ).innerHTML = `Hi: ${weatherForecast.dailyHighs[0].toFixed(0)}${
        weatherForecast.units
      } Lo: ${weatherForecast.dailyLows[0].toFixed(0)}${weatherForecast.units}`;
      document.getElementById(
        "tomorrow-hi-lo"
      ).innerHTML = `Hi: ${weatherForecast.dailyHighs[1].toFixed(0)}${
        weatherForecast.units
      } Lo: ${weatherForecast.dailyLows[1].toFixed(0)}${weatherForecast.units}`;
      document.getElementById(
        "day-after-hi-lo"
      ).innerHTML = `Hi: ${weatherForecast.dailyHighs[2].toFixed(0)}${
        weatherForecast.units
      } Lo: ${weatherForecast.dailyLows[2].toFixed(0)}${weatherForecast.units}`;

      currentConditionsText.innerHTML = localConditions.displayHTML;
      console.log("Attempting to update preferred time and score...");
      updatePreferredTimeAndScore();
    })
    .catch(function (error) {
      console.log(error);
    });
}

export { currentHour, processUserLocation };
