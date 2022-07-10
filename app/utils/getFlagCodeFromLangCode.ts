import { languages } from "~/constants/languages"

function getFlagCodeFromLangCode(langCode: string) {
    const lang = languages.find((l) => l.langCode == langCode)
    return lang?.flagCode ?? ''
}

export default getFlagCodeFromLangCode