const TenthCertificate = ({ formData, renderField }) => {
    return (
      <div className="certificate-content">
        <h1 className="text-center mb-4">TRANSFER CERTIFICATE</h1>
        <h2 className="text-center mb-4">{renderField("schoolName", "School Name")}</h2>
        <h3 className="text-center mb-4">{renderField("schoolAddress", "School Address")}</h3>
        <p className="text-center mb-4">(Recognized by the Government of Tamil Nadu)</p>
  
        <div className="certificate-body">
          {renderField("studentName", "1. Name of the Pupil")}
          {renderField("fatherName", "2. Name of the Father")}
          {renderField("motherName", "3. Name of the Mother")}
          {renderField("nationality", "4. Nationality")}
          {renderField("religion", "5. Religion")}
          {renderField("caste", "6. Caste and Community")}
          {renderField("dateOfBirth", "7. Date of Birth (in figures and words) as entered in the Admission Register")}
          {renderField("monthAndYearOfAdmission", "8. Month and Year of Admission with Class")}
          {renderField("classStudying", "9. Class in which the pupil was studying at the time of leaving (in words)")}
          {renderField("mediumOfInstruction", "10. Medium of Instruction")}
          {renderField("scholarshipParticulars", "11. Scholarship (Nature and Period to be specified)")}
          {renderField("lastAttendanceDate", "12. Date of Pupil's Last Attendance at School")}
          {renderField("dateOfTCApplication", "13. Date of Application for Transfer Certificate")}
          {renderField("dateOfTransferCertificateIssue", "14. Date of Issue of Transfer Certificate")}
          {renderField("reasonForLeaving", "15. Reason for Leaving")}
          {renderField("noOfSchoolDays", "16. Number of School Days up to the date of leaving")}
          {renderField("noOfSchoolDaysAttended", "17. Number of School Days Attended")}
          {renderField("characterAndConduct", "18. Character and Conduct")}
        </div>
  
        <div className="mt-16 flex justify-between">
          <div>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p className="mt-8">Signature of the Class Teacher</p>
          </div>
          <div className="text-right">
            <p className="mb-16">School Seal</p>
            <p>Signature of the Headmaster</p>
          </div>
        </div>
      </div>
    )
  }
  
  export default TenthCertificate
  
  