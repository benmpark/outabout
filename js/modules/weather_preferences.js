// Functions dealing with the user's preferred weather conditions

"use strict";

import {
  parameterIncludeArray,
  isMetric,
  localConditions,
} from "../custom_script.js";

import {
  fahrenheitToCelsius,
  mphToKmh,
  inchesToMillimeters,
} from "./utilities.js";

/**
 * Checks to see if at least one weather parameter has been included.
 * @returns {boolean}
 */
function checkIfNoParameters() {
  for (let i = 0; i < 6; i++) {
    if (parameterIncludeArray[i] == 1) {
      return false;
    }
  }
  return true;
}

/**
 * Shows the relevant forecast data for a given hour.
 * @param {ForecastData} - the custom ForecastData object
 * @param {number} hour – the number of hours since midnight of the current day
 * @param {boolean} isMetric - whether the units preference is metric
 * @returns {string} - HTML-formatted string containing forecast information.
 */
function displayForecastData(forecast, hour, isMetric) {
  let temp = Math.round(forecast.hourlyTemps[hour]);
  let dewPoint = Math.round(forecast.hourlyDewPoints[hour]);
  let cloudCover = forecast.hourlyCloudCover[hour];
  let uv = Math.round(forecast.hourlyUV[hour]);
  let windSpeed = forecast.hourlyWind[hour];
  let precip = forecast.hourlyPrecip[hour];
  if (isMetric) {
    temp = fahrenheitToCelsius(temp);
    dewPoint = fahrenheitToCelsius(dewPoint);
    windSpeed = mphToKmh(windSpeed);
    precip = inchesToMillimeters(precip);
  }
  let units = isMetric
    ? [`&#8451;`, ` mm/hr`, `km/h`]
    : [`&#8457;`, `"/hr`, `mph`];
  let outputHTML = `<strong>Forecast:</strong> ${temp}${units[0]} (Dew Point ${dewPoint}${units[0]}), Cloud Cover ${cloudCover}&percnt;, UV Index ${uv}, Wind Speed ${windSpeed} ${units[2]}, Precipitation ${precip}${units[1]}`;
  return outputHTML;
}

/**
 * Updates the displayed current conditions.
 */
function updateCurrentConditions() {
  const currentTemp = document.getElementById("current-condition-temp");
  const currentApparent = document.getElementById(
    "current-condition-dew-point"
  );
  if (currentTemp != null) {
    if (isMetric) {
      currentTemp.innerHTML = `${
        Math.round(fahrenheitToCelsius(localConditions.currentTemp) * 10) / 10
      }&#8451;`;
      currentApparent.innerHTML = `${
        Math.round(fahrenheitToCelsius(localConditions.apparentTemp) * 10) / 10
      }&#8451;`;
    } else {
      currentTemp.innerHTML = `${Math.round(
        localConditions.currentTemp
      )}&#8457;`;
      currentApparent.innerHTML = `${Math.round(
        localConditions.apparentTemp
      )}&#8457;`;
    }
  }
}

/**
 * Updates the temperature slider display.
 * @param {HTMLElement} text - The text displayed from the slider value
 * @param {HTMLInputElement} slider - The slider itself
 * @param {HTMLElement} limit - The span following the numerical value
 * @param {boolean} isMetric – If the user has selected to display metric units
 */
function displayTemp(text, slider, limit, isMetric) {
  text.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(slider.value))
    : slider.value;
  if (slider.value == 0) {
    limit.innerHTML = `&nbsp;and colder&nbsp;&#129482;`;
  } else if (slider.value <= 32) {
    limit.innerHTML = `&nbsp;&#129398;`;
  } else if (slider.value < 50) {
    limit.innerHTML = `&nbsp;&#128556;`;
  } else if (slider.value < 60) {
    limit.innerHTML = `&nbsp;&#128578;`;
  } else if (slider.value < 80) {
    limit.innerHTML = `&nbsp;&#128512;`;
  } else if (slider.value < 100) {
    limit.innerHTML = `&nbsp;&#129397;`;
  } else if (slider.value == 100) {
    limit.innerHTML = `&nbsp;and hotter&nbsp;&#129760;`;
  } else {
    limit.innerText = "";
  }
}

/**
 * Updates the dew point slider display.
 * @param {HTMLElement} text - The text displayed from the slider value
 * @param {HTMLInputElement} slider - The slider itself
 * @param {HTMLElement} limit - The span following the numerical value
 * @param {boolean} isMetric – If the user has selected to display metric units
 */
