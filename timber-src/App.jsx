import { Fragment, useMemo, useState } from "react";
import {
  calculateMeasurementRow,
  validateMeasurementInput
} from "./domain/calculations.js";
import { calculateInvoice } from "./domain/invoice.js";
import {
  clearDemoInvoices,
  deleteInvoice,
  listInvoices,
  saveInvoice
} from "./storage.js";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2
});

const quantity = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const makeRow = (overrides = {}) => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  tMm: "",
  lMm: "",
  pfValue: "",
  pfUnit: "ft",
  pieces: "",
  ...overrides
});

const blankHeader = () => ({
  billNo: "",
  partyName: "",
  billDate: today(),
  lorryNo: "",
  itemType: ""
});

const blankInvoice = () => ({
  id: null,
  createdAt: null,
  header: blankHeader(),
  rows: [makeRow()],
  pricingBasis: "cft",
  rate: "",
  discount: "0",
  taxPercent: "18",
  paid: "0"
});

const sampleInvoice = () => ({
  ...blankInvoice(),
  header: {
    billNo: "DEMO-2026-001",
    partyName: "Greenline Timber Demo Co.",
    billDate: today(),
    lorryNo: "TN 00 DEMO 1234",
    itemType: "Synthetic teak sample"
  },
  rows: [
    makeRow({ tMm: "42", lMm: "95", pfValue: "12", pfUnit: "ft", pieces: "8" }),
    makeRow({ tMm: "58", lMm: "145", pfValue: "3658", pfUnit: "mm", pieces: "4" })
  ],
  pricingBasis: "cft",
  rate: "1850",
  discount: "250",
  taxPercent: "18",
  paid: "5000"
});

function normaliseSavedInvoice(saved) {
  const fresh = blankInvoice();
  return {
    ...fresh,
    ...saved,
    header: { ...fresh.header, ...(saved.header || {}) },
    rows: Array.isArray(saved.rows) && saved.rows.length
      ? saved.rows.map((row) => makeRow(row))
      : [makeRow()]
  };
}

function isRowBlank(row) {
  return !String(row.tMm).trim()
    && !String(row.lMm).trim()
    && !String(row.pfValue).trim()
    && !String(row.pieces).trim();
}

function readInvoiceHistory() {
  try {
    return {
      invoices: listInvoices().filter((item) => item && typeof item === "object" && item.id),
      error: ""
    };
  } catch (error) {
    return { invoices: [], error: error.message || "Saved invoice history could not be read." };
  }
}

