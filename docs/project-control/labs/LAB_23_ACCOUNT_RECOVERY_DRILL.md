# Lab 23 - Account Recovery Drill Composer

## User and problem

A family or small-team security coordinator needs to rehearse loss of a device, phone, or primary email without exposing real credentials or accidentally initiating account recovery. The coordinator needs to identify correlated recovery dependencies, assign follow-up work, and prepare a safe emergency card before an actual lockout occurs.

## Certificate connection

Cybersecurity Essentials: applies multifactor-authentication concepts, authenticator loss, recovery-method diversity, recovery notifications, identity lifecycle thinking, least disclosure, incident preparation, and defensive tabletop exercises.

## Inputs and useful output

The user enters up to 20 category-only rows using this grammar:

```text
account label | importance | primary MFA | recovery methods | notification channel
```

The grammar accepts only a generic account label and controlled categories. Importance is `low`, `medium`, `high`, or `critical`; primary MFA is `authenticator-app`, `security-key`, `sms`, `passkey`, or `none`; recovery methods come from `saved-code`, `backup-device`, `recovery-email`, `recovery-phone`, `recovery-contact`, and `provider-support`; notification channels are similarly categorical. The user selects device-loss, phone-loss, or email-loss scenarios.

The local composer reports correlated recovery single points, notification gaps, and shared recovery dependencies. It generates ordered no-secret tabletop steps, a verification and notification checklist, emergency cards containing categories rather than credentials, and owned next actions with expected evidence.

## Differentiator

This is not a password manager, provider-recovery wizard, live account scanner, credential vault, or attack simulator. It models dependency categories across multiple important accounts and produces a rehearsal package that is explicitly designed to remain useful after all identifying and secret data is removed.

## Safety

The lab never asks for or stores a username, email address, phone number, password, recovery code, secret answer, private key, or actual notification address. Account labels follow a label-only allowlist rather than accepting arbitrary text. For example, `username=deepan` is rejected because `=` is outside the allowed generic-label grammar; email-like labels, URLs, and long digit sequences are also rejected.

The drill repeatedly instructs participants not to start a real recovery or enter a code. It directs them to locate the provider's official recovery route from a known-safe device and stop before submission. It does not contact a provider, test actual access, change an authenticator, or claim that a listed recovery category is currently valid.

## Implementation and verification

`accountRecoveryDrill.js` performs bounded category parsing, label-only validation, scenario dependency analysis, correlated-risk detection, emergency-card construction, owned action generation, and source attribution. `AccountRecoveryDrillComposer.jsx` provides the accessible local form, selectable scenarios, findings, tabletop package, and limitations.

Focused tests cover deterministic scenario findings, single points, notification gaps, emergency-card counts, no-secret artifacts, malformed rows, unsupported categories, missing scenarios, official-source boundaries, email-like labels, and explicit rejection of the unsafe `username=deepan` input.

At the final Batch 6 checkpoint, the complete Node suite passed **126/126 tests**, and all portfolio, labs, and flagship production builds passed.

## Official sources

- [NIST SP 800-63B: Account recovery](https://pages.nist.gov/800-63-4/sp800-63b.html#account-recovery)
- [FTC: How to recover a hacked email or social-media account](https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account)
- [CISA: Turn on multifactor authentication](https://www.cisa.gov/secure-our-world/turn-mfa)

## Limitations

The analysis uses only the rows and scenarios supplied by the user. It cannot confirm which methods a provider supports, whether a backup is usable, whether notifications arrive, whether a provider has changed its process, or whether a real account is compromised. Correlation rules are conservative planning signals rather than a security audit. An authorized account owner or security coordinator must verify every recovery and notification path through the provider's official settings and procedures without copying secrets into the drill.