function displayDewPoint(text, slider, limit, isMetric) {
  text.innerText = isMetric
    ? fahrenheitToCelsius(parseFloat(slider.value))
    : slider.value;
  if (slider.value == 40) {
    limit.innerHTML = `&nbsp;and drier&nbsp;&#127964;`;
  } else if (slider.value < 50) {
    limit.innerHTML = `&nbsp;&#127964;`;
  } else if (slider.value < 65) {
    limit.innerHTML = `&nbsp;&#128578;`;
  } else if (slider.value < 75) {
    limit.innerHTML = `&nbsp;&#129494;`;
  } else if (slider.value < 80) {
    limit.innerHTML = `&nbsp;&#128548;`;
  } else if (slider.value == 80) {
    limit.innerHTML = `&nbsp;and muggier&nbsp;&#128548;`;
  } else {
    limit.innerText = "";
  }
}

/**
 * Updates the cloud cover slider display.
 * @param {string} value - The value of the slider
 * @returns {string} - HTML-formatted string of the information.
 */
function printCloudCover(value) {
  if (Number(value) < 10) {
    return `${value}&percnt;&nbsp;&nbsp;&#9728;`;
  } else if (Number(value) < 40) {
    return `${value}&percnt;&nbsp;&nbsp;&#127780;`;
  } else if (Number(value) < 70) {
    return `${value}&percnt;&nbsp;&nbsp;&#9925;`;
  } else if (Number(value) <= 100) {
    return `${value}&percnt;&nbsp;&nbsp;&#9729;`;
  } else {
    return ``;
  }
}

/**
 * Colors the text associated with the UV slider
 * @param {HTMLElement} span - The span containing the text
 * @param {string} value - The value of the slider
 */
function colorUvValue(span, value) {
  switch (value) {
    case "0":
      span.style.setProperty("color", "black");
      break;
    case "1":
      span.style.setProperty("color", "#42da24");
      break;
    case "2":
      span.style.setProperty("color", "#42da24");
      break;
    case "3":
      span.style.setProperty("color", "#d5c321");
      break;
    case "4":
      span.style.setProperty("color", "#d39420");
      break;
    case "5":
      span.style.setProperty("color", "#d16b1f");
      break;
    case "6":
      span.style.setProperty("color", "#cc4721");
      break;
    case "7":
      span.style.setProperty("color", "#cc4721");
      break;
    case "8":
      span.style.setProperty("color", "#bc061e");
      break;
  }
}

/**
 * Updates the wind speed slider display.
 * @param {HTMLElement} text - The text displayed from the slider value
 * @param {HTMLInputElement} slider - The slider itself
 * @param {HTMLElement} limit - The span following the numerical value
 * @param {boolean} isMetric – If the user has selected to display metric units
 */
function displayWindSpeed(text, slider, limit, isMetric) {
  text.innerText = isMetric ? mphToKmh(parseFloat(slider.value)) : slider.value;
  if (slider.value == 0) {
    limit.innerHTML = ``;
  } else if (slider.value > 0 && slider.value <= 10) {
    limit.innerHTML = `&nbsp;&#127811;`;
  } else if (slider.value <= 20) {
    limit.innerHTML = `&nbsp;&#127788;`;
  } else if (slider.value < 30) {
    limit.innerHTML = `&nbsp;&#128168;`;
  } else if (slider.value == 30) {
    limit.innerHTML = `&nbsp;and blustrier&nbsp;&#128168;`;
  } else {
    limit.innerHTML = ``;
  }
}

/**
 * Updates the precipitation intensity slider display.
 * @param {string} value - The value of the slider
 * @param {boolean} isMetric – If the user has selected to display metric units
 * @returns {string} - HTML-formatted string of the information.
 */
function printPrecipitationIntensity(value, isMetric) {
  const units = isMetric ? `&nbsp;mm/hr` : `"/hr`;
  if (Number(value) == 0) {
    return "None";
  } else if (Number(value) < 0.1) {
    return `${value}<span id="precip-rate">${units}</span> <span style="font-weight: 200;">(light)</span>`;
  } else if (Number(value) < 0.3) {
    return `${value}<span id="precip-rate">${units}</span> <span style="font-weight: 200;">(moderate)</span>`;
  } else if (Number(value) == 0.3) {
    return `${value}<span id="precip-rate">${units}+</span> <span style="font-weight: 200;">(heavy)</span>`;
  } else {
    return ``;
  }
}

export {
  checkIfNoParameters,
  displayForecastData,
  updateCurrentConditions,
  displayTemp,
  displayDewPoint,
  printCloudCover,
  colorUvValue,
  displayWindSpeed,
  printPrecipitationIntensity,
};
