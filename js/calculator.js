/**
 * NexVora QuickCalc - Safe Precision Math Engine
 * Copyright © 2026 NexVora Labs Ofc. All Rights Reserved.
 * Developer: Prince AR Abdur Rahman
 *
 * Implements a 100% safe tokenizer and Shunting-Yard AST parser.
 * NO eval() or new Function() is ever used.
 */

class NexVoraCalculator {
  constructor() {
    this.memory = 0;
    this.lastAnswer = 0;
    this.history = this.loadHistory();
    this.maxHistory = 50;
  }

  /**
   * Safe floating-point normalization
   * Fixes JavaScript IEEE 754 precision issues like 0.1 + 0.2 = 0.30000000000000004
   */
  static cleanFloat(num) {
    if (!Number.isFinite(num)) return num;
    if (Object.is(num, -0)) return 0;
    // Format to precision 14 and parse back to strip machine epsilon noise
    const str = num.toPrecision(14);
    const parsed = parseFloat(str);
    // If the difference to the nearest integer is microscopic, round it
    const nearestInt = Math.round(parsed);
    if (Math.abs(parsed - nearestInt) < 1e-12) {
      return nearestInt;
    }
    return parsed;
  }

  /**
   * Tokenize mathematical expression string
   * Handles multi-digit numbers, decimals, unary minus, operators, percentages, parentheses
   */
  tokenize(rawExpression) {
    if (!rawExpression || typeof rawExpression !== 'string') {
      throw new Error('Incomplete expression');
    }

    // Standardize symbols: replace visual ×, ÷, − with *, /, -
    let expr = rawExpression
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/–/g, '-');

    const tokens = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
      const char = expr[i];

