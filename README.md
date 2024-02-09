# outabout

An Interactive Website to Find a Good Time to Get Outside

## Overview

This project is now mostly functional, but further refinements are needed. The idea is to have a website where you can put in your location and availability (i.e., which times of day you can get outside for a run, walk, hike, etc.) along with preferences for your ideal condition (temperature, humidity, and so forth).

### Current State

Probably at about version 0.9 or so. :-) I'm wrapping up the initial version of the front end of the site, where the structure and style of the page is more or less finished, and most of the interactivity (sliders responding, etc.) is in place. The site accepts text from the user and find a location or (with the user's permission) detect the location automatically, and a function is in place to calculate the optimal time to get outside. The function takes the current values of the user-preferences sliders (temperatuer and so forth), the forecast data for the user's location (once provided) and returns the overall best time and best preferred time. The function is effectively a weighted average, where (for example) temperature and precipitation count for more, and I'm looking to refine and tweak the weights.

### Next Steps

- **Tweak the function that finds the best time given a set of preferences.** Right now it finds the difference between the value forecast and the value set in the sliders. The weights of these parameters can be adjusted by the user (which is great), but given all equal weights, absolute differences within the parameters shouldn't necessarily be treated equally. For example, a 10-degree difference in temperature (arguably) shouldn't count the same as a 10-percentage-point difference in cloud cover.
- **Tidy up the layout** for smaller window widths.
- **Clean up the code** The project has grown considerably, and while I have started organizing things into modules, this can be further refined.

### Down the Road

- Time zone support (detect via browser, but also update based on location)

## Contents

```├── css

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
```

## License

Copyright (c) 2024 Benjamin Park. All rights reserved.
