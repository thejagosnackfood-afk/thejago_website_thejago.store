import React from 'react';

export default function ProductDetailSkeleton() {
  return (
    <div className="productDetail animate-fade-in">
      <div className="container">
        <div className="breadcrumb mb-4 text-sm text-gray-300">
          <span className="inline-block h-4 w-24 bg-gray-100 rounded" />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="aspect-square rounded-md overflow-hidden border border-gray-200 mb-4 bg-gray-100" />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="w-20 h-20 flex-shrink-0 border rounded bg-gray-100" />
                ))}
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col">
              <div className="h-6 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />

              <div className="bg-gray-50 p-4 rounded mb-6">
                <div className="h-8 bg-gray-100 rounded w-1/2" />
              </div>

              <div className="mb-6">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              </div>

              <div className="flex gap-4 mt-auto">
                <div className="flex-1 bg-gray-100 h-12 rounded" />
                <div className="flex-1 bg-gray-100 h-12 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="h-5 bg-gray-100 rounded w-1/4 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

