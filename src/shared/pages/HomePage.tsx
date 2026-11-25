import { Card, Descriptions, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "@/shared/auth/session";
import { Can } from "@/shared/auth/Can";
import { AppPage } from "@/shared/layout/AppPage";
import { navFor } from "@/shared/layout/navConfig";

/**
 * Landing page of the base: who is signed in, for which organisation and role, and the areas
 * their permissions open. Business areas link themselves here once they are moved in.
 */
export default function HomePage() {
  const { t } = useTranslation("common");
  const { t: tp } = useTranslation("platform");
  const user = useCurrentUser();
  const areas = navFor(user.role, user.permissions).flatMap((section) =>
    section.items.flatMap((item) =>
      item.children?.length
        ? item.children.map((child) => ({
            to: child.to,
            label: (child.ns === "platform" ? tp : t)(child.labelKey),
          }))
        : item.key === "home"
          ? []
          : [{ to: item.to, label: t(item.labelKey) }],
    ),
  );
  return (
    <AppPage active="home" breadcrumb={[{ label: t("nav.home") }]}>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Card>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {t("home.greeting", { name: user.displayName })}
          </Typography.Title>
          <Descriptions
            column={1}
            size="small"
            items={[
              {
                key: "role",
                label: t("home.role"),
                children: <Tag>{t(`roles.${user.role}.name`)}</Tag>,
              },
              {
                key: "organization",
                label: t("home.organization"),
                children: user.roleChipOrganization,
              },
            ]}
          />
        </Card>
        <Can permission="users:create">
          <Card
            title={t("home.accounts.title")}
            extra={<Link to="/platform/users">{t("home.accounts.open")}</Link>}
            data-testid="home-accounts"
          >
            {t("home.accounts.body")}
          </Card>
        </Can>
        <Card title={t("home.areas")}>
          {areas.length ? (
            <Space size={[8, 8]} wrap data-testid="home-areas">
              {areas.map((area) => (
                <Link key={area.to} to={area.to}>
                  <Tag color="blue">{area.label}</Tag>
                </Link>
              ))}
            </Space>
          ) : (
            <Typography.Text type="secondary">
              {t("home.noAreas")}
            </Typography.Text>
          )}
        </Card>
      </Space>
    </AppPage>
  );
}
