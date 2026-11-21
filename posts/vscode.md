---
title: "ترفندهای کاربردی و قابلیت‌های کمترشناخته‌شده VS Code"
date: "2026-11-21"
description: "نگاهی فنی به نسخه‌های VS Code، مدیریت افزونه‌ها و قابلیت‌هایی که Workflow توسعه را بهبود می‌دهند."
tags:
  - VS Code
  - توسعه نرم‌افزار
  - ابزارهای برنامه‌نویسی
---

## نسخه‌های VS Code

VS Code در چند توزیع مختلف عرضه می‌شود:

- **Stable:** نسخه رسمی و پایدار مایکروسافت.
- **Insiders:** نسخه آزمایشی با دریافت زودتر قابلیت‌های جدید.
- **VSCodium:** بیلد مستقل مبتنی بر Code - OSS، بدون برندینگ مایکروسافت و با تنظیمات متفاوت Telemetry.

تفاوت مهم VSCodium با نسخه رسمی، فقط ظاهر و نام آن نیست؛ Marketplace، سرویس‌های اختصاصی و برخی قابلیت‌های مایکروسافت نیز متفاوت‌اند.

لینک‌ها:
- https://code.visualstudio.com/
- https://code.visualstudio.com/insiders/
- https://vscodium.com/

## ترفندهای کاربردی

### ۱. اجرای محیط مستقل

برای آزمایش افزونه‌ها بدون دست‌کاری تنظیمات اصلی:

```bash
code \
  --user-data-dir /tmp/vscode-test \
  --extensions-dir /tmp/vscode-extensions
```

### ۲. بررسی افزونه‌های نصب‌شده

```bash
code --list-extensions --show-versions
```

### ۳. جست‌وجوی پیشرفته با Regex

برای پیدا کردن TODO و FIXME در پروژه:

```regex
\b(TODO|FIXME)\b.*
```

گزینه Regex را در پنجره جست‌وجو فعال کنید.

### ۴. مدیریت تنظیمات پروژه

با فایل `.vscode/settings.json` می‌توان تنظیمات اختصاصی هر پروژه را تعریف کرد:

```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 4,
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "editor.bracketPairColorization.enabled": true
}
```

### ۵. اجرای دستورات با Tasks

فایل `.vscode/tasks.json` امکان اجرای دستورات تکراری را فراهم می‌کند.

مثلاً برای کامپایل پروژه Go:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build Go",
      "type": "shell",
      "command": "go build ./...",
      "problemMatcher": []
    }
  ]
}
```

## چند قابلیت که ارزش شناختن دارند

| قابلیت | کاربرد |
|---|---|
| Multi-root Workspace | مدیریت چند پوشه در یک محیط |
| Dev Containers | توسعه داخل کانتینر |
| Remote SSH | توسعه روی سیستم راه دور |
| Profiles | جداسازی تنظیمات و افزونه‌ها |
| Workspace Trust | محدودسازی اجرای خودکار در پروژه‌های ناشناس |
| Settings Sync | همگام‌سازی تنظیمات |

## چند میانبر مفید

- `F12` — رفتن به تعریف Symbol
- `Alt + F12` — مشاهده تعریف در پنجره Peek
- `Shift + F12` — پیدا کردن مراجع
- `Ctrl + T` — جست‌وجوی Symbol در Workspace
- `Ctrl + P` — باز کردن سریع فایل
- `Ctrl + Shift + P` — Command Palette

## جمع‌بندی

VS Code امکاناتی فراتر از ویرایش کد دارد. با استفاده از Tasks، Profiles، Workspace و ابزارهای Remote می‌توان یک محیط توسعه منظم و متناسب با هر پروژه ساخت.

مستندات رسمی: https://code.visualstudio.com/docs