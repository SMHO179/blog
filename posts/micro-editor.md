---
title: "Micro Editor؛ ویرایشگر مینیمال ترمینال"
date: "2026-11-21"
description: "معرفی Micro و قابلیت‌های فنی آن."
tags:
  - Linux
  - Micro
  - Terminal
  - Open Source
---

## Micro چیست؟

Micro یک ویرایشگر متن مدرن برای محیط ترمینال است که با زبان Go توسعه داده شده است. برخلاف Vim، برای استفاده از آن نیازی به یادگیری مجموعه‌ای از دستورات اختصاصی ندارید.

این ابزار با یک باینری مستقل عرضه می‌شود و قابلیت‌هایی مانند Syntax Highlighting، چند نشانگر هم‌زمان، Split، پلاگین و پشتیبانی از ماوس دارد.

وب‌سایت: https://micro-editor.github.io/

مخزن پروژه: https://github.com/micro-editor/micro

## قابلیت‌های فنی

- Syntax Highlighting برای زبان‌های مختلف
- پشتیبانی از Multiple Cursors
- سیستم افزونه مبتنی بر Lua
- پشتیبانی از True Color
- ویرایش چندفایلی با Tabs و Splits
- Undo پایدار
- ادغام با Clipboard سیستم
- نمایش تغییرات فایل با Diff Gutter
- پشتیبانی از ماوس و Unicode

## ترفندهای کاربردی

### ۱. دریافت ورودی از Pipe

Micro می‌تواند خروجی یک دستور را مستقیماً به‌عنوان محتوای یک Buffer دریافت کند.

```bash
ip addr | micro
```

این قابلیت برای بررسی و ویرایش خروجی دستورات کاربرد دارد.

### ۲. ویرایش چند نشانگری

با قابلیت Multiple Cursors می‌توان چند نقطه ویرایش ایجاد کرد و تغییرات را هم‌زمان اعمال کرد.

```text
Alt + Click
```

### ۳. استفاده از Split

برای باز کردن یک فایل در پنل جداگانه:

```text
Ctrl + E
vsplit filename.go
```

برای تقسیم افقی:

```text
Ctrl + E
hsplit README.md
```

### ۴. مدیریت افزونه‌ها

Micro از Lua برای توسعه افزونه‌ها استفاده می‌کند.

```bash
micro -plugin available
```

نصب افزونه:

```bash
micro -plugin install PLUGIN_NAME
```

مشاهده افزونه‌های نصب‌شده:

```bash
micro -plugin list
```

### ۵. تنظیمات شخصی

فایل تنظیمات اصلی در مسیر زیر قرار دارد:

```text
~/.config/micro/settings.json
```

نمونه تنظیمات:

```json
{
    "autosave": 0,
    "colorscheme": "monokai",
    "tabsize": 4,
    "tabstospaces": true,
    "softwrap": true,
    "ruler": true,
    "scrollbar": true,
    "diffgutter": true
}
```

### ۶. شخصی‌سازی Keybindings

مسیر فایل میانبرها:

```text
~/.config/micro/bindings.json
```

Micro اجازه می‌دهد میانبرهای پیش‌فرض را متناسب با Workflow خود تغییر دهید.

## چند میانبر مهم

| میانبر | عملکرد |
|---|---|
| Ctrl + S | ذخیره فایل |
| Ctrl + Q | خروج |
| Ctrl + E | Command Mode |
| Ctrl + F | جست‌وجو |
| Ctrl + G | راهنما |
| Ctrl + T | تب جدید |
| Ctrl + W | جابه‌جایی بین Splitها |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |

## نکته امنیتی

Micro برای ویرایش فایل‌های متنی مناسب است، اما نباید آن را جایگزین ابزارهای مدیریت دسترسی و امنیت سیستم دانست. هنگام ویرایش فایل‌های سیستمی، مجوزها و مسیر فایل را بررسی کنید.

## جمع‌بندی

Micro انتخاب مناسبی برای کسانی است که یک ویرایشگر سبک، مستقل و قابل شخصی‌سازی در ترمینال می‌خواهند.

ترکیب سادگی رابط کاربری، قابلیت‌های چندنشانگری و افزونه‌های Lua باعث شده Micro گزینه‌ای جدی‌تر از یک ویرایشگر متنی ساده باشد.