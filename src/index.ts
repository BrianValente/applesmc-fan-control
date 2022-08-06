import BezierEasing from 'bezier-easing';

import FanControl from './helpers/FanControl';
import TempRead from './helpers/TempRead';
import MathUtils from './utils/MathUtils';
import sleep from './utils/sleep';

const REFRESH_DELAY_MS = 1000;
const CACHE_SIZE = 15;

let stopSignal = false;
let startPromise: Promise<void>;
let fansOn = true;

const start = async () => {
  const tempRead = await TempRead.build();
  const fanControl = new FanControl();

  const [fullSpeedTemp, turnOnTemp, turnOffTemp] = [85, 60, 55];
  // const easing = BezierEasing(0.63, 0.75, 0.18, 1);
  const easing = BezierEasing(1, 0, 0.75, 1);
  const fans = await fanControl.getFans();
  const previousTemps: number[] = [];

  const getSpeedForTemp = (temp: number) => (
    easing(
      MathUtils.minMax(0, 1, (temp - turnOffTemp) / (fullSpeedTemp - turnOffTemp)),
    )
  );

  const setFansToManual = async () => {
    await Promise.all(fans.map((f) => fanControl.setFanManual(f, true)));
  };
  await setFansToManual();
  setInterval(setFansToManual, REFRESH_DELAY_MS * 10);

  const setFansSpeed = async (speed: number) => {
    await Promise.all(
      fans.map(async (fanId) => {
        // await fanControl.setFanManual(fanId, true);
        await fanControl.setFanSpeed(fanId, speed);
      }),
    );
  };

  const loop = async () => {
    const currentTemp = await tempRead.getMaxTemp();

    previousTemps.push(currentTemp);
    while (previousTemps.length > CACHE_SIZE) previousTemps.shift();

    const temp = currentTemp < fullSpeedTemp
      ? previousTemps
        .reduce(
          (a, b) => a + b,
          0,
        ) / previousTemps.length
      : currentTemp;

    const speed = !fansOn && temp < turnOnTemp ? 0 : getSpeedForTemp(temp);
    fansOn = speed > 0;

    await setFansSpeed(speed);
    await sleep(REFRESH_DELAY_MS);
  };

  const shutdown = async () => {
    console.log('Stopping service');

    stopSignal = true;
    if (startPromise) await startPromise;

    const promises = fans.map((f) => fanControl.setFanManual(f, false));
    await Promise.all(promises);

    console.log('Service stopped');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // eslint-disable-next-line no-await-in-loop
  while (!stopSignal) await loop();
};

startPromise = start();
