#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";

const ROOT = path.join(__dirname, "..");
const EXPORTS_DIR = path.join(ROOT, "exports");
const BUNDLES_DIR = path.join(EXPORTS_DIR, "bundles");
const SKILLS_DIR = path.join(ROOT, "skills");

interface BundleManifest {
  bundle_id: string;
  version: string;
  created_at: string;
  total_skills: number;
  skills: { name: string; zip: string; category: string; tags: string[] }[];
}

function readSkillMetadata(skillName: string): { category: string; tags: string[] } {
  const metaPath = path.join(SKILLS_DIR, skillName, "metadata.json");
  if (!fs.existsSync(metaPath)) return { category: "general", tags: [] };
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    return { category: meta.category || "general", tags: meta.tags || [] };
  } catch {
    return { category: "general", tags: [] };
  }
}

function generateBundleMd(manifest: BundleManifest): string {
  let md = `# Lovable Skills Bundle v${manifest.version}\n\n`;
  md += `**Created:** ${manifest.created_at}\n`;
  md += `**Total Skills:** ${manifest.total_skills}\n\n`;
  md += `## Skills Included\n\n`;
  md += `| Skill | Category | Tags |\n|-------|----------|------|\n`;
  for (const s of manifest.skills) {
    md += `| \`${s.name}\` | ${s.category} | ${s.tags.slice(0, 3).join(", ")} |\n`;
  }
  md += `\n## Install\n\nImport each \`.zip\` file individually into Lovable via Settings → Skills → Import.\n`;
  return md;
}

async function createBundle(version?: string): Promise<void> {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });

  const zipFiles = fs.readdirSync(EXPORTS_DIR).filter(
    (f) => f.endsWith(".zip") && !f.startsWith("lovable-skills-bundle")
  );

  if (zipFiles.length === 0) {
    console.log("No skill ZIPs found in exports/. Run `npm run package:batch` first.");
    return;
  }

  const ver = version || "1.0.0";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const bundleName = `lovable-skills-bundle-v${ver}-${timestamp}.zip`;
  const bundlePath = path.join(BUNDLES_DIR, bundleName);

  const skillEntries = zipFiles.map((f) => {
    const skillName = f.replace(".zip", "");
    const { category, tags } = readSkillMetadata(skillName);
    return { name: skillName, zip: f, category, tags };
  });

  const manifest: BundleManifest = {
    bundle_id: `bundle-${timestamp}`,
    version: ver,
    created_at: new Date().toISOString(),
    total_skills: skillEntries.length,
    skills: skillEntries,
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  const bundleMd = generateBundleMd(manifest);

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(bundlePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);

    // Add all skill ZIPs
    for (const f of zipFiles) {
      archive.file(path.join(EXPORTS_DIR, f), { name: `skills/${f}` });
    }

    // Add manifest and README
    archive.append(manifestJson, { name: "manifest.json" });
    archive.append(bundleMd, { name: "BUNDLE.md" });
    archive.finalize();
  });

  // Save manifest alongside bundle
  fs.writeFileSync(path.join(BUNDLES_DIR, bundleName.replace(".zip", ".manifest.json")), manifestJson);

  console.log(`Bundle created: ${bundlePath}`);
  console.log(`Skills included: ${skillEntries.length}`);
  console.log(`\nSkills:`);
  for (const s of skillEntries) {
    console.log(`  - ${s.name} (${s.category})`);
  }
}

const version = process.argv[2];
createBundle(version).catch(console.error);
