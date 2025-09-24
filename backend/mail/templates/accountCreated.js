exports.accountCreated = (email, password, firstName, message) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Création de compte</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .content {
          padding: 20px 0;
        }
        .credentials {
          background-color: #f5f5f5;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Bienvenue sur notre plateforme de formation</h2>
        </div>
        <div class="content">
          <p>Bonjour ${firstName},</p>
          <p>${message}</p>
          <div class="credentials">
            <p><strong>Vos informations de connexion:</strong></p>
            <p>Email: ${email}</p>
            <p>Mot de passe temporaire: ${password}</p>
          </div>
          <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>
        </div>
        <div class="footer">
          <p>© 2025 EPBLearning . Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};
