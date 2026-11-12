/**
 * تاریخ‌ها: تبدیل میلادی به شمسی با الگوریتم استاندارد jalaali-js
 * (بدون وابستگی خارجی) و قالب‌بندی با رقم‌های فارسی.
 *
 * تاریخ‌های frontmatter (مثل 2026-10-05) به‌صورت تاریخ تقویمی در UTC
 * در نظر گرفته می‌شوند تا نمایش، در هر منطقه‌ی زمانی یکسان بماند.
 */

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
  1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function div(a, b) {
  return ~~(a / b);
}

function mod(a, b) {
  return a - ~~(a / b) * b;
}

/** محاسبه‌ی سال کبیسه و روز اول اسفند برای سال شمسی. */
function jalCal(jy) {
  const breaksLength = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];

  if (jy < jp || jy >= BREAKS[breaksLength - 1]) {
    throw new Error(`سال شمسی نامعتبر است: ${jy}`);
  }

  let jump = 0;
  for (let i = 1; i < breaksLength; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) {
      break;
    }
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }

  return { leap, gy, march };
}

/** تبدیل تاریخ میلادی به شماره‌ی روز ژولینی. */
function g2d(gy, gm, gd) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
    + div(153 * mod(gm + 9, 12) + 2, 5)
    + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** تبدیل شماره‌ی روز ژولینی به تاریخ میلادی. */
function d2g(jdn) {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** تبدیل شماره‌ی روز ژولینی به تاریخ شمسی. */
function d2j(jdn) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) {
      k += 1;
    }
  }

  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

export function toPersianDigits(value) {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** تبدیل شیء Date (میلادی) به تاریخ شمسی. */
export function toJalali(date) {
  return d2j(g2d(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()));
}

/** قالب «۱۳ مهر ۱۴۰۵» برای نمایش در صفحه. */
export function formatJalaliDate(date) {
  const { jy, jm, jd } = toJalali(date);
  return `${toPersianDigits(jd)} ${MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

/** تاریخ ماشین‌خوان (YYYY-MM-DD) برای ویژگی datetime و متادیتای سئو. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}
