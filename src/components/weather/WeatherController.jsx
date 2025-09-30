import { useEffect } from "react";
import RainSystem from "./RainSystem";
import SnowSystem from "./SnowSystem";
import CloudSystem from "./CloudSystem";


export default function WeatherController({ weatherState }) {
  const { cloudDensity, rainIntensity, snowIntensity } = weatherState;

  return (
    <>
      {/* Always render weather systems but control their intensity */}
      {rainIntensity > 0.01 && <RainSystem intensity={rainIntensity} />}
      {snowIntensity > 0.01 && <SnowSystem intensity={snowIntensity} />}
      {cloudDensity > 0.01 && <CloudSystem density={cloudDensity} />}
    </>
  );
}
