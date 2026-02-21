
// FTP_HOST=66.29.148.143
// FTP_PORT=21
// FTP_TYPE=ftp   # atau sftp / ftps
// FTP_USER=miftah@thejago.store
// FTP_PASS=Smile420$420
const EasyFtp = require('easy-ftp');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sftp = new EasyFtp();

const config = {
  host: process.env.FTP_HOST,
  port: Number(process.env.FTP_PORT) || 21,
  type: process.env.FTP_TYPE || 'ftp', // ftp / ftps / sftp
  username: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  passive: true,
};

['host', 'username', 'password'].forEach((k) => {
  if (!config[k]) {
    console.error(`Config ${k} kosong. Isi .env atau env shell (FTP_HOST, FTP_USER, FTP_PASS).`);
    process.exit(1);
  }
});

// Folder lokal yang akan di-upload
const localBackend = path.resolve(__dirname, '..', 'todo-app', 'website');
const localDist    = path.resolve(__dirname, '..', 'todo-app', 'frontend', 'dist');

// Folder tujuan di server
const remoteBackend = '/nodeapps/thejago/website';

ftp.connect(config, (err) => {
  if (err) {
    console.error('FTP connect error:', err);
    return;
  }
  console.log('Connected. Uploading backend...');
  ftp.upload(localBackend + '/**', remoteBackend, (err2) => {
    if (err2) console.error('Backend upload error:', err2);
    else console.log('Backend uploaded');
    console.log('Uploading dist...');
    ftp.upload(localDist + '/**', '/nodeapps/thejago/frontend/dist', (err3) => {
      if (err3) console.error('Dist upload error:', err3);
      else console.log('Dist uploaded');
      ftp.close();
    });
  });
});
