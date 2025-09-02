const express = require('express');
const cors = require('cors');
const TradingView = require('@mathieuc/tradingview');

const app = express();
app.use(cors());
app.use(express.json());

// Railway nutzt dynamische Ports
const PORT = process.env.PORT || 3000;

console.log('🚀 Starte TradingView API Server...');

// TradingView Client
const client = new TradingView.Client();
const charts = new Map();

// Health Check - wichtig für Railway
app.get('/', (req, res) => {
    res.json({ 
        status: 'TradingView API läuft!', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/price/:symbol - Aktueller Preis',
            'GET /api/health - Server Status'
        ]
    });
});

// Preis-Endpunkt für N8N
app.get('/api/price/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const fullSymbol = `BINANCE:${symbol}USDT`;
        
        console.log(`📊 Preis abgerufen für: ${fullSymbol} um ${new Date().toISOString()}`);
        
        if (!charts.has(fullSymbol)) {
            const chart = new client.Session.Chart();
            chart.setMarket(fullSymbol, { timeframe: '1H' });
            charts.set(fullSymbol, chart);
            
            // Warten bis Daten geladen
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        const chart = charts.get(fullSymbol);
        
        if (chart.periods && chart.periods.length > 0) {
            const latest = chart.periods[chart.periods.length - 1];
            
            const response = {
                success: true,
                symbol: fullSymbol,
                price: latest.close,
                volume: latest.volume,
                timestamp: new Date().toISOString(),
                unix_timestamp: Date.now()
            };
            
            console.log(`✅ Preis gesendet: ${latest.close} USDT`);
            res.json(response);
            
        } else {
            console.log('❌ Keine Daten verfügbar');
            res.status(404).json({ 
                success: false, 
                error: 'Keine Daten verfügbar',
                symbol: fullSymbol 
            });
        }
        
    } catch (error) {
        console.error('❌ API Fehler:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        charts_active: charts.size
    });
});

app.listen(PORT, () => {
    console.log(`🚀 TradingView API Server läuft auf Port ${PORT}`);
    console.log(`🌐 Endpoints bereit für N8N!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Server wird heruntergefahren...');
    process.exit(0);
});