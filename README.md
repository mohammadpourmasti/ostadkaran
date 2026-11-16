# استادکاران

وب‌سایت و پنل مدیریت «استادکاران»: تعمیر و نصب لوازم خانگی در اراک و استان مرکزی (دامنه: `ostadkaranarak.ir`).

- **سایت عمومی:** صفحه‌ی اصلی، صفحه‌ی هر خدمت (`/services/<slug>`)، ثبت درخواست تعمیر، راهنمای کدهای خطا (`/error-codes`)، معرفی بنیان‌گذار.
- **پنل مدیریت (`/admin`):** درخواست‌ها، تکنسین‌ها، گزارش و خروجی CSV. فقط برای کارکنان فعال با نقش مدیر یا اپراتور.

## فناوری‌ها

Next.js 16 (App Router، `proxy.ts` به‌جای middleware)، React 19، TypeScript، Tailwind CSS 4، Supabase (Postgres + Auth). فونت Vazirmatn با `next/font`.

> نسخه‌ی Next.js این پروژه با آنچه ممکن است بشناسید تفاوت دارد. پیش از نوشتن کد، راهنمای مربوط را در `node_modules/next/dist/docs/` بخوانید (به `AGENTS.md` نگاه کنید).

## پیش‌نیازها

- Node.js 20.9 یا بالاتر و npm
- یک پروژه‌ی Supabase (برای ثبت درخواست‌ها، کدهای خطا و پنل مدیریت)

## نصب و اجرای محلی

```bash
npm install
cp .env.example .env.local   # سپس مقدارها را پر کنید (فایل .env.local هرگز commit نمی‌شود)
npm run dev                  # http://localhost:3000
```

بدون تنظیم Supabase صفحه‌های عمومی بالا می‌آیند، ولی ثبت درخواست، کدهای خطا (از دیتابیس) و ورود به پنل کار نمی‌کنند.

## متغیرهای محیطی

فهرست کامل و توضیح هر متغیر در [`.env.example`](.env.example) است. مهم‌ترین‌ها:

| متغیر | کاربرد |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | آدرس سایت برای canonical، sitemap، robots و JSON-LD (بدون `/` پایانی). در محیط production باید تنظیم شود. |
| `NEXT_PUBLIC_SUPABASE_URL` | آدرس پروژه‌ی Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | کلید عمومی؛ فقط برای نشست ورود به پنل |
| `SUPABASE_SECRET_KEY` | کلید **فقط سروری** (دور زدن RLS). هرگز با `NEXT_PUBLIC_` شروع نشود و در Client Component وارد نشود. |
| `TRUSTED_IP_HEADER` | نام هدری که زیرساخت با IP واقعی بازدیدکننده می‌گذارد (`cf-connecting-ip` یا `x-real-ip`). خالی = محدودیت بر پایه‌ی IP خاموش. |
| `SMS_ENABLED`، `SMS_PROVIDER`، … | آماده‌سازی پیامک؛ فعلاً هیچ سرویسی متصل نیست (`docs/sms-integration.md`). |

## دیتابیس و migrationها

فایل‌ها در `supabase/migrations/` هستند (۱۱ فایل). **همه‌ی آن‌ها روی دیتابیس واقعی اعمال شده‌اند** (با SQL editor؛ جدول تاریخچه‌ی Supabase CLI وجود ندارد، پس `db push` نزنید). این فهرست برای ساخت دیتابیس تازه است. هیچ‌کدام خودکار اجرا نمی‌شوند؛ آن‌ها را در SQL editor یا با `supabase db push` اجرا کنید (ترجیحاً اول روی یک پروژه‌ی آزمایشی). ترتیب:

1. `20261001000000_baseline_repair_requests.sql`: ساخت جدول `repair_requests` **فقط برای دیتابیس تازه**. اگر جدول وجود داشته باشد هیچ کاری نمی‌کند.
2. `20261012120000_add_brand_to_repair_requests.sql`: ستون برند و تابع ۵پارامتری ثبت درخواست.
3. `20261028120000_create_error_codes_table.sql` و `20261028130000_enhance_error_codes_verification.sql`: کدهای خطا.
4. migrationهای `20261101*`: پنل مدیریت (پروفایل کارکنان، یادداشت‌ها، توابع، تخصیص تکنسین، گزارش، پروفایل تکنسین، صف پیامک).

جزئیات راه‌اندازی پنل و ساخت اولین مدیر: [`supabase/admin-dashboard-setup.md`](supabase/admin-dashboard-setup.md).

**نکته:** جدول `repair_requests` و تابع ۴پارامتری اولیه‌ی ثبت درخواست در پروژه‌ی زنده‌ی Supabase دستی ساخته شده بودند. فایل baseline فقط برای بازسازی از صفر نوشته شده و ساختار جدول زنده را با آن تطبیق نداده‌ایم.

