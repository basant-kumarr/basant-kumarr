# CV source

`cv-content.js` is the single source for the CV. `build_cv.js` turns it into
the Word file and a print-ready HTML page; `print_pdf.cjs` prints that page to
the PDF the portfolio links to (`dashboard-site/basant-kumar-cv.pdf`).

A4, Arial (Liberation Sans in the PDF, metric-compatible), 11pt body, two pages.

```sh
npm i docx@9.5.1 playwright
node build_cv.js Basant_Kumar_CV.docx cv.html
node print_pdf.cjs "$PWD/cv.html" ../dashboard-site/basant-kumar-cv.pdf
```

Edit facts only in `cv-content.js`, then rebuild both files so they match.
