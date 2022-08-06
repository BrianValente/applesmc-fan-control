import fs from 'fs';
import path from 'path';

import MathUtils from '../utils/MathUtils';

const BASE_DIR = '/sys/devices/platform/applesmc.768/';
const MAX_SPEED = 6500;
const MIN_SPEED = 2000;
const regex = /(fan)([0-9]+)(_label)/;

export default class FanControl {
  // eslint-disable-next-line class-methods-use-this
  async setFanManual(index: number, manual: boolean) {
    const fanPath = path.join(BASE_DIR, `fan${index}_manual`);
    await fs.promises.writeFile(fanPath, manual ? '1' : '0');
  }

  // eslint-disable-next-line class-methods-use-this
  async setFanSpeed(index: number, speedPercentage: number) {
    const speedRpm = speedPercentage === 0
      ? 0
      : MathUtils.minMax(
        MIN_SPEED,
        MAX_SPEED,
        speedPercentage * (MAX_SPEED - MIN_SPEED) + MIN_SPEED,
      ).toFixed(0);
    const tempPath = path.join(BASE_DIR, `fan${index}_output`);
    await fs.promises.writeFile(tempPath, `${speedRpm}`);
  }

  // eslint-disable-next-line class-methods-use-this
  async getFanCount() {
    const files = await fs.promises.readdir(BASE_DIR, {});
    const fanLabels = files.filter((f) => f.match(regex));

    return fanLabels.length;
  }

  async getFans() {
    const fanCount = await this.getFanCount();
    const fans = (Array.from(new Array(fanCount))).map((_, i) => i + 1);

    return fans;
  }
}
