import { createNode } from "dom";

type StaticHtml = ReturnType<typeof getStaticHtmlElements>;
interface Score {
  score: number;
}

const DING = "sounds/ding-sound-effect_2.mp3";

function main({ add, reset, save, playerName, playerList }: StaticHtml) {
  const state = stateManager();
  const scores = state.get();
  playerList.append(...initialPlayingBoard(scores));
  add.addEventListener("click", addPlayer(scores, playerList, playerName));
  reset.addEventListener("click", () => {
    Array.from(playerList.children).forEach((c) => c.remove());
    state.clear(scores);
  });
  save.addEventListener("click", () => state.set(scores));
}

function initialPlayingBoard(scores: Map<string, Score>) {
  return Array.from(
    scores.keys(),
    (playerName) => makePlayerListItem(playerName, scores),
  );
}

function addPlayer(
  scores: Map<string, Score>,
  list: HTMLUListElement,
  input: HTMLInputElement,
) {
  return () => {
    const playerName = input.value;
    if (playerName !== "" && !scores.has(playerName)) {
      list.append(makePlayerListItem(playerName, scores));
      input.value = "";
    }
  };
}

function makePlayerListItem(playerName: string, scores: Map<string, Score>) {
  const playerScore = scores.set(
    playerName,
    scores.get(playerName) ?? { score: 0 },
  ).get(playerName);
  assert(playerScore !== undefined);
  const scoreNode = createNode("span", {
    textContent: playerScore.score.toString(),
  });
  return createNode("li", {
    textContent: `${playerName} : `,
    children: [
      scoreNode,
      [
        "button",
        {
          textContent: "+1",
          listeners: {
            click: () => {
              playerScore.score += 1;
              scoreNode.textContent = playerScore.score.toString();
              new Audio(DING).play();
            },
          },
        },
      ],
    ],
  });
}

function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

function stateManager() {
  const storageKey = "scores";
  return {
    get: (): Map<string, Score> => {
      const json: Record<string, Score> = JSON.parse(
        localStorage.getItem(storageKey) ?? "{}",
      );
      const scores = new Map<string, Score>();
      for (const [playerName, playerScore] of Object.entries(json)) {
        scores.set(playerName, playerScore);
      }
      return scores;
    },
    set: (scores: Map<string, Score>) => {
      const json: Record<string, Score> = {};
      for (const [playerName, playerScore] of scores.entries()) {
        json[playerName] = playerScore;
      }
      localStorage.setItem(storageKey, JSON.stringify(json));
    },
    clear: (scores: Map<string, Score>) => {
      scores.clear();
      localStorage.setItem(storageKey, "{}");
    },
  } as const;
}

function getStaticHtmlElements() {
  function getByIdOptional<T extends HTMLElement = HTMLElement>(
    id: string,
  ): T | null {
    return document.getElementById(id) as T | null;
  }
  const add = getByIdOptional<HTMLButtonElement>("add-player");
  const reset = getByIdOptional<HTMLButtonElement>("reset");
  const save = getByIdOptional<HTMLButtonElement>("save");
  const playerName = getByIdOptional<HTMLInputElement>("player-name");
  const playerList = getByIdOptional<HTMLUListElement>("player-list");

  assert(add !== null, "Button to add player not found.");
  assert(reset !== null, "Button to erase game data not found.");
  assert(save !== null, "Button to save game data not found.");
  assert(playerName !== null, "Text input for players's names not found.");
  assert(playerList !== null, "List element not found.");

  return { add, reset, save, playerName, playerList } as const;
}

window.onload = () => main(getStaticHtmlElements());
