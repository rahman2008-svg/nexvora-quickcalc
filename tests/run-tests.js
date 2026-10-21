/**
 * NexVora QuickCalc - Automated Engine Test Suite
 * Zero external test framework required.
 * Copyright © 2026 NexVora Labs Ofc. All Rights Reserved.
 * Developer: Prince AR Abdur Rahman
 */

import '../js/calculator.js';
import '../js/tools.js';

const NexVoraCalculator = globalThis.NexVoraCalculator;
const NexVoraTools = globalThis.NexVoraTools;

let passedCount = 0;
let totalCount = 0;

function assertEqual(testName, actual, expected) {
  totalCount++;
  const isMatch = actual === expected || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (isMatch) {
    passedCount++;
    console.log(`  [PASS] Case ${totalCount}: ${testName} -> Result: ${actual}`);
  } else {
    console.error(`  [FAIL] Case ${totalCount}: ${testName} -> Expected: ${expected}, Got: ${actual}`);
  }
}

function assertThrows(testName, fn, expectedSubstring) {
  totalCount++;
  try {
    fn();
    console.error(`  [FAIL] Case ${totalCount}: ${testName} -> Expected error with "${expectedSubstring}", but none thrown.`);
  } catch (err) {
    if (!expectedSubstring || (err.message && err.message.toLowerCase().includes(expectedSubstring.toLowerCase()))) {
      passedCount++;
      console.log(`  [PASS] Case ${totalCount}: ${testName} -> Caught expected error: "${err.message}"`);
    } else {
      console.error(`  [FAIL] Case ${testName} -> Error thrown "${err.message}" did not contain "${expectedSubstring}"`);
    }
  }
}

console.log('====================================================');
console.log('   NEXVORA QUICKCALC - AUTOMATED ENGINE TESTS       ');
console.log('====================================================\n');

const calc = new NexVoraCalculator();

// Case 1: 2 + 3 = 5
assertEqual('2 + 3 = 5', calc.calculate('2 + 3'), 5);

// Case 2: 12 - 7 = 5
assertEqual('12 − 7 = 5', calc.calculate('12 - 7'), 5);

// Case 3: 6 × 7 = 42
assertEqual('6 × 7 = 42', calc.calculate('6 * 7'), 42);

// Case 4: 20 ÷ 4 = 5
assertEqual('20 ÷ 4 = 5', calc.calculate('20 / 4'), 5);

// Case 5: 200-এর 15% (15% of 200) = 30
assertEqual('200 * 15% = 30', calc.calculate('200 * 15%'), 30);
assertEqual('15% * 200 = 30', calc.calculate('15% * 200'), 30);

// Case 6: 100 + 20 × 3 = 160 (Precedence: multiply before add)
assertEqual('100 + 20 × 3 = 160', calc.calculate('100 + 20 * 3'), 160);

// Case 7: (100 + 20) × 3 = 360 (Parentheses precedence)
assertEqual('(100 + 20) × 3 = 360', calc.calculate('(100 + 20) * 3'), 360);

// Case 8: Negative numbers (-5 + 12 = 7, 5 * -3 = -15)
assertEqual('Unary minus: -5 + 12 = 7', calc.calculate('-5 + 12'), 7);
assertEqual('Multiplication with negative: 5 * -3 = -15', calc.calculate('5 * -3'), -15);
assertEqual('Bracketed negative: -(5 + 3) = -8', calc.calculate('-(5 + 3)'), -8);

// Case 9: Decimal calculations (0.1 + 0.2 = 0.3)
assertEqual('Floating precision: 0.1 + 0.2 = 0.3', calc.calculate('0.1 + 0.2'), 0.3);
assertEqual('Decimal division: 10.5 / 2 = 5.25', calc.calculate('10.5 / 2'), 5.25);

// Case 10: Division by zero
assertThrows('Division by zero: 20 / 0', () => calc.calculate('20 / 0'), 'zero');

// Case 11: Invalid expressions
assertThrows('Invalid syntax: 5 + * 2', () => calc.calculate('5 + * 2'), '');
assertThrows('Mismatched parentheses: (10 + 2', () => calc.calculate('(10 + 2'), 'parenthes');

// Case 12: Repeated decimal points
assertThrows('Repeated decimal points: 5.2.3', () => calc.calculate('5.2.3 + 1'), 'decimal');

// Case 13: Memory operations
calc.memoryClear();
assertEqual('Memory Clear (MC)', calc.memoryRecall(), 0);
calc.memoryStore(50);
assertEqual('Memory Store (MS: 50)', calc.memoryRecall(), 50);
calc.memoryAdd(25);
assertEqual('Memory Add (M+: 25 -> 75)', calc.memoryRecall(), 75);
calc.memorySubtract(15);
assertEqual('Memory Subtract (M-: 15 -> 60)', calc.memoryRecall(), 60);
assertEqual('hasMemory check', calc.hasMemory(), true);
calc.memoryClear();
assertEqual('hasMemory after MC', calc.hasMemory(), false);

// Case 14: Answer Reuse (Ans)
calc.calculate('10 * 5'); // answer is 50
assertEqual('Answer register reuse: Ans + 10 = 60', calc.calculate('Ans + 10'), 60);

// Case 15: Percentage Tools Validation
const percOf = NexVoraTools.calcPercentOf(15, 200);
assertEqual('Tools: 15% of 200 = 30', percOf.result, 30);

const whatPerc = NexVoraTools.calcWhatPercentIs(50, 200);
assertEqual('Tools: 50 is what % of 200 = 25%', whatPerc.result, 25);

const percInc = NexVoraTools.calcPercentIncrease(100, 150);
assertEqual('Tools: Increase from 100 to 150 = 50%', percInc.result, 50);

const percDec = NexVoraTools.calcPercentDecrease(200, 150);
assertEqual('Tools: Decrease from 200 down to 150 = 25%', percDec.result, 25);

assertThrows('Percentage zero denominator check', () => NexVoraTools.calcWhatPercentIs(50, 0), '');

// Case 16: Discount Tool Validation
const discResult = NexVoraTools.calcDiscount(1000, 20, 10, '৳');
assertEqual('Discount: Final price with 20% + 10% on ৳1000 = ৳720', discResult.finalPrice, 720);
assertEqual('Discount: Total savings = ৳280', discResult.totalSavings, 280);
assertEqual('Discount: Effective discount = 28%', discResult.effectiveDiscountPercent, 28);

console.log('\n----------------------------------------------------');
console.log(`SUMMARY: ${passedCount} of ${totalCount} automated engine tests passed successfully.`);
console.log('----------------------------------------------------');

if (passedCount === totalCount) {
  console.log('>>> ALL AUTOMATED ENGINE TEST CASES PASSED! <<<\n');
  process.exit(0);
} else {
  console.error('>>> SOME TEST CASES FAILED! <<<\n');
  process.exit(1);
}
