import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GeneralDetails from "./PostHostel/GeneralDetails";
import Specifications from "./PostHostel/Specifications";
import Facilities from "./PostHostel/Facilities";


const OwnerAddHostel = () => {
  const navigate = useNavigate();

  const [completionStatus, setCompletionStatus] = useState({
    generalDetails: "pending",
    specifications: "pending",
    facilities: "pending",
  });

  const [activeStep, setActiveStep] = useState(1);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);


  // Reset all steps when user comes to Add Hostel page
  useEffect(() => {
    const savedStatus = JSON.parse(localStorage.getItem("hostelFormStatus") || "{}");
    if (!savedStatus.generalDetails) {
      setCompletionStatus({
        generalDetails: "pending",
        specifications: "pending",
        facilities: "pending",
      });
      setActiveStep(1);
    }
  }, []);

  const handleComplete = () => {
     setIsFinalSubmitted(true);
    // Form successfully submitted, reset all
    setCompletionStatus({
      generalDetails: "pending",
      specifications: "pending",
      facilities: "pending",
    });
    setActiveStep(1);

    // Clear localStorage
    localStorage.removeItem("generalDetailsData");
    localStorage.removeItem("specificationsData");
    localStorage.removeItem("facilitiesData");
    localStorage.removeItem("hostelImageUrls");
    localStorage.setItem(
      "hostelFormStatus",
      JSON.stringify({
        generalDetails: "pending",
        specifications: "pending",
        facilities: "pending",
      })
    );

  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">

      {/* Heading */}
      <div className="bg-purple-50 py-6 md:py-10">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900">
            Start Listing Your Property
          </h2>
          <p className="text-base md:text-xl text-gray-700 mt-3">
            Complete these 3 simple steps to add your hostel
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
        <div className="flex items-center justify-center gap-4 sm:gap-12 md:gap-20">
          {[ 
            { num: 1, label: "GENERAL DETAILS", key: "generalDetails" },
            { num: 2, label: "HOSTEL SPECIFICATIONS", key: "specifications" },
            { num: 3, label: "HOSTEL FACILITIES", key: "facilities" }
          ].map(step => (
            <div
              key={step.num}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                if (step.num === 1) setActiveStep(1);
                if (step.num === 2 && completionStatus.generalDetails === "completed") setActiveStep(2);
                if (step.num === 3 && completionStatus.specifications === "completed") setActiveStep(3);
              }}
            >
              <div
                className={`
                  w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center
                  font-bold text-base md:text-xl transition-all duration-300 shadow-sm
                  group-hover:scale-110 group-hover:shadow-md
                  ${
                    activeStep === step.num
                      ? "bg-purple-600 text-white shadow-lg scale-110"
                      : completionStatus[step.key] === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {step.num}
              </div>

              <span
                className={`
                  mt-2 md:mt-3 text-center font-semibold transition-all duration-300 max-md:hidden
                  ${activeStep === step.num ? "text-purple-700" : "text-gray-800"}
                  group-hover:text-purple-600
                `}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <div className="mt-6 md:mt-10 max-w-4xl mx-auto px-4 md:px-6">
        {activeStep === 1 && (
          <GeneralDetails
           isFinalSubmitted={isFinalSubmitted} 
            onNext={() => {
              setCompletionStatus(prev => ({
                ...prev,
                generalDetails: "completed",
                specifications: "in-progress",
              }));
              setActiveStep(2);
            }}
          />
        )}

        {activeStep === 2 && (
          <Specifications
            onNext={() => {
              setCompletionStatus(prev => ({
                ...prev,
                specifications: "completed",
                facilities: "in-progress",
              }));
              setActiveStep(3);
            }}
            onPrevious={() => {
              setCompletionStatus(prev => ({
                ...prev,
                specifications: "in-progress",
                generalDetails: "completed",
              }));
              setActiveStep(1);
            }}
          />
        )}

        {activeStep === 3 && (
          <Facilities
            onPrevious={() => {
              setCompletionStatus(prev => ({
                ...prev,
                facilities: "in-progress",
                specifications: "completed",
              }));
              setActiveStep(2);
            }}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerAddHostel;
