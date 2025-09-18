import { styled } from "styled-components";
import { Flex } from "../Box";

const StyledBottomNav = styled(Flex)`
  position: fixed;
  bottom: 0;
  left:0;
  right:0
  width: 100%;
  padding: 5px 8px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding:0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)
  html[data-useragent*="TokenPocket_iOS"] & {
    padding-bottom: 45px;
  }
  z-index: 20;
`;

export default StyledBottomNav;
