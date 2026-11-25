"use client";

import React from "react";
import ManageContent from "@/components/Content/ManageContent";

const ContentsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-sm text-gray-500">
          Create, update, and manage your website content here.
        </p>
      </div>
      <ManageContent />
    </div>
  );
};

export default ContentsPage;
