const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function timestamp() {
  return new Date().toISOString();
}

function write(color, level, message) {
  console.log(
    `${color}[${timestamp()}] [${level}]${COLORS.reset} ${message}`,
  );
}

export function info(message) {
  write(COLORS.cyan, "INFO", message);
}

export function success(message) {
  write(COLORS.green, "SUCCESS", message);
}

export function warning(message) {
  write(COLORS.yellow, "WARNING", message);
}

export function error(message) {
  write(COLORS.red, "ERROR", message);
}

export function step(title) {
  console.log(
    `\n${COLORS.magenta}==================================================${COLORS.reset}`,
  );
  console.log(
    `${COLORS.magenta}${title}${COLORS.reset}`,
  );
  console.log(
    `${COLORS.magenta}==================================================${COLORS.reset}\n`,
  );
}

export function divider() {
  console.log(
    `${COLORS.dim}--------------------------------------------------${COLORS.reset}`,
  );
}

export function banner(title) {
  console.log("");
  console.log(
    `${COLORS.blue}##################################################${COLORS.reset}`,
  );
  console.log(
    `${COLORS.blue}${title}${COLORS.reset}`,
  );
  console.log(
    `${COLORS.blue}##################################################${COLORS.reset}`,
  );
  console.log("");
}

export function object(title, value) {
  info(title);
  console.dir(value, {
    depth: null,
    colors: true,
  });
}

export function table(rows) {
  console.table(rows);
}

export function fatal(message) {
  error(message);
  process.exit(1);
}

export async function runStep(title, action) {
  step(title);

  const started = performance.now();

  try {
    const result = await action();

    const elapsed = (
      (performance.now() - started) /
      1000
    ).toFixed(2);

    success(`${title} (${elapsed}s)`);

    return result;
  } catch (err) {
    const elapsed = (
      (performance.now() - started) /
      1000
    ).toFixed(2);

    error(`${title} failed (${elapsed}s)`);

    throw err;
  }
}