(() => {
	'use strict';

	const $ = (...selectors) => selectors.map(s => document.querySelector(s)).find(Boolean);
	const search = $('form', '#search-form', '.search-form');
	const input = $('input[type="search"]', 'input[name="city"]', 'input[placeholder*="city" i]');
	const button = $('button[type="submit"]', '#search-button', '.search-button');
	const status = $('#status', '.status', '.message');
	const city = $('#city', '.city', '[data-city]');
	const temperature = $('#temperature', '.temperature', '[data-temperature]');
	const description = $('#description', '.description', '[data-description]');
	const details = $('#details', '.details', '[data-details]');

	const setText = (element, value) => {
		if (element) element.textContent = value;
	};

	async function loadWeather(place) {
		setText(status, 'Loading…');
		if (button) button.disabled = true;
		try {
			const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
			if (!locationResponse.ok) throw new Error('Location request failed');
			const locationData = await locationResponse.json();
			const location = locationData.results?.[0];
			if (!location) throw new Error('City not found');

			const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`);
			if (!weatherResponse.ok) throw new Error('Weather request failed');
			const data = await weatherResponse.json();
			const current = data.current;
			if (!current) throw new Error('No weather data found');

			const descriptions = {
				0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
				45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Drizzle',
				55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
				71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers',
				81: 'Rain showers', 82: 'Heavy rain showers', 95: 'Thunderstorm',
				96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
			};
			setText(city, location.name);
			setText(temperature, `${Math.round(current.temperature_2m)}°C`);
			setText(description, descriptions[current.weather_code] || 'Unknown conditions');
			setText(details, `Feels like ${Math.round(current.apparent_temperature)}°C · Humidity ${current.relative_humidity_2m}% · Wind ${Math.round(current.wind_speed_10m)} km/h`);
			setText(status, '');
		} catch (error) {
			setText(status, 'Unable to load weather. Check the city and try again.');
			console.error(error);
		} finally {
			if (button) button.disabled = false;
		}
	}

	if (search) search.addEventListener('submit', event => {
		event.preventDefault();
		const place = input?.value.trim();
		if (place) loadWeather(place);
	});

	if (input) {
		input.addEventListener('keydown', event => {
			if (event.key === 'Enter' && !search) loadWeather(input.value.trim());
		});
	}

	
})();
