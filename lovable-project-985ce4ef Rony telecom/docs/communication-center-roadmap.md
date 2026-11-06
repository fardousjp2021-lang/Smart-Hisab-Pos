# Communication Center — Roadmap (short form)

| Version | Focus                 | Key deliverables                                                                 |
|---------|-----------------------|----------------------------------------------------------------------------------|
| v1.0    | SMS foundation ✅     | Channel registry, permissions, templates+vars, automation toggles, provider UI   |
| v1.1    | WhatsApp Business     | WABA credentials, approved templates, channel flag flip, dispatcher hook         |
| v1.2    | Email                 | SMTP/Resend provider, subject+HTML templates, PDF receipt attach                 |
| v1.3    | Web/App Push          | VAPID + FCM keys, audience selector, endpoint history                            |
| v1.4    | Automation dispatcher | Domain event bus, per-workspace channel priority + fallback, Firestore sync      |
| v1.5    | Analytics             | Delivery trend, cost report per template/channel, open/read rates                |

Adding a channel is a single-record change in `CHANNELS`; UI plumbing (selector, history filter, template dropdown, cost, badges, coming-soon strip) already reads from that registry.
