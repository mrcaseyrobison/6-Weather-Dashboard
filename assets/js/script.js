// Global Variables
const userSearchHistory = [];

const openWeatherAPI = "https://api.openweathermap.org";
const openWeatherAPIKey = "93599ab684518639511e1336572d35c0";

const userSearch = document.getElementById("search-button");
const userInput = document.getElementById("search-input");
const todayWeather = document.getElementById("today");
const weatherForecast = document.getElementById("forecast");
const searchHistory = document.getElementById("search-history");
const clearSearchHistory = document.getElementById("clear-search")

// Use Day.JS to render time zones
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Search on button click 
function citySearch(event) {
    let search = userInput.value.trim();
    fetchCoords(search);
    userInput.value = '';
}

// Display past searches in a list
function displaySearchHistory() {
    searchHistory.innerHTML ="";

// For loop to list array of user search history
for (let i = userSearchHistory.length; i >= 0; i--) {
    const historyBtn = document.createElement('button');
    historyBtn.setAttribute("type", "button");
    historyBtn.setAttribute("today");
    historyBtn.classList.add('history-btn');
    historyBtn.setAttribute('data-search', searchHistory[i]);
    historyBtn.textContent = userSearchHistory[i];
    searchHistory.append[historyBtn];
    }
}

// Save search history to local storage and to display it
function writeHistory(search) {
    if(userSearchHistory.indexOf(search) !== -1){
        return;
    }
    userSearchHistory.push(search);
    
    localStorage.setItem('search-history', JSON.stringify(userSearchHistory));
    displaySearchHistory();
}

// Function to retrieve from local storage
function getSearchHistory() {
    const searchArchive = localStorage.getItem('search-history');
    if (searchArchive) {
        userSearchHistory = JSON.parse(searchArchive);
    }
    displaySearchHistory();
}

// Fetch Latitude & Longitude from weatherAPI
function fetchCoords(search) {
    const apiURL = `${openWeatherAPI}/geo/1.0/direct?q=${search}&appid=${openWeatherAPIKey}`;
    fetch(apiURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        if (!data[0]) {
            alert('You must choose a real city!');
        } else {
            let cityData = data[0];
            let cityName = cityData.name;
            let lat = cityData.lat;
            let lon = cityData.lon;
            let cityCountry = cityData.country;
            writeHistory(search);
            fetchWeather(cityName, cityCountry, lat, lon);
        }
    })
}

// Function to fetch weather data from weatherAPI
function fetchWeather (cityName, cityCountry, lat, lon) {
    const weather = `${openWeatherAPI}/data/2.5/onecall?lat=${lat}&long=${lon}&units=imperial&exclude=minutely,hourly&appid=${openWeatherAPIKey}`;
    fetch(weather)
    .then(function(response) {
        return response.json();
    })
    .then (function(data) {
        displayData(cityName, cityCountry, data);
    });
}

// Function to display weather data from weatherAPI
function displayData(cityName, cityCountry, data) {
    displayToday(cityName, cityCountry, data.current, data.timezone);
    displayForecast(data.daily, data.timezone)
}

