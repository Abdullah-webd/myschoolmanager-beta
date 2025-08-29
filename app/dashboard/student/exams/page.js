"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import Sidebar from "@/components/Sidebar";

export default function ExamPage() {
  const [device, setDevice] = useState("desktop");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile/i.test(userAgent)) {
      setDevice("mobile");
    } else if (/tablet|ipad/i.test(userAgent)) {
      setDevice("tablet");
    } else {
      setDevice("desktop");
    }
  }, []);

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["student"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />
            <div className="flex-1 p-6 lg:p-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center border border-blue-200">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">
                  Welcome to the Exam Page 🎓
                </h1>
                <p className="text-blue-600 mb-6">
                  Please follow the instructions carefully to take your exam.
                </p>

                {device === "desktop" ? (
                  <div className="space-y-4">
                    <Monitor className="w-10 h-10 mx-auto text-blue-600" />
                    <h2 className="text-xl font-semibold text-blue-700">
                      Instructions
                    </h2>
                    <ul className="text-left text-blue-800 list-disc list-inside space-y-2">
                      <li>Ensure you have a stable internet connection.</li>
                      <li>
                        Download the{" "}
                        <a
                          href="/exam/exam.seb"
                          className="text-blue-600 underline font-medium hover:text-blue-800"
                        >
                          SEB exam file
                        </a>{" "}
                        to take your exam.
                      </li>
                      <li>
                        Open the file using the Safe Exam Browser application.
                      </li>
                      <li>
                        Once started, do not switch tabs or close the browser.
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {device === "mobile" ? (
                      <Smartphone className="w-10 h-10 mx-auto text-blue-600" />
                    ) : (
                      <Tablet className="w-10 h-10 mx-auto text-blue-600" />
                    )}
                    <h2 className="text-xl font-semibold text-blue-700">
                      Mobile & Tablet Notice
                    </h2>
                    <p className="text-blue-800">
                      We are currently working on our mobile & tablet exam app
                      📱. <br />
                      You will soon be able to write exams directly from your
                      device. <br />
                      For now, please use a <strong>
                        laptop or desktop
                      </strong>{" "}
                      to download the exam file and take your test.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
