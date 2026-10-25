import type { SiteLanguage } from "./site-language";

/**
 * UI copy for authenticated workspace surfaces: profile onboarding and the
 * create/edit forms for businesses and organizations.
 *
 * Kept separate from `ui-copy.ts` so the public/marketing catalog stays
 * reviewable on its own. Same rules apply:
 * - UI copy only, never user-generated content.
 * - Formal written Farsi, standard Afghan Pashto.
 * - Machine drafts until a native reviewer signs them off.
 * - No Latin text in Farsi or Pashto values.
 */
export const workspaceCopy = {
  en: {
    "common.backToDashboard": "Back to dashboard",
    "common.backToBusinesses": "Back to businesses",
    "common.backToBusiness": "Back to business",
    "common.backToOrganizations": "Back to organizations",
    "common.backToOrganization": "Back to organization",
    "common.cancel": "Cancel",
    "common.saveChanges": "Save changes",
    "common.savingChanges": "Saving changes…",
    "common.city": "City",
    "common.province": "Province / State",
    "common.country": "Country",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.website": "Website",
    "common.address": "Address",
    "common.shortDescription": "Short description",
    "common.fullDescription": "Full description",
    "common.firstName": "First name",
    "common.lastName": "Last name",
    "common.headline": "Headline",
    "common.aboutYou": "About you",
    "common.profession": "Profession",
    "common.company": "Company",
    "common.skills": "Skills",
    "common.languages": "Languages",
    "common.cityPlaceholder": "Vancouver",
    "common.provincePlaceholder": "British Columbia",
    "common.countryPlaceholder": "Canada",
    "common.selectType": "Select a type",
    "common.personalOrganization": "Personal / No organization",
    "common.title": "Title",
    "common.shortSummary": "Short summary",
    "common.deadline": "Deadline",
    "common.submitForReview": "Submit for Review",
    "common.submittingForReview": "Submitting for review…",
    "common.reviewNotice": "Your submission will be reviewed before it appears publicly.",

    "event.newEyebrow": "Create and share",
    "event.newTitle": "Create an Event",
    "event.newBody": "Share an in-person or online event with the Afghan Hub community.",
    "event.title": "Event title",
    "event.hostedBy": "Hosted by",
    "event.startsAt": "Starts at",
    "event.endsAt": "Ends at",
    "event.selectStart": "Select start date & time",
    "event.selectEnd": "Select end date & time",
    "event.dateTime": "Date and time",
    "event.location": "Location",
    "event.venueName": "Venue name",
    "event.online": "Online event",
    "event.onlineLink": "Online event link",
    "event.capacity": "Capacity",
    "event.settingsEyebrow": "Event settings",
    "event.editTitle": "Edit Event",
    "event.editBody": "Update the event details while keeping the experience clear for attendees.",
    "event.editNotice": "Saving changes submits this event for moderator review.",
    "event.saveAndSubmit": "Save and Submit for Review",
    "eventPicker.time": "Time",
    "eventPicker.hour": "Hour",
    "eventPicker.minute": "Minute",
    "eventPicker.period": "AM / PM",
    "eventPicker.am": "AM",
    "eventPicker.pm": "PM",
    "eventPicker.at": "at",
    "eventPicker.dateTime": "date and time",
    "eventPicker.clear": "Clear",
    "eventPicker.done": "Done",

    "profile.fallbackName": "Your profile",
    "profile.identityEyebrow": "Your community identity",
    "profile.headlineEmpty": "Add a headline so people can understand what you do at a glance.",
    "profile.storyLabel": "Professional story",
    "profile.storyStarted": "Started",
    "profile.storyAdd": "Add your work",
    "profile.discoveryLabel": "Discovery details",
    "profile.discoveryMore": "People can find more about you",
    "profile.discoveryAdd": "Add skills, language, location",
    "profile.builderEyebrow": "Profile builder",
    "profile.builderTitle": "Tell the community who you are",
    "profile.builderBody": "Use the sections below to shape how other members discover and understand your work, experience, and interests.",
    "profile.identity": "Identity",
    "profile.headlinePlaceholder": "Computer technician | Founder of a technology company",
    "profile.bioPlaceholder": "Tell the community a little about yourself…",
    "profile.workSkills": "Work and skills",
    "profile.professionPlaceholder": "Computer technician",
    "profile.companyPlaceholder": "Your technology company",
    "profile.skillsPlaceholder": "Computer repair, Filmmaking, Community organizing",
    "profile.skillsHint": "Separate each skill with a comma.",
    "profile.languagesPlaceholder": "Persian, English, Pashto",
    "profile.languagesHint": "Separate each language with a comma.",
    "profile.mentorship": "Mentorship",
    "profile.mentorshipNote": "Mentorship preferences are optional and member-selected. They are not credentials or endorsements by Afghan Hub.",
    "profile.openToMentoring": "Open to mentoring",
    "profile.openToMentoringHint": "Let members know you are open to sharing experience or guidance.",
    "profile.lookingForMentor": "Looking for a mentor",
    "profile.lookingForMentorHint": "Show that you are interested in finding guidance from another member.",
    "profile.mentorshipTopics": "Mentorship topics",
    "profile.mentorshipTopicsPlaceholder": "Career growth, Technology, Filmmaking",
    "profile.mentorshipTopicsHint": "Optional. Separate topics with commas; up to 12 topics, 60 characters each.",
    "profile.locationLinks": "Location and links",
    "profile.save": "Save profile",
    "profile.saving": "Saving profile…",

    "business.newEyebrow": "Create a business",
    "business.newTitle": "Add your business",
    "business.newBody": "Create a public page so community members can discover and support your business.",
    "business.infoHeading": "Business information",
    "business.nameLabel": "Business name *",
    "business.namePlaceholder": "Kabul Bakery",
    "business.categoryLabel": "Category *",
    "business.categoryPlaceholder": "Food and beverage",
    "business.shortPlaceholder": "A short summary of what your business offers.",
    "business.fullPlaceholder": "Tell the community about your business, products, and services.",
    "business.services": "Services",
    "business.servicesPlaceholder": "Catering, Delivery, Custom cakes",
    "business.servicesHint": "Separate each service with a comma.",
    "business.hiring": "This business is currently hiring",
    "business.contactHeading": "Contact information",
    "business.locationHeading": "Location",
    "business.addressPlaceholder": "123 Main Street",
    "business.create": "Create business",
    "business.creating": "Creating business…",
    "business.settingsEyebrow": "Business settings",
    "business.settingsBody": "Keep your business profile accurate, useful, and easy to discover.",
    "business.editTitle": "Edit {name}",

    "opportunity.newEyebrow": "Create an opportunity",
    "opportunity.newTitle": "Post an Opportunity",
    "opportunity.newBody":
      "Share a job, scholarship, volunteer role, mentorship, or another opportunity.",
    "opportunity.postedBy": "Posted by",
    "opportunity.type": "Opportunity type",
    "opportunity.remote": "Remote opportunity",
    "opportunity.externalUrl": "Application or external link",
    "opportunity.contactEmail": "Contact email",
    "opportunity.typeJob": "Job",
    "opportunity.typeVolunteer": "Volunteer",
    "opportunity.typeScholarship": "Scholarship",
    "opportunity.typeMentorship": "Mentorship",
    "opportunity.typeInvestment": "Investment",
    "opportunity.typeHousing": "Housing",
    "opportunity.typeEvent": "Event",
    "opportunity.typeEducation": "Education",
    "opportunity.editEyebrow": "Opportunity editor",
    "opportunity.editTitle": "Edit opportunity",
    "opportunity.editBody": "Update the opportunity information below.",
    "opportunity.editNotice":
      "Saving changes submits this opportunity for moderator review.",
    "opportunity.backToOpportunity": "Back to opportunity",
    "opportunity.saveAndSubmit": "Save and submit for review",
    "opportunityForm.errorTitleRequired": "Enter a title for this opportunity.",
    "opportunityForm.errorSummaryRequired": "Enter a short summary.",
    "opportunityForm.errorDescriptionRequired":
      "Describe the opportunity so members know what it involves.",
    "opportunityForm.errorTypeInvalid": "Choose a valid opportunity type.",
    "opportunityForm.errorOrganizationInvalid":
      "Choose an organization you own, or leave the field empty.",
    "opportunityForm.errorUrlInvalid":
      "Enter a full application link that starts with http:// or https://.",
    "opportunityForm.errorEmailInvalid": "Enter a valid contact email address.",
    "opportunityForm.errorDeadlineInvalid":
      "Choose a valid deadline on or after today.",
    "opportunityForm.errorCreateFailed":
      "We could not create the opportunity. Please try again.",
    "opportunityForm.errorUpdateFailed":
      "We could not save the opportunity. Please try again.",
    "opportunityForm.errorIncomplete":
      "Complete the title, summary and description before saving.",
    "opportunityForm.errorGeneric":
      "Something went wrong with this form. Please review the fields and try again.",

    "eventForm.errorTitleRequired": "Enter a title for this event.",
    "eventForm.errorSummaryRequired": "Enter a short summary.",
    "eventForm.errorDescriptionRequired":
      "Describe the event so members know what to expect.",
    "eventForm.errorStartInvalid": "Enter a valid start date and time.",
    "eventForm.errorEndInvalid": "Enter a valid end date and time.",
    "eventForm.errorEndBeforeStart":
      "The end date cannot be before the start date.",
    "eventForm.errorOrganizationInvalid":
      "Choose an organization you own, or leave the field empty.",
    "eventForm.errorUrlInvalid":
      "Enter a full event link that starts with http:// or https://.",
    "eventForm.errorCapacityInvalid":
      "Enter a capacity of one or more, or leave the field empty.",
    "eventForm.errorCreateFailed":
      "We could not create the event. Please try again.",
    "eventForm.errorUpdateFailed":
      "We could not save the event. Please try again.",
    "eventForm.errorIncomplete":
      "Complete the title, summary and description before saving.",
    "eventForm.errorGeneric":
      "Something went wrong with this form. Please review the fields and try again.",

    "businessForm.errorNameInvalid":
      "Business name must be 2–120 characters.",
    "businessForm.errorCategoryInvalid": "Enter a business category.",
    "businessForm.errorShortDescriptionTooLong":
      "Short description must be 200 characters or fewer.",
    "businessForm.errorUrlInvalid": "Enter a valid website URL.",
    "businessForm.errorEmailInvalid": "Enter a valid email address.",
    "businessForm.errorServicesInvalid":
      "Add up to 20 services with 100 characters each.",
    "businessForm.errorCreateFailed":
      "We could not create the business. Please try again.",
    "businessForm.errorUpdateFailed":
      "We could not save the business. Please try again.",
    "businessForm.errorSlugExhausted":
      "We could not create a unique business link. Try a different name.",
    "businessForm.errorGeneric":
      "Something went wrong with this form. Please review the fields and try again.",

    "organizationForm.errorNameRequired":
      "Organization name is required.",
    "organizationForm.errorUrlInvalid": "Enter a valid website URL.",
    "organizationForm.errorEmailInvalid": "Enter a valid email address.",
    "organizationForm.errorMissingInfo":
      "Choose the organization again before saving.",
    "organizationForm.errorCreateFailed":
      "We could not create the organization. Please try again.",
    "organizationForm.errorUpdateFailed":
      "We could not save the organization. Please try again.",
    "organizationForm.errorGeneric":
      "Something went wrong with this form. Please review the fields and try again.",

    "deadline.select": "Select a deadline",
    "deadline.dialog": "Choose deadline",
    "deadline.clear": "Clear",
    "deadline.done": "Done",

    "media.businessCover": "Business cover",
    "media.businessLogo": "Business logo",
    "media.organizationCover": "Organization cover",
    "media.organizationLogo": "Organization logo",
    "media.noCover": "No cover image",
    "media.uploadCover": "Upload cover",
    "media.uploadLogo": "Upload logo",
    "media.uploading": "Uploading…",
    "media.uploadBusinessCoverAria": "Upload business cover image",
    "media.uploadBusinessLogoAria": "Upload business logo",
    "media.uploadOrganizationCoverAria": "Upload organization cover image",
    "media.uploadOrganizationLogoAria": "Upload organization logo",
    "media.coverHelp": "Recommended ratio: 3:1. Maximum size: 8 MB.",
    "media.logoHelp": "JPG, PNG, or WebP. Maximum size: 5 MB.",
    "media.invalidType": "Please select a JPG, PNG, or WebP image.",
    "media.tooLarge": "The image must be smaller than {size} MB.",
    "media.businessCoverUploadFailed":
      "We could not upload the business cover. Please try again.",
    "media.businessLogoUploadFailed":
      "We could not upload the business logo. Please try again.",
    "media.organizationCoverUploadFailed":
      "We could not upload the organization cover. Please try again.",
    "media.organizationLogoUploadFailed":
      "We could not upload the organization logo. Please try again.",
    "media.businessCoverSaveFailed":
      "The image uploaded, but we could not update the business cover. Please try again.",
    "media.businessLogoSaveFailed":
      "The image uploaded, but we could not update the business logo. Please try again.",
    "media.organizationCoverSaveFailed":
      "The image uploaded, but we could not update the organization cover. Please try again.",
    "media.organizationLogoSaveFailed":
      "The image uploaded, but we could not update the organization logo. Please try again.",
    "media.businessCoverUpdated":
      "Business cover updated. The listing has been resubmitted for review.",
    "media.businessLogoUpdated":
      "Business logo updated. The listing has been resubmitted for review.",
    "media.organizationCoverUpdated":
      "Organization cover updated. The listing has been resubmitted for review.",
    "media.organizationLogoUpdated":
      "Organization logo updated. The listing has been resubmitted for review.",

    "organization.newEyebrow": "Create an organization",
    "organization.newTitle": "Add your organization",
    "organization.newBody": "Create a public page for your nonprofit, association, cultural group, professional network, or community initiative.",
    "organization.basicHeading": "Basic information",
    "organization.nameLabel": "Organization name *",
    "organization.namePlaceholder": "Afghan Community Association",
    "organization.typeLabel": "Organization type",
    "organization.selectType": "Select a type",
    "organization.typeNonprofit": "Nonprofit",
    "organization.typeCommunity": "Community organization",
    "organization.typeProfessional": "Professional association",
    "organization.typeCultural": "Cultural organization",
    "organization.typeStudent": "Student organization",
    "organization.typeCharity": "Charity",
    "organization.typeMedia": "Media organization",
    "organization.typeOther": "Other",
    "organization.shortPlaceholder": "A short summary of what your organization does.",
    "organization.fullPlaceholder": "Tell the community about your organization, history, work, and impact.",
    "organization.mission": "Mission",
    "organization.missionPlaceholder": "What is your organization's mission?",
    "organization.programs": "Programs",
    "organization.programsPlaceholder": "Education, Mentorship, Settlement support",
    "organization.programsHint": "Separate each program with a comma.",
    "organization.volunteers": "Accepting volunteers",
    "organization.volunteersHint": "This helps people discover this organization when looking for volunteer opportunities.",
    "organization.contactHeading": "Contact information",
    "organization.contactLocationHeading": "Contact and location",
    "organization.locationHeading": "Location",
    "organization.create": "Create organization",
    "organization.creating": "Creating organization…",
    "organization.settingsEyebrow": "Organization settings",
    "organization.settingsBody": "Keep your organization profile current and useful to the community.",
    "organization.editTitle": "Edit {name}",
  },
  fa: {
    "common.backToDashboard": "بازگشت به داشبورد",
    "common.backToBusinesses": "بازگشت به کسب‌وکارها",
    "common.backToBusiness": "بازگشت به کسب‌وکار",
    "common.backToOrganizations": "بازگشت به سازمان‌ها",
    "common.backToOrganization": "بازگشت به سازمان",
    "common.cancel": "لغو",
    "common.saveChanges": "ذخیره تغییرات",
    "common.savingChanges": "در حال ذخیره تغییرات…",
    "common.city": "شهر",
    "common.province": "ولایت / ایالت",
    "common.country": "کشور",
    "common.email": "ایمیل",
    "common.phone": "تلفن",
    "common.website": "وب‌سایت",
    "common.address": "نشانی",
    "common.shortDescription": "توضیح کوتاه",
    "common.fullDescription": "توضیح کامل",
    "common.firstName": "نام",
    "common.lastName": "نام خانوادگی",
    "common.headline": "عنوان معرفی",
    "common.aboutYou": "درباره شما",
    "common.profession": "حرفه",
    "common.company": "شرکت",
    "common.skills": "مهارت‌ها",
    "common.languages": "زبان‌ها",
    "common.cityPlaceholder": "ونکوور",
    "common.provincePlaceholder": "بریتیش کلمبیا",
    "common.countryPlaceholder": "کانادا",
    "common.selectType": "یک نوع را انتخاب کنید",
    "common.personalOrganization": "شخصی / بدون سازمان",
    "common.title": "عنوان",
    "common.shortSummary": "خلاصه کوتاه",
    "common.deadline": "مهلت",
    "common.submitForReview": "ارسال برای بررسی",
    "common.submittingForReview": "در حال ارسال برای بررسی…",
    "common.reviewNotice": "درخواست شما پیش از نمایش عمومی بررسی می‌شود.",

    "event.newEyebrow": "ایجاد و سهیم‌شدن",
    "event.newTitle": "ایجاد رویداد",
    "event.newBody": "یک رویداد حضوری یا آنلاین را با جامعه افغان هاب سهیم شوید.",
    "event.title": "عنوان رویداد",
    "event.hostedBy": "میزبان",
    "event.startsAt": "آغاز",
    "event.endsAt": "پایان",
    "event.selectStart": "تاریخ و زمان آغاز را انتخاب کنید",
    "event.selectEnd": "تاریخ و زمان پایان را انتخاب کنید",
    "event.dateTime": "تاریخ و زمان",
    "event.location": "موقعیت",
    "event.venueName": "نام محل",
    "event.online": "رویداد آنلاین",
    "event.onlineLink": "پیوند رویداد آنلاین",
    "event.capacity": "ظرفیت",
    "event.settingsEyebrow": "تنظیمات رویداد",
    "event.editTitle": "ویرایش رویداد",
    "event.editBody": "جزئیات رویداد را به‌روزرسانی کنید و تجربه را برای شرکت‌کنندگان روشن نگه دارید.",
    "event.editNotice": "ذخیره تغییرات این رویداد را برای بررسی ناظر ارسال می‌کند.",
    "event.saveAndSubmit": "ذخیره و ارسال برای بررسی",
    "eventPicker.time": "زمان",
    "eventPicker.hour": "ساعت",
    "eventPicker.minute": "دقیقه",
    "eventPicker.period": "ق.ظ / ب.ظ",
    "eventPicker.am": "ق.ظ",
    "eventPicker.pm": "ب.ظ",
    "eventPicker.at": "ساعت",
    "eventPicker.dateTime": "تاریخ و زمان",
    "eventPicker.clear": "پاک کردن",
    "eventPicker.done": "انجام شد",

    "profile.fallbackName": "پروفایل شما",
    "profile.identityEyebrow": "هویت جامعه‌ای شما",
    "profile.headlineEmpty": "یک عنوان معرفی اضافه کنید تا افراد در یک نگاه بدانند چه می‌کنید.",
    "profile.storyLabel": "داستان حرفه‌ای",
    "profile.storyStarted": "آغاز شده",
    "profile.storyAdd": "کار خود را اضافه کنید",
    "profile.discoveryLabel": "جزئیات یافت‌شدن",
    "profile.discoveryMore": "افراد می‌توانند بیشتر درباره شما بدانند",
    "profile.discoveryAdd": "مهارت، زبان و موقعیت را اضافه کنید",
    "profile.builderEyebrow": "سازنده پروفایل",
    "profile.builderTitle": "به جامعه بگویید که هستید",
    "profile.builderBody": "با بخش‌های زیر نشان دهید که دیگر اعضا چگونه کار، تجربه و علاقه‌مندی‌های شما را می‌بینند و می‌شناسند.",
    "profile.identity": "هویت",
    "profile.headlinePlaceholder": "تکنسین رایانه | بنیان‌گذار یک شرکت فناوری",
    "profile.bioPlaceholder": "کمی درباره خود به جامعه بگویید…",
    "profile.workSkills": "کار و مهارت‌ها",
    "profile.professionPlaceholder": "تکنسین رایانه",
    "profile.companyPlaceholder": "شرکت فناوری شما",
    "profile.skillsPlaceholder": "تعمیر رایانه، فیلم‌سازی، سازمان‌دهی جامعه",
    "profile.skillsHint": "هر مهارت را با ویرگول جدا کنید.",
    "profile.languagesPlaceholder": "فارسی، انگلیسی، پشتو",
    "profile.languagesHint": "هر زبان را با ویرگول جدا کنید.",
    "profile.mentorship": "راهنمایی",
    "profile.mentorshipNote": "ترجیحات راهنمایی اختیاری است و خود عضو آن را انتخاب می‌کند. این موارد اعتبارنامه یا تأییدیه افغان هاب نیستند.",
    "profile.openToMentoring": "آماده راهنمایی",
    "profile.openToMentoringHint": "به اعضا بگویید که آماده سهیم‌شدن تجربه یا راهنمایی هستید.",
    "profile.lookingForMentor": "در جست‌وجوی راهنما",
    "profile.lookingForMentorHint": "نشان دهید که می‌خواهید از عضو دیگری راهنمایی بگیرید.",
    "profile.mentorshipTopics": "موضوعات راهنمایی",
    "profile.mentorshipTopicsPlaceholder": "رشد شغلی، فناوری، فیلم‌سازی",
    "profile.mentorshipTopicsHint": "اختیاری. موضوعات را با ویرگول جدا کنید؛ حداکثر ۱۲ موضوع، هر یک تا ۶۰ نویسه.",
    "profile.locationLinks": "موقعیت و پیوندها",
    "profile.save": "ذخیره پروفایل",
    "profile.saving": "در حال ذخیره پروفایل…",

    "business.newEyebrow": "ایجاد کسب‌وکار",
    "business.newTitle": "کسب‌وکار خود را اضافه کنید",
    "business.newBody": "یک صفحه عمومی بسازید تا اعضای جامعه کسب‌وکار شما را پیدا کنند و از آن حمایت کنند.",
    "business.infoHeading": "اطلاعات کسب‌وکار",
    "business.nameLabel": "نام کسب‌وکار *",
    "business.namePlaceholder": "نانوایی کابل",
    "business.categoryLabel": "دسته *",
    "business.categoryPlaceholder": "خوراک و نوشیدنی",
    "business.shortPlaceholder": "خلاصه‌ای کوتاه از آنچه کسب‌وکار شما ارائه می‌دهد.",
    "business.fullPlaceholder": "درباره کسب‌وکار، محصولات و خدمات خود به جامعه بگویید.",
    "business.services": "خدمات",
    "business.servicesPlaceholder": "پذیرایی، تحویل، کیک سفارشی",
    "business.servicesHint": "هر خدمت را با ویرگول جدا کنید.",
    "business.hiring": "این کسب‌وکار در حال استخدام است",
    "business.contactHeading": "اطلاعات تماس",
    "business.locationHeading": "موقعیت",
    "business.addressPlaceholder": "خیابان اصلی، شماره ۱۲۳",
    "business.create": "ایجاد کسب‌وکار",
    "business.creating": "در حال ایجاد کسب‌وکار…",
    "business.settingsEyebrow": "تنظیمات کسب‌وکار",
    "business.settingsBody": "پروفایل کسب‌وکار خود را دقیق، سودمند و آسان برای یافتن نگه دارید.",
    "business.editTitle": "ویرایش {name}",

    "opportunity.newEyebrow": "ایجاد فرصت",
    "opportunity.newTitle": "ثبت فرصت",
    "opportunity.newBody":
      "یک شغل، بورس تحصیلی، نقش داوطلبانه، راهنمایی یا فرصت دیگر را به اشتراک بگذارید.",
    "opportunity.postedBy": "ثبت‌کننده",
    "opportunity.type": "نوع فرصت",
    "opportunity.remote": "فرصت دورکاری",
    "opportunity.externalUrl": "پیوند درخواست یا پیوند بیرونی",
    "opportunity.contactEmail": "ایمیل تماس",
    "opportunity.typeJob": "شغل",
    "opportunity.typeVolunteer": "داوطلبی",
    "opportunity.typeScholarship": "بورس تحصیلی",
    "opportunity.typeMentorship": "راهنمایی",
    "opportunity.typeInvestment": "سرمایه‌گذاری",
    "opportunity.typeHousing": "مسکن",
    "opportunity.typeEvent": "رویداد",
    "opportunity.typeEducation": "آموزش",
    "opportunity.editEyebrow": "ویرایشگر فرصت",
    "opportunity.editTitle": "ویرایش فرصت",
    "opportunity.editBody": "اطلاعات فرصت را در زیر به‌روزرسانی کنید.",
    "opportunity.editNotice":
      "ذخیره تغییرات این فرصت را برای بررسی ناظر ارسال می‌کند.",
    "opportunity.backToOpportunity": "بازگشت به فرصت",
    "opportunity.saveAndSubmit": "ذخیره و ارسال برای بررسی",
    "opportunityForm.errorTitleRequired": "عنوانی برای این فرصت وارد کنید.",
    "opportunityForm.errorSummaryRequired": "خلاصه‌ای کوتاه وارد کنید.",
    "opportunityForm.errorDescriptionRequired":
      "فرصت را توصیف کنید تا اعضا بدانند چه چیزی در آن نهفته است.",
    "opportunityForm.errorTypeInvalid": "یک نوع فرصت معتبر انتخاب کنید.",
    "opportunityForm.errorOrganizationInvalid":
      "سازمانی را انتخاب کنید که مالک آن هستید، یا این فیلد را خالی بگذارید.",
    "opportunityForm.errorUrlInvalid":
      "پیوند کامل درخواست را وارد کنید که با http:// یا https:// آغاز شود.",
    "opportunityForm.errorEmailInvalid": "یک نشانی ایمیل معتبر برای تماس وارد کنید.",
    "opportunityForm.errorDeadlineInvalid":
      "یک مهلت معتبر در امروز یا پس از آن انتخاب کنید.",
    "opportunityForm.errorCreateFailed":
      "ایجاد این فرصت امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "opportunityForm.errorUpdateFailed":
      "ذخیره این فرصت امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "opportunityForm.errorIncomplete":
      "پیش از ذخیره، عنوان، خلاصه و توضیحات را کامل کنید.",
    "opportunityForm.errorGeneric":
      "در این فرم مشکلی رخ داد. لطفاً فیلدها را بررسی کنید و دوباره تلاش کنید.",

    "eventForm.errorTitleRequired": "عنوانی برای این رویداد وارد کنید.",
    "eventForm.errorSummaryRequired": "خلاصه‌ای کوتاه وارد کنید.",
    "eventForm.errorDescriptionRequired":
      "رویداد را توصیف کنید تا اعضا بدانند چه انتظاری داشته باشند.",
    "eventForm.errorStartInvalid":
      "یک تاریخ و ساعت شروع معتبر وارد کنید.",
    "eventForm.errorEndInvalid": "یک تاریخ و ساعت پایان معتبر وارد کنید.",
    "eventForm.errorEndBeforeStart":
      "تاریخ پایان نمی‌تواند پیش از تاریخ شروع باشد.",
    "eventForm.errorOrganizationInvalid":
      "سازمانی را انتخاب کنید که مالک آن هستید، یا این فیلد را خالی بگذارید.",
    "eventForm.errorUrlInvalid":
      "پیوند کامل رویداد را وارد کنید که با http:// یا https:// آغاز شود.",
    "eventForm.errorCapacityInvalid":
      "ظرفیتی برابر با یک یا بیشتر وارد کنید، یا این فیلد را خالی بگذارید.",
    "eventForm.errorCreateFailed":
      "ایجاد این رویداد امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "eventForm.errorUpdateFailed":
      "ذخیره این رویداد امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "eventForm.errorIncomplete":
      "پیش از ذخیره، عنوان، خلاصه و توضیحات را کامل کنید.",
    "eventForm.errorGeneric":
      "در این فرم مشکلی رخ داد. لطفاً فیلدها را بررسی کنید و دوباره تلاش کنید.",

    "businessForm.errorNameInvalid":
      "نام کسب‌وکار باید بین ۲ تا ۱۲۰ نویسه باشد.",
    "businessForm.errorCategoryInvalid":
      "دسته‌بندی کسب‌وکار را وارد کنید.",
    "businessForm.errorShortDescriptionTooLong":
      "توضیح کوتاه باید ۲۰۰ نویسه یا کمتر باشد.",
    "businessForm.errorUrlInvalid": "یک نشانی وب‌سایت معتبر وارد کنید.",
    "businessForm.errorEmailInvalid": "یک نشانی ایمیل معتبر وارد کنید.",
    "businessForm.errorServicesInvalid":
      "حداکثر ۲۰ خدمت با ۱۰۰ نویسه برای هر کدام اضافه کنید.",
    "businessForm.errorCreateFailed":
      "ایجاد این کسب‌وکار امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "businessForm.errorUpdateFailed":
      "ذخیره این کسب‌وکار امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "businessForm.errorSlugExhausted":
      "نشانی یکتایی برای این کسب‌وکار پیدا نشد. نام دیگری را امتحان کنید.",
    "businessForm.errorGeneric":
      "در این فرم مشکلی رخ داد. لطفاً فیلدها را بررسی کنید و دوباره تلاش کنید.",

    "organizationForm.errorNameRequired": "نام سازمان الزامی است.",
    "organizationForm.errorUrlInvalid": "یک نشانی وب‌سایت معتبر وارد کنید.",
    "organizationForm.errorEmailInvalid": "یک نشانی ایمیل معتبر وارد کنید.",
    "organizationForm.errorMissingInfo":
      "پیش از ذخیره، سازمان را دوباره انتخاب کنید.",
    "organizationForm.errorCreateFailed":
      "ایجاد این سازمان امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "organizationForm.errorUpdateFailed":
      "ذخیره این سازمان امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "organizationForm.errorGeneric":
      "در این فرم مشکلی رخ داد. لطفاً فیلدها را بررسی کنید و دوباره تلاش کنید.",

    "deadline.select": "مهلتی را انتخاب کنید",
    "deadline.dialog": "انتخاب مهلت",
    "deadline.clear": "پاک کردن",
    "deadline.done": "انجام شد",

    "media.businessCover": "تصویر جلد کسب‌وکار",
    "media.businessLogo": "نشان کسب‌وکار",
    "media.organizationCover": "تصویر جلد سازمان",
    "media.organizationLogo": "نشان سازمان",
    "media.noCover": "تصویر جلدی وجود ندارد",
    "media.uploadCover": "بارگذاری جلد",
    "media.uploadLogo": "بارگذاری نشان",
    "media.uploading": "در حال بارگذاری…",
    "media.uploadBusinessCoverAria": "بارگذاری تصویر جلد کسب‌وکار",
    "media.uploadBusinessLogoAria": "بارگذاری نشان کسب‌وکار",
    "media.uploadOrganizationCoverAria": "بارگذاری تصویر جلد سازمان",
    "media.uploadOrganizationLogoAria": "بارگذاری نشان سازمان",
    "media.coverHelp": "نسبت پیشنهادی: ۳:۱. حداکثر اندازه: ۸ مگابایت.",
    "media.logoHelp": "JPG، PNG یا WebP. حداکثر اندازه: ۵ مگابایت.",
    "media.invalidType": "لطفاً یک تصویر JPG، PNG یا WebP انتخاب کنید.",
    "media.tooLarge": "اندازه تصویر باید کمتر از {size} مگابایت باشد.",
    "media.businessCoverUploadFailed":
      "بارگذاری تصویر جلد کسب‌وکار امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "media.businessLogoUploadFailed":
      "بارگذاری نشان کسب‌وکار امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "media.organizationCoverUploadFailed":
      "بارگذاری تصویر جلد سازمان امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "media.organizationLogoUploadFailed":
      "بارگذاری نشان سازمان امکان‌پذیر نبود. لطفاً دوباره تلاش کنید.",
    "media.businessCoverSaveFailed":
      "تصویر بارگذاری شد، اما به‌روزرسانی تصویر جلد کسب‌وکار انجام نشد. لطفاً دوباره تلاش کنید.",
    "media.businessLogoSaveFailed":
      "تصویر بارگذاری شد، اما به‌روزرسانی نشان کسب‌وکار انجام نشد. لطفاً دوباره تلاش کنید.",
    "media.organizationCoverSaveFailed":
      "تصویر بارگذاری شد، اما به‌روزرسانی تصویر جلد سازمان انجام نشد. لطفاً دوباره تلاش کنید.",
    "media.organizationLogoSaveFailed":
      "تصویر بارگذاری شد، اما به‌روزرسانی نشان سازمان انجام نشد. لطفاً دوباره تلاش کنید.",
    "media.businessCoverUpdated":
      "تصویر جلد کسب‌وکار به‌روزرسانی شد. آگهی برای بررسی دوباره ارسال شد.",
    "media.businessLogoUpdated":
      "نشان کسب‌وکار به‌روزرسانی شد. آگهی برای بررسی دوباره ارسال شد.",
    "media.organizationCoverUpdated":
      "تصویر جلد سازمان به‌روزرسانی شد. آگهی برای بررسی دوباره ارسال شد.",
    "media.organizationLogoUpdated":
      "نشان سازمان به‌روزرسانی شد. آگهی برای بررسی دوباره ارسال شد.",

    "organization.newEyebrow": "ایجاد سازمان",
    "organization.newTitle": "سازمان خود را اضافه کنید",
    "organization.newBody": "برای سازمان غیرانتفاعی، انجمن، گروه فرهنگی، شبکه حرفه‌ای یا ابتکار جامعه‌ای خود یک صفحه عمومی بسازید.",
    "organization.basicHeading": "اطلاعات اساسی",
    "organization.nameLabel": "نام سازمان *",
    "organization.namePlaceholder": "انجمن جامعه افغان",
    "organization.typeLabel": "نوع سازمان",
    "organization.selectType": "یک نوع را انتخاب کنید",
    "organization.typeNonprofit": "غیرانتفاعی",
    "organization.typeCommunity": "سازمان جامعه‌ای",
    "organization.typeProfessional": "انجمن حرفه‌ای",
    "organization.typeCultural": "سازمان فرهنگی",
    "organization.typeStudent": "سازمان دانشجویی",
    "organization.typeCharity": "خیریه",
    "organization.typeMedia": "سازمان رسانه‌ای",
    "organization.typeOther": "دیگر",
    "organization.shortPlaceholder": "خلاصه‌ای کوتاه از کار سازمان شما.",
    "organization.fullPlaceholder": "درباره سازمان، تاریخ، کار و تأثیر آن به جامعه بگویید.",
    "organization.mission": "مأموریت",
    "organization.missionPlaceholder": "مأموریت سازمان شما چیست؟",
    "organization.programs": "برنامه‌ها",
    "organization.programsPlaceholder": "آموزش، راهنمایی، پشتیبانی اسکان",
    "organization.programsHint": "هر برنامه را با ویرگول جدا کنید.",
    "organization.volunteers": "پذیرش داوطلبان",
    "organization.volunteersHint": "این کمک می‌کند افراد هنگام جست‌وجوی فرصت‌های داوطلبانه این سازمان را پیدا کنند.",
    "organization.contactHeading": "اطلاعات تماس",
    "organization.contactLocationHeading": "تماس و موقعیت",
    "organization.locationHeading": "موقعیت",
    "organization.create": "ایجاد سازمان",
    "organization.creating": "در حال ایجاد سازمان…",
    "organization.settingsEyebrow": "تنظیمات سازمان",
    "organization.settingsBody": "پروفایل سازمان خود را به‌روز و سودمند برای جامعه نگه دارید.",
    "organization.editTitle": "ویرایش {name}",
  },
  ps: {
    "common.backToDashboard": "داشبورډ ته بېرته",
    "common.backToBusinesses": "سوداګرو ته بېرته",
    "common.backToBusiness": "سوداګرۍ ته بېرته",
    "common.backToOrganizations": "سازمانونو ته بېرته",
    "common.backToOrganization": "سازمان ته بېرته",
    "common.cancel": "لغوه",
    "common.saveChanges": "بدلونونه خوندي کړئ",
    "common.savingChanges": "بدلونونه خوندي کېږي…",
    "common.city": "ښار",
    "common.province": "ولایت / ایالت",
    "common.country": "هېواد",
    "common.email": "برېښنالیک",
    "common.phone": "تلیفون",
    "common.website": "وېبپاڼه",
    "common.address": "پته",
    "common.shortDescription": "لنډ تفصیل",
    "common.fullDescription": "بشپړ تفصیل",
    "common.firstName": "نوم",
    "common.lastName": "تخلص",
    "common.headline": "د پېژندنې سرلیک",
    "common.aboutYou": "ستاسو په اړه",
    "common.profession": "مسلک",
    "common.company": "شرکت",
    "common.skills": "مهارتونه",
    "common.languages": "ژبې",
    "common.cityPlaceholder": "وینکوور",
    "common.provincePlaceholder": "برېتش کولمبیا",
    "common.countryPlaceholder": "کاناډا",
    "common.selectType": "یو ډول وټاکئ",
    "common.personalOrganization": "شخصي / پرته له سازمان",
    "common.title": "سرلیک",
    "common.shortSummary": "لنډیز",
    "common.deadline": "پای نېټه",
    "common.submitForReview": "بیاکتنې ته ولېږئ",
    "common.submittingForReview": "بیاکتنې ته لېږل کېږي…",
    "common.reviewNotice": "ستاسو غوښتنلیک د عامه ښودلو دمخه بیاکتل کېږي.",

    "event.newEyebrow": "جوړول او شریکول",
    "event.newTitle": "پېښه جوړه کړئ",
    "event.newBody": "یوه حضوري یا آنلاین پېښه د افغان هب ټولنې سره شریکه کړئ.",
    "event.title": "د پېښې سرلیک",
    "event.hostedBy": "کوربه",
    "event.startsAt": "پیل",
    "event.endsAt": "پای",
    "event.selectStart": "د پیل نېټه او وخت وټاکئ",
    "event.selectEnd": "د پای نېټه او وخت وټاکئ",
    "event.dateTime": "نېټه او وخت",
    "event.location": "ځای",
    "event.venueName": "د ځای نوم",
    "event.online": "آنلاین پېښه",
    "event.onlineLink": "د آنلاین پېښې لینک",
    "event.capacity": "ظرفیت",
    "event.settingsEyebrow": "د پېښې تنظیمات",
    "event.editTitle": "پېښه سمول",
    "event.editBody": "د پېښې تفصیلات تازه کړئ او د ګډون کوونکو لپاره یې تجربه روښانه وساتئ.",
    "event.editNotice": "بدلونونو خوندي کول دا پېښه د څارونکي بیاکتنې ته لېږي.",
    "event.saveAndSubmit": "خوندي کړئ او بیاکتنې ته یې ولېږئ",
    "eventPicker.time": "وخت",
    "eventPicker.hour": "ساعت",
    "eventPicker.minute": "دقیقه",
    "eventPicker.period": "غ.م / غ.و",
    "eventPicker.am": "غ.م",
    "eventPicker.pm": "غ.و",
    "eventPicker.at": "په",
    "eventPicker.dateTime": "نېټه او وخت",
    "eventPicker.clear": "پاکول",
    "eventPicker.done": "شو",

    "profile.fallbackName": "ستاسو پروفایل",
    "profile.identityEyebrow": "ستاسو ټولنیزه پېژندنه",
    "profile.headlineEmpty": "د پېژندنې سرلیک ورزیات کړئ څو خلک په لنډه توګه پوه شي چې تاسو څه کوئ.",
    "profile.storyLabel": "مسلکي کیسه",
    "profile.storyStarted": "پیل شوی",
    "profile.storyAdd": "خپل کار ورزیات کړئ",
    "profile.discoveryLabel": "د موندلو معلومات",
    "profile.discoveryMore": "خلک ستاسو په اړه ډېر څه موندلی شي",
    "profile.discoveryAdd": "مهارتونه، ژبه او ځای ورزیات کړئ",
    "profile.builderEyebrow": "د پروفایل جوړونکی",
    "profile.builderTitle": "ټولنې ته ووایاست چې تاسو څوک یاست",
    "profile.builderBody": "لاندې برخې وکاروئ څو ښکاره کړئ چې نور غړي ستاسو کار، تجربه او علاقې څنګه وپېژني.",
    "profile.identity": "پېژندنه",
    "profile.headlinePlaceholder": "د کمپیوټر تخنیکر | د یوې ټکنالوژۍ شرکت بنسټګر",
    "profile.bioPlaceholder": "لږ څه د ځان په اړه ټولنې ته ووایاست…",
    "profile.workSkills": "کار او مهارتونه",
    "profile.professionPlaceholder": "د کمپیوټر تخنیکر",
    "profile.companyPlaceholder": "ستاسو ټکنالوژي شرکت",
    "profile.skillsPlaceholder": "د کمپیوټر ترمیم، فلم جوړونه، ټولنیز تنظیم",
    "profile.skillsHint": "هر مهارت په کامې سره جلا کړئ.",
    "profile.languagesPlaceholder": "فارسي، انګلیسي، پښتو",
    "profile.languagesHint": "هره ژبه په کامې سره جلا کړئ.",
    "profile.mentorship": "لارښوونه",
    "profile.mentorshipNote": "د لارښوونې غوراوي اختیاري دي او غړی یې ټاکي. دا د افغان هب اعتبار یا تایید نه دی.",
    "profile.openToMentoring": "د لارښوونې لپاره چمتو",
    "profile.openToMentoringHint": "غړو ته ووایاست چې تاسو د تجربې یا لارښوونې شریکولو ته چمتو یاست.",
    "profile.lookingForMentor": "لارښوونکي ته اړتیا",
    "profile.lookingForMentorHint": "وښایاست چې غواړئ له بل غړي لارښوونه ترلاسه کړئ.",
    "profile.mentorshipTopics": "د لارښوونې موضوعات",
    "profile.mentorshipTopicsPlaceholder": "مسلکي پرمختګ، ټکنالوژي، فلم جوړونه",
    "profile.mentorshipTopicsHint": "اختیاري. موضوعات په کامې سره جلا کړئ؛ تر ۱۲ موضوعاتو، هر یو تر ۶۰ تورو.",
    "profile.locationLinks": "ځای او لینکونه",
    "profile.save": "پروفایل خوندي کړئ",
    "profile.saving": "پروفایل خوندي کېږي…",

    "business.newEyebrow": "سوداګري جوړول",
    "business.newTitle": "خپله سوداګري ورزیات کړئ",
    "business.newBody": "یوه عامه پاڼه جوړه کړئ څو د ټولنې غړي ستاسو سوداګري ومومي او ملاتړ یې وکړي.",
    "business.infoHeading": "د سوداګرۍ معلومات",
    "business.nameLabel": "د سوداګرۍ نوم *",
    "business.namePlaceholder": "د کابل نانوایی",
    "business.categoryLabel": "ډله *",
    "business.categoryPlaceholder": "خواړه او څښاک",
    "business.shortPlaceholder": "د هغه څه لنډیز چې ستاسو سوداګري وړاندې کوي.",
    "business.fullPlaceholder": "ټولنې ته د خپلې سوداګرۍ، محصولاتو او خدمتونو په اړه ووایاست.",
    "business.services": "خدمتونه",
    "business.servicesPlaceholder": "میلمه پالنه، رسول، ځانګړي کیکونه",
    "business.servicesHint": "هر خدمت په کامې سره جلا کړئ.",
    "business.hiring": "دا سوداګري اوس کارکوونکي ګماري",
    "business.contactHeading": "د اړیکې معلومات",
    "business.locationHeading": "ځای",
    "business.addressPlaceholder": "اصلي سړک، ۱۲۳",
    "business.create": "سوداګري جوړه کړئ",
    "business.creating": "سوداګري جوړېږي…",
    "business.settingsEyebrow": "د سوداګرۍ تنظیمات",
    "business.settingsBody": "خپل د سوداګرۍ پروفایل سم، ګټور او په اسانۍ موندل کېدونکی وساتئ.",
    "business.editTitle": "د {name} سمون",

    "opportunity.newEyebrow": "فرصت جوړول",
    "opportunity.newTitle": "فرصت خپور کړئ",
    "opportunity.newBody":
      "دنده، زده‌کړیزه بورس، رضاکارانه رول، لارښوونه یا بل فرصت شریک کړئ.",
    "opportunity.postedBy": "خپروونکی",
    "opportunity.type": "د فرصت ډول",
    "opportunity.remote": "له لرې فرصت",
    "opportunity.externalUrl": "د غوښتنلیک یا بهرنی لینک",
    "opportunity.contactEmail": "د اړیکې برېښنالیک",
    "opportunity.typeJob": "دنده",
    "opportunity.typeVolunteer": "رضاکارانه",
    "opportunity.typeScholarship": "زده‌کړیزه بورس",
    "opportunity.typeMentorship": "لارښوونه",
    "opportunity.typeInvestment": "پانګونه",
    "opportunity.typeHousing": "کور",
    "opportunity.typeEvent": "پېښه",
    "opportunity.typeEducation": "زده‌کړه",
    "opportunity.editEyebrow": "د فرصت سمون",
    "opportunity.editTitle": "فرصت سمول",
    "opportunity.editBody": "لاندې د فرصت معلومات تازه کړئ.",
    "opportunity.editNotice":
      "بدلونونو خوندي کول دا فرصت د څارونکي بیاکتنې ته لېږي.",
    "opportunity.backToOpportunity": "فرصت ته بېرته",
    "opportunity.saveAndSubmit": "خوندي کړئ او بیاکتنې ته یې ولېږئ",
    "opportunityForm.errorTitleRequired": "د دې فرصت لپاره سرلیک ولیکئ.",
    "opportunityForm.errorSummaryRequired": "لنډیز ولیکئ.",
    "opportunityForm.errorDescriptionRequired":
      "فرصت تشریح کړئ تر څو غړي پوه شي چې څه پکې شامل دي.",
    "opportunityForm.errorTypeInvalid": "د فرصت سم ډول وټاکئ.",
    "opportunityForm.errorOrganizationInvalid":
      "هغه سازمان وټاکئ چې تاسو یې مالک یاست، یا دا ساحه خالي پرېږدئ.",
    "opportunityForm.errorUrlInvalid":
      "د غوښتنلیک بشپړه لینک ولیکئ چې په http:// یا https:// پیل کېږي.",
    "opportunityForm.errorEmailInvalid": "د اړیکې لپاره سم برېښنالیک ولیکئ.",
    "opportunityForm.errorDeadlineInvalid":
      "د نن یا له هغې وروسته سمه پای نېټه وټاکئ.",
    "opportunityForm.errorCreateFailed":
      "دا فرصت جوړ نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "opportunityForm.errorUpdateFailed":
      "دا فرصت خوندي نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "opportunityForm.errorIncomplete":
      "له خوندي کولو دمخه سرلیک، لنډیز او تشریح بشپړ کړئ.",
    "opportunityForm.errorGeneric":
      "په دې فورمې کې ستونزه رامنځته شوه. مهرباني وکړئ ساحې وګورئ او بیا هڅه وکړئ.",

    "eventForm.errorTitleRequired": "د دې پېښې لپاره سرلیک ولیکئ.",
    "eventForm.errorSummaryRequired": "لنډیز ولیکئ.",
    "eventForm.errorDescriptionRequired":
      "پېښه تشریح کړئ تر څو غړي پوه شي چې څه تمه ولري.",
    "eventForm.errorStartInvalid": "د پیل سمه نېټه او وخت ولیکئ.",
    "eventForm.errorEndInvalid": "د پای سمه نېټه او وخت ولیکئ.",
    "eventForm.errorEndBeforeStart":
      "د پای نېټه نه شي کولای چې د پیل له نېټې مخکې وي.",
    "eventForm.errorOrganizationInvalid":
      "هغه سازمان وټاکئ چې تاسو یې مالک یاست، یا دا ساحه خالي پرېږدئ.",
    "eventForm.errorUrlInvalid":
      "د پېښې بشپړه لینک ولیکئ چې په http:// یا https:// پیل کېږي.",
    "eventForm.errorCapacityInvalid":
      "د یو یا ډېرو لپاره ظرفیت ولیکئ، یا دا ساحه خالي پرېږدئ.",
    "eventForm.errorCreateFailed":
      "دا پېښه جوړه نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    "eventForm.errorUpdateFailed":
      "دا پېښه خوندي نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    "eventForm.errorIncomplete":
      "له خوندي کولو دمخه سرلیک، لنډیز او تشریح بشپړ کړئ.",
    "eventForm.errorGeneric":
      "په دې فورمې کې ستونزه رامنځته شوه. مهرباني وکړئ ساحې وګورئ او بیا هڅه وکړئ.",

    "businessForm.errorNameInvalid":
      "د سوداګرۍ نوم باید له ۲ تر ۱۲۰ توري وي.",
    "businessForm.errorCategoryInvalid": "د سوداګرۍ ډله ولیکئ.",
    "businessForm.errorShortDescriptionTooLong":
      "لنډ تشریح باید ۲۰۰ توري یا لږ وي.",
    "businessForm.errorUrlInvalid": "د وېبپاڼې سمه پته ولیکئ.",
    "businessForm.errorEmailInvalid": "سم برېښنالیک ولیکئ.",
    "businessForm.errorServicesInvalid":
      "تر ۲۰ خدماتو پورې ورزیات کړئ، هر یو تر ۱۰۰ تورو پورې.",
    "businessForm.errorCreateFailed":
      "دا سوداګري جوړه نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    "businessForm.errorUpdateFailed":
      "دا سوداګري خوندي نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",
    "businessForm.errorSlugExhausted":
      "د دې سوداګرۍ لپاره ځانګړې پته ونه موندل شوه. بل نوم وآزمویئ.",
    "businessForm.errorGeneric":
      "په دې فورمې کې ستونزه رامنځته شوه. مهرباني وکړئ ساحې وګورئ او بیا هڅه وکړئ.",

    "organizationForm.errorNameRequired": "د سازمان نوم اړین دی.",
    "organizationForm.errorUrlInvalid": "د وېبپاڼې سمه پته ولیکئ.",
    "organizationForm.errorEmailInvalid": "سم برېښنالیک ولیکئ.",
    "organizationForm.errorMissingInfo":
      "له خوندي کولو دمخه سازمان بیا وټاکئ.",
    "organizationForm.errorCreateFailed":
      "دا سازمان جوړ نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "organizationForm.errorUpdateFailed":
      "دا سازمان خوندي نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "organizationForm.errorGeneric":
      "په دې فورمې کې ستونزه رامنځته شوه. مهرباني وکړئ ساحې وګورئ او بیا هڅه وکړئ.",

    "deadline.select": "پای نېټه وټاکئ",
    "deadline.dialog": "د پای نېټې ټاکل",
    "deadline.clear": "پاکول",
    "deadline.done": "شو",

    "media.businessCover": "د سوداګرۍ پوښ",
    "media.businessLogo": "د سوداګرۍ نښان",
    "media.organizationCover": "د سازمان پوښ",
    "media.organizationLogo": "د سازمان نښان",
    "media.noCover": "د پوښ انځور نشته",
    "media.uploadCover": "پوښ پورته کړئ",
    "media.uploadLogo": "نښان پورته کړئ",
    "media.uploading": "پورته کېږي…",
    "media.uploadBusinessCoverAria": "د سوداګرۍ د پوښ انځور پورته کړئ",
    "media.uploadBusinessLogoAria": "د سوداګرۍ نښان پورته کړئ",
    "media.uploadOrganizationCoverAria": "د سازمان د پوښ انځور پورته کړئ",
    "media.uploadOrganizationLogoAria": "د سازمان نښان پورته کړئ",
    "media.coverHelp": "سپارښتل شوی تناسب: ۳:۱. تر ټولو زیات اندازه: ۸ مېګابایټ.",
    "media.logoHelp": "JPG، PNG یا WebP. تر ټولو زیات اندازه: ۵ مېګابایټ.",
    "media.invalidType": "مهرباني وکړئ د JPG، PNG یا WebP انځور وټاکئ.",
    "media.tooLarge": "د انځور اندازه باید له {size} مېګابایټو کمه وي.",
    "media.businessCoverUploadFailed":
      "د سوداګرۍ پوښ ونه شو پورته کول. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.businessLogoUploadFailed":
      "د سوداګرۍ نښان ونه شو پورته کول. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.organizationCoverUploadFailed":
      "د سازمان پوښ ونه شو پورته کول. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.organizationLogoUploadFailed":
      "د سازمان نښان ونه شو پورته کول. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.businessCoverSaveFailed":
      "انځور پورته شو، مګر د سوداګرۍ پوښ تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.businessLogoSaveFailed":
      "انځور پورته شو، مګر د سوداګرۍ نښان تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.organizationCoverSaveFailed":
      "انځور پورته شو، مګر د سازمان پوښ تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.organizationLogoSaveFailed":
      "انځور پورته شو، مګر د سازمان نښان تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
    "media.businessCoverUpdated":
      "د سوداګرۍ پوښ تازه شو. لیست د بیاکتنې لپاره بیا لېږل شوی.",
    "media.businessLogoUpdated":
      "د سوداګرۍ نښان تازه شو. لیست د بیاکتنې لپاره بیا لېږل شوی.",
    "media.organizationCoverUpdated":
      "د سازمان پوښ تازه شو. لیست د بیاکتنې لپاره بیا لېږل شوی.",
    "media.organizationLogoUpdated":
      "د سازمان نښان تازه شو. لیست د بیاکتنې لپاره بیا لېږل شوی.",

    "organization.newEyebrow": "سازمان جوړول",
    "organization.newTitle": "خپل سازمان ورزیات کړئ",
    "organization.newBody": "د خپل غیرانتفاعي سازمان، ټولنې، کلتوري ډلې، مسلکي شبکې یا ټولنیز نوښت لپاره عامه پاڼه جوړه کړئ.",
    "organization.basicHeading": "بنسټیز معلومات",
    "organization.nameLabel": "د سازمان نوم *",
    "organization.namePlaceholder": "د افغان ټولنې ټولنه",
    "organization.typeLabel": "د سازمان ډول",
    "organization.selectType": "یو ډول وټاکئ",
    "organization.typeNonprofit": "غیرانتفاعي",
    "organization.typeCommunity": "ټولنیز سازمان",
    "organization.typeProfessional": "مسلکي ټولنه",
    "organization.typeCultural": "کلتوري سازمان",
    "organization.typeStudent": "د زده کوونکو سازمان",
    "organization.typeCharity": "خیریه",
    "organization.typeMedia": "رسنیز سازمان",
    "organization.typeOther": "بل",
    "organization.shortPlaceholder": "د خپل سازمان کار لنډیز.",
    "organization.fullPlaceholder": "ټولنې ته د خپل سازمان، تاریخ، کار او اغېزې په اړه ووایاست.",
    "organization.mission": "مأموریت",
    "organization.missionPlaceholder": "ستاسو د سازمان مأموریت څه دی؟",
    "organization.programs": "پروګرامونه",
    "organization.programsPlaceholder": "زده کړه، لارښوونه، د مېشتېدو ملاتړ",
    "organization.programsHint": "هر پروګرام په کامې سره جلا کړئ.",
    "organization.volunteers": "رضاکاران منل",
    "organization.volunteersHint": "دا مرسته کوي چې خلک د رضاکارانه فرصتونو په لټون کې دا سازمان ومومي.",
    "organization.contactHeading": "د اړیکې معلومات",
    "organization.contactLocationHeading": "اړیکه او ځای",
    "organization.locationHeading": "ځای",
    "organization.create": "سازمان جوړ کړئ",
    "organization.creating": "سازمان جوړېږي…",
    "organization.settingsEyebrow": "د سازمان تنظیمات",
    "organization.settingsBody": "خپل د سازمان پروفایل تازه او ټولنې ته ګټور وساتئ.",
    "organization.editTitle": "د {name} سمون",
  },
} as const;

