const http = require('http');

// ANSI Escape Codes: ये टर्मिनल को रंग बदलने और कर्सर को लाइन की शुरुआत में लाने का निर्देश देते हैं।
// \x1b[31m: लाल रंग | \x1b[90m: हल्का ग्रे रंग (बंद) | \x1b[0m: रंग रीसेट
// \r: Carriage Return (कर्सर को लाइन की शुरुआत में लाता है, जिससे पिछली लाइन ओवरराइट हो जाती है)
const ON_LED = '\x1b[31m\x1b[1m [ ON ] \x1b[0m\r';    // लाल रंग में "ON"
const OFF_LED = '\x1b[90m [ OFF ] \x1b[0m\r';  // ग्रे रंग में "OFF"

const port = process.env.PORT || 3000;
const frameDelay = 500; // 500 मिलीसेकंड का विलंब

const server = http.createServer((req, res) => {
    // स्ट्रीमिंग के लिए Headers सेट करें
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked', // स्ट्रीमिंग के लिए जरूरी
        'Connection': 'keep-alive'
    });

    let frame = 0;
    let isConnected = true;

    // एनिमेशन लूप (Loop)
    function animate() {
        if (!isConnected) return;

        // हर दूसरे फ्रेम पर ON और OFF स्विच करें
        const output = (frame % 2 === 0) ? ON_LED : OFF_LED;
        res.write(output); // टर्मिनल पर फ्रेम भेजें

        frame++;

        // लूप को जारी रखें
        if (isConnected) {
            setTimeout(animate, frameDelay);
        }
    }

    // एनिमेशन शुरू करें
    animate();

    // जब क्लाइंट डिस्कनेक्ट हो जाए (जैसे यूजर Ctrl+C दबाए)
    res.on('close', () => {
        isConnected = false;
        // setTimeout लूप अपने आप बंद हो जाएगा
    });

    // 60 सेकंड बाद सर्वर कनेक्शन बंद कर देगा (सुरक्षा के लिए)
    setTimeout(() => {
        if (isConnected) {
            isConnected = false;
            res.end();
        }
    }, 60000); 

});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
