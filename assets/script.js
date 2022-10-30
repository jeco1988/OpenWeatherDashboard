var apiKey = "47f166773e351368285402b79068ea73";
var savedSearches = [];

// search history
var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

    // creating a new entry
    var searchHistoryEntry = $("<p>");
    searchHistoryEntry.addClass("past-search");
    searchHistoryEntry.text(cityName);

    // creating container for previously searched
    var searchEntryContainer = $("<div>");
    searchEntryContainer.addClass("past-search-container");

    // append entry to search history
    searchEntryContainer.append(searchHistoryEntry);

    var searchHistoryContainerEl = $("#search-history-container");
    searchHistoryContainerEl.append(searchEntryContainer);

    if (savedSearches.length > 0){
        // updating savedSearches array
        var previousSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(previousSavedSearches);
    }
        // pushing to savedSearches array
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));

    // search reset
    $("#search-input").val("");

};

// populate search history container
var loadSearchHistory = function() {
    var savedSearchHistory = localStorage.getItem("savedSearches");

    // no previous - return false
    if (!savedSearchHistory) {
        return false;
    }

    // search history string into array
    savedSearchHistory = JSON.parse(savedSearchHistory);

    for (var i = 0; i < savedSearchHistory.length; i++) {
        searchHistoryList(savedSearchHistory[i]);
    }
};

var currentWeatherSection = function(cityName) {
    // get data OpenWeather API
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // city longitude & latitude coordinates
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`)
                // get response from One Call API
                .then(function(response) {
                    return response.json();
                })
                // get and apply data to current weather section
                .then(function(response){
                    searchHistoryList(cityName);

                // adding various elements to current weather container
                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("D/M/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);

                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0C");

                    var currentHumidity = $("#current-humidity");
                    currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " m/s");

                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);

                    // UV index colour
                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >= 3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }
                })
        })
        .catch(function(err) {
            // reset search input
            $("#search-input").val("");

            // error if input incorrect
            alert("City could not be found, please try again.");
        });
};

var fiveDayForecastSection = function(cityName) {
    // get data OpenWeather API
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            // city longitude & latitude coordinates
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`)
                // get response from One Call API
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);

                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text("5-Day Forecast:")

                    // setup 5 day forecast
                    for (var i = 1; i <= 5; i++) {
                        var futureCard = $(".future-card");
                        futureCard.addClass("future-card-details");

                        // adding date
                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("D/M/YYYY");
                        futureDate.text(date);

                        // adding appropriate icon
                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

                        // adding temperature
                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temperature: " + response.daily[i].temp.day + " \u00B0C");

                        // adding humidity
                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
                    }
                })
        })
};

$("#search-form").on("submit", function() {
    event.preventDefault();
    
    // get city name
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        // alert if submitted input is empty
        alert("Please enter the name of a city.");
        event.preventDefault();
    } else {
        currentWeatherSection(cityName);
        fiveDayForecastSection(cityName);
    }
});

// call when search history item clicked
$("#search-history-container").on("click", "p", function() {
    var previousCityName = $(this).text();
    currentWeatherSection(previousCityName);
    fiveDayForecastSection(previousCityName);

    var previousCityClicked = $(this);
    previousCityClicked.remove();
});

loadSearchHistory();