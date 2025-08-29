<template>
  <div class="game-mode active">
    <!-- 游戏主界面 -->
    <div class="game-main" v-if="!showFeedback">
      <!-- 顶部指令区域 -->
      <div class="instruction-section">
        <div class="instruction-card">
          <div class="instruction-icon">👂</div>
          <div class="instruction-content">
            <h3 class="instruction-title">听数字，选答案</h3>
            <p class="instruction-desc">点击播放按钮听数字发音，然后选择正确答案</p>
          </div>
        </div>
      </div>

      <!-- 播放控制区域 -->
      <div class="play-section">
        <button @click="playSound" class="play-btn-modern">
          <div class="play-btn-content">
            <span class="play-icon">🔊</span>
            <span class="play-text">播放数字</span>
          </div>
          <div class="play-btn-ripple"></div>
        </button>
      </div>

      <!-- 选项区域 -->
      <div class="options-section">
        <div class="options-title">请选择你听到的数字：</div>
        <div class="options-grid-modern">
          <button
            v-for="(option, index) in options"
            :key="index"
            @click="checkAnswer(option)"
            class="option-btn-modern"
            :style="{ '--delay': index * 0.1 + 's' }"
            :disabled="answeredOption !== null || disabled"
            :class="{
              'correct': answeredOption === option && option === currentNumber,
              'incorrect': answeredOption === option && option !== currentNumber,
              'disabled': answeredOption !== null && answeredOption !== option || disabled
            }"
          >
            <div class="option-content">
              <span class="option-number">{{ option }}</span>
              <div v-if="answeredOption === option" class="option-status">
                <span class="status-icon">{{ option === currentNumber ? '✓' : '✗' }}</span>
              </div>
            </div>
            <div v-if="answeredOption === option && option === currentNumber" class="success-effect">
              <span class="success-particle">🎉</span>
              <span class="success-particle">✨</span>
              <span class="success-particle">🎊</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 反馈界面 -->
    <div class="feedback-screen" v-if="showFeedback">
      <div class="feedback-card" :class="feedbackClass">
        <div class="feedback-header">
          <div class="feedback-icon-large">
            {{ lastAnswer === currentNumber ? '🎉' : '💪' }}
          </div>
          <h2 class="feedback-title">
            {{ lastAnswer === currentNumber ? '太棒了！' : '加油！' }}
          </h2>
        </div>
        
        <div class="feedback-body">
          <p class="feedback-message">
            {{ lastAnswer === currentNumber ? '答对了！你真聪明！' : '没关系，继续努力！' }}
          </p>
          <div class="feedback-details" v-if="lastAnswer !== currentNumber">
            <div class="correct-answer-display">
              <span class="answer-label">正确答案是：</span>
              <span class="answer-number">{{ currentNumber }}</span>
            </div>
          </div>
        </div>

        <div class="feedback-actions">
          <button @click="nextQuestion" class="next-btn-modern" :class="{ 'success': lastAnswer === currentNumber }">
            <span class="btn-icon">{{ lastAnswer === currentNumber ? '🚀' : '➡️' }}</span>
            <span class="btn-text">{{ lastAnswer === currentNumber ? '继续挑战' : '下一题' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAudio } from '../composables/useAudio.js'

// 简单验证函数
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0

// Props 定义
const props = defineProps({
  currentNumber: {
    type: [Number, null],
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  showFeedback: {
    type: Boolean,
    default: false
  },
  lastAnswer: {
    type: [Number, null],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Events 定义
const emit = defineEmits({
  'check-answer': null,
  'next-question': null,
  'play-sound': null
})

// 使用音频功能
const audio = useAudio()

// 内部状态
const answeredOption = ref(null)
const isAnswering = ref(false)

// 计算属性
const isValidOptions = computed(() => {
  if (props.currentNumber === null) return false
  return props.options.length >= 2 &&
         props.options.every(option => isNonNegativeInteger(option)) &&
         props.options.includes(props.currentNumber)
})

const sortedOptions = computed(() => {
  if (!isValidOptions.value) return []
  return [...props.options].sort((a, b) => a - b)
})

const feedbackClass = computed(() => {
  return props.lastAnswer === props.currentNumber ? 'correct' : 'incorrect'
})

// 监听新题目，重置状态
watch(() => [props.currentNumber, props.options], () => {
  console.log('New question detected, resetting state')
  answeredOption.value = null
  isAnswering.value = false
}, { deep: true, immediate: true })

// 监听反馈状态变化，当从反馈回到选择状态时重置状态
watch(() => props.showFeedback, (newVal, oldVal) => {
  console.log('showFeedback changed:', oldVal, '->', newVal)
  if (!newVal && oldVal) {
    // 当showFeedback从true变为false时，立即重置组件状态
    console.log('Resetting state after feedback')
    answeredOption.value = null
    isAnswering.value = false
  }
})

// 监听 disabled 状态变化
watch(() => props.disabled, (newVal) => {
  console.log('disabled changed:', newVal)
  if (!newVal) {
    // 当disabled变为false时，确保状态已重置
    answeredOption.value = null
    isAnswering.value = false
  }
})

// 事件处理
const playSound = () => {
  emit('play-sound')
}

const checkAnswer = async (option) => {
  if (!isNonNegativeInteger(option) || isAnswering.value || answeredOption.value !== null || props.disabled) {
    return
  }

  isAnswering.value = true
  answeredOption.value = option

  try {
    // 立即发出答案检查事件，不在这里播放数字
    emit('check-answer', option)

  } catch (error) {
    console.warn('Failed to play sound:', error)
  }
}

const nextQuestion = () => {
  emit('next-question')
}
</script>

<style scoped>
.game-mode {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}

/* 游戏主界面布局 */
.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

/* 指令区域 */
.instruction-section {
  text-align: center;
}

.instruction-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.instruction-icon {
  font-size: 3em;
  animation: float 3s ease-in-out infinite;
}

.instruction-content {
  text-align: left;
  flex: 1;
}

.instruction-title {
  font-size: 1.4em;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.instruction-desc {
  font-size: 1em;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

/* 播放区域 */
.play-section {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.play-btn-modern {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  border: none;
  border-radius: 50px;
  padding: 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.play-btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 32px;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.play-btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s ease;
}

.play-btn-modern:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 40px rgba(79, 172, 254, 0.6);
}

.play-btn-modern:hover .play-btn-ripple {
  width: 200px;
  height: 200px;
}

.play-btn-modern:active {
  transform: translateY(-2px) scale(1.02);
}

.play-icon {
  font-size: 1.4em;
  animation: pulse 2s infinite;
}

.play-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 选项区域 */
.options-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.options-title {
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.options-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.option-btn-modern {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border: 3px solid #E2E8F0;
  border-radius: 24px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 120px;
  animation: slideInUp 0.6s ease-out var(--delay, 0s) both;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.option-number {
  font-size: 2.5em;
  font-weight: 800;
  color: #1E293B;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-status {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
}

.option-btn-modern:hover:not(:disabled) {
  transform: translateY(-6px) scale(1.05);
  border-color: #4FACFE;
  box-shadow: 0 16px 40px rgba(79, 172, 254, 0.3);
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F7FA 100%);
}

.option-btn-modern.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none !important;
}

.option-btn-modern.correct {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  border-color: #10B981;
  color: white;
  animation: successPulse 0.8s ease-out;
  transform: scale(1.1);
}

.option-btn-modern.correct .option-number {
  color: white;
}

.option-btn-modern.correct .option-status {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.option-btn-modern.incorrect {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  border-color: #EF4444;
  color: white;
  animation: errorShake 0.6s ease-out;
}

.option-btn-modern.incorrect .option-number {
  color: white;
}

.option-btn-modern.incorrect .option-status {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.success-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}

.success-particle {
  font-size: 1.5em;
  animation: particleFloat 1.2s ease-out;
}

.success-particle:nth-child(2) {
  animation-delay: 0.2s;
}

.success-particle:nth-child(3) {
  animation-delay: 0.4s;
}

/* 反馈界面 */
.feedback-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 70vh;
}

.feedback-card {
  background: white;
  border-radius: 32px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: feedbackSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-card.correct {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  color: white;
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
}

.feedback-card.correct::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

.feedback-card.incorrect {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  color: white;
  box-shadow: 0 20px 60px rgba(245, 158, 11, 0.4);
}

.feedback-header {
  margin-bottom: 24px;
}

.feedback-icon-large {
  font-size: 5em;
  margin-bottom: 16px;
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.feedback-title {
  font-size: 2.2em;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.feedback-body {
  margin-bottom: 32px;
}

.feedback-message {
  font-size: 1.3em;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 20px 0;
  opacity: 0.95;
}

.feedback-details {
  margin-top: 20px;
}

.correct-answer-display {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 16px 24px;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.answer-label {
  font-size: 1.1em;
  font-weight: 600;
  opacity: 0.9;
}

.answer-number {
  font-size: 2em;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 16px;
  min-width: 60px;
  text-align: center;
}

.feedback-actions {
  display: flex;
  justify-content: center;
}

.next-btn-modern {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 16px 32px;
  color: white;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.next-btn-modern:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.next-btn-modern.success {
  background: rgba(255, 255, 255, 0.25);
  animation: successGlow 2s ease-in-out infinite;
}

.btn-icon {
  font-size: 1.3em;
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.option-btn.correct {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  border-color: #10B981;
  color: white;
  animation: correctAnswer 0.6s ease-out, celebrationBounce 0.8s ease-out 0.6s;
  transform: scale(1.1);
}

.option-btn.incorrect {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  border-color: #EF4444;
  color: white;
  animation: incorrectAnswer 0.5s ease, wrongShake 0.6s ease;
}

/* 彩纸效果 */
.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.confetti-piece {
  font-size: 1.5em;
  animation: confettiFall 1s ease-out;
}

.confetti-piece:nth-child(2) {
  animation-delay: 0.2s;
}

.confetti-piece:nth-child(3) {
  animation-delay: 0.4s;
}

.option-number {
  font-size: 1.2em;
  z-index: 2;
}

.option-feedback {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 1.5em;
  font-weight: bold;
  z-index: 3;
  animation: feedbackPop 0.3s ease-out;
}

/* 现代化动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) rotate(180deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) rotate(360deg) scale(0);
    opacity: 0;
  }
}

@keyframes feedbackSlideIn {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(200%) rotate(45deg);
  }
}

@keyframes successGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
  }
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .game-main {
    gap: 16px;
    padding: 12px;
  }

  .instruction-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    gap: 12px;
  }

  .instruction-icon {
    font-size: 2.5em;
  }

  .instruction-title {
    font-size: 1.2em;
  }

  .instruction-desc {
    font-size: 0.9em;
  }

  .play-btn-content {
    padding: 16px 24px;
    font-size: 1em;
  }

  .play-icon {
    font-size: 1.2em;
  }

  .options-title {
    font-size: 1.1em;
  }

  .options-grid-modern {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .option-btn-modern {
    min-height: 100px;
  }

  .option-number {
    font-size: 2em;
  }

  .feedback-screen {
    padding: 16px;
  }

  .feedback-card {
    padding: 32px 24px;
  }

  .feedback-icon-large {
    font-size: 4em;
  }

  .feedback-title {
    font-size: 1.8em;
  }

  .feedback-message {
    font-size: 1.1em;
  }

  .answer-number {
    font-size: 1.6em;
  }

  .next-btn-modern {
    padding: 14px 28px;
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .options-grid-modern {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .option-btn-modern {
    min-height: 90px;
  }

  .option-number {
    font-size: 1.8em;
  }

  .instruction-card {
    padding: 16px;
  }

  .feedback-card {
    padding: 24px 16px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .game-main {
    gap: 12px;
  }

  .instruction-card {
    padding: 16px;
  }

  .instruction-icon {
    font-size: 2em;
  }

  .play-btn-content {
    padding: 12px 20px;
  }

  .options-grid-modern {
    grid-template-columns: repeat(4, 1fr);
  }

  .option-btn-modern {
    min-height: 80px;
  }

  .feedback-card {
    padding: 20px;
  }

  .feedback-icon-large {
    font-size: 3em;
    margin-bottom: 8px;
  }

  .feedback-title {
    font-size: 1.5em;
  }
}
</style>