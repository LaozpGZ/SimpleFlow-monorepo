import React, { useCallback, useMemo } from "react";
import Select, { OptionProps } from "../Select/Select";
import { Language } from "./types";

interface Props {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
}

const LangSelectorV2: React.FC<React.PropsWithChildren<Props>> = ({ currentLang, langs, setLang }) => {
  // Convert Language objects to OptionProps
  const options: OptionProps[] = useMemo(() => {
    return langs.map((lang) => ({
      label: lang.language,
      value: lang.locale,
    }));
  }, [langs]);

  const currentLangObj = useMemo(() => langs.find((lang) => lang.code === currentLang), [langs, currentLang]);

  const handleOptionChange = useCallback(
    (option: OptionProps) => {
      const selectedLang = langs.find((lang) => lang.locale === option.value);

      console.log("selectedLang", selectedLang);
      if (selectedLang) {
        setLang(selectedLang);
      }
    },
    [langs, setLang]
  );

  // TODO: make flexible width for based on currentLangObj.language.length
  const flexibleWidth = useMemo(() => {
    const language = currentLangObj?.language;

    // 144 is the width for longest language Suomalainen
    // 125 is default width for dropdown
    return Math.min((language?.length || 0) * 15, 144);
  }, [currentLangObj?.language]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: `${Math.max(flexibleWidth, 125)}px` }}>
      <Select
        options={options}
        onOptionChange={handleOptionChange}
        placeHolderText={currentLangObj?.language || "English"}
        listStyle={{
          maxHeight: "200px",
          overflowY: "auto",
        }}
      />
    </div>
  );
};

export default React.memo(LangSelectorV2, (prev, next) => prev.currentLang === next.currentLang);
