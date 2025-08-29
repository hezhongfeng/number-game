// 本地存储工具函数
export class StorageUtil {
  /**
   * 设置本地存储
   * @param {string} key 键名
   * @param {any} value 值
   */
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('设置本地存储失败:', error)
    }
  }

  /**
   * 获取本地存储
   * @param {string} key 键名
   * @param {any} defaultValue 默认值
   * @returns {any} 存储的值或默认值
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return defaultValue
    }
  }

  /**
   * 删除本地存储
   * @param {string} key 键名
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('删除本地存储失败:', error)
    }
  }

  /**
   * 清空所有本地存储
   */
  static clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空本地存储失败:', error)
    }
  }
}
