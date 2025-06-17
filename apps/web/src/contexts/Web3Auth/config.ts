// import { MFA_FACTOR, MFA_LEVELS, WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal'
// import { type Web3AuthContextConfig } from '@web3auth/modal/react'
// import { initializeApp } from 'firebase/app'

// const web3AuthClientId = 'BFf4PGTyAlx8qhXD4jdXhS-fxX6m_YnZsSM229gLzZCLx22qZHgefExrjsJtB87yNWqejS9ShSCj31gUQmVr0Pw'

// export const verifier = 'pancakeswap-web-firebase-dev-2'

// const web3AuthOptions: Web3AuthOptions = {
//   clientId: web3AuthClientId, // Get your Client ID from Web3Auth Dashboard
//   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
//   // accountAbstractionConfig: {
//   //   smartAccountType: "biconomy",
//   //   chains: [
//   //     {
//   //       chainId: "0xaa36a7",
//   //       paymasterConfig: {
//   //         url: "https://paymaster.biconomy.io/api/v1/11155111/jyk4BStr1.821fa98f-7aa4-4713-8af8-8a8a893c5c73",
//   //       },
//   //       bundlerConfig: {
//   //         url: "https://bundler.biconomy.io/api/v2/11155111/bundler_3ZHXytRHVsL4aGQNfZrjKJPA",
//   //         paymasterContext: {
//   //           mode: "SPONSORED",
//   //           calculateGasLimits: true,
//   //           expiryDuration: 300, // duration (secs) for which the generate paymasterAndData will be valid. Default duration is 300 secs.
//   //           sponsorshipInfo: {
//   //             webhookData: {},
//   //             smartAccountInfo: {
//   //               name: "BICONOMY",
//   //               version: "2.0.0",
//   //             },
//   //           },
//   //         },
//   //       },
//   //     },
//   //     {
//   //       chainId: "0xa4b1",
//   //       paymasterConfig: {
//   //         url: "https://paymaster.biconomy.io/api/v2/42161/cYbxted9h.ca9dd814-023a-4699-8f78-4a84785b32ee",
//   //       },
//   //       bundlerConfig: {
//   //         url: "https://bundler.biconomy.io/api/v3/42161/bundler_3ZVgAVHF7Pyi9ASXXWg4mfMk",
//   //       },
//   //     },
//   //   ],
//   // },
//   accountAbstractionConfig: {
//     smartAccountType: 'metamask',
//     chains: [
//       {
//         chainId: '0xaa36a7',
//         paymasterConfig: {
//           url: 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_PVUqZuhsFf3G1drRyFeAUt',
//         },
//         bundlerConfig: {
//           url: 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_PVUqZuhsFf3G1drRyFeAUt',
//         },
//       },
//       {
//         chainId: '0xa4b1',
//         paymasterConfig: {
//           url: 'https://api.pimlico.io/v2/42161/rpc?apikey=pim_PVUqZuhsFf3G1drRyFeAUt',
//         },
//         bundlerConfig: {
//           url: 'https://api.pimlico.io/v2/42161/rpc?apikey=pim_PVUqZuhsFf3G1drRyFeAUt',
//         },
//       },
//     ],
//   },
//   mfaLevel: MFA_LEVELS.MANDATORY,
//   mfaSettings: {
//     [MFA_FACTOR.DEVICE]: {
//       enable: true,
//       priority: 1,
//       mandatory: true,
//     },
//     [MFA_FACTOR.BACKUP_SHARE]: {
//       enable: true,
//       priority: 2,
//       mandatory: true,
//     },
//     [MFA_FACTOR.SOCIAL_BACKUP]: {
//       enable: true,
//       priority: 3,
//       mandatory: false,
//     },
//     [MFA_FACTOR.PASSWORD]: {
//       enable: true,
//       priority: 4,
//       mandatory: false,
//     },
//     [MFA_FACTOR.PASSKEYS]: {
//       enable: true,
//       priority: 5,
//       mandatory: false,
//     },
//     [MFA_FACTOR.AUTHENTICATOR]: {
//       enable: true,
//       priority: 6,
//       mandatory: false,
//     },
//   },
// }

// export const web3AuthContextConfig: Web3AuthContextConfig = {
//   web3AuthOptions,
// }

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDU3bLR1vYW2GvuZdz-iVdayxPIKs77P6g',
//   authDomain: 'pancakeswap-dev-firebase.firebaseapp.com',
//   projectId: 'pancakeswap-dev-firebase',
//   storageBucket: 'pancakeswap-dev-firebase.firebasestorage.app',
//   messagingSenderId: '389585225139',
//   appId: '1:389585225139:web:12bb674737c1493355f7c6',
// }

// // Initialize Firebase
// export const firebaseApp = initializeApp(firebaseConfig)
