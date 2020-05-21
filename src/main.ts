import { createNode } from 'dom'

type StateManager = ReturnType<typeof stateManager>
const DING = 'sounds/ding-sound-effect_2.mp3'

function main() {
  const addButton = document.getElementById('add-player') as HTMLButtonElement | null
  const resetButton = document.getElementById('reset') as HTMLButtonElement | null
  const saveButton = document.getElementById('save') as HTMLButtonElement | null
  const playerNameInput = document.getElementById('player-name') as HTMLInputElement | null
  const playerListElement = document.getElementById('player-list') as HTMLUListElement | null
  assert(addButton !== null)
  assert(resetButton !== null)
  assert(saveButton !== null)
  assert(playerNameInput !== null)
  assert(playerListElement !== null)
  const state: StateManager = stateManager()
  const scores = state.get()
  playerListElement.append(...initialPlayingBoard(scores))
  addButton.addEventListener('click', addPlayer(scores, playerListElement, playerNameInput))
  resetButton.addEventListener('click', () => {
    Array.from(playerListElement.children).forEach(c => c.remove())
    state.clear(scores)
  })
  saveButton.addEventListener('click', () => state.set(scores))
  prefetchDing()
}

function prefetchDing() {
  const ding = new Audio(DING)
  ding.volume = 0
  ding.play()
}

function initialPlayingBoard(scores: Map<string, number>) {
  return Array.from(scores.keys(), playerName => makePlayerListItem(playerName, scores))
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
    new Audio(DING).play()
  }
}

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg)
  }
}

type PartialStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
function stateManager(storage: PartialStorage = localStorage) {
  const storageKey = 'scores'
  return {
    get: (): Map<string, number> => {
      const json: Record<string, number> = JSON.parse(storage.getItem(storageKey) || '{}')
      const scores = new Map<string, number>()
      for (const [playerName, playerScore] of Object.entries(json)) {
        scores.set(playerName, playerScore)
      }
      return scores
    },
    set: (scores: Map<string, number>) => {
      const json: Record<string, number> = {}
      for (const [playerName, playerScore] of scores.entries()) {
        json[playerName] = playerScore
      }
      storage.setItem(storageKey, JSON.stringify(json))
    },
    clear: (scores: Map<string, number>) => {
      scores.clear()
      storage.removeItem(storageKey)
    },
  } as const
}

window.onload = main
