/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


const functions = require("firebase-functions/v2"); // Updated for v2 Functions
const cors = require("cors");
const nodemailer = require("nodemailer");
const { defineSecret } = require("firebase-functions/params"); // Import defineSecret

// Define secrets for email credentials
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");

// Enable CORS
const corsHandler = cors({ origin: true });

exports.sendEmail = functions.https.onRequest(
    {
        secrets: [emailUser, emailPass], // Attach secrets to the function
    },
    async (req, res) => {
        corsHandler(req, res, async () => {
            if (req.method !== "POST") {
                return res.status(405).send("Method Not Allowed");
            }

            const { fullName, organizationName, email } = req.body;

            // Validate request body
            if (!fullName || !organizationName || !email) {
                return res.status(400).send({ error: "Missing required fields" });
            }

            // Setup email transporter using secrets
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: emailUser.value(), // Use secret value for email user
                    pass: emailPass.value(), // Use secret value for email password
                },
            });

            const mailOptions = {
                from: emailUser.value(),
                to: "taniamlore@gmail.com", // Update with your recipient email
                subject: `Application from ${fullName}`,
                text: `Full Name: ${fullName}\nOrganization: ${organizationName}\nEmail: ${email}`,
            };

            try {
                await transporter.sendMail(mailOptions);
                return res.status(200).send({ message: "Email sent successfully!" });
            } catch (error) {
                console.error("Error sending email:", error);
                return res.status(500).send({ error: "Failed to send email." });
            }
        });
    }
);



// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
