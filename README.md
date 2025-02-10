# fast-invoice

This project is a fork of [node-microinvoice](https://github.com/baptistejamin/node-microinvoice).

[![NPM](https://img.shields.io/npm/v/fast-invoice.svg)](https://www.npmjs.com/package/fast-invoice) [![Downloads](https://img.shields.io/npm/dt/fast-invoice.svg)](https://www.npmjs.com/package/fast-invoice)

Fast & elegant PDF invoice generator for Node using PDFKit.

- What Fast Invoice does?

* It builds invoices that **looks good**
* Generates a PDF in **less than 30ms**
* Custom Styling & Text
* Covers extended charsets like Russian, Polish (native PDF fonts only supports Latin)
* Transliterate to Latin when charset is not supported (Chinese, Arabic)

- How invoices looks like ?

![Example](/examples/example.png?raw=true "Invoice generated using Fast Invoice")

## Why another invoice generator

This project was made for our own company [Leando Tech](https://leando.tech/). We are generating every month thousands of HTML invoices. Given this scale, using Puppeteer for generating HTML to PDF would be very inefficient.

As everyday, our customers were asking for PDF invoices as some accounting softwares automatically fetch invoices from emails. I could really understand their frustration. At the end, why generating PDF should be easy?

## Who uses it?

<table>
<tr>
<td align="center"><a href="https://leando.tech/"><img src="https://leando.tech/favicon-256x256.png" width="64" /></a></td>
</tr>
<tr>
<td align="center">Leando Tech</td>
</tr>
</table>

_👋 You use fast-invoice and you want to be listed there? [Contact me](https://kylianpaulin.me/)._

## How to install?

Include `fast-invoice` in your `package.json` dependencies.

Alternatively, you can run `npm install fast-invoice --save`.

## How to use?

Import the module in your code:

`var FastInvoice = require("fast-invoice");`

```javascript
let myInvoice = new FastInvoice({
  // Use example from examples/index.js
});
// Render invoice as PDF
myInvoice.generate("example.pdf").then(() => {
  console.log("Invoice saved");
});
```
