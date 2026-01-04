const API_KEY = "AIzaSyCeoi7cZlS3FYqKFPN2UAZ45FZCaWhuqTo";

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "echo 'pong'" }] }]
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ ${modelName} works!`);
        } else {
            console.log(`❌ ${modelName} failed with status ${response.status}`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log(`💥 ${modelName} error: ${e.message}`);
    }
}

async function run() {
    await testModel("gemini-3-flash-preview");
}

run();
