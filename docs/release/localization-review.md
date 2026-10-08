# Navigator language review

English is the source interface. Dari (`fa-AF`) now uses a complete separate resource with Afghan usage such as تکنالوژی, تجارت, نهاد and برنامه. Persian (`fa`) retains its own resource. Both use هنرمندان و فعالان خلاق for Artists & Creatives. Pashto (`ps`) retains its separate resource. All three translated resources are **machine drafts awaiting native review**; completeness, matching keys, RTL behavior and representative structured searches do not establish linguistic accuracy.

Both the compact homepage Navigator and the signed-in drawer now expose four correctly labeled locales. The signed-in drawer previously mislabeled Persian as Dari. Resources are separate in `navigator-copy-dari.ts` and `member-navigator-copy-dari.ts`; both retain complete keys. Switching language during a search now derives announcements from the current locale rather than retaining the previous-language notice.

## Lightweight review workflow

1. Assign one community reviewer for each locale, including distinct Dari and Persian reviewers. Record reviewer, date and reviewed commit in this document; none is currently assigned.
2. Review the entire Navigator in context: direct prompts, guided goal/interest/location questions, Back/Skip/Restart, loading, empty/partial/error/retry states, privacy disclosure, engine labels and accessible names.
3. Check inclusive creative terminology, natural register, culturally appropriate wording, Afghan versus Iranian terms, punctuation, dates, mixed English names, input direction and narrow-screen line wrapping. Confirm that mode labels communicate structured search honestly.
4. Submit focused resource edits. Run `node --test tests/guided-discovery.test.mjs tests/public-navigator.test.mjs tests/member-navigator-locales.test.mjs tests/navigator-notice.test.mjs`, TypeScript and actual mobile/desktop RTL browser checks.
5. Reviewer signs off on the tested commit. Only then change `navigatorLocaleReview` to native-reviewed for that locale. New or materially changed strings reopen review.

## Pending checklist

- [ ] Dari: wording, Afghan usage, forms, messages, prompts, disclosure and screen-reader labels.
- [ ] Persian: inclusive terminology, forms, messages, prompts, disclosure and screen-reader labels.
- [ ] Pashto: spelling, natural phrasing, forms, messages, prompts, disclosure and screen-reader labels.
- [ ] All locales: dates/month understanding and mixed-script location names in live model evaluations.
- [ ] Public listing content: remains in its original language; automatic content translation is not implemented.

Structured multilingual matching is bounded alias/intent matching. It is not general multilingual semantic understanding. Live model language quality has not been evaluated.
