import { expect } from 'chai';

import MathUtils from './MathUtils';

describe('MathUtils', () => {
  describe('minMax', () => {
    it('returns min', () => {
      expect(MathUtils.minMax(0, 1, -1)).to.eq(0);
    });

    it('returns max', () => {
      expect(MathUtils.minMax(0, 1, 2)).to.eq(1);
    });

    it('returns value', () => {
      expect(MathUtils.minMax(0, 1, 0.5)).to.eq(0.5);
    });
  });
});
