/**
 * Generate HTML for e-ticket PDF
 * @param {Object} params - Configuration object
 * @param {Function} params.t - Translation function
 * @param {string} params.language - Current language
 * @param {boolean} params.isRTL - Is right-to-left layout
 * @param {Array} params.passengers - Array of passenger objects with passengerName and tripDetailsData
 * @param {Object} params.assets - Base64 asset data URIs (logo, barcode, lineDot)
 * @param {Array} params.instructionItems - Array of instruction objects with title and content
 * @returns {string} HTML string
 */
export const generateETicketHTML = ({ 
  t, 
  language,
  isRTL,
  passengers,
  assets,
  instructionItems = []
}) => {
  const tripDetailsKeys = [
    "tripNumber", "ticketNumber", "tripDate", "vessel", "nationality",
    "degree", "route", "passportNumber", "reservationNumber"
  ];

  // Generate all ticket cards
  const ticketCards = passengers.map(({ passengerName, tripDetailsData }) => {
    const detailsRows = tripDetailsKeys.map(key => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: bold; color: black;">${t(`eticket.${key}`)}</span>
        <span style="font-size: 13px; color: black;">${tripDetailsData[key] || ''}</span>
      </div>
    `).join('');

    return `
      <div class="card-container" style="page-break-after: ${passengers.length > 1 ? 'always' : 'auto'};">
        <div class="card-header">
          <div>
            <div class="passenger-label">${t('eticket.passengerNameLabel')}</div>
            <div class="passenger-name">${passengerName}</div>
          </div>
          <img src="${assets.logo}" class="logo" alt="Logo">
        </div>
        <div class="details-container">${detailsRows}</div>
        <div class="barcode-container">
           <img src="${assets.lineDot}" class="separator-line" alt="">
           <img src="${assets.barcode}" class="barcode-image" alt="Barcode">
        </div>
      </div>
    `;
  }).join('');

  const instructionsSection = instructionItems.length > 0 ? `
    <div style="margin-top: 20px; padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; page-break-before: always;">
      <h3 style="font-size: 16px; font-weight: bold; color: black; margin-bottom: 20px; text-align: ${isRTL ? 'right' : 'left'};">
        ${t('eticket.instructionsTitle')}
      </h3>
      ${instructionItems.map(item => `
        <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 14px; font-weight: 600; color: black; margin-bottom: 8px; text-align: ${isRTL ? 'right' : 'left'};">
            ${item.title}
          </div>
          <div style="font-size: 13px; color: #666; line-height: 1.6; text-align: ${isRTL ? 'right' : 'left'};">
            ${item.content}
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-Tickets</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background-color: #edf3ff; 
          margin: 0; 
          padding: 20px; 
        }
        .card-container { 
          background-color: white; 
          border-radius: 16px; 
          max-width: 400px; 
          width: 100%; 
          margin: 0 auto 20px auto; 
          box-shadow: 0 8px 25px rgba(154, 189, 255, 0.25); 
          position: relative; 
          overflow: hidden; 
        }
        .card-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 32px; 
          border-bottom: 1px solid #f0f0f0; 
        }
        .passenger-label { 
          font-size: 12px; 
          color: #888d9a; 
          font-weight: bold; 
          margin-bottom: 8px; 
        }
        .passenger-name { 
          font-size: 20px; 
          font-weight: bold; 
          color: black; 
        }
        .logo { 
          width: 60px; 
          height: 60px; 
        }
        .details-container { 
          padding: 24px 32px 40px 32px; 
        }
        .barcode-container { 
          text-align: center; 
          position: relative; 
          padding: 20px 0 32px 0; 
        }
        .separator-line { 
          width: 100%; 
          height: 2px; 
          object-fit: cover; 
          position: absolute; 
          top: -10px; 
          left: 0; 
        }
        .barcode-image { 
          width: 90%; 
          height: 75px; 
          object-fit: contain; 
          margin-top: 16px; 
        }
      </style>
    </head>
    <body>
      ${ticketCards}
      ${instructionsSection}
    </body>
    </html>
  `;
};