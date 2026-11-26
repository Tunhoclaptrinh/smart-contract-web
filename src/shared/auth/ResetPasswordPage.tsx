import { useState } from "react";
import { Alert, Button, Form, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { useDocumentTitle } from "../layout/useDocumentTitle";
import { AuthShell, NewPasswordFields, errorCode } from "./AuthShell";

/** Sets a new password with the code of the reset link (`?token=`); then the user signs in. */
export default function ResetPasswordPage() {
  const { t } = useTranslation("common");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "INVALID_OR_EXPIRED_TOKEN",
  );
  useDocumentTitle(t("auth.reset.title"));
  return (
    <AuthShell title={t("auth.reset.title")} error={error}>
      {done ? (
        <Alert
          type="success"
          showIcon
          title={t("auth.reset.done")}
          data-testid="reset-done"
        />
      ) : token ? (
        <Form<{ password: string; confirm: string }>
          layout="vertical"
          requiredMark={false}
          onFinish={async ({ password }) => {
            setBusy(true);
            setError(null);
            try {
              await resetPassword(token, password);
              setDone(true);
            } catch (failure) {
              setError(errorCode(failure));
            } finally {
              setBusy(false);
            }
          }}
        >
          <NewPasswordFields />
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={busy}
            data-testid="reset-submit"
          >
            {t("auth.reset.submit")}
          </Button>
        </Form>
      ) : null}
      <Typography.Paragraph style={{ marginTop: 16, textAlign: "center" }}>
        <Link to={done ? "/login" : "/forgot-password"}>
          {done ? t("auth.backToLogin") : t("auth.reset.again")}
        </Link>
      </Typography.Paragraph>
    </AuthShell>
  );
}
