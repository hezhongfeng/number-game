/**
 * 游戏核心状态管理
 */
import { ref, computed, watch } from 'vue'
import { APP_CONFIG } from '../config/app.config.js'
import StorageService from '../services/StorageService.js'
import GameService from '../services/GameService.js'

// 全局游戏状态
const gameState = {
  // 基本状态
  currentScreen: ref('start'),
  currentDifficulty: ref(1),
  currentMode: ref('choice'),
  isGameActive: ref(false),

  // 游戏数据
  currentNumber: ref(null),
  options: ref([]),
  score: ref(0),
  combo: ref(0),
  maxCombo: ref(0),

  // 反馈状态
  feedbackMessage: ref(''),
  feedbackClass: ref(''),
  showNext: ref(false),
  showFeedback: ref(false),
  lastAnswer: ref(null),

  // 语音识别状态
  recognitionStatus: ref(''),

  // 统计数据
  totalQuestions: ref(0),
  correctAnswers: ref(0),
  wrongAnswers: ref(0),
  sessionStartTime: ref(null),
  avgResponseTime: ref(0),
  currentQuestionStartTime: ref(null),

  // 进度追踪
  streak: ref(0),
  bestStreak: ref(0),
  questionHistory: ref([]),

  // 用户设置
  userSettings: ref(null),
}

export function useGameState() {
  // 初始化用户设置
  if (!gameState.userSettings.value) {
    gameState.userSettings.value = StorageService.getUserSettings()
    gameState.currentDifficulty.value = gameState.userSettings.value.difficulty
  }

  // 计算属性
  const accuracy = computed(() => {
    if (gameState.totalQuestions.value === 0) return 0
    return Math.round((gameState.correctAnswers.value / gameState.totalQuestions.value) * 100)
  })

  const isPlaying = computed(() => {
    return gameState.currentScreen.value === 'game' && gameState.isGameActive.value
  })

  const sessionStats = computed(() => {
    return GameService.generateStats(gameState.questionHistory.value)
  })

  // 状态管理方法
  const setScreen = (screen) => {
    gameState.currentScreen.value = screen
  }

  const setDifficulty = (difficulty) => {
    gameState.currentDifficulty.value = difficulty
    // 保存到用户设置
    if (gameState.userSettings.value) {
      gameState.userSettings.value.difficulty = difficulty
      StorageService.saveUserSettings(gameState.userSettings.value)
    }
  }

  const setMode = (mode) => {
    gameState.currentMode.value = mode
    // 保存到用户设置
    if (gameState.userSettings.value) {
      gameState.userSettings.value.preferredMode = mode
      StorageService.saveUserSettings(gameState.userSettings.value)
    }
  }

  const startGame = () => {
    gameState.isGameActive.value = true
    gameState.sessionStartTime.value = Date.now()
  }

  const endGame = () => {
    gameState.isGameActive.value = false

    // 保存游戏统计
    if (gameState.questionHistory.value.length > 0) {
      const stats = sessionStats.value
      const sessionData = {
        ...stats,
        difficulty: gameState.currentDifficulty.value,
        mode: gameState.currentMode.value,
        playTime: Date.now() - gameState.sessionStartTime.value
      }
      StorageService.updateGameStats(sessionData)
    }
  }

  const resetGame = () => {
    gameState.score.value = 0
    gameState.combo.value = 0
    gameState.totalQuestions.value = 0
    gameState.correctAnswers.value = 0
    gameState.wrongAnswers.value = 0
    gameState.questionHistory.value = []
    gameState.streak.value = 0
  }

  const updateScore = (points) => {
    gameState.score.value += points
  }

  const updateCombo = (correct) => {
    if (correct) {
      gameState.combo.value++
      gameState.streak.value++
      if (gameState.combo.value > gameState.maxCombo.value) {
        gameState.maxCombo.value = gameState.combo.value
      }
      if (gameState.streak.value > gameState.bestStreak.value) {
        gameState.bestStreak.value = gameState.streak.value
      }
    } else {
      gameState.combo.value = 0
      gameState.streak.value = 0
    }
  }

  const addQuestionRecord = (question) => {
    gameState.questionHistory.value.push({
      ...question,
      timestamp: Date.now()
    })
    gameState.totalQuestions.value++

    if (question.correct) {
      gameState.correctAnswers.value++
    } else {
      gameState.wrongAnswers.value++
    }

    // 计算平均响应时间
    const responseTimes = gameState.questionHistory.value
      .filter(q => q.responseTime)
      .map(q => q.responseTime)

    if (responseTimes.length > 0) {
      gameState.avgResponseTime.value = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      )
    }
  }

  const setFeedback = (message, className = '', duration = APP_CONFIG.game.feedbackDisplayTime) => {
    gameState.feedbackMessage.value = message
    gameState.feedbackClass.value = className
    gameState.showNext.value = true

    setTimeout(() => {
      gameState.showNext.value = false
      gameState.feedbackMessage.value = ''
      gameState.feedbackClass.value = ''
    }, duration)
  }

  const updateUserSettings = (newSettings) => {
    gameState.userSettings.value = { ...gameState.userSettings.value, ...newSettings }
    StorageService.saveUserSettings(gameState.userSettings.value)
  }

  // 监听器
  watch(() => gameState.currentScreen.value, (newScreen) => {
    if (newScreen === 'game') {
      startGame()
    } else {
      endGame()
    }
  })

  return {
    // 状态
    ...gameState,

    // 计算属性
    accuracy,
    isPlaying,
    sessionStats,

    // 方法
    setScreen,
    setDifficulty,
    setMode,
    startGame,
    endGame,
    resetGame,
    updateScore,
    updateCombo,
    addQuestionRecord,
    setFeedback,
    updateUserSettings,
  }
}
