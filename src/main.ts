import { createNode } from "@/dom";

/**
 * Citation Needed - a live scoreboard driven by one game master.
 *
 * Design intent for the "host at a laptop, at a dinner table" use case:
 *   - Scoring persists automatically. There is no Save button to forget; every
 *     score change, added player, or removal is written to localStorage.
 *   - Every award is reversible. Each player has a -1 to undo a mis-tapped +1,
 *     and can be removed individually without wiping the board.
 *   - Destructive actions ask first. Resetting the whole board confirms.
 *   - The current leader is highlighted so a glance across the table tells you
 *     who is winning, without rows jumping around under the host's cursor.
 *
 * Architecture: a small imperative shell (event wiring, DOM, audio, storage)
 * around a functional core that only mutates the in-memory score map.
 */

type StaticHtml = ReturnType<typeof getStaticHtmlElements>;

interface Score {
  score: number;
}

const DING = "sounds/ding-sound-effect_2.mp3";

/** Preloaded once; cloned per play so rapid dings can overlap cleanly. */
const dingSound = new Audio(DING);
dingSound.preload = "auto";

function ding() {
  const clip = dingSound.cloneNode() as HTMLAudioElement;
  void clip.play().catch(() => {
    // Autoplay can be blocked until the first user gesture; ignore.
  });
}

function main({ add, reset, playerName, playerList, message }: StaticHtml) {
  const store = stateManager();
  const scores = store.get();
  const board = boardRenderer(scores, playerList, store);

  board.renderAll();

  add.addEventListener("click", () => {
    const name = playerName.value.trim();
    if (name === "") {
      showMessage(message, "Enter a player name first.");
      return;
    }
    if (scores.has(name)) {
      showMessage(message, `${name} is already on the board.`);
      return;
    }
    scores.set(name, { score: 0 });
    store.set(scores);
    board.addRow(name);
    playerName.value = "";
    playerName.focus();
    clearMessage(message);
  });

  reset.addEventListener("click", () => {
    if (scores.size === 0) {
      return;
    }
    if (!confirm("Reset all scores and remove every player?")) {
      return;
    }
    store.clear(scores);
    board.clear();
    clearMessage(message);
  });
}

/**
 * Owns the player list DOM. Mutations to the score map are paired with a
 * persist call so the board is always saved - there is no manual Save.
 */
function boardRenderer(
  scores: Map<string, Score>,
  list: HTMLUListElement,
  store: ReturnType<typeof stateManager>,
) {
  // Track each player's row so the leader highlight can be updated in place.
  const rows = new Map<string, HTMLLIElement>();

  function persist() {
    store.set(scores);
  }

  function highestScore(): number {
    let max = 0;
    for (const { score } of scores.values()) {
      max = Math.max(max, score);
    }
    return max;
  }

  /** Mark the leading row(s), but only once someone is actually ahead. */
  function refreshLeader() {
    const max = highestScore();
    for (const [name, row] of rows) {
      const isLeader = max > 0 && scores.get(name)?.score === max;
      row.classList.toggle("leader", isLeader);
    }
  }

  function makeRow(name: string): HTMLLIElement {
    const found = scores.get(name);
    assert(found !== undefined);
    // Bind with an explicit type: assertion narrowing is not preserved into
    // the changeScore closure below, but an annotated const is.
    const playerScore: Score = found;

    const scoreNode = createNode("span", {
      classList: "player-score",
      textContent: playerScore.score.toString(),
    });

    function changeScore(delta: number, makeSound: boolean) {
      // Scores never go below zero; undo of a mis-tap should not create a debt.
      playerScore.score = Math.max(0, playerScore.score + delta);
      scoreNode.textContent = playerScore.score.toString();
      persist();
      refreshLeader();
      if (makeSound && delta > 0) {
        ding();
      }
    }

    return createNode("li", {
      classList: "player-item",
      children: [
        ["span", { classList: "player-name", textContent: name }],
        scoreNode,
        [
          "button",
          {
            classList: "score-button-minus",
            textContent: "−1", // minus sign
            attributes: { "aria-label": `Subtract a point from ${name}` },
            listeners: { click: () => changeScore(-1, false) },
          },
        ],
        [
          "button",
          {
            classList: "score-button",
            textContent: "+1",
            attributes: { "aria-label": `Add a point for ${name}` },
            listeners: { click: () => changeScore(+1, true) },
          },
        ],
        [
          "button",
          {
            classList: "remove-button",
            textContent: "×", // multiplication sign as a close glyph
            attributes: { "aria-label": `Remove ${name}` },
            listeners: { click: () => removeRow(name) },
          },
        ],
      ],
    });
  }

  function removeRow(name: string) {
    rows.get(name)?.remove();
    rows.delete(name);
    scores.delete(name);
    persist();
    refreshLeader();
  }

  function addRow(name: string) {
    const row = makeRow(name);
    rows.set(name, row);
    list.append(row);
    refreshLeader();
  }

  function renderAll() {
    for (const name of scores.keys()) {
      addRow(name);
    }
  }

  function clear() {
    for (const row of rows.values()) {
      row.remove();
    }
    rows.clear();
  }

  return { renderAll, addRow, clear } as const;
}

function showMessage(node: HTMLElement, text: string) {
  node.textContent = text;
}

function clearMessage(node: HTMLElement) {
  node.textContent = "";
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
  const playerName = getByIdOptional<HTMLInputElement>("player-name");
  const playerList = getByIdOptional<HTMLUListElement>("player-list");
  const message = getByIdOptional<HTMLParagraphElement>("form-message");

  assert(add !== null, "Button to add player not found.");
  assert(reset !== null, "Button to reset the board not found.");
  assert(playerName !== null, "Text input for players's names not found.");
  assert(playerList !== null, "List element not found.");
  assert(message !== null, "Form message element not found.");

  return { add, reset, playerName, playerList, message } as const;
}

window.onload = () => main(getStaticHtmlElements());
