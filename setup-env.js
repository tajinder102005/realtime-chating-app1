const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 ChatApp Environment Setup\n');

rl.question('Enter your Supabase Project URL (https://your-project.supabase.co): ', (supabaseUrl) => {
  rl.question('Enter your Supabase Anon Key: ', (anonKey) => {
    rl.question('Enter your Supabase Service Role Key: ', (serviceRoleKey) => {
      rl.question('Enter a JWT Secret (any random string): ', (jwtSecret) => {

        // Backend .env
        const backendEnv = `PORT=5000
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
JWT_SECRET=${jwtSecret}
`;

        // Frontend .env
        const frontendEnv = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}
VITE_API_URL=http://localhost:5000
`;

        // Write backend .env
        fs.writeFileSync(path.join(process.cwd(), 'backend', '.env'), backendEnv);
        console.log('✅ Backend .env file created');

        // Write frontend .env
        fs.writeFileSync(path.join(process.cwd(), 'frontend', '.env'), frontendEnv);
        console.log('✅ Frontend .env file created');

        console.log('\n🎉 Environment setup complete!');
        console.log('📝 Next steps:');
        console.log('1. Run database/schema.sql in your Supabase SQL Editor');
        console.log('2. Start backend: cd backend && npm run dev');
        console.log('3. Start frontend: cd frontend && npm run dev');
        console.log('4. Open http://localhost:5173 in your browser');

        rl.close();
      });
    });
  });
});
