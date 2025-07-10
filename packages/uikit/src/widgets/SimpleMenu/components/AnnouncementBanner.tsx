import { useIsMounted } from "@pancakeswap/hooks";
import { ReactElement } from "react";
import { useMatchBreakpoints } from "../../../contexts";
import { TOP_BANNER_HEIGHT, TOP_BANNER_HEIGHT_MOBILE } from "../../Menu/config";
import { TopBannerContainer } from "../../Menu/styled";

export type AnnouncementBannerProps = {
  banner: ReactElement;
};

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ banner }) => {
  const isMounted = useIsMounted();
  const { isMobile } = useMatchBreakpoints();
  const topBannerHeight = isMobile ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT;

  return isMounted && banner ? <TopBannerContainer height={topBannerHeight}>{banner}</TopBannerContainer> : null;
};
