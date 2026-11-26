import { useState } from "react";
import { Alert, Button, Card, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { changePassword } from "../api/auth.api";
import { AppPage } from "../layout/AppPage";
import { NewPasswordFields, authErrorText, errorCode } from "./AuthShell";
import { useSession } from "./session";

/** The signed-in user changes its own password; other sessions end, this one goes on. */
export default function ChangePasswordPage() {
  const { t } = useTranslation("common");
  const { adopt } = useSession();
  const [form] = Form.useForm<{
    currentPassword: string;
    password: string;
    confirm: string;
  }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <AppPage
      breadcrumb={[
        { label: t("auth.account") },
        { label: t("auth.change.title") },
      ]}
    >
      <Card style={{ maxWidth: 520 }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={t("auth.change.note")}
        />
        {error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title={authErrorText(t, error)}
            data-testid="auth-error"
          />
        ) : null}
        {done ? (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            title={t("auth.change.done")}
            data-testid="change-done"
          />
        ) : null}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={async ({ currentPassword, password }) => {
            setBusy(true);
            setError(null);
            setDone(false);
            try {
              adopt(await changePassword(currentPassword, password));
              form.resetFields();
              setDone(true);
            } catch (failure) {
              setError(errorCode(failure));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Form.Item
            name="currentPassword"
            label={t("auth.currentPassword")}
            rules={[
              {
                required: true,
                message: t("forms.required", {
                  field: t("auth.currentPassword"),
                }),
              },
            ]}
          >
            <Input.Password
              maxLength={1024}
              autoComplete="current-password"
              data-testid="current-password"
            />
          </Form.Item>
          <NewPasswordFields />
          <Button
            type="primary"
            htmlType="submit"
            loading={busy}
            data-testid="change-submit"
          >
            {t("auth.change.submit")}
          </Button>
        </Form>
      </Card>
    </AppPage>
  );
}
