import { useState } from "react";
import { Button, Descriptions, Form, Input, Skeleton, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvitation, getInvitation } from "../api/auth.api";
import { homeByRole } from "../layout/navConfig";
import { useDocumentTitle } from "../layout/useDocumentTitle";
import { AuthShell, NewPasswordFields, errorCode } from "./AuthShell";
import { useSession } from "./session";

/**
 * The page of an invitation link (`?token=`): shows who invites whom into what, then the person
 * chooses a password, which activates the account and signs in.
 */
export default function AcceptInvitationPage() {
  const { t } = useTranslation("common");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { adopt } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle(t("auth.invitation.title"));
  const invitation = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
  const unavailable = !token || invitation.isError;
  return (
    <AuthShell
      title={t("auth.invitation.title")}
      error={
        unavailable
          ? token
            ? errorCode(invitation.error)
            : "INVITATION_NOT_FOUND"
          : error
      }
    >
      {invitation.isLoading ? <Skeleton active /> : null}
      {invitation.data ? (
        <>
          <Descriptions
            column={1}
            size="small"
            style={{ marginBottom: 16 }}
            items={[
              {
                key: "org",
                label: t("auth.invitation.organization"),
                children: invitation.data.organization,
              },
              {
                key: "email",
                label: t("login.email"),
                children: invitation.data.email,
              },
              {
                key: "role",
                label: t("auth.invitation.role"),
                children: t(`roles.${invitation.data.role}.name`, {
                  defaultValue: invitation.data.role,
                }),
              },
            ]}
          />
          <Form<{ displayName: string; password: string; confirm: string }>
            layout="vertical"
            requiredMark={false}
            initialValues={{ displayName: invitation.data.displayName }}
            onFinish={async ({ displayName, password }) => {
              setBusy(true);
              setError(null);
              try {
                const user = adopt(
                  await acceptInvitation(token, password, displayName),
                );
                navigate(homeByRole[user.role], { replace: true });
              } catch (failure) {
                setError(errorCode(failure));
                setBusy(false);
              }
            }}
          >
            <Form.Item
              name="displayName"
              label={t("register.displayName")}
              rules={[
                {
                  required: true,
                  message: t("forms.required", {
                    field: t("register.displayName"),
                  }),
                },
              ]}
            >
              <Input maxLength={250} autoComplete="name" />
            </Form.Item>
            <NewPasswordFields />
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={busy}
              data-testid="accept-submit"
            >
              {t("auth.invitation.submit")}
            </Button>
          </Form>
        </>
      ) : null}
      <Typography.Paragraph style={{ marginTop: 16, textAlign: "center" }}>
        <Link to="/login">{t("auth.backToLogin")}</Link>
      </Typography.Paragraph>
    </AuthShell>
  );
}
