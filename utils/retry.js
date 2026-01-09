import { config } from "../config.js";
import { logWarn, logDebug } from "./logger.js";

/**
 * 指數退避重試函數
 * @param {Function} fn - 要執行的異步函數
 * @param {Object} options - 重試選項
 * @returns {Promise} - 函數執行結果
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = config.retry.maxAttempts,
    initialDelay = config.retry.initialDelay,
    maxDelay = config.retry.maxDelay,
    onRetry = null
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      // 計算延遲時間（指數退避）
      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      
      logWarn(`重試中... (第 ${attempt}/${maxAttempts} 次) 延遲 ${delay}ms: ${error.message}`);
      
      if (onRetry) {
        await onRetry(attempt, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
