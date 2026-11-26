import { useState } from "react";
import { Alert, Button, Card, Form, Input, Select, Table } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ORG_ADMIN_ASSIGNABLE, type Role } from "@codecash/contracts";
import { inviteMember, listOutbox, type InviteInput } from "../api/auth.api";
import { platform } from "../api/platform";
import { AppPage } from "../layout/AppPage";
import { formatDateTime } from "../lib/format";
import { authErrorText, errorCode } from "./AuthShell";
import { useDemoMode } from "./useDemoMode";
import { useCurrentUser } from "./session";

const ALL_ROLES: Role[] = [
  "CONTRACT_OWNER",
  "FINANCE_APPROVER",
  "SECONDARY_APPROVER",
  "LEGAL_REVIEWER",
  "SUPPLIER",
  "ORG_ADMIN",
  "ADMIN_AUDITOR",
  "AUDITOR",
  "SYSTEM_ADMIN",
];

/** Roles the inviter may hand out: a company administrator only its company's business roles. */
export function assignableRoles(
  role: Role,
  companyKind?: "BUYER" | "SUPPLIER",
): Role[] {
  if (role === "SYSTEM_ADMIN") return ALL_ROLES;
  if (role === "ORG_ADMIN" && companyKind)
    return ORG_ADMIN_ASSIGNABLE[companyKind];
  return [];
}

/**
 * An administrator invites a person: the account appears as invited and the person activates it
 * from the emailed link by choosing a password (nobody else ever knows it). In demo deployments
 * the outbox below shows the link, since no mail is sent.
 */
export default function InviteMemberPage() {
  const { t } = useTranslation("common");
  const user = useCurrentUser();
  const demo = useDemoMode();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<InviteInput>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const organizations = useQuery({
    queryKey: ["resource", "organizations", "invite"],
    queryFn: () =>
      platform.get<{
        items: { id: string; name: string; kind: "BUYER" | "SUPPLIER" }[];
      }>("/resources/organizations?limit=100&sortBy=name&sortOrder=asc"),
  });
  const own = organizations.data?.items.find(
    (o) => o.id === user.organizationId,
  );
  const roles = assignableRoles(user.role, own?.kind);
  const outbox = useQuery({
    queryKey: ["auth-outbox"],
    queryFn: listOutbox,
    enabled: demo,
  });
  return (
    <AppPage
      breadcrumb={[
        { label: t("auth.account") },
        { label: t("auth.invite.title") },
      ]}
    >
      <Card style={{ maxWidth: 640 }}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title={t("auth.invite.note")}
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
        {sent ? (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            title={t("auth.invite.sent", { email: sent })}
            data-testid="invite-sent"
          />
        ) : null}
        <Form<InviteInput>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={async (values) => {
            setBusy(true);
            setError(null);
            setSent(null);
            try {
              const result = await inviteMember(values);
              setSent(result.email);
              form.resetFields();
              void queryClient.invalidateQueries({ queryKey: ["auth-outbox"] });
              void queryClient.invalidateQueries({
                queryKey: ["resource", "users"],
              });
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
            <Input maxLength={254} data-testid="invite-email" />
          </Form.Item>
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
            <Input maxLength={250} data-testid="invite-name" />
          </Form.Item>
          <Form.Item
            name="role"
            label={t("auth.invitation.role")}
            rules={[
              {
                required: true,
                message: t("forms.required", {
                  field: t("auth.invitation.role"),
                }),
              },
            ]}
          >
            <Select
              data-testid="invite-role"
              options={roles.map((role) => ({
                value: role,
                label: t(`roles.${role}.name`),
              }))}
            />
          </Form.Item>
          {user.role === "SYSTEM_ADMIN" ? (
            <Form.Item
              name="organizationId"
              label={t("auth.invitation.organization")}
              rules={[
                {
                  required: true,
                  message: t("forms.required", {
                    field: t("auth.invitation.organization"),
                  }),
                },
              ]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={organizations.isLoading}
                options={(organizations.data?.items ?? []).map((o) => ({
                  value: o.id,
                  label: o.name,
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item name="title" label={t("auth.invite.jobTitle")}>
            <Input maxLength={250} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={busy}
            data-testid="invite-submit"
          >
            {t("auth.invite.submit")}
          </Button>
        </Form>
      </Card>
      {demo ? (
        <Card
          title={t("auth.outbox.title")}
          style={{ maxWidth: 960, marginTop: 16 }}
        >
          <Table
            size="small"
            rowKey={(m) => `${m.createdAt}-${m.to}`}
            loading={outbox.isLoading}
            dataSource={outbox.data ?? []}
            pagination={false}
            columns={[
              { key: "to", dataIndex: "to", title: t("auth.outbox.to") },
              {
                key: "kind",
                dataIndex: "kind",
                title: t("auth.outbox.kind"),
                render: (k: string) => t(`auth.outbox.kinds.${k}`),
              },
              {
                key: "at",
                dataIndex: "createdAt",
                title: t("auth.outbox.at"),
                render: (v: string) => formatDateTime(v),
              },
              {
                key: "link",
                dataIndex: "link",
                title: t("auth.outbox.link"),
                render: (link: string) => (
                  <a href={new URL(link).pathname + new URL(link).search}>
                    {t("auth.outbox.open")}
                  </a>
                ),
              },
            ]}
          />
        </Card>
      ) : null}
    </AppPage>
  );
}
