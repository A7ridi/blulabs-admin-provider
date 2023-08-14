export default class Timer {
    constructor(offset) {
        this.offset = offset || 0;
        this.timer = null
        this.secondsToHms.bind(this)
    }

    start(handler = () => { }, interval = 1000) {
        this.timer = setInterval(handler, interval);
    }

    stop() {
        clearInterval(this.timer)
        this.offset = 0
    }

    time() {
        this.offset += 1;
        let time = this.secondsToHms(this.offset).time;
        return time
    }

    secondsToHms(d) {
        d = Number(d);
        let h = Math.floor(d / 3600);
        let m = Math.floor((d % 3600) / 60);
        let s = Math.floor((d % 3600) % 60);

        let hrs = h < 10 ? `0${h}` : h;
        let mins = m < 10 ? `0${m}` : m;
        let secs = s < 10 ? `0${s}` : s;

        return {
            hours: h,
            mins: m,
            seconds: s,
            time: `${hrs}:${mins}:${secs}`
        };
    }
}