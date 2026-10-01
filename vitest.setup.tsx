import '@testing-library/jest-native'
import { Text, View } from 'react-native'

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  Stack: { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> },
  Tabs: { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> },
}))

jest.mock('@nozbe/watermelondb', () => ({
  Database: jest.fn(),
  Model: class {},
  field: () => () => {},
  text: () => () => {},
  date: () => () => {},
  children: () => () => {},
}))

jest.mock('@nozbe/watermelondb/adapters/sqlite', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    jsi: { execute: jest.fn() },
  })),
}))

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}))

global.__DEV__ = true