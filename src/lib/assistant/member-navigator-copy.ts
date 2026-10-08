import { dariMemberCopy, dariMemberDialogue, dariMemberPrompts } from "./member-navigator-copy-dari";

export const memberNavigatorCopy = {
  en: {
    ask: "Community Navigator",
    title: "What are you looking for?",
    description:
      "Find people, organizations, businesses, opportunities and upcoming events across Afghan Hub.",
    placeholder: "Try “volunteer opportunities in Vancouver”…",
    search: "Search",
    searching: "Searching…",
    empty: "No matching Afghan Hub results yet.",
    recovery: "Try a broader search or browse a section directly.",
    browsePeople: "Browse people",
    browseOrganizations: "Browse organizations",
    browseOpportunities: "Browse opportunities",
    browseEvents: "Browse events",
    browseBusinesses: "Browse businesses",
    error: "Search is temporarily unavailable. Please try again.",
    scopeError: "This mentor catalogue exceeds the search limit. Browse people in Network.",
    readOnly: "Discovery only · no actions will be taken",
  },
  "fa-AF": dariMemberCopy,
  fa: {
    ask: "راهنمای جامعه",
    title: "دنبال چه چیزی هستید؟",
    description:
      "افراد، سازمان‌ها، کسب‌وکارها، فرصت‌ها و رویدادهای آینده را در افغان هاب پیدا کنید.",
    placeholder: "مثلاً «فرصت‌های داوطلبی در ونکوور»…",
    search: "جست‌وجو",
    searching: "در حال جست‌وجو…",
    empty: "نتیجه مرتبطی پیدا نشد.",
    recovery: "عبارت عمومی‌تری را امتحان کنید یا مستقیماً یک بخش را مرور کنید.",
    browsePeople: "مرور افراد",
    browseOrganizations: "مرور سازمان‌ها",
    browseOpportunities: "مرور فرصت‌ها",
    browseEvents: "مرور رویدادها",
    browseBusinesses: "مرور کسب‌وکارها",
    error: "جست‌وجو فعلاً در دسترس نیست. دوباره تلاش کنید.",
    scopeError: "تعداد اعضای این جست‌وجو از محدودیت بیشتر است. افراد را در بخش شبکه مرور کنید.",
    readOnly: "فقط برای پیدا کردن اطلاعات · هیچ اقدامی انجام نمی‌شود",
  },
  ps: {
    ask: "ټولنیز لارښود",
    title: "تاسو څه لټوئ؟",
    description:
      "په افغان هب کې خلک، سازمانونه، کاروبارونه، فرصتونه او راتلونکې غونډې ومومئ.",
    placeholder: "لکه «په ونکوور کې د رضاکارۍ فرصتونه»…",
    search: "لټون",
    searching: "لټون روان دی…",
    empty: "اړوند پایله ونه موندل شوه.",
    recovery: "پراخه لټون وازمویئ یا یوه برخه مستقیمه وګورئ.",
    browsePeople: "خلک وګورئ",
    browseOrganizations: "سازمانونه وګورئ",
    browseOpportunities: "فرصتونه وګورئ",
    browseEvents: "غونډې وګورئ",
    browseBusinesses: "کاروبارونه وګورئ",
    error: "لټون اوس مهال شتون نه لري. بیا هڅه وکړئ.",
    scopeError: "د دې لټون د غړو شمېر له حد څخه زیات دی. خلک په شبکه کې وګورئ.",
    readOnly: "یوازې موندنه · هېڅ اقدام نه ترسره کېږي",
  },
} as const;

export const memberNavigatorPrompts = {
  en: [
    "Find volunteer opportunities",
    "Show me upcoming community events",
    "Find organizations that support employment",
    "Find professionals working in technology",
  ],
  "fa-AF": dariMemberPrompts,
  fa: [
    "فرصت‌های داوطلبی را پیدا کن",
    "رویدادهای آینده جامعه را نشان بده",
    "سازمان‌های مرتبط با کاریابی را پیدا کن",
    "متخصصان حوزه تکنولوژی را پیدا کن",
  ],
  ps: [
    "د رضاکارۍ فرصتونه پیدا کړه",
    "راتلونکې ټولنیزې غونډې را وښیه",
    "د کار موندنې اړوند سازمانونه پیدا کړه",
    "د ټکنالوژۍ مسلکي کسان پیدا کړه",
  ],
} as const;

