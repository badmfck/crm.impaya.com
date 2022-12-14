"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormatter = void 0;
class DateFormatter {
    format(time, mask) {
        let date = this.getDate(time);
        if (date == null)
            date = new Date();
        const h = this.leadZero(date.getHours());
        const i = this.leadZero(date.getMinutes());
        const s = this.leadZero(date.getSeconds());
        const y = this.leadZero(date.getFullYear());
        const u = y.substring(2);
        const d = this.leadZero(date.getDate());
        const m = this.leadZero(date.getMonth() + 1);
        const wday = date.toLocaleDateString("en-EN", { weekday: 'long' });
        const mnth = date.toLocaleDateString("en-EN", { month: 'long' });
        return mask.replace(/%y/g, y).replace(/%m/g, m).replace(/%d/g, d).replace(/%h/g, h).replace(/%i/g, i).replace(/%s/g, s).replace(/%w/g, wday).replace(/%M/g, mnth).replace(/%u/g, u);
    }
    dateOrTime(time) {
        const date = this.getDate(time);
        const today = new Date();
        if (today.getDate() != date.getDate() && today.getMonth() != date.getMonth() && today.getFullYear() != date.getFullYear())
            return this.leadZero(date.getDate()) + "." + this.leadZero(date.getMonth()) + "." + date.getFullYear();
        else
            return this.leadZero(date.getHours()) + ":" + this.leadZero(date.getMinutes());
    }
    leadZero(num) {
        return (num < 10) ? "0" + num : "" + num;
    }
    getDayOfYear(time) {
        let now = this.getDate(time);
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);
        return day;
    }
    getGlobalDay(time) {
        return parseInt(this.format(time, "%y%m%d"));
    }
    getAge(time) {
        if (!time)
            return -1;
        const date = this.getDate(time);
        if (!date)
            return -1;
        const now = new Date();
        return now.getFullYear() - date.getFullYear();
    }
    getDate(time) {
        const tmp = (time + "").split(".");
        if (tmp.length === 3 && tmp[0].length === 2) {
            let m = parseInt(tmp[1]);
            let d = parseInt(tmp[0]);
            if (isNaN(m))
                m = 11;
            if (!isNaN(d))
                d = 31;
            return new Date(parseInt(tmp[2]), m, d);
        }
        let ts = 0;
        let date = null;
        if (typeof time == "string") {
            let tmp = time.replace(/\D/g, "");
            if (tmp.length == time.length) {
                ts = parseInt(time);
            }
            else {
                console.log("todo Parse data string!");
            }
        }
        else if (typeof time == "number") {
            if (time == 0)
                return new Date();
            ts = time;
        }
        else if (time instanceof Date) {
            date = time;
        }
        else {
            console.error("can't format time from given object " + time);
            return new Date();
        }
        if (ts > 0) {
            if ((ts + "").length < 11)
                ts *= 1000;
        }
        if (ts > 0 && !date)
            date = new Date(ts);
        return date;
    }
    formatAgo(time) {
        if (time === 0)
            return Math.round(Math.random() * 5) + " sec";
        const date = this.getDate(time);
        if (date == null)
            return "millenium";
        if (date.getDay() != new Date().getDay()) {
            return this.format(date, "%h:%i");
        }
        const tme = Math.floor(date.getTime() / 1000);
        const now = Math.floor((+new Date()) / 1000);
        let diff = Math.floor((now - time) / 60);
        const d1 = new Date();
        const d2 = new Date();
        d2.setHours(0, 0, 0);
        const dd = 86400 - Math.round(d1.getTime() - d2.getTime()) / 1000;
        if (diff === 0) {
            return "30 sec";
        }
        if (diff < 60)
            return diff + " min";
        diff = Math.floor(diff / 60);
        if (diff == 1)
            return diff + " hour";
        if (diff < 24)
            return diff + " hours";
        if (diff >= 24 && diff < 48)
            return "yesterday";
        if (diff >= 48) {
            const days = Math.floor(diff / 24);
            return days + " days";
        }
        return this.format(date, "%h:%i");
    }
}
exports.DateFormatter = DateFormatter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZUZvcm1hdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9EYXRlRm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLE1BQWEsYUFBYTtJQUV0QixNQUFNLENBQUMsSUFBUSxFQUFDLElBQVc7UUFDdkIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixJQUFHLElBQUksSUFBRSxJQUFJO1lBQ1QsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7UUFFckIsTUFBTSxDQUFDLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN2QyxNQUFNLENBQUMsR0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxHQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDekMsTUFBTSxDQUFDLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsR0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxHQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFFekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FB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