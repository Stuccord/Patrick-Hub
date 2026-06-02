const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found. Please configure it first.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your_supabase') || serviceKey.includes('your_supabase')) {
  console.error("Error: Please configure real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log("Seeding Patrick's Info Tech database...");

  // 1. Seed platform config
  console.log("1. Seeding platform config...");
  const configs = [
    { key: 'transaction_fee', value: '0.20' },
    { key: 'withdrawal_commission', value: '5.00' }
  ];

  for (const config of configs) {
    const { error: configErr } = await supabase
      .from('platform_config')
      .upsert(config, { onConflict: 'key' });
    if (configErr) {
      console.error(`Failed to seed config ${config.key}:`, configErr.message);
    } else {
      console.log(`Config ${config.key} seeded.`);
    }
  }

  // 2. Seed initial bundles
  console.log("\n2. Seeding default bundles...");
  const defaultBundles = [
    { name: "1GB MTN Data", size_gb: 1.0, network: "MTN", base_price: 4.50, min_resell_price: 5.50, is_active: true },
    { name: "5GB MTN Data", size_gb: 5.0, network: "MTN", base_price: 20.00, min_resell_price: 23.00, is_active: true },
    { name: "2GB Vodafone Data", size_gb: 2.0, network: "Vodafone", base_price: 8.00, min_resell_price: 10.00, is_active: true },
    { name: "10GB AirtelTigo", size_gb: 10.0, network: "AirtelTigo", base_price: 35.00, min_resell_price: 40.00, is_active: true }
  ];

  for (const bundle of defaultBundles) {
    // Check if bundle already exists by name
    const { data: existing } = await supabase
      .from('bundles')
      .select('id')
      .eq('name', bundle.name)
      .maybeSingle();

    if (existing) {
      console.log(`Bundle "${bundle.name}" already exists.`);
    } else {
      const { error: bundleErr } = await supabase
        .from('bundles')
        .insert(bundle);
      if (bundleErr) {
        console.error(`Failed to insert bundle "${bundle.name}":`, bundleErr.message);
      } else {
        console.log(`Bundle "${bundle.name}" created.`);
      }
    }
  }

  // 3. Create Admin user in Supabase Auth & public.users
  console.log("\n3. Creating admin user...");
  const adminEmail = 'admin@patricks-info-tech.com';
  const adminPassword = 'admin123';

  // Check if admin already exists in auth
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("Failed to list users:", listErr.message);
    process.exit(1);
  }

  let adminUser = users.find(u => u.email === adminEmail);
  let adminId;

  if (adminUser) {
    console.log(`Admin auth user already exists (ID: ${adminUser.id}).`);
    adminId = adminUser.id;
  } else {
    // Create admin user in Supabase auth
    const { data: newAdmin, error: createErr } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (createErr) {
      console.error("Failed to create admin auth user:", createErr.message);
      process.exit(1);
    }

    adminId = newAdmin.user.id;
    console.log(`Admin auth user created successfully (ID: ${adminId}).`);
  }

  // Insert/upsert into public.users table
  const { error: dbUserErr } = await supabase
    .from('users')
    .upsert({
      id: adminId,
      name: "Super Admin",
      email: adminEmail,
      phone: "0240000000",
      username: "admin",
      role: "admin",
      status: "active",
      password_hash: "admin123" // matching existing local/mock behavior
    }, { onConflict: 'email' });

  if (dbUserErr) {
    console.error("Failed to upsert admin user to public.users:", dbUserErr.message);
  } else {
    console.log("Admin user upserted to public.users table.");
  }

  console.log("\nSeeding completed successfully!");
}

main().catch(err => {
  console.error("An error occurred during seeding:", err);
});
