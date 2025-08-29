// 游戏服务类
import { GAME_CONFIG } from '@/config/game.config.js'
import { StorageUtil } from '@/utils/storage.js'
import { MathUtil } from '@/utils/math.js'

export class GameService {
  constructor() {
    this.currentGame = null
    this.score = 0
    this.lives = GAME_CONFIG.SETTINGS.DEFAULT_LIVES
    this.timeRemaining = GAME_CONFIG.SETTINGS.DEFAULT_TIME_LIMIT
    this.isGameActive = false
  }

  /**
   * 开始新游戏
   * @param {string} gameType 游戏类型
   * @param {string} difficulty 难度等级
   */
  startGame(gameType, difficulty = GAME_CONFIG.DIFFICULTY.EASY) {
    this.currentGame = {
      type: gameType,
      difficulty,
      startTime: Date.now()
    }
    this.score = 0
    this.lives = GAME_CONFIG.SETTINGS.DEFAULT_LIVES
    this.timeRemaining = GAME_CONFIG.SETTINGS.DEFAULT_TIME_LIMIT
    this.isGameActive = true

    return this.generateGameData(gameType, difficulty)
  }

  /**
   * 结束游戏
   */
  endGame() {
    if (!this.isGameActive) return

    this.isGameActive = false
    const finalScore = this.score

    // 保存最高分
    this.saveHighScore(finalScore)

    // 保存游戏进度
    this.saveGameProgress()

    return {
      score: finalScore,
      isNewRecord: this.isNewHighScore(finalScore)
    }
  }

  /**
   * 生成游戏数据
   * @param {string} gameType 游戏类型
   * @param {string} difficulty 难度等级
   */
  generateGameData(gameType, difficulty) {
    switch (gameType) {
      case GAME_CONFIG.GAME_TYPES.MEMORY:
        return this.generateMemoryGame(difficulty)
      case GAME_CONFIG.GAME_TYPES.MATH:
        return this.generateMathGame(difficulty)
      case GAME_CONFIG.GAME_TYPES.PUZZLE:
        return this.generatePuzzleGame(difficulty)
      case GAME_CONFIG.GAME_TYPES.GUESS:
        return this.generateGuessGame(difficulty)
      default:
        throw new Error(`未知的游戏类型: ${gameType}`)
    }
  }

  /**
   * 生成记忆游戏数据
   */
  generateMemoryGame(difficulty) {
    const length = difficulty === GAME_CONFIG.DIFFICULTY.EASY ? 4 :
                  difficulty === GAME_CONFIG.DIFFICULTY.MEDIUM ? 6 : 8
    const sequence = MathUtil.generateSequence(length, 0, 9)

    return {
      sequence,
      displayTime: 3000, // 显示时间（毫秒）
      userInput: []
    }
  }

  /**
   * 生成数学游戏数据
   */
  generateMathGame(difficulty) {
    const operators = ['+', '-', '*', '/']
    const operator = operators[MathUtil.randomInt(0, operators.length - 1)]
    const difficultyLevel = difficulty === GAME_CONFIG.DIFFICULTY.EASY ? 1 :
                           difficulty === GAME_CONFIG.DIFFICULTY.MEDIUM ? 2 : 3

    return MathUtil.generateMathProblem(operator, difficultyLevel)
  }

  /**
   * 生成拼图游戏数据
   */
  generatePuzzleGame(difficulty) {
    const size = difficulty === GAME_CONFIG.DIFFICULTY.EASY ? 3 :
                difficulty === GAME_CONFIG.DIFFICULTY.MEDIUM ? 4 : 5
    const numbers = Array.from({ length: size * size - 1 }, (_, i) => i + 1)
    numbers.push(null) // 空格

    return {
      size,
      numbers: MathUtil.shuffle(numbers),
      solution: [...numbers.slice(0, -1), null]
    }
  }

  /**
   * 生成猜数字游戏数据
   */
  generateGuessGame(difficulty) {
    const range = difficulty === GAME_CONFIG.DIFFICULTY.EASY ? 100 :
                 difficulty === GAME_CONFIG.DIFFICULTY.MEDIUM ? 500 : 1000
    const target = MathUtil.randomInt(1, range)

    return {
      target,
      range,
      attempts: [],
      maxAttempts: 10
    }
  }

  /**
   * 检查答案
   * @param {any} userAnswer 用户答案
   * @param {any} correctAnswer 正确答案
   */
  checkAnswer(userAnswer, correctAnswer) {
    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)

    if (isCorrect) {
      this.addScore()
    } else {
      this.loseLife()
    }

    return isCorrect
  }

  /**
   * 增加分数
   */
  addScore() {
    const multiplier = GAME_CONFIG.SETTINGS.SCORE_MULTIPLIER[this.currentGame.difficulty]
    this.score += 10 * multiplier
  }

  /**
   * 失去生命
   */
  loseLife() {
    this.lives = Math.max(0, this.lives - 1)
    if (this.lives === 0) {
      this.endGame()
    }
  }

  /**
   * 保存最高分
   */
  saveHighScore(score) {
    const currentHighScore = this.getHighScore()
    if (score > currentHighScore) {
      StorageUtil.setItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, score)
    }
  }

  /**
   * 获取最高分
   */
  getHighScore() {
    return StorageUtil.getItem(GAME_CONFIG.STORAGE_KEYS.HIGH_SCORE, 0)
  }

  /**
   * 检查是否为新纪录
   */
  isNewHighScore(score) {
    return score > this.getHighScore()
  }

  /**
   * 保存游戏进度
   */
  saveGameProgress() {
    const progress = {
      lastPlayed: Date.now(),
      totalGames: this.getTotalGames() + 1,
      bestScore: Math.max(this.score, this.getHighScore())
    }
    StorageUtil.setItem(GAME_CONFIG.STORAGE_KEYS.GAME_PROGRESS, progress)
  }

  /**
   * 获取总游戏次数
   */
  getTotalGames() {
    const progress = StorageUtil.getItem(GAME_CONFIG.STORAGE_KEYS.GAME_PROGRESS, {})
    return progress.totalGames || 0
  }
}
