export function getNow(req: Request): number {
    if (process.env.TEST_MODE === "1") {
        const header = req.headers.get("x-test-now-ms");
        if (header) {
            const parsed = Number(header);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return Date.now();
}