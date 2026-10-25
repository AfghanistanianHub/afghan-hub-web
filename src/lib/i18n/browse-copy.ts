import type { SiteLanguage } from "./site-language";

/**
 * UI copy for the discovery surfaces: search, the opportunity, business,
 * organization and event directories, their member-facing detail pages, and
 * the not-found and recovery screens those routes can land on.
 *
 * Kept separate from `ui-copy.ts` (public marketing/detail catalogue) and
 * `workspace-copy.ts` (onboarding and create/edit forms) so each catalogue can
 * be reviewed on its own. Same rules apply:
 * - UI copy only, never user-generated content.
 * - Formal written Farsi, standard Afghan Pashto.
 * - Machine drafts until a native reviewer signs them off.
 * - No Latin text in Farsi or Pashto values, except brand names, URLs and
 *   technical identifiers that must stay Latin.
 */
export const browseCopy = {
  en: {
    "common.community": "Community",
    "common.location": "Location",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.city": "City",
    "common.anyCity": "Any city",
    "common.type": "Type",
    "common.allTypes": "All types",
    "common.format": "Format",
    "common.allFormats": "All formats",
    "common.remote": "Remote",
    "common.inPerson": "In person",
    "common.online": "Online",
    "common.apply": "Apply",
    "common.clear": "Clear",
    "common.clearFilters": "Clear filters",
    "common.verifiedListings": "Verified listings",
    "common.hiringNow": "Hiring now",
    "common.volunteers": "Volunteers",
    "common.acceptingVolunteers": "Accepting volunteers",
    "common.filtersShared":
      "Filters are reflected in the URL, so this view can be shared.",
    "common.edit": "Edit",
    "common.viewAll": "View all",
    "common.keepExploring": "Keep exploring",
    "common.hostedBy": "Hosted by",

    "opportunities.title": "Opportunities",
    "opportunities.description":
      "Find jobs, volunteering, scholarships, mentorship and community opportunities.",
    "opportunities.post": "Post opportunity",
    "opportunities.search": "Search opportunities",
    "opportunities.searchPlaceholder": "Search by title",
    "opportunities.countOne": "{count} opportunity found",
    "opportunities.countMany": "{count} opportunities found",
    "opportunities.loadError": "Opportunities could not be loaded.",
    "opportunities.loadErrorTitle": "We could not load opportunities",
    "opportunities.loadErrorBody": "Please try again in a moment.",
    "opportunities.postedBy": "Posted by {name}",
    "opportunities.personal": "Personal opportunity",
    "opportunities.deadline": "Deadline {date}",
    "opportunities.deadlineLabel": "Deadline",
    "opportunities.emptyFiltered": "No opportunities match these filters",
    "opportunities.empty": "No opportunities yet",
    "opportunities.emptyFilteredBody": "Try adjusting or clearing your filters.",
    "opportunities.emptyBody": "Published opportunities will appear here.",

    "opportunityType.job": "Job",
    "opportunityType.volunteer": "Volunteer",
    "opportunityType.scholarship": "Scholarship",
    "opportunityType.mentorship": "Mentorship",
    "opportunityType.investment": "Investment",
    "opportunityType.housing": "Housing",
    "opportunityType.event": "Event",
    "opportunityType.education": "Education",

    "events.title": "Events",
    "events.description":
      "Community events, workshops, conferences and gatherings.",
    "events.my": "My events",
    "events.create": "Create event",
    "events.search": "Search events",
    "events.searchPlaceholder": "Search by event title",
    "events.countOne": "{count} event found",
    "events.countMany": "{count} events found",
    "events.loadError": "Events could not be loaded.",
    "events.loadErrorBody": "We could not load events. Please try again.",
    "events.list": "List",
    "events.calendar": "Calendar",
    "events.previous": "Previous",
    "events.next": "Next",
    "events.monthEmpty": "No matching events in {month}",
    "events.monthEmptyBody": "Choose another month or create a community event.",
    "events.hostedBy": "Hosted by {name}",
    "events.communityEvent": "Community event",
    "events.emptyFiltered": "No matching events",
    "events.empty": "No events yet",
    "events.emptyFilteredBody": "Try changing or clearing your filters.",
    "events.emptyBody": "Upcoming community events will appear here.",

    "businesses.title": "Discover businesses",
    "businesses.description":
      "Support Afghan-owned businesses, services and entrepreneurs.",
    "businesses.create": "Create business",
    "businesses.search": "Search businesses",
    "businesses.searchPlaceholder": "Business name",
    "businesses.category": "Category",
    "businesses.anyCategory": "Any category",
    "businesses.countOne": "{count} business found",
    "businesses.countMany": "{count} businesses found",
    "businesses.loadError": "Businesses could not be loaded.",
    "businesses.loadErrorBody":
      "We could not load businesses. Please try again.",
    "businesses.emptyFiltered": "No businesses match these filters",
    "businesses.empty": "No businesses yet",
    "businesses.emptyFilteredBody": "Try adjusting or clearing your filters.",
    "businesses.emptyBody":
      "Community businesses will appear here once they are added.",
    "businesses.add": "Add a business",

    "organizations.title": "Discover organizations",
    "organizations.description":
      "Explore Afghan-led nonprofits, associations and community initiatives.",
    "organizations.add": "Add organization",
    "organizations.search": "Search organizations",
    "organizations.searchPlaceholder": "Organization name",
    "organizations.anyType": "Any type",
    "organizations.countOne": "{count} organization found",
    "organizations.countMany": "{count} organizations found",
    "organizations.loadError": "Organizations could not be loaded.",
    "organizations.loadErrorBody":
      "We could not load organizations. Please try again.",
    "organizations.emptyFiltered": "No organizations match these filters",
    "organizations.empty": "No organizations yet",
    "organizations.emptyFilteredBody":
      "Try adjusting or clearing your filters.",
    "organizations.emptyBody":
      "Community organizations will appear here once they are added.",
    "organizations.emptyAction": "Add an organization",

    "search.title": "Search with purpose.",
    "search.description":
      "Choose what you are trying to do, then browse or add a keyword. Afghan Hub uses only explicit, public signals to prioritize relevant people and listings.",
    "search.intentLabel": "What are you looking for?",
    "search.anyIntent": "Anything in the community",
    "search.fieldLabel": "Search Afghan Hub",
    "search.placeholder": "Name, skill, organization, service, opportunity…",
    "search.placeholderIntent": "Optional keyword…",
    "search.submit": "Search",
    "search.browse": "Browse",
    "search.minChars": "Enter at least two characters to search.",
    "search.error": "We could not complete your search. Please try again.",
    "search.countOne": "{count} result",
    "search.countMany": "{count} results",
    "search.forQuery": "for “{query}”",
    "search.browsing": "browsing",
    "search.prioritizedFor": "prioritized for",
    "search.emptyTitle": "No results found",
    "search.emptyBody":
      "Try another name, location, skill, organization, business, opportunity, or event.",
    "search.emptyHint":
      "Add an optional keyword above to broaden or refine your discovery.",
    "search.startEyebrow": "Start with a goal",
    "search.startTitle": "Tell us what you are trying to do.",
    "search.startBody":
      "You do not need to know where something lives in Afghan Hub. Choose a path and we will focus the kinds of results you see.",
    "search.exploreEyebrow": "Explore",
    "search.anythingTitle": "Search anything",
    "search.anythingBody":
      "Use the search box above for a person, skill, service, place, organization, opportunity, or event.",
    "search.typeMember": "Member",
    "search.memberFallback": "Afghan Hub member",

    "search.empty.find_work":
      "No current jobs or explicitly hiring businesses match this view yet.",
    "search.empty.hire_talent":
      "No eligible public member profiles are available in this view yet.",
    "search.empty.find_mentor":
      "No eligible public members have opted in to offer mentorship in this view yet.",
    "search.empty.offer_mentorship":
      "No eligible public members have said they are looking for a mentor in this view yet.",
    "search.empty.volunteer":
      "No current volunteer roles or organizations explicitly accepting volunteers are available yet.",
    "search.empty.find_services":
      "No published businesses are available in this view yet.",
    "search.empty.join_community":
      "No published community organizations or current events are available in this view yet.",

    "intent.find_work": "Find work",
    "intent.hire_talent": "Find talent",
    "intent.find_mentor": "Find a mentor",
    "intent.offer_mentorship": "Offer mentorship",
    "intent.volunteer": "Volunteer",
    "intent.find_services": "Find services",
    "intent.join_community": "Join community activity",

    "goal.find_work.label": "Work",
    "goal.find_work.title": "Find work",
    "goal.find_work.description":
      "Jobs and community businesses that are currently hiring.",
    "goal.find_services.label": "Services",
    "goal.find_services.title": "Find services & businesses",
    "goal.find_services.description":
      "Browse community businesses and practical services for everyday and professional needs.",
    "goal.connect.label": "Connect",
    "goal.connect.title": "Meet people in my field",
    "goal.connect.description":
      "Find members with relevant skills, experience, and community ties.",
    "goal.join_community.label": "Belong",
    "goal.join_community.title": "Join the community",
    "goal.join_community.description":
      "Explore organizations, events, and places to participate.",
    "goal.volunteer.label": "Contribute",
    "goal.volunteer.title": "Volunteer and help",
    "goal.volunteer.description":
      "Find community roles where your time and experience matter.",

    "reason.matchesWork": "Matches your work goal",
    "reason.currentlyHiring": "Currently hiring",
    "reason.memberDiscovery": "Member discovery for your hiring goal",
    "reason.openToMentoring": "Open to mentoring",
    "reason.lookingForMentor": "Looking for a mentor",
    "reason.openToCollaboration": "Open to collaboration",
    "reason.matchesFunding": "Matches your funding goal",
    "reason.volunteerOpportunity": "Volunteer opportunity",
    "reason.acceptingVolunteers": "Accepting volunteers",
    "reason.businessServices": "Business relevant to your services goal",
    "reason.communityOrganization": "Community organization",
    "reason.upcomingActivity": "Upcoming community activity",

    "detail.backToOpportunities": "Back to opportunities",
    "detail.backToEvents": "Back to events",
    "detail.backToBusinesses": "Back to businesses",
    "detail.backToOrganizations": "Back to organizations",
    "detail.takeNextStep": "Take the next step",

    "opportunityDetail.draft":
      "This opportunity is waiting for moderator approval and is not visible to the community yet.",
    "opportunityDetail.rejected":
      "This opportunity was not approved. Edit it to submit it for review again.",
    "opportunityDetail.rejectedReason":
      "This opportunity was not approved. Reason: {reason} Edit it to submit it for review again.",
    "opportunityDetail.expired":
      "This opportunity has passed its application deadline and is no longer active.",
    "opportunityDetail.active": "Active",
    "opportunityDetail.applyBy": "Apply by {date}",
    "opportunityDetail.closedOn": "Closed {date}",
    "opportunityDetail.save": "Save",
    "opportunityDetail.saved": "Saved",
    "opportunityDetail.saving": "Saving…",
    "opportunityDetail.removing": "Removing…",
    "opportunityDetail.applyNow": "Apply now",
    "opportunityDetail.applicationsClosed": "Applications closed",
    "opportunityDetail.contact": "Contact",
    "opportunityDetail.findSimilar": "Find similar opportunities",
    "opportunityDetail.findPeople": "Find people in this field",
    "opportunityDetail.related": "Related opportunities",
    "opportunityDetail.relatedBody":
      "Similar active opportunities based on type, topic, and location.",
    "opportunityDetail.about": "About this opportunity",

    "eventDetail.about": "About the event",
    "eventDetail.onlineEvent": "Online event",
    "eventDetail.inPersonEvent": "In-person event",
    "eventDetail.upcoming": "Upcoming",
    "eventDetail.attendees": "Attendees",
    "eventDetail.starts": "Starts",
    "eventDetail.where": "Where",
    "eventDetail.ends": "Ends:",
    "eventDetail.online": "Online:",
    "eventDetail.joinEvent": "Join event",
    "eventDetail.venue": "Venue:",
    "eventDetail.address": "Address:",
    "eventDetail.location": "Location:",
    "eventDetail.capacity": "Capacity:",
    "eventDetail.tba": "Location to be announced",
    "eventDetail.attendance": "Attendance",
    "eventDetail.goingOne": "{count} person going",
    "eventDetail.goingMany": "{count} people going",
    "eventDetail.spots": "{count} spots remaining",
    "eventDetail.cancelRegistration": "Cancel registration",
    "eventDetail.cancelling": "Cancelling registration…",
    "eventDetail.register": "Register for this event",
    "eventDetail.registering": "Registering…",
    "eventDetail.full": "Event full",
    "eventDetail.hosting": "You are hosting this event.",
    "eventDetail.registrationClosed": "Registration closed",
    "eventDetail.addToCalendar": "Add to calendar",
    "eventDetail.googleCalendar": "Google Calendar",
    "eventDetail.downloadIcs": "Download calendar file",
    "eventDetail.related": "Related events",
    "eventDetail.relatedBody":
      "Upcoming events with similar topics or locations.",
    "eventDetail.rsvpJoined": "You are registered for this event.",
    "eventDetail.rsvpCancelled": "Your registration was cancelled.",
    "eventDetail.rsvpFull": "This event has reached its capacity.",
    "eventDetail.rsvpStarted":
      "Registration is closed because this event has started.",
    "eventDetail.rsvpError":
      "We could not update your registration. Please try again.",
    "eventDetail.draft":
      "This event is waiting for moderator approval and is not visible to the community yet.",
    "eventDetail.rejected":
      "This event was not approved. Edit it to submit it for review again.",
    "eventDetail.rejectedReason":
      "This event was not approved. Reason: {reason} Edit it to submit it for review again.",
    "eventDetail.findSimilar": "Find similar events",
    "eventDetail.findOrganizations": "Find related organizations",

    "businessDetail.draft":
      "This business is waiting for moderator approval and is not visible to the community yet.",
    "businessDetail.rejected":
      "This business was not approved. Edit it to submit it for review again.",
    "businessDetail.rejectedReason":
      "This business was not approved. Reason: {reason} Edit it to submit it for review again.",
    "businessDetail.hiringBadge": "Hiring",
    "businessDetail.edit": "Edit business",
    "businessDetail.verify": "Verify business",
    "businessDetail.removeVerification": "Remove verification",
    "businessDetail.updating": "Updating…",
    "businessDetail.about": "About the business",
    "businessDetail.offerEyebrow": "What they offer",
    "businessDetail.services": "Services",
    "businessDetail.connect": "Connect",
    "businessDetail.visitWebsite": "Visit website",

    "organizationDetail.draft":
      "This organization is waiting for moderator approval and is not visible to the community yet.",
    "organizationDetail.rejected":
      "This organization was not approved. Edit it to submit it for review again.",
    "organizationDetail.rejectedReason":
      "This organization was not approved. Reason: {reason} Edit it to submit it for review again.",
    "organizationDetail.volunteersWelcome": "Volunteers welcome",
    "organizationDetail.edit": "Edit organization",
    "organizationDetail.verify": "Verify organization",
    "organizationDetail.removeVerification": "Remove verification",
    "organizationDetail.about": "About the organization",
    "organizationDetail.why": "Why they exist",
    "organizationDetail.mission": "Mission",
    "organizationDetail.whatTheyDo": "What they do",
    "organizationDetail.programs": "Programs",
    "organizationDetail.volunteerBody":
      "Reach out to ask how you can contribute.",
    "organizationDetail.connect": "Connect",
    "organizationDetail.visitWebsite": "Visit website",

    "attendees.back": "Back to event",
    "attendees.title": "Event attendees",
    "attendees.edit": "Edit event",
    "attendees.registered": "Registered",
    "attendees.capacity": "Capacity",
    "attendees.remaining": "Remaining",
    "attendees.unlimited": "Unlimited",
    "attendees.registeredHeading": "Registered members",
    "attendees.privacy":
      "Only public profile details are shown here. Private members remain anonymous.",
    "attendees.privateMember": "Private member",
    "attendees.registeredAt": "Registered {date}",
    "attendees.noRegistrations": "No registrations yet",
    "attendees.noRegistrationsBody":
      "Members who register for this event will appear here.",
    "attendees.viewProfile": "View profile",

    "myEvents.title": "My events",
    "myEvents.description":
      "Keep track of events you registered for and events you are hosting.",
    "myEvents.browse": "Browse events",
    "myEvents.registered": "Registered",
    "myEvents.registeredBody":
      "Upcoming events you have confirmed you are attending.",
    "myEvents.noUpcoming": "No upcoming registrations",
    "myEvents.noUpcomingBody": "Register for an event and it will appear here.",
    "myEvents.past": "Past registrations ({count})",
    "myEvents.hosting": "Hosting",
    "myEvents.hostingBody":
      "Events you created, including items still under review.",
    "myEvents.noHosting": "You are not hosting any events yet",
    "myEvents.noHostingBody": "Create an event to submit it for moderation.",
    "myEvents.statusDraft": "Pending review",
    "myEvents.statusPublished": "Published",
    "myEvents.statusClosed": "Closed",
    "myEvents.statusRejected": "Not approved",

    "moderation.entityOpportunity": "Opportunity",
    "moderation.entityEvent": "Event",
    "moderation.entityBusiness": "Business",
    "moderation.entityOrganization": "Organization",
    "moderation.title": "Content moderation",
    "moderation.description":
      "Review opportunities, events, businesses, and organizations before they become visible to the community.",
    "moderation.manageTeam": "Manage moderation team",
    "moderation.successApproved": "The submission was approved.",
    "moderation.successRejected": "The submission was rejected.",
    "moderation.successGeneric": "The submission review was recorded.",
    "moderation.pendingTab": "Pending review",
    "moderation.historyTab": "Recent decisions",
    "moderation.pendingHeading": "Pending review",
    "moderation.nothingPending": "Nothing waiting for review",
    "moderation.nothingPendingBody":
      "New submissions will appear here when they need moderator approval.",
    "moderation.historyHeading": "Recent decisions",
    "moderation.historyBody":
      "The latest approved and rejected submissions across all moderated content.",
    "moderation.noHistory": "No moderation history yet",
    "moderation.noHistoryBody":
      "Approved and rejected submissions will appear here after the first review decision.",
    "moderation.approved": "Approved",
    "moderation.rejected": "Rejected",
    "moderation.reason": "Reason: {reason}",
    "moderation.submitted": "Submitted {date}",
    "moderation.starts": "Starts {date}",
    "moderation.approve": "Approve",
    "moderation.approving": "Approving…",
    "moderation.rejectSummary": "Reject with a reason",
    "moderation.rejectLabel": "Explain what should be corrected",
    "moderation.reject": "Reject submission",
    "moderation.rejecting": "Rejecting…",
    "moderation.errorInvalidRequest":
      "That moderation request was incomplete. Refreshing the queue and trying again usually fixes it.",
    "moderation.errorInvalidReason":
      "Rejections need a reason between 10 and 1,000 characters.",
    "moderation.errorApplyFailed":
      "We could not apply that moderation decision. Please refresh and try again.",

    "team.back": "Back to moderation",
    "team.title": "Moderation team",
    "team.description":
      "Promote trusted members to moderator or admin, or return them to the standard member role.",
    "team.adminOnly": "Admin only",
    "team.roleUpdated": "Member role updated.",
    "team.loadError": "We could not load members. Please try again.",
    "team.empty": "No member accounts to manage",
    "team.emptyBody":
      "Member accounts will appear here once they are available to the admin directory.",
    "team.onboardingIncomplete": "Onboarding incomplete",
    "team.ownRole": "Your own role cannot be changed here.",
    "team.role": "Role",
    "team.roleMember": "Member",
    "team.roleModerator": "Moderator",
    "team.roleAdmin": "Admin",
    "team.saveRole": "Save role",
    "team.savingRole": "Saving role…",
    "team.memberFallback": "Afghan Hub member",
    "team.errorInvalidRole": "That role request was not valid.",
    "team.errorUpdateFailed":
      "We could not update that member role. Please refresh and try again.",

    "verification.label": "Verified listing",
    "verification.explanation":
      "Afghan Hub administrators have marked this listing as verified. Verification is not an endorsement or guarantee.",
    "verification.meaning": "What verification means:",
    "verification.aria": "Verified listing. {explanation}",

    "member.back": "Back to network",
    "member.fallbackName": "Afghan Hub member",
    "member.profile": "Profile",
    "member.about": "About",
    "member.bioEmpty": "This member has not added a biography yet.",
    "member.expertise": "Expertise",
    "member.skills": "Skills",
    "member.skillsEmpty": "No skills have been added.",
    "member.mentorship": "Mentorship",
    "member.openToMentoring": "Open to mentoring",
    "member.lookingForMentor": "Looking for a mentor",
    "member.mentorshipNote":
      "These are member-selected preferences, not a credential or endorsement by Afghan Hub.",
    "member.languages": "Languages",
    "member.languagesEmpty": "No languages added.",
    "member.links": "Links",
    "member.website": "Website",
    "member.linkedin": "LinkedIn",
    "member.conversationError":
      "We could not start this conversation. Please try again.",

    "opportunityAction.errorExpired":
      "This opportunity has expired, so it can no longer be saved.",
    "opportunityAction.errorCannotDelete":
      "You can only delete opportunities you created.",
    "opportunityAction.errorDeleteFailed":
      "We could not delete the opportunity. Please try again.",
    "opportunityAction.errorSaveFailed":
      "We could not update your saved opportunities. Please try again.",
    "opportunityAction.errorGeneric":
      "That action could not be completed. Please refresh and try again.",

    "action.errorGeneric":
      "That action could not be completed. Please refresh and try again.",
    "verificationAction.errorUpdateFailed":
      "We could not update verification. Please try again.",
    "eventAction.errorCannotDelete": "You can only delete events you created.",
    "eventAction.errorDeleteFailed":
      "We could not delete the event. Please try again.",

    "delete.opportunityConfirm":
      "Are you sure you want to delete this opportunity? This action cannot be undone.",
    "delete.eventConfirm":
      "Are you sure you want to delete this event? This action cannot be undone.",
    "delete.action": "Delete",
    "delete.deleting": "Deleting…",

    "notFound.eyebrow": "404 · Page not found",
    "notFound.title": "This page isn’t available.",
    "notFound.body":
      "The link may be outdated, the page may have moved, or you may not have access to it. You can head home or keep exploring Afghan Hub.",
    "notFound.home": "Go to homepage",
    "notFound.explore": "Explore community",
    "notFound.signIn": "Sign in",
    "notFound.businessTitle": "Business not found",
    "notFound.businessBody":
      "This business does not exist or is not publicly available.",
    "notFound.viewBusinesses": "View businesses",
    "notFound.organizationTitle": "Organization not found",
    "notFound.organizationBody":
      "This organization does not exist or is not publicly available.",
    "notFound.viewOrganizations": "View organizations",
    "notFound.memberTitle": "Member not found",
    "notFound.memberBody":
      "This profile may not exist, may not be public, or may not have completed onboarding.",
    "notFound.returnToNetwork": "Return to network",
    "notFound.listingTitle": "This listing isn’t available.",
    "notFound.listingBody":
      "It may have been removed, unpublished, or is no longer available to the public.",
    "notFound.exploreListings": "Explore community listings",

    "recovery.eyebrow": "Page unavailable",
    "recovery.title": "We couldn’t load this page.",
    "recovery.body":
      "Something went wrong. You can try the page again, or return to Afghan Hub and continue from there.",
    "recovery.retry": "Try again",
    "recovery.retrying": "Trying again…",
    "recovery.home": "Go to home",
    "recovery.privacyNote":
      "For privacy, Afghan Hub does not show internal error details on this screen.",
    "recovery.documentTitle": "Page unavailable | Afghan Hub",
  },
  fa: {
    "common.community": "جامعه",
    "common.location": "موقعیت",
    "common.email": "ایمیل",
    "common.phone": "تلفن",
    "common.city": "شهر",
    "common.anyCity": "هر شهر",
    "common.type": "نوع",
    "common.allTypes": "همه انواع",
    "common.format": "حالت",
    "common.allFormats": "همه حالت‌ها",
    "common.remote": "دورکاری",
    "common.inPerson": "حضوری",
    "common.online": "آنلاین",
    "common.apply": "اعمال",
    "common.clear": "پاک کردن",
    "common.clearFilters": "پاک کردن فیلترها",
    "common.verifiedListings": "آگهی‌های تأییدشده",
    "common.hiringNow": "در حال استخدام",
    "common.volunteers": "داوطلبان",
    "common.acceptingVolunteers": "پذیرش داوطلب",
    "common.filtersShared":
      "فیلترها در نشانی صفحه بازتاب می‌یابند، بنابراین می‌توانید این نما را به اشتراک بگذارید.",
    "common.edit": "ویرایش",
    "common.viewAll": "مشاهده همه",
    "common.keepExploring": "ادامه کاوش",
    "common.hostedBy": "میزبانی",

    "opportunities.title": "فرصت‌ها",
    "opportunities.description":
      "شغل، داوطلبی، بورس تحصیلی، راهنمایی و فرصت‌های جامعه را پیدا کنید.",
    "opportunities.post": "ثبت فرصت",
    "opportunities.search": "جست‌وجوی فرصت‌ها",
    "opportunities.searchPlaceholder": "جست‌وجو بر اساس عنوان",
    "opportunities.countOne": "{count} فرصت پیدا شد",
    "opportunities.countMany": "{count} فرصت پیدا شد",
    "opportunities.loadError": "فرصت‌ها بارگیری نشدند.",
    "opportunities.loadErrorTitle": "بارگیری فرصت‌ها امکان‌پذیر نبود",
    "opportunities.loadErrorBody": "لطفاً لحظاتی بعد دوباره تلاش کنید.",
    "opportunities.postedBy": "ثبت‌شده توسط {name}",
    "opportunities.personal": "فرصت شخصی",
    "opportunities.deadline": "مهلت {date}",
    "opportunities.deadlineLabel": "مهلت",
    "opportunities.emptyFiltered": "هیچ فرصتی با این فیلترها مطابقت ندارد",
    "opportunities.empty": "هنوز فرصتی ثبت نشده است",
    "opportunities.emptyFilteredBody": "فیلترها را تنظیم یا پاک کنید.",
    "opportunities.emptyBody": "فرصت‌های منتشرشده در اینجا نمایش داده می‌شوند.",

    "opportunityType.job": "شغل",
    "opportunityType.volunteer": "داوطلبی",
    "opportunityType.scholarship": "بورس تحصیلی",
    "opportunityType.mentorship": "راهنمایی",
    "opportunityType.investment": "سرمایه‌گذاری",
    "opportunityType.housing": "مسکن",
    "opportunityType.event": "رویداد",
    "opportunityType.education": "آموزش",

    "events.title": "رویدادها",
    "events.description": "رویدادهای جامعه، کارگاه‌ها، کنفرانس‌ها و گردهمایی‌ها.",
    "events.my": "رویدادهای من",
    "events.create": "ایجاد رویداد",
    "events.search": "جست‌وجوی رویدادها",
    "events.searchPlaceholder": "جست‌وجو بر اساس عنوان رویداد",
    "events.countOne": "{count} رویداد پیدا شد",
    "events.countMany": "{count} رویداد پیدا شد",
    "events.loadError": "رویدادها بارگیری نشدند.",
    "events.loadErrorBody": "بارگیری رویدادها امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "events.list": "فهرست",
    "events.calendar": "تقویم",
    "events.previous": "قبلی",
    "events.next": "بعدی",
    "events.monthEmpty": "هیچ رویدادی در {month} مطابقت ندارد",
    "events.monthEmptyBody": "ماه دیگری را انتخاب کنید یا یک رویداد جامعه ایجاد کنید.",
    "events.hostedBy": "میزبانی {name}",
    "events.communityEvent": "رویداد جامعه",
    "events.emptyFiltered": "هیچ رویدادی مطابقت ندارد",
    "events.empty": "هنوز رویدادی وجود ندارد",
    "events.emptyFilteredBody": "فیلترها را تغییر دهید یا پاک کنید.",
    "events.emptyBody": "رویدادهای آینده جامعه در اینجا نمایش داده می‌شوند.",

    "businesses.title": "کشف کسب‌وکارها",
    "businesses.description":
      "از کسب‌وکارها، خدمات و کارآفرینان افغان حمایت کنید.",
    "businesses.create": "ایجاد کسب‌وکار",
    "businesses.search": "جست‌وجوی کسب‌وکارها",
    "businesses.searchPlaceholder": "نام کسب‌وکار",
    "businesses.category": "دسته",
    "businesses.anyCategory": "هر دسته",
    "businesses.countOne": "{count} کسب‌وکار پیدا شد",
    "businesses.countMany": "{count} کسب‌وکار پیدا شد",
    "businesses.loadError": "کسب‌وکارها بارگیری نشدند.",
    "businesses.loadErrorBody":
      "بارگیری کسب‌وکارها امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "businesses.emptyFiltered": "هیچ کسب‌وکاری با این فیلترها مطابقت ندارد",
    "businesses.empty": "هنوز کسب‌وکاری وجود ندارد",
    "businesses.emptyFilteredBody": "فیلترها را تنظیم یا پاک کنید.",
    "businesses.emptyBody":
      "کسب‌وکارهای جامعه پس از افزوده‌شدن در اینجا نمایش داده می‌شوند.",
    "businesses.add": "افزودن کسب‌وکار",

    "organizations.title": "کشف سازمان‌ها",
    "organizations.description":
      "سازمان‌های غیرانتفاعی، انجمن‌ها و ابتکارات جامعه به رهبری افغان‌ها را کاوش کنید.",
    "organizations.add": "افزودن سازمان",
    "organizations.search": "جست‌وجوی سازمان‌ها",
    "organizations.searchPlaceholder": "نام سازمان",
    "organizations.anyType": "هر نوع",
    "organizations.countOne": "{count} سازمان پیدا شد",
    "organizations.countMany": "{count} سازمان پیدا شد",
    "organizations.loadError": "سازمان‌ها بارگیری نشدند.",
    "organizations.loadErrorBody":
      "بارگیری سازمان‌ها امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "organizations.emptyFiltered": "هیچ سازمانی با این فیلترها مطابقت ندارد",
    "organizations.empty": "هنوز سازمانی وجود ندارد",
    "organizations.emptyFilteredBody":
      "فیلترها را تنظیم یا پاک کنید.",
    "organizations.emptyBody":
      "سازمان‌های جامعه پس از افزوده‌شدن در اینجا نمایش داده می‌شوند.",
    "organizations.emptyAction": "افزودن سازمان",

    "search.title": "جست‌وجو با هدف.",
    "search.description":
      "انتخاب کنید که چه کاری می‌خواهید انجام دهید، سپس مرور کنید یا یک کلیدواژه بیفزایید. افغان هاب تنها از نشانه‌های آشکار و عمومی برای اولویت‌بندی افراد و آگهی‌های مرتبط استفاده می‌کند.",
    "search.intentLabel": "به دنبال چه هستید؟",
    "search.anyIntent": "هر چیزی در جامعه",
    "search.fieldLabel": "جست‌وجو در افغان هاب",
    "search.placeholder": "نام، مهارت، سازمان، خدمت، فرصت…",
    "search.placeholderIntent": "کلیدواژه اختیاری…",
    "search.submit": "جست‌وجو",
    "search.browse": "مرور",
    "search.minChars": "برای جست‌وجو دست‌کم دو نویسه وارد کنید.",
    "search.error": "جست‌وجوی شما کامل نشد. لطفاً دوباره تلاش کنید.",
    "search.countOne": "{count} نتیجه",
    "search.countMany": "{count} نتیجه",
    "search.forQuery": "برای «{query}»",
    "search.browsing": "مرور",
    "search.prioritizedFor": "اولویت‌یافته برای",
    "search.emptyTitle": "نتیجه‌ای یافت نشد",
    "search.emptyBody":
      "نام، مکان، مهارت، سازمان، کسب‌وکار، فرصت یا رویداد دیگری را امتحان کنید.",
    "search.emptyHint":
      "برای گسترش یا محدودکردن جست‌وجو، یک کلیدواژه اختیاری در بالا بیفزایید.",
    "search.startEyebrow": "با یک هدف آغاز کنید",
    "search.startTitle": "بگویید چه کاری می‌خواهید انجام دهید.",
    "search.startBody":
      "لازم نیست بدانید چیزی در کجای افغان هاب قرار دارد. یک مسیر را انتخاب کنید تا انواع نتایج را برای شما متمرکز کنیم.",
    "search.exploreEyebrow": "کاوش",
    "search.anythingTitle": "جست‌وجوی هر چیزی",
    "search.anythingBody":
      "از کادر جست‌وجوی بالا برای یافتن فرد، مهارت، خدمت، مکان، سازمان، فرصت یا رویداد استفاده کنید.",
    "search.typeMember": "عضو",
    "search.memberFallback": "عضو افغان هاب",

    "search.empty.find_work":
      "هنوز هیچ شغل کنونی یا کسب‌وکار آشکارا در حال استخدامی با این نما مطابقت ندارد.",
    "search.empty.hire_talent":
      "هنوز هیچ نمایه عمومی واجد شرایطی در این نما موجود نیست.",
    "search.empty.find_mentor":
      "هنوز هیچ عضو عمومی واجد شرایطی برای ارائه راهنمایی در این نما اعلام آمادگی نکرده است.",
    "search.empty.offer_mentorship":
      "هنوز هیچ عضو عمومی واجد شرایطی اعلام نکرده است که به دنبال راهنماست.",
    "search.empty.volunteer":
      "هنوز هیچ نقش داوطلبانه کنونی یا سازمانی که آشکارا داوطلب می‌پذیرد موجود نیست.",
    "search.empty.find_services":
      "هنوز هیچ کسب‌وکار منتشرشده‌ای در این نما موجود نیست.",
    "search.empty.join_community":
      "هنوز هیچ سازمان جامعه منتشرشده یا رویداد کنونی در این نما موجود نیست.",

    "intent.find_work": "یافتن کار",
    "intent.hire_talent": "یافتن استعداد",
    "intent.find_mentor": "یافتن راهنما",
    "intent.offer_mentorship": "ارائه راهنمایی",
    "intent.volunteer": "داوطلبی",
    "intent.find_services": "یافتن خدمات",
    "intent.join_community": "پیوستن به فعالیت جامعه",

    "goal.find_work.label": "کار",
    "goal.find_work.title": "یافتن کار",
    "goal.find_work.description":
      "شغل‌ها و کسب‌وکارهای جامعه که در حال حاضر استخدام می‌کنند.",
    "goal.find_services.label": "خدمات",
    "goal.find_services.title": "یافتن خدمات و کسب‌وکارها",
    "goal.find_services.description":
      "مرور کسب‌وکارهای جامعه و خدمات عملی برای نیازهای روزمره و حرفه‌ای.",
    "goal.connect.label": "ارتباط",
    "goal.connect.title": "دیدار با افراد در حوزه من",
    "goal.connect.description":
      "اعضایی با مهارت‌ها، تجربه و پیوندهای جامعه مرتبط را پیدا کنید.",
    "goal.join_community.label": "تعلق",
    "goal.join_community.title": "پیوستن به جامعه",
    "goal.join_community.description":
      "سازمان‌ها، رویدادها و مکان‌هایی برای مشارکت را کاوش کنید.",
    "goal.volunteer.label": "مشارکت",
    "goal.volunteer.title": "داوطلبی و کمک",
    "goal.volunteer.description":
      "نقش‌های جامعه را بیابید که در آن‌ها وقت و تجربه شما ارزش دارد.",

    "reason.matchesWork": "مطابق با هدف کاری شما",
    "reason.currentlyHiring": "در حال استخدام",
    "reason.memberDiscovery": "کشف اعضا برای هدف استخدام شما",
    "reason.openToMentoring": "آماده راهنمایی",
    "reason.lookingForMentor": "در جست‌وجوی راهنما",
    "reason.openToCollaboration": "آماده همکاری",
    "reason.matchesFunding": "مطابق با هدف تأمین مالی شما",
    "reason.volunteerOpportunity": "فرصت داوطلبانه",
    "reason.acceptingVolunteers": "پذیرش داوطلب",
    "reason.businessServices": "کسب‌وکار مرتبط با هدف خدمات شما",
    "reason.communityOrganization": "سازمان جامعه",
    "reason.upcomingActivity": "فعالیت آینده جامعه",

    "detail.backToOpportunities": "بازگشت به فرصت‌ها",
    "detail.backToEvents": "بازگشت به رویدادها",
    "detail.backToBusinesses": "بازگشت به کسب‌وکارها",
    "detail.backToOrganizations": "بازگشت به سازمان‌ها",
    "detail.takeNextStep": "قدم بعدی را بردارید",

    "opportunityDetail.draft":
      "این فرصت در انتظار تأیید ناظر است و هنوز برای جامعه قابل مشاهده نیست.",
    "opportunityDetail.rejected":
      "این فرصت تأیید نشد. برای ارسال دوباره آن را ویرایش کنید.",
    "opportunityDetail.rejectedReason":
      "این فرصت تأیید نشد. دلیل: {reason} برای ارسال دوباره آن را ویرایش کنید.",
    "opportunityDetail.expired":
      "مهلت درخواست این فرصت گذشته است و دیگر فعال نیست.",
    "opportunityDetail.active": "فعال",
    "opportunityDetail.applyBy": "درخواست تا {date}",
    "opportunityDetail.closedOn": "پایان‌یافته در {date}",
    "opportunityDetail.save": "ذخیره",
    "opportunityDetail.saved": "ذخیره‌شده",
    "opportunityDetail.saving": "در حال ذخیره…",
    "opportunityDetail.removing": "در حال حذف…",
    "opportunityDetail.applyNow": "اکنون درخواست دهید",
    "opportunityDetail.applicationsClosed": "درخواست‌ها بسته شد",
    "opportunityDetail.contact": "تماس",
    "opportunityDetail.findSimilar": "یافتن فرصت‌های مشابه",
    "opportunityDetail.findPeople": "یافتن افراد در این حوزه",
    "opportunityDetail.related": "فرصت‌های مرتبط",
    "opportunityDetail.relatedBody":
      "فرصت‌های فعال مشابه بر اساس نوع، موضوع و مکان.",
    "opportunityDetail.about": "درباره این فرصت",

    "eventDetail.about": "درباره رویداد",
    "eventDetail.onlineEvent": "رویداد آنلاین",
    "eventDetail.inPersonEvent": "رویداد حضوری",
    "eventDetail.upcoming": "آینده",
    "eventDetail.attendees": "شرکت‌کنندگان",
    "eventDetail.starts": "آغاز",
    "eventDetail.where": "کجا",
    "eventDetail.ends": "پایان:",
    "eventDetail.online": "آنلاین:",
    "eventDetail.joinEvent": "پیوستن به رویداد",
    "eventDetail.venue": "محل:",
    "eventDetail.address": "نشانی:",
    "eventDetail.location": "موقعیت:",
    "eventDetail.capacity": "ظرفیت:",
    "eventDetail.tba": "مکان بعداً اعلام می‌شود",
    "eventDetail.attendance": "حضور",
    "eventDetail.goingOne": "{count} نفر شرکت می‌کند",
    "eventDetail.goingMany": "{count} نفر شرکت می‌کنند",
    "eventDetail.spots": "{count} جای باقی‌مانده",
    "eventDetail.cancelRegistration": "لغو ثبت‌نام",
    "eventDetail.cancelling": "در حال لغو ثبت‌نام…",
    "eventDetail.register": "ثبت‌نام در این رویداد",
    "eventDetail.registering": "در حال ثبت‌نام…",
    "eventDetail.full": "ظرفیت تکمیل است",
    "eventDetail.hosting": "شما میزبان این رویداد هستید.",
    "eventDetail.registrationClosed": "ثبت‌نام بسته شد",
    "eventDetail.addToCalendar": "افزودن به تقویم",
    "eventDetail.googleCalendar": "Google Calendar",
    "eventDetail.downloadIcs": "دانلود فایل تقویم",
    "eventDetail.related": "رویدادهای مرتبط",
    "eventDetail.relatedBody":
      "رویدادهای آینده با موضوع یا مکان مشابه.",
    "eventDetail.rsvpJoined": "شما در این رویداد ثبت‌نام کرده‌اید.",
    "eventDetail.rsvpCancelled": "ثبت‌نام شما لغو شد.",
    "eventDetail.rsvpFull": "ظرفیت این رویداد تکمیل شده است.",
    "eventDetail.rsvpStarted":
      "ثبت‌نام بسته شده است زیرا رویداد آغاز شده.",
    "eventDetail.rsvpError":
      "ثبت‌نام شما به‌روزرسانی نشد. لطفاً دوباره تلاش کنید.",
    "eventDetail.draft":
      "این رویداد در انتظار تأیید ناظر است و هنوز برای جامعه قابل مشاهده نیست.",
    "eventDetail.rejected":
      "این رویداد تأیید نشد. برای ارسال دوباره آن را ویرایش کنید.",
    "eventDetail.rejectedReason":
      "این رویداد تأیید نشد. دلیل: {reason} برای ارسال دوباره آن را ویرایش کنید.",
    "eventDetail.findSimilar": "یافتن رویدادهای مشابه",
    "eventDetail.findOrganizations": "یافتن سازمان‌های مرتبط",

    "businessDetail.draft":
      "این کسب‌وکار در انتظار تأیید ناظر است و هنوز برای جامعه قابل مشاهده نیست.",
    "businessDetail.rejected":
      "این کسب‌وکار تأیید نشد. برای ارسال دوباره آن را ویرایش کنید.",
    "businessDetail.rejectedReason":
      "این کسب‌وکار تأیید نشد. دلیل: {reason} برای ارسال دوباره آن را ویرایش کنید.",
    "businessDetail.hiringBadge": "در حال استخدام",
    "businessDetail.edit": "ویرایش کسب‌وکار",
    "businessDetail.verify": "تأیید کسب‌وکار",
    "businessDetail.removeVerification": "حذف تأیید",
    "businessDetail.updating": "در حال به‌روزرسانی…",
    "businessDetail.about": "درباره کسب‌وکار",
    "businessDetail.offerEyebrow": "آنچه ارائه می‌دهند",
    "businessDetail.services": "خدمات",
    "businessDetail.connect": "ارتباط",
    "businessDetail.visitWebsite": "بازدید از وب‌سایت",

    "organizationDetail.draft":
      "این سازمان در انتظار تأیید ناظر است و هنوز برای جامعه قابل مشاهده نیست.",
    "organizationDetail.rejected":
      "این سازمان تأیید نشد. برای ارسال دوباره آن را ویرایش کنید.",
    "organizationDetail.rejectedReason":
      "این سازمان تأیید نشد. دلیل: {reason} برای ارسال دوباره آن را ویرایش کنید.",
    "organizationDetail.volunteersWelcome": "داوطلبان خوش آمدید",
    "organizationDetail.edit": "ویرایش سازمان",
    "organizationDetail.verify": "تأیید سازمان",
    "organizationDetail.removeVerification": "حذف تأیید",
    "organizationDetail.about": "درباره سازمان",
    "organizationDetail.why": "چرا وجود دارند",
    "organizationDetail.mission": "مأموریت",
    "organizationDetail.whatTheyDo": "چه کاری انجام می‌دهند",
    "organizationDetail.programs": "برنامه‌ها",
    "organizationDetail.volunteerBody":
      "برای پرسیدن درباره نحوه مشارکت با آنان تماس بگیرید.",
    "organizationDetail.connect": "ارتباط",
    "organizationDetail.visitWebsite": "بازدید از وب‌سایت",

    "attendees.back": "بازگشت به رویداد",
    "attendees.title": "شرکت‌کنندگان رویداد",
    "attendees.edit": "ویرایش رویداد",
    "attendees.registered": "ثبت‌نام‌شده",
    "attendees.capacity": "ظرفیت",
    "attendees.remaining": "باقی‌مانده",
    "attendees.unlimited": "نامحدود",
    "attendees.registeredHeading": "اعضای ثبت‌نام‌شده",
    "attendees.privacy":
      "فقط جزئیات عمومی پروفایل در اینجا نمایش داده می‌شود. اعضای خصوصی ناشناس می‌مانند.",
    "attendees.privateMember": "عضو خصوصی",
    "attendees.registeredAt": "ثبت‌نام در {date}",
    "attendees.noRegistrations": "هنوز ثبت‌نامی وجود ندارد",
    "attendees.noRegistrationsBody":
      "اعضایی که در این رویداد ثبت‌نام کنند در اینجا نمایش داده می‌شوند.",
    "attendees.viewProfile": "مشاهده پروفایل",

    "myEvents.title": "رویدادهای من",
    "myEvents.description":
      "رویدادهایی را که در آن‌ها ثبت‌نام کرده‌اید و رویدادهایی را که میزبانی می‌کنید پیگیری کنید.",
    "myEvents.browse": "مرور رویدادها",
    "myEvents.registered": "ثبت‌نام‌شده",
    "myEvents.registeredBody": "رویدادهای آینده‌ای که حضور خود را تأیید کرده‌اید.",
    "myEvents.noUpcoming": "ثبت‌نام آینده‌ای وجود ندارد",
    "myEvents.noUpcomingBody": "در یک رویداد ثبت‌نام کنید تا در اینجا نمایش داده شود.",
    "myEvents.past": "ثبت‌نام‌های گذشته ({count})",
    "myEvents.hosting": "میزبانی",
    "myEvents.hostingBody":
      "رویدادهایی که ایجاد کرده‌اید، از جمله موارد در حال بررسی.",
    "myEvents.noHosting": "هنوز میزبان هیچ رویدادی نیستید",
    "myEvents.noHostingBody": "یک رویداد ایجاد کنید تا برای بررسی ارسال شود.",
    "myEvents.statusDraft": "در انتظار بررسی",
    "myEvents.statusPublished": "منتشرشده",
    "myEvents.statusClosed": "بسته‌شده",
    "myEvents.statusRejected": "تأییدنشده",

    "moderation.entityOpportunity": "فرصت",
    "moderation.entityEvent": "رویداد",
    "moderation.entityBusiness": "کسب‌وکار",
    "moderation.entityOrganization": "سازمان",
    "moderation.title": "مدیریت محتوا",
    "moderation.description":
      "فرصت‌ها، رویدادها، کسب‌وکارها و سازمان‌ها را پیش از نمایش برای جامعه بررسی کنید.",
    "moderation.manageTeam": "مدیریت تیم نظارت",
    "moderation.successApproved": "این ارسال تأیید شد.",
    "moderation.successRejected": "این ارسال رد شد.",
    "moderation.successGeneric": "نتیجه بررسی ثبت شد.",
    "moderation.pendingTab": "در انتظار بررسی",
    "moderation.historyTab": "تصمیم‌های اخیر",
    "moderation.pendingHeading": "در انتظار بررسی",
    "moderation.nothingPending": "هیچ موردی در انتظار بررسی نیست",
    "moderation.nothingPendingBody":
      "ارسال‌های جدید هنگام نیاز به تأیید ناظر در اینجا نمایش داده می‌شوند.",
    "moderation.historyHeading": "تصمیم‌های اخیر",
    "moderation.historyBody":
      "آخرین ارسال‌های تأییدشده و ردشده در همه محتوای تحت نظارت.",
    "moderation.noHistory": "هنوز سابقه نظارتی وجود ندارد",
    "moderation.noHistoryBody":
      "ارسال‌های تأییدشده و ردشده پس از نخستین تصمیم بررسی در اینجا نمایش داده می‌شوند.",
    "moderation.approved": "تأییدشده",
    "moderation.rejected": "ردشده",
    "moderation.reason": "دلیل: {reason}",
    "moderation.submitted": "ارسال‌شده در {date}",
    "moderation.starts": "آغاز {date}",
    "moderation.approve": "تأیید",
    "moderation.approving": "در حال تأیید…",
    "moderation.rejectSummary": "رد با دلیل",
    "moderation.rejectLabel": "توضیح دهید چه چیزی باید اصلاح شود",
    "moderation.reject": "رد ارسال",
    "moderation.rejecting": "در حال رد…",
    "moderation.errorInvalidRequest":
      "درخواست نظارت ناقص بود. با بازخوانی صفحه و تلاش دوباره معمولاً رفع می‌شود.",
    "moderation.errorInvalidReason":
      "رد کردن نیازمند دلیلی بین ۱۰ تا ۱۰۰۰ نویسه است.",
    "moderation.errorApplyFailed":
      "اعمال این تصمیم نظارتی امکان‌پذیر نبود. لطفاً صفحه را بازخوانی کنید و دوباره تلاش کنید.",

    "team.back": "بازگشت به مدیریت",
    "team.title": "تیم نظارت",
    "team.description":
      "اعضای مورد اعتماد را به ناظر یا مدیر ارتقا دهید یا به نقش عضو عادی بازگردانید.",
    "team.adminOnly": "فقط مدیر",
    "team.roleUpdated": "نقش عضو به‌روزرسانی شد.",
    "team.loadError": "بارگیری اعضا امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "team.empty": "هیچ حساب عضوی برای مدیریت وجود ندارد",
    "team.emptyBody":
      "حساب‌های اعضا زمانی که در فهرست مدیر موجود باشند در اینجا نمایش داده می‌شوند.",
    "team.onboardingIncomplete": "تکمیل پروفایل ناتمام",
    "team.ownRole": "نقش خودتان در اینجا قابل تغییر نیست.",
    "team.role": "نقش",
    "team.roleMember": "عضو",
    "team.roleModerator": "ناظر",
    "team.roleAdmin": "مدیر",
    "team.saveRole": "ذخیره نقش",
    "team.savingRole": "در حال ذخیره نقش…",
    "team.memberFallback": "عضو افغان هاب",
    "team.errorInvalidRole": "درخواست نقش معتبر نبود.",
    "team.errorUpdateFailed":
      "به‌روزرسانی نقش این عضو امکان‌پذیر نبود. لطفاً صفحه را بازخوانی کنید و دوباره تلاش کنید.",

    "verification.label": "آگهی تأییدشده",
    "verification.explanation":
      "مدیران افغان هاب این آگهی را تأییدشده علامت‌گذاری کرده‌اند. تأیید به معنای توصیه یا تضمین نیست.",
    "verification.meaning": "معنای تأیید:",
    "verification.aria": "آگهی تأییدشده. {explanation}",

    "member.back": "بازگشت به شبکه",
    "member.fallbackName": "عضو افغان هاب",
    "member.profile": "پروفایل",
    "member.about": "درباره",
    "member.bioEmpty": "این عضو هنوز شرح‌حالی ثبت نکرده است.",
    "member.expertise": "تخصص",
    "member.skills": "مهارت‌ها",
    "member.skillsEmpty": "هنوز مهارتی ثبت نشده است.",
    "member.mentorship": "راهنمایی حرفه‌ای",
    "member.openToMentoring": "آماده راهنمایی دیگران",
    "member.lookingForMentor": "در جست‌وجوی راهنما",
    "member.mentorshipNote":
      "این موارد انتخاب خود عضو هستند و به معنای تأیید صلاحیت یا توصیه افغان هاب نیستند.",
    "member.languages": "زبان‌ها",
    "member.languagesEmpty": "هنوز زبانی ثبت نشده است.",
    "member.links": "پیوندها",
    "member.website": "وب‌سایت",
    "member.linkedin": "لینکدین",
    "member.conversationError":
      "آغاز این گفتگو امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",

    "opportunityAction.errorExpired":
      "این فرصت منقضی شده است و دیگر قابل ذخیره نیست.",
    "opportunityAction.errorCannotDelete":
      "فقط فرصت‌هایی را می‌توانید حذف کنید که خودتان ایجاد کرده‌اید.",
    "opportunityAction.errorDeleteFailed":
      "حذف این فرصت امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "opportunityAction.errorSaveFailed":
      "به‌روزرسانی فرصت‌های ذخیره‌شده امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "opportunityAction.errorGeneric":
      "این اقدام انجام نشد. لطفاً صفحه را بازخوانی کنید و دوباره تلاش کنید.",

    "action.errorGeneric":
      "این اقدام انجام نشد. لطفاً صفحه را بازخوانی کنید و دوباره تلاش کنید.",
    "verificationAction.errorUpdateFailed":
      "به‌روزرسانی وضعیت تأیید امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "eventAction.errorCannotDelete":
      "فقط رویدادهایی را می‌توانید حذف کنید که خودتان ایجاد کرده‌اید.",
    "eventAction.errorDeleteFailed":
      "حذف این رویداد امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",

    "delete.opportunityConfirm":
      "آیا مطمئن هستید که می‌خواهید این فرصت را حذف کنید؟ این عمل قابل بازگشت نیست.",
    "delete.eventConfirm":
      "آیا مطمئن هستید که می‌خواهید این رویداد را حذف کنید؟ این عمل قابل بازگشت نیست.",
    "delete.action": "حذف",
    "delete.deleting": "در حال حذف…",

    "notFound.eyebrow": "۴۰۴ · صفحه پیدا نشد",
    "notFound.title": "این صفحه در دسترس نیست.",
    "notFound.body":
      "ممکن است این پیوند قدیمی شده باشد، صفحه جابه‌جا شده باشد یا شما به آن دسترسی نداشته باشید. می‌توانید به صفحه اصلی بروید یا کاوش در افغان هاب را ادامه دهید.",
    "notFound.home": "رفتن به صفحه اصلی",
    "notFound.explore": "کاوش در جامعه",
    "notFound.signIn": "ورود",
    "notFound.businessTitle": "کسب‌وکار پیدا نشد",
    "notFound.businessBody":
      "این کسب‌وکار وجود ندارد یا به‌صورت عمومی در دسترس نیست.",
    "notFound.viewBusinesses": "مشاهده کسب‌وکارها",
    "notFound.organizationTitle": "سازمان پیدا نشد",
    "notFound.organizationBody":
      "این سازمان وجود ندارد یا به‌صورت عمومی در دسترس نیست.",
    "notFound.viewOrganizations": "مشاهده سازمان‌ها",
    "notFound.memberTitle": "عضو پیدا نشد",
    "notFound.memberBody":
      "ممکن است این پروفایل وجود نداشته باشد، عمومی نباشد یا مراحل تکمیل حساب را کامل نکرده باشد.",
    "notFound.returnToNetwork": "بازگشت به شبکه",
    "notFound.listingTitle": "این آگهی در دسترس نیست.",
    "notFound.listingBody":
      "ممکن است حذف شده باشد، منتشر نشده باشد یا دیگر برای عموم در دسترس نباشد.",
    "notFound.exploreListings": "کاوش در آگهی‌های جامعه",

    "recovery.eyebrow": "صفحه در دسترس نیست",
    "recovery.title": "نتوانستیم این صفحه را بارگیری کنیم.",
    "recovery.body":
      "چیزی اشتباه پیش رفت. می‌توانید این صفحه را دوباره امتحان کنید یا به افغان هاب بازگردید و از آنجا ادامه دهید.",
    "recovery.retry": "تلاش دوباره",
    "recovery.retrying": "در حال تلاش دوباره…",
    "recovery.home": "رفتن به خانه",
    "recovery.privacyNote":
      "برای حفظ حریم خصوصی، افغان هاب جزئیات خطاهای داخلی را در این صفحه نشان نمی‌دهد.",
    "recovery.documentTitle": "صفحه در دسترس نیست | افغان هاب",
  },
  ps: {
    "common.community": "ټولنه",
    "common.location": "ځای",
    "common.email": "برېښنالیک",
    "common.phone": "تلیفون",
    "common.city": "ښار",
    "common.anyCity": "هر ښار",
    "common.type": "ډول",
    "common.allTypes": "ټول ډولونه",
    "common.format": "حالت",
    "common.allFormats": "ټول حالتونه",
    "common.remote": "له لرې",
    "common.inPerson": "حضوري",
    "common.online": "آنلاین",
    "common.apply": "تطبیق",
    "common.clear": "پاکول",
    "common.clearFilters": "فلټرونه پاک کړئ",
    "common.verifiedListings": "تایید شوي لیستونه",
    "common.hiringNow": "اوس کارکوونکي ګماري",
    "common.volunteers": "رضاکاران",
    "common.acceptingVolunteers": "رضاکاران مني",
    "common.filtersShared":
      "فلټرونه په URL کې ښکاري، نو دا کتنه شریکولای شئ.",
    "common.edit": "سمون",
    "common.viewAll": "ټول کتل",
    "common.keepExploring": "پلټنې ته دوام",
    "common.hostedBy": "کوربه",

    "opportunities.title": "فرصتونه",
    "opportunities.description":
      "دندې، رضاکارانه کار، زده‌کړیز بورسونه، لارښوونه او د ټولنې فرصتونه ومومئ.",
    "opportunities.post": "فرصت خپور کړئ",
    "opportunities.search": "د فرصتونو لټون",
    "opportunities.searchPlaceholder": "د سرلیک له مخې لټون",
    "opportunities.countOne": "{count} فرصت وموندل شو",
    "opportunities.countMany": "{count} فرصتونه وموندل شول",
    "opportunities.loadError": "فرصتونه بار نه شول.",
    "opportunities.loadErrorTitle": "فرصتونه ونه شول بارول",
    "opportunities.loadErrorBody": "مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
    "opportunities.postedBy": "د {name} له خوا خپور شوی",
    "opportunities.personal": "شخصي فرصت",
    "opportunities.deadline": "پای نېټه {date}",
    "opportunities.deadlineLabel": "پای نېټه",
    "opportunities.emptyFiltered": "هیڅ فرصت د دې فلټرونو سره سمون نه لري",
    "opportunities.empty": "تراوسه کوم فرصت نشته",
    "opportunities.emptyFilteredBody": "فلټرونه سم یا پاک کړئ.",
    "opportunities.emptyBody": "خپاره شوي فرصتونه به دلته ښکاره شي.",

    "opportunityType.job": "دنده",
    "opportunityType.volunteer": "رضاکارانه",
    "opportunityType.scholarship": "زده‌کړیزه بورس",
    "opportunityType.mentorship": "لارښوونه",
    "opportunityType.investment": "پانګونه",
    "opportunityType.housing": "کور",
    "opportunityType.event": "پېښه",
    "opportunityType.education": "زده‌کړه",

    "events.title": "پېښې",
    "events.description":
      "د ټولنې پېښې، ورکشاپونه، کنفرانسونه او غونډې.",
    "events.my": "زما پېښې",
    "events.create": "پېښه جوړه کړئ",
    "events.search": "د پېښو لټون",
    "events.searchPlaceholder": "د پېښې د سرلیک له مخې لټون",
    "events.countOne": "{count} پېښه وموندل شوه",
    "events.countMany": "{count} پېښې وموندل شوې",
    "events.loadError": "پېښې بار نه شوې.",
    "events.loadErrorBody": "پېښې ونه شوې بارول. مهرباني وکړئ بیا هڅه وکړئ.",
    "events.list": "لیست",
    "events.calendar": "کالنډر",
    "events.previous": "مخکینی",
    "events.next": "بل",
    "events.monthEmpty": "په {month} کې هېڅ پېښه سمون نه لري",
    "events.monthEmptyBody": "بله میاشت وټاکئ یا د ټولنې پېښه جوړه کړئ.",
    "events.hostedBy": "د {name} کوربه‌توب",
    "events.communityEvent": "ټولنیزه پېښه",
    "events.emptyFiltered": "هېڅ پېښه سمون نه لري",
    "events.empty": "تراوسه کومه پېښه نشته",
    "events.emptyFilteredBody": "فلټرونه بدل یا پاک کړئ.",
    "events.emptyBody": "د ټولنې راتلونکې پېښې به دلته ښکاره شي.",

    "businesses.title": "سوداګرۍ وپلټئ",
    "businesses.description":
      "د افغانانو سوداګرۍ، خدمتونه او کارپوهان ملاتړ وکړئ.",
    "businesses.create": "سوداګري جوړه کړئ",
    "businesses.search": "د سوداګرو لټون",
    "businesses.searchPlaceholder": "د سوداګرۍ نوم",
    "businesses.category": "ډله",
    "businesses.anyCategory": "هره ډله",
    "businesses.countOne": "{count} سوداګري وموندل شوه",
    "businesses.countMany": "{count} سوداګرۍ وموندل شوې",
    "businesses.loadError": "سوداګرۍ بار نه شوې.",
    "businesses.loadErrorBody":
      "سوداګرۍ ونه شوې بارول. مهرباني وکړئ بیا هڅه وکړئ.",
    "businesses.emptyFiltered": "هېڅ سوداګري د دې فلټرونو سره سمون نه لري",
    "businesses.empty": "تراوسه کومه سوداګري نشته",
    "businesses.emptyFilteredBody": "فلټرونه سم یا پاک کړئ.",
    "businesses.emptyBody":
      "ټولنیزې سوداګرۍ به د ورزیاتېدو وروسته دلته ښکاره شي.",
    "businesses.add": "سوداګري ورزیات کړئ",

    "organizations.title": "سازمانونه وپلټئ",
    "organizations.description":
      "د افغانانو مشري شوي غیرانتفاعي سازمانونه، ټولنې او ټولنیز نوښتونه وپلټئ.",
    "organizations.add": "سازمان ورزیات کړئ",
    "organizations.search": "د سازمانونو لټون",
    "organizations.searchPlaceholder": "د سازمان نوم",
    "organizations.anyType": "هر ډول",
    "organizations.countOne": "{count} سازمان وموندل شو",
    "organizations.countMany": "{count} سازمانونه وموندل شول",
    "organizations.loadError": "سازمانونه بار نه شول.",
    "organizations.loadErrorBody":
      "سازمانونه ونه شول بارول. مهرباني وکړئ بیا هڅه وکړئ.",
    "organizations.emptyFiltered": "هېڅ سازمان د دې فلټرونو سره سمون نه لري",
    "organizations.empty": "تراوسه کوم سازمان نشته",
    "organizations.emptyFilteredBody":
      "فلټرونه سم یا پاک کړئ.",
    "organizations.emptyBody":
      "د ټولنې سازمانونه به د ورزیاتېدو وروسته دلته ښکاره شي.",
    "organizations.emptyAction": "سازمان ورزیات کړئ",

    "search.title": "په هدف سره لټون.",
    "search.description":
      "وټاکئ چې غواړئ څه وکړئ، بیا وګورئ یا یوه کلیمه ورزیات کړئ. افغان هب یوازې ښکاره او عامه نښې کاروي څو اړوند کسان او لیستونه لومړیتوب ومومي.",
    "search.intentLabel": "تاسو د څه په لټون کې یاست؟",
    "search.anyIntent": "هر څه چې په ټولنه کې دي",
    "search.fieldLabel": "په افغان هب کې لټون",
    "search.placeholder": "نوم، مهارت، سازمان، خدمت، فرصت…",
    "search.placeholderIntent": "اختیاري کلیمه…",
    "search.submit": "لټون",
    "search.browse": "کتل",
    "search.minChars": "د لټون لپاره لږ تر لږه دوه توري ولیکئ.",
    "search.error": "ستاسو لټون بشپړ نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "search.countOne": "{count} پایله",
    "search.countMany": "{count} پایلې",
    "search.forQuery": "د «{query}» لپاره",
    "search.browsing": "کتل",
    "search.prioritizedFor": "لومړیتوب ورکړل شوی",
    "search.emptyTitle": "هېڅ پایله ونه موندل شوه",
    "search.emptyBody":
      "بل نوم، ځای، مهارت، سازمان، سوداګري، فرصت یا پېښه وآزمویئ.",
    "search.emptyHint":
      "د لټون پراخولو یا سمولو لپاره پورته یوه اختیاري کلیمه ورزیات کړئ.",
    "search.startEyebrow": "له یو هدف سره پیل وکړئ",
    "search.startTitle": "موږ ته ووایاست چې غواړئ څه وکړئ.",
    "search.startBody":
      "اړتیا نشته چې پوه شئ یو څه په افغان هب کې چېرې دي. یوه لار وټاکئ او موږ به هغه ډول پایلې په تمرکز کې راولو چې تاسو یې ګورئ.",
    "search.exploreEyebrow": "پلټنه",
    "search.anythingTitle": "هر څه ولټوئ",
    "search.anythingBody":
      "د یو کس، مهارت، خدمت، ځای، سازمان، فرصت یا پېښې لپاره پورتنی د لټون کادر وکاروئ.",
    "search.typeMember": "غړی",
    "search.memberFallback": "د افغان هب غړی",

    "search.empty.find_work":
      "تراوسه هېڅ اوسنۍ دنده یا په ښکاره توګه کارکوونکي ګمارونکې سوداګري دې کتنې سره سمون نه لري.",
    "search.empty.hire_talent":
      "تراوسه په دې کتنه کې هېڅ وړ عامه پروفایل نشته.",
    "search.empty.find_mentor":
      "تراوسه په دې کتنه کې هېڅ وړ عامه غړي د لارښوونې وړاندې کولو لپاره نه دي غوره شوي.",
    "search.empty.offer_mentorship":
      "تراوسه په دې کتنه کې هېڅ وړ عامه غړی نه دی ویلي چې لارښوونکي ته اړتیا لري.",
    "search.empty.volunteer":
      "تراوسه هېڅ اوسنی رضاکارانه رول یا په ښکاره توګه رضاکاران منونکی سازمان نشته.",
    "search.empty.find_services":
      "تراوسه په دې کتنه کې هېڅ خپره شوې سوداګري نشته.",
    "search.empty.join_community":
      "تراوسه په دې کتنه کې هېڅ خپور شوی ټولنیز سازمان یا اوسنۍ پېښه نشته.",

    "intent.find_work": "کار موندل",
    "intent.hire_talent": "استعداد موندل",
    "intent.find_mentor": "لارښوونکی موندل",
    "intent.offer_mentorship": "لارښوونه وړاندې کول",
    "intent.volunteer": "رضاکارانه کار",
    "intent.find_services": "خدمتونه موندل",
    "intent.join_community": "ټولنیز فعالیت ته ننوتل",

    "goal.find_work.label": "کار",
    "goal.find_work.title": "کار موندل",
    "goal.find_work.description":
      "هغه دندې او ټولنیزې سوداګرۍ چې اوس کارکوونکي ګماري.",
    "goal.find_services.label": "خدمتونه",
    "goal.find_services.title": "خدمتونه او سوداګرۍ موندل",
    "goal.find_services.description":
      "د ورځني او مسلکي اړتیاوو لپاره ټولنیزې سوداګرۍ او عملي خدمتونه وګورئ.",
    "goal.connect.label": "اړیکه",
    "goal.connect.title": "په خپله برخه کې خلک وپېژنئ",
    "goal.connect.description":
      "د اړوندو مهارتونو، تجربې او ټولنیزو اړیکو غړي ومومئ.",
    "goal.join_community.label": "تړاو",
    "goal.join_community.title": "ټولنې ته ننوتل",
    "goal.join_community.description":
      "سازمانونه، پېښې او د ګډون ځایونه وپلټئ.",
    "goal.volunteer.label": "مرسته",
    "goal.volunteer.title": "رضاکارانه کار او مرسته",
    "goal.volunteer.description":
      "هغه ټولنیز رولونه ومومئ چې ستاسو وخت او تجربه په کې ارزښت لري.",

    "reason.matchesWork": "ستاسو د کار هدف سره سمون لري",
    "reason.currentlyHiring": "اوس کارکوونکي ګماري",
    "reason.memberDiscovery": "ستاسو د ګمارنې هدف لپاره د غړو موندنه",
    "reason.openToMentoring": "د لارښوونې لپاره چمتو",
    "reason.lookingForMentor": "لارښوونکي ته اړتیا",
    "reason.openToCollaboration": "د همکارۍ لپاره چمتو",
    "reason.matchesFunding": "ستاسو د تمویل هدف سره سمون لري",
    "reason.volunteerOpportunity": "رضاکارانه فرصت",
    "reason.acceptingVolunteers": "رضاکاران مني",
    "reason.businessServices": "ستاسو د خدمتونو هدف سره اړوند سوداګري",
    "reason.communityOrganization": "ټولنیز سازمان",
    "reason.upcomingActivity": "راتلونکی ټولنیز فعالیت",

    "detail.backToOpportunities": "فرصتونو ته بېرته",
    "detail.backToEvents": "پېښو ته بېرته",
    "detail.backToBusinesses": "سوداګرو ته بېرته",
    "detail.backToOrganizations": "سازمانونو ته بېرته",
    "detail.takeNextStep": "بل ګام واخلئ",

    "opportunityDetail.draft":
      "دا فرصت د څارونکي تایید ته انتظار باسي او لا ټولنې ته نه ښکاري.",
    "opportunityDetail.rejected":
      "دا فرصت ونه منل شو. د بیا لېږلو لپاره یې سم کړئ.",
    "opportunityDetail.rejectedReason":
      "دا فرصت ونه منل شو. دلیل: {reason} د بیا لېږلو لپاره یې سم کړئ.",
    "opportunityDetail.expired":
      "د دې فرصت د غوښتنلیک پای نېټه تېره شوې او نور فعال نه دی.",
    "opportunityDetail.active": "فعال",
    "opportunityDetail.applyBy": "تر {date} پورې غوښتنلیک",
    "opportunityDetail.closedOn": "په {date} بند شو",
    "opportunityDetail.save": "خوندي کول",
    "opportunityDetail.saved": "خوندي شوی",
    "opportunityDetail.saving": "خوندي کېږي…",
    "opportunityDetail.removing": "لرې کېږي…",
    "opportunityDetail.applyNow": "اوس غوښتنلیک ورکړئ",
    "opportunityDetail.applicationsClosed": "غوښتنلیکونه بند شول",
    "opportunityDetail.contact": "اړیکه",
    "opportunityDetail.findSimilar": "ورته فرصتونه ومومئ",
    "opportunityDetail.findPeople": "په دې برخه کې خلک ومومئ",
    "opportunityDetail.related": "اړوند فرصتونه",
    "opportunityDetail.relatedBody":
      "د ډول، موضوع او ځای له مخې ورته فعال فرصتونه.",
    "opportunityDetail.about": "د دې فرصت په اړه",

    "eventDetail.about": "د پېښې په اړه",
    "eventDetail.onlineEvent": "آنلاین پېښه",
    "eventDetail.inPersonEvent": "حضوري پېښه",
    "eventDetail.upcoming": "راتلونکې",
    "eventDetail.attendees": "ګډون کوونکي",
    "eventDetail.starts": "پیل",
    "eventDetail.where": "چېرې",
    "eventDetail.ends": "پای:",
    "eventDetail.online": "آنلاین:",
    "eventDetail.joinEvent": "پېښې ته ګډون",
    "eventDetail.venue": "ځای:",
    "eventDetail.address": "پته:",
    "eventDetail.location": "ځای:",
    "eventDetail.capacity": "ظرفیت:",
    "eventDetail.tba": "ځای به وروسته اعلان شي",
    "eventDetail.attendance": "ګډون",
    "eventDetail.goingOne": "{count} کس ګډون کوي",
    "eventDetail.goingMany": "{count} کسان ګډون کوي",
    "eventDetail.spots": "{count} ځایونه پاتې دي",
    "eventDetail.cancelRegistration": "ثبت لغوه کړئ",
    "eventDetail.cancelling": "ثبت لغوه کېږي…",
    "eventDetail.register": "دې پېښې ته ثبت شئ",
    "eventDetail.registering": "ثبت کېږي…",
    "eventDetail.full": "ځای نه لري",
    "eventDetail.hosting": "تاسو د دې پېښې کوربه یاست.",
    "eventDetail.registrationClosed": "ثبت بند شو",
    "eventDetail.addToCalendar": "کالنډر ته ورزیاتول",
    "eventDetail.googleCalendar": "Google Calendar",
    "eventDetail.downloadIcs": "د کالنډر فایل ډاونلوډ کړئ",
    "eventDetail.related": "اړوندې پېښې",
    "eventDetail.relatedBody":
      "د ورته موضوع یا ځای راتلونکې پېښې.",
    "eventDetail.rsvpJoined": "تاسو دې پېښې ته ثبت شوي یاست.",
    "eventDetail.rsvpCancelled": "ستاسو ثبت لغوه شو.",
    "eventDetail.rsvpFull": "دې پېښې خپل ظرفیت ته رسېدلی.",
    "eventDetail.rsvpStarted":
      "ثبت بند شو ځکه پېښه پیل شوې.",
    "eventDetail.rsvpError":
      "ستاسو ثبت تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "eventDetail.draft":
      "دا پېښه د څارونکي تایید ته انتظار باسي او لا ټولنې ته نه ښکاري.",
    "eventDetail.rejected":
      "دا پېښه ونه منل شوه. د بیا لېږلو لپاره یې سمه کړئ.",
    "eventDetail.rejectedReason":
      "دا پېښه ونه منل شوه. دلیل: {reason} د بیا لېږلو لپاره یې سمه کړئ.",
    "eventDetail.findSimilar": "ورته پېښې ومومئ",
    "eventDetail.findOrganizations": "اړوند سازمانونه ومومئ",

    "businessDetail.draft":
      "دا سوداګري د څارونکي تایید ته انتظار باسي او لا ټولنې ته نه ښکاري.",
    "businessDetail.rejected":
      "دا سوداګري ونه منل شوه. د بیا لېږلو لپاره یې سمه کړئ.",
    "businessDetail.rejectedReason":
      "دا سوداګري ونه منل شوه. دلیل: {reason} د بیا لېږلو لپاره یې سمه کړئ.",
    "businessDetail.hiringBadge": "کارکوونکي ګماري",
    "businessDetail.edit": "سوداګري سمول",
    "businessDetail.verify": "سوداګري تایید کړئ",
    "businessDetail.removeVerification": "تایید لرې کړئ",
    "businessDetail.updating": "تازه کېږي…",
    "businessDetail.about": "د سوداګرۍ په اړه",
    "businessDetail.offerEyebrow": "هغه څه چې وړاندې کوي",
    "businessDetail.services": "خدمتونه",
    "businessDetail.connect": "اړیکه",
    "businessDetail.visitWebsite": "وېبپاڼې ته وګورئ",

    "organizationDetail.draft":
      "دا سازمان د څارونکي تایید ته انتظار باسي او لا ټولنې ته نه ښکاري.",
    "organizationDetail.rejected":
      "دا سازمان ونه منل شو. د بیا لېږلو لپاره یې سم کړئ.",
    "organizationDetail.rejectedReason":
      "دا سازمان ونه منل شو. دلیل: {reason} د بیا لېږلو لپاره یې سم کړئ.",
    "organizationDetail.volunteersWelcome": "رضاکاران ښه راغلاست",
    "organizationDetail.edit": "سازمان سمول",
    "organizationDetail.verify": "سازمان تایید کړئ",
    "organizationDetail.removeVerification": "تایید لرې کړئ",
    "organizationDetail.about": "د سازمان په اړه",
    "organizationDetail.why": "ولې شتون لري",
    "organizationDetail.mission": "مأموریت",
    "organizationDetail.whatTheyDo": "څه کوي",
    "organizationDetail.programs": "پروګرامونه",
    "organizationDetail.volunteerBody":
      "اړیکه ونیسئ او وپوښتئ چې څنګه مرسته کولای شئ.",
    "organizationDetail.connect": "اړیکه",
    "organizationDetail.visitWebsite": "وېبپاڼې ته وګورئ",

    "attendees.back": "پېښې ته بېرته",
    "attendees.title": "د پېښې ګډون کوونکي",
    "attendees.edit": "پېښه سمول",
    "attendees.registered": "ثبت شوي",
    "attendees.capacity": "ظرفیت",
    "attendees.remaining": "پاتې",
    "attendees.unlimited": "بې پایه",
    "attendees.registeredHeading": "ثبت شوي غړي",
    "attendees.privacy":
      "یوازې عامه پروفایل معلومات دلته ښودل کېږي. شخصي غړي نا پېژندل شوي پاتې کېږي.",
    "attendees.privateMember": "شخصي غړی",
    "attendees.registeredAt": "په {date} کې ثبت شوی",
    "attendees.noRegistrations": "تراوسه کوم ثبت نشته",
    "attendees.noRegistrationsBody":
      "هغه غړي چې دې پېښې ته ثبت شي به دلته ښکاره شي.",
    "attendees.viewProfile": "پروفایل وګورئ",

    "myEvents.title": "زما پېښې",
    "myEvents.description":
      "هغه پېښې چې تاسو په کې ثبت شوي او هغه چې تاسو یې کوربه یاست تعقیب کړئ.",
    "myEvents.browse": "پېښې وګورئ",
    "myEvents.registered": "ثبت شوي",
    "myEvents.registeredBody": "راتلونکې پېښې چې تاسو ګډون تایید کړی.",
    "myEvents.noUpcoming": "راتلونکی ثبت نشته",
    "myEvents.noUpcomingBody": "یوې پېښې ته ثبت شئ او دا به دلته ښکاره شي.",
    "myEvents.past": "پخواني ثبتونه ({count})",
    "myEvents.hosting": "کوربه توب",
    "myEvents.hostingBody":
      "هغه پېښې چې تاسو جوړې کړې، په بیاکتنه کې موجودې هم شاملې دي.",
    "myEvents.noHosting": "تاسو لا د کومې پېښې کوربه نه یاست",
    "myEvents.noHostingBody": "پېښه جوړه کړئ څو بیاکتنې ته ولېږل شي.",
    "myEvents.statusDraft": "د بیاکتنې په تمه",
    "myEvents.statusPublished": "خپره شوې",
    "myEvents.statusClosed": "بند شوې",
    "myEvents.statusRejected": "نه منل شوې",

    "moderation.entityOpportunity": "فرصت",
    "moderation.entityEvent": "پېښه",
    "moderation.entityBusiness": "سوداګري",
    "moderation.entityOrganization": "سازمان",
    "moderation.title": "د منځپانګې څارنه",
    "moderation.description":
      "فرصتونه، پېښې، سوداګرۍ او سازمانونه د ټولنې ښودلو دمخه وګورئ.",
    "moderation.manageTeam": "د څارنې ټیم مدیریت",
    "moderation.successApproved": "غوښتنلیک ومنل شو.",
    "moderation.successRejected": "غوښتنلیک رد شو.",
    "moderation.successGeneric": "د بیاکتنې پایله ثبت شوه.",
    "moderation.pendingTab": "د بیاکتنې په تمه",
    "moderation.historyTab": "وروستي پرېکړې",
    "moderation.pendingHeading": "د بیاکتنې په تمه",
    "moderation.nothingPending": "هېڅ څه د بیاکتنې په تمه ندي",
    "moderation.nothingPendingBody":
      "نوي غوښتنلیکونه به هغه وخت دلته ښکاره شي چې څارونکي تایید ته اړتیا ولري.",
    "moderation.historyHeading": "وروستي پرېکړې",
    "moderation.historyBody":
      "په ټوله څارل شوې منځپانګه کې وروستي منل شوي او رد شوي غوښتنلیکونه.",
    "moderation.noHistory": "تراوسه د څارنې تاریخ نشته",
    "moderation.noHistoryBody":
      "منل شوي او رد شوي غوښتنلیکونه به د لومړنۍ پرېکړې وروسته دلته ښکاره شي.",
    "moderation.approved": "منل شوی",
    "moderation.rejected": "رد شوی",
    "moderation.reason": "دلیل: {reason}",
    "moderation.submitted": "په {date} کې لېږل شوی",
    "moderation.starts": "پیل {date}",
    "moderation.approve": "منل",
    "moderation.approving": "منل کېږي…",
    "moderation.rejectSummary": "د دلیل سره ردول",
    "moderation.rejectLabel": "تشریح کړئ چې څه باید سم شي",
    "moderation.reject": "غوښتنلیک رد کړئ",
    "moderation.rejecting": "ردول کېږي…",
    "moderation.errorInvalidRequest":
      "د څارنې غوښتنه نیمګړې وه. پاڼه بیا پرانیستل او بیا هڅه کول یې معمولاً سمول کېږي.",
    "moderation.errorInvalidReason":
      "رد کول د ۱۰ تر ۱۰۰۰ تورو پورې دلیل ته اړتیا لري.",
    "moderation.errorApplyFailed":
      "دا د څارنې پرېکړه پلي نه شوه. مهرباني وکړئ پاڼه بیا پرانیزئ او بیا هڅه وکړئ.",

    "team.back": "څارنې ته بېرته",
    "team.title": "د څارنې ټیم",
    "team.description":
      "باوري غړي څارونکي یا مدیرانو ته لوړ کړئ، یا یې عادي غړي رول ته بېرته راوګرځوئ.",
    "team.adminOnly": "یوازې مدیر",
    "team.roleUpdated": "د غړي رول تازه شو.",
    "team.loadError": "غړي ونه شول بارول. مهرباني وکړئ بیا هڅه وکړئ.",
    "team.empty": "د مدیریت لپاره کوم غړی حساب نشته",
    "team.emptyBody":
      "د غړو حسابونه به هغه وخت دلته ښکاره شي چې د مدیر نوملړ کې موجود وي.",
    "team.onboardingIncomplete": "پروفایل نیمګړی",
    "team.ownRole": "ستاسو خپل رول دلته نه شي بدلېدای.",
    "team.role": "رول",
    "team.roleMember": "غړی",
    "team.roleModerator": "څارونکی",
    "team.roleAdmin": "مدیر",
    "team.saveRole": "رول خوندي کړئ",
    "team.savingRole": "رول خوندي کېږي…",
    "team.memberFallback": "د افغان هب غړی",
    "team.errorInvalidRole": "د رول غوښتنه سمه نه وه.",
    "team.errorUpdateFailed":
      "د دې غړي رول تازه نه شو. مهرباني وکړئ پاڼه بیا پرانیزئ او بیا هڅه وکړئ.",

    "verification.label": "تایید شوې",
    "verification.explanation":
      "د افغان هب مدیرانو دا لیست تایید شوی ښودلی. تایید د سپارښتنې یا تضمین معنا نه لري.",
    "verification.meaning": "د تایید معنا:",
    "verification.aria": "تایید شوې. {explanation}",

    "member.back": "شبکې ته بېرته",
    "member.fallbackName": "د افغان هب غړی",
    "member.profile": "پروفایل",
    "member.about": "په اړه",
    "member.bioEmpty": "دې غړي تر اوسه ژوندلیک نه دی لیکلی.",
    "member.expertise": "تخصص",
    "member.skills": "مهارتونه",
    "member.skillsEmpty": "تر اوسه مهارتونه نه دي ثبت شوي.",
    "member.mentorship": "لارښوونه",
    "member.openToMentoring": "نورو ته د لارښوونې لپاره چمتو",
    "member.lookingForMentor": "د لارښود په لټه کې",
    "member.mentorshipNote":
      "دا د غړي خپلې ټاکنې دي، د افغان هاب له خوا تصدیق یا سپارښتنه نه ده.",
    "member.languages": "ژبې",
    "member.languagesEmpty": "تر اوسه ژبې نه دي ثبت شوې.",
    "member.links": "اړیکې",
    "member.website": "وېبپاڼه",
    "member.linkedin": "لینکډین",
    "member.conversationError":
      "دا خبرې اترې پیل نه شوې. مهرباني وکړئ بیا هڅه وکړئ.",

    "opportunityAction.errorExpired":
      "دا فرصت پای ته رسېدلی، نو بیا خوندي کېدای نه شي.",
    "opportunityAction.errorCannotDelete":
      "یوازې هغه فرصتونه ړنګولای شئ چې تاسو جوړ کړي دي.",
    "opportunityAction.errorDeleteFailed":
      "دا فرصت ړنګ نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "opportunityAction.errorSaveFailed":
      "ستاسو خوندي شوي فرصتونه تازه نه شول. مهرباني وکړئ بیا هڅه وکړئ.",
    "opportunityAction.errorGeneric":
      "دا کار بشپړ نه شو. مهرباني وکړئ پاڼه بیا پرانیزئ او بیا هڅه وکړئ.",

    "action.errorGeneric":
      "دا کار بشپړ نه شو. مهرباني وکړئ پاڼه بیا پرانیزئ او بیا هڅه وکړئ.",
    "verificationAction.errorUpdateFailed":
      "د تایید حالت تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "eventAction.errorCannotDelete":
      "یوازې هغه پېښې ړنګولای شئ چې تاسو جوړې کړې دي.",
    "eventAction.errorDeleteFailed":
      "دا پېښه ړنګه نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",

    "delete.opportunityConfirm":
      "ایا ډاډه یاست چې غواړئ دا فرصت ړنګ کړئ؟ دا کار بېرته نه شي کېدای.",
    "delete.eventConfirm":
      "ایا ډاډه یاست چې غواړئ دا پېښه ړنګه کړئ؟ دا کار بېرته نه شي کېدای.",
    "delete.action": "ړنګول",
    "delete.deleting": "ړنګېږي…",

    "notFound.eyebrow": "۴۰۴ · پاڼه ونه موندل شوه",
    "notFound.title": "دا پاڼه نشته.",
    "notFound.body":
      "کېدای شي دا لینک زوړ شوی وي، پاڼه بل ځای ته لېږدول شوې وي، یا تاسو ورته لاسرسی نه لرئ. کولای شئ کور ته لاړ شئ یا په افغان هب کې لټون ته دوام ورکړئ.",
    "notFound.home": "کور پاڼې ته لاړ شئ",
    "notFound.explore": "ټولنه وپلټئ",
    "notFound.signIn": "ننوتل",
    "notFound.businessTitle": "سوداګري ونه موندل شوه",
    "notFound.businessBody":
      "دا سوداګري نشته یا په عامه توګه د لاسرسي وړ نه ده.",
    "notFound.viewBusinesses": "سوداګرۍ وګورئ",
    "notFound.organizationTitle": "سازمان ونه موندل شو",
    "notFound.organizationBody":
      "دا سازمان نشته یا په عامه توګه د لاسرسي وړ نه دی.",
    "notFound.viewOrganizations": "سازمانونه وګورئ",
    "notFound.memberTitle": "غړی ونه موندل شو",
    "notFound.memberBody":
      "کېدای شي دا پروفایل نه وي، عامه نه وي، یا د پیل بشپړولو پروسه یې نه وي بشپړه کړې.",
    "notFound.returnToNetwork": "شبکې ته بېرته",
    "notFound.listingTitle": "دا لېست نشته.",
    "notFound.listingBody":
      "کېدای شي لرې شوی وي، نه وي خپور شوی، یا نور عامو خلکو ته د لاسرسي وړ نه وي.",
    "notFound.exploreListings": "د ټولنې لېستونه وپلټئ",

    "recovery.eyebrow": "پاڼه نشته",
    "recovery.title": "دا پاڼه مو بار نه کړای شوه.",
    "recovery.body":
      "یو څه سم نه وو. کولای شئ دا پاڼه بیا هڅه کړئ، یا افغان هب ته بېرته لاړ شئ او له هغه ځایه دوام ورکړئ.",
    "recovery.retry": "بیا هڅه",
    "recovery.retrying": "بیا هڅه کېږي…",
    "recovery.home": "کور ته لاړ شئ",
    "recovery.privacyNote":
      "د محرمیت لپاره، افغان هب په دې پاڼه کې د داخلي تېروتنو جزئیات نه ښیي.",
    "recovery.documentTitle": "پاڼه نشته | افغان هب",
  },
} satisfies Record<SiteLanguage, Record<string, string>>;

