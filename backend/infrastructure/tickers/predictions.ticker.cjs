const Ticker = require('../../shared/entities/ticker.class.js')
module.exports = new Ticker(1000 * 60 * 10, async () => {

}, 'Predictor de Riesgo de Recaída');