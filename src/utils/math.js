// 数学工具函数
export class MathUtil {
  /**
   * 生成指定范围内的随机整数
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {number} 随机整数
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机数字序列
   * @param {number} length 序列长度
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @returns {number[]} 数字序列
   */
  static generateSequence(length, min = 0, max = 9) {
    return Array.from({ length }, () => this.randomInt(min, max))
  }

  /**
   * 打乱数组顺序
   * @param {any[]} array 原数组
   * @returns {any[]} 打乱后的数组
   */
  static shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 生成数学运算题
   * @param {string} operator 运算符 (+, -, *, /)
   * @param {number} difficulty 难度等级
   * @returns {object} 运算题对象
   */
  static generateMathProblem(operator = '+', difficulty = 1) {
    const range = difficulty * 10
    let a, b, answer

    switch (operator) {
      case '+':
        a = this.randomInt(1, range)
        b = this.randomInt(1, range)
        answer = a + b
        break
      case '-':
        a = this.randomInt(range / 2, range)
        b = this.randomInt(1, a)
        answer = a - b
        break
      case '*':
        a = this.randomInt(1, Math.min(range / 2, 12))
        b = this.randomInt(1, Math.min(range / 2, 12))
        answer = a * b
        break
      case '/':
        answer = this.randomInt(1, range / 2)
        b = this.randomInt(2, 10)
        a = answer * b
        break
      default:
        a = this.randomInt(1, range)
        b = this.randomInt(1, range)
        answer = a + b
    }

    return { a, b, operator, answer, question: `${a} ${operator} ${b}` }
  }
}