export const memberNavigatorDialogue = {
  en: { retry: "Try again", privacy: "Your search is sent to Afghan Hub to find matches. Avoid sensitive personal details. Conversation stays on this page; no messages are sent to members.", title: "Community Navigator", you: "You", matches: "Matches from Afghan Hub", start: "Start a new search", grounded: "Grounded in Afghan Hub listings and public member profiles.", mentors: "Members open to mentoring", mentees: "Members looking for a mentor", preference: "Mentorship is a member preference, not an endorsement.", follow: "Keep exploring", events: "Show me events too", people: "Show me people too", anywhere: "All locations", partial: "Related member results could not be loaded.", types: { profile: "Members", event: "Events", opportunity: "Opportunities", organization: "Organizations", business: "Businesses" } },
  "fa-AF": dariMemberDialogue,
  fa: { retry: "دوباره تلاش کنید", privacy: "جست‌وجوی شما برای یافتن نتایج به افغان هاب فرستاده می‌شود. اطلاعات حساس ننویسید. تاریخچه فقط در این جلسه می‌ماند؛ پیام یا درخواستی فرستاده نمی‌شود.", title: "راهنمای جامعه", you: "شما", matches: "نتایج از افغان هاب", start: "جست‌وجوی تازه", grounded: "بر اساس آگهی‌ها و پروفایل‌های عمومی افغان هاب.", mentors: "اعضای آماده برای راهنمایی", mentees: "اعضای در جست‌وجوی راهنما", preference: "راهنمایی ترجیح عضو است، نه تأیید صلاحیت.", follow: "به کشف ادامه دهید", events: "رویدادها را هم نشان بده", people: "افراد را هم نشان بده", anywhere: "همه جا", partial: "نتایج اعضای مرتبط بارگیری نشد.", types: { profile: "اعضا", event: "رویدادها", opportunity: "فرصت‌ها", organization: "سازمان‌ها", business: "کسب‌وکارها" } },
  ps: { retry: "بیا هڅه وکړئ", privacy: "ستاسو لټون د پایلو موندلو لپاره افغان هب ته لېږل کېږي. حساس معلومات مه لیکئ. تاریخچه یوازې په دې ناسته کې پاتې کېږي؛ پیغام یا غوښتنه نه لېږل کېږي.", title: "ټولنیز لارښود", you: "تاسو", matches: "د افغان هب پایلې", start: "نوی لټون", grounded: "د افغان هب د اعلانونو او عامه پروفایلونو پر بنسټ.", mentors: "لارښوونې ته چمتو غړي", mentees: "د لارښود په لټه کې غړي", preference: "لارښوونه د غړي خوښه ده، د وړتیا تایید نه دی.", follow: "موندنې ته دوام ورکړئ", events: "غونډې هم را وښیه", people: "خلک هم را وښیه", anywhere: "هر ځای", partial: "د اړوندو غړو پایلې ترلاسه نه شوې.", types: { profile: "غړي", event: "غونډې", opportunity: "فرصتونه", organization: "سازمانونه", business: "کاروبارونه" } },
} as const;

export const memberNavigatorLocales = [{value:"en",label:"English"},{value:"fa-AF",label:"دری"},{value:"fa",label:"فارسی"},{value:"ps",label:"پښتو"}] as const;
export const memberNavigatorUtility = {en:{close:"Close Community Navigator",privacy:"How your search works"},"fa-AF":{close:"بستن راهنمای جامعه",privacy:"جستجو چگونه کار می‌کند؟"},fa:{close:"بستن راهنما",privacy:"جست‌وجو چگونه کار می‌کند"},ps:{close:"لارښود بند کړئ",privacy:"لټون څنګه کار کوي"}};
