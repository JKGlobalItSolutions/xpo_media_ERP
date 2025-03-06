const CBSECertificate1 = ({ formData, renderField }) => {
    return (
      <div className="certificate-content">
        <h1 className="text-center mb-4">TRANSFER CERTIFICATE</h1>
        <h2 className="text-center mb-4">{renderField("schoolName", "School Name")}</h2>
        <h3 className="text-center mb-4">{renderField("schoolAddress", "School Address")}</h3>
        <p className="text-center mb-4">
          Affiliation No.: {renderField("affiliationNo", "Affiliation No.")}
          School Code: {renderField("schoolCode", "School Code")}
        </p>
  
        <div className="certificate-body">
          {renderField("studentName", "1. Name of Pupil")}
          {renderField("motherName", "2. Mother's Name")}
          {renderField("fatherName", "3. Father's/Guardian's Name")}
          {renderField("dateOfBirth", "4. Date of birth (in Christian Era) according to Admission & Withdrawal Register")}
          {renderField("nationality", "5. Nationality")}
          {renderField("caste", "6. Whether the candidate belongs to Schedule Caste or Schedule Tribe or OBC")}
          {renderField("monthAndYearOfAdmission", "7. Date of first admission in the School with class")}
          {renderField("classStudying", "8. Class in which the pupil last studied (in figures)")}
          {renderField("result", "9. School/Board Annual examination last taken with result")}
          {renderField("qualifiedForPromotion", "10. Whether failed, if so once/twice in the same class")}
          {renderField("subjects", "11. Subjects studied")}
          {renderField("qualifiedForPromotion", "12. Whether qualified for promotion to the higher class")}
          {renderField("feesPaidUpto", "13. Month upto which the pupil has paid school dues")}
          {renderField(
            "scholarshipParticulars",
            "14. Any fee concession availed of: if so, the nature of such concession",
          )}
          {renderField("noOfSchoolDays", "15. Total No. of working days in the academic session")}
          {renderField("noOfSchoolDaysAttended", "16. Total No. of working days pupil present in the school")}
          {renderField("characterAndConduct", "19. General conduct")}
          {renderField("dateOfTCApplication", "20. Date of application for certificate")}
          {renderField("dateOfTransferCertificateIssue", "21. Date of issue of certificate")}
          {renderField("reasonForLeaving", "22. Reasons for leaving the school")}
        </div>
  
        <div className="mt-16 flex justify-between">
          <div>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p className="mt-8">Signature of Class Teacher</p>
          </div>
          <div className="text-center">
            <p className="mb-16">Checked by</p>
            <p>(with full name and designation)</p>
          </div>
          <div className="text-right">
            <p className="mb-16">Sign. of Principal with Seal</p>
          </div>
        </div>
      </div>
    )
  }
  
  export default CBSECertificate1
  
  