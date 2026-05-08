/* ============================================
   WEATHER DASHBOARD — JAVASCRIPT
   ============================================ */


/* ── CONFIGURATION ── */
const API_KEY = "d15cb782c5c4fa8aef2b846d8742c44e";

const WEATHER_IMAGES = {
  Clear: [
    "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1600&q=80",
    "https://images.unsplash.com/photo-1504253492562-ce7dca9e32b9?w=1600&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
  ],
  Rain: [
    "https://images.unsplash.com/photo-1428592953211-078693a4f2e4?w=1600&q=80",
    "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1600&q=80",
    "https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1600&q=80"
  ],
  Drizzle: [
    "https://images.unsplash.com/photo-1541919329513-35f7af297129?w=1600&q=80",
    "https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=1600&q=80"
  ],
  Thunderstorm: [
    "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1600&q=80",
    "https://images.unsplash.com/photo-1594760467013-64ac2b80b7d3?w=1600&q=80",
    "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?w=1600&q=80"
  ],
  Snow: [
    "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1600&q=80",
    "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1600&q=80",
    "https://images.unsplash.com/photo-1547754980-3df97fed72a8?w=1600&q=80"
  ],
  Clouds: [
    "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1600&q=80",
    "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=1600&q=80",
    "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=1600&q=80"
  ],
  Mist: [
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
  ],
  Haze: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80",
    "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1600&q=80"
  ],
  Fog: [
    "https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1600&q=80",
    "https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1600&q=80"
  ]
};

const WEATHER_ICONS = {
  Clear       : "☀️",
  Clouds      : "⛅",
  Rain        : "🌧️",
  Drizzle     : "🌦️",
  Thunderstorm: "⛈️",
  Snow        : "❄️",
  Mist        : "🌫️",
  Haze        : "🌫️",
  Fog         : "🌫️"
};


/* ── DOM ELEMENTS ── */
const searchBtn   = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const cityInput   = document.getElementById("city-input");
const errorMsg    = document.getElementById("error-msg");


/* ============================================
   🌊 RIPPLE EFFECT — applied to all .ripple-btn
   ============================================ */

document.querySelectorAll(".ripple-btn").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const wave = document.createElement("span");
    wave.classList.add("ripple-wave");
    wave.style.width  = size + "px";
    wave.style.height = size + "px";
    wave.style.left   = x + "px";
    wave.style.top    = y + "px";

    btn.appendChild(wave);
    setTimeout(() => wave.remove(), 650);
  });
});


/* ============================================
   EVENT LISTENERS
   ============================================ */

// Search by city — button click
searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();
  if (city === "") {
    showError("⚠️ Please enter a city name!");
    return;
  }
  fetchWeather(city);
  fetchForecast(city);
});

// Search — Enter key
cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") searchBtn.click();
});

// My Location — GPS
locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    showError("❌ Your browser doesn't support location detection.");
    return;
  }

  locationBtn.textContent = " Detecting...";
  locationBtn.classList.add("loading-loc");
  locationBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      resetLocationBtn();
      fetchWeatherByCoords(lat, lon);
      fetchForecastByCoords(lat, lon);
    },
    function (error) {
      resetLocationBtn();
      if (error.code === error.PERMISSION_DENIED) {
        showError("❌ Location access denied. Please allow it in your browser settings.");
      } else {
        showError("❌ Could not detect location. Try searching manually.");
      }
    }
  );
});


/* ============================================
   FETCH FUNCTIONS
   ============================================ */

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  document.getElementById("temperature").textContent = "...";
  clearError();
  try {
    const response = await fetch(url);
    const data     = await response.json();
    if (data.cod === "404") {
      showError("❌ City not found! Please check the spelling.");
      document.getElementById("temperature").textContent = "--°";
      return;
    }
    displayWeather(data);
  } catch (error) {
    showError("❌ Network error. Check your connection.");
  }
}

async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    const data     = await response.json();
    displayForecast(data.list);
  } catch (error) {
    console.error("Forecast error:", error);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    const data     = await response.json();
    displayWeather(data);
    cityInput.value = data.name;
  } catch (error) {
    showError("❌ Failed to fetch weather.");
  }
}

async function fetchForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    const data     = await response.json();
    displayForecast(data.list);
  } catch (error) {
    console.error("Forecast error:", error);
  }
}


/* ============================================
   DISPLAY FUNCTIONS
   ============================================ */

function displayWeather(data) {
  document.getElementById("city-name").textContent   = ` ${data.name}, ${data.sys.country}`;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°`;
  document.getElementById("condition").textContent   = data.weather[0].description;
  document.getElementById("humidity").textContent    = `${data.main.humidity}%`;
  document.getElementById("wind").textContent        = `${data.wind.speed} km/h`;
  setWeatherBackground(data.weather[0].main);
}

function displayForecast(list) {
  const forecastRow = document.getElementById("forecast-row");
  forecastRow.innerHTML = "";
  const daily = list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.forEach(function (day) {
    const date    = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp    = Math.round(day.main.temp);
    const icon    = WEATHER_ICONS[day.weather[0].main] || "🌡️";

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <div class="day">${dayName}</div>
      <div class="fc-icon">${icon}</div>
      <div class="fc-temp">${temp}°C</div>
    `;
    forecastRow.appendChild(card);
  });
}


/* ============================================
   HELPER FUNCTIONS
   ============================================ */

function setWeatherBackground(condition) {
  const images    = WEATHER_IMAGES[condition] || WEATHER_IMAGES["Clouds"];
  const randomUrl = images[Math.floor(Math.random() * images.length)];
  document.body.style.backgroundImage = `url('${randomUrl}')`;
}

function resetLocationBtn() {
  locationBtn.textContent = " My Location";
  locationBtn.classList.remove("loading-loc");
  locationBtn.disabled = false;
}

function showError(msg)  { errorMsg.textContent = msg;  }
function clearError()    { errorMsg.textContent = "";   }