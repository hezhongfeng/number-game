/**
 * 游戏核心逻辑管理
 */
import { computed } from 'vue'
import { useGameState } from './useGameState.js'
import { useAudio } from './useAudio.js'
import GameService from '../services/GameService.js'

export function useGameLogic() {
  const gameState = useGameState()
  const audio = useAudio()

  // 获取难度设置配置
  const difficultySettings = GameService.getDifficultySettings()

  // 获取当前难度设置
  const currentDifficultySettings = computed(() => {
    return GameService.getDifficultyById(gameState.currentDifficulty.value)
  })

  // 获取难度名称
  const getDifficultyName = (level) => {
    return GameService.getDifficultyName(level)
  }

  // 开始新题目
  const startNewQuestion = async () => {
    const question = GameService.generateQuestion(gameState.currentDifficulty.value)

    gameState.currentNumber.value = question.number
    gameState.options.value = question.options
    gameState.currentQuestionStartTime.value = question.timestamp
    gameState.showNext.value = false

    // 在选择模式下，等待动画完成后再播放数字
    if (gameState.currentMode.value === 'choice') {
      try {
        // 计算动画完成时间：选项数量 * 0.1s (延迟) + 0.5s (动画时长) + 0.3s (缓冲时间)
        const animationDelay = question.options.length * 0.1 + 0.5 + 0.3
        setTimeout(async () => {
          await audio.playNumber(question.number)
        }, animationDelay * 1000)
      } catch (error) {
        console.error('播放数字语音失败:', error)
      }
    }
  }

  // 检查答案
  const checkAnswer = (selectedAnswer) => {
    const responseTime = Date.now() - gameState.currentQuestionStartTime.value
    const question = {
      number: gameState.currentNumber.value,
      difficulty: gameState.currentDifficulty.value
    }

    const result = GameService.checkAnswer(question, selectedAnswer, responseTime)

    // 记录答题历史
    gameState.addQuestionRecord({
      number: question.number,
      selectedAnswer,
      correct: result.correct,
      responseTime: result.responseTime,
      mode: gameState.currentMode.value,
      difficulty: gameState.currentDifficulty.value,
    })

    // 更新分数和连击
    if (result.correct) {
      gameState.updateScore(result.score)
      gameState.updateCombo(true)
    } else {
      gameState.updateCombo(false)
    }

    return result.correct
  }

  // 检查语音答案
  const checkSpeechAnswer = (spokenText) => {
    const responseTime = Date.now() - gameState.currentQuestionStartTime.value
    const question = {
      number: gameState.currentNumber.value,
      difficulty: gameState.currentDifficulty.value
    }

    const result = GameService.checkSpeechAnswer(question, spokenText, responseTime)

    // 记录答题历史
    gameState.addQuestionRecord({
      number: question.number,
      spokenText,
      correct: result.correct,
      responseTime: result.responseTime,
      mode: gameState.currentMode.value,
      difficulty: gameState.currentDifficulty.value,
    })

    // 更新分数和连击
    if (result.correct) {
      gameState.updateScore(result.score)
      gameState.updateCombo(true)
    } else {
      gameState.updateCombo(false)
    }

    return {
      isCorrect: result.correct,
      score: result.score,
      correctAnswer: gameState.currentNumber.value
    }
  }

  // 下一题
  const nextQuestion = () => {
    setTimeout(() => {
      startNewQuestion()
    }, 500)
  }

  // 选择难度
  const selectDifficulty = (level) => {
    gameState.setDifficulty(level)
  }

  // 选择模式
  const selectMode = (mode) => {
    gameState.setMode(mode)
    gameState.setScreen('game')
    // 不再自动开始第一题，由 gameFlow 管理
  }

  // 返回开始页面
  const backToStart = () => {
    gameState.setScreen('start')
    gameState.resetGame()
  }

  // 返回游戏页面
  const backToGame = () => {
    gameState.setScreen('game')
  }

  return {
    // 配置
    difficultySettings,
    currentDifficultySettings,

    // 方法
    getDifficultyName,
    startNewQuestion,
    checkAnswer,
    checkSpeechAnswer,
    nextQuestion,
    selectDifficulty,
    selectMode,
    backToStart,
    backToGame,
  }
}
