import { Language } from "@pancakeswap/localization";
import { Box, LangSelector } from "../../../components";

export type LocaleSelectorProps = {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
};

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({ currentLang, langs, setLang }) => {
  return (
    <Box mt="4px">
      <LangSelector
        currentLang={currentLang}
        langs={langs}
        setLang={setLang}
        buttonScale="xs"
        color="textSubtle"
        hideLanguage
      />
    </Box>
  );
};
