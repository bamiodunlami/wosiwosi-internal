const nodemailer = require("nodemailer");
const appRoot = require ('app-root-path')
const path = require ('path');

const rootPath = path.resolve(process.cwd())
appRoot.setPath(rootPath)


let transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: process.env.MAILER_PORT,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.MAILER_USERNAME,
    pass: process.env.MAILER_PASS,
  },
})

const passwordReset = (to, bcc, fname, password) => {
    const mailOptions = {
        from: '"Wosiwosi Investment" <info@wosiwosi.co.uk>',
        to: to,
        bcc,
        subject: "PASSWORD RESET",
        html: 
            `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>YOUR PAYOUT</title>
                <style>
                    body {
                        font-family: Poppins, sans-serif;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        text-align: left;
                    }
                    .disclaimer{
                        font-size:11px;
                    }
                    h1 {
                        color: #007519;
                    }
                    p {
                        margin: 15px 0;
                        font-size:18px;
                    }
                </style>
            </head>
            <body>
                <div class="container">  
                    <p> Dear ${fname}</p>
                    <p>Your password reset has been initiated</p>
                    <p>Kindly login with the below password</p>
                    <h2>${password}</h2>
                    <p>You will be asked to reset your password to your prefered password when you login</p>
                    <p>If this is not you, kindly contact us ASAP</p>
                    <p>Regards,<br>Wosiwosi Investment Team<br>Wosiwosi Foods UK Limited</p>
                </div>
            </body>
            </html>`
    };
    
    transporter.sendMail(mailOptions);
};


const mailInfluencerDetails= (to, bcc, influencer, email, pass) => {
    const mailOptions = {
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: "YOUR DASHBOARD DETAILS",
        // attachments: [
        //   {  
        //       filename: 'brochure.pdf',
        //       path: appRoot + "/file/brochure.pdf" // stream this file
        //   }],
        html: 
            `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>PAss Email</title>
                <style>
                    body {
                        font-family: Poppins, sans-serif;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        text-align: left;
                    }
                    .disclaimer{
                        font-size:11px;
                    }
                    h1 {
                        color: #007519;
                    }
                    p {
                        margin: 15px 0;
                        font-size:18px;
                    }
                </style>
            </head>
            <body>
                <div class="container">  
                    <p> Dear ${influencer},</p>
                    <p>Your dashboard is ready to be viewed and below is the login details:</p>
                    <p>Email: ${email}</p>
                    <p>Password: ${pass}</p>

                    <br>
                    <a href="https://wosiwosipartner-f80fd9f8b1c9.herokuapp.com/login">
                      <button style="background-color: #007519; color: white; padding: 10px 20px; border: none; cursor: pointer;">Login here</button>
                    </a>
                    <br>

                    <p>Wosiwosi Foods UK Limited</p>
                </div>
            </body>
            </html>`
    };
    
    transporter.sendMail(mailOptions);
};

module.exports ={
    passwordReset:passwordReset,
    mailInfluencerDetails:mailInfluencerDetails,
}