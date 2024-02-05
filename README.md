# outabout

An Interactive Website to Find a Good Time to Get Outside

## Overview

This project is now mostly functional, but further refinements are needed. The idea is to have a website where you can put in your location and availability (i.e., which times of day you can get outside for a run, walk, hike, etc.) along with preferences for your ideal condition (temperature, humidity, and so forth).

### Current State

Probably at about version 0.9 or so. :-) I'm wrapping up the initial version of the front end of the site, where the structure and style of the page is more or less finished, and most of the interactivity (sliders responding, etc.) is in place. The site accepts text from the user and find a location or (with the user's permission) detect the location automatically, and a function is in place to calculate the optimal time to get outside. The function takes the current values of the user-preferences sliders (temperatuer and so forth), the forecast data for the user's location (once provided) and returns the overall best time and best preferred time. The function is effectively a weighted average, where (for example) temperature and precipitation count for more, and I'm looking to refine and tweak the weights.

### Next Steps

- The site can recognize the user's preferred times when in the "absolute" time view (i.e., specific hours of the day), but while the "relative to sun" times are accurate (once a location is provided), I still need to make it so that the checked "sun" times are converted to absolute times for the aforementioned function.
- Tidy up the layout.
- Clean up the code... the project has grown considerably, and while I have started organizing things into modules, this can be further refined.

### Down the Road

- Give the user more fine-grain control: e.g., don't care about cloud cover? Exclude it from the calculations. Dew point more important than precipitation? Congrats on being a weather nerd, and let's also provide the option to set your own weights/preferences.
- Time zone support (detect via browser, but also update based on location)

## Contents

├── css
│ ├── custom.css
├── img
├── js
│ ├── modules
│ │ ├── preferred_time.js
│ │ ├── solar_data.js
│ │ ├── utilities.js
│ │ ├── weather_data.js
│ ├── custom_script.js
├── index.html
├── README.md

## License

Copyright (c) 2024 Benjamin Park. All rights reserved.
