export function setRoutes(app) {
    app.get('/', (req, res) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });
    app.get('/test-worker', (req, res) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });
}
//# sourceMappingURL=routes.js.map