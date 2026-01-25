const http = require('http');
const crypto = require('crypto');

const PORT = 3000;

// Base response data provided by user
const BASE_RESPONSE = {
    "receipt_hex": "73c457ba28c39431836509fbf7d49c7b70490ff60d7c9862f5cb8d400297887240b4241d14d749b64d32642b71b96e0244baf268f5353d9f6d15bb29d7b5a9b61023277d126486dab9c3a67a83d20974089f3c1ae0ad9985cf2ae80495ca1776333f4927251d2151b8952c868d4d92c4d782e00199ced0c724e0f754081acc85f6cb70fc069d2db610e7a08754a818bca15ed0ecb45ab6b1be5828010f2f8b908e57621328d66d6aecaf015d565ce9c8612c120e7fb65cbcb211f36eb1d5aace1755aa9d2ccd3eb23b26999a5b6a055613d4ce538b0ea345c8409c6008b24b0683bedc451d409856a6a7f6ee0b09e864ad5e1fad4785fa846b654aeb58491c69c9aabede",
    "journal_hex": "000000000000000000000000834474017b9159abf489303113ba45622804c3fe0c09614473933fb34a7404aee071ce1907a07c34a778fbfdc50bd8f29d91c5da",
    "image_id_hex": "d00386cb676528a694de49cb717b1be87eabe980135d32696aa72d872525a4f5",
    "nullifier_hex": "0c09614473933fb34a7404aee071ce1907a07c34a778fbfdc50bd8f29d91c5da",
    "status": "success"
};

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/prove') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`[${new Date().toISOString()}] Received proof request`);
            try {
                // Parse body to verify it's valid JSON
                const requestData = JSON.parse(body);
                console.log('Request payload:', JSON.stringify(requestData, null, 2));

                // 1. Generate a random nullifier to ensure uniqueness on-chain
                // The nullifier is 32 bytes = 64 hex characters
                const randomNullifier = crypto.randomBytes(32).toString('hex');
                
                // 2. Reconstruct the journal
                // In the sample, the nullifier seems to be the last 64 chars of the journal
                // We keep the prefix and replace the suffix
                const originalJournal = BASE_RESPONSE.journal_hex;
                const journalPrefix = originalJournal.substring(0, originalJournal.length - 64);
                const newJournal = journalPrefix + randomNullifier;

                const responseData = {
                    ...BASE_RESPONSE,
                    nullifier_hex: randomNullifier,
                    journal_hex: newJournal
                };
                
                // Simulate processing time (e.g. 2 seconds)
                setTimeout(() => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(responseData));
                    console.log(`[${new Date().toISOString()}] Sent response with new nullifier: ${randomNullifier}`);
                }, 2000);

            } catch (e) {
                console.error('Error processing request:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Mock ZK Service running at http://127.0.0.1:${PORT}/prove`);
    console.log('Base Nullifier:', BASE_RESPONSE.nullifier_hex);
});
