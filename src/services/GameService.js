/**
 * 游戏核心逻辑服务
 */
import { DIFFICULTY_SETTINGS } from '../config/app.config.js'

export class GameService {
  // 获取难度设置
  getDifficultySettings() {
    return DIFFICULTY_SETTINGS
  }

  // 根据ID获取难度设置
  getDifficultyById(id) {
    return DIFFICULTY_SETTINGS.find(setting => setting.id === id) || DIFFICULTY_SETTINGS[0]
  }

  // 获取难度名称
  getDifficultyName(level) {
    const setting = this.getDifficultyById(level)
    return setting ? setting.name : '未知难度'
  }

  // 生成随机数字
  generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 生成题目
  generateQuestion(difficultyId) {
    const difficulty = this.getDifficultyById(difficultyId)
    const [min, max] = difficulty.range
    const optionsCount = difficulty.options

    // 生成目标数字
    const targetNumber = this.generateRandomNumber(min, max)

    // 生成选项
    const options = this.generateOptions(targetNumber, min, max, optionsCount)

    return {
      number: targetNumber,
      options: options,
      timestamp: Date.now()
    }
  }

  // 生成选项
  generateOptions(correctAnswer, min, max, count) {
    const options = new Set([correctAnswer])

    while (options.size < count) {
      const option = this.generateRandomNumber(min, max)
      options.add(option)
    }

    // 转换为数组并打乱顺序
    const optionsArray = Array.from(options)
    return this.shuffleArray(optionsArray)
  }

  // 打乱数组
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // 检查选择答案
  checkAnswer(question, selectedAnswer, responseTime) {
    const correct = question.number === selectedAnswer
    const score = correct ? this.calculateScore(question.difficulty, responseTime) : 0

    return {
      correct,
      score,
      responseTime
    }
  }

  // 检查语音答案
  checkSpeechAnswer(question, spokenText, responseTime) {
    const correct = this.verifyNumberSpeech(question.number, spokenText)
    const score = correct ? this.calculateScore(question.difficulty, responseTime) : 0

    return {
      correct,
      score,
      responseTime
    }
  }

  // 验证数字语音
  verifyNumberSpeech(targetNumber, spokenText) {
    if (!spokenText) return false

    const cleanText = spokenText.toLowerCase().trim()
    const targetStr = String(targetNumber)

    // 直接数字匹配
    if (cleanText === targetStr) return true

    // 中文数字映射
    const chineseNumbers = {
      '零': '0', '一': '1', '二': '2', '三': '3', '四': '4',
      '五': '5', '六': '6', '七': '7', '八': '8', '九': '9',
      '十': '10', '百': '100', '千': '1000'
    }

    // 检查中文数字
    for (const [chinese, digit] of Object.entries(chineseNumbers)) {
      if (cleanText.includes(chinese) && digit === targetStr) {
        return true
      }
    }

    // 复合数字处理（如"十一"、"二十"等）
    if (targetNumber >= 10 && targetNumber <= 99) {
      const tens = Math.floor(targetNumber / 10)
      const ones = targetNumber % 10

      if (tens === 1) {
        // 10-19的特殊处理
        if (ones === 0 && cleanText.includes('十')) return true
        if (ones > 0) {
          const expectedText = '十' + Object.keys(chineseNumbers)[ones]
          if (cleanText.includes(expectedText.replace(/undefined/g, ''))) return true
        }
      } else {
        // 20-99的处理
        const tensText = Object.keys(chineseNumbers)[tens]
        const onesText = ones === 0 ? '' : Object.keys(chineseNumbers)[ones]
        const expectedText = tensText + '十' + onesText
        if (cleanText.includes(expectedText)) return true
      }
    }

    // 模糊匹配
    return cleanText.includes(targetStr)
  }

  // 计算分数
  calculateScore(difficulty, responseTime) {
    const baseScore = 10
    const difficultyMultiplier = difficulty * 0.5 + 1
    const timeBonus = Math.max(0, (5000 - responseTime) / 1000) // 5秒内有时间奖励

    return Math.round(baseScore * difficultyMultiplier + timeBonus)
  }

  // 生成统计数据
  generateStats(questionHistory) {
    if (!questionHistory || questionHistory.length === 0) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracy: 0,
        totalScore: 0,
        averageResponseTime: 0,
        bestStreak: 0
      }
    }

    const totalQuestions = questionHistory.length
    const correctAnswers = questionHistory.filter(q => q.correct).length
    const wrongAnswers = totalQuestions - correctAnswers
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    const totalScore = questionHistory.reduce((sum, q) => {
      return sum + (q.score || 0)
    }, 0)

    const totalResponseTime = questionHistory.reduce((sum, q) => sum + q.responseTime, 0)
    const averageResponseTime = totalQuestions > 0 ? totalResponseTime / totalQuestions : 0

    // 计算最佳连击
    let currentStreak = 0
    let bestStreak = 0

    for (const question of questionHistory) {
      if (question.correct) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      totalScore,
      averageResponseTime: Math.round(averageResponseTime),
      bestStreak
    }
  }
}

export default new GameService()
