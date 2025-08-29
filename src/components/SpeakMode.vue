<template>
  <div class="game-mode active">
    <div class="question-display">
      <div class="instruction-panel">
        <div class="instruction-text">
          <span class="instruction-icon">🎤</span>
          看着数字，清晰地朗读出来
        </div>
        <div class="voice-tips">
          <div class="tip-item">
            <span class="tip-icon">💡</span>
            <span class="tip-text">请靠近麦克风，清晰发音</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🔇</span>
            <span class="tip-text">保持环境安静</span>
          </div>
        </div>
      </div>

      <div class="number-container">
        <span class="big-number">{{ currentNumber }}</span>
        <div class="number-helpers">
          <!-- 数字拼音提示 -->
          <div class="pinyin-hint" v-if="showPinyinHint">
            {{ getNumberPinyin(currentNumber) }}
          </div>
          <!-- 听一遍按钮 -->
          <button @click="playNumberSound" class="listen-btn">
            <span class="listen-icon">👂</span>
            <span class="listen-text">听一遍</span>
          </button>
        </div>
      </div>
    </div>

    <div class="recognition-controls">
      <!-- 语音设置 -->
      <div class="voice-settings">
        <div class="setting-group">
          <label class="setting-label">识别语言:</label>
          <select v-model="recognitionLang" class="lang-select" @change="updateRecognitionSettings">
            <option value="zh-CN">中文(普通话)</option>
            <option value="zh-TW">中文(台湾)</option>
            <option value="zh-HK">中文(香港)</option>
            <option value="en-US">English</option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-label">识别敏感度:</label>
          <select v-model="recognitionSensitivity" class="sensitivity-select">
            <option value="high">高敏感度</option>
            <option value="medium">中等敏感度</option>
            <option value="low">低敏感度</option>
          </select>
        </div>
      </div>

      <!-- 识别按钮 -->
      <button
        @click="toggleRecognition"
        :class="['recognition-btn', recognitionState]"
        :disabled="!isSpeechSupported || disabled"
      >
        <span class="btn-icon">
          {{ recognitionState === 'listening' ? '🛑' : '🎤' }}
        </span>
        <span class="btn-text">
          {{ getRecognitionButtonText() }}
        </span>
        <div class="voice-waves" v-if="recognitionState === 'listening'">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </button>

      <!-- 识别状态和结果 -->
      <div class="recognition-feedback">
        <div class="status-display" :class="recognitionState">
          <span class="status-icon">{{ getStatusIcon() }}</span>
          <span class="status-text">{{ recognitionStatus }}</span>
        </div>

        <!-- 识别结果对比 -->
        <div class="result-comparison" v-if="lastRecognition">
          <div class="comparison-item expected">
            <span class="label">期望:</span>
            <span class="value">{{ currentNumber }}</span>
          </div>
          <div class="comparison-item recognized">
            <span class="label">识别:</span>
            <span class="value">{{ lastRecognition.text }}</span>
          </div>
          <div class="comparison-item confidence">
            <span class="label">置信度:</span>
            <span class="value">{{ lastRecognition.confidence }}%</span>
          </div>
        </div>
      </div>

      <!-- 多次尝试记录 -->
      <div class="attempts-history" v-if="attempts.length > 0">
        <div class="history-title">📝 尝试记录</div>
        <div class="attempts-list">
          <div
            v-for="(attempt, index) in attempts.slice(-3)"
            :key="index"
            :class="['attempt-item', { correct: attempt.isCorrect }]"
          >
            <span class="attempt-number">{{ attempts.length - index }}</span>
            <span class="attempt-text">{{ attempt.text }}</span>
            <span class="attempt-result">{{ attempt.isCorrect ? '✓' : '✗' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 发音练习辅助 -->
    <div class="pronunciation-help" v-if="showPronunciationHelp">
      <div class="help-title">🗣️ 发音小贴士</div>
      <div class="help-content">
        <div class="pronunciation-tips">
          <div class="tip-card" v-for="tip in getPronunciationTips(currentNumber)" :key="tip.id">
            <div class="tip-icon">{{ tip.icon }}</div>
            <div class="tip-text">{{ tip.text }}</div>
          </div>
        </div>
        <button @click="playSlowPronunciation" class="slow-play-btn">
          <span class="btn-icon">🐌</span>
          <span class="btn-text">慢速朗读</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentNumber: {
    type: [Number, null],
    required: true,
  },
  recognitionStatus: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-recognition', 'recognition-result'])

// 语音识别相关状态
const recognitionLang = ref('zh-CN')
const recognitionSensitivity = ref('medium')
const recognitionState = ref('idle') // idle, listening, processing
const isSpeechSupported = ref(false)
const recognition = ref(null)
const lastRecognition = ref(null)
const attempts = ref([])

// 辅助功能状态
const showPinyinHint = ref(false)
const showPronunciationHelp = ref(false)

// 数字拼音映射
const numberPinyinMap = {
  0: 'líng', 1: 'yī', 2: 'èr', 3: 'sān', 4: 'sì', 5: 'wǔ',
  6: 'liù', 7: 'qī', 8: 'bā', 9: 'jiǔ', 10: 'shí',
  11: 'shí yī', 12: 'shí èr', 13: 'shí sān', 14: 'shí sì', 15: 'shí wǔ',
  16: 'shí liù', 17: 'shí qī', 18: 'shí bā', 19: 'shí jiǔ', 20: 'èr shí'
}

// 检查语音识别支持
onMounted(() => {
  isSpeechSupported.value = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  if (isSpeechSupported.value) {
    initSpeechRecognition()
  }

  // 根据数字复杂度决定是否显示辅助功能
  updateHelpVisibility()
})

onUnmounted(() => {
  if (recognition.value) {
    recognition.value.stop()
  }
})

// 初始化语音识别
const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()

  updateRecognitionSettings()

  recognition.value.onstart = () => {
    recognitionState.value = 'listening'
  }

  recognition.value.onresult = (event) => {
    const result = event.results[0][0]
    const recognizedText = result.transcript.trim()
    const confidence = Math.round(result.confidence * 100)

    lastRecognition.value = {
      text: recognizedText,
      confidence: confidence
    }

    processRecognitionResult(recognizedText, confidence)
  }

  recognition.value.onerror = (event) => {
    console.error('语音识别错误:', event.error)
    recognitionState.value = 'idle'
    handleRecognitionError(event.error)
  }

  recognition.value.onend = () => {
    recognitionState.value = 'idle'
  }
}

// 更新识别设置
const updateRecognitionSettings = () => {
  if (!recognition.value) return

  recognition.value.lang = recognitionLang.value
  recognition.value.continuous = false
  recognition.value.interimResults = false

  // 根据敏感度调整设置
  switch (recognitionSensitivity.value) {
    case 'high':
      recognition.value.maxAlternatives = 5
      break
    case 'medium':
      recognition.value.maxAlternatives = 3
      break
    case 'low':
      recognition.value.maxAlternatives = 1
      break
  }
}

// 处理识别结果
const processRecognitionResult = (recognizedText, confidence) => {
  if (props.currentNumber === null) {
    console.warn('No current number to compare against')
    return
  }

  const cleanText = recognizedText.replace(/[^\d\u4e00-\u9fa5]/g, '')
  const recognizedNumber = parseChineseNumber(cleanText) || parseInt(cleanText)

  const isCorrect = recognizedNumber === props.currentNumber

  // 记录尝试
  attempts.value.push({
    text: recognizedText,
    recognizedNumber: recognizedNumber,
    isCorrect: isCorrect,
    confidence: confidence,
    timestamp: Date.now()
  })

  // 发送结果
  emit('recognition-result', {
    text: recognizedText,
    number: recognizedNumber,
    isCorrect: isCorrect,
    confidence: confidence,
    attempts: attempts.value.length
  })

  // 如果识别错误且置信度低，提供帮助
  if (!isCorrect && confidence < 70) {
    showPronunciationHelp.value = true
  }
}

// 解析中文数字
const parseChineseNumber = (text) => {
  const chineseNumbers = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5,
    '陆': 6, '柒': 7, '捌': 8, '玖': 9, '拾': 10
  }

  // 简单的中文数字转换
  if (chineseNumbers[text]) {
    return chineseNumbers[text]
  }

  // 处理"十几"的情况
  if (text.includes('十')) {
    if (text === '十') return 10
    if (text.startsWith('十')) {
      const unit = text.substring(1)
      return 10 + (chineseNumbers[unit] || 0)
    }
    if (text.endsWith('十')) {
      const tens = text.substring(0, text.length - 1)
      return (chineseNumbers[tens] || 0) * 10
    }
  }

  return null
}

