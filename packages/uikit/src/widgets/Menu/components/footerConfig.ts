import { ContextApi } from "@pancakeswap/localization";
import { FooterLinkType } from "../../../components/Footer/types";

export const footerLinks: (t: ContextApi["t"]) => FooterLinkType[] = (t) => [
  {
    label: t("Ecosystem"),
    items: [
      {
        label: t("Trade"),
        href: "https://simpleflow.finance/swap",
      },
      {
        label: t("Earn.verb"),
        href: "https://simpleflow.finance/liquidity/pools",
      },
      {
        label: t("Play"),
        href: "https://simpleflow.finance/prediction",
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        label: t("CAKE Incentives"),
        href: "https://docs.simpleflow.finance/ecosystem-and-partnerships/business-partnerships/syrup-pools-and-farms",
      },
      {
        label: t("Staking Pools"),
        href: "https://simpleflow.finance/pools",
      },
      {
        label: t("Token Launches"),
        href: "https://docs.simpleflow.finance/ecosystem-and-partnerships/business-partnerships/initial-farm-offerings-ifos",
      },
      {
        label: t("Brand Assets"),
        href: "https://docs.simpleflow.finance/ecosystem-and-partnerships/brand",
      },
    ],
  },
  {
    label: t("Developers"),
    items: [
      {
        label: t("Contributing"),
        href: "https://docs.simpleflow.finance/developers/contributing",
      },
      {
        label: t("Github"),
        href: "https://github.com/pancakeswap",
      },
      {
        label: t("Developer Doc"),
        href: "https://developer.simpleflow.finance/",
      },
      {
        label: t("Bug Bounty"),
        href: "https://developer.simpleflow.finance/bug-bounty#bug-bounty",
      },
    ],
  },
  {
    label: t("Support"),
    items: [
      {
        label: t("Get Help"),
        href: "https://docs.simpleflow.finance/welcome-to-pancakeswap/contact-us/faq/help",
      },
      {
        label: t("Troubleshooting"),
        href: "https://docs.simpleflow.finance/readme/help/troubleshooting",
      },
      {
        label: t("Documentation"),
        href: "https://docs.simpleflow.finance/",
      },
      {
        label: t("Audits"),
        href: "https://docs.simpleflow.finance/readme/audits",
      },
      {
        label: t("Legacy products"),
        href: "https://docs.simpleflow.finance/products/legacy-products",
      },
    ],
  },
  {
    label: t("About"),
    items: [
      {
        label: t("Tokenomics"),
        href: "https://docs.simpleflow.finance/governance-and-tokenomics/cake-tokenomics",
      },
      {
        label: t("CAKE Emission Projection"),
        href: "https://analytics.simpleflow.finance/",
      },
      {
        label: t("Blog"),
        href: "https://blog.simpleflow.finance/",
      },
      {
        label: t("Careers"),
        href: "https://docs.simpleflow.finance/team/become-a-chef",
      },
      {
        label: t("Terms Of Service"),
        href: "https://simpleflow.finance/terms-of-service",
      },
    ],
  },
];
