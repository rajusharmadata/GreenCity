import http from 'http';
import fs from 'fs';
import path from 'path';

import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: '69235562b00b7c3bc567ecba' }, 'your-super-secure-jwt-secret-key-change-this-in-production', { expiresIn: '1h' });

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/profile/avatar',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'Bearer ' + token
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});

req.on('error', e => console.error(e));

req.write('--' + boundary + '\r\n');
req.write('Content-Disposition: form-data; name="avatar"; filename="test.png"\r\n');
req.write('Content-Type: image/png\r\n\r\n');
const validPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
req.write(validPng);
req.write('--' + boundary + '--\r\n');
req.end();
