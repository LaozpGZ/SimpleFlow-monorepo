import unsupportedTokens from 'config/constants/tokenLists/pancake-unsupported.tokenlist.json'
import { GetStaticPaths, GetStaticProps } from 'next'

export const getTokenStaticPaths = (): GetStaticPaths => {
  return () => {
    return {
      paths: [],
      fallback: true,
    }
  }
}

export const getTokenStaticProps = (): GetStaticProps => {
  return async ({ params }) => {
    const address = params?.address
    const chain = params?.chainName

    // In case somebody pastes checksummed address into url (since GraphQL expects lowercase address)
    if (
      !address ||
      unsupportedTokens.tokens.map((t) => t.address.toLowerCase()).includes(String(address).toLowerCase())
    ) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
    return {
      props: {
        address,
        chain,
      },
    }
  }
}
