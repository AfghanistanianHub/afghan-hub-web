import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  House,
  MessageSquare,
  Search,
  UsersRound,
} from "lucide-react";

export const dashboardNavigation = [
  {
    label: "Home",
    href: "/",
    icon: House,
  },
  {
    label: "Network",
    href: "/network",
    icon: UsersRound,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: BriefcaseBusiness,
  },
  {
    label: "Businesses",
    href: "/businesses",
    icon: Building2,
  },
  {
    label: "Organizations",
    href: "/organizations",
    icon: UsersRound,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
] as const;
