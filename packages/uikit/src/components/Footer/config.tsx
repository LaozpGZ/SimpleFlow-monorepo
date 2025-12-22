import { Language } from "../LangSelector/types";
import { FooterLinkType } from "./types";
import { TwitterIcon, TelegramIcon, RedditIcon, InstagramIcon, GithubIcon, DiscordIcon, YoutubeIcon } from "../Svg";

export const footerLinks: FooterLinkType[] = [
  {
    label: "About",
    items: [
      {
        label: "Contact",
        href: "https://docs.simpleflow.finance/contact-us",
      },
      {
        label: "Blog",
        href: "https://blog.simpleflow.finance/",
      },
      {
        label: "Community",
        href: "https://docs.simpleflow.finance/contact-us/telegram",
      },
      {
        label: "CAKE",
        href: "https://docs.simpleflow.finance/tokenomics/cake",
      },
      {
        label: "—",
      },
      {
        label: "Online Store",
        href: "https://simpleflow.creator-spring.com/",
        isHighlighted: true,
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Customer",
        href: "Support https://docs.simpleflow.finance/welcome-to-simpleflow/contact-us/faq/help",
      },
      {
        label: "Troubleshooting",
        href: "https://docs.simpleflow.finance/help/troubleshooting",
      },
      {
        label: "Guides",
        href: "https://docs.simpleflow.finance/get-started",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Github",
        href: "https://github.com/simpleflow",
      },
      {
        label: "Documentation",
        href: "https://docs.simpleflow.finance",
      },
      {
        label: "Bug Bounty",
        href: "https://app.gitbook.com/@simpleflow-1/s/simpleflow/code/bug-bounty",
      },
      {
        label: "Audits",
        href: "https://docs.simpleflow.finance/help/faq#is-simpleflow-safe-has-simpleflow-been-audited",
      },
      {
        label: "Careers",
        href: "https://docs.simpleflow.finance/hiring/become-a-chef",
      },
    ],
  },
];

export const socials = [
  {
    label: "Twitter",
    icon: TwitterIcon,
    href: "https://twitter.com/simpleflow",
  },
  {
    label: "Telegram",
    icon: TelegramIcon,
    items: [
      {
        label: "English",
        href: "https://t.me/simpleflow",
      },
      {
        label: "Bahasa Indonesia",
        href: "https://t.me/simpleflowIndonesia",
      },
      {
        label: "中文",
        href: "https://t.me/simpleflow_CN",
      },
      {
        label: "Tiếng Việt",
        href: "https://t.me/SimpleFlowVN",
      },
      {
        label: "русский",
        href: "https://t.me/simpleflow_ru",
      },
      {
        label: "Português",
        href: "https://t.me/simpleflowPortuguese",
      },
      {
        label: "Español",
        href: "https://t.me/simpleflowES",
      },
      {
        label: "日本語",
        href: "https://t.me/simpleflowJP",
      },
      {
        label: "Filipino",
        href: "https://t.me/simpleflow_PH",
      },
      {
        label: "हिन्दी",
        href: "https://t.me/simpleflow_INDIA",
      },
      {
        label: "한국어",
        href: "https://t.me/SimpleFlowSouthKorea",
      },
      {
        label: "Announcements",
        href: "https://t.me/SimpleFlowAnn",
      },
    ],
  },
  {
    label: "Reddit",
    icon: RedditIcon,
    href: "https://reddit.com/r/simpleflow",
  },
  {
    label: "Instagram",
    icon: InstagramIcon,
    href: "https://instagram.com/simpleflowfinance",
  },
  {
    label: "Github",
    icon: GithubIcon,
    href: "https://github.com/simpleflow/",
  },
  {
    label: "Discord",
    icon: DiscordIcon,
    href: "https://discord.gg/simpleflow",
  },
  {
    label: "Youtube",
    icon: YoutubeIcon,
    href: "https://www.youtube.com/@simpleflow_official",
  },
];

export const langs: Language[] = [...Array(20)].map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}));
