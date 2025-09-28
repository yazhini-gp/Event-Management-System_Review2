import React from "react";
import jsPDF from "jspdf";

export default function Certificate({ userName, eventName }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text("Certificate of Participation", 50, 40);

    // Content
    doc.setFontSize(16);
    doc.text(`This is to certify that`, 20, 70);
    doc.setFontSize(20);
    doc.text(userName, 20, 90);
    doc.setFontSize(16);
    doc.text(`has successfully participated in the event`, 20, 110);
    doc.text(`"${eventName}"`, 20, 130);

    // Signature image
    const signature = "/signature.jpg"; // place signature.png inside public folder
    doc.addImage(signature, "PNG", 140, 160, 40, 20);

    doc.setFontSize(12);
    doc.text("Authorized Signature", 145, 190);

    // Download
    doc.save(`${userName}_certificate.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <button
        onClick={generatePDF}
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700"
      >
        Download Certificate
      </button>
    </div>
  );
}
