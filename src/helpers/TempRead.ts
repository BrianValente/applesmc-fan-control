import fs from 'fs';
import path from 'path';

const APPLESMC_BASE_DIR = '/sys/devices/platform/applesmc.768/';
const GPU_TEMP_LABEL = 'TGDD';
const CPU_TEMP_LABELS = ['TC0F'];
const regex = /(temp)([0-9]+)(_label)/;

type FilePath = string | null;

export default class TempRead {
  cpuTempFile: FilePath;

  gpuTempFile: FilePath;

  private constructor(
    cpuTempFile: FilePath,
    gpuTempFile: FilePath,
  ) {
    this.cpuTempFile = cpuTempFile;
    this.gpuTempFile = gpuTempFile;

    console.log(`CPU temperature file: ${this.cpuTempFile}\nGPU temperature file: ${this.gpuTempFile}`);
  }

  static async build() {
    const appleSmcFiles = fs.readdirSync(APPLESMC_BASE_DIR, { encoding: 'utf8' });

    let cpuTempFile: FilePath = null;
    let gpuTempFile: FilePath = null;

    [
      ...appleSmcFiles.map((f) => [APPLESMC_BASE_DIR, f]),
    ].forEach((f) => {
      const match = f[1].match(regex);
      if (!match) return;

      const index = Number.parseInt(match[2], 10);
      const label = fs.readFileSync(path.join(f[0], `temp${index}_label`), { encoding: 'utf8' });

      if (CPU_TEMP_LABELS.find((l) => label.includes(l))) {
        cpuTempFile = path.join(f[0], `temp${index}_input`);
      } else if (label.includes(GPU_TEMP_LABEL)) {
        gpuTempFile = path.join(f[0], `temp${index}_input`);
      }
    });

    return new TempRead(cpuTempFile, gpuTempFile);
  }

  private static async getTemp(filePath: string) {
    const data = Number.parseInt(
      (await fs.promises.readFile(filePath, 'utf8')).trim(),
      10,
    ) / 1000;
    return data;
  }

  async getTemps() {
    const paths = [
      ['cpu', this.cpuTempFile],
      ['gpu', this.gpuTempFile],
    ].filter((p) => p[1] !== null) as [string, string][];

    const promises = paths.map(async (p): Promise<[string, number]> => {
      const temp = await TempRead.getTemp(p[1]);
      return [p[0], temp];
    });

    const temps = await Promise.all(promises);
    return temps;
  }

  async getAverageTemp() {
    const temps = await this.getTemps();
    return temps.reduce((a, b) => a + b[1], 0) / temps.length;
  }

  async getMaxTemp() {
    const temps = await this.getTemps();
    return Math.max(...temps.map((t) => t[1]));
  }
}
