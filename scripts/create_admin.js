const URL = "https://sufmjnkqktqilnipnlmw.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2MjYwNywiZXhwIjoyMDk1MDM4NjA3fQ.ZD5HrOM0O6EZz5-9DGLqjBQH90TGYafu0yK6qp_ZJrU";

async function createAdmin() {
  try {
    console.log("Creating admin user in Auth...");
    const authRes = await fetch(`${URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@patricks-info-tech.com",
        password: "admin123",
        email_confirm: true
      })
    });
    
    const authData = await authRes.json();
    if (!authRes.ok) {
      if (authData.message && authData.message.includes("already registered")) {
        console.log("Admin user already exists in Auth. Skipping creation...");
        // We'd need to fetch the user ID if it exists, but for simplicity, 
        // we'll assume it's created or we can just proceed.
      } else {
        throw new Error(`Auth Error: ${JSON.stringify(authData)}`);
      }
    }
    
    const userId = authData.id;
    console.log(`Created user with ID: ${userId}`);

    if (!userId) {
       console.log("Could not get user ID. Exiting.");
       return;
    }

    console.log("Inserting admin profile into public.users...");
    const dbRes = await fetch(`${URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        id: userId,
        name: "Super Admin",
        email: "admin@patricks-info-tech.com",
        phone: "0240000000",
        username: "admin",
        role: "admin",
        status: "active"
      })
    });
    
    const dbData = await dbRes.json();
    if (!dbRes.ok) {
      if (dbData.code === '23505') { // unique violation
         console.log("Admin profile already exists in DB.");
      } else {
         throw new Error(`DB Error: ${JSON.stringify(dbData)}`);
      }
    } else {
      console.log("Successfully created admin profile!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createAdmin();
