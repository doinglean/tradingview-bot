const TradingView = require('@mathieuc/tradingview');

console.log('🔄 TradingView Test v3.5.1...');

async function testWithCorrectSyntax() {
    try {
        const client = new TradingView.Client();
        console.log('✅ Client erstellt');
        
        const chart = new client.Session.Chart();
        console.log('📊 Chart Session erstellt');
        
        // Korrekte Event-Registrierung für v3.5.1
        chart.onSymbolLoaded(() => {
            console.log('🎯 Symbol erfolgreich geladen!');
            console.log('📊 Chart Infos:', chart.infos);
            
            // Erste Daten anzeigen
            if (chart.periods && chart.periods.length > 0) {
                console.log('📈 Anzahl verfügbarer Perioden:', chart.periods.length);
                const latest = chart.periods[chart.periods.length - 1];
                console.log('💰 Neuester Bitcoin Preis:', latest?.close || 'Keine Daten');
            }
        });
        
        chart.onUpdate(() => {
            console.log('📊 Live Update erhalten!');
            if (chart.periods && chart.periods.length > 0) {
                const latest = chart.periods[chart.periods.length - 1];
                console.log('🚀 BTC/USDT:', latest.close);
                console.log('📈 High:', latest.high, '📉 Low:', latest.low);
                console.log('💹 Volumen:', latest.volume);
            }
        });
        
        chart.onError((error) => {
            console.log('❌ Chart Fehler:', error);
        });
        
        // Symbol laden
        console.log('🔄 Lade BINANCE:BTCUSDT...');
        chart.setMarket('BINANCE:BTCUSDT', {
            timeframe: '1H'
        });
        
    } catch (error) {
        console.error('❌ Fehler:', error);
    }
}

testWithCorrectSyntax();

// 30 Sekunden warten für sicheren Datenempfang
setTimeout(() => {
    console.log('⏰ Test beendet - falls keine Daten, prüfen wir Alternativen');
    process.exit(0);
}, 30000);