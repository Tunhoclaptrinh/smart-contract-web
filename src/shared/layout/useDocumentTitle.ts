import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Tab title of a page outside the app layout (inside it, AppPage sets the title). */
export function useDocumentTitle(title: string) {
  const { t } = useTranslation("common");
  useEffect(() => {
    document.title = `${title} · ${t("brand.name")}`;
  }, [title, t]);
}
