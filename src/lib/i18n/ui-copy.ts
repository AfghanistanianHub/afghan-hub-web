import type { SiteLanguage } from "./site-language";

/**
 * Shared UI copy for English, Farsi and Pashto.
 *
 * Rules:
 * - UI copy only. Never translate user-generated content (titles, names,
 *   messages, descriptions) through this catalog.
 * - Farsi uses formal written Persian; Pashto uses standard Afghan Pashto.
 * - Strings are machine drafts until a native reviewer signs them off in
 *   docs/release/localization-review.md.
 */
export type UiCopy = {
  explore: {
    eyebrow: string;
    title: string;
    description: string;
    categories: string;
    viewingCategory: string;
    browseListings: string;
    searchCategory: string;
    searchPlaceholder: string;
    search: string;
    clearSearch: string;
    searchQuery: string;
    unavailableTitle: string;
    unavailableBody: string;
    tryAgain: string;
    noMatchTitle: string;
    noListingsTitle: string;
    noMatchBody: string;
    noListingsBody: string;
    pagination: string;
    previous: string;
    next: string;
    page: string;
    joinPrompt: string;
    joinAction: string;
  };
  listing: {
    applyBy: string;
    noSummary: string;
    onlineEvent: string;
    communityEvent: string;
    remote: string;
    online: string;
    locationNotListed: string;
  };
  categories: {
    opportunities: { label: string; singular: string; description: string };
    events: { label: string; singular: string; description: string };
    businesses: { label: string; singular: string; description: string };
    organizations: { label: string; singular: string; description: string };
  };
  detail: {
    all: string;
    atAGlance: string;
    location: string;
    deadline: string;
    date: string;
    eventEnded: string;
    deadlinePassed: string;
    about: string;
    details: string;
    noDescription: string;
    eventEndedBody: string;
    deadlinePassedBody: string;
    continueEyebrow: string;
    continueTitle: string;
    continueBody: string;
    join: string;
    openMemberView: string;
    keepExploring: string;
    keepExploringBody: string;
    browseAll: string;
    unavailableTitle: string;
    unavailableBody: string;
    tryAgain: string;
    unavailableMetadata: string;
    metadataDescription: string;
  };
  saved: {
    title: string;
    description: string;
    error: string;
    unavailable: string;
    empty: string;
    expired: string;
    hint: string;
    browse: string;
  };
  submissions: {
    title: string;
    description: string;
    newOpportunity: string;
    newEvent: string;
    loadError: string;
    categories: string;
    all: string;
    count: string;
    countUnavailable: string;
    updated: string;
    view: string;
    edit: string;
    moderatorNote: string;
    unavailable: string;
    emptyAll: string;
    emptyFiltered: string;
    emptyDescription: string;
    create: string;
    statusPublished: string;
    statusPending: string;
    statusExpired: string;
    statusRejected: string;
  };
  messages: {
    title: string;
    description: string;
    findPeople: string;
    searchConversations: string;
    searchPlaceholder: string;
    conversationsCount: string;
    unreadMessages: string;
    unread: string;
    youPrefix: string;
    startConversation: string;
    memberFallback: string;
    loadError: string;
    profilesPartial: string;
    noMatch: string;
    noConversations: string;
    noMatchBody: string;
    noConversationsBody: string;
    clearSearch: string;
    browseNetwork: string;
    backToMessages: string;
    conversationNavigation: string;
    loadEarlier: string;
    showingLatest: string;
    backToLatest: string;
    startTitle: string;
    startBody: string;
    seen: string;
    messageAria: string;
    composerPlaceholder: string;
    sending: string;
    send: string;
    composerHint: string;
    maxChars: string;
    errorConversation: string;
    errorLength: string;
    errorAccess: string;
    errorSend: string;
    errorStart: string;
    errorGeneric: string;
  };
  network: {
    eyebrow: string;
    title: string;
    description: string;
    findTech: string;
    findArtists: string;
    findMentors: string;
    members: string;
    connections: string;
    requests: string;
    requestsError: string;
    connectionsError: string;
    directoryError: string;
    myConnections: string;
    connectedCount: string;
    atCompany: string;
    communityMember: string;
    memberFallback: string;
    memberDirectory: string;
    exploreCommunity: string;
    memberCount: string;
    searchMembers: string;
    searchPlaceholder: string;
    mentorship: string;
    allMembers: string;
    openToMentoring: string;
    lookingForMentor: string;
    noMatch: string;
    noMembers: string;
    noMatchBody: string;
    noMembersBody: string;
    clearFilters: string;
    newActivity: string;
    connectionRequests: string;
    accept: string;
    decline: string;
    accepting: string;
    declining: string;
    connect: string;
    sending: string;
    connected: string;
    message: string;
    opening: string;
    disconnectConfirm: string;
    disconnecting: string;
    disconnect: string;
    requestSent: string;
    cancelling: string;
    cancelRequest: string;
    respondRequest: string;
    requestDeclined: string;
  };
  notifications: {
    title: string;
    trigger: string;
    triggerUnread: string;
    triggerUnavailable: string;
    markAllRead: string;
    unavailable: string;
    unavailableBody: string;
    unread: string;
    caughtUp: string;
    empty: string;
    emptyBody: string;
    memberFallback: string;
    connectionRequest: string;
    connectionAccepted: string;
    newMessage: string;
    contentApproved: string;
    contentRejected: string;
    reason: string;
    fallback: string;
    unreadLabel: string;
    typeFallback: string;
    untitled: string;
    typeOpportunity: string;
    typeBusiness: string;
    typeOrganization: string;
    typeEvent: string;
  };
};

