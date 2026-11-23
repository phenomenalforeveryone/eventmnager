const QRCode = require("qrcode");

const generateQR = async (ticketCode) => {
  try {
    return await QRCode.toDataURL(ticketCode, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2
    });
  } catch (error) {
    throw new Error("QR code generation failed.");
  }
};

module.exports = generateQR;