/**
 * NexVora QuickCalc - Master Application Controller
 * Copyright © 2026 NexVora Labs Ofc. All Rights Reserved.
 * Developer: Prince AR Abdur Rahman
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Calculator Instance
  const calc = new NexVoraCalculator();

  // State
  let currentExpression = '';
  let activeLanguage = localStorage.getItem('nexvora_lang') || 'en';
  let activeTheme = localStorage.getItem('nexvora_theme') || 'dark';
  let deferredInstallPrompt = null;

  // DOM Elements
  const exprDisplay = document.getElementById('calc-expression');
  const resultDisplay = document.getElementById('calc-result');
  const memoryIndicator = document.getElementById('memory-indicator');
  const historyList = document.getElementById('history-list');
  const emptyHistoryEl = document.getElementById('history-empty');
  const toastEl = document.getElementById('toast-notification');
  const offlineIndicator = document.getElementById('offline-indicator');
  const clearHistoryModal = document.getElementById('clear-history-modal');
  const installBtn = document.getElementById('pwa-install-btn');
  const iosGuideModal = document.getElementById('ios-guide-modal');

  // ==========================================
  // Toast Notifications
  // ==========================================
  let toastTimeout = null;
  function showToast(message, duration = 2200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden', 'opacity-0');
    toastEl.classList.add('opacity-100');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.add('opacity-0');
      setTimeout(() => toastEl.classList.add('hidden'), 300);
    }, duration);
  }

  // ==========================================
  // Theme Management
  // ==========================================
  function applyTheme(theme) {
    activeTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexvora_theme', theme);

    // Update theme toggle icons/labels if present
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      const icon = btn.querySelector('.theme-icon');
      if (icon) {
        icon.innerHTML = theme === 'dark' 
          ? '<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
          : '<svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';
      }
    });
  }

  // Bind theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(activeTheme === 'dark' ? 'light' : 'dark');
    });
  });

  // Apply initially stored theme
  applyTheme(activeTheme);

  // ==========================================
  // Language Management
  // ==========================================
  function applyLanguage(lang) {
    activeLanguage = lang;
    localStorage.setItem('nexvora_lang', lang);
    document.documentElement.setAttribute('lang', lang);

    // Translate DOM elements marked with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const text = t(key, lang);
      if (text) {
        el.textContent = text;
      }
    });

    // Translate placeholder attributes marked with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = t(key, lang);
      if (text) {
        el.setAttribute('placeholder', text);
      }
    });

    // Update lang switcher buttons text
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.textContent = lang === 'en' ? 'বাংলা' : 'English';
    });

    // Re-render history with new language if calculator exists
    renderHistory();
  }

  // Bind language toggles
  document.querySelectorAll('.lang-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(activeLanguage === 'en' ? 'bn' : 'en');
    });
  });

  // Apply initial language
  applyLanguage(activeLanguage);

  // ==========================================
  // Mobile Navigation Drawer
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  // ==========================================
  // Calculator Core Logic & Display
  // ==========================================
  function updateDisplay() {
    if (!exprDisplay || !resultDisplay) return;

    exprDisplay.textContent = currentExpression || ' ';
    
    // Auto-scroll expression display to the end
    exprDisplay.scrollLeft = exprDisplay.scrollWidth;

    // Show live calculation preview if expression is non-empty and ends in an operand
    if (currentExpression && !/[+\-*/^(]$/.test(currentExpression)) {
      try {
        const preview = calc.calculate(currentExpression);
        resultDisplay.textContent = formatDisplayNumber(preview);
        resultDisplay.classList.remove('text-red-400');
      } catch {
        // Silent preview ignore for unclosed parenthesis or temporary syntax
      }
    } else if (!currentExpression) {
      resultDisplay.textContent = '0';
      resultDisplay.classList.remove('text-red-400');
    }

    // Update Memory Indicator Badge
    if (memoryIndicator) {
      if (calc.hasMemory()) {
        memoryIndicator.classList.remove('opacity-0');
        memoryIndicator.classList.add('opacity-100');
      } else {
        memoryIndicator.classList.remove('opacity-100');
        memoryIndicator.classList.add('opacity-0');
      }
    }
  }

  function formatDisplayNumber(num) {
    if (num === null || num === undefined) return '0';
    if (typeof num === 'string') return num;
    
    // Large or very small numbers
    if (Math.abs(num) >= 1e14 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
      return num.toExponential(6);
    }

    const str = String(num);
    if (!str.includes('.')) {
      return Number(str).toLocaleString('en-US');
    }

    const parts = str.split('.');
    return Number(parts[0]).toLocaleString('en-US') + '.' + parts[1];
  }

  function appendCharacter(char) {
    const lastChar = currentExpression.slice(-1);

    // Decimal point handling: avoid multiple dots in same number
    if (char === '.') {
      // Find the last number token in the expression
      const match = currentExpression.match(/[0-9.]+$/);
      if (match && match[0].includes('.')) {
        return; // Prevent duplicate decimal in same token
      }
      if (!currentExpression || '+-*/^('.includes(lastChar)) {
        currentExpression += '0.';
        updateDisplay();
        return;
      }
    }

    // Double zero handling
    if (char === '00') {
      if (!currentExpression || '+-*/^('.includes(lastChar)) {
        currentExpression += '0';
        updateDisplay();
        return;
      }
    }

    // Operator replacement if already ending in operator
    if ('+-*/^'.includes(char)) {
      if ('+-*/^'.includes(lastChar)) {
        // If unary minus after operator, allow it
        if (char === '-' && lastChar !== '-') {
          currentExpression += char;
          updateDisplay();
          return;
        }
        currentExpression = currentExpression.slice(0, -1) + char;
        updateDisplay();
        return;
      }
      if (!currentExpression && char !== '-') {
        // If starting with an operator, prefix with previous answer or 0
        currentExpression = (calc.lastAnswer || 0) + char;
        updateDisplay();
        return;
      }
    }

    currentExpression += char;
    updateDisplay();
  }

  function toggleSign() {
    if (!currentExpression) {
      currentExpression = '-';
      updateDisplay();
      return;
    }

    // Match the trailing number token
    const match = currentExpression.match(/(-?[0-9.]+)$/);
    if (match) {
      const fullMatch = match[0];
      const index = currentExpression.lastIndexOf(fullMatch);
      let negated;
      if (fullMatch.startsWith('-')) {
        negated = fullMatch.substring(1);
      } else {
        negated = '-' + fullMatch;
      }
      currentExpression = currentExpression.substring(0, index) + negated;
      updateDisplay();
    }
  }

  function clearAll() {
    currentExpression = '';
    if (resultDisplay) {
      resultDisplay.textContent = '0';
      resultDisplay.classList.remove('text-red-400');
    }
    updateDisplay();
  }

  function clearEntry() {
    // Clear trailing number or operator token
    const match = currentExpression.match(/([0-9.]+|[+\-*/^%()]+)$/);
    if (match) {
      currentExpression = currentExpression.slice(0, -match[0].length);
    } else {
      currentExpression = '';
    }
    updateDisplay();
  }

  function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
  }

  function handleEquals() {
    if (!currentExpression) return;

    try {
      const result = calc.calculate(currentExpression);
      const formatted = formatDisplayNumber(result);

      // Save to history
      calc.saveHistory(currentExpression, formatted);
      renderHistory();

      // Update screen
      if (resultDisplay) {
        resultDisplay.textContent = formatted;
        resultDisplay.classList.remove('text-red-400');
      }
      if (exprDisplay) {
        exprDisplay.textContent = currentExpression + ' =';
      }

      // Ready for subsequent chained operations
      currentExpression = String(result);
    } catch (err) {
      if (resultDisplay) {
        let msg = t('errInvalid', activeLanguage);
        if (err.message && err.message.toLowerCase().includes('zero')) {
          msg = t('errDivZero', activeLanguage);
        } else if (err.message && err.message.toLowerCase().includes('overflow')) {
          msg = t('errOverflow', activeLanguage);
        }
        resultDisplay.textContent = msg;
        resultDisplay.classList.add('text-red-400');
      }
    }
  }

  // ==========================================
  // Keypad Click Event Bindings
  // ==========================================
  document.querySelectorAll('[data-calc-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.getAttribute('data-calc-action');
      const val = btn.getAttribute('data-calc-val');

      switch (action) {
        case 'digit':
        case 'operator':
          appendCharacter(val);
          break;
        case 'clear':
          clearAll();
          break;
        case 'clear-entry':
          clearEntry();
          break;
        case 'backspace':
          backspace();
          break;
        case 'equals':
          handleEquals();
          break;
        case 'toggle-sign':
          toggleSign();
          break;
        case 'paren-open':
          appendCharacter('(');
          break;
        case 'paren-close':
          appendCharacter(')');
          break;
        case 'ans':
          appendCharacter('Ans');
          break;
        case 'mc':
          calc.memoryClear();
          showToast(t('memoryCleared', activeLanguage));
          updateDisplay();
          break;
        case 'mr':
          appendCharacter(String(calc.memoryRecall()));
          break;
        case 'm-plus':
          if (resultDisplay) {
            const num = parseFloat(resultDisplay.textContent.replace(/,/g, '')) || 0;
            calc.memoryAdd(num);
            showToast(`${t('memoryStored', activeLanguage)}: ${calc.memoryRecall()}`);
            updateDisplay();
          }
          break;
        case 'm-minus':
          if (resultDisplay) {
            const num = parseFloat(resultDisplay.textContent.replace(/,/g, '')) || 0;
            calc.memorySubtract(num);
            showToast(`${t('memoryStored', activeLanguage)}: ${calc.memoryRecall()}`);
            updateDisplay();
          }
          break;
        case 'ms':
          if (resultDisplay) {
            const num = parseFloat(resultDisplay.textContent.replace(/,/g, '')) || 0;
            calc.memoryStore(num);
            showToast(`${t('memoryStored', activeLanguage)}: ${calc.memoryRecall()}`);
            updateDisplay();
          }
          break;
        case 'copy':
          copyCurrentResult();
          break;
      }
    });
  });

  // Copy Main Result
  function copyCurrentResult() {
    if (!resultDisplay) return;
    const val = resultDisplay.textContent.trim();
    if (!val || val === '0' && !currentExpression) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(() => {
        showToast(t('copySuccess', activeLanguage));
      }).catch(() => {
        fallbackCopy(val);
      });
    } else {
      fallbackCopy(val);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(t('copySuccess', activeLanguage));
    } catch {
      showToast(t('copyFailed', activeLanguage));
    }
    document.body.removeChild(textarea);
  }

  // ==========================================
  // Keyboard Shortcuts Support
  // ==========================================
  window.addEventListener('keydown', (e) => {
    // CRITICAL: Do not interfere if user is typing inside an input or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
      return;
    }

    const key = e.key;

    // Digits
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      appendCharacter(key);
      return;
    }

    // Decimal
    if (key === '.') {
      e.preventDefault();
      appendCharacter('.');
      return;
    }

    // Basic Operators
    if (key === '+') {
      e.preventDefault();
      appendCharacter('+');
      return;
    }
    if (key === '-') {
      e.preventDefault();
      appendCharacter('-');
      return;
    }
    if (key === '*' || key === 'x' || key === 'X') {
      e.preventDefault();
      appendCharacter('*');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      appendCharacter('/');
      return;
    }
    if (key === '%') {
      e.preventDefault();
      appendCharacter('%');
      return;
    }
    if (key === '(' || key === ')') {
      e.preventDefault();
      appendCharacter(key);
      return;
    }

    // Equals & Enter
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEquals();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      backspace();
      return;
    }

    // Escape -> Clear All
    if (key === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }
  });

  // ==========================================
  // History UI Rendering & Actions
  // ==========================================
  function renderHistory() {
    if (!historyList) return;

    const list = calc.history;
    if (!list || list.length === 0) {
      if (emptyHistoryEl) emptyHistoryEl.classList.remove('hidden');
      historyList.innerHTML = '';
      return;
    }

    if (emptyHistoryEl) emptyHistoryEl.classList.add('hidden');
    historyList.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'group p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 text-left cursor-pointer';
      
      const leftCol = document.createElement('div');
      leftCol.className = 'flex-1 overflow-hidden';
      
      const exprEl = document.createElement('div');
      exprEl.className = 'text-xs text-slate-400 font-mono truncate';
      exprEl.textContent = item.expression;

      const resEl = document.createElement('div');
      resEl.className = 'text-base font-semibold text-cyan-400 font-mono tracking-wide truncate';
      resEl.textContent = item.result;

      leftCol.appendChild(exprEl);
      leftCol.appendChild(resEl);

      // Actions Column (Reuse & Copy)
      const actionsCol = document.createElement('div');
      actionsCol.className = 'flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'p-1.5 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-white transition';
      copyBtn.title = t('copySuccess', activeLanguage);
      copyBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>';
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fallbackCopy(item.result);
      });

      actionsCol.appendChild(copyBtn);

      card.appendChild(leftCol);
      card.appendChild(actionsCol);

      // Clicking card reuses result into calculator expression
      card.addEventListener('click', () => {
        currentExpression += item.result;
        updateDisplay();
        showToast(`${t('reuseResult', activeLanguage)}: ${item.result}`);
      });

      historyList.appendChild(card);
    });
  }

  // Clear History Modal & Action
  const openClearModalBtn = document.getElementById('open-clear-history-btn');
  const confirmClearBtn = document.getElementById('confirm-clear-history-btn');
  const cancelClearBtn = document.getElementById('cancel-clear-history-btn');

  if (openClearModalBtn && clearHistoryModal) {
    openClearModalBtn.addEventListener('click', () => {
      clearHistoryModal.classList.remove('hidden');
    });
  }

  if (cancelClearBtn && clearHistoryModal) {
    cancelClearBtn.addEventListener('click', () => {
      clearHistoryModal.classList.add('hidden');
    });
  }

  if (confirmClearBtn && clearHistoryModal) {
    confirmClearBtn.addEventListener('click', () => {
      calc.clearHistory();
      renderHistory();
      clearHistoryModal.classList.add('hidden');
      showToast(t('historyEmpty', activeLanguage));
    });
  }

  // ==========================================
  // PWA Registration & Install Banner
  // ==========================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // SW registered
      }).catch(() => {
        // SW registration failed (e.g. non-HTTPS)
      });
    });
  }

  // Offline / Online Indicator
  function updateOnlineStatus() {
    if (!offlineIndicator) return;
    if (navigator.onLine) {
      offlineIndicator.classList.add('hidden');
    } else {
      offlineIndicator.classList.remove('hidden');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Install Prompt
  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && window.navigator.standalone === true);

  if (installBtn && !isStandalone) {
    if (isIOS) {
      installBtn.classList.remove('hidden');
      installBtn.textContent = t('installIos', activeLanguage);
      installBtn.addEventListener('click', () => {
        if (iosGuideModal) iosGuideModal.classList.remove('hidden');
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      installBtn.classList.remove('hidden');
      installBtn.textContent = t('installApp', activeLanguage);
    });

    installBtn.addEventListener('click', () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            installBtn.classList.add('hidden');
          }
          deferredInstallPrompt = null;
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      installBtn.classList.add('hidden');
      showToast('NexVora QuickCalc installed successfully!');
    });
  }

  const closeIosGuideBtn = document.getElementById('close-ios-guide-btn');
  if (closeIosGuideBtn && iosGuideModal) {
    closeIosGuideBtn.addEventListener('click', () => {
      iosGuideModal.classList.add('hidden');
    });
  }

  // Initial History Render
  renderHistory();
  updateDisplay();
});
