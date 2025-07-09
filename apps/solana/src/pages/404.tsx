import { NotFound } from '@pancakeswap/uikit'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

const NotFoundPage = () => (
  <NotFound LinkComp={Link}>
    <NextSeo title="404" />
  </NotFound>
)

export default NotFoundPage
