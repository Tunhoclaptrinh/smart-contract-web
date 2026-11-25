import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Select,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "@codecash/api-client";
import type { SignUpInput } from "../api/auth.api";
import { homeByRole } from "../layout/navConfig";
import { PreferenceControls } from "../layout/PreferenceControls";
import { BrandMark } from "../ui/BrandMark";
import { useDocumentTitle } from "../layout/useDocumentTitle";
import { useSession } from "./session";

interface Values {
  name: string;
  code: string;
  kind: "BUYER" | "SUPPLIER";
  companyEmail?: string;
  taxCode?: string;
  displayName: string;
  email: string;
  password: string;
  confirm: string;
}

/** The form's values as the API takes them; empty optional fields are left out. */
export function toSignUpInput(values: Values): SignUpInput {
  return {
    organization: {
      name: values.name.trim(),
      code: values.code.trim(),
      kind: values.kind,
      ...(values.companyEmail?.trim()
        ? { email: values.companyEmail.trim() }
        : {}),
      ...(values.taxCode?.trim() ? { taxCode: values.taxCode.trim() } : {}),
    },
    admin: {
      displayName: values.displayName.trim(),
      email: values.email.trim(),
      password: values.password,
    },
  };
}

/**
 * Company sign-up: the company and its account administrator. The API checks every field again
 * and decides the role; the form only helps the person get it right the first time.
 */
export default function RegisterPage() {
  const { t } = useTranslation("common");
  const { user, signUp } = useSession();
  const navigate = useNavigate();
  const [form] = Form.useForm<Values>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(t("register.title"));
  if (user) return <Navigate to={homeByRole[user.role]} replace />;

  const required = (field: string) => ({
    required: true,
    message: t("forms.required", { field }),
  });
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
      <Card style={{ width: "100%", maxWidth: 560 }}>
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
          {t("register.title")}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {t("register.subtitle")}
        </Typography.Paragraph>
        {error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            title={t(`register.errors.${error}`, {
              defaultValue: t("register.errors.UNKNOWN"),
            })}
            data-testid="register-error"
          />
        ) : null}
        <Form<Values>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ kind: "BUYER" }}
          onFinish={async (values) => {
            setBusy(true);
            setError(null);
            try {
              const actor = await signUp(toSignUpInput(values));
              navigate(homeByRole[actor.role], { replace: true });
            } catch (failure) {
              setError(failure instanceof ApiError ? failure.code : "UNKNOWN");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Divider titlePlacement="start" plain>
            {t("register.company")}
          </Divider>
          <Form.Item
            name="name"
            label={t("register.name")}
            rules={[required(t("register.name")), { max: 250 }]}
          >
            <Input maxLength={250} autoComplete="organization" />
          </Form.Item>
          <Form.Item
            name="code"
            label={t("register.code")}
            extra={t("register.codeHint")}
            rules={[
              required(t("register.code")),
              {
                pattern: /^[A-Za-z0-9_-]{2,40}$/,
                message: t("forms.invalid", { field: t("register.code") }),
              },
            ]}
          >
            <Input maxLength={40} />
          </Form.Item>
          <Form.Item
            name="kind"
            label={t("register.kind")}
            rules={[required(t("register.kind"))]}
          >
            <Select
              options={(["BUYER", "SUPPLIER"] as const).map((kind) => ({
                value: kind,
                label: t(`register.kinds.${kind}`),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="companyEmail"
            label={t("register.companyEmail")}
            rules={[{ type: "email", message: t("forms.email") }]}
          >
            <Input maxLength={254} />
          </Form.Item>
          <Form.Item
            name="taxCode"
            label={t("register.taxCode")}
            rules={[
              {
                pattern: /^\d{10}(-\d{3})?$/,
                message: t("forms.invalid", { field: t("register.taxCode") }),
              },
            ]}
          >
            <Input maxLength={14} />
          </Form.Item>
          <Divider titlePlacement="start" plain>
            {t("register.admin")}
          </Divider>
          <Form.Item
            name="displayName"
            label={t("register.displayName")}
            rules={[required(t("register.displayName")), { max: 250 }]}
          >
            <Input maxLength={250} autoComplete="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("register.email")}
            rules={[
              required(t("register.email")),
              { type: "email", message: t("forms.email") },
            ]}
          >
            <Input maxLength={254} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("register.password")}
            extra={t("register.passwordHint")}
            rules={[
              required(t("register.password")),
              {
                min: 12,
                message: t("register.errors.PASSWORD_MINIMUM_12_CHARACTERS"),
              },
            ]}
          >
            <Input.Password maxLength={128} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={t("register.confirm")}
            dependencies={["password"]}
            rules={[
              required(t("register.confirm")),
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject(new Error(t("register.mismatch"))),
              }),
            ]}
          >
            <Input.Password maxLength={128} autoComplete="new-password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={busy}
            data-testid="register-submit"
          >
            {t("register.submit")}
          </Button>
        </Form>
        <Typography.Paragraph style={{ marginTop: 16, textAlign: "center" }}>
          {t("register.haveAccount")}{" "}
          <Link to="/login">{t("register.signIn")}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
