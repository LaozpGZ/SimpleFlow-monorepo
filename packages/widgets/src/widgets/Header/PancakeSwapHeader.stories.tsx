import type { Meta, StoryObj } from '@storybook/react-vite'

import { light, UIKitProvider } from '@pancakeswap/uikit'
import { PancakeSwapHeader } from './PancakeSwapHeader'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'PancakeSwapHeader',
  component: PancakeSwapHeader,
  decorators: [
    (Story) => (
      <UIKitProvider theme={light}>
        <Story />
      </UIKitProvider>
    ),
  ],
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    // layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: { onClick: fn() },
} satisfies Meta<typeof PancakeSwapHeader>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    // primary: true,
    // label: 'Button',
    children: <div>Website Content</div>,
  },
}

export const WithAnnouncementBanner: Story = {
  args: {
    announcementBanner: (
      <div
        style={{
          backgroundImage: 'https://assets.pancakeswap.finance/web/banners/competition.png',
        }}
      >
        <div>Hello</div>
        <div>Hello</div>
      </div>
    ),
    children: <div>Website Content</div>,
  },
}
