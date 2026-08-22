import{r as m,j as e}from"./index-C6qJ66RN.js";const v=["age|integer|0..120|yes","temperature_c|decimal|-40..125|yes","operator_note|text|80|no"].join(`
`),g="",w=new Set(["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Alignas","_Alignof","_Atomic","_Bool","_Complex","_Generic","_Imaginary","_Noreturn","_Static_assert","_Thread_local"]);function S(a){return String(a).replaceAll("\\","\\\\").replaceAll('"','\\"').replaceAll(`
`,"\\n").replaceAll("\r","\\r").replaceAll("	","\\t")}function $(a,n,r,s){const t=String(a).trim(),o=t.indexOf("..");if(o<=0||o!==t.lastIndexOf("..")||o>=t.length-2)return s.push(`Line ${r}: ${n} bounds must use min..max.`),null;const i=Number(t.slice(0,o).trim()),l=Number(t.slice(o+2).trim());return!Number.isFinite(i)||!Number.isFinite(l)?s.push(`Line ${r}: bounds must be finite numbers.`):i>=l?s.push(`Line ${r}: minimum bound must be less than maximum.`):Math.abs(i)>1e9||Math.abs(l)>1e9?s.push(`Line ${r}: bounds exceed the supported ±1000000000 range.`):n==="integer"&&(!Number.isSafeInteger(i)||!Number.isSafeInteger(l))&&s.push(`Line ${r}: integer bounds must be safe whole numbers.`),{minimum:i,maximum:l}}function C(a){const n=String(a??"").split(/\r?\n/).map(o=>o.trim()).filter(Boolean),r=[];if(!n.length)return{valid:!1,errors:["Enter at least one console field specification."],fields:[]};n.length>20&&r.push("Use 20 fields or fewer in one generated harness.");const s=[],t=new Set;return n.forEach((o,i)=>{const l=i+1,h=o.split("|").map(j=>j.trim());if(h.length!==4){r.push(`Line ${l} must contain four pipe-separated fields.`);return}const[d,y,f,_]=h,c=y.toLowerCase(),x=_.toLowerCase();/^[A-Za-z_][A-Za-z0-9_]{0,30}$/.test(d)?w.has(d)?r.push(`Line ${l}: name is a reserved C keyword.`):t.has(d)?r.push(`Line ${l}: field name must be unique.`):t.add(d):r.push(`Line ${l}: name must be a C identifier of 1–31 characters.`),new Set(["integer","decimal","text"]).has(c)||r.push(`Line ${l}: type must be integer, decimal, or text.`),new Set(["yes","no"]).has(x)||r.push(`Line ${l}: required must be yes or no.`);let b=null,u=null;c==="integer"||c==="decimal"?b=$(f,c,l,r):c==="text"&&(u=Number(f),(!Number.isInteger(u)||u<1||u>512)&&r.push(`Line ${l}: text maximum length must be a whole number from 1 to 512.`)),s.push({id:`field-${l}`,name:d,type:c,required:x==="yes",bounds:b,maxLength:u})}),{valid:r.length===0,errors:r,fields:r.length?[]:s}}function p(a){return Number.isInteger(a)?String(a):Number(a).toString()}function E(a){return a.flatMap(n=>{if(n.type==="text")return[{field:n.name,case:"maximum accepted length",input:`"x" repeated ${n.maxLength} times`,expected:"accept"},{field:n.name,case:"one character too long",input:`"x" repeated ${n.maxLength+1} times`,expected:"reject and reprompt"},{field:n.name,case:"empty input",input:"empty line",expected:n.required?"reject and reprompt":"accept as empty"}];const{minimum:r,maximum:s}=n.bounds,t=n.type==="integer"?1:Math.max(.001,Math.abs(s-r)/1e3);return[{field:n.name,case:"lower boundary",input:String(r),expected:"accept"},{field:n.name,case:"upper boundary",input:String(s),expected:"accept"},{field:n.name,case:"below lower boundary",input:String(r-t),expected:"reject and reprompt"},{field:n.name,case:"above upper boundary",input:String(s+t),expected:"reject and reprompt"},{field:n.name,case:"trailing junk",input:"12abc",expected:"reject and reprompt"},...n.type==="decimal"?[{field:n.name,case:"non-finite value",input:"nan",expected:"reject and reprompt"}]:[],{field:n.name,case:"empty input",input:"empty line",expected:n.required?"reject and reprompt":"accept default zero"}]})}function L(a,n){const r=a.map(t=>t.type==="integer"?`    long ${t.name} = 0;`:t.type==="decimal"?`    double ${t.name} = 0.0;`:`    char ${t.name}[${t.maxLength+1}] = {0};`).join(`
`),s=a.map(t=>{const o=S(t.name.replaceAll("_"," ")),i=t.required?"true":"false";return t.type==="integer"?`    if (!read_long_field("${o}", ${p(t.bounds.minimum)}L, ${p(t.bounds.maximum)}L, ${i}, &${t.name})) return EXIT_FAILURE;`:t.type==="decimal"?`    if (!read_double_field("${o}", ${p(t.bounds.minimum)}, ${p(t.bounds.maximum)}, ${i}, &${t.name})) return EXIT_FAILURE;`:`    if (!read_text_field("${o}", ${t.name}, sizeof ${t.name}, ${i})) return EXIT_FAILURE;`}).join(`
`);return`/* Generated bounded-input skeleton. Review for the target C implementation.
 * It reads complete lines with fgets, rejects truncated input, checks conversion
 * end pointers and errno, enforces bounds, and never executes supplied text.
 */
#include <ctype.h>
#include <errno.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INPUT_BUFFER_SIZE ${n}

static bool read_line(char *input_buffer, size_t capacity) {
    if (fgets(input_buffer, capacity, stdin) == NULL) return false;
    size_t length = strcspn(input_buffer, "\\n");
    if (input_buffer[length] == '\\n') { input_buffer[length] = '\\0'; return true; }
    int ch;
    while ((ch = getchar()) != '\\n' && ch != EOF) { }
    fputs("Input was too long; try again.\\n", stderr);
    return false;
}

static char *trim(char *text) {
    while (isspace((unsigned char)*text)) text++;
    char *end = text + strlen(text);
    while (end > text && isspace((unsigned char)end[-1])) *--end = '\\0';
    return text;
}

static bool read_long_field(const char *label, long minimum, long maximum, bool required, long *out) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer);
        if (*text == '\\0' && !required) { *out = 0; return true; }
        errno = 0; char *end = NULL; long value = strtol(text, &end, 10);
        while (end && isspace((unsigned char)*end)) end++;
        if (errno == 0 && end != text && *end == '\\0' && value >= minimum && value <= maximum) { *out = value; return true; }
        fputs("Invalid whole number or outside bounds; try again.\\n", stderr);
    }
}

static bool read_double_field(const char *label, double minimum, double maximum, bool required, double *out) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer);
        if (*text == '\\0' && !required) { *out = 0.0; return true; }
        errno = 0; char *end = NULL; double value = strtod(text, &end);
        while (end && isspace((unsigned char)*end)) end++;
        if (errno == 0 && end != text && *end == '\\0' && isfinite(value) && value >= minimum && value <= maximum) { *out = value; return true; }
        fputs("Invalid decimal or outside bounds; try again.\\n", stderr);
    }
}

static bool read_text_field(const char *label, char *destination, size_t capacity, bool required) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer); size_t length = strlen(text);
        if (length == 0 && required) { fputs("A value is required.\\n", stderr); continue; }
        if (length >= capacity) { fputs("Text exceeds the field limit.\\n", stderr); continue; }
        memcpy(destination, text, length + 1); return true;
    }
}

int main(void) {
${r}

${s}

    /* Use validated fields here. */
    return EXIT_SUCCESS;
}`}function I(a){const n=C(a);if(!n.valid)return{...n,code:"",testVectors:[],stackBudget:null,checklist:[]};const r=Math.max(0,...n.fields.filter(i=>i.type==="text").map(i=>i.maxLength)),s=Math.max(128,r+2),t=n.fields.reduce((i,l)=>i+(l.type==="text"?l.maxLength+1:8),0),o={inputBufferBytes:s,persistentFieldBytes:t,estimatedTotalBytes:s+t,note:"Estimate assumes 8-byte long/double values and excludes runtime/library stack frames. Confirm sizes on the target compiler and architecture."};return{valid:!0,errors:[],fields:n.fields,code:L(n.fields,s),testVectors:E(n.fields),stackBudget:o,checklist:["Compile with strict warnings enabled for the target compiler.","Run every generated boundary, invalid, empty, and overlength vector.","Confirm EOF and an overlong line cannot leave stale data in a field.","Confirm numeric parsing rejects trailing characters, overflow, NaN, and infinity.","Measure sizeof(long), sizeof(double), and total stack use on the target device.","Review field bounds with the domain owner; generator limits are not business approval.","Keep validated input separate from commands, format strings, and memory indexes."],limitation:"This tool generates a reviewable C skeleton; it does not compile or execute code, prove portability, or replace target-specific static analysis and testing."}}function k(){const[a,n]=m.useState(g),[r,s]=m.useState(""),t=m.useMemo(()=>I(a),[a]),o=async()=>{if(!t.valid||!navigator.clipboard)return s("Copy unavailable; select the C skeleton manually.");try{await navigator.clipboard.writeText(t.code),s("C input skeleton copied.")}catch{s("Copy failed; select the C skeleton manually.")}};return e.jsxs("section",{className:"interactive-lab safe-c-input-harness","aria-labelledby":"safe-c-title",children:[e.jsxs("header",{className:"lab-tool-header",children:[e.jsx("h2",{id:"safe-c-title",children:"Safe C Input Harness"}),e.jsxs("p",{children:["Specify bounded console fields and generate reviewable ",e.jsx("code",{children:"fgets"})," plus ",e.jsx("code",{children:"strtol"}),"/",e.jsx("code",{children:"strtod"})," scaffolding—without compiling or executing code."]})]}),e.jsxs("div",{className:"lab-workspace",children:[e.jsxs("form",{className:"lab-control-panel",onSubmit:i=>i.preventDefault(),children:[e.jsx("label",{htmlFor:"c-field-spec",children:"Field specifications, one per line"}),e.jsx("p",{id:"c-field-format",children:e.jsx("code",{children:"name | type | min..max or text max length | required yes/no"})}),e.jsx("textarea",{id:"c-field-spec",rows:"10","aria-describedby":"c-field-format",value:a,onChange:i=>{n(i.target.value),s("")},placeholder:"age|integer|0..120|yes"}),e.jsxs("div",{className:"lab-actions",children:[e.jsx("button",{type:"button",onClick:()=>n(v),children:"Load example"}),e.jsx("button",{type:"button",onClick:()=>n(g),children:"Reset"})]})]}),e.jsxs("section",{className:"lab-output","aria-labelledby":"safe-c-output","aria-live":"polite",children:[e.jsx("h3",{id:"safe-c-output",children:"Generated input contract"}),t.valid?e.jsxs(e.Fragment,{children:[e.jsxs("dl",{children:[e.jsxs("div",{children:[e.jsx("dt",{children:"Shared input buffer"}),e.jsxs("dd",{children:[t.stackBudget.inputBufferBytes," bytes"]})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"Persistent fields"}),e.jsxs("dd",{children:["≈ ",t.stackBudget.persistentFieldBytes," bytes"]})]}),e.jsxs("div",{children:[e.jsx("dt",{children:"Estimated total"}),e.jsxs("dd",{children:["≈ ",t.stackBudget.estimatedTotalBytes," bytes"]})]})]}),e.jsx("p",{children:t.stackBudget.note}),e.jsx("label",{htmlFor:"safe-c-code",children:"Generated C skeleton"}),e.jsx("textarea",{id:"safe-c-code",rows:"24",readOnly:!0,value:t.code,onFocus:i=>i.target.select()}),e.jsx("button",{type:"button",onClick:o,children:"Copy C skeleton"}),e.jsx("p",{role:"status",children:r}),e.jsxs("section",{"aria-labelledby":"c-test-vectors",children:[e.jsx("h4",{id:"c-test-vectors",children:"Boundary and invalid test vectors"}),e.jsx("div",{className:"lab-table-wrap",tabIndex:"0",role:"region","aria-label":"Boundary test vectors; scroll horizontally if needed",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",children:"Field"}),e.jsx("th",{scope:"col",children:"Case"}),e.jsx("th",{scope:"col",children:"Input"}),e.jsx("th",{scope:"col",children:"Expected"})]})}),e.jsx("tbody",{children:t.testVectors.map((i,l)=>e.jsxs("tr",{children:[e.jsx("th",{scope:"row",children:i.field}),e.jsx("td",{children:i.case}),e.jsx("td",{children:i.input}),e.jsx("td",{children:i.expected})]},`${i.field}-${l}`))})]})})]}),e.jsxs("section",{"aria-labelledby":"c-review-list",children:[e.jsx("h4",{id:"c-review-list",children:"Reviewer checklist"}),e.jsx("ul",{children:t.checklist.map(i=>e.jsx("li",{children:e.jsxs("label",{children:[e.jsx("input",{type:"checkbox"})," ",i]})},i))})]}),e.jsx("p",{className:"learning-note",children:t.limitation})]}):e.jsx("div",{className:"lab-errors",role:"alert",children:e.jsx("ul",{children:t.errors.map(i=>e.jsx("li",{children:i},i))})})]})]})]})}export{k as default};
