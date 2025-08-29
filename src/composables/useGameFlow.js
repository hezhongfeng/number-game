/**
 * 游戏流程管理
 */
import { ref, computed } from 'vue'
import { useGameState } from './useGameState.js'
import { useGameLogic } from './useGameLogic.js'
import { useAudio } from './useAudio.js'
import { APP_CONFIG } from '../config/app.config.js'

export function useGameFlow() {
  const gameState = useGameState()
  const gameLogic = useGameLogic()
  const audio = useAudio()

  // 流程状态
  const gamePhase = ref('idle') // idle, playing, feedback

  // 计算属性
  const currentPhaseConfig = computed(() => {
    const configs = {
      idle: { allowInput: false },
      playing: { allowInput: true },
      feedback: { allowInput: false }
    }
    return configs[gamePhase.value] || configs.idle
  })

  // 游戏流程方法
  const startGameFlow = async () => {
    gameState.setScreen('game')
    await startNewQuestion()
  }

  const startNewQuestion = async () => {
    await gameLogic.startNewQuestion()
    gamePhase.value = 'playing'
    
    // 不需要在这里播放数字，useGameLogic已经处理了
  }

  const handleAnswer = async (answer) => {
    if (gamePhase.value !== 'playing') return

    gamePhase.value = 'feedback'
    const result = gameLogic.checkAnswer(answer)
    
    gameState.showFeedback.value = true
    gameState.lastAnswer.value = answer

    // 播放反馈音效
    if (result) {
      await audio.playSound('correct')
    } else {
      await audio.playSound('encourage')
    }

    // 等待反馈显示
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.game.feedbackDisplayTime))
  }

  const handleSpeechAnswer = async (transcript) => {
    if (gamePhase.value !== 'playing') return

    gamePhase.value = 'feedback'
    const result = gameLogic.checkSpeechAnswer(transcript)
    
    gameState.showFeedback.value = true
    gameState.lastAnswer.value = transcript

    if (result.isCorrect) {
      await audio.playSound('correct')
    } else {
      await audio.playSound('encourage')
    }

    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.game.feedbackDisplayTime))
  }

  const proceedToNext = async () => {
    gameState.showFeedback.value = false
    gameState.lastAnswer.value = null

    if (gameState.totalQuestions.value >= APP_CONFIG.game.maxQuestions) {
      endGameFlow()
      return
    }

    await startNewQuestion()
  }

  const repeatCurrentQuestion = async () => {
    if (gamePhase.value !== 'feedback') return
    
    gameState.showFeedback.value = false
    gameState.lastAnswer.value = null
    gamePhase.value = 'playing'
    
    setTimeout(() => playCurrentNumber(), 200)
  }

  const playCurrentNumber = async () => {
    if (gameState.currentNumber.value) {
      await audio.playNumber(gameState.currentNumber.value)
    }
  }

  const endGameFlow = () => {
    gameState.endGame()
    gameState.setScreen('start')
    gamePhase.value = 'idle'
  }

  const handleKeyPress = (event) => {
    if (gameState.currentScreen.value !== 'game') return

    switch (event.key) {
      case ' ':
        event.preventDefault()
        if (gamePhase.value === 'playing') playCurrentNumber()
        break
      case 'Enter':
        event.preventDefault()
        if (gamePhase.value === 'feedback') proceedToNext()
        break
      case 'r':
        event.preventDefault()
        if (gamePhase.value === 'feedback') repeatCurrentQuestion()
        break
    }
  }

  return {
    gamePhase,
    currentPhaseConfig,
    startGameFlow,
    handleAnswer,
    handleSpeechAnswer,
    proceedToNext,
    repeatCurrentQuestion,
    playCurrentNumber,
    endGameFlow,
    handleKeyPress
  }
}
