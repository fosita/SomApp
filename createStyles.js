// ===========================================================
// CONFIGURACIÓN BASE
// ===========================================================
const zero = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
const one = [1, 1.1, 1.2, 1.3, 1.25, 1.3, 1.4, 1.5, 1.6, 1.75, 1.8, 1.9];
const two = [2, 2.25, 2.5, 2.75];
const three = [3, 3.25, 3.5, 3.75];
const four = [4, 4.25, 4.5, 4.75];
const five = [5, 5.25, 5.5, 5.75];
const six = [6, 6.25, 6.5, 6.75];
const seven = [7, 7.25, 7.5, 7.75];
const eight = [8, 8.25, 8.5, 8.75];
const nine = [9, 9.25, 9.5, 9.75];
const ten = [10, 10.25, 10.5, 10.75];

const alreadyGeneratedDecimal = [
    ".margin-RX { margin: RYrem }",
    ".margin-height-RX { margin: RYrem 0 }",
    ".margin-width-RX { margin: 0 RYrem }",
    ".margin-left-RX { margin-left: RYrem }",
    ".margin-right-RX { margin-right: RYrem }",
    ".margin-top-RX { margin-top: RYrem }",
    ".margin-bottom-RX { margin-bottom: RYrem }",
    ".padding-RX { padding: RYrem }",
    ".padding-height-RX { padding: RYrem 0 }",
    ".padding-width-RX { padding: 0 RYrem }",
    ".padding-left-RX { padding-left: RYrem }",
    ".padding-right-RX { padding-right: RYrem }",
    ".padding-top-RX { padding-top: RYrem }",
    ".padding-bottom-RX { padding-bottom: RYrem }",
    ".gap-RX { gap: RYrem }",
    ".top-RX { top: RYrem }",
    ".bottom-RX { bottom: RYrem }",
    ".left-RX { left: RYrem }",
    ".right-RX { right: RYrem }",
];
const alreadyGeneratedInt = [
    ".font-RX { font-size: RXpx }",
    ".size-RX { width: RXpx; height: RXpx }",
    ".g-cols-RX { grid-template-columns: repeat(RX, 1fr) }",
    ".g-rows-RX { grid-template-rows: repeat(RX, 1fr) }",

    ".g-col-RX { grid-column: span RX }",
    ".g-row-RX { grid-row: span RX }",

    ".g-col-start-RX { grid-column-start: RX }",
    ".g-col-end-RX { grid-column-end: RX }",
    ".g-row-start-RX { grid-row-start: RX }",
    ".g-row-end-RX { grid-row-end: RX }",

    ".width-RX { width: RXpx!important; }",
    ".height-RX { height: RXpx!important; }",
]
const decimalStyles = [
    //generate all:
    //...alreadyGeneratedDecimal
]
const intStyles = [
    ".font-RXpx { font-size: RXpx; }",
    ".lh-RXpx { line-height: RXpx; }",
    ".font-RX { font-size: RXrem; }",
    ".lh-RX { line-height: RXrem; }",
    //generate all:
    //...alreadyGeneratedInt
]

// ===========================================================
// RANGOS DE GENERACIÓN
// ===========================================================

// → Para decimales (usa los arreglos)
const replaceX = [
    ...zero, ...one, ...two, ...three, ...four, ...five, ...six,
    ...seven, ...eight, ...nine, ...ten,
];

// → Para enteros
const startInt = 1;
const endInt = 100;
const jumpInt = 1;

// → Media queries
const mediaStart = 0;      // 0 = genera base sin media query
const mediaEnd = 1200;     // hasta 1200 - 0 para no generar
const mediaStep = 100;     // cada 480px genera un bloque

// ===========================================================
// FUNCIÓN PRINCIPAL
// ===========================================================
function generateStyles() {
    let output = "";

    // ==========================
    // 1️⃣ ESTILOS BASE DECIMALES
    // ==========================
    for (const style of decimalStyles) {
        for (const y of replaceX) {
            const x = y.toString().replace(/\./g, "-");
            output += style.replace(/RX/g, x).replace(/RY/g, y) + "\n";
        }
        output += "\n";
    }

    // ==========================
    // 2️⃣ ESTILOS BASE ENTEROS
    // ==========================
    for (const style of intStyles) {
        for (let x = startInt; x <= endInt; x += jumpInt)
            output += style.replace(/RX/g, x.toString()) + "\n";
        output += "\n";
    }

    // ==========================
    // 3️⃣ MEDIA QUERIES
    // ==========================
    for (let yy = mediaStart; yy <= mediaEnd; yy += mediaStep) {
        if (yy === 0) continue; // el caso base ya se generó
        output += `@media (min-width: ${yy}px) {\n`;

        // Decimales con sufijo -over-YY SOLO EN LA CLASE
        for (const style of decimalStyles) {
            for (const y of replaceX) {
                const x = y.toString().replace(/\./g, "-");
                const className = style
                    .replace(/\s\{/g, `-over-${yy} {`)
                    .replace(/RX/g, x)                 // los otros RX si los hay (valores CSS)
                    .replace(/RY/g, y);                // valor real sin el sufijo
                output += `  ${className}\n`;
            }
        }

        // Enteros con sufijo -over-YY SOLO EN LA CLASE
        for (const style of intStyles) {
            for (let x = startInt; x <= endInt; x += jumpInt) {
                const className = style
                    .replace(/\s\{/g, `-over-${yy} {`)
                    .replace(/RX/g, `${x}`); // sufijo solo en clase
                output += `  ${className}\n`;
            }
        }

        output += `}\n\n`;
    }

    return output;
}

// ===========================================================
// EJECUCIÓN
// ===========================================================
const result = generateStyles();
console.log(result);