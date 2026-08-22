# Timber CFT Pro + Billing Functional Specification

Status: Batch 1A implementation

## Product boundary

There are two editions:

1. Private Windows edition - the supplied Express/SQLite application for offline client use.
2. Public portfolio demo - a static application using only synthetic data and storage inside the reviewer's browser.

The public demo must never connect to or contain the supplied SQLite databases.

## Locked timber rules

- Business inches use `millimetres / 20`, not the physical 25.4 mm conversion.
- Positive dimensions round upward to the next 0.5 inch.
- Minimum positive billing dimension is 1.5 inches.
- CFT = rounded thickness inches x rounded width inches x length feet x pieces / 144.
- ICBM = CFT / 35.315.
- M3 uses raw millimetres and actual length in metres.
- PF may be entered in feet or millimetres.

These rules are isolated in `timber-src/domain/calculations.js` and require golden tests before modification.

## Financial billing model

Invoice metadata:

- Bill number
- Party/customer name
- Bill date
- Lorry number
- Item type

Pricing:

- Basis: CFT or M3
- Non-negative rate in INR
- Non-negative invoice discount
- GST percentage from 0 to 100
- Non-negative amount paid

Derived values:

- Row amount = selected measurement quantity x rate
- Subtotal = sum of rounded row amounts
- Taxable amount = maximum of zero and subtotal minus discount
- GST = taxable amount x GST percentage
- Grand total = taxable amount plus GST
- Balance = maximum of zero and grand total minus paid
- Change due = maximum of zero and paid minus grand total

## Functional workflow

1. Start with synthetic example data or a blank invoice.
2. Enter customer and bill information.
3. Add, edit, or remove measurement rows.
4. See CFT, M3, line amount, and invoice totals update immediately.
5. Correct validation problems before saving.
6. Save the invoice to browser-local storage.
7. Search history and reopen an invoice.
8. Delete only after confirmation.
9. Print or use the browser's Save as PDF action.

## Privacy statement

The public demo stores invoices only in the current browser. It has no account, server database, analytics requirement, or cloud synchronization. Users must use synthetic data in the public demo.

## Initial acceptance tests

- Preserve known business-inch boundaries.
- Match the supplied CFT and M3 formulas.
- Support PF feet and millimetres.
- Reject zero, negative, non-integer piece counts, and unsafe upper ranges.
- Calculate CFT billing with discount, GST, payment, and balance.
- Calculate M3 billing and overpayment change.
- Save, reopen, search, print, and delete using synthetic browser-local data.
