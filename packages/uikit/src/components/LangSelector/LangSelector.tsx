import React, { useCallback, useMemo } from "react";
import { Scale } from "../Button/types";
import Select, { OptionProps } from "../Select/Select";
import { Colors } from "../../theme";
import { Language } from "./types";

interface Props {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
  color: keyof Colors;
  buttonScale?: Scale;
  hideLanguage?: boolean;
}

const LangSelector: React.FC<React.PropsWithChildren<Props>> = ({
  currentLang,
  langs,
  setLang,
  hideLanguage = false,
  children,
}) => {
  // Convert Language objects to OptionProps
  const options: OptionProps[] = useMemo(() => {
    return langs.map((lang) => ({
      label: lang.language,
      value: lang.locale,
    }));
  }, [langs]);

  // Find current selected option based on currentLang
  const currentOptionIndex = useMemo(() => {
    const currentLangObj = langs.find(
      (lang) =>
        lang.language === currentLang ||
        lang.locale === currentLang ||
        lang.code === currentLang ||
        lang.language.toLowerCase() === currentLang.toLowerCase() ||
        lang.code.toLowerCase() === currentLang.toLowerCase()
    );
    return currentLangObj ? options.findIndex((option) => option.value === currentLangObj.locale) : 0;
  }, [langs, currentLang]);

  const handleOptionChange = useCallback(
    () => (option: OptionProps) => {
      const selectedLang = langs.find((lang) => lang.locale === option.value);
      if (selectedLang) {
        setLang(selectedLang);
      }
    },
    [langs, setLang]
  );

  // If children are provided, we'll render a custom layout with the Select
  if (React.isValidElement(children)) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {children}
        <Select
          options={options}
          onOptionChange={handleOptionChange}
          defaultOptionIndex={currentOptionIndex}
          placeHolderText={!hideLanguage ? currentLang?.toUpperCase() : "Select Language"}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Select
        options={options}
        onOptionChange={handleOptionChange}
        defaultOptionIndex={currentOptionIndex}
        placeHolderText={!hideLanguage ? currentLang?.toUpperCase() : "Select Language"}
      />
    </div>
  );
};

export default React.memo(LangSelector, (prev, next) => prev.currentLang === next.currentLang);
