/**
 * 音频和语音管理 - 只使用浏览器原生语音合成
 */
import { ref, nextTick } from 'vue'
import { APP_CONFIG } from '../config/app.config.js'
import GameService from '../services/GameService.js'

const speechSynth = window.speechSynthesis
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function useAudio() {
  const isSupported = ref(!!speechSynth && !!SpeechRecognition)
  const isListening = ref(false)
  const recognitionResult = ref('')
  const recognitionError = ref('')
  const useOfflineVoice = ref(false) // 使用浏览器原生语音

  let recognition = null
  let currentUtterance = null

  // 获取最佳中文语音
  const getBestVoice = () => {
    if (!speechSynth) return null
    
    const voices = speechSynth.getVoices()
    
    // 优先选择中文语音，按质量排序
    const chineseVoices = voices.filter(voice => 
      voice.lang.includes('zh') || 
      voice.lang.includes('CN') ||
      voice.name.includes('Chinese') ||
      voice.name.includes('中文') ||
      voice.name.includes('Mandarin')
    )
    
    // 按优先级排序：本地语音 > 网络语音，女声 > 男声
    const sortedVoices = chineseVoices.sort((a, b) => {
      // 本地语音优先
      if (a.localService && !b.localService) return -1
      if (!a.localService && b.localService) return 1
      
      // 女声优先（通常更清晰）
      if (a.name.includes('Female') && !b.name.includes('Female')) return -1
      if (!a.name.includes('Female') && b.name.includes('Female')) return 1
      
      return 0
    })
    
    return sortedVoices[0] || voices[0] || null
  }

  // 初始化语音识别
  const initRecognition = () => {
    if (!SpeechRecognition) {
      console.warn('浏览器不支持语音识别')
      return false
    }

    try {
      recognition = new SpeechRecognition()
      recognition.lang = APP_CONFIG.speech.lang
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isListening.value = true
        recognitionError.value = ''
      }

      recognition.onend = () => {
        isListening.value = false
      }

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript
        recognitionResult.value = result
        isListening.value = false
      }

      recognition.onerror = (event) => {
        recognitionError.value = event.error
        isListening.value = false
        console.error('语音识别错误:', event.error)
      }

      return true
    } catch (error) {
      console.error('语音识别初始化失败:', error)
      return false
    }
  }

  // 停止语音播放
  const stopSpeech = () => {
    try {
      if (speechSynth) {
        if (speechSynth.speaking || speechSynth.pending) {
          speechSynth.cancel()
        }
      }
      currentUtterance = null
    } catch (error) {
      console.warn('停止语音播放时出错:', error)
      currentUtterance = null
    }
  }

  // 播放数字语音 - 使用浏览器语音合成，特别优化数字3
  const playNumber = (number, options = {}) => {
    return new Promise((resolve) => {
      if (!speechSynth) {
        console.warn('浏览器不支持语音合成')
        resolve()
        return
      }

      try {
        // 停止当前播放
        stopSpeech()

        // 等待语音列表加载完成
        const initVoices = () => {
          const voices = speechSynth.getVoices()
          if (voices.length === 0) {
            setTimeout(initVoices, 100)
            return
          }
          
          // 获取优化的中文数字文本
          const getChineseNumber = (num) => {
            const chineseNumbers = {
              '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
              '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
              '10': '十', '11': '十一', '12': '十二', '13': '十三', '14': '十四',
              '15': '十五', '16': '十六', '17': '十七', '18': '十八', '19': '十九',
              '20': '二十'
            }
            return chineseNumbers[String(num)] || String(num)
          }

          // 获取针对特定数字的语音参数，专门优化中文发音
          const getVoiceParams = (num) => {
            const numStr = String(num)
            
            switch (numStr) {
              case '3':
                return {
                  rate: 0.5, // 慢速，确保"三"字清晰
                  pitch: 1.3, // 提高音调，增强清晰度
                  volume: 1.0
                }
              case '1':
                return {
                  rate: 0.6, // "一"字需要适中语速
                  pitch: 1.2,
                  volume: 1.0
                }
              case '2':
                return {
                  rate: 0.6, // "二"字清晰发音
                  pitch: 1.1,
                  volume: 1.0
                }
              case '4':
                return {
                  rate: 0.6, // "四"字需要清晰
                  pitch: 1.2,
                  volume: 1.0
                }
              case '5':
                return {
                  rate: 0.7, // "五"字相对容易
                  pitch: 1.1,
                  volume: 1.0
                }
              case '6':
                return {
                  rate: 0.6, // "六"字需要清晰
                  pitch: 1.2,
                  volume: 1.0
                }
              case '7':
                return {
                  rate: 0.7, // "七"字适中
                  pitch: 1.1,
                  volume: 1.0
                }
              case '8':
                return {
                  rate: 0.6, // "八"字需要清晰
                  pitch: 1.2,
                  volume: 1.0
                }
              case '9':
                return {
                  rate: 0.7, // "九"字适中
                  pitch: 1.1,
                  volume: 1.0
                }
              case '0':
                return {
                  rate: 0.6, // "零"字需要清晰
                  pitch: 1.2,
                  volume: 1.0
                }
              default:
                return {
                  rate: 0.7, // 默认适合中文的语速
                  pitch: 1.1, // 稍高音调增强清晰度
                  volume: 1.0
                }
            }
          }

          const text = getChineseNumber(number)
          const params = getVoiceParams(number)
          const bestVoice = getBestVoice()

          console.log(`使用浏览器语音播放数字: ${number} -> ${text}`)

          const utterance = new SpeechSynthesisUtterance(text)
          currentUtterance = utterance

          // 使用最佳语音引擎
          if (bestVoice) {
            utterance.voice = bestVoice
            utterance.lang = bestVoice.lang
          } else {
            utterance.lang = options.lang || 'zh-CN'
          }

          // 应用优化后的语音配置
          utterance.rate = Math.max(0.1, Math.min(10, params.rate))
          utterance.pitch = Math.max(0, Math.min(2, params.pitch))
          utterance.volume = Math.max(0, Math.min(1, params.volume))

          // 设置超时处理
          const timeoutId = setTimeout(() => {
            if (currentUtterance === utterance) {
              stopSpeech()
              console.warn('语音播放超时')
              resolve()
            }
          }, 8000)

          utterance.onend = () => {
            clearTimeout(timeoutId)
            currentUtterance = null
            console.log(`浏览器语音播放完成: ${text}`)
            resolve()
          }

          utterance.onerror = (error) => {
            clearTimeout(timeoutId)
            currentUtterance = null
            console.warn('浏览器语音播放错误:', error)
            resolve()
          }

          // 确保语音合成器准备就绪
          if (speechSynth.speaking) {
            speechSynth.cancel()
          }

          // 延迟播放
          setTimeout(() => {
            if (currentUtterance === utterance) {
              speechSynth.speak(utterance)
            }
          }, 200)
        }

        // 开始初始化语音
        initVoices()

      } catch (error) {
        console.warn('浏览器语音播放异常:', error)
        resolve()
      }
    })
  }

  // 播放数字语音（慢速清晰版本）
  const playNumberSlow = (number, options = {}) => {
    return new Promise((resolve) => {
      if (!speechSynth) {
        console.warn('浏览器不支持语音合成')
        resolve()
        return
      }

      try {
        // 停止当前播放
        stopSpeech()

        // 等待语音列表加载完成
        const initSlowVoices = () => {
          const voices = speechSynth.getVoices()
          if (voices.length === 0) {
            setTimeout(initSlowVoices, 100)
            return
          }

          // 中文数字映射，确保最清晰的发音
          const chineseNumbers = {
            '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
            '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
            '10': '十', '11': '十一', '12': '十二', '13': '十三', '14': '十四',
            '15': '十五', '16': '十六', '17': '十七', '18': '十八', '19': '十九',
            '20': '二十'
          }

          const text = chineseNumbers[String(number)] || String(number)
          const bestVoice = getBestVoice()
          const utterance = new SpeechSynthesisUtterance(text)
          currentUtterance = utterance

          console.log(`使用浏览器语音慢速播放数字: ${number} -> ${text}`)

          // 使用最佳语音引擎
          if (bestVoice) {
            utterance.voice = bestVoice
            utterance.lang = bestVoice.lang
          } else {
            utterance.lang = 'zh-CN'
          }

          // 慢速清晰的语音参数，专门优化中文
          utterance.rate = 0.4 // 适合中文的慢速语速
          utterance.pitch = 1.2 // 提高音调增强中文清晰度
          utterance.volume = 1.0 // 最大音量

          // 设置超时处理
          const timeoutId = setTimeout(() => {
            if (currentUtterance === utterance) {
              stopSpeech()
              console.warn('慢速语音播放超时')
              resolve()
            }
          }, 10000) // 10秒超时

          utterance.onend = () => {
            clearTimeout(timeoutId)
            currentUtterance = null
            console.log(`慢速语音播放完成: ${text}`)
            resolve()
          }

          utterance.onerror = (error) => {
            clearTimeout(timeoutId)
            currentUtterance = null
            console.warn('慢速语音播放错误:', error)
            resolve()
          }

          // 确保语音合成器准备就绪
          if (speechSynth.speaking) {
            speechSynth.cancel()
          }

          setTimeout(() => {
            if (currentUtterance === utterance) {
              speechSynth.speak(utterance)
            }
          }, 200)
        }

        // 开始初始化慢速语音
        initSlowVoices()

      } catch (error) {
        console.warn('慢速语音播放异常:', error)
        resolve()
      }
    })
  }

  // 开始语音识别
  const startRecognition = () => {
    return new Promise((resolve, reject) => {
      if (!recognition) {
        if (!initRecognition()) {
          reject(new Error('语音识别初始化失败'))
          return
        }
      }

      recognitionResult.value = ''
      recognitionError.value = ''

      const handleResult = () => {
        recognition.removeEventListener('result', handleResult)
        recognition.removeEventListener('error', handleError)
        resolve({
          success: true,
          transcript: recognitionResult.value
        })
      }

      const handleError = () => {
        recognition.removeEventListener('result', handleResult)
        recognition.removeEventListener('error', handleError)
        reject(new Error(recognitionError.value))
      }

      recognition.addEventListener('result', handleResult)
      recognition.addEventListener('error', handleError)

      try {
        recognition.start()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 停止语音识别
  const stopRecognition = () => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  // 播放音效 - 儿童友好的语音反馈
  const playSound = (type = 'success', volume = 1.0) => {
    return new Promise((resolve) => {
      if (!speechSynth) {
        console.warn('浏览器不支持语音合成')
        resolve()
        return
      }

      try {
        let text = ''
        let voiceParams = {
          rate: 1.0,
          pitch: 1.2,
          volume: volume
        }

        // 根据类型选择不同的儿童友好反馈
        switch (type) {
          case 'correct':
            const correctPhrases = [
              '太棒了！你真聪明！',
              '答对了！真厉害！',
              '好棒好棒！继续加油！',
              '哇！你太厉害了！',
              '完全正确！真聪明！',
              '太好了！你做得很棒！'
            ]
            text = correctPhrases[Math.floor(Math.random() * correctPhrases.length)]
            voiceParams = {
              rate: 0.9, // 适合中文的庆祝语速
              pitch: 1.3, // 高音调但适合中文发音
              volume: volume
            }
            break
            
          case 'encourage':
          case 'incorrect':
            const encouragePhrases = [
              '没关系，再试一次！',
              '继续努力，你可以的！',
              '加油！下次一定能答对！',
              '不要放弃，再想想看！',
              '很接近了，继续加油！',
              '相信自己，你一定行的！'
            ]
            text = encouragePhrases[Math.floor(Math.random() * encouragePhrases.length)]
            voiceParams = {
              rate: 0.8, // 慢一点，更温和
              pitch: 1.1, // 稍微提高，保持亲切感
              volume: volume
            }
            break
            
          case 'start':
            text = '开始答题！'
            voiceParams = {
              rate: 0.8, // 适合中文的开始语速
              pitch: 1.2, // 充满活力的音调
              volume: volume
            }
            break
            
          case 'finish':
            text = '游戏结束！'
            voiceParams = {
              rate: 0.7, // 慢一点，更庄重
              pitch: 1.1, // 稍微提高，保持正面
              volume: volume
            }
            break
            
          default:
            console.log(`音效类型: ${type}`)
            resolve()
            return
        }

        console.log(`使用浏览器语音播放音效: ${type} -> ${text}`)

        // 创建新的语音实例，避免与数字播放冲突
        const utterance = new SpeechSynthesisUtterance(text)
        const bestVoice = getBestVoice()
        
        if (bestVoice) {
          utterance.voice = bestVoice
          utterance.lang = bestVoice.lang
        } else {
          utterance.lang = APP_CONFIG.speech.lang
        }
        
        utterance.rate = Math.max(0.1, Math.min(10, voiceParams.rate))
        utterance.pitch = Math.max(0, Math.min(2, voiceParams.pitch))
        utterance.volume = Math.max(0, Math.min(1, voiceParams.volume))

        // 设置超时处理
        const timeoutId = setTimeout(() => {
          console.warn('音效播放超时')
          resolve()
        }, 3000)

        utterance.onend = () => {
          clearTimeout(timeoutId)
          console.log(`音效播放完成: ${text}`)
          resolve()
        }

        utterance.onerror = (error) => {
          clearTimeout(timeoutId)
          console.warn('音效播放错误:', error)
          resolve()
        }

        // 等待一小段时间再播放，避免与数字播放冲突
        setTimeout(() => {
          try {
            speechSynth.speak(utterance)
          } catch (error) {
            clearTimeout(timeoutId)
            console.warn('音效播放启动失败:', error)
            resolve()
          }
        }, 200)

      } catch (error) {
        console.warn('音效播放异常:', error)
        resolve()
      }
    })
  }

  // 验证数字发音（委托给 GameService）
  const verifyNumberSpeech = (targetNumber, spokenText) => {
    return GameService.verifyNumberSpeech(targetNumber, spokenText)
  }

  return {
    // 状态
    isSupported,
    isListening,
    recognitionResult,
    recognitionError,
    useOfflineVoice, // 浏览器原生语音状态

    // 方法
    playNumber,
    playNumberSlow,
    stopSpeech,
    startRecognition,
    stopRecognition,
    playSound,
    verifyNumberSpeech,
  }
}