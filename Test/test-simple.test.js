import fetch from "node-fetch";

const BASE_URL = "http://localhost:8080/api";
const testEmail = "rudrasaha305@gmail.com";

console.log("Testing /send-otp endpoint...\n");

fetch(`${BASE_URL}/send-otp`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: testEmail }),
})
.then(async (response) => {
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);
    
    if (response.ok) {
        console.log("\n✅ OTP sent! Check the server console for the OTP.");
        console.log("\nNow enter the OTP:");
        
        process.stdin.once("data", async (input) => {
            const otp = input.toString().trim();
            
            console.log("\nVerifying OTP...");
            const verifyResponse = await fetch(`${BASE_URL}/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: testEmail, otp }),
            });
            
            const verifyData = await verifyResponse.json();
            console.log("Status:", verifyResponse.status);
            console.log("Response:", verifyData);
            
            if (verifyResponse.ok) {
                console.log("\n✅ Success! Token:", verifyData.token);
            }
            process.exit(0);
        });
    } else {
        process.exit(1);
    }
})
.catch(error => {
    console.error("❌ Error:", error.message);
    process.exit(1);
});
