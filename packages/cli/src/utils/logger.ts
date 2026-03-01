function write(level: "INFO" | "ERROR" | "SUCCESS", message: string, details?: unknown): void {
  const stream = level === "ERROR" ? process.stderr : process.stdout;
  stream.write(`[${level}] ${message}\n`);

  if (details !== undefined) {
    const rendered =
      typeof details === "string" ? details : JSON.stringify(details, null, 2);
    stream.write(`${rendered}\n`);
  }
}

export const logger = {
  info(message: string, details?: unknown): void {
    write("INFO", message, details);
  },

  error(message: string, details?: unknown): void {
    write("ERROR", message, details);
  },

  success(message: string, details?: unknown): void {
    write("SUCCESS", message, details);
  },
};
