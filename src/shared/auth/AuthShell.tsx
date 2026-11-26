import type { ReactNode } from "react";
import { Alert, Card, Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { ApiError } from "@codecash/api-client";
import { PreferenceControls } from "../layout/PreferenceControls";
import { BrandMark } from "../ui/BrandMark";

/**
 * The frame of the signed-out pages (forgot, reset, invitation): brand, language and theme, a
 * title and, when the API refused, the translated reason (`auth.errors.<CODE>`).
 */
export function AuthShell(props: {
  title: string;
  intro?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  const { t } = useTranslation("common");
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "var(--bg-app, #f5f7fb)",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 480 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BrandMark size={36} />
          <PreferenceControls compact />
        </div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          {props.title}
        </Typography.Title>
        {props.intro ? (
          <Typography.Paragraph type="secondary">
            {props.intro}
          </Typography.Paragraph>
        ) : null}
        {props.error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title={authErrorText(t, props.error)}
            data-testid="auth-error"
          />
        ) : null}
        {props.children}
      </Card>
    </div>
  );
}

/** The business code of a failure, for `auth.errors.<CODE>`. */
export const errorCode = (failure: unknown) =>
  failure instanceof ApiError ? failure.code : "UNKNOWN";

export function authErrorText(
  t: (key: string, options?: Record<string, unknown>) => string,
  code: string,
) {
  return t(`auth.errors.${code}`, { defaultValue: t("auth.errors.UNKNOWN") });
}

/**
 * New password and its confirmation, with the rules the API applies (12–128 characters); the
 * API also refuses common passwords and passwords built on the email, shown as its error.
 */
export function NewPasswordFields({ name = "password" }: { name?: string }) {
  const { t } = useTranslation("common");
  return (
    <>
      <Form.Item
        name={name}
        label={t("auth.newPassword")}
        extra={t("auth.passwordHint")}
        rules={[
          {
            required: true,
            message: t("forms.required", { field: t("auth.newPassword") }),
          },
          { min: 12, message: t("auth.errors.PASSWORD_MINIMUM_12_CHARACTERS") },
          {
            max: 128,
            message: t("auth.errors.PASSWORD_MINIMUM_12_CHARACTERS"),
          },
        ]}
      >
        <Input.Password
          maxLength={128}
          autoComplete="new-password"
          data-testid="new-password"
        />
      </Form.Item>
      <Form.Item
        name="confirm"
        label={t("auth.confirmPassword")}
        dependencies={[name]}
        rules={[
          {
            required: true,
            message: t("forms.required", { field: t("auth.confirmPassword") }),
          },
          ({ getFieldValue }) => ({
            validator: (_, value) =>
              !value || value === getFieldValue(name)
                ? Promise.resolve()
                : Promise.reject(new Error(t("auth.mismatch"))),
          }),
        ]}
      >
        <Input.Password
          maxLength={128}
          autoComplete="new-password"
          data-testid="confirm-password"
        />
      </Form.Item>
    </>
  );
}
