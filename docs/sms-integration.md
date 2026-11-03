# اتصال آینده‌ی پیامک (آماده‌سازی؛ هیچ پیامکی ارسال نمی‌شود)

فعلاً هیچ سرویس پیامکی خریداری، متصل یا فعال نشده است. فقط معماری آماده است تا اتصال بعدی بدون دست‌زدن به منطق مدیریت تکنسین انجام شود.

## معماری

```
actions/admin/staff.ts ──▶ lib/sms/events.ts ──▶ lib/sms/service.ts (sendSms) ──▶ SmsProvider (adapter)
                                                     │                                  ▲
                                                     ├─ templates.ts (متن فارسی، فقط در حافظه)   │
                                                     └─ outbox.ts (idempotency + وضعیت)   lib/sms/providers/index.ts (ثبت adapterها)
```

| فایل | نقش |
| --- | --- |
| `lib/sms/types.ts` | قراردادها: `SmsProvider`، `SmsOutbox`، `SmsRequest`، `SmsOutcome`، فهرست قالب‌ها |
| `lib/sms/config.ts` | فقط `SMS_ENABLED` و `SMS_PROVIDER` از env سمت سرور (`server-only`) |
| `lib/sms/service.ts` | تنها نقطه‌ی ارسال: `sendSms()`. هرگز throw نمی‌کند، لاگ حداقلی، کنترل تکرار |
| `lib/sms/events.ts` | رویدادهای کسب‌وکار: دعوت تکنسین، لینک رمز، تخصیص جدید، تغییر/لغو |
| `lib/sms/templates.ts` | قالب‌های فارسی و پارامترهای الزامی |
| `lib/sms/outbox.ts` | `nullOutbox` (فعلی) و `databaseOutbox` (جدول `sms_outbox`) |
| `lib/sms/providers/` | `disabled` (فعلی) و registry برای adapterهای آینده |
| `supabase/migrations/20261101170000_sms_outbox.sql` | جدول وضعیت ارسال (اختیاری، هنوز اجرا نشده) |

## رفتار فعلی

- `SMS_ENABLED` پیش‌فرض `false` است؛ `sendSms()` فوراً `skipped/disabled` برمی‌گرداند، به شبکه وصل نمی‌شود و چیزی ثبت نمی‌کند.
- حتی اگر `SMS_ENABLED=true` شود ولی adapter ثبت نشده باشد، نتیجه `skipped/not_configured` است.
- ساخت تکنسین به پیامک وابسته نیست: حساب با رمز اولیه‌ی مدیر ساخته می‌شود. شکست یا غیرفعال بودن پیامک هیچ حساب یا داده‌ای را ناقص یا حذف نمی‌کند.

## امنیت

- کلید و تنظیمات فقط در env سمت سرور (بدون پیشوند `NEXT_PUBLIC_`)؛ `config.ts` و `outbox.ts` با `server-only` از Client Bundle بیرون می‌مانند.
- adapter کلید را خودش هنگام ارسال از `process.env` می‌خواند؛ هیچ‌جا در شیء پیکربندی کپی نمی‌شود.
- لاگ فقط قالب، شماره‌ی ماسک‌شده (`0912***6789`) و نتیجه را می‌نویسد؛ هرگز متن پیام، لینک، کد یا شماره‌ی کامل.
- جدول `sms_outbox` ستونی برای متن، لینک یا شماره‌ی کامل ندارد و RLS آن بسته است (فقط با کلید سرور نوشته می‌شود).
- کنترل تکرار: کلید یکتا مثل `assignment_new:<requestId>:<technicianId>:<assignedAt>`؛ ثبت دوباره‌ی همان کلید `skipped/duplicate` می‌شود.

## برای فعال‌سازی در آینده چه چیزهایی لازم است

1. **سرویس پیامک ایرانی**: انتخاب ارائه‌دهنده (مثلاً کاوه‌نگار، ملی‌پیامک، قاصدک و …) و خرید پنل.
2. **اطلاعات پنل**: کلید API، شماره/خط ارسال، و اگر ارائه‌دهنده قالب تأییدشده می‌خواهد (الگوی verify/lookup)، شناسه‌ی قالب‌ها. متن قالب‌های `templates.ts` باید با قالب‌های تأییدشده هماهنگ شود.
3. **ثبت adapter**: فایل `lib/sms/providers/<name>.ts` که `SmsProvider` را پیاده کند، سپس ثبت در `providers/index.ts`.
4. **متغیرهای محیطی سرور** (روی هاست، نه Git): `SMS_ENABLED=true`، `SMS_PROVIDER=<name>`، `SMS_API_KEY`، `SMS_SENDER_NUMBER`.
5. **اجرای migration** `20261101170000_sms_outbox.sql` (ترجیحاً اول روی پروژه‌ی تست).
6. **لینک امن رمز/دعوت**: با Supabase Auth و `auth.admin.generateLink` (نوع `invite` یا `recovery`) در سرور؛ همراه یک صفحه‌ی تعیین رمز. سپس `notifyTechnicianInvited` / `notifyPasswordLink` صدا زده شود (نقطه‌ی اتصال در `actions/admin/staff.ts`، کامنت «Future SMS hook»). لینک فقط به پیامک می‌رود و ذخیره یا لاگ نمی‌شود.
7. **اتصال اعلان تخصیص**: بعد از موفقیت `assignTechnicianAction` در `actions/admin/requests.ts`، شماره‌ی تکنسین (از `technician_profiles.phone`) خوانده شود و `notifyAssignment` صدا زده شود. قبل از آن بررسی حریم‌خصوصی و رضایت تکنسین لازم است.
8. **تست**: ارسال به شماره‌ی خود مدیر در پروژه‌ی تست، بررسی ردیف `sms_outbox` و اینکه هیچ متن یا لینکی در لاگ نیست.
9. **ملاحظات**: محدودیت نرخ ارسال، سقف هزینه، سیاست تلاش مجدد (ردیف `failed` با `attempts`)، و ساعات مجاز ارسال.
