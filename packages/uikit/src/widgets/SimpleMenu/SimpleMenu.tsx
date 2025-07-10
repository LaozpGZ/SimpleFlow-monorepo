import { useIsMounted } from "@pancakeswap/hooks";
import { Language } from "@pancakeswap/localization";
import throttle from "lodash/throttle";
import React, {
  ElementType,
  ReactElement,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AtomBox } from "../../components/AtomBox";
import BottomNav from "../../components/BottomNav";
import Flex from "../../components/Box/Flex";
import CakePrice from "../../components/CakePrice/CakePrice";
import Footer from "../../components/Footer";
import { FooterLinkType } from "../../components/Footer/types";
import MenuItems from "../../components/MenuItems/MenuItems";
import { MenuItemsType } from "../../components/MenuItems/types";
import { SubMenuItems, SubMenuItemsType } from "../../components/SubMenuItems";
import Logo from "../Menu/components/Logo";
import { MENU_HEIGHT, MOBILE_MENU_HEIGHT } from "../Menu/config";
import { MenuContext } from "../Menu/context";
import { BodyWrapper, FixedContainer, Inner, StyledNav, Wrapper } from "../Menu/styled";

export type SimpleMenuProps = {
  linkComponent?: ElementType;
  localeSelector?: ReactNode;
  announcementBanner?: ReactElement;

  rightSide?: ReactNode;
  links: Array<MenuItemsType>;
  homeLink?: string;
  subLinks?: Array<SubMenuItemsType>;
  footerLinks: Array<FooterLinkType>;
  activeItem?: string;
  activeSubItem?: string;
  activeSubItemChildItem?: string;
  isDark: boolean;
  toggleTheme: (isDark: boolean) => void;
  cakePriceUsd?: number;
  currentLang: string;
  buyCakeLabel: string;
  buyCakeLink: string;
  showCakePrice?: boolean;
  showLangSelector?: boolean;
  langs: Language[];
  chainId: number;
  setLang: (lang: Language) => void;
  logoComponent?: ReactNode;
};

export const SimpleMenu: React.FC<React.PropsWithChildren<SimpleMenuProps>> = ({
  linkComponent = "a",
  localeSelector,
  announcementBanner,

  rightSide,
  isDark,
  toggleTheme,
  currentLang,
  setLang,
  cakePriceUsd,
  links,
  homeLink: homeLink_,
  subLinks,
  footerLinks,
  activeItem,
  activeSubItem,
  activeSubItemChildItem,
  showCakePrice = true,
  showLangSelector = true,
  langs,
  buyCakeLabel,
  buyCakeLink,
  children,
  chainId,
  logoComponent,
}) => {
  const isMounted = useIsMounted();
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(typeof window === "undefined" ? 0 : window.pageYOffset);

  const [totalTopMenuHeight, setTotalTopMenuHeight] = useState(MENU_HEIGHT);
  const announcementBannerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isMounted && announcementBanner) {
      const announcementBannerHeight = announcementBannerRef.current?.getBoundingClientRect().height || 0;
      setTotalTopMenuHeight(MENU_HEIGHT + announcementBannerHeight);
    } else {
      setTotalTopMenuHeight(MENU_HEIGHT);
    }
  }, [isMounted, announcementBanner]);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current || currentOffset <= totalTopMenuHeight) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [totalTopMenuHeight]);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  const subLinksWithoutMobile = useMemo(() => subLinks?.filter((subLink) => !subLink.isMobileOnly), [subLinks]);
  const subLinksMobileOnly = useMemo(() => subLinks?.filter((subLink) => subLink.isMobileOnly), [subLinks]);
  const providerValue = useMemo(() => ({ linkComponent }), [linkComponent]);
  return (
    <MenuContext.Provider value={providerValue}>
      <AtomBox
        asChild
        minHeight={{
          xs: "auto",
          md: "100vh",
        }}
      >
        <Wrapper>
          <FixedContainer showMenu={showMenu} height={totalTopMenuHeight}>
            {announcementBanner ? <div ref={announcementBannerRef}>{announcementBanner}</div> : null}
            <StyledNav id="nav">
              <Flex>
                {logoComponent ?? <Logo href={homeLink_ ?? homeLink?.href ?? "/home"} />}
                <AtomBox display={{ xs: "none", lg: "block" }}>
                  <MenuItems
                    ml="24px"
                    items={links}
                    activeItem={activeItem}
                    activeSubItem={activeSubItem}
                    activeSubItemChildItem={activeSubItemChildItem}
                  />
                </AtomBox>
              </Flex>
              <Flex alignItems="center" height="100%">
                <AtomBox mr="12px" display={{ xs: "none", xxl: "block" }}>
                  <CakePrice chainId={chainId} showSkeleton={false} cakePriceUsd={cakePriceUsd} />
                </AtomBox>
                {localeSelector}
                {rightSide}
              </Flex>
            </StyledNav>
          </FixedContainer>
          {subLinks ? (
            <Flex justifyContent="space-around" overflow="hidden">
              <SubMenuItems
                items={subLinksWithoutMobile}
                mt={`${totalTopMenuHeight + 1}px`}
                activeItem={activeSubItemChildItem || activeSubItem}
              />

              {subLinksMobileOnly && subLinksMobileOnly?.length > 0 && (
                <SubMenuItems
                  items={subLinksMobileOnly}
                  mt={`${totalTopMenuHeight + 1}px`}
                  activeItem={activeSubItemChildItem || activeSubItem}
                  isMobileOnly
                />
              )}
            </Flex>
          ) : (
            <div />
          )}
          <BodyWrapper mt={!subLinks ? `${totalTopMenuHeight + 1}px` : "0"}>
            <Inner>{children}</Inner>
          </BodyWrapper>
        </Wrapper>
      </AtomBox>
      <Footer
        chainId={chainId}
        items={footerLinks}
        isDark={isDark}
        toggleTheme={toggleTheme}
        langs={langs}
        setLang={setLang}
        currentLang={currentLang}
        cakePriceUsd={cakePriceUsd}
        buyCakeLabel={buyCakeLabel}
        buyCakeLink={buyCakeLink}
        showLangSelector={showLangSelector}
        showCakePrice={showCakePrice}
        mb={[`${MOBILE_MENU_HEIGHT}px`, null, "0px"]}
      />
      <AtomBox display={{ xs: "block", lg: "none" }}>
        <BottomNav items={links} activeItem={activeItem} activeSubItem={activeSubItem} />
      </AtomBox>
    </MenuContext.Provider>
  );
};