export type WorkspaceCopy = (typeof workspaceCopy)["en"];
export type WorkspaceCopyKey = keyof WorkspaceCopy;

const copyKeys = Object.keys(workspaceCopy.en) as WorkspaceCopyKey[];

/** Type-safe lookup; unknown keys fall back to the key itself. */
export function getWorkspaceCopy(language: SiteLanguage, key: WorkspaceCopyKey): string {
  return workspaceCopy[language][key] ?? workspaceCopy.en[key] ?? key;
}

export { copyKeys as workspaceCopyKeys };

/**
 * Form validation and save failures travel as stable codes in the `error`
 * query parameter, so the visible message is always localized. Unknown codes
 * fall back to the generic form message.
 */
const opportunityFormErrorKeys: Record<string, WorkspaceCopyKey> = {
  "title-required": "opportunityForm.errorTitleRequired",
  "summary-required": "opportunityForm.errorSummaryRequired",
  "description-required": "opportunityForm.errorDescriptionRequired",
  "invalid-type": "opportunityForm.errorTypeInvalid",
  "invalid-organization": "opportunityForm.errorOrganizationInvalid",
  "invalid-url": "opportunityForm.errorUrlInvalid",
  "invalid-email": "opportunityForm.errorEmailInvalid",
  "invalid-deadline": "opportunityForm.errorDeadlineInvalid",
  "create-failed": "opportunityForm.errorCreateFailed",
  "update-failed": "opportunityForm.errorUpdateFailed",
  "incomplete-fields": "opportunityForm.errorIncomplete",
};

