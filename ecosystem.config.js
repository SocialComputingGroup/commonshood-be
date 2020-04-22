module.exports = {
  apps : [{
    name: 'ccserver',
    script: '.',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    exec_mode: 'cluster',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G'
  }],
};
