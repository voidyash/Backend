import fetch from "node-fetch";
import readline from "readline";

const BASE_URL = "http://localhost:8080/api";

// Test configuration
const testEmail = "rudrasaha305@gmail.com"; // Replace with your actual admin email from .env

async function testSendOTP() {
    console.log("\n🧪 Testing POST /send-otp...");
    
    try {
        const response = await fetch(`${BASE_URL}/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: testEmail }),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log("Response:", data);

        if (response.ok) {
            console.log("✅ OTP sent successfully!");
            return true;
        } else {
            console.log("❌ Failed to send OTP");
            return false;
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

async function testVerifyOTP() {
    console.log("\n🧪 Testing POST /verify-otp...");
    
    // Prompt for OTP input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question("Enter the OTP you received: ", async (otp) => {
            rl.close();

            try {
                const response = await fetch(`${BASE_URL}/verify-otp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: testEmail, otp }),
                });

                const data = await response.json();
                console.log(`Status: ${response.status}`);
                console.log("Response:", data);

                if (response.ok) {
                    console.log("✅ OTP verified successfully!");
                    console.log("🔑 Token:", data.token);
                    resolve(true);
                } else {
                    console.log("❌ Failed to verify OTP");
                    resolve(false);
                }
            } catch (error) {
                console.error("❌ Error:", error.message);
                resolve(false);
            }
        });
    });
}

async function testUnauthorizedEmail() {
    console.log("\n🧪 Testing unauthorized email...");
    
    try {
        const response = await fetch(`${BASE_URL}/send-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: "unauthorized@example.com" }),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log("Response:", data);

        if (response.status === 403) {
            console.log("✅ Unauthorized email correctly blocked!");
            return true;
        } else {
            console.log("❌ Should have blocked unauthorized email");
            return false;
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

async function testInvalidOTP() {
    console.log("\n🧪 Testing invalid OTP...");
    
    try {
        const response = await fetch(`${BASE_URL}/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: testEmail, otp: "000000" }),
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log("Response:", data);

        if (response.status === 401) {
            console.log("✅ Invalid OTP correctly rejected!");
            return true;
        } else {
            console.log("❌ Should have rejected invalid OTP");
            return false;
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

async function runTests() {
    console.log("====================================");
    console.log("🚀 Authentication Endpoints Test");
    console.log("====================================");
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log("====================================");

    // Test 1: Unauthorized email
    await testUnauthorizedEmail();

    // Test 2: Send OTP to authorized email
    const otpSent = await testSendOTP();

    if (otpSent) {
        // Test 3: Verify with invalid OTP
        await testInvalidOTP();

        // Test 4: Verify with correct OTP
        await testVerifyOTP();
    }

    console.log("\n====================================");
    console.log("✅ All tests completed!");
    console.log("====================================");
}

// Run the tests
runTests().catch(console.error);
