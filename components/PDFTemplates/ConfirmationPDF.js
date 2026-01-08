/**
 * Generate HTML for confirmation/transaction PDF
 * @param {Object} params - Configuration object
 * @param {Function} params.t - Translation function
 * @param {string} params.language - Current language
 * @param {boolean} params.isRTL - Is right-to-left layout
 * @param {string} params.vesselName - Vessel name
 * @param {number} params.pricePerPax - Price per passenger
 * @param {string} params.fromPort - Departure port
 * @param {string} params.toPort - Arrival port
 * @param {Array} params.passengers - Array of passenger objects
 * @param {number} params.subtotal - Subtotal amount
 * @param {number} params.taxes - Tax amount
 * @param {number} params.totalPrice - Total price
 * @param {string} params.currency - Currency symbol
 * @param {Object} params.assets - Base64 asset data URIs
 * @param {string} params.reservationNumber - Reservation number
 * @param {string} params.paymentMethod - Payment method
 * @param {string} params.paymentStatus - Payment status
 * @param {Date} params.startDate - Trip start date
 * @param {Date} params.endDate - Trip end date
 * @param {number} params.durationDays - Duration in days
 * @param {number} params.durationHours - Duration in hours
 * @returns {string} HTML string
 */
export const generateConfirmationHTML = ({
  t,
  language,
  isRTL,
  vesselName,
  pricePerPax,
  fromPort,
  toPort,
  passengers,
  subtotal,
  taxes,
  totalPrice,
  currency,
  assets,
  reservationNumber,
  paymentMethod,
  paymentStatus,
  startDate,
  endDate,
  durationDays,
  durationHours
}) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const transactionDetails = `
    <h3 style="font-size: 16px; font-weight: bold; color: black; margin-bottom: 16px;">${t('confirmation.transactionDetails')}</h3>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.reservationNumber')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${reservationNumber}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.paymentMethod')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${paymentMethod}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.paymentState')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${paymentStatus}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span style="font-size: 16px; color: black;">${t('confirmation.totalPrice')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${currency}${totalPrice.toFixed(2)}</span>
    </div>
  `;

  const priceDetails = `
    <h3 style="font-size: 16px; font-weight: bold; color: black; margin-bottom: 16px;">${t('confirmation.priceDetails')}</h3>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.adultEconomy', { count: passengers.length })}</span> 
      <span style="font-size: 14px; font-weight: bold;">${currency}${subtotal.toFixed(2)}</span>
    </div>
    <div style="margin-bottom: 12px;"></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.subtotal')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${currency}${subtotal.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${t('confirmation.taxes')}</span> 
      <span style="font-size: 14px; font-weight: bold;">${currency}${taxes.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span style="font-size: 16px; font-weight: bold; color: black;">${t('confirmation.total')}</span> 
      <span style="font-size: 16px; font-weight: bold;">${currency}${totalPrice.toFixed(2)}</span>
    </div>
  `;
  
  const passengerRows = passengers.map(p => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 16px; color: black;">${p.firstName} ${p.lastName}</span>
      <span style="font-size: 14px; font-weight: bold;">${p.pnr || 'ABC012'}</span>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t('confirmation.headerTitle')}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background-color: #edf3ff; 
          margin: 0; 
          padding: 20px; 
        }
        .ticket-container { 
          margin: auto; 
          max-width: 600px; 
          margin-bottom: 24px; 
          background-color: white; 
          border-radius: 16px; 
          position: relative; 
          box-shadow: 0 8px 25px rgba(154, 189, 255, 0.25); 
        }
        .details-widget { 
          margin: auto; 
          max-width: 600px; 
          background-color: white; 
          border-radius: 16px; 
          box-shadow: 0 4px 15px rgba(216, 228, 246, 0.7); 
        }
        .content { padding: 24px; }
        .separator { 
          height: 1px; 
          background-color: #f0f0f0; 
          margin: 16px 0; 
        }
        .details-separator { 
          height: 1px; 
          background-color: #f0f0f0; 
          margin: 0 24px; 
        }
        .ticket-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .vessel-name { 
          font-size: 18px; 
          font-weight: bold; 
          color: black; 
        }
        .price-info { 
          text-align: ${isRTL ? 'left' : 'right'}; 
        }
        .vessel-details { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
        }
        .port-column { flex: 0.4; }
        .route-column { 
          flex: 0.2; 
          text-align: center; 
          padding-top: 30px; 
        }
        .badge { 
          display: inline-flex; 
          align-items: center; 
          background-color: #EDF3FF; 
          border-radius: 20px; 
          padding: 4px 12px; 
          font-size: 13px; 
          color: #5C7096; 
        }
        .badge img { 
          width: 16px; 
          height: 16px; 
          margin-right: 8px; 
          vertical-align: middle; 
        }
        .port-name { 
          font-size: 16px; 
          font-weight: bold; 
          margin-top: 8px; 
        }
        .date-time { 
          font-size: 14px; 
          line-height: 1.4; 
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="content">
          <div class="ticket-header">
            <div class="vessel-name">${vesselName}</div>
            <div class="price-info">
              <div style="font-size: 15px; color: #7E92B9;">${t('confirmation.estPrice')}</div>
              <div>
                <span style="font-weight: bold; color: #6291E8; font-size: 18px;">${currency}${pricePerPax.toFixed(2)}</span>
                <span>${t('confirmation.pax')}</span>
              </div>
            </div>
          </div>
          <div class="separator"></div>
          <div class="vessel-details">
            <div class="port-column" style="text-align: ${isRTL ? 'right' : 'left'};">
              <div class="badge">
                <img src="${assets.fromIcon}">
                <span>${t('confirmation.departure')}</span>
              </div>
              <div class="port-name">${fromPort}</div>
              <div class="date-time">${formatDate(startDate)}<br>${formatTime(startDate)}</div>
            </div>
            <div class="route-column">
              <img src="${assets.shipIcon}" style="width: 35px; height: 35px;">
              <div style="font-size: 12px; color: #5C7096;">${t('summary.estDuration', { days: durationDays, hours: durationHours })}</div>
            </div>
            <div class="port-column" style="text-align: ${isRTL ? 'left' : 'right'};">
              <div class="badge">
                <img src="${assets.toIcon}">
                <span>${t('confirmation.arrival')}</span>
              </div>
              <div class="port-name">${toPort}</div>
              <div class="date-time">${formatDate(endDate)}<br>${formatTime(endDate)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="details-widget">
        <div class="content">${transactionDetails}</div>
        <div class="details-separator"></div>
        <div class="content">${priceDetails}</div>
        <div class="details-separator"></div>
        <div class="content">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <h3 style="font-size: 16px; font-weight: bold; color: black; margin: 0;">${t('confirmation.passenger')}</h3>
            <h3 style="font-size: 16px; font-weight: bold; color: black; margin: 0;">${t('confirmation.pnr')}</h3>
          </div>
          ${passengerRows}
        </div>
      </div>
    </body>
    </html>
  `;
};