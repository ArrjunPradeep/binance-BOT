// N O D E - B I N A N C E - A P I
const Binance = require('node-binance-api');
const readlineSync = require('readline-sync');
require('dotenv').config();

const binance = new Binance({

    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    // useServerTime: true,
    recvWindow: 60000

});


// RUN :     node file symbol quantity config_Margin

// let symbol = process.argv[2];
// let quantity = process.argv[3];
// let initial_Price = process.argv[4];
// let config_Margin = process.argv[5];

// let symbol = readlineSync.question("Symbol : ");
// let quantity = Number(readlineSync.question("Quantiity : "));
// let initial_Price = Number(readlineSync.question("Initial Price : "));
// let config_Margin = Number(readlineSync.question("Configuration Margin : "));

// F U N C T I O N    C A L L
// binance_script(symbol, quantity, initial_Price, config_Margin);

async function binance_script(symbol, quantity, initial_Price, config_Margin) {

    // L I M I T    O R D E R    F O R    B U Y  
    binance.buy(symbol, quantity, initial_Price)
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.error(err);
        });

    while (true) {

        // L I M I T    O R D E R    V A L U E    F O R    S E L L
        sell_Limit = initial_Price + config_Margin;

        // C U R R E N T    S E R V E R    T I M E 
        let serverTimeStamp = await binance.useServerTime();

        //const TFhour = 24 * 1000 * 60 * 60;
        const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

        let startOfDay = Math.floor(serverTimeStamp.serverTime / interval) * interval;

        // L I M I T    O R D E R    F O R    S E L L
        binance.sell(symbol, quantity, sell_Limit)
            .then((data) => {

                let newStartOfDay = Math.floor(serverTimeStamp.serverTime / interval) * interval;

                // L I M I T    O R D E R    T A K E S    M O R E    T H A N    1    D A Y 
                if (newStartOfDay > startOfDay) {

                    // C A N C E L S    T H E    O R D E R    W . R . T .    O R D E R I D
                    binance.cancel(data.symbol, data.orderId, (error, response, symbol) => {
                        console.info(symbol + " cancel response:", response);
                    });

                    let newInitial_Price = Number(readlineSync.question("New Initial Price : "));
                    let newConfig_Margin = Number(readlineSync.question("New Configuration Margin : "));

                    binance_script(data.symbol, data.origQty, newInitial_Price, newConfig_Margin);

                }
                else if (newStartOfDay == startOfDay) {
                    console.log(data);
                }

            })
            .catch((err) => {
                console.error(err);
            });

        // L I M I T    O R D E R    V A L U E    F O R    B U Y
        initial_Price = sell_Limit - config_Margin;

        // L I M I T    O R D E R    F O R    B U Y     
        binance.buy(symbol, quantity, initial_Price)
            .then((data) => {

                let newStartOfDay = Math.floor(serverTimeStamp.serverTime / interval) * interval;

                // L I M I T    O R D E R    T A K E S    M O R E    T H A N    1    D A Y 
                if (newStartOfDay > startOfDay) {

                    // C A N C E L S    T H E    O R D E R    W . R . T .    O R D E R I D
                    binance.cancel(data.symbol, data.orderId, (error, response, symbol) => {
                        console.info(symbol + " cancel response:", response);
                    });

                    let newInitial_Price = Number(readlineSync.question("New Initial Price : "));
                    let newConfig_Margin = Number(readlineSync.question("New Configuration Margin : "));

                    binance_script(data.symbol, data.origQty, newInitial_Price, newConfig_Margin);

                }
                else if (newStartOfDay == startOfDay) {
                    console.log(data);
                }

                console.log(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }
}



module.exports = {
    binance:binance,
    binance_script:binance_script
}