export function opportunityFormErrorKey(code: string | undefined): WorkspaceCopyKey {
  if (!code) return "opportunityForm.errorGeneric";
  return opportunityFormErrorKeys[code] ?? "opportunityForm.errorGeneric";
}

const eventFormErrorKeys: Record<string, WorkspaceCopyKey> = {
  "title-required": "eventForm.errorTitleRequired",
  "summary-required": "eventForm.errorSummaryRequired",
  "description-required": "eventForm.errorDescriptionRequired",
  "start-invalid": "eventForm.errorStartInvalid",
  "end-invalid": "eventForm.errorEndInvalid",
  "end-before-start": "eventForm.errorEndBeforeStart",
  "organization-invalid": "eventForm.errorOrganizationInvalid",
  "url-invalid": "eventForm.errorUrlInvalid",
  "capacity-invalid": "eventForm.errorCapacityInvalid",
  "create-failed": "eventForm.errorCreateFailed",
  "update-failed": "eventForm.errorUpdateFailed",
  "incomplete-fields": "eventForm.errorIncomplete",
};

export function eventFormErrorKey(code: string | undefined): WorkspaceCopyKey {
  if (!code) return "eventForm.errorGeneric";
  return eventFormErrorKeys[code] ?? "eventForm.errorGeneric";
}

