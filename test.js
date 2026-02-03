const specialChars = `!#%&%=*+-_.,:;?@<>()[]{}|^~¡¿°$€£¥₿`;
const regSpecialChars = `!#%&%=*+\\-_.,:;?@<>()\\[\\]{}|^~¡¿°$€£¥₿`;
const LowercaseRegex = /[a-zñáéíóú]/;
const UppercaseRegex = /[A-ZÑÁÉÍÓÚ]/;
const DigitRegex = /\d/;
const SpecialCharRegex = new RegExp(`[${regSpecialChars}]`);
const passwordRegex = new RegExp(
    `^(?=.*${DigitRegex.source})`+
    `(?=.*${LowercaseRegex.source})` +
    `(?=.*${UppercaseRegex.source})` +
    `(?=.*[${regSpecialChars}]).{8,}$`
);

console.log(passwordRegex.test("Hola123!"));            // ✅ true
console.log(passwordRegex.test("hola123!"));            // ❌ no hay mayúscula
console.log(passwordRegex.test("HOLA123!"));            // ❌ no hay minúscula
console.log(passwordRegex.test("Holaaaaa!"));           // ❌ no hay número
console.log(passwordRegex.test("Hola1234"));            // ❌ no hay carácter especial
console.log(passwordRegex.test("Ho1!"));                // ❌ menos de 8 caracteres
console.log(passwordRegex.test("Ho 1!"));               // ❌ Espacio
console.log(passwordRegex.test("Ho1!@$€£¥₿abcDEF"));    // ✅ true