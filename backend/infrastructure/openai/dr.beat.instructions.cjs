module.exports = {
    nutritionalPlanResponseFormat: {
        type: "json_schema",
        json_schema: {
            name: "nutricional_bot_response",
            description: "Respuestas del nutricionista pediátrico, incluyendo plan semanal o restricciones detectadas.",
            strict: true,
            schema: {
                type: "object",
                properties: {
                    constraints: {
                        type: "array",
                        items: {type: "string"},
                        description: "Restricciones nutricionales relevantes mencionadas por el padre"
                    },
                    response: {
                        type: "string",
                        description: "Respuesta explicativa en HTML (puede tener <b>, <p>, <ul>, etc.)"
                    },
                    nutritionalPlans: {
                        type: "array",
                        description: "Plan semanal de alimentación",
                        items: {
                            type: "object",
                            required: ["weekDay", "monthWeek", "month", "year", "breakfast", "snack", "lunch", "dinner"],
                            properties: {
                                weekDay: {type: "integer", minimum: 1, maximum: 7},
                                monthWeek: {type: "integer", minimum: 1, maximum: 5},
                                month: {type: "integer", minimum: 1, maximum: 12},
                                year: {type: "integer", minimum: 2024, maximum: 2100},
                                breakfast: {type: "string"},
                                snack: {type: "string"},
                                lunch: {type: "string"},
                                dinner: {type: "string"}
                            },
                            additionalProperties: false
                        }
                    }
                },
                required: ["constraints", "response", "nutritionalPlans"],
                additionalProperties: false
            }
        }
    },
    completeNutritionalValuesFormat: {
        type: "json_schema",
        json_schema: {
            name: "nutritional_day_response",
            description: "Respuestas del nutricionista pediátrico con cálculo nutricional por comida.",
            strict: true,
            schema: {
                type: "object",
                properties: {
                    weekDay: {type: "integer", minimum: 1, maximum: 7},
                    monthWeek: {type: "integer", minimum: 1, maximum: 5},
                    month: {type: "integer", minimum: 1, maximum: 12},
                    year: {type: "integer", minimum: 2024, maximum: 2100},

                    breakfast: {type: "string"},
                    snack: {type: "string"},
                    lunch: {type: "string"},
                    dinner: {type: "string"},

                    kcalBreakfast: {type: "number"},
                    kcalSnack: {type: "number"},
                    kcalLunch: {type: "number"},
                    kcalDinner: {type: "number"},

                    proteinBreakfast: {type: "number"},
                    proteinSnack: {type: "number"},
                    proteinLunch: {type: "number"},
                    proteinDinner: {type: "number"},

                    carbsBreakfast: {type: "number"},
                    carbsSnack: {type: "number"},
                    carbsLunch: {type: "number"},
                    carbsDinner: {type: "number"},

                    fatsBreakfast: {type: "number"},
                    fatsSnack: {type: "number"},
                    fatsLunch: {type: "number"},
                    fatsDinner: {type: "number"},

                    vitaminCBreakfast: {type: "number"}, // en mg
                    vitaminCSnack: {type: "number"},
                    vitaminCLunch: {type: "number"},
                    vitaminCDinner: {type: "number"},

                    b12Breakfast: {type: "number"}, // en mcg
                    b12Snack: {type: "number"},
                    b12Lunch: {type: "number"},
                    b12Dinner: {type: "number"},

                    ironBreakfast: {type: "number"}, // en mg
                    ironSnack: {type: "number"},
                    ironLunch: {type: "number"},
                    ironDinner: {type: "number"},

                    followBreakfast: {type: "boolean"},
                    followSnack: {type: "boolean"},
                    followLunch: {type: "boolean"},
                    followDinner: {type: "boolean"}
                },
                required: [
                    "weekDay", "monthWeek", "month", "year",
                    "breakfast", "snack", "lunch", "dinner",

                    "kcalBreakfast", "kcalSnack", "kcalLunch", "kcalDinner",
                    "proteinBreakfast", "proteinSnack", "proteinLunch", "proteinDinner",
                    "carbsBreakfast", "carbsSnack", "carbsLunch", "carbsDinner",
                    "fatsBreakfast", "fatsSnack", "fatsLunch", "fatsDinner",
                    "vitaminCBreakfast", "vitaminCSnack", "vitaminCLunch", "vitaminCDinner",
                    "b12Breakfast", "b12Snack", "b12Lunch", "b12Dinner",
                    "ironBreakfast", "ironSnack", "ironLunch", "ironDinner",

                    "followBreakfast", "followSnack", "followLunch", "followDinner"
                ],
                additionalProperties: false
            }
        }
    }
};
