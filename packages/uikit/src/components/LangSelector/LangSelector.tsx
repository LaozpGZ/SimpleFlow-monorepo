import { Language } from "@pancakeswap/localization";
import React from "react";
import { Colors } from "../../theme";
import Button from "../Button/Button";
import { Scale } from "../Button/types";
import Dropdown from "../Dropdown/Dropdown";
import { Position } from "../Dropdown/types";
import LanguageIcon from "../Svg/Icons/Language";
import Text from "../Text/Text";
import MenuButton from "./MenuButton";

interface Props {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
  color: keyof Colors;
  dropdownPosition?: Position;
  buttonScale?: Scale;
  hideLanguage?: boolean;
}

const LangSelector: React.FC<React.PropsWithChildren<Props>> = ({
  currentLang,
  langs,
  color,
  setLang,
  dropdownPosition = "bottom",
  buttonScale = "md",
  hideLanguage = false,
  children,
}) => (
  <Dropdown
    position={dropdownPosition}
    target={
      React.isValidElement(children) ? (
        children
      ) : (
        <Button scale={buttonScale} variant="text" startIcon={<LanguageIcon color={color} width="24px" />}>
          {!hideLanguage && <Text color={color}>{currentLang?.toUpperCase()}</Text>}
        </Button>
      )
    }
  >
    {langs.map((lang) => (
      <MenuButton
        key={lang.locale}
        fullWidth
        onClick={() => setLang(lang)}
        // Safari fix
        style={{ minHeight: "32px", height: "auto" }}
        variant="text"
        size="sm"
      >
        {lang.language}
      </MenuButton>
    ))}
  </Dropdown>
);

export default React.memo(LangSelector, (prev, next) => prev.currentLang === next.currentLang);
