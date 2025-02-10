"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const transliteration_1 = require("transliteration");
class FastInvoice {
    defaultOptions;
    options;
    storage;
    constructor(options) {
        this.defaultOptions = {
            style: {
                document: {
                    marginLeft: 30,
                    marginRight: 30,
                    marginTop: 30,
                },
                fonts: {
                    normal: {
                        name: "Helvetica",
                        range: /[^\u0000-\uD7FF\uE000-\uFFFF\u10000-\u10FFFF]/m,
                    },
                    bold: {
                        name: "Helvetica-Bold",
                    },
                },
                header: {
                    backgroundColor: "#F8F8FA",
                    primaryColor: "#000100",
                    secondaryColor: "#8F8F8F",
                    height: 150,
                    image: null,
                    textPosition: 330,
                },
                table: {
                    beforeLast: {
                        position: 360,
                        maxWidth: 140,
                    },
                    last: {
                        position: 490,
                        maxWidth: 80,
                    },
                },
                prices: {
                    quantity: {
                        position: 330,
                        maxWidth: 140,
                    },
                    total: {
                        position: 490,
                        maxWidth: 80,
                    },
                },
                text: {
                    primaryColor: "#000100",
                    secondaryColor: "#8F8F8F",
                    headingSize: 15,
                    regularSize: 10,
                },
            },
            data: {
                invoice: {
                    name: "Invoice for Acme",
                    header: [
                        {
                            label: "Invoice Number",
                            value: 1,
                        },
                    ],
                    customer: [
                        {
                            label: "Bill To",
                            value: [],
                        },
                    ],
                    seller: [
                        {
                            label: "Bill From",
                            value: [],
                        },
                    ],
                    details: {
                        header: [
                            {
                                value: "Description",
                            },
                            {
                                value: "Quantity",
                            },
                            {
                                value: "Subtotal",
                            },
                        ],
                        parts: [],
                        total: [
                            {
                                label: "Total",
                                value: 0,
                            },
                        ],
                    },
                    legal: [],
                },
            },
        };
        this.options = (0, lodash_merge_1.default)(this.defaultOptions, options);
        this.storage = {
            header: {
                image: null,
            },
            cursor: {
                x: 0,
                y: 0,
            },
            customer: {
                height: 0,
            },
            seller: {
                height: 0,
            },
            fonts: {
                fallback: {
                    loaded: false,
                },
            },
            document: null,
        };
        // Charger la police fallback immédiatement
        if (this.options.style.fonts?.fallback?.enabled &&
            this.options.style.fonts?.fallback?.path) {
            if (fs_1.default.existsSync(this.options.style.fonts.fallback.path)) {
                this.storage.fonts.fallback.loaded = true;
            }
            else {
                console.warn(`Fallback font not found at ${this.options.style.fonts.fallback.path}`);
            }
        }
    }
    /**
     * Load custom fonts
     *
     * @private
     * @return void
     */
    loadCustomFonts() {
        // Register custom fonts
        if (this.options.style.fonts?.normal?.path && this.storage.document) {
            this.storage.document.registerFont(this.options.style.fonts.normal.name, this.options.style.fonts.normal.path);
        }
        if (this.options.style.fonts?.bold?.path && this.storage.document) {
            this.storage.document.registerFont(this.options.style.fonts.bold.name, this.options.style.fonts.bold.path);
        }
    }
    /**
     * Load fallback font (unicode chars)
     *
     * @private
     * @return void
     */
    getFontOrFallback(type, value) {
        // Si c'est un symbole monétaire, utiliser directement la police fallback
        if (/[\u20A0-\u20CF]/.test(value.toString())) {
            if (this.storage.fonts.fallback.loaded === false &&
                this.storage.document) {
                this.storage.document.registerFont(this.options.style.fonts?.fallback?.name ??
                    this.options.style.fonts?.normal?.name ??
                    "Helvetica");
                this.storage.fonts.fallback.loaded = true;
            }
            return (this.options.style.fonts?.fallback?.name ??
                this.options.style.fonts?.normal?.name ??
                "Helvetica");
        }
        let _normalRange = this.options.style.fonts?.normal?.range;
        let _fallbackRange = this.options.style.fonts?.fallback?.range;
        // Return default font
        if (this.options.style.fonts?.fallback?.enabled === false) {
            return (this.options.style.fonts[type].name ??
                this.options.style.fonts?.normal?.name ??
                "Helvetica");
        }
        // Return default font if no special chars are found
        if (!_normalRange?.test((value || "").toString())) {
            return this.options.style.fonts?.[type]?.name ?? "Helvetica";
        }
        // Return default font if fallback font range not supported
        if (_fallbackRange?.test((value || "").toString())) {
            return this.options.style.fonts?.[type]?.name ?? "Helvetica";
        }
        if (this.storage.fonts.fallback.loaded === false && this.storage.document) {
            this.storage.document.registerFont(this.options.style.fonts?.fallback?.name ??
                this.options.style.fonts?.normal?.name ??
                "Helvetica");
            this.storage.fonts.fallback.loaded = true;
        }
        // Return fallback font
        return (this.options.style.fonts?.fallback?.name ??
            this.options.style.fonts?.normal?.name ??
            "Helvetica");
    }
    /**
     * Show value or transliterate
     *
     * @private
     * @param  {string} value
     * @return void
     */
    valueOrTransliterate(value) {
        let _fallbackRange = this.options.style.fonts?.fallback?.range;
        // Return default font
        if (this.options.style.fonts?.fallback?.enabled === false) {
            return value;
        }
        // Return default font if not special chars are found
        if (!_fallbackRange?.test((value || "").toString())) {
            return value;
        }
        return (0, transliteration_1.transliterate)(value);
    }
    /**
     * Generates the header
     *
     * @private
     * @return void
     */
    generateHeader() {
        // Background Rectangle
        if (this.storage.document) {
            this.storage.document
                .rect(0, 0, this.storage.document.page.width, this.options.style.header?.height ?? 150)
                .fill(this.options.style.header?.backgroundColor ?? "#F8F8FA");
        }
        // Add an image to the header if any
        if (this.options.style.header?.image &&
            this.options.style.header?.image?.path &&
            this.storage.document) {
            this.storage.document.image(this.options.style.header.image.path, this.options.style.document?.marginLeft, this.options.style.document?.marginTop, {
                width: this.options.style.header?.image?.width,
                height: this.options.style.header?.image?.height,
            });
        }
        let _fontMargin = 4;
        // Write header details
        this.setCursor("x", this.options.style.header?.textPosition ?? 330);
        this.setCursor("y", this.options.style.document?.marginTop ?? 0);
        this.setText(this.options.data.invoice.name, {
            fontSize: "heading",
            fontWeight: "bold",
            color: this.options.style.header?.primaryColor,
        });
        this.options.data.invoice.header.forEach((line) => {
            this.setText(`${line.label}:`, {
                fontWeight: "bold",
                color: this.options.style.header?.primaryColor,
                marginTop: _fontMargin,
            });
            let _values;
            if (Array.isArray(line.value)) {
                _values = line.value;
            }
            else {
                _values = [line.value];
            }
            _values.forEach((value) => {
                this.setText(value.toString(), {
                    colorCode: "secondary",
                    color: this.options.style.header?.secondaryColor,
                    marginTop: _fontMargin,
                });
            });
        });
    }
    /**
     * Generates customer and seller
     *
     * @private
     * @return void
     */
    generateDetails(type) {
        let _maxWidth = 250;
        let _fontMargin = 4;
        this.setCursor("y", (this.options.style.header?.height ?? 150) + 18);
        // Use a different left position
        if (type === "customer") {
            this.setCursor("x", this.options.style.document?.marginLeft ?? 0);
        }
        else {
            this.setCursor("x", this.options.style.header?.textPosition ?? 330);
        }
        this.options.data.invoice[type].forEach((line) => {
            this.setText(`${line.label}:`, {
                colorCode: "primary",
                fontWeight: "bold",
                marginTop: 8,
                maxWidth: _maxWidth,
            });
            let _values;
            if (Array.isArray(line.value)) {
                _values = line.value;
            }
            else {
                _values = [line.value];
            }
            _values.forEach((value) => {
                this.setText(value.toString(), {
                    colorCode: "secondary",
                    marginTop: _fontMargin,
                    maxWidth: _maxWidth,
                });
            });
        });
        this.storage[type].height = this.storage.cursor.y;
    }
    /**
     * Generates a row
     *
     * @private
     * @param  {string} type
     * @param  {array} columns
     * @return void
     */
    generateTableRow(type, columns) {
        let _fontWeight = "normal", _colorCode = "secondary";
        if (this.storage.document) {
            this.storage.cursor.y = this.storage.document.y;
        }
        this.storage.cursor.y += 17;
        if (type === "header") {
            _fontWeight = "bold";
            _colorCode = "primary";
        }
        let _start = this.options.style.document?.marginLeft ?? 0;
        let _maxY = this.storage.cursor.y;
        // Computes columns by giving an extra space for the last column \
        //   It is used to keep a perfect alignement
        let _maxWidth = ((this.options.style.header?.textPosition ?? 330) -
            _start -
            (this.options.style.document?.marginRight ?? 0)) /
            (columns.length - 1);
        columns.forEach((column, index) => {
            let _value;
            if (index === 0) {
                // Donner 50% de l'espace à la première colonne
                _maxWidth *= 2.5;
                this.setCursor("x", _start);
            }
            else if (index < columns.length - 2) {
                this.setCursor("x", _start);
            }
            else if (index == columns.length - 2) {
                _maxWidth = this.options.style.table?.beforeLast?.maxWidth ?? 0;
                this.setCursor("x", this.options.style.table?.beforeLast?.position ?? 0);
            }
            else {
                _maxWidth = this.options.style.table?.last?.maxWidth ?? 0;
                this.setCursor("x", this.options.style.table?.last?.position ?? 0);
            }
            _value = column.value;
            if (column.price === true) {
                _value = this.prettyPrice(_value);
            }
            this.setText(_value, {
                colorCode: _colorCode,
                maxWidth: _maxWidth,
                fontWeight: _fontWeight,
                skipDown: true,
            });
            _start += _maxWidth + 10;
            // Increase y position in case of a line return
            if (this.storage.document && this.storage.document.y >= _maxY) {
                _maxY = this.storage.document.y;
            }
        });
        // Set y to the max y position
        this.setCursor("y", _maxY);
        if (type === "header") {
            this.generateLine();
        }
    }
    /**
     * Generates a line separator
     *
     * @private
     * @return void
     */
    generateLine() {
        this.storage.cursor.y += (this.options.style.text?.regularSize ?? 0) + 2;
        if (this.storage.document) {
            this.storage.document
                .strokeColor("#F0F0F0")
                .lineWidth(1)
                .moveTo(this.options.style.document?.marginRight ?? 0, this.storage.cursor.y)
                .lineTo(this.storage.document.page.width -
                (this.options.style.document?.marginRight ?? 0), this.storage.cursor.y)
                .stroke();
        }
    }
    /**
     * Generates invoice parts
     *
     * @private
     * @return void
     */
    generateParts() {
        let _startY = Math.max(this.storage.customer.height, this.storage.seller.height);
        this.setCursor("y", _startY);
        this.setText("\n");
        this.generateTableRow("header", this.options.data.invoice.details.header);
        (this.options.data.invoice.details.parts || []).forEach((part) => {
            this.generateTableRow("row", part);
        });
        this.storage.cursor.y += 50;
        (this.options.data.invoice.details.total || []).forEach((total) => {
            let _value = total.value;
            this.setCursor("x", this.options.style.prices?.quantity?.position ?? 0);
            this.storage.cursor.y += 4;
            this.setText(total.label, {
                colorCode: "primary",
                fontWeight: "bold",
                marginTop: 12,
                maxWidth: this.options.style.prices?.quantity?.maxWidth ?? 0,
                skipDown: true,
            });
            this.storage.cursor.y -= 4;
            this.setCursor("x", this.options.style.prices?.total?.position ?? 0);
            if (total.price === true) {
                _value = this.prettyPrice(total.value);
            }
            this.setText(_value.toString(), {
                colorCode: "secondary",
                maxWidth: this.options.style.prices?.total?.maxWidth ?? 0,
            });
        });
    }
    /**
     * Generates legal terms
     *
     * @private
     * @return void
     */
    generateLegal() {
        this.storage.cursor.y += 60;
        (this.options.data.invoice.legal || []).forEach((legal) => {
            this.setCursor("x", (this.options.style.document?.marginLeft ?? 0) * 2);
            this.setText(legal.value, {
                fontWeight: legal.weight,
                colorCode: legal.color || "primary",
                align: legal.align || "center",
                marginTop: 10,
            });
        });
    }
    /**
     * Moves the internal cursor
     *
     * @private
     * @param  {string} axis
     * @param  {number} value
     * @return void
     */
    setCursor(axis, value) {
        this.storage.cursor[axis] = value;
    }
    /**
     * Convert numbers to fixed value and adds currency
     *
     * @private
     * @param  {string | number} value
     * @return string
     */
    prettyPrice(value) {
        if (typeof value === "number") {
            value = value.toFixed(2);
        }
        if (this.options.data.invoice.currency) {
            value = `${value} ${this.options.data.invoice.currency}`;
        }
        return value;
    }
    /**
     * Adds text on the invoice with specified options
     *
     * @private
     * @param  {string} text
     * @param  {object} options
     * @return void
     */
    setText(text, options = {}) {
        let _fontWeight = options.fontWeight || "normal";
        let _colorCode = options.colorCode || "primary";
        let _fontSize = options.fontSize || "regular";
        let _textAlign = options.align || "left";
        let _color = options.color || "";
        let _marginTop = options.marginTop || 0;
        let _maxWidth = options.maxWidth;
        let _fontSizeValue = 0;
        this.storage.cursor.y += _marginTop;
        if (!_color && this.storage.document) {
            if (_colorCode === "primary") {
                this.storage.document.fillColor(this.options.style.text?.primaryColor ?? "");
            }
            else {
                this.storage.document.fillColor(this.options.style.text?.secondaryColor ?? "");
            }
        }
        if (_fontSize === "regular") {
            _fontSizeValue = this.options.style.text?.regularSize ?? 0;
        }
        else {
            _fontSizeValue = this.options.style.text?.headingSize ?? 0;
        }
        if (this.storage.document) {
            this.storage.document.font(this.getFontOrFallback(_fontWeight, text));
            this.storage.document.fillColor(_color);
            this.storage.document.fontSize(_fontSizeValue);
            this.storage.document.text(this.valueOrTransliterate(text), this.storage.cursor.x, this.storage.cursor.y, {
                align: _textAlign,
                width: _maxWidth,
            });
            let _diff = this.storage.document.y - this.storage.cursor.y;
            this.storage.cursor.y = this.storage.document.y;
            // Do not move down
            if (options.skipDown === true) {
                if (_diff > 0) {
                    this.storage.cursor.y -= _diff;
                }
                else {
                    this.storage.cursor.y -= 11.5;
                }
            }
        }
    }
    /**
     * Generates a PDF invoide
     *
     * @public
     * @param  {string|object} output
     * @return Promise
     */
    generate(output) {
        let _stream = null;
        this.storage.document = new pdfkit_1.default({
            size: "A4",
        });
        this.loadCustomFonts();
        this.generateHeader();
        this.generateDetails("customer");
        this.generateDetails("seller");
        this.generateParts();
        this.generateLegal();
        if (typeof output === "string" ||
            output?.type === "file") {
            let _path = "";
            if (typeof output === "string") {
                _path = output;
            }
            else {
                _path = output.path;
            }
            _stream = fs_1.default.createWriteStream(_path);
            if (this.storage.document) {
                this.storage.document.pipe(_stream);
                this.storage.document.end();
            }
        }
        else {
            if (this.storage.document) {
                this.storage.document.end();
            }
            return this.storage.document;
        }
        return new Promise((resolve, reject) => {
            if (this.storage.document) {
                this.storage.document.on("end", () => {
                    return resolve();
                });
                this.storage.document.on("error", () => {
                    return reject();
                });
            }
        });
    }
}
exports.default = FastInvoice;