function validateForm(draft, invoice) {
  const formErrors = [];
  if (!draft.header.billNo.trim()) formErrors.push("Bill number is required.");
  if (!draft.header.partyName.trim()) formErrors.push("Party name is required.");
  if (!draft.header.billDate) formErrors.push("Bill date is required.");
  if (!Number.isFinite(Number(draft.rate)) || Number(draft.rate) <= 0) {
    formErrors.push("Rate must be greater than zero.");
  } else if (Number(draft.rate) > 100_000_000) {
    formErrors.push("Rate is outside the supported demo range.");
  }
  if (!Number.isFinite(Number(draft.discount)) || Number(draft.discount) < 0) {
    formErrors.push("Discount cannot be negative.");
  }
  if (Number(draft.discount) > invoice.subtotal) {
    formErrors.push("Discount cannot be greater than the subtotal.");
  }
  if (!Number.isFinite(Number(draft.taxPercent))
    || Number(draft.taxPercent) < 0
    || Number(draft.taxPercent) > 100) {
    formErrors.push("GST must be between 0 and 100 percent.");
  }
  if (!Number.isFinite(Number(draft.paid)) || Number(draft.paid) < 0) {
    formErrors.push("Paid amount cannot be negative.");
  }

  const rowErrors = draft.rows.map((row) => (
    isRowBlank(row) ? ["Complete this row or remove it."] : validateMeasurementInput(row)
  ));
  if (!draft.rows.length) formErrors.push("Add at least one measurement row.");

  for (const error of invoice.errors || []) {
    const rowMatch = /^Row (\d+):\s*(.+)$/.exec(error);
    if (rowMatch) {
      const rowIndex = Number(rowMatch[1]) - 1;
      const alreadyCovered = rowErrors[rowIndex]?.length
        && rowErrors[rowIndex].every((rowError) => rowMatch[2].includes(rowError));
      if (rowErrors[rowIndex] && !alreadyCovered && !rowErrors[rowIndex].includes(rowMatch[2])) {
        rowErrors[rowIndex].push(rowMatch[2]);
      }
    } else if (error.startsWith("Rate must") && formErrors.some((item) => item.startsWith("Rate "))) {
      continue;
    } else if (!formErrors.includes(error)) {
      formErrors.push(error);
    }
  }

  return { formErrors, rowErrors, valid: !formErrors.length && rowErrors.every((errors) => !errors.length) };
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function BillHeader({ header, onChange }) {
  const update = (field, value) => onChange({ ...header, [field]: value });
  return (
    <section className="section" aria-labelledby="bill-heading">
      <div className="section-heading">
        <div>
          <h2 id="bill-heading">Bill details</h2>
          <p>Identify the customer and timber delivery.</p>
        </div>
      </div>
      <div className="header-fields">
        <Field label="Bill number *">
          <input value={header.billNo} onChange={(event) => update("billNo", event.target.value)} maxLength={80} />
        </Field>
        <Field label="Party name *" className="field-wide">
          <input value={header.partyName} onChange={(event) => update("partyName", event.target.value)} maxLength={140} />
        </Field>
        <Field label="Bill date *">
          <input type="date" value={header.billDate} onChange={(event) => update("billDate", event.target.value)} />
        </Field>
        <Field label="Lorry number">
          <input value={header.lorryNo} onChange={(event) => update("lorryNo", event.target.value)} maxLength={80} />
        </Field>
        <Field label="Item / wood type">
          <input value={header.itemType} onChange={(event) => update("itemType", event.target.value)} maxLength={120} />
        </Field>
      </div>
    </section>
  );
}

function PricingPanel({ draft, onChange }) {
  const update = (field, value) => onChange({ ...draft, [field]: value });
  return (
    <section className="section" aria-labelledby="pricing-heading">
      <div className="section-heading">
        <div>
          <h2 id="pricing-heading">Pricing</h2>
          <p>Amounts are calculated in Indian rupees.</p>
        </div>
      </div>
      <div className="pricing-fields">
        <Field label="Pricing basis">
          <select value={draft.pricingBasis} onChange={(event) => update("pricingBasis", event.target.value)}>
            <option value="cft">CFT</option>
            <option value="m3">M3</option>
          </select>
        </Field>
        <Field label={`Rate per ${draft.pricingBasis.toUpperCase()} *`}>
          <input type="number" min="0" step="0.01" value={draft.rate} onChange={(event) => update("rate", event.target.value)} />
        </Field>
        <Field label="Discount">
          <input type="number" min="0" step="0.01" value={draft.discount} onChange={(event) => update("discount", event.target.value)} />
        </Field>
        <Field label="GST %">
          <input type="number" min="0" max="100" step="0.01" value={draft.taxPercent} onChange={(event) => update("taxPercent", event.target.value)} />
        </Field>
        <Field label="Paid">
          <input type="number" min="0" step="0.01" value={draft.paid} onChange={(event) => update("paid", event.target.value)} />
        </Field>
      </div>
    </section>
  );
}

function MeasurementTable({ rows, calculatedRows, errors, showErrors, onChange, onAdd, onRemove }) {
  const update = (index, field, value) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  return (
    <section className="section measurements" aria-labelledby="measurement-heading">
      <div className="section-heading measurement-heading">
        <div>
          <h2 id="measurement-heading">Measurements</h2>
          <p>T and L use the established timber billing-inch rule.</p>
        </div>
        <button type="button" className="button button-secondary no-print" onClick={onAdd}>Add row</button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">T (mm)</th>
              <th scope="col">L (mm)</th>
              <th scope="col">PF length</th>
              <th scope="col">Unit</th>
              <th scope="col">Pieces</th>
              <th scope="col">CFT</th>
              <th scope="col">M3</th>
              <th scope="col">Amount</th>
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const calculated = calculatedRows[index] || calculateMeasurementRow(row);
              const rowHasErrors = showErrors && errors[index]?.length;
              return (
                <Fragment key={row.id}>
                  <tr className={rowHasErrors ? "row-invalid" : ""}>
                    <th scope="row">{index + 1}</th>
                    <td><input aria-label={`Row ${index + 1} thickness in millimetres`} type="number" min="0" step="0.1" value={row.tMm} onChange={(event) => update(index, "tMm", event.target.value)} /></td>
                    <td><input aria-label={`Row ${index + 1} width in millimetres`} type="number" min="0" step="0.1" value={row.lMm} onChange={(event) => update(index, "lMm", event.target.value)} /></td>
                    <td><input aria-label={`Row ${index + 1} length`} type="number" min="0" step="0.1" value={row.pfValue} onChange={(event) => update(index, "pfValue", event.target.value)} /></td>
                    <td>
                      <select aria-label={`Row ${index + 1} length unit`} value={row.pfUnit} onChange={(event) => update(index, "pfUnit", event.target.value)}>
                        <option value="ft">ft</option>
                        <option value="mm">mm</option>
                      </select>
                    </td>
                    <td><input aria-label={`Row ${index + 1} pieces`} type="number" min="1" step="1" value={row.pieces} onChange={(event) => update(index, "pieces", event.target.value)} /></td>
                    <td className="number-cell">{quantity.format(calculated.cft)}</td>
                    <td className="number-cell">{quantity.format(calculated.m3)}</td>
                    <td className="number-cell amount-cell">{money.format(calculated.amount || 0)}</td>
                    <td>
                      <button
                        type="button"
                        className="button button-danger button-small"
                        onClick={() => onRemove(index)}
                        disabled={rows.length === 1}
                        aria-label={`Remove measurement row ${index + 1}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  {rowHasErrors ? (
                    <tr className="row-invalid">
                      <td className="row-error" colSpan="10">{errors[index].join(" ")}</td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Totals({ invoice }) {
  const entries = [
    ["Total pieces", invoice.totalPieces.toLocaleString("en-IN")],
    ["Total CFT", quantity.format(invoice.totalCft)],
    ["Total M3", quantity.format(invoice.totalM3)],
    ["Subtotal", money.format(invoice.subtotal)],
    ["Discount", `− ${money.format(invoice.discount)}`],
    ["Taxable amount", money.format(invoice.taxableAmount)],
    [`GST (${invoice.taxPercent}%)`, money.format(invoice.taxAmount)],
    ["Grand total", money.format(invoice.grandTotal)],
    ["Paid", money.format(invoice.paid)],
    [invoice.changeDue > 0 ? "Change due" : "Balance due", money.format(invoice.changeDue || invoice.balance)]
  ];

  return (
    <section className="section totals-section" aria-labelledby="totals-heading">
      <div className="section-heading">
        <div>
          <h2 id="totals-heading">Invoice totals</h2>
          <p>Pricing basis: {invoice.pricingBasis.toUpperCase()}</p>
        </div>
      </div>
      <dl className="totals-list">
        {entries.map(([label, value], index) => (
          <div key={label} className={index === 7 || index === 9 ? "total-emphasis" : ""}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function History({ invoices, query, onQuery, onOpen, onDelete }) {
  const normalisedQuery = query.trim().toLowerCase();
  const filtered = invoices.filter((invoice) => {
    const header = invoice.header || {};
    return [header.billNo, header.partyName, header.lorryNo, header.itemType, header.billDate]
      .some((value) => String(value || "").toLowerCase().includes(normalisedQuery));
  });

  return (
    <section className="section history-section" aria-labelledby="history-heading">
      <div className="section-heading history-heading">
        <div>
          <h2 id="history-heading">Saved history</h2>
          <p>{invoices.length} invoice{invoices.length === 1 ? "" : "s"} stored in this browser.</p>
        </div>
        <label className="history-search">
          <span className="sr-only">Search saved invoices</span>
          <input type="search" placeholder="Search bill, party, lorry or item" value={query} onChange={(event) => onQuery(event.target.value)} />
        </label>
      </div>
      {filtered.length ? (
        <div className="history-list">
          {filtered.map((saved) => (
            <article className="history-item" key={saved.id}>
              <div>
                <strong>{saved.header?.billNo || "Untitled bill"}</strong>
                <span>{saved.header?.partyName || "No party"}</span>
                <small>{saved.header?.billDate || "No date"} · Updated {new Date(saved.updatedAt).toLocaleString("en-IN")}</small>
              </div>
              <div className="history-total">
                <span>{money.format(saved.summary?.grandTotal || 0)}</span>
                <small>{saved.summary?.totalPieces || 0} pieces</small>
              </div>
              <div className="history-actions">
                <button type="button" className="button button-secondary button-small" onClick={() => onOpen(saved)}>Reopen</button>
                <button type="button" className="button button-danger button-small" onClick={() => onDelete(saved)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">{invoices.length ? "No saved invoices match this search." : "No invoices saved yet."}</p>
      )}
    </section>
  );
}

export default function App() {
  const [initialHistory] = useState(readInvoiceHistory);
  const [draft, setDraft] = useState(blankInvoice);
  const [invoices, setInvoices] = useState(initialHistory.invoices);
  const [historyError, setHistoryError] = useState(initialHistory.error);
  const [query, setQuery] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [message, setMessage] = useState(initialHistory.error ? "Saved history is unavailable until it is cleared." : "");

  const invoice = useMemo(() => calculateInvoice(draft.rows, {
    pricingBasis: draft.pricingBasis,
    rate: draft.rate,
    discount: draft.discount,
    taxPercent: draft.taxPercent,
    paid: draft.paid
  }), [draft]);

  const validation = useMemo(() => validateForm(draft, invoice), [draft, invoice]);

  const changeDraft = (next) => {
    setDraft(next);
    setMessage("");
  };

  const resetDraft = (ask = true) => {
    if (ask && !window.confirm("Reset the current invoice? Unsaved changes will be lost.")) return;
    setDraft(blankInvoice());
    setShowErrors(false);
    setMessage("New invoice ready.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadSample = () => {
    if (!window.confirm("Load synthetic sample data and replace the current invoice?")) return;
    setDraft(sampleInvoice());
    setShowErrors(false);
    setMessage("Synthetic sample loaded. No real customer data is included.");
  };

  const save = () => {
    setShowErrors(true);
    if (!validation.valid) {
      setMessage("Please fix the highlighted validation errors before saving.");
      return;
    }

    try {
      const saved = saveInvoice({
        id: draft.id,
        createdAt: draft.createdAt,
        header: draft.header,
        rows: draft.rows,
        pricingBasis: draft.pricingBasis,
        rate: draft.rate,
        discount: draft.discount,
        taxPercent: draft.taxPercent,
        paid: draft.paid,
        summary: {
          totalPieces: invoice.totalPieces,
          totalCft: invoice.totalCft,
          totalM3: invoice.totalM3,
          grandTotal: invoice.grandTotal,
          balance: invoice.balance
        }
      });
      setDraft(normaliseSavedInvoice(saved));
      setInvoices(listInvoices());
      setShowErrors(false);
      setMessage(`Saved ${saved.header.billNo} in this browser.`);
    } catch (error) {
      setMessage(`Could not save locally: ${error.message}`);
    }
  };

  const openSaved = (saved) => {
    if (!window.confirm(`Open ${saved.header?.billNo || "this invoice"} and replace the current editor?`)) return;
    setDraft(normaliseSavedInvoice(saved));
    setShowErrors(false);
    setMessage(`Opened ${saved.header?.billNo || "saved invoice"}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeSaved = (saved) => {
    if (!window.confirm(`Permanently delete ${saved.header?.billNo || "this saved invoice"} from this browser?`)) return;
    try {
      deleteInvoice(saved.id);
      setInvoices(listInvoices());
      if (draft.id === saved.id) resetDraft(false);
      setMessage("Saved invoice deleted from this browser.");
    } catch (error) {
      setMessage(`Could not delete the invoice: ${error.message}`);
    }
  };

  const clearDamagedHistory = () => {
    if (!window.confirm("Clear the damaged browser-local invoice history? This cannot be undone.")) return;
    try {
      clearDemoInvoices();
      setInvoices([]);
      setHistoryError("");
      setMessage("Damaged browser-local history was cleared.");
    } catch (error) {
      setMessage(`Could not clear local history: ${error.message}`);
    }
  };

  const printInvoice = () => {
    setShowErrors(true);
    if (!validation.valid) {
      setMessage("Fix validation errors before printing the invoice.");
      return;
    }
    window.print();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Timber CFT Pro + Billing</h1>
          <p>Working prototype for timber measurement, pricing and invoice totals.</p>
        </div>
        <div className="header-actions no-print">
          <button type="button" className="button button-secondary" onClick={loadSample}>Load sample</button>
          <button type="button" className="button button-secondary" onClick={() => resetDraft(true)}>Reset</button>
          <button type="button" className="button button-secondary" onClick={printInvoice}>Print / Save PDF</button>
          <button type="button" className="button button-primary" onClick={save}>Save locally</button>
        </div>
      </header>

      <aside className="privacy-note" aria-label="Privacy information">
        <strong>Privacy:</strong> invoices are stored only in this browser using local storage. Nothing is uploaded. Avoid entering real customer data on a shared device. The sample data is entirely synthetic.
      </aside>

      {message ? <p className="status-message" role="status">{message}</p> : null}
      {historyError ? (
        <div className="validation-summary no-print" role="alert">
          <strong>Saved history could not be loaded.</strong>
          <p>{historyError}</p>
          <button type="button" className="button button-danger button-small" onClick={clearDamagedHistory}>
            Clear damaged local history
          </button>
        </div>
      ) : null}
      {showErrors && validation.formErrors.length ? (
        <div className="validation-summary" role="alert">
          <strong>Invoice needs attention:</strong>
          <ul>{validation.formErrors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      <main>
        <div className="editor-grid">
          <div className="editor-main">
            <BillHeader header={draft.header} onChange={(header) => changeDraft({ ...draft, header })} />
            <PricingPanel draft={draft} onChange={changeDraft} />
          </div>
          <Totals invoice={invoice} />
        </div>

        <MeasurementTable
          rows={draft.rows}
          calculatedRows={invoice.rows}
          errors={validation.rowErrors}
          showErrors={showErrors}
          onChange={(rows) => changeDraft({ ...draft, rows })}
          onAdd={() => changeDraft({ ...draft, rows: [...draft.rows, makeRow()] })}
          onRemove={(index) => changeDraft({ ...draft, rows: draft.rows.filter((_, rowIndex) => rowIndex !== index) })}
        />

        <div className="bottom-actions no-print">
          <button type="button" className="button button-secondary" onClick={() => changeDraft({ ...draft, rows: [...draft.rows, makeRow()] })}>Add measurement row</button>
          <button type="button" className="button button-secondary" onClick={printInvoice}>Print / Save PDF</button>
          <button type="button" className="button button-primary" onClick={save}>Save invoice locally</button>
        </div>

        <div className="no-print">
          <History
            invoices={invoices}
            query={query}
            onQuery={setQuery}
            onOpen={openSaved}
            onDelete={removeSaved}
          />
        </div>
      </main>

      <footer className="app-footer no-print">
        Functional-first prototype. Calculation and billing logic run entirely in the browser.
      </footer>
    </div>
  );
}