export type BrowseCopy = (typeof browseCopy)["en"];
export type BrowseCopyKey = keyof BrowseCopy;

const copyKeys = Object.keys(browseCopy.en) as BrowseCopyKey[];

export function getBrowseCopy(language: SiteLanguage, key: BrowseCopyKey): string {
  const dictionary = browseCopy[language] as Partial<Record<BrowseCopyKey, string>>;
  return dictionary[key] ?? browseCopy.en[key] ?? key;
}

export { copyKeys as browseCopyKeys };

/**
 * Catalogue key for an opportunity type token, or null when the stored value
 * is not one of the catalogue's known tokens (those stay as user data).
 */
/**
 * Opportunity detail actions report failures as stable codes; the visible
 * message always comes from this catalogue.
 */
const opportunityActionErrorKeys: Record<string, BrowseCopyKey> = {
  expired: "opportunityAction.errorExpired",
  "cannot-delete": "opportunityAction.errorCannotDelete",
  "delete-failed": "opportunityAction.errorDeleteFailed",
  "save-failed": "opportunityAction.errorSaveFailed",
};

export function opportunityActionErrorKey(code: string | undefined): BrowseCopyKey {
  if (!code) return "opportunityAction.errorGeneric";
  return opportunityActionErrorKeys[code] ?? "opportunityAction.errorGeneric";
}

