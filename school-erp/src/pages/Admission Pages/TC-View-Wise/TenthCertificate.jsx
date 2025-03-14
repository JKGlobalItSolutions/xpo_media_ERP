"use client"

import { useState } from "react"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

// If you need to install the required packages, run:
// npm install jspdf xlsx

export default function TransferCertificate() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 2

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Capture each page as an image and add to PDF
    const certificateElement = document.getElementById("certificate-container")
    if (certificateElement) {
      doc.html(certificateElement, {
        callback: (pdf) => {
          pdf.save("transfer_certificate.pdf")
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
      })
    }
  }

  const exportToExcel = () => {
    // Create a workbook with certificate data
    const certificateData = {
      "Transfer Certificate": [
        {
          Field: "Aadhar No",
          Value: "984905618730",
        },
        {
          Field: "Serial No",
          Value: "1/2022",
        },
        {
          Field: "Name of the School",
          Value: "",
        },
        {
          Field: "Name of the Educational District",
          Value: "Tiruvannamalai",
        },
        {
          Field: "Name of the Revenue District",
          Value: "Tiruvannamalai",
        },
        {
          Field: "Name of the Pupil",
          Value: "RAHUL E",
        },
        {
          Field: "Name of the Father/Mother",
          Value: "Elumalai",
        },
        // Add all other fields here
      ],
    }

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(certificateData["Transfer Certificate"])
    XLSX.utils.book_append_sheet(wb, ws, "Certificate")
    XLSX.writeFile(wb, "transfer_certificate.xlsx")
  }

  // Custom Button component
  const Button = ({ onClick, disabled, children, variant }) => {
    const baseStyle = "px-4 py-2 rounded font-medium focus:outline-none transition-colors"
    const primaryStyle = "bg-blue-600 text-white hover:bg-blue-700"
    const outlineStyle = "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyle} ${variant === "outline" ? outlineStyle : primaryStyle} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {children}
      </button>
    )
  }

  // Custom icons
  const DownloadIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-1"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  )

  const FileSpreadsheetIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-1"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="8" y1="13" x2="16" y2="13"></line>
      <line x1="8" y1="17" x2="16" y2="17"></line>
      <line x1="8" y1="9" x2="10" y2="9"></line>
    </svg>
  )

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-4xl bg-white shadow-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">10th Standard Transfer Certificate</h1>
          <div className="flex gap-2">
            <Button onClick={exportToPDF}>
              <DownloadIcon />
              Download PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheetIcon />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="flex justify-between p-4 bg-gray-200">
          <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
            Previous Page
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
            Next Page
          </Button>
        </div>

        <div id="certificate-container" className="p-8 min-h-[842px] w-full" style={{ maxWidth: "210mm" }}>
          {currentPage === 1 && (
            <div className="font-serif">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">TRANSFER CERTIFICATE</h1>
                <p className="text-lg">Government of Tamil Nadu</p>
                <p className="text-sm">Department of School Education</p>
                <p className="text-xs">(Recognized by the Director of School Education)</p>
              </div>

              <div className="flex justify-between mb-4 text-sm">
                <div>
                  <span className="font-semibold">Aadhar No: </span>
                  <span>984905618730</span>
                </div>
                <div>
                  <span className="font-semibold">EMIS No: </span>
                  <span>Yes Promoted</span>
                </div>
              </div>

              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <span className="font-semibold">Serial No: </span>
                  <span>1/2022</span>
                </div>
                <div>
                  <span className="font-semibold">Admission No: </span>
                  <span>19/05/2016</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex">
                  <div className="w-1/2">
                    <p>1. (a) Name of the School</p>
                  </div>
                  <div className="w-1/2">
                    <p>: </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(b) Name of the Educational District</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Tiruvannamalai</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(c) Name of the Revenue District</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Tiruvannamalai</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>2. Name of the Pupil (in block letters)</p>
                  </div>
                  <div className="w-1/2">
                    <p>
                      : <span className="font-bold">RAHUL E</span>
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>3. Name of the Father or Mother of the Pupil</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Elumalai</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>4. Nationality, Religion & Caste</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Indian - Hindu - Vaniyar</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>5. Community</p>
                    <p>&nbsp;&nbsp;&nbsp;Whether He/She belongs to</p>
                  </div>
                  <div className="w-1/2">
                    <p>:</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(a) Adi Dravidar (S. C.) or (S. T.)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: -</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(b) Backward Class</p>
                  </div>
                  <div className="w-1/2">
                    <p>: -</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(c) Most Backward Class</p>
                  </div>
                  <div className="w-1/2">
                    <p>: MBC</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(d) Converted to Christianity from Scheduled Caste</p>
                  </div>
                  <div className="w-1/2">
                    <p>: -</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(e) Denotified Communities</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Independent</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>&nbsp;&nbsp;&nbsp;(f) Other Caste</p>
                  </div>
                  <div className="w-1/2">
                    <p>: -</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>6. Sex</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Male</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>7. Date of Birth as entered in the Admission Register</p>
                    <p>&nbsp;&nbsp;&nbsp;(in figures and words)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: 01/04/2000</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>8. Date of admission and standard in which admitted</p>
                    <p>&nbsp;&nbsp;&nbsp;(the year to be entered in words)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: 28/12/2011</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>9. Standard in which the pupil was studying at the time of</p>
                    <p>&nbsp;&nbsp;&nbsp;leaving (in words)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: xi std</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>10. Whether Qualified for Promotion</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Yes. Promoted to higher studies</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>11. Whether the Pupil has paid all the fees due to the School</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Yes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="font-serif">
              <div className="space-y-4 text-sm">
                <div className="flex">
                  <div className="w-1/2">
                    <p>12. Whether the pupil was in receipt of any scholarship</p>
                    <p>&nbsp;&nbsp;&nbsp;(Nature of the scholarship to be specified)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: BCM</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>13. Whether the pupil has undergone Medical Inspection during</p>
                    <p>&nbsp;&nbsp;&nbsp;the last academic year? (First or Repeat to be specified)</p>
                  </div>
                  <div className="w-1/2">
                    <p>: Repeat</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>14. Date on which the pupil actually left the School</p>
                  </div>
                  <div className="w-1/2">
                    <p>: 19/03/2022</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>15. The pupil's Conduct and Character</p>
                  </div>
                  <div className="w-1/2">
                    <p>: </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>16. Date on which application for Transfer Certificate</p>
                    <p>&nbsp;&nbsp;&nbsp;was made on behalf of the pupil by the parent or guardian</p>
                  </div>
                  <div className="w-1/2">
                    <p>: 19/03/2022</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>17. Date of issue of Transfer Certificate</p>
                  </div>
                  <div className="w-1/2">
                    <p>: 19/03/2022</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1/2">
                    <p>18. Course of Study :-</p>
                  </div>
                </div>

                <div className="mt-2 mb-6">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr>
                        <th className="border border-black p-2 text-center">Name of the School</th>
                        <th className="border border-black p-2 text-center">Academic Year(s)</th>
                        <th className="border border-black p-2 text-center">Standard(s) Studied</th>
                        <th className="border border-black p-2 text-center">First Language</th>
                        <th className="border border-black p-2 text-center">Medium of Instruction</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2"></td>
                        <td className="border border-black p-2 text-center">220</td>
                        <td className="border border-black p-2 text-center">200</td>
                        <td className="border border-black p-2 text-center">Tamil</td>
                        <td className="border border-black p-2 text-center">English</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex">
                  <div className="w-full">
                    <p>20. Signature of the H.M. with date and school seal</p>
                  </div>
                </div>

                <div className="border-t border-black my-8"></div>

                <div>
                  <p className="font-semibold underline">Note :</p>
                  <ol className="list-decimal pl-6 mt-2 space-y-2">
                    <li>
                      Erasures and unauthorized or Fraudulent alterations in the Certificate will lead to its
                      Cancellation.
                    </li>
                    <li>
                      Should be signed in ink by the Head of the institution, who will be held responsible for the
                      correctness of the entries.
                    </li>
                  </ol>
                </div>

                <div className="mt-8">
                  <p className="text-center font-semibold">Declaration by the Parent or Guardian</p>
                  <p className="mt-4">
                    I hereby declare that the particulars recorded against items 2 to 7 are correct and that no change
                    will be demanded by me in future.
                  </p>
                </div>

                <div className="flex justify-between mt-16">
                  <div>
                    <p>Signature of the Candidate</p>
                  </div>
                  <div>
                    <p>Signature of the Parent/Guardian</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