// 切换识别状态
const toggleRecognition = () => {
  if (!isSpeechSupported.value) return

  if (recognitionState.value === 'listening') {
    recognition.value.stop()
  } else {
    recognition.value.start()
  }
}

// 获取数字拼音
const getNumberPinyin = (number) => {
  if (number <= 20) {
    return numberPinyinMap[number] || ''
  }

  // 处理更大的数字
  const tens = Math.floor(number / 10)
  const units = number % 10

  if (units === 0) {
    return `${numberPinyinMap[tens]} shí`
  } else {
    return `${numberPinyinMap[tens]} shí ${numberPinyinMap[units]}`
  }
}

// 获取发音提示
const getPronunciationTips = (number) => {
  const tips = []

  if (number >= 10) {
    tips.push({
      id: 1,
      icon: '🔟',
      text: '"十"读作"shí"，要清晰发音'
    })
  }

  if (number % 10 === 0 && number > 0) {
    tips.push({
      id: 2,
      icon: '🎯',
      text: '整十数要注意"十"的发音'
    })
  }

  if ([2, 12, 20].includes(number)) {
    tips.push({
      id: 3,
      icon: '👄',
      text: '"二"读作"èr"，口型要圆'
    })
  }

  return tips
}

// 播放数字发音
const playNumberSound = async () => {
  if (props.currentNumber === null) return

  try {
    // 对于容易混淆的数字，使用慢速清晰发音
    if ([2, 5, 6, 8].includes(props.currentNumber)) {
      // 使用慢速清晰发音
      const chineseNumbers = {
        '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
        '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'
      }

      const text = chineseNumbers[String(props.currentNumber)] || String(props.currentNumber)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.4 // 非常慢的语速
      utterance.pitch = 1.1 // 稍微提高音调
      utterance.volume = 0.9
      window.speechSynthesis.speak(utterance)
    } else {
      // 正常数字使用标准发音
      const utterance = new SpeechSynthesisUtterance(props.currentNumber.toString())
      utterance.lang = 'zh-CN'
      utterance.rate = 0.6
      utterance.pitch = 1.0
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance)
    }
  } catch (error) {
    console.warn('Failed to play number sound:', error)
  }
}

