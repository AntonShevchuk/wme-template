import { NAME } from './translations'

export function getButtons(): Record<string, { title: any, description: any, shortcut: string, callback?: () => void }> {
  return {
    A: {
      title: I18n.t(NAME).buttons.A,
      description: I18n.t(NAME).buttons.A,
      shortcut: 'S+1',
    },
    B: {
      title: I18n.t(NAME).buttons.B,
      description: I18n.t(NAME).buttons.B,
      shortcut: 'S+2',
    },
    C: {
      title: I18n.t(NAME).buttons.C,
      description: I18n.t(NAME).buttons.C,
      shortcut: 'S+3',
    }
  }
}