const eventActionErrorKeys: Record<string, BrowseCopyKey> = {
  "cannot-delete": "eventAction.errorCannotDelete",
  "delete-failed": "eventAction.errorDeleteFailed",
};

/** Detail-page actions on an event report failures as stable codes. */
export function eventActionErrorKey(code: string | undefined): BrowseCopyKey {
  if (!code) return "action.errorGeneric";
  return eventActionErrorKeys[code] ?? "action.errorGeneric";
}

const verificationActionErrorKeys: Record<string, BrowseCopyKey> = {
  "verification-failed": "verificationAction.errorUpdateFailed",
};

/** Business and organization verification toggle failures. */
export function verificationActionErrorKey(code: string | undefined): BrowseCopyKey {
  if (!code) return "action.errorGeneric";
  return verificationActionErrorKeys[code] ?? "action.errorGeneric";
}

const memberActionErrorKeys: Record<string, BrowseCopyKey> = {
  "start-failed": "member.conversationError",
};

/** Member-profile actions report failures as stable codes. */
export function memberActionErrorKey(code: string | undefined): BrowseCopyKey {
  if (!code) return "action.errorGeneric";
  return memberActionErrorKeys[code] ?? "action.errorGeneric";
}

export function opportunityTypeKey(value: string | null | undefined): BrowseCopyKey | null {
  if (!value) return null;
  const key = `opportunityType.${value}`;
  return (copyKeys as string[]).includes(key) ? (key as BrowseCopyKey) : null;
}
