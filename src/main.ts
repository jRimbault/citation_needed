import { createNode } from 'dom'

function main() {
  const addButton = document.getElementById('add-player') as HTMLButtonElement | null
  const playerNameInput = document.getElementById('player-name') as HTMLInputElement | null
  const playerListElement = document.getElementById('player-list') as HTMLUListElement | null
  assert(addButton)
  assert(playerNameInput)
  assert(playerListElement)
  addButton.addEventListener('click', addPlayer(new Map(), playerListElement, playerNameInput))
}

function addPlayer(scores: Map<string, number>, list: HTMLUListElement, input: HTMLInputElement) {
  return () => {
    const playerName = input.value
    if (playerName !== '' && !scores.has(playerName)) {
      list.append(makePlayerListItem(playerName, scores))
      input.value = ''
    }
  }
}

function makePlayerListItem(playerName: string, scores: Map<string, number>) {
  scores.set(playerName, 0)
  const score = createNode('span', { textContent: '0' })
  return createNode('li', {
    textContent: `${playerName} : `,
    children: [
      score,
      [
        'button',
        {
          textContent: '+1',
          listeners: {
            click: {
              callback: incrementScore(scores, playerName, newScore => (score.textContent = newScore.toString())),
            },
          },
        },
      ],
    ],
  })
}

function incrementScore(scores: Map<string, number>, playerName: string, scoreDisplay: (newScore: number) => void) {
  return () => {
    const oldScore = scores.get(playerName)
    assert(typeof oldScore === 'number')
    const newScore = oldScore + 1
    scores.set(playerName, newScore)
    scoreDisplay(newScore)
    new Audio('sounds/ding-sound-effect_2.mp3').play()
  }
}

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

window.onload = main
