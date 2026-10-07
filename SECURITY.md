# Security Policy

## Supported versions

Only the `main` branch of **Garissa Bursary Management System** is maintained. Security fixes are applied to `main`; older commits, forks and copies are not supported.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for security problems.

Email **intelligence@tovutech.com** with:

- a description of the issue and where it is (file, URL or page),
- steps to reproduce it, and
- the impact you think it has.

We aim to acknowledge reports within a few working days and will tell you when a fix is published. Please give us reasonable time to fix the issue before disclosing it publicly.

## Secrets and personal data

- **Never commit secrets** (API keys, passwords, tokens, private keys, service-account files) to this repository.
- Keys belong in environment variables, a local `.env` file (ignored by git; copy from `.env.example` where one exists) or your hosting platform's secret store.
- Keys that must run in a browser (for example a public web API key) must be restricted in the provider's console to the site's domain and to the APIs it needs.
- Personal data (names, phone numbers, ID numbers, applicant or staff records) must not be committed. Use synthetic or anonymised samples for demos and tests.
- The Firebase web config in `firebase_config.js` is a public client identifier, not a password. Protect the data with the Firestore rules in `firestore.rules`, restrict the API key to the site's domain in Google Cloud, and keep admin credentials in Firebase Auth only — never in code.
- Applicant records contain personal data (names, ID numbers, phone numbers, family details). Never commit exports, screenshots of real applications or test data copied from real applicants.
- Signature and stamp images are for generating official letters; access to the admin dashboard must be limited to authorised fund administrators.

If you find a secret or personal data in this repository or its history, report it to the address above so it can be removed and the credential rotated.

---

Maintained by TovuTech Limited · https://www.tovutech.com
