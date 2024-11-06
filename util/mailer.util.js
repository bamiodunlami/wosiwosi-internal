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

//password reset
const passwordReset = (to, bcc, fname, password) => {
    const mailOptions = {
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: "PASSWORD RESET",
        html: 
            `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password ResetT</title>
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

//influencer unboard
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
                    <p>Welcome onboard, we are glad to have you as our Influencers</p>
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


//password change
const passwordChange = (to, bcc, fname) => {
    const mailOptions = {
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: "PASSWORD CHANGED",
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
                <title>Passwird Changed</title>
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
                    <p> Dear ${fname},</p>
                    <p>Your password has been successfully changed.</p>
                    <p>If this is not you, kindly contact us now.</p>
                    <p>Regards,<br>Wosiwosi Team<br>Wosiwosi Foods UK Limited</p>
                </div>
            </body>
            </html>`
    };
    
    transporter.sendMail(mailOptions);
};

//influencer redeem request 
const redeemRequest = (to, bcc, fname, amount) => {
    const mailOptions = {
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: "INFLUENCER BONUS REDEEM REQUEST",
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
                <title>REDEEN REQUEST</title>
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
                    <p> Dear ${fname},</p>
                    <p>Your Influencer bonus redeemption request has been received.</p>
                    <p>Amount redeemable is ${amount} </p>
                    <p>We will send you a voucher worth the above amount for shopping on wosiwosi.co.uk</p>
                    <p>Regards,<br>Wosiwosi Team<br>Wosiwosi Foods UK Limited</p>
                </div>
            </body>
            </html>`
    };
    
    transporter.sendMail(mailOptions);
};

//refund mail
const refundMail = (to, bcc, orderNumber, fname, product, amount) =>{
    mailOptions ={
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: `REFUND ORDER ${orderNumber}`,
        html: 
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>REFUND PROCCESSED</title>
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
                <p> ORDER NUMBER ${orderNumber},</p>
                <p> Dear ${fname},</p>
                <p>Thank you for shopping at Wosiwosi.</p>
                <p>The below item(s) are out of stock as at the time of packing your order and a refund has been processed:</p>
                <p>${product}</p>
                <p>Total refundable: £${amount}</p>
                <p>It should appear on the bank card through which the order was placed within 7 working days</p>
                <p>Regards,</p>
                <p>Wosiwosi Foods UK Limited</p>
            </div>
        </body>
        </html>`
    }
    transporter.sendMail(mailOptions)
    console.log("mail sent")
}

//refund mail
const alertDailyCompleteReset = (to, purpose) =>{
    mailOptions ={
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        subject: `Today's ${purpose} Reset`,
        html: 
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>REFUND PROCCESSED</title>
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
                <p> This is to let you know that today's ${purpose} order has been reset</p>
                <p>Wosiwosi Foods UK Limited</p>
            </div>
        </body>
        </html>`
    }
    transporter.sendMail(mailOptions)
}

//refund mail
const orderNotSavedToRedundant = (to, orderNumber) =>{
    mailOptions ={
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        subject: `Order not saved`,
        html: 
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>REFUND PROCCESSED</title>
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
                <p> This is to let you know that order ${orderNumber} was not saved to redundant, no mail sent to customer.</p>
                <p>Wosiwosi Foods UK Limited</p>
            </div>
        </body>
        </html>`
    }
    transporter.sendMail(mailOptions)
}

//refund mail
const sendOrderNotCompleteMail = (to, bcc, orderNumber) =>{
    mailOptions ={
        from: '"Wosiwosi" <info@wosiwosi.co.uk>',
        to: to,
        bcc:bcc,
        subject: `Order not saved`,
        html: 
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>REFUND PROCCESSED</title>
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
                <p> This is to let you know that refund for order ${orderNumber} was NOT processed because packer didn't use the complete button</p>
                <p>Wosiwosi Foods UK Limited</p>
            </div>
        </body>
        </html>`
    }
    transporter.sendMail(mailOptions)
}


module.exports ={
    passwordReset:passwordReset,
    mailInfluencerDetails:mailInfluencerDetails,
    passwordChange:passwordChange,
    redeemRequest:redeemRequest,
    refundMail:refundMail,
    alertDailyCompleteReset:alertDailyCompleteReset,
    orderNotSavedToRedundant:orderNotSavedToRedundant,
    sendOrderNotCompleteMail:sendOrderNotCompleteMail,
}