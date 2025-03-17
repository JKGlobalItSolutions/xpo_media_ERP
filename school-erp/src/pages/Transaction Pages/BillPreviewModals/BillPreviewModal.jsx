"use client"

import { useRef } from "react"
import { Modal, Button, Table } from "react-bootstrap"
import { FaPrint, FaFilePdf } from "react-icons/fa"
import jsPDF from "jspdf"
import "jspdf-autotable"

const BillPreviewModal = ({ show, onHide, billData, feeTableData, schoolInfo, onClose }) => {
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
    doc.save(`bill_${billData.billNumber.replace(/\//g, "-")}.pdf`)
  }

  // Generate bill PDF
  const generateBillPDF = () => {
    const doc = new jsPDF()

    // Add school header - reduced spacing
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(schoolInfo.name, 105, 20, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(schoolInfo.address, 105, 25, { align: "center" }) // Reduced Y position

    // Add bill header - reduced spacing
    doc.setLineWidth(0.5)
    doc.line(14, 30, 196, 30) // Reduced Y position

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Bill Receipt", 105, 38, { align: "center" }) // Reduced Y position
    doc.text("SCAN & PAY", 170, 38) // Reduced Y position

    doc.line(14, 42, 196, 42) // Reduced Y position

    // Add student details - reduced spacing
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Adm.No.", 20, 50) // Reduced Y position
    doc.text(":", 50, 50) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.admissionNumber, 55, 50) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Student Name", 20, 56) // Reduced Y position and spacing
    doc.text(":", 50, 56) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.studentName, 55, 56) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Father Name", 20, 62) // Reduced Y position and spacing
    doc.text(":", 50, 62) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.fatherName, 55, 62) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Class", 20, 68) // Reduced Y position and spacing
    doc.text(":", 50, 68) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.course, 55, 68) // Reduced Y position

    // Add bill details - reduced spacing
    doc.setFont("helvetica", "bold")
    doc.text("Bill No.", 120, 50) // Reduced Y position
    doc.text(":", 145, 50) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.billNumber, 150, 50) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Date", 120, 56) // Reduced Y position and spacing
    doc.text(":", 145, 56) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.billDate.toLocaleDateString(), 150, 56) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Payment Mode", 120, 62) // Reduced Y position and spacing
    doc.text(":", 145, 62) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.paymentMode, 150, 62) // Reduced Y position

    doc.setFont("helvetica", "bold")
    doc.text("Section", 120, 68) // Reduced Y position and spacing
    doc.text(":", 145, 68) // Reduced Y position
    doc.setFont("helvetica", "normal")
    doc.text(billData.section, 150, 68) // Reduced Y position

    // Add fee table - reduced spacing
    doc.line(14, 74, 196, 74) // Reduced Y position

    // Table headers
    doc.setFont("helvetica", "bold")
    doc.text("Sl.No.", 20, 80) // Reduced Y position
    doc.text("Description", 60, 80) // Reduced Y position
    doc.text("Amount", 160, 80) // Reduced Y position

    doc.line(14, 84, 196, 84) // Reduced Y position

    // Table content - reduced spacing
    let yPos = 90 // Reduced starting Y position
    let totalAmount = 0
    let totalConcession = 0
    let slNo = 1

    // First display regular fee payments
    const paidFees = feeTableData.filter((fee) => Number.parseFloat(fee.paidAmount) > 0)

    paidFees.forEach((fee) => {
      doc.setFont("helvetica", "normal")
      doc.text(slNo.toString(), 20, yPos)
      doc.text(fee.heading, 60, yPos)
      const amount = Number.parseFloat(fee.paidAmount)
      doc.text(amount.toFixed(2), 170, yPos, { align: "right" })
      totalAmount += amount
      yPos += 8 // Reduced line spacing
      slNo++
    })

    // Then display concessions if any
    const concessionFees = feeTableData.filter((fee) => Number.parseFloat(fee.concessionAmount) > 0)

    if (concessionFees.length > 0) {
      doc.setFont("helvetica", "normal")
      doc.text(slNo.toString(), 20, yPos)
      doc.text("Concession", 60, yPos)

      // Calculate total concession amount
      concessionFees.forEach((fee) => {
        totalConcession += Number.parseFloat(fee.concessionAmount)
      })

      // Display concession as negative amount in red
      doc.setTextColor(220, 53, 69) // Red color for concession
      doc.text((-totalConcession).toFixed(2), 170, yPos, { align: "right" })
      doc.setTextColor(0, 0, 0) // Reset to black

      yPos += 8 // Reduced line spacing
    }

    // Calculate net amount after concession
    const netAmount = totalAmount - totalConcession

    // Total - reduced spacing
    doc.line(14, yPos, 196, yPos)
    yPos += 8 // Reduced spacing

    // Convert number to words
    const amountInWords = numberToWords(netAmount)
    doc.setFont("helvetica", "italic")
    doc.text(`Rupees (${amountInWords} Only)`, 20, yPos)

    doc.setFont("helvetica", "bold")
    doc.text(netAmount.toFixed(2), 170, yPos, { align: "right" })

    doc.line(14, yPos + 4, 196, yPos + 4) // Reduced spacing

    // Signature - reduced spacing
    yPos += 20 // Reduced spacing
    doc.setFont("helvetica", "bold")
    doc.text("Accountant Sign", 160, yPos)

    // Notes - reduced spacing
    yPos += 15 // Reduced spacing
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Note:", 20, yPos)
    yPos += 4 // Reduced spacing
    doc.text(
      "1. Ensure that entries are correct. 2. Fees once paid will not be refunded 3. Receipt to be produced at any time on demand.",
      20,
      yPos,
    )
    yPos += 4 // Reduced spacing
    doc.text(
      "4. This receipt is valid subject to realisation of cheque, bounced cheques will not be returned.",
      20,
      yPos,
    )

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

  // Calculate total paid amount
  const totalPaidAmount = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)

  // Calculate total concession amount
  const totalConcessionAmount = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0), 0)

  // Calculate net amount after concession
  const netAmount = totalPaidAmount - totalConcessionAmount

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">Bill Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={billPreviewRef} className="bill-preview">
          <div className="text-center mb-3">
            <h3 className="school-name">{schoolInfo.name}</h3>
            <p className="school-address">{schoolInfo.address}</p>
          </div>

          <div className="bill-header">
            <h4 className="text-center">Bill Receipt</h4>
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
                  <span className="detail-value">{billData.course}</span>
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
                  <span className="detail-value">{billData.billDate.toLocaleDateString()}</span>
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
              {/* Regular fee payments */}
              {feeTableData
                .filter((fee) => Number.parseFloat(fee.paidAmount) > 0)
                .map((fee, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{fee.heading}</td>
                    <td className="text-end">{Number.parseFloat(fee.paidAmount).toFixed(2)}</td>
                  </tr>
                ))}

              {/* Concession row if any */}
              {totalConcessionAmount > 0 && (
                <tr>
                  <td>{feeTableData.filter((fee) => Number.parseFloat(fee.paidAmount) > 0).length + 1}</td>
                  <td>Concession</td>
                  <td className="text-end text-danger">{(-totalConcessionAmount).toFixed(2)}</td>
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

export default BillPreviewModal

