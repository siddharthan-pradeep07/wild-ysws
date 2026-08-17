"use client";

import { useTransition } from "react";
import type { UserRole } from "@/lib/users";
import { updateUserRoleAction } from "./actions";

export default function UserRoleSelect({ id, role }: { id: string; role: UserRole })
{
    const [isPending, startTransition] = useTransition();

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>)
    {
        const formData = new FormData();
        formData.set("id", id);
        formData.set("role", event.target.value);

        startTransition(() =>
        {
            updateUserRoleAction(formData);
        });
    }

    return (
        <select
            className="users-role-select"
            defaultValue={role}
            onChange={handleChange}
            disabled={isPending}
        >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="reviewer">reviewer</option>
            <option value="banned">banned</option>
        </select>
    );
}
