interface TextOptions {
    fontWeight?: "normal" | "bold";
    colorCode?: "primary" | "secondary";
    fontSize?: "regular" | "heading";
    align?: "left" | "center" | "right";
    color?: string;
    marginTop?: number;
    maxWidth?: number;
    skipDown?: boolean;
}
interface InvoiceOptions {
    style: {
        document?: {
            marginLeft?: number;
            marginRight?: number;
            marginTop?: number;
        };
        fonts?: {
            normal: {
                name: string;
                path?: string;
                range: RegExp;
            };
            bold: {
                name: string;
                path?: string;
            };
            fallback?: {
                name: string;
                path: string;
                enabled: boolean;
                range: RegExp;
                transliterate: boolean;
            };
        };
        header?: {
            backgroundColor?: string;
            primaryColor?: string;
            secondaryColor?: string;
            height?: number;
            image?: {
                path: string;
                width: number;
                height: number;
            } | null;
            textPosition?: number;
        };
        table?: {
            beforeLast: {
                position: number;
                maxWidth: number;
            };
            last: {
                position: number;
                maxWidth: number;
            };
        };
        prices?: {
            quantity: {
                position: number;
                maxWidth: number;
            };
            total: {
                position: number;
                maxWidth: number;
            };
        };
        text?: {
            primaryColor: string;
            secondaryColor: string;
            headingSize: number;
            regularSize: number;
            defaultTextOptions?: TextOptions;
        };
    };
    data: {
        invoice: {
            name: string;
            header: Array<{
                label: string;
                value: string | number | Array<string | number>;
            }>;
            customer: Array<{
                label: string;
                value: string | Array<string>;
            }>;
            seller: Array<{
                label: string;
                value: string | Array<string>;
            }>;
            details: {
                header: Array<{
                    value: string;
                }>;
                parts: Array<any>;
                total: Array<{
                    label: string;
                    value: number | string;
                    price?: boolean;
                }>;
            };
            legal: Array<{
                value: string;
                weight?: string;
                color?: string;
                align?: "left" | "center" | "right";
            }>;
            currency?: string;
        };
    };
}
export default class FastInvoice {
    private defaultOptions;
    private options;
    private storage;
    constructor(options: Partial<InvoiceOptions>);
    /**
     * Load custom fonts
     *
     * @private
     * @return void
     */
    loadCustomFonts(): void;
    /**
     * Load fallback font (unicode chars)
     *
     * @private
     * @return void
     */
    getFontOrFallback(type: "normal" | "bold", value: string | number): string;
    /**
     * Show value or transliterate
     *
     * @private
     * @param  {string} value
     * @return void
     */
    valueOrTransliterate(value: string): string;
    /**
     * Generates the header
     *
     * @private
     * @return void
     */
    generateHeader(): void;
    /**
     * Generates customer and seller
     *
     * @private
     * @return void
     */
    generateDetails(type: "customer" | "seller"): void;
    /**
     * Generates a row
     *
     * @private
     * @param  {string} type
     * @param  {array} columns
     * @return void
     */
    generateTableRow(type: "header" | "row", columns: any[]): void;
    /**
     * Generates a line separator
     *
     * @private
     * @return void
     */
    generateLine(): void;
    /**
     * Generates invoice parts
     *
     * @private
     * @return void
     */
    generateParts(): void;
    /**
     * Generates legal terms
     *
     * @private
     * @return void
     */
    generateLegal(): void;
    /**
     * Moves the internal cursor
     *
     * @private
     * @param  {string} axis
     * @param  {number} value
     * @return void
     */
    setCursor(axis: "x" | "y", value: number): void;
    /**
     * Convert numbers to fixed value and adds currency
     *
     * @private
     * @param  {string | number} value
     * @return string
     */
    prettyPrice(value: string | number): string;
    /**
     * Adds text on the invoice with specified options
     *
     * @private
     * @param  {string} text
     * @param  {object} options
     * @return void
     */
    setText(text: string, options?: TextOptions): void;
    /**
     * Generates a PDF invoide
     *
     * @public
     * @param  {string|object} output
     * @return Promise
     */
    generate(output: string | {
        path: string;
        type: "file";
    } | PDFKit.PDFDocument): PDFKit.PDFDocument | Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map