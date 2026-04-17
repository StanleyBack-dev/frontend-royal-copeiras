import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EmailIcon from "../../../components/atoms/icons/EmailIcon";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { User } from "../../../api/users/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import { userRoutePaths } from "../../../router";
import { userUiCopy } from "./messages";

function getGroupLabel(group: User["group"]) {
  if (group === "ADMIN") {
    return userUiCopy.form.options.groupAdmin;
  }

  if (group === "ADMIN_MASTER") {
    return userUiCopy.form.options.groupAdminMaster;
  }

  return userUiCopy.form.options.groupUser;
}

export function filterUsersBySearch(users: User[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return users;
  }

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.username.toLowerCase().includes(normalizedSearch) ||
      user.group.toLowerCase().includes(normalizedSearch),
  );
}

export function getUserTableColumns(): DataTableColumn<User>[] {
  return [
    {
      key: "name",
      label: userUiCopy.listing.columns.name,
      render: (user) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {user.name}
        </span>
      ),
    },
    {
      key: "email",
      label: userUiCopy.listing.columns.email,
      render: (user) => (
        <span className="flex items-center gap-1">
          {user.email}
          <EmailIcon size={14} />
        </span>
      ),
    },
    {
      key: "username",
      label: userUiCopy.listing.columns.username,
      render: (user) => user.username,
    },
    {
      key: "group",
      label: userUiCopy.listing.columns.group,
      render: (user) => getGroupLabel(user.group),
    },
    {
      key: "status",
      label: userUiCopy.listing.columns.status,
      render: (user) =>
        user.status
          ? userUiCopy.listing.values.active
          : userUiCopy.listing.values.inactive,
    },
    {
      key: "mustChangePassword",
      label: userUiCopy.listing.columns.mustChangePassword,
      render: (user) =>
        user.mustChangePassword
          ? userUiCopy.listing.values.active
          : userUiCopy.listing.values.inactive,
    },
    {
      key: "lastLoginAt",
      label: userUiCopy.listing.columns.lastLoginAt,
      render: (user) => formatDateTimeDisplay(user.lastLoginAt ?? undefined),
    },
    {
      key: "failedLoginAttempts",
      label: userUiCopy.listing.columns.failedLoginAttempts,
      render: (user) => user.failedLoginAttempts ?? 0,
    },
    {
      key: "lockedUntil",
      label: userUiCopy.listing.columns.lockedUntil,
      render: (user) => formatDateTimeDisplay(user.lockedUntil ?? undefined),
    },
    {
      key: "createdAt",
      label: userUiCopy.listing.columns.createdAt,
      render: (user) => formatDateTimeDisplay(user.createdAt),
    },
    {
      key: "actions",
      label: userUiCopy.listing.columns.actions,
      render: (user) => (
        <div className="flex gap-2">
          <Link
            to={userRoutePaths.edit(user.idUsers)}
            title={userUiCopy.listing.actions.edit}
            className="hover:text-yellow-700"
            style={{ display: "flex", alignItems: "center" }}
          >
            <EditIcon size={18} />
          </Link>
        </div>
      ),
    },
  ];
}