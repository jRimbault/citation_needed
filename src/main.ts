import { debounce, createNode } from 'dom'

window.onload = () => {
  const scores = new Map<string, number>()
  const addButton = document.getElementById('add-player') as HTMLButtonElement | null
  const playerNameInput = document.getElementById('player-name') as HTMLInputElement | null
  const playerListElement = document.getElementById('player-list') as HTMLUListElement | null
  assert(addButton)
  assert(playerNameInput)
  assert(playerListElement)
  addButton.addEventListener(
    'click',
    debounce(() => {
      const value = playerNameInput.value
      if (value !== ' ' && !scores.has(value)) {
        scores.set(value, 0)
        addPlayer(playerListElement, value, scores)
      }
    }),
  )
}

function addPlayer(list: HTMLUListElement, playerName: string, scores: Map<string, number>) {
  const score = createNode('span', { textContent: '0' })
  const button = createNode('button', {
    textContent: '+1',
    listeners: {
      click: {
        callback: () => {
          let playerScore = scores.get(playerName)
          assert(playerScore)
          playerScore += 1
          scores.set(playerName, playerScore)
          score.textContent = playerScore.toString()
          new Audio('sounds/ding-sound-effect_2.mp3').play()
        },
      },
    },
  })
  list.append(
    createNode('li', {
      textContent: `${playerName} : `,
      children: [score, button],
    }),
  )
}

function assert(condition: unknown, msg?: string): asserts condition {
  if (condition === undefined) {
    throw new Error(msg)
  }
}
