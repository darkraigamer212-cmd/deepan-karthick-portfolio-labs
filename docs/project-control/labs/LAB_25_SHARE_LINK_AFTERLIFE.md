# Lab 25 - Share-Link Afterlife Rehearsal

## User and problem

A small-team owner is about to share a sensitive document and needs to understand what expiry or revocation can actually recover. Provider access may be removable, but downloaded files, copied content, screenshots, caches, and forwarded notification metadata can survive. The owner needs a minimum-access decision, an explicit residue ledger, and evidence-bearing expiry steps before creating the real share.

## Certificate connection

IT Security: Defense against the digital dark arts: applies least privilege, access scope, permission minimization, expiration, revocation, data-loss prevention, recipient-held copies, control verification, security ownership, and evidence-based sharing decisions.

## Inputs and useful output

The user supplies bounded generic metadata only:

- a generic artifact label and internal, confidential, or restricted classification;
- up to 12 rows using `role|business need|view/edit|required days`;
- a provider access mode: specific recipients, organization-wide, or anyone with the link;
- view or edit permission and a 1–365 day expiry; and
- yes/no residue capabilities for download, copy, screenshot, cache, and forwarded notification.

The local rehearsal calculates the minimum specific-recipient access, required permission, and shortest supported expiry. It identifies access, permission, or expiry corrections; can issue proceed-after-corrections, safer-channel, or do-not-share gates; and produces:

- a ledger separating provider-revocable access from non-revocable or not-reliably-revocable residue;
- an owner and expected evidence for every ledger entry;
- pre-share, expiry, signed-out, former-recipient, cache, and acknowledgement checks; and
- a copyable pre-share and expiry contract.

The screenshot row remains a non-revocable risk even when the user does not expect capture, because a provider setting cannot disprove endpoint or camera capture.

## Differentiator and prior-art boundary

Secure-sharing settings, data-loss-prevention products, permission reviews, link scanners, and provider expiry controls already exist. Public prior-art searching was not exhaustive and does not establish worldwide novelty.

This lab is not a privacy checklist, link scanner, DLP service, provider configuration page, or secure-file-transfer system. Its locked differentiator is rehearsing the document's **afterlife**: it distinguishes access the provider can revoke from copies and metadata the provider cannot pull back, then binds the sharing decision to owner/evidence, expiry verification, and a safer-channel or do-not-share gate.

## Safety and privacy boundaries

The lab rejects URLs, email-like identities, token-like links, and identifying recipient rows. It never requests or receives a file, file content, recipient name, address, credential, access token, provider tenant, or real sharing link. It makes no provider call and does not create, open, inspect, revoke, expire, forward, download, cache, or delete anything.

The ledger intentionally does not claim that recipient acknowledgement proves deletion. It also distinguishes provider-disabled download from external copying or capture. A do-not-share result is a planning stop, not a guarantee that another channel is safe; restricted material still requires the organization's data owner and security policy.

## Official foundation

- [CISA SharePoint and OneDrive Secure Configuration Baseline](https://www.cisa.gov/sites/default/files/2023-12/SharePoint%20and%20OneDrive%20SCB_12.20.2023.pdf) provides the official foundation for restrictive link types, view-oriented defaults, bounded public-link expiry, and verification of sharing configuration. The lab generalizes those planning principles and does not claim to configure Microsoft or any other provider.

## Implementation and testing

`shareLinkAfterlife.js` contains bounded metadata parsing, identity/link rejection, minimum-access calculation, residue-sensitive gating, the revocable/non-revocable ledger, owned evidence, verification steps, and contract generation. `ShareLinkAfterlifeRehearsal.jsx` renders the accessible browser-local form, residue controls, example/reset workflow, ledger, checks, and copy action.

Focused tests in `tests/lab25-share-link-afterlife.test.mjs` passed **4/4** and prove:

- organization-wide access and excessive expiry are narrowed in the example;
- downloaded and screenshot residue remains explicitly non-revocable;
- restricted material can be blocked even when link expiry is only one day;
- unnecessary edit permission is downgraded to view; and
- identities, URLs, malformed rows, and unconfirmed residue metadata fail validation without producing a ledger.

The React component also passed Vite JSX transformation. Shared-route integration, full-build, and rendered browser evidence are recorded at the batch level rather than invented in this isolated implementation note.

## Limitations

The rehearsal uses declared capabilities and generic roles; it cannot inspect effective permissions, group inheritance, guest accounts, synced devices, provider logs, retention systems, legal holds, screenshots, browser caches, message forwarding, or recipient behavior. Provider controls and terminology vary and can change. The gate is a conservative decision aid, not proof of confidentiality, deletion, policy compliance, or legal approval. An authorized owner must verify the actual provider configuration, organization policy, recipient handling agreement, and post-expiry evidence.
