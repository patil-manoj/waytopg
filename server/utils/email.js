import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'care.way2pg@gmail.com',
    pass: 'idxs nvyv ptsv valh' // Add this to your .env file
  }
});

export const sendOwnerNotification = async (ownerEmail, studentDetails) => {
  const mailOptions = {
    from: 'care.way2pg@gmail.com',
    to: ownerEmail,
    subject: 'New Accommodation Request - Way2PG',
    html: `
      <h2>New Accommodation Request</h2>
      <p>You have received a new accommodation request from a student. Here are their details:</p>
      <ul>
        <li><strong>Name:</strong> ${studentDetails.name}</li>
        <li><strong>Phone:</strong> ${studentDetails.phoneNumber}</li>
        ${studentDetails.email ? `<li><strong>Email:</strong> ${studentDetails.email}</li>` : ''}
      </ul>
      <p>Please contact them at your earliest convenience.</p>
      <br>
      <p>Best regards,</p>
      <p>Way2PG Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
