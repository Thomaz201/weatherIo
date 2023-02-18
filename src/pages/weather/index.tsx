import axios, { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import { FaMapMarkerAlt, FaSearch, FaWater, FaWind } from "react-icons/fa";

import notFoundImage from '../../assets/404.png';
import clearWeatherImage from '../../assets/clear.png';
import cloudWeatherImage from '../../assets/cloud.png';
import mistWeatherImage from '../../assets/mist.png';
import rainWeatherImage from '../../assets/rain.png';
import snowWeatherImage from '../../assets/snow.png';

import styles from './weather.module.scss';

interface WeatherResponseDTO {
  weather: {
    main: 'Clear' | 'Clouds' | 'Mist' | 'Rain' | 'Snow';
    description: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

interface WeatherDTO {
  weather: {
    type: 'Clear' | 'Clouds' | 'Mist' | 'Rain' | 'Snow';
    description: string;
  };
  temperature: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  humidity: number;
  windSpeed: number;
}

const weatherImages = {
  Clear: clearWeatherImage,
  Clouds: cloudWeatherImage,
  Mist: mistWeatherImage,
  Rain: rainWeatherImage,
  Snow: snowWeatherImage,
}

export const WeatherPage: React.FC = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherDTO | undefined>();
  const [isNotFoundError, setIsNotFoundError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await axios.get<WeatherResponseDTO>(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=pt_br&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`)

      const weatherData: WeatherDTO = {
        weather: {
          description: data.weather[0].description,
          type: data.weather[0].main
        },
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: {
          temp: Math.round(data.main.temp),
          feels_like: data.main.feels_like,
          temp_max: data.main.temp_max,
          temp_min: data.main.temp_min,
        }
      }

      setIsNotFoundError(false);

      setWeather(weatherData);
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setWeather(undefined);

        setIsNotFoundError(true);
        return;
      }

      setIsNotFoundError(false);
      setWeather(undefined);
      alert('Ocorreu um erro!')
    }
  }

  return (
    <div className={`${styles.container} ${weather ? styles.containerWeather : isNotFoundError ? styles.containerWeatherNotFound : ''}`}>
      <form onSubmit={handleSubmit}>
        <FaMapMarkerAlt size={28} />

        <input
          type="text"
          placeholder="Enter your location"
          onChange={(event) => setLocation(event.target.value)}
          value={location}
        />

        <button type="submit">
          <FaSearch size={22} />
        </button>

      </form>

      {isNotFoundError && (
        <>
          <div className={`${styles.notFound} ${isNotFoundError && styles.fadeIn}`}>
            <img src={notFoundImage} alt="Location not found" />
            <p>Ooops! Localização não encontrada 😕</p>
          </div>
        </>
      )}

      {weather && (
        <>
          <div className={`${styles.weatherBox} ${weather && styles.fadeIn}`}>
            <img src={weatherImages[weather.weather.type]} alt="" />
            <p className={styles.temperature}>{weather.temperature.temp}<span>°C</span></p>
            <p className={styles.description}>{weather.weather.description}</p>
          </div>

          <div className={`${styles.weatherDetails} ${weather && styles.fadeIn}`}>
            <div className={styles.humidity}>
              <FaWater size={26} />
              <div className={styles.text}>
                <p>{weather.humidity}% Humidade</p>
              </div>
            </div>

            <div className={styles.wind}>
              <FaWind size={26} />
              <div className={styles.text}>
                <p>{weather.windSpeed}Km/h Velocidade</p>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  )
}