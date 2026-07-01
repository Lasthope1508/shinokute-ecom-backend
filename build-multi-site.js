const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurations for our sites (Default/Local values)
// You can pass the backend URL via env variable MEDUSA_BACKEND_URL during build
const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

const sites = {
  'site-a': {
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_36e54b4f9dc46dee19104bcbde266f89022ae61e7dad2d05d19d7d0c70c7c81e',
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: backendUrl,
    NEXT_PUBLIC_DEFAULT_REGION: 'us',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:8000'
  },
  'site-b': {
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_10411e2bdcc063d795c3bd4641fd2f1977a32b49239f61046ea2b23b91cbab07',
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: backendUrl,
    NEXT_PUBLIC_DEFAULT_REGION: 'us',
    NEXT_PUBLIC_BASE_URL: 'http://localhost:8001'
  }
};

const storefrontPath = path.join(__dirname, 'apps', 'storefront');
const envPath = path.join(storefrontPath, '.env.local');

for (const [siteName, config] of Object.entries(sites)) {
  console.log(`\n==============================================`);
  console.log(`Building storefront for: ${siteName.toUpperCase()}`);
  console.log(`==============================================`);
  
  // Write the temporary .env.local file
  let envContent = '';
  for (const [key, val] of Object.entries(config)) {
    envContent += `${key}=${val}\n`;
  }
  fs.writeFileSync(envPath, envContent);
  
  // Clean old build/out folders
  const outPath = path.join(storefrontPath, 'out');
  const targetOutPath = path.join(storefrontPath, `out-${siteName}`);
  
  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { recursive: true, force: true });
  }
  if (fs.existsSync(targetOutPath)) {
    fs.rmSync(targetOutPath, { recursive: true, force: true });
  }
  
  // Run build
  console.log('Running next build...');
  try {
    execSync('npm run build --workspace=@dtc/storefront', { stdio: 'inherit', cwd: __dirname });
    
    // Rename out to out-site-name
    if (fs.existsSync(outPath)) {
      fs.renameSync(outPath, targetOutPath);
      console.log(`Successfully built and moved output to: apps/storefront/out-${siteName}`);
    } else {
      console.error(`Error: build output not found for ${siteName}`);
    }
  } catch (error) {
    console.error(`Build failed for ${siteName}:`, error.message);
    process.exit(1);
  }
}

// Clean up temporary env file
if (fs.existsSync(envPath)) {
  fs.unlinkSync(envPath);
}

console.log('\nAll multi-site builds completed successfully!');
