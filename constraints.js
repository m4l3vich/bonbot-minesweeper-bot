const constraints = [
  {
    type: 'smaller',
    regex: /(\d{4}) (меньше|не больше) чем пинкод/,
    filter: (num, match) => num >= Number(match[1])
  },
  {
    type: 'greater',
    regex: /(\d{4}) (больше|не меньше) чем пинкод/,
    filter: (num, match) => num <= Number(match[1])
  },
  {
    type: 'even/odd',
    regex: /Это число (не|)четное/,
    filter: (num, match) => num % 2 === (match[1].length ? 1 : 0)
  },
  {
    type: 'sum',
    regex: /В сумме цифр пинкод даст (\d+)/,
    filter: (num, match) => num.toString().split('').reduce((a, v) => +a + +v, 0) === Number(match[1])
  },
  {
    type: 'number sum',
    regex: /Если сложить (\d) и (\d) цифры пинкода то получится (\d+)/,
    filter: (num, match) => {
      const id1 = Number(match[1]) - 1
      const id2 = Number(match[2]) - 1
      const sum = Number(match[3])
      const nums = num.toString().split('').map(e => +e)
      return nums[id1] + nums[id2] === sum
    }
  },
  {
    type: 'number even/odd',
    regex: /(\d) цифра пинкода (не|)чётная/,
    filter: (num, match) => {
      const i = Number(match[1]) - 1
      const nums = num.toString().split('').map(e => +e)
      return nums[i] % 2 === (match[2].length ? 1 : 0)
    }
  },
  {
    type: 'remainder',
    regex: /Пинкод (не |)делится на (\d+) без остатка/,
    filter: (num, match) => {
      if (match[1].length) return num % Number(match[2]) !== 0
      return num % Number(match[2]) === 0
    }
  }
]

// export default constraints

export class Constraint {
  constructor (text) {
    this.base = constraints.find(e => e.regex.test(text))
    this.match = text.match(this.base.regex)
  }

  filter (num) {
    return this.base.filter(num, this.match)
  }
}
