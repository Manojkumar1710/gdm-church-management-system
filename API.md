# GDM Church — API Reference

Base URL: `/api/v1`

All responses use the envelope:
```json
{ "success": true, "message": "OK", "data": {} }
```

Errors use:
```json
{ "timestamp": "...", "status": 400, "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": {} }
```

---

## Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login with email + password → JWT token |
| GET | `/auth/me` | Admin | Get current user info |

---

## Church Info & Hero

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/church` | Public | Get church information |
| PUT | `/admin/church` | Admin | Update church information |
| GET | `/hero` | Public | Get active hero section |
| GET | `/admin/heroes` | Admin | List all hero sections |
| POST | `/admin/heroes` | Admin | Create hero section |
| PUT | `/admin/heroes/{id}` | Admin | Update hero section |
| POST | `/admin/heroes/{id}/image` | Admin | Upload hero background image |
| DELETE | `/admin/heroes/{id}` | Admin | Delete hero section |

---

## Events

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/events` | Public | List all non-draft events (paginated) |
| GET | `/events/upcoming` | Public | List upcoming events |
| GET | `/events/{id}` | Public | Get event detail |
| GET | `/events/{id}/photos` | Public | Get published photos for event |
| GET | `/admin/events` | Admin | List all events (paginated) |
| POST | `/admin/events` | Admin | Create event |
| PUT | `/admin/events/{id}` | Admin | Update event |
| POST | `/admin/events/{id}/image` | Admin | Upload event image |
| DELETE | `/admin/events/{id}` | Admin | Delete event |

---

## Event Photos

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/event-photos/latest?limit=15` | Public | Latest published photos |
| GET | `/admin/event-photos?eventId=` | Admin | List photos (optionally filtered) |
| POST | `/admin/events/{eventId}/photos` | Admin | Upload multiple photos (multipart) |
| PATCH | `/admin/event-photos/{id}` | Admin | Update photo metadata / publish |
| DELETE | `/admin/event-photos/{id}` | Admin | Delete photo |

---

## Pastors & Schedule

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/pastors` | Public | Active pastors (public fields only) |
| GET | `/pastor-schedule?from=&to=` | Public | Upcoming schedules |
| GET | `/admin/pastors` | Admin | All pastors (paginated) |
| POST | `/admin/pastors` | Admin | Create pastor |
| PUT | `/admin/pastors/{id}` | Admin | Update pastor |
| POST | `/admin/pastors/{id}/photo` | Admin | Upload pastor photo |
| DELETE | `/admin/pastors/{id}` | Admin | Delete pastor |
| POST | `/admin/pastor-schedule` | Admin | Create schedule entry |
| PUT | `/admin/pastor-schedule/{id}` | Admin | Update schedule entry |
| DELETE | `/admin/pastor-schedule/{id}` | Admin | Delete schedule entry |

---

## Sermons & YouTube

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/sermons` | Public | Published sermons (paginated) |
| GET | `/sermons/{id}` | Public | Sermon detail |
| GET | `/youtube` | Public | Published YouTube videos (paginated) |
| GET | `/admin/sermons` | Admin | All sermons (paginated) |
| POST | `/admin/sermons` | Admin | Create sermon |
| PUT | `/admin/sermons/{id}` | Admin | Update sermon |
| POST | `/admin/sermons/{id}/thumbnail` | Admin | Upload thumbnail |
| DELETE | `/admin/sermons/{id}` | Admin | Delete sermon |
| GET | `/admin/youtube` | Admin | All videos (paginated) |
| POST | `/admin/youtube` | Admin | Add YouTube video |
| PUT | `/admin/youtube/{id}` | Admin | Update video |
| DELETE | `/admin/youtube/{id}` | Admin | Delete video |

---

## Gallery

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/gallery` | Public | Published items (paginated) |
| GET | `/admin/gallery` | Admin | All items (paginated) |
| POST | `/admin/gallery` | Admin | Upload gallery image |
| PATCH | `/admin/gallery/{id}` | Admin | Update metadata / publish |
| DELETE | `/admin/gallery/{id}` | Admin | Delete item |

---

## Offerings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/offering-purposes` | Public | Active offering purposes |
| POST | `/offerings` | Public | Submit offering record |
| GET | `/admin/offerings` | Admin | All offerings — PRIVATE |
| POST | `/admin/offerings` | Admin | Record offering manually |
| PATCH | `/admin/offerings/{id}/status` | Admin | Update offering status |
| POST | `/admin/offering-purposes` | Admin | Create purpose |
| DELETE | `/admin/offering-purposes/{id}` | Admin | Delete purpose |

---

## Prayer Requests

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/prayer-requests` | Public | Submit prayer request |
| GET | `/admin/prayer-requests` | Admin | All requests — PRIVATE |
| PATCH | `/admin/prayer-requests/{id}/status` | Admin | Update status |

---

## Contact Messages

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact-messages` | Public | Submit contact form |
| GET | `/admin/contact-messages` | Admin | All messages |
| PATCH | `/admin/contact-messages/{id}/status` | Admin | Update status |

---

## Sunday School

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/sunday-school/programs` | Public | Published programs |
| GET | `/admin/sunday-school/children` | Admin | Children — PRIVATE |
| POST | `/admin/sunday-school/children` | Admin | Add child |
| PUT | `/admin/sunday-school/children/{id}` | Admin | Update child |
| DELETE | `/admin/sunday-school/children/{id}` | Admin | Delete child |
| GET | `/admin/sunday-school/teachers` | Admin | All teachers |
| POST | `/admin/sunday-school/teachers` | Admin | Add teacher |
| PUT | `/admin/sunday-school/teachers/{id}` | Admin | Update teacher |
| POST | `/admin/sunday-school/teachers/{id}/photo` | Admin | Upload teacher photo |
| DELETE | `/admin/sunday-school/teachers/{id}` | Admin | Delete teacher |
| GET | `/admin/sunday-school/programs` | Admin | All programs |
| POST | `/admin/sunday-school/programs` | Admin | Create program |
| PUT | `/admin/sunday-school/programs/{id}` | Admin | Update program |
| DELETE | `/admin/sunday-school/programs/{id}` | Admin | Delete program |

---

## Admin Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Content statistics |
