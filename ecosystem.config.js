// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

module.exports = {
  apps: [
    {
      name: "money-game",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      watch: false,
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: false,
      out_file: path.join(__dirname, "logs", "out.txt"),
      error_file: path.join(__dirname, "logs", "error.txt"),
    },
  ],
};
