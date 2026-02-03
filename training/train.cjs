// train.cjs
const fs  = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const { RandomForestRegression } = require("ml-random-forest");

// Carpeta donde está este archivo train.cjs
const BASE_DIR = __dirname;

// Rutas absolutas basadas en la ubicación del archivo
const DATASET_PATH = path.join(BASE_DIR, "dataset.csv");
const MODEL_PATH   = path.join(BASE_DIR, "modelo_rf.json");

console.log("Entrenamiento iniciado", new Date().toLocaleDateString("es-ES"));
console.log("Usando carpeta base:", BASE_DIR);
console.log("Leyendo dataset desde:", DATASET_PATH);

const features = [];
const labels = [];

fs.createReadStream(DATASET_PATH)
    .pipe(parse({ columns: true }))
    .on("data", (row) => {
        features.push([
            +row.edad,
            +row.peso,
            +row.altura_cm,
            +row.peso_factores_riesgo,
            +row.tamano_tumor,
            +row.num_ganglios,
            +row.metastasis,
            +row.marcador,
            +row.quimioterapia,
            +row.ciclos_quimio,
            +row.radioterapia,
            +row.cirugia,
            +row.meses_sin_control,
            +row.num_citas,
            +row.sintomas,
            +row.falta_controles
        ]);

        labels.push(+row.riesgo_recaida); // entre 0.01 y 1.00
    })
    .on("end", () => {
        console.log("Entrenando modelo RandomForestRegression...");

        const rf = new RandomForestRegression({
            nEstimators: 200,
            maxFeatures: 0.8,
            selectionMethod: "mean",  // promedio de predicciones
            replacement: true,
            seed: 42
        });

        rf.train(features, labels);

        fs.writeFileSync(MODEL_PATH, JSON.stringify(rf.toJSON()));
        console.log("Modelo guardado en:", MODEL_PATH);
        console.log("Entrenamiento finalizado", new Date().toLocaleDateString("es-ES"));
    })
    .on("error", (err) => {
        console.error("Error leyendo el dataset:", err.message);
    });