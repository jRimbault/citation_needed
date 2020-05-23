type EventNames = keyof HTMLElementEventMap
type Handler<Event extends EventNames> = (this: HTMLObjectElement, $event: HTMLElementEventMap[Event]) => unknown
type EventHandler<Event extends EventNames> = readonly [Handler<Event>, boolean | EventListenerOptions] | Handler<Event>

export type NodeDefinition =
  | readonly [keyof HTMLElementTagNameMap, NodeOptions]
  | readonly [keyof HTMLElementTagNameMap]
  | Node

export interface NodeOptions {
  readonly id?: string
  readonly classList?: string | readonly string[]
  readonly textContent?: string | { readonly html: string }
  readonly attributes?: { readonly [attributeName: string]: string }
  readonly children?: readonly NodeDefinition[]
  readonly listeners?: { readonly [Event in EventNames]?: EventHandler<Event> }
}

export function createNode<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options?: NodeOptions,
): HTMLElementTagNameMap[Tag] {
  const node = document.createElement(tag)
  if (options === undefined) {
    return node
  }
  if (options.id) {
    node.id = options.id
  }
  return addListeners(
    addChildren(
      addAttributes(addContent(addClasses(node, options.classList), options.textContent), options.attributes),
      options.children,
    ),
    options.listeners,
  )
}

export function debounce<E extends Event, F extends ($event: E) => unknown>(
  eventHandler: F,
  milliseconds = 500,
): ($event: E) => Promise<ReturnType<F>> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return ($event: E) => {
    return new Promise(resolve => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => resolve(eventHandler($event) as ReturnType<F>), milliseconds)
    })
  }
}

type Entry = [EventNames, EventHandler<EventNames> | undefined]

function addListeners<E extends HTMLElement>(node: E, listeners?: NodeOptions['listeners']): E {
  if (listeners) {
    for (const [name, listener] of Object.entries(listeners) as Entry[]) {
      if (listener instanceof Array) {
        node.addEventListener(name, listener[0], listener[1])
      } else if (listener instanceof Function) {
        node.addEventListener(name, listener)
      }
    }
  }
  return node
}

function addChildren<E extends HTMLElement>(node: E, children: NodeOptions['children']): E {
  function makeChild(params: NodeDefinition) {
    if (params instanceof Node) {
      return params
    }
    return createNode(params[0], params[1])
  }
  if (children && children.length > 0) {
    for (const child of children) {
      node.append(makeChild(child))
    }
  }
  return node
}

function addAttributes<E extends HTMLElement>(node: E, attributes: NodeOptions['attributes']): E {
  if (attributes) {
    for (const [attributeName, value] of Object.entries(attributes)) {
      node.setAttribute(attributeName, value)
    }
  }
  return node
}

function addContent<E extends HTMLElement>(node: E, textContent: NodeOptions['textContent']): E {
  if (textContent) {
    if (typeof textContent === 'string') {
      node.textContent = textContent
    } else if (textContent.html) {
      node.innerHTML = textContent.html
    }
  }
  return node
}

function addClasses<E extends HTMLElement>(node: E, classList: NodeOptions['classList']): E {
  if (classList) {
    if (typeof classList === 'string' && classList !== '') {
      node.classList.add(classList)
    }
    if (classList instanceof Array) {
      node.classList.add(...classList.filter(Boolean))
    }
  }
  return node
}
