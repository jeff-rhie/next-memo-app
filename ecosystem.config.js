module.exports = {
    apps : [{
      name: 'memo-app', // Name of your app
      script: 'npm', // Command to run the script
      args: 'start', // Arguments to the script command
      env: {
        NODE_ENV: 'development', // Default environment variables
        DATABASE_URL: 'postgresql://hongin:Tlqejrakstp1!@localhost:5432/postgresql?schema=public',
        // Define other environment variables as needed
      },
      env_production: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://hongin:Tlqejrakstp1!@localhost:5432/postgresql?schema=public',
        // Production-specific environment variables
      }
    }]
  };
  