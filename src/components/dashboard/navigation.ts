import {
  BriefcaseBusiness,
  Bookmark,
  Building2,
  CalendarDays,
  ClipboardCheck,
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
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
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

export const moderationNavigation = {
  label: "Moderation",
  href: "/moderation",
  icon: ClipboardCheck,
} as const;
