const systemModifiers = ['ctrl', 'shift', 'alt', 'meta']

type KeyedEvent = KeyboardEvent | MouseEvent | TouchEvent

const modifierGuards: Record<
  string,
  (e: Event, modifiers: string[]) => void | boolean
> = {
  stop: e => e.stopPropagation(),
  prevent: e => e.preventDefault(),
  self: e => e.target !== e.currentTarget,
  ctrl: (e: KeyedEvent) => !e.ctrlKey,
  shift: (e: KeyedEvent) => !e.shiftKey,
  alt: (e: KeyedEvent) => !e.altKey,
  meta: (e: KeyedEvent) => !e.metaKey,
  left: (e: MouseEvent) => 'button' in e && e.button !== 0,
  middle: (e: MouseEvent) => 'button' in e && e.button !== 1,
  right: (e: MouseEvent) => 'button' in e && e.button !== 2,
  exact: (e, modifiers) =>
    systemModifiers.some(m => (e as any)[`${m}Key`] && !modifiers.includes(m))
}

type EventFunc = (ev: Event) => any

export const withModifiers = (fn: EventFunc, modifiers: string[]) => {
  return (event: Event) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]]
      if (guard && guard(event, modifiers)) return
    }
    return fn(event)
  }
}

// Kept for 2.x compat.
// Note: IE11 compat for `spacebar` and `del` is removed for now.
const keyNames: Record<string, string | string[]> = {
  esc: 'escape',
  space: ' ',
  up: 'arrowup',
  left: 'arrowleft',
  right: 'arrowright',
  down: 'arrowdown',
  delete: 'backspace'
}

export const withKeys = (fn: EventFunc, modifiers: string[]) => {
  return (event: KeyboardEvent) => {
    if (!('key' in event)) return
    const eventKey = event.key.toLowerCase()
    if (
      // None of the provided key modifiers match the current event key
      !modifiers.some(k => k === eventKey || keyNames[k] === eventKey)
    ) {
      return
    }
    return fn(event)
  }
}
