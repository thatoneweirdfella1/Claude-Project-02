const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const root = process.cwd();
const partsDir = path.join(root, 'cowork-preview', 'parts');
const partNames = fs.readdirSync(partsDir).filter((name) => /^part-\d+$/.test(name)).sort();
if (partNames.length !== 8) throw new Error(`Expected 8 Cowork preview archive parts, found ${partNames.length}`);

const expectedPartHashes = [
  'b7a4faa3726acacd3909d2aaf094fb3fe4470e12a96dce8d9e664e77a152f691','85202958efa74947ef56ed55d63ef9140137cf4705b26c42efa2c24f8b2f0843','bc38e169bd9a765da82ce8bfb3dc1c491225e6bc1c8b6926d02de895722cf105','0f4fdffe7cd0f3debcb9554c708c4e418ac8600c385a05cc7188fea98a0e6d62','faa5a2b3cd538f033668c9a387d83737c061587c2a47e75ae12c5aeab96fe332','cfe2467038cc0f33336e0e1dba372e696f28e73acd33960b1ef1f5d8ff4c1559','c40d238b08c52ef34a88ee1e2eea31ec9f636e96a980d9ca8d69c3afe876cd51','6e9cb5bed9fae411b6879b3b0b0c663e9347b364e16ae79b5d3f5249328b4f25',
];
const partTexts = partNames.map((name,index)=>{const text=fs.readFileSync(path.join(partsDir,name),'utf8');const hash=crypto.createHash('sha256').update(text).digest('hex');if(hash!==expectedPartHashes[index])throw new Error(`Cowork overlay part mismatch: ${name}; expected ${expectedPartHashes[index]}, got ${hash}`);return text;});
const archive=Buffer.from(partTexts.join('').replace(/\s+/g,''),'base64');
const actual=crypto.createHash('sha256').update(archive).digest('hex');
const expected='fd0417f1b72881492c9faebea5cefc6514258eae535c3436de9425193a5c49bb';
if(actual!==expected)throw new Error(`Cowork overlay checksum mismatch: expected ${expected}, got ${actual}`);

const repairedSourcePaths = [
  'src/main.tsx','src/components/session/QuickActionsRow.tsx','src/stores/types.ts',
  'src/stores/sessionStore.ts','src/stores/sessionStore.test.ts','src/services/persistence.test.ts',
  'src/stores/settingsDefaultsStore.ts','src/services/providerNeutral.ts','src/services/providerNeutral.test.ts',
  'src/components/composer/InputBox.tsx','src/components/directness/DirectnessDropdown.tsx',
  'src/components/composer/AdvancedControls.tsx','src/components/composer/Composer.tsx',
  'src/components/pipeline/CenterColumn.tsx',
];
const repairedSources=new Map(repairedSourcePaths.map((rel)=>[rel,fs.readFileSync(path.join(root,rel),'utf8')]));
const tmp=path.join(root,'.cowork-delta.tar.gz');fs.writeFileSync(tmp,archive);
try{cp.execFileSync('tar',['-xzf',tmp,'-C',root],{stdio:'inherit'});}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
for(const [rel,source] of repairedSources)fs.writeFileSync(path.join(root,rel),source);

const nodeNextFixes=[
 ['src/services/modelRegistry.ts','export type { ModelId } from "../stores/types";','export type { ModelId } from "../stores/types.js";'],
 ['src/services/providers/openai.ts','from "../proxyHandler";','from "../proxyHandler.js";'],
 ['src/services/providers/google.ts','from "../proxyHandler";','from "../proxyHandler.js";'],
 ['src/services/providers/xai.ts','from "../proxyHandler";','from "../proxyHandler.js";'],
 ['src/services/providers/deepseek.ts','from "../proxyHandler";','from "../proxyHandler.js";'],
];
for(const [rel,before,after] of nodeNextFixes){const file=path.join(root,rel);const source=fs.readFileSync(file,'utf8');if(!source.includes(before)){if(!source.includes(after))throw new Error(`Expected NodeNext import pattern missing in ${rel}`);continue;}fs.writeFileSync(file,source.replace(before,after));}
const frozenCssPath=path.join(root,'src/styles/frozen-reference.css');
fs.appendFileSync(frozenCssPath,`\n\n/* Cowork preview hotfix: All Tools popup must overlay the center canvas. */\n:root[data-layout="gold"] .col-left { z-index: 70; }\n:root[data-layout="gold"] .leftnav-tools { z-index: 80; }\n:root[data-layout="gold"] .leftnav-tools__popup { z-index: 81; }\n`);
console.log(`Applied complete Cowork preview overlay (${actual}), preserved ${repairedSources.size} post-overlay repair files, normalized Vercel-only NodeNext imports, and applied the preview All Tools stacking hotfix`);
