import React from "react";

const TwelfthCertificate = ({ formData, renderField }) => {
  return (
    <div className="certificate-content">
      <h1 className="text-center mb-4">TRANSFER CERTIFICATE</h1>
      <h2 className="text-center mb-2">{formData.schoolName}</h2>
      <h3 className="text-center mb-4">{formData.schoolAddress}</h3>
      <p className="text-center mb-4">(Recognized by the Government of Tamil Nadu)</p>

      <div className="certificate-body">
        {renderField("admissionNumber", "1. Sl.No.")}
        {renderField("admissionNumber", "2. Admission No.")}
        {renderField("studentName", "3. Name of the Pupil")}
        {renderField("fatherName", "4. Name of the Father")}
        {renderField("motherName", "5. Name of the Mother")}
        {renderField("nationality", "6. Nationality")}
        {renderField("religion", "7. Religion")}
        {renderField("caste", "8. Caste")}
        {renderField("gender", "9. Sex")}
        {renderField("dateOfBirth", "10. Date of Birth (in figures and words) as entered in the Admission Register")}
        {renderField("identificationMarks", "11. Personal marks of identification")}
        {renderField("monthAndYearOfAdmission", "12. Date of Admission and Class to which admitted")}
        {renderField("classStudying", "13. Class in which the pupil last studied (in figures and words)")}
        {renderField("qualifiedForPromotion", "14. Whether qualified for promotion to higher class")}
        {renderField("feesPaid", "15. Whether the pupil has paid all fees due to the school")}
        {renderField("scholarshipParticulars", "16. Whether the pupil was in receipt of any scholarship")}
        {renderField("medicalInspection", "17. Whether the pupil has undergone Medical Inspection last")}
        {renderField("feesPaidUpto", "18. Month upto which the pupil has paid the school fees")}
        {renderField("dateOfLeaving", "19. Date on which the name was removed from the rolls")}
        {renderField("dateOfTCApplication", "20. Date of Application for Transfer Certificate")}
        {renderField("dateOfTransferCertificateIssue", "21. Date of Issue of Transfer Certificate")}
        {renderField("reasonForLeaving", "22. Reason for Leaving")}
        {renderField("noOfSchoolDays", "23. Number of School Days up to the date of leaving")}
        {renderField("noOfSchoolDaysAttended", "24. Number of School Days Attended")}
        {renderField("characterAndConduct", "25. Character and Conduct")}
      </div>

      <div className="mt-16 flex justify-between">
        <div>
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p className="mt-8">Signature of the Class Teacher</p>
        </div>
        <div className="text-right">
          <p className="mb-16">School Seal</p>
          <p>Signature of the Principal</p>
        </div>
      </div>
    </div>
  );
};

export default TwelfthCertificate;
