import {
  BriefcaseBusiness,
  Building2,
  HandHeart,
  MapPinned,
  Store,
  UsersRound,
} from "lucide-react";
const goalPaths = [
  {
    label: "Work",
    title: "Find work",
    description: "Jobs and community businesses that are currently hiring.",
    href: "/search?intent=find_work",
    icon: BriefcaseBusiness,
    number: "01",
  },
  {
    label: "Services",
    title: "Find services & businesses",
    description: "Browse community businesses and practical services for everyday and professional needs.",
    href: "/search?intent=find_services",
    icon: MapPinned,
    number: "02",
  },
  {
    label: "Connect",
    title: "Meet people in my field",
    description: "Find members with relevant skills, experience, and community ties.",
    href: "/network",
    icon: UsersRound,
    number: "03",
  },
  {
    label: "Belong",
    title: "Join the community",
    description: "Explore organizations, events, and places to participate.",
    href: "/search?intent=join_community",
    icon: Building2,
    number: "04",
  },
  {
    label: "Contribute",
    title: "Volunteer and help",
    description: "Find community roles where your time and experience matter.",
    href: "/search?intent=volunteer",
    icon: HandHeart,
    number: "05",
  },
  {
    label: "Build",
    title: "Grow my business",
    description: "Discover the Afghan business ecosystem and ways to participate.",
    href: "/businesses",
    icon: Store,
    number: "06",
  },
];


export const discoveryIntentCards = goalPaths.slice(0, 5);
