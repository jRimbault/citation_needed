import { createNode } from 'dom'

function main() {
  const addButton = document.getElementById('add-player') as HTMLButtonElement | null
  const resetButton = document.getElementById('reset') as HTMLButtonElement | null
  const saveButton = document.getElementById('save') as HTMLButtonElement | null
  const playerNameInput = document.getElementById('player-name') as HTMLInputElement | null
  const playerListElement = document.getElementById('player-list') as HTMLUListElement | null
  assert(addButton)
  assert(resetButton)
  assert(saveButton)
  assert(playerNameInput)
  assert(playerListElement)
  const scores = getInitialState()
  initPlayingBoard(scores, playerListElement)
  addButton.addEventListener('click', addPlayer(scores, playerListElement, playerNameInput))
  resetButton.addEventListener('click', () => {
    scores.clear()
    Array.from(playerListElement.children).forEach(c => c.remove())
    localStorage.removeItem('scores')
  })
  saveButton.addEventListener('click', () => {
    const json: Record<string, number> = {}
    for (const [playerName, playerScore] of scores.entries()) {
      json[playerName] = playerScore
    }
    localStorage.setItem('scores', JSON.stringify(json))
  })
}

function getInitialState() {
  const json: Record<string, number> = JSON.parse(localStorage.getItem('scores') || '{}')
  const scores = new Map<string, number>()
  for (const [playerName, playerScore] of Object.entries(json)) {
    scores.set(playerName, playerScore)
  }
  return scores
}

function initPlayingBoard(scores: Map<string, number>, list: HTMLUListElement) {
  for (const playerName of scores.keys()) {
    list.append(makePlayerListItem(playerName, scores))
  }
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
  const initScore = scores.get(playerName) || 0
  if (!initScore) {
    scores.set(playerName, 0)
  }
  const score = createNode('span', { textContent: initScore.toString() })
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
