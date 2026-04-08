import { NAME } from './name'

/**
 * Button definitions — deferred via function to ensure WMEUI.t()
 * is called after translations are registered
 */
export function getButtons () {
  return {
    A: {
      title: WMEUI.t(NAME).buttons.simplify,
      description: WMEUI.t(NAME).buttons.simplify,
      shortcut: 'S+1',
      callback: null
    },
    B: {
      title: WMEUI.t(NAME).buttons.straighten,
      description: WMEUI.t(NAME).buttons.straighten,
      shortcut: 'S+2',
      callback: null
    },
    C: {
      title: WMEUI.t(NAME).buttons.info,
      description: WMEUI.t(NAME).buttons.info,
      shortcut: null,
      callback: null
    },
  }
}
