import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();
const token = jwt.sign({ userId: '69235562b00b7c3bc567ecba' }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const validPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

let body = '';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
body += 'Test Issue Title\r\n';

body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="category"\r\n\r\n';
body += 'Waste\r\n';

body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="description"\r\n\r\n';
body += 'This is a test description for the issue.\r\n';

body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="address"\r\n\r\n';
body += 'Test Address 123.\r\n';

const bodyBuffer = Buffer.from(body, 'utf8');

const fileHeader = Buffer.from(
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="image"; filename="test.png"\r\n' +
    'Content-Type: image/png\r\n\r\n', 'utf8'
);

const endBoundary = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf8');

const payload = Buffer.concat([bodyBuffer, fileHeader, validPng, endBoundary]);

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/issues',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary.replace('--', ''),
        'Content-Length': payload.length,
        'Authorization': 'Bearer ' + token
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', e => console.error('HTTP Error:', e));
req.write(payload);
req.end();
