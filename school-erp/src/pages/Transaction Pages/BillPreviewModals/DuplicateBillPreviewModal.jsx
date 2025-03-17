"use client"

import { useRef } from "react"
import { Modal, Button, Table } from "react-bootstrap"
import { FaPrint, FaFilePdf } from "react-icons/fa"
import jsPDF from "jspdf"
import "jspdf-autotable"

const DuplicateBillPreviewModal = ({ show, onHide, billData, feeTableData, schoolInfo, onClose }) => {
  const billPreviewRef = useRef(null)

  // Handle print bill
  const handlePrintBill = () => {
    const doc = generateBillPDF()
    doc.autoPrint()
    window.open(doc.output("bloburl"), "_blank")
  }

  // Handle download bill as PDF
  const handleDownloadBill = () => {
    const doc = generateBillPDF()
    doc.save(`duplicate_bill_${billData.billNumber.replace(/\//g, "-")}.pdf`)
  }

  // Generate bill PDF
  const generateBillPDF = () => {
    const doc = new jsPDF()

    // Add school header
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(schoolInfo.name, 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(schoolInfo.address, 105, 25, { align: "center" })

    // Add bill header
    doc.setLineWidth(0.5)
    doc.line(14, 30, 196, 30)

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Duplicate Bill Receipt", 105, 38, { align: "center" })
    doc.text("SCAN & PAY", 170, 38)

    doc.line(14, 42, 196, 42)

    // Add student details
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Adm.No.", 20, 50)
    doc.text(":", 50, 50)
    doc.setFont("helvetica", "normal")
    doc.text(billData.admissionNumber, 55, 50)

    doc.setFont("helvetica", "bold")
    doc.text("Student Name", 20, 56)
    doc.text(":", 50, 56)
    doc.setFont("helvetica", "normal")
    doc.text(billData.studentName, 55, 56)

    doc.setFont("helvetica", "bold")
    doc.text("Father Name", 20, 62)
    doc.text(":", 50, 62)
    doc.setFont("helvetica", "normal")
    doc.text(billData.fatherName, 55, 62)

    doc.setFont("helvetica", "bold")
    doc.text("Class", 20, 68)
    doc.text(":", 50, 68)
    doc.setFont("helvetica", "normal")
    doc.text(billData.course || billData.standard, 55, 68)

    // Add bill details
    doc.setFont("helvetica", "bold")
    doc.text("Bill No.", 120, 50)
    doc.text(":", 145, 50)
    doc.setFont("helvetica", "normal")
    doc.text(billData.billNumber, 150, 50)

    doc.setFont("helvetica", "bold")
    doc.text("Date", 120, 56)
    doc.text(":", 145, 56)
    doc.setFont("helvetica", "normal")

    // Handle date display for both Date objects and Firestore timestamps
    let dateDisplay = ""
    if (billData.billDate) {
      if (typeof billData.billDate.toDate === "function") {
        // It's a Firestore timestamp
        dateDisplay = billData.billDate.toDate().toLocaleDateString()
      } else if (billData.billDate instanceof Date) {
        // It's a Date object
        dateDisplay = billData.billDate.toLocaleDateString()
      } else if (typeof billData.billDate === "string") {
        // It's a string date
        dateDisplay = billData.billDate
      }
    }

    doc.text(dateDisplay, 150, 56)

    doc.setFont("helvetica", "bold")
    doc.text("Payment Mode", 120, 62)
    doc.text(":", 145, 62)
    doc.setFont("helvetica", "normal")
    doc.text(billData.paymentMode, 150, 62)

    doc.setFont("helvetica", "bold")
    doc.text("Section", 120, 68)
    doc.text(":", 145, 68)
    doc.setFont("helvetica", "normal")
    doc.text(billData.section, 150, 68)

    // Add fee table
    doc.line(14, 74, 196, 74)

    // Table headers
    doc.setFont("helvetica", "bold")
    doc.text("Sl.No.", 20, 80)
    doc.text("Description", 60, 80)
    doc.text("Amount", 160, 80)

    doc.line(14, 84, 196, 84)

    // Table content
    let yPos = 90
    let totalAmount = 0
    let totalConcession = 0
    let slNo = 1

    // Process regular fee entries
    const regularFees = feeTableData.filter(
      (fee) => fee.description !== "Concession" && Number.parseFloat(fee.amount) > 0,
    )

    regularFees.forEach((fee) => {
      doc.setFont("helvetica", "normal")
      doc.text(slNo.toString(), 20, yPos)
      doc.text(fee.description || fee.feeHead || fee.heading, 60, yPos)
      const amount = Number.parseFloat(fee.amount)
      doc.text(amount.toFixed(2), 170, yPos, { align: "right" })
      totalAmount += amount
      yPos += 8
      slNo++
    })

    // Process concession entries
    const concessionFees = feeTableData.filter(
      (fee) => fee.description === "Concession" || fee.isConcession === true || Number.parseFloat(fee.amount) < 0,
    )

    if (concessionFees.length > 0) {
      doc.setFont("helvetica", "normal")
      doc.text(slNo.toString(), 20, yPos)
      doc.text("Concession", 60, yPos)

      // Calculate total concession amount
      concessionFees.forEach((fee) => {
        const amount = Math.abs(Number.parseFloat(fee.amount))
        totalConcession += amount
      })

      // Display concession as negative amount in red
      doc.setTextColor(220, 53, 69) // Red color for concession
      doc.text((-totalConcession).toFixed(2), 170, yPos, { align: "right" })
      doc.setTextColor(0, 0, 0) // Reset to black

      yPos += 8
    }

    // Calculate net amount after concession
    const netAmount = totalAmount - totalConcession

    // Total
    doc.line(14, yPos, 196, yPos)
    yPos += 8

    // Convert number to words
    const amountInWords = numberToWords(netAmount)
    doc.setFont("helvetica", "italic")
    doc.text(`Rupees (${amountInWords} Only)`, 20, yPos)

    doc.setFont("helvetica", "bold")
    doc.text(netAmount.toFixed(2), 170, yPos, { align: "right" })

    doc.line(14, yPos + 4, 196, yPos + 4)

    // Signature
    yPos += 20
    doc.setFont("helvetica", "bold")
    doc.text("Accountant Sign", 160, yPos)

    // Notes
    yPos += 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Note:", 20, yPos)
    yPos += 4
    doc.text(
      "1. Ensure that entries are correct. 2. Fees once paid will not be refunded 3. Receipt to be produced at any time on demand.",
      20,
      yPos,
    )
    yPos += 4
    doc.text(
      "4. This receipt is valid subject to realisation of cheque, bounced cheques will not be returned.",
      20,
      yPos,
    )

    // Add duplicate watermark
    doc.setFontSize(40)
    doc.setTextColor(200, 200, 200) // Light gray
    doc.setFont("helvetica", "bold")
    doc.text("DUPLICATE", 105, 140, {
      align: "center",
      angle: 45,
    })
    doc.setTextColor(0, 0, 0) // Reset to black

    return doc
  }

  // Convert number to words
  const numberToWords = (num) => {
    const units = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ]
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

    if (num === 0) return "zero"

    const convertLessThanThousand = (num) => {
      if (num === 0) return ""

      if (num < 20) {
        return units[num]
      }

      if (num < 100) {
        return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + units[num % 10] : "")
      }

      return (
        units[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " " + convertLessThanThousand(num % 100) : "")
      )
    }

    let words = ""

    if (num >= 100000) {
      words += convertLessThanThousand(Math.floor(num / 100000)) + " lakh "
      num %= 100000
    }

    if (num >= 1000) {
      words += convertLessThanThousand(Math.floor(num / 1000)) + " thousand "
      num %= 1000
    }

    if (num > 0) {
      words += convertLessThanThousand(num)
    }

    return words.trim()
  }

  // Calculate total paid amount and concession amount
  let totalAmount = 0
  let totalConcession = 0

  // Process regular fee entries
  const regularFees = feeTableData.filter(
    (fee) => fee.description !== "Concession" && Number.parseFloat(fee.amount) > 0,
  )

  regularFees.forEach((fee) => {
    totalAmount += Number.parseFloat(fee.amount)
  })

  // Process concession entries
  const concessionFees = feeTableData.filter(
    (fee) => fee.description === "Concession" || fee.isConcession === true || Number.parseFloat(fee.amount) < 0,
  )

  concessionFees.forEach((fee) => {
    totalConcession += Math.abs(Number.parseFloat(fee.amount))
  })

  // Calculate net amount after concession
  const netAmount = totalAmount - totalConcession

  // Format date for display
  let displayDate = ""
  if (billData.billDate) {
    if (typeof billData.billDate.toDate === "function") {
      // It's a Firestore timestamp
      displayDate = billData.billDate.toDate().toLocaleDateString()
    } else if (billData.billDate instanceof Date) {
      // It's a Date object
      displayDate = billData.billDate.toLocaleDateString()
    } else if (typeof billData.billDate === "string") {
      // It's a string date
      displayDate = billData.billDate
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">Duplicate Bill Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={billPreviewRef} className="bill-preview">
          <div className="duplicate-watermark">DUPLICATE</div>
          <div className="text-center mb-3">
            <h3 className="school-name">{schoolInfo.name}</h3>
            <p className="school-address">{schoolInfo.address}</p>
          </div>

          <div className="bill-header">
            <h4 className="text-center">Duplicate Bill Receipt</h4>
            <div className="text-end">SCAN & PAY</div>
          </div>

          <div className="bill-details">
            <div className="row">
              <div className="col-6">
                <div className="detail-row">
                  <span className="detail-label">Adm.No.</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.admissionNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Student Name</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.studentName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Father Name</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.fatherName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Class</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.course || billData.standard}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="detail-row">
                  <span className="detail-label">Bill No.</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.billNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{displayDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Mode</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.paymentMode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Section</span>
                  <span className="detail-separator">:</span>
                  <span className="detail-value">{billData.section}</span>
                </div>
              </div>
            </div>
          </div>

          <Table bordered className="mt-3 bill-table">
            <thead>
              <tr>
                <th>Sl.No.</th>
                <th>Description</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Regular fee entries */}
              {regularFees.map((fee, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{fee.description || fee.feeHead || fee.heading}</td>
                  <td className="text-end">{Number.parseFloat(fee.amount).toFixed(2)}</td>
                </tr>
              ))}

              {/* Concession entry if any */}
              {concessionFees.length > 0 && (
                <tr>
                  <td>{regularFees.length + 1}</td>
                  <td>Concession</td>
                  <td className="text-end text-danger">{(-totalConcession).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="text-start">
                  <em>Rupees ({numberToWords(netAmount)} Only)</em>
                </td>
                <td className="text-end fw-bold">{netAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>

          <div className="mt-5 text-end">
            <p>Accountant Sign</p>
          </div>

          <div className="mt-3 bill-notes">
            <p className="mb-1">Note:</p>
            <ol className="ps-3 mb-0">
              <li>Ensure that entries are correct.</li>
              <li>Fees once paid will not be refunded.</li>
              <li>Receipt to be produced at any time on demand.</li>
              <li>This receipt is valid subject to realisation of cheque, bounced cheques will not be returned.</li>
            </ol>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="primary" onClick={handlePrintBill} className="me-2">
          <FaPrint className="me-2" /> Print
        </Button>
        <Button variant="secondary" onClick={handleDownloadBill} className="me-2">
          <FaFilePdf className="me-2" /> Download PDF
        </Button>
        <Button variant="outline-secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>

      <style jsx>{`
        /* Bill Preview Styles */
        .bill-preview {
          padding: 20px;
          border: 1px solid #ddd;
          background-color: white;
          position: relative;
        }
        
        .duplicate-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          font-size: 60px;
          color: rgba(200, 200, 200, 0.5);
          font-weight: bold;
          z-index: 1;
          pointer-events: none;
        }
        
        .school-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .school-address {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .bill-header {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 10px 0;
          margin-bottom: 15px;
          position: relative;
        }
        
        .bill-header h4 {
          margin: 0;
          font-weight: bold;
        }
        
        .bill-details {
          margin-bottom: 15px;
        }
        
        .detail-row {
          margin-bottom: 5px;
        }
        
        .detail-label {
          font-weight: bold;
          display: inline-block;
          width: 100px;
        }
        
        .detail-separator {
          display: inline-block;
          width: 10px;
          text-align: center;
        }
        
        .detail-value {
          display: inline-block;
        }
        
        .bill-table th {
          background-color: #f8f9fa;
        }
        
        .bill-notes {
          font-size: 12px;
          color: #666;
        }
        
        .bill-notes ol {
          margin-bottom: 0;
        }
        
        .text-danger {
          color: #dc3545;
        }
      `}</style>
    </Modal>
  )
}

export default DuplicateBillPreviewModal