## دستورهای توسعه

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build       # ساخت production
npm run start       # اجرای نسخه‌ی ساخته‌شده
```

## ساختار پوشه‌ها

- `app/`: صفحه‌ها و مسیرها (`app/admin` پنل، `app/api/error-codes` جست‌وجو)
- `actions/`: Server Actionها (ثبت درخواست، توکن فرم، عملیات ادمین)
- `components/`، `data/`، `types/`: رابط کاربری، محتوای خدمات و برندها، نوع‌ها
- `lib/`: منطق مشترک (`admin`، `security`، `seo`، `sms`، `supabase`، `error-codes`)
- `supabase/`: migrationها و راهنمای راه‌اندازی
- `proxy.ts`: نوسازی نشست Supabase و هدایت بازدیدکننده‌ی بدون ورود از `/admin` به صفحه‌ی ورود (کنترل دسترسی اصلی نیست)

## امنیت

- **دسترسی پنل:** در `lib/admin/auth.ts` (`requireStaff`) برای هر صفحه و Server Action، و دوباره داخل توابع `SECURITY DEFINER` دیتابیس. جدول‌های حساس RLS دارند و دسترسی `anon` و `authenticated` از آن‌ها گرفته شده است.
- **هدرها:** `next.config.ts` هدرهای `X-Content-Type-Options`، `X-Frame-Options`، `Referrer-Policy` و `Permissions-Policy` را می‌گذارد و `X-Powered-By` را حذف می‌کند. مسیرهای `/admin` اضافه بر آن `no-store` و `noindex` هستند. Content-Security-Policy و HSTS هنوز تنظیم نشده‌اند (HSTS را لایه‌ی میزبانی بگذارد؛ CSP را باید بر پایه‌ی وابستگی‌های واقعی و اول در حالت report-only نوشت).
- **ضدّ اسپم فرم درخواست:** honeypot، توکن امضاشده‌ی سروری (حداقل ۳ ثانیه، حداکثر ۲ ساعت، حداکثر ۵ بار استفاده)، محدودیت بر پایه‌ی IP و محدودیت کلی، جلوگیری از ثبت تکراری، و محدودیت ۳ درخواست در ساعت برای هر شماره داخل دیتابیس.
- **محدودیت‌های فعلی:** rate limit بر پایه‌ی IP و محدودیت کلی (و شمارنده‌ی استفاده از توکن) فقط در حافظه‌ی همان پروسه نگه داشته می‌شوند. با restart یا چند instance (مثلاً serverless) ریست یا جدا می‌شوند، پس خط دفاع اول‌اند. محدودیت شماره در دیتابیس مشترک و قطعی است. اگر `TRUSTED_IP_HEADER` تنظیم نشود، محدودیت IP کاملاً خاموش است. در صورت نیاز، یک ذخیره‌ی مشترک (مثل Redis) جایگزین شود.

## استقرار

- **میزبان:** VPS با Ubuntu؛ اپ پشت **Nginx** (reverse proxy) اجرا می‌شود و با یک سرویس **systemd** مدیریت می‌شود.
- ساخت با `npm run build` و اجرا با `npm run start` (پورت با `PORT`؛ Nginx به همان پورت proxy می‌کند). نمونه‌ی زیر فقط الگو است؛ مسیر و کاربر را با سرور واقعی تطبیق دهید:

  ```ini
  # /etc/systemd/system/ostadkaran.service  (نمونه)
  [Service]
  WorkingDirectory=/var/www/ostadkaran
  EnvironmentFile=/var/www/ostadkaran/.env.production
  ExecStart=/usr/bin/npm run start
  Restart=always
  User=www-data
  ```

  پس از هر استقرار: `npm ci && npm run build && sudo systemctl restart ostadkaran`.
- در Nginx برای تشخیص IP واقعی: `proxy_set_header X-Real-IP $remote_addr;` و در env مقدار `TRUSTED_IP_HEADER=x-real-ip`. HSTS و TLS را هم Nginx بگذارد.
- `assets-original/` نسخه‌ی اصلی تصاویر بهینه‌شده را نگه می‌دارد (در اجرا لازم نیست). migration پایه (`20261001000000_baseline_repair_requests.sql`) پیش‌نویس است و **تا بررسی ساختار دیتابیس فعلی اجرا نمی‌شود**.
- پیش از هر استقرار: migrationهای لازم را اجرا کنید (**قبل از** انتشار نسخه‌ی اپ که به آن‌ها وابسته است؛ مثلاً اپ فعلی تابع ۵پارامتری ثبت درخواست را صدا می‌زند).
- در production باید `NEXT_PUBLIC_SITE_URL` و متغیرهای Supabase تنظیم شده باشند. اگر پشت Cloudflare یا nginx هستید `TRUSTED_IP_HEADER` را هم بگذارید.
- شاخه‌ی اصلی: `master`.
