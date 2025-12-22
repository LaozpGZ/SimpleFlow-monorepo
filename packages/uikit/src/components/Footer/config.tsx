import { Language } from "../LangSelector/types";
import { FooterLinkType } from "./types";
import { TwitterIcon, TelegramIcon, RedditIcon, InstagramIcon, GithubIcon, DiscordIcon, YoutubeIcon } from "../Svg";

export const footerLinks: FooterLinkType[] = [
  {
    label: "About",
    items: [
      {
        label: "Contact",
        href: "https://docs.pancakeswap.finance/contact-us",
      },
      {
        label: "Blog",
        href: "https://blog.pancakeswap.finance/",
      },
      {
        label: "Community",
        href: "https://docs.pancakeswap.finance/contact-us/telegram",
      },
      {
        label: "CAKE",
        href: "https://docs.pancakeswap.finance/tokenomics/cake",
      },
      {
        label: "—",
      },
      {
        label: "Online Store",
        href: "https://pancakeswap.creator-spring.com/",
        isHighlighted: true,
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Customer",
        href: "Support https://docs.pancakeswap.finance/welcome-to-pancakeswap/contact-us/faq/help",
      },
      {
        label: "Troubleshooting",
        href: "https://docs.pancakeswap.finance/help/troubleshooting",
      },
      {
        label: "Guides",
        href: "https://docs.pancakeswap.finance/get-started",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Github",
        href: "https://github.com/pancakeswap",
      },
      {
        label: "Documentation",
        href: "https://docs.pancakeswap.finance",
      },
      {
        label: "Bug Bounty",
        href: "https://app.gitbook.com/@pancakeswap-1/s/pancakeswap/code/bug-bounty",
      },
      {
        label: "Audits",
        href: "https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited",
      },
      {
        label: "Careers",
        href: "https://docs.pancakeswap.finance/hiring/become-a-chef",
      },
    ],
  },
];

export const socials = [
  {
    label: "Twitter",
    icon: TwitterIcon,
    href: "https://simpleflow.finance",
  },
  {
    label: "Telegram",
    icon: TelegramIcon,
    items: [
      {
        label: "English",
        href: "https://simpleflow.finance",
      },
      {
        label: "Bahasa Indonesia",
        href: "https://simpleflow.finance",
      },
      {
        label: "中文",
        href: "https://simpleflow.finance",
      },
      {
        label: "Tiếng Việt",
        href: "https://simpleflow.finance",
      },
      {
        label: "русский",
        href: "https://simpleflow.finance",
      },
      {
        label: "Português",
        href: "https://simpleflow.finance",
      },
      {
        label: "Español",
        href: "https://simpleflow.finance",
      },
      {
        label: "日本語",
        href: "https://simpleflow.finance",
      },
      {
        label: "Filipino",
        href: "https://simpleflow.finance",
      },
      {
        label: "हिन्दी",
        href: "https://simpleflow.finance",
      },
      {
        label: "한국어",
        href: "https://simpleflow.finance",
      },
      {
        label: "Announcements",
        href: "https://simpleflow.finance",
      },
    ],
  },
  {
    label: "Reddit",
    icon: RedditIcon,
    href: "https://simpleflow.finance",
  },
  {
    label: "Instagram",
    icon: InstagramIcon,
    href: "https://simpleflow.finance",
  },
  {
    label: "Github",
    icon: GithubIcon,
    href: "https://simpleflow.finance",
  },
  {
    label: "Discord",
    icon: DiscordIcon,
    href: "https://simpleflow.finance",
  },
  {
    label: "Youtube",
    icon: YoutubeIcon,
    href: "https://simpleflow.finance",
  },
];

export const langs: Language[] = [...Array(20)].map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}));