      // Digit or decimal point
      if (/[0-9]/.test(char) || (char === '.' && (i + 1 < len && /[0-9]/.test(expr[i + 1])))) {
        let numStr = '';
        let dotCount = 0;

        while (i < len && (/[0-9]/.test(expr[i]) || expr[i] === '.')) {
          if (expr[i] === '.') {
            dotCount++;
            if (dotCount > 1) {
              throw new Error('Repeated decimal point in number');
            }
          }
          numStr += expr[i];
          i++;
        }

        // Implicit multiplication check: e.g., 5(2) or 5Ans
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });

        // If followed directly by opening parenthesis, insert implicit multiply
        if (i < len && expr[i] === '(') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
        continue;
      }

      // Check for 'Ans' token
      if (expr.substring(i, i + 3).toLowerCase() === 'ans') {
        tokens.push({ type: 'NUMBER', value: this.lastAnswer });
        i += 3;
        if (i < len && expr[i] === '(') {
          tokens.push({ type: 'OPERATOR', value: '*' });
        }
        continue;
      }

      // Operators and Parentheses
      if ('+-*/^%()'.includes(char)) {
        // Detect unary minus:
        // Minus is unary if it is at the very beginning of the expression,
        // or immediately after an operator or after an opening parenthesis '('
        if (char === '-') {
          const prev = tokens[tokens.length - 1];
          if (!prev || (prev.type === 'OPERATOR') || (prev.type === 'LPAREN')) {
            // Check if followed by a number
            let j = i + 1;
            if (j < len && (/[0-9]/.test(expr[j]) || expr[j] === '.')) {
              let numStr = '-';
              let dotCount = 0;
              while (j < len && (/[0-9]/.test(expr[j]) || expr[j] === '.')) {
                if (expr[j] === '.') {
                  dotCount++;
                  if (dotCount > 1) {
                    throw new Error('Repeated decimal point in number');
                  }
                }
                numStr += expr[j];
                j++;
              }
              i = j;
              tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
              if (i < len && expr[i] === '(') {
                tokens.push({ type: 'OPERATOR', value: '*' });
              }
              continue;
            } else if (j < len && expr[j] === '(') {
              // Unary minus before parenthesis: convert to -1 *
              tokens.push({ type: 'NUMBER', value: -1 });
              tokens.push({ type: 'OPERATOR', value: '*' });
              i++;
              continue;
            }
          }
        }

        // Postfix percentage token
        if (char === '%') {
          tokens.push({ type: 'PERCENT', value: '%' });
          i++;
          // If followed by a number or '(', insert implicit multiply
          if (i < len && (/[0-9]/.test(expr[i]) || expr[i] === '(')) {
            tokens.push({ type: 'OPERATOR', value: '*' });
          }
          continue;
        }

        if (char === '(') {
          // If previous token was a number, percentage, or ')', add implicit multiplication
          const prev = tokens[tokens.length - 1];
          if (prev && (prev.type === 'NUMBER' || prev.type === 'PERCENT' || prev.type === 'RPAREN')) {
            tokens.push({ type: 'OPERATOR', value: '*' });
          }
          tokens.push({ type: 'LPAREN', value: '(' });
        } else if (char === ')') {
          tokens.push({ type: 'RPAREN', value: ')' });
        } else {
          // Binary operators +, -, *, /, ^
          tokens.push({ type: 'OPERATOR', value: char });
        }
        i++;
        continue;
      }

      throw new Error(`Unexpected character: "${char}"`);
    }

    return tokens;
  }

  /**
   * Convert Infix Tokens to Reverse Polish Notation (RPN) via Shunting-Yard
   */
  toRPN(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '^': 3
    };

    const associativity = {
      '+': 'L',
      '-': 'L',
      '*': 'L',
      '/': 'L',
      '^': 'R'
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'PERCENT') {
        // Immediate postfix application to top of output queue
        outputQueue.push(token);
      } else if (token.type === 'OPERATOR') {
        const op1 = token.value;
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'OPERATOR') {
            const op2 = top.value;
            const p1 = precedence[op1] || 0;
            const p2 = precedence[op2] || 0;
            const assoc = associativity[op1] || 'L';

            if ((assoc === 'L' && p1 <= p2) || (assoc === 'R' && p1 < p2)) {
              outputQueue.push(operatorStack.pop());
            } else {
              break;
            }
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLeftParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop();
          if (top.type === 'LPAREN') {
            foundLeftParen = true;
            break;
          } else {
            outputQueue.push(top);
          }
        }
        if (!foundLeftParen) {
          throw new Error('Mismatched parentheses: missing "("');
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop();
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('Mismatched parentheses');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluate Reverse Polish Notation (RPN) Queue safely
   */
  evaluateRPN(rpnQueue) {
    if (!rpnQueue || rpnQueue.length === 0) {
      throw new Error('Incomplete expression');
    }

    const stack = [];

    for (let i = 0; i < rpnQueue.length; i++) {
      const token = rpnQueue[i];

      if (token.type === 'NUMBER') {
        stack.push(token.value);
      } else if (token.type === 'PERCENT') {
        if (stack.length < 1) {
          throw new Error('Invalid percentage usage');
        }
        const val = stack.pop();
        stack.push(NexVoraCalculator.cleanFloat(val / 100));
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) {
          throw new Error('Incomplete expression');
        }
        const b = stack.pop();
        const a = stack.pop();

        let result;
        switch (token.value) {
          case '+':
            result = a + b;
            break;
          case '-':
            result = a - b;
            break;
          case '*':
            result = a * b;
            break;
          case '/':
            if (b === 0) {
              throw new Error('Cannot divide by zero');
            }
            result = a / b;
            break;
          case '^':
            result = Math.pow(a, b);
            break;
          default:
            throw new Error(`Unsupported operator: ${token.value}`);
        }

        if (!Number.isFinite(result)) {
          throw new Error('Calculation overflow or invalid number');
        }

        stack.push(NexVoraCalculator.cleanFloat(result));
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid mathematical expression');
    }

    return stack[0];
  }

  /**
   * Execute single calculation
   */
  calculate(rawExpression) {
    const tokens = this.tokenize(rawExpression);
    const rpn = this.toRPN(tokens);
    const result = this.evaluateRPN(rpn);
    this.lastAnswer = result;
    return result;
  }

  // ==========================================
  // Memory Operations
  // ==========================================

  memoryClear() {
    this.memory = 0;
    return 0;
  }

  memoryRecall() {
    return this.memory;
  }

  memoryStore(value) {
    const num = parseFloat(value);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      this.memory = NexVoraCalculator.cleanFloat(num);
    }
    return this.memory;
  }

  memoryAdd(value) {
    const num = parseFloat(value);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      this.memory = NexVoraCalculator.cleanFloat(this.memory + num);
    }
    return this.memory;
  }

  memorySubtract(value) {
    const num = parseFloat(value);
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      this.memory = NexVoraCalculator.cleanFloat(this.memory - num);
    }
    return this.memory;
  }

  hasMemory() {
    return this.memory !== 0;
  }

  // ==========================================
  // LocalStorage History Operations
  // ==========================================

  loadHistory() {
    try {
      const saved = localStorage.getItem('nexvora_calc_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 50);
        }
      }
    } catch {
      // Graceful fallback for blocked/corrupted LocalStorage
    }
    return [];
  }

  saveHistory(expression, result) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      expression: String(expression).trim(),
      result: String(result),
      timestamp: new Date().toISOString()
    };

    // Avoid duplicate immediate entries
    if (this.history.length > 0 && this.history[0].expression === entry.expression && this.history[0].result === entry.result) {
      return this.history;
    }

    this.history.unshift(entry);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }

    try {
      localStorage.setItem('nexvora_calc_history', JSON.stringify(this.history));
    } catch {
      // Graceful quota or disabled error handling
    }

    return this.history;
  }

  clearHistory() {
    this.history = [];
    try {
      localStorage.removeItem('nexvora_calc_history');
    } catch {
      // Graceful
    }
    return [];
  }
}

// Export for browser, global window, and Node.js test environments
if (typeof globalThis !== 'undefined') {
  globalThis.NexVoraCalculator = NexVoraCalculator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NexVoraCalculator };
}
