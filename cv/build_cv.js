// Builds the CV as Word (docx) and as print-ready HTML (for the PDF) from
// cv-content.js. A4, Arial 11pt body, 0.7in margins in both outputs.
// usage: node build_cv.js <out.docx> <out.html>
const fs = require('fs');
const path = require('path');
const content = require('./cv-content');
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType,
  LevelFormat, BorderStyle, TabStopType, convertInchesToTwip,
} = require('docx');

const ACCENT = '1F4E79', MUTED = '444444';
const PT = { body: 11, heading: 12, name: 20, tagline: 12 };
const MARGIN_IN = 0.7;

/* ---------------- Word ---------------- */
const MARGIN = convertInchesToTwip(MARGIN_IN);
const PAGE_W = 11906;
const RIGHT_TAB = PAGE_W - 2 * MARGIN;
const run = (text, o = {}) => new TextRun({ text, font: 'Arial', size: PT.body * 2, ...o });
const runs = (list) => list.map((r) =>
  typeof r === 'string' ? run(r)
  : r.b ? run(r.b, { bold: true })
  : new ExternalHyperlink({ link: r.href, children: [run(r.text, { color: ACCENT })] }));

function docxBlock(x) {
  switch (x.type) {
    case 'name': return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
      children: [run(x.text, { bold: true, size: PT.name * 2, color: ACCENT, characterSpacing: 40 })] })];
    case 'tagline': return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [run(x.text, { size: PT.tagline * 2, color: MUTED })] })];
    case 'contact': return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: runs(x.runs) })];
    case 'heading': return [new Paragraph({ keepNext: true, spacing: { before: 200, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
      children: [run(x.text.toUpperCase(), { bold: true, size: PT.heading * 2, color: ACCENT, characterSpacing: 20 })] })];
    case 'entry': {
      const out = [new Paragraph({ keepNext: true, spacing: { before: 120, after: x.sub ? 0 : 40 },
        tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
        children: [run(x.title, { bold: true }), ...(x.right ? [run('\t' + x.right, { color: MUTED })] : [])] })];
      if (x.sub) out.push(new Paragraph({ keepNext: true, spacing: { after: 40 }, children: [run(x.sub, { italics: true, color: MUTED })] }));
      return out;
    }
    case 'bullet': return [new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 30 }, children: runs(x.runs) })];
    case 'para': return [new Paragraph({ spacing: { after: 60 }, children: runs(x.runs) })];
    case 'labelled': return [new Paragraph({ spacing: { after: 40 }, children: [run(x.label + ': ', { bold: true }), run(x.text)] })];
    case 'cert': return [new Paragraph({ spacing: { after: 30 }, tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [run(x.title, { bold: true }), run('\t' + x.right, { color: MUTED })] })];
  }
  throw new Error('unknown block ' + x.type);
}

const doc = new Document({
  creator: 'Basant Kumar', title: 'Basant Kumar - CV', description: 'Curriculum vitae of Basant Kumar, AI & Business Analyst',
  styles: { default: { document: { run: { font: 'Arial', size: PT.body * 2 } } } },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 340, hanging: 220 } } } }] }] },
  sections: [{ properties: { page: { size: { width: PAGE_W, height: 16838 },
    margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }, children: content.flatMap(docxBlock) }],
});

/* ---------------- HTML for the PDF ---------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hruns = (list) => list.map((r) =>
  typeof r === 'string' ? esc(r) : r.b ? `<b>${esc(r.b)}</b>` : `<a href="${r.href}">${esc(r.text)}</a>`).join('');
// twips -> pt for matching spacing: 20 twips = 1pt
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Basant Kumar - CV</title>
<style>
@page{size:A4;margin:${MARGIN_IN}in}
*{box-sizing:border-box}
body{margin:0;font-family:Arial,'Liberation Sans',Helvetica,sans-serif;font-size:${PT.body}pt;line-height:1.15;color:#111}
p{margin:0}
a{color:#${ACCENT};text-decoration:none}
.name{text-align:center;font-weight:700;font-size:${PT.name}pt;color:#${ACCENT};letter-spacing:2pt;margin-bottom:1pt}
.tagline{text-align:center;font-size:${PT.tagline}pt;color:#${MUTED};margin-bottom:3pt}
.contact{text-align:center;margin-bottom:2pt}
h2{font-size:${PT.heading}pt;color:#${ACCENT};letter-spacing:1pt;text-transform:uppercase;margin:10pt 0 4pt;padding-bottom:2pt;border-bottom:.75pt solid #${ACCENT};break-after:avoid}
.entry{display:flex;justify-content:space-between;gap:12pt;font-weight:700;margin-top:6pt;break-after:avoid}
.entry span{font-weight:400;color:#${MUTED};white-space:nowrap}
.sub{font-style:italic;color:#${MUTED};margin-bottom:2pt;break-after:avoid}
ul{margin:0;padding-left:17pt}
li{margin-bottom:1.5pt;padding-left:2pt}
.para{margin-bottom:3pt}
.lab{margin-bottom:2pt}
.cert{display:flex;justify-content:space-between;margin-bottom:1.5pt}
.cert span{color:#${MUTED}}
.keep{break-inside:avoid}
</style></head><body>
${(() => {
  let out = '', list = null, group = null;
  const close = () => { if (list) { out += '</ul>'; list = null; } };
  const endGroup = () => { close(); if (group) { out += '</div>'; group = null; } };
  for (const x of content) {
    if (x.type !== 'bullet') close();
    if (x.type === 'entry' || x.type === 'heading') endGroup();
    switch (x.type) {
      case 'name': out += `<p class="name">${esc(x.text)}</p>`; break;
      case 'tagline': out += `<p class="tagline">${esc(x.text)}</p>`; break;
      case 'contact': out += `<p class="contact">${hruns(x.runs)}</p>`; break;
      case 'heading': out += `<h2>${esc(x.text)}</h2>`; break;
      case 'entry': out += `<div class="keep"><p class="entry">${esc(x.title)}${x.right ? `<span>${esc(x.right)}</span>` : ''}</p>${x.sub ? `<p class="sub">${esc(x.sub)}</p>` : ''}`; group = true; break;
      case 'bullet': if (!list) { out += '<ul>'; list = true; } out += `<li>${hruns(x.runs)}</li>`; break;
      case 'para': out += `<p class="para">${hruns(x.runs)}</p>`; break;
      case 'labelled': out += `<p class="lab"><b>${esc(x.label)}:</b> ${esc(x.text)}</p>`; break;
      case 'cert': out += `<p class="cert"><b>${esc(x.title)}</b><span>${esc(x.right)}</span></p>`; break;
    }
  }
  endGroup();
  return out;
})()}
</body></html>`;

const [outDocx, outHtml] = process.argv.slice(2);
fs.writeFileSync(outHtml, html);
Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(outDocx, buf); console.log('docx', buf.length, 'bytes; html', html.length, 'chars'); });
