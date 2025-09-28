const nodeCron = require("node-cron");
const Reminder = require("../models/Reminder");
const { sendEmail } = require("../services/email");
const Event = require("../models/Event");

// Runs every minute, sends due reminders
function startReminderWorker() {
  nodeCron.schedule("* * * * *", async () => {
    const now = new Date();
    const due = await Reminder.find({ status: "scheduled", sendAt: { $lte: now } }).limit(50);
    for (const r of due) {
      try {
        const event = await Event.findById(r.event);
        await sendEmail({
          to: r.recipient,
          subject: `Reminder: ${event?.title || "Event"}`,
          html: `<p>Your event ${event?.title} starts at ${event?.startAt}</p>`,
        });
        r.status = "sent";
        await r.save();
      } catch (e) {
        r.status = "failed";
        r.error = e.message;
        await r.save();
      }
    }
  });
}

module.exports = { startReminderWorker };






