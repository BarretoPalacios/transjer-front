import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-200">
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
};

export default React.memo(LoadingSkeleton);