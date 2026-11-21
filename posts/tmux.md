---
title: "tmux ترفندهای کاربردی "
date: "2026-11-21"
description: "---"
tags:
  - Linux
  - tmux
  - Terminal
  - CLI
  - Open Source
---

## ترفندهای کاربردی

### ۱. ساخت Session هوشمند

ایجاد Session جدید یا اتصال به Session قبلی با یک دستور:

```bash
tmux new-session -A -s development
```

مشاهده تمام Sessionها:

```bash
tmux ls
```

اتصال به Session مشخص:

```bash
tmux attach -t development
```

بستن یک Session:

```bash
tmux kill-session -t development
```

### ۲. مدیریت سریع Paneها

تقسیم ترمینال به دو بخش:

```bash
tmux split-window -h
tmux split-window -v
```

تغییر اندازه Pane فعال:

```bash
tmux resize-pane -L 10
tmux resize-pane -R 10
tmux resize-pane -U 5
tmux resize-pane -D 5
```

جابجایی بین Paneها:

```text
Ctrl + B سپس Arrow Keys
```

بزرگ‌نمایی Pane فعال:

```text
Ctrl + B سپس Z
```

بستن Pane فعال:

```text
Ctrl + B سپس X
```

تبدیل Pane فعال به یک Window مستقل:

```bash
tmux break-pane
```

### ۳. اجرای هم‌زمان دستور در چند Pane

یکی از قابلیت‌های جالب tmux امکان Synchronize کردن Paneها است.

فعال‌سازی:

```bash
tmux setw synchronize-panes on
```

غیرفعال‌سازی:

```bash
tmux setw synchronize-panes off
```

با فعال بودن این قابلیت، دستورات تایپ‌شده در Pane فعال به تمام Paneهای همان Window ارسال می‌شوند.

کاربردها:
- اجرای دستورات یکسان روی چند سرور
- بررسی هم‌زمان چند محیط
- مدیریت چند ترمینال SSH

**نکته:** هنگام فعال بودن این قابلیت، دستورات حساس ممکن است در تمام Paneها اجرا شوند.

### ۴. تغییر Layout پنجره‌ها

tmux چند Layout آماده برای مدیریت Paneها دارد.

```bash
tmux select-layout tiled
```

چند Layout کاربردی دیگر:

```bash
tmux select-layout even-horizontal
tmux select-layout even-vertical
tmux select-layout main-horizontal
tmux select-layout main-vertical
```

مشاهده Layoutهای موجود:

```bash
tmux list-commands | grep layout
```

### ۵. جابه‌جایی Pane بین Windowها

انتقال Pane از یک Window به Window دیگر:

```bash
tmux join-pane -s development:1.0 -t development:2
```

تعویض جای Paneها:

```bash
tmux swap-pane -U
tmux swap-pane -D
```

### ۶. جست‌وجو در تاریخچه ترمینال

ورود به Copy Mode:

```text
Ctrl + B سپس [
```

فعال‌کردن جست‌وجو در حالت vi:

```text
/
```

برای رفتن به نتیجه بعدی:

```text
n
```

برای نتیجه قبلی:

```text
N
```

برای استفاده از کلیدهای حرکتی vi در Copy Mode:

```bash
setw -g mode-keys vi
```

### ۷. ذخیره خروجی ترمینال در فایل

ذخیره ۱۰۰۰ خط آخر خروجی یک Pane:

```bash
tmux capture-pane -pS -1000 > output.txt
```

ذخیره خروجی ترمینال در فایل به‌صورت پیوسته:

```bash
tmux pipe-pane -o 'cat >> ~/tmux-output.log'
```

توقف ذخیره‌سازی:

```bash
tmux pipe-pane
```

این روش برای ثبت خروجی برنامه‌ها و بررسی Logها مفید است.

### ۸. مشاهده اطلاعات Paneها

نمایش وضعیت Paneهای فعال:

```bash
tmux list-panes -a -F \
'#{session_name}:#{window_index}.#{pane_index} #{pane_current_command} #{pane_current_path}'
```

نمایش اطلاعات Session فعلی:

```bash
tmux display-message -p '#S'
```

نمایش مسیر کاری Pane فعال:

```bash
tmux display-message -p '#{pane_current_path}'
```

### ۹. استفاده از Windowهای نام‌گذاری‌شده

ایجاد Window با نام مشخص:

```bash
tmux new-window -n logs
```

تغییر نام Window فعلی:

```text
Ctrl + B سپس ,
```

انتخاب Window مشخص:

```bash
tmux select-window -t logs
```

شروع شماره‌گذاری Windowها از ۱:

```bash
tmux set -g base-index 1
```

### ۱۰. ساخت محیط توسعه با یک دستور

می‌توان با ترکیب دستورات tmux یک محیط توسعه آماده ایجاد کرد.

```bash
tmux new-session -d -s dev -n editor

tmux split-window -h -t dev:editor

tmux split-window -v -t dev:editor.1

tmux new-window -t dev -n logs

tmux select-window -t dev:editor

tmux attach -t dev
```

در این مثال:
- Window اول برای ویرایش کد است.
- Pane دوم برای اجرای دستورات استفاده می‌شود.
- Pane سوم برای ابزارهای جانبی در نظر گرفته شده است.
- Window دوم برای مشاهده Logها ایجاد می‌شود.

## تنظیمات کاربردی

فایل تنظیمات:

```text
~/.tmux.conf
```

نمونه تنظیمات پیشنهادی:

```bash
# Enable mouse support
set -g mouse on

# Use vi keys in copy mode
setw -g mode-keys vi

# Increase scrollback history
set -g history-limit 50000

# Start window numbering from 1
set -g base-index 1

# Start pane numbering from 1
setw -g pane-base-index 1

# Automatically renumber windows
set -g renumber-windows on

# Keep status bar at the bottom
set -g status-position bottom

# Change prefix to Ctrl+A
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Reload configuration
bind r source-file ~/.tmux.conf \; display-message "Config reloaded"
```

اعمال مجدد تنظیمات:

```bash
tmux source-file ~/.tmux.conf
```

## چند Alias کاربردی

برای دسترسی سریع‌تر می‌توان Aliasهای زیر را به فایل `~/.bashrc` اضافه کرد:

```bash
alias t='tmux'
alias tl='tmux ls'
alias tn='tmux new-session'
alias ta='tmux attach -t'
alias tk='tmux kill-session -t'
```

پس از ذخیره فایل:

```bash
source ~/.bashrc
```

اکنون برای مشاهده Sessionها کافی است بنویسید:

```bash
tl
```


## جمع‌بندی

ترکیب دستورهای مدیریتی، Paneهای هم‌زمان، Layoutهای مختلف و فایل تنظیمات، tmux را به ابزاری انعطاف‌پذیر برای ساخت محیط‌های کاری حرفه‌ای در ترمینال تبدیل می‌کند.