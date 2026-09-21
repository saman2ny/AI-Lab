export function errorHandler(err, _req, res, _next) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    res.status(500).json({ message });
}
