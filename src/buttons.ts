import { NAME } from './translations'

export function getButtons(): Record<string, { title: any, description: any, shortcut: string, callback?: () => void }> {
  return {
    A: {
      title: WMEUI.t(NAME).buttons.A,
      description: WMEUI.t(NAME).buttons.A,
      shortcut: 'S+1',
    },
    B: {
      title: WMEUI.t(NAME).buttons.B,
      description: WMEUI.t(NAME).buttons.B,
      shortcut: 'S+2',
    },
    C: {
      title: WMEUI.t(NAME).buttons.C,
      description: WMEUI.t(NAME).buttons.C,
      shortcut: 'S+3',
    }
  }
}
