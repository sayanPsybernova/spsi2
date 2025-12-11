const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase Client for DB operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Using Anon key for now, ideally use Service Role for backend
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory session store: { "9199999999": { step: "LOGIN_EMAIL", data: {...} } }
const userSessions = new Map();

// Meta API Configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; 
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID; 

const sendWhatsAppMessage = async (to, text, options = []) => {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.log("⚠️ WhatsApp Config Missing. Message to", to, ":", text);
        return;
    }

    try {
        let payload = {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: text }
        };

        if (options.length > 0) {
            // WhatsApp Interactive Button Message (Max 3 buttons)
            if (options.length <= 3) {
                payload = {
                    messaging_product: "whatsapp",
                    to: to,
                    type: "interactive",
                    interactive: {
                        type: "button",
                        body: { text: text },
                        action: {
                            buttons: options.map(opt => ({
                                type: "reply",
                                reply: { id: opt.toLowerCase().replace(" ", "_"), title: opt }
                            }))
                        }
                    }
                };
            } else {
                // List Message (for > 3 options) - Simplified for this demo as text
                payload.text.body = text + "\n\nOptions:\n" + options.map((opt, i) => `${i+1}. ${opt}`).join("\n");
            }
        }

        await axios.post(
            `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
            payload,
            { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
        );
    } catch (error) {
        console.error("Error sending WhatsApp message:", error.response?.data || error.message);
    }
};

const processMessage = async (from, messageBody) => {
    let session = userSessions.get(from) || { step: "WELCOME", data: {} };
    const input = messageBody.text?.body || messageBody.interactive?.button_reply?.title || "";

    console.log(`📩 Msg from ${from} [${session.step}]: ${input}`);

    try {
        switch (session.step) {
            case "WELCOME":
                await sendWhatsAppMessage(from, "👋 Welcome to SPSI System! \n\nPlease select your role:", ["Supervisor", "Validator", "Admin"]);
                session.step = "LOGIN_ROLE";
                break;

            case "LOGIN_ROLE":
                session.data.role = input.toLowerCase();
                if (!['supervisor', 'validator', 'admin'].includes(session.data.role)) {
                    await sendWhatsAppMessage(from, "⚠️ Invalid Role. Please type Supervisor, Validator, or Admin.");
                    return; 
                }
                await sendWhatsAppMessage(from, "Please enter your **Email ID**:");
                session.step = "LOGIN_EMAIL";
                break;

            case "LOGIN_EMAIL":
                session.data.email = input.trim();
                await sendWhatsAppMessage(from, "Please enter your **Password**:");
                session.step = "LOGIN_PASSWORD";
                break;

            case "LOGIN_PASSWORD":
                const password = input.trim();
                // Authenticate with Supabase
                const { data: users, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.data.email)
                    .single();

                if (error || !users || users.password !== password) { // Simple password check (hashing recommended in prod) 
                     await sendWhatsAppMessage(from, "❌ Login Failed. Invalid credentials.\n\nType 'Hi' to start over.");
                     userSessions.delete(from);
                     return;
                }
                
                // Verify Role
                if (users.role !== session.data.role) {
                     await sendWhatsAppMessage(from, `❌ Access Denied. You are not a ${session.data.role}.\n\nType 'Hi' to start over.`);
                     userSessions.delete(from);
                     return;
                }

                session.data.user = users;
                await sendWhatsAppMessage(from, `✅ Welcome back, *${users.name}*!`);

                if (session.data.role === 'supervisor') {
                    // Fetch Work Orders
                    // NOTE: In a real app, you might want to filter active work orders
                    const { data: wos } = await supabase.from('work_orders').select('*').limit(5);
                    session.data.availableWOs = wos;
                    
                    const woOptions = wos.map(w => w.order_number); // Limit ensures we don't spam too much text
                    await sendWhatsAppMessage(from, "Select a **Work Order**:", woOptions.length <= 3 ? woOptions : []);
                    
                    if (woOptions.length > 3) {
                         // Send as text list if buttons not possible
                         await sendWhatsAppMessage(from, "Type the Work Order Number from above:");
                    }
                    
                    session.step = "WO_SELECT";
                } else {
                    await sendWhatsAppMessage(from, "Currently, only the Supervisor flow is enabled on WhatsApp.");
                    userSessions.delete(from);
                }
                break;

            case "WO_SELECT":
                const selectedWO = session.data.availableWOs.find(w => w.order_number.toLowerCase() === input.toLowerCase());
                if (!selectedWO) {
                    await sendWhatsAppMessage(from, "⚠️ Invalid Work Order. Please select from the list.");
                    return;
                }
                session.data.workOrderId = selectedWO.id;

                // Fetch Line Items
                const { data: lis } = await supabase.from('line_items').select('*').eq('work_order_id', selectedWO.id);
                session.data.availableLIs = lis;
                
                const liNames = lis.map(l => l.name);
                let msg = "Select **Line Item**:\n";
                liNames.forEach((n, i) => msg += `${i+1}. ${n}\n`);
                
                await sendWhatsAppMessage(from, msg);
                session.step = "LI_SELECT";
                break;

            case "LI_SELECT":
                // Try to match by name or index (1, 2, 3)
                let selectedLI = session.data.availableLIs.find(l => l.name.toLowerCase() === input.toLowerCase());
                if (!selectedLI && !isNaN(input)) {
                    const index = parseInt(input) - 1;
                    if (index >= 0 && index < session.data.availableLIs.length) {
                        selectedLI = session.data.availableLIs[index];
                    }
                }

                if (!selectedLI) {
                    await sendWhatsAppMessage(from, "⚠️ Invalid selection. Please type the Name or Number.");
                    return;
                }

                session.data.lineItemId = selectedLI.id;
                session.data.uom = selectedLI.uom;
                await sendWhatsAppMessage(from, `Enter **Quantity** (in ${selectedLI.uom}):`);
                session.step = "QTY_INPUT";
                break;

            case "QTY_INPUT":
                if (isNaN(input)) {
                     await sendWhatsAppMessage(from, "⚠️ Please enter a valid number.");
                     return;
                }
                session.data.quantity = input;
                await sendWhatsAppMessage(from, "Enter **Actual Manpower** (e.g., 1 Sup + 3 Lab):");
                session.step = "MANPOWER_INPUT";
                break;

            case "MANPOWER_INPUT":
                session.data.actualManpower = input;
                await sendWhatsAppMessage(from, "Enter **Material Consumed** (or type 'None'):");
                session.step = "MATERIAL_INPUT";
                break;

            case "MATERIAL_INPUT":
                session.data.materialConsumed = input;
                await sendWhatsAppMessage(from, "📸 Please send a **Photo** of the work.");
                session.step = "PHOTO_UPLOAD";
                break;

            case "PHOTO_UPLOAD":
                if (messageBody.image) {
                    const imageId = messageBody.image.id;
                    // In a real app, download image using ID -> Buffer -> Upload to Storage (Supabase/Firebase)
                    // For now, we will save the WhatsApp Media ID as a placeholder
                    session.data.photoId = imageId;
                    
                    // SUBMIT DATA
                    const submissionData = {
                        supervisor_id: session.data.user.id,
                        supervisor_name: session.data.user.name,
                        work_order_id: session.data.workOrderId,
                        line_item_id: session.data.lineItemId,
                        quantity: parseFloat(session.data.quantity),
                        actual_manpower: session.data.actualManpower,
                        material_consumed: session.data.materialConsumed === 'None' ? null : session.data.materialConsumed,
                        evidence_photos: [`whatsapp_media_${imageId}`], // Placeholder
                        status: 'Pending Validation'
                    };

                    const { error: subError } = await supabase.from('submissions').insert([submissionData]);

                    if (subError) {
                         console.error(subError);
                         await sendWhatsAppMessage(from, "❌ Error saving submission. Try again.");
                    } else {
                         await sendWhatsAppMessage(from, "✅ **Entry Submitted Successfully!**\n\nType 'Hi' to start a new entry.");
                         userSessions.delete(from); // Clear session
                    }

                } else {
                    await sendWhatsAppMessage(from, "⚠️ Please send an image file.");
                }
                break;
        }

        userSessions.set(from, session);

    } catch (e) {
        console.error("Bot Error:", e);
        await sendWhatsAppMessage(from, "⚠️ System Error. Please try again later.");
    }
};

// Webhook Verification (Required by Meta)
const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Use a fixed verify token or env variable
    const VERIFY_TOKEN = "spsi_verification_token"; 

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

// Handle Incoming Messages
const handleIncomingMessage = async (req, res) => {
    const body = req.body;

    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const msg = body.entry[0].changes[0].value.messages[0];
            const from = msg.from; // Phone number
            await processMessage(from, msg);
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
};

module.exports = {
    verifyWebhook,
    handleIncomingMessage
};
