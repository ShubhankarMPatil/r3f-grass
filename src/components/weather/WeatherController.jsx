import CloudSystem from "./CloudSystem";

export default function WeatherController({ weatherState }) {
  const { cloudDensity, rainIntensity, snowIntensity } = weatherState;

  // Determine weather type for cloud appearance
  let weatherType = "clouds";
  if (rainIntensity > 0.3) {
    weatherType = "rain";
  } else if (snowIntensity > 0.3) {
    weatherType = "snow";
  }

  // Always show clouds when any weather effect is active
  const shouldShowClouds = cloudDensity > 0.01 || rainIntensity > 0.01 || snowIntensity > 0.01;
  const effectiveDensity = Math.max(cloudDensity, rainIntensity * 0.8, snowIntensity * 0.7);

  return (
    <>
      {shouldShowClouds && (
        <CloudSystem 
          density={effectiveDensity} 
          weatherType={weatherType}
        />
      )}
    </>
  );
}