const businessFormErrorKeys: Record<string, WorkspaceCopyKey> = {
  "name-invalid": "businessForm.errorNameInvalid",
  "category-invalid": "businessForm.errorCategoryInvalid",
  "short-description-too-long": "businessForm.errorShortDescriptionTooLong",
  "url-invalid": "businessForm.errorUrlInvalid",
  "email-invalid": "businessForm.errorEmailInvalid",
  "services-invalid": "businessForm.errorServicesInvalid",
  "create-failed": "businessForm.errorCreateFailed",
  "update-failed": "businessForm.errorUpdateFailed",
  "slug-exhausted": "businessForm.errorSlugExhausted",
};

export function businessFormErrorKey(code: string | undefined): WorkspaceCopyKey {
  if (!code) return "businessForm.errorGeneric";
  return businessFormErrorKeys[code] ?? "businessForm.errorGeneric";
}

const organizationFormErrorKeys: Record<string, WorkspaceCopyKey> = {
  "name-required": "organizationForm.errorNameRequired",
  "url-invalid": "organizationForm.errorUrlInvalid",
  "email-invalid": "organizationForm.errorEmailInvalid",
  "missing-info": "organizationForm.errorMissingInfo",
  "create-failed": "organizationForm.errorCreateFailed",
  "update-failed": "organizationForm.errorUpdateFailed",
};

export function organizationFormErrorKey(code: string | undefined): WorkspaceCopyKey {
  if (!code) return "organizationForm.errorGeneric";
  return organizationFormErrorKeys[code] ?? "organizationForm.errorGeneric";
}
