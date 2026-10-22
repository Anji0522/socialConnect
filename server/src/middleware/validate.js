export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!parsed.success) {
      return next(parsed.error);
    }
    if (parsed.data.body !== undefined) req.body = parsed.data.body;
    if (parsed.data.params !== undefined) req.params = parsed.data.params;
    if (parsed.data.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: parsed.data.query,
        writable: true,
        configurable: true,
      });
    }
    next();
  };
}