// 播放慢速发音
const playSlowPronunciation = async () => {
  if (props.currentNumber === null) return

  try {
    // 强制使用中文发音，更清晰
    const chineseNumbers = {
      '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
      '5': '五', '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'
    }

    const text = chineseNumbers[String(props.currentNumber)] || String(props.currentNumber)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'

    // 最慢的语速，特别针对数字"5"进行优化
    if (props.currentNumber === 5) {
      utterance.rate = 0.25 // 极其缓慢
      utterance.pitch = 1.2 // 较高音调
      utterance.volume = 1.0 // 最高音量
    } else {
      utterance.rate = 0.3
      utterance.pitch = 1.1
      utterance.volume = 0.9
    }

    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.warn('Failed to play slow pronunciation:', error)
  }
}

// 更新辅助功能可见性
const updateHelpVisibility = () => {
  // 对于较难的数字显示拼音提示
  showPinyinHint.value = props.currentNumber !== null && props.currentNumber >= 10
}

// 处理识别错误
const handleRecognitionError = (error) => {
  let errorMessage = ''

  switch (error) {
    case 'no-speech':
      errorMessage = '没有检测到语音，请重试'
      break
    case 'audio-capture':
      errorMessage = '无法访问麦克风，请检查权限'
      break
    case 'not-allowed':
      errorMessage = '麦克风权限被拒绝'
      break
    case 'network':
      errorMessage = '网络错误，请检查连接'
      break
    default:
      errorMessage = '识别失败，请重试'
  }

  emit('recognition-result', {
    error: true,
    message: errorMessage
  })
}

// 计算属性
const getRecognitionButtonText = () => {
  if (!isSpeechSupported.value) return '不支持语音识别'

  switch (recognitionState.value) {
    case 'listening': return '停止录音'
    case 'processing': return '处理中...'
    default: return '开始朗读'
  }
}

const getStatusIcon = () => {
  switch (recognitionState.value) {
    case 'listening': return '🎤'
    case 'processing': return '⏳'
    default: return '💭'
  }
}
</script>

<style scoped>
.game-mode {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.question-display {
  text-align: center;
  margin-bottom: 30px;
}

/* 指示面板 */
.instruction-panel {
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F7FA 100%);
  border: 2px solid #06B6D4;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
}

.instruction-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 1.2em;
  font-weight: 600;
  color: #0891B2;
}

.instruction-icon {
  font-size: 1.5em;
  animation: microphoneBounce 2s ease-in-out infinite;
}

.voice-tips {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  color: #0369A1;
}

.tip-icon {
  font-size: 1.1em;
}

/* 数字容器 */
.number-container {
  position: relative;
  display: inline-block;
}

.big-number {
  font-size: 8em;
  font-weight: bold;
  color: #2563EB;
  text-shadow: 4px 4px 0 #BFDBFE;
  display: inline-block;
  animation: numberGlow 3s ease-in-out infinite;
}

.number-helpers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pinyin-hint {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: 600;
  border: 2px solid #F59E0B;
  animation: hintPulse 2s ease-in-out infinite;
}

