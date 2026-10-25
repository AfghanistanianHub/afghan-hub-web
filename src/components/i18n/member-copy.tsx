"use client";
import { useSiteLanguage } from "@/components/i18n/localized";
const labels = {
 en: {back:"Back to network",about:"About",profile:"Profile",expertise:"Expertise",skills:"Skills",noBio:"This member has not added a biography yet.",noSkills:"No skills have been added.",mentor:"Mentorship",open:"Open to mentoring",looking:"Looking for a mentor",note:"These are member-selected preferences, not a credential or endorsement by Afghan Hub.",languages:"Languages",noLanguages:"No languages added.",links:"Links",website:"Website"},
 fa: {back:"بازگشت به شبکه",about:"درباره",profile:"پروفایل",expertise:"تخصص",skills:"مهارت‌ها",noBio:"این عضو هنوز شرح‌حالی ثبت نکرده است.",noSkills:"هنوز مهارتی ثبت نشده است.",mentor:"راهنمایی حرفه‌ای",open:"آماده راهنمایی دیگران",looking:"در جست‌وجوی راهنما",note:"این موارد انتخاب خود عضو هستند و به معنای تأیید صلاحیت یا توصیه افغان هاب نیستند.",languages:"زبان‌ها",noLanguages:"هنوز زبانی ثبت نشده است.",links:"پیوندها",website:"وب‌سایت"},
 ps: {back:"شبکې ته بېرته",about:"په اړه",profile:"پروفایل",expertise:"تخصص",skills:"مهارتونه",noBio:"دې غړي تر اوسه ژوندلیک نه دی لیکلی.",noSkills:"تر اوسه مهارتونه نه دي ثبت شوي.",mentor:"لارښوونه",open:"نورو ته د لارښوونې لپاره چمتو",looking:"د لارښود په لټه کې",note:"دا د غړي خپلې ټاکنې دي، د افغان هاب له خوا تصدیق یا سپارښتنه نه ده.",languages:"ژبې",noLanguages:"تر اوسه ژبې نه دي ثبت شوې.",links:"اړیکې",website:"وېبپاڼه"}
} as const;
export type MemberCopyKey = keyof typeof labels.en;
export function MemberCopy({id}:{id:MemberCopyKey}) {const lang=useSiteLanguage();return <span lang={lang} dir={lang==="en"?"ltr":"rtl"}>{labels[lang][id]}</span>}
