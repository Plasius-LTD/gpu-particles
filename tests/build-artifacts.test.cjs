const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { verifyPackagePathInventory } = require("../scripts/verify-public-package.cjs");

const root = path.resolve(__dirname, "..");

test("repeated builds preserve the exact published shader paths", () => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const build = spawnSync("npm", ["run", "build"], {
      cwd: root, encoding: "utf8", timeout: 60000,
    });
    assert.equal(build.status, 0, build.stderr);
    const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: root, encoding: "utf8", timeout: 60000,
    });
    assert.equal(pack.status, 0, pack.stderr);
    const files = JSON.parse(pack.stdout)[0].files.map((file) => file.path);
    verifyPackagePathInventory(files);
  }
});
