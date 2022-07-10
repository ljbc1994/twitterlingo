import { Form } from "@remix-run/react";
import { useRef } from "react";
import { Translation } from "~/models/translation.server";
import getFlagCodeFromLangCode from "~/utils/getFlagCodeFromLangCode";
import getFlagIconPath from "~/utils/getFlagIconPath";

interface TranslationItemProps {
  translation: Translation;
  targetLang: string;
  showFlags?: boolean;
}

const TranslationItem = ({
  translation,
  targetLang,
  showFlags,
}: TranslationItemProps) => {
  const formRef = useRef<any>();

  function onItemClick() {
    formRef.current.submit();
  }

  return (
    <Form
      ref={formRef}
      method="post"
      className="cursor-pointer rounded-md bg-blue-800 px-4 py-3 transition hover:bg-blue-700"
      onClick={onItemClick}
    >
      <div className="flex">
        {showFlags ? (
          <div
            className="mr-2 grid grid-cols-2 gap-1"
            style={{ minWidth: 100 }}
          >
            <img
              className="mr-4 self-center rounded-md shadow-lg"
              alt="flag"
              src={getFlagIconPath(getFlagCodeFromLangCode(translation.sourceLangCode))}
            />
            <img
              className="mr-4 self-center rounded-md shadow-lg"
              alt="flag"
              src={getFlagIconPath(getFlagCodeFromLangCode(
                translation.targetLangCode || targetLang
              ))}
            />
          </div>
        ) : null}
        <div>
          <input type="hidden" name="id" value={translation.id} />
          <input
            type="hidden"
            name="bookmarkId"
            value={translation.bookmarkId}
          />
          <input
            type="hidden"
            name="sourceLangCode"
            value={translation.sourceLangCode}
          />
          <input type="hidden" name="targetLangCode" value={targetLang} />
          <input type="hidden" name="text" value={translation.sourceLangText} />
          <p className="text-white">{translation.sourceLangText}</p>
        </div>
      </div>
    </Form>
  );
};

export default TranslationItem;
