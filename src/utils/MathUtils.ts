export default class MathUtils {
  static minMax(min: number, max: number, value: number) {
    return Math.max(Math.min(value, max), min);
  }
}
