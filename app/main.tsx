import React, { useEffect } from "react";
import { useMenuItemActions } from "@core/lib/menu-store";
import { CircleCheckBigIcon } from "lucide-react";

export default function Main({ children }: { children: React.ReactNode }) {

    const { registerMenuItem } = useMenuItemActions();
    
    useEffect(() => {
        registerMenuItem({
            id: 'main.tasks',
            title: "Tasks",
            icon: CircleCheckBigIcon,
            href: "/tasks",
        });

    }, [registerMenuItem]);

    return children;
}
