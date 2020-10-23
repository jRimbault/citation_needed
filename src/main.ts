import { createNode } from 'dom'

type StateManager = ReturnType<typeof stateManager>
type StaticHtml = ReturnType<typeof getStaticHtmlElements>

const DING = 'sounds/ding-sound-effect_2.mp3'

function main({ add, reset, save, playerName, playerList }: StaticHtml) {
  const state = stateManager()
  const scores = state.get()
  playerList.append(...initialPlayingBoard(scores))
  add.addEventListener('click', addPlayer(scores, playerList, playerName))
  reset.addEventListener('click', () => {
    Array.from(playerList.children).forEach(c => c.remove())
    state.clear(scores)
  })
  save.addEventListener('click', () => state.set(scores))
  prefetchDing()
}

function prefetchDing() {
  const ding = new Audio(DING)
  ding.volume = 0
  ding.play().then(() => console.log('Ding cached.'))
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
            click: incrementScore(scores, playerName, newScore => (score.textContent = newScore.toString())),
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

function getStaticHtmlElements() {
  function getByIdOptional<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null
  }
  const add = getByIdOptional<HTMLButtonElement>('add-player')
  const reset = getByIdOptional<HTMLButtonElement>('reset')
  const save = getByIdOptional<HTMLButtonElement>('save')
  const playerName = getByIdOptional<HTMLInputElement>('player-name')
  const playerList = getByIdOptional<HTMLUListElement>('player-list')

  assert(add !== null, 'Button to add player not found.')
  assert(reset !== null, 'Button to erase game data not found.')
  assert(save !== null, 'Button to save game data not found.')
  assert(playerName !== null, "Text input for players's names not found.")
  assert(playerList !== null, 'List element not found.')

  return { add, reset, save, playerName, playerList } as const
}

window.onload = () => main(getStaticHtmlElements())
