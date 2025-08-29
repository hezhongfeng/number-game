<template>
  <div class="container">
    <!-- 开始页面 -->
    <StartScreen
      v-if="currentScreen === 'start'"
      :difficulty-settings="difficultySettings"
      :current-difficulty="currentDifficulty"
      @select-difficulty="handleSelectDifficulty"
      @select-mode="handleSelectMode"
    />

    <!-- 游戏页面 -->
    <div v-if="currentScreen === 'game'" class="screen active">
      <GameHeader
        :score="score"
        :combo="combo"
        :difficulty-name="gameLogic.getDifficultyName(currentDifficulty)"
        :total-questions="totalQuestions"
        :correct-answers="correctAnswers"
        :avg-response-time="avgResponseTime"
        :best-streak="gameState.bestStreak.value"
        @back="handleBackToStart"
      />


      <div class="game-content">
        <!-- 选择模式 -->
        <ChoiceMode
          v-if="currentMode === 'choice'"
          :current-number="currentNumber"
          :options="options"
          :show-feedback="gameState.showFeedback.value"
          :last-answer="gameState.lastAnswer.value"
          :disabled="!gameFlow.currentPhaseConfig.value.allowInput"
          @check-answer="handleChoiceAnswer"
          @next-question="handleNextQuestion"
          @play-sound="gameFlow.playCurrentNumber"
        />

        <!-- 朗读模式 -->
        <SpeakMode
          v-if="currentMode === 'speak'"
          :current-number="currentNumber"
          :recognition-status="recognitionStatus"
          :disabled="!gameFlow.currentPhaseConfig.value.allowInput"
          @start-recognition="handleSpeechRecognition"
        />
      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useGameState } from './composables/useGameState.js'
import { useGameLogic } from './composables/useGameLogic.js'
import { useGameFlow } from './composables/useGameFlow.js'
import { useAudio } from './composables/useAudio.js'

// 组件导入
import StartScreen from './components/StartScreen.vue'
import GameHeader from './components/GameHeader.vue'
import ChoiceMode from './components/ChoiceMode.vue'
import SpeakMode from './components/SpeakMode.vue'

// 使用 composables
const gameState = useGameState()
const gameLogic = useGameLogic()
const gameFlow = useGameFlow()
const audio = useAudio()

// 暴露的状态和方法
const {
  currentScreen,
  currentDifficulty,
  currentMode,
  score,
  combo,
  currentNumber,
  options,
  recognitionStatus,
  totalQuestions,
  correctAnswers,
  avgResponseTime,
  setScreen,
} = gameState

const {
  difficultySettings
} = gameLogic

// 添加 accuracy 到解构中
const { accuracy } = gameState

// 事件处理方法
const handleSelectDifficulty = (difficulty) => {
  gameLogic.selectDifficulty(difficulty)
}

const handleSelectMode = async (mode) => {
  gameLogic.selectMode(mode)
  // 启动游戏流程
  await gameFlow.startGameFlow()
}

const handleBackToStart = () => {
  gameFlow.endGameFlow()
}

const handleChoiceAnswer = async (selectedOption) => {
  // 直接传递给 gameFlow，让它处理答案检查和状态更新
  await gameFlow.handleAnswer(selectedOption, null)
}

const handleSpeechRecognition = async () => {
  try {
    const result = await audio.startRecognition()
    if (result.success) {
      // 直接传递给 gameFlow，让它处理语音答案检查
      await gameFlow.handleSpeechAnswer(result.transcript)
    }
  } catch (error) {
    console.error('语音识别失败:', error)
  }
}


const handleNextQuestion = () => {
  gameFlow.proceedToNext()
}


// 键盘事件处理
const handleKeyDown = (event) => {
  gameFlow.handleKeyPress(event)
}

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  console.log('数字认读游戏已启动')
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* 移动端优先的基础样式 */
.container {
  min-height: 100vh;
  min-height: 100dvh; /* 动态视口高度，避免移动端地址栏问题 */
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  background: #F8FAFC;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.screen {
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  transition: all 0.3s ease;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}

.screen.active {
  animation: slideUp 0.4s ease-out;
}

/* 游戏内容 */
.game-content {
  margin: 0;
  position: relative;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
}

/* 游戏控制面板 - 移动端优化 */
.game-controls {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 0;
  padding: 20px 16px;
  background: #FFFFFF;
  border: none;
  border-radius: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.control-btn {
  flex: 1;
  max-width: 200px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  background: #4F46E5;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  -webkit-tap-highlight-color: transparent; /* 移除点击高亮 */
  touch-action: manipulation; /* 优化触摸响应 */
}

.control-btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.4);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 动画 - 移动端优化 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端专用样式 */
@media (max-width: 768px) {
  .container {
    padding: 0;
    margin: 0;
  }

  .screen {
    border-radius: 0;
    padding: 0;
    margin: 0;
    margin-top: env(safe-area-inset-top, 0); /* 适配刘海屏 */
    margin-bottom: env(safe-area-inset-bottom, 0);
    background: transparent;
  }

  .game-content {
    margin: 0;
    min-height: calc(100vh - 200px);
    padding: 0;
  }

  .game-controls {
    margin: 0;
    padding: 16px 12px calc(16px + env(safe-area-inset-bottom, 0)) 12px;
    border-radius: 0;
    border: none;
  }

  .control-btn {
    padding: 18px 16px;
    font-size: 18px;
    border-radius: 10px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .container {
    font-size: 14px;
  }

  .screen {
    padding: 0;
  }

  .game-content {
    margin: 0;
  }

  .game-controls {
    margin: 0;
    padding: 12px 8px calc(12px + env(safe-area-inset-bottom, 0)) 8px;
    border: none;
  }

  .control-btn {
    padding: 14px 12px;
    font-size: 16px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .container {
    flex-direction: row;
  }

  .screen {
    border-radius: 0;
    margin: 0;
  }

  .game-content {
    min-height: auto;
    flex: 1;
  }

  .game-controls {
    position: relative;
    margin: 0;
    border-top: none;
    border: none;
    border-radius: 0;
    flex-direction: column;
    width: 120px;
    min-width: 120px;
  }
}

/* 高分辨率屏幕优化 */
@media (min-width: 769px) {
  .container {
    padding: 0;
    align-items: stretch;
    justify-content: flex-start;
  }

  .screen {
    max-width: 100%;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
  }

  .game-content {
    margin: 0;
    padding: 32px;
  }

  .game-controls {
    position: relative;
    margin: 0;
    border-radius: 0;
    border: none;
    box-shadow: none;
    background: #FFFFFF;
  }

  .control-btn:hover:not(:disabled) {
    background: #4338CA;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }
}
</style>
