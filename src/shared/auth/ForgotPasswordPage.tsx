import { useState } from "react";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";
import { useDocumentTitle } from "../layout/useDocumentTitle";
import { AuthShell, errorCode } from "./AuthShell";

/**
 * Asks for a reset code. The same confirmation shows whether or not the email has an account,
 * because the API does not tell either (no account enumeration).
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation("common");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle(t("auth.forgot.title"));
  return (
    <AuthShell
      title={t("auth.forgot.title")}
      intro={t("auth.forgot.intro")}
      error={error}
    >
      {sent ? (
        <Alert
          type="success"
          showIcon
          title={t("auth.forgot.sent")}
          data-testid="forgot-sent"
        />
      ) : (
        <Form<{ email: string }>
          layout="vertical"
          requiredMark={false}
          onFinish={async ({ email }) => {
            setBusy(true);
            setError(null);
            try {
              await requestPasswordReset(email);
              setSent(true);
            } catch (failure) {
              setError(errorCode(failure));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            name="email"
            label={t("login.email")}
            rules={[
              {
                required: true,
                message: t("forms.required", { field: t("login.email") }),
              },
              {
                type: "email",
                message: t("forms.email", { field: t("login.email") }),
              },
            ]}
          >
            <Input
              maxLength={254}
              autoComplete="email"
              data-testid="forgot-email"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={busy}
            data-testid="forgot-submit"
          >
            {t("auth.forgot.submit")}
          </Button>
        </Form>
      )}
      <Typography.Paragraph style={{ marginTop: 16, textAlign: "center" }}>
        <Link to="/login">{t("auth.backToLogin")}</Link>
      </Typography.Paragraph>
    </AuthShell>
  );
}
