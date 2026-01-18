// WeatherPro Dashboard - Main JavaScript
class WeatherDashboard {
    constructor() {
        this.currentWeather = null;
        this.currentLocation = null;
        this.apiKey = 'b949deba9e5847679f9122530252011'; // <― your real key
        this.updateInterval = null;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.requestGeolocation();
        this.startAutoUpdate();
        this.initializeAnimations();
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const citySearch = document.getElementById('citySearch');
        const locationBtn = document.getElementById('locationBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchCity());
        }

        if (citySearch) {
            citySearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchCity();
            });
            citySearch.addEventListener('input', (e) => this.handleAutocomplete(e.target.value));
        }

        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.requestGeolocation());
        }

        this.setupNavigation();
        this.setupUnitToggle();
    }

    setupNavigation() {
        document.querySelectorAll('nav a[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.href.includes('.html')) return; // allow normal nav
                e.preventDefault();
                this.showComingSoon();
            });
        });
    }

    setupUnitToggle() {
        document.querySelectorAll('[data-temp]').forEach(el => {
            el.addEventListener('click', () => this.toggleTemperatureUnit(el));
        });
    }

    async searchCity() {
        const searchInput = document.getElementById('citySearch');
        const city = searchInput.value.trim();
        if (!city) return this.showNotification('Please enter a city name', 'warning');

        this.showLoading(true);
        try {
            const weatherData = await this.fetchWeatherByCity(city);
            if (weatherData) {
                this.updateWeatherDisplay(weatherData);
                this.saveToSearchHistory(city);
                searchInput.value = '';
            }
        } catch (error) {
            console.error(error);
            this.showNotification('City not found. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchWeatherByCity(city) {
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
            );
            if (!res.ok) throw new Error('City not found');
            const data = await res.json();
            return this.normalizeOWM(data);
        } catch (e) {
            console.warn('OWM API failed, falling back to mock:', e);
            return new Promise(r => setTimeout(() => r(this.getMockWeatherData(city)), 600));
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            if (!res.ok) throw new Error('Coords not found');
            const data = await res.json();
            return this.normalizeOWM(data);
        } catch (e) {
            console.warn('OWM API failed, falling back to mock:', e);
            const mock = this.getMockWeatherData('Current Location');
            mock.coord = { lat, lon };
            return new Promise(r => setTimeout(() => r(mock), 600));
        }
    }

    normalizeOWM(src) {
        return {
            name: src.name,
            main: {
                temp: src.main.temp,
                feels_like: src.main.feels_like,
                humidity: src.main.humidity,
                pressure: src.main.pressure
            },
            weather: [{
                main: src.weather[0].main,
                description: src.weather[0].description,
                icon: src.weather[0].icon
            }],
            wind: { speed: src.wind.speed },
            sys: {
                sunrise: src.sys.sunrise,
                sunset: src.sys.sunset
            },
            coord: src.coord
        };
    }

    getMockWeatherData(city) {
        const conditions = [
            { main: 'Clear', description: 'clear sky', icon: '☀️', temp: 25 },
            { main: 'Clouds', description: 'few clouds', icon: '⛅', temp: 18 },
            { main: 'Rain', description: 'light rain', icon: '🌧️', temp: 12 },
            { main: 'Snow', description: 'light snow', icon: '❄️', temp: -2 },
            { main: 'Thunderstorm', description: 'thunderstorm', icon: '⛈️', temp: 15 }
        ];
        const c = conditions[Math.floor(Math.random() * conditions.length)];
        const temp = c.temp + Math.floor(Math.random() * 10) - 5;
        return {
            name: city,
            main: {
                temp: temp,
                feels_like: temp + 2,
                humidity: 60 + Math.floor(Math.random() * 30),
                pressure: 1000 + Math.floor(Math.random() * 50)
            },
            weather: [c],
            wind: { speed: 5 + Math.floor(Math.random() * 15) },
            sys: {
                sunrise: Date.now() / 1000 - 3600,
                sunset: Date.now() / 1000 + 3600
            },
            coord: {
                lat: 40.7128 + (Math.random() - 0.5) * 10,
                lon: -74.0060 + (Math.random() - 0.5) * 10
            }
        };
    }

    updateWeatherDisplay(data) {
        this.currentWeather = data;
        const emojiMap = {
            'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
            'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️'
        };
        const emoji = emojiMap[data.weather[0].main] || '☁️';

        const set = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        set('cityName', data.name);
        set('currentDate', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        set('currentTemp', `${Math.round(data.main.temp)}°`);
        set('weatherDescription', data.weather[0].description);
        set('weatherIcon', emoji);
        set('feelsLike', `${Math.round(data.main.feels_like)}°`);
        set('humidity', `${data.main.humidity}%`);
        set('windSpeed', `${Math.round(data.wind.speed * 3.6)} km/h`);
        set('pressure', `${data.main.pressure} hPa`);
        this.updateSunriseSunset(data.sys.sunrise, data.sys.sunset);
        this.updateUVIndex(Math.floor(Math.random() * 11));
        this.updateAirQuality(Math.floor(Math.random() * 200));
        this.updateHourlyForecast(data);
        this.updateWeatherTheme(data.weather[0].main);
        this.updateWeatherEffects(data.weather[0].main);
    }

    updateSunriseSunset(sunrise, sunset) {
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('sunrise', new Date(sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        set('sunset', new Date(sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }

    updateUVIndex(uv) {
        const el = document.getElementById('uvIndex');
        const desc = document.getElementById('uvDescription');
        const bar = document.getElementById('uvBar');
        if (el) el.textContent = uv;
        let description, color, width;
        if (uv <= 2) { description = 'Low'; color = '#10B981'; width = '20%'; }
        else if (uv <= 5) { description = 'Moderate'; color = '#F59E0B'; width = '50%'; }
        else if (uv <= 7) { description = 'High'; color = '#F97316'; width = '70%'; }
        else if (uv <= 10) { description = 'Very High'; color = '#EF4444'; width = '90%'; }
        else { description = 'Extreme'; color = '#8B5CF6'; width = '100%'; }
        if (desc) desc.textContent = description;
        if (bar) { bar.style.backgroundColor = color; bar.style.width = width; }
    }

    updateAirQuality(aqi) {
        const el = document.getElementById('aqi');
        const desc = document.getElementById('aqiDescription');
        const advice = document.getElementById('aqiAdvice');
        if (el) el.textContent = aqi;
        let description, adviceText, color;
        if (aqi <= 50) { description = 'Good'; adviceText = 'Air quality is satisfactory'; color = '#10B981'; }
        else if (aqi <= 100) { description = 'Moderate'; adviceText = 'Acceptable for most people'; color = '#F59E0B'; }
        else if (aqi <= 150) { description = 'Unhealthy for Sensitive'; adviceText = 'Sensitive groups may experience issues'; color = '#F97316'; }
        else if (aqi <= 200) { description = 'Unhealthy'; adviceText = 'Everyone may experience issues'; color = '#EF4444'; }
        else if (aqi <= 300) { description = 'Very Unhealthy'; adviceText = 'Health alert for everyone'; color = '#8B5CF6'; }
        else { description = 'Hazardous'; adviceText = 'Emergency conditions'; color = '#7C2D12'; }
        if (desc) desc.textContent = description;
        if (advice) advice.textContent = adviceText;
        if (el) el.style.color = color;
    }

    updateHourlyForecast(data) {
        const container = document.getElementById('hourlyForecast');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 24; i++) {
            const hour = new Date(); hour.setHours(hour.getHours() + i);
            const temp = data.main.temp + Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 3;
            const weather = Math.random() > 0.7 ? '🌧️' : Math.random() > 0.4 ? '☁️' : '☀️';
            const card = document.createElement('div');
            card.className = 'flex-shrink-0 text-center p-4 bg-white/10 rounded-lg min-w-[100px]';
            card.innerHTML = `
                <div class="text-white text-sm mb-2">${hour.toLocaleTimeString('en-US', { hour: '2-digit' })}</div>
                <div class="text-2xl mb-2">${weather}</div>
                <div class="text-white font-semibold">${Math.round(temp)}°</div>`;
            container.appendChild(card);
        }
    }

    updateWeatherTheme(weatherMain) {
        const body = document.body;
        body.classList.remove('theme-sunny', 'theme-rainy', 'theme-snowy', 'theme-cloudy');
        switch (weatherMain.toLowerCase()) {
            case 'clear': body.classList.add('theme-sunny'); break;
            case 'rain':
            case 'drizzle':
            case 'thunderstorm': body.classList.add('theme-rainy'); break;
            case 'snow': body.classList.add('theme-snowy'); break;
            case 'clouds':
            case 'mist':
            case 'fog': body.classList.add('theme-cloudy'); break;
            default: body.classList.add('theme-sunny');
        }
    }

    updateWeatherEffects(weatherMain) {
        const bg = document.getElementById('weatherBackground');
        if (!bg) return;
        bg.innerHTML = '';
        switch (weatherMain.toLowerCase()) {
            case 'rain':
            case 'drizzle': this.createRainEffect(bg); break;
            case 'snow': this.createSnowEffect(bg); break;
            case 'clear': this.createSunEffect(bg); break;
        }
    }

    createRainEffect(container) {
        const rain = document.createElement('div'); rain.className = 'rain-effect';
        for (let i = 0; i < 100; i++) {
            const drop = document.createElement('div'); drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            rain.appendChild(drop);
        }
        container.appendChild(rain);
    }

    createSnowEffect(container) {
        const snow = document.createElement('div'); snow.className = 'snow-effect';
        for (let i = 0; i < 50; i++) {
            const flake = document.createElement('div'); flake.className = 'snow-flake';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            flake.style.animationDelay = Math.random() * 2 + 's';
            snow.appendChild(flake);
        }
        container.appendChild(snow);
    }

    createSunEffect(container) {
        const sun = document.createElement('div'); sun.className = 'sun-effect'; container.appendChild(sun);
    }

    async requestGeolocation() {
        if (!navigator.geolocation) return this.showNotification('Geolocation not supported', 'warning');
        this.showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const data = await this.fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                    if (data) this.updateWeatherDisplay(data);
                } catch (e) {
                    console.error(e);
                    this.showNotification('Unable to fetch weather for your location', 'error');
                } finally {
                    this.showLoading(false);
                }
            },
            () => {
                this.showLoading(false);
                this.showNotification('Unable to access your location', 'warning');
            }
        );
    }

    handleAutocomplete(query) {
        if (query.length < 2) return;
        const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'];
        const suggestions = cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        this.showAutocompleteSuggestions(suggestions);
    }

    showAutocompleteSuggestions(suggestions) {
        const existing = document.getElementById('autocompleteDropdown');
        if (existing) existing.remove();
        if (!suggestions.length) return;
        const dropdown = document.createElement('div');
        dropdown.id = 'autocompleteDropdown';
        dropdown.className = 'absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg z-10 mt-1';
        suggestions.forEach(city => {
            const item = document.createElement('div');
            item.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800';
            item.textContent = city;
            item.addEventListener('click', () => {
                document.getElementById('citySearch').value = city;
                dropdown.remove(); this.searchCity();
            });
            dropdown.appendChild(item);
        });
        const parent = document.getElementById('citySearch').parentElement;
        parent.style.position = 'relative'; parent.appendChild(dropdown);
        setTimeout(() => document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== document.getElementById('citySearch')) dropdown.remove();
        }, { once: true }), 100);
    }

    showLoading(show) {
        this.isLoading = show;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
        const colors = {
            success: 'bg-green-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        notification.classList.add(...colors[type].split(' '));
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-1">${message}</div>
                <button class="text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => { notification.classList.add('translate-x-full'); setTimeout(() => notification.remove(), 300); }, 5000);
    }

    showComingSoon() { this.showNotification('This feature is coming soon!', 'info'); }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            if (this.currentLocation) {
                this.fetchWeatherByCoords(this.currentLocation.lat, this.currentLocation.lon)
                    .then(data => this.updateWeatherDisplay(data))
                    .catch(console.error);
            }
        }, 5 * 60 * 1000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) { clearInterval(this.updateInterval); this.updateInterval = null; }
    }

    loadUserPreferences() {
        const prefs = JSON.parse(localStorage.getItem('weatherDashboardPrefs') || '{}');
        if (prefs.units) this.currentUnits = prefs.units;
        if (prefs.lastLocation) this.currentLocation = prefs.lastLocation;
    }

    saveUserPreferences() {
        localStorage.setItem('weatherDashboardPrefs', JSON.stringify({
            units: this.currentUnits || 'metric',
            lastLocation: this.currentLocation,
            lastUpdate: Date.now()
        }));
    }

    saveToSearchHistory(city) {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (!history.includes(city)) { history.unshift(city); if (history.length > 10) history.pop(); localStorage.setItem('searchHistory', JSON.stringify(history)); }
    }

    initializeAnimations() {
        this.setupScrollAnimations(); this.setupHoverEffects(); this.initializeParticles();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
            el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; observer.observe(el);
        });
    }

    setupHoverEffects() {
        document.querySelectorAll('.hover-lift').forEach(el => {
            el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)'; });
            el.addEventListener('mouseleave', () => { el.style.transform = 'translateY(0)'; el.style.boxShadow = ''; });
        });
    }

    initializeParticles() { /* placeholder for particle system */ }

    toggleTemperatureUnit(element) {
        const currentTemp = parseFloat(element.getAttribute('data-temp'));
        const isCelsius = element.textContent.includes('°C') || !element.textContent.includes('°F');
        let newTemp, newUnit;
        if (isCelsius) { newTemp = (currentTemp * 9 / 5) + 32; newUnit = '°F'; } else { newTemp = (currentTemp - 32) * 5 / 9; newUnit = '°C'; }
        element.textContent = `${Math.round(newTemp)}${newUnit}`;
        element.setAttribute('data-temp', newTemp);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.weatherDashboard = new WeatherDashboard();
    setTimeout(() => document.querySelectorAll('.fade-in').forEach((el, i) => setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, i * 200)), 500);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.weatherDashboard?.stopAutoUpdate(); else window.weatherDashboard?.startAutoUpdate();
});

window.addEventListener('resize', () => document.body.classList.toggle('mobile', window.innerWidth < 768));

if (typeof module !== 'undefined' && module.exports) module.exports = WeatherDashboard;