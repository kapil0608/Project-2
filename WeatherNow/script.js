
async function searchWeather() {
    const city = document.getElementById("inp-Ele").value.trim();
    const box = document.getElementById("box");

    if (city === "") {
        box.innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    window.location.href =
        "result.html?city=" + encodeURIComponent(city);
}


async function getWeather() {
    const box = document.getElementById("box");

    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");

    if (!city) {
        box.innerHTML = "<p>Please search for a city first.</p>";
        return;
    }

    box.innerHTML = "<p>Loading weather...</p>";

    try {
        // Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("City search failed.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            box.innerHTML = "<p>❌ City not found.</p>";
            return;
        }

        const location = geoData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get current weather
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Weather request failed.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Get air quality
        const airURL =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=auto`;

        const airResponse = await fetch(airURL);

        let aqi = "Not available";

        if (airResponse.ok) {
            const airData = await airResponse.json();

            if (
                airData.current &&
                airData.current.us_aqi != null
            ) {
                aqi = airData.current.us_aqi;
            }
        }

        const description =
            getWeatherDescription(current.weather_code);

        const day = new Date().toLocaleDateString("en-US", {
            weekday: "long"
        });

        box.innerHTML = `
            <h2>Weather of ${location.name}</h2>
            <p>🌡️ Temperature: ${current.temperature_2m} °C</p>
            <p>💨 Wind Speed: ${current.wind_speed_10m} km/h</p>
            <p>📅 Day: ${day}</p>
            <p>🌤️ Weather: ${description}</p>
            <p>💧 Humidity: ${current.relative_humidity_2m}%</p>
            <p>🌫️ Air Quality : ${aqi}</p>
        `;

    } catch (error) {
        console.error(error);

        box.innerHTML = `
            <p>❌ Unable to get weather data.</p>
            <p>Please check your internet connection.</p>
        `;
    }
}

function getWeatherDescription(code) {
    switch (code) {
        case 0:
            return "Clear Sky ☀️";

        case 1:
            return "Mainly Clear 🌤️";

        case 2:
            return "Partly Cloudy ⛅";

        case 3:
            return "Overcast ☁️";

        case 45:
        case 48:
            return "Fog 🌫️";

        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return "Rain 🌧️";

        case 71:
        case 73:
        case 75:
            return "Snow ❄️";

        case 95:
        case 96:
        case 99:
            return "Thunderstorm ⛈️";

        default:
            return "Weather information unavailable";
    }
}

if (window.location.pathname.endsWith("/result.html") ||
    window.location.pathname.endsWith("result.html")) {
    getWeather();
}