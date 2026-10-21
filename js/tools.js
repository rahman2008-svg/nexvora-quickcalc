/**
 * NexVora QuickCalc - Everyday Calculation Tools
 * Percentage & Discount Calculators
 * Copyright © 2026 NexVora Labs Ofc. All Rights Reserved.
 * Developer: Prince AR Abdur Rahman
 */

const safeT = (key, fallback) => (typeof t === 'function' ? t(key) : fallback);

const NexVoraTools = {
  /**
   * Safe number formatting with optional currency and locale
   */
  formatNumber(val, decimals = 2) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return '0';
    const num = Number(val);
    // If it's a clean integer, don't force decimals unless required
    if (Number.isInteger(num)) {
      return num.toLocaleString('en-US');
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Mode 1: Calculate X percent of Y
   * Formula: (X / 100) * Y
   */
  calcPercentOf(percent, total) {
    const p = parseFloat(percent);
    const y = parseFloat(total);

    if (Number.isNaN(p) || Number.isNaN(y)) {
      throw new Error(safeT('percErrInvalid', 'Please enter valid numbers.'));
    }

    const result = (p / 100) * y;
    const cleanRes = NexVoraCalculator.cleanFloat(result);

    return {
      result: cleanRes,
      formula: `(${p} ÷ 100) × ${y}`,
      explanation: `${p}% of ${y} is ${cleanRes}`
    };
  },

  /**
   * Mode 2: Calculate what percentage X is of Y
   * Formula: (X / Y) * 100
   */
  calcWhatPercentIs(part, total) {
    const x = parseFloat(part);
    const y = parseFloat(total);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(safeT('percErrInvalid', 'Please enter valid numbers.'));
    }
    if (y === 0) {
      throw new Error(safeT('percErrZeroDenom', 'Value cannot be zero for this calculation.'));
    }

    const result = (x / y) * 100;
    const cleanRes = NexVoraCalculator.cleanFloat(result);

    return {
      result: cleanRes,
      formula: `(${x} ÷ ${y}) × 100`,
      explanation: `${x} is ${cleanRes}% of ${y}`
    };
  },

  /**
   * Mode 3: Percentage Increase from X to Y
   * Formula: ((Y - X) / X) * 100
   */
  calcPercentIncrease(initial, finalVal) {
    const x = parseFloat(initial);
    const y = parseFloat(finalVal);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(safeT('percErrInvalid', 'Please enter valid numbers.'));
    }
    if (x === 0) {
      throw new Error(safeT('percErrZeroDenom', 'Value cannot be zero for this calculation.'));
    }

    const diff = y - x;
    const result = (diff / x) * 100;
    const cleanRes = NexVoraCalculator.cleanFloat(result);

    return {
      result: cleanRes,
      difference: NexVoraCalculator.cleanFloat(diff),
      formula: `((${y} - ${x}) ÷ ${x}) × 100`,
      explanation: `From ${x} to ${y} is an increase of ${cleanRes}%`
    };
  },

  /**
   * Mode 4: Percentage Decrease from X to Y
   * Formula: ((X - Y) / X) * 100
   */
  calcPercentDecrease(initial, finalVal) {
    const x = parseFloat(initial);
    const y = parseFloat(finalVal);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(safeT('percErrInvalid', 'Please enter valid numbers.'));
    }
    if (x === 0) {
      throw new Error(safeT('percErrZeroDenom', 'Value cannot be zero for this calculation.'));
    }

    const diff = x - y;
    const result = (diff / x) * 100;
    const cleanRes = NexVoraCalculator.cleanFloat(result);

    return {
      result: cleanRes,
      difference: NexVoraCalculator.cleanFloat(diff),
      formula: `((${x} - ${y}) ÷ ${x}) × 100`,
      explanation: `From ${x} down to ${y} is a decrease of ${cleanRes}%`
    };
  },

  /**
   * Calculate Discount and Savings
   * Handles Primary Discount + Optional Secondary (Stacked) Discount
   */
  calcDiscount(originalPrice, discountPercent, extraDiscountPercent = 0, currency = '৳') {
    const price = parseFloat(originalPrice);
    const disc1 = parseFloat(discountPercent);
    const disc2 = parseFloat(extraDiscountPercent) || 0;

    if (Number.isNaN(price) || Number.isNaN(disc1)) {
      throw new Error(safeT('discErrNegative', 'Prices and percentages must be positive numbers.'));
    }
    if (price < 0 || disc1 < 0 || disc2 < 0) {
      throw new Error(safeT('discErrNegative', 'Prices and percentages must be positive numbers.'));
    }

    // Step 1: First discount
    const firstSavings = (price * disc1) / 100;
    const priceAfterFirst = Math.max(0, price - firstSavings);

    // Step 2: Extra stacked discount if applied
    const secondSavings = (priceAfterFirst * disc2) / 100;
    const finalPrice = Math.max(0, priceAfterFirst - secondSavings);
    const totalSavings = firstSavings + secondSavings;
    const effectiveDiscountPercent = price > 0 ? (totalSavings / price) * 100 : 0;

    return {
      currency,
      originalPrice: NexVoraCalculator.cleanFloat(price),
      firstDiscountPercent: disc1,
      firstSavings: NexVoraCalculator.cleanFloat(firstSavings),
      priceAfterFirst: NexVoraCalculator.cleanFloat(priceAfterFirst),
      secondDiscountPercent: disc2,
      secondSavings: NexVoraCalculator.cleanFloat(secondSavings),
      totalSavings: NexVoraCalculator.cleanFloat(totalSavings),
      finalPrice: NexVoraCalculator.cleanFloat(finalPrice),
      effectiveDiscountPercent: NexVoraCalculator.cleanFloat(effectiveDiscountPercent)
    };
  }
};

// Export for browser, global window, and Node.js test environments
if (typeof globalThis !== 'undefined') {
  globalThis.NexVoraTools = NexVoraTools;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NexVoraTools };
}
