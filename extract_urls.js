import fs from 'fs';

function extractUrl(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf16le');
        const match = content.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        return match ? match[0] : 'Not found';
    } catch (e) {
        return `Error: ${e.message}`;
    }
}

console.log('BACKEND_URL:' + extractUrl('backend_err.log'));
console.log('FRONTEND_URL:' + extractUrl('frontend_err.log'));