export const uiCopy: Record<SiteLanguage, UiCopy> = {
  en: {
    explore: {
      eyebrow: "Explore Afghan Hub",
      title: "Find your next connection.",
      description: "Afghan-led work, gatherings, and new possibilities. Find a place to connect.",
      categories: "Listing categories",
      viewingCategory: "Viewing this category",
      browseListings: "Browse listings",
      searchCategory: "Search {category}",
      searchPlaceholder: "Name, title, or keyword",
      search: "Search",
      clearSearch: "Clear search",
      searchQuery: "Search: \u201c{query}\u201d",
      unavailableTitle: "Listings are temporarily unavailable.",
      unavailableBody: "Please try again in a moment.",
      tryAgain: "Try again",
      noMatchTitle: "No listings match your search.",
      noListingsTitle: "No listings to show here yet.",
      noMatchBody: "Try another name or clear your search.",
      noListingsBody: "Check back for new community listings, or explore another category.",
      pagination: "Pagination",
      previous: "Previous",
      next: "Next",
      page: "Page {page}",
      joinPrompt: "Have something to share with the community?",
      joinAction: "Join to contribute",
    },
    listing: {
      applyBy: "Apply by {date}",
      noSummary: "Explore this community listing to learn more.",
      onlineEvent: "Online event",
      communityEvent: "Community event",
      remote: "Remote",
      online: "Online",
      locationNotListed: "Location not listed",
    },
    categories: {
      opportunities: {
        label: "Opportunities",
        singular: "Opportunity",
        description: "Jobs, scholarships, volunteer roles, and ways to grow.",
      },
      events: {
        label: "Events",
        singular: "Event",
        description: "Gatherings, workshops, and conversations that bring us together.",
      },
      businesses: {
        label: "Businesses",
        singular: "Business",
        description: "Discover Afghan businesses and the people building them.",
      },
      organizations: {
        label: "Organizations",
        singular: "Organization",
        description: "Meet the groups creating opportunities for our community.",
      },
    },
    detail: {
      all: "All {category}",
      atAGlance: "At a glance",
      location: "Location",
      deadline: "Deadline",
      date: "Date",
      eventEnded: "Event ended",
      deadlinePassed: "Deadline passed",
      about: "About this {category}",
      details: "Details",
      noDescription: "More information has not been added yet.",
      eventEndedBody: "This event has ended.",
      deadlinePassedBody: "The application deadline has passed.",
      continueEyebrow: "Continue in Afghan Hub",
      continueTitle: "Take the next step.",
      continueBody:
        "Join Afghan Hub to connect with members, save listings, and contribute to the community.",
      join: "Join Afghan Hub",
      openMemberView: "Open member view",
      keepExploring: "Keep exploring",
      keepExploringBody: "Discover more {category} from across the community.",
      browseAll: "Browse all",
      unavailableTitle: "We couldn\u2019t load this listing.",
      unavailableBody: "Please try again shortly.",
      tryAgain: "Try again",
      unavailableMetadata: "Listing temporarily unavailable",
      metadataDescription: "{category} on Afghan Hub.",
    },
    saved: {
      title: "Saved opportunities",
      description: "Keep useful jobs, scholarships, volunteer roles, and programs in one place.",
      error: "We could not load your saved opportunities. Please try again.",
      unavailable: "No saved opportunities are currently available",
      empty: "No saved opportunities yet",
      expired:
        "Some opportunities you saved may have expired or are no longer published. Browse current opportunities to find something new.",
      hint: "Save opportunities you want to review or apply for later.",
      browse: "Browse opportunities",
    },
    submissions: {
      title: "My submissions",
      description: "Track review status and manage the content you have shared.",
      newOpportunity: "New opportunity",
      newEvent: "New event",
      loadError: "We could not load all of your submissions. Please try again. Counts for unavailable categories are unknown.",
      categories: "Submission categories",
      all: "All",
      count: "{count} submissions",
      countUnavailable: "Count unavailable",
      updated: "Updated",
      view: "View",
      edit: "Edit",
      moderatorNote: "Moderator note:",
      unavailable: "Your submissions are temporarily unavailable. Refresh the page or try again shortly.",
      emptyAll: "No submissions yet",
      emptyFiltered: "No submissions in this category yet",
      emptyDescription: "Create a listing to share it with the community and track its review here.",
      create: "Create a submission",
      statusPublished: "Published",
      statusPending: "Pending review",
      statusExpired: "Expired",
      statusRejected: "Not approved",
    },
    messages: {
      title: "Messages",
      description: "Conversations with your Afghan Hub connections.",
      findPeople: "Find people",
      searchConversations: "Search conversations",
      searchPlaceholder: "Name or latest message",
      conversationsCount: "{count} conversations",
      unreadMessages: "{count} unread messages",
      unread: "Unread",
      youPrefix: "You: ",
      startConversation: "Start the conversation",
      memberFallback: "Afghan Hub member",
      loadError: "We could not load your conversations. Please try again.",
      profilesPartial: "Your conversations loaded, but some member details are temporarily unavailable.",
      noMatch: "No matching conversations",
      noConversations: "No conversations yet",
      noMatchBody: "Try another name or latest-message search.",
      noConversationsBody: "Connect with another member, then visit their profile to start a conversation.",
      clearSearch: "Clear search",
      browseNetwork: "Browse the network",
      backToMessages: "Back to messages",
      conversationNavigation: "Conversation navigation",
      loadEarlier: "Load earlier messages",
      showingLatest: "Showing the latest 1,000 messages.",
      backToLatest: "Back to latest",
      startTitle: "Start your conversation",
      startBody: "Send the first message to start the conversation.",
      seen: "Seen",
      messageAria: "Message",
      composerPlaceholder: "Write a message...",
      sending: "Sending message",
      send: "Send message",
      composerHint: "Enter to send · Shift+Enter for a new line",
      maxChars: "Maximum 4,000 characters",
      errorConversation: "Unable to identify this conversation.",
      errorLength: "Enter a message between 1 and 4,000 characters.",
      errorAccess: "You no longer have access to this conversation.",
      errorSend: "Your message could not be sent. Please try again.",
      errorStart: "We could not start this conversation. Please try again.",
      errorGeneric: "Something went wrong. Please try again.",
    },
    network: {
      eyebrow: "Community network",
      title: "Your network",
      description: "Find professionals, entrepreneurs, artists, students, and community leaders — then turn discovery into a real connection.",
      findTech: "Find tech professionals",
      findArtists: "Find artists",
      findMentors: "Find mentors",
      members: "Members",
      connections: "Connections",
      requests: "Requests",
      requestsError: "We could not load your connection requests right now. Please try again shortly.",
      connectionsError: "We could not load your connections right now. Please try again shortly.",
      directoryError: "We could not load the member directory right now. Please try again shortly.",
      myConnections: "My connections",
      connectedCount: "{count} connected",
      atCompany: "{profession} at {company}",
      communityMember: "Community member",
      memberFallback: "Afghan Hub member",
      memberDirectory: "Member directory",
      exploreCommunity: "Explore the community",
      memberCount: "{count} members",
      searchMembers: "Search members",
      searchPlaceholder: "Search people, skills, companies...",
      mentorship: "Mentorship availability",
      allMembers: "All members",
      openToMentoring: "Open to mentoring",
      lookingForMentor: "Looking for a mentor",
      noMatch: "No matching members",
      noMembers: "No public members yet",
      noMatchBody: "Try another search or mentorship filter.",
      noMembersBody: "Public member profiles will appear here as the community grows.",
      clearFilters: "Clear filters",
      newActivity: "New activity",
      connectionRequests: "Connection requests",
      accept: "Accept",
      decline: "Decline",
      accepting: "Accepting…",
      declining: "Declining…",
      connect: "Connect",
      sending: "Sending…",
      connected: "Connected",
      message: "Message",
      opening: "Opening…",
      disconnectConfirm: "Remove this connection?",
      disconnecting: "Disconnecting…",
      disconnect: "Disconnect",
      requestSent: "Request sent",
      cancelling: "Cancelling…",
      cancelRequest: "Cancel request",
      respondRequest: "Respond to request",
      requestDeclined: "Request declined",
    },
    notifications: {
      title: "Notifications",
      trigger: "Notifications",
      triggerUnread: "Notifications, {count} unread",
      triggerUnavailable: "Notifications temporarily unavailable",
      markAllRead: "Mark all read",
      unavailable: "Notifications are temporarily unavailable",
      unavailableBody: "Please close this panel and try again shortly.",
      unread: "{count} unread",
      caughtUp: "You’re all caught up",
      empty: "No notifications yet",
      emptyBody: "New connections, messages, and moderation decisions will appear here.",
      memberFallback: "An Afghan Hub member",
      connectionRequest: "{name} sent you a connection request.",
      connectionAccepted: "{name} accepted your connection request.",
      newMessage: "{name} sent you a new message.",
      contentApproved: "Your {type} “{title}” was approved.",
      contentRejected: "Your {type} “{title}” was not approved.",
      reason: " Reason: {reason}",
      fallback: "You have a new notification.",
      unreadLabel: "Unread",
      typeFallback: "submission",
      untitled: "Untitled",
      typeOpportunity: "opportunity",
      typeBusiness: "business",
      typeOrganization: "organization",
      typeEvent: "event",
    },
  },
  fa: {
    explore: {
      eyebrow: "کاوش در افغان هاب",
      title: "پیوند بعدی خود را پیدا کنید.",
      description: "کارها، گردهمایی‌ها و فرصت‌های تازه به رهبری افغان‌ها. جای خود را برای پیوند پیدا کنید.",
      categories: "دسته‌بندی آگهی‌ها",
      viewingCategory: "در حال مشاهده این دسته",
      browseListings: "مرور آگهی‌ها",
      searchCategory: "جست‌وجوی {category}",
      searchPlaceholder: "نام، عنوان یا کلیدواژه",
      search: "جست‌وجو",
      clearSearch: "پاک کردن جست‌وجو",
      searchQuery: "جست‌وجو: «{query}»",
      unavailableTitle: "آگهی‌ها موقتاً در دسترس نیستند.",
      unavailableBody: "لطفاً لحظه‌ای بعد دوباره تلاش کنید.",
      tryAgain: "تلاش دوباره",
      noMatchTitle: "هیچ آگهی‌ای با جست‌وجوی شما مطابقت ندارد.",
      noListingsTitle: "هنوز آگهی‌ای برای نمایش وجود ندارد.",
      noMatchBody: "نام دیگری را امتحان کنید یا جست‌وجو را پاک کنید.",
      noListingsBody: "برای دیدن آگهی‌های تازه جامعه دوباره سر بزنید یا دسته دیگری را ببینید.",
      pagination: "صفحه‌بندی",
      previous: "قبلی",
      next: "بعدی",
      page: "صفحه {page}",
      joinPrompt: "چیزی برای سهیم‌شدن با جامعه دارید؟",
      joinAction: "بپیوندید و سهیم شوید",
    },
    listing: {
      applyBy: "درخواست تا {date}",
      noSummary: "برای آگاهی بیشتر این آگهی جامعه را ببینید.",
      onlineEvent: "رویداد آنلاین",
      communityEvent: "رویداد جامعه",
      remote: "دورکاری",
      online: "آنلاین",
      locationNotListed: "موقعیت ثبت نشده است",
    },
    categories: {
      opportunities: {
        label: "فرصت‌ها",
        singular: "فرصت",
        description: "فرصت‌های شغلی، بورسیه‌ها، نقش‌های داوطلبانه و راه‌های رشد.",
      },
      events: {
        label: "رویدادها",
        singular: "رویداد",
        description: "گردهمایی‌ها، کارگاه‌ها و گفتگوهایی که ما را گرد هم می‌آورد.",
      },
      businesses: {
        label: "کسب‌وکارها",
        singular: "کسب‌وکار",
        description: "کسب‌وکارهای افغان و افرادی که آن‌ها را می‌سازند را کشف کنید.",
      },
      organizations: {
        label: "سازمان‌ها",
        singular: "سازمان",
        description: "با گروه‌هایی آشنا شوید که برای جامعه ما فرصت می‌سازند.",
      },
    },
    detail: {
      all: "همه {category}",
      atAGlance: "نگاه کلی",
      location: "موقعیت",
      deadline: "مهلت",
      date: "تاریخ",
      eventEnded: "رویداد پایان یافت",
      deadlinePassed: "مهلت گذشت",
      about: "درباره این {category}",
      details: "جزئیات",
      noDescription: "اطلاعات بیشتری هنوز اضافه نشده است.",
      eventEndedBody: "این رویداد پایان یافته است.",
      deadlinePassedBody: "مهلت درخواست به پایان رسیده است.",
      continueEyebrow: "ادامه در افغان هاب",
      continueTitle: "گام بعدی را بردارید.",
      continueBody: "به افغان هاب بپیوندید تا با اعضا پیوند بگیرید، آگهی‌ها را ذخیره کنید و در جامعه سهیم شوید.",
      join: "پیوستن به افغان هاب",
      openMemberView: "باز کردن نمای اعضا",
      keepExploring: "ادامه کاوش",
      keepExploringBody: "{category} بیشتری از سراسر جامعه را کشف کنید.",
      browseAll: "مشاهده همه",
      unavailableTitle: "بارگذاری این آگهی ممکن نشد.",
      unavailableBody: "لطفاً کمی بعد دوباره تلاش کنید.",
      tryAgain: "تلاش دوباره",
      unavailableMetadata: "آگهی موقتاً در دسترس نیست",
      metadataDescription: "{category} در افغان هاب.",
    },
    saved: {
      title: "فرصت‌های ذخیره‌شده",
      description: "فرصت‌های شغلی، بورسیه‌ها، فعالیت‌های داوطلبانه و برنامه‌های سودمند را در یک جا نگه دارید.",
      error: "بارگذاری فرصت‌های ذخیره‌شده ممکن نشد. لطفاً دوباره تلاش کنید.",
      unavailable: "در حال حاضر هیچ‌یک از فرصت‌های ذخیره‌شده در دسترس نیست.",
      empty: "هنوز فرصتی ذخیره نکرده‌اید.",
      expired: "ممکن است مهلت برخی فرصت‌های ذخیره‌شده پایان یافته یا دیگر منتشر نباشند. فرصت‌های موجود را بررسی کنید.",
      hint: "فرصت‌هایی را که می‌خواهید بعداً بررسی کنید یا برای آن‌ها درخواست دهید، ذخیره کنید.",
      browse: "مشاهده فرصت‌ها",
    },
    submissions: {
      title: "درخواست‌های من",
      description: "وضعیت بررسی و محتوای سهیم‌شده خود را مدیریت کنید.",
      newOpportunity: "فرصت تازه",
      newEvent: "رویداد تازه",
      loadError: "بارگذاری همه درخواست‌های شما ممکن نشد. لطفاً دوباره تلاش کنید. شمار موارد در دسته‌های ناموجود معلوم نیست.",
      categories: "دسته‌های درخواست",
      all: "همه",
      count: "{count} درخواست",
      countUnavailable: "شمار نامعلوم",
      updated: "به‌روزرسانی",
      view: "مشاهده",
      edit: "ویرایش",
      moderatorNote: "یادداشت ناظر:",
      unavailable: "درخواست‌های شما موقتاً در دسترس نیستند. صفحه را تازه کنید یا کمی بعد دوباره تلاش کنید.",
      emptyAll: "هنوز درخواستی ثبت نشده است",
      emptyFiltered: "هنوز در این دسته درخواستی ثبت نشده است",
      emptyDescription: "برای سهیم‌شدن با جامعه، یک آگهی ایجاد کنید و بررسی آن را از همین‌جا پیگیری کنید.",
      create: "ایجاد درخواست",
      statusPublished: "منتشرشده",
      statusPending: "در انتظار بررسی",
      statusExpired: "منقضی",
      statusRejected: "تأیید نشده",
    },
    messages: {
      title: "پیام‌ها",
      description: "گفتگوها با ارتباطات شما در افغان هاب.",
      findPeople: "یافتن افراد",
      searchConversations: "جست‌وجوی گفتگوها",
      searchPlaceholder: "نام یا آخرین پیام",
      conversationsCount: "{count} گفتگو",
      unreadMessages: "{count} پیام خوانده‌نشده",
      unread: "خوانده‌نشده",
      youPrefix: "شما: ",
      startConversation: "گفتگو را آغاز کنید",
      memberFallback: "عضو افغان هاب",
      loadError: "بارگذاری گفتگوهای شما ممکن نشد. لطفاً دوباره تلاش کنید.",
      profilesPartial: "گفتگوهای شما بارگذاری شد، اما برخی اطلاعات اعضا موقتاً در دسترس نیست.",
      noMatch: "گفتگویی مطابقت ندارد",
      noConversations: "هنوز گفتگویی وجود ندارد",
      noMatchBody: "نام دیگری یا آخرین پیام دیگری را جست‌وجو کنید.",
      noConversationsBody: "با عضو دیگری پیوند بگیرید، سپس برای آغاز گفتگو به پروفایل او سر بزنید.",
      clearSearch: "پاک کردن جست‌وجو",
      browseNetwork: "مرور شبکه",
      backToMessages: "بازگشت به پیام‌ها",
      conversationNavigation: "ناوبری گفتگو",
      loadEarlier: "بارگذاری پیام‌های پیشین",
      showingLatest: "نمایش ۱٬۰۰۰ پیام آخر.",
      backToLatest: "بازگشت به آخرین",
      startTitle: "گفتگو را آغاز کنید",
      startBody: "برای آغاز گفتگو نخستین پیام را بفرستید.",
      seen: "دیده شد",
      messageAria: "پیام",
      composerPlaceholder: "پیامی بنویسید…",
      sending: "در حال ارسال پیام",
      send: "ارسال پیام",
      composerHint: "برای ارسال Enter و برای خط تازه Shift+Enter را بزنید",
      maxChars: "حداکثر ۴٬۰۰۰ نویسه",
      errorConversation: "این گفتگو شناسایی نشد.",
      errorLength: "پیامی بین ۱ تا ۴٬۰۰۰ نویسه بنویسید.",
      errorAccess: "شما دیگر به این گفتگو دسترسی ندارید.",
      errorSend: "پیام شما ارسال نشد. لطفاً دوباره تلاش کنید.",
      errorStart: "آغاز این گفتگو امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
      errorGeneric: "مشکلی رخ داد. لطفاً دوباره تلاش کنید.",
    },
    network: {
      eyebrow: "شبکه جامعه",
      title: "شبکه شما",
      description: "متخصصان، کارآفرینان، هنرمندان، دانشجویان و رهبران جامعه را بیابید — سپس آشنایی را به پیوندی واقعی تبدیل کنید.",
      findTech: "یافتن متخصصان فناوری",
      findArtists: "یافتن هنرمندان",
      findMentors: "یافتن راهنما",
      members: "اعضا",
      connections: "ارتباطات",
      requests: "درخواست‌ها",
      requestsError: "در حال حاضر بارگذاری درخواست‌های پیوند شما ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.",
      connectionsError: "در حال حاضر بارگذاری ارتباطات شما ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.",
      directoryError: "در حال حاضر بارگذاری فهرست اعضا ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.",
      myConnections: "ارتباطات من",
      connectedCount: "{count} ارتباط",
      atCompany: "{profession} در {company}",
      communityMember: "عضو جامعه",
      memberFallback: "عضو افغان هاب",
      memberDirectory: "فهرست اعضا",
      exploreCommunity: "کاوش در جامعه",
      memberCount: "{count} عضو",
      searchMembers: "جست‌وجوی اعضا",
      searchPlaceholder: "جست‌وجوی افراد، مهارت‌ها، شرکت‌ها…",
      mentorship: "دسترس‌پذیری راهنمایی",
      allMembers: "همه اعضا",
      openToMentoring: "آماده راهنمایی",
      lookingForMentor: "در جست‌وجوی راهنما",
      noMatch: "عضوی مطابقت ندارد",
      noMembers: "هنوز عضو عمومی وجود ندارد",
      noMatchBody: "جست‌وجو یا فیلتر راهنمایی دیگری را امتحان کنید.",
      noMembersBody: "با رشد جامعه، پروفایل اعضای عمومی در اینجا نمایش داده می‌شوند.",
      clearFilters: "پاک کردن فیلترها",
      newActivity: "فعالیت تازه",
      connectionRequests: "درخواست‌های پیوند",
      accept: "پذیرفتن",
      decline: "رد کردن",
      accepting: "در حال پذیرفتن…",
      declining: "در حال رد کردن…",
      connect: "پیوند",
      sending: "در حال ارسال…",
      connected: "پیوند برقرار است",
      message: "پیام",
      opening: "در حال باز کردن…",
      disconnectConfirm: "این ارتباط حذف شود؟",
      disconnecting: "در حال قطع ارتباط…",
      disconnect: "قطع ارتباط",
      requestSent: "درخواست ارسال شد",
      cancelling: "در حال لغو…",
      cancelRequest: "لغو درخواست",
      respondRequest: "پاسخ به درخواست",
      requestDeclined: "درخواست رد شد",
    },
    notifications: {
      title: "اعلان‌ها",
      trigger: "اعلان‌ها",
      triggerUnread: "اعلان‌ها، {count} خوانده‌نشده",
      triggerUnavailable: "اعلان‌ها موقتاً در دسترس نیستند",
      markAllRead: "علامت‌گذاری همه به‌عنوان خوانده‌شده",
      unavailable: "اعلان‌ها موقتاً در دسترس نیستند",
      unavailableBody: "لطفاً این پنجره را ببندید و کمی بعد دوباره تلاش کنید.",
      unread: "{count} خوانده‌نشده",
      caughtUp: "همه اعلان‌ها را دیده‌اید",
      empty: "هنوز اعلانی وجود ندارد",
      emptyBody: "پیوندهای تازه، پیام‌ها و تصمیم‌های نظارت در اینجا نمایش داده می‌شوند.",
      memberFallback: "یکی از اعضای افغان هاب",
      connectionRequest: "{name} برای شما درخواست پیوند فرستاد.",
      connectionAccepted: "{name} درخواست پیوند شما را پذیرفت.",
      newMessage: "{name} پیام تازه‌ای برای شما فرستاد.",
      contentApproved: "{type} شما با عنوان «{title}» تأیید شد.",
      contentRejected: "{type} شما با عنوان «{title}» تأیید نشد.",
      reason: " دلیل: {reason}",
      fallback: "اعلان تازه‌ای دارید.",
      unreadLabel: "خوانده‌نشده",
      typeFallback: "درخواست",
      untitled: "بدون عنوان",
      typeOpportunity: "فرصت",
      typeBusiness: "کسب‌وکار",
      typeOrganization: "سازمان",
      typeEvent: "رویداد",
    },
  },
  ps: {
    explore: {
      eyebrow: "په افغان هب کې پلټنه",
      title: "خپله راتلونکې اړیکه ومومئ.",
      description: "د افغانانو په مشرۍ کارونه، غونډې او نوي فرصتونه. د اړیکې لپاره خپل ځای ومومئ.",
      categories: "د لېستونو ډلې",
      viewingCategory: "دا ډله لیدل کېږي",
      browseListings: "لېستونه وګورئ",
      searchCategory: "د {category} لټون",
      searchPlaceholder: "نوم، سرلیک یا کلي ويی",
      search: "لټون",
      clearSearch: "لټون پاک کړئ",
      searchQuery: "لټون: «{query}»",
      unavailableTitle: "لېستونه دا مهال نشته.",
      unavailableBody: "مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
      tryAgain: "بیا هڅه",
      noMatchTitle: "هېڅ لېست ستاسو لټون سره سمون نه لري.",
      noListingsTitle: "تراوسه د ښودلو لپاره لېستونه نشته.",
      noMatchBody: "بل نوم وآزمویئ یا لټون پاک کړئ.",
      noListingsBody: "د ټولنې نویو لېستونو لپاره بیا وګورئ یا بله ډله وپلټئ.",
      pagination: "پاڼه بندي",
      previous: "مخکینی",
      next: "بل",
      page: "پاڼه {page}",
      joinPrompt: "له ټولنې سره د شریکولو څه لرئ؟",
      joinAction: "یوځای شئ او ونډه واخلئ",
    },
    listing: {
      applyBy: "تر {date} پورې غوښتنلیک",
      noSummary: "د نورو معلوماتو لپاره دا ټولنیز لېست وګورئ.",
      onlineEvent: "آنلاین پېښه",
      communityEvent: "ټولنیزه پېښه",
      remote: "له لارې کار",
      online: "آنلاین",
      locationNotListed: "ځای نه دی ثبت شوی",
    },
    categories: {
      opportunities: {
        label: "فرصتونه",
        singular: "فرصت",
        description: "دندې، بورسونه، رضاکارانه رولونه او د پرمختګ لارې.",
      },
      events: {
        label: "پېښې",
        singular: "پېښه",
        description: "غونډې، ورکشاپونه او خبرې چې موږ سره یوځای کوي.",
      },
      businesses: {
        label: "سوداګرۍ",
        singular: "سوداګري",
        description: "افغاني سوداګرۍ او هغه خلک چې جوړوي یې ومومئ.",
      },
      organizations: {
        label: "سازمانونه",
        singular: "سازمان",
        description: "هغه ډلې وپېژنئ چې زموږ ټولنې ته فرصتونه جوړوي.",
      },
    },
    detail: {
      all: "ټول {category}",
      atAGlance: "په لنډه توګه",
      location: "ځای",
      deadline: "پای نېټه",
      date: "نېټه",
      eventEnded: "پېښه پای ته ورسېده",
      deadlinePassed: "پای نېټه تېره شوه",
      about: "د دې {category} په اړه",
      details: "تفصیلات",
      noDescription: "نور معلومات لا نه دي ورزیات شوي.",
      eventEndedBody: "دا پېښه پای ته رسېدلې ده.",
      deadlinePassedBody: "د غوښتنلیک پای نېټه تېره شوې ده.",
      continueEyebrow: "په افغان هب کې دوام",
      continueTitle: "راتلونکی ګام پورته کړئ.",
      continueBody: "افغان هب ته یوځای شئ څو له غړو سره اړیکه ونیسئ، لېستونه خوندي کړئ او په ټولنه کې ونډه واخلئ.",
      join: "د افغان هب غړیتوب",
      openMemberView: "د غړي لید پرانیستل",
      keepExploring: "پلټنې ته دوام",
      keepExploringBody: "له ټولې ټولنې څخه نور {category} ومومئ.",
      browseAll: "ټول وګورئ",
      unavailableTitle: "دا لېست ونه شو بارولای.",
      unavailableBody: "مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
      tryAgain: "بیا هڅه",
      unavailableMetadata: "لېست دا مهال نشته",
      metadataDescription: "{category} په افغان هب کې.",
    },
    saved: {
      title: "خوندي شوي فرصتونه",
      description: "ګټورې دندې، بورسونه، رضاکارانه دندې او پروګرامونه په یوه ځای کې وساتئ.",
      error: "ستاسو خوندي شوي فرصتونه ونه موندل شول. مهرباني وکړئ بیا هڅه وکړئ.",
      unavailable: "اوس مهال هېڅ خوندي شوی فرصت د لاسرسي وړ نه دی.",
      empty: "تراوسه مو کوم فرصت نه دی خوندي کړی.",
      expired: "ښايي ځینې خوندي شوي فرصتونه پای ته رسېدلي وي یا نور خپاره نه وي. اوسني فرصتونه وګورئ.",
      hint: "هغه فرصتونه خوندي کړئ چې غواړئ وروسته یې وګورئ یا ورته غوښتنلیک واستوئ.",
      browse: "فرصتونه وګورئ",
    },
    submissions: {
      title: "زما غوښتنلیکونه",
      description: "د بیاکتنې حالت او هغه منځپانګه چې شریکه کړې ده اداره کړئ.",
      newOpportunity: "نوی فرصت",
      newEvent: "نوې پېښه",
      loadError: "ستاسو ټول غوښتنلیکونه ونه شول بارولای. مهرباني وکړئ بیا هڅه وکړئ. د نه لاسرسي وړ ډلو شمېرې نامعلومې دي.",
      categories: "د غوښتنلیکونو ډلې",
      all: "ټول",
      count: "{count} غوښتنلیکونه",
      countUnavailable: "شمېره نه ده معلومه",
      updated: "نوی شوی",
      view: "کتل",
      edit: "سمون",
      moderatorNote: "د څارونکي یادښت:",
      unavailable: "ستاسو غوښتنلیکونه دا مهال نشته. پاڼه تازه کړئ یا لږ وروسته بیا هڅه وکړئ.",
      emptyAll: "تراوسه کوم غوښتنلیک نه دی ثبت شوی",
      emptyFiltered: "تراوسه په دې ډله کې کوم غوښتنلیک نه دی ثبت شوی",
      emptyDescription: "له ټولنې سره د شریکولو لپاره یو لېست جوړ کړئ او د هغه بیاکتنه دلته تعقیب کړئ.",
      create: "غوښتنلیک جوړول",
      statusPublished: "خپور شوی",
      statusPending: "د بیاکتنې په تمه",
      statusExpired: "پای ته رسېدلی",
      statusRejected: "نه دی تصویب شوی",
    },
    messages: {
      title: "پیغامونه",
      description: "له خپلو افغان هب اړیکو سره خبرې اترې.",
      findPeople: "خلک ومومئ",
      searchConversations: "د خبرو اترو لټون",
      searchPlaceholder: "نوم یا وروستی پیغام",
      conversationsCount: "{count} خبرې اترې",
      unreadMessages: "{count} نالوستل شوي پیغامونه",
      unread: "نالوستل شوی",
      youPrefix: "تاسو: ",
      startConversation: "خبرې پیل کړئ",
      memberFallback: "د افغان هب غړی",
      loadError: "ستاسو خبرې اترې ونه شوې بارولای. مهرباني وکړئ بیا هڅه وکړئ.",
      profilesPartial: "ستاسو خبرې اترې بار شوې، مګر د ځینو غړو معلومات دا مهال نشته.",
      noMatch: "هېڅ خبرې اترې سمون نه لري",
      noConversations: "تراوسه خبرې اترې نشته",
      noMatchBody: "بل نوم یا بل وروستی پیغام ولټوئ.",
      noConversationsBody: "له بل غړي سره اړیکه ونیسئ، بیا د خبرو پیلولو لپاره د هغه پروفایل وګورئ.",
      clearSearch: "لټون پاک کړئ",
      browseNetwork: "شبکه وګورئ",
      backToMessages: "پیغامونو ته بېرته",
      conversationNavigation: "د خبرو اترو لارښود",
      loadEarlier: "پخواني پیغامونه بار کړئ",
      showingLatest: "وروستي ۱٬۰۰۰ پیغامونه ښودل کېږي.",
      backToLatest: "وروستي ته بېرته",
      startTitle: "خبرې اترې پیل کړئ",
      startBody: "د خبرو پیلولو لپاره لومړی پیغام واستوئ.",
      seen: "لیدل شوی",
      messageAria: "پیغام",
      composerPlaceholder: "پیغام ولیکئ…",
      sending: "پیغام لېږل کېږي",
      send: "پیغام واستوئ",
      composerHint: "د لېږلو لپاره Enter، نوي کرښې لپاره Shift+Enter",
      maxChars: "تر ۴٬۰۰۰ تورو پورې",
      errorConversation: "دا خبرې اترې ونه پېژندل شوې.",
      errorLength: "له ۱ څخه تر ۴٬۰۰۰ تورو پورې پیغام ولیکئ.",
      errorAccess: "تاسو نور دې خبرو اترو ته لاسرسی نه لرئ.",
      errorSend: "ستاسو پیغام ونه لېږل شو. مهرباني وکړئ بیا هڅه وکړئ.",
      errorStart: "دا خبرې اترې پیل نه شوې. مهرباني وکړئ بیا هڅه وکړئ.",
      errorGeneric: "ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    },
    network: {
      eyebrow: "د ټولنې شبکه",
      title: "ستاسو شبکه",
      description: "مسلکي کسان، سوداګر، هنرمندان، زده کوونکي او د ټولنې مشران ومومئ — بیا پېژندنه په ریښتینې اړیکه واوړئ.",
      findTech: "د ټکنالوژۍ مسلکي کسان ومومئ",
      findArtists: "هنرمندان ومومئ",
      findMentors: "لارښوونکي ومومئ",
      members: "غړي",
      connections: "اړیکې",
      requests: "غوښتنې",
      requestsError: "اوس ستاسو د اړیکې غوښتنې نه شي بارولای. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
      connectionsError: "اوس ستاسو اړیکې نه شي بارولای. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
      directoryError: "اوس د غړو نوملړ نه شي بارولای. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
      myConnections: "زما اړیکې",
      connectedCount: "{count} اړیکې",
      atCompany: "{profession} په {company}",
      communityMember: "د ټولنې غړی",
      memberFallback: "د افغان هب غړی",
      memberDirectory: "د غړو نوملړ",
      exploreCommunity: "ټولنه وپلټئ",
      memberCount: "{count} غړي",
      searchMembers: "د غړو لټون",
      searchPlaceholder: "د خلکو، مهارتونو، شرکتونو لټون…",
      mentorship: "د لارښوونې شتون",
      allMembers: "ټول غړي",
      openToMentoring: "د لارښوونې لپاره چمتو",
      lookingForMentor: "لارښوونکي ته اړتیا",
      noMatch: "هېڅ غړی سمون نه لري",
      noMembers: "تراوسه عامه غړی نشته",
      noMatchBody: "بل لټون یا د لارښوونې بل فلټر وآزمویئ.",
      noMembersBody: "د ټولنې په پراخېدو سره به عامه غړي دلته ښکاره شي.",
      clearFilters: "فلټرونه پاک کړئ",
      newActivity: "نوې فعالیت",
      connectionRequests: "د اړیکې غوښتنې",
      accept: "منل",
      decline: "ردول",
      accepting: "منل کېږي…",
      declining: "ردول کېږي…",
      connect: "اړیکه",
      sending: "لېږل کېږي…",
      connected: "اړیکه ټینګه ده",
      message: "پیغام",
      opening: "پرانیستل کېږي…",
      disconnectConfirm: "دا اړیکه لرې کړو؟",
      disconnecting: "اړیکه پرېکېږي…",
      disconnect: "اړیکه پرې کول",
      requestSent: "غوښتنه واستول شوه",
      cancelling: "لغوه کېږي…",
      cancelRequest: "غوښتنه لغوه کړئ",
      respondRequest: "غوښتنې ته ځواب",
      requestDeclined: "غوښتنه رد شوه",
    },
    notifications: {
      title: "خبرتیاوې",
      trigger: "خبرتیاوې",
      triggerUnread: "خبرتیاوې، {count} نالوستل شوي",
      triggerUnavailable: "خبرتیاوې دا مهال نشته",
      markAllRead: "ټول لوستل شوي وګڼئ",
      unavailable: "خبرتیاوې دا مهال نشته",
      unavailableBody: "مهرباني وکړئ دا پینل وتړئ او لږ وروسته بیا هڅه وکړئ.",
      unread: "{count} نالوستل شوي",
      caughtUp: "تاسو ټولې خبرتیاوې لیدلې دي",
      empty: "تراوسه کومه خبرتیا نشته",
      emptyBody: "نوې اړیکې، پیغامونه او د څارنې پرېکړې به دلته ښکاره شي.",
      memberFallback: "د افغان هب یو غړی",
      connectionRequest: "{name} تاسو ته د اړیکې غوښتنه واستوله.",
      connectionAccepted: "{name} ستاسو د اړیکې غوښتنه ومنله.",
      newMessage: "{name} تاسو ته نوی پیغام واستاوه.",
      contentApproved: "ستاسو {type} چې «{title}» نومېږي ومنل شو.",
      contentRejected: "ستاسو {type} چې «{title}» نومېږي ونه منل شو.",
      reason: " دلیل: {reason}",
      fallback: "تاسو نوې خبرتیا لرئ.",
      unreadLabel: "نالوستل شوی",
      typeFallback: "غوښتنلیک",
      untitled: "بې سرلیک",
      typeOpportunity: "فرصت",
      typeBusiness: "سوداګري",
      typeOrganization: "سازمان",
      typeEvent: "پېښه",
    },
  },
};

type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type UiCopyKey = Leaves<UiCopy>;

export function formatCopy(template: string, values: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  );
}

