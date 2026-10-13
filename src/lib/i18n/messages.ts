import type { Locale } from "./locale";
// Persian and Pashto are editorial drafts pending native-language review.
const messages: Record<string, readonly [string, string]> = {
  "Language": [
    "زبان",
    "ژبه"
  ],
  "One network. Many ways to belong.": [
    "یک شبکه. راه‌های بسیار برای پیوستن.",
    "یوه شبکه. د ګډون ډېرې لارې."
  ],
  "One network.": [
    "یک شبکه.",
    "یوه شبکه."
  ],
  "Many ways to ": [
    "راه‌های بسیار برای ",
    "ډېرې لارې د "
  ],
  "belong.": [
    "پیوستن.",
    "ګډون لپاره."
  ],
  "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.": [
    "افغان هاب افراد، کسب‌وکارها، سازمان‌ها، فرصت‌ها و رویدادها را به هم پیوند می‌دهد؛ فضایی برای ارتباط، همکاری و پیشرفت مشترک.",
    "افغان هاب خلک، کاروبارونه، سازمانونه، فرصتونه او غونډې سره نښلوي؛ د اړیکو، همکارۍ او ګډ پرمختګ لپاره یوه فضا."
  ],
  "A MORE CONNECTED AFGHAN FUTURE": [
    "آینده‌ای پیوسته‌تر برای جامعهٔ افغانستان",
    "د افغان ټولنې لپاره لا تړلی راتلونکی"
  ],
  "Join the community": [
    "به جامعه بپیوندید",
    "له ټولنې سره یوځای شئ"
  ],
  "Explore the network": [
    "شبکه را کشف کنید",
    "شبکه وپلټئ"
  ],
  "Discover": [
    "کشف کنید",
    "ومومئ"
  ],
  "Find people, businesses, organizations, opportunities, and events.": [
    "افراد، کسب‌وکارها، سازمان‌ها، فرصت‌ها و رویدادها را پیدا کنید.",
    "خلک، کاروبارونه، سازمانونه، فرصتونه او غونډې ومومئ."
  ],
  "Connect": [
    "ارتباط بگیرید",
    "اړیکه ونیسئ"
  ],
  "Build meaningful relationships across communities.": [
    "در میان جامعه‌ها ارتباط‌های معنادار بسازید.",
    "د ټولنو ترمنځ ګټورې اړیکې جوړې کړئ."
  ],
  "Participate": [
    "مشارکت کنید",
    "ګډون وکړئ"
  ],
  "Join events, pursue opportunities, and collaborate.": [
    "در رویدادها شرکت کنید، فرصت‌ها را دنبال کنید و همکاری کنید.",
    "په غونډو کې ګډون وکړئ، فرصتونه تعقیب کړئ او همکاري وکړئ."
  ],
  "Grow": [
    "رشد کنید",
    "وده وکړئ"
  ],
  "Create visibility, strengthen relationships, and increase impact.": [
    "دیده شوید، ارتباط‌ها را تقویت کنید و تأثیر بیشتری بگذارید.",
    "خپل کار څرګند کړئ، اړیکې پیاوړې کړئ او اغېز زیات کړئ."
  ],
  "Find my community": [
    "جامعهٔ خود را پیدا کنم",
    "خپله ټولنه ومومم"
  ],
  "Grow my business": [
    "کسب‌وکارم را رشد بدهم",
    "خپل کاروبار ته وده ورکړم"
  ],
  "Discover opportunities": [
    "فرصت‌ها را پیدا کنم",
    "فرصتونه ومومم"
  ],
  "Connect with organizations": [
    "با سازمان‌ها ارتباط بگیرم",
    "له سازمانونو سره اړیکه ونیسم"
  ],
  "Explore arts and culture": [
    "هنر و فرهنگ را کشف کنم",
    "هنر او کلتور وپلټم"
  ],
  "Attend or host events": [
    "در رویدادها شرکت کنم یا برگزار کنم",
    "په غونډو کې ګډون وکړم یا یې جوړې کړم"
  ],
  "How Afghan Hub works": [
    "افغان هاب چگونه کار می‌کند",
    "افغان هاب څنګه کار کوي"
  ],
  "A simple path to meaningful connections.": [
    "راهی ساده برای ارتباط‌های معنادار.",
    "د ګټورو اړیکو لپاره یوه ساده لاره."
  ],
  "START WITH YOUR GOAL": [
    "از هدف خود شروع کنید",
    "له خپل هدف څخه پیل وکړئ"
  ],
  "Your next step starts here.": [
    "قدم بعدی شما از اینجا شروع می‌شود.",
    "ستاسو بل ګام له دې ځایه پیلېږي."
  ],
  "There’s more than one way into the network.": [
    "برای ورود به شبکه راه‌های بسیاری وجود دارد.",
    "شبکې ته د ننوتلو ډېرې لارې شته."
  ],
  "Let the Navigator help you find yours.": [
    "راهنما به شما کمک می‌کند مسیر خود را پیدا کنید.",
    "لارښود درسره مرسته کوي چې خپله لاره ومومئ."
  ],
  "A stronger, more connected": [
    "جامعه‌ای نیرومندتر و پیوسته‌تر",
    "یوه پیاوړې او لا تړلې"
  ],
  "Afghan community": [
    "برای افغانستان",
    "افغان ټولنه"
  ],
  "A shared space to make community work visible, exchange knowledge, and build relationships that open new possibilities.": [
    "فضایی مشترک برای معرفی فعالیت‌های جامعه، تبادل دانش و ساختن ارتباط‌هایی که فرصت‌های تازه‌ای ایجاد می‌کنند.",
    "د ټولنې د کار د څرګندولو، د پوهې د شریکولو او د نوو فرصتونو د رامنځته کولو لپاره ګډه فضا."
  ],
  "Greater visibility": [
    "بیشتر دیده شوید",
    "لا ډېر څرګند شئ"
  ],
  "Give your work a place to be discovered.": [
    "برای معرفی کار خود جایی پیدا کنید.",
    "خپل کار ته د پېژندلو ځای ورکړئ."
  ],
  "Stronger connections": [
    "ارتباط‌های قوی‌تر",
    "پیاوړې اړیکې"
  ],
  "Find common ground and move forward together.": [
    "نقاط مشترک پیدا کنید و با هم پیش بروید.",
    "ګډې موخې ومومئ او یوځای مخکې لاړ شئ."
  ],
  "More possibilities": [
    "امکان‌های بیشتر",
    "ډېر امکانات"
  ],
  "Share opportunities and collaborate across communities.": [
    "فرصت‌ها را به اشتراک بگذارید و میان جامعه‌ها همکاری کنید.",
    "فرصتونه شریک کړئ او د ټولنو ترمنځ همکاري وکړئ."
  ],
  "Be part of what's next.": [
    "بخشی از آینده باشید.",
    "د راتلونکي برخه شئ."
  ],
  "Join Afghan Hub and help build a more connected, supportive, and vibrant community.": [
    "به افغان هاب بپیوندید و در ساختن جامعه‌ای پیوسته‌تر، پشتیبان و پویا همراه شوید.",
    "له افغان هاب سره یوځای شئ او د یوې تړلې، ملاتړ کوونکې او فعالې ټولنې په جوړولو کې مرسته وکړئ."
  ],
  "Get started": [
    "شروع کنید",
    "پیل وکړئ"
  ],
  "Explore the platform": [
    "پلتفرم را کشف کنید",
    "پلاتفورم وپلټئ"
  ],
  "People": [
    "افراد",
    "خلک"
  ],
  "Businesses": [
    "کسب‌وکارها",
    "کاروبارونه"
  ],
  "Organizations": [
    "سازمان‌ها",
    "سازمانونه"
  ],
  "Opportunities": [
    "فرصت‌ها",
    "فرصتونه"
  ],
  "Events": [
    "رویدادها",
    "غونډې"
  ],
  "Connect and grow together.": [
    "با هم ارتباط بگیرید و رشد کنید.",
    "یوځای اړیکې جوړې کړئ او وده وکړئ."
  ],
  "Build and create opportunities.": [
    "بسازید و فرصت ایجاد کنید.",
    "جوړونه وکړئ او فرصتونه رامنځته کړئ."
  ],
  "Amplify impact collectively.": [
    "با هم تأثیر بیشتری بگذارید.",
    "په ګډه اغېز زیات کړئ."
  ],
  "Find and share what's next.": [
    "فرصت‌های آینده را پیدا و به اشتراک بگذارید.",
    "راتلونکي فرصتونه ومومئ او شریک یې کړئ."
  ],
  "Meet, learn, and take part.": [
    "دیدار کنید، یاد بگیرید و مشارکت کنید.",
    "وګورئ، زده کړه وکړئ او ګډون وکړئ."
  ],
  "Explore the community": [
    "جامعه را کشف کنید",
    "ټولنه وپلټئ"
  ],
  "View all": [
    "نمایش همه",
    "ټول وګورئ"
  ],
  "Explore Afghan Hub categories": [
    "بخش‌های افغان هاب را کشف کنید",
    "د افغان هاب برخې وپلټئ"
  ],
  "Explore the five community areas": [
    "پنج بخش جامعه را کشف کنید",
    "د ټولنې پنځه برخې وپلټئ"
  ],
  "Sign in": [
    "ورود",
    "ننوتل"
  ],
  "Public navigation": [
    "ناوبری عمومی",
    "عامه لارښوونه"
  ],
  "Mobile public navigation": [
    "ناوبری عمومی موبایل",
    "د موبایل عامه لارښوونه"
  ],
  "Community navigation menu": [
    "منوی ناوبری جامعه",
    "د ټولنې لارښوونې لړلیک"
  ],
  "Search with the Afghan Hub Navigator": [
    "جست‌وجو با راهنمای افغان هاب",
    "د افغان هاب له لارښود سره لټون"
  ],
  "Skip to content": [
    "رفتن به محتوا",
    "منځپانګې ته لاړ شئ"
  ],
  "Explore": [
    "کشف کنید",
    "وپلټئ"
  ],
  "Platform": [
    "پلتفرم",
    "پلاتفورم"
  ],
  "About": [
    "دربارهٔ ما",
    "زموږ په اړه"
  ],
  "How it works": [
    "نحوهٔ کار",
    "څنګه کار کوي"
  ],
  "AI Navigator": [
    "راهنمای هوشمند",
    "هوښیار لارښود"
  ],
  "Support": [
    "پشتیبانی",
    "ملاتړ"
  ],
  "Contact & help": [
    "تماس و راهنمایی",
    "اړیکه او مرسته"
  ],
  "Privacy": [
    "حریم خصوصی",
    "محرمیت"
  ],
  "Terms": [
    "شرایط استفاده",
    "د کارولو شرایط"
  ],
  "Accessibility help": [
    "راهنمای دسترس‌پذیری",
    "د لاسرسي مرسته"
  ],
  "A more connected Afghan future. A place for people, possibilities, and meaningful connections.": [
    "آینده‌ای پیوسته‌تر برای جامعهٔ افغانستان. فضایی برای افراد، امکان‌ها و ارتباط‌های معنادار.",
    "د افغان ټولنې لپاره لا تړلی راتلونکی. د خلکو، امکاناتو او ګټورو اړیکو لپاره ځای."
  ],
  "Afghan Hub. All rights reserved.": [
    "افغان هاب. تمامی حقوق محفوظ است.",
    "افغان هاب. ټول حقونه خوندي دي."
  ]
};
export function translate(locale: Locale, text: string): string { return locale === "en" ? text : messages[text]?.[locale === "fa" ? 0 : 1] ?? text; }
