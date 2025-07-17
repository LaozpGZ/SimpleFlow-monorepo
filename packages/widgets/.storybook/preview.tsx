import { UIKitProvider, light } from '@pancakeswap/uikit'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  decorators: [
    (Story) => (
      <UIKitProvider theme={light}>
        <Story />
      </UIKitProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
