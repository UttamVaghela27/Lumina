const PDFDocument = require("pdfkit");

/**
 * Generates a premium invoice PDF using PDFKit with a professional header
 * @param {Object} order - The order object from database
 * @returns {Promise<String>} - Base64 encoded PDF
 */
const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString("base64"));
      });

      // --- ARTISTIC HEADER WAVE ---
      doc.save();
      doc
        .moveTo(0, 0)
        .lineTo(600, 0)
        .lineTo(600, 40)
        .bezierCurveTo(400, 10, 200, 70, 0, 40)
        .fill("#1a2e1a");
      doc.restore();

      doc
        .fillColor("#000000")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("LUMINA MEDICAL STORE", 50, 80);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text("Your Trusted Pharmacy Partner", 50, 98);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("INVOICE NO:", 400, 80, { width: 150, align: "right" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`#${order._id.toString().substring(18).toUpperCase()}`, 400, 95, {
          width: 150,
          align: "right",
        });

      // Huge Stylized INVOICE title
      doc
        .fillColor("#1a2e1a")
        .fontSize(45)
        .font("Helvetica-Bold")
        .text("INVOICE", 50, 140, { letterSpacing: 2 });

      // Date and Payment Info block - Shifted down to avoid overlap
      doc
        .fillColor("#444444")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Date:", 50, 210);
      doc
        .font("Helvetica")
        .text(
          new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          85,
          210,
        );

      doc
        .font("Helvetica-Bold")
        .text("Payment:", 350, 210, { width: 100, align: "right" });
      doc
        .font("Helvetica")
        .text(order.paymentMethod, 450, 210, { width: 100, align: "right" });

      // Line separator - Shifted down
      doc
        .moveTo(50, 230)
        .lineTo(550, 230)
        .lineWidth(1)
        .strokeColor("#eeeeee")
        .stroke();

      // --- BILLING DETAILS --- Shifted down
      const billingTop = 255;
      doc
        .fillColor("#000000")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("BILLED TO", 50, billingTop);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(order.shippingAddress.fullName, 50, billingTop + 20)
        .text(order.shippingAddress.address, 50, billingTop + 35)
        .text(
          `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
          50,
          billingTop + 50,
        )
        .text(`Phone: ${order.shippingAddress.phone}`, 50, billingTop + 65);

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("FROM", 350, billingTop, { width: 200, align: "right" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Lumina Medical Store", 350, billingTop + 20, {
          width: 200,
          align: "right",
        })
        .text("123 Medical Plaza, Surat", 350, billingTop + 35, {
          width: 200,
          align: "right",
        })
        .text("Gujarat, India - 395004", 350, billingTop + 50, {
          width: 200,
          align: "right",
        })
        .text("hello@lumina-medical.com", 350, billingTop + 65, {
          width: 200,
          align: "right",
        });

      // --- TABLE HEADER --- Shifted down
      const tableTop = 385;
      doc.rect(50, tableTop, 500, 30).fill("#f5f5f5");
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9);
      doc.text("ITEM DESCRIPTION", 60, tableTop + 10);
      doc.text("QUANTITY", 250, tableTop + 10, { width: 50, align: "center" });
      doc.text("PRICE", 350, tableTop + 10, { width: 80, align: "right" });
      doc.text("AMOUNT", 450, tableTop + 10, { width: 80, align: "right" });

      // --- TABLE ITEMS ---
      let currentY = tableTop + 40;
      doc.font("Helvetica").fontSize(10).fillColor("#333333");

      order.items.forEach((item) => {
        doc.text(item.name, 60, currentY, { width: 180 });
        doc.text(item.quantity.toString(), 250, currentY, {
          width: 50,
          align: "center",
        });
        doc.text(`Rs. ${item.price.toFixed(2)}`, 350, currentY, {
          width: 80,
          align: "right",
        });
        doc.text(
          `Rs. ${(item.price * item.quantity).toFixed(2)}`,
          450,
          currentY,
          { width: 80, align: "right" },
        );
        currentY += 25;

        // Faint divider line between items
        doc
          .moveTo(50, currentY - 5)
          .lineTo(550, currentY - 5)
          .lineWidth(0.2)
          .strokeColor("#f0f0f0")
          .stroke();
      });

      // Bottom border for table
      doc
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .lineWidth(1)
        .strokeColor("#dddddd")
        .stroke();

      // --- TOTALS SECTION ---
      currentY += 20;
      doc
        .fillColor("#444444")
        .font("Helvetica-Bold")
        .text("Subtotal:", 350, currentY, { width: 80, align: "right" });
      doc
        .font("Helvetica")
        .text(`Rs. ${order.subtotalPrice.toFixed(2)}`, 450, currentY, {
          width: 80,
          align: "right",
        });

      currentY += 20;
      doc
        .font("Helvetica-Bold")
        .text("GST (18%):", 350, currentY, { width: 80, align: "right" });
      doc
        .font("Helvetica")
        .text(`Rs. ${order.taxPrice.toFixed(2)}`, 450, currentY, {
          width: 80,
          align: "right",
        });

      currentY += 30;
      // High contrast Total bar
      doc.rect(340, currentY - 10, 210, 40).fill("#1a2e1a");
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14);
      doc.text("TOTAL DUE", 350, currentY + 3);
      doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, currentY + 3, {
        width: 80,
        align: "right",
      });

      // --- FOOTER SECTION ---
      currentY += 60;
      doc
        .fontSize(10)
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .text("Thank you for choosing Lumina!", 50, currentY);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "If you have any questions, please contact us at support@lumina-medical.com",
          50,
          currentY + 15,
        );

      // Artistic Footer Wave
      const pageHeight = doc.page.height;
      doc.save();
      doc
        .moveTo(0, pageHeight)
        .lineTo(0, pageHeight - 40)
        .bezierCurveTo(
          200,
          pageHeight - 80,
          400,
          pageHeight,
          600,
          pageHeight - 40,
        )
        .lineTo(600, pageHeight)
        .fill("#1a2e1a");
      doc.restore();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
