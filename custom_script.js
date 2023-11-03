// General
function toggleButtonShading(elementId) {
  elementId.classList.contains("btn-primary")
    ? elementId.classList.replace("btn-primary", "btn-outline-primary")
    : elementId.classList.replace("btn-outline-primary", "btn-primary");
}

function selectFromThree(selectId, deSelectId1, deSelectId2) {
  if (selectId.classList.contains("btn-outline-primary")) {
    selectId.classList.replace("btn-outline-primary", "btn-primary");
  }
  if (deSelectId1.classList.contains("btn-primary")) {
    deSelectId1.classList.replace("btn-primary", "btn-outline-primary");
  }
  if (deSelectId2.classList.contains("btn-primary")) {
    deSelectId2.classList.replace("btn-primary", "btn-outline-primary");
  }
}

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

function getToday() {
  const today = new Date();
  return dayToString(today.getDay());
}

function getDayAfterTomorrow() {
  const today = new Date();
  return dayToString((today.getDay() + 2) % 7);
}

// Location
locationField = document.getElementById("location");
submitButton = document.getElementById("location_submit");
locationField.addEventListener("change", () => {
  console.log(locationField.value);
});
submitButton.addEventListener("click", () => {
  console.log(locationField.value);
});

// Timeframe
function today() {
  selectFromThree(
    document.getElementById("choice_today"),
    document.getElementById("choice_tomorrow"),
    document.getElementById("choice_dayafter")
  );

  targetDay = document.getElementById("target_day");
  targetDay.innerText = "today";
}

function tomorrow() {
  selectFromThree(
    document.getElementById("choice_tomorrow"),
    document.getElementById("choice_today"),
    document.getElementById("choice_dayafter")
  );

  targetDay = document.getElementById("target_day");
  targetDay.innerText = "tomorrow";
}

function dayAfter() {
  selectFromThree(
    document.getElementById("choice_dayafter"),
    document.getElementById("choice_today"),
    document.getElementById("choice_tomorrow")
  );

  targetDay = document.getElementById("target_day");
  targetDay.innerText = getDayAfterTomorrow();
}

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

function fahrenheitToCelsius(f) {
  return ((f + 40) / 1.8 - 40).toFixed(1);
}

function mphToKmh(s) {
  return (s * 1.60934).toFixed(1);
}

let isMetric = false;

function imperialUnits() {
  toggleButtonShading(document.getElementById("imperial"));
  toggleButtonShading(document.getElementById("metric"));

  isMetric = false;

  degreeSymbols = document.querySelectorAll(".degrees");
  degreeSymbols.forEach((element) => {
    element.innerHTML = `&#8457;`;
  });
  speedSymbols = document.querySelectorAll(".speeds");
  speedSymbols.forEach((element) => {
    element.innerText = " mph";
  });
}

function metricUnits() {
  toggleButtonShading(document.getElementById("imperial"));
  toggleButtonShading(document.getElementById("metric"));

  isMetric = true;

  degreeSymbols = document.querySelectorAll(".degrees");
  degreeSymbols.forEach((element) => {
    element.innerHTML = `&#8451;`;
  });
  speedSymbols = document.querySelectorAll(".speeds");
  speedSymbols.forEach((element) => {
    element.innerText = " km/h";
  });
}

function displayTemp() {
  temperatureValue.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(temperatureSlider.value))
    : temperatureSlider.value;
}

function displayDewPoint() {
  dewPointValue.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(dewPointSlider.value))
    : dewPointSlider.value;
}

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

function displayWindSpeed() {
  windSpeedValue.innerText = isMetric
    ? mphToKmh(parseFloat(windSpeedSlider.value))
    : windSpeedSlider.value;
}

const unitsButtons = document.getElementById("imperial");
unitsButtons.addEventListener("click", function () {
  displayTemp();
  displayDewPoint();
  displayWindSpeed();
});

const metricButton = document.getElementById("metric");
metricButton.addEventListener("click", function () {
  displayTemp();
  displayDewPoint();
  displayWindSpeed();
});

const temperatureSlider = document.getElementById("temperature");
const temperatureValue = document.getElementById("temperature_value");
const temperatureLimit = document.getElementById("temp_limit");

temperatureValue.innerText = temperatureSlider.value;
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

const dewPointSlider = document.getElementById("dew_point");
const dewPointValue = document.getElementById("dewpoint_value");
const dewPointLimit = document.getElementById("dewpoint_limit");
dewPointValue.innerText = dewPointSlider.value;
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

const cloudCoverSlider = document.getElementById("cloud_cover");
const cloudCoverValue = document.getElementById("cloudcover_value");
cloudCoverValue.innerHTML = printCloudCover();
cloudCoverSlider.addEventListener("input", function () {
  cloudCoverValue.innerHTML = printCloudCover();
});

const uvSlider = document.getElementById("uv");
const uvValue = document.getElementById("uv_value");
const uvLimit = document.getElementById("uv_limit");
uvValue.innerText = uvSlider.value;
uvSlider.addEventListener("input", function () {
  uvValue.innerText = uvSlider.value;
  if (uvSlider.value == 8) {
    uvLimit.innerText = "+";
  } else {
    uvLimit.innerText = "";
  }
});

const precipitationIntensitySlider =
  document.getElementById("precip_intensity");
const precipitationIntensityValue = document.getElementById("precip_value");
precipitationIntensityValue.innerText = printPrecipitationIntensity();
precipitationIntensitySlider.addEventListener("input", function () {
  precipitationIntensityValue.innerText = printPrecipitationIntensity();
});

const windSpeedSlider = document.getElementById("wind_speed");
const windSpeedValue = document.getElementById("windspeed_value");
const windSpeedLimit = document.getElementById("windpseed_limit");
windSpeedValue.innerText = windSpeedSlider.value;
windSpeedSlider.addEventListener("input", function () {
  displayWindSpeed();
  if (windSpeedSlider.value == 30) {
    windSpeedLimit.innerText = " and blustrier";
  } else {
    windSpeedLimit.innerText = "";
  }
});

// Time Preferences Controls
function absoluteTimes() {
  toggleButtonShading(document.getElementById("choice_absolute"));
  toggleButtonShading(document.getElementById("choice_relative"));
  document.getElementById("sun_hours").classList.add("d-none");
  document.getElementById("absolute_hours").classList.remove("d-none");
}

function relativeTimes() {
  toggleButtonShading(document.getElementById("choice_absolute"));
  toggleButtonShading(document.getElementById("choice_relative"));
  document.getElementById("absolute_hours").classList.add("d-none");
  document.getElementById("sun_hours").classList.remove("d-none");
}

function toggleDefaultWeekdayTimes() {
  clockTimes = document.querySelectorAll(".clock, .sun");
  clockTimes.forEach((element) => {
    element.checked = element.classList.contains("weekday") ? true : false;
  });
}

function toggleDefaultWeekendTimes() {
  clockTimes = document.querySelectorAll(".clock, .sun");
  clockTimes.forEach((element) => {
    element.checked = element.classList.contains("weekend") ? true : false;
  });
}

// Actions to take on page load
document.getElementById("choice_dayafter").innerText = getDayAfterTomorrow();

switch (getToday()) {
  case 0:
  case 6:
    toggleDefaultWeekendTimes();
    break;
  default:
    toggleDefaultWeekdayTimes();
}
