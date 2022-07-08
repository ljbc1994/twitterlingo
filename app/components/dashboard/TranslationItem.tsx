import { Form } from "@remix-run/react";
import { useRef } from "react";
import { Translation } from "~/models/translation.server";

const TranslationItem = ({ translation }: { translation: Translation }) => {
  const formRef = useRef<any>();

  function onItemClick() {
    formRef.current.submit();
  }

  return (
    <Form ref={formRef} method="post" className="px-4 py-3 rounded-md bg-blue-800 hover:bg-blue-700 cursor-pointer" onClick={onItemClick}>
      <input type="hidden" name="id" value={translation.id} />
      <input type="hidden" name="bookmarkId" value={translation.bookmarkId} />
      <input
        type="hidden"
        name="sourceLangCode"
        value={translation.sourceLangCode}
      />
      <input type="hidden" name="text" value={translation.sourceLangText} />
      <p className="text-white">{translation.sourceLangText}</p>
    </Form>
  );
};

export default TranslationItem;