/**
 * Messaging actions return stable codes instead of English sentences, so the
 * visible failure is always localized. Unknown codes fall back to the generic
 * message so a new failure never leaks untranslated text.
 */
const messageActionErrorKeys: Record<string, UiCopyKey> = {
  "invalid-conversation": "messages.errorConversation",
  "invalid-length": "messages.errorLength",
  "no-access": "messages.errorAccess",
  "send-failed": "messages.errorSend",
  "start-failed": "messages.errorStart",
};

export function messageActionErrorKey(code: string | null | undefined): UiCopyKey {
  if (!code) return "messages.errorGeneric";
  return messageActionErrorKeys[code] ?? "messages.errorGeneric";
}

export function getUiCopy(language: SiteLanguage, key: UiCopyKey): string {
  const value = key.split(".").reduce<unknown>((node, part) => {
    if (!node || typeof node !== "object") return undefined;
    return (node as Record<string, unknown>)[part];
  }, uiCopy[language]);
  return typeof value === "string" ? value : key;
}

/** Recognizes UI-generated catalogue values while leaving user-authored text untouched. */
export function localizeListingValue(language: SiteLanguage, value: string | null | undefined): string {
  if (!value) return "";
  const known: Record<string, UiCopyKey> = {
    "Online": "listing.online",
    "Remote": "listing.remote",
    "Online event": "listing.onlineEvent",
    "Community event": "listing.communityEvent",
    "Location not listed": "listing.locationNotListed",
  };
  const key = known[value];
  return key ? getUiCopy(language, key) : value;
}