.listen-btn {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.listen-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

/* 识别控制区域 */
.recognition-controls {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
}

/* 语音设置 */
.voice-settings {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  border: 2px solid #E2E8F0;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9em;
}

.lang-select,
.sensitivity-select {
  padding: 6px 12px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lang-select:focus,
.sensitivity-select:focus {
  border-color: #4FACFE;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

/* 识别按钮 */
.recognition-btn {
  position: relative;
  background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 25px;
  font-size: 1.3em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  min-width: 200px;
  justify-content: center;
}

.recognition-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(236, 72, 153, 0.4);
}

.recognition-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recognition-btn.listening {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  animation: listeningPulse 1s ease-in-out infinite;
}

.btn-icon {
  font-size: 1.3em;
}

/* 语音波浪动画 */
.voice-waves {
  position: absolute;
  right: 15px;
  display: flex;
  gap: 3px;
  align-items: center;
}

.wave {
  width: 4px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  animation: waveAnimation 1s ease-in-out infinite;
}

.wave:nth-child(2) {
  animation-delay: 0.2s;
  height: 25px;
}

.wave:nth-child(3) {
  animation-delay: 0.4s;
  height: 15px;
}

/* 识别反馈 */
.recognition-feedback {
  width: 100%;
  max-width: 500px;
}

.status-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 15px;
  margin-bottom: 20px;
  font-weight: 500;
  color: #64748B;
  transition: all 0.3s ease;
}

.status-display.listening {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-color: #EF4444;
  color: #B91C1C;
  animation: statusPulse 1s ease-in-out infinite;
}

.status-display.processing {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: #F59E0B;
  color: #92400E;
}

.status-icon {
  font-size: 1.3em;
}

/* 结果对比 */
.result-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.comparison-item {
  text-align: center;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid;
}

.comparison-item.expected {
  background: #F0FDF4;
  border-color: #22C55E;
  color: #15803D;
}

.comparison-item.recognized {
  background: #FEF3C7;
  border-color: #F59E0B;
  color: #92400E;
}

.comparison-item.confidence {
  background: #F0F9FF;
  border-color: #3B82F6;
  color: #1D4ED8;
}

.comparison-item .label {
  display: block;
  font-size: 0.8em;
  font-weight: 600;
  margin-bottom: 5px;
  opacity: 0.8;
}

.comparison-item .value {
  font-size: 1.2em;
  font-weight: bold;
}

/* 尝试历史 */
.attempts-history {
  width: 100%;
  max-width: 400px;
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 15px;
  padding: 20px;
}

.history-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  text-align: center;
}

.attempts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attempt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  border: 2px solid #FCA5A5;
  color: #B91C1C;
}

.attempt-item.correct {
  border-color: #86EFAC;
  color: #15803D;
}

.attempt-number {
  background: currentColor;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  font-weight: bold;
  flex-shrink: 0;
}

.attempt-text {
  flex: 1;
  font-weight: 600;
}

.attempt-result {
  font-size: 1.2em;
  font-weight: bold;
}

/* 发音帮助 */
.pronunciation-help {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  border: 2px solid #F87171;
  border-radius: 20px;
  padding: 25px;
  margin-top: 20px;
}

.help-title {
  font-weight: bold;
  color: #B91C1C;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.2em;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.pronunciation-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #FCA5A5;
}

.tip-card .tip-icon {
  font-size: 1.3em;
  flex-shrink: 0;
}

.tip-card .tip-text {
  color: #B91C1C;
  font-weight: 500;
  line-height: 1.4;
}

.slow-play-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.slow-play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

/* 动画定义 */
@keyframes microphoneBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes numberGlow {
  0%, 100% {
    text-shadow: 4px 4px 0 #BFDBFE, 0 0 20px #3B82F6;
  }
  50% {
    text-shadow: 4px 4px 0 #FBBF24, 0 0 30px #F59E0B;
  }
}

@keyframes hintPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5);
  }
}

@keyframes listeningPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 12px 35px rgba(236, 72, 153, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 15px 45px rgba(236, 72, 153, 0.6);
  }
}

@keyframes waveAnimation {
  0%, 100% {
    transform: scaleY(1);
    opacity: 0.7;
  }
  50% {
    transform: scaleY(1.8);
    opacity: 1;
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .big-number {
    font-size: 5em;
  }

  .voice-settings {
    flex-direction: column;
    gap: 15px;
  }

  .result-comparison {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .recognition-btn {
    padding: 15px 30px;
    font-size: 1.1em;
    min-width: 180px;
  }

  .pronunciation-help {
    padding: 20px;
  }
}
</style>
