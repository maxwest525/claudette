#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

export function packageSkill(skillFolderPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const skillName = path.basename(skillFolderPath);
    const zipName = `${skillName}.zip`;
    const zipPath = path.join(outputDir, zipName);

    if (!fs.existsSync(skillFolderPath)) {
      return reject(new Error(`Skill folder not found: ${skillFolderPath}`));
    }

    fs.mkdirSync(outputDir, { recursive: true });

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Packaged: ${zipPath} (${archive.pointer()} bytes)`);
      resolve(zipPath);
    });

    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(skillFolderPath, skillName);
    archive.finalize();
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error("Usage: ts-node package-skill.ts <skill-name>");
    process.exit(1);
  }
  const skillName = args[0];
  const skillPath = path.join(__dirname, "..", "skills", skillName);
  const exportsDir = path.join(__dirname, "..", "exports");
  packageSkill(skillPath, exportsDir).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
