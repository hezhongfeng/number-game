/**
 * 核心工具函数
 */

// 数字生成工具
export const NumberUtils = {
  generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  generateUniqueNumbers(count, min, max, exclude = []) {
    const numbers = []
    const attempts = (max - min + 1) * 2

    for (let i = 0; i < attempts && numbers.length < count; i++) {
      const num = this.generateRandom(min, max)
      if (!numbers.includes(num) && !exclude.includes(num)) {
        numbers.push(num)
      }
    }
    return numbers
  },

  shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// 本地存储工具
export const StorageUtils = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      return false
    }
  }
}

// 分数计算工具
export const ScoreUtils = {
  calculateBaseScore(difficulty, mode) {
    const baseScores = { choice: 10, speak: 15 }
    return (baseScores[mode] || 10) * difficulty
  },

  calculateComboBonus(combo) {
    return Math.min(combo * 2, 50)
  },

  calculateSpeedBonus(responseTime) {
    return responseTime < 2000 ? 5 : 0
  },

  calculateTotalScore(baseScore, comboBonus, speedBonus) {
    return baseScore + comboBonus + speedBonus
  }
}

export const TimeUtils = {
  now: () => Date.now()
}
