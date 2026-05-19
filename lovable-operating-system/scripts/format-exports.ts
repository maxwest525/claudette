#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

interface ExportManifest {
  generated_at: string;
  items: { name: string; type: string; path: string; size_bytes: number }[];
}

export function generateExportManifest(): ExportManifest {
  const exportsDir = path.join(__dirname, "..", "exports");
  fs.mkdirSync(exportsDir, { recursive: true });

  const files = fs.readdirSync(exportsDir).filter((f) => f !== ".gitkeep" && !f.endsWith(".json"));
  const items = files.map((file) => {
    const filePath = path.join(exportsDir, file);
    const stats = fs.statSync(filePath);
    const ext = path.extname(file).toLowerCase();
    let type = "unknown";
    if (ext === ".zip") type = "skill-package";
    else if (ext === ".md") type = "markdown";
    else if (ext === ".json") type = "metadata";
    return { name: file, type, path: filePath, size_bytes: stats.size };
  });

  const manifest: ExportManifest = {
    generated_at: new Date().toISOString(),
    items,
  };

  const manifestPath = path.join(exportsDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Export manifest generated: ${manifestPath}`);
  console.log(`Total exports: ${items.length}`);
  return manifest;
}

if (require.main === module) {
  generateExportManifest();
}
