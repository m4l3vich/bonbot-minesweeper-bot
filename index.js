import { VK } from 'vk-io'
import { HearManager } from '@vk-io/hear'

import { Constraint } from './constraints'

const BOTBON_ID = 183202890

const vk = new VK({
  token: process.env.TOKEN
})

const db = new Map() // { peerid: { start, used: [Number], [constraints] } }

const hearManager = new HearManager()
vk.updates.on('message_new', hearManager.middleware)

hearManager.hear('!peerid', async ctx => ctx.send(ctx.peerId))

hearManager.hear('!minesweep', async ctx => {
  if (db.get(ctx.peerId)) return ctx.send('ща падажжи')
  return ctx.send('/пин начать')
})

vk.updates.on('message_new', async ctx => {
  if (ctx.senderId !== -BOTBON_ID) return

  const regex1 = /🧨 Похоже чтобы остановить бомбу нужен четырёхзначный пинкод\.\n✨ Есть догадки, что: (.+)\./
  const regex2 = /💢 Пинкод не подошёл, количество попыток стало меньше\.\n🔢 (.+)\n♥ До взрыва: (⚙+)/
  const regexWin = /✔ Пинкод подошёл!/

  if (regex1.test(ctx.text)) {
    const constraintText = ctx.text.match(regex1)[1]
    const constraint = new Constraint(constraintText)

    const possible = Array(9000).fill(0)
      .map((e, i) => i + 1000)
      .filter(e => constraint.filter(e))

    const attempt = possible[Math.floor(Math.random() * possible.length)]

    db.set(ctx.peerId, {
      start: Date.now(),
      used: [attempt],
      constraints: [constraint]
    })

    return ctx.send(`/пин ${attempt} (ещё ${possible.length - 1} чисел)`)
  } else if (regex2.test(ctx.text)) {
    const match = ctx.text.match(regex2)
    const constraintText = match[1]

    const attempts = match[2].length
    if (attempts === 1) return ctx.send('ну я хуй знает тогда')

    const constraint = new Constraint(constraintText)
    const dbObj = db.get(ctx.peerId)

    dbObj.constraints.push(constraint)

    let possible = Array(9000).fill(0)
      .map((e, i) => i + 1000)
      .filter(e => !dbObj.used.includes(e))

    dbObj.constraints.forEach(constraint => {
      possible = possible.filter(e => constraint.filter(e))
    })

    const attempt = possible[Math.floor(Math.random() * possible.length)]

    if (!attempt) return ctx.send('я хз')

    dbObj.used.push(attempt)

    return ctx.send(`/пин ${attempt} (ещё ${possible.length - 1} чисел, есть ${dbObj.constraints.length} подсказок)`)
  } else if (regexWin.test(ctx.text)) {
    const dbObj = db.get(ctx.peerId)
    return ctx.send(`GG за ${dbObj.used.length} попыток разъебал лол`)
  }
})

vk.updates.start().catch(console.error)