// Function to render HTML from data
function renderTodayWeather(cityName, cityCountry, weather, timezone) {
    let data = dayjs().tz(timezone).format('MM/DD/YYYY');
    // Store data from API to variables
    let temp = weather.temp;
    let iconURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    let iconDescription = weather.weather[0].description || weather[0].main;
    let wind = weather.wind_speed;
    let humidity = weather.humidity;
    let uvIndex = weather.uvi;

    // Create elements from data
    let cityNameEl = document.createElement('h2');
    let tempEl = document.createElement('p');
    let weatherIcon = document.createElement('img');
    let windEl = document.createElement('p');
    let humidityEl = document.createElement('p');
    let uvIndexEl = document.createElement('p');
    let uvBadge = document.createElement('button');

    // UVI badges
    weatherIcon.setAttribute('src', iconURL);
    weatherIcon.setAttribute('alt', iconDescription);
    weatherIcon.setAttribute('class', 'weather-img');
    uvBadge.classList.add('btn', 'btn-sm');

    if (uvIndex < 3) {
        uvBadge.classList.add('btn-success');
    } else if (uvIndex < 7) {
        uvBadge.classList.add('btn-warning');
    } else {
        uvBadge.classList.add('btn-danger')
    }

    // Render card elements to HTML
    cityNameEl.textContent = `Current Weather for ${cityName}, ${cityCountry} ($${data})`;
    tempEl.textContent = `Temperature: ${temp} F`;
    windEl.textContent = `Wind Speed: ${wind} MPH`;
    humidityEl.textContent = `Humidity: ${humidity}%`;
    uvIndexEl.textContent = `UV Index: `;
    uvBadge.textContent = uvIndex;
    uvIndexEl.append(uvBadge);

    // Use append to dynamically display data
    todayWeather.innerHTML = "";
    todayWeather.append(cityNameEl, weatherIcon, tempEl, windEl, humidityEl, uvIndexEl);
    } 
    
    // Fetch 5-Day Forecast
    function displayForecast(forecast, timezone) {
        let forecastStart = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
        let forecastEnd = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

        let fiveDayHeaderEl = document.createElement('h4');
        fiveDayHeaderEl.setAttribute('class', 'col-12');
        weatherForecast.innerHTML="";
        fiveDayHeaderEl.textContent = "5-Day Forecast";
        weatherForecast.append(fiveDayHeaderEl);

        // For loop to cycle through data
        for (let i = 0; i < forecast.length; i++) {
            if (forecast[i].dt >= forecastStart && forecast[i].dt < forecastEnd) {
                renderForecastCard(forecast[i], timezone);
            }
        }
    }

    // Render Forecast Cards
    function displayForecastCard(forecast, timezone) {
        let date = forecast.dt;
        let iconURL = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
        let iconDescription = forecast.weather[0].description;
        let forecastTemp = forecast.temp.day;
        let {humidity} = forecast;
        let forecastWind = forecast.wind.speed;
        
        let col = document.createElement('div');
        let card = document.createElement('div');
        let cardBody = document.createElement('div');
        let cardTitle = document.createElement('h4');
        let weatherIcon = document.createElement('img');
        let tempEl = document.createElement('p');
        let windEl = document.createElement('p');
        let humidityEl = document.createElement('p');

        col.append(card);
        card.append(cardBody);
        cardBody.append(cardBody, weatherIcon, tempEl, windEl, humidityEl);

        col.setAttribute('class', 'ol-md no gutters forecast-card');
        card.setAttribute('class', 'card bg-primary h-100 text-white');
        cardBody.setAttribute('class', 'card-bdy p-2');
        cardTitle.setAttribute('class', 'card-text');
        tempEl.textContent = `Temp: ${forecastTemp} F`;
        windEl.textContent = `Wind Speed: ${forecastWind} MPH`;
        humidityEl.textContent = `${humidity} %`;

        weatherForecast.append(col);
    }

    // Function to recall data from previous searches
    function previousSearch(event) {
        if (!event.target.matches('.btn-history')) {
            return;
        }
        let btn = event.target;
        let search = btn.getAttribute('data-search');
        fetchCoords(search);
    }

    // Button to clear previous search history
    function clearHistory(event) {
        event.preventDefault();
        userSearchHistory = localStorage.getItem('search-history');
        userSearchHistory = [];
        localStorage.setItem('search-history', JSON.stringify(userSearchHistory));
        searchHistory.innerHTML = "";
        todayWeather.innerHTML = "";
        weatherForecast.innerHTML= "";
        return;
    }

    getSearchHistory();

    userSearch.addEventListener('click', citySearch);
    searchHistory.addEventListener('click', previousSearch);
    clearSearchHistory.addEventListener('click', clearHistory);

