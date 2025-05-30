const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const { fileBase64 } = body;

  const checkEditPerms = require("./utils/checkEditPerms.js");
    const checkPerms = await checkEditPerms.checkEditPerms(body.userToRegister);
    if (checkPerms.status === "error" || checkPerms.status === "denied") {
      return {
        statusCode: 403,
        body: JSON.stringify({ status: "error", message: "User does not have edit permissions."})
      }
    }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'kepler_profiles',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'auto' }, // Resize and crop to 300x300
      ],
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: uploadResponse.secure_url }),
    };
  } catch (err) {
    console.error('Upload error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload image' }),
    };
  }
};