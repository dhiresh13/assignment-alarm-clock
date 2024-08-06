#!/usr/bin/env node

const readline = require('readline');

class AlarmClock {
    constructor() {
        this.alarms = [];
        this.rl = this.createReadlineInterface();
        this.checkingAlarms = false;
    }

    createReadlineInterface() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    currentTime() {
        const date = new Date();
        const ts = `${date.toDateString()} ${date.toLocaleTimeString()}`;
        return ts;
    }

    isValidTime(time) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return timeRegex.test(time);
    }

    isValidDay(day) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        return days.includes(day.toLowerCase());
    }

    addAlarm(time, day) {
        this.alarms.push(new Alarm(time, day));
    }

    deleteAlarm(index) {
        if (index >= 0 && index < this.alarms.length) {
            this.alarms.splice(index, 1);
            return true;
        }
        return false;
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        return this.alarms.find(alarm =>
            alarm.active &&
            alarm.day.toLowerCase() === currentDay &&
            alarm.time <= currentTime
        ) || null;
    }

    start() {
        console.log("Alarm CLI Application!!!");
        this.displayMenu();
        this.checkAlarmsInterval = setInterval(() => this.checkAndTriggerAlarms(), 1000);
    }

    displayMenu() {
        console.log(`\nCurrent time: ${this.currentTime()}`);
        console.log("0. Refresh Time");
        console.log("1. Add alarm");
        console.log("2. Delete alarm");
        console.log("3. List alarms");
        console.log("4. Exit");

        this.rl.question("Enter your choice: ", (choice) => this.handleChoice(choice));

    }

    handleChoice(choice) {
        switch (choice) {
            case '0':
                this.displayMenu();
                break;
            case '1':
                this.rl.question("Please Enter the alarm time in 24h Format (HH:MM): ", (time) => {
                    this.rl.question("Enter day of the week: ", (day) => {
                        if (!this.isValidTime(time) || !this.isValidDay(day)) {
                            console.log("Invalid format. Please enter correct time in HH:MM format and valid day of the week");
                            this.displayMenu();
                            return;
                        }

                        this.addAlarm(time.trim(), day.trim());
                        console.log("Alarm added successfully.");
                        this.displayMenu();
                    });
                });
                break;
            case '2':
                this.rl.question("Enter alarm index to delete: ", (index) => {
                    if (this.deleteAlarm(parseInt(index))) {
                        console.log("\n Alarm deleted successfully.");
                    } else {
                        console.log("Invalid alarm index.");
                    }
                    this.displayMenu();
                });
                break;
            case '3':
                this.alarms.forEach((alarm, index) => {
                    const status = alarm.active ? 'active' : 'inactive';
                    console.log(`\n ${index}. ${alarm.time} on ${alarm.day} is ${status}`);
                });
                this.displayMenu();
                break;
            case '4':
                clearInterval(this.checkAlarmsInterval);
                this.rl.close();
                process.exit();
                break;
            default:
                console.log("Invalid choice. Please try again.");
                this.displayMenu();
        }
    }

    checkAndTriggerAlarms() {
        if (this.checkingAlarms) return;
        this.checkingAlarms = true;

        const alarm = this.checkAlarms();
        if (alarm) {
            console.log(`\nALARM! It's ${alarm.time} on ${alarm.day}`);
            this.rl.close();

            this.rl = this.createReadlineInterface();
            this.rl.question("Snooze? (y/n): ", (answer) => {
                if (answer.toLowerCase() === 'y' && alarm.snooze()) {
                    console.log(`Alarm snoozed for 5 minutes. Next alert at ${alarm.time}`);
                } else {
                    alarm.active = false;
                    console.log("Alarm dismissed.");
                }
                this.checkingAlarms = false;
                this.rl.close();
                this.rl = this.createReadlineInterface();
                this.displayMenu();
            });
        } else {
            this.checkingAlarms = false;
        }
    }
}

class Alarm {
    constructor(time, day) {
        this.time = time;
        this.day = day;
        this.active = true;
        this.snoozeCount = 0;
    }

    snooze() {
        if (this.snoozeCount < 3) {
            this.snoozeCount++;
            const date = new Date();
            const [hours, minutes] = this.time.split(':');
            date.setHours(parseInt(hours), parseInt(minutes) + 5);
            this.time = date.toTimeString().slice(0, 5);
            return true;
        }
        return false;
    }
}

const alarmClock = new AlarmClock();
alarmClock.start